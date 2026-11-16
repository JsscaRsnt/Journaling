import { useCallback, useEffect, useRef, useState } from 'react';
import {
  isCloudConfigured,
  getValidSession,
  loadSession,
  signIn as apiSignIn,
  signUp as apiSignUp,
  signOut as apiSignOut,
  pullJournal,
  pushJournal,
} from '../lib/supabase';

const UPDATED_KEY = 'ruang_jurnal_updated';

const readUpdated = () => {
  try {
    return localStorage.getItem(UPDATED_KEY);
  } catch {
    return null;
  }
};
const writeUpdated = (iso) => {
  try {
    localStorage.setItem(UPDATED_KEY, iso);
  } catch {
    /* abaikan */
  }
};

/**
 * Sinkronisasi otomatis ke Supabase.
 * - Login -> tarik data cloud (atau unggah data perangkat bila cloud masih kosong).
 * - Setiap perubahan data -> diunggah otomatis (debounce 1,5 detik).
 */
export function useCloudSync(data, setData) {
  const [session, setSession] = useState(() => (isCloudConfigured ? loadSession() : null));
  const [status, setStatus] = useState(isCloudConfigured ? (loadSession() ? 'syncing' : 'signed-out') : 'unconfigured');
  const [error, setError] = useState('');
  const [lastSynced, setLastSynced] = useState(null);

  const readyRef = useRef(false); // sudah selesai sinkron awal
  const applyingRemote = useRef(false);
  const firstRender = useRef(true);
  const initialData = useRef(data);
  const timerRef = useRef(null);
  const dataRef = useRef(data);
  dataRef.current = data;
  const sessionRef = useRef(null);
  sessionRef.current = session;

  const push = useCallback(async () => {
    const s = await getValidSession();
    if (!s) {
      setSession(null);
      setStatus('signed-out');
      return;
    }
    setStatus('syncing');
    try {
      const at = await pushJournal(s, dataRef.current);
      writeUpdated(at);
      setLastSynced(new Date());
      setError('');
      setStatus('synced');
    } catch (e) {
      setError(e.message);
      setStatus('error');
    }
  }, []);

  const initialSync = useCallback(
    async (s) => {
      setStatus('syncing');
      setError('');
      try {
        const remote = await pullJournal(s);
        const localAt = readUpdated();
        if (!remote) {
          await push();
        } else if (!localAt) {
          // perangkat ini belum pernah diubah / disinkronkan -> pakai data cloud
          applyingRemote.current = true;
          setData({ ...dataRef.current, ...remote.data });
          writeUpdated(remote.updated_at);
          setStatus('synced');
          setLastSynced(new Date());
        } else if (new Date(remote.updated_at) > new Date(localAt)) {
          const useCloud = window.confirm(
            'Ada data di cloud yang lebih baru daripada data di perangkat ini.\n\nOK = pakai data cloud\nBatal = timpa cloud dengan data perangkat ini'
          );
          if (useCloud) {
            applyingRemote.current = true;
            setData({ ...dataRef.current, ...remote.data });
            writeUpdated(remote.updated_at);
            setStatus('synced');
            setLastSynced(new Date());
          } else {
            await push();
          }
        } else {
          await push();
        }
        readyRef.current = true;
      } catch (e) {
        setError(e.message);
        setStatus('error');
      }
    },
    [push, setData]
  );

  // pulihkan sesi saat aplikasi dibuka
  useEffect(() => {
    if (!isCloudConfigured) return;
    let cancelled = false;
    (async () => {
      const s = await getValidSession();
      if (cancelled) return;
      if (!s) {
        setSession(null);
        return;
      }
      setSession(s);
      await initialSync(s);
    })();
    return () => {
      cancelled = true;
    };
  }, [initialSync]);

  // unggah otomatis saat data berubah
  useEffect(() => {
    // data awal (saat mount) bukan perubahan pengguna; StrictMode di dev menjalankan efek 2x,
    // jadi bandingkan referensi data, bukan sekadar flag.
    if (firstRender.current && data === initialData.current) return undefined;
    firstRender.current = false;
    if (applyingRemote.current) {
      applyingRemote.current = false;
      return undefined;
    }
    writeUpdated(new Date().toISOString());
    if (!isCloudConfigured || !sessionRef.current || !readyRef.current) return undefined;
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(push, 1500);
    return () => clearTimeout(timerRef.current);
  }, [data, push]);

  // coba lagi saat internet kembali
  useEffect(() => {
    const onOnline = () => {
      if (sessionRef.current && readyRef.current) push();
    };
    window.addEventListener('online', onOnline);
    return () => window.removeEventListener('online', onOnline);
  }, [push]);

  const signIn = async (email, password) => {
    setError('');
    setStatus('syncing');
    try {
      const s = await apiSignIn(email, password);
      setSession(s);
      await initialSync(s);
      return { ok: true };
    } catch (e) {
      setError(e.message);
      setStatus('signed-out');
      return { ok: false, message: e.message };
    }
  };

  const signUp = async (email, password) => {
    setError('');
    setStatus('syncing');
    try {
      const { session: s, needsConfirm } = await apiSignUp(email, password);
      if (needsConfirm) {
        setStatus('signed-out');
        return { ok: true, needsConfirm: true };
      }
      setSession(s);
      await initialSync(s);
      return { ok: true };
    } catch (e) {
      setError(e.message);
      setStatus('signed-out');
      return { ok: false, message: e.message };
    }
  };

  const signOut = async () => {
    await apiSignOut();
    readyRef.current = false;
    setSession(null);
    setStatus('signed-out');
    setLastSynced(null);
  };

  return {
    configured: isCloudConfigured,
    status,
    error,
    email: session?.user?.email || '',
    signedIn: Boolean(session),
    lastSynced,
    signIn,
    signUp,
    signOut,
    syncNow: push,
  };
}

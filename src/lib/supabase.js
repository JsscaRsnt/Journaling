/**
 * Klien Supabase ringan berbasis fetch (tanpa dependensi npm).
 * Isi .env:  VITE_SUPABASE_URL=...   VITE_SUPABASE_ANON_KEY=...
 * Jika kosong, aplikasi berjalan 100% lokal (localStorage) seperti biasa.
 */
const BASE = (import.meta.env.VITE_SUPABASE_URL || '').replace(/\/$/, '');
const KEY = import.meta.env.VITE_SUPABASE_ANON_KEY || '';
const SESSION_KEY = 'ruang_jurnal_session';

export const isCloudConfigured = Boolean(BASE && KEY);

// Key lama (anon, berupa JWT "eyJ...") boleh dikirim sebagai Bearer.
// Key baru (publishable, "sb_publishable_...") bukan JWT, jadi hanya dikirim lewat header apikey.
const KEY_IS_JWT = KEY.startsWith('eyJ');
const headers = (token) => {
  const h = { apikey: KEY, 'Content-Type': 'application/json' };
  if (token) h.Authorization = `Bearer ${token}`;
  else if (KEY_IS_JWT) h.Authorization = `Bearer ${KEY}`;
  return h;
};

async function request(url, options) {
  let res;
  try {
    res = await fetch(url, options);
  } catch {
    const err = new Error('Tidak bisa terhubung ke server. Periksa koneksi internetmu.');
    err.network = true;
    throw err;
  }
  const text = await res.text();
  let body = null;
  try {
    body = text ? JSON.parse(text) : null;
  } catch {
    body = null;
  }
  if (!res.ok) {
    const msg =
      body?.msg || body?.error_description || body?.message || body?.error || `Permintaan gagal (${res.status})`;
    throw new Error(msg);
  }
  return body;
}

const toSession = (b) => ({
  access_token: b.access_token,
  refresh_token: b.refresh_token,
  expires_at: b.expires_at || Math.floor(Date.now() / 1000) + (b.expires_in || 3600),
  user: { id: b.user?.id, email: b.user?.email },
});

export const loadSession = () => {
  try {
    return JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
  } catch {
    return null;
  }
};
const saveSession = (s) => localStorage.setItem(SESSION_KEY, JSON.stringify(s));
export const clearSession = () => localStorage.removeItem(SESSION_KEY);

export async function signUp(email, password) {
  const b = await request(`${BASE}/auth/v1/signup`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ email, password }),
  });
  if (b?.access_token) {
    const s = toSession(b);
    saveSession(s);
    return { session: s, needsConfirm: false };
  }
  // Supabase mengirim email konfirmasi (default). Belum ada sesi sampai dikonfirmasi.
  return { session: null, needsConfirm: true };
}

export async function signIn(email, password) {
  const b = await request(`${BASE}/auth/v1/token?grant_type=password`, {
    method: 'POST',
    headers: headers(),
    body: JSON.stringify({ email, password }),
  });
  const s = toSession(b);
  saveSession(s);
  return s;
}

export async function getValidSession() {
  const s = loadSession();
  if (!s) return null;
  if (s.expires_at - 60 > Math.floor(Date.now() / 1000)) return s;
  try {
    const b = await request(`${BASE}/auth/v1/token?grant_type=refresh_token`, {
      method: 'POST',
      headers: headers(),
      body: JSON.stringify({ refresh_token: s.refresh_token }),
    });
    const next = toSession(b);
    saveSession(next);
    return next;
  } catch (e) {
    // Offline: tetap anggap masuk (data tersimpan lokal), sinkron nanti saat online.
    if (e.network) return s;
    clearSession();
    return null;
  }
}

export async function signOut() {
  const s = loadSession();
  clearSession();
  if (!s) return;
  try {
    await fetch(`${BASE}/auth/v1/logout`, { method: 'POST', headers: headers(s.access_token) });
  } catch {
    /* sesi lokal sudah dihapus, cukup */
  }
}

export async function pullJournal(session) {
  const rows = await request(
    `${BASE}/rest/v1/journals?select=data,updated_at&user_id=eq.${encodeURIComponent(session.user.id)}`,
    { headers: headers(session.access_token) }
  );
  return Array.isArray(rows) && rows.length ? rows[0] : null;
}

export async function pushJournal(session, data) {
  const updated_at = new Date().toISOString();
  await request(`${BASE}/rest/v1/journals?on_conflict=user_id`, {
    method: 'POST',
    headers: { ...headers(session.access_token), Prefer: 'resolution=merge-duplicates,return=minimal' },
    body: JSON.stringify([{ user_id: session.user.id, data, updated_at }]),
  });
  return updated_at;
}

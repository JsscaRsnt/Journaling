import { useEffect, useRef } from 'react';
import { useLocalStorage } from './useLocalStorage';
import { toDateKey, isEntryFilled } from '../utils/dateHelpers';

export const DEFAULT_REMINDERS = {
  journal: { enabled: false, time: '21:00' },
  habits: { enabled: false, time: '20:00' },
};

const FIRED_KEY = 'ruang_jurnal_reminder_fired';
const GRACE_MIN = 120; // masih dikirim sampai 2 jam setelah jam pengingat (mis. app baru dibuka)

const toMin = (hm) => {
  const [h, m] = (hm || '00:00').split(':').map(Number);
  return h * 60 + m;
};

/**
 * Pengingat harian. Berjalan selama aplikasi terbuka (tab/PWA).
 * Browser tidak mengizinkan web app memunculkan notifikasi terjadwal saat benar-benar tertutup.
 */
export function useReminders(data, pushToast) {
  const [settings, setSettings] = useLocalStorage('ruang_jurnal_reminders', DEFAULT_REMINDERS);
  const dataRef = useRef(data);
  dataRef.current = data;
  const settingsRef = useRef(settings);
  settingsRef.current = settings;
  const toastRef = useRef(pushToast);
  toastRef.current = pushToast;

  useEffect(() => {
    const check = () => {
      const now = new Date();
      const nowMin = now.getHours() * 60 + now.getMinutes();
      const todayKey = toDateKey(now);
      let fired = {};
      try {
        fired = JSON.parse(localStorage.getItem(FIRED_KEY) || '{}');
      } catch {
        fired = {};
      }
      const s = { ...DEFAULT_REMINDERS, ...settingsRef.current };
      const d = dataRef.current;
      const kinds = [
        {
          id: 'journal',
          title: 'Waktunya menulis jurnal ✿',
          body: 'Ceritakan harimu, sebentar saja sudah cukup.',
          tab: 'daily',
          needed: () => !isEntryFilled(d.daily[todayKey]),
        },
        {
          id: 'habits',
          title: 'Sudah centang kebiasaanmu? 🌱',
          body: 'Masih ada kebiasaan hari ini yang belum selesai.',
          tab: 'habits',
          needed: () =>
            d.habits.length > 0 && (d.habitLogs[todayKey] || []).length < d.habits.length,
        },
      ];
      let changed = false;
      kinds.forEach((k) => {
        const cfg = s[k.id];
        if (!cfg?.enabled || fired[k.id] === todayKey) return;
        const target = toMin(cfg.time);
        if (nowMin < target || nowMin > target + GRACE_MIN) return;
        fired[k.id] = todayKey; // tandai walau tidak dibutuhkan, supaya tidak dicek ulang
        changed = true;
        if (!k.needed()) return;
        toastRef.current?.({ title: k.title, body: k.body, tab: k.tab });
        try {
          if ('Notification' in window && Notification.permission === 'granted') {
            new Notification(k.title, { body: k.body });
          }
        } catch {
          /* abaikan */
        }
      });
      if (changed) localStorage.setItem(FIRED_KEY, JSON.stringify(fired));
    };
    check();
    const id = setInterval(check, 20000);
    return () => clearInterval(id);
  }, []);

  return { settings: { ...DEFAULT_REMINDERS, ...settings }, setSettings };
}

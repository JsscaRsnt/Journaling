import { useEffect, useRef, useState } from 'react';
import { useLocalStorage } from './useLocalStorage';

const MIN = 60 * 1000;

export const DEFAULT_SETTINGS = { focus: 25, short: 5, long: 15, longEvery: 4, autoStart: false };

export const phaseMs = (phase, s) =>
  (phase === 'focus' ? s.focus : phase === 'short' ? s.short : s.long) * MIN;

export const formatTime = (ms, countdown = true) => {
  const totalSec = countdown ? Math.ceil(ms / 1000) : Math.floor(ms / 1000);
  const h = Math.floor(totalSec / 3600);
  const m = Math.floor((totalSec % 3600) / 60);
  const s = totalSec % 60;
  const mm = String(m).padStart(2, '0');
  const ss = String(s).padStart(2, '0');
  return h > 0 ? `${h}:${mm}:${ss}` : `${mm}:${ss}`;
};

const INITIAL_TIMER = {
  mode: 'pomodoro', // 'pomodoro' | 'timer' | 'stopwatch'
  phase: 'focus', // 'focus' | 'short' | 'long'
  cycle: 0, // jumlah sesi fokus selesai
  running: false,
  endAt: null, // untuk countdown (timestamp)
  remainingMs: DEFAULT_SETTINGS.focus * MIN,
  startedAt: null, // untuk stopwatch
  elapsedMs: 0,
  timerMinutes: 10,
  taskId: null,
  settings: DEFAULT_SETTINGS,
};

function beep() {
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    const ctx = new Ctx();
    [0, 0.28, 0.56].forEach((d) => {
      const o = ctx.createOscillator();
      const g = ctx.createGain();
      o.type = 'sine';
      o.frequency.value = 880;
      o.connect(g);
      g.connect(ctx.destination);
      const t0 = ctx.currentTime + d;
      g.gain.setValueAtTime(0.0001, t0);
      g.gain.exponentialRampToValueAtTime(0.3, t0 + 0.02);
      g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.22);
      o.start(t0);
      o.stop(t0 + 0.24);
    });
    setTimeout(() => ctx.close(), 1800);
  } catch {
    /* audio tidak tersedia, abaikan */
  }
}

function notify(title, body) {
  try {
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification(title, { body });
    }
  } catch {
    /* abaikan */
  }
}

/**
 * Timer global: dipanggil di App supaya tetap berjalan walau pindah halaman.
 * Memakai timestamp (bukan hitung mundur per detik) jadi akurat walau tab di background
 * dan tetap lanjut setelah halaman di-refresh.
 */
export function useFocusTimer(onFocusComplete) {
  const [t, setT] = useLocalStorage('ruang_jurnal_timer', INITIAL_TIMER);
  const [now, setNow] = useState(() => Date.now());
  const cbRef = useRef(onFocusComplete);
  cbRef.current = onFocusComplete;
  const doneRef = useRef(false);

  const isCountdown = t.mode !== 'stopwatch';

  useEffect(() => {
    if (!t.running) return undefined;
    setNow(Date.now());
    const id = setInterval(() => setNow(Date.now()), 250);
    return () => clearInterval(id);
  }, [t.running]);

  const remaining = isCountdown ? (t.running ? Math.max(0, t.endAt - now) : t.remainingMs) : 0;
  const elapsed = !isCountdown
    ? t.running
      ? t.elapsedMs + (now - t.startedAt)
      : t.elapsedMs
    : 0;

  // ---- selesai ----
  useEffect(() => {
    if (!(t.running && isCountdown && remaining <= 0)) {
      doneRef.current = false;
      return;
    }
    if (doneRef.current) return;
    doneRef.current = true;

    const s = t.settings;
    beep();
    if (t.mode === 'pomodoro') {
      const wasFocus = t.phase === 'focus';
      if (wasFocus) cbRef.current?.({ minutes: s.focus, taskId: t.taskId });
      const nextCycle = wasFocus ? t.cycle + 1 : t.cycle;
      const nextPhase = wasFocus ? (nextCycle % s.longEvery === 0 ? 'long' : 'short') : 'focus';
      const dur = phaseMs(nextPhase, s);
      notify(
        wasFocus ? 'Sesi fokus selesai 🍅' : 'Istirahat selesai',
        wasFocus ? 'Waktunya istirahat sebentar.' : 'Yuk mulai fokus lagi.'
      );
      setT((p) => ({
        ...p,
        phase: nextPhase,
        cycle: nextCycle,
        running: s.autoStart,
        endAt: s.autoStart ? Date.now() + dur : null,
        remainingMs: dur,
      }));
    } else {
      notify('Timer selesai ⏰', 'Waktu yang kamu atur sudah habis.');
      setT((p) => ({ ...p, running: false, endAt: null, remainingMs: p.timerMinutes * MIN }));
    }
  }, [t, remaining, isCountdown, setT]);

  // ---- judul tab browser ----
  useEffect(() => {
    const base = 'Ruang Jurnal';
    if (t.running) {
      const ms = isCountdown ? remaining : elapsed;
      const icon = t.mode === 'pomodoro' && t.phase !== 'focus' ? '☕' : '⏱';
      document.title = `${icon} ${formatTime(ms, isCountdown)} · ${base}`;
    } else {
      document.title = base;
    }
  }, [t.running, t.mode, t.phase, remaining, elapsed, isCountdown]);

  useEffect(() => () => {
    document.title = 'Ruang Jurnal';
  }, []);

  // ---- aksi ----
  const start = () =>
    setT((p) => {
      if (p.running) return p;
      if (p.mode === 'stopwatch') return { ...p, running: true, startedAt: Date.now() };
      const rem =
        p.remainingMs > 0
          ? p.remainingMs
          : p.mode === 'pomodoro'
            ? phaseMs(p.phase, p.settings)
            : p.timerMinutes * MIN;
      return { ...p, running: true, endAt: Date.now() + rem };
    });

  const pause = () =>
    setT((p) => {
      if (!p.running) return p;
      if (p.mode === 'stopwatch') {
        return { ...p, running: false, elapsedMs: p.elapsedMs + (Date.now() - p.startedAt), startedAt: null };
      }
      return { ...p, running: false, remainingMs: Math.max(0, p.endAt - Date.now()), endAt: null };
    });

  const baseMs = (p, mode = p.mode, phase = p.phase) =>
    mode === 'pomodoro' ? phaseMs(phase, p.settings) : mode === 'timer' ? p.timerMinutes * MIN : 0;

  const reset = () =>
    setT((p) => ({
      ...p,
      running: false,
      endAt: null,
      startedAt: null,
      elapsedMs: 0,
      remainingMs: baseMs(p),
    }));

  const setMode = (mode) =>
    setT((p) => ({
      ...p,
      mode,
      running: false,
      endAt: null,
      startedAt: null,
      elapsedMs: 0,
      remainingMs: baseMs(p, mode),
    }));

  const setPhase = (phase) =>
    setT((p) => ({
      ...p,
      phase,
      running: false,
      endAt: null,
      remainingMs: baseMs(p, 'pomodoro', phase),
    }));

  const skip = () =>
    setT((p) => ({
      ...p,
      phase: p.phase === 'focus' ? 'short' : 'focus',
      running: false,
      endAt: null,
      remainingMs: phaseMs(p.phase === 'focus' ? 'short' : 'focus', p.settings),
    }));

  const setSettings = (patch) =>
    setT((p) => {
      const settings = { ...p.settings, ...patch };
      const next = { ...p, settings };
      if (!p.running && p.mode === 'pomodoro') next.remainingMs = phaseMs(p.phase, settings);
      return next;
    });

  const setTimerMinutes = (m) =>
    setT((p) => {
      const minutes = Math.max(1, Math.min(600, Number(m) || 1));
      const next = { ...p, timerMinutes: minutes };
      if (!p.running && p.mode === 'timer') next.remainingMs = minutes * MIN;
      return next;
    });

  const setTask = (taskId) => setT((p) => ({ ...p, taskId }));

  return {
    state: t,
    remaining,
    elapsed,
    isCountdown,
    start,
    pause,
    reset,
    skip,
    setMode,
    setPhase,
    setSettings,
    setTimerMinutes,
    setTask,
  };
}

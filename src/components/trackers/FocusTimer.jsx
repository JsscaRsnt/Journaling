import React, { useState } from 'react';
import { Play, Pause, RotateCcw, SkipForward, Bell, Settings2 } from 'lucide-react';
import { formatTime, phaseMs } from '../../hooks/useFocusTimer';
import { shiftDays, toDateKey } from '../../utils/dateHelpers';

const MODES = [
  { id: 'pomodoro', label: '🍅 Pomodoro' },
  { id: 'timer', label: '⏳ Timer' },
  { id: 'stopwatch', label: '⏱ Stopwatch' },
];

const PHASES = [
  { id: 'focus', label: 'Fokus' },
  { id: 'short', label: 'Istirahat' },
  { id: 'long', label: 'Istirahat Panjang' },
];

const PRESETS = [5, 10, 15, 30, 45, 60];

function Ring({ progress, color, children }) {
  const r = 112;
  const c = 2 * Math.PI * r;
  const safe = Math.min(1, Math.max(0, progress));
  return (
    <div className="relative mx-auto flex h-[270px] w-[270px] items-center justify-center">
      <svg viewBox="0 0 260 260" className="absolute inset-0 h-full w-full -rotate-90">
        <circle cx="130" cy="130" r={r} fill="none" stroke="#EFE8DA" strokeWidth="14" />
        <circle
          cx="130"
          cy="130"
          r={r}
          fill="none"
          stroke={color}
          strokeWidth="14"
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - safe)}
          style={{ transition: 'stroke-dashoffset 0.3s linear' }}
        />
      </svg>
      <div className="relative text-center">{children}</div>
    </div>
  );
}

function NumberField({ label, value, onChange, min = 1, max = 180 }) {
  return (
    <label className="block text-xs text-[#6E675F]">
      {label}
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => onChange(Math.min(max, Math.max(min, Number(e.target.value) || min)))}
        className="mt-1 w-full rounded-xl border border-[#E6DFD3] bg-[#FAF7F2] px-3 py-2 text-sm text-[#2D2A26]"
      />
    </label>
  );
}

export default function FocusTimer({ timer, focusLogs = {}, todayPriorities = [] }) {
  const { state: t, remaining, elapsed, isCountdown } = timer;
  const [showSettings, setShowSettings] = useState(false);
  const [notifPerm, setNotifPerm] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied'
  );

  const total = t.mode === 'pomodoro' ? phaseMs(t.phase, t.settings) : t.timerMinutes * 60000;
  const progress = isCountdown ? (total ? 1 - remaining / total : 0) : (elapsed % 60000) / 60000;
  const isBreak = t.mode === 'pomodoro' && t.phase !== 'focus';
  const color = isBreak ? '#C86D51' : '#5C7A67';
  const display = formatTime(isCountdown ? remaining : elapsed, isCountdown);

  const filledDots = t.phase === 'long' ? t.settings.longEvery : t.cycle % t.settings.longEvery;

  // statistik
  const todayKey = toDateKey(new Date());
  const today = focusLogs[todayKey] || { pomodoros: 0, minutes: 0 };
  const week = Array.from({ length: 7 }, (_, i) => {
    const key = shiftDays(todayKey, i - 6);
    return { key, minutes: focusLogs[key]?.minutes || 0, pomodoros: focusLogs[key]?.pomodoros || 0 };
  });
  const maxMin = Math.max(30, ...week.map((d) => d.minutes));
  const weekTotal = week.reduce((s, d) => s + d.minutes, 0);
  const DAY = ['Min', 'Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab'];

  const requestNotif = async () => {
    try {
      setNotifPerm(await Notification.requestPermission());
    } catch {
      /* abaikan */
    }
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[#E6DFD3] bg-white p-5 shadow-2xs">
        <p className="text-xs font-semibold tracking-wider text-[#C86D51] uppercase">
          Fokus & Manajemen Waktu
        </p>
        <h2 className="font-serif text-2xl font-bold text-[#2D2A26]">Pomodoro, Timer & Stopwatch</h2>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1fr_320px]">
        {/* ---- Panel timer ---- */}
        <div className="rounded-2xl border border-[#E6DFD3] bg-white p-6 shadow-2xs">
          <div className="mb-5 flex flex-wrap justify-center gap-1.5 rounded-xl bg-[#FAF7F2] p-1">
            {MODES.map((m) => (
              <button
                key={m.id}
                disabled={t.running}
                onClick={() => timer.setMode(m.id)}
                className={`flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${
                  t.mode === m.id ? 'bg-white text-[#2D2A26] shadow-xs' : 'text-[#6E675F] hover:bg-white/60'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>

          {t.mode === 'pomodoro' && (
            <div className="mb-4 flex flex-wrap justify-center gap-1.5">
              {PHASES.map((p) => (
                <button
                  key={p.id}
                  disabled={t.running}
                  onClick={() => timer.setPhase(p.id)}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold transition disabled:cursor-not-allowed ${
                    t.phase === p.id
                      ? p.id === 'focus'
                        ? 'border-[#5C7A67] bg-[#5C7A67] text-white'
                        : 'border-[#C86D51] bg-[#C86D51] text-white'
                      : 'border-[#E6DFD3] bg-[#FAF7F2] text-[#4A453E]'
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          )}

          <Ring progress={progress} color={color}>
            <p
              className="font-serif text-6xl font-bold tabular-nums text-[#2D2A26]"
              aria-live="off"
              data-testid="timer-display"
            >
              {display}
            </p>
            <p className="mt-1 text-xs font-semibold tracking-wider text-[#8C8378] uppercase">
              {t.mode === 'pomodoro'
                ? PHASES.find((p) => p.id === t.phase)?.label
                : t.mode === 'timer'
                  ? 'Hitung mundur'
                  : 'Stopwatch'}
            </p>
          </Ring>

          {t.mode === 'pomodoro' && (
            <div className="mt-4 flex items-center justify-center gap-2">
              {Array.from({ length: t.settings.longEvery }).map((_, i) => (
                <span
                  key={i}
                  className={`h-3 w-3 rounded-full ${i < filledDots ? 'bg-[#C86D51]' : 'bg-[#E6DFD3]'}`}
                />
              ))}
              <span className="ml-2 text-xs text-[#8C8378]">
                {t.cycle} sesi selesai · istirahat panjang tiap {t.settings.longEvery}
              </span>
            </div>
          )}

          {t.mode === 'timer' && (
            <div className="mt-4 flex flex-wrap items-center justify-center gap-1.5">
              {PRESETS.map((m) => (
                <button
                  key={m}
                  disabled={t.running}
                  onClick={() => timer.setTimerMinutes(m)}
                  className={`rounded-full border px-3 py-1 text-xs font-semibold disabled:cursor-not-allowed ${
                    t.timerMinutes === m
                      ? 'border-[#5C7A67] bg-[#5C7A67] text-white'
                      : 'border-[#E6DFD3] bg-[#FAF7F2] text-[#4A453E]'
                  }`}
                >
                  {m} mnt
                </button>
              ))}
              <input
                type="number"
                min="1"
                max="600"
                disabled={t.running}
                value={t.timerMinutes}
                onChange={(e) => timer.setTimerMinutes(e.target.value)}
                className="w-20 rounded-xl border border-[#E6DFD3] bg-[#FAF7F2] px-2.5 py-1 text-center text-xs font-semibold"
                aria-label="Menit kustom"
              />
            </div>
          )}

          <div className="mt-6 flex items-center justify-center gap-3">
            <button
              onClick={timer.reset}
              className="rounded-xl border border-[#E6DFD3] p-3 text-[#4A453E] hover:bg-[#FAF7F2]"
              title="Reset"
            >
              <RotateCcw className="h-5 w-5" />
            </button>
            <button
              onClick={t.running ? timer.pause : timer.start}
              data-testid="timer-toggle"
              className="flex min-w-36 items-center justify-center gap-2 rounded-2xl px-6 py-3.5 text-base font-semibold text-white shadow-md transition hover:brightness-95"
              style={{ backgroundColor: color }}
            >
              {t.running ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
              {t.running ? 'Jeda' : 'Mulai'}
            </button>
            {t.mode === 'pomodoro' ? (
              <button
                onClick={timer.skip}
                className="rounded-xl border border-[#E6DFD3] p-3 text-[#4A453E] hover:bg-[#FAF7F2]"
                title="Lewati sesi"
              >
                <SkipForward className="h-5 w-5" />
              </button>
            ) : (
              <div className="w-[46px]" />
            )}
          </div>

          {t.mode === 'pomodoro' && (
            <div className="mt-6 rounded-xl bg-[#FAF7F2] p-3">
              <label className="mb-1 block text-xs font-semibold text-[#6E675F]">
                Fokus pada tugas (opsional)
              </label>
              <select
                value={t.taskId || ''}
                onChange={(e) => timer.setTask(e.target.value || null)}
                className="w-full rounded-xl border border-[#E6DFD3] bg-white px-3 py-2 text-sm"
              >
                <option value="">Tanpa tugas tertentu</option>
                {todayPriorities.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.text}
                  </option>
                ))}
              </select>
              <p className="mt-1.5 text-[11px] text-[#8C8378]">
                Tugas diambil dari Prioritas Utama hari ini. Setiap sesi fokus selesai, tugas itu mendapat 🍅.
              </p>
            </div>
          )}

          <div className="mt-5 flex flex-wrap items-center justify-between gap-2 border-t border-[#E6DFD3]/70 pt-4">
            <button
              onClick={() => setShowSettings((v) => !v)}
              className="flex items-center gap-1.5 text-xs font-semibold text-[#6E675F] hover:text-[#2D2A26]"
            >
              <Settings2 className="h-4 w-4" /> Pengaturan Pomodoro
            </button>
            {notifPerm === 'default' && (
              <button
                onClick={requestNotif}
                className="flex items-center gap-1.5 text-xs font-semibold text-[#C86D51]"
              >
                <Bell className="h-4 w-4" /> Aktifkan notifikasi
              </button>
            )}
          </div>

          {showSettings && (
            <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
              <NumberField label="Fokus (menit)" value={t.settings.focus} onChange={(v) => timer.setSettings({ focus: v })} />
              <NumberField label="Istirahat (menit)" value={t.settings.short} onChange={(v) => timer.setSettings({ short: v })} />
              <NumberField label="Istirahat panjang" value={t.settings.long} onChange={(v) => timer.setSettings({ long: v })} />
              <NumberField label="Panjang tiap … sesi" value={t.settings.longEvery} min={2} max={10} onChange={(v) => timer.setSettings({ longEvery: v })} />
              <label className="col-span-2 flex items-center gap-2 text-xs text-[#4A453E] sm:col-span-4">
                <input
                  type="checkbox"
                  checked={t.settings.autoStart}
                  onChange={(e) => timer.setSettings({ autoStart: e.target.checked })}
                  className="h-4 w-4 accent-[#5C7A67]"
                />
                Mulai sesi berikutnya otomatis
              </label>
            </div>
          )}
        </div>

        {/* ---- Statistik ---- */}
        <div className="space-y-6">
          <div className="rounded-2xl border border-[#E6DFD3] bg-white p-5 shadow-2xs">
            <h3 className="mb-3 font-serif text-lg font-semibold text-[#2D2A26]">Hari Ini</h3>
            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="rounded-xl bg-[#FFF3EA] p-3">
                <p className="font-serif text-3xl font-bold text-[#C86D51]">{today.pomodoros}</p>
                <p className="text-[11px] text-[#8C8378]">🍅 pomodoro</p>
              </div>
              <div className="rounded-xl bg-[#F1F6F2] p-3">
                <p className="font-serif text-3xl font-bold text-[#5C7A67]">{today.minutes}</p>
                <p className="text-[11px] text-[#8C8378]">menit fokus</p>
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#E6DFD3] bg-white p-5 shadow-2xs">
            <div className="mb-3 flex items-baseline justify-between">
              <h3 className="font-serif text-lg font-semibold text-[#2D2A26]">7 Hari Terakhir</h3>
              <span className="text-xs text-[#8C8378]">{weekTotal} menit</span>
            </div>
            <div className="flex h-28 items-end gap-2">
              {week.map((d) => {
                const [y, m, dd] = d.key.split('-').map(Number);
                const label = DAY[new Date(y, m - 1, dd).getDay()];
                return (
                  <div key={d.key} className="flex flex-1 flex-col items-center justify-end gap-1">
                    <div
                      className="w-full rounded-t-md bg-[#5C7A67]/80"
                      style={{ height: `${Math.max(4, (d.minutes / maxMin) * 80)}px`, opacity: d.minutes ? 1 : 0.2 }}
                      title={`${d.minutes} menit · ${d.pomodoros} pomodoro`}
                    />
                    <span className="text-[10px] text-[#8C8378]">{label}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

/** Pill kecil di pojok layar saat timer berjalan dan kamu sedang di halaman lain */
export function MiniTimer({ timer, onOpen }) {
  const { state: t, remaining, elapsed, isCountdown } = timer;
  const isBreak = t.mode === 'pomodoro' && t.phase !== 'focus';
  return (
    <button
      onClick={onOpen}
      className="fixed right-4 bottom-4 z-20 flex items-center gap-2 rounded-full border border-[#E6DFD3] bg-white px-4 py-2.5 text-sm font-semibold text-[#2D2A26] shadow-lg hover:bg-[#FAF7F2]"
      title="Buka halaman Fokus"
    >
      <span>{isBreak ? '☕' : '⏱'}</span>
      <span className="tabular-nums">{formatTime(isCountdown ? remaining : elapsed, isCountdown)}</span>
    </button>
  );
}

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, TrendingUp, Moon, Zap } from 'lucide-react';
import { MOODS } from '../../constants/journalConfig';
import {
  getWeekDates,
  shiftDays,
  toDateKey,
  isEntryFilled,
  countWeekDone,
} from '../../utils/dateHelpers';

const avg = (arr) => (arr.length ? arr.reduce((s, v) => s + v, 0) / arr.length : null);
const fmt = (n, d = 1) => (n === null || n === undefined ? '–' : Number(n).toFixed(d));
const DAY = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

function weekStats(dates, { dailyData, habits, habitLogs, focusLogs }, today) {
  const entries = dates.map((d) => dailyData[d]).filter(Boolean);
  const moods = entries.map((e) => e.mood).filter(Boolean);
  const sleeps = entries.map((e) => e.sleep).filter((v) => v !== '' && v != null).map(Number);
  const energies = entries.map((e) => e.energy).filter(Boolean);
  const waters = entries.map((e) => e.water).filter((w) => w > 0);

  const written = dates.filter((d) => isEntryFilled(dailyData[d])).length;

  const elapsed = dates.filter((d) => d <= today).length; // hari yang sudah berjalan

  // kebiasaan
  const habitStats = habits.map((h) => {
    const target = Math.max(1, Math.min(7, h.target || 7));
    const possible = target >= 7 ? elapsed : target;
    const done = dates.filter((d) => habitLogs[d]?.includes(h.id)).length;
    return { habit: h, done: Math.min(done, possible), possible, ratio: possible ? Math.min(done, possible) / possible : 0 };
  });
  const totalPossible = habitStats.reduce((s, x) => s + x.possible, 0);
  const totalDone = habitStats.reduce((s, x) => s + x.done, 0);
  const habitPct = totalPossible ? Math.round((totalDone / totalPossible) * 100) : null;
  const best = [...habitStats].filter((x) => x.done > 0).sort((a, b) => b.ratio - a.ratio || b.done - a.done)[0] || null;
  const weakest = [...habitStats].filter((x) => x.possible > 0).sort((a, b) => a.ratio - b.ratio)[0] || null;

  // tugas
  const tasks = entries.flatMap((e) => e.priorities || []);
  const tasksDone = tasks.filter((t) => t.done).length;

  // fokus
  const focusMin = dates.reduce((s, d) => s + (focusLogs[d]?.minutes || 0), 0);
  const pomos = dates.reduce((s, d) => s + (focusLogs[d]?.pomodoros || 0), 0);

  return {
    written,
    moodAvg: avg(moods),
    moodCount: moods.length,
    sleepAvg: avg(sleeps),
    energyAvg: avg(energies),
    waterAvg: avg(waters),
    habitPct,
    best,
    weakest,
    tasksTotal: tasks.length,
    tasksDone,
    focusMin,
    pomos,
  };
}

function Delta({ cur, prev, unit = '', digits = 0 }) {
  if (cur === null || cur === undefined || prev === null || prev === undefined) return null;
  const d = cur - prev;
  if (Math.abs(d) < 0.05) return <span className="text-[11px] text-[#8C8378]">sama seperti minggu lalu</span>;
  return (
    <span className={`text-[11px] font-semibold ${d > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
      {d > 0 ? '▲' : '▼'} {Math.abs(d).toFixed(digits)}
      {unit} vs minggu lalu
    </span>
  );
}

export default function InsightsView({ dailyData, habits, habitLogs, focusLogs = {} }) {
  const [offset, setOffset] = useState(0);
  const today = toDateKey(new Date());
  const dates = getWeekDates(shiftDays(today, offset * 7));
  const prevDates = getWeekDates(shiftDays(today, offset * 7 - 7));
  const ctx = { dailyData, habits, habitLogs, focusLogs };
  const cur = weekStats(dates, ctx, today);
  const prev = weekStats(prevDates, ctx, today);

  // ---- kalimat ringkasan otomatis ----
  const lines = [];
  if (cur.written > 0) lines.push(`Kamu menulis jurnal ${cur.written} dari 7 hari minggu ini.`);
  else lines.push('Belum ada catatan jurnal di minggu ini.');
  if (cur.moodAvg !== null) {
    const m = MOODS.find((x) => x.value === Math.round(cur.moodAvg));
    lines.push(`Rata-rata mood ${fmt(cur.moodAvg)} ${m ? `(${m.emoji} ${m.label})` : ''}.`);
  }
  if (cur.habitPct !== null) lines.push(`Kebiasaan terpenuhi ${cur.habitPct}% dari target.`);
  if (cur.best) lines.push(`Kebiasaan paling konsisten: ${cur.best.habit.name} (${cur.best.done}/${cur.best.possible}).`);
  if (cur.weakest && cur.weakest.ratio < 0.5 && cur.weakest.possible > 0)
    lines.push(`Perlu perhatian: ${cur.weakest.habit.name} baru ${cur.weakest.done}/${cur.weakest.possible}.`);
  if (cur.tasksTotal) lines.push(`${cur.tasksDone} dari ${cur.tasksTotal} tugas prioritas selesai.`);
  if (cur.focusMin) lines.push(`Total fokus ${cur.focusMin} menit (${cur.pomos} pomodoro).`);

  // ---- korelasi dari seluruh data ----
  const all = Object.values(dailyData);
  const sleepBuckets = [
    { id: 'low', label: 'Kurang dari 6 jam', test: (h) => h < 6 },
    { id: 'mid', label: '6 sampai 7,5 jam', test: (h) => h >= 6 && h < 7.5 },
    { id: 'high', label: '7,5 jam atau lebih', test: (h) => h >= 7.5 },
  ].map((b) => {
    const moods = all
      .filter((e) => e.mood && e.sleep !== '' && e.sleep != null && b.test(Number(e.sleep)))
      .map((e) => e.mood);
    return { ...b, avg: avg(moods), n: moods.length };
  });
  const energyBuckets = [1, 2, 3, 4, 5].map((lv) => {
    const moods = all.filter((e) => e.mood && e.energy === lv).map((e) => e.mood);
    return { lv, avg: avg(moods), n: moods.length };
  });
  const sampleSleep = sleepBuckets.reduce((s, b) => s + b.n, 0);
  const bestSleep = [...sleepBuckets].filter((b) => b.n >= 2).sort((a, b) => b.avg - a.avg)[0];

  const tiles = [
    { label: 'Hari menulis', value: `${cur.written}/7`, prev: prev.written, curv: cur.written, unit: '' },
    { label: 'Rata-rata mood', value: fmt(cur.moodAvg), prev: prev.moodAvg, curv: cur.moodAvg, digits: 1 },
    { label: 'Kebiasaan', value: cur.habitPct === null ? '–' : `${cur.habitPct}%`, prev: prev.habitPct, curv: cur.habitPct, unit: '%' },
    { label: 'Menit fokus', value: cur.focusMin, prev: prev.focusMin, curv: cur.focusMin, unit: ' mnt' },
    { label: 'Tugas selesai', value: `${cur.tasksDone}/${cur.tasksTotal}`, prev: prev.tasksDone, curv: cur.tasksDone },
    { label: 'Tidur rata-rata', value: cur.sleepAvg === null ? '–' : `${fmt(cur.sleepAvg)} j`, prev: prev.sleepAvg, curv: cur.sleepAvg, digits: 1, unit: ' j' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#E6DFD3] bg-white p-5 shadow-2xs">
        <div>
          <p className="text-xs font-semibold tracking-wider text-[#C86D51] uppercase">
            Ringkasan & Wawasan
          </p>
          <h2 className="font-serif text-2xl font-bold text-[#2D2A26]">
            {offset === 0 ? 'Minggu Ini' : offset === -1 ? 'Minggu Lalu' : 'Minggu'}
          </h2>
          <p className="mt-0.5 text-xs text-[#8C8378]">
            {dates[0]} s/d {dates[6]}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button onClick={() => setOffset(offset - 1)} className="rounded-xl border border-[#E6DFD3] p-2 hover:bg-[#FAF7F2]" aria-label="Minggu sebelumnya">
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button onClick={() => setOffset(0)} className="rounded-xl border border-[#E6DFD3] bg-[#FAF7F2] px-3 py-2 text-xs font-semibold">
            Minggu Ini
          </button>
          <button onClick={() => setOffset(Math.min(0, offset + 1))} disabled={offset >= 0} className="rounded-xl border border-[#E6DFD3] p-2 hover:bg-[#FAF7F2] disabled:opacity-40" aria-label="Minggu berikutnya">
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Ringkasan kalimat */}
      <section className="rounded-2xl border border-dashed border-[#5C7A67]/40 bg-[#F3F8F4] p-5">
        <h3 className="mb-2 flex items-center gap-2 font-serif text-lg font-semibold text-[#2D2A26]">
          <Sparkles className="h-4 w-4 text-[#C86D51]" /> Cerita Minggu Ini
        </h3>
        <ul className="space-y-1.5 text-sm text-[#3F5B4B]" data-testid="weekly-summary">
          {lines.map((l) => (
            <li key={l}>• {l}</li>
          ))}
        </ul>
      </section>

      {/* Kartu statistik */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
        {tiles.map((t) => (
          <div key={t.label} className="rounded-2xl border border-[#E6DFD3] bg-white p-4 shadow-2xs">
            <p className="text-[11px] text-[#8C8378]">{t.label}</p>
            <p className="font-serif text-3xl font-bold text-[#2D2A26]">{t.value}</p>
            <Delta cur={t.curv} prev={t.prev} unit={t.unit} digits={t.digits || 0} />
          </div>
        ))}
      </div>

      {/* Mood harian */}
      <section className="rounded-2xl border border-[#E6DFD3] bg-white p-5 shadow-2xs">
        <h3 className="mb-3 font-serif text-lg font-semibold text-[#2D2A26]">Mood, Tidur & Energi per Hari</h3>
        <div className="grid grid-cols-7 gap-2 text-center">
          {dates.map((d, i) => {
            const e = dailyData[d] || {};
            const m = MOODS.find((x) => x.value === e.mood);
            return (
              <div key={d} className="rounded-xl bg-[#FAF7F2] p-2">
                <p className="text-[11px] font-semibold text-[#6E675F]">{DAY[i]}</p>
                <p className="my-1 text-2xl">{m ? m.emoji : '·'}</p>
                <p className="text-[10px] text-[#8C8378]">{e.sleep !== '' && e.sleep != null ? `${e.sleep}j tidur` : ' '}</p>
                <p className="text-[10px] text-[#8C8378]">{e.energy ? `⚡${e.energy}/5` : ' '}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Per kebiasaan */}
      <section className="rounded-2xl border border-[#E6DFD3] bg-white p-5 shadow-2xs">
        <h3 className="mb-3 flex items-center gap-2 font-serif text-lg font-semibold text-[#2D2A26]">
          <TrendingUp className="h-4 w-4 text-[#5C7A67]" /> Kebiasaan Minggu Ini
        </h3>
        <div className="space-y-2.5">
          {habits.length === 0 && <p className="text-sm text-[#8C8378]">Belum ada kebiasaan.</p>}
          {habits.map((h) => {
            const target = Math.max(1, Math.min(7, h.target || 7));
            const done = countWeekDone(h.id, habitLogs, dates[0]);
            const possible = target >= 7 ? Math.max(1, dates.filter((d) => d <= today).length) : target;
            const pct = Math.min(100, Math.round((done / possible) * 100));
            return (
              <div key={h.id} className="flex items-center gap-3">
                <span className="w-44 truncate text-xs font-medium text-[#4A453E]">{h.name}</span>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-[#FAF7F2]">
                  <div className="h-full rounded-full bg-[#5C7A67]" style={{ width: `${pct}%` }} />
                </div>
                <span className="w-14 text-right text-xs font-semibold text-[#6E675F]">
                  {done}/{possible}
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Korelasi */}
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-[#E6DFD3] bg-white p-5 shadow-2xs">
          <h3 className="mb-1 flex items-center gap-2 font-serif text-lg font-semibold text-[#2D2A26]">
            <Moon className="h-4 w-4 text-indigo-400" /> Tidur vs Mood
          </h3>
          <p className="mb-3 text-[11px] text-[#8C8378]">Rata-rata mood (1 sampai 5) berdasarkan lama tidur · seluruh data</p>
          <div className="space-y-2.5">
            {sleepBuckets.map((b) => (
              <div key={b.id}>
                <div className="mb-1 flex justify-between text-xs text-[#4A453E]">
                  <span>{b.label}</span>
                  <span className="font-semibold">
                    {b.n ? fmt(b.avg) : '–'} <span className="font-normal text-[#8C8378]">({b.n} hari)</span>
                  </span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-[#FAF7F2]">
                  <div className="h-full rounded-full bg-indigo-300" style={{ width: `${b.n ? (b.avg / 5) * 100 : 0}%` }} />
                </div>
              </div>
            ))}
          </div>
          <p className="mt-3 text-xs text-[#6E675F]" data-testid="sleep-insight">
            {sampleSleep < 5
              ? 'Data masih sedikit. Isi jam tidur dan mood selama beberapa hari untuk melihat pola.'
              : bestSleep
                ? `Mood-mu paling baik saat tidur ${bestSleep.label.toLowerCase()}.`
                : 'Belum cukup data per kelompok untuk menarik kesimpulan.'}
          </p>
        </section>

        <section className="rounded-2xl border border-[#E6DFD3] bg-white p-5 shadow-2xs">
          <h3 className="mb-1 flex items-center gap-2 font-serif text-lg font-semibold text-[#2D2A26]">
            <Zap className="h-4 w-4 text-amber-500" /> Energi vs Mood
          </h3>
          <p className="mb-3 text-[11px] text-[#8C8378]">Rata-rata mood untuk tiap level energi</p>
          <div className="flex h-28 items-end gap-2">
            {energyBuckets.map((b) => (
              <div key={b.lv} className="flex flex-1 flex-col items-center justify-end gap-1">
                <span className="text-[10px] text-[#8C8378]">{b.n ? fmt(b.avg) : ''}</span>
                <div
                  className="w-full rounded-t-md bg-amber-300"
                  style={{ height: `${b.n ? Math.max(6, (b.avg / 5) * 72) : 4}px`, opacity: b.n ? 1 : 0.25 }}
                  title={`${b.n} hari`}
                />
                <span className="text-[10px] text-[#8C8378]">⚡{b.lv}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}

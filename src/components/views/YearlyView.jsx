import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, BookOpen, Film, PenLine, Smile, Sparkles } from 'lucide-react';
import { PILLAR_TEMPLATES, MOODS } from '../../constants/journalConfig';

const MONTH_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];

export default function YearlyView({
  yearlyData = {},
  onUpdateYearly,
  dailyData = {},
  readingList = [],
  watchlist = [],
}) {
  const [year, setYear] = useState(new Date().getFullYear());
  const yKey = String(year);

  const entry = {
    word: '',
    vision: '',
    pillars: {},
    highlights: '',
    lessons: '',
    letter: '',
    ...yearlyData[yKey],
  };

  const save = (patch) => onUpdateYearly(yKey, { ...entry, ...patch });

  const updatePillar = (id, value) =>
    save({ pillars: { ...entry.pillars, [id]: value } });

  // ---- Statistik tahun ini ----
  const yearEntries = Object.entries(dailyData).filter(([k]) => k.startsWith(`${year}-`));
  const moodEntries = yearEntries.filter(([, e]) => e.mood);
  const avgMood = moodEntries.length
    ? (moodEntries.reduce((s, [, e]) => s + e.mood, 0) / moodEntries.length).toFixed(1)
    : '–';
  const journaledDays = yearEntries.filter(
    ([, e]) =>
      e.mood || e.reflection?.trim() || (e.gratitude || []).some((g) => g.trim())
  ).length;

  const booksFinished = readingList.filter((b) => b.status === 'Finished').length;
  const showsDone = watchlist.filter((w) => w.status === 'Completed').length;

  const monthlyMood = MONTH_SHORT.map((_, i) => {
    const prefix = `${year}-${String(i + 1).padStart(2, '0')}`;
    const list = moodEntries.filter(([k]) => k.startsWith(prefix));
    if (!list.length) return null;
    return list.reduce((s, [, e]) => s + e.mood, 0) / list.length;
  });

  const stats = [
    { icon: PenLine, label: 'Hari menulis', value: journaledDays, tone: 'bg-[#5C7A67]/10 text-[#5C7A67]' },
    { icon: Smile, label: 'Rata-rata mood', value: avgMood, tone: 'bg-[#C86D51]/10 text-[#C86D51]' },
    { icon: BookOpen, label: 'Buku selesai', value: booksFinished, tone: 'bg-[#6B7A8F]/10 text-[#6B7A8F]' },
    { icon: Film, label: 'Tontonan tamat', value: showsDone, tone: 'bg-[#9B7E5C]/10 text-[#9B7E5C]' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-[#E6DFD3] bg-white p-6 shadow-2xs">
        <div>
          <p className="text-xs font-semibold tracking-widest text-[#5C7A67] uppercase">
            Kilas Balik & Visi Tahunan
          </p>
          <h2 className="font-serif text-3xl font-bold text-[#2D2A26]">Tahun {year}</h2>
          <p className="font-hand mt-0.5 text-lg text-[#C86D51]">
            {entry.word ? `“${entry.word}”` : 'satu kata untuk tahun ini ✿'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setYear(year - 1)}
            className="rounded-xl border border-[#E6DFD3] p-2 hover:bg-[#FAF7F2]"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setYear(new Date().getFullYear())}
            className="rounded-xl border border-[#E6DFD3] bg-[#FAF7F2] px-3 py-2 text-xs font-semibold hover:bg-[#E6DFD3]/50"
          >
            Tahun Ini
          </button>
          <button
            onClick={() => setYear(year + 1)}
            className="rounded-xl border border-[#E6DFD3] p-2 hover:bg-[#FAF7F2]"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Statistik */}
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {stats.map(({ icon: Icon, label, value, tone }) => (
          <div
            key={label}
            className="flex items-center gap-3 rounded-2xl border border-[#E6DFD3] bg-white p-4 shadow-2xs"
          >
            <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}>
              <Icon className="h-5 w-5" />
            </span>
            <div>
              <p className="font-serif text-2xl leading-none font-bold text-[#2D2A26]">{value}</p>
              <p className="mt-1 text-[11px] text-[#8C8378]">{label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Tema & visi */}
      <section className="rounded-2xl border border-[#E6DFD3] bg-white p-5 shadow-2xs">
        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-xs font-semibold tracking-wider text-[#8C8378] uppercase">
              Kata / Tema Tahun
            </label>
            <input
              type="text"
              value={entry.word}
              onChange={(e) => save({ word: e.target.value })}
              placeholder="misal: Bertumbuh"
              className="w-full rounded-xl border border-[#E6DFD3] bg-[#FAF7F2] px-4 py-2.5 text-sm font-medium"
            />
          </div>
          <div className="md:col-span-2">
            <label className="mb-1.5 block text-xs font-semibold tracking-wider text-[#8C8378] uppercase">
              Visi Besar Tahun Ini
            </label>
            <input
              type="text"
              value={entry.vision}
              onChange={(e) => save({ vision: e.target.value })}
              placeholder="Seperti apa kamu ingin mengingat tahun ini di akhir Desember?"
              className="w-full rounded-xl border border-[#E6DFD3] bg-[#FAF7F2] px-4 py-2.5 text-sm"
            />
          </div>
        </div>
      </section>

      {/* Mood per bulan */}
      <section className="rounded-2xl border border-[#E6DFD3] bg-white p-5 shadow-2xs">
        <h3 className="mb-4 font-serif text-lg font-semibold text-[#2D2A26]">
          Alur Mood Sepanjang Tahun
        </h3>
        <div className="flex h-36 items-end gap-2">
          {monthlyMood.map((val, i) => {
            const mood = val ? MOODS.find((m) => m.value === Math.round(val)) : null;
            return (
              <div key={i} className="flex flex-1 flex-col items-center justify-end gap-1.5">
                <span className="text-sm">{mood ? mood.emoji : ''}</span>
                <div
                  className="w-full rounded-t-lg bg-[#5C7A67]/80 transition-all"
                  style={{ height: val ? `${(val / 5) * 80}px` : '4px', opacity: val ? 1 : 0.15 }}
                  title={val ? `${MONTH_SHORT[i]}: ${val.toFixed(1)}` : 'Belum ada data'}
                />
                <span className="text-[10px] text-[#8C8378]">{MONTH_SHORT[i]}</span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Pilar */}
      <div className="grid gap-5 md:grid-cols-2">
        {PILLAR_TEMPLATES.map((pillar) => (
          <section
            key={pillar.id}
            className="rounded-2xl border border-[#E6DFD3] bg-white p-5 shadow-2xs"
            style={{ borderTop: `4px solid ${pillar.accent}` }}
          >
            <h3 className="mb-2 font-serif text-lg font-semibold text-[#2D2A26]">{pillar.title}</h3>
            <textarea
              rows={3}
              value={entry.pillars[pillar.id] || ''}
              onChange={(e) => updatePillar(pillar.id, e.target.value)}
              placeholder="Apa yang ingin kamu capai di area ini tahun ini?"
              className="w-full rounded-xl border border-[#E6DFD3] bg-[#FAF7F2] p-3 text-sm"
            />
          </section>
        ))}
      </div>

      {/* Refleksi akhir tahun */}
      <div className="grid gap-4 md:grid-cols-2">
        {[
          { key: 'highlights', title: 'Momen Terbaik Tahun Ini', ph: 'Hal-hal yang ingin kamu kenang selamanya...' },
          { key: 'lessons', title: 'Pelajaran Berharga', ph: 'Apa yang tahun ini ajarkan padamu?' },
        ].map((f) => (
          <section key={f.key} className="rounded-2xl border border-[#E6DFD3] bg-white p-5 shadow-2xs">
            <h4 className="mb-2 font-serif text-base font-semibold text-[#2D2A26]">{f.title}</h4>
            <textarea
              rows={5}
              value={entry[f.key]}
              onChange={(e) => save({ [f.key]: e.target.value })}
              placeholder={f.ph}
              className="w-full rounded-xl border border-[#E6DFD3] bg-[#FAF7F2] p-3 text-sm leading-relaxed"
            />
          </section>
        ))}
      </div>

      <section className="rounded-2xl border border-dashed border-[#C86D51]/50 bg-[#FFF8F3] p-5 shadow-2xs">
        <div className="mb-2 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#C86D51]" />
          <h4 className="font-serif text-base font-semibold text-[#2D2A26]">
            Surat untuk Dirimu di Tahun Depan
          </h4>
        </div>
        <textarea
          rows={5}
          value={entry.letter}
          onChange={(e) => save({ letter: e.target.value })}
          placeholder="Dear aku di masa depan..."
          className="font-hand w-full rounded-xl border border-[#F0DDD0] bg-white/70 p-4 text-xl leading-relaxed text-[#4A453E]"
        />
      </section>
    </div>
  );
}

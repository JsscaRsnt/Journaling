import React, { useState } from 'react';
import { Search, Heart } from 'lucide-react';
import { MOODS } from '../../constants/journalConfig';
import { formatDisplayDate } from '../../utils/dateHelpers';

export default function MoodGratitudeArchive({ dailyData, onJumpToDaily }) {
  const [query, setQuery] = useState('');

  const entries = Object.entries(dailyData).sort((a, b) => b[0].localeCompare(a[0]));
  const totalLoggedMoods = entries.filter(([, e]) => e.mood).length;

  const filtered = entries.filter(([dateStr, entry]) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    const gratMatch = (entry.gratitude || []).some((g) => g.toLowerCase().includes(q));
    const refMatch = (entry.reflection || '').toLowerCase().includes(q);
    return dateStr.includes(q) || gratMatch || refMatch;
  });

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[#E6DFD3] bg-white p-5 shadow-2xs">
        <p className="text-xs font-semibold tracking-wider text-[#C86D51] uppercase">
          Rekam Jejak Emosi & Syukur
        </p>
        <h2 className="font-serif text-2xl font-bold text-[#2D2A26]">
          Arsip Mood & Jurnal Syukur
        </h2>
      </div>

      {/* Distribusi Mood */}
      <section className="rounded-2xl border border-[#E6DFD3] bg-white p-5 shadow-2xs">
        <h3 className="mb-4 font-serif text-lg font-semibold text-[#2D2A26]">
          Distribusi Mood ({totalLoggedMoods} hari tercatat)
        </h3>
        <div className="space-y-3">
          {MOODS.map((m) => {
            const count = entries.filter(([, e]) => e.mood === m.value).length;
            const pct = totalLoggedMoods ? Math.round((count / totalLoggedMoods) * 100) : 0;
            return (
              <div key={m.value} className="flex items-center gap-3">
                <span className="w-7 text-xl">{m.emoji}</span>
                <span className="w-32 text-xs font-medium text-[#4A453E]">{m.label}</span>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-[#FAF7F2]">
                  <div
                    className="h-full rounded-full bg-[#5C7A67] transition-all"
                    style={{ width: `${pct}%` }}
                  />
                </div>
                <span className="w-16 text-right text-xs font-semibold text-[#6E675F]">
                  {count} ({pct}%)
                </span>
              </div>
            );
          })}
        </div>
      </section>

      {/* Pencarian Arsip */}
      <div className="relative">
        <Search className="absolute top-3 left-3.5 h-4 w-4 text-[#8C8378]" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Cari kata kunci di catatan syukur atau refleksi..."
          className="w-full rounded-2xl border border-[#E6DFD3] bg-white py-2.5 pr-4 pl-10 text-sm shadow-2xs focus:border-[#5C7A67] focus:outline-none"
        />
      </div>

      {/* Daftar Entri */}
      <div className="space-y-4">
        {filtered.length === 0 && (
          <div className="rounded-2xl border border-[#E6DFD3] bg-white p-8 text-center text-sm text-[#8C8378]">
            Belum ada catatan yang cocok dengan pencarianmu.
          </div>
        )}

        {filtered.map(([dateStr, entry]) => {
          const moodObj = MOODS.find((m) => m.value === entry.mood);
          const validGratitudes = (entry.gratitude || []).filter((g) => g.trim());

          return (
            <article
              key={dateStr}
              className="rounded-2xl border border-[#E6DFD3] bg-white p-5 shadow-2xs"
            >
              <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
                <button
                  onClick={() => onJumpToDaily(dateStr)}
                  className="font-serif text-base font-bold text-[#2D2A26] hover:text-[#5C7A67]"
                >
                  {formatDisplayDate(dateStr)}
                </button>
                {moodObj && (
                  <span className={`rounded-full border px-3 py-0.5 text-xs ${moodObj.color}`}>
                    {moodObj.emoji} {moodObj.label}
                  </span>
                )}
              </div>

              {validGratitudes.length > 0 && (
                <div className="mb-3 rounded-xl bg-[#FAF7F2] p-3">
                  <p className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-[#C86D51]">
                    <Heart className="h-3.5 w-3.5" /> Hal yang disyukuri:
                  </p>
                  <ul className="list-inside list-disc space-y-1 text-sm text-[#4A453E]">
                    {validGratitudes.map((g, idx) => (
                      <li key={idx}>{g}</li>
                    ))}
                  </ul>
                </div>
              )}

              {entry.reflection && (
                <p className="text-sm leading-relaxed text-[#4A453E]">{entry.reflection}</p>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}
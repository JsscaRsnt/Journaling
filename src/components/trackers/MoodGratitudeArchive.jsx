import React, { useState } from 'react';
import { Search, Heart, Star, Moon, Zap } from 'lucide-react';
import { MOODS } from '../../constants/journalConfig';
import { formatDisplayDate, isEntryFilled } from '../../utils/dateHelpers';

export default function MoodGratitudeArchive({ dailyData, onJumpToDaily }) {
  const [query, setQuery] = useState('');
  const [activeTag, setActiveTag] = useState(null);

  const entries = Object.entries(dailyData)
    .filter(([, e]) => isEntryFilled(e) || (e.tags || []).length > 0)
    .sort((a, b) => b[0].localeCompare(a[0]));
  const totalLoggedMoods = entries.filter(([, e]) => e.mood).length;

  // hitung pemakaian tiap tag
  const tagCounts = {};
  entries.forEach(([, e]) => (e.tags || []).forEach((t) => (tagCounts[t] = (tagCounts[t] || 0) + 1)));
  const tagList = Object.entries(tagCounts).sort((a, b) => b[1] - a[1]);

  const filtered = entries.filter(([dateStr, entry]) => {
    if (activeTag && !(entry.tags || []).includes(activeTag)) return false;
    if (!query.trim()) return true;
    const q = query.toLowerCase().replace(/^#/, '');
    const gratMatch = (entry.gratitude || []).some((g) => (g || '').toLowerCase().includes(q));
    const refMatch = (entry.reflection || '').toLowerCase().includes(q);
    const hlMatch = (entry.highlight || '').toLowerCase().includes(q);
    const tagMatch = (entry.tags || []).some((t) => t.includes(q));
    const taskMatch = (entry.priorities || []).some((p) => p.text.toLowerCase().includes(q));
    return dateStr.includes(q) || gratMatch || refMatch || hlMatch || tagMatch || taskMatch;
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
          placeholder="Cari di refleksi, syukur, highlight, tugas, atau #tag..."
          className="w-full rounded-2xl border border-[#E6DFD3] bg-white py-2.5 pr-4 pl-10 text-sm shadow-2xs focus:border-[#5C7A67] focus:outline-none"
        />
      </div>

      {/* Filter tag */}
      {tagList.length > 0 && (
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="mr-1 text-xs font-semibold text-[#8C8378]">Tag:</span>
          <button
            onClick={() => setActiveTag(null)}
            className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${activeTag === null
              ? 'border-[#5C7A67] bg-[#5C7A67] text-white'
              : 'border-[#E6DFD3] bg-white text-[#4A453E]'
              }`}
          >
            Semua
          </button>
          {tagList.map(([tag, n]) => (
            <button
              key={tag}
              onClick={() => setActiveTag(activeTag === tag ? null : tag)}
              className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${activeTag === tag
                ? 'border-[#5C7A67] bg-[#5C7A67] text-white'
                : 'border-[#E6DFD3] bg-white text-[#4A453E]'
                }`}
            >
              #{tag} <span className="opacity-70">{n}</span>
            </button>
          ))}
        </div>
      )}

      <p className="text-xs text-[#8C8378]">{filtered.length} catatan ditemukan</p>

      {/* Daftar Entri */}
      <div className="space-y-4">
        {filtered.length === 0 && (
          <div className="rounded-2xl border border-[#E6DFD3] bg-white p-8 text-center text-sm text-[#8C8378]">
            Belum ada catatan yang cocok dengan pencarianmu.
          </div>
        )}

        {filtered.map(([dateStr, entry]) => {
          const moodObj = MOODS.find((m) => m.value === entry.mood);
          const validGratitudes = (entry.gratitude || []).filter((g) => g && g.trim());

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
                <div className="flex flex-wrap items-center gap-1.5">
                  {entry.sleep !== '' && entry.sleep != null && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-indigo-50 px-2 py-0.5 text-[11px] text-indigo-600">
                      <Moon className="h-3 w-3" /> {entry.sleep} jam
                    </span>
                  )}
                  {entry.energy && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[11px] text-amber-700">
                      <Zap className="h-3 w-3" /> {entry.energy}/5
                    </span>
                  )}
                  {moodObj && (
                    <span className={`rounded-full border px-3 py-0.5 text-xs ${moodObj.color}`}>
                      {moodObj.emoji} {moodObj.label}
                    </span>
                  )}
                </div>
              </div>

              {entry.highlight && (
                <p className="mb-3 flex items-start gap-1.5 text-sm font-medium text-[#2D2A26]">
                  <Star className="mt-0.5 h-3.5 w-3.5 shrink-0 text-amber-500" /> {entry.highlight}
                </p>
              )}

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

              {(entry.tags || []).length > 0 && (
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {entry.tags.map((t) => (
                    <button
                      key={t}
                      onClick={() => setActiveTag(t)}
                      className="rounded-full bg-[#5C7A67]/10 px-2 py-0.5 text-[11px] font-semibold text-[#3F5B4B]"
                    >
                      #{t}
                    </button>
                  ))}
                </div>
              )}
            </article>
          );
        })}
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import { PILLAR_TEMPLATES } from '../../constants/journalConfig';

export default function QuarterlyView({ quarterlyData, onUpdateQuarterly }) {
  const currentYear = new Date().getFullYear();
  const currentQ = `Q${Math.floor(new Date().getMonth() / 3) + 1}`;

  const [year, setYear] = useState(currentYear);
  const [quarter, setQuarter] = useState(currentQ);

  const qKey = `${year}-${quarter}`;
  const entry = {
    theme: '',
    pillars: {},
    review: '',
    ...quarterlyData[qKey],
  };

  const updatePillar = (pillarId, patch) => {
    const prevPillar = entry.pillars[pillarId] || { goal: '', progress: 0, milestones: '' };
    onUpdateQuarterly(qKey, {
      ...entry,
      pillars: {
        ...entry.pillars,
        [pillarId]: { ...prevPillar, ...patch },
      },
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#E6DFD3] bg-white p-5 shadow-2xs">
        <div>
          <p className="text-xs font-semibold tracking-wider text-[#5C7A67] uppercase">
            Perencanaan 90 Hari (Quarterly)
          </p>
          <h2 className="font-serif text-2xl font-bold text-[#2D2A26]">
            {quarter} — {year}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="rounded-xl border border-[#E6DFD3] bg-[#FAF7F2] px-3 py-2 text-sm font-medium"
          >
            {[currentYear - 1, currentYear, currentYear + 1].map((y) => (
              <option key={y} value={y}>{y}</option>
            ))}
          </select>

          <div className="flex rounded-xl border border-[#E6DFD3] bg-[#FAF7F2] p-1">
            {['Q1', 'Q2', 'Q3', 'Q4'].map((q) => (
              <button
                key={q}
                onClick={() => setQuarter(q)}
                className={`rounded-lg px-3 py-1 text-xs font-semibold transition ${quarter === q ? 'bg-[#5C7A67] text-white' : 'text-[#4A453E] hover:bg-white'
                  }`}
              >
                {q}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Tema Kuartal */}
      <section className="rounded-2xl border border-[#E6DFD3] bg-white p-5 shadow-2xs">
        <label className="mb-2 block text-xs font-semibold tracking-wider text-[#8C8378] uppercase">
          Fokus Utama {quarter}
        </label>
        <input
          type="text"
          value={entry.theme}
          onChange={(e) => onUpdateQuarterly(qKey, { ...entry, theme: e.target.value })}
          placeholder="Contoh: Konsistensi Portofolio Data & Rutinitas Sehat"
          className="w-full rounded-xl border border-[#E6DFD3] bg-[#FAF7F2] px-4 py-2.5 text-sm font-medium focus:border-[#5C7A67] focus:outline-none"
        />
      </section>

      {/* 4 Pilar Kehidupan */}
      <div className="grid gap-5 md:grid-cols-2">
        {PILLAR_TEMPLATES.map((pillar) => {
          const data = entry.pillars[pillar.id] || { goal: '', progress: 0, milestones: '' };
          return (
            <section
              key={pillar.id}
              className="rounded-2xl border border-[#E6DFD3] bg-white p-5 shadow-2xs"
            >
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-serif text-lg font-semibold text-[#2D2A26]">{pillar.title}</h3>
                <span
                  className="rounded-full px-2.5 py-0.5 text-xs font-bold text-white"
                  style={{ backgroundColor: pillar.accent }}
                >
                  {data.progress}%
                </span>
              </div>

              <div className="space-y-3">
                <div>
                  <label className="mb-1 block text-xs text-[#6E675F]">Target Utama 90 Hari</label>
                  <input
                    type="text"
                    value={data.goal}
                    onChange={(e) => updatePillar(pillar.id, { goal: e.target.value })}
                    placeholder="Apa hasil konkret yang ingin dicapai?"
                    className="w-full rounded-xl border border-[#E6DFD3] bg-[#FAF7F2] px-3.5 py-2 text-sm focus:outline-none"
                  />
                </div>

                <div>
                  <div className="mb-1 flex justify-between text-xs text-[#6E675F]">
                    <span>Progres Capaian</span>
                    <span>{data.progress}%</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={data.progress}
                    onChange={(e) =>
                      updatePillar(pillar.id, { progress: Number(e.target.value) })
                    }
                    className="w-full accent-[#5C7A67]"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs text-[#6E675F]">Langkah & Milestone</label>
                  <textarea
                    rows={3}
                    value={data.milestones}
                    onChange={(e) => updatePillar(pillar.id, { milestones: e.target.value })}
                    placeholder="Langkah-langkah kecil untuk mencapainya..."
                    className="w-full rounded-xl border border-[#E6DFD3] bg-[#FAF7F2] p-3 text-sm focus:outline-none"
                  />
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
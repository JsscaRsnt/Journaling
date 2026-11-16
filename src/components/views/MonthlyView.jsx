import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, CheckCircle2, Circle, Trash2 } from 'lucide-react';
import { MOODS } from '../../constants/journalConfig';
import { getCalendarMatrix, getMonthKey, toDateKey } from '../../utils/dateHelpers';

const MONTH_NAMES = [
  'Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
  'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember',
];
const HEADERS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

export default function MonthlyView({
  dailyData,
  habitLogs,
  monthlyData,
  onUpdateMonthly,
  onJumpToDaily,
}) {
  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth());
  const [goalText, setGoalText] = useState('');

  const mKey = getMonthKey(year, month);
  const currentMonth = {
    goals: [],
    highlight: '',
    ...monthlyData[mKey],
  };

  const matrix = getCalendarMatrix(year, month);
  const todayStr = toDateKey(new Date());

  const monthDays = matrix.filter(Boolean);
  const moodDays = monthDays.filter((d) => dailyData[d]?.mood);
  const avgMood = moodDays.length
    ? (moodDays.reduce((s, d) => s + dailyData[d].mood, 0) / moodDays.length).toFixed(1)
    : '–';
  const goalsDone = currentMonth.goals.filter((g) => g.done).length;

  const changeMonth = (delta) => {
    const next = new Date(year, month + delta, 1);
    setYear(next.getFullYear());
    setMonth(next.getMonth());
  };

  const addGoal = (e) => {
    e.preventDefault();
    if (!goalText.trim()) return;
    onUpdateMonthly(mKey, {
      ...currentMonth,
      goals: [...currentMonth.goals, { id: Date.now().toString(), text: goalText.trim(), done: false }],
    });
    setGoalText('');
  };

  const toggleGoal = (id) => {
    onUpdateMonthly(mKey, {
      ...currentMonth,
      goals: currentMonth.goals.map((g) => (g.id === id ? { ...g, done: !g.done } : g)),
    });
  };

  const deleteGoal = (id) => {
    onUpdateMonthly(mKey, {
      ...currentMonth,
      goals: currentMonth.goals.filter((g) => g.id !== id),
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#E6DFD3] bg-white p-5 shadow-2xs">
        <div>
          <p className="text-xs font-semibold tracking-wider text-[#5C7A67] uppercase">
            Kalender & Evaluasi Bulanan
          </p>
          <h2 className="font-serif text-2xl font-bold text-[#2D2A26]">
            {MONTH_NAMES[month]} {year}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => changeMonth(-1)}
            className="rounded-xl border border-[#E6DFD3] p-2 hover:bg-[#FAF7F2]"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => changeMonth(1)}
            className="rounded-xl border border-[#E6DFD3] p-2 hover:bg-[#FAF7F2]"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Ringkasan bulan */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { label: 'Hari dengan mood', value: `${moodDays.length}/${monthDays.length}` },
          { label: 'Rata-rata mood', value: avgMood },
          { label: 'Target tercapai', value: `${goalsDone}/${currentMonth.goals.length}` },
        ].map((s) => (
          <div key={s.label} className="rounded-2xl border border-[#E6DFD3] bg-white p-4 text-center shadow-2xs">
            <p className="font-serif text-2xl font-bold text-[#5C7A67]">{s.value}</p>
            <p className="mt-0.5 text-[11px] text-[#8C8378]">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Kalender Interaktif */}
      <section className="rounded-2xl border border-[#E6DFD3] bg-white p-5 shadow-2xs">
        <p className="mb-3 text-xs text-[#8C8378]">
          Klik tanggal mana saja untuk membuka atau mengisi catatan hari tersebut.
        </p>
        <div className="grid grid-cols-7 gap-1.5 text-center">
          {HEADERS.map((h) => (
            <div key={h} className="py-1.5 text-xs font-semibold text-[#6E675F]">
              {h}
            </div>
          ))}

          {matrix.map((dateStr, idx) => {
            if (!dateStr) return <div key={`empty-${idx}`} className="h-20 rounded-xl bg-[#FAF7F2]/40" />;
            const moodVal = dailyData[dateStr]?.mood;
            const moodObj = MOODS.find((m) => m.value === moodVal);
            const habitCount = habitLogs[dateStr]?.length || 0;
            const hasNote = Boolean(dailyData[dateStr]?.reflection?.trim());

            return (
              <button
                key={dateStr}
                onClick={() => onJumpToDaily(dateStr)}
                className={`flex h-20 flex-col justify-between rounded-xl border p-2 text-left transition hover:scale-[1.03] hover:shadow-md ${dateStr === todayStr ? 'ring-2 ring-[#C86D51]/60 ' : ''
                  }${moodObj ? moodObj.color : 'border-[#E6DFD3] bg-[#FAF7F2]/70 hover:border-[#5C7A67] hover:bg-white'}`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-[#2D2A26]">
                    {Number(dateStr.slice(8))}
                  </span>
                  {moodObj && <span className="text-sm">{moodObj.emoji}</span>}
                </div>

                <div className="flex items-center gap-1">
                  {habitCount > 0 && (
                    <span className="rounded-md bg-[#5C7A67]/15 px-1.5 py-0.5 text-[10px] font-semibold text-[#5C7A67]">
                      {habitCount}✓
                    </span>
                  )}
                  {hasNote && (
                    <span className="h-2 w-2 rounded-full bg-[#C86D51]" title="Ada catatan" />
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Target Bulanan */}
        <section className="rounded-2xl border border-[#E6DFD3] bg-white p-5 shadow-2xs">
          <h3 className="mb-3 font-serif text-lg font-semibold text-[#2D2A26]">
            Target Bulan {MONTH_NAMES[month]}
          </h3>
          <form onSubmit={addGoal} className="mb-4 flex gap-2">
            <input
              type="text"
              value={goalText}
              onChange={(e) => setGoalText(e.target.value)}
              placeholder="Tambah target bulanan..."
              className="flex-1 rounded-xl border border-[#E6DFD3] bg-[#FAF7F2] px-3.5 py-2 text-sm focus:border-[#5C7A67] focus:outline-none"
            />
            <button type="submit" className="rounded-xl bg-[#5C7A67] px-3.5 py-2 text-white">
              <Plus className="h-4 w-4" />
            </button>
          </form>
          <div className="space-y-2">
            {currentMonth.goals.map((g) => (
              <div
                key={g.id}
                className="flex items-center justify-between rounded-xl border border-[#E6DFD3] bg-[#FAF7F2]/60 px-3.5 py-2"
              >
                <button
                  onClick={() => toggleGoal(g.id)}
                  className="flex items-center gap-2 text-left text-sm"
                >
                  {g.done ? (
                    <CheckCircle2 className="h-4 w-4 text-[#5C7A67]" />
                  ) : (
                    <Circle className="h-4 w-4 text-[#8C8378]" />
                  )}
                  <span className={g.done ? 'text-[#8C8378] line-through' : ''}>{g.text}</span>
                </button>
                <button onClick={() => deleteGoal(g.id)} className="text-[#8C8378] hover:text-rose-600">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Highlight Bulan Ini */}
        <section className="rounded-2xl border border-[#E6DFD3] bg-white p-5 shadow-2xs">
          <h3 className="mb-3 font-serif text-lg font-semibold text-[#2D2A26]">
            Highlight & Evaluasi Akhir Bulan
          </h3>
          <textarea
            rows={6}
            value={currentMonth.highlight}
            onChange={(e) =>
              onUpdateMonthly(mKey, { ...currentMonth, highlight: e.target.value })
            }
            placeholder="Momen paling berkesan, progres besar, atau evaluasi bulan ini..."
            className="w-full rounded-xl border border-[#E6DFD3] bg-[#FAF7F2] p-3.5 text-sm focus:border-[#5C7A67] focus:outline-none"
          />
        </section>
      </div>
    </div>
  );
}
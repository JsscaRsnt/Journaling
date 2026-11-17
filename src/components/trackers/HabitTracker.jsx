import React, { useState } from 'react';
import { Flame, Plus, Trash2, Check, ChevronLeft, ChevronRight } from 'lucide-react';
import { getHabitProgress, targetLabel, getWeekDates, toDateKey, shiftDays } from '../../utils/dateHelpers';
import GrowthIcon, { stageFromStreak, daysToNextStage, STAGE_LABELS } from '../ui/GrowthIcon';

const DAY_LABELS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

export default function HabitTracker({
  habits,
  habitLogs,
  onToggleHabit,
  onAddHabit,
  onDeleteHabit,
  growthTheme = 'plant',
  onChangeGrowthTheme = () => { },
}) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Kesehatan');
  const [target, setTarget] = useState(7);

  const [weekOffset, setWeekOffset] = useState(0);
  const todayKey = toDateKey(new Date());
  const weekDates = getWeekDates(shiftDays(todayKey, weekOffset * 7));

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddHabit({
      id: `h-${Date.now()}`,
      name: name.trim(),
      category,
      target: Number(target),
    });
    setName('');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#E6DFD3] bg-white p-5 shadow-2xs">
        <div>
          <p className="text-xs font-semibold tracking-wider text-[#C86D51] uppercase">
            Konsistensi Harian
          </p>
          <h2 className="font-serif text-2xl font-bold text-[#2D2A26]">Habit Tracker Mingguan</h2>
          <p className="mt-0.5 text-xs text-[#8C8378]">
            {weekDates[0]} s/d {weekDates[6]}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setWeekOffset(weekOffset - 1)}
            className="rounded-xl border border-[#E6DFD3] p-2 hover:bg-[#FAF7F2]"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setWeekOffset(0)}
            className="rounded-xl border border-[#E6DFD3] bg-[#FAF7F2] px-3 py-2 text-xs font-semibold hover:bg-[#E6DFD3]/50"
          >
            Minggu Ini
          </button>
          <button
            onClick={() => setWeekOffset(weekOffset + 1)}
            className="rounded-xl border border-[#E6DFD3] p-2 hover:bg-[#FAF7F2]"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Pilih tema pertumbuhan */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-dashed border-[#5C7A67]/40 bg-[#F3F8F4] px-5 py-3">
        <p className="font-hand text-xl text-[#3F5B4B]">
          Tiap hari yang kamu centang membuat kebiasaanmu tumbuh ✿
        </p>
        <div className="flex rounded-xl border border-[#E6DFD3] bg-white p-1">
          {[
            { id: 'plant', label: '🌱 Pohon' },
            { id: 'butterfly', label: '🦋 Kupu-kupu' },
          ].map((t) => (
            <button
              key={t.id}
              onClick={() => onChangeGrowthTheme(t.id)}
              className={`rounded-lg px-3 py-1.5 text-xs font-semibold transition ${growthTheme === t.id ? 'bg-[#5C7A67] text-white' : 'text-[#4A453E] hover:bg-[#FAF7F2]'
                }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Form Tambah Habit */}
      <form
        onSubmit={handleSubmit}
        className="flex flex-wrap gap-3 rounded-2xl border border-[#E6DFD3] bg-white p-4 shadow-2xs"
      >
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Nama kebiasaan baru (misal: Belajar Mandarin 20 menit)..."
          className="min-w-60 flex-1 rounded-xl border border-[#E6DFD3] bg-[#FAF7F2] px-3.5 py-2 text-sm focus:outline-none"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="rounded-xl border border-[#E6DFD3] bg-[#FAF7F2] px-3 py-2 text-sm"
        >
          <option value="Kesehatan">Kesehatan</option>
          <option value="Skill">Skill</option>
          <option value="Mindfulness">Mindfulness</option>
          <option value="Produktivitas">Produktivitas</option>
        </select>
        <select
          value={target}
          onChange={(e) => setTarget(e.target.value)}
          className="rounded-xl border border-[#E6DFD3] bg-[#FAF7F2] px-3 py-2 text-sm"
          title="Target kebiasaan"
        >
          <option value={7}>Tiap hari</option>
          {[1, 2, 3, 4, 5, 6].map((n) => (
            <option key={n} value={n}>{n}x / minggu</option>
          ))}
        </select>
        <button
          type="submit"
          className="flex items-center gap-1.5 rounded-xl bg-[#5C7A67] px-4 py-2 text-sm font-medium text-white hover:bg-[#4B6655]"
        >
          <Plus className="h-4 w-4" />
          Tambah Habit
        </button>
      </form>

      {/* Tabel Matriks Habit */}
      <div className="overflow-x-auto rounded-2xl border border-[#E6DFD3] bg-white p-5 shadow-2xs">
        <table className="w-full min-w-[780px] border-collapse">
          <thead>
            <tr className="border-b border-[#E6DFD3] text-left text-xs text-[#8C8378]">
              <th className="pb-3 font-semibold">Kebiasaan</th>
              {weekDates.map((d, i) => (
                <th key={d} className="pb-3 text-center font-semibold">
                  <div>{DAY_LABELS[i]}</div>
                  <div className="text-[11px] font-normal">{d.slice(8)}</div>
                </th>
              ))}
              <th className="pb-3 text-center font-semibold">Streak</th>
              <th className="pb-3 text-right font-semibold">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#E6DFD3]/60">
            {habits.map((habit) => {
              const prog = getHabitProgress(habit, habitLogs);
              const streak = prog.streak;
              const stage = stageFromStreak(streak, prog.weekly);
              const toNext = daysToNextStage(streak, prog.weekly);
              return (
                <tr key={habit.id} className="hover:bg-[#FAF7F2]/50">
                  <td className="py-3.5 pr-4">
                    <div className="flex items-center gap-3">
                      <GrowthIcon stage={stage} theme={growthTheme} size={54} />
                      <div>
                        <p className="text-sm font-semibold text-[#2D2A26]">{habit.name}</p>
                        <span className="text-[11px] text-[#8C8378]">
                          {habit.category} · {targetLabel(habit)} · {STAGE_LABELS[growthTheme][stage]}
                        </span>
                        {prog.weekly && (
                          <p className="text-[10px] font-semibold text-[#5C7A67]">
                            Minggu ini: {prog.weekDone}/{prog.target}
                            {prog.weekDone >= prog.target ? ' ✓ tercapai' : ''}
                          </p>
                        )}
                        <p className="text-[10px] text-[#C86D51]">
                          {toNext > 0
                            ? `${toNext} ${prog.unit} lagi → ${STAGE_LABELS[growthTheme][stage + 1]}`
                            : 'Sudah mencapai tahap terbaik! 🎉'}
                        </p>
                      </div>
                    </div>
                  </td>

                  {weekDates.map((dKey) => {
                    const checked = habitLogs[dKey]?.includes(habit.id);
                    return (
                      <td key={dKey} className="py-3.5 text-center">
                        <button
                          onClick={() => onToggleHabit(dKey, habit.id)}
                          className={`mx-auto flex h-8 w-8 items-center justify-center rounded-lg border transition ${checked
                            ? 'border-[#5C7A67] bg-[#5C7A67] text-white'
                            : 'border-[#D8CFC0] bg-[#FAF7F2] hover:border-[#5C7A67]'
                            }`}
                        >
                          {checked && <Check className="check-pop h-4 w-4" />}
                        </button>
                      </td>
                    );
                  })}

                  <td className="py-3.5 text-center">
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                      <Flame className="h-3.5 w-3.5 text-[#C86D51]" />
                      {streak}{prog.short}
                    </span>
                  </td>

                  <td className="py-3.5 text-right">
                    <button
                      onClick={() => onDeleteHabit(habit.id)}
                      className="rounded-lg p-1.5 text-[#8C8378] hover:bg-rose-50 hover:text-rose-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
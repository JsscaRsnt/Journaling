import React, { useState } from 'react';
import { Flame, Plus, Trash2, Check } from 'lucide-react';
import { calculateHabitStreak, getWeekDates, toDateKey } from '../../utils/dateHelpers';

const DAY_LABELS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

export default function HabitTracker({
  habits,
  habitLogs,
  onToggleHabit,
  onAddHabit,
  onDeleteHabit,
}) {
  const [name, setName] = useState('');
  const [category, setCategory] = useState('Kesehatan');

  const todayKey = toDateKey(new Date());
  const weekDates = getWeekDates(todayKey);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!name.trim()) return;
    onAddHabit({
      id: `h-${Date.now()}`,
      name: name.trim(),
      category,
    });
    setName('');
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[#E6DFD3] bg-white p-5 shadow-2xs">
        <p className="text-xs font-semibold tracking-wider text-[#C86D51] uppercase">
          Konsistensi Harian
        </p>
        <h2 className="font-serif text-2xl font-bold text-[#2D2A26]">Habit Tracker Mingguan</h2>
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
        <table className="w-full min-w-[640px] border-collapse">
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
              const streak = calculateHabitStreak(habit.id, habitLogs);
              return (
                <tr key={habit.id} className="hover:bg-[#FAF7F2]/50">
                  <td className="py-3.5 pr-4">
                    <p className="text-sm font-semibold text-[#2D2A26]">{habit.name}</p>
                    <span className="text-[11px] text-[#8C8378]">{habit.category}</span>
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
                          {checked && <Check className="h-4 w-4" />}
                        </button>
                      </td>
                    );
                  })}

                  <td className="py-3.5 text-center">
                    <span className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-700">
                      <Flame className="h-3.5 w-3.5 text-[#C86D51]" />
                      {streak}h
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
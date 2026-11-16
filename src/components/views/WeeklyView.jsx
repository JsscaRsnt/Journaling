import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Plus, CheckCircle2, Circle, Trash2 } from 'lucide-react';
import { MOODS } from '../../constants/journalConfig';
import { getWeekDates, getWeekKey, shiftDays } from '../../utils/dateHelpers';

const DAY_NAMES = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];

export default function WeeklyView({
  selectedDate,
  setSelectedDate,
  dailyData,
  habitLogs,
  habitsCount,
  weeklyData,
  onUpdateWeekly,
  onJumpToDaily,
}) {
  const [goalInput, setGoalInput] = useState('');
  const weekDates = getWeekDates(selectedDate);
  const weekKey = getWeekKey(selectedDate);

  const currentWeek = {
    goals: [],
    wins: '',
    challenges: '',
    nextFocus: '',
    ...weeklyData[weekKey],
  };

  const handleAddGoal = (e) => {
    e.preventDefault();
    if (!goalInput.trim()) return;
    const updated = [
      ...currentWeek.goals,
      { id: Date.now().toString(), text: goalInput.trim(), done: false },
    ];
    onUpdateWeekly(weekKey, { ...currentWeek, goals: updated });
    setGoalInput('');
  };

  const toggleGoal = (id) => {
    const updated = currentWeek.goals.map((g) => (g.id === id ? { ...g, done: !g.done } : g));
    onUpdateWeekly(weekKey, { ...currentWeek, goals: updated });
  };

  const deleteGoal = (id) => {
    const updated = currentWeek.goals.filter((g) => g.id !== id);
    onUpdateWeekly(weekKey, { ...currentWeek, goals: updated });
  };

  return (
    <div className="space-y-6">
      {/* Header Minggu */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#E6DFD3] bg-white p-5 shadow-2xs">
        <div>
          <p className="text-xs font-semibold tracking-wider text-[#5C7A67] uppercase">
            Tinjauan Mingguan
          </p>
          <h2 className="font-serif text-2xl font-bold text-[#2D2A26]">
            {weekDates[0]} s/d {weekDates[6]}
          </h2>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedDate(shiftDays(selectedDate, -7))}
            className="rounded-xl border border-[#E6DFD3] p-2 hover:bg-[#FAF7F2]"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setSelectedDate(shiftDays(selectedDate, 7))}
            className="rounded-xl border border-[#E6DFD3] p-2 hover:bg-[#FAF7F2]"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Strip Ringkasan 7 Hari */}
      <section className="rounded-2xl border border-[#E6DFD3] bg-white p-5 shadow-2xs">
        <h3 className="mb-3 font-serif text-lg font-semibold text-[#2D2A26]">
          Ringkasan Mood & Kebiasaan 7 Hari
        </h3>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-7">
          {weekDates.map((dKey, i) => {
            const moodVal = dailyData[dKey]?.mood;
            const moodObj = MOODS.find((m) => m.value === moodVal);
            const doneHabits = habitLogs[dKey]?.length || 0;

            return (
              <button
                key={dKey}
                onClick={() => onJumpToDaily(dKey)}
                className="flex flex-col items-center rounded-xl border border-[#E6DFD3] bg-[#FAF7F2] p-3 text-center transition hover:border-[#5C7A67]"
              >
                <span className="text-xs font-semibold text-[#6E675F]">{DAY_NAMES[i]}</span>
                <span className="mb-2 text-[11px] text-[#8C8378]">{dKey.slice(8)}</span>
                <span className="text-2xl">{moodObj ? moodObj.emoji : '·'}</span>
                <span className="mt-2 rounded-full bg-white px-2 py-0.5 text-[11px] font-medium text-[#5C7A67]">
                  {doneHabits}/{habitsCount} habit
                </span>
              </button>
            );
          })}
        </div>
      </section>

      {/* Target Mingguan */}
      <section className="rounded-2xl border border-[#E6DFD3] bg-white p-5 shadow-2xs">
        <h3 className="mb-3 font-serif text-lg font-semibold text-[#2D2A26]">
          Target Utama Minggu Ini
        </h3>
        <form onSubmit={handleAddGoal} className="mb-4 flex gap-2">
          <input
            type="text"
            value={goalInput}
            onChange={(e) => setGoalInput(e.target.value)}
            placeholder="Tambah target mingguan..."
            className="flex-1 rounded-xl border border-[#E6DFD3] bg-[#FAF7F2] px-3.5 py-2 text-sm focus:border-[#5C7A67] focus:outline-none"
          />
          <button
            type="submit"
            className="rounded-xl bg-[#5C7A67] px-4 py-2 text-white hover:bg-[#4B6655]"
          >
            <Plus className="h-4 w-4" />
          </button>
        </form>

        <div className="space-y-2">
          {currentWeek.goals.map((g) => (
            <div
              key={g.id}
              className="flex items-center justify-between rounded-xl border border-[#E6DFD3] bg-[#FAF7F2]/60 px-3.5 py-2.5"
            >
              <button
                onClick={() => toggleGoal(g.id)}
                className="flex items-center gap-2.5 text-left text-sm"
              >
                {g.done ? (
                  <CheckCircle2 className="h-4 w-4 text-[#5C7A67]" />
                ) : (
                  <Circle className="h-4 w-4 text-[#8C8378]" />
                )}
                <span className={g.done ? 'text-[#8C8378] line-through' : 'text-[#2D2A26]'}>
                  {g.text}
                </span>
              </button>
              <button onClick={() => deleteGoal(g.id)} className="text-[#8C8378] hover:text-rose-600">
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </div>
          ))}
        </div>
      </section>

      {/* Refleksi Mingguan */}
      <div className="grid gap-4 md:grid-cols-3">
        {[
          { key: 'wins', title: 'Pencapaian & Hal Baik', placeholder: 'Apa yang berjalan lancar minggu ini?' },
          { key: 'challenges', title: 'Kendala & Pelajaran', placeholder: 'Apa yang menghambat dan bisa diperbaiki?' },
          { key: 'nextFocus', title: 'Fokus Minggu Depan', placeholder: 'Satu prioritas besar untuk minggu depan...' },
        ].map((field) => (
          <section key={field.key} className="rounded-2xl border border-[#E6DFD3] bg-white p-5 shadow-2xs">
            <h4 className="mb-2 font-serif text-base font-semibold text-[#2D2A26]">{field.title}</h4>
            <textarea
              rows={4}
              value={currentWeek[field.key]}
              onChange={(e) =>
                onUpdateWeekly(weekKey, { ...currentWeek, [field.key]: e.target.value })
              }
              placeholder={field.placeholder}
              className="w-full rounded-xl border border-[#E6DFD3] bg-[#FAF7F2] p-3 text-sm focus:border-[#5C7A67] focus:outline-none"
            />
          </section>
        ))}
      </div>
    </div>
  );
}
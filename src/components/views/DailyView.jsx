import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Sparkles, CheckCircle2, Circle, Plus, Trash2 } from 'lucide-react';
import { MOODS } from '../../constants/journalConfig';
import { formatDisplayDate, shiftDays, toDateKey } from '../../utils/dateHelpers';

export default function DailyView({
  selectedDate,
  setSelectedDate,
  dailyEntry,
  onUpdateDaily,
  habits,
  completedHabitIds,
  onToggleHabit,
}) {
  const [newTask, setNewTask] = useState('');

  const entry = {
    mood: null,
    gratitude: ['', '', ''],
    priorities: [],
    reflection: '',
    ...dailyEntry,
  };

  const handleGratitudeChange = (index, value) => {
    const updated = [...entry.gratitude];
    updated[index] = value;
    onUpdateDaily(selectedDate, { ...entry, gratitude: updated });
  };

  const handleAddPriority = (e) => {
    e.preventDefault();
    if (!newTask.trim() || entry.priorities.length >= 5) return;
    const updated = [
      ...entry.priorities,
      { id: Date.now().toString(), text: newTask.trim(), done: false },
    ];
    onUpdateDaily(selectedDate, { ...entry, priorities: updated });
    setNewTask('');
  };

  const togglePriority = (id) => {
    const updated = entry.priorities.map((p) => (p.id === id ? { ...p, done: !p.done } : p));
    onUpdateDaily(selectedDate, { ...entry, priorities: updated });
  };

  const removePriority = (id) => {
    const updated = entry.priorities.filter((p) => p.id !== id);
    onUpdateDaily(selectedDate, { ...entry, priorities: updated });
  };

  return (
    <div className="space-y-6">
      {/* Header Tanggal */}
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#E6DFD3] bg-white p-5 shadow-2xs">
        <div>
          <p className="text-xs font-semibold tracking-wider text-[#5C7A67] uppercase">
            Catatan Harian
          </p>
          <h2 className="font-serif text-2xl font-bold text-[#2D2A26]">
            {formatDisplayDate(selectedDate)}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedDate(shiftDays(selectedDate, -1))}
            className="rounded-xl border border-[#E6DFD3] p-2 text-[#4A453E] hover:bg-[#FAF7F2]"
            title="Hari Sebelumnya"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => setSelectedDate(toDateKey(new Date()))}
            className="rounded-xl border border-[#E6DFD3] bg-[#FAF7F2] px-3 py-2 text-xs font-semibold text-[#2D2A26] hover:bg-[#E6DFD3]/50"
          >
            Hari Ini
          </button>
          <button
            onClick={() => setSelectedDate(shiftDays(selectedDate, 1))}
            className="rounded-xl border border-[#E6DFD3] p-2 text-[#4A453E] hover:bg-[#FAF7F2]"
            title="Hari Berikutnya"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Mood Tracker */}
      <section className="rounded-2xl border border-[#E6DFD3] bg-white p-5 shadow-2xs">
        <h3 className="mb-3 font-serif text-lg font-semibold text-[#2D2A26]">
          Bagaimana perasaanmu hari ini?
        </h3>
        <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-5">
          {MOODS.map((m) => {
            const isSelected = entry.mood === m.value;
            return (
              <button
                key={m.value}
                onClick={() => onUpdateDaily(selectedDate, { ...entry, mood: m.value })}
                className={`flex flex-col items-center gap-1.5 rounded-xl border p-3 text-center transition ${isSelected
                  ? `${m.color} ring-2 ring-[#5C7A67]/40 font-semibold`
                  : 'border-[#E6DFD3] bg-[#FAF7F2]/60 text-[#4A453E] hover:bg-[#FAF7F2]'
                  }`}
              >
                <span className="text-2xl">{m.emoji}</span>
                <span className="text-xs">{m.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Top Priorities */}
        <section className="rounded-2xl border border-[#E6DFD3] bg-white p-5 shadow-2xs">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-serif text-lg font-semibold text-[#2D2A26]">
              Prioritas Utama Hari Ini
            </h3>
            <span className="text-xs text-[#8C8378]">{entry.priorities.length}/5 target</span>
          </div>

          <form onSubmit={handleAddPriority} className="mb-4 flex gap-2">
            <input
              type="text"
              value={newTask}
              onChange={(e) => setNewTask(e.target.value)}
              placeholder="Tambah fokus utama..."
              className="flex-1 rounded-xl border border-[#E6DFD3] bg-[#FAF7F2] px-3.5 py-2 text-sm text-[#2D2A26] focus:border-[#5C7A67] focus:outline-none"
            />
            <button
              type="submit"
              className="rounded-xl bg-[#5C7A67] px-3.5 py-2 text-white transition hover:bg-[#4B6655]"
            >
              <Plus className="h-4 w-4" />
            </button>
          </form>

          <div className="space-y-2">
            {entry.priorities.length === 0 && (
              <p className="py-4 text-center text-xs text-[#8C8378]">
                Belum ada prioritas tercatat untuk tanggal ini.
              </p>
            )}
            {entry.priorities.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between rounded-xl border border-[#E6DFD3]/70 bg-[#FAF7F2]/60 px-3.5 py-2.5"
              >
                <button
                  onClick={() => togglePriority(item.id)}
                  className="flex flex-1 items-center gap-2.5 text-left text-sm"
                >
                  {item.done ? (
                    <CheckCircle2 className="h-4 w-4 shrink-0 text-[#5C7A67]" />
                  ) : (
                    <Circle className="h-4 w-4 shrink-0 text-[#8C8378]" />
                  )}
                  <span className={item.done ? 'text-[#8C8378] line-through' : 'text-[#2D2A26]'}>
                    {item.text}
                  </span>
                </button>
                <button
                  onClick={() => removePriority(item.id)}
                  className="text-[#8C8378] hover:text-rose-600"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* Habit Harian (Tersinkron dengan Habit Tracker) */}
        <section className="rounded-2xl border border-[#E6DFD3] bg-white p-5 shadow-2xs">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-serif text-lg font-semibold text-[#2D2A26]">
              Kebiasaan Harian
            </h3>
            <span className="rounded-full bg-[#5C7A67]/10 px-2.5 py-0.5 text-xs font-semibold text-[#5C7A67]">
              {completedHabitIds.length}/{habits.length} selesai
            </span>
          </div>

          <div className="space-y-2">
            {habits.map((habit) => {
              const checked = completedHabitIds.includes(habit.id);
              return (
                <button
                  key={habit.id}
                  onClick={() => onToggleHabit(selectedDate, habit.id)}
                  className={`flex w-full items-center justify-between rounded-xl border px-3.5 py-2.5 text-left text-sm transition ${checked
                    ? 'border-[#5C7A67]/40 bg-[#5C7A67]/10 text-[#2D2A26]'
                    : 'border-[#E6DFD3]/70 bg-[#FAF7F2]/60 text-[#4A453E] hover:bg-[#FAF7F2]'
                    }`}
                >
                  <span className="flex items-center gap-2.5">
                    {checked ? (
                      <CheckCircle2 className="h-4 w-4 text-[#5C7A67]" />
                    ) : (
                      <Circle className="h-4 w-4 text-[#8C8378]" />
                    )}
                    <span className={checked ? 'font-medium' : ''}>{habit.name}</span>
                  </span>
                  <span className="text-[11px] text-[#8C8378]">{habit.category}</span>
                </button>
              );
            })}
          </div>
        </section>
      </div>

      {/* Gratitude Journal */}
      <section className="rounded-2xl border border-[#E6DFD3] bg-white p-5 shadow-2xs">
        <div className="mb-3 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-[#C86D51]" />
          <h3 className="font-serif text-lg font-semibold text-[#2D2A26]">
            3 Hal yang Disyukuri Hari Ini
          </h3>
        </div>
        <div className="grid gap-3 md:grid-cols-3">
          {[0, 1, 2].map((idx) => (
            <div key={idx} className="space-y-1">
              <label className="text-xs font-medium text-[#8C8378]">Syukur #{idx + 1}</label>
              <input
                type="text"
                value={entry.gratitude[idx] || ''}
                onChange={(e) => handleGratitudeChange(idx, e.target.value)}
                placeholder="Tulis hal kecil atau besar..."
                className="w-full rounded-xl border border-[#E6DFD3] bg-[#FAF7F2] px-3.5 py-2.5 text-sm text-[#2D2A26] focus:border-[#C86D51] focus:outline-none"
              />
            </div>
          ))}
        </div>
      </section>

      {/* Brain Dump / Refleksi Bebas */}
      <section className="rounded-2xl border border-[#E6DFD3] bg-white p-5 shadow-2xs">
        <h3 className="mb-3 font-serif text-lg font-semibold text-[#2D2A26]">
          Catatan & Refleksi Bebas
        </h3>
        <textarea
          rows={5}
          value={entry.reflection}
          onChange={(e) => onUpdateDaily(selectedDate, { ...entry, reflection: e.target.value })}
          placeholder="Ceritakan kejadian hari ini, ide yang muncul, atau hal yang ingin dilepaskan..."
          className="w-full rounded-xl border border-[#E6DFD3] bg-[#FAF7F2] p-4 text-sm leading-relaxed text-[#2D2A26] focus:border-[#5C7A67] focus:outline-none"
        />
      </section>
    </div>
  );
}
import React, { useState } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  Sparkles,
  CheckCircle2,
  Circle,
  Plus,
  Trash2,
  Droplets,
  Flame,
  Shuffle,
  Star,
} from 'lucide-react';
import { MOODS, PROMPTS, QUOTES } from '../../constants/journalConfig';
import { formatDisplayDate, shiftDays, toDateKey, calculateHabitStreak } from '../../utils/dateHelpers';
import GrowthIcon, { stageFromStreak } from '../ui/GrowthIcon';

export default function DailyView({
  selectedDate,
  setSelectedDate,
  dailyEntry,
  onUpdateDaily,
  habits,
  completedHabitIds,
  onToggleHabit,
  streak = 0,
  focusToday = null,
  onCarryOver = () => { },
  habitLogs = {},
  growthTheme = 'plant',
}) {
  const [newTask, setNewTask] = useState('');
  const [promptIdx, setPromptIdx] = useState(() => new Date().getDate() % PROMPTS.length);

  const entry = {
    mood: null,
    gratitude: ['', '', ''],
    priorities: [],
    reflection: '',
    highlight: '',
    water: 0,
    ...dailyEntry,
  };

  const quote = QUOTES[Number(selectedDate.slice(8)) % QUOTES.length];
  const wordCount = entry.reflection.trim() ? entry.reflection.trim().split(/\s+/).length : 0;
  const setWater = (n) =>
    onUpdateDaily(selectedDate, { ...entry, water: entry.water === n ? n - 1 : n });

  const handleGratitudeChange = (index, value) => {
    const updated = [...entry.gratitude];
    updated[index] = value;
    onUpdateDaily(selectedDate, { ...entry, gratitude: updated });
  };

  const handleAddPriority = (e) => {
    e.preventDefault();
    if (!newTask.trim()) return;
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

      {/* Strip semangat: streak + kutipan */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-dashed border-[#C86D51]/40 bg-[#FFF8F3] px-5 py-3">
        <p className="font-hand text-xl text-[#C86D51]">{quote}</p>
        <div className="flex flex-wrap items-center gap-2">
          {focusToday && focusToday.pomodoros > 0 && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#5C7A67] shadow-2xs">
              🍅 {focusToday.pomodoros} pomodoro · {focusToday.minutes} menit fokus
            </span>
          )}
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white px-3 py-1 text-xs font-semibold text-[#C86D51] shadow-2xs">
            <Flame className="h-3.5 w-3.5" />
            {streak} hari menulis berturut-turut
          </span>
        </div>
      </div>

      {/* Highlight + Air */}
      <div className="grid gap-6 lg:grid-cols-2">
        <section className="rounded-2xl border border-[#E6DFD3] bg-white p-5 shadow-2xs">
          <h3 className="mb-3 flex items-center gap-2 font-serif text-lg font-semibold text-[#2D2A26]">
            <Star className="h-4 w-4 text-amber-500" /> Highlight Hari Ini
          </h3>
          <input
            type="text"
            value={entry.highlight}
            onChange={(e) => onUpdateDaily(selectedDate, { ...entry, highlight: e.target.value })}
            placeholder="Satu kalimat tentang momen terbaik hari ini..."
            className="w-full rounded-xl border border-[#E6DFD3] bg-[#FAF7F2] px-3.5 py-2.5 text-sm"
          />
        </section>

        <section className="rounded-2xl border border-[#E6DFD3] bg-white p-5 shadow-2xs">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="flex items-center gap-2 font-serif text-lg font-semibold text-[#2D2A26]">
              <Droplets className="h-4 w-4 text-sky-500" /> Air Putih
            </h3>
            <span className="text-xs text-[#8C8378]">{entry.water}/8 gelas</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {Array.from({ length: 8 }).map((_, i) => (
              <button
                key={i}
                onClick={() => setWater(i + 1)}
                className={`flex h-9 w-9 items-center justify-center rounded-xl border transition ${i < entry.water
                  ? 'border-sky-300 bg-sky-100 text-sky-600'
                  : 'border-[#E6DFD3] bg-[#FAF7F2] text-[#C9BFAE] hover:border-sky-300'
                  }`}
                title={`Gelas ${i + 1}`}
              >
                <Droplets className="h-4 w-4" />
              </button>
            ))}
          </div>
        </section>
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
            <span className="text-xs text-[#8C8378]">
              {entry.priorities.filter((p) => p.done).length}/{entry.priorities.length} selesai
            </span>
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

          <div className="max-h-[28rem] space-y-2 overflow-y-auto pr-1">
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
                  {item.pomos > 0 && (
                    <span className="ml-1 shrink-0 text-[11px] text-[#C86D51]">🍅×{item.pomos}</span>
                  )}
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
          {entry.priorities.some((p) => !p.done) && (
            <button
              type="button"
              onClick={() => onCarryOver(selectedDate)}
              className="mt-3 w-full rounded-xl border border-dashed border-[#C86D51]/50 px-3 py-2 text-xs font-semibold text-[#C86D51] hover:bg-[#FFF3EA]"
            >
              Pindahkan {entry.priorities.filter((p) => !p.done).length} tugas yang belum selesai ke besok →
            </button>
          )}
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
                    <GrowthIcon
                      stage={stageFromStreak(calculateHabitStreak(habit.id, habitLogs))}
                      theme={growthTheme}
                      size={36}
                    />
                    {checked ? (
                      <CheckCircle2 className="check-pop h-4 w-4 text-[#5C7A67]" />
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
          {habits.length > 0 && completedHabitIds.length === habits.length && (
            <p className="mt-3 text-center font-hand text-xl text-[#5C7A67]">
              🎉 Semua kebiasaan hari ini selesai!
            </p>
          )}
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
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h3 className="font-serif text-lg font-semibold text-[#2D2A26]">
            Catatan & Refleksi Bebas
          </h3>
          <span className="text-xs text-[#8C8378]">{wordCount} kata</span>
        </div>
        <button
          type="button"
          onClick={() => setPromptIdx((promptIdx + 1) % PROMPTS.length)}
          className="mb-3 flex w-full items-center justify-between gap-3 rounded-xl bg-[#5C7A67]/10 px-4 py-2.5 text-left text-sm text-[#3F5B4B] hover:bg-[#5C7A67]/15"
          title="Klik untuk ganti pertanyaan"
        >
          <span className="font-hand text-lg">💭 {PROMPTS[promptIdx]}</span>
          <Shuffle className="h-4 w-4 shrink-0" />
        </button>
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
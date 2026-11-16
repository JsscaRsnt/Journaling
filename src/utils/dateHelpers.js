export const toDateKey = (date) => {
  const d = new Date(date);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const formatDisplayDate = (dateStr) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  return date.toLocaleDateString('id-ID', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
};

export const shiftDays = (dateStr, offset) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  const date = new Date(y, m - 1, d);
  date.setDate(date.getDate() + offset);
  return toDateKey(date);
};

export const getWeekDates = (dateStr) => {
  const [y, m, d] = dateStr.split('-').map(Number);
  const current = new Date(y, m - 1, d);
  const dayOfWeek = current.getDay(); // 0 = Minggu
  const diffToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  const monday = new Date(current);
  monday.setDate(current.getDate() + diffToMonday);

  return Array.from({ length: 7 }, (_, idx) => {
    const item = new Date(monday);
    item.setDate(monday.getDate() + idx);
    return toDateKey(item);
  });
};

export const isEntryFilled = (e) =>
  Boolean(
    e &&
    (e.mood ||
      e.reflection?.trim() ||
      e.highlight?.trim() ||
      (e.gratitude || []).some((g) => g && g.trim()))
  );

// Berapa hari berturut-turut kamu menulis jurnal (hari ini boleh belum diisi)
export const calculateJournalStreak = (dailyData) => {
  let streak = 0;
  let cursor = toDateKey(new Date());
  if (!isEntryFilled(dailyData[cursor])) cursor = shiftDays(cursor, -1);
  while (isEntryFilled(dailyData[cursor])) {
    streak += 1;
    cursor = shiftDays(cursor, -1);
  }
  return streak;
};

export const getWeekKey = (dateStr) => {
  const weekDates = getWeekDates(dateStr);
  return `${weekDates[0]}_to_${weekDates[6]}`;
};

export const getMonthKey = (year, monthIndex) => {
  return `${year}-${String(monthIndex + 1).padStart(2, '0')}`;
};

export const getCalendarMatrix = (year, monthIndex) => {
  const firstDay = new Date(year, monthIndex, 1);
  const lastDay = new Date(year, monthIndex + 1, 0);
  const startOffset = firstDay.getDay() === 0 ? 6 : firstDay.getDay() - 1; // Senin = 0
  const totalDays = lastDay.getDate();

  const cells = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let day = 1; day <= totalDays; day++) {
    cells.push(toDateKey(new Date(year, monthIndex, day)));
  }
  return cells;
};

export const calculateHabitStreak = (habitId, habitLogs) => {
  let streak = 0;
  let cursor = toDateKey(new Date());

  // Jika hari ini belum dicentang, cek mulai dari kemarin agar streak aktif tidak langsung 0
  if (!habitLogs[cursor]?.includes(habitId)) {
    cursor = shiftDays(cursor, -1);
  }

  while (habitLogs[cursor]?.includes(habitId)) {
    streak += 1;
    cursor = shiftDays(cursor, -1);
  }
  return streak;
};
// ====== Target mingguan untuk kebiasaan ======
// habit.target = 7 (atau kosong) -> tiap hari; 1..6 -> "N kali seminggu"
export const countWeekDone = (habitId, habitLogs, anyDateInWeek) =>
  getWeekDates(anyDateInWeek).filter((d) => habitLogs[d]?.includes(habitId)).length;

export const calculateWeeklyStreak = (habit, habitLogs) => {
  const target = Math.max(1, Math.min(7, habit.target || 7));
  let cursor = toDateKey(new Date());
  let streak = 0;
  // minggu berjalan belum tercapai -> mulai hitung dari minggu lalu (streak tidak langsung 0)
  if (countWeekDone(habit.id, habitLogs, cursor) < target) cursor = shiftDays(cursor, -7);
  while (streak < 520 && countWeekDone(habit.id, habitLogs, cursor) >= target) {
    streak += 1;
    cursor = shiftDays(cursor, -7);
  }
  return streak;
};

// Satu pintu untuk semua tampilan: unit hari (tiap hari) atau minggu (target mingguan)
export const getHabitProgress = (habit, habitLogs) => {
  const target = Math.max(1, Math.min(7, habit.target || 7));
  const weekDone = countWeekDone(habit.id, habitLogs, toDateKey(new Date()));
  if (target >= 7) {
    return { weekly: false, unit: 'hari', short: 'h', streak: calculateHabitStreak(habit.id, habitLogs), target, weekDone };
  }
  return { weekly: true, unit: 'minggu', short: 'mg', streak: calculateWeeklyStreak(habit, habitLogs), target, weekDone };
};

export const targetLabel = (habit) => {
  const t = habit.target || 7;
  return t >= 7 ? 'Tiap hari' : `${t}x / minggu`;
};

// Daftar tanggal dalam rentang [start, end] inklusif
export const dateRange = (start, end) => {
  const out = [];
  let cur = start;
  let guard = 0;
  while (cur <= end && guard++ < 800) {
    out.push(cur);
    cur = shiftDays(cur, 1);
  }
  return out;
};

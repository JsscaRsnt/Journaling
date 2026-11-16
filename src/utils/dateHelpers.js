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
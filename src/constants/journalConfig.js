export const MOODS = [
  { value: 5, label: 'Sangat Bahagia', emoji: '😄', color: 'bg-emerald-100 text-emerald-800 border-emerald-300' },
  { value: 4, label: 'Baik & Tenang', emoji: '🙂', color: 'bg-teal-100 text-teal-800 border-teal-300' },
  { value: 3, label: 'Biasa Saja', emoji: '😐', color: 'bg-amber-100 text-amber-800 border-amber-300' },
  { value: 2, label: 'Lelah / Kurang Fit', emoji: '😔', color: 'bg-orange-100 text-orange-800 border-orange-300' },
  { value: 1, label: 'Stres / Berat', emoji: '😫', color: 'bg-rose-100 text-rose-800 border-rose-300' },
];

export const PILLAR_TEMPLATES = [
  { id: 'career', title: 'Karier, Skill & Studi', accent: '#5C7A67' },
  { id: 'health', title: 'Kesehatan & Energi', accent: '#C86D51' },
  { id: 'projects', title: 'Proyek & Keuangan', accent: '#6B7A8F' },
  { id: 'personal', title: 'Personal & Relasi', accent: '#9B7E5C' },
];

export const PROMPTS = [
  'Apa satu hal kecil yang membuatmu tersenyum hari ini?',
  'Kalau hari ini punya judul, apa judulnya?',
  'Apa yang ingin kamu lepaskan sebelum tidur nanti?',
  'Siapa orang yang ingin kamu ucapkan terima kasih, dan kenapa?',
  'Apa yang kamu pelajari tentang dirimu hari ini?',
  'Ceritakan momen paling tenang hari ini.',
  'Apa yang akan kamu lakukan berbeda kalau hari ini diulang?',
  'Tuliskan satu hal yang kamu banggakan dari dirimu minggu ini.',
  'Apa yang tubuhmu butuhkan saat ini?',
  'Kalau kamu bisa memberi saran pada dirimu kemarin, apa isinya?',
  'Apa mimpi kecil yang ingin kamu wujudkan bulan ini?',
  'Hal apa yang sedang kamu nantikan?',
];

export const QUOTES = [
  'Pelan-pelan juga tetap maju. 🌱',
  'Kamu sudah melakukan yang terbaik hari ini. ☕',
  'Satu halaman kecil hari ini, satu cerita besar nanti. ✿',
  'Istirahat itu bagian dari perjalanan. 🌙',
  'Konsisten > sempurna. 🍃',
  'Hari yang berat pun layak dicatat. 🤍',
];

export const INITIAL_JOURNAL_DATA = {
  daily: {},
  weekly: {},
  monthly: {},
  quarterly: {},
  yearly: {},
  focusLogs: {}, // { 'YYYY-MM-DD': { pomodoros, minutes } }
  habits: [
    { id: 'h-1', name: 'Minum 2L Air Putih', category: 'Kesehatan' },
    { id: 'h-2', name: 'Belajar / Coding 1 Jam', category: 'Skill' },
    { id: 'h-3', name: 'Membaca 15 Halaman', category: 'Mindfulness' },
    { id: 'h-4', name: 'Olahraga Ringan 20 Menit', category: 'Kesehatan' },
  ],
  habitLogs: {}, // format: { 'YYYY-MM-DD': ['h-1', 'h-2'] }
  watchlist: [
    {
      id: 'w-1',
      title: 'Frieren: Beyond Journey’s End',
      type: 'Anime',
      status: 'Completed',
      rating: 5,
      notes: 'Cerita tenang tentang makna waktu dan perjalanan.',
    },
    {
      id: 'w-2',
      title: 'Reset (开端)',
      type: 'Drama',
      status: 'Watching',
      rating: 4,
      notes: 'Alur time-loop tegang dan rapi.',
    },
  ],
  readingList: [
    {
      id: 'r-1',
      title: 'Atomic Habits',
      author: 'James Clear',
      status: 'Reading',
      currentPage: 142,
      totalPages: 320,
      quote: 'You do not rise to the level of your goals. You fall to the level of your systems.',
    },
    {
      id: 'r-2',
      title: 'The Miracles of the Namiya General Store',
      author: 'Keigo Higashino',
      status: 'Finished',
      currentPage: 344,
      totalPages: 344,
      quote: 'Semua surat yang datang sebenarnya sudah punya jawaban di hati pengirimnya.',
    },
  ],
};
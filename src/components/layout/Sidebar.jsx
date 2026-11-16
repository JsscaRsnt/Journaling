import React from 'react';
import {
  BookOpen,
  Calendar,
  CalendarDays,
  CalendarRange,
  Compass,
  CheckSquare,
  Heart,
  Film,
  Library,
  Timer,
  Download,
  Upload,
  Flame,
  RotateCcw,
  X,
} from 'lucide-react';

const TIME_NAV = [
  { id: 'daily', label: 'Jurnal Harian', icon: BookOpen },
  { id: 'weekly', label: 'Mingguan', icon: CalendarDays },
  { id: 'monthly', label: 'Bulanan', icon: Calendar },
  { id: 'quarterly', label: 'Quarterly (Q1–Q4)', icon: Compass },
  { id: 'yearly', label: 'Tahunan', icon: CalendarRange },
];

const TRACKER_NAV = [
  { id: 'habits', label: 'Habit Tracker', icon: CheckSquare },
  { id: 'archive', label: 'Mood & Syukur', icon: Heart },
  { id: 'watchlist', label: 'Watchlist', icon: Film },
  { id: 'reading', label: 'Reading Tracker', icon: Library },
  { id: 'focus', label: 'Fokus & Timer', icon: Timer },
];

export default function Sidebar({
  activeTab,
  setActiveTab,
  onExport,
  onReset,
  onImport,
  streak = 0,
  isOpen,
  onClose,
}) {
  const handleSelect = (id) => {
    setActiveTab(id);
    onClose();
  };

  return (
    <>
      {isOpen && (
        <div
          onClick={onClose}
          className="fixed inset-0 z-30 bg-black/30 backdrop-blur-xs lg:hidden"
        />
      )}

      <aside
        className={`fixed top-0 left-0 z-40 flex h-screen w-68 shrink-0 flex-col border-r border-[#E6DFD3] bg-[#F4EFE6] transition-transform duration-200 lg:sticky lg:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'
          }`}
      >
        <div className="flex items-center justify-between border-b border-[#E6DFD3] px-6 py-5">
          <div>
            <span className="text-xs font-semibold tracking-widest text-[#5C7A67] uppercase">
              Bullet Journal
            </span>
            <h1 className="font-serif text-xl font-bold text-[#2D2A26]">
              Ruang Jurnal <span className="font-hand text-2xl text-[#C86D51]">✿</span>
            </h1>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1.5 text-[#6E675F] hover:bg-[#E6DFD3]/60 lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 space-y-6 overflow-y-auto px-4 py-5">
          <div>
            <p className="mb-2 px-3 text-[11px] font-semibold tracking-wider text-[#8C8378] uppercase">
              Rentang Waktu
            </p>
            <div className="space-y-1">
              {TIME_NAV.map(({ id, label, icon: Icon }) => {
                const active = activeTab === id;
                return (
                  <button
                    key={id}
                    onClick={() => handleSelect(id)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${active
                      ? 'bg-[#5C7A67] text-white shadow-xs'
                      : 'text-[#4A453E] hover:bg-[#E6DFD3]/60'
                      }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <p className="mb-2 px-3 text-[11px] font-semibold tracking-wider text-[#8C8378] uppercase">
              Tracker & Koleksi
            </p>
            <div className="space-y-1">
              {TRACKER_NAV.map(({ id, label, icon: Icon }) => {
                const active = activeTab === id;
                return (
                  <button
                    key={id}
                    onClick={() => handleSelect(id)}
                    className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors ${active
                      ? 'bg-[#C86D51] text-white shadow-xs'
                      : 'text-[#4A453E] hover:bg-[#E6DFD3]/60'
                      }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>
          </div>
        </nav>

        <div className="space-y-2 border-t border-[#E6DFD3] p-4">
          <div className="mb-1 flex items-center justify-center gap-2 rounded-xl bg-[#FFF3EA] px-3 py-2 text-xs font-semibold text-[#C86D51]">
            <Flame className="h-4 w-4" />
            {streak > 0 ? `${streak} hari beruntun menulis` : 'Mulai streak menulismu hari ini'}
          </div>
          <label className="flex w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-[#D8CFC0] bg-[#FAF7F2] px-3 py-2 text-xs font-medium text-[#2D2A26] transition hover:bg-[#E6DFD3]/50">
            <Upload className="h-3.5 w-3.5 text-[#C86D51]" />
            Import Backup JSON
            <input
              type="file"
              accept="application/json,.json"
              className="hidden"
              onChange={(e) => {
                onImport(e.target.files?.[0]);
                e.target.value = '';
              }}
            />
          </label>
          <button
            onClick={onExport}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#D8CFC0] bg-[#FAF7F2] px-3 py-2 text-xs font-medium text-[#2D2A26] transition hover:bg-[#E6DFD3]/50"
          >
            <Download className="h-3.5 w-3.5 text-[#5C7A67]" />
            Export Backup JSON
          </button>
          <button
            onClick={onReset}
            className="flex w-full items-center justify-center gap-2 rounded-xl px-3 py-2 text-xs font-medium text-[#8C8378] transition hover:bg-rose-50 hover:text-rose-700"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Reset Data Default
          </button>
        </div>
      </aside>
    </>
  );
}
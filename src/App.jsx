import React, { useState } from 'react';
import { Menu } from 'lucide-react';
import { INITIAL_JOURNAL_DATA } from './constants/journalConfig';
import { toDateKey } from './utils/dateHelpers';
import { useLocalStorage } from './hooks/useLocalStorage';

import Sidebar from './components/layout/Sidebar';
import DailyView from './components/views/DailyView';
import WeeklyView from './components/views/WeeklyView';
import MonthlyView from './components/views/MonthlyView';
import QuarterlyView from './components/views/QuarterlyView';
import YearlyView from './components/views/YearlyView';
import HabitTracker from './components/trackers/HabitTracker';
import MoodGratitudeArchive from './components/trackers/MoodGratitudeArchive';
import WatchlistTracker from './components/trackers/WatchlistTracker';
import ReadingTracker from './components/trackers/ReadingTracker';

export default function App() {
  const [data, setData] = useLocalStorage('ruang_jurnal_v1', INITIAL_JOURNAL_DATA);
  const [activeTab, setActiveTab] = useState('daily');
  const [selectedDate, setSelectedDate] = useState(toDateKey(new Date()));
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const updateDaily = (dateKey, entry) => {
    setData((prev) => ({
      ...prev,
      daily: { ...prev.daily, [dateKey]: entry },
    }));
  };

  const updateWeekly = (weekKey, entry) => {
    setData((prev) => ({
      ...prev,
      weekly: { ...prev.weekly, [weekKey]: entry },
    }));
  };

  const updateMonthly = (monthKey, entry) => {
    setData((prev) => ({
      ...prev,
      monthly: { ...prev.monthly, [monthKey]: entry },
    }));
  };

  const updateQuarterly = (quarterKey, entry) => {
    setData((prev) => ({
      ...prev,
      quarterly: { ...prev.quarterly, [quarterKey]: entry },
    }));
  };

  const updateYearly = (yearKey, entry) => {
    setData((prev) => ({
      ...prev,
      yearly: { ...prev.yearly, [yearKey]: entry },
    }));
  };

  const toggleHabit = (dateKey, habitId) => {
    setData((prev) => {
      const current = prev.habitLogs[dateKey] || [];
      const exists = current.includes(habitId);
      const updated = exists ? current.filter((id) => id !== habitId) : [...current, habitId];
      return {
        ...prev,
        habitLogs: { ...prev.habitLogs, [dateKey]: updated },
      };
    });
  };

  const addHabit = (habit) => {
    setData((prev) => ({ ...prev, habits: [...prev.habits, habit] }));
  };

  const deleteHabit = (habitId) => {
    setData((prev) => ({
      ...prev,
      habits: prev.habits.filter((h) => h.id !== habitId),
    }));
  };

  const jumpToDaily = (dateStr) => {
    setSelectedDate(dateStr);
    setActiveTab('daily');
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ruang-jurnal-backup-${toDateKey(new Date())}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleReset = () => {
    if (window.confirm('Kembalikan semua data jurnal ke pengaturan awal?')) {
      setData(INITIAL_JOURNAL_DATA);
    }
  };

  return (
    <div className="flex min-h-screen bg-[#FAF7F2] text-[#2D2A26]">
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onExport={handleExport}
        onReset={handleReset}
        isOpen={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <div className="flex flex-1 flex-col">
        {/* Topbar Mobile */}
        <header className="flex items-center justify-between border-b border-[#E6DFD3] bg-[#F4EFE6] px-4 py-3 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="rounded-xl border border-[#D8CFC0] bg-white p-2 text-[#2D2A26]"
          >
            <Menu className="h-5 w-5" />
          </button>
          <span className="font-serif text-lg font-bold">Ruang Jurnal</span>
          <div className="w-9" />
        </header>

        <main className="mx-auto w-full max-w-5xl flex-1 p-4 sm:p-8">
          {activeTab === 'daily' && (
            <DailyView
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              dailyEntry={data.daily[selectedDate]}
              onUpdateDaily={updateDaily}
              habits={data.habits}
              completedHabitIds={data.habitLogs[selectedDate] || []}
              onToggleHabit={toggleHabit}
            />
          )}

          {activeTab === 'weekly' && (
            <WeeklyView
              selectedDate={selectedDate}
              setSelectedDate={setSelectedDate}
              dailyData={data.daily}
              habitLogs={data.habitLogs}
              habitsCount={data.habits.length}
              weeklyData={data.weekly}
              onUpdateWeekly={updateWeekly}
              onJumpToDaily={jumpToDaily}
            />
          )}

          {activeTab === 'monthly' && (
            <MonthlyView
              dailyData={data.daily}
              habitLogs={data.habitLogs}
              monthlyData={data.monthly}
              onUpdateMonthly={updateMonthly}
              onJumpToDaily={jumpToDaily}
            />
          )}

          {activeTab === 'quarterly' && (
            <QuarterlyView
              quarterlyData={data.quarterly}
              onUpdateQuarterly={updateQuarterly}
            />
          )}

          {activeTab === 'yearly' && (
            <YearlyView
              yearlyData={data.yearly}
              onUpdateYearly={updateYearly}
              dailyData={data.daily}
              readingList={data.readingList}
              watchlist={data.watchlist}
            />
          )}

          {activeTab === 'habits' && (
            <HabitTracker
              habits={data.habits}
              habitLogs={data.habitLogs}
              onToggleHabit={toggleHabit}
              onAddHabit={addHabit}
              onDeleteHabit={deleteHabit}
            />
          )}

          {activeTab === 'archive' && (
            <MoodGratitudeArchive dailyData={data.daily} onJumpToDaily={jumpToDaily} />
          )}

          {activeTab === 'watchlist' && (
            <WatchlistTracker
              watchlist={data.watchlist}
              onUpdateWatchlist={(updated) => setData((prev) => ({ ...prev, watchlist: updated }))}
            />
          )}

          {activeTab === 'reading' && (
            <ReadingTracker
              readingList={data.readingList}
              onUpdateReadingList={(updated) =>
                setData((prev) => ({ ...prev, readingList: updated }))
              }
            />
          )}
        </main>
      </div>
    </div>
  );
}
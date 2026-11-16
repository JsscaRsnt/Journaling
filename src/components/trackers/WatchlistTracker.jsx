import React, { useState } from 'react';
import { Plus, Star, Trash2 } from 'lucide-react';

const STATUS_OPTIONS = ['Plan to Watch', 'Watching', 'Completed'];

export default function WatchlistTracker({ watchlist, onUpdateWatchlist }) {
  const [filter, setFilter] = useState('All');
  const [title, setTitle] = useState('');
  const [type, setType] = useState('Drama');
  const [status, setStatus] = useState('Plan to Watch');
  const [rating, setRating] = useState(5);
  const [notes, setNotes] = useState('');

  const handleAdd = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onUpdateWatchlist([
      {
        id: `w-${Date.now()}`,
        title: title.trim(),
        type,
        status,
        rating: Number(rating),
        notes: notes.trim(),
      },
      ...watchlist,
    ]);
    setTitle('');
    setNotes('');
  };

  const changeStatus = (id, nextStatus) => {
    onUpdateWatchlist(
      watchlist.map((item) => (item.id === id ? { ...item, status: nextStatus } : item))
    );
  };

  const removeItem = (id) => {
    onUpdateWatchlist(watchlist.filter((item) => item.id !== id));
  };

  const visibleItems =
    filter === 'All' ? watchlist : watchlist.filter((item) => item.status === filter);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-[#E6DFD3] bg-white p-5 shadow-2xs">
        <div>
          <p className="text-xs font-semibold tracking-wider text-[#C86D51] uppercase">
            Hiburan & Media
          </p>
          <h2 className="font-serif text-2xl font-bold text-[#2D2A26]">Watchlist Tracker</h2>
        </div>

        <div className="flex flex-wrap gap-1.5">
          {['All', ...STATUS_OPTIONS].map((tab) => (
            <button
              key={tab}
              onClick={() => setFilter(tab)}
              className={`rounded-xl px-3 py-1.5 text-xs font-semibold transition ${filter === tab
                ? 'bg-[#C86D51] text-white'
                : 'border border-[#E6DFD3] bg-[#FAF7F2] text-[#4A453E]'
                }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Form Tambah Tontonan */}
      <form
        onSubmit={handleAdd}
        className="grid gap-3 rounded-2xl border border-[#E6DFD3] bg-white p-5 shadow-2xs sm:grid-cols-2 lg:grid-cols-5"
      >
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Judul film / drama / anime..."
          className="rounded-xl border border-[#E6DFD3] bg-[#FAF7F2] px-3.5 py-2 text-sm lg:col-span-2"
        />
        <select
          value={type}
          onChange={(e) => setType(e.target.value)}
          className="rounded-xl border border-[#E6DFD3] bg-[#FAF7F2] px-3 py-2 text-sm"
        >
          <option value="Drama">Drama</option>
          <option value="Anime">Anime</option>
          <option value="Film">Film</option>
          <option value="Variety Show">Variety Show</option>
          <option value="Dokumenter">Dokumenter</option>
        </select>
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-xl border border-[#E6DFD3] bg-[#FAF7F2] px-3 py-2 text-sm"
        >
          {STATUS_OPTIONS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <div className="flex gap-2">
          <select
            value={rating}
            onChange={(e) => setRating(e.target.value)}
            className="w-20 rounded-xl border border-[#E6DFD3] bg-[#FAF7F2] px-2.5 py-2 text-sm"
          >
            {[5, 4, 3, 2, 1].map((r) => (
              <option key={r} value={r}>{r} ★</option>
            ))}
          </select>
          <button
            type="submit"
            className="flex flex-1 items-center justify-center gap-1 rounded-xl bg-[#C86D51] px-3 py-2 text-sm font-medium text-white hover:bg-[#B35D43]"
          >
            <Plus className="h-4 w-4" /> Tambah
          </button>
        </div>
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Catatan singkat atau kesan setelah menonton (opsional)..."
          className="rounded-xl border border-[#E6DFD3] bg-[#FAF7F2] px-3.5 py-2 text-sm sm:col-span-2 lg:col-span-5"
        />
      </form>

      {/* Grid Daftar Watchlist */}
      <div className="grid gap-4 md:grid-cols-2">
        {visibleItems.map((item) => (
          <div
            key={item.id}
            className="flex flex-col justify-between rounded-2xl border border-[#E6DFD3] bg-white p-5 shadow-2xs"
          >
            <div>
              <div className="mb-2 flex items-start justify-between gap-2">
                <div>
                  <span className="rounded-md bg-[#FAF7F2] px-2 py-0.5 text-[11px] font-semibold text-[#6E675F]">
                    {item.type}
                  </span>
                  <h3 className="mt-1 font-serif text-lg font-bold text-[#2D2A26]">{item.title}</h3>
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-[#8C8378] hover:text-rose-600"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>

              {item.notes && <p className="mb-4 text-sm text-[#4A453E]">{item.notes}</p>}
            </div>

            <div className="flex items-center justify-between border-t border-[#E6DFD3]/70 pt-3">
              <div className="flex items-center gap-1 text-amber-500">
                {Array.from({ length: item.rating }).map((_, i) => (
                  <Star key={i} className="h-3.5 w-3.5 fill-current" />
                ))}
              </div>

              <select
                value={item.status}
                onChange={(e) => changeStatus(item.id, e.target.value)}
                className="rounded-lg border border-[#E6DFD3] bg-[#FAF7F2] px-2.5 py-1 text-xs font-semibold text-[#2D2A26]"
              >
                {STATUS_OPTIONS.map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
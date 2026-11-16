import React, { useState } from 'react';
import { Plus, Quote, Trash2 } from 'lucide-react';

const BOOK_STATUS = ['Want to Read', 'Reading', 'Finished'];

export default function ReadingTracker({ readingList, onUpdateReadingList }) {
  const [title, setTitle] = useState('');
  const [author, setAuthor] = useState('');
  const [status, setStatus] = useState('Reading');
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(250);
  const [quote, setQuote] = useState('');

  const handleAddBook = (e) => {
    e.preventDefault();
    if (!title.trim()) return;
    onUpdateReadingList([
      {
        id: `r-${Date.now()}`,
        title: title.trim(),
        author: author.trim() || 'Anonim',
        status,
        currentPage: Number(currentPage),
        totalPages: Math.max(1, Number(totalPages)),
        quote: quote.trim(),
      },
      ...readingList,
    ]);
    setTitle('');
    setAuthor('');
    setCurrentPage(0);
    setQuote('');
  };

  const updateProgress = (id, newPage) => {
    onUpdateReadingList(
      readingList.map((book) => {
        if (book.id !== id) return book;
        const clamped = Math.min(book.totalPages, Math.max(0, Number(newPage)));
        const nextStatus = clamped >= book.totalPages ? 'Finished' : book.status;
        return { ...book, currentPage: clamped, status: nextStatus };
      })
    );
  };

  const removeBook = (id) => {
    onUpdateReadingList(readingList.filter((b) => b.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[#E6DFD3] bg-white p-5 shadow-2xs">
        <p className="text-xs font-semibold tracking-wider text-[#5C7A67] uppercase">
          Perpustakaan Pribadi
        </p>
        <h2 className="font-serif text-2xl font-bold text-[#2D2A26]">Reading Tracker</h2>
      </div>

      {/* Form Tambah Buku */}
      <form
        onSubmit={handleAddBook}
        className="grid gap-3 rounded-2xl border border-[#E6DFD3] bg-white p-5 shadow-2xs sm:grid-cols-2 lg:grid-cols-6"
      >
        <input
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Judul buku..."
          className="rounded-xl border border-[#E6DFD3] bg-[#FAF7F2] px-3.5 py-2 text-sm lg:col-span-2"
        />
        <input
          type="text"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          placeholder="Penulis..."
          className="rounded-xl border border-[#E6DFD3] bg-[#FAF7F2] px-3.5 py-2 text-sm"
        />
        <select
          value={status}
          onChange={(e) => setStatus(e.target.value)}
          className="rounded-xl border border-[#E6DFD3] bg-[#FAF7F2] px-3 py-2 text-sm"
        >
          {BOOK_STATUS.map((s) => (
            <option key={s} value={s}>{s}</option>
          ))}
        </select>
        <div className="flex items-center gap-1.5">
          <input
            type="number"
            min="0"
            value={currentPage}
            onChange={(e) => setCurrentPage(e.target.value)}
            placeholder="Hal."
            className="w-1/2 rounded-xl border border-[#E6DFD3] bg-[#FAF7F2] px-2.5 py-2 text-sm"
          />
          <span className="text-xs text-[#8C8378]">/</span>
          <input
            type="number"
            min="1"
            value={totalPages}
            onChange={(e) => setTotalPages(e.target.value)}
            placeholder="Total"
            className="w-1/2 rounded-xl border border-[#E6DFD3] bg-[#FAF7F2] px-2.5 py-2 text-sm"
          />
        </div>
        <button
          type="submit"
          className="flex items-center justify-center gap-1 rounded-xl bg-[#5C7A67] px-3 py-2 text-sm font-medium text-white hover:bg-[#4B6655]"
        >
          <Plus className="h-4 w-4" /> Tambah
        </button>

        <input
          type="text"
          value={quote}
          onChange={(e) => setQuote(e.target.value)}
          placeholder="Kutipan favorit dari buku ini (opsional)..."
          className="rounded-xl border border-[#E6DFD3] bg-[#FAF7F2] px-3.5 py-2 text-sm sm:col-span-2 lg:col-span-6"
        />
      </form>

      {/* Daftar Buku */}
      <div className="grid gap-4 md:grid-cols-2">
        {readingList.map((book) => {
          const pct = Math.min(100, Math.round((book.currentPage / book.totalPages) * 100));
          return (
            <div
              key={book.id}
              className="flex flex-col justify-between rounded-2xl border border-[#E6DFD3] bg-white p-5 shadow-2xs"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <span className="rounded-md bg-[#5C7A67]/10 px-2 py-0.5 text-[11px] font-semibold text-[#5C7A67]">
                      {book.status}
                    </span>
                    <h3 className="mt-1 font-serif text-lg font-bold text-[#2D2A26]">
                      {book.title}
                    </h3>
                    <p className="text-xs text-[#8C8378]">oleh {book.author}</p>
                  </div>
                  <button
                    onClick={() => removeBook(book.id)}
                    className="text-[#8C8378] hover:text-rose-600"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="my-4">
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-[#6E675F]">
                      Halaman{' '}
                      <input
                        type="number"
                        min="0"
                        max={book.totalPages}
                        value={book.currentPage}
                        onChange={(e) => updateProgress(book.id, e.target.value)}
                        className="w-14 rounded-md border border-[#E6DFD3] bg-[#FAF7F2] px-1.5 py-0.5 text-center font-semibold"
                      />{' '}
                      dari {book.totalPages}
                    </span>
                    <span className="font-bold text-[#5C7A67]">{pct}%</span>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-[#FAF7F2]">
                    <div
                      className="h-full rounded-full bg-[#5C7A67] transition-all"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              </div>

              {book.quote && (
                <blockquote className="flex gap-2 rounded-xl bg-[#FAF7F2] p-3 text-xs italic text-[#4A453E]">
                  <Quote className="h-4 w-4 shrink-0 text-[#C86D51]" />
                  <span>“{book.quote}”</span>
                </blockquote>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
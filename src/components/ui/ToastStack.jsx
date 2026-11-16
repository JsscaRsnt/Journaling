import React from 'react';
import { X } from 'lucide-react';

export default function ToastStack({ toasts, onDismiss, onOpen }) {
  if (!toasts.length) return null;
  return (
    <div className="fixed top-4 right-4 z-50 flex w-80 max-w-[calc(100vw-2rem)] flex-col gap-2" role="status">
      {toasts.map((t) => (
        <div
          key={t.id}
          className="rounded-2xl border border-[#E6DFD3] bg-white p-4 shadow-lg"
          data-testid="toast"
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="font-serif text-sm font-bold text-[#2D2A26]">{t.title}</p>
              {t.body && <p className="mt-0.5 text-xs text-[#6E675F]">{t.body}</p>}
            </div>
            <button onClick={() => onDismiss(t.id)} className="text-[#8C8378]" aria-label="Tutup">
              <X className="h-4 w-4" />
            </button>
          </div>
          {t.tab && (
            <button
              onClick={() => {
                onOpen(t.tab);
                onDismiss(t.id);
              }}
              className="mt-2 rounded-lg bg-[#5C7A67] px-3 py-1.5 text-xs font-semibold text-white"
            >
              Buka sekarang
            </button>
          )}
        </div>
      ))}
    </div>
  );
}

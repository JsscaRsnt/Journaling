import React, { useState } from 'react';
import { BookHeart, Lock } from 'lucide-react';

/**
 * Layar masuk. Tampil di atas aplikasi yang diburamkan ("diintip tipis-tipis")
 * saat sinkronisasi cloud aktif tetapi belum login.
 */
export default function AuthGate({ cloud }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (mode) => {
    if (!email.trim() || password.length < 6) {
      setMsg('Isi email dan kata sandi (minimal 6 karakter).');
      return;
    }
    setBusy(true);
    setMsg('');
    const res =
      mode === 'in' ? await cloud.signIn(email.trim(), password) : await cloud.signUp(email.trim(), password);
    setBusy(false);
    if (!res.ok) setMsg(res.message || 'Gagal.');
    else if (res.needsConfirm) setMsg('Akun dibuat. Cek emailmu untuk konfirmasi, lalu masuk.');
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-[#FAF7F2]/60 p-4 backdrop-blur-sm"
      data-testid="auth-gate"
      role="dialog"
      aria-modal="true"
      aria-label="Masuk ke Ruang Jurnal"
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          submit('in');
        }}
        className="w-full max-w-sm space-y-4 rounded-3xl border border-[#E6DFD3] bg-white p-7 shadow-xl"
      >
        <div className="text-center">
          <span className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-[#F3F8F4]">
            <BookHeart className="h-7 w-7 text-[#5C7A67]" />
          </span>
          <h1 className="font-serif text-2xl font-bold text-[#2D2A26]">Ruang Jurnal</h1>
          <p className="mt-1 flex items-center justify-center gap-1.5 text-xs text-[#6E675F]">
            <Lock className="h-3.5 w-3.5" /> Masuk dulu untuk membuka jurnalmu
          </p>
        </div>

        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="Email"
          autoComplete="email"
          className="w-full rounded-xl border border-[#E6DFD3] bg-[#FAF7F2] px-3.5 py-2.5 text-sm focus:border-[#5C7A67] focus:outline-none"
        />
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          placeholder="Kata sandi (min. 6 karakter)"
          autoComplete="current-password"
          className="w-full rounded-xl border border-[#E6DFD3] bg-[#FAF7F2] px-3.5 py-2.5 text-sm focus:border-[#5C7A67] focus:outline-none"
        />

        <button
          type="submit"
          disabled={busy}
          className="w-full rounded-xl bg-[#5C7A67] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
        >
          {busy ? 'Memproses...' : 'Masuk'}
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => submit('up')}
          className="w-full rounded-xl border border-[#E6DFD3] bg-white px-4 py-2.5 text-sm font-semibold text-[#2D2A26] disabled:opacity-60"
        >
          Daftar akun baru
        </button>

        {msg && (
          <p className="text-center text-xs text-[#C86D51]" data-testid="gate-message">
            {msg}
          </p>
        )}
      </form>
    </div>
  );
}

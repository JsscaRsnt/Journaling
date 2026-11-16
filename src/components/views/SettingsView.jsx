import React, { useState } from 'react';
import {
  Moon,
  Sun,
  Bell,
  Cloud,
  CloudOff,
  Download,
  Upload,
  RotateCcw,
  LogOut,
  RefreshCw,
} from 'lucide-react';

const STATUS_TEXT = {
  unconfigured: 'Belum dikonfigurasi',
  'signed-out': 'Belum masuk',
  idle: 'Siap',
  syncing: 'Menyinkronkan…',
  synced: 'Tersinkron',
  error: 'Gagal sinkron',
};

function Card({ title, subtitle, children }) {
  return (
    <section className="rounded-2xl border border-[#E6DFD3] bg-white p-5 shadow-2xs">
      <h3 className="font-serif text-lg font-semibold text-[#2D2A26]">{title}</h3>
      {subtitle && <p className="mb-4 text-xs text-[#8C8378]">{subtitle}</p>}
      {!subtitle && <div className="mb-3" />}
      {children}
    </section>
  );
}

export default function SettingsView({
  theme,
  onThemeChange,
  growthTheme,
  onGrowthChange,
  reminders,
  cloud,
  onExport,
  onImport,
  onReset,
  dataInfo,
}) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [msg, setMsg] = useState('');
  const [busy, setBusy] = useState(false);
  const [notifPerm, setNotifPerm] = useState(
    typeof Notification !== 'undefined' ? Notification.permission : 'denied'
  );

  const { settings, setSettings } = reminders;
  const setKind = (kind, patch) => setSettings({ ...settings, [kind]: { ...settings[kind], ...patch } });

  const requestNotif = async () => {
    try {
      setNotifPerm(await Notification.requestPermission());
    } catch {
      /* abaikan */
    }
  };

  const submit = async (mode) => {
    if (!email.trim() || password.length < 6) {
      setMsg('Isi email dan kata sandi (minimal 6 karakter).');
      return;
    }
    setBusy(true);
    setMsg('');
    const res = mode === 'in' ? await cloud.signIn(email.trim(), password) : await cloud.signUp(email.trim(), password);
    setBusy(false);
    if (!res.ok) setMsg(res.message || 'Gagal.');
    else if (res.needsConfirm) setMsg('Akun dibuat. Cek emailmu untuk konfirmasi, lalu masuk.');
    else setPassword('');
  };

  const signedIn = Boolean(cloud.email);

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-[#E6DFD3] bg-white p-5 shadow-2xs">
        <p className="text-xs font-semibold tracking-wider text-[#C86D51] uppercase">Personalisasi & Data</p>
        <h2 className="font-serif text-2xl font-bold text-[#2D2A26]">Pengaturan</h2>
      </div>

      {/* Tampilan */}
      <Card title="Tampilan" subtitle="Tema warna dan gaya animasi pertumbuhan kebiasaan.">
        <div className="flex flex-wrap items-center gap-6">
          <div>
            <p className="mb-1.5 text-xs font-semibold text-[#6E675F]">Mode</p>
            <div className="flex rounded-xl border border-[#E6DFD3] bg-[#FAF7F2] p-1">
              {[
                { id: 'light', label: 'Terang', icon: Sun },
                { id: 'dark', label: 'Gelap', icon: Moon },
              ].map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  onClick={() => onThemeChange(id)}
                  className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold ${theme === id ? 'bg-[#5C7A67] text-white' : 'text-[#4A453E]'
                    }`}
                >
                  <Icon className="h-3.5 w-3.5" /> {label}
                </button>
              ))}
            </div>
          </div>
          <div>
            <p className="mb-1.5 text-xs font-semibold text-[#6E675F]">Animasi kebiasaan</p>
            <div className="flex rounded-xl border border-[#E6DFD3] bg-[#FAF7F2] p-1">
              {[
                { id: 'plant', label: '🌱 Pohon' },
                { id: 'butterfly', label: '🦋 Kupu-kupu' },
              ].map((t) => (
                <button
                  key={t.id}
                  onClick={() => onGrowthChange(t.id)}
                  className={`rounded-lg px-3 py-1.5 text-xs font-semibold ${growthTheme === t.id ? 'bg-[#5C7A67] text-white' : 'text-[#4A453E]'
                    }`}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      </Card>

      {/* Pengingat */}
      <Card
        title="Pengingat Harian"
        subtitle="Muncul sebagai notifikasi dan kartu di layar selama aplikasi terbuka (tab atau aplikasi terpasang)."
      >
        <div className="space-y-3">
          {[
            { kind: 'journal', label: 'Ingatkan menulis jurnal', hint: 'Hanya jika catatan hari ini masih kosong' },
            { kind: 'habits', label: 'Ingatkan mencentang kebiasaan', hint: 'Hanya jika masih ada yang belum selesai' },
          ].map(({ kind, label, hint }) => (
            <div key={kind} className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#FAF7F2] px-4 py-3">
              <label className="flex items-center gap-3 text-sm font-medium text-[#2D2A26]">
                <input
                  type="checkbox"
                  checked={settings[kind].enabled}
                  onChange={(e) => setKind(kind, { enabled: e.target.checked })}
                  className="h-4 w-4 accent-[#5C7A67]"
                  aria-label={label}
                />
                <span>
                  {label}
                  <span className="block text-[11px] font-normal text-[#8C8378]">{hint}</span>
                </span>
              </label>
              <input
                type="time"
                value={settings[kind].time}
                onChange={(e) => setKind(kind, { time: e.target.value })}
                aria-label={`Jam ${label}`}
                className="rounded-xl border border-[#E6DFD3] bg-white px-3 py-1.5 text-sm"
              />
            </div>
          ))}
        </div>
        <div className="mt-3 flex items-center gap-2 text-xs text-[#6E675F]">
          <Bell className="h-4 w-4" />
          {notifPerm === 'granted' && 'Notifikasi browser aktif.'}
          {notifPerm === 'denied' && 'Notifikasi browser diblokir. Pengingat tetap muncul sebagai kartu di layar.'}
          {notifPerm === 'default' && (
            <button onClick={requestNotif} className="font-semibold text-[#C86D51] underline">
              Aktifkan notifikasi browser
            </button>
          )}
        </div>
      </Card>

      {/* Cloud */}
      <Card
        title="Akun & Sinkronisasi Cloud"
        subtitle="Simpan jurnalmu secara online agar sama di HP dan laptop, dan aman walau browser dibersihkan."
      >
        {!cloud.configured ? (
          <div className="rounded-xl bg-[#FFF8F3] p-4 text-sm text-[#4A453E]">
            <p className="mb-1 flex items-center gap-2 font-semibold">
              <CloudOff className="h-4 w-4 text-[#C86D51]" /> Sinkronisasi belum diaktifkan
            </p>
            <p className="text-xs leading-relaxed">
              Buat project di supabase.com, jalankan <code>supabase.sql</code>, lalu isi{' '}
              <code>VITE_SUPABASE_URL</code> dan <code>VITE_SUPABASE_ANON_KEY</code> di file <code>.env</code> dan
              restart <code>npm run dev</code>. Selama belum diisi, data tersimpan di browser ini saja.
            </p>
          </div>
        ) : signedIn ? (
          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-[#F3F8F4] px-4 py-3">
              <div>
                <p className="flex items-center gap-2 text-sm font-semibold text-[#2D2A26]">
                  <Cloud className="h-4 w-4 text-[#5C7A67]" /> {cloud.email}
                </p>
                <p className="text-xs text-[#6E675F]" data-testid="cloud-status">
                  {STATUS_TEXT[cloud.status]}
                  {cloud.lastSynced && ` · terakhir ${cloud.lastSynced.toLocaleTimeString('id-ID')}`}
                </p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={cloud.syncNow}
                  className="flex items-center gap-1.5 rounded-xl border border-[#E6DFD3] bg-white px-3 py-2 text-xs font-semibold text-[#2D2A26]"
                >
                  <RefreshCw className="h-3.5 w-3.5" /> Sinkronkan
                </button>
                <button
                  onClick={cloud.signOut}
                  className="flex items-center gap-1.5 rounded-xl border border-[#E6DFD3] bg-white px-3 py-2 text-xs font-semibold text-[#2D2A26]"
                >
                  <LogOut className="h-3.5 w-3.5" /> Keluar
                </button>
              </div>
            </div>
            {cloud.error && <p className="text-xs text-rose-600">{cloud.error}</p>}
          </div>
        ) : (
          <form
            onSubmit={(e) => {
              e.preventDefault();
              submit('in');
            }}
            className="grid gap-3 sm:grid-cols-2"
          >
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Email"
              autoComplete="email"
              className="rounded-xl border border-[#E6DFD3] bg-[#FAF7F2] px-3.5 py-2.5 text-sm"
            />
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Kata sandi (min. 6 karakter)"
              autoComplete="current-password"
              className="rounded-xl border border-[#E6DFD3] bg-[#FAF7F2] px-3.5 py-2.5 text-sm"
            />
            <button
              type="submit"
              disabled={busy}
              className="rounded-xl bg-[#5C7A67] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-60"
            >
              Masuk
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={() => submit('up')}
              className="rounded-xl border border-[#E6DFD3] bg-white px-4 py-2.5 text-sm font-semibold text-[#2D2A26] disabled:opacity-60"
            >
              Daftar akun baru
            </button>
            {(msg || cloud.error) && (
              <p className="text-xs text-[#C86D51] sm:col-span-2" data-testid="cloud-message">
                {msg || cloud.error}
              </p>
            )}
          </form>
        )}
      </Card>

      {/* Data */}
      <Card
        title="Data & Backup"
        subtitle={`${dataInfo.days} hari tercatat · ${dataInfo.habits} kebiasaan · sekitar ${dataInfo.kb} KB`}
      >
        <div className="flex flex-wrap gap-2">
          <button
            onClick={onExport}
            className="flex items-center gap-2 rounded-xl border border-[#D8CFC0] bg-[#FAF7F2] px-4 py-2 text-xs font-semibold text-[#2D2A26]"
          >
            <Download className="h-3.5 w-3.5 text-[#5C7A67]" /> Export Backup JSON
          </button>
          <label className="flex cursor-pointer items-center gap-2 rounded-xl border border-[#D8CFC0] bg-[#FAF7F2] px-4 py-2 text-xs font-semibold text-[#2D2A26]">
            <Upload className="h-3.5 w-3.5 text-[#C86D51]" /> Import Backup JSON
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
            onClick={onReset}
            className="flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-semibold text-[#8C8378] hover:bg-rose-50 hover:text-rose-700"
          >
            <RotateCcw className="h-3.5 w-3.5" /> Reset Data Default
          </button>
        </div>
      </Card>
    </div>
  );
}

-- Jalankan di Supabase: SQL Editor -> New query -> paste -> Run.
-- Satu baris per pengguna; seluruh jurnal disimpan sebagai JSON.

create table if not exists public.journals (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  data       jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.journals enable row level security;

drop policy if exists "journals_select_own" on public.journals;
drop policy if exists "journals_insert_own" on public.journals;
drop policy if exists "journals_update_own" on public.journals;
drop policy if exists "journals_delete_own" on public.journals;

-- Setiap pengguna HANYA bisa membaca/menulis barisnya sendiri.
create policy "journals_select_own" on public.journals for select using (auth.uid() = user_id);
create policy "journals_insert_own" on public.journals for insert with check (auth.uid() = user_id);
create policy "journals_update_own" on public.journals for update using (auth.uid() = user_id) with check (auth.uid() = user_id);
create policy "journals_delete_own" on public.journals for delete using (auth.uid() = user_id);

-- Beri akses API hanya untuk pengguna yang sudah login (diperlukan bila
-- "Automatically expose new tables" dimatikan; aman bila dinyalakan).
grant usage on schema public to authenticated;
grant select, insert, update, delete on public.journals to authenticated;
revoke all on public.journals from anon;

-- Per-account cloud sync for Studiq's local-first Zustand stores (classes, schedule, finance,
-- study, goals, career, college-match, campus-resources, notes). Each store's entire persisted
-- state round-trips as a single JSON blob per (user, store) pair — the same shape it already
-- persists to MMKV locally — rather than a bespoke relational schema per feature. See
-- src/lib/cloudSync.ts for the client-side sync logic that reads/writes this table.

create table if not exists public.user_store_state (
  user_id uuid not null references auth.users (id) on delete cascade,
  store_name text not null,
  data jsonb not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, store_name)
);

alter table public.user_store_state enable row level security;

create policy "Users can read their own store state"
  on public.user_store_state for select
  using (auth.uid() = user_id);

create policy "Users can insert their own store state"
  on public.user_store_state for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own store state"
  on public.user_store_state for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own store state"
  on public.user_store_state for delete
  using (auth.uid() = user_id);

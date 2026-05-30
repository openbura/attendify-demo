-- Connex live-demo Supabase schema.
-- Run in Supabase SQL Editor before running the generated seed file.
-- This demo uses anon-key REST access with permissive RLS policies.
-- Do not use these policies for a real production payroll/attendance system.

create extension if not exists pgcrypto;

create table if not exists public.sites (
  id text primary key,
  name text not null,
  location text,
  address text not null,
  client text,
  stage text,
  next_stage text,
  progress integer not null default 0,
  status text not null default 'active',
  image_key text,
  sort_order integer not null default 0,
  latitude double precision not null,
  longitude double precision not null,
  radius_meters integer not null default 250 check (radius_meters > 0),
  work_day_start_time time not null default '07:00',
  work_day_end_time time not null default '19:00',
  rounding_rule text not null default 'site-day-cap',
  rounding_tolerance_minutes integer not null default 15,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workers (
  id integer primary key,
  employee_number text,
  first_name text not null,
  last_name text,
  passport text,
  country text not null default 'Nepal',
  username text not null unique,
  password text not null,
  site_id text not null references public.sites(id) on update cascade,
  source_site_name text,
  hourly_rate numeric(10, 2) not null default 35.40,
  status text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.attendance_records (
  id uuid primary key default gen_random_uuid(),
  worker_id integer not null references public.workers(id) on delete cascade,
  work_date date not null,
  site_id text not null references public.sites(id) on update cascade,
  actual_entry_time time,
  actual_exit_time time,
  entry_time time,
  exit_time time,
  status text not null default '',
  source text not null default 'live',
  check_in_gps_evidence jsonb,
  check_out_gps_evidence jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint attendance_records_worker_date_unique unique (worker_id, work_date)
);

create table if not exists public.active_punches (
  worker_id integer primary key references public.workers(id) on delete cascade,
  site_id text not null references public.sites(id) on update cascade,
  entry_date date not null,
  entry_time time not null,
  check_in_gps_evidence jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_workers_site_id on public.workers(site_id);
create index if not exists idx_attendance_records_worker_date on public.attendance_records(worker_id, work_date desc);
create index if not exists idx_attendance_records_site_date on public.attendance_records(site_id, work_date desc);
create index if not exists idx_active_punches_site_id on public.active_punches(site_id);

create or replace function public.connex_set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists connex_sites_set_updated_at on public.sites;
create trigger connex_sites_set_updated_at
before update on public.sites
for each row execute function public.connex_set_updated_at();

drop trigger if exists connex_workers_set_updated_at on public.workers;
create trigger connex_workers_set_updated_at
before update on public.workers
for each row execute function public.connex_set_updated_at();

drop trigger if exists connex_attendance_records_set_updated_at on public.attendance_records;
create trigger connex_attendance_records_set_updated_at
before update on public.attendance_records
for each row execute function public.connex_set_updated_at();

drop trigger if exists connex_active_punches_set_updated_at on public.active_punches;
create trigger connex_active_punches_set_updated_at
before update on public.active_punches
for each row execute function public.connex_set_updated_at();

alter table public.sites enable row level security;
alter table public.workers enable row level security;
alter table public.attendance_records enable row level security;
alter table public.active_punches enable row level security;

grant usage on schema public to anon;
grant select, insert, update, delete on public.sites to anon;
grant select, insert, update, delete on public.workers to anon;
grant select, insert, update, delete on public.attendance_records to anon;
grant select, insert, update, delete on public.active_punches to anon;

drop policy if exists "connex demo read sites" on public.sites;
create policy "connex demo read sites" on public.sites for select to anon using (true);
drop policy if exists "connex demo write sites" on public.sites;
create policy "connex demo write sites" on public.sites for all to anon using (true) with check (true);

drop policy if exists "connex demo read workers" on public.workers;
create policy "connex demo read workers" on public.workers for select to anon using (true);
drop policy if exists "connex demo write workers" on public.workers;
create policy "connex demo write workers" on public.workers for all to anon using (true) with check (true);

drop policy if exists "connex demo read attendance" on public.attendance_records;
create policy "connex demo read attendance" on public.attendance_records for select to anon using (true);
drop policy if exists "connex demo write attendance" on public.attendance_records;
create policy "connex demo write attendance" on public.attendance_records for all to anon using (true) with check (true);

drop policy if exists "connex demo read active punches" on public.active_punches;
create policy "connex demo read active punches" on public.active_punches for select to anon using (true);
drop policy if exists "connex demo write active punches" on public.active_punches;
create policy "connex demo write active punches" on public.active_punches for all to anon using (true) with check (true);

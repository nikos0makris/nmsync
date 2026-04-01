create extension if not exists "pgcrypto";

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  height_cm numeric,
  experience_level text,
  created_at timestamptz not null default now()
);

create table if not exists public.exercises (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  muscle_group text,
  equipment text,
  is_custom boolean not null default false,
  owner_user_id uuid references auth.users(id) on delete cascade
);

create table if not exists public.workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  performed_on date not null,
  name text not null,
  notes text,
  duration_min integer,
  created_at timestamptz not null default now()
);

create table if not exists public.workout_sets (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid not null references public.workouts(id) on delete cascade,
  exercise_id uuid not null references public.exercises(id),
  set_order integer not null,
  reps integer not null,
  weight_kg numeric not null,
  rpe numeric
);

create table if not exists public.routines (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  goal text,
  days_per_week integer not null default 3,
  created_at timestamptz not null default now()
);

create table if not exists public.routine_exercises (
  id uuid primary key default gen_random_uuid(),
  routine_id uuid not null references public.routines(id) on delete cascade,
  day_index integer not null,
  exercise_id uuid not null references public.exercises(id),
  target_sets integer not null default 3,
  target_rep_min integer not null default 8,
  target_rep_max integer not null default 12
);

create table if not exists public.body_metrics (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  measured_on date not null,
  body_weight_kg numeric not null,
  body_fat_pct numeric,
  waist_cm numeric,
  created_at timestamptz not null default now()
);

insert into public.exercises (name, muscle_group, equipment, is_custom)
values
  ('Bench Press', 'Chest', 'Barbell', false),
  ('Squat', 'Legs', 'Barbell', false),
  ('Deadlift', 'Back', 'Barbell', false),
  ('Overhead Press', 'Shoulders', 'Barbell', false),
  ('Pull Up', 'Back', 'Bodyweight', false)
on conflict do nothing;

alter table public.profiles enable row level security;
alter table public.exercises enable row level security;
alter table public.workouts enable row level security;
alter table public.workout_sets enable row level security;
alter table public.routines enable row level security;
alter table public.routine_exercises enable row level security;
alter table public.body_metrics enable row level security;

create policy "profiles_own_rows"
on public.profiles for all using (id = auth.uid()) with check (id = auth.uid());

create policy "exercises_public_or_owner_read"
on public.exercises for select using (owner_user_id is null or owner_user_id = auth.uid());

create policy "exercises_owner_write"
on public.exercises for all
using (owner_user_id = auth.uid())
with check (owner_user_id = auth.uid());

create policy "workouts_own_rows"
on public.workouts for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "workout_sets_own_rows"
on public.workout_sets for all
using (
  exists (
    select 1 from public.workouts w
    where w.id = workout_sets.workout_id and w.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.workouts w
    where w.id = workout_sets.workout_id and w.user_id = auth.uid()
  )
);

create policy "routines_own_rows"
on public.routines for all using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "routine_exercises_own_rows"
on public.routine_exercises for all
using (
  exists (
    select 1 from public.routines r
    where r.id = routine_exercises.routine_id and r.user_id = auth.uid()
  )
)
with check (
  exists (
    select 1 from public.routines r
    where r.id = routine_exercises.routine_id and r.user_id = auth.uid()
  )
);

create policy "body_metrics_own_rows"
on public.body_metrics for all using (user_id = auth.uid()) with check (user_id = auth.uid());

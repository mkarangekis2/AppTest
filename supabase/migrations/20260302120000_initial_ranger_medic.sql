create extension if not exists "pgcrypto";

create table if not exists public.conops (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  raw_text text not null,
  metadata_json jsonb not null default '{}'::jsonb,
  conop_hash text,
  analysis_cache_json jsonb,
  analysis_cache_model text,
  analysis_cache_prompt_version text,
  analysis_generated_at timestamptz,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.scenarios (
  id uuid primary key default gen_random_uuid(),
  conop_id uuid not null references public.conops(id) on delete cascade,
  name text not null,
  status text not null check (status in ('draft', 'approved', 'archived')),
  moi text not null,
  difficulty text not null,
  environment_json jsonb not null,
  rubric_json jsonb not null,
  wound_set_json jsonb not null,
  presentation_script_json jsonb not null,
  vitals_model_json jsonb not null,
  conop_hash text not null,
  ai_model text not null,
  prompt_version text not null,
  created_by uuid not null references auth.users(id),
  approved_by uuid references auth.users(id),
  approved_at timestamptz,
  created_at timestamptz not null default now()
);

create table if not exists public.sessions (
  id uuid primary key default gen_random_uuid(),
  scenario_id uuid not null references public.scenarios(id) on delete cascade,
  instructor_id uuid not null references auth.users(id),
  mode text not null check (mode in ('exam', 'training')),
  started_at timestamptz not null default now(),
  ended_at timestamptz,
  current_stage text not null,
  current_vitals_json jsonb not null
);

create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  ts timestamptz not null default now(),
  type text not null check (type in ('medic_action', 'ai_suggestion', 'proctor_apply', 'proctor_override', 'patient_change', 'score_mark', 'note')),
  payload_json jsonb not null default '{}'::jsonb
);

create table if not exists public.scores (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.sessions(id) on delete cascade,
  rubric_version text not null,
  score_json jsonb not null,
  final_by uuid references auth.users(id),
  final_at timestamptz
);

create index if not exists scenarios_conop_id_idx on public.scenarios (conop_id);
create index if not exists sessions_scenario_instructor_idx on public.sessions (scenario_id, instructor_id);
create index if not exists events_session_ts_idx on public.events (session_id, ts);
create unique index if not exists scores_session_id_idx on public.scores (session_id);

alter table public.conops enable row level security;
alter table public.scenarios enable row level security;
alter table public.sessions enable row level security;
alter table public.events enable row level security;
alter table public.scores enable row level security;

create policy "conops_owner_select" on public.conops
  for select using (created_by = auth.uid());
create policy "conops_owner_insert" on public.conops
  for insert with check (created_by = auth.uid());
create policy "conops_owner_update" on public.conops
  for update using (created_by = auth.uid()) with check (created_by = auth.uid());

create policy "scenarios_owner_select" on public.scenarios
  for select using (created_by = auth.uid());
create policy "scenarios_owner_insert" on public.scenarios
  for insert with check (created_by = auth.uid());
create policy "scenarios_owner_update" on public.scenarios
  for update using (created_by = auth.uid()) with check (created_by = auth.uid());

create policy "sessions_owner_select" on public.sessions
  for select using (instructor_id = auth.uid());
create policy "sessions_owner_insert" on public.sessions
  for insert with check (instructor_id = auth.uid());
create policy "sessions_owner_update" on public.sessions
  for update using (instructor_id = auth.uid()) with check (instructor_id = auth.uid());

create policy "events_session_owner_select" on public.events
  for select using (
    exists (
      select 1 from public.sessions
      where sessions.id = events.session_id
      and sessions.instructor_id = auth.uid()
    )
  );
create policy "events_session_owner_insert" on public.events
  for insert with check (
    exists (
      select 1 from public.sessions
      where sessions.id = events.session_id
      and sessions.instructor_id = auth.uid()
    )
  );

create policy "scores_session_owner_select" on public.scores
  for select using (
    exists (
      select 1 from public.sessions
      where sessions.id = scores.session_id
      and sessions.instructor_id = auth.uid()
    )
  );
create policy "scores_session_owner_insert" on public.scores
  for insert with check (
    exists (
      select 1 from public.sessions
      where sessions.id = scores.session_id
      and sessions.instructor_id = auth.uid()
    )
  );
create policy "scores_session_owner_update" on public.scores
  for update using (
    exists (
      select 1 from public.sessions
      where sessions.id = scores.session_id
      and sessions.instructor_id = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.sessions
      where sessions.id = scores.session_id
      and sessions.instructor_id = auth.uid()
    )
  );

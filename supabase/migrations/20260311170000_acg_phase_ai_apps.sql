create table if not exists public.ai_apps (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete cascade,
  name text not null,
  slug text not null,
  description text not null default '',
  provider text not null check (provider in ('openai', 'anthropic')),
  model text not null,
  system_prompt text not null,
  input_schema_json jsonb not null default '{}'::jsonb,
  output_schema_json jsonb not null default '{}'::jsonb,
  app_config_json jsonb not null default '{}'::jsonb,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, slug)
);

create table if not exists public.ai_app_runs (
  id uuid primary key default gen_random_uuid(),
  app_id uuid not null references public.ai_apps(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  created_by uuid not null references auth.users(id) on delete cascade,
  status text not null default 'pending' check (status in ('pending', 'success', 'error')),
  input_json jsonb not null default '{}'::jsonb,
  output_json jsonb,
  error_text text,
  latency_ms integer,
  started_at timestamptz not null default now(),
  finished_at timestamptz
);

create index if not exists ai_apps_company_idx on public.ai_apps (company_id, updated_at desc);
create index if not exists ai_app_runs_company_idx on public.ai_app_runs (company_id, started_at desc);
create index if not exists ai_app_runs_app_idx on public.ai_app_runs (app_id, started_at desc);

alter table public.ai_apps enable row level security;
alter table public.ai_app_runs enable row level security;

create policy "ai_apps_owner_select" on public.ai_apps
  for select using (
    exists (
      select 1 from public.companies
      where companies.id = ai_apps.company_id
      and companies.created_by = auth.uid()
    )
  );
create policy "ai_apps_owner_insert" on public.ai_apps
  for insert with check (
    exists (
      select 1 from public.companies
      where companies.id = ai_apps.company_id
      and companies.created_by = auth.uid()
    )
    and created_by = auth.uid()
  );
create policy "ai_apps_owner_update" on public.ai_apps
  for update using (
    exists (
      select 1 from public.companies
      where companies.id = ai_apps.company_id
      and companies.created_by = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.companies
      where companies.id = ai_apps.company_id
      and companies.created_by = auth.uid()
    )
  );

create policy "ai_app_runs_owner_select" on public.ai_app_runs
  for select using (
    exists (
      select 1 from public.companies
      where companies.id = ai_app_runs.company_id
      and companies.created_by = auth.uid()
    )
  );
create policy "ai_app_runs_owner_insert" on public.ai_app_runs
  for insert with check (
    exists (
      select 1 from public.companies
      where companies.id = ai_app_runs.company_id
      and companies.created_by = auth.uid()
    )
    and created_by = auth.uid()
  );

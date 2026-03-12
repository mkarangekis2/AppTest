create extension if not exists "pgcrypto";

create table if not exists public.companies (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  website text,
  industry text not null,
  team_size text not null,
  revenue_model text not null,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.company_profiles (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null unique references public.companies(id) on delete cascade,
  lead_volume integer not null default 0,
  support_volume integer not null default 0,
  documentation_maturity text not null default 'low',
  workflow_maturity text not null default 'low',
  project_complexity text not null default 'low',
  support_complexity text not null default 'low',
  top_pain_points_json jsonb not null default '[]'::jsonb,
  growth_goals_json jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.onboarding_answers (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  question_key text not null,
  answer_json jsonb not null,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

create table if not exists public.modules (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  category text not null,
  description text not null,
  problem_solved text not null,
  expected_outcomes_json jsonb not null default '[]'::jsonb,
  config_json jsonb not null default '{}'::jsonb,
  required_integrations_json jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.packages (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  name text not null,
  category text not null,
  description text not null,
  included_module_ids_json jsonb not null default '[]'::jsonb,
  config_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.recommendations (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  recommendation_type text not null,
  module_id uuid references public.modules(id),
  package_id uuid references public.packages(id),
  reason text not null,
  impact_level text not null,
  implementation_complexity text not null,
  evidence_json jsonb not null default '{}'::jsonb,
  created_by uuid not null references auth.users(id),
  created_at timestamptz not null default now()
);

create index if not exists companies_created_by_idx on public.companies (created_by);
create index if not exists onboarding_answers_company_idx on public.onboarding_answers (company_id, created_at desc);
create index if not exists recommendations_company_idx on public.recommendations (company_id, created_at desc);

alter table public.companies enable row level security;
alter table public.company_profiles enable row level security;
alter table public.onboarding_answers enable row level security;
alter table public.modules enable row level security;
alter table public.packages enable row level security;
alter table public.recommendations enable row level security;

create policy "companies_owner_select" on public.companies
  for select using (created_by = auth.uid());
create policy "companies_owner_insert" on public.companies
  for insert with check (created_by = auth.uid());
create policy "companies_owner_update" on public.companies
  for update using (created_by = auth.uid()) with check (created_by = auth.uid());

create policy "company_profiles_owner_select" on public.company_profiles
  for select using (
    exists (
      select 1 from public.companies
      where companies.id = company_profiles.company_id
      and companies.created_by = auth.uid()
    )
  );
create policy "company_profiles_owner_insert" on public.company_profiles
  for insert with check (
    exists (
      select 1 from public.companies
      where companies.id = company_profiles.company_id
      and companies.created_by = auth.uid()
    )
  );
create policy "company_profiles_owner_update" on public.company_profiles
  for update using (
    exists (
      select 1 from public.companies
      where companies.id = company_profiles.company_id
      and companies.created_by = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.companies
      where companies.id = company_profiles.company_id
      and companies.created_by = auth.uid()
    )
  );

create policy "onboarding_answers_owner_select" on public.onboarding_answers
  for select using (created_by = auth.uid());
create policy "onboarding_answers_owner_insert" on public.onboarding_answers
  for insert with check (created_by = auth.uid());

create policy "modules_authenticated_select" on public.modules
  for select using (auth.role() = 'authenticated');
create policy "packages_authenticated_select" on public.packages
  for select using (auth.role() = 'authenticated');

create policy "recommendations_owner_select" on public.recommendations
  for select using (created_by = auth.uid());
create policy "recommendations_owner_insert" on public.recommendations
  for insert with check (created_by = auth.uid());

create table if not exists public.workflows (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  module_id uuid references public.modules(id) on delete set null,
  name text not null,
  status text not null default 'draft',
  trigger_type text not null,
  definition_json jsonb not null default '{}'::jsonb,
  version integer not null default 1,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.workflow_runs (
  id uuid primary key default gen_random_uuid(),
  workflow_id uuid not null references public.workflows(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  status text not null default 'queued',
  input_json jsonb not null default '{}'::jsonb,
  output_json jsonb not null default '{}'::jsonb,
  error_message text,
  started_at timestamptz not null default now(),
  finished_at timestamptz
);

create index if not exists workflows_company_idx on public.workflows (company_id, created_at desc);
create index if not exists workflow_runs_company_idx on public.workflow_runs (company_id, started_at desc);
create index if not exists workflow_runs_workflow_idx on public.workflow_runs (workflow_id, started_at desc);

alter table public.workflows enable row level security;
alter table public.workflow_runs enable row level security;

create policy "workflows_owner_select" on public.workflows
  for select using (
    exists (
      select 1 from public.companies
      where companies.id = workflows.company_id
      and companies.created_by = auth.uid()
    )
  );
create policy "workflows_owner_insert" on public.workflows
  for insert with check (
    exists (
      select 1 from public.companies
      where companies.id = workflows.company_id
      and companies.created_by = auth.uid()
    )
  );
create policy "workflows_owner_update" on public.workflows
  for update using (
    exists (
      select 1 from public.companies
      where companies.id = workflows.company_id
      and companies.created_by = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.companies
      where companies.id = workflows.company_id
      and companies.created_by = auth.uid()
    )
  );

create policy "workflow_runs_owner_select" on public.workflow_runs
  for select using (
    exists (
      select 1 from public.companies
      where companies.id = workflow_runs.company_id
      and companies.created_by = auth.uid()
    )
  );
create policy "workflow_runs_owner_insert" on public.workflow_runs
  for insert with check (
    exists (
      select 1 from public.companies
      where companies.id = workflow_runs.company_id
      and companies.created_by = auth.uid()
    )
  );
create policy "workflow_runs_owner_update" on public.workflow_runs
  for update using (
    exists (
      select 1 from public.companies
      where companies.id = workflow_runs.company_id
      and companies.created_by = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.companies
      where companies.id = workflow_runs.company_id
      and companies.created_by = auth.uid()
    )
  );

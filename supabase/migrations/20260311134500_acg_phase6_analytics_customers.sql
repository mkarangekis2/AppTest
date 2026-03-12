create table if not exists public.leads (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  source text not null default 'manual',
  first_name text,
  last_name text,
  company_name text,
  email text,
  phone text,
  service_interest text,
  score integer not null default 0,
  status text not null default 'new',
  summary text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.opportunities (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  lead_id uuid references public.leads(id) on delete set null,
  stage text not null default 'qualification',
  value numeric(12,2) not null default 0,
  close_probability integer not null default 0,
  risk_level text not null default 'low',
  next_step text,
  last_activity_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.clients (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  name text not null,
  segment text,
  status text not null default 'active',
  annual_value numeric(12,2) not null default 0,
  renewal_date date,
  churn_risk text not null default 'low',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.analytics_snapshots (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  snapshot_type text not null,
  payload_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create index if not exists leads_company_idx on public.leads (company_id, created_at desc);
create index if not exists opportunities_company_idx on public.opportunities (company_id, created_at desc);
create index if not exists clients_company_idx on public.clients (company_id, created_at desc);
create index if not exists analytics_snapshots_company_idx on public.analytics_snapshots (company_id, created_at desc);

alter table public.leads enable row level security;
alter table public.opportunities enable row level security;
alter table public.clients enable row level security;
alter table public.analytics_snapshots enable row level security;

create policy "leads_owner_select" on public.leads
  for select using (
    exists (
      select 1 from public.companies
      where companies.id = leads.company_id
      and companies.created_by = auth.uid()
    )
  );
create policy "leads_owner_insert" on public.leads
  for insert with check (
    exists (
      select 1 from public.companies
      where companies.id = leads.company_id
      and companies.created_by = auth.uid()
    )
  );
create policy "leads_owner_update" on public.leads
  for update using (
    exists (
      select 1 from public.companies
      where companies.id = leads.company_id
      and companies.created_by = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.companies
      where companies.id = leads.company_id
      and companies.created_by = auth.uid()
    )
  );

create policy "opportunities_owner_select" on public.opportunities
  for select using (
    exists (
      select 1 from public.companies
      where companies.id = opportunities.company_id
      and companies.created_by = auth.uid()
    )
  );
create policy "opportunities_owner_insert" on public.opportunities
  for insert with check (
    exists (
      select 1 from public.companies
      where companies.id = opportunities.company_id
      and companies.created_by = auth.uid()
    )
  );
create policy "opportunities_owner_update" on public.opportunities
  for update using (
    exists (
      select 1 from public.companies
      where companies.id = opportunities.company_id
      and companies.created_by = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.companies
      where companies.id = opportunities.company_id
      and companies.created_by = auth.uid()
    )
  );

create policy "clients_owner_select" on public.clients
  for select using (
    exists (
      select 1 from public.companies
      where companies.id = clients.company_id
      and companies.created_by = auth.uid()
    )
  );
create policy "clients_owner_insert" on public.clients
  for insert with check (
    exists (
      select 1 from public.companies
      where companies.id = clients.company_id
      and companies.created_by = auth.uid()
    )
  );
create policy "clients_owner_update" on public.clients
  for update using (
    exists (
      select 1 from public.companies
      where companies.id = clients.company_id
      and companies.created_by = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.companies
      where companies.id = clients.company_id
      and companies.created_by = auth.uid()
    )
  );

create policy "analytics_snapshots_owner_select" on public.analytics_snapshots
  for select using (
    exists (
      select 1 from public.companies
      where companies.id = analytics_snapshots.company_id
      and companies.created_by = auth.uid()
    )
  );
create policy "analytics_snapshots_owner_insert" on public.analytics_snapshots
  for insert with check (
    exists (
      select 1 from public.companies
      where companies.id = analytics_snapshots.company_id
      and companies.created_by = auth.uid()
    )
  );

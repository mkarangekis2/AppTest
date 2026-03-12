create table if not exists public.integrations (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  provider text not null,
  status text not null default 'disconnected',
  config_json jsonb not null default '{}'::jsonb,
  connected_at timestamptz,
  updated_at timestamptz not null default now(),
  unique (company_id, provider)
);

create table if not exists public.company_settings (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null unique references public.companies(id) on delete cascade,
  brand_voice_json jsonb not null default '{}'::jsonb,
  ai_behavior_json jsonb not null default '{}'::jsonb,
  notifications_json jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null unique references public.companies(id) on delete cascade,
  plan_name text not null default 'Starter',
  status text not null default 'active',
  billing_interval text not null default 'monthly',
  started_at timestamptz not null default now(),
  renewed_at timestamptz,
  expires_at timestamptz
);

create table if not exists public.usage_metrics (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  metric_key text not null,
  metric_value numeric(12,2) not null default 0,
  period_start date not null,
  period_end date not null,
  created_at timestamptz not null default now()
);

create index if not exists integrations_company_idx on public.integrations (company_id, updated_at desc);
create index if not exists usage_metrics_company_idx on public.usage_metrics (company_id, created_at desc);

alter table public.integrations enable row level security;
alter table public.company_settings enable row level security;
alter table public.subscriptions enable row level security;
alter table public.usage_metrics enable row level security;

create policy "integrations_owner_select" on public.integrations
  for select using (
    exists (
      select 1 from public.companies
      where companies.id = integrations.company_id
      and companies.created_by = auth.uid()
    )
  );
create policy "integrations_owner_insert" on public.integrations
  for insert with check (
    exists (
      select 1 from public.companies
      where companies.id = integrations.company_id
      and companies.created_by = auth.uid()
    )
  );
create policy "integrations_owner_update" on public.integrations
  for update using (
    exists (
      select 1 from public.companies
      where companies.id = integrations.company_id
      and companies.created_by = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.companies
      where companies.id = integrations.company_id
      and companies.created_by = auth.uid()
    )
  );

create policy "company_settings_owner_select" on public.company_settings
  for select using (
    exists (
      select 1 from public.companies
      where companies.id = company_settings.company_id
      and companies.created_by = auth.uid()
    )
  );
create policy "company_settings_owner_insert" on public.company_settings
  for insert with check (
    exists (
      select 1 from public.companies
      where companies.id = company_settings.company_id
      and companies.created_by = auth.uid()
    )
  );
create policy "company_settings_owner_update" on public.company_settings
  for update using (
    exists (
      select 1 from public.companies
      where companies.id = company_settings.company_id
      and companies.created_by = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.companies
      where companies.id = company_settings.company_id
      and companies.created_by = auth.uid()
    )
  );

create policy "subscriptions_owner_select" on public.subscriptions
  for select using (
    exists (
      select 1 from public.companies
      where companies.id = subscriptions.company_id
      and companies.created_by = auth.uid()
    )
  );
create policy "subscriptions_owner_insert" on public.subscriptions
  for insert with check (
    exists (
      select 1 from public.companies
      where companies.id = subscriptions.company_id
      and companies.created_by = auth.uid()
    )
  );
create policy "subscriptions_owner_update" on public.subscriptions
  for update using (
    exists (
      select 1 from public.companies
      where companies.id = subscriptions.company_id
      and companies.created_by = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.companies
      where companies.id = subscriptions.company_id
      and companies.created_by = auth.uid()
    )
  );

create policy "usage_metrics_owner_select" on public.usage_metrics
  for select using (
    exists (
      select 1 from public.companies
      where companies.id = usage_metrics.company_id
      and companies.created_by = auth.uid()
    )
  );
create policy "usage_metrics_owner_insert" on public.usage_metrics
  for insert with check (
    exists (
      select 1 from public.companies
      where companies.id = usage_metrics.company_id
      and companies.created_by = auth.uid()
    )
  );

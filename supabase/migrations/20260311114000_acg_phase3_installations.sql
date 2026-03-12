create table if not exists public.module_installations (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  module_id uuid not null references public.modules(id) on delete cascade,
  status text not null default 'installed',
  config_json jsonb not null default '{}'::jsonb,
  installed_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, module_id)
);

create table if not exists public.package_installations (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  package_id uuid not null references public.packages(id) on delete cascade,
  status text not null default 'installed',
  installed_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (company_id, package_id)
);

create index if not exists module_installations_company_idx on public.module_installations (company_id, installed_at desc);
create index if not exists package_installations_company_idx on public.package_installations (company_id, installed_at desc);

alter table public.module_installations enable row level security;
alter table public.package_installations enable row level security;

create policy "module_installations_owner_select" on public.module_installations
  for select using (
    exists (
      select 1 from public.companies
      where companies.id = module_installations.company_id
      and companies.created_by = auth.uid()
    )
  );
create policy "module_installations_owner_insert" on public.module_installations
  for insert with check (
    exists (
      select 1 from public.companies
      where companies.id = module_installations.company_id
      and companies.created_by = auth.uid()
    )
  );
create policy "module_installations_owner_update" on public.module_installations
  for update using (
    exists (
      select 1 from public.companies
      where companies.id = module_installations.company_id
      and companies.created_by = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.companies
      where companies.id = module_installations.company_id
      and companies.created_by = auth.uid()
    )
  );

create policy "package_installations_owner_select" on public.package_installations
  for select using (
    exists (
      select 1 from public.companies
      where companies.id = package_installations.company_id
      and companies.created_by = auth.uid()
    )
  );
create policy "package_installations_owner_insert" on public.package_installations
  for insert with check (
    exists (
      select 1 from public.companies
      where companies.id = package_installations.company_id
      and companies.created_by = auth.uid()
    )
  );
create policy "package_installations_owner_update" on public.package_installations
  for update using (
    exists (
      select 1 from public.companies
      where companies.id = package_installations.company_id
      and companies.created_by = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.companies
      where companies.id = package_installations.company_id
      and companies.created_by = auth.uid()
    )
  );

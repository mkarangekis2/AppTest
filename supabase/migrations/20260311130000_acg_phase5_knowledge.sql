create table if not exists public.documents (
  id uuid primary key default gen_random_uuid(),
  company_id uuid not null references public.companies(id) on delete cascade,
  title text not null,
  document_type text not null,
  source text not null default 'manual',
  content_text text not null,
  metadata_json jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.document_embeddings (
  id uuid primary key default gen_random_uuid(),
  document_id uuid not null references public.documents(id) on delete cascade,
  company_id uuid not null references public.companies(id) on delete cascade,
  chunk_index integer not null,
  content_chunk text not null,
  embedding double precision[] not null default '{}',
  created_at timestamptz not null default now()
);

create index if not exists documents_company_idx on public.documents (company_id, created_at desc);
create index if not exists document_embeddings_document_idx on public.document_embeddings (document_id, chunk_index);
create index if not exists document_embeddings_company_idx on public.document_embeddings (company_id, created_at desc);

alter table public.documents enable row level security;
alter table public.document_embeddings enable row level security;

create policy "documents_owner_select" on public.documents
  for select using (
    exists (
      select 1 from public.companies
      where companies.id = documents.company_id
      and companies.created_by = auth.uid()
    )
  );
create policy "documents_owner_insert" on public.documents
  for insert with check (
    exists (
      select 1 from public.companies
      where companies.id = documents.company_id
      and companies.created_by = auth.uid()
    )
  );
create policy "documents_owner_update" on public.documents
  for update using (
    exists (
      select 1 from public.companies
      where companies.id = documents.company_id
      and companies.created_by = auth.uid()
    )
  ) with check (
    exists (
      select 1 from public.companies
      where companies.id = documents.company_id
      and companies.created_by = auth.uid()
    )
  );

create policy "document_embeddings_owner_select" on public.document_embeddings
  for select using (
    exists (
      select 1 from public.companies
      where companies.id = document_embeddings.company_id
      and companies.created_by = auth.uid()
    )
  );
create policy "document_embeddings_owner_insert" on public.document_embeddings
  for insert with check (
    exists (
      select 1 from public.companies
      where companies.id = document_embeddings.company_id
      and companies.created_by = auth.uid()
    )
  );

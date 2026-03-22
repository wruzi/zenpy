create table if not exists public.json_store (
    key text primary key,
    data jsonb not null,
    updated_at timestamptz not null default now()
);

create index if not exists idx_json_store_updated_at
    on public.json_store(updated_at desc);

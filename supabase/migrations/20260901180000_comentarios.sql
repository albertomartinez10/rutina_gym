create table if not exists public.comentarios (
  id bigint generated always as identity primary key,
  entreno_id bigint not null references public.entrenos(id) on delete cascade,
  perfil text not null,
  texto text not null check (length(trim(texto)) between 1 and 500),
  created_at timestamptz not null default now()
);

create index if not exists comentarios_entreno_idx on public.comentarios (entreno_id, created_at);

alter table public.comentarios enable row level security;
create policy "lectura abierta" on public.comentarios for select to anon, authenticated using (true);
create policy "insercion abierta" on public.comentarios for insert to anon, authenticated with check (true);
create policy "borrado abierto" on public.comentarios for delete to anon, authenticated using (true);

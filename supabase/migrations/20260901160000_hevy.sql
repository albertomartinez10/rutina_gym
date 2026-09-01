-- Notas por ejercicio, al estilo Hevy ("mancuernas nuevas", "me dolía el hombro").
alter table public.registros add column if not exists nota text;

-- Reacciones a las fotos del entreno: lo social, pero entre dos.
create table if not exists public.reacciones (
  id bigint generated always as identity primary key,
  entreno_id bigint not null references public.entrenos(id) on delete cascade,
  perfil text not null,
  emoji text not null,
  created_at timestamptz not null default now(),
  unique (entreno_id, perfil, emoji)
);

alter table public.reacciones enable row level security;
create policy "lectura abierta" on public.reacciones for select to anon, authenticated using (true);
create policy "insercion abierta" on public.reacciones for insert to anon, authenticated with check (true);
create policy "borrado abierto" on public.reacciones for delete to anon, authenticated using (true);

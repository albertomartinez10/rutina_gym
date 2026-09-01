-- Días de gimnasio y fotos del entreno.
create table if not exists public.entrenos (
  id bigint generated always as identity primary key,
  perfil text not null,
  fecha date not null default current_date,
  foto text,
  nota text,
  created_at timestamptz not null default now()
);

create index if not exists entrenos_perfil_fecha_idx on public.entrenos (perfil, fecha desc);

alter table public.entrenos enable row level security;
create policy "lectura abierta" on public.entrenos for select to anon, authenticated using (true);
create policy "insercion abierta" on public.entrenos for insert to anon, authenticated with check (true);
create policy "borrado abierto" on public.entrenos for delete to anon, authenticated using (true);

-- Las fotos van a un bucket público: sin login no hay forma de firmar URLs.
insert into storage.buckets (id, name, public)
values ('entrenos', 'entrenos', true)
on conflict (id) do update set public = true;

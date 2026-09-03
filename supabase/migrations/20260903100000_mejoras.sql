-- Series de calentamiento: no cuentan para récords ni volumen.
alter table public.registros add column if not exists calentamiento boolean not null default false;

-- Peso corporal y medidas.
create table if not exists public.medidas (
  id bigint generated always as identity primary key,
  perfil text not null,
  fecha date not null default current_date,
  peso numeric check (peso > 0 and peso < 400),
  cintura numeric,
  nota text,
  created_at timestamptz not null default now(),
  unique (perfil, fecha)
);

alter table public.medidas enable row level security;
create policy "lectura abierta" on public.medidas for select to anon, authenticated using (true);
create policy "insercion abierta" on public.medidas for insert to anon, authenticated with check (true);
create policy "cambio abierto" on public.medidas for update to anon, authenticated using (true) with check (true);
create policy "borrado abierto" on public.medidas for delete to anon, authenticated using (true);

-- Fotos de progreso físico, aparte de las del entreno.
alter table public.entrenos add column if not exists tipo text not null default 'entreno';

-- Reto de la semana con su apuesta.
create table if not exists public.retos (
  id bigint generated always as identity primary key,
  semana date not null unique,
  texto text not null,
  apuesta text,
  ganador text,
  created_at timestamptz not null default now()
);

alter table public.retos enable row level security;
create policy "lectura abierta" on public.retos for select to anon, authenticated using (true);
create policy "insercion abierta" on public.retos for insert to anon, authenticated with check (true);
create policy "cambio abierto" on public.retos for update to anon, authenticated using (true) with check (true);
create policy "borrado abierto" on public.retos for delete to anon, authenticated using (true);

-- Histórico de pesos. Sin login: la app es privada por oscuridad de URL.
create table if not exists public.registros (
  id bigint generated always as identity primary key,
  ejercicio text not null,
  peso numeric not null check (peso >= 0),
  reps integer,
  fecha date not null default current_date,
  created_at timestamptz not null default now()
);

create index if not exists registros_ejercicio_idx on public.registros (ejercicio, created_at desc);

alter table public.registros enable row level security;

-- ponytail: acceso abierto a anon porque no hay login; si algún día hay usuarios, cambiar por auth.uid().
create policy "lectura abierta" on public.registros for select to anon, authenticated using (true);
create policy "insercion abierta" on public.registros for insert to anon, authenticated with check (true);
create policy "borrado abierto" on public.registros for delete to anon, authenticated using (true);

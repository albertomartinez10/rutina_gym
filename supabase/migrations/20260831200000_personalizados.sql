-- Cambios que la usuaria hace sobre la rutina base del código:
-- filas con oculto=false son ejercicios añadidos, con oculto=true esconden uno base.
create table if not exists public.personalizados (
  id bigint generated always as identity primary key,
  dia smallint not null check (dia between 0 and 2),
  nombre text not null,
  series text not null default '3',
  reps text not null default '10-12',
  imagen text,
  oculto boolean not null default false,
  created_at timestamptz not null default now(),
  unique (dia, nombre)
);

alter table public.personalizados enable row level security;

create policy "lectura abierta" on public.personalizados for select to anon, authenticated using (true);
create policy "insercion abierta" on public.personalizados for insert to anon, authenticated with check (true);
create policy "borrado abierto" on public.personalizados for delete to anon, authenticated using (true);

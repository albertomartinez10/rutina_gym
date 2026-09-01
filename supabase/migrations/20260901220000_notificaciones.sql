-- Suscripciones push de cada móvil, para avisar al otro cuando entrena.
create table if not exists public.suscripciones (
  id bigint generated always as identity primary key,
  perfil text not null,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

alter table public.suscripciones enable row level security;
create policy "lectura abierta" on public.suscripciones for select to anon, authenticated using (true);
create policy "insercion abierta" on public.suscripciones for insert to anon, authenticated with check (true);
create policy "borrado abierto" on public.suscripciones for delete to anon, authenticated using (true);

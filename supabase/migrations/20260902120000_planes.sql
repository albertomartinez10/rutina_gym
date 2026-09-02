-- Lista de planes de los dos: compartida, no va por perfil.
create table if not exists public.planes (
  id bigint generated always as identity primary key,
  texto text not null check (length(trim(texto)) between 1 and 200),
  hecho boolean not null default false,
  hecho_por text,
  hecho_el timestamptz,
  orden integer not null default 0,
  created_at timestamptz not null default now()
);

alter table public.planes enable row level security;
create policy "lectura abierta" on public.planes for select to anon, authenticated using (true);
create policy "insercion abierta" on public.planes for insert to anon, authenticated with check (true);
create policy "cambio abierto" on public.planes for update to anon, authenticated using (true) with check (true);
create policy "borrado abierto" on public.planes for delete to anon, authenticated using (true);

-- La lista tal cual estaba, con lo ya tachado marcado como hecho.
insert into public.planes (texto, hecho, orden) values
  ('Ir a valhermoso', true, 1),
  ('Ir de paseo a la virgen', true, 2),
  ('Jugar a cartas', false, 3),
  ('Contar foto gala', true, 4),
  ('Visitar Moratalaz', false, 5),
  ('Amañar Bingo', false, 6),
  ('Río', true, 7),
  ('Visitar San Martín', false, 8),
  ('Carbonara', true, 9),
  ('Ver peli', false, 10),
  ('Estrellas', true, 11),
  ('Pin pon', false, 12),
  ('Chupito valhermoso', true, 13),
  ('Ir a Molina', false, 14),
  ('Ir a Zaorejas', true, 15),
  ('Siesta', true, 16),
  ('Pasodoble', false, 17),
  ('Siguiente fiesta (para que no se desgracie más...)', true, 18),
  ('Plan día completo', true, 19),
  ('Dormir juntos', true, 20),
  ('Cenar en el patio', false, 21),
  ('Probar percebes', false, 22),
  ('Ruta en bici', false, 23),
  ('Visitar el norte', false, 24),
  ('Ducharnos', false, 25),
  ('Zumba', false, 26),
  ('Comer torreznos', false, 27)
on conflict do nothing;

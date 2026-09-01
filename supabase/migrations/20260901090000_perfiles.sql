-- Nuria y Alberto comparten app: cada fila pertenece a un perfil.
-- Lo ya guardado era de Nuria, así que ese es el valor por defecto.
alter table public.registros add column if not exists perfil text not null default 'nuria';
alter table public.personalizados add column if not exists perfil text not null default 'nuria';

create index if not exists registros_perfil_idx on public.registros (perfil, ejercicio, created_at desc);

-- Cada uno puede ocultar o añadir el mismo ejercicio sin chocar con el otro.
alter table public.personalizados drop constraint if exists personalizados_dia_nombre_key;
alter table public.personalizados add constraint personalizados_perfil_dia_nombre_key unique (perfil, dia, nombre);

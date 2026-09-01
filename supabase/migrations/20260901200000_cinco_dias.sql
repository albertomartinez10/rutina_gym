-- Alberto entrena 5 días: el día ya no está limitado a los 3 de la rutina original.
alter table public.personalizados drop constraint if exists personalizados_dia_check;
alter table public.personalizados add constraint personalizados_dia_check check (dia between 0 and 6);

create policy "gymbro subir fotos" on storage.objects for insert to anon, authenticated with check (bucket_id = 'entrenos');
create policy "gymbro ver fotos" on storage.objects for select to anon, authenticated using (bucket_id = 'entrenos');
create policy "gymbro borrar fotos" on storage.objects for delete to anon, authenticated using (bucket_id = 'entrenos');

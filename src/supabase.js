import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
);

// Devuelve { ejercicio: [{fecha, peso, reps, id}, ...] }, lo más reciente primero.
export const traerHistorico = async (perfil) => {
  const { data, error } = await supabase
    .from("registros")
    .select("id, ejercicio, peso, reps, fecha")
    .eq("perfil", perfil)
    .order("created_at", { ascending: false });
  if (error) throw error;

  return data.reduce((acc, r) => {
    (acc[r.ejercicio] ||= []).push({ id: r.id, fecha: r.fecha, peso: String(r.peso), reps: r.reps ?? "" });
    return acc;
  }, {});
};

export const insertarRegistro = async (perfil, ejercicio, peso, reps) => {
  const { data, error } = await supabase
    .from("registros")
    .insert({ perfil, ejercicio, peso: Number(peso), reps: reps ? Number(reps) : null })
    .select("id, fecha")
    .single();
  if (error) throw error;
  return data;
};

export const borrarRegistro = async (id) => {
  const { error } = await supabase.from("registros").delete().eq("id", id);
  if (error) throw error;
};

export const traerPersonalizados = async (perfil) => {
  const { data, error } = await supabase
    .from("personalizados")
    .select("id, dia, nombre, series, reps, imagen, oculto")
    .eq("perfil", perfil)
    .order("created_at");
  if (error) throw error;
  return data;
};

export const anadirEjercicio = async (perfil, dia, nombre, series, reps) => {
  const { data, error } = await supabase
    .from("personalizados")
    .insert({ perfil, dia, nombre, series, reps, oculto: false })
    .select("id, dia, nombre, series, reps, imagen, oculto")
    .single();
  if (error) throw error;
  return data;
};

export const ocultarEjercicio = async (perfil, dia, nombre) => {
  const { data, error } = await supabase
    .from("personalizados")
    .insert({ perfil, dia, nombre, oculto: true })
    .select("id, dia, nombre, series, reps, imagen, oculto")
    .single();
  if (error) throw error;
  return data;
};

// Quita la fila: devuelve un ejercicio base a la vista, o borra uno añadido.
export const quitarPersonalizado = async (id) => {
  const { error } = await supabase.from("personalizados").delete().eq("id", id);
  if (error) throw error;
};

export const traerEntrenos = async (perfil) => {
  const { data, error } = await supabase
    .from("entrenos")
    .select("id, fecha, foto, nota")
    .eq("perfil", perfil)
    .order("fecha", { ascending: false });
  if (error) throw error;
  return data;
};

export const urlFoto = (ruta) =>
  ruta ? supabase.storage.from("entrenos").getPublicUrl(ruta).data.publicUrl : null;

// Sube la foto al bucket y deja la fila del entreno apuntando a ella.
export const guardarEntreno = async (perfil, fecha, archivo, nota) => {
  let ruta = null;
  if (archivo) {
    ruta = `${perfil}/${fecha}-${Date.now()}-${archivo.name.replace(/[^\w.-]/g, "_")}`;
    const { error } = await supabase.storage.from("entrenos").upload(ruta, archivo);
    if (error) throw error;
  }

  const { data, error } = await supabase
    .from("entrenos")
    .insert({ perfil, fecha, foto: ruta, nota: nota || null })
    .select("id, fecha, foto, nota")
    .single();
  if (error) throw error;
  return data;
};

export const borrarEntreno = async (id, ruta) => {
  if (ruta) await supabase.storage.from("entrenos").remove([ruta]);
  const { error } = await supabase.from("entrenos").delete().eq("id", id);
  if (error) throw error;
};

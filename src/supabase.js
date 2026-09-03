import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
);

// Devuelve { ejercicio: [{fecha, peso, reps, id}, ...] }, lo más reciente primero.
export const traerHistorico = async (perfil) => {
  const { data, error } = await supabase
    .from("registros")
    .select("id, ejercicio, peso, reps, fecha, nota, calentamiento")
    .eq("perfil", perfil)
    .order("created_at", { ascending: false });
  if (error) throw error;

  return data.reduce((acc, r) => {
    (acc[r.ejercicio] ||= []).push({ id: r.id, fecha: r.fecha, peso: String(r.peso), reps: r.reps ?? "" });
    return acc;
  }, {});
};

export const insertarRegistro = async (perfil, ejercicio, peso, reps, nota, calentamiento = false) => {
  const { data, error } = await supabase
    .from("registros")
    .insert({ perfil, ejercicio, peso: Number(peso), reps: reps ? Number(reps) : null, nota: nota || null, calentamiento })
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

export const anadirEjercicio = async (perfil, dia, nombre, series, reps, imagen = null) => {
  const { data, error } = await supabase
    .from("personalizados")
    .insert({ perfil, dia, nombre, series, reps, imagen, oculto: false })
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

// Sin filtrar por perfil: cada uno ve las fotos del otro, que de eso se trata.
export const traerEntrenos = async () => {
  const { data, error } = await supabase
    .from("entrenos")
    .select("id, perfil, fecha, foto, nota, tipo, reacciones(id, perfil, emoji), comentarios(id, perfil, texto, created_at)")
    .order("fecha", { ascending: false });
  if (error) throw error;
  return data;
};

export const reaccionar = async (entrenoId, perfil, emoji) => {
  const { data, error } = await supabase
    .from("reacciones")
    .insert({ entreno_id: entrenoId, perfil, emoji })
    .select("id, perfil, emoji")
    .single();
  if (error) throw error;
  return data;
};

export const comentar = async (entrenoId, perfil, texto) => {
  const { data, error } = await supabase
    .from("comentarios")
    .insert({ entreno_id: entrenoId, perfil, texto: texto.trim() })
    .select("id, perfil, texto, created_at")
    .single();
  if (error) throw error;
  return data;
};

export const borrarComentario = async (id) => {
  const { error } = await supabase.from("comentarios").delete().eq("id", id);
  if (error) throw error;
};

export const quitarReaccion = async (id) => {
  const { error } = await supabase.from("reacciones").delete().eq("id", id);
  if (error) throw error;
};

export const urlFoto = (ruta) =>
  ruta ? supabase.storage.from("entrenos").getPublicUrl(ruta).data.publicUrl : null;

// Sube la foto al bucket y deja la fila del entreno apuntando a ella.
export const guardarEntreno = async (perfil, fecha, archivo, nota, tipo = "entreno") => {
  let ruta = null;
  if (archivo) {
    ruta = `${perfil}/${fecha}-${Date.now()}-${archivo.name.replace(/[^\w.-]/g, "_")}`;
    const { error } = await supabase.storage.from("entrenos").upload(ruta, archivo);
    if (error) throw error;
  }

  const { data, error } = await supabase
    .from("entrenos")
    .insert({ perfil, fecha, foto: ruta, nota: nota || null, tipo })
    .select("id, perfil, fecha, foto, nota, tipo")
    .single();
  if (error) throw error;
  return data;
};

export const borrarEntreno = async (id, ruta) => {
  if (ruta) await supabase.storage.from("entrenos").remove([ruta]);
  const { error } = await supabase.from("entrenos").delete().eq("id", id);
  if (error) throw error;
};

// Todos los registros de los dos perfiles, para el marcador comparativo.
export const traerTodo = async () => {
  const { data, error } = await supabase
    .from("registros")
    .select("perfil, ejercicio, peso, reps, fecha")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
};

export const traerPlanes = async () => {
  const { data, error } = await supabase
    .from("planes")
    .select("id, texto, hecho, hecho_por, orden")
    .order("orden");
  if (error) throw error;
  return data;
};

export const anadirPlan = async (texto, orden) => {
  const { data, error } = await supabase
    .from("planes")
    .insert({ texto: texto.trim(), orden })
    .select("id, texto, hecho, hecho_por, orden")
    .single();
  if (error) throw error;
  return data;
};

export const marcarPlan = async (id, hecho, perfil) => {
  const { error } = await supabase
    .from("planes")
    .update({ hecho, hecho_por: hecho ? perfil : null, hecho_el: hecho ? new Date().toISOString() : null })
    .eq("id", id);
  if (error) throw error;
};

export const borrarPlan = async (id) => {
  const { error } = await supabase.from("planes").delete().eq("id", id);
  if (error) throw error;
};

export const editarRegistro = async (id, peso, reps) => {
  const { error } = await supabase
    .from("registros")
    .update({ peso: Number(peso), reps: reps ? Number(reps) : null })
    .eq("id", id);
  if (error) throw error;
};

// Vuelve a meter un registro borrado por error (deshacer).
export const restaurarRegistro = async (perfil, r) => {
  const { data, error } = await supabase
    .from("registros")
    .insert({
      perfil,
      ejercicio: r.ejercicio,
      peso: Number(r.peso),
      reps: r.reps ? Number(r.reps) : null,
      nota: r.nota || null,
      fecha: r.fecha,
      calentamiento: Boolean(r.calentamiento),
    })
    .select("id, fecha")
    .single();
  if (error) throw error;
  return data;
};

export const traerMedidas = async (perfil) => {
  const { data, error } = await supabase
    .from("medidas")
    .select("id, fecha, peso, nota")
    .eq("perfil", perfil)
    .order("fecha", { ascending: false });
  if (error) throw error;
  return data;
};

// Una medida por día: si ya hay una de hoy, se pisa.
export const guardarMedida = async (perfil, fecha, peso) => {
  const { data, error } = await supabase
    .from("medidas")
    .upsert({ perfil, fecha, peso: Number(peso) }, { onConflict: "perfil,fecha" })
    .select("id, fecha, peso")
    .single();
  if (error) throw error;
  return data;
};

export const borrarMedida = async (id) => {
  const { error } = await supabase.from("medidas").delete().eq("id", id);
  if (error) throw error;
};

export const traerReto = async (semana) => {
  const { data, error } = await supabase.from("retos").select("*").eq("semana", semana).maybeSingle();
  if (error) throw error;
  return data;
};

export const guardarReto = async (semana, texto, apuesta) => {
  const { data, error } = await supabase
    .from("retos")
    .upsert({ semana, texto, apuesta }, { onConflict: "semana" })
    .select("*")
    .single();
  if (error) throw error;
  return data;
};

export const borrarReto = async (semana) => {
  const { error } = await supabase.from("retos").delete().eq("semana", semana);
  if (error) throw error;
};

import { createClient } from "@supabase/supabase-js";

export const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
);

// Devuelve { ejercicio: [{fecha, peso, reps, id}, ...] }, lo más reciente primero.
export const traerHistorico = async () => {
  const { data, error } = await supabase
    .from("registros")
    .select("id, ejercicio, peso, reps, fecha")
    .order("created_at", { ascending: false });
  if (error) throw error;

  return data.reduce((acc, r) => {
    (acc[r.ejercicio] ||= []).push({ id: r.id, fecha: r.fecha, peso: String(r.peso), reps: r.reps ?? "" });
    return acc;
  }, {});
};

export const insertarRegistro = async (ejercicio, peso, reps) => {
  const { data, error } = await supabase
    .from("registros")
    .insert({ ejercicio, peso: Number(peso), reps: reps ? Number(reps) : null })
    .select("id, fecha")
    .single();
  if (error) throw error;
  return data;
};

export const borrarRegistro = async (id) => {
  const { error } = await supabase.from("registros").delete().eq("id", id);
  if (error) throw error;
};

export const traerPersonalizados = async () => {
  const { data, error } = await supabase
    .from("personalizados")
    .select("id, dia, nombre, series, reps, imagen, oculto")
    .order("created_at");
  if (error) throw error;
  return data;
};

export const anadirEjercicio = async (dia, nombre, series, reps) => {
  const { data, error } = await supabase
    .from("personalizados")
    .insert({ dia, nombre, series, reps, oculto: false })
    .select("id, dia, nombre, series, reps, imagen, oculto")
    .single();
  if (error) throw error;
  return data;
};

export const ocultarEjercicio = async (dia, nombre) => {
  const { data, error } = await supabase
    .from("personalizados")
    .insert({ dia, nombre, oculto: true })
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

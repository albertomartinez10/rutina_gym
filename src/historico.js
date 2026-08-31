// ponytail: localStorage basta para una app de una persona; backend solo si quiere sincronizar entre móviles.
export const KEY = "gymbro-historico";

export const cargar = () => {
  try {
    return JSON.parse(localStorage.getItem(KEY)) || {};
  } catch {
    return {};
  }
};

export const guardar = (historico) => localStorage.setItem(KEY, JSON.stringify(historico));

export const hoy = () => new Date().toISOString().slice(0, 10);
export const fechaCorta = (iso) => iso.split("-").reverse().slice(0, 2).join("/");

// extra lleva lo que devuelve el servidor (id, fecha real) cuando el guardado remoto va bien.
export const apuntar = (historico, nombre, peso, reps, extra = {}) => {
  if (!peso) return historico;
  return {
    ...historico,
    [nombre]: [{ fecha: hoy(), peso, reps, ...extra }, ...(historico[nombre] || [])].slice(0, 50),
  };
};

export const borrar = (historico, nombre, i) => ({
  ...historico,
  [nombre]: (historico[nombre] || []).filter((_, j) => j !== i),
});

export const HECHOS = "gymbro-hechos";

// Ejercicios marcados como hechos HOY; al cambiar de día se vacía solo.
export const cargarHechos = () => {
  try {
    const d = JSON.parse(localStorage.getItem(HECHOS));
    return d && d.fecha === hoy() ? d.nombres : [];
  } catch {
    return [];
  }
};

export const guardarHechos = (nombres) =>
  localStorage.setItem(HECHOS, JSON.stringify({ fecha: hoy(), nombres }));

export const alternar = (nombres, nombre) =>
  nombres.includes(nombre) ? nombres.filter((n) => n !== nombre) : [...nombres, nombre];

// Diferencia con el registro anterior del mismo ejercicio (null si es el primero).
export const delta = (registros, peso) => {
  const previo = registros[0];
  if (!previo) return null;
  return Math.round((Number(peso) - Number(previo.peso)) * 10) / 10;
};

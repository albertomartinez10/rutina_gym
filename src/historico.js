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

export const SERIES = "gymbro-series";

// Series marcadas HOY, por ejercicio: { "Sentadilla": 3 }. Se vacía al cambiar de día.
export const cargarSeries = () => {
  try {
    const d = JSON.parse(localStorage.getItem(SERIES));
    return d && d.fecha === hoy() ? d.series : {};
  } catch {
    return {};
  }
};

export const guardarSeries = (series) =>
  localStorage.setItem(SERIES, JSON.stringify({ fecha: hoy(), series }));

// Toca la serie i: si ya estaba marcada la desmarca (y las siguientes), si no marca hasta ella.
export const marcarSerie = (series, nombre, i) => ({
  ...series,
  [nombre]: (series[nombre] || 0) === i + 1 ? i : i + 1,
});

// Días seguidos entrenando contando hacia atrás desde hoy (o ayer, si hoy aún no ha tocado).
export const racha = (historico, desde = new Date()) => {
  const dias = new Set(Object.values(historico).flat().map((r) => r.fecha));
  if (!dias.size) return 0;

  const iso = (d) => d.toISOString().slice(0, 10);
  const cursor = new Date(desde);
  if (!dias.has(iso(cursor))) cursor.setDate(cursor.getDate() - 1);

  let total = 0;
  while (dias.has(iso(cursor))) {
    total++;
    cursor.setDate(cursor.getDate() - 1);
  }
  return total;
};

// Pesos en orden cronológico (antiguo → nuevo) para dibujar la progresión.
export const progresion = (registros, max = 10) =>
  registros
    .slice(0, max)
    .map((r) => Number(r.peso))
    .filter((n) => !Number.isNaN(n))
    .reverse();

// Mezcla la rutina del código con lo que la usuaria añadió o escondió.
export const rutinaFinal = (base, personalizados, dia) => {
  const delDia = personalizados.filter((p) => p.dia === dia);
  const ocultos = new Set(delDia.filter((p) => p.oculto).map((p) => p.nombre));
  return [
    ...base[dia].ejercicios.filter((e) => !ocultos.has(e.nombre)),
    ...delDia.filter((p) => !p.oculto),
  ];
};

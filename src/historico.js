// ponytail: localStorage basta para una app de una persona; backend solo si quiere sincronizar entre móviles.
export const KEY = "gymbro-historico";

// Una copia local por perfil: si no, el histórico de uno taparía el del otro.
const claveDe = (perfil) => `${KEY}-${perfil}`;

export const cargar = (perfil) => {
  try {
    return JSON.parse(localStorage.getItem(claveDe(perfil))) || {};
  } catch {
    return {};
  }
};

export const guardar = (perfil, historico) =>
  localStorage.setItem(claveDe(perfil), JSON.stringify(historico));

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
export const cargarHechos = (perfil) => {
  try {
    const d = JSON.parse(localStorage.getItem(`${HECHOS}-${perfil}`));
    return d && d.fecha === hoy() ? d.nombres : [];
  } catch {
    return [];
  }
};

export const guardarHechos = (perfil, nombres) =>
  localStorage.setItem(`${HECHOS}-${perfil}`, JSON.stringify({ fecha: hoy(), nombres }));

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
export const cargarSeries = (perfil) => {
  try {
    const d = JSON.parse(localStorage.getItem(`${SERIES}-${perfil}`));
    return d && d.fecha === hoy() ? d.series : {};
  } catch {
    return {};
  }
};

export const guardarSeries = (perfil, series) =>
  localStorage.setItem(`${SERIES}-${perfil}`, JSON.stringify({ fecha: hoy(), series }));

// Toca la serie i: si ya estaba marcada la desmarca (y las siguientes), si no marca hasta ella.
export const marcarSerie = (series, nombre, i) => ({
  ...series,
  [nombre]: (series[nombre] || 0) === i + 1 ? i : i + 1,
});

// Días seguidos entrenando contando hacia atrás desde hoy (o ayer, si hoy aún no ha tocado).
export const racha = (dias, desde = new Date()) => {
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

// Rejilla del mes: 6 semanas de lunes a domingo, con null en los huecos.
export const semanasDelMes = (ano, mes) => {
  const primero = new Date(Date.UTC(ano, mes, 1));
  const dias = new Date(Date.UTC(ano, mes + 1, 0)).getUTCDate();
  const hueco = (primero.getUTCDay() + 6) % 7; // lunes = 0

  const celdas = [
    ...Array(hueco).fill(null),
    ...Array.from({ length: dias }, (_, i) => `${ano}-${String(mes + 1).padStart(2, "0")}-${String(i + 1).padStart(2, "0")}`),
  ];
  while (celdas.length % 7) celdas.push(null);

  return Array.from({ length: celdas.length / 7 }, (_, i) => celdas.slice(i * 7, i * 7 + 7));
};

// Días con algo apuntado: pesos o entrenos con foto.
export const diasEntrenados = (historico, entrenos = []) =>
  new Set([
    ...Object.values(historico).flat().map((r) => r.fecha),
    ...entrenos.map((e) => e.fecha),
  ]);

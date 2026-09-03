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
export const ahoraMs = () => Date.now();
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

// Una fila por serie, cada una con su peso: rara vez se hacen las 4 con el mismo.
export const filasDe = (series, cuantas, ultimoPeso = "", ultimasReps = "") =>
  Array.from(
    { length: cuantas },
    (_, i) => series?.[i] ?? { peso: ultimoPeso, reps: ultimasReps, hecha: false, calentamiento: false },
  );

export const cambiarFila = (filas, i, cambios) =>
  filas.map((f, j) => (j === i ? { ...f, ...cambios } : f));

export const seriesHechas = (filas) => filas.filter((f) => f.hecha).length;

// Al desmarcar una serie hecha hay que poder recuperar su registro para borrarlo.
export const filaConRegistro = (filas, i, registro) => cambiarFila(filas, i, { hecha: true, registro });

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

// Un punto por día con el mejor peso de esa jornada: si haces 4 series,
// la gráfica no debe dar 4 saltos, sino marcar tu tope del día.
export const progresion = (registros, max = 10) => {
  const porDia = registros.reduce((acc, r) => {
    const p = Number(r.peso);
    if (Number.isNaN(p)) return acc;
    acc[r.fecha] = Math.max(acc[r.fecha] ?? 0, p);
    return acc;
  }, {});

  return Object.keys(porDia)
    .sort()
    .slice(-max)
    .map((f) => porDia[f]);
};

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

// Rejilla anual estilo GitHub: una columna por semana (lunes arriba),
// con null en los días que caen fuera del año.
export const columnasDelAno = (ano) => {
  const iso = (d) => d.toISOString().slice(0, 10);
  const inicio = new Date(Date.UTC(ano, 0, 1));
  inicio.setUTCDate(inicio.getUTCDate() - ((inicio.getUTCDay() + 6) % 7)); // retrocede al lunes

  const columnas = [];
  const cursor = new Date(inicio);
  while (cursor.getUTCFullYear() <= ano) {
    const semana = Array.from({ length: 7 }, () => {
      const f = cursor.getUTCFullYear() === ano ? iso(cursor) : null;
      cursor.setUTCDate(cursor.getUTCDate() + 1);
      return f;
    });
    columnas.push(semana);
    if (cursor.getUTCFullYear() > ano) break;
  }
  return columnas;
};

// En qué columna empieza cada mes, para colocar las etiquetas.
export const inicioDeMeses = (columnas) =>
  columnas.reduce((acc, semana, i) => {
    semana.forEach((f) => {
      if (f?.endsWith("-01")) acc[Number(f.slice(5, 7)) - 1] = i;
    });
    return acc;
  }, {});

// Volumen de una serie: lo que Hevy llama tonelaje (kg movidos).
export const volumen = (registros, fecha) =>
  registros
    .filter((r) => (!fecha || r.fecha === fecha) && !r.calentamiento)
    .reduce((t, r) => t + Number(r.peso || 0) * Number(r.reps || 0), 0);

// Volumen de todos los ejercicios de un día.
export const volumenDia = (historico, fecha) =>
  Object.values(historico).reduce((t, regs) => t + volumen(regs, fecha), 0);

// ¿Es el mejor peso que ha levantado nunca en ese ejercicio?
// El calentamiento no cuenta: si no, dos platos de aproximación regalarían récords.
export const esRecord = (registros, peso) => {
  const buenos = registros.filter((r) => !r.calentamiento);
  return buenos.length > 0 && Number(peso) > Math.max(...buenos.map((r) => Number(r.peso) || 0));
};

// 1RM estimado por la fórmula de Epley; con 1 repetición es el propio peso.
export const unaRepeticionMaxima = (peso, reps) => {
  const p = Number(peso);
  const r = Number(reps);
  if (!p || !r || r < 1) return null;
  return Math.round(p * (1 + r / 30) * 10) / 10;
};

// El mejor 1RM estimado del histórico de un ejercicio.
export const mejorEstimado = (registros) =>
  registros.reduce((max, r) => Math.max(max, unaRepeticionMaxima(r.peso, r.reps) || 0), 0) || null;

export const COLA = "gymbro-pendientes";

// Lo que no se ha podido subir por falta de cobertura, esperando a que vuelva.
export const cargarCola = () => {
  try {
    return JSON.parse(localStorage.getItem(COLA)) || [];
  } catch {
    return [];
  }
};

export const guardarCola = (cola) => localStorage.setItem(COLA, JSON.stringify(cola));

export const encolar = (cola, registro) => [...cola, registro];

export const desencolar = (cola, registro) =>
  cola.filter((p) => !(p.perfil === registro.perfil && p.tmp === registro.tmp));

// Mezcla lo que vino del servidor con lo que aún está pendiente de subir,
// para que un peso apuntado sin cobertura no desaparezca al recargar.
export const fusionar = (remoto, pendientes) =>
  pendientes.reduce(
    (acc, p) => ({
      ...acc,
      [p.ejercicio]: [
        { fecha: p.fecha, peso: p.peso, reps: p.reps, nota: p.nota, tmp: p.tmp },
        ...(acc[p.ejercicio] || []),
      ],
    }),
    { ...remoto },
  );

export const SESION = "gymbro-sesion";

// Hora a la que empezó el entreno de hoy, para saber cuánto ha durado.
export const cargarSesion = (perfil) => {
  try {
    const d = JSON.parse(localStorage.getItem(`${SESION}-${perfil}`));
    return d && d.fecha === hoy() ? d.inicio : null;
  } catch {
    return null;
  }
};

export const guardarSesion = (perfil, inicio) =>
  localStorage.setItem(`${SESION}-${perfil}`, JSON.stringify({ fecha: hoy(), inicio }));

export const duracion = (inicio, ahora = Date.now()) => {
  if (!inicio) return null;
  const minutos = Math.max(0, Math.round((ahora - inicio) / 60000));
  return minutos < 60 ? `${minutos} min` : `${Math.floor(minutos / 60)} h ${minutos % 60} min`;
};

// Los ejercicios en los que hoy has batido tu récord anterior.
export const recordsDelDia = (historico, fecha) =>
  Object.entries(historico)
    .map(([ejercicio, regs]) => {
      const deHoy = regs.filter((r) => r.fecha === fecha);
      const antiguos = regs.filter((r) => r.fecha !== fecha);
      if (!deHoy.length || !antiguos.length) return null;
      const mejorHoy = Math.max(...deHoy.map((r) => Number(r.peso) || 0));
      const mejorAntes = Math.max(...antiguos.map((r) => Number(r.peso) || 0));
      return mejorHoy > mejorAntes ? { ejercicio, peso: mejorHoy, anterior: mejorAntes } : null;
    })
    .filter(Boolean);

export const FIN = "gymbro-fin";

// Marca de "entreno terminado" de hoy, para poder cerrarlo sin hacerlo todo.
export const cargarFin = (perfil) => {
  try {
    const d = JSON.parse(localStorage.getItem(`${FIN}-${perfil}`));
    return d && d.fecha === hoy() ? d.fin : null;
  } catch {
    return null;
  }
};

export const guardarFin = (perfil, fin) =>
  localStorage.setItem(`${FIN}-${perfil}`, JSON.stringify({ fecha: hoy(), fin }));

// Lo que hizo el último día que tocó ese ejercicio, serie a serie y en orden.
// Es la columna "anterior": sirve de referencia para saber qué poner hoy.
export const seriesAnteriores = (registros, fecha = hoy()) => {
  const otroDia = registros.find((r) => r.fecha !== fecha)?.fecha;
  if (!otroDia) return [];
  return registros.filter((r) => r.fecha === otroDia).reverse();
};

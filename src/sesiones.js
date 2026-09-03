import { volumen, unaRepeticionMaxima } from "./historico.js";
import { CATALOGO } from "./catalogo.js";

// Todo lo que se hizo un día concreto, agrupado por ejercicio.
export const sesionDe = (historico, fecha) => {
  const ejercicios = Object.entries(historico)
    .map(([nombre, regs]) => ({ nombre, series: regs.filter((r) => r.fecha === fecha) }))
    .filter((e) => e.series.length > 0);

  const todas = ejercicios.flatMap((e) => e.series);
  return {
    fecha,
    ejercicios,
    totalSeries: todas.length,
    volumen: Math.round(volumen(todas.filter((r) => !r.calentamiento))),
  };
};

// Los días con algo apuntado, del más reciente al más antiguo.
export const diasConSesion = (historico) =>
  [...new Set(Object.values(historico).flat().map((r) => r.fecha))].sort().reverse();

// Sugerencia de peso para hoy: si la última vez completaste el rango alto
// de repeticiones, toca subir; si no, repetir el mismo peso.
export const sugerencia = (registros, repsObjetivo, fecha) => {
  const previos = registros.filter((r) => r.fecha !== fecha && !r.calentamiento);
  if (!previos.length) return null;

  const ultimoDia = previos[0].fecha;
  const delDia = previos.filter((r) => r.fecha === ultimoDia);
  const peso = Math.max(...delDia.map((r) => Number(r.peso) || 0));
  const repsMax = Number(String(repsObjetivo).split("-").pop());

  const cumplioTodas =
    Boolean(repsMax) && delDia.every((r) => Number(r.reps) >= repsMax) && delDia.length > 1;

  return {
    peso: cumplioTodas ? Math.round((peso + 2.5) * 10) / 10 : peso,
    subir: cumplioTodas,
    anterior: peso,
  };
};

const GRUPO_DE = CATALOGO.reduce((acc, e) => ({ ...acc, [e.nombre]: e.grupo }), {});

// Series efectivas por grupo muscular en un rango de fechas.
export const volumenPorGrupo = (historico, desde, hasta) =>
  Object.entries(historico).reduce((acc, [nombre, regs]) => {
    const cuantas = regs.filter(
      (r) => !r.calentamiento && r.fecha >= desde && r.fecha <= hasta,
    ).length;
    if (!cuantas) return acc;
    const grupo = GRUPO_DE[nombre] ?? "otros";
    return { ...acc, [grupo]: (acc[grupo] ?? 0) + cuantas };
  }, {});

// Todos los récords, el mejor de cada ejercicio, con su fecha.
export const records = (historico) =>
  Object.entries(historico)
    .map(([ejercicio, regs]) => {
      const buenos = regs.filter((r) => !r.calentamiento && Number(r.peso) > 0);
      if (!buenos.length) return null;
      const mejor = buenos.reduce((a, b) => (Number(b.peso) > Number(a.peso) ? b : a));
      return {
        ejercicio,
        peso: Number(mejor.peso),
        reps: mejor.reps,
        fecha: mejor.fecha,
        estimado: unaRepeticionMaxima(mejor.peso, mejor.reps),
      };
    })
    .filter(Boolean)
    .sort((a, b) => b.fecha.localeCompare(a.fecha));

// Qué hacías hace un año (o hace meses) el mismo día.
export const recuerdo = (historico, hoyISO) => {
  const [a, m, d] = hoyISO.split("-").map(Number);
  for (const atras of [1, 2, 3]) {
    const fecha = `${a - atras}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    const s = sesionDe(historico, fecha);
    if (s.ejercicios.length) return { ...s, hace: atras };
  }
  return null;
};

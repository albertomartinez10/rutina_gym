import { racha, diasEntrenados, volumen } from "./historico.js";
import { logros } from "./logros.js";

const delMes = (fecha, ano, mes) => fecha.startsWith(`${ano}-${String(mes + 1).padStart(2, "0")}`);

// Agrupa las filas planas del servidor por perfil y ejercicio.
export const porPerfil = (filas) =>
  filas.reduce((acc, r) => {
    acc[r.perfil] ||= {};
    (acc[r.perfil][r.ejercicio] ||= []).push({
      fecha: r.fecha,
      peso: String(r.peso),
      reps: r.reps ?? "",
    });
    return acc;
  }, {});

// Lo que se compara en el marcador del mes.
export const resumenDe = (historico, entrenos, perfil, ano, mes) => {
  const suyos = entrenos.filter((e) => e.perfil === perfil);
  const dias = diasEntrenados(historico, suyos);

  return {
    dias: [...dias].filter((f) => delMes(f, ano, mes)).length,
    racha: racha(dias),
    medallas: logros(historico, perfil).length,
    volumen: Math.round(
      Object.values(historico).reduce(
        (t, regs) => t + volumen(regs.filter((r) => delMes(r.fecha, ano, mes))),
        0,
      ),
    ),
  };
};

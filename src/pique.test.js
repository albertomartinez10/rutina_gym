import test from "node:test";
import assert from "node:assert/strict";
import { porPerfil, resumenDe } from "./pique.js";

const filas = [
  { perfil: "nuria", ejercicio: "Prensa", peso: 60, reps: 10, fecha: "2026-09-01" },
  { perfil: "nuria", ejercicio: "Prensa", peso: 55, reps: 10, fecha: "2026-08-20" },
  { perfil: "alberto", ejercicio: "Prensa", peso: 200, reps: 10, fecha: "2026-09-01" },
];

test("porPerfil separa los registros de cada uno", () => {
  const r = porPerfil(filas);
  assert.equal(r.nuria.Prensa.length, 2);
  assert.equal(r.alberto.Prensa.length, 1);
});

test("porPerfil deja los pesos como texto, igual que el resto de la app", () => {
  assert.equal(porPerfil(filas).nuria.Prensa[0].peso, "60");
});

test("resumenDe cuenta solo los dias del mes pedido", () => {
  const h = porPerfil(filas).nuria;
  assert.equal(resumenDe(h, [], "nuria", 2026, 8).dias, 1, "septiembre");
  assert.equal(resumenDe(h, [], "nuria", 2026, 7).dias, 1, "agosto");
});

test("el volumen del mes no arrastra meses anteriores", () => {
  const h = porPerfil(filas).nuria;
  assert.equal(resumenDe(h, [], "nuria", 2026, 8).volumen, 600);
});

test("los dias marcados sin pesos tambien cuentan", () => {
  const r = resumenDe({}, [{ perfil: "nuria", fecha: "2026-09-05" }], "nuria", 2026, 8);
  assert.equal(r.dias, 1);
});

test("no se cuelan los entrenos del otro perfil", () => {
  const r = resumenDe({}, [{ perfil: "alberto", fecha: "2026-09-05" }], "nuria", 2026, 8);
  assert.equal(r.dias, 0);
});

test("cada uno cuenta medallas con su propia escala", () => {
  const datos = porPerfil(filas);
  // 60 kg en prensa: para Nuria es una medalla alta, para Alberto ninguna
  assert.ok(resumenDe(datos.nuria, [], "nuria", 2026, 8).medallas > 0);
  assert.equal(resumenDe({ Prensa: [{ peso: "60", fecha: "2026-09-01" }] }, [], "alberto", 2026, 8).medallas, 0);
});

test("un perfil sin nada da ceros, no errores", () => {
  assert.deepEqual(resumenDe({}, [], "nuria", 2026, 8), { dias: 0, racha: 0, medallas: 0, volumen: 0 });
});

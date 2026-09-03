import test from "node:test";
import assert from "node:assert/strict";
import { sesionDe, diasConSesion, sugerencia, volumenPorGrupo, records, recuerdo } from "./sesiones.js";

const h = {
  Prensa: [
    { peso: "100", reps: "10", fecha: "2026-09-02" },
    { peso: "100", reps: "10", fecha: "2026-09-02" },
    { peso: "40", reps: "12", fecha: "2026-09-02", calentamiento: true },
    { peso: "95", reps: "10", fecha: "2026-08-26" },
  ],
  "Curl martillo": [{ peso: "10", reps: "12", fecha: "2026-09-02" }],
};

test("sesionDe junta lo hecho ese dia", () => {
  const s = sesionDe(h, "2026-09-02");
  assert.equal(s.ejercicios.length, 2);
  assert.equal(s.totalSeries, 4);
});

test("el calentamiento no suma al volumen", () => {
  // 100x10 + 100x10 + 10x12 = 2120; los 40x12 de calentamiento quedan fuera
  assert.equal(sesionDe(h, "2026-09-02").volumen, 2120);
});

test("un dia sin nada devuelve sesion vacia", () => {
  assert.deepEqual(sesionDe(h, "2020-01-01").ejercicios, []);
});

test("diasConSesion ordena del mas nuevo al mas viejo", () => {
  assert.deepEqual(diasConSesion(h), ["2026-09-02", "2026-08-26"]);
});

test("sugerencia sube el peso si completaste todas las repeticiones", () => {
  const s = sugerencia(h["Prensa"], "8-10", "2026-09-03");
  assert.equal(s.anterior, 100);
  assert.equal(s.peso, 102.5);
  assert.equal(s.subir, true);
});

test("sugerencia repite peso si no llegaste al tope", () => {
  const regs = [
    { peso: "60", reps: "8", fecha: "2026-09-02" },
    { peso: "60", reps: "6", fecha: "2026-09-02" },
  ];
  const s = sugerencia(regs, "8-10", "2026-09-03");
  assert.equal(s.peso, 60);
  assert.equal(s.subir, false);
});

test("sugerencia no inventa nada la primera vez", () => {
  assert.equal(sugerencia([], "10", "2026-09-03"), null);
});

test("sugerencia ignora lo apuntado hoy", () => {
  const regs = [{ peso: "80", reps: "10", fecha: "2026-09-03" }];
  assert.equal(sugerencia(regs, "10", "2026-09-03"), null);
});

test("volumenPorGrupo cuenta series efectivas por musculo", () => {
  const v = volumenPorGrupo(h, "2026-09-01", "2026-09-07");
  assert.equal(v.pierna, 2, "las dos de prensa, sin el calentamiento");
  assert.equal(v.biceps, 1);
});

test("volumenPorGrupo respeta el rango de fechas", () => {
  assert.deepEqual(volumenPorGrupo(h, "2026-08-24", "2026-08-30"), { pierna: 1 });
});

test("records da el mejor peso de cada ejercicio", () => {
  const r = records(h);
  assert.equal(r.find((x) => x.ejercicio === "Prensa").peso, 100);
  assert.ok(r.find((x) => x.ejercicio === "Prensa").estimado > 100);
});

test("records ignora las series de calentamiento", () => {
  const solo = { X: [{ peso: "200", fecha: "2026-09-01", calentamiento: true }, { peso: "50", reps: "5", fecha: "2026-09-01" }] };
  assert.equal(records(solo)[0].peso, 50);
});

test("recuerdo encuentra el mismo dia de hace un ano", () => {
  const viejo = { Prensa: [{ peso: "60", reps: "10", fecha: "2025-09-03" }] };
  const r = recuerdo(viejo, "2026-09-03");
  assert.equal(r.hace, 1);
  assert.equal(r.ejercicios.length, 1);
});

test("recuerdo devuelve null si no hay nada ese dia", () => {
  assert.equal(recuerdo(h, "2026-09-03"), null);
});

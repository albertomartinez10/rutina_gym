// node --test src/
import test from "node:test";
import assert from "node:assert/strict";
import {
  cargar, guardar, apuntar, borrar, hoy, fechaCorta, KEY,
  delta, alternar, cargarHechos, guardarHechos, HECHOS,
  marcarSerie, racha, progresion, rutinaFinal,
} from "./historico.js";
import { fraseDelDia } from "./frases.js";

const fakeStorage = () => {
  const datos = new Map();
  globalThis.localStorage = {
    getItem: (k) => (datos.has(k) ? datos.get(k) : null),
    setItem: (k, v) => datos.set(k, String(v)),
  };
  return datos;
};

test("apunta un peso y lo deja el primero", () => {
  const h = apuntar({}, "Sentadilla", "60", "10");
  assert.deepEqual(h["Sentadilla"], [{ fecha: hoy(), peso: "60", reps: "10" }]);
});

test("el más reciente queda arriba y no pisa los anteriores", () => {
  let h = apuntar({}, "Prensa", "80", "12");
  h = apuntar(h, "Prensa", "85", "10");
  assert.equal(h["Prensa"].length, 2);
  assert.equal(h["Prensa"][0].peso, "85");
  assert.equal(h["Prensa"][1].peso, "80");
});

test("sin peso no guarda nada", () => {
  assert.deepEqual(apuntar({}, "Zancadas", "", "10"), {});
});

test("no mezcla ejercicios", () => {
  let h = apuntar({}, "Hip Thrust", "70");
  h = apuntar(h, "Prensa", "100");
  assert.equal(h["Hip Thrust"].length, 1);
  assert.equal(h["Prensa"].length, 1);
});

test("corta a 50 registros", () => {
  let h = {};
  for (let i = 0; i < 55; i++) h = apuntar(h, "Remo", String(i));
  assert.equal(h["Remo"].length, 50);
  assert.equal(h["Remo"][0].peso, "54");
});

test("borra solo el registro indicado", () => {
  let h = apuntar(apuntar(apuntar({}, "Jalón", "40"), "Jalón", "45"), "Jalón", "50");
  h = borrar(h, "Jalón", 1);
  assert.deepEqual(
    h["Jalón"].map((r) => r.peso),
    ["50", "40"],
  );
});

test("sobrevive a un guardar/cargar completo", () => {
  fakeStorage();
  guardar("nuria", apuntar({}, "Sentadilla", "62.5", "8"));
  assert.deepEqual(cargar("nuria")["Sentadilla"], [{ fecha: hoy(), peso: "62.5", reps: "8" }]);
});

test("el cache de un perfil no pisa el del otro", () => {
  fakeStorage();
  guardar("nuria", apuntar({}, "Sentadilla", "40"));
  guardar("alberto", apuntar({}, "Sentadilla", "100"));
  assert.equal(cargar("nuria")["Sentadilla"][0].peso, "40");
  assert.equal(cargar("alberto")["Sentadilla"][0].peso, "100");
});

test("localStorage corrupto no rompe la app", () => {
  const datos = fakeStorage();
  datos.set(`${KEY}-nuria`, "{esto no es json");
  assert.deepEqual(cargar("nuria"), {});
});

test("fechaCorta muestra día/mes", () => {
  assert.equal(fechaCorta("2026-08-31"), "31/08");
});

test("delta detecta subida de peso", () => {
  const h = apuntar({}, "Prensa", "80");
  assert.equal(delta(h["Prensa"], "85"), 5);
  assert.equal(delta(h["Prensa"], "80"), 0);
  assert.equal(delta(h["Prensa"], "77.5"), -2.5);
});

test("delta es null en el primer registro", () => {
  assert.equal(delta([], "60"), null);
});

test("alternar marca y desmarca", () => {
  const uno = alternar([], "Sentadilla");
  assert.deepEqual(uno, ["Sentadilla"]);
  assert.deepEqual(alternar(uno, "Sentadilla"), []);
});

test("los hechos de ayer no cuentan hoy", () => {
  fakeStorage();
  localStorage.setItem(`${HECHOS}-nuria`, JSON.stringify({ fecha: "2020-01-01", nombres: ["Prensa"] }));
  assert.deepEqual(cargarHechos("nuria"), []);
  guardarHechos("nuria", ["Prensa"]);
  assert.deepEqual(cargarHechos("nuria"), ["Prensa"]);
  assert.deepEqual(cargarHechos("alberto"), []);
});

test("la frase del dia es estable dentro del mismo dia y cambia al siguiente", () => {
  const a = fraseDelDia(new Date("2026-08-31T08:00:00Z"));
  assert.equal(a, fraseDelDia(new Date("2026-08-31T21:00:00Z")));
  assert.notEqual(a, fraseDelDia(new Date("2026-09-01T08:00:00Z")));
});

test("apuntar guarda el id que devuelve el servidor", () => {
  const h = apuntar({}, "Prensa", "80", "10", { id: 42, fecha: "2026-08-30" });
  assert.equal(h["Prensa"][0].id, 42);
  assert.equal(h["Prensa"][0].fecha, "2026-08-30");
});

test("marcarSerie marca hasta la que tocas y desmarca si repites", () => {
  let s = marcarSerie({}, "Prensa", 2);
  assert.equal(s["Prensa"], 3);
  s = marcarSerie(s, "Prensa", 2);
  assert.equal(s["Prensa"], 2);
});

test("racha cuenta dias seguidos hacia atras", () => {
  const h = { Prensa: [{ fecha: "2026-08-31" }, { fecha: "2026-08-30" }, { fecha: "2026-08-29" }] };
  assert.equal(racha(h, new Date("2026-08-31T10:00:00Z")), 3);
});

test("racha sigue viva si hoy aun no has entrenado", () => {
  const h = { Prensa: [{ fecha: "2026-08-30" }, { fecha: "2026-08-29" }] };
  assert.equal(racha(h, new Date("2026-08-31T10:00:00Z")), 2);
});

test("racha se rompe con un hueco", () => {
  const h = { Prensa: [{ fecha: "2026-08-31" }, { fecha: "2026-08-28" }] };
  assert.equal(racha(h, new Date("2026-08-31T10:00:00Z")), 1);
});

test("racha es 0 sin registros", () => {
  assert.equal(racha({}), 0);
});

test("progresion devuelve los pesos del mas antiguo al mas nuevo", () => {
  const regs = [{ peso: "70" }, { peso: "65" }, { peso: "60" }];
  assert.deepEqual(progresion(regs), [60, 65, 70]);
});

test("rutinaFinal esconde los ocultos y suma los anadidos", () => {
  const base = [{ ejercicios: [{ nombre: "Hip Thrust" }, { nombre: "Sentadilla" }] }];
  const pers = [
    { id: 1, dia: 0, nombre: "Hip Thrust", oculto: true },
    { id: 2, dia: 0, nombre: "Gemelos", series: "4", reps: "15", oculto: false },
    { id: 3, dia: 1, nombre: "De otro dia", oculto: false },
  ];
  const r = rutinaFinal(base, pers, 0);
  assert.deepEqual(r.map((e) => e.nombre), ["Sentadilla", "Gemelos"]);
});

test("rutinaFinal sin personalizar deja la rutina base", () => {
  const base = [{ ejercicios: [{ nombre: "Prensa" }] }];
  assert.deepEqual(rutinaFinal(base, [], 0).map((e) => e.nombre), ["Prensa"]);
});

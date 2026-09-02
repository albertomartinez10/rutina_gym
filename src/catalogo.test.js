import test from "node:test";
import assert from "node:assert/strict";
import { CATALOGO, GRUPOS, buscar } from "./catalogo.js";
import { RUTINAS } from "./rutinas.js";

test("el catalogo tiene ejercicios de todos los grupos", () => {
  Object.keys(GRUPOS).forEach((g) => {
    assert.ok(CATALOGO.some((e) => e.grupo === g), `${g} sin ejercicios`);
  });
});

test("todos tienen nombre, grupo conocido e imagen https", () => {
  CATALOGO.forEach((e) => {
    assert.ok(e.nombre, "ejercicio sin nombre");
    assert.ok(GRUPOS[e.grupo], `${e.nombre} con grupo raro: ${e.grupo}`);
    assert.ok(e.imagen?.startsWith("https://"), `${e.nombre} sin imagen`);
  });
});

test("no hay nombres repetidos", () => {
  const nombres = CATALOGO.map((e) => e.nombre);
  assert.equal(new Set(nombres).size, nombres.length);
});

test("buscar ignora tildes y mayusculas", () => {
  assert.ok(buscar("triceps").length > 0);
  assert.ok(buscar("TRÍCEPS").length > 0);
  assert.deepEqual(buscar("tríceps").length, buscar("triceps").length);
});

test("buscar filtra por grupo", () => {
  const r = buscar("", "biceps");
  assert.ok(r.length > 0);
  assert.ok(r.every((e) => e.grupo === "biceps"));
});

test("buscar sin resultados devuelve lista vacia, no error", () => {
  assert.deepEqual(buscar("zzzz"), []);
});

test("los ejercicios de las rutinas estan en la galeria o son suyos propios", () => {
  // Al menos los principales deben poder reañadirse desde la galería.
  const enCatalogo = new Set(CATALOGO.map((e) => e.nombre));
  const claves = ["Jalón al pecho", "Curl martillo", "Face pull", "Prensa", "Hip Thrust"];
  claves.forEach((n) => assert.ok(enCatalogo.has(n), `${n} no está en la galería`));
  assert.ok(Object.keys(RUTINAS).length > 0);
});

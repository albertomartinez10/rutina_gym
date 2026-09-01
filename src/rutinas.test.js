import test from "node:test";
import assert from "node:assert/strict";
import { RUTINAS, rutinaDe } from "./rutinas.js";
import { escala } from "./logros.js";

test("Nuria entrena 3 dias y Alberto 5", () => {
  assert.equal(rutinaDe("nuria").length, 3);
  assert.equal(rutinaDe("alberto").length, 5);
});

test("un perfil desconocido no rompe la app", () => {
  assert.equal(rutinaDe("otro"), RUTINAS.nuria);
});

test("el dia de espalda lleva 5 de espalda y 2 de biceps", () => {
  const d = rutinaDe("alberto")[0].ejercicios.map((e) => e.nombre);
  assert.deepEqual(d, [
    "Jalón al pecho", "Remo gironda", "Pullover", "Face pull", "Remo alto",
    "Curl martillo", "Curl de bíceps",
  ]);
});

test("el dia de pecho lleva 4 de pecho, 3 de hombro y 2 de triceps", () => {
  const d = rutinaDe("alberto")[1].ejercicios.map((e) => e.nombre);
  assert.equal(d.length, 9);
  assert.deepEqual(d.slice(0, 4), [
    "Press inclinado con mancuerna", "Press plano", "Cruce de polea", "Press inclinado en máquina",
  ]);
  assert.deepEqual(d.slice(4, 7), [
    "Elevaciones laterales con mancuerna", "Press militar", "Elevaciones laterales en máquina",
  ]);
  assert.deepEqual(d.slice(7), ["Tríceps con cuerda", "Tríceps tras nuca"]);
});

test("el dia de pierna lleva los 6 ejercicios", () => {
  assert.deepEqual(rutinaDe("alberto")[2].ejercicios.map((e) => e.nombre), [
    "Sentadilla pendular", "Prensa", "Curl femoral",
    "Extensión de cuádriceps", "Abducción de cadera", "Aducción de cadera",
  ]);
});

test("los dias 4 y 5 repiten espalda y pecho", () => {
  const r = rutinaDe("alberto");
  assert.deepEqual(r[3].ejercicios, r[0].ejercicios);
  assert.deepEqual(r[4].ejercicios, r[1].ejercicios);
  assert.notEqual(r[3].dia, r[0].dia, "pero con nombre de día distinto");
});

test("todo ejercicio tiene series, reps e imagen", () => {
  Object.values(RUTINAS).flat().forEach((dia) =>
    dia.ejercicios.forEach((e) => {
      assert.ok(e.nombre, "sin nombre");
      assert.ok(e.series, `${e.nombre} sin series`);
      assert.ok(e.reps, `${e.nombre} sin reps`);
      assert.ok(e.imagen?.startsWith("https://"), `${e.nombre} sin imagen`);
    }),
  );
});

test("cada ejercicio de Alberto tiene su escala de logros, sin caer en la generica", () => {
  const generica = escala("__no_existe__", "alberto");
  rutinaDe("alberto").flatMap((d) => d.ejercicios).forEach((e) => {
    assert.notEqual(escala(e.nombre, "alberto"), generica, `${e.nombre} usa la escala genérica`);
  });
});

import test from "node:test";
import assert from "node:assert/strict";
import { fraseLogro, fraseMedallero, celebracion, finDeDia, fraseDelDia } from "./frases.js";
import { NIVELES } from "./logros.js";

test("hay frase para todos los niveles de medalla", () => {
  NIVELES.forEach((_, i) => {
    assert.ok(fraseLogro(i)?.length > 10, `nivel ${i} sin frase`);
  });
});

test("un nivel fuera de rango no rompe nada", () => {
  assert.ok(fraseLogro(99));
  assert.ok(fraseLogro(-1));
});

test("el medallero anima distinto segun lo lleno que este", () => {
  assert.match(fraseMedallero(0, 12), /esperando/);
  assert.notEqual(fraseMedallero(12, 12), fraseMedallero(1, 12));
  assert.match(fraseMedallero(12, 12), /completo/);
});

test("sin ejercicios no divide por cero", () => {
  assert.ok(fraseMedallero(0, 0));
});

test("las frases de siempre siguen respondiendo", () => {
  assert.ok(celebracion(5).includes("5"));
  assert.ok(celebracion(0));
  assert.ok(celebracion(-2));
  assert.ok(finDeDia());
  assert.ok(fraseDelDia());
});

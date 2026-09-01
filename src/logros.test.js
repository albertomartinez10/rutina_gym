import test from "node:test";
import assert from "node:assert/strict";
import { nivelDe, logros, siguienteMeta, logroNuevo, mejorPeso, escala, NIVELES } from "./logros.js";

test("la escala de Nuria empieza mas abajo que la de Alberto", () => {
  assert.ok(escala("Sentadilla", "nuria")[0] < escala("Sentadilla", "alberto")[0]);
});

test("el mismo peso da niveles distintos segun el perfil", () => {
  assert.equal(nivelDe("Sentadilla", 60, "nuria"), 3);
  assert.equal(nivelDe("Sentadilla", 60, "alberto"), 0);
});

test("por debajo del primer umbral no hay logro", () => {
  assert.equal(nivelDe("Sentadilla", 5, "nuria"), -1);
});

test("no se pasa del ultimo nivel", () => {
  assert.equal(nivelDe("Sentadilla", 500, "alberto"), NIVELES.length - 1);
});

test("un ejercicio propio usa la escala generica", () => {
  assert.deepEqual(escala("Gemelos en máquina", "nuria"), escala("Otro inventado", "nuria"));
  assert.equal(nivelDe("Gemelos en máquina", 20, "nuria"), 1);
});

test("mejorPeso coge el maximo, no el ultimo", () => {
  assert.equal(mejorPeso([{ peso: "40" }, { peso: "60" }, { peso: "50" }]), 60);
});

test("logros lista un nivel por ejercicio, el mas alto primero", () => {
  const h = {
    Sentadilla: [{ peso: "50" }],
    "Elevaciones laterales": [{ peso: "2" }],
    Prensa: [{ peso: "5" }],
  };
  const l = logros(h, "nuria");
  assert.deepEqual(l.map((x) => x.ejercicio), ["Sentadilla", "Elevaciones laterales"]);
  assert.equal(l[0].nivel, 3);
});

test("siguienteMeta dice cuanto falta", () => {
  const meta = siguienteMeta("Sentadilla", { Sentadilla: [{ peso: "35" }] }, "nuria");
  assert.equal(meta.objetivo, 40);
  assert.equal(meta.falta, 5);
});

test("siguienteMeta es null al llegar arriba del todo", () => {
  assert.equal(siguienteMeta("Sentadilla", { Sentadilla: [{ peso: "999" }] }, "nuria"), null);
});

test("siguienteMeta parte del primer umbral si aun no hay nada", () => {
  const meta = siguienteMeta("Sentadilla", {}, "nuria");
  assert.equal(meta.objetivo, 20);
  assert.equal(meta.falta, 20);
});

test("logroNuevo solo salta al cruzar un umbral", () => {
  assert.ok(logroNuevo("Sentadilla", 25, 30, "nuria"));
  assert.equal(logroNuevo("Sentadilla", 30, 35, "nuria"), null);
});

test("logroNuevo no salta si el peso baja", () => {
  assert.equal(logroNuevo("Sentadilla", 50, 20, "nuria"), null);
});

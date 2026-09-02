// node --test src/
import test from "node:test";
import assert from "node:assert/strict";
import {
  cargar, guardar, apuntar, borrar, hoy, fechaCorta, KEY,
  delta, alternar, cargarHechos, guardarHechos, HECHOS,
  marcarSerie, racha, progresion, rutinaFinal, semanasDelMes, diasEntrenados,
  columnasDelAno, inicioDeMeses, cargarCola, guardarCola, encolar, desencolar, fusionar,
  volumen, volumenDia, esRecord, unaRepeticionMaxima, mejorEstimado,
  SESION, cargarSesion, guardarSesion, duracion, recordsDelDia,
  filasDe, cambiarFila, seriesHechas, seriesAnteriores,
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
  assert.equal(racha(diasEntrenados(h), new Date("2026-08-31T10:00:00Z")), 3);
});

test("racha cuenta tambien los dias marcados sin pesos", () => {
  const dias = diasEntrenados({}, [{ fecha: "2026-08-31" }, { fecha: "2026-08-30" }]);
  assert.equal(racha(dias, new Date("2026-08-31T10:00:00Z")), 2);
});

test("racha sigue viva si hoy aun no has entrenado", () => {
  const h = { Prensa: [{ fecha: "2026-08-30" }, { fecha: "2026-08-29" }] };
  assert.equal(racha(diasEntrenados(h), new Date("2026-08-31T10:00:00Z")), 2);
});

test("racha se rompe con un hueco", () => {
  const h = { Prensa: [{ fecha: "2026-08-31" }, { fecha: "2026-08-28" }] };
  assert.equal(racha(diasEntrenados(h), new Date("2026-08-31T10:00:00Z")), 1);
});

test("racha es 0 sin registros", () => {
  assert.equal(racha(diasEntrenados({})), 0);
});

test("progresion devuelve los pesos del mas antiguo al mas nuevo", () => {
  const regs = [
    { peso: "70", fecha: "2026-09-03" },
    { peso: "65", fecha: "2026-09-02" },
    { peso: "60", fecha: "2026-09-01" },
  ];
  assert.deepEqual(progresion(regs), [60, 65, 70]);
});

test("progresion marca un solo punto por dia: el peso maximo", () => {
  const regs = [
    { peso: "60", fecha: "2026-09-01" },
    { peso: "70", fecha: "2026-09-01" },
    { peso: "50", fecha: "2026-09-01" },
    { peso: "75", fecha: "2026-09-02" },
  ];
  assert.deepEqual(progresion(regs), [70, 75]);
});

test("progresion se queda con los ultimos dias, no con los primeros", () => {
  const regs = Array.from({ length: 15 }, (_, i) => ({
    peso: String(i),
    fecha: `2026-09-${String(i + 1).padStart(2, "0")}`,
  }));
  const p = progresion(regs, 10);
  assert.equal(p.length, 10);
  assert.equal(p.at(-1), 14);
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

test("semanasDelMes coloca el 1 en su dia de la semana", () => {
  // El 1 de septiembre de 2026 es martes: un hueco antes.
  const sem = semanasDelMes(2026, 8);
  assert.equal(sem[0][0], null);
  assert.equal(sem[0][1], "2026-09-01");
  assert.equal(sem.flat().filter(Boolean).length, 30);
});

test("semanasDelMes reparte en semanas completas de 7", () => {
  semanasDelMes(2026, 1).forEach((s) => assert.equal(s.length, 7));
});

test("diasEntrenados junta pesos y fotos sin repetir", () => {
  const d = diasEntrenados(
    { Prensa: [{ fecha: "2026-09-01" }] },
    [{ fecha: "2026-09-01" }, { fecha: "2026-09-02" }],
  );
  assert.equal(d.size, 2);
  assert.ok(d.has("2026-09-02"));
});

test("columnasDelAno cubre el año entero en semanas de 7", () => {
  const c = columnasDelAno(2026);
  c.forEach((s) => assert.equal(s.length, 7));
  const dias = c.flat().filter(Boolean);
  assert.equal(dias.length, 365);
  assert.equal(dias[0], "2026-01-01");
  assert.equal(dias.at(-1), "2026-12-31");
});

test("columnasDelAno cuenta el 29 de febrero en año bisiesto", () => {
  assert.equal(columnasDelAno(2028).flat().filter(Boolean).length, 366);
});

test("columnasDelAno empieza cada columna en lunes", () => {
  // 2026-01-01 es jueves: los tres primeros huecos van vacíos.
  const primera = columnasDelAno(2026)[0];
  assert.deepEqual(primera.slice(0, 3), [null, null, null]);
  assert.equal(primera[3], "2026-01-01");
});

test("inicioDeMeses situa los doce meses", () => {
  const c = columnasDelAno(2026);
  const m = inicioDeMeses(c);
  assert.equal(Object.keys(m).length, 12);
  assert.ok(m[0] < m[11]);
});

test("volumen multiplica peso por reps", () => {
  const regs = [{ peso: "50", reps: "10", fecha: "2026-09-01" }, { peso: "40", reps: "8", fecha: "2026-08-31" }];
  assert.equal(volumen(regs), 820);
  assert.equal(volumen(regs, "2026-09-01"), 500);
});

test("volumen ignora registros sin reps", () => {
  assert.equal(volumen([{ peso: "50", reps: "" }]), 0);
});

test("volumenDia suma todos los ejercicios de ese dia", () => {
  const h = {
    Prensa: [{ peso: "100", reps: "10", fecha: "2026-09-01" }],
    Sentadilla: [{ peso: "50", reps: "10", fecha: "2026-09-01" }, { peso: "50", reps: "10", fecha: "2026-08-01" }],
  };
  assert.equal(volumenDia(h, "2026-09-01"), 1500);
});

test("esRecord solo si supera todo lo anterior", () => {
  const regs = [{ peso: "60" }, { peso: "80" }];
  assert.equal(esRecord(regs, "85"), true);
  assert.equal(esRecord(regs, "80"), false);
  assert.equal(esRecord([], "20"), false, "el primer registro no es un record");
});

test("1RM por Epley", () => {
  assert.equal(unaRepeticionMaxima(100, 1), 103.3);
  assert.equal(unaRepeticionMaxima(60, 10), 80);
  assert.equal(unaRepeticionMaxima(60, 0), null);
  assert.equal(unaRepeticionMaxima("", 10), null);
});

test("mejorEstimado coge el mayor 1RM del historico", () => {
  assert.equal(mejorEstimado([{ peso: "60", reps: "10" }, { peso: "70", reps: "5" }]), 81.7);
  assert.equal(mejorEstimado([]), null);
});

test("la cola guarda y recupera lo que no se pudo subir", () => {
  fakeStorage();
  const reg = { perfil: "nuria", ejercicio: "Prensa", peso: "80", reps: "10", fecha: hoy(), tmp: 1 };
  guardarCola(encolar(cargarCola(), reg));
  assert.equal(cargarCola().length, 1);
  assert.equal(cargarCola()[0].ejercicio, "Prensa");
});

test("desencolar quita solo el registro subido", () => {
  const a = { perfil: "nuria", tmp: 1 };
  const b = { perfil: "nuria", tmp: 2 };
  assert.deepEqual(desencolar([a, b], a), [b]);
});

test("desencolar no confunde perfiles con el mismo tmp", () => {
  const a = { perfil: "nuria", tmp: 1 };
  const b = { perfil: "alberto", tmp: 1 };
  assert.deepEqual(desencolar([a, b], a), [b]);
});

test("fusionar no pierde lo pendiente al llegar los datos del servidor", () => {
  const remoto = { Prensa: [{ peso: "100", fecha: "2026-08-30" }] };
  const pendientes = [{ ejercicio: "Prensa", peso: "110", reps: "8", fecha: "2026-09-01", tmp: 7 }];
  const r = fusionar(remoto, pendientes);
  assert.equal(r["Prensa"].length, 2);
  assert.equal(r["Prensa"][0].peso, "110", "lo pendiente va primero, es lo más reciente");
});

test("fusionar añade ejercicios que el servidor no conoce", () => {
  const r = fusionar({}, [{ ejercicio: "Gemelos", peso: "40", fecha: "2026-09-01", tmp: 1 }]);
  assert.equal(r["Gemelos"].length, 1);
});

test("sin pendientes, fusionar deja el remoto igual", () => {
  const remoto = { Prensa: [{ peso: "100" }] };
  assert.deepEqual(fusionar(remoto, []), remoto);
});

test("duracion se lee en minutos y en horas", () => {
  const t0 = 1_000_000;
  assert.equal(duracion(t0, t0 + 25 * 60000), "25 min");
  assert.equal(duracion(t0, t0 + 95 * 60000), "1 h 35 min");
  assert.equal(duracion(null), null);
});

test("la sesion caduca al cambiar de dia", () => {
  fakeStorage();
  localStorage.setItem(`${SESION}-nuria`, JSON.stringify({ fecha: "2020-01-01", inicio: 123 }));
  assert.equal(cargarSesion("nuria"), null);
  guardarSesion("nuria", 456);
  assert.equal(cargarSesion("nuria"), 456);
});

test("recordsDelDia solo cuenta lo que supera dias anteriores", () => {
  const h = {
    Prensa: [{ peso: "110", fecha: "2026-09-01" }, { peso: "100", fecha: "2026-08-20" }],
    Sentadilla: [{ peso: "50", fecha: "2026-09-01" }, { peso: "60", fecha: "2026-08-20" }],
    Nuevo: [{ peso: "30", fecha: "2026-09-01" }],
  };
  const r = recordsDelDia(h, "2026-09-01");
  assert.deepEqual(r.map((x) => x.ejercicio), ["Prensa"]);
  assert.equal(r[0].anterior, 100);
});


test("filasDe crea una fila por serie con el peso de la ultima vez", () => {
  const f = filasDe(undefined, 3, "60", "10");
  assert.equal(f.length, 3);
  assert.deepEqual(f[0], { peso: "60", reps: "10", hecha: false });
});

test("filasDe respeta lo que ya habia apuntado hoy", () => {
  const guardadas = [{ peso: "70", reps: "8", hecha: true }];
  const f = filasDe(guardadas, 3, "60", "10");
  assert.equal(f[0].peso, "70");
  assert.equal(f[0].hecha, true);
  assert.equal(f[1].peso, "60", "las que faltan siguen con el peso de referencia");
});

test("cambiarFila solo toca la fila indicada", () => {
  const f = filasDe(undefined, 3, "60");
  const r = cambiarFila(f, 1, { peso: "65" });
  assert.equal(r[1].peso, "65");
  assert.equal(r[0].peso, "60");
  assert.equal(r[2].peso, "60");
});

test("seriesHechas cuenta las marcadas, esten donde esten", () => {
  const f = [{ hecha: true }, { hecha: false }, { hecha: true }];
  assert.equal(seriesHechas(f), 2);
});

test("cada serie puede llevar un peso distinto", () => {
  let f = filasDe(undefined, 3, "60");
  f = cambiarFila(f, 0, { peso: "60", hecha: true });
  f = cambiarFila(f, 1, { peso: "65", hecha: true });
  f = cambiarFila(f, 2, { peso: "50", hecha: true });
  assert.deepEqual(f.map((x) => x.peso), ["60", "65", "50"]);
  assert.equal(seriesHechas(f), 3);
});


test("seriesAnteriores devuelve las series del ultimo dia, en orden", () => {
  // Los registros llegan del servidor con el más reciente primero.
  const regs = [
    { peso: "62.5", reps: "8", fecha: "2026-08-30" },
    { peso: "60", reps: "10", fecha: "2026-08-30" },
    { peso: "55", reps: "10", fecha: "2026-08-20" },
  ];
  const a = seriesAnteriores(regs, "2026-09-01");
  assert.deepEqual(a.map((r) => r.peso), ["60", "62.5"], "serie 1 primero");
});

test("seriesAnteriores ignora lo apuntado hoy", () => {
  const regs = [
    { peso: "70", fecha: "2026-09-01" },
    { peso: "60", fecha: "2026-08-30" },
  ];
  assert.deepEqual(seriesAnteriores(regs, "2026-09-01").map((r) => r.peso), ["60"]);
});

test("seriesAnteriores no falla la primera vez", () => {
  assert.deepEqual(seriesAnteriores([], "2026-09-01"), []);
  assert.deepEqual(seriesAnteriores([{ peso: "50", fecha: "2026-09-01" }], "2026-09-01"), []);
});

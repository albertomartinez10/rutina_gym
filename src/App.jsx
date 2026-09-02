import { useEffect, useMemo, useState } from "react";
import {
  cargar, guardar, fechaCorta, delta,
  cargarHechos, guardarHechos, alternar,
  cargarSeries, guardarSeries, racha, progresion, rutinaFinal,
  filasDe, cambiarFila, seriesHechas, seriesAnteriores,
  hoy, diasEntrenados, volumenDia, esRecord, mejorEstimado,
  cargarCola, guardarCola, encolar, desencolar, fusionar,
  cargarSesion, guardarSesion, duracion, recordsDelDia, cargarFin, guardarFin,
  apuntar as apuntarEn, borrar as borrarEn,
} from "./historico.js";
import { fraseDelDia, celebracion, finDeDia, fraseLogro } from "./frases.js";
import {
  traerHistorico, insertarRegistro, borrarRegistro,
  traerPersonalizados, anadirEjercicio, ocultarEjercicio, quitarPersonalizado,
  traerEntrenos, guardarEntreno, traerTodo,
} from "./supabase.js";
import Descanso from "./Descanso.jsx";
import Logros from "./Logros.jsx";
import Calendario from "./Calendario.jsx";
import Pique from "./Pique.jsx";
import Planes from "./Planes.jsx";
import { porPerfil, resumenDe } from "./pique.js";
import { soportadas, activar, desactivar, yaActivadas, avisar, porQueNoHayAvisos } from "./notificaciones.js";
import { PERFILES, cargarPerfil, guardarPerfil, datosPerfil } from "./perfiles.js";
import { logroNuevo, mejorPeso, nivelDe, siguienteMeta, NIVELES } from "./logros.js";
import { rutinaDe } from "./rutinas.js";
import Galeria from "./Galeria.jsx";
import Grafica from "./Grafica.jsx";

export default function App() {
  const [perfil, setPerfil] = useState(cargarPerfil);
  const [pantalla, setPantalla] = useState("rutina");
  const [diaActivo, setDiaActivo] = useState(0);
  const [historico, setHistorico] = useState(() => cargar(cargarPerfil()));
  const [hechos, setHechos] = useState(() => cargarHechos(cargarPerfil()));
  const [series, setSeries] = useState(() => cargarSeries(cargarPerfil()));
  const [personalizados, setPersonalizados] = useState([]);
  const [entrenos, setEntrenos] = useState([]);
  const [cola, setCola] = useState(cargarCola);
  const [inicioSesion, setInicioSesion] = useState(() => cargarSesion(cargarPerfil()));
  const [pedirDescanso, setPedirDescanso] = useState(0);
  const [finSesion, setFinSesion] = useState(() => cargarFin(cargarPerfil()));
  const [todos, setTodos] = useState({});
  const [avisos, setAvisos] = useState(false);
  const [editando, setEditando] = useState(false);
  const [galeria, setGaleria] = useState(false);
  const [abierto, setAbierto] = useState(null);
  const [aviso, setAviso] = useState(null);

  const [sinConexion, setSinConexion] = useState(false);

  // Pinta ya con el cache local y luego sincroniza con Supabase.
  useEffect(() => {
    let vivo = true;
    traerHistorico(perfil)
      .then((datos) => {
        if (!vivo) return;
        setHistorico(fusionar(datos, cargarCola().filter((p) => p.perfil === perfil)));
        setSinConexion(false);
      })
      .catch(() => vivo && setSinConexion(true));
    traerPersonalizados(perfil)
      .then((p) => vivo && setPersonalizados(p))
      .catch(() => {});
    traerEntrenos()
      .then((e) => vivo && setEntrenos(e))
      .catch(() => {});
    traerTodo()
      .then((filas) => vivo && setTodos(porPerfil(filas)))
      .catch(() => {});
    return () => {
      vivo = false;
    };
  }, [perfil]);


  useEffect(() => guardar(perfil, historico), [perfil, historico]);
  useEffect(() => guardarCola(cola), [cola]);

  useEffect(() => {
    yaActivadas().then(setAvisos);
  }, []);

  // Reintenta subir lo que quedó pendiente en cuanto vuelve la cobertura.
  useEffect(() => {
    if (!cola.length) return;

    const reintentar = async () => {
      for (const p of cargarCola()) {
        try {
          const fila = await insertarRegistro(p.perfil, p.ejercicio, p.peso, p.reps, p.nota);
          setCola((c) => desencolar(c, p));
          setSinConexion(false);
          // Cambia el registro provisional por el que ya tiene id del servidor.
          setHistorico((h) => ({
            ...h,
            [p.ejercicio]: (h[p.ejercicio] || []).map((r) => (r.tmp === p.tmp ? { ...r, ...fila, tmp: undefined } : r)),
          }));
        } catch {
          return; // sigue sin haber red: se queda para el próximo intento
        }
      }
    };

    reintentar();
    window.addEventListener("online", reintentar);
    return () => window.removeEventListener("online", reintentar);
  }, [cola.length]);
  useEffect(() => guardarHechos(perfil, hechos), [perfil, hechos]);
  useEffect(() => guardarSeries(perfil, series), [perfil, series]);

  // El aviso se va solo a los 3s.
  useEffect(() => {
    if (!aviso) return;
    const t = setTimeout(() => setAviso(null), aviso.frase ? 5000 : 3000);
    return () => clearTimeout(t);
  }, [aviso]);

  // Cambiar de perfil trae de golpe su cache local; lo remoto llega por el efecto.
  const cambiarPerfil = (id) => {
    guardarPerfil(id);
    setPerfil(id);
    setDiaActivo(0);
    setHistorico(cargar(id));
    setHechos(cargarHechos(id));
    setSeries(cargarSeries(id));
    setInicioSesion(cargarSesion(id));
    setFinSesion(cargarFin(id));

  };

  // Marcar un ejercicio o una serie ya cuenta como día de gimnasio: se apunta solo.
  const empezarSesion = () => {
    if (inicioSesion) return;
    const ahora = Date.now();
    guardarSesion(perfil, ahora);
    setInicioSesion(ahora);
  };

  const marcarHoyEntrenado = async () => {
    empezarSesion();
    const fecha = hoy();
    if (entrenos.some((e) => e.fecha === fecha && e.perfil === perfil)) return;

    // Primer gesto del día (marcar, tocar serie o apuntar peso): un único aviso al otro.
    avisar(
      perfil,
      `${datosPerfil(perfil).emoji} ${datosPerfil(perfil).nombre} está en el gym`,
      `Ha empezado ${rutinaDe(perfil)[diaActivo].corto}. ¿Y tú? 👀`,
    );

    try {
      const fila = await guardarEntreno(perfil, fecha, null, null);
      setEntrenos((x) => [fila, ...x]);
    } catch {
      // Sin conexión no pasa nada: al apuntar el peso el día también cuenta.
    }
  };

  const cambiarAvisos = async () => {
    if (avisos) {
      await desactivar();
      setAvisos(false);
      return;
    }
    const ok = await activar(perfil);
    setAvisos(ok);
    setAviso(ok ? "Avisos activados 🔔" : "El móvil no ha dado permiso para avisos");
  };

  // Cerrar el entreno con lo que haya hecho, sin obligar a completar la rutina.
  const terminarEntreno = () => {
    const fin = finSesion ? null : Date.now();
    guardarFin(perfil, fin);
    setFinSesion(fin);
    if (fin) {
      vibrar([60, 40, 120]);
      setAviso({ texto: "Entreno cerrado 🎉", frase: finDeDia() });
    }
  };

  const vibrar = (ms) => navigator.vibrate?.(ms);

  const apuntar = async (nombre, peso, reps, nota) => {
    const d = delta(historico[nombre] || [], peso);
    let extra = {};
    try {
      extra = await insertarRegistro(perfil, nombre, peso, reps, nota);
      setSinConexion(false);
    } catch {
      // Sin cobertura: a la cola, que se sube sola cuando vuelva.
      const tmp = Date.now();
      extra = { tmp };
      setCola((c) => encolar(c, { perfil, ejercicio: nombre, peso, reps, nota, fecha: hoy(), tmp }));
      setSinConexion(true);
    }
    setHistorico((h) => apuntarEn(h, nombre, peso, reps, { nota, ...extra }));
    // Apuntar peso cuenta como ejercicio hecho: la barra sube sola.
    setHechos((n) => (n.includes(nombre) ? n : [...n, nombre]));
    marcarHoyEntrenado();
    const record = esRecord(historico[nombre] || [], peso);
    const antes = mejorPeso(historico[nombre] || []);
    const logro = logroNuevo(nombre, antes, Number(peso), perfil);
    if (logro) {
      setAviso({
        texto: `¡${logro.nombre} en ${nombre}!`,
        frase: fraseLogro(logro.nivel),
        medalla: logro.medalla,
      });
      vibrar([100, 60, 100, 60, 200]);
    } else if (record) {
      setAviso({ texto: `🏆 ¡Récord personal en ${nombre}: ${peso} kg!` });
      vibrar([80, 50, 160]);
    } else {
      setAviso(d === null ? "Primer registro guardado. ¡A por ello! ✨" : celebracion(d));
      vibrar(25);
    }
  };

  const borrar = async (nombre, i) => {
    const reg = (historico[nombre] || [])[i];
    setHistorico((h) => borrarEn(h, nombre, i));
    if (reg?.id) await borrarRegistro(reg.id).catch(() => setSinConexion(true));
  };

  const misEntrenos = useMemo(() => entrenos.filter((e) => e.perfil === perfil), [entrenos, perfil]);
  const diasSeguidos = useMemo(() => racha(diasEntrenados(historico, misEntrenos)), [historico, misEntrenos]);

  const rutina = rutinaDe(perfil);
  const volumenHoy = volumenDia(historico, hoy());
  const recordsHoy = recordsDelDia(historico, hoy());

  const ejercicios = rutinaFinal(rutina, personalizados, diaActivo);

  const anadir = async (nombre, ser, reps, imagen = null) => {
    try {
      const fila = await anadirEjercicio(perfil, diaActivo, nombre, ser || "3", reps || "10-12", imagen);
      setPersonalizados((p) => [...p, fila]);
      setAviso("Ejercicio añadido 💪");
    } catch {
      setAviso("No se ha podido añadir. ¿Ya existe ese nombre?");
    }
  };

  // Si es añadido se borra; si es de la rutina base se marca como oculto.
  const quitar = async (ej) => {
    const propio = personalizados.find((p) => p.dia === diaActivo && p.nombre === ej.nombre && !p.oculto);
    try {
      if (propio) {
        await quitarPersonalizado(propio.id);
        setPersonalizados((p) => p.filter((x) => x.id !== propio.id));
      } else {
        const fila = await ocultarEjercicio(perfil, diaActivo, ej.nombre);
        setPersonalizados((p) => [...p, fila]);
      }
    } catch {
      setAviso("No se ha podido quitar");
    }
  };

  const restaurar = async () => {
    const delDia = personalizados.filter((p) => p.dia === diaActivo && p.oculto);
    await Promise.all(delDia.map((p) => quitarPersonalizado(p.id).catch(() => {})));
    setPersonalizados((p) => p.filter((x) => !(x.dia === diaActivo && x.oculto)));
  };
  const completados = ejercicios.filter((e) => hechos.includes(e.nombre)).length;
  const porcentaje = Math.round((completados / ejercicios.length) * 100);
  const terminado = completados === ejercicios.length;

  const fraseFinal = useMemo(() => finDeDia(), [terminado, diaActivo]);
  const quien = datosPerfil(perfil);
  const todosLosEjercicios = Object.values(
    rutinaDe(perfil)
      .flatMap((_, d) => rutinaFinal(rutinaDe(perfil), personalizados, d))
      .reduce((acc, e) => ({ ...acc, [e.nombre]: e }), {}),
  );

  return (
    <div style={s.page}>

      <header style={s.header}>
        {pantalla === "rutina" && (
          <div style={s.halo}>
            <img src="/gymbro.jpeg" alt="Tu gymbro" className="foto" style={s.foto} />
          </div>
        )}
        <h1
          className="titulo"
          style={{ ...s.titulo, ...(pantalla === "rutina" ? null : s.tituloCorto) }}
        >
          De parte de tu gymbro {"<3"}
        </h1>
        {pantalla === "rutina" && <p style={s.frase}>{fraseDelDia()}</p>}
        {pantalla === "rutina" && diasSeguidos > 1 && (
          <p style={s.racha}>🔥 {diasSeguidos} días seguidos. No rompas la cadena</p>
        )}
        {pantalla === "rutina" && (
          <p style={{ ...s.deQuien, color: quien.color }}>
            {quien.emoji} Estás en el perfil de {quien.nombre}
          </p>
        )}
        {pantalla === "rutina" &&
          (soportadas() ? (
            <button onClick={cambiarAvisos} style={{ ...s.avisosBoton, ...(avisos ? s.avisosOn : null) }}>
              {avisos ? "🔔 Avisos activados" : "🔕 Activar avisos del otro"}
            </button>
          ) : (
            <p style={s.avisosPista}>🔕 {porQueNoHayAvisos()}</p>
          ))}
        {sinConexion && (
          <p style={s.offline}>
            Sin conexión
            {cola.length > 0 && ` · ${cola.length} ${cola.length === 1 ? "peso pendiente" : "pesos pendientes"} de subir`}
          </p>
        )}
      </header>

      {pantalla === "rutina" && (<>
      <div className="sticky" style={s.sticky}>
      <nav style={s.tabs}>
        {rutina.map((d, i) => (
          <button
            key={d.dia}
            onClick={() => setDiaActivo(i)}
            style={{ ...s.tab, ...(i === diaActivo ? s.tabActiva : null) }}
          >
            <span style={s.tabDia}>{d.dia}</span>
            <span style={s.tabGrupo}>{d.corto ?? d.grupo.split(" · ")[0]}</span>
            {d.grupo.includes(" · ") && (
              <span className="coletilla" style={s.tabColetilla}>{d.grupo.split(" · ")[1]}</span>
            )}
          </button>
        ))}
      </nav>

      <div style={s.progresoCaja}>
        <div style={s.progresoTexto}>
          <span>{terminado ? fraseFinal : `${completados} de ${ejercicios.length} hechos · sigue sumando fuerza`}</span>
          <span style={s.porcentaje}>{porcentaje}%</span>
          <button onClick={() => setEditando((v) => !v)} style={s.editar}>
            {editando ? "Listo" : "Editar"}
          </button>
        </div>
        <div style={s.barra}>
          <div style={{ ...s.barraRelleno, width: `${porcentaje}%` }} />
        </div>
        {volumenHoy > 0 && (
          <p style={s.volumen}>
            Hoy llevas <strong>{volumenHoy.toLocaleString("es-ES")} kg</strong> movidos 🏋️
          </p>
        )}
      </div>
      </div>

      <main style={s.lista}>
        {ejercicios.map((ej) => (
          <Ejercicio
            key={ej.nombre}
            ej={ej}
            registros={historico[ej.nombre] || []}
            hecho={hechos.includes(ej.nombre)}
            marcar={() => {
              vibrar(15);
              if (!hechos.includes(ej.nombre)) marcarHoyEntrenado();
              setHechos((n) => alternar(n, ej.nombre));
            }}
            abierto={abierto === ej.nombre}
            toggle={() => setAbierto(abierto === ej.nombre ? null : ej.nombre)}
            nivel={nivelDe(ej.nombre, mejorPeso(historico[ej.nombre] || []), perfil)}
            meta={siguienteMeta(ej.nombre, historico, perfil)}
            filas={series[ej.nombre]}
            guardarFilas={(nuevas) => setSeries((x) => ({ ...x, [ej.nombre]: nuevas }))}
            alHacerSerie={() => {
              vibrar(10);
              marcarHoyEntrenado();
              setPedirDescanso(Date.now());
            }}
            editando={editando}
            quitar={() => quitar(ej)}
            apuntar={apuntar}
            borrar={borrar}
          />
        ))}
        {editando && (
          <div style={s.edicion}>
            <button onClick={() => setGaleria(true)} style={s.abrirGaleria}>
              🔍 Buscar ejercicio en la galería
            </button>
            <NuevoEjercicio anadir={anadir} restaurar={restaurar} />
          </div>
        )}

        {completados > 0 && (
          <button onClick={terminarEntreno} style={s.terminar}>
            {finSesion ? "Seguir entrenando" : `Terminar entreno (${completados} de ${ejercicios.length})`}
          </button>
        )}
      </main>
      </>)}

      {pantalla === "rutina" && (terminado || finSesion) && (
        <section style={s.resumen}>
          <h2 style={s.resumenTitulo}>Resumen de hoy</h2>
          <div style={s.resumenFilas}>
            <span>Duración</span><strong>{duracion(inicioSesion, finSesion ?? Date.now()) ?? "—"}</strong>
            <span>Kilos movidos</span><strong>{volumenHoy.toLocaleString("es-ES")} kg</strong>
            <span>Ejercicios</span><strong>{completados} de {ejercicios.length}</strong>
          </div>
          {recordsHoy.length > 0 && (
            <p style={s.resumenRecords}>
              🏆 Récord en {recordsHoy.map((r) => `${r.ejercicio} (${r.peso} kg)`).join(", ")}
            </p>
          )}
        </section>
      )}

      {pantalla === "medallas" && (
        <Logros historico={historico} perfil={perfil} ejercicios={todosLosEjercicios} color={quien.color} />
      )}

      {pantalla === "pique" && (
        <Pique
          mes={new Date().getMonth()}
          datos={Object.fromEntries(
            PERFILES.map((p) => [
              p.id,
              resumenDe(todos[p.id] || {}, entrenos, p.id, new Date().getFullYear(), new Date().getMonth()),
            ]),
          )}
        />
      )}

      {pantalla === "planes" && <Planes perfil={perfil} color={quien.color} avisar={setAviso} />}

      {pantalla === "calendario" && (
        <Calendario
          historico={historico}
          entrenos={entrenos}
          setEntrenos={setEntrenos}
          perfil={perfil}
          color={quien.color}
          avisar={setAviso}
        />
      )}

      {aviso && (
        <div style={s.aviso}>
          {aviso.medalla && <img src={aviso.medalla} alt="" className="medallon" style={s.avisoMedalla} />}
          <span>
            {aviso.texto ?? aviso}
            {aviso.frase && <span style={s.avisoFrase}>{aviso.frase}</span>}
          </span>
        </div>
      )}
      {galeria && (
        <Galeria
          yaPuestos={ejercicios.map((e) => e.nombre)}
          anadir={(e) => anadir(e.nombre, "3", "10-12", e.imagen)}
          cerrar={() => setGaleria(false)}
        />
      )}

      <Descanso arrancar={pedirDescanso} />

      {/* Barra de abajo: se llega con el pulgar sin estirar la mano */}
      <nav style={s.menu}>
        {[
          ["rutina", "🏋️", "Rutina"],
          ["medallas", "🏅", "Medallas"],
          ["calendario", "📅", "Calendario"],
          ["pique", "🔥", "Pique"],
          ["planes", "💛", "Planes"],
        ].map(([id, icono, texto]) => (
          <button
            key={id}
            onClick={() => setPantalla(id)}
            style={{ ...s.menuBoton, ...(pantalla === id ? { ...s.menuActivo, color: quien.color } : null) }}
            aria-pressed={pantalla === id}
          >
            <span style={s.menuIcono}>{icono}</span>
            {texto}
          </button>
        ))}

        <button
          onClick={() => cambiarPerfil(PERFILES.find((p) => p.id !== perfil).id)}
          style={{ ...s.menuBoton, ...s.menuPerfil, color: quien.color }}
          aria-label={`Cambiar a ${PERFILES.find((p) => p.id !== perfil).nombre}`}
        >
          <span style={s.menuIcono}>{quien.emoji}</span>
          {quien.nombre}
        </button>
      </nav>
    </div>
  );
}

function Ejercicio({ ej, registros, hecho, marcar, nivel, meta, filas: guardadas, guardarFilas, alHacerSerie, editando, quitar, abierto, toggle, apuntar, borrar }) {
  const ultimo = registros[0];
  const [ampliada, setAmpliada] = useState(false);
  const [nota, setNota] = useState("");
  const [ponerNota, setPonerNota] = useState(false);
  const estimado = mejorEstimado(registros);
  const filas = filasDe(guardadas, Number(ej.series) || 1, ultimo?.peso ?? "", ultimo?.reps ?? "");
  const anteriores = seriesAnteriores(registros);

  const editarFila = (i, cambios) => guardarFilas(cambiarFila(filas, i, cambios));

  const hacerSerie = (i) => {
    const f = filas[i];
    if (f.hecha) {
      guardarFilas(cambiarFila(filas, i, { hecha: false }));
      return;
    }
    if (!f.peso) return;
    apuntar(ej.nombre, f.peso, f.reps, nota);
    guardarFilas(cambiarFila(filas, i, { hecha: true }));
    alHacerSerie();
  };

  const enviar = (e) => {
    e.preventDefault();
    if (!peso) return;
    // Cierra el teclado del móvil: si no, tapa el aviso de confirmación.
    e.currentTarget.querySelector("input")?.blur();
    apuntar(ej.nombre, peso, reps, nota);
    setNota("");
  };

  return (
    <article className="card" style={{ ...s.card, ...(hecho ? s.cardHecha : null) }}>
      <div style={s.cabecera}>
        {ej.imagen ? (
          <button
            onClick={() => setAmpliada((v) => !v)}
            style={{ ...s.miniCaja, ...(ampliada ? s.miniCajaAbierta : null) }}
            aria-expanded={ampliada}
            aria-label={ampliada ? "Reducir el gif" : "Ver el gif más grande"}
          >
            <img src={ej.imagen} alt={ej.nombre} loading="lazy" style={s.mini} />
          </button>
        ) : (
          <div style={s.sinGif}>💪</div>
        )}
        <div style={s.tituloEj}>
          <h2 style={s.nombre}>{ej.nombre}</h2>
          {nivel >= 0 && (
            <span style={s.suMedalla}>
              <img src={NIVELES[nivel].medalla} alt={NIVELES[nivel].nombre} style={s.medallaEj} />
              {NIVELES[nivel].nombre}
            </span>
          )}
        </div>
        <button
          onClick={marcar}
          className={hecho ? "check-on" : undefined}
          style={{ ...s.check, ...(hecho ? s.checkOn : null) }}
          aria-pressed={hecho}
          aria-label={hecho ? "Marcar como pendiente" : "Marcar como hecho"}
        >
          ✓
        </button>
        {editando && (
          <button onClick={quitar} style={s.quitar} aria-label={"Quitar " + ej.nombre}>
            Quitar
          </button>
        )}
      </div>

      <div style={s.datos}>
        <span>{ej.series}×{ej.reps}</span>
        {ultimo && <span style={s.datoVerde}>último {ultimo.peso} kg</span>}
        {estimado && <span style={s.datoMorado} title="Máximo estimado a 1 repetición">1RM {estimado}</span>}
        {meta && <span style={s.datoMeta}>{meta.falta} kg → {meta.nombre}</span>}
      </div>

      <div style={s.series}>
        <div style={s.serieCabecera}>
          <span>SERIE</span>
          <span style={s.colAnterior}>ANTERIOR</span>
          <span style={s.colNum}>KG</span>
          <span style={s.colNum}>REPS</span>
          <span />
        </div>

        {filas.map((f, i) => {
          const previa = anteriores[i];
          return (
            <div key={i} style={{ ...s.serieFila, ...(f.hecha ? s.serieHecha : null) }}>
              <span style={s.serieNum}>{i + 1}</span>
              <span style={s.anterior}>{previa ? `${previa.peso}×${previa.reps || "-"}` : "—"}</span>
              <input
                type="number"
                inputMode="decimal"
                step="0.5"
                placeholder={previa?.peso ?? "kg"}
                value={f.peso}
                onChange={(e) => editarFila(i, { peso: e.target.value })}
                style={s.inputSerie}
                aria-label={`Peso de la serie ${i + 1}`}
              />
              <input
                type="number"
                inputMode="numeric"
                placeholder={previa?.reps ?? "reps"}
                value={f.reps}
                onChange={(e) => editarFila(i, { reps: e.target.value })}
                style={s.inputSerie}
                aria-label={`Repeticiones de la serie ${i + 1}`}
              />
              <button
                type="button"
                onClick={() => hacerSerie(i)}
                style={{ ...s.serieCheck, ...(f.hecha ? s.serieCheckOn : null) }}
                aria-pressed={f.hecha}
                aria-label={f.hecha ? `Deshacer serie ${i + 1}` : `Guardar serie ${i + 1}`}
              >
                ✓
              </button>
            </div>
          );
        })}
      </div>

      <div style={s.pie}>
        <button onClick={() => setPonerNota((v) => !v)} style={s.pieBoton} aria-expanded={ponerNota}>
          📝 Nota{nota ? " ✓" : ""}
        </button>
        <button onClick={toggle} style={s.pieBoton}>
          {abierto ? "Ocultar" : "📈 Progresión (" + registros.length + ")"}
        </button>
      </div>

      {ponerNota && (
        <input
          placeholder="Sensaciones, máquina, altura del asiento…"
          value={nota}
          onChange={(e) => setNota(e.target.value)}
          style={s.notaInput}
          autoFocus
        />
      )}

      {abierto && (
        <>
        <Grafica pesos={progresion(registros)} />
        <ul style={s.historico}>
          {registros.length === 0 && <li style={s.vacio}>Aún no has apuntado nada 👀</li>}
          {registros.map((r, i) => (
            <li key={i} style={s.registro}>
              <span style={s.fecha}>{fechaCorta(r.fecha)}</span>
              <span>
                {r.peso} kg{r.reps ? " × " + r.reps : ""}
              </span>
              {r.nota && <span style={s.notaRegistro} title={r.nota}>📝</span>}
              <button onClick={() => borrar(ej.nombre, i)} style={s.borrar} aria-label="Borrar registro">
                ✕
              </button>
            </li>
          ))}
        </ul>
        </>
      )}
    </article>
  );
}

function NuevoEjercicio({ anadir, restaurar }) {
  const [nombre, setNombre] = useState("");
  const [ser, setSer] = useState("");
  const [reps, setReps] = useState("");

  const enviar = (e) => {
    e.preventDefault();
    if (!nombre.trim()) return;
    anadir(nombre.trim(), ser, reps);
    setNombre("");
    setSer("");
    setReps("");
  };

  return (
    <form onSubmit={enviar} style={s.nuevo}>
      <h2 style={s.nombre}>Añadir ejercicio</h2>
      <input
        placeholder="Nombre del ejercicio"
        value={nombre}
        onChange={(e) => setNombre(e.target.value)}
        style={{ ...s.input, width: "100%", marginBottom: "8px" }}
      />
      <div style={s.form}>
        <input
          type="number"
          inputMode="numeric"
          placeholder="series"
          value={ser}
          onChange={(e) => setSer(e.target.value)}
          style={s.input}
        />
        <input
          placeholder="reps"
          value={reps}
          onChange={(e) => setReps(e.target.value)}
          style={s.input}
        />
        <button type="submit" style={s.guardar}>Añadir</button>
      </div>
      <button type="button" onClick={restaurar} style={s.verMas}>
        Recuperar los ejercicios que he quitado
      </button>
    </form>
  );
}

const s = {
  page: {
    minHeight: "100vh",
    background: "transparent",
    color: "#f8fafc",
    fontFamily: "'Outfit', system-ui, sans-serif",
    padding: "16px 14px calc(96px + env(safe-area-inset-bottom))",
    maxWidth: "560px",
    margin: "0 auto",
    boxSizing: "border-box",
  },
  header: { textAlign: "center", marginBottom: "24px" },
  halo: {
    display: "inline-block",
    padding: "5px",
    borderRadius: "50%",
    background: "conic-gradient(from 180deg,#60a5fa,#a78bfa,#4ade80,#60a5fa)",
    boxShadow: "0 0 40px rgba(96,165,250,0.35)",
  },
  foto: {
    width: "84px",
    height: "84px",
    objectFit: "cover",
    borderRadius: "50%",
    display: "block",
    border: "3px solid #0b1020",
  },
  titulo: { fontSize: "26px", margin: "14px 0 0", fontWeight: 900, letterSpacing: "-0.5px" },
  tabs: {
    display: "flex",
    gap: "8px",
    marginBottom: "20px",
    overflowX: "auto",
    paddingBottom: "4px",
  },
  tab: {
    flex: "1 0 auto",
    minWidth: "104px",
    maxWidth: "136px",
    display: "flex",
    flexDirection: "column",
    gap: "2px",
    padding: "10px 4px",
    borderRadius: "14px",
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.03)",
    color: "#cbd5e1",
    font: "inherit",
    cursor: "pointer",
  },
  tabActiva: {
    background: "linear-gradient(160deg, rgba(59,130,246,0.35), rgba(168,85,247,0.25))",
    borderColor: "rgba(96,165,250,0.6)",
    color: "#fff",
    boxShadow: "0 6px 20px rgba(59,130,246,0.25)",
  },
  tabDia: { fontSize: "13px", fontWeight: 700 },
  tabGrupo: { fontSize: "11px", lineHeight: 1.25 },
  tabColetilla: {
    fontSize: "9px",
    lineHeight: 1.2,
    color: "#64748b",
    fontStyle: "italic",
    fontWeight: 400,
  },
  sticky: { marginBottom: "12px" },
  menu: {
    position: "fixed",
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 30,
    display: "flex",
    gap: "1px",
    padding: "6px 4px calc(6px + env(safe-area-inset-bottom))",
    background: "rgba(11,16,32,0.94)",
    backdropFilter: "blur(14px)",
    borderTop: "1px solid rgba(255,255,255,0.08)",
  },
  menuBoton: {
    flex: 1,
    minWidth: 0,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "2px",
    padding: "8px 1px",
    borderRadius: "10px",
    border: "none",
    background: "transparent",
    color: "#94a3b8",
    fontSize: "9px",
    fontWeight: 700,
    cursor: "pointer",
  },
  menuIcono: { fontSize: "17px", lineHeight: 1 },
  menuActivo: { background: "rgba(255,255,255,0.09)" },
  menuPerfil: { borderLeft: "1px solid rgba(255,255,255,0.1)", borderRadius: 0 },
  avisosBoton: {
    marginTop: "8px",
    padding: "6px 12px",
    borderRadius: "99px",
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.04)",
    color: "#94a3b8",
    fontSize: "12px",
    fontWeight: 700,
    cursor: "pointer",
  },
  avisosPista: { margin: "10px 0 0", fontSize: "11px", color: "#fbbf24", lineHeight: 1.4 },
  avisosOn: { borderColor: "rgba(74,222,128,0.5)", color: "#4ade80" },
  deQuien: { margin: "6px 0 0", fontSize: "11px", fontWeight: 700 },
  racha: {
    margin: "8px 0 0",
    fontSize: "13px",
    fontWeight: 700,
    color: "#fb923c",
  },
  tituloEj: { flex: 1, minWidth: "110px" },
  suMedalla: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    marginTop: "3px",
    fontSize: "11px",
    fontWeight: 700,
    color: "#fbbf24",
  },
  medallaEj: { width: "13px", height: "22px", objectFit: "contain" },
  volumen: { margin: "8px 0 0", fontSize: "12px", color: "#94a3b8" },
  edicion: { display: "grid", gap: "10px" },
  abrirGaleria: {
    padding: "14px",
    borderRadius: "16px",
    border: "1px dashed rgba(96,165,250,0.5)",
    background: "rgba(59,130,246,0.1)",
    color: "#60a5fa",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer",
  },
  terminar: {
    marginTop: "4px",
    padding: "14px",
    borderRadius: "16px",
    border: "1px solid rgba(74,222,128,0.4)",
    background: "rgba(74,222,128,0.1)",
    color: "#4ade80",
    fontSize: "15px",
    fontWeight: 700,
    cursor: "pointer",
  },
  resumen: {
    marginTop: "18px",
    padding: "16px",
    borderRadius: "20px",
    background: "rgba(74,222,128,0.08)",
    border: "1px solid rgba(74,222,128,0.3)",
  },
  resumenTitulo: { margin: "0 0 12px", fontSize: "16px", color: "#f8fafc" },
  resumenFilas: {
    display: "grid",
    gridTemplateColumns: "1fr auto",
    gap: "8px 12px",
    fontSize: "14px",
    color: "#94a3b8",
  },
  resumenRecords: { margin: "12px 0 0", fontSize: "13px", color: "#fbbf24", fontWeight: 700 },
  siguienteMedalla: {
    display: "flex",
    alignItems: "center",
    gap: "6px",
    margin: "0 0 10px",
    fontSize: "11px",
    color: "#64748b",
  },
  medallaMini: { width: "11px", height: "18px", objectFit: "contain", filter: "grayscale(1)", opacity: 0.7 },
  series: { marginBottom: "10px" },
  serieCabecera: {
    display: "grid",
    gridTemplateColumns: "30px 1fr 54px 48px 36px",
    gap: "4px",
    padding: "0 2px 4px",
    fontSize: "9px",
    fontWeight: 700,
    color: "#475569",
    letterSpacing: "0.04em",
  },
  colAnterior: { textAlign: "center" },
  colNum: { textAlign: "center" },
  serieFila: {
    display: "grid",
    gridTemplateColumns: "30px 1fr 54px 48px 36px",
    gap: "4px",
    alignItems: "center",
    padding: "2px",
    borderRadius: "8px",
  },
  serieHecha: { background: "rgba(74,222,128,0.12)" },
  serieNum: { fontSize: "13px", color: "#94a3b8", fontWeight: 700, textAlign: "center" },
  anterior: { fontSize: "12px", color: "#64748b", textAlign: "center" },
  inputSerie: {
    width: "100%",
    minWidth: 0,
    padding: "8px 2px",
    fontSize: "16px",
    textAlign: "center",
    borderRadius: "8px",
    border: "none",
    background: "rgba(255,255,255,0.07)",
    color: "#fff",
  },
  serieCheck: {
    width: "36px",
    height: "34px",
    padding: 0,
    borderRadius: "8px",
    border: "none",
    background: "rgba(255,255,255,0.07)",
    color: "#475569",
    fontSize: "14px",
    cursor: "pointer",
  },
  serieCheckOn: { background: "#22c55e", color: "#fff" },

  editar: {
    marginLeft: "10px",
    padding: "2px 10px",
    borderRadius: "99px",
    border: "1px solid rgba(255,255,255,0.15)",
    background: "transparent",
    color: "#94a3b8",
    fontSize: "12px",
    cursor: "pointer",
  },
  quitar: {
    padding: "8px 12px",
    borderRadius: "99px",
    border: "1px solid rgba(248,113,113,0.4)",
    background: "rgba(248,113,113,0.1)",
    color: "#f87171",
    fontSize: "13px",
    fontWeight: 600,
    cursor: "pointer",
  },
  nuevo: {
    background: "rgba(255,255,255,0.03)",
    border: "1px dashed rgba(255,255,255,0.18)",
    borderRadius: "22px",
    padding: "16px",
  },
  lista: { display: "grid", gap: "12px" },
  card: {
    background: "linear-gradient(180deg, rgba(255,255,255,0.07), rgba(255,255,255,0.025))",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "18px",
    padding: "12px",
    backdropFilter: "blur(8px)",
    boxShadow: "0 10px 30px rgba(2,6,23,0.35)",
  },
  nombre: { flex: 1, minWidth: "110px", fontSize: "16px", margin: 0, fontWeight: 700 },
  miniCaja: {
    width: "64px",
    height: "64px",
    flexShrink: 0,
    padding: "4px",
    borderRadius: "14px",
    border: "none",
    background: "#fff",
    cursor: "zoom-in",
    transition: "width .25s ease, height .25s ease",
  },
  miniCajaAbierta: {
    width: "100%",
    height: "auto",
    aspectRatio: "4 / 3",
    cursor: "zoom-out",
  },
  mini: { width: "100%", height: "100%", objectFit: "contain", display: "block" },
  sinGif: {
    display: "grid",
    placeItems: "center",
    width: "64px",
    height: "64px",
    flexShrink: 0,
    borderRadius: "12px",
    background: "rgba(255,255,255,0.04)",
    fontSize: "40px",
  },
  datos: {
    display: "flex",
    flexWrap: "wrap",
    alignItems: "center",
    gap: "10px",
    margin: "0 0 10px",
    fontSize: "11px",
    color: "#94a3b8",
    fontWeight: 600,
  },
  datoVerde: { color: "#4ade80" },
  datoMorado: { color: "#c084fc" },
  datoMeta: { display: "flex", alignItems: "center", gap: "3px", color: "#64748b" },
  pie: { display: "flex", gap: "6px" },
  pieBoton: {
    flex: 1,
    padding: "9px 6px",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.08)",
    background: "transparent",
    color: "#94a3b8",
    fontSize: "12px",
    cursor: "pointer",
  },
  notaInput: {
    width: "100%",
    boxSizing: "border-box",
    marginTop: "6px",
    padding: "10px",
    fontSize: "16px",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.05)",
    color: "#fff",
  },
  badges: { display: "flex", flexWrap: "wrap", gap: "8px", margin: "12px 0" },
  badge: {
    background: "rgba(59,130,246,0.15)",
    color: "#60a5fa",
    padding: "6px 12px",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: 600,
  },
  badge1rm: {
    background: "rgba(168,85,247,0.15)",
    color: "#c084fc",
    padding: "6px 12px",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: 600,
  },
  notaRegistro: { fontSize: "12px", cursor: "help" },
  badgeUltimo: {
    background: "rgba(34,197,94,0.15)",
    color: "#4ade80",
    padding: "6px 12px",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: 600,
  },
  form: { display: "flex", flexWrap: "wrap", gap: "8px" },
  input: {
    minWidth: "72px",
    flex: 1,
    padding: "12px",
    fontSize: "16px",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.05)",
    color: "#fff",
  },
  guardar: {
    padding: "12px 18px",
    borderRadius: "12px",
    border: "none",
    boxShadow: "0 6px 18px rgba(59,130,246,0.35)",
    background: "linear-gradient(135deg,#3b82f6,#a855f7)",
    color: "#fff",
    fontWeight: 700,
    fontSize: "15px",
    cursor: "pointer",
  },
  verMas: {
    width: "100%",
    marginTop: "10px",
    padding: "10px",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.1)",
    background: "transparent",
    color: "#94a3b8",
    fontSize: "14px",
    cursor: "pointer",
  },
  historico: { listStyle: "none", padding: 0, margin: "10px 0 0" },
  registro: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "10px 0",
    borderTop: "1px solid rgba(255,255,255,0.06)",
    fontSize: "14px",
  },
  fecha: { color: "#94a3b8", minWidth: "48px" },
  borrar: {
    marginLeft: "auto",
    flexShrink: 0,
    width: "40px",
    height: "40px",
    background: "transparent",
    border: "none",
    color: "#64748b",
    fontSize: "18px",
    cursor: "pointer",
  },
  vacio: { color: "#64748b", fontSize: "14px", padding: "10px 0" },
  frase: {
    margin: "6px 0 0",
    fontSize: "12px",
    color: "#93c5fd",
    fontStyle: "italic",
    minHeight: "20px",
  },
  progresoCaja: {
    marginBottom: "22px",
    padding: "12px 14px",
    borderRadius: "16px",
    background: "rgba(255,255,255,0.04)",
    border: "1px solid rgba(255,255,255,0.08)",
  },
  progresoTexto: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "13px",
    color: "#94a3b8",
    marginBottom: "6px",
  },
  porcentaje: { color: "#4ade80", fontWeight: 700 },
  barra: {
    height: "10px",
    borderRadius: "99px",
    background: "rgba(255,255,255,0.06)",
    overflow: "hidden",
  },
  barraRelleno: {
    height: "100%",
    borderRadius: "99px",
    background: "linear-gradient(90deg,#3b82f6,#a855f7,#4ade80)",
    boxShadow: "0 0 14px rgba(96,165,250,0.5)",
    transition: "width .5s cubic-bezier(.4,0,.2,1)",
  },
  cabecera: { display: "flex", alignItems: "center", flexWrap: "wrap", gap: "10px", marginBottom: "8px" },
  cardHecha: {
    borderColor: "rgba(74,222,128,0.45)",
    background: "linear-gradient(180deg, rgba(74,222,128,0.12), rgba(74,222,128,0.03))",
    boxShadow: "0 10px 30px rgba(34,197,94,0.15)",
  },
  check: {
    marginLeft: "auto",
    flexShrink: 0,
    width: "44px",
    height: "44px",
    borderRadius: "50%",
    border: "1px solid rgba(255,255,255,0.15)",
    background: "transparent",
    color: "#475569",
    fontSize: "16px",
    cursor: "pointer",
    transition: "all .2s ease",
  },
  checkOn: {
    background: "linear-gradient(135deg,#22c55e,#4ade80)",
    borderColor: "#22c55e",
    color: "#fff",
    boxShadow: "0 0 18px rgba(34,197,94,0.5)",
  },
  offline: {
    margin: "8px 0 0",
    fontSize: "12px",
    color: "#fbbf24",
  },
  avisoFrase: { display: "block", fontSize: "12px", fontWeight: 500, color: "#94a3b8", marginTop: "2px" },
  avisoMedalla: { width: "22px", height: "38px", objectFit: "contain", verticalAlign: "-12px", marginRight: "8px" },
  aviso: {
    position: "fixed",
    left: "50%",
    bottom: "calc(150px + env(safe-area-inset-bottom))",
    transform: "translateX(-50%)",
    display: "flex",
    alignItems: "center",
    width: "max-content",
    maxWidth: "90vw",
    background: "linear-gradient(135deg,#1e293b,#312e81)",
    border: "1px solid rgba(74,222,128,0.5)",
    color: "#f8fafc",
    padding: "12px 18px",
    borderRadius: "99px",
    fontSize: "14px",
    fontWeight: 600,
    boxShadow: "0 10px 30px rgba(0,0,0,0.45)",
    animation: "subir .3s ease",
    zIndex: 10,
  },
};

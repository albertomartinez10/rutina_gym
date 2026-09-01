import { useEffect, useMemo, useState } from "react";
import {
  cargar, guardar, fechaCorta, delta,
  cargarHechos, guardarHechos, alternar,
  cargarSeries, guardarSeries, marcarSerie, racha, progresion, rutinaFinal,
  apuntar as apuntarEn, borrar as borrarEn,
} from "./historico.js";
import { fraseDelDia, celebracion, finDeDia } from "./frases.js";
import {
  traerHistorico, insertarRegistro, borrarRegistro,
  traerPersonalizados, anadirEjercicio, ocultarEjercicio, quitarPersonalizado,
} from "./supabase.js";
import Descanso from "./Descanso.jsx";
import Logros from "./Logros.jsx";
import { PERFILES, cargarPerfil, guardarPerfil, datosPerfil } from "./perfiles.js";
import { logroNuevo, mejorPeso } from "./logros.js";
import Grafica from "./Grafica.jsx";

const rutina = [
  {
    dia: "Día 1",
    grupo: "Glúteos 🍑 · para tener más culo, si es que se puede",
    ejercicios: [
      { nombre: "Hip Thrust", series: "4", reps: "10-12", imagen: "https://gymvisual.com/img/p/5/7/6/1/5761.gif" },
      { nombre: "Patada de glúteo en polea", series: "3", reps: "12-15", imagen: "https://www.thingys.com.ar/gymapps/tutorial/gluteos_polea2.gif" },
      { nombre: "Peso muerto rumano", series: "3", reps: "10-12", imagen: "https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Romanian-Deadlift.gif" },
      { nombre: "Abducción de cadera", series: "3", reps: "15", imagen: "https://gymvisual.com/img/p/1/2/7/1/4/12714.gif" },
    ],
  },
  {
    dia: "Día 2",
    grupo: "Torso 💪 · para ponerte mamadísima",
    ejercicios: [
      { nombre: "Jalón al pecho", series: "4", reps: "10-12", imagen: "https://fitnessprogramer.com/wp-content/uploads/2021/02/Lat-Pulldown.gif" },
      { nombre: "Remo en polea", series: "3", reps: "10-12", imagen: "https://fitnessprogramer.com/wp-content/uploads/2021/02/Seated-Cable-Row.gif" },
      { nombre: "Press hombro mancuernas", series: "3", reps: "10-12", imagen: "https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Shoulder-Press.gif" },
      { nombre: "Elevaciones laterales", series: "3", reps: "12-15", imagen: "https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Lateral-Raise.gif" },
    ],
  },
  {
    dia: "Día 3",
    grupo: "Cuádriceps 🦵 · para partirlo en los pogos",
    ejercicios: [
      { nombre: "Sentadilla", series: "4", reps: "8-10", imagen: "https://www.thingys.com.ar/gymapps/tutorial/hack_new.gif" },
      { nombre: "Prensa", series: "4", reps: "10-12", imagen: "https://fitcron.com/wp-content/uploads/2021/04/07401301-Sled-45%C2%B0-Leg-Wide-Press_Thighs_720.gif" },
      { nombre: "Extensión de cuádriceps", series: "3", reps: "12-15", imagen: "https://i.pinimg.com/originals/33/24/5f/33245f9b08426eb8d0860f9261111283.gif" },
      { nombre: "Zancadas", series: "3", reps: "10-12", imagen: "https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Lunge.gif" },
    ],
  },
];

export default function App() {
  const [perfil, setPerfil] = useState(cargarPerfil);
  const [diaActivo, setDiaActivo] = useState(0);
  const [historico, setHistorico] = useState(() => cargar(cargarPerfil()));
  const [hechos, setHechos] = useState(() => cargarHechos(cargarPerfil()));
  const [series, setSeries] = useState(() => cargarSeries(cargarPerfil()));
  const [personalizados, setPersonalizados] = useState([]);
  const [editando, setEditando] = useState(false);
  const [abierto, setAbierto] = useState(null);
  const [aviso, setAviso] = useState(null);

  const [sinConexion, setSinConexion] = useState(false);

  // Pinta ya con el cache local y luego sincroniza con Supabase.
  useEffect(() => {
    let vivo = true;
    guardarPerfil(perfil);
    setHistorico(cargar(perfil));
    setHechos(cargarHechos(perfil));
    setSeries(cargarSeries(perfil));
    traerHistorico(perfil)
      .then((datos) => vivo && (setHistorico(datos), setSinConexion(false)))
      .catch(() => vivo && setSinConexion(true));
    traerPersonalizados(perfil)
      .then((p) => vivo && setPersonalizados(p))
      .catch(() => {});
    return () => {
      vivo = false;
    };
  }, [perfil]);


  useEffect(() => guardar(perfil, historico), [perfil, historico]);
  useEffect(() => guardarHechos(perfil, hechos), [perfil, hechos]);
  useEffect(() => guardarSeries(perfil, series), [perfil, series]);

  // El aviso se va solo a los 3s.
  useEffect(() => {
    if (!aviso) return;
    const t = setTimeout(() => setAviso(null), 3000);
    return () => clearTimeout(t);
  }, [aviso]);

  const vibrar = (ms) => navigator.vibrate?.(ms);

  const apuntar = async (nombre, peso, reps) => {
    const d = delta(historico[nombre] || [], peso);
    let extra = {};
    try {
      extra = await insertarRegistro(perfil, nombre, peso, reps);
      setSinConexion(false);
    } catch {
      setSinConexion(true);
    }
    setHistorico((h) => apuntarEn(h, nombre, peso, reps, extra));
    // Apuntar peso cuenta como ejercicio hecho: la barra sube sola.
    setHechos((n) => (n.includes(nombre) ? n : [...n, nombre]));
    const antes = mejorPeso(historico[nombre] || []);
    const logro = logroNuevo(nombre, antes, Number(peso), perfil);
    if (logro) {
      setAviso({ texto: `¡${logro.nombre} en ${nombre}!`, medalla: logro.medalla });
      vibrar([100, 60, 100, 60, 200]);
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

  const diasSeguidos = useMemo(() => racha(historico), [historico]);

  const ejercicios = rutinaFinal(rutina, personalizados, diaActivo);

  const anadir = async (nombre, ser, reps) => {
    try {
      const fila = await anadirEjercicio(perfil, diaActivo, nombre, ser || "3", reps || "10-12");
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

  return (
    <div style={s.page}>
      <nav style={s.perfiles}>
        {PERFILES.map((p) => (
          <button
            key={p.id}
            onClick={() => setPerfil(p.id)}
            style={{
              ...s.perfil,
              ...(p.id === perfil ? { ...s.perfilActivo, borderColor: p.color, color: p.color } : null),
            }}
            aria-pressed={p.id === perfil}
          >
            {p.emoji} {p.nombre}
          </button>
        ))}
      </nav>

      <header style={s.header}>
        <div style={s.halo}>
          <img src="/gymbro.jpeg" alt="Tu gymbro" className="foto" style={s.foto} />
        </div>
        <h1 className="titulo" style={s.titulo}>De parte de tu gymbro {"<3"}</h1>
        <p style={s.frase}>{fraseDelDia()}</p>
        {diasSeguidos > 1 && (
          <p style={s.racha}>🔥 {diasSeguidos} días seguidos. No rompas la cadena</p>
        )}
        <p style={{ ...s.deQuien, color: quien.color }}>
          {quien.emoji} Estás en el perfil de {quien.nombre}
        </p>
        {sinConexion && <p style={s.offline}>Sin conexión: guardando solo en este móvil</p>}
      </header>

      <div className="sticky" style={s.sticky}>
      <nav style={s.tabs}>
        {rutina.map((d, i) => (
          <button
            key={d.dia}
            onClick={() => setDiaActivo(i)}
            style={{ ...s.tab, ...(i === diaActivo ? s.tabActiva : null) }}
          >
            <span style={s.tabDia}>{d.dia}</span>
            <span style={s.tabGrupo}>{d.grupo}</span>
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
      </div>
      </div>

      <Logros historico={historico} perfil={perfil} ejercicios={ejercicios} color={quien.color} />

      <main style={s.lista}>
        {ejercicios.map((ej) => (
          <Ejercicio
            key={ej.nombre}
            ej={ej}
            registros={historico[ej.nombre] || []}
            hecho={hechos.includes(ej.nombre)}
            marcar={() => (vibrar(15), setHechos((n) => alternar(n, ej.nombre)))}
            abierto={abierto === ej.nombre}
            toggle={() => setAbierto(abierto === ej.nombre ? null : ej.nombre)}
            series={series[ej.nombre] || 0}
            tocarSerie={(i) => (vibrar(10), setSeries((x) => marcarSerie(x, ej.nombre, i)))}
            editando={editando}
            quitar={() => quitar(ej)}
            apuntar={apuntar}
            borrar={borrar}
          />
        ))}
        {editando && <NuevoEjercicio anadir={anadir} restaurar={restaurar} />}
      </main>

      {aviso && (
        <div style={s.aviso}>
          {aviso.medalla && <img src={aviso.medalla} alt="" className="medallon" style={s.avisoMedalla} />}
          {aviso.texto ?? aviso}
        </div>
      )}
      <Descanso />
    </div>
  );
}

function Ejercicio({ ej, registros, hecho, marcar, series, tocarSerie, editando, quitar, abierto, toggle, apuntar, borrar }) {
  const [peso, setPeso] = useState("");
  const [reps, setReps] = useState("");
  const [ampliada, setAmpliada] = useState(false);
  const ultimo = registros[0];

  const enviar = (e) => {
    e.preventDefault();
    if (!peso) return;
    // Cierra el teclado del móvil: si no, tapa el aviso de confirmación.
    e.currentTarget.querySelector("input")?.blur();
    apuntar(ej.nombre, peso, reps);
    setPeso("");
    setReps("");
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
        <h2 style={s.nombre}>{ej.nombre}</h2>
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

      <div style={s.badges}>
        <span style={s.badge}>{ej.series} series</span>
        <span style={s.badge}>{ej.reps} reps</span>
        {ultimo && <span style={s.badgeUltimo}>último: {ultimo.peso} kg</span>}
      </div>

      <div style={s.seriesFila}>
        {Array.from({ length: Number(ej.series) || 0 }, (_, i) => (
          <button
            key={i}
            onClick={() => tocarSerie(i)}
            style={{ ...s.serie, ...(i < series ? s.serieOn : null) }}
            aria-label={`Serie ${i + 1}${i < series ? " hecha" : ""}`}
            aria-pressed={i < series}
          >
            {i + 1}
          </button>
        ))}
        <span style={s.seriesTexto}>{series}/{ej.series} series</span>
      </div>

      <form onSubmit={enviar} style={s.form}>
        <input
          type="number"
          inputMode="decimal"
          step="0.5"
          placeholder="kg"
          enterKeyHint="done"
          value={peso}
          onChange={(e) => setPeso(e.target.value)}
          style={s.input}
        />
        <input
          type="number"
          inputMode="numeric"
          placeholder="reps"
          enterKeyHint="done"
          value={reps}
          onChange={(e) => setReps(e.target.value)}
          style={s.input}
        />
        <button type="submit" style={s.guardar}>Apuntar</button>
      </form>

      <button onClick={toggle} style={s.verMas}>
        {abierto ? "Ocultar histórico" : "Histórico (" + registros.length + ")"}
      </button>

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
    padding: "16px 14px calc(40px + env(safe-area-inset-bottom))",
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
  lema: {
    margin: "8px 0 0",
    fontSize: "13px",
    color: "#cbd5e1",
    fontWeight: 600,
  },
  foto: {
    width: "120px",
    height: "120px",
    objectFit: "cover",
    borderRadius: "50%",
    display: "block",
    border: "3px solid #0b1020",
  },
  titulo: { fontSize: "26px", margin: "14px 0 0", fontWeight: 900, letterSpacing: "-0.5px" },
  tabs: { display: "flex", gap: "8px", marginBottom: "20px" },
  tab: {
    flex: 1,
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
  tabGrupo: { fontSize: "12px" },
  sticky: {
    paddingTop: "10px",
    marginBottom: "18px",
  },
  perfiles: { display: "flex", gap: "8px", marginBottom: "14px" },
  perfil: {
    flex: 1,
    padding: "10px",
    borderRadius: "99px",
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.03)",
    color: "#94a3b8",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer",
  },
  perfilActivo: { background: "rgba(255,255,255,0.08)" },
  deQuien: { margin: "8px 0 0", fontSize: "12px", fontWeight: 700 },
  racha: {
    margin: "8px 0 0",
    fontSize: "13px",
    fontWeight: 700,
    color: "#fb923c",
  },
  seriesFila: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "12px" },
  serie: {
    width: "38px",
    height: "38px",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.04)",
    color: "#64748b",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer",
  },
  serieOn: {
    background: "rgba(59,130,246,0.25)",
    borderColor: "rgba(96,165,250,0.7)",
    color: "#fff",
  },
  seriesTexto: { fontSize: "12px", color: "#64748b", marginLeft: "auto" },
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
  lista: { display: "grid", gap: "18px" },
  card: {
    background: "linear-gradient(180deg, rgba(255,255,255,0.07), rgba(255,255,255,0.025))",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "22px",
    padding: "16px",
    backdropFilter: "blur(8px)",
    boxShadow: "0 10px 30px rgba(2,6,23,0.35)",
  },
  nombre: { flex: 1, minWidth: "110px", fontSize: "16px", margin: 0, fontWeight: 700 },
  miniCaja: {
    width: "84px",
    height: "84px",
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
    width: "84px",
    height: "84px",
    flexShrink: 0,
    borderRadius: "12px",
    background: "rgba(255,255,255,0.04)",
    fontSize: "40px",
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
    margin: "10px 0 0",
    fontSize: "14px",
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
  cabecera: {
    display: "flex",
    alignItems: "center",
    flexWrap: "wrap",
    gap: "10px",
    marginBottom: "12px",
  },
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
  avisoMedalla: { width: "26px", height: "26px", verticalAlign: "-6px", marginRight: "6px" },
  aviso: {
    position: "fixed",
    left: "50%",
    bottom: "calc(78px + env(safe-area-inset-bottom))",
    transform: "translateX(-50%)",
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

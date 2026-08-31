import { useEffect, useMemo, useState } from "react";
import {
  cargar, guardar, fechaCorta, delta,
  cargarHechos, guardarHechos, alternar,
  apuntar as apuntarEn, borrar as borrarEn,
} from "./historico.js";
import { fraseDelDia, celebracion, finDeDia } from "./frases.js";
import { traerHistorico, insertarRegistro, borrarRegistro } from "./supabase.js";

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
  const [diaActivo, setDiaActivo] = useState(0);
  const [historico, setHistorico] = useState(cargar);
  const [hechos, setHechos] = useState(cargarHechos);
  const [abierto, setAbierto] = useState(null);
  const [aviso, setAviso] = useState(null);

  const [sinConexion, setSinConexion] = useState(false);

  // Pinta ya con el cache local y luego sincroniza con Supabase.
  useEffect(() => {
    let vivo = true;
    traerHistorico()
      .then((datos) => vivo && (setHistorico(datos), setSinConexion(false)))
      .catch(() => vivo && setSinConexion(true));
    return () => {
      vivo = false;
    };
  }, []);

  useEffect(() => guardar(historico), [historico]);
  useEffect(() => guardarHechos(hechos), [hechos]);

  // El aviso se va solo a los 3s.
  useEffect(() => {
    if (!aviso) return;
    const t = setTimeout(() => setAviso(null), 3000);
    return () => clearTimeout(t);
  }, [aviso]);

  const apuntar = async (nombre, peso, reps) => {
    const d = delta(historico[nombre] || [], peso);
    let extra = {};
    try {
      extra = await insertarRegistro(nombre, peso, reps);
      setSinConexion(false);
    } catch {
      setSinConexion(true);
    }
    setHistorico((h) => apuntarEn(h, nombre, peso, reps, extra));
    setAviso(d === null ? "Primer registro guardado. ¡A por ello! ✨" : celebracion(d));
  };

  const borrar = async (nombre, i) => {
    const reg = (historico[nombre] || [])[i];
    setHistorico((h) => borrarEn(h, nombre, i));
    if (reg?.id) await borrarRegistro(reg.id).catch(() => setSinConexion(true));
  };

  const ejercicios = rutina[diaActivo].ejercicios;
  const completados = ejercicios.filter((e) => hechos.includes(e.nombre)).length;
  const porcentaje = Math.round((completados / ejercicios.length) * 100);
  const terminado = completados === ejercicios.length;

  const [remate, setRemate] = useState("");
  useEffect(() => setRemate(terminado ? finDeDia() : ""), [terminado, diaActivo]);
  const fraseFinal = useMemo(() => finDeDia(), [terminado, diaActivo]);

  return (
    <div style={s.page}>
      <header style={s.header}>
        <div style={s.halo}>
          <img src="/gymbro.jpeg" alt="Tu gymbro" className="foto" style={s.foto} />
        </div>
        <h1 className="titulo" style={s.titulo}>De parte de tu gymbro {"<3"}</h1>
        <p style={s.frase}>{fraseDelDia()}</p>
        <p style={s.lema}>Cada sesión te deja más fuerte de lo que ya estás 🦾</p>
        {sinConexion && <p style={s.offline}>Sin conexión: guardando solo en este móvil</p>}
      </header>

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
        </div>
        <div style={s.barra}>
          <div style={{ ...s.barraRelleno, width: `${porcentaje}%` }} />
        </div>
      </div>

      <main style={s.lista}>
        {ejercicios.map((ej) => (
          <Ejercicio
            key={ej.nombre}
            ej={ej}
            registros={historico[ej.nombre] || []}
            hecho={hechos.includes(ej.nombre)}
            marcar={() => setHechos((n) => alternar(n, ej.nombre))}
            abierto={abierto === ej.nombre}
            toggle={() => setAbierto(abierto === ej.nombre ? null : ej.nombre)}
            apuntar={apuntar}
            borrar={borrar}
          />
        ))}
      </main>

      {aviso && <div style={s.aviso}>{aviso}</div>}
    </div>
  );
}

function Ejercicio({ ej, registros, hecho, marcar, abierto, toggle, apuntar, borrar }) {
  const [peso, setPeso] = useState("");
  const [reps, setReps] = useState("");
  const ultimo = registros[0];

  const enviar = (e) => {
    e.preventDefault();
    if (!peso) return;
    apuntar(ej.nombre, peso, reps);
    setPeso("");
    setReps("");
  };

  return (
    <article className="card" style={{ ...s.card, ...(hecho ? s.cardHecha : null) }}>
      <div style={s.cabecera}>
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
      </div>

      <img src={ej.imagen} alt={ej.nombre} loading="lazy" style={s.gif} />

      <div style={s.badges}>
        <span style={s.badge}>{ej.series} series</span>
        <span style={s.badge}>{ej.reps} reps</span>
        {ultimo && <span style={s.badgeUltimo}>último: {ultimo.peso} kg</span>}
      </div>

      <form onSubmit={enviar} style={s.form}>
        <input
          type="number"
          inputMode="decimal"
          step="0.5"
          placeholder="kg"
          value={peso}
          onChange={(e) => setPeso(e.target.value)}
          style={s.input}
        />
        <input
          type="number"
          inputMode="numeric"
          placeholder="reps"
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
      )}
    </article>
  );
}

const s = {
  page: {
    minHeight: "100vh",
    background: "transparent",
    color: "#f8fafc",
    fontFamily: "'Outfit', system-ui, sans-serif",
    padding: "16px 14px 40px",
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
  lista: { display: "grid", gap: "18px" },
  card: {
    background: "linear-gradient(180deg, rgba(255,255,255,0.07), rgba(255,255,255,0.025))",
    border: "1px solid rgba(255,255,255,0.1)",
    borderRadius: "22px",
    padding: "16px",
    backdropFilter: "blur(8px)",
    boxShadow: "0 10px 30px rgba(2,6,23,0.35)",
  },
  nombre: { fontSize: "17px", margin: "0 0 12px", fontWeight: 700 },
  gif: {
    width: "100%",
    height: "180px",
    objectFit: "contain",
    background: "#fff",
    borderRadius: "12px",
    padding: "8px",
    boxSizing: "border-box",
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
  form: { display: "flex", gap: "8px" },
  input: {
    minWidth: 0,
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
    background: "transparent",
    border: "none",
    color: "#64748b",
    fontSize: "16px",
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
  cabecera: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" },
  cardHecha: {
    borderColor: "rgba(74,222,128,0.45)",
    background: "linear-gradient(180deg, rgba(74,222,128,0.12), rgba(74,222,128,0.03))",
    boxShadow: "0 10px 30px rgba(34,197,94,0.15)",
  },
  check: {
    marginLeft: "auto",
    flexShrink: 0,
    width: "34px",
    height: "34px",
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
  aviso: {
    position: "fixed",
    left: "50%",
    bottom: "24px",
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

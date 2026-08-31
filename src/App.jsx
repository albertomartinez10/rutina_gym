import { useEffect, useState } from "react";
import {
  cargar, guardar, fechaCorta, delta,
  cargarHechos, guardarHechos, alternar,
  apuntar as apuntarEn, borrar as borrarEn,
} from "./historico.js";
import { fraseDelDia, celebracion } from "./frases.js";

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
    grupo: "Cuádriceps 🦵",
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

  useEffect(() => guardar(historico), [historico]);
  useEffect(() => guardarHechos(hechos), [hechos]);

  // El aviso se va solo a los 3s.
  useEffect(() => {
    if (!aviso) return;
    const t = setTimeout(() => setAviso(null), 3000);
    return () => clearTimeout(t);
  }, [aviso]);

  const apuntar = (nombre, peso, reps) => {
    const d = delta(historico[nombre] || [], peso);
    setHistorico((h) => apuntarEn(h, nombre, peso, reps));
    setAviso(d === null ? "Primer registro guardado. ¡A por ello! ✨" : celebracion(d));
  };

  const borrar = (nombre, i) => setHistorico((h) => borrarEn(h, nombre, i));

  const ejercicios = rutina[diaActivo].ejercicios;
  const completados = ejercicios.filter((e) => hechos.includes(e.nombre)).length;
  const porcentaje = Math.round((completados / ejercicios.length) * 100);
  const terminado = completados === ejercicios.length;

  return (
    <div style={s.page}>
      <header style={s.header}>
        <img src="/gymbro.jpeg" alt="Tu gymbro" style={s.foto} />
        <h1 style={s.titulo}>De parte de tu gymbro {"<3"}</h1>
        <p style={s.frase}>{fraseDelDia()}</p>
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
          <span>{terminado ? "¡Día completado! 🎉" : `${completados} de ${ejercicios.length} hechos`}</span>
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
    <article style={{ ...s.card, ...(hecho ? s.cardHecha : null) }}>
      <div style={s.cabecera}>
        <h2 style={s.nombre}>{ej.nombre}</h2>
        <button
          onClick={marcar}
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
    background: "#0f172a",
    color: "#f8fafc",
    fontFamily: "'Outfit', system-ui, sans-serif",
    padding: "16px 14px 40px",
    maxWidth: "560px",
    margin: "0 auto",
    boxSizing: "border-box",
  },
  header: { textAlign: "center", marginBottom: "20px" },
  foto: {
    width: "120px",
    height: "120px",
    objectFit: "cover",
    borderRadius: "50%",
    border: "3px solid rgba(96,165,250,0.5)",
  },
  titulo: { fontSize: "24px", margin: "14px 0 0", fontWeight: 800 },
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
    background: "rgba(59,130,246,0.2)",
    borderColor: "rgba(59,130,246,0.5)",
    color: "#fff",
  },
  tabDia: { fontSize: "13px", fontWeight: 700 },
  tabGrupo: { fontSize: "12px" },
  lista: { display: "grid", gap: "18px" },
  card: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "20px",
    padding: "16px",
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
    padding: "12px 16px",
    borderRadius: "12px",
    border: "none",
    background: "#3b82f6",
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
  progresoCaja: { marginBottom: "20px" },
  progresoTexto: {
    display: "flex",
    justifyContent: "space-between",
    fontSize: "13px",
    color: "#94a3b8",
    marginBottom: "6px",
  },
  porcentaje: { color: "#4ade80", fontWeight: 700 },
  barra: {
    height: "8px",
    borderRadius: "99px",
    background: "rgba(255,255,255,0.06)",
    overflow: "hidden",
  },
  barraRelleno: {
    height: "100%",
    borderRadius: "99px",
    background: "linear-gradient(90deg,#3b82f6,#4ade80)",
    transition: "width .4s ease",
  },
  cabecera: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" },
  cardHecha: { borderColor: "rgba(74,222,128,0.35)", background: "rgba(74,222,128,0.05)" },
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
    background: "#22c55e",
    borderColor: "#22c55e",
    color: "#fff",
  },
  aviso: {
    position: "fixed",
    left: "50%",
    bottom: "24px",
    transform: "translateX(-50%)",
    width: "max-content",
    maxWidth: "90vw",
    background: "#1e293b",
    border: "1px solid rgba(74,222,128,0.4)",
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

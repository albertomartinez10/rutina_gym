import { useState } from "react";
import { GRUPOS, buscar } from "./catalogo.js";

export default function Galeria({ yaPuestos, anadir, cerrar }) {
  const [texto, setTexto] = useState("");
  const [grupo, setGrupo] = useState("");

  const resultados = buscar(texto, grupo);

  return (
    <div style={s.fondo} onClick={cerrar}>
      {/* La hoja se queda quieta: el clic de fuera es el que cierra */}
      <div style={s.hoja} onClick={(e) => e.stopPropagation()}>
        <div style={s.barra}>
          <div>
            <h2 style={s.titulo}>Galería de ejercicios</h2>
            <p style={s.pista}>Toca uno para añadirlo al día de hoy</p>
          </div>
          <button onClick={cerrar} style={s.cerrar} aria-label="Cerrar galería">✕</button>
        </div>

      <input
        placeholder="Buscar (press, curl, sentadilla…)"
        value={texto}
        onChange={(e) => setTexto(e.target.value)}
        style={s.buscador}
      />

      <div style={s.grupos}>
        <button
          onClick={() => setGrupo("")}
          style={{ ...s.grupo, ...(grupo === "" ? s.grupoOn : null) }}
        >
          Todos
        </button>
        {Object.entries(GRUPOS).map(([id, nombre]) => (
          <button
            key={id}
            onClick={() => setGrupo(id === grupo ? "" : id)}
            style={{ ...s.grupo, ...(grupo === id ? s.grupoOn : null) }}
          >
            {nombre}
          </button>
        ))}
      </div>

      {resultados.length === 0 && <p style={s.vacio}>Nada con ese nombre 🤔</p>}

      <div style={s.rejilla}>
        {resultados.map((e) => {
          const puesto = yaPuestos.includes(e.nombre);
          return (
            <button
              key={e.nombre}
              onClick={() => !puesto && anadir(e)}
              disabled={puesto}
              style={{ ...s.ficha, ...(puesto ? s.fichaPuesta : null) }}
            >
              <img src={e.imagen} alt="" loading="lazy" style={s.gif} />
              <span style={s.nombre}>{e.nombre}</span>
              <span style={s.estado}>{puesto ? "ya está" : "+ añadir"}</span>
            </button>
          );
        })}
      </div>
      </div>
    </div>
  );
}

const s = {
  fondo: {
    position: "fixed",
    inset: 0,
    zIndex: 40,
    background: "rgba(2,6,23,0.6)",
    backdropFilter: "blur(4px)",
    display: "flex",
    alignItems: "flex-end",
  },
  hoja: {
    width: "100%",
    maxHeight: "82vh",
    overflowY: "auto",
    padding: "16px 14px calc(20px + env(safe-area-inset-bottom))",
    borderRadius: "24px 24px 0 0",
    background: "#0f172a",
    border: "1px solid rgba(255,255,255,0.1)",
    animation: "hoja .25s ease",
  },
  barra: { display: "flex", alignItems: "flex-start", gap: "10px", marginBottom: "12px" },
  cerrar: {
    marginLeft: "auto",
    width: "36px",
    height: "36px",
    flexShrink: 0,
    borderRadius: "50%",
    border: "none",
    background: "rgba(255,255,255,0.08)",
    color: "#e2e8f0",
    fontSize: "15px",
    cursor: "pointer",
  },
  titulo: { margin: 0, fontSize: "16px", color: "#f8fafc" },
  pista: { margin: "2px 0 0", fontSize: "12px", color: "#64748b" },
  buscador: {
    width: "100%",
    boxSizing: "border-box",
    padding: "12px",
    fontSize: "16px",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.05)",
    color: "#fff",
    marginBottom: "10px",
  },
  grupos: { display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "8px", marginBottom: "6px" },
  grupo: {
    flexShrink: 0,
    padding: "7px 12px",
    borderRadius: "99px",
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.04)",
    color: "#94a3b8",
    fontSize: "12px",
    fontWeight: 700,
    cursor: "pointer",
  },
  grupoOn: { background: "rgba(59,130,246,0.25)", borderColor: "rgba(96,165,250,0.6)", color: "#fff" },
  rejilla: { display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(96px, 1fr))", gap: "8px" },
  ficha: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "4px",
    padding: "6px",
    borderRadius: "14px",
    border: "1px solid rgba(255,255,255,0.08)",
    background: "rgba(255,255,255,0.04)",
    color: "#e2e8f0",
    cursor: "pointer",
  },
  fichaPuesta: { opacity: 0.4, cursor: "default" },
  gif: { width: "100%", aspectRatio: "1", objectFit: "contain", background: "#fff", borderRadius: "10px" },
  nombre: { fontSize: "10px", lineHeight: 1.2, textAlign: "center", fontWeight: 600 },
  estado: { fontSize: "9px", color: "#60a5fa", fontWeight: 700 },
  vacio: { color: "#64748b", fontSize: "13px" },
};

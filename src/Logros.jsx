import { useState } from "react";
import { NIVELES, logros, siguienteMeta } from "./logros.js";

export default function Logros({ historico, perfil, ejercicios, color }) {
  const [abierto, setAbierto] = useState(false);
  const conseguidos = logros(historico, perfil);

  // Lo más cerca de caer: sirve de objetivo para la sesión de hoy.
  const metas = ejercicios
    .map((e) => ({ ejercicio: e.nombre, ...siguienteMeta(e.nombre, historico, perfil) }))
    .filter((m) => m.objetivo)
    .sort((a, b) => a.falta - b.falta)
    .slice(0, 3);

  return (
    <section style={s.caja}>
      <button onClick={() => setAbierto((v) => !v)} style={s.cabecera}>
        <span style={s.titulo}>🏅 Logros</span>
        <span style={{ ...s.cuenta, color }}>
          {conseguidos.length} de {ejercicios.length}
        </span>
        <span style={s.flecha}>{abierto ? "▲" : "▼"}</span>
      </button>

      {abierto && (
        <div style={s.cuerpo}>
          {conseguidos.length === 0 && (
            <p style={s.vacio}>Aún ninguno. Apunta un peso y empiezan a caer 🌱</p>
          )}

          {conseguidos.map((l) => (
            <div key={l.ejercicio} style={s.fila}>
              <span style={s.icono}>{l.icono}</span>
              <span style={s.nombre}>{l.ejercicio}</span>
              <span style={s.nivel}>
                {l.nombre} · {l.peso} kg
              </span>
            </div>
          ))}

          {metas.length > 0 && (
            <>
              <p style={s.subtitulo}>Lo próximo que puedes desbloquear</p>
              {metas.map((m) => (
                <div key={m.ejercicio} style={s.fila}>
                  <span style={s.icono}>{m.icono}</span>
                  <span style={s.nombre}>{m.ejercicio}</span>
                  <span style={s.meta}>
                    faltan {m.falta} kg → {m.objetivo} kg
                  </span>
                </div>
              ))}
            </>
          )}

          <p style={s.escalera}>
            {NIVELES.map((n) => `${n.icono} ${n.nombre}`).join("  ·  ")}
          </p>
        </div>
      )}
    </section>
  );
}

const s = {
  caja: {
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    borderRadius: "18px",
    marginBottom: "18px",
    overflow: "hidden",
  },
  cabecera: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    width: "100%",
    padding: "14px 16px",
    background: "transparent",
    border: "none",
    color: "#e2e8f0",
    fontSize: "15px",
    fontWeight: 700,
    cursor: "pointer",
  },
  titulo: { flex: 1, textAlign: "left" },
  cuenta: { fontSize: "13px", fontWeight: 800 },
  flecha: { fontSize: "11px", color: "#64748b" },
  cuerpo: { padding: "0 16px 14px" },
  fila: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    padding: "8px 0",
    borderTop: "1px solid rgba(255,255,255,0.06)",
    fontSize: "13px",
  },
  icono: { fontSize: "18px" },
  nombre: { flex: 1, color: "#e2e8f0" },
  nivel: { color: "#4ade80", fontWeight: 700, textAlign: "right" },
  meta: { color: "#94a3b8", textAlign: "right" },
  subtitulo: { margin: "14px 0 0", fontSize: "12px", color: "#64748b", fontWeight: 700 },
  vacio: { color: "#64748b", fontSize: "13px", margin: "4px 0" },
  escalera: { margin: "14px 0 0", fontSize: "11px", color: "#475569", lineHeight: 1.7 },
};

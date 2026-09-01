import { useState } from "react";
import { NIVELES, logros, siguienteMeta, nivelDe, mejorPeso, escala } from "./logros.js";

export default function Logros({ historico, perfil, ejercicios, color }) {
  const [abierto, setAbierto] = useState(false);
  const conseguidos = logros(historico, perfil);

  const metas = ejercicios
    .map((e) => ({ ejercicio: e.nombre, ...siguienteMeta(e.nombre, historico, perfil) }))
    .filter((m) => m.objetivo)
    .sort((a, b) => a.falta - b.falta)
    .slice(0, 3);

  return (
    <section style={s.caja}>
      <button onClick={() => setAbierto((v) => !v)} style={s.cabecera}>
        <span style={s.titulo}>Medallero</span>
        <span style={s.tira}>
          {NIVELES.map((n, i) => (
            <img
              key={n.nombre}
              src={n.medalla}
              alt=""
              style={{ ...s.chispa, ...(conseguidos.some((c) => c.nivel >= i) ? null : s.apagada) }}
            />
          ))}
        </span>
        <span style={{ ...s.cuenta, color }}>{conseguidos.length}</span>
        <span style={s.flecha}>{abierto ? "▲" : "▼"}</span>
      </button>

      {abierto && (
        <div style={s.cuerpo}>
          {conseguidos.length === 0 && (
            <p style={s.vacio}>Aún ninguna. Apunta un peso y empiezan a caer 🥉</p>
          )}

          {/* Una fila por ejercicio con las cinco medallas: se ve lo ganado y lo que queda. */}
          {ejercicios.map((e) => {
            const peso = mejorPeso(historico[e.nombre] || []);
            const nivel = nivelDe(e.nombre, peso, perfil);
            const umbrales = escala(e.nombre, perfil);
            return (
              <div key={e.nombre} style={s.fila}>
                <div style={s.info}>
                  <span style={s.nombre}>{e.nombre}</span>
                  {peso > 0 && <span style={s.marca}>tu récord: {peso} kg</span>}
                </div>
                <div style={s.medallas}>
                  {NIVELES.map((n, i) => (
                    <div key={n.nombre} style={s.hueco} title={`${n.nombre} · ${umbrales[i]} kg`}>
                      <img
                        src={n.medalla}
                        alt={i <= nivel ? `${n.nombre} conseguida` : `${n.nombre}, bloqueada`}
                        style={{ ...s.medalla, ...(i <= nivel ? null : s.apagada) }}
                      />
                      <span style={{ ...s.kg, ...(i <= nivel ? { color: "#4ade80" } : null) }}>
                        {umbrales[i]}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}

          {metas.length > 0 && (
            <>
              <p style={s.subtitulo}>Lo próximo que puedes desbloquear</p>
              {metas.map((m) => (
                <div key={m.ejercicio} style={s.proxima}>
                  <img src={m.medalla} alt="" style={{ ...s.medalla, ...s.casi }} />
                  <span style={s.nombre}>{m.ejercicio}</span>
                  <span style={s.meta}>
                    faltan {m.falta} kg → {m.objetivo} kg
                  </span>
                </div>
              ))}
            </>
          )}
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
    gap: "8px",
    width: "100%",
    padding: "12px 14px",
    background: "transparent",
    border: "none",
    color: "#e2e8f0",
    fontSize: "15px",
    fontWeight: 700,
    cursor: "pointer",
  },
  titulo: { textAlign: "left" },
  tira: { display: "flex", gap: "2px", marginLeft: "auto" },
  chispa: { width: "18px", height: "18px" },
  cuenta: { fontSize: "14px", fontWeight: 800, minWidth: "16px" },
  flecha: { fontSize: "11px", color: "#64748b" },
  cuerpo: { padding: "0 14px 14px" },
  fila: { padding: "10px 0", borderTop: "1px solid rgba(255,255,255,0.06)" },
  info: { display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "6px" },
  nombre: { flex: 1, fontSize: "13px", fontWeight: 600, color: "#e2e8f0" },
  marca: { fontSize: "11px", color: "#4ade80", fontWeight: 700 },
  medallas: { display: "flex", gap: "6px" },
  hueco: { display: "flex", flexDirection: "column", alignItems: "center", gap: "2px", flex: 1 },
  medalla: { width: "30px", height: "30px" },
  // Sin conseguir: apagadas, pero se ven, que es lo que da ganas de ir a por ellas.
  apagada: { filter: "grayscale(1) brightness(0.45)", opacity: 0.65 },
  casi: { width: "22px", height: "22px" },
  kg: { fontSize: "10px", color: "#64748b", fontWeight: 700 },
  proxima: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "7px 0",
    fontSize: "13px",
  },
  subtitulo: { margin: "14px 0 2px", fontSize: "12px", color: "#64748b", fontWeight: 700 },
  vacio: { color: "#64748b", fontSize: "13px", margin: "4px 0" },
  meta: { color: "#94a3b8", fontSize: "12px", textAlign: "right" },
};

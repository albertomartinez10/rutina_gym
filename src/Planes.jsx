import { useEffect, useState } from "react";
import { traerPlanes, anadirPlan, marcarPlan, borrarPlan } from "./supabase.js";
import { datosPerfil } from "./perfiles.js";

export default function Planes({ perfil, color, avisar }) {
  const [planes, setPlanes] = useState([]);
  const [texto, setTexto] = useState("");
  const [verHechos, setVerHechos] = useState(true);

  useEffect(() => {
    let vivo = true;
    traerPlanes()
      .then((p) => vivo && setPlanes(p))
      .catch(() => avisar?.("No se han podido cargar los planes"));
    return () => {
      vivo = false;
    };
  }, [avisar]);

  const hechos = planes.filter((p) => p.hecho).length;
  const visibles = verHechos ? planes : planes.filter((p) => !p.hecho);

  const alternar = async (plan) => {
    const hecho = !plan.hecho;
    navigator.vibrate?.(hecho ? [40, 30, 60] : 15);
    setPlanes((x) => x.map((p) => (p.id === plan.id ? { ...p, hecho, hecho_por: hecho ? perfil : null } : p)));
    await marcarPlan(plan.id, hecho, perfil).catch(() => avisar?.("No se ha podido guardar"));
    if (hecho) avisar?.(`¡${plan.texto} hecho! 🎉`);
  };

  const anadir = async (e) => {
    e.preventDefault();
    if (!texto.trim()) return;
    const orden = Math.max(0, ...planes.map((p) => p.orden)) + 1;
    setTexto("");
    try {
      const nuevo = await anadirPlan(texto, orden);
      setPlanes((x) => [...x, nuevo]);
    } catch {
      avisar?.("No se ha podido añadir el plan");
    }
  };

  const quitar = async (id) => {
    setPlanes((x) => x.filter((p) => p.id !== id));
    await borrarPlan(id).catch(() => {});
  };

  return (
    <section>
      <div style={s.barra}>
        <h2 style={s.titulo}>Planes que hacer</h2>
        <span style={{ ...s.cuenta, color }}>
          {hechos} de {planes.length}
        </span>
      </div>

      <div style={s.progreso}>
        <div
          style={{
            ...s.relleno,
            width: planes.length ? `${(hechos / planes.length) * 100}%` : "0%",
            background: color,
          }}
        />
      </div>

      <form onSubmit={anadir} style={s.form}>
        <input
          placeholder="Añadir un plan nuevo…"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          maxLength={200}
          enterKeyHint="done"
          style={s.input}
        />
        <button type="submit" style={s.anadir} disabled={!texto.trim()}>
          +
        </button>
      </form>

      <button onClick={() => setVerHechos((v) => !v)} style={s.filtro}>
        {verHechos ? "Ocultar los ya hechos" : `Ver también los hechos (${hechos})`}
      </button>

      <ul style={s.lista}>
        {visibles.map((p) => (
          <li key={p.id} style={s.plan}>
            <button
              onClick={() => alternar(p)}
              style={{ ...s.casilla, ...(p.hecho ? { background: color, borderColor: color } : null) }}
              aria-pressed={p.hecho}
              aria-label={p.hecho ? `Desmarcar ${p.texto}` : `Marcar ${p.texto}`}
            >
              {p.hecho ? "✓" : ""}
            </button>

            <span style={{ ...s.texto, ...(p.hecho ? s.tachado : null) }}>
              {p.texto}
              {p.hecho && p.hecho_por && (
                <span style={{ ...s.quien, color: datosPerfil(p.hecho_por).color }}>
                  {" "}
                  {datosPerfil(p.hecho_por).emoji}
                </span>
              )}
            </span>

            <button onClick={() => quitar(p.id)} style={s.borrar} aria-label={`Borrar ${p.texto}`}>
              ✕
            </button>
          </li>
        ))}
      </ul>

      {planes.length > 0 && hechos === planes.length && (
        <p style={s.fin}>¡Los habéis hecho todos! Toca inventar más 🎉</p>
      )}
    </section>
  );
}

const s = {
  barra: { display: "flex", alignItems: "baseline", gap: "10px", marginBottom: "8px" },
  titulo: { flex: 1, margin: 0, fontSize: "18px", color: "#f8fafc" },
  cuenta: { fontSize: "14px", fontWeight: 800 },
  progreso: { height: "6px", borderRadius: "99px", background: "rgba(255,255,255,0.06)", overflow: "hidden" },
  relleno: { height: "100%", borderRadius: "99px", transition: "width .4s ease" },
  form: { display: "flex", gap: "8px", margin: "14px 0 10px" },
  input: {
    flex: 1,
    minWidth: 0,
    padding: "12px",
    fontSize: "16px",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.05)",
    color: "#fff",
  },
  anadir: {
    width: "48px",
    flexShrink: 0,
    borderRadius: "12px",
    border: "none",
    background: "#3b82f6",
    color: "#fff",
    fontSize: "22px",
    fontWeight: 700,
    cursor: "pointer",
  },
  filtro: {
    width: "100%",
    padding: "8px",
    marginBottom: "6px",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.08)",
    background: "transparent",
    color: "#64748b",
    fontSize: "12px",
    cursor: "pointer",
  },
  lista: { listStyle: "none", padding: 0, margin: 0, display: "grid", gap: "2px" },
  plan: { display: "flex", alignItems: "center", gap: "10px", padding: "8px 2px" },
  casilla: {
    width: "26px",
    height: "26px",
    flexShrink: 0,
    borderRadius: "8px",
    border: "1.5px solid rgba(255,255,255,0.25)",
    background: "transparent",
    color: "#0b1020",
    fontSize: "14px",
    fontWeight: 800,
    cursor: "pointer",
  },
  texto: { flex: 1, fontSize: "14px", color: "#e2e8f0", lineHeight: 1.35 },
  tachado: { textDecoration: "line-through", color: "#475569" },
  quien: { fontSize: "12px" },
  borrar: {
    width: "30px",
    flexShrink: 0,
    background: "transparent",
    border: "none",
    color: "#334155",
    fontSize: "13px",
    cursor: "pointer",
  },
  fin: { marginTop: "16px", textAlign: "center", fontSize: "14px", color: "#4ade80", fontWeight: 700 },
};

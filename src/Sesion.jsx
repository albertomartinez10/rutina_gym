import { sesionDe } from "./sesiones.js";
import { fechaCorta, hoy } from "./historico.js";

// Lo que se hizo un día concreto: el entreno entero, no ejercicio a ejercicio.
export default function Sesion({ historico, fecha, color }) {
  const s = sesionDe(historico, fecha);
  if (!s.ejercicios.length) return null;

  return (
    <section style={e.caja}>
      <div style={e.barra}>
        <h3 style={e.titulo}>{fecha === hoy() ? "Entreno de hoy" : `Entreno del ${fechaCorta(fecha)}`}</h3>
        <span style={{ ...e.resumen, color }}>
          {s.totalSeries} series · {s.volumen.toLocaleString("es-ES")} kg
        </span>
      </div>

      {s.ejercicios.map((ej) => (
        <div key={ej.nombre} style={e.ejercicio}>
          <span style={e.nombre}>{ej.nombre}</span>
          <span style={e.series}>
            {ej.series
              .map((r) => `${r.peso}${r.reps ? `×${r.reps}` : ""}${r.calentamiento ? " (W)" : ""}`)
              .join("  ·  ")}
          </span>
        </div>
      ))}
    </section>
  );
}

const e = {
  caja: {
    marginTop: "12px",
    padding: "12px",
    borderRadius: "16px",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
  },
  barra: { display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "8px" },
  titulo: { flex: 1, margin: 0, fontSize: "14px", color: "#f8fafc" },
  resumen: { fontSize: "12px", fontWeight: 700 },
  ejercicio: { padding: "6px 0", borderTop: "1px solid rgba(255,255,255,0.06)" },
  nombre: { display: "block", fontSize: "13px", color: "#e2e8f0", fontWeight: 600 },
  series: { fontSize: "12px", color: "#94a3b8" },
};

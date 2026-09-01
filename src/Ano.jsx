import { columnasDelAno, inicioDeMeses, hoy } from "./historico.js";

const MESES = ["Ene", "Feb", "Mar", "Abr", "May", "Jun", "Jul", "Ago", "Sep", "Oct", "Nov", "Dic"];

export default function Ano({ ano, marcados, color, onDia, cambiarAno }) {
  const columnas = columnasDelAno(ano);
  const meses = inicioDeMeses(columnas);
  const total = [...marcados].filter((f) => f.startsWith(`${ano}-`)).length;

  return (
    <section style={s.caja}>
      <div style={s.barra}>
        <button onClick={() => cambiarAno(ano - 1)} style={s.mover} aria-label="Año anterior">‹</button>
        <h2 style={s.ano}>{ano}</h2>
        <span style={{ ...s.total, color }}>{total} días de gym</span>
        <button onClick={() => cambiarAno(ano + 1)} style={s.mover} aria-label="Año siguiente">›</button>
      </div>

      {/* En móvil no caben 53 semanas: se desliza a lo ancho. */}
      <div style={s.scroll}>
        <div>
          <div style={{ ...s.meses, gridTemplateColumns: `repeat(${columnas.length}, 11px)` }}>
            {MESES.map((m, i) => (
              <span key={m} style={{ ...s.mes, gridColumnStart: (meses[i] ?? 0) + 1 }}>
                {m}
              </span>
            ))}
          </div>

          <div style={{ ...s.rejilla, gridTemplateColumns: `repeat(${columnas.length}, 11px)` }}>
            {columnas.map((semana, i) =>
              semana.map((fecha, j) => (
                <button
                  key={`${i}-${j}`}
                  onClick={() => fecha && onDia(fecha)}
                  disabled={!fecha}
                  title={fecha || ""}
                  aria-label={fecha ? `${fecha}${marcados.has(fecha) ? ": entrenaste" : ""}` : ""}
                  style={{
                    ...s.celda,
                    ...(fecha ? null : s.fuera),
                    ...(fecha && marcados.has(fecha) ? { background: color } : null),
                    ...(fecha === hoy() ? s.hoy : null),
                  }}
                />
              )),
            )}
          </div>
        </div>
      </div>
    </section>
  );
}

const s = {
  caja: { marginBottom: "20px" },
  barra: { display: "flex", alignItems: "center", gap: "8px", marginBottom: "10px" },
  ano: { fontSize: "20px", margin: 0, color: "#f8fafc", fontWeight: 800 },
  total: { flex: 1, fontSize: "12px", fontWeight: 700 },
  mover: {
    width: "32px",
    height: "32px",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.04)",
    color: "#e2e8f0",
    fontSize: "16px",
    cursor: "pointer",
  },
  scroll: { overflowX: "auto", paddingBottom: "4px" },
  meses: { display: "grid", gap: "2px", marginBottom: "4px" },
  mes: { fontSize: "10px", color: "#64748b", fontWeight: 700, gridRow: 1 },
  rejilla: { display: "grid", gridAutoFlow: "column", gridTemplateRows: "repeat(7, 11px)", gap: "2px" },
  celda: {
    width: "11px",
    height: "11px",
    padding: 0,
    borderRadius: "3px",
    border: "none",
    background: "rgba(255,255,255,0.07)",
    cursor: "pointer",
  },
  fuera: { background: "transparent", cursor: "default" },
  hoy: { outline: "1px solid rgba(255,255,255,0.5)", outlineOffset: "1px" },
};

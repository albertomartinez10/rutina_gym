import { useEffect, useState } from "react";
import { traerMedidas, guardarMedida } from "./supabase.js";
import { fechaCorta, hoy } from "./historico.js";
import Grafica from "./Grafica.jsx";

// Peso corporal: un apunte por día, con su gráfica.
export default function Peso({ perfil, color, avisar }) {
  const [medidas, setMedidas] = useState([]);
  const [peso, setPeso] = useState("");
  const [abierto, setAbierto] = useState(false);

  useEffect(() => {
    let vivo = true;
    traerMedidas(perfil)
      .then((m) => vivo && setMedidas(m))
      .catch(() => {});
    return () => {
      vivo = false;
    };
  }, [perfil]);

  const ultimo = medidas[0];
  const anterior = medidas[1];
  const cambio = ultimo && anterior ? Math.round((ultimo.peso - anterior.peso) * 10) / 10 : null;

  const guardar = async (ev) => {
    ev.preventDefault();
    if (!peso) return;
    try {
      const fila = await guardarMedida(perfil, hoy(), peso);
      setMedidas((m) => [fila, ...m.filter((x) => x.fecha !== fila.fecha)]);
      setPeso("");
      avisar?.("Peso apuntado ⚖️");
    } catch {
      avisar?.("No se ha podido guardar el peso");
    }
  };

  return (
    <section style={s.caja}>
      <button onClick={() => setAbierto((v) => !v)} style={s.cabecera}>
        <span style={s.titulo}>⚖️ Tu peso</span>
        {ultimo && (
          <span style={{ ...s.valor, color }}>
            {ultimo.peso} kg
            {cambio !== null && cambio !== 0 && (
              <span style={s.cambio}>
                {" "}
                {cambio > 0 ? "+" : ""}
                {cambio}
              </span>
            )}
          </span>
        )}
        <span style={s.flecha}>{abierto ? "▲" : "▼"}</span>
      </button>

      {abierto && (
        <div style={s.cuerpo}>
          <form onSubmit={guardar} style={s.form}>
            <input
              type="number"
              step="0.1"
              inputMode="decimal"
              placeholder={ultimo ? String(ultimo.peso) : "kg"}
              value={peso}
              onChange={(e) => setPeso(e.target.value)}
              style={s.input}
              aria-label="Peso de hoy"
            />
            <button type="submit" style={s.guardar} disabled={!peso}>
              Apuntar
            </button>
          </form>

          <Grafica pesos={medidas.map((m) => Number(m.peso)).reverse().slice(-12)} />

          <ul style={s.lista}>
            {medidas.slice(0, 6).map((m) => (
              <li key={m.id} style={s.fila}>
                <span style={s.fecha}>{fechaCorta(m.fecha)}</span>
                <span>{m.peso} kg</span>
              </li>
            ))}
            {medidas.length === 0 && <li style={s.vacio}>Aún no has apuntado tu peso</li>}
          </ul>
        </div>
      )}
    </section>
  );
}

const s = {
  caja: {
    marginBottom: "16px",
    borderRadius: "16px",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
    overflow: "hidden",
  },
  cabecera: {
    display: "flex",
    alignItems: "center",
    gap: "10px",
    width: "100%",
    padding: "12px 14px",
    background: "transparent",
    border: "none",
    color: "#e2e8f0",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer",
  },
  titulo: { flex: 1, textAlign: "left" },
  valor: { fontSize: "14px", fontWeight: 800 },
  cambio: { fontSize: "12px", color: "#64748b" },
  flecha: { fontSize: "11px", color: "#64748b" },
  cuerpo: { padding: "0 14px 14px" },
  form: { display: "flex", gap: "8px", marginBottom: "6px" },
  input: {
    flex: 1,
    minWidth: 0,
    padding: "11px",
    fontSize: "16px",
    textAlign: "center",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.05)",
    color: "#fff",
  },
  guardar: {
    padding: "11px 16px",
    borderRadius: "12px",
    border: "none",
    background: "#3b82f6",
    color: "#fff",
    fontWeight: 700,
    fontSize: "14px",
    cursor: "pointer",
  },
  lista: { listStyle: "none", padding: 0, margin: "10px 0 0" },
  fila: {
    display: "flex",
    justifyContent: "space-between",
    padding: "7px 0",
    borderTop: "1px solid rgba(255,255,255,0.06)",
    fontSize: "13px",
    color: "#cbd5e1",
  },
  fecha: { color: "#64748b" },
  vacio: { color: "#64748b", fontSize: "13px" },
};

import { useState } from "react";
import { semanasDelMes, diasEntrenados, hoy, fechaCorta } from "./historico.js";
import { guardarEntreno, borrarEntreno, urlFoto } from "./supabase.js";

const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];
const DIAS = ["L", "M", "X", "J", "V", "S", "D"];

export default function Calendario({ historico, entrenos, setEntrenos, perfil, color, avisar }) {
  const ahora = new Date();
  const [ano, setAno] = useState(ahora.getFullYear());
  const [mes, setMes] = useState(ahora.getMonth());
  const [dia, setDia] = useState(hoy());
  const [subiendo, setSubiendo] = useState(false);

  const marcados = diasEntrenados(historico, entrenos);
  const delDia = entrenos.filter((e) => e.fecha === dia);
  const totalMes = [...marcados].filter((f) => f.startsWith(`${ano}-${String(mes + 1).padStart(2, "0")}`)).length;

  const mover = (paso) => {
    const d = new Date(ano, mes + paso, 1);
    setAno(d.getFullYear());
    setMes(d.getMonth());
  };

  const subir = async (e) => {
    const archivo = e.target.files?.[0];
    e.target.value = "";
    if (!archivo) return;

    setSubiendo(true);
    try {
      const fila = await guardarEntreno(perfil, dia, archivo, null);
      setEntrenos((x) => [fila, ...x]);
      avisar?.("Foto guardada 📸");
    } catch {
      avisar?.("No se ha podido subir la foto");
    }
    setSubiendo(false);
  };

  const quitar = async (entreno) => {
    setEntrenos((x) => x.filter((e) => e.id !== entreno.id));
    await borrarEntreno(entreno.id, entreno.foto).catch(() => {});
  };

  return (
    <section>
      <div style={s.barra}>
        <button onClick={() => mover(-1)} style={s.mover} aria-label="Mes anterior">‹</button>
        <div style={s.mes}>
          <strong>{MESES[mes]} {ano}</strong>
          <span style={{ ...s.total, color }}>{totalMes} días</span>
        </div>
        <button onClick={() => mover(1)} style={s.mover} aria-label="Mes siguiente">›</button>
      </div>

      <div style={s.semana}>
        {DIAS.map((d, i) => (
          <span key={i} style={s.nombreDia}>{d}</span>
        ))}
      </div>

      {semanasDelMes(ano, mes).map((semana, i) => (
        <div key={i} style={s.semana}>
          {semana.map((fecha, j) => {
            if (!fecha) return <span key={j} />;
            const entrenado = marcados.has(fecha);
            const conFoto = entrenos.some((e) => e.fecha === fecha && e.foto);
            return (
              <button
                key={j}
                onClick={() => setDia(fecha)}
                style={{
                  ...s.dia,
                  ...(entrenado ? { ...s.entrenado, borderColor: color } : null),
                  ...(fecha === dia ? { ...s.elegido, background: color } : null),
                  ...(fecha === hoy() ? s.hoy : null),
                }}
              >
                {Number(fecha.slice(8))}
                {conFoto && <span style={s.punto}>📷</span>}
              </button>
            );
          })}
        </div>
      ))}

      <div style={s.detalle}>
        <h2 style={s.titulo}>
          {dia === hoy() ? "Hoy" : fechaCorta(dia)}
          {marcados.has(dia) && <span style={s.hecho}> · entrenaste 💪</span>}
        </h2>

        <label style={{ ...s.subir, opacity: subiendo ? 0.6 : 1 }}>
          {subiendo ? "Subiendo…" : "📷 Añadir foto del entreno"}
          {/* capture deja abrir la cámara directamente desde el móvil */}
          <input type="file" accept="image/*" onChange={subir} disabled={subiendo} style={{ display: "none" }} />
        </label>

        {delDia.length === 0 && <p style={s.vacio}>Sin fotos de este día todavía</p>}

        <div style={s.galeria}>
          {delDia.filter((e) => e.foto).map((e) => (
            <figure key={e.id} style={s.marco}>
              <img src={urlFoto(e.foto)} alt={`Entreno del ${e.fecha}`} loading="lazy" style={s.foto} />
              <button onClick={() => quitar(e)} style={s.borrar} aria-label="Borrar foto">✕</button>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}

const s = {
  barra: { display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" },
  mover: {
    width: "42px",
    height: "42px",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.04)",
    color: "#e2e8f0",
    fontSize: "20px",
    cursor: "pointer",
  },
  mes: { flex: 1, textAlign: "center", color: "#e2e8f0", fontSize: "16px" },
  total: { display: "block", fontSize: "12px", fontWeight: 700 },
  semana: { display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "4px", marginBottom: "4px" },
  nombreDia: { textAlign: "center", fontSize: "11px", color: "#64748b", fontWeight: 700 },
  dia: {
    position: "relative",
    aspectRatio: "1",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.06)",
    background: "rgba(255,255,255,0.02)",
    color: "#94a3b8",
    fontSize: "13px",
    cursor: "pointer",
  },
  entrenado: { background: "rgba(74,222,128,0.12)", color: "#fff", fontWeight: 700, borderWidth: "1px" },
  elegido: { color: "#0b1020", fontWeight: 800 },
  hoy: { outline: "2px solid rgba(255,255,255,0.25)" },
  punto: { position: "absolute", bottom: "1px", right: "2px", fontSize: "9px" },
  detalle: { marginTop: "18px" },
  titulo: { fontSize: "16px", margin: "0 0 10px", color: "#f8fafc" },
  hecho: { color: "#4ade80", fontSize: "13px", fontWeight: 700 },
  subir: {
    display: "block",
    textAlign: "center",
    padding: "14px",
    borderRadius: "14px",
    border: "1px dashed rgba(255,255,255,0.2)",
    color: "#cbd5e1",
    fontSize: "14px",
    fontWeight: 600,
    cursor: "pointer",
  },
  vacio: { color: "#64748b", fontSize: "13px", marginTop: "12px" },
  galeria: { display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "10px", marginTop: "12px" },
  marco: { position: "relative", margin: 0 },
  foto: { width: "100%", aspectRatio: "3 / 4", objectFit: "cover", borderRadius: "14px", display: "block" },
  borrar: {
    position: "absolute",
    top: "6px",
    right: "6px",
    width: "30px",
    height: "30px",
    borderRadius: "50%",
    border: "none",
    background: "rgba(0,0,0,0.6)",
    color: "#fff",
    fontSize: "14px",
    cursor: "pointer",
  },
};

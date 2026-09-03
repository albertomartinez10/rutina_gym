import { useState } from "react";
import { semanasDelMes, diasEntrenados, hoy, fechaCorta } from "./historico.js";
import { guardarEntreno, borrarEntreno, urlFoto, reaccionar, quitarReaccion, comentar, borrarComentario } from "./supabase.js";
import { comprimir } from "./foto.js";
import { datosPerfil } from "./perfiles.js";
import Ano from "./Ano.jsx";
import Sesion from "./Sesion.jsx";
import Peso from "./Peso.jsx";

const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];
const DIAS = ["L", "M", "X", "J", "V", "S", "D"];
const EMOJIS = ["❤️", "🔥", "💪", "😮"];

export default function Calendario({ historico, entrenos, setEntrenos, perfil, color, avisar }) {
  const [comoProgreso, setComoProgreso] = useState(false);
  const ahora = new Date();
  const [ano, setAno] = useState(ahora.getFullYear());
  const [mes, setMes] = useState(ahora.getMonth());
  const [dia, setDia] = useState(hoy());
  const [subiendo, setSubiendo] = useState(false);

  const mios = entrenos.filter((e) => e.perfil === perfil);
  const marcados = diasEntrenados(historico, mios);
  const delDia = entrenos.filter((e) => e.fecha === dia && e.foto);
  const progreso = entrenos.filter((e) => e.tipo === "progreso" && e.foto && e.perfil === perfil);
  const totalMes = [...marcados].filter((f) => f.startsWith(`${ano}-${String(mes + 1).padStart(2, "0")}`)).length;

  const irA = (fecha) => {
    setAno(Number(fecha.slice(0, 4)));
    setMes(Number(fecha.slice(5, 7)) - 1);
    setDia(fecha);
  };

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
      const fila = await guardarEntreno(perfil, dia, await comprimir(archivo), null, comoProgreso ? "progreso" : "entreno");
      setEntrenos((x) => [{ ...fila, reacciones: [], comentarios: [] }, ...x]);
      avisar?.("Foto guardada 📸");
    } catch {
      avisar?.("No se ha podido subir la foto");
    }
    setSubiendo(false);
  };

  const alternarReaccion = async (entreno, emoji) => {
    const mia = (entreno.reacciones || []).find((r) => r.perfil === perfil && r.emoji === emoji);
    // Optimista: la reacción se ve al instante y luego se confirma.
    setEntrenos((x) =>
      x.map((e) =>
        e.id !== entreno.id
          ? e
          : {
              ...e,
              reacciones: mia
                ? e.reacciones.filter((r) => r.id !== mia.id)
                : [...(e.reacciones || []), { id: `tmp-${emoji}`, perfil, emoji }],
            },
      ),
    );

    try {
      if (mia) {
        await quitarReaccion(mia.id);
      } else {
        const nueva = await reaccionar(entreno.id, perfil, emoji);
        setEntrenos((x) =>
          x.map((e) =>
            e.id !== entreno.id
              ? e
              : { ...e, reacciones: e.reacciones.map((r) => (r.id === `tmp-${emoji}` ? nueva : r)) },
          ),
        );
      }
    } catch {
      avisar?.("No se ha podido guardar la reacción");
    }
  };

  const enviarComentario = async (entreno, texto) => {
    try {
      const nuevo = await comentar(entreno.id, perfil, texto);
      setEntrenos((x) =>
        x.map((e) => (e.id === entreno.id ? { ...e, comentarios: [...(e.comentarios || []), nuevo] } : e)),
      );
    } catch {
      avisar?.("No se ha podido enviar el comentario");
    }
  };

  const quitarComentario = async (entreno, id) => {
    setEntrenos((x) =>
      x.map((e) => (e.id === entreno.id ? { ...e, comentarios: e.comentarios.filter((c) => c.id !== id) } : e)),
    );
    await borrarComentario(id).catch(() => {});
  };

  const quitar = async (entreno) => {
    setEntrenos((x) => x.filter((e) => e.id !== entreno.id));
    await borrarEntreno(entreno.id, entreno.foto).catch(() => {});
  };

  return (
    <section>
      <Peso perfil={perfil} color={color} avisar={avisar} />

      <Ano
        ano={ano}
        marcados={marcados}
        color={color}
        onDia={irA}
        cambiarAno={(nuevo) => setAno(nuevo)}
      />

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

        <Sesion historico={historico} fecha={dia} color={color} />

        <label style={s.tipoFoto}>
          <input
            type="checkbox"
            checked={comoProgreso}
            onChange={(e) => setComoProgreso(e.target.checked)}
            style={{ width: "18px", height: "18px" }}
          />
          Es foto de progreso (para comparar cómo vas)
        </label>

        <label style={{ ...s.subir, opacity: subiendo ? 0.6 : 1 }}>
          {subiendo ? "Subiendo…" : "📷 Añadir foto del entreno"}
          {/* capture deja abrir la cámara directamente desde el móvil */}
          <input type="file" accept="image/*" onChange={subir} disabled={subiendo} style={{ display: "none" }} />
        </label>

        {delDia.length === 0 && <p style={s.vacio}>Sin fotos de este día todavía</p>}

        {progreso.length > 1 && (
          <div style={s.progresoCaja}>
            <p style={s.progresoTitulo}>📸 Tu progreso ({progreso.length} fotos)</p>
            <div style={s.tira}>
              {[...progreso].reverse().map((p) => (
                <figure key={p.id} style={s.tiraItem}>
                  <img src={urlFoto(p.foto)} alt={`Progreso del ${p.fecha}`} loading="lazy" style={s.tiraFoto} />
                  <figcaption style={s.tiraFecha}>{fechaCorta(p.fecha)}</figcaption>
                </figure>
              ))}
            </div>
          </div>
        )}

        <div style={s.galeria}>
          {delDia.map((e) => {
            const suyo = datosPerfil(e.perfil);
            return (
              <figure key={e.id} style={s.marco}>
                <img src={urlFoto(e.foto)} alt={`Entreno de ${suyo.nombre}`} loading="lazy" style={s.foto} />
                <span style={{ ...s.autor, color: suyo.color }}>{suyo.emoji} {suyo.nombre}</span>
                {e.perfil === perfil && (
                  <button onClick={() => quitar(e)} style={s.borrar} aria-label="Borrar foto">✕</button>
                )}
                <div style={s.reacciones}>
                  {EMOJIS.map((emoji) => {
                    const cuantas = (e.reacciones || []).filter((r) => r.emoji === emoji);
                    const mia = cuantas.some((r) => r.perfil === perfil);
                    return (
                      <button
                        key={emoji}
                        onClick={() => alternarReaccion(e, emoji)}
                        style={{ ...s.reaccion, ...(mia ? s.reaccionMia : null) }}
                        aria-pressed={mia}
                      >
                        {emoji}{cuantas.length > 0 && <span style={s.cuantas}>{cuantas.length}</span>}
                      </button>
                    );
                  })}
                </div>

                <Comentarios
                  entreno={e}
                  perfil={perfil}
                  enviar={(t) => enviarComentario(e, t)}
                  quitar={(id) => quitarComentario(e, id)}
                />
              </figure>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Comentarios({ entreno, perfil, enviar, quitar }) {
  const [texto, setTexto] = useState("");
  const lista = [...(entreno.comentarios || [])].sort((a, b) => a.created_at.localeCompare(b.created_at));

  const mandar = (e) => {
    e.preventDefault();
    if (!texto.trim()) return;
    enviar(texto);
    setTexto("");
  };

  return (
    <div style={c.caja}>
      {lista.map((com) => {
        const suyo = datosPerfil(com.perfil);
        return (
          <p key={com.id} style={c.linea}>
            <strong style={{ color: suyo.color }}>{suyo.nombre}</strong> {com.texto}
            {com.perfil === perfil && (
              <button onClick={() => quitar(com.id)} style={c.borrar} aria-label="Borrar comentario">✕</button>
            )}
          </p>
        );
      })}

      <form onSubmit={mandar} style={c.form}>
        <input
          placeholder="Escribe un comentario…"
          value={texto}
          onChange={(e) => setTexto(e.target.value)}
          maxLength={500}
          enterKeyHint="send"
          style={c.input}
        />
        <button type="submit" style={c.enviar} disabled={!texto.trim()}>Enviar</button>
      </form>
    </div>
  );
}

const c = {
  caja: { marginTop: "8px" },
  linea: {
    display: "flex",
    alignItems: "baseline",
    gap: "6px",
    margin: "0 0 6px",
    fontSize: "13px",
    color: "#cbd5e1",
    lineHeight: 1.4,
  },
  borrar: {
    marginLeft: "auto",
    flexShrink: 0,
    background: "transparent",
    border: "none",
    color: "#475569",
    fontSize: "12px",
    cursor: "pointer",
  },
  form: { display: "flex", gap: "6px", marginTop: "8px" },
  input: {
    flex: 1,
    minWidth: 0,
    padding: "10px 12px",
    fontSize: "16px",
    borderRadius: "99px",
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.05)",
    color: "#fff",
  },
  enviar: {
    padding: "10px 16px",
    borderRadius: "99px",
    border: "none",
    background: "#3b82f6",
    color: "#fff",
    fontWeight: 700,
    fontSize: "14px",
    cursor: "pointer",
  },
};

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
  tipoFoto: {
    display: "flex",
    alignItems: "center",
    gap: "8px",
    margin: "12px 0 8px",
    fontSize: "12px",
    color: "#94a3b8",
  },
  progresoCaja: { marginTop: "14px" },
  progresoTitulo: { margin: "0 0 8px", fontSize: "13px", color: "#e2e8f0", fontWeight: 700 },
  tira: { display: "flex", gap: "8px", overflowX: "auto", paddingBottom: "6px" },
  tiraItem: { margin: 0, flexShrink: 0, width: "110px" },
  tiraFoto: { width: "110px", aspectRatio: "3 / 4", objectFit: "cover", borderRadius: "12px", display: "block" },
  tiraFecha: { fontSize: "10px", color: "#64748b", textAlign: "center", marginTop: "3px" },
  galeria: { display: "grid", gap: "18px", marginTop: "12px" },
  marco: { position: "relative", margin: 0 },
  foto: { width: "100%", maxHeight: "70vh", objectFit: "cover", borderRadius: "14px", display: "block" },
  autor: {
    position: "absolute",
    top: "6px",
    left: "6px",
    padding: "3px 8px",
    borderRadius: "99px",
    background: "rgba(0,0,0,0.55)",
    fontSize: "11px",
    fontWeight: 700,
  },
  reacciones: { display: "flex", gap: "4px", marginTop: "6px" },
  reaccion: {
    flex: 1,
    padding: "6px 2px",
    borderRadius: "10px",
    border: "1px solid rgba(255,255,255,0.1)",
    background: "rgba(255,255,255,0.04)",
    fontSize: "13px",
    cursor: "pointer",
  },
  reaccionMia: { background: "rgba(96,165,250,0.25)", borderColor: "rgba(96,165,250,0.6)" },
  cuantas: { fontSize: "10px", color: "#cbd5e1", marginLeft: "2px", fontWeight: 700 },
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

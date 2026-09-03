import { useEffect, useState } from "react";
import { PERFILES, datosPerfil } from "./perfiles.js";
import { traerReto, guardarReto, borrarReto } from "./supabase.js";
import { avisar as mandarAviso } from "./notificaciones.js";

const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

// Marcador del mes: quién va ganando en cada cosa.
// El lunes de esta semana, que es como se identifica cada reto.
const lunes = () => {
  const d = new Date();
  d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
  return d.toISOString().slice(0, 10);
};

const EMPUJONES = [
  "¡Que te toca gym! 👟",
  "Levanta, que te adelanto 😏",
  "El gimnasio no va a ir solo",
  "Voy ganando el pique este mes 👑",
];

export default function Pique({ datos, mes, perfil, avisarUI }) {
  const filas = [
    { clave: "dias", titulo: "Días de gym", sufijo: "" },
    { clave: "racha", titulo: "Racha actual", sufijo: " días" },
    { clave: "medallas", titulo: "Medallas", sufijo: "" },
    { clave: "volumen", titulo: "Kilos movidos", sufijo: " kg" },
  ];

  const gana = (clave) => {
    const [a, b] = PERFILES.map((p) => datos[p.id]?.[clave] ?? 0);
    if (a === b) return null;
    return a > b ? PERFILES[0].id : PERFILES[1].id;
  };

  const puntos = PERFILES.map((p) => filas.filter((f) => gana(f.clave) === p.id).length);
  const lider = puntos[0] === puntos[1] ? null : PERFILES[puntos[0] > puntos[1] ? 0 : 1];

  const [reto, setReto] = useState(null);
  const [texto, setTexto] = useState('');
  const [apuesta, setApuesta] = useState('');

  useEffect(() => {
    let vivo = true;
    const cargar = async () => {
      try {
        const r = await traerReto(lunes());
        if (vivo) setReto(r);
      } catch {
        // Sin reto esta semana: no pasa nada.
      }
    };
    cargar();
    return () => {
      vivo = false;
    };
  }, []);

  const otro = PERFILES.find((p) => p.id !== perfil);

  const empujar = (texto) => {
    mandarAviso(perfil, `${datosPerfil(perfil).emoji} ${datosPerfil(perfil).nombre} dice:`, texto);
    avisarUI?.(`Empujón enviado a ${otro.nombre} 👟`);
  };

  const ponerReto = async (ev) => {
    ev.preventDefault();
    if (!texto.trim()) return;
    try {
      setReto(await guardarReto(lunes(), texto.trim(), apuesta.trim() || null));
      setTexto("");
      setApuesta("");
    } catch {
      avisarUI?.("No se ha podido guardar el reto");
    }
  };

  const quitarReto = async () => {
    setReto(null);
    await borrarReto(lunes()).catch(() => {});
  };

  return (
    <section style={s.caja}>
      <h2 style={s.titulo}>Pique de {MESES[mes]}</h2>
      <p style={s.marcador}>
        {lider ? (
          <>
            Va ganando <strong style={{ color: lider.color }}>{lider.emoji} {lider.nombre}</strong> por{" "}
            {Math.max(...puntos)}-{Math.min(...puntos)}
          </>
        ) : (
          "Empate técnico. Esto se decide en el gimnasio 😤"
        )}
      </p>

      <div style={s.tabla}>
        <span />
        {PERFILES.map((p) => (
          <span key={p.id} style={{ ...s.cabecera, color: p.color }}>
            {p.emoji} {p.nombre}
          </span>
        ))}

        {filas.map((f) => {
          const ganador = gana(f.clave);
          return (
            <Fila key={f.clave} titulo={f.titulo}>
              {PERFILES.map((p) => {
                const valor = datos[p.id]?.[f.clave] ?? 0;
                return (
                  <span key={p.id} style={{ ...s.valor, ...(ganador === p.id ? s.gana : null) }}>
                    {valor.toLocaleString("es-ES")}{f.sufijo}
                    {ganador === p.id && " 👑"}
                  </span>
                );
              })}
            </Fila>
          );
        })}
      </div>

      <div style={s.reto}>
        <h3 style={s.retoTitulo}>🎯 Reto de la semana</h3>
        {reto ? (
          <>
            <p style={s.retoTexto}>{reto.texto}</p>
            {reto.apuesta && <p style={s.apuestaTexto}>Se juega: <strong>{reto.apuesta}</strong></p>}
            <button onClick={quitarReto} style={s.retoQuitar}>Quitar reto</button>
          </>
        ) : (
          <form onSubmit={ponerReto} style={s.retoForm}>
            <input
              placeholder="El reto (ir 4 días, no saltarse pierna…)"
              value={texto}
              onChange={(e) => setTexto(e.target.value)}
              style={s.retoInput}
            />
            <input
              placeholder="Qué se apuesta (cena, elegir peli…)"
              value={apuesta}
              onChange={(e) => setApuesta(e.target.value)}
              style={s.retoInput}
            />
            <button type="submit" style={s.retoBoton} disabled={!texto.trim()}>Poner reto</button>
          </form>
        )}
      </div>

      <div style={s.empujones}>
        <h3 style={s.retoTitulo}>👟 Dale un toque a {otro.nombre}</h3>
        <div style={s.empujonFila}>
          {EMPUJONES.map((t) => (
            <button key={t} onClick={() => empujar(t)} style={s.empujon}>
              {t}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}

function Fila({ titulo, children }) {
  return (
    <>
      <span style={s.nombreFila}>{titulo}</span>
      {children}
    </>
  );
}

const s = {
  reto: { marginTop: "18px", paddingTop: "14px", borderTop: "1px solid rgba(255,255,255,0.08)" },
  retoTitulo: { margin: "0 0 8px", fontSize: "14px", color: "#f8fafc" },
  retoTexto: { margin: "0 0 4px", fontSize: "14px", color: "#e2e8f0", fontWeight: 600 },
  apuestaTexto: { margin: "0 0 8px", fontSize: "13px", color: "#fbbf24" },
  retoForm: { display: "grid", gap: "8px" },
  retoInput: {
    width: "100%",
    padding: "11px",
    fontSize: "16px",
    borderRadius: "12px",
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.05)",
    color: "#fff",
  },
  retoBoton: {
    padding: "11px",
    borderRadius: "12px",
    border: "none",
    background: "#3b82f6",
    color: "#fff",
    fontWeight: 700,
    fontSize: "14px",
    cursor: "pointer",
  },
  retoQuitar: {
    padding: "7px 12px",
    borderRadius: "99px",
    border: "1px solid rgba(255,255,255,0.12)",
    background: "transparent",
    color: "#64748b",
    fontSize: "12px",
    cursor: "pointer",
  },
  empujones: { marginTop: "18px", paddingTop: "14px", borderTop: "1px solid rgba(255,255,255,0.08)" },
  empujonFila: { display: "flex", flexWrap: "wrap", gap: "6px" },
  empujon: {
    padding: "9px 12px",
    borderRadius: "99px",
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.04)",
    color: "#cbd5e1",
    fontSize: "12px",
    cursor: "pointer",
  },
  caja: {
    marginBottom: "20px",
    padding: "16px",
    borderRadius: "20px",
    background: "rgba(255,255,255,0.03)",
    border: "1px solid rgba(255,255,255,0.08)",
  },
  titulo: { margin: "0 0 4px", fontSize: "17px", color: "#f8fafc" },
  marcador: { margin: "0 0 14px", fontSize: "13px", color: "#cbd5e1" },
  tabla: { display: "grid", gridTemplateColumns: "1fr auto auto", gap: "10px 14px", alignItems: "center" },
  cabecera: { fontSize: "12px", fontWeight: 800, textAlign: "right" },
  nombreFila: { fontSize: "13px", color: "#94a3b8" },
  valor: { fontSize: "13px", color: "#64748b", textAlign: "right", fontVariantNumeric: "tabular-nums" },
  gana: { color: "#f8fafc", fontWeight: 800 },
};

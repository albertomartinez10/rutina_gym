import { PERFILES } from "./perfiles.js";

const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre",
];

// Marcador del mes: quién va ganando en cada cosa.
export default function Pique({ datos, mes }) {
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

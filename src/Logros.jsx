import { NIVELES, logros, siguienteMeta, nivelDe, mejorPeso, escala } from "./logros.js";
import { fraseMedallero } from "./frases.js";
import { records, volumenPorGrupo } from "./sesiones.js";
import { GRUPOS } from "./catalogo.js";
import { fechaCorta, hoy } from "./historico.js";

const haceDias = (n) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d.toISOString().slice(0, 10);
};

export default function Logros({ historico, perfil, ejercicios, color }) {
  // Pantalla propia: siempre desplegado, sin cabecera plegable.
  const abierto = true;
  const conseguidos = logros(historico, perfil);
  const misRecords = records(historico);
  const semana = volumenPorGrupo(historico, haceDias(6), hoy());
  const maxSemana = Math.max(1, ...Object.values(semana));

  const metas = ejercicios
    .map((e) => ({ ejercicio: e.nombre, ...siguienteMeta(e.nombre, historico, perfil) }))
    .filter((m) => m.objetivo)
    .sort((a, b) => a.falta - b.falta)
    .slice(0, 3);

  return (
    <section style={s.caja}>
      <div style={s.cabecera}>
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
      </div>

      <p style={s.animo}>{fraseMedallero(conseguidos.length, ejercicios.length)}</p>

      <div style={s.cuerpo}>
        <h3 style={s.seccion}>🏆 Tus récords</h3>
        {misRecords.length === 0 && <p style={s.vacio}>Todavía ninguno. Apunta un peso y empiezan a salir</p>}
        {misRecords.slice(0, 8).map((r) => (
          <div key={r.ejercicio} style={s.fila}>
            <span style={s.nombre}>{r.ejercicio}</span>
            <span style={s.nivel}>
              {r.peso} kg{r.reps ? ` × ${r.reps}` : ""}
            </span>
            <span style={s.meta}>{fechaCorta(r.fecha)}</span>
          </div>
        ))}

        <h3 style={s.seccion}>💪 Series de los últimos 7 días</h3>
        {Object.keys(semana).length === 0 && <p style={s.vacio}>Esta semana aún no has entrenado</p>}
        {Object.entries(semana)
          .sort((a, b) => b[1] - a[1])
          .map(([grupo, cuantas]) => (
            <div key={grupo} style={s.barraFila}>
              <span style={s.grupoNombre}>{GRUPOS[grupo] ?? "Otros"}</span>
              <div style={s.barraFondo}>
                <div style={{ ...s.barraRelleno, width: `${(cuantas / maxSemana) * 100}%`, background: color }} />
              </div>
              <span style={s.grupoCuenta}>{cuantas}</span>
            </div>
          ))}
      </div>

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
  chispa: { width: "13px", height: "22px", objectFit: "contain" },
  cuenta: { fontSize: "14px", fontWeight: 800, minWidth: "16px" },
  flecha: { fontSize: "11px", color: "#64748b" },
  seccion: { margin: "16px 0 6px", fontSize: "14px", color: "#f8fafc" },
  barraFila: { display: "flex", alignItems: "center", gap: "8px", padding: "4px 0" },
  grupoNombre: { width: "68px", fontSize: "12px", color: "#94a3b8" },
  barraFondo: { flex: 1, height: "8px", borderRadius: "99px", background: "rgba(255,255,255,0.06)" },
  barraRelleno: { height: "100%", borderRadius: "99px" },
  grupoCuenta: { width: "22px", textAlign: "right", fontSize: "12px", color: "#cbd5e1", fontWeight: 700 },
  animo: { margin: "0 14px 12px", fontSize: "13px", color: "#93c5fd", fontStyle: "italic" },
  cuerpo: { padding: "0 14px 14px" },
  fila: { padding: "10px 0", borderTop: "1px solid rgba(255,255,255,0.06)" },
  info: { display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "6px" },
  nombre: { flex: 1, fontSize: "13px", fontWeight: 600, color: "#e2e8f0" },
  marca: { fontSize: "11px", color: "#4ade80", fontWeight: 700 },
  medallas: { display: "flex", gap: "6px" },
  hueco: { display: "flex", flexDirection: "column", alignItems: "center", gap: "2px", flex: 1 },
  medalla: { width: "26px", height: "44px", objectFit: "contain" },
  // Sin conseguir: apagadas, pero se ven, que es lo que da ganas de ir a por ellas.
  apagada: { filter: "grayscale(1) brightness(0.45)", opacity: 0.65 },
  casi: { width: "16px", height: "28px" },
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

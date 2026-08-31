import { useEffect, useRef, useState } from "react";

const OPCIONES = [60, 90, 120];
const reloj = (s) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

// Pitido corto sin ficheros de audio: un oscilador del navegador y listo.
const pitar = () => {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const vol = ctx.createGain();
    osc.frequency.value = 880;
    vol.gain.setValueAtTime(0.25, ctx.currentTime);
    vol.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
    osc.connect(vol).connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.6);
  } catch {
    // Sin audio disponible: la vibración ya avisa.
  }
};

export default function Descanso() {
  const [restante, setRestante] = useState(null);
  const fin = useRef(null);

  // Cuenta atrás por hora de fin, no sumando ticks: así no se retrasa
  // si el móvil bloquea la pantalla o suspende el temporizador.
  useEffect(() => {
    if (restante === null) return;
    const id = setInterval(() => {
      const quedan = Math.max(0, Math.round((fin.current - Date.now()) / 1000));
      setRestante(quedan);
      if (quedan === 0) {
        clearInterval(id);
        navigator.vibrate?.([200, 100, 200]);
        pitar();
        setTimeout(() => setRestante(null), 2000);
      }
    }, 250);
    return () => clearInterval(id);
  }, [restante === null]);

  const arrancar = (segundos) => {
    fin.current = Date.now() + segundos * 1000;
    setRestante(segundos);
    navigator.vibrate?.(15);
  };

  if (restante === null) {
    return (
      <div style={s.barra}>
        <span style={s.etiqueta}>Descanso</span>
        {OPCIONES.map((o) => (
          <button key={o} onClick={() => arrancar(o)} style={s.opcion}>
            {o}s
          </button>
        ))}
      </div>
    );
  }

  return (
    <div style={{ ...s.barra, ...s.activa }}>
      <span style={s.cuenta}>{restante === 0 ? "¡Vamos! 💥" : reloj(restante)}</span>
      <button onClick={() => setRestante(null)} style={s.parar}>
        Parar
      </button>
    </div>
  );
}

const s = {
  barra: {
    position: "fixed",
    left: "50%",
    transform: "translateX(-50%)",
    bottom: "calc(12px + env(safe-area-inset-bottom))",
    zIndex: 20,
    display: "flex",
    alignItems: "center",
    gap: "8px",
    padding: "8px 12px",
    borderRadius: "99px",
    background: "rgba(15,23,42,0.92)",
    border: "1px solid rgba(255,255,255,0.12)",
    backdropFilter: "blur(12px)",
    boxShadow: "0 10px 30px rgba(2,6,23,0.5)",
  },
  activa: { borderColor: "rgba(96,165,250,0.6)" },
  etiqueta: { fontSize: "12px", color: "#94a3b8", paddingLeft: "6px" },
  opcion: {
    minWidth: "48px",
    padding: "10px 12px",
    borderRadius: "99px",
    border: "1px solid rgba(255,255,255,0.12)",
    background: "rgba(255,255,255,0.05)",
    color: "#e2e8f0",
    fontSize: "14px",
    fontWeight: 700,
    cursor: "pointer",
  },
  cuenta: {
    fontSize: "20px",
    fontWeight: 800,
    color: "#60a5fa",
    minWidth: "78px",
    textAlign: "center",
    fontVariantNumeric: "tabular-nums",
  },
  parar: {
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

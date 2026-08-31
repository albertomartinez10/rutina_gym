// Sparkline en SVG plano: nada de librerías para 10 puntos.
export default function Grafica({ pesos }) {
  if (pesos.length < 2) return null;

  const w = 260;
  const h = 60;
  const min = Math.min(...pesos);
  const max = Math.max(...pesos);
  const rango = max - min || 1;
  const x = (i) => (i / (pesos.length - 1)) * (w - 8) + 4;
  const y = (p) => h - 8 - ((p - min) / rango) * (h - 16);

  const linea = pesos.map((p, i) => `${i ? "L" : "M"}${x(i)},${y(p)}`).join(" ");
  const area = `${linea} L${x(pesos.length - 1)},${h} L${x(0)},${h} Z`;

  return (
    <div style={{ marginTop: "10px" }}>
      <svg viewBox={`0 0 ${w} ${h}`} width="100%" height="60" role="img" aria-label={`Progresión: de ${min} a ${max} kg`}>
        <defs>
          <linearGradient id="relleno" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#4ade80" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#4ade80" stopOpacity="0" />
          </linearGradient>
        </defs>
        <path d={area} fill="url(#relleno)" />
        <path d={linea} fill="none" stroke="#4ade80" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        {pesos.map((p, i) => (
          <circle key={i} cx={x(i)} cy={y(p)} r={i === pesos.length - 1 ? 4 : 2.5} fill="#4ade80" />
        ))}
      </svg>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "11px", color: "#64748b" }}>
        <span>{min} kg</span>
        <span>{max} kg</span>
      </div>
    </div>
  );
}

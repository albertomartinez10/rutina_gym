// Medallas de Twemoji (CC-BY 4.0), guardadas en /public para que se vean sin cobertura.
export const NIVELES = [
  { nombre: "Primer paso", icono: "🥉", medalla: "/medallas/bronce.svg" },
  { nombre: "Cogiendo ritmo", icono: "🥈", medalla: "/medallas/plata.svg" },
  { nombre: "Esto va en serio", icono: "🥇", medalla: "/medallas/oro.svg" },
  { nombre: "Bestia", icono: "🏅", medalla: "/medallas/deportiva.svg" },
  { nombre: "Leyenda", icono: "🏆", medalla: "/medallas/trofeo.svg" },
];

// Kilos que marcan cada nivel. Nuria empieza de cero, así que su escala
// arranca abajo y sube despacio; la de Alberto va sobre lo que ya mueve.
const ESCALAS = {
  nuria: {
    "Hip Thrust": [20, 40, 60, 80, 100],
    "Patada de glúteo en polea": [5, 10, 15, 20, 25],
    "Peso muerto rumano": [15, 25, 35, 45, 60],
    "Abducción de cadera": [15, 25, 35, 45, 60],
    "Jalón al pecho": [15, 25, 30, 40, 50],
    "Remo en polea": [15, 25, 30, 40, 50],
    "Press hombro mancuernas": [4, 6, 8, 10, 14],
    "Elevaciones laterales": [2, 4, 6, 8, 10],
    Sentadilla: [20, 30, 40, 50, 70],
    Prensa: [40, 60, 80, 100, 130],
    "Extensión de cuádriceps": [15, 25, 35, 45, 55],
    Zancadas: [5, 10, 14, 18, 24],
    _: [10, 20, 30, 40, 50],
  },
  alberto: {
    "Hip Thrust": [60, 90, 120, 150, 180],
    "Patada de glúteo en polea": [10, 15, 25, 35, 45],
    "Peso muerto rumano": [40, 60, 80, 100, 130],
    "Abducción de cadera": [30, 45, 60, 75, 90],
    "Jalón al pecho": [40, 55, 70, 85, 100],
    "Remo en polea": [40, 55, 70, 85, 100],
    "Press hombro mancuernas": [10, 14, 18, 24, 30],
    "Elevaciones laterales": [6, 8, 10, 14, 18],
    Sentadilla: [60, 80, 100, 120, 150],
    Prensa: [100, 140, 180, 220, 280],
    "Extensión de cuádriceps": [40, 55, 70, 85, 100],
    Zancadas: [12, 18, 24, 32, 40],
    _: [20, 40, 60, 80, 100],
  },
};

// Los ejercicios que añadan ellos no están en la tabla: usan la escala genérica.
export const escala = (ejercicio, perfil) => {
  const suya = ESCALAS[perfil] ?? ESCALAS.nuria;
  return suya[ejercicio] ?? suya._;
};

export const mejorPeso = (registros) =>
  registros.reduce((max, r) => Math.max(max, Number(r.peso) || 0), 0);

// Índice del nivel alcanzado con ese peso, o -1 si aún no llega al primero.
export const nivelDe = (ejercicio, peso, perfil) => {
  const umbrales = escala(ejercicio, perfil);
  let nivel = -1;
  umbrales.forEach((u, i) => {
    if (peso >= u) nivel = i;
  });
  return nivel;
};

// Un logro por ejercicio: el nivel más alto conseguido hasta ahora.
export const logros = (historico, perfil) =>
  Object.entries(historico)
    .map(([ejercicio, registros]) => {
      const peso = mejorPeso(registros);
      const nivel = nivelDe(ejercicio, peso, perfil);
      return nivel < 0 ? null : { ejercicio, peso, nivel, ...NIVELES[nivel] };
    })
    .filter(Boolean)
    .sort((a, b) => b.nivel - a.nivel);

// Cuánto falta para el próximo nivel de ese ejercicio.
export const siguienteMeta = (ejercicio, historico, perfil) => {
  const peso = mejorPeso(historico[ejercicio] || []);
  const umbrales = escala(ejercicio, perfil);
  const nivel = nivelDe(ejercicio, peso, perfil);
  if (nivel === umbrales.length - 1) return null;

  const objetivo = umbrales[nivel + 1];
  return {
    objetivo,
    falta: Math.round((objetivo - peso) * 10) / 10,
    ...NIVELES[nivel + 1],
  };
};

// ¿Este peso acaba de desbloquear un nivel nuevo?
export const logroNuevo = (ejercicio, pesoAntes, pesoAhora, perfil) => {
  const antes = nivelDe(ejercicio, pesoAntes, perfil);
  const ahora = nivelDe(ejercicio, pesoAhora, perfil);
  return ahora > antes ? { nivel: ahora, ...NIVELES[ahora] } : null;
};

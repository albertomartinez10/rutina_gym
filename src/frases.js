const frases = [
  "Hoy también, aunque sea con menos ganas 💪",
  "La constancia gana a la motivación siempre",
  "Nadie ha vuelto del gym arrepentido",
  "Una serie más de las que crees que puedes",
  "El peso de hoy es el calentamiento de mañana",
  "Progreso > perfección",
  "Tu yo de dentro de 6 meses te lo agradecerá",
  "Empezar es el 90% del trabajo",
  "No compitas con nadie, solo con tu último registro",
  "Los días flojos también cuentan. Sobre todo esos",
  "Fuerte por dentro y por fuera 🔥",
  "Levanta, respira, repite",
  "Que el lunes no te caiga encima: cáele tú",
  "Cada repetición es un voto por la persona que quieres ser",
];

// Determinista por día: la misma frase toda la jornada, cambia al día siguiente.
export const fraseDelDia = (fecha = new Date()) =>
  frases[Math.floor(fecha.getTime() / 86400000) % frases.length];

export const celebracion = (delta) => {
  if (delta > 0) return `¡Récord! +${delta} kg respecto a la última vez 🚀`;
  if (delta === 0) return "Mismo peso que la última vez. Constancia pura 👊";
  return "Apuntado. Los días de bajar también suman 💙";
};

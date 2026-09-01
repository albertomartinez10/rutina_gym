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
  "Ya estás fuerte. Hoy vas a estarlo un poco más 🦾",
  "Vienes fuerte de casa: esto solo lo confirma",
  "Cada vez que entras aquí sales más fuerte",
  "Ya eres fuerte. Ahora toca dar miedo 😈",
  "La versión de ti de la semana pasada no te levantaría hoy",
  "Fuerte hoy, más fuerte mañana, imparable el mes que viene",
  "Ese peso ya no es tu límite, es tu calentamiento",
  "No estás empezando: estás subiendo de nivel 📈",
];

// Determinista por día: la misma frase toda la jornada, cambia al día siguiente.
export const fraseDelDia = (fecha = new Date()) =>
  frases[Math.floor(fecha.getTime() / 86400000) % frases.length];

const suben = [
  (d) => `¡Récord! +${d} kg. Cada vez más fuerte 🚀`,
  (d) => `+${d} kg más que la última vez. Estás subiendo de nivel 🦾`,
  (d) => `¡+${d} kg! Ya eras fuerte, ahora das miedo 😈`,
];
const iguales = [
  "Mismo peso que la última vez. Constancia pura 👊",
  "Repites peso: la base con la que luego subes 💪",
  "Igualado. Mañana ese peso te parecerá poco 🔥",
];
const bajan = [
  "Apuntado. Los días de bajar también suman 💙",
  "Hoy tocaba menos y aun así has venido. Eso es ser fuerte 💙",
  "Sumado. La fuerza se construye también en los días grises ✨",
];
const azar = (lista) => lista[Math.floor(Math.random() * lista.length)];

export const celebracion = (delta) => {
  if (delta > 0) return azar(suben)(delta);
  if (delta === 0) return azar(iguales);
  return azar(bajan);
};

export const finDeDia = () =>
  azar([
    "¡Día completado! Hoy eres más fuerte que ayer 🎉",
    "Rutina cerrada. Un ladrillo más en la bestia que estás construyendo 🧱",
    "¡Terminado! Esto es lo que te hace más fuerte cada semana 🏆",
  ]);

// Una frase por nivel de medalla: cuanto más alta, más se te sube a la cabeza.
const porNivel = [
  [
    "Primera medalla en el bolsillo. Esto ya es tuyo 🌱",
    "Ya no estás empezando: estás dentro",
    "La primera es la que más cuesta. Y ya la tienes",
  ],
  [
    "Segunda medalla. Esto ya no es casualidad 💫",
    "Estás cogiendo ritmo y se nota",
    "Dos de cinco. La cosa va en serio",
  ],
  [
    "¡Oro! Ya mueves pesos que antes ni mirabas 🥇",
    "Esto ya es nivel de gente que sabe lo que hace",
    "Medio medallero fuera. Estás volando",
  ],
  [
    "Bestia desatada. Cuidado con los espejos 🦾",
    "Ya das un poquito de miedo, y está bien",
    "Cuarta medalla: pocos llegan aquí",
  ],
  [
    "LEYENDA. Poco más se puede decir 🏆",
    "Has reventado la escala. A por otra cosa 👑",
    "Nivel máximo. Que tiemble el gimnasio",
  ],
];

export const fraseLogro = (nivel) => azar(porNivel[Math.min(Math.max(nivel, 0), porNivel.length - 1)]);

// Frase de cabecera del medallero según lo lleno que esté.
export const fraseMedallero = (conseguidas, total) => {
  if (total === 0 || conseguidas === 0) return "Tu medallero está esperando. Apunta un peso y empieza 🌱";
  const parte = conseguidas / total;
  if (parte === 1) return "Medallero completo. Esto ya es de otro nivel 🏆";
  if (parte >= 0.66) return "Casi lo tienes entero. No aflojes ahora 🔥";
  if (parte >= 0.33) return "Vas por la mitad y subiendo 💪";
  return "Ya has empezado a llenarlo. Sigue así ✨";
};

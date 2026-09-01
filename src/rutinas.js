const F = "https://fitnessprogramer.com/wp-content/uploads";

// Cada perfil tiene su rutina: Nuria 3 días, Alberto 5.
export const RUTINAS = {
  nuria: [
    {
      dia: "Día 1",
      grupo: "Glúteo y cuádriceps 🍑 · para tener más culo, si es que se puede",
      ejercicios: [
        { nombre: "Prensa", series: "3", reps: "8-10", imagen: "https://fitcron.com/wp-content/uploads/2021/04/07401301-Sled-45%C2%B0-Leg-Wide-Press_Thighs_720.gif" },
        { nombre: "Extensión de cuádriceps", series: "3", reps: "10-12", imagen: "https://i.pinimg.com/originals/33/24/5f/33245f9b08426eb8d0860f9261111283.gif" },
        { nombre: "Sentadilla hack", series: "3", reps: "12", imagen: "https://www.thingys.com.ar/gymapps/tutorial/hack_new.gif" },
        { nombre: "Hip Thrust", series: "3", reps: "8-10", imagen: "https://gymvisual.com/img/p/5/7/6/1/5761.gif" },
        { nombre: "Abducción de cadera", series: "3", reps: "10-12", imagen: "https://gymvisual.com/img/p/1/2/7/1/4/12714.gif" },
        { nombre: "Tríceps en polea", series: "3", reps: "10-15", imagen: `${F}/2021/06/Rope-Pushdown.gif` },
      ],
    },
    {
      dia: "Día 2",
      grupo: "Espalda y bíceps 💪 · para ponerte mamadísima",
      ejercicios: [
        { nombre: "Jalón al pecho", series: "3", reps: "8-12", imagen: `${F}/2021/02/Lat-Pulldown.gif` },
        { nombre: "Remo en polea", series: "3", reps: "10-12", imagen: `${F}/2021/02/Seated-Cable-Row.gif` },
        { nombre: "Face pull", series: "4", reps: "10-12", imagen: `${F}/2021/02/Face-Pull.gif` },
        { nombre: "Curl de bíceps", series: "4", reps: "10-12", imagen: `${F}/2021/02/Dumbbell-Curl.gif` },
        { nombre: "Curl martillo", series: "4", reps: "10-12", imagen: `${F}/2021/02/Hammer-Curl.gif` },
        { nombre: "Tríceps en polea", series: "3", reps: "10-15", imagen: `${F}/2021/06/Rope-Pushdown.gif` },
      ],
    },
    {
      dia: "Día 3",
      grupo: "Glúteo, femoral y hombro 🔥 · para partirlo en los pogos",
      ejercicios: [
        { nombre: "Hip Thrust", series: "3", reps: "10-12", imagen: "https://gymvisual.com/img/p/5/7/6/1/5761.gif" },
        { nombre: "Curl femoral", series: "3", reps: "12", imagen: `${F}/2021/02/Leg-Curl.gif` },
        { nombre: "Peso muerto rumano", series: "3", reps: "10", imagen: `${F}/2021/02/Dumbbell-Romanian-Deadlift.gif` },
        { nombre: "Patada de glúteo en polea", series: "3", reps: "12-15", imagen: "https://www.thingys.com.ar/gymapps/tutorial/gluteos_polea2.gif" },
        { nombre: "Press hombro mancuernas", series: "3", reps: "10-12", imagen: `${F}/2021/02/Dumbbell-Shoulder-Press.gif` },
        { nombre: "Elevaciones laterales", series: "4", reps: "12-15", imagen: `${F}/2021/02/Dumbbell-Lateral-Raise.gif` },
      ],
    },
  ],

  alberto: [
    {
      dia: "Día 1",
      grupo: "Espalda y bíceps 🔙",
      ejercicios: [
        { nombre: "Jalón al pecho", series: "4", reps: "8-12", imagen: `${F}/2021/02/Lat-Pulldown.gif` },
        { nombre: "Remo gironda", series: "4", reps: "8-12", imagen: `${F}/2021/02/Seated-Cable-Row.gif` },
        { nombre: "Pullover", series: "3", reps: "10-12", imagen: `${F}/2021/02/Dumbbell-Pullover.gif` },
        { nombre: "Face pull", series: "3", reps: "12-15", imagen: `${F}/2021/02/Face-Pull.gif` },
        { nombre: "Remo alto", series: "3", reps: "10-12", imagen: `${F}/2021/02/Barbell-Upright-Row.gif` },
        { nombre: "Curl martillo", series: "3", reps: "10-12", imagen: `${F}/2021/02/Hammer-Curl.gif` },
        { nombre: "Curl de bíceps", series: "3", reps: "10-12", imagen: `${F}/2021/02/Dumbbell-Curl.gif` },
      ],
    },
    {
      dia: "Día 2",
      grupo: "Pecho, hombro y tríceps 💥",
      ejercicios: [
        { nombre: "Press inclinado con mancuerna", series: "4", reps: "8-12", imagen: `${F}/2021/02/Incline-Dumbbell-Press.gif` },
        { nombre: "Press plano", series: "4", reps: "6-10", imagen: `${F}/2021/02/Barbell-Bench-Press.gif` },
        { nombre: "Cruce de polea", series: "3", reps: "12-15", imagen: `${F}/2021/02/Cable-Crossover.gif` },
        { nombre: "Press inclinado en máquina", series: "3", reps: "10-12", imagen: `${F}/2021/06/Lever-Incline-Chest-Press.gif` },
        { nombre: "Elevaciones laterales con mancuerna", series: "4", reps: "12-15", imagen: `${F}/2021/02/Dumbbell-Lateral-Raise.gif` },
        { nombre: "Press militar", series: "4", reps: "8-10", imagen: `${F}/2021/02/Barbell-Shoulder-Press.gif` },
        { nombre: "Elevaciones laterales en máquina", series: "3", reps: "12-15", imagen: `${F}/2021/09/Lever-Lateral-Raise.gif` },
        { nombre: "Tríceps con cuerda", series: "3", reps: "10-12", imagen: `${F}/2021/06/Rope-Pushdown.gif` },
        { nombre: "Tríceps tras nuca", series: "3", reps: "10-12", imagen: `${F}/2021/04/Cable-Rope-Overhead-Triceps-Extension.gif` },
      ],
    },
    {
      dia: "Día 3",
      grupo: "Pierna 🦵",
      ejercicios: [
        { nombre: "Sentadilla pendular", series: "4", reps: "8-12", imagen: "https://www.thingys.com.ar/gymapps/tutorial/hack_new.gif" },
        { nombre: "Prensa", series: "4", reps: "10-12", imagen: "https://fitcron.com/wp-content/uploads/2021/04/07401301-Sled-45%C2%B0-Leg-Wide-Press_Thighs_720.gif" },
        { nombre: "Curl femoral", series: "4", reps: "10-12", imagen: `${F}/2021/02/Leg-Curl.gif` },
        { nombre: "Extensión de cuádriceps", series: "3", reps: "12-15", imagen: "https://i.pinimg.com/originals/33/24/5f/33245f9b08426eb8d0860f9261111283.gif" },
        { nombre: "Abducción de cadera", series: "3", reps: "15", imagen: "https://gymvisual.com/img/p/1/2/7/1/4/12714.gif" },
        { nombre: "Aducción de cadera", series: "3", reps: "15", imagen: `${F}/2021/02/HIP-ADDUCTION-MACHINE.gif` },
      ],
    },
  ],
};

// Alberto repite el ciclo: los días 4 y 5 son el 1 y el 2 otra vez.
RUTINAS.alberto.push(
  { ...RUTINAS.alberto[0], dia: "Día 4", grupo: "Espalda y bíceps 🔙 · segunda vuelta" },
  { ...RUTINAS.alberto[1], dia: "Día 5", grupo: "Pecho, hombro y tríceps 💥 · segunda vuelta" },
);

export const rutinaDe = (perfil) => RUTINAS[perfil] ?? RUTINAS.nuria;

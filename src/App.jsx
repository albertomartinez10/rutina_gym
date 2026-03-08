import React from "react";

const rutina = [
  {
    dia: "Día 1",
    grupo: "Glúteos 🍑",
    ejercicios: [
      {
        nombre: "Hip Thrust",
        series: "4",
        reps: "10-12",
        imagen:
          "https://gymvisual.com/img/p/5/7/6/1/5761.gif",
      },
      {
        nombre: "Patada de glúteo en polea",
        series: "3",
        reps: "12-15",
        imagen:
          "https://www.thingys.com.ar/gymapps/tutorial/gluteos_polea2.gif",
      },
      {
        nombre: "Peso muerto rumano",
        series: "3",
        reps: "10-12",
        imagen:
          "https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Romanian-Deadlift.gif",
      },
      {
        nombre: "Abducción de cadera",
        series: "3",
        reps: "15",
        imagen:
          "https://gymvisual.com/img/p/1/2/7/1/4/12714.gif",
      },
    ],
  },
  {
    dia: "Día 2",
    grupo: "Torso 💪",
    ejercicios: [
      {
        nombre: "Jalón al pecho",
        series: "4",
        reps: "10-12",
        imagen:
          "https://fitnessprogramer.com/wp-content/uploads/2021/02/Lat-Pulldown.gif",
      },
      {
        nombre: "Remo en polea",
        series: "3",
        reps: "10-12",
        imagen:
          "https://fitnessprogramer.com/wp-content/uploads/2021/02/Seated-Cable-Row.gif",
      },
      {
        nombre: "Press hombro mancuernas",
        series: "3",
        reps: "10-12",
        imagen:
          "https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Shoulder-Press.gif",
      },
      {
        nombre: "Elevaciones laterales",
        series: "3",
        reps: "12-15",
        imagen:
          "https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Lateral-Raise.gif",
      },
    ],
  },
  {
    dia: "Día 3",
    grupo: "Cuádriceps 🦵",
    ejercicios: [
      {
        nombre: "Sentadilla",
        series: "4",
        reps: "8-10",
        imagen:
          "https://www.thingys.com.ar/gymapps/tutorial/hack_new.gif",
      },
      {
        nombre: "Prensa",
        series: "4",
        reps: "10-12",
        imagen:
          "https://fitcron.com/wp-content/uploads/2021/04/07401301-Sled-45%C2%B0-Leg-Wide-Press_Thighs_720.gif",
      },
      {
        nombre: "Extensión de cuádriceps",
        series: "3",
        reps: "12-15",
        imagen:
          "https://i.pinimg.com/originals/33/24/5f/33245f9b08426eb8d0860f9261111283.gif",
      },
      {
        nombre: "Zancadas",
        series: "3",
        reps: "10-12",
        imagen:
          "https://fitnessprogramer.com/wp-content/uploads/2021/02/Dumbbell-Lunge.gif",
      },
    ],
  },
];

export default function App() {
  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <h1 style={styles.title}>Rutina para Mar, te dedico la canción de tu boda (Temazo)</h1>


        <img
          src="/sticker.webp"
          alt="Sticker"
          style={styles.sticker}
        />

        <div style={styles.grid}>
          {rutina.map((dia, index) => (
            <div key={index} style={styles.card}>
              <h2 style={styles.cardTitle}>{dia.grupo}</h2>

              {dia.ejercicios.map((ej, i) => (
                <div key={i} style={styles.exercise}>
                  <div style={styles.exerciseName}>{ej.nombre}</div>

                  <img
                    src={ej.imagen}
                    alt={ej.nombre}
                    style={styles.image}
                  />

                  <div style={styles.exerciseInfo}>
                    <span style={styles.badge}>{ej.series} series</span>
                    <span style={styles.badge}>{ej.reps} reps</span>
                  </div>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "linear-gradient(135deg,#1e293b,#020617)",
    padding: "40px",
    fontFamily: "Arial",
  },
  container: {
    maxWidth: "1100px",
    margin: "auto",
  },
  title: {
    color: "white",
    textAlign: "center",
    fontSize: "40px",
    marginBottom: "10px",
  },
  subtitle: {
    color: "#cbd5f5",
    textAlign: "center",
    marginBottom: "40px",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "1fr",
    gap: "25px",
    maxWidth: "600px",
    margin: "0 auto"
  },
  card: {
    background: "white",
    borderRadius: "16px",
    padding: "20px",
    boxShadow: "0 10px 30px rgba(0,0,0,0.3)",
  },
  cardTitle: {
    marginBottom: "20px",
    color: "#111827",
  },
  exercise: {
    marginBottom: "20px",
  },
  exerciseName: {
    fontWeight: "bold",
    marginBottom: "8px",
  },
  image: {
    width: "220px",
    height: "200px",
    objectFit: "contain",
    borderRadius: "10px",
    margin: "8px auto",
    display: "block"
  },
  exerciseInfo: {
    display: "flex",
    gap: "10px",
  },
  badge: {
    background: "#e2e8f0",
    padding: "4px 10px",
    borderRadius: "8px",
    fontSize: "12px",
  },
  sticker: {
    display: "block",
    margin: "0 auto 30px auto",
    maxWidth: "300px",
    width: "100%",
    borderRadius: "10px"
  },
};
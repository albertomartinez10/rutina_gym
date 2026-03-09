import React, { useState, useEffect } from "react";
import { supabase } from "./supabase";

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
  const [view, setView] = useState("rutina");
  const [excusas, setExcusas] = useState([]);
  const [itinerario, setItinerario] = useState({
    Viernes: [],
    Sabado: [],
    Domingo: [],
  });
  const [loading, setLoading] = useState(true);

  // Cargar datos al iniciar
  useEffect(() => {
    fetchData();

    // Suscribirse a cambios en tiempo real
    const excusasSubscription = supabase
      .channel('excusas-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'excusas' }, () => fetchData())
      .subscribe();

    const itinerarioSubscription = supabase
      .channel('itinerario-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'itinerario' }, () => fetchData())
      .subscribe();

    return () => {
      supabase.removeChannel(excusasSubscription);
      supabase.removeChannel(itinerarioSubscription);
    };
  }, []);

  const fetchData = async () => {
    try {
      const { data: excData } = await supabase.from('excusas').select('*').order('id');
      const { data: itinData } = await supabase.from('itinerario').select('*').order('created_at');

      if (excData) setExcusas(excData);

      if (itinData) {
        const buildItin = { Viernes: [], Sabado: [], Domingo: [] };
        itinData.forEach(item => {
          if (buildItin[item.dia]) buildItin[item.dia].push(item);
        });
        setItinerario(buildItin);
      }
    } catch (error) {
      console.error("Error fetching data:", error);
    } finally {
      setLoading(false);
    }
  };

  const toggleExcuse = async (id, currentStatus) => {
    const { error } = await supabase
      .from('excusas')
      .update({ completed: !currentStatus })
      .eq('id', id);

    if (!error) fetchData();
  };

  const updatePlan = async (id, value) => {
    const { error } = await supabase
      .from('itinerario')
      .update({ plan: value })
      .eq('id', id);

    if (!error) fetchData();
  };

  const addPlan = async (dia) => {
    const { error } = await supabase
      .from('itinerario')
      .insert([{ dia, plan: "" }]);

    if (!error) fetchData();
  };

  const deletePlan = async (id) => {
    const { error } = await supabase
      .from('itinerario')
      .delete()
      .eq('id', id);

    if (!error) fetchData();
  };

  return (
    <div style={styles.page}>
      <div style={styles.bgMesh}></div>
      <div style={styles.bgBlob1}></div>
      <div style={styles.bgBlob2}></div>

      <div style={styles.container}>
        <div style={styles.navContainer}>
          <div style={styles.nav}>
            <button
              style={{ ...styles.navButton, ...(view === "rutina" ? styles.navButtonActive : {}) }}
              onClick={() => setView("rutina")}
            >
              🏋️ Rutina
            </button>
            <button
              style={{ ...styles.navButton, ...(view === "excusas" ? styles.navButtonActive : {}) }}
              onClick={() => setView("excusas")}
            >
              ✨ Excusas
            </button>
            <button
              style={{ ...styles.navButton, ...(view === "planes" ? styles.navButtonActive : {}) }}
              onClick={() => setView("planes")}
            >
              📅 20 Marzo
            </button>
          </div>
        </div>

        <div style={styles.contentWrapper}>
          {view === "rutina" && (
            <div style={styles.fadeIn}>
              <h1 style={styles.title}>Rutina para Mar</h1>
              <p style={styles.subtitle}>Recuerda, si te pones "Mi canción de boda" = +10kg fuerza</p>

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
          )}

          {view === "excusas" && (
            <div style={styles.fadeIn}>
              <h1 style={styles.title}>Excusas para verte otra vez</h1>
              <div style={styles.excusasGrid}>
                {excusas.map((excusa) => (
                  <div
                    key={excusa.id}
                    style={{
                      ...styles.excusaCard,
                      ...(excusa.completed ? styles.excusaCardCompleted : {})
                    }}
                    onClick={() => toggleExcuse(excusa.id, excusa.completed)}
                  >
                    <div style={{
                      ...styles.checkbox,
                      ...(excusa.completed ? styles.checkboxChecked : {})
                    }}>
                      {excusa.completed && <span style={styles.checkmark}>✓</span>}
                    </div>
                    <span style={{
                      ...styles.excusaText,
                      ...(excusa.completed ? styles.excusaTextCompleted : {})
                    }}>
                      {excusa.text}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {view === "planes" && (
            <div style={styles.fadeIn}>
              <h1 style={styles.title}>Itinerario del Finde</h1>
              <div style={styles.planesGrid}>
                {Object.keys(itinerario).map((dia) => (
                  <div key={dia} style={styles.diaCard}>
                    <h2 style={styles.diaTitle}>{dia}</h2>
                    <div style={styles.planList}>
                      {itinerario[dia].map((item) => (
                        <div key={item.id} style={styles.planItem}>
                          <input
                            style={styles.planInput}
                            value={item.plan}
                            onChange={(e) => updatePlan(item.id, e.target.value)}
                            placeholder="Añade un plan..."
                          />
                          <button
                            style={styles.deleteBtn}
                            onClick={() => deletePlan(item.id)}
                          >
                            ✕
                          </button>
                        </div>
                      ))}
                    </div>
                    <button
                      style={styles.addPlanBtn}
                      onClick={() => addPlan(dia)}
                    >
                      + Nuevo Plan
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {loading && (
          <div style={styles.loadingOverlay}>
            <div style={styles.loadingSpinner}>Cargando...</div>
          </div>
        )}
      </div>

      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes float {
          0% { transform: translate(0, 0); }
          50% { transform: translate(20px, -20px); }
          100% { transform: translate(0, 0); }
        }
      `}</style>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#0f172a",
    padding: "20px",
    fontFamily: "'Outfit', 'Inter', sans-serif",
    position: "relative",
    overflowX: "hidden",
    color: "white",
  },
  bgMesh: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "radial-gradient(at 0% 0%, rgba(59, 130, 246, 0.15) 0, transparent 50%), radial-gradient(at 100% 100%, rgba(139, 92, 246, 0.15) 0, transparent 50%)",
    zIndex: 0,
  },
  bgBlob1: {
    position: "fixed",
    top: "10%",
    left: "10%",
    width: "400px",
    height: "400px",
    background: "rgba(59, 130, 246, 0.1)",
    filter: "blur(100px)",
    borderRadius: "50%",
    animation: "float 20s infinite",
    zIndex: 0,
  },
  bgBlob2: {
    position: "fixed",
    bottom: "10%",
    right: "10%",
    width: "450px",
    height: "450px",
    background: "rgba(139, 92, 246, 0.1)",
    filter: "blur(100px)",
    borderRadius: "50%",
    animation: "float 25s infinite reverse",
    zIndex: 0,
  },
  container: {
    maxWidth: "1100px",
    margin: "auto",
    position: "relative",
    zIndex: 1,
  },
  navContainer: {
    display: "flex",
    justifyContent: "center",
    marginBottom: "40px",
    marginTop: "20px",
  },
  nav: {
    display: "flex",
    gap: "10px",
    background: "rgba(255, 255, 255, 0.05)",
    backdropFilter: "blur(12px)",
    padding: "8px",
    borderRadius: "20px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    boxShadow: "0 8px 32px rgba(0,0,0,0.2)",
  },
  navButton: {
    padding: "10px 20px",
    borderRadius: "14px",
    border: "none",
    background: "transparent",
    color: "#94a3b8",
    cursor: "pointer",
    fontSize: "15px",
    fontWeight: "600",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  },
  navButtonActive: {
    background: "rgba(255, 255, 255, 0.1)",
    color: "white",
    boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
  },
  contentWrapper: {
    maxWidth: "1000px",
    margin: "0 auto",
  },
  fadeIn: {
    animation: "fadeIn 0.6s ease-out forwards",
  },
  title: {
    color: "white",
    textAlign: "center",
    fontSize: "42px",
    fontWeight: "800",
    marginBottom: "8px",
    letterSpacing: "-1px",
    background: "linear-gradient(to right, #fff, #94a3b8)",
    WebkitBackgroundClip: "text",
    WebkitTextFillColor: "transparent",
  },
  subtitle: {
    color: "#94a3b8",
    textAlign: "center",
    marginBottom: "40px",
    fontSize: "18px",
    fontWeight: "500",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
    gap: "25px",
    margin: "0 auto",
  },
  card: {
    background: "rgba(255, 255, 255, 0.03)",
    backdropFilter: "blur(16px)",
    borderRadius: "24px",
    padding: "24px",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
    transition: "transform 0.3s ease",
  },
  cardTitle: {
    marginBottom: "24px",
    color: "white",
    fontSize: "22px",
    textAlign: "center",
    fontWeight: "700",
  },
  exercise: {
    marginBottom: "24px",
    background: "rgba(255, 255, 255, 0.02)",
    padding: "16px",
    borderRadius: "18px",
    border: "1px solid rgba(255, 255, 255, 0.05)",
  },
  exerciseName: {
    fontWeight: "700",
    marginBottom: "12px",
    fontSize: "17px",
    color: "#f8fafc",
  },
  image: {
    width: "100%",
    height: "180px",
    objectFit: "contain",
    borderRadius: "12px",
    marginBottom: "16px",
    background: "white",
    padding: "10px",
  },
  exerciseInfo: {
    display: "flex",
    gap: "10px",
  },
  badge: {
    background: "rgba(59, 130, 246, 0.15)",
    color: "#60a5fa",
    padding: "6px 14px",
    borderRadius: "10px",
    fontSize: "13px",
    fontWeight: "600",
    border: "1px solid rgba(59, 130, 246, 0.2)",
  },
  sticker: {
    display: "block",
    margin: "0 auto 40px auto",
    maxWidth: "280px",
    width: "100%",
    borderRadius: "24px",
    boxShadow: "0 10px 40px rgba(0,0,0,0.3)",
  },
  excusasGrid: {
    display: "flex",
    flexDirection: "column",
    gap: "15px",
    maxWidth: "600px",
    margin: "0 auto",
  },
  excusaCard: {
    background: "rgba(255, 255, 255, 0.04)",
    backdropFilter: "blur(12px)",
    borderRadius: "20px",
    padding: "20px",
    display: "flex",
    alignItems: "center",
    gap: "18px",
    cursor: "pointer",
    transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    boxShadow: "0 4px 20px rgba(0,0,0,0.1)",
  },
  excusaCardCompleted: {
    background: "rgba(255, 255, 255, 0.02)",
    opacity: 0.6,
    transform: "scale(0.98)",
  },
  checkbox: {
    width: "30px",
    height: "30px",
    borderRadius: "10px",
    border: "2px solid #3b82f6",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "all 0.3s ease",
    flexShrink: 0,
  },
  checkboxChecked: {
    background: "#3b82f6",
    borderColor: "#3b82f6",
    boxShadow: "0 0 15px rgba(59, 130, 246, 0.5)",
  },
  checkmark: {
    color: "white",
    fontSize: "18px",
    fontWeight: "bold",
  },
  excusaText: {
    fontSize: "18px",
    color: "#f1f5f9",
    fontWeight: "500",
  },
  excusaTextCompleted: {
    textDecoration: "line-through",
    color: "#94a3b8",
  },
  planesGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
    gap: "25px",
  },
  diaCard: {
    background: "rgba(255, 255, 255, 0.04)",
    backdropFilter: "blur(16px)",
    borderRadius: "28px",
    padding: "28px",
    border: "1px solid rgba(255, 255, 255, 0.08)",
    boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
    display: "flex",
    flexDirection: "column",
  },
  diaTitle: {
    color: "white",
    marginBottom: "24px",
    fontSize: "26px",
    fontWeight: "800",
    textAlign: "center",
  },
  planList: {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    marginBottom: "24px",
  },
  planItem: {
    display: "flex",
    gap: "12px",
    alignItems: "center",
  },
  planInput: {
    flex: 1,
    padding: "14px 18px",
    borderRadius: "16px",
    border: "1px solid rgba(255, 255, 255, 0.1)",
    background: "rgba(255, 255, 255, 0.03)",
    fontSize: "16px",
    color: "white",
    outline: "none",
    transition: "all 0.3s ease",
  },
  deleteBtn: {
    background: "rgba(239, 68, 68, 0.1)",
    color: "#f87171",
    border: "none",
    width: "36px",
    height: "36px",
    borderRadius: "12px",
    cursor: "pointer",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "14px",
    transition: "all 0.2s",
  },
  addPlanBtn: {
    background: "rgba(255, 255, 255, 0.05)",
    color: "#94a3b8",
    border: "2px dashed rgba(255, 255, 255, 0.1)",
    padding: "14px",
    borderRadius: "16px",
    cursor: "pointer",
    fontWeight: "bold",
    fontSize: "15px",
    transition: "all 0.3s ease",
  },
  loadingOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: "rgba(15, 23, 42, 0.8)",
    backdropFilter: "blur(8px)",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  loadingSpinner: {
    color: "white",
    fontSize: "20px",
    fontWeight: "bold",
    letterSpacing: "1px",
  }
};
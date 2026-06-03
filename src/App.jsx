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

const PlanInput = ({ item, onUpdate, onDelete }) => {
  const [localValue, setLocalValue] = useState(item.plan);
  const hasChanges = localValue !== item.plan;

  return (
    <div style={styles.planItem}>
      <input
        style={styles.planInput}
        value={localValue}
        onChange={(e) => setLocalValue(e.target.value)}
        placeholder="Añade un plan..."
      />
      {hasChanges && (
        <button
          style={styles.saveBtn}
          onClick={() => onUpdate(item.id, localValue)}
        >
          💾
        </button>
      )}
      <button
        style={styles.deleteBtn}
        onClick={() => onDelete(item.id)}
      >
        ✕
      </button>
    </div>
  );
};

const Monigote = ({ src, color, run }) => (
  <div
    style={{
      ...styles.monigote,
      ...(run ? { animation: "bob 0.35s infinite" } : {}),
    }}
  >
    <img src={src} alt="" draggable={false} style={styles.monigoteHead} />
    <div style={{ ...styles.monigoteBody, background: color }} />
    <div style={styles.monigoteLegs}>
      <span style={{ ...styles.monigoteLeg, background: color }} />
      <span style={{ ...styles.monigoteLeg, background: color }} />
    </div>
  </div>
);

const ParaMar = () => {
  const [step, setStep] = useState(0);

  // --- Juego 1: shooter de corazones ---
  const [targets, setTargets] = useState([]);
  const [score1, setScore1] = useState(0);
  const [time1, setTime1] = useState(20);
  const SCORE_GOAL = 12;

  // --- Juego 2: atrapar flores ---
  const [petals, setPetals] = useState([]);
  const [basketX, setBasketX] = useState(50);
  const [score2, setScore2] = useState(0);
  const CATCH_GOAL = 8;
  const arenaRef = React.useRef(null);
  const basketRef = React.useRef(50);
  const petalsRef = React.useRef([]);

  // --- Juego 3 (bonus): carrera de monigotes ---
  const [runPhase, setRunPhase] = useState("idle"); // idle | run | win
  const [runnerY, setRunnerY] = useState(0);
  const [obstacles, setObstacles] = useState([]);
  const [progress, setProgress] = useState(0);
  const runnerYRef = React.useRef(0);
  const vyRef = React.useRef(0);
  const obstaclesRef = React.useRef([]);
  const progressRef = React.useRef(0);
  const jumpQueuedRef = React.useRef(false);

  const idRef = React.useRef(0);
  const nextId = () => ++idRef.current;

  // ===== JUEGO 1: spawn + reloj =====
  useEffect(() => {
    if (step !== 1) return;

    const spawn = setInterval(() => {
      const isBomb = Math.random() < 0.25;
      const t = {
        id: nextId(),
        x: 8 + Math.random() * 80,
        y: 12 + Math.random() * 70,
        bomb: isBomb,
      };
      setTargets((prev) => [...prev, t]);
      setTimeout(() => {
        setTargets((prev) => prev.filter((x) => x.id !== t.id));
      }, 1400);
    }, 650);

    const clock = setInterval(() => {
      setTime1((prev) => {
        if (prev <= 1) {
          clearInterval(clock);
          clearInterval(spawn);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      clearInterval(spawn);
      clearInterval(clock);
    };
  }, [step]);

  useEffect(() => {
    if (step === 1 && score1 >= SCORE_GOAL) {
      const id = setTimeout(() => setStep(2), 700);
      return () => clearTimeout(id);
    }
  }, [score1, step]);

  useEffect(() => {
    if (step === 1 && time1 === 0 && score1 < SCORE_GOAL) {
      const id = setTimeout(() => setStep(1.5), 300);
      return () => clearTimeout(id);
    }
  }, [time1, step, score1]);

  const startGame1 = () => {
    setScore1(0);
    setTime1(20);
    setTargets([]);
    setStep(1);
  };

  const shoot = (t) => {
    setTargets((prev) => prev.filter((x) => x.id !== t.id));
    if (t.bomb) {
      setScore1((s) => Math.max(0, s - 2));
    } else {
      setScore1((s) => s + 1);
    }
  };

  // ===== JUEGO 2: caída de flores =====
  useEffect(() => {
    if (step !== 3) return;
    petalsRef.current = [];

    const spawn = setInterval(() => {
      petalsRef.current = [
        ...petalsRef.current,
        {
          id: nextId(),
          x: 8 + Math.random() * 84,
          y: 0,
          cactus: Math.random() < 0.3,
        },
      ];
    }, 850);

    const fall = setInterval(() => {
      let delta = 0;
      const next = [];
      petalsRef.current.forEach((p) => {
        const ny = p.y + 3.5;
        if (ny >= 84) {
          if (Math.abs(basketRef.current - p.x) < 11) {
            delta += p.cactus ? -1 : 1;
          }
          return;
        }
        next.push({ ...p, y: ny });
      });
      petalsRef.current = next;
      setPetals(next);
      if (delta !== 0) setScore2((s) => Math.max(0, s + delta));
    }, 40);

    return () => {
      clearInterval(spawn);
      clearInterval(fall);
    };
  }, [step]);

  useEffect(() => {
    if (step === 3 && score2 >= CATCH_GOAL) {
      const id = setTimeout(() => setStep(4), 700);
      return () => clearTimeout(id);
    }
  }, [score2, step]);

  const startGame2 = () => {
    setScore2(0);
    setPetals([]);
    setStep(3);
  };

  // ===== JUEGO 3 (bonus): carrera de monigotes =====
  const startBonus = () => {
    runnerYRef.current = 0;
    vyRef.current = 0;
    obstaclesRef.current = [];
    progressRef.current = 0;
    jumpQueuedRef.current = false;
    setRunnerY(0);
    setObstacles([]);
    setProgress(0);
    setRunPhase("run");
  };

  const jump = () => {
    if (runPhase !== "run") return;
    jumpQueuedRef.current = true;
  };

  useEffect(() => {
    if (step !== 4 || runPhase !== "run") return;

    const RUNNER_X = 14;
    let tick = 0;
    let lastSpawn = -20;

    const loop = setInterval(() => {
      tick++;

      // salto
      if (jumpQueuedRef.current && runnerYRef.current <= 0.5) {
        vyRef.current = 15;
        jumpQueuedRef.current = false;
      }
      // física
      vyRef.current -= 1.1;
      runnerYRef.current += vyRef.current;
      if (runnerYRef.current < 0) {
        runnerYRef.current = 0;
        vyRef.current = 0;
      }

      // generar obstáculos (hielo / pingüino), parar cerca del final
      if (progressRef.current < 86 && tick - lastSpawn > 30) {
        lastSpawn = tick;
        obstaclesRef.current = [
          ...obstaclesRef.current,
          {
            id: nextId(),
            x: 108,
            hit: false,
            type: Math.random() < 0.5 ? "ice" : "penguin",
          },
        ];
      }

      // mover obstáculos + colisiones
      let hit = false;
      const next = [];
      obstaclesRef.current.forEach((o) => {
        const nx = o.x - 2.4;
        if (nx < -8) return;
        if (!o.hit && Math.abs(nx - RUNNER_X) < 6 && runnerYRef.current < 44) {
          hit = true;
          o.hit = true;
        }
        next.push({ ...o, x: nx });
      });
      obstaclesRef.current = next;

      if (hit) {
        progressRef.current = Math.max(0, progressRef.current - 8);
      } else {
        progressRef.current = Math.min(100, progressRef.current + 0.22);
      }

      setRunnerY(runnerYRef.current);
      setObstacles(next);
      setProgress(Math.round(progressRef.current));

      // termina justo al chocar/alcanzar a Alberto
      if (progressRef.current >= 100) {
        clearInterval(loop);
        setRunPhase("win");
        setTimeout(() => setStep(5), 1400);
      }
    }, 32);

    return () => clearInterval(loop);
  }, [step, runPhase]);

  const moveBasket = (e) => {
    const arena = arenaRef.current;
    if (!arena) return;
    const r = arena.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const pct = ((clientX - r.left) / r.width) * 100;
    const clamped = Math.max(6, Math.min(94, pct));
    basketRef.current = clamped;
    setBasketX(clamped);
  };

  const resetAll = () => {
    setScore1(0);
    setScore2(0);
    setTargets([]);
    setPetals([]);
    setRunPhase("idle");
    setObstacles([]);
    setProgress(0);
    setStep(0);
  };

  return (
    <div style={styles.fadeIn}>
      <h1 style={styles.title}>Operación reconciliación con Mar 💌</h1>

      {/* PASO 0 — Briefing */}
      {step === 0 && (
        <div style={styles.marStep}>
          <p style={styles.marText}>
            Sé que eres una profesional del Call of Duty 🎮... así que esto te va
            a parecer un tutorial 😏
          </p>
          <p style={styles.marHint}>
            Aquí tienes una serie de pruebas que tendrás que superar para
            descubrir la sorpresa final 👇
          </p>
          <div style={styles.briefingCard}>
            <p style={styles.briefingLine}>🎯 Nivel 1 — Tiroteo de corazones</p>
            <p style={styles.briefingLine}>💐 Nivel 2 — Atrapa las flores</p>
            <p style={styles.briefingLine}>🎵 Bonus — Modo superestrella</p>
            <p style={styles.briefingLine}>💌 Recompensa — Una sorpresa</p>
          </div>
          <p style={styles.marHintSoft}>
            Pro tip: ponte nuestra canción de boda de fondo 🎵💍
          </p>
          <button style={styles.marBigBtn} onClick={startGame1}>
            ¡Empezar misión! 🔫
          </button>
        </div>
      )}

      {/* PASO 1 — Shooter */}
      {step === 1 && (
        <div style={styles.marStep}>
          <p style={styles.marText}>
            Dispara a los corazones ❤️ — ¡esquiva las bombas 💣!
          </p>
          <div style={styles.hud}>
            <span style={styles.hudItem}>🎯 {score1}/{SCORE_GOAL}</span>
            <span style={styles.hudItem}>⏱️ {time1}s</span>
          </div>
          <div style={styles.gameArena}>
            {targets.map((t) => (
              <button
                key={t.id}
                onPointerDown={() => shoot(t)}
                style={{
                  ...styles.target,
                  left: `${t.x}%`,
                  top: `${t.y}%`,
                  ...(t.bomb ? styles.bomb : {}),
                }}
              >
                {t.bomb ? "💣" : "❤️"}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* PASO 1.5 — Reintento con humor */}
      {step === 1.5 && (
        <div style={styles.marStep}>
          <p style={styles.marText}>¡Casi! Se acabó el tiempo ⏱️</p>
          <p style={styles.marHint}>
           Va nano, más díficl era aguantar una semana pasando frío...
          </p>
          <p style={styles.marText}>
            Una profesional como tú no falla dos veces 😏
          </p>
          <button style={styles.marBigBtn} onClick={startGame1}>
            Revancha 🔁
          </button>
        </div>
      )}

      {/* PASO 2 — Transición */}
      {step === 2 && (
        <div style={styles.marStep}>
          <p style={styles.marText}>🏆 ¡Nivel completado, killer!</p>
          <p style={styles.marHint}>
            Spoiler: programar esto me costó menos que a ti salir de debajo de la
            manta un día de frío en Albacete 🥶
          </p>
          <p style={styles.marText}>
            Vale menos que una entrada para ver a Harry Styles 💛... pero le he
            puesto el doble de cariño.
          </p>
          <button style={styles.marBigBtn} onClick={startGame2}>
            Siguiente nivel 🌸
          </button>
        </div>
      )}

      {/* PASO 3 — Atrapar flores */}
      {step === 3 && (
        <div style={styles.marStep}>
          <p style={styles.marText}>
            ¡Muévete y atrapa las flores 🌸 con tu cara — esquiva los cactus 🌵!
          </p>
          <div style={styles.hud}>
            <span style={styles.hudItem}>💐 {score2}/{CATCH_GOAL}</span>
          </div>
          <div
            ref={arenaRef}
            style={styles.gameArena}
            onPointerMove={moveBasket}
            onTouchMove={moveBasket}
          >
            {petals.map((p) => (
              <span
                key={p.id}
                style={{ ...styles.petal, left: `${p.x}%`, top: `${p.y}%` }}
              >
                {p.cactus ? "🌵" : "🌸"}
              </span>
            ))}
            <img
              src="/foto-mar.jpg"
              alt="Mar"
              draggable={false}
              style={{ ...styles.basketFace, left: `${basketX}%` }}
            />
          </div>
          <p style={styles.marHint}>
            Pasa el dedo / ratón por el área para mover la cesta
          </p>
        </div>
      )}

      {/* PASO 4 — Carrera de monigotes */}
      {step === 4 && (
        <div style={styles.marStep}>
          {runPhase === "idle" && (
            <>
              <div style={styles.monigotePreview}>
                <Monigote src="/foto-mar.jpg" color="#ec4899" />
                <span style={styles.previewHeart}>❤️</span>
                <Monigote src="/foto-alberto.jpg" color="#3b82f6" />
              </div>
              <p style={styles.marText}>
                Última prueba: ¡corre hasta él! 🏃‍♀️
              </p>
              <p style={styles.marHint}>
                Toca la pantalla para <b>saltar</b> el frío polar de Albacete 🧊 y los pingüinos 🐧 que hay en el camino... ¡y no te caigas!
              </p>
              <button style={styles.marBigBtn} onClick={startBonus}>
                ¡A correr! 🏃‍♀️💨
              </button>
            </>
          )}

          {runPhase !== "idle" && (
            <>
              <p style={styles.marText}>
                {runPhase === "win"
                  ? "¡Lo conseguiste! 🥹❤️"
                  : "¡Salta el hielo 🧊 y los pingüinos 🐧 hasta llegar a él! 👆"}
              </p>

              <div style={styles.hud}>
                <span style={styles.hudItem}>📍 {progress}%</span>
              </div>

              <div
                style={styles.runArena}
                onPointerDown={jump}
                onTouchStart={(e) => {
                  e.preventDefault();
                  jump();
                }}
              >
                {/* suelo */}
                <div style={styles.ground} />

                {/* monigote corredor (Mar) */}
                <div
                  style={{
                    ...styles.runner,
                    left: "14%",
                    bottom: `${28 + runnerY}px`,
                  }}
                >
                  <Monigote
                    src="/foto-mar.jpg"
                    color="#ec4899"
                    run={runPhase === "run" && runnerY <= 0.5}
                  />
                </div>

                {/* obstáculos: hielo y pingüinos */}
                {obstacles.map((o) => (
                  <span
                    key={o.id}
                    style={{ ...styles.runCactus, left: `${o.x}%` }}
                  >
                    {o.type === "penguin" ? "🐧" : "🧊"}
                  </span>
                ))}

                {/* meta: Alberto en Barcelona, se acerca según avanzas */}
                <div
                  style={{
                    ...styles.finishMar,
                    left: `${90 - (progress / 100) * 67}%`,
                  }}
                >
                  {runPhase === "win" && (
                    <span style={styles.finishHeart}>❤️</span>
                  )}
                  <div style={styles.barcelonaSign}>📍 Barcelona</div>
                  <Monigote src="/foto-alberto.jpg" color="#3b82f6" />
                </div>
              </div>

              {runPhase === "run" && (
                <p style={styles.marHint}>Toca para saltar 👆</p>
              )}
            </>
          )}
        </div>
      )}

      {/* PASO 5 — Final */}
      {step === 5 && (
        <div style={{ ...styles.marStep, ...styles.fadeIn }}>
          <p style={styles.marText}>🎉 ¡Misión completada, Mar!</p>
          <img
            src="https://www.flowershopbarcelona.com/cdn/shop/products/image_8b6728b5-b78f-4e5a-8559-965d25936d18.jpg?v=1681821603"
            alt="Ramo de flores"
            style={styles.flowersGif}
          />
          <div style={styles.finalCard}>
            <p style={styles.finalText}>
              Todo esto porque te mereces que te devuelvan todos los detalles que
              tú has tenido y que no han sabido devolverte, ya verás como te llegará todo lo que mereces 💛
            </p>
            <p style={styles.finalText}>
              Si supiese dónde vives, te mandaría flores...
              <br />
              pero como no lo sé, espero que te conformes con esto 🌷
            </p>
            <div style={styles.emojiFlowers}>🌹🌷🌸💐🌻🌼</div>
          </div>
          <button style={styles.marSmallBtn} onClick={resetAll}>
            Volver a jugar 🔁
          </button>
        </div>
      )}
    </div>
  );
};

export default function App() {
  const viewFromHash = () => {
    const map = {
      "#para-ti": "paraMar",
      "#rutina": "rutina",
      "#excusas": "excusas",
      "#planes": "planes",
    };
    return map[window.location.hash] || "rutina";
  };
  const [view, setView] = useState(viewFromHash);
  const [excusas, setExcusas] = useState([]);
  const [itinerario, setItinerario] = useState({
    Viernes: [],
    Sabado: [],
    Domingo: [],
  });
  const [loading, setLoading] = useState(true);

  // Sincronizar la URL (#para-ti) con la vista actual para poder compartir enlace
  useEffect(() => {
    const hashMap = {
      paraMar: "#para-ti",
      rutina: "#rutina",
      excusas: "#excusas",
      planes: "#planes",
    };
    const target = hashMap[view] || "";
    if (window.location.hash !== target) {
      window.history.replaceState(null, "", target || window.location.pathname);
    }
  }, [view]);

  useEffect(() => {
    const onHash = () => {
      const map = {
        "#para-ti": "paraMar",
        "#rutina": "rutina",
        "#excusas": "excusas",
        "#planes": "planes",
      };
      setView(map[window.location.hash] || "rutina");
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

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
            <button
              style={{ ...styles.navButton, ...(view === "paraMar" ? styles.navButtonActive : {}) }}
              onClick={() => setView("paraMar")}
            >
              💌 Para Ti
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
                        <PlanInput
                          key={item.id}
                          item={item}
                          onUpdate={updatePlan}
                          onDelete={deletePlan}
                        />
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

          {view === "paraMar" && <ParaMar />}
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
        @keyframes pulse {
          0% { box-shadow: 0 10px 30px rgba(236, 72, 153, 0.4); }
          50% { box-shadow: 0 10px 40px rgba(236, 72, 153, 0.7); }
          100% { box-shadow: 0 10px 30px rgba(236, 72, 153, 0.4); }
        }
        @keyframes pop {
          0% { transform: scale(0); }
          70% { transform: scale(1.15); }
          100% { transform: scale(1); }
        }
        @keyframes starSpin {
          0% { transform: rotate(0deg) scale(1); }
          50% { transform: rotate(15deg) scale(1.15); }
          100% { transform: rotate(0deg) scale(1); }
        }
        @keyframes bob {
          0% { transform: translateY(0); }
          50% { transform: translateY(-3px); }
          100% { transform: translateY(0); }
        }
        @keyframes floatUp {
          0% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(-22px); }
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
  saveBtn: {
    background: "rgba(34, 197, 94, 0.1)",
    color: "#4ade80",
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
  },

  // ---- Para Mar (juego) ----
  marStep: {
    maxWidth: "560px",
    margin: "0 auto",
    textAlign: "center",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "20px",
    padding: "20px",
  },
  marText: {
    fontSize: "20px",
    color: "#f1f5f9",
    fontWeight: "500",
    lineHeight: 1.6,
    margin: 0,
  },
  marHint: {
    color: "#f472b6",
    fontSize: "15px",
    fontWeight: "600",
    margin: 0,
  },
  marHintSoft: {
    color: "#94a3b8",
    fontSize: "14px",
    fontStyle: "italic",
    margin: 0,
  },
  briefingCard: {
    background: "rgba(255, 255, 255, 0.04)",
    backdropFilter: "blur(12px)",
    borderRadius: "20px",
    padding: "20px 28px",
    border: "1px solid rgba(244, 114, 182, 0.2)",
    textAlign: "left",
    width: "100%",
    maxWidth: "360px",
  },
  briefingLine: {
    fontSize: "16px",
    color: "#e2e8f0",
    fontWeight: "600",
    margin: "10px 0",
  },
  marBigBtn: {
    background: "linear-gradient(135deg, #ec4899, #8b5cf6)",
    color: "white",
    border: "none",
    padding: "18px 36px",
    borderRadius: "20px",
    fontSize: "18px",
    fontWeight: "700",
    cursor: "pointer",
    boxShadow: "0 10px 30px rgba(236, 72, 153, 0.4)",
    animation: "pulse 2s infinite",
  },
  marSmallBtn: {
    background: "rgba(255,255,255,0.06)",
    color: "#cbd5e1",
    border: "1px solid rgba(255,255,255,0.12)",
    padding: "12px 24px",
    borderRadius: "14px",
    fontSize: "15px",
    fontWeight: "600",
    cursor: "pointer",
  },
  hud: {
    display: "flex",
    gap: "16px",
    justifyContent: "center",
  },
  hudItem: {
    background: "rgba(255,255,255,0.06)",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "12px",
    padding: "8px 16px",
    fontSize: "17px",
    fontWeight: "700",
    color: "#f8fafc",
  },
  gameArena: {
    position: "relative",
    width: "100%",
    maxWidth: "480px",
    height: "360px",
    background:
      "linear-gradient(160deg, rgba(139, 92, 246, 0.12), rgba(236, 72, 153, 0.12))",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "24px",
    overflow: "hidden",
    touchAction: "none",
    cursor: "crosshair",
  },
  target: {
    position: "absolute",
    transform: "translate(-50%, -50%)",
    background: "transparent",
    border: "none",
    fontSize: "40px",
    cursor: "pointer",
    padding: 0,
    lineHeight: 1,
    animation: "pop 0.2s ease-out",
    userSelect: "none",
  },
  bomb: {
    fontSize: "44px",
  },
  petal: {
    position: "absolute",
    transform: "translate(-50%, -50%)",
    fontSize: "34px",
    pointerEvents: "none",
    userSelect: "none",
  },
  basket: {
    position: "absolute",
    bottom: "8px",
    transform: "translateX(-50%)",
    fontSize: "48px",
    pointerEvents: "none",
    userSelect: "none",
    filter: "drop-shadow(0 4px 6px rgba(0,0,0,0.4))",
  },
  basketFace: {
    position: "absolute",
    bottom: "8px",
    transform: "translateX(-50%)",
    width: "64px",
    height: "64px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "3px solid #f472b6",
    boxShadow: "0 4px 12px rgba(0,0,0,0.4)",
    pointerEvents: "none",
    userSelect: "none",
  },
  starEmoji: {
    fontSize: "70px",
    animation: "starSpin 2s ease-in-out infinite",
  },
  // monigote (figura con cara)
  monigote: {
    position: "relative",
    width: "46px",
    height: "78px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  monigoteHead: {
    width: "40px",
    height: "40px",
    borderRadius: "50%",
    objectFit: "cover",
    border: "3px solid white",
    boxShadow: "0 3px 8px rgba(0,0,0,0.4)",
    zIndex: 2,
  },
  monigoteBody: {
    width: "10px",
    height: "26px",
    borderRadius: "6px",
    marginTop: "-2px",
  },
  monigoteLegs: {
    display: "flex",
    gap: "8px",
    marginTop: "-2px",
  },
  monigoteLeg: {
    width: "5px",
    height: "14px",
    borderRadius: "4px",
  },
  monigotePreview: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: "12px",
  },
  previewHeart: {
    fontSize: "28px",
    animation: "pulse 1.5s infinite",
  },
  runArena: {
    position: "relative",
    width: "100%",
    maxWidth: "480px",
    height: "240px",
    background:
      "linear-gradient(to bottom, rgba(59,130,246,0.12), rgba(236,72,153,0.10))",
    border: "1px solid rgba(255,255,255,0.12)",
    borderRadius: "24px",
    overflow: "hidden",
    touchAction: "none",
    cursor: "pointer",
  },
  ground: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: "24px",
    height: "3px",
    background: "rgba(255,255,255,0.25)",
  },
  runner: {
    position: "absolute",
    transform: "translateX(-50%)",
    transition: "bottom 0.03s linear",
  },
  runCactus: {
    position: "absolute",
    bottom: "26px",
    transform: "translateX(-50%)",
    fontSize: "38px",
    userSelect: "none",
    pointerEvents: "none",
  },
  finishMar: {
    position: "absolute",
    bottom: "28px",
    transform: "translateX(-50%)",
    transition: "left 0.05s linear",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
  },
  finishHeart: {
    fontSize: "26px",
    animation: "floatUp 0.8s ease-out infinite",
  },
  barcelonaSign: {
    background: "rgba(255,255,255,0.12)",
    border: "1px solid rgba(255,255,255,0.25)",
    borderRadius: "10px",
    padding: "3px 8px",
    fontSize: "12px",
    fontWeight: "700",
    color: "#f8fafc",
    marginBottom: "4px",
    whiteSpace: "nowrap",
  },
  flowersGif: {
    width: "100%",
    maxWidth: "340px",
    borderRadius: "24px",
    boxShadow: "0 20px 50px rgba(236, 72, 153, 0.3)",
  },
  finalCard: {
    background: "rgba(255, 255, 255, 0.04)",
    backdropFilter: "blur(16px)",
    borderRadius: "28px",
    padding: "32px",
    border: "1px solid rgba(244, 114, 182, 0.2)",
    boxShadow: "0 20px 40px rgba(0,0,0,0.2)",
    display: "flex",
    flexDirection: "column",
    gap: "16px",
  },
  finalText: {
    fontSize: "21px",
    color: "#fce7f3",
    fontWeight: "600",
    lineHeight: 1.6,
    fontStyle: "italic",
    margin: 0,
  },
  emojiFlowers: {
    fontSize: "34px",
    marginTop: "8px",
    letterSpacing: "4px",
  },
};
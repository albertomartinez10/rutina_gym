export const PERFILES = [
  { id: "nuria", nombre: "Nuria", emoji: "💜", color: "#a78bfa" },
  { id: "alberto", nombre: "Alberto", emoji: "💙", color: "#60a5fa" },
];

const CLAVE = "gymbro-perfil";

export const cargarPerfil = () => {
  try {
    const id = localStorage.getItem(CLAVE);
    return PERFILES.some((p) => p.id === id) ? id : "nuria";
  } catch {
    return "nuria";
  }
};

export const guardarPerfil = (id) => localStorage.setItem(CLAVE, id);

export const datosPerfil = (id) => PERFILES.find((p) => p.id === id) ?? PERFILES[0];

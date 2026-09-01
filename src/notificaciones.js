import { supabase } from "./supabase.js";

const CLAVE_PUBLICA = import.meta.env.VITE_VAPID_PUBLIC;

export const soportadas = () =>
  typeof window !== "undefined" && "Notification" in window && "serviceWorker" in navigator && "PushManager" in window;

// La clave VAPID viaja en base64url y el navegador la quiere en bytes.
const aBytes = (base64) => {
  const relleno = "=".repeat((4 - (base64.length % 4)) % 4);
  const limpio = (base64 + relleno).replace(/-/g, "+").replace(/_/g, "/");
  return Uint8Array.from(atob(limpio), (c) => c.charCodeAt(0));
};

export const activar = async (perfil) => {
  if (!soportadas() || !CLAVE_PUBLICA) return false;

  const permiso = await Notification.requestPermission();
  if (permiso !== "granted") return false;

  const reg = await navigator.serviceWorker.ready;
  const sub =
    (await reg.pushManager.getSubscription()) ??
    (await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: aBytes(CLAVE_PUBLICA) }));

  const { endpoint, keys } = sub.toJSON();
  const { error } = await supabase
    .from("suscripciones")
    .upsert({ perfil, endpoint, p256dh: keys.p256dh, auth: keys.auth }, { onConflict: "endpoint" });

  return !error;
};

export const desactivar = async () => {
  const reg = await navigator.serviceWorker.ready;
  const sub = await reg.pushManager.getSubscription();
  if (!sub) return;
  await supabase.from("suscripciones").delete().eq("endpoint", sub.endpoint);
  await sub.unsubscribe();
};

export const yaActivadas = async () => {
  if (!soportadas() || Notification.permission !== "granted") return false;
  const reg = await navigator.serviceWorker.ready;
  return Boolean(await reg.pushManager.getSubscription());
};

// Avisa a la otra persona. Si falla, no pasa nada: es un extra.
export const avisar = (de, titulo, cuerpo) =>
  fetch("/api/notificar", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ de, titulo, cuerpo }),
  }).catch(() => {});

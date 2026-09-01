import webpush from "web-push";

const SUPABASE = process.env.VITE_SUPABASE_URL;
const CLAVE = process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

webpush.setVapidDetails(
  "mailto:alberto.martinez@theetailers.com",
  process.env.VAPID_PUBLIC,
  process.env.VAPID_PRIVATE,
);

const cabeceras = { apikey: CLAVE, Authorization: `Bearer ${CLAVE}`, "Content-Type": "application/json" };

export default async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Solo POST" });

  const { de, titulo, cuerpo } = req.body ?? {};
  if (!de || !titulo) return res.status(400).json({ error: "Faltan datos" });

  // El aviso va al otro perfil, nunca a quien lo genera.
  const r = await fetch(`${SUPABASE}/rest/v1/suscripciones?select=*&perfil=neq.${encodeURIComponent(de)}`, {
    headers: cabeceras,
  });
  if (!r.ok) return res.status(502).json({ error: "No se pudieron leer las suscripciones" });

  const destinos = await r.json();
  const carga = JSON.stringify({ titulo, cuerpo });

  const envios = await Promise.allSettled(
    destinos.map((s) =>
      webpush.sendNotification(
        { endpoint: s.endpoint, keys: { p256dh: s.p256dh, auth: s.auth } },
        carga,
      ),
    ),
  );

  // Un 404/410 significa que ese móvil ya no acepta avisos: se limpia.
  await Promise.all(
    envios.map((e, i) => {
      const codigo = e.status === "rejected" ? e.reason?.statusCode : null;
      if (codigo !== 404 && codigo !== 410) return null;
      return fetch(`${SUPABASE}/rest/v1/suscripciones?id=eq.${destinos[i].id}`, {
        method: "DELETE",
        headers: cabeceras,
      });
    }),
  );

  res.status(200).json({
    enviados: envios.filter((e) => e.status === "fulfilled").length,
    fallados: envios.filter((e) => e.status === "rejected").length,
  });
}

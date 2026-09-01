// Las fotos del móvil pesan varios MB y las de iPhone llegan en HEIC, que
// muchos navegadores no pintan. Se pasan por un canvas: salen JPEG y ligeras.
const LADO_MAX = 1600;

export const comprimir = (archivo) =>
  new Promise((resolve) => {
    const url = URL.createObjectURL(archivo);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(url);
      const escala = Math.min(1, LADO_MAX / Math.max(img.width, img.height));
      const lienzo = document.createElement("canvas");
      lienzo.width = Math.round(img.width * escala);
      lienzo.height = Math.round(img.height * escala);
      lienzo.getContext("2d").drawImage(img, 0, 0, lienzo.width, lienzo.height);

      lienzo.toBlob(
        (blob) => resolve(blob ? new File([blob], "entreno.jpg", { type: "image/jpeg" }) : archivo),
        "image/jpeg",
        0.85,
      );
    };

    // Si el navegador no sabe abrirla, se sube tal cual y que decida el servidor.
    img.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(archivo);
    };

    img.src = url;
  });

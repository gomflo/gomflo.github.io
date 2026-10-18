// client:afterpaint: hidrata la isla cuando ya se pintó el primer cuadro (first-contentful-paint) y la isla
// está a la vista, como client:visible. Con client:load o client:visible el JavaScript de React se pide
// mientras se pinta el título y le compite en una red lenta. Lo que la isla pinta en el servidor ya se ve
// igual; solo se retrasa lo que hace falta para tocar.
export default (load, _options, el) => {
  let listo = false;
  const hidratar = async () => {
    if (listo) return;
    listo = true;
    const hydrate = await load();
    await hydrate();
  };
  let mirando = false;
  const mirar = () => {
    if (mirando) return;
    mirando = true;
    const io = new IntersectionObserver((entradas) => {
      if (!entradas.some((e) => e.isIntersecting)) return;
      io.disconnect();
      hidratar();
    });
    for (const hijo of el.children) io.observe(hijo);
  };
  try {
    new PerformanceObserver((_lista, observador) => {
      observador.disconnect();
      setTimeout(mirar);
    }).observe({ type: "paint", buffered: true });
  } catch {
    // Sin Paint Timing: el respaldo de abajo.
  }
  // Por si el navegador no avisa del primer cuadro.
  if (document.readyState === "complete") setTimeout(mirar, 500);
  else addEventListener("load", () => setTimeout(mirar, 500), { once: true });
};

// Movimiento de "El cajón" (/android/).
// Usa el motor del sitio (src/engine) sin ClientRouter: boot() una vez y todo lo de la
// página dentro de onPage(), en el mismo reloj de GSAP.
//
// El conductor: un solo valor, la inclinación del cajón (x, y entre -1 y 1). Lo alimentan
// el puntero (o, en pantallas táctiles, la velocidad del scroll), una deriva lenta en reposo
// y el tope del cajón al abrirse. Cada objeto de la bandeja lo sigue con su propia masa, así
// que las apps se recorren dentro de su compartimento como cosas sueltas en un cajón.
import { gsap } from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { boot, ease, isTouch, onPage, onScroll, prefersReducedMotion } from "../engine";

const COLOR_BARRA = { light: "#e8e9eb", dark: "#121316" } as const;

/* ---------- Tema (comparte la preferencia `theme` de gomflo.dev) ---------- */

function sincronizarTema() {
  const dark = document.documentElement.classList.contains("dark");
  document.querySelector('meta[name="theme-color"]')?.setAttribute("content", dark ? COLOR_BARRA.dark : COLOR_BARRA.light);
  document.querySelectorAll("[data-tema]").forEach((b) => b.setAttribute("aria-label", dark ? "Cambiar a modo claro" : "Cambiar a modo oscuro"));
}

function tema() {
  document.addEventListener("click", (e) => {
    if (!(e.target as Element).closest?.("[data-tema]")) return;
    const dark = !document.documentElement.classList.contains("dark");
    document.documentElement.classList.toggle("dark", dark);
    localStorage.setItem("theme", dark ? "dark" : "light");
    sincronizarTema();
  });
  onPage(sincronizarTema);
}

/* ---------- La barra se hace a un lado al bajar y regresa al subir ---------- */

function barra() {
  let ultimo = 0;
  onScroll(({ y }) => {
    if (Math.abs(y - ultimo) < 6) return;
    const fuera = y > 240 && y > ultimo && !document.querySelector(".barra")?.contains(document.activeElement);
    document.documentElement.classList.toggle("barra-fuera", fuera);
    ultimo = y;
  });
}

/* ---------- El conductor: la inclinación del cajón ---------- */

type Cosa = { el: HTMLElement; masa: number; izq: number; der: number; arr: number; aba: number; x: number; y: number; vx: number; vy: number; r: number };

const apunta = { x: 0, y: 0 }; // lo que pide el puntero o el scroll
const tope = { x: 0, y: 0 }; // el golpe del cajón al abrirse (lo anima la entrada)
const inclinacion = { x: 0, y: 0 }; // el valor que siguen todos los objetos

function bandeja() {
  onPage(({ intro }) => {
    const raiz = document.querySelector<HTMLElement>("[data-bandeja]");
    if (!raiz) return;
    raiz.classList.add("is-lista");
    if (prefersReducedMotion()) {
      gsap.set([raiz, document.querySelector("[data-pie]")], { opacity: 1 });
      return;
    }

    const cosas: Cosa[] = [...raiz.querySelectorAll<HTMLElement>("[data-objeto]")].map((el) => ({
      el,
      masa: parseFloat(el.dataset.masa || "1"),
      izq: 0,
      der: 0,
      arr: 0,
      aba: 0,
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      r: 0,
    }));

    // La holgura de cada objeto: cuánto cabe moverse hacia cada lado sin chocar con las
    // paredes del compartimento ni tapar el nombre escrito en el fondo.
    const medir = () => {
      const { clamp } = gsap.utils;
      for (const c of cosas) {
        const liga = c.el.offsetParent as HTMLElement;
        const nombre = liga.querySelector<HTMLElement>(".hueco__rotulo");
        const { offsetLeft: l, offsetTop: t, offsetWidth: w, offsetHeight: h } = c.el;
        c.izq = clamp(0, 22, l - 16);
        c.der = clamp(0, 22, liga.clientWidth - (l + w) - 16);
        c.arr = clamp(0, 18, t - 10);
        c.aba = clamp(0, 18, (nombre ? nombre.offsetTop : liga.clientHeight) - (t + h) - 9);
      }
    };
    medir();
    ScrollTrigger.addEventListener("refresh", medir);

    // Puntero: inclinar hacia donde está. Táctil: el jalón del scroll mueve el cajón.
    const touch = isTouch();
    const mover = (e: PointerEvent) => {
      const r = raiz.getBoundingClientRect();
      apunta.x = gsap.utils.clamp(-1, 1, ((e.clientX - (r.left + r.width / 2)) / (r.width / 2)) * 1.1);
      apunta.y = gsap.utils.clamp(-1, 1, ((e.clientY - (r.top + r.height / 2)) / (r.height / 2)) * 1.1);
    };
    const soltar = () => {
      apunta.x = 0;
      apunta.y = 0;
    };
    if (!touch) {
      addEventListener("pointermove", mover, { passive: true });
      document.documentElement.addEventListener("pointerleave", soltar);
    }
    const sinScroll = touch
      ? onScroll(({ velocity }) => {
          apunta.y = gsap.utils.clamp(-1, 1, -velocity / 14);
        })
      : () => {};

    const paso = (t: number) => {
      const k = gsap.ticker.deltaRatio(60);
      if (touch) apunta.y *= Math.pow(0.9, k);
      // Deriva en reposo: la mano que sostiene el cajón nunca está del todo quieta.
      const deriva = { x: Math.sin(t * 0.45) * 0.16, y: Math.cos(t * 0.31) * 0.12 };
      const s = 1 - Math.pow(0.9, k);
      inclinacion.x += (apunta.x + deriva.x + tope.x - inclinacion.x) * s;
      inclinacion.y += (apunta.y + deriva.y + tope.y - inclinacion.y) * s;
      for (const c of cosas) {
        // Resorte con masa: lo pesado tarda más en llegar y se pasa menos.
        const rigidez = 0.055 / c.masa;
        const freno = Math.pow(0.86, k);
        const ax = inclinacion.x * (inclinacion.x > 0 ? c.der : c.izq);
        const ay = inclinacion.y * (inclinacion.y > 0 ? c.aba : c.arr);
        c.vx = (c.vx + (ax - c.x) * rigidez * k) * freno;
        c.vy = (c.vy + (ay - c.y) * rigidez * k) * freno;
        c.x += c.vx * k;
        c.y += c.vy * k;
        c.r += (gsap.utils.clamp(-9, 9, c.vx * 2.2 / c.masa) - c.r) * 0.2 * k;
        c.el.style.transform = `translate3d(${c.x.toFixed(2)}px, ${c.y.toFixed(2)}px, 0) rotate(${c.r.toFixed(2)}deg)`;
      }
    };
    const st = ScrollTrigger.create({
      trigger: raiz,
      start: "top bottom",
      end: "bottom top",
      onToggle: (self) => (self.isActive ? gsap.ticker.add(paso) : gsap.ticker.remove(paso)),
    });
    if (st.isActive) gsap.ticker.add(paso);

    // Entrada: el cajón se jala hacia ti. Sale de debajo de la cubierta (su borde de arriba
    // no se mueve), lo de adentro se queda atrás mientras corre y, al topar, sigue de largo
    // y regresa. Es el mismo conductor: la entrada solo empuja `tope`.
    const pie = document.querySelector<HTMLElement>("[data-pie]");
    const jalon = raiz.offsetHeight * 0.55;
    intro.add(
      gsap
        .timeline()
        .set(raiz, { opacity: 1 })
        .set(tope, { y: -1 })
        .fromTo(
          raiz,
          { y: -jalon, clipPath: `inset(${jalon}px -40px -40px -40px)` },
          { y: 0, clipPath: "inset(0px -40px -40px -40px)", duration: 0.9, ease: "power4.out", clearProps: "transform,clipPath" },
        )
        .to(tope, { y: 1.5, duration: 0.08, ease: "none" }, 0.3)
        .to(tope, { y: 0, duration: 0.8, ease: ease.soft }, ">")
        .fromTo(pie, { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: 0.6, ease: ease.out, clearProps: "transform" }, 0.7),
      0.15,
    );

    return () => {
      gsap.ticker.remove(paso);
      ScrollTrigger.removeEventListener("refresh", medir);
      removeEventListener("pointermove", mover);
      document.documentElement.removeEventListener("pointerleave", soltar);
      sinScroll();
    };
  });
}

/* ---------- Los cajones de la cómoda se abren al llegar ---------- */

function cajones() {
  onPage(() => {
    if (prefersReducedMotion()) return;
    document.querySelectorAll<HTMLElement>("[data-cajon]").forEach((cajon) => {
      // Si ya está a la vista (recarga a media página, ancla), se queda abierto.
      if (cajon.getBoundingClientRect().top < innerHeight * 0.85) return;
      const dentro = cajon.querySelector<HTMLElement>("[data-dentro]")!;
      const contenido = cajon.querySelector<HTMLElement>("[data-contenido]")!;
      const telefonos = cajon.querySelectorAll<HTMLElement>(".telefono");
      const radio = getComputedStyle(dentro).borderTopLeftRadius;
      const abre = gsap
        .timeline({ paused: true })
        .fromTo(
          dentro,
          { clipPath: `inset(0% 0% 100% 0% round ${radio})` },
          { clipPath: `inset(0% 0% 0% 0% round ${radio})`, duration: 1.15, ease: ease.out, clearProps: "clipPath" },
        )
        .fromTo(contenido, { y: -110 }, { y: 0, duration: 1.15, ease: ease.out, clearProps: "transform" }, 0)
        // Lo de adentro llega un poco después que el cajón: se recorre y se acomoda.
        .fromTo(
          telefonos,
          { y: -46, rotation: (i) => (i % 2 ? -3 : 3) },
          { y: 0, rotation: 0, duration: 1.3, ease: ease.out, stagger: 0.06, clearProps: "transform" },
          0.08,
        );
      ScrollTrigger.create({ trigger: cajon, start: "top 74%", once: true, onEnter: () => abre.play() });
    });
  });
}

export function iniciarCajon() {
  boot(() => {
    tema();
    barra();
    bandeja();
    cajones();
  });
}

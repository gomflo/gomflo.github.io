// Las piezas trabajando: cada bloque con [data-vivo="<slug>"] muestra en una
// línea lo que su herramienta hace con el texto de la mesa ([data-muestra]).
// Sin mesa en la página (404) trabajan sobre la frase de ejemplo.
import { onPage } from "../engine";
import { aMorse } from "../lib/morse";
import { enteroALetras } from "../lib/numeros-letras";
import { aRomano } from "../lib/romanos";

const EJEMPLO = "¡Hola, México!";
const ABC = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!$%&*?";
const IDEAS_MUESTRA = ["un gato", "una piñata", "un cohete", "un ajolote", "un muñeco de nieve", "un faro", "un taco", "un pulpo"];
const DIAS = ["domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"];

const bytes = (t: string) => new TextEncoder().encode(t);
const base64 = (t: string) => btoa(String.fromCharCode(...bytes(t)));
const largo = (t: string) => [...t].length;
const azar = (n: number) => [...crypto.getRandomValues(new Uint32Array(n))].map((v) => ABC[v % ABC.length]).join("");
// FNV-1a: un color estable para cada texto.
const color = (t: string) => {
  let h = 0x811c9dc5;
  for (const b of bytes(t)) h = Math.imul(h ^ b, 0x01000193);
  return `#${((h >>> 0) & 0xffffff).toString(16).padStart(6, "0")}`;
};
const cambios = (t: string) => {
  const a = [...EJEMPLO];
  const b = [...t];
  let n = Math.abs(a.length - b.length);
  for (let i = 0; i < Math.min(a.length, b.length); i++) if (a[i] !== b[i]) n++;
  return n === 0 ? "= igual al ejemplo" : `${n} ${n === 1 ? "diferencia" : "diferencias"} con el ejemplo`;
};
const navegador = () => {
  const ua = navigator.userAgent;
  const quien = /Edg\//.test(ua) ? "Edge" : /Firefox\//.test(ua) ? "Firefox" : /Chrome\//.test(ua) ? "Chrome" : /Safari\//.test(ua) ? "Safari" : "tu navegador";
  const donde = /Android/.test(ua) ? "Android" : /iPhone|iPad/.test(ua) ? "iOS" : /Mac/.test(ua) ? "macOS" : /Windows/.test(ua) ? "Windows" : /Linux/.test(ua) ? "Linux" : "";
  return donde ? `${quien} en ${donde}` : quien;
};
const sha = async (t: string) => {
  if (!crypto.subtle) return "sha-256";
  const d = new Uint8Array(await crypto.subtle.digest("SHA-256", bytes(t)));
  return `${[...d.slice(0, 9)].map((b) => b.toString(16).padStart(2, "0")).join("")}…`;
};

type Salida = (t: string) => string | Promise<string>;
const SALIDAS: Record<string, Salida> = {
  "contar-caracteres": (t) => `${largo(t)} caracteres · ${t.trim() ? t.trim().split(/\s+/).length : 0} palabras`,
  "convertir-mayusculas-minusculas": (t) => t.toUpperCase(),
  "remover-acentos": (t) => t.normalize("NFD").replace(/[̀-ͯ]/g, ""),
  "ordenar-lista": (t) => (t.match(/[\p{L}\p{N}]+/gu) ?? []).sort((a, b) => a.localeCompare(b, "es")).join(" · "),
  "comparar-diff": cambios,
  "numeros-a-letras": (t) => `${largo(t)} → ${enteroALetras(BigInt(largo(t)))}`,
  "formatear-json": (t) => JSON.stringify({ texto: t }),
  "decodificar-jwt": () => 'eyJhbGci… → {"alg":"HS256"}',
  "base64-texto": base64,
  "base64-archivo": (t) => `${bytes(t).length} bytes → ${Math.ceil(bytes(t).length / 3) * 4} en Base64`,
  "codificar-url": (t) => encodeURIComponent(t),
  "timestamp-unix": () => String(Math.floor(Date.now() / 1000)),
  "generador-contrasenas": () => azar(14),
  "generador-uuid": () => crypto.randomUUID?.() ?? "uuid v4",
  "generador-hash": sha,
  "conversor-colores": color,
  "conversor-cron": () => "*/5 * * * * → cada 5 minutos",
  "user-agent": navegador,
  // Unas cuantas del generador, sin cargar sus 500 ideas en el inicio.
  "que-dibujar": (t) => `dibuja: ${IDEAS_MUESTRA[largo(t) % IDEAS_MUESTRA.length]}`,
  "validar-clabe": () => "banco · plaza · cuenta · control",
  "calculadora-iva": (t) => `$${largo(t)}.00 + IVA = $${(largo(t) * 1.16).toFixed(2)}`,
  "calculadora-aguinaldo": (t) => `$${largo(t) * 25}/día × 15 días = $${(largo(t) * 375).toLocaleString("es-MX")}`,
  "cancelar-suscripcion": (t) => `$${largo(t) * 10}/mes = $${(largo(t) * 120).toLocaleString("es-MX")} al año`,
  garantia: () => {
    const hoy = new Date();
    const fin = new Date(hoy.getFullYear() + 1, hoy.getMonth(), hoy.getDate());
    if (fin.getDate() !== hoy.getDate()) fin.setDate(0); // 29 de febrero + 1 año: el 28
    return `comprado hoy: garantía hasta el ${fin.toLocaleDateString("es-MX", { day: "numeric", month: "short", year: "numeric" })}`;
  },
  "dias-habiles": () => {
    const d = new Date().getDay();
    return `hoy es ${DIAS[d]}: ${d === 0 || d === 6 ? "fin de semana" : "entre semana"}`;
  },
  "numeros-romanos": (t) => (largo(t) >= 1 && largo(t) <= 3999 ? `${largo(t)} → ${aRomano(largo(t))}` : "1 → I"),
  "codigo-morse": (t) => aMorse(t).salida,
  "texto-a-binario": (t) => [...bytes(t)].slice(0, 6).map((b) => b.toString(2).padStart(8, "0")).join(" "),
};

export function startPiezas() {
  onPage(() => {
    const lineas = [...document.querySelectorAll<HTMLElement>("[data-vivo]")];
    if (!lineas.length) return;
    const mesa = document.querySelector<HTMLTextAreaElement>("[data-muestra]");
    let turno = 0;

    const escribir = (el: HTMLElement, valor: string, avisar: boolean) => {
      const texto = valor || "…";
      if (el.textContent === texto) return;
      el.textContent = texto;
      if (el.dataset.vivo === "conversor-colores") el.style.setProperty("--muestra", texto);
      if (!avisar) return;
      el.classList.remove("cambia");
      void el.offsetWidth;
      el.classList.add("cambia");
    };

    const trabajar = (avisar = true) => {
      const mio = ++turno;
      const texto = mesa?.value || EJEMPLO;
      for (const el of lineas) {
        const salida = SALIDAS[el.dataset.vivo || ""];
        if (!salida) continue;
        try {
          const r = salida(texto);
          if (typeof r === "string") escribir(el, r, avisar);
          // Lo asíncrono (hash) solo se escribe si nadie tecleó mientras tanto.
          else void r.then((v) => mio === turno && escribir(el, v, avisar)).catch(() => {});
        } catch {
          // Una pieza que no puede con el texto se queda con su última línea.
        }
      }
    };

    // El reloj es la única pieza que se mueve sola.
    const reloj = lineas.find((el) => el.dataset.vivo === "timestamp-unix");
    const tic = reloj ? window.setInterval(() => escribir(reloj, String(SALIDAS["timestamp-unix"]("")), false), 1000) : 0;

    const alEscribir = () => trabajar();
    mesa?.addEventListener("input", alEscribir);
    trabajar(false);
    return () => {
      clearInterval(tic);
      mesa?.removeEventListener("input", alEscribir);
    };
  });
}

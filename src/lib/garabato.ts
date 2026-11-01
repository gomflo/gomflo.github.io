// Garabato en la web: la página de la app (/garabato/) y el generador de qué dibujar
// (/garabato/que-dibujar/).
//
// Garabato ya está en Google Play, así que GARABATO_EN_PLAY va en `true`:
// prende los botones de las dos páginas (con playLink: utm_source=gomflo.dev, utm_medium=web y
// utm_campaign `garabato` o `que-dibujar`, y el evento de Umami `play-garabato`) y el `installUrl`
// del JSON-LD de /garabato/. El botón de /android/ toma GARABATO_PLAY directo (src/data/android-apps.ts).
// Si la ficha deja de existir, regrésala a `false` (y quita `play` en android-apps.ts) y las páginas
// vuelven a decir «Muy pronto en Google Play», sin enlace.
import { playLink } from "./play";

export const GARABATO_EN_PLAY = true;

export const GARABATO_PLAY = "https://play.google.com/store/apps/details?id=com.gomflo.garabato";

/** Enlace a la ficha con el referrer de gomflo.dev (utm_source=gomflo.dev, utm_medium=web) de la página. */
export const garabatoPlay = (campaign: string) => playLink(GARABATO_PLAY, campaign);

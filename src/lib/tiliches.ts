// Tiliches en la web: la página de la app (/tiliches/) y la calculadora de garantía y devolución
// (/tiliches/garantia/).
//
// Tiliches está en Google Play desde el 19 de octubre de 2026, así que TILICHES_EN_PLAY va en `true`:
// prende los botones de las dos páginas (con playLink: utm_source=gomflo.dev, utm_medium=web y
// utm_campaign `tiliches` o `garantia`, y el evento de Umami `play-tiliches`) y el `installUrl` del
// JSON-LD de /tiliches/. El botón de /android/ toma TILICHES_PLAY directo (src/data/android-apps.ts).
// Si la ficha deja de existir, regrésala a `false` (y quita `play` en android-apps.ts) y las páginas
// vuelven a decir «Muy pronto en Google Play», sin enlace.
import { playLink } from "./play";

export const TILICHES_EN_PLAY = true;

export const TILICHES_PLAY = "https://play.google.com/store/apps/details?id=com.gomflo.tiliches";

/** Enlace a la ficha con el referrer de gomflo.dev (utm_source=gomflo.dev, utm_medium=web) de la página. */
export const tilichesPlay = (campaign: string) => playLink(TILICHES_PLAY, campaign);

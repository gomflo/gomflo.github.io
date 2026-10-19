// Canica en la web: la página de la app (/canica/) y la guía para cancelar suscripciones con su
// calculadora (/canica/cancelar-suscripcion/).
//
// Canica está en Google Play desde el 19 de octubre de 2026, así que CANICA_EN_PLAY va en `true`: prende
// los botones de las dos páginas (con playLink: utm_source=gomflo.dev, utm_medium=web y utm_campaign
// `canica` o `cancelar-suscripcion`, y el evento de Umami `play-canica`) y el `installUrl` del JSON-LD de
// /canica/. El botón de /android/ toma CANICA_PLAY directo (src/data/android-apps.ts). Si la ficha deja
// de existir, regrésala a `false` (y quita `play` en android-apps.ts) y las páginas vuelven a decir
// «Muy pronto en Google Play», sin enlace.
import { playLink } from "./play";

export const CANICA_EN_PLAY = true;

export const CANICA_PLAY = "https://play.google.com/store/apps/details?id=com.gomflo.canica";

/** Enlace a la ficha con el referrer de gomflo.dev (utm_source=gomflo.dev, utm_medium=web) de la página. */
export const canicaPlay = (campaign: string) => playLink(CANICA_PLAY, campaign);

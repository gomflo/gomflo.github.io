// Canica en la web: la página de la app (/canica/) y la guía para cancelar suscripciones con su
// calculadora (/canica/cancelar-suscripcion/).
//
// CANICA_EN_PLAY se queda en `false` mientras la app esté en revisión: la ficha de Play da 404 y
// ningún botón ni enlace debe llevar ahí (las páginas dicen «Muy pronto en Google Play»). Cuando la
// app salga en Google Play, cámbiala a `true` y se prenden solos los botones de las dos páginas (con
// playLink: utm_source=gomflo.dev, utm_medium=web y utm_campaign `canica` o `cancelar-suscripcion`,
// y el evento de Umami `play-canica`), el `installUrl` del JSON-LD de /canica/ y el botón de
// /android/ (src/data/android-apps.ts).
import { playLink } from "./play";

export const CANICA_EN_PLAY = false;

export const CANICA_PLAY = "https://play.google.com/store/apps/details?id=com.gomflo.canica";

/** Enlace a la ficha con el referrer de gomflo.dev (utm_source=gomflo.dev, utm_medium=web) de la página. */
export const canicaPlay = (campaign: string) => playLink(CANICA_PLAY, campaign);

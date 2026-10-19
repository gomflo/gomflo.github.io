// Tiliches en la web: la página de la app (/tiliches/) y la calculadora de garantía y devolución
// (/tiliches/garantia/).
//
// TILICHES_EN_PLAY se queda en `false` mientras la app esté en revisión: la ficha de Play da 404 y
// ningún botón ni enlace debe llevar ahí (las páginas dicen «Muy pronto en Google Play»). Cuando la
// app salga en Google Play, cámbiala a `true` y se prenden solos los botones de las dos páginas (con
// playLink: utm_source=gomflo.dev, utm_medium=web y utm_campaign `tiliches` o `garantia`, y el evento
// de Umami `play-tiliches`), el `installUrl` del JSON-LD de /tiliches/ y el botón de /android/
// (src/data/android-apps.ts).
import { playLink } from "./play";

export const TILICHES_EN_PLAY = false;

export const TILICHES_PLAY = "https://play.google.com/store/apps/details?id=com.gomflo.tiliches";

/** Enlace a la ficha con el referrer de gomflo.dev (utm_source=gomflo.dev, utm_medium=web) de la página. */
export const tilichesPlay = (campaign: string) => playLink(TILICHES_PLAY, campaign);

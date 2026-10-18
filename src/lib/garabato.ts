// Garabato en la web: la página de la app (/garabato/) y el generador de qué dibujar
// (/garabato/que-dibujar/).
//
// GARABATO_EN_PLAY se queda en `false` mientras la app esté en revisión: la ficha de Play da 404
// y ningún botón ni enlace debe llevar ahí (las páginas dicen «Muy pronto en Google Play»).
// Cuando la app salga en Google Play, cámbiala a `true` y se prenden solos los botones de las dos
// páginas (con playLink, utm_campaign `garabato` y `que-dibujar`, y el evento de Umami
// `play-garabato`) y el `installUrl` del JSON-LD de /garabato/.
import { playLink } from "./play";

export const GARABATO_EN_PLAY = false;

export const GARABATO_PLAY = "https://play.google.com/store/apps/details?id=com.gomflo.garabato";

/** Enlace a la ficha con el referrer de gomflo.dev (utm_source=gomflo.dev, utm_medium=web) de la página. */
export const garabatoPlay = (campaign: string) => playLink(GARABATO_PLAY, campaign);

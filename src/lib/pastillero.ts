// Pastillero en la web: la página de la app (/pastillero/). La app ya está en Google Play.
// Los enlaces a la ficha llevan el referrer de gomflo.dev (playLink: utm_source=gomflo.dev, utm_medium=web
// y utm_campaign de la página) y el evento de Umami `play-pastillero`. En JSON-LD, `installUrl` va sin referrer.
import { playLink } from "./play";

export const PASTILLERO_PLAY = "https://play.google.com/store/apps/details?id=com.gomflo.pastillero";

/** Enlace a la ficha con el referrer de gomflo.dev para la página `campaign`. */
export const pastilleroPlay = (campaign: string) => playLink(PASTILLERO_PLAY, campaign);

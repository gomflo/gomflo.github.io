// Coperacha en la web: la página de la app (/coperacha/). La app está en Google Play desde el 19 de octubre de 2026.
// Los enlaces a la ficha llevan el referrer de gomflo.dev (playLink: utm_source=gomflo.dev, utm_medium=web
// y utm_campaign de la página) y el evento de Umami `play-coperacha`. En JSON-LD, `installUrl` va sin referrer.
import { playLink } from "./play";

export const COPERACHA_PLAY = "https://play.google.com/store/apps/details?id=com.gomflo.coperacha";

/** Enlace a la ficha con el referrer de gomflo.dev para la página `campaign`. */
export const coperachaPlay = (campaign: string) => playLink(COPERACHA_PLAY, campaign);

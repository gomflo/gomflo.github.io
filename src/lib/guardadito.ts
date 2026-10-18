// Guardadito en la web: la página de la app (/guardadito/) y la calculadora de aguinaldo.
//
// GUARDADITO_EN_PLAY se queda en `false` mientras la app esté en revisión: la ficha de Play
// da 404 y ningún botón ni enlace debe llevar ahí. Cuando la app salga en Google Play,
// cámbiala a `true` y se prenden solos los botones de /guardadito/ y de la calculadora,
// el `installUrl` de su JSON-LD y el enlace de /android/ (src/data/android-apps.ts).
export const GUARDADITO_EN_PLAY = false;

export const GUARDADITO_PLAY = "https://play.google.com/store/apps/details?id=com.gomflo.guardadito";

/**
 * Enlace a la ficha con el referrer que Play cuenta por campaña. A diferencia de `playLink`
 * (src/lib/play.ts, utm_source=gomflo.dev), estas páginas usan utm_source=web.
 */
export const guardaditoPlay = (campaign: string) =>
  `${GUARDADITO_PLAY}&referrer=${encodeURIComponent(`utm_source=web&utm_campaign=${campaign}`)}`;

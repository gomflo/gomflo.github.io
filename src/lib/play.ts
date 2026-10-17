// Enlaces a Google Play con referrer: la consola de Play cuenta las instalaciones por utm_campaign, así se
// sabe qué página de gomflo.dev trajo cada una. El referrer va codificado completo en un solo parámetro y
// después de `id`, que Play espera primero.

/** `url` de la ficha en Play (con `?id=`) más el referrer de gomflo.dev para la página `campaign`. */
export function playLink(url: string, campaign: string): string {
  const referrer = `utm_source=gomflo.dev&utm_medium=web&utm_campaign=${campaign}`;
  return `${url}&referrer=${encodeURIComponent(referrer)}`;
}

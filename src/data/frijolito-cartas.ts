// Las 54 cartas de Frijolito, en su orden de siempre. Generado desde la app (~/code/frijolito):
// nombres y versos de res/values/cards.xml, tinta de core/loteria/CardTones.kt (baraja de feria).
// Las ilustraciones están en public/frijolito/cartas/NN-slug.webp (300 px) y grande/ (480 px).

export type Tono = "tinta" | "bermellon" | "ocre" | "jade" | "anil" | "rosa";

export type Carta = {
  n: number;
  nombre: string;
  verso: string;
  slug: string;
  /** La tinta que toma la mesa cuando sale esta carta. */
  tono: Tono;
  /** Qué se ve en la ilustración, para el texto alternativo. */
  alt: string;
};

/** El color de la mesa por tinta (design/Theme.kt de la app). El ocre va un 10 % más hondo: ver --fondo en styles/frijolito.css. */
export const TINTAS: Record<Tono, string> = {
  tinta: "#241C17",
  bermellon: "#A32B1C",
  ocre: "#805308",
  jade: "#0E5B45",
  anil: "#1D2D76",
  rosa: "#98125D",
};

export const cartas: Carta[] = [
  { n: 1, nombre: "El Gallo", verso: "El que le cantó a San Pedro no le volverá a cantar.", slug: "el-gallo", tono: "anil", alt: "un gallo cantando con el pico al cielo y una pata levantada, sobre fondo azul cielo" },
  { n: 2, nombre: "El Diablito", verso: "Pórtate bien, cuatito, si no te lleva el coloradito.", slug: "el-diablito", tono: "ocre", alt: "un diablito rojo sentado con las piernas cruzadas, sonriendo y jugando con la punta de su cola" },
  { n: 3, nombre: "La Dama", verso: "Puliendo el paso, por toda la calle real.", slug: "la-dama", tono: "bermellon", alt: "una dama de 1900 con sombrero de pluma y vestido verde, abrochándose un guante largo" },
  { n: 4, nombre: "El Catrín", verso: "Don Ferruco en la Alameda, su bastón quería tirar.", slug: "el-catrin", tono: "jade", alt: "un catrín de bigote y levita que se quita el bombín para saludar y sostiene un reloj de bolsillo" },
  { n: 5, nombre: "El Paraguas", verso: "Para el sol y para el agua.", slug: "el-paraguas", tono: "rosa", alt: "un paraguas cerrado de rayas rojas y crema, parado sobre su punta" },
  { n: 6, nombre: "La Sirena", verso: "Con los cantos de sirena, no te vayas a marear.", slug: "la-sirena", tono: "jade", alt: "una sirena nadando hacia arriba con los brazos extendidos y el cabello suelto" },
  { n: 7, nombre: "La Escalera", verso: "Súbeme paso a pasito, no quieras pegar brinquitos.", slug: "la-escalera", tono: "bermellon", alt: "una escalera de tijera de madera, abierta, con una cubeta de pintura colgada arriba" },
  { n: 8, nombre: "La Botella", verso: "La herramienta del borracho.", slug: "la-botella", tono: "anil", alt: "una garrafa de vidrio verde forrada de palma tejida y tapada con corcho" },
  { n: 9, nombre: "El Barril", verso: "Tanto bebió el albañil, que quedó como barril.", slug: "el-barril", tono: "ocre", alt: "un barril de madera acostado sobre su base, con aros de hierro y una llave al frente" },
  { n: 10, nombre: "El Árbol", verso: "El que a buen árbol se arrima, buena sombra le cobija.", slug: "el-arbol", tono: "jade", alt: "un ahuehuete viejo de tronco grueso y retorcido, con la copa inclinada a la derecha" },
  { n: 11, nombre: "El Melón", verso: "Me lo das o me lo quitas.", slug: "el-melon", tono: "rosa", alt: "un melón partido con su pulpa naranja y una rebanada recargada al frente" },
  { n: 12, nombre: "El Valiente", verso: "Por qué le corres, cobarde, trayendo tan buen puñal.", slug: "el-valiente", tono: "bermellon", alt: "un hombre de sombrero de palma y sarape a rayas, de pie con los brazos cruzados" },
  { n: 13, nombre: "El Gorrito", verso: "Ponle su gorrito al nene, no se nos vaya a resfriar.", slug: "el-gorrito", tono: "bermellon", alt: "un gorrito tejido de lana con orejeras, pompón y franjas de colores" },
  { n: 14, nombre: "La Muerte", verso: "La muerte tilica y flaca.", slug: "la-muerte", tono: "jade", alt: "una calaca sonriente con rebozo que levanta su sombrero y abraza un ramo de cempasúchil" },
  { n: 15, nombre: "La Pera", verso: "El que espera, desespera.", slug: "la-pera", tono: "ocre", alt: "dos peras colgando de una ramita con hojas" },
  { n: 16, nombre: "La Bandera", verso: "Verde, blanco y colorado, la bandera del soldado.", slug: "la-bandera", tono: "anil", alt: "un banderín rojo de feria ondeando en un asta de madera" },
  { n: 17, nombre: "El Bandolón", verso: "Tocando su bandolón, está el mariachi Simón.", slug: "el-bandolon", tono: "jade", alt: "un bandolón, el laúd mexicano de cuerpo ancho, recargado en diagonal" },
  { n: 18, nombre: "El Violoncello", verso: "Creciendo se fue hasta el cielo, y como no fue violín, tuvo que ser violoncello.", slug: "el-violoncello", tono: "bermellon", alt: "un violonchelo recargado en una silla de madera, con el arco sobre el asiento" },
  { n: 19, nombre: "La Garza", verso: "Al otro lado del río tengo mi banco de arena, donde se sienta mi chata, pico de garza morena.", slug: "la-garza", tono: "bermellon", alt: "una garza blanca levantando el vuelo con las alas en alto" },
  { n: 20, nombre: "El Pájaro", verso: "Tú me traes a puros brincos, como pájaro en la rama.", slug: "el-pajaro", tono: "rosa", alt: "un pajarito de pecho rojo volando con una ramita en el pico" },
  { n: 21, nombre: "La Mano", verso: "La mano de un criminal.", slug: "la-mano", tono: "jade", alt: "una mano abierta con un puñado de frijoles en la palma" },
  { n: 22, nombre: "La Bota", verso: "Una bota igual que la otra.", slug: "la-bota", tono: "ocre", alt: "una bota charra de piel con espuela de estrella y bordado de flores" },
  { n: 23, nombre: "La Luna", verso: "El farol de los enamorados.", slug: "la-luna", tono: "rosa", alt: "una luna llena con cara dormida, envuelta por una nube larga" },
  { n: 24, nombre: "El Cotorro", verso: "Cotorro, cotorro, saca la pata y empiézame a platicar.", slug: "el-cotorro", tono: "bermellon", alt: "un perico verde colgado de un columpio de aro, mirando de frente" },
  { n: 25, nombre: "El Borracho", verso: "Ah, qué borracho tan necio, ya no lo puedo aguantar.", slug: "el-borracho", tono: "jade", alt: "un señor dormido en un banquito, con el sombrero sobre los ojos y un jarrito volteado" },
  { n: 26, nombre: "El Negrito", verso: "El rey del son y del tambor.", slug: "el-negrito", tono: "ocre", alt: "un retrato digno de un hombre afromexicano de la costa de Veracruz, sonriendo con su sombrero de palma en el pecho" },
  { n: 27, nombre: "El Corazón", verso: "No me extrañes, corazón, que regreso en el camión.", slug: "el-corazon", tono: "anil", alt: "un corazón rojo de milagrito con una corona de llamas y una guirnalda de rosas" },
  { n: 28, nombre: "La Sandía", verso: "La barriga que Juan tenía era empacho de sandía.", slug: "la-sandia", tono: "jade", alt: "una sandía con una punta rebanada y la rodaja recargada al lado" },
  { n: 29, nombre: "El Tambor", verso: "No te arrugues, cuero viejo, que te quiero para tambor.", slug: "el-tambor", tono: "bermellon", alt: "un tambor de feria rojo con platillos de latón y una baqueta recargada" },
  { n: 30, nombre: "El Camarón", verso: "Camarón que se duerme, se lo lleva la corriente.", slug: "el-camaron", tono: "jade", alt: "un camarón naranja visto desde arriba, con las antenas largas en curva" },
  { n: 31, nombre: "Las Jaras", verso: "Las jaras, donde pegan, dan.", slug: "las-jaras", tono: "bermellon", alt: "tres jaras con plumas de colores dentro de un carcaj de palma tejida" },
  { n: 32, nombre: "El Músico", verso: "El músico trompa de hule ya no me quiere tocar.", slug: "el-musico", tono: "anil", alt: "un músico de banda de pueblo tocando la trompeta con los ojos cerrados" },
  { n: 33, nombre: "La Araña", verso: "Atarántamela a palos, no me la dejes llegar.", slug: "la-arana", tono: "rosa", alt: "una araña colgando de su hilo" },
  { n: 34, nombre: "El Soldado", verso: "Uno, dos y tres, el soldado para el cuartel.", slug: "el-soldado", tono: "jade", alt: "un soldado joven de chaqueta azul tocando el clarín" },
  { n: 35, nombre: "La Estrella", verso: "La guía de los marineros.", slug: "la-estrella", tono: "jade", alt: "una estrella de hojalata calada con vidrios rojos y ámbar, colgada de una cadena" },
  { n: 36, nombre: "El Cazo", verso: "El caso que te hago es poco.", slug: "el-cazo", tono: "bermellon", alt: "un cazo de cobre martillado con una pala de madera adentro" },
  { n: 37, nombre: "El Mundo", verso: "Este mundo es una bola, y nosotros un bolón.", slug: "el-mundo", tono: "ocre", alt: "un globo terráqueo antiguo en su base de madera, mostrando América" },
  { n: 38, nombre: "El Apache", verso: "Guerrero de sierra y sol.", slug: "el-apache", tono: "bermellon", alt: "un retrato digno de un hombre ndé (apache) con una cobija a rayas en el brazo, mirando al horizonte" },
  { n: 39, nombre: "El Nopal", verso: "Al nopal lo van a ver nomás cuando tiene tunas.", slug: "el-nopal", tono: "anil", alt: "un nopal de cinco pencas con flores amarillas y tunas rojas" },
  { n: 40, nombre: "El Alacrán", verso: "El que con la cola pica.", slug: "el-alacran", tono: "ocre", alt: "un alacrán con las tenazas abiertas y la cola en alto" },
  { n: 41, nombre: "La Rosa", verso: "Rosita, Rosaura, ven, que te quiero ahora.", slug: "la-rosa", tono: "jade", alt: "una rama de rosal con una rosa abierta, otra a medio abrir y un botón" },
  { n: 42, nombre: "La Calavera", verso: "Al pasar por el panteón, me encontré un calaverón.", slug: "la-calavera", tono: "bermellon", alt: "una calavera de azúcar decorada con flores, sobre pétalos de cempasúchil" },
  { n: 43, nombre: "La Campana", verso: "Tú con la campana y yo con tu hermana.", slug: "la-campana", tono: "rosa", alt: "una campana de bronce a medio repique, colgada de su yugo de madera" },
  { n: 44, nombre: "El Cantarito", verso: "Tanto va el cántaro al agua, que se quiebra y te moja las enaguas.", slug: "el-cantarito", tono: "jade", alt: "un cantarito de barro rojo con un mecate en el cuello y una rodaja de limón" },
  { n: 45, nombre: "El Venado", verso: "Saltando va buscando, pero no ve nada.", slug: "el-venado", tono: "bermellon", alt: "un venado de cola blanca a medio salto" },
  { n: 46, nombre: "El Sol", verso: "La cobija de los pobres.", slug: "el-sol", tono: "anil", alt: "un sol de hojalata con cara serena y rayos rectos y ondulados" },
  { n: 47, nombre: "La Corona", verso: "El sombrero de los reyes.", slug: "la-corona", tono: "bermellon", alt: "una corona dorada con piedras de colores sobre un cojín de terciopelo" },
  { n: 48, nombre: "La Chalupa", verso: "Rema que rema Lupita, sentada en su chalupita.", slug: "la-chalupa", tono: "jade", alt: "una mujer de rebozo empujando con una pértiga una chalupa de Xochimilco" },
  { n: 49, nombre: "El Pino", verso: "Fresco y oloroso, en todo tiempo hermoso.", slug: "el-pino", tono: "rosa", alt: "un pino ocote de tronco largo con piñas colgando" },
  { n: 50, nombre: "El Pescado", verso: "El que por la boca muere, aunque mudo fuere.", slug: "el-pescado", tono: "ocre", alt: "un huachinango saltando en arco, salpicando gotas" },
  { n: 51, nombre: "La Palma", verso: "Palmero, sube a la palma y bájame un coco real.", slug: "la-palma", tono: "jade", alt: "una palmera de coco con el tronco curvo y las hojas al viento" },
  { n: 52, nombre: "La Maceta", verso: "El que nace para maceta no sale del corredor.", slug: "la-maceta", tono: "bermellon", alt: "una maceta de talavera con un geranio rojo en flor" },
  { n: 53, nombre: "El Arpa", verso: "Arpa vieja de mi suegra, ya no sirves para tocar.", slug: "el-arpa", tono: "anil", alt: "un arpa jarocha de madera clara, recargada hacia atrás" },
  { n: 54, nombre: "La Rana", verso: "Al ver a la verde rana, qué brinco pegó tu hermana.", slug: "la-rana", tono: "bermellon", alt: "una rana verde trepada en un tallo de carrizo, mirando por encima del hombro" },
];

/** Ruta de la ilustración: la chica (300 px) para rejillas y tablas, la grande (480 px) para la carta en turno. */
export function imagen(c: Pick<Carta, "n" | "slug">, grande = false): string {
  return `/frijolito/cartas/${grande ? "grande/" : ""}${String(c.n).padStart(2, "0")}-${c.slug}.webp`;
}

/** Texto alternativo de la ilustración. */
export function textoAlt(c: Carta): string {
  return `Carta ${c.n} de la lotería, ${c.nombre}: ${c.alt}.`;
}

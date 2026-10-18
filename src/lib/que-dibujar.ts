// Qué dibujar: ideas al azar para dibujar y adivinar (/garabato/que-dibujar/).
//
// Las ideas de DE_GARABATO son las palabras de Garabato (~/code/garabato, app/src/main/assets/words.tsv):
// las que se piden en la app y sus rivales saben adivinar, sin «botella de vino», «copa» ni «calzones»
// para que todo sea de familia. EXTRA agrega lo que la app no tiene (acciones, personajes, cosas de
// México, Navidad y posadas, y algunos animales, comidas y lugares). La dificultad es para personas
// dibujando en papel: parte de la de la app y se ajustó a mano.
//
// Cada palabra va una sola vez en todo el archivo (lo revisa que-dibujar.test.ts).

export type CategoriaId =
  | "animales"
  | "comida"
  | "objetos"
  | "transporte"
  | "naturaleza"
  | "cuerpo"
  | "lugares"
  | "acciones"
  | "personajes"
  | "mexico"
  | "navidad";

export type Dificultad = "facil" | "media" | "dificil";

export interface Idea {
  texto: string;
  categoria: CategoriaId;
  dificultad: Dificultad;
  /** Sale de las palabras de Garabato. */
  garabato: boolean;
}

export const CATEGORIAS: { id: CategoriaId; nombre: string }[] = [
  { id: "animales", nombre: "Animales" },
  { id: "comida", nombre: "Comida" },
  { id: "objetos", nombre: "Objetos" },
  { id: "transporte", nombre: "Transporte" },
  { id: "naturaleza", nombre: "Naturaleza" },
  { id: "cuerpo", nombre: "Cuerpo y ropa" },
  { id: "lugares", nombre: "Lugares" },
  { id: "acciones", nombre: "Acciones" },
  { id: "personajes", nombre: "Personajes" },
  { id: "mexico", nombre: "Cosas de México" },
  { id: "navidad", nombre: "Navidad y posadas" },
];

export const DIFICULTADES: { id: Dificultad; nombre: string }[] = [
  { id: "facil", nombre: "Fácil" },
  { id: "media", nombre: "Media" },
  { id: "dificil", nombre: "Difícil" },
];

type Bloque = [CategoriaId, Dificultad, string];

const DE_GARABATO: Bloque[] = [
  ["animales", "facil", "gato, pez, mariposa, caracol, pulpo, jirafa, serpiente, araña, abeja, conejo, elefante, ballena, pato, cerdo, tiburón, hormiga, vaca"],
  ["animales", "media", "camello, búho, borrego, pingüino, león, cocodrilo, cangrejo, caballo, delfín, flamenco, canguro, panda, perico, erizo, ardilla, cebra, cisne, tortuga marina, murciélago, mono, alacrán, mosquito"],
  ["animales", "dificil", "rinoceronte"],
  ["comida", "facil", "manzana, plátano, pastel, galleta, dona, uvas, hamburguesa, helado, paleta, pera, piña, pizza, fresa, sandía, zanahoria"],
  ["comida", "media", "brócoli, hongo, cebolla, cacahuate, chícharos, paleta de hielo, sándwich, hot dog, pastel de cumpleaños, pan, taza de café"],
  ["comida", "dificil", "espárrago, zarzamora, ejote"],
  ["objetos", "facil", "llave, silla, cama, mesa, libro, reloj, lápiz, tijeras, tenedor, cuchara, paraguas, foco, sobre, escaleras, escalera de mano, corona, diamante, martillo, maceta, tele, celular, calculadora, laptop, audífonos, balón de futbol, señal de alto, semáforo, reloj de arena, puerta, mochila, pesa, curita, clip, osito de peluche"],
  ["objetos", "media", "despertador, hacha, pelota de béisbol, bate, canasta, balón de básquet, tina, banca, binoculares, bumerán, cubeta, cámara, cañón, candelabro, brújula, computadora, sillón, crayola, cómoda, taladro, batería, goma, ventilador, pluma, cerca, linterna, lámpara de pie, sartén, palo de golf, guitarra, arpa, palo de hockey, teclado, cuchillo, farol, encendedor, lápiz labial, buzón, mapa, cerillos, megáfono, micrófono, microondas, tarro, clavo, pincel, piano, marco, almohada, radio, rastrillo, control remoto, patines, serrucho, desarmador, pala, lavabo, patineta, maleta, columpio, espada, tetera, raqueta, casa de campaña, teléfono, tostador, excusado, cepillo de dientes, trompeta, florero, lavadora, llanta, subibaja, paracaídas, poste de luz, bolsa, escoba, estufa, pinzas"],
  ["objetos", "dificil", "yunque, corcholata, calendario, violonchelo, clarinete, lavaplatos, ventilador de techo, hidrante, jacuzzi, bote de pintura, pasaporte, postal, enchufe, saxofón, bolsa de dormir, estéreo, estetoscopio, jeringa, trombón, esnórquel"],
  ["transporte", "facil", "avión, bicicleta, coche, tren, helicóptero, velero, globo aerostático"],
  ["transporte", "media", "ambulancia, camión, canoa, crucero, camión de bomberos, moto, patrulla, lancha, submarino, tractor, platillo volador, autobús escolar"],
  ["transporte", "dificil", "buldócer, camioneta, combi"],
  ["naturaleza", "facil", "nube, flor, luna, sol, estrella, arcoíris, árbol, lluvia, rayo, montaña"],
  ["naturaleza", "media", "hoja, palmera, copo de nieve, tornado, cactus, fogata, pasto"],
  ["naturaleza", "dificil", "río, arbusto, estanque"],
  ["cuerpo", "facil", "ojo, mano, pie, boca, nariz, oreja, diente, carita feliz, zapato, calcetín, playera, pantalón, sombrero, lentes"],
  ["cuerpo", "media", "brazo, barba, cara, dedo, pierna, bigote, cerebro, short, chanclas, suéter, chamarra, cinturón, moño, collar, casco, reloj de pulsera"],
  ["cuerpo", "dificil", "codo, rodilla, dedo del pie, candado, pulsera"],
  ["lugares", "facil", "casa, castillo, playa, faro"],
  ["lugares", "media", "iglesia, hospital, cárcel, puente, rascacielos, Torre Eiffel, granero, molino de viento"],
  ["lugares", "dificil", "montaña rusa, tobogán"],
  ["personajes", "media", "sirena"],
  ["personajes", "dificil", "La Mona Lisa"],
  ["mexico", "facil", "calavera"],
  ["navidad", "facil", "muñeco de nieve, vela, ángel"],
  ["navidad", "media", "chimenea"],
];

const EXTRA: Bloque[] = [
  ["animales", "facil", "perro, pájaro, ratón, tortuga, oso, rana, gallina"],
  ["animales", "media", "dinosaurio, gusano, catarina"],
  ["animales", "dificil", "hipopótamo, camaleón, mapache, pavorreal, avestruz, castor, foca, armadillo, lobo, zorro, colibrí, oso hormiguero"],
  ["comida", "facil", "huevo, naranja, cereza, limón"],
  ["comida", "media", "palomitas, queso, coco, papas a la francesa, hot cakes"],
  ["comida", "dificil", "espagueti, sopa, gelatina, licuado, ensalada, mermelada"],
  ["transporte", "facil", "barco, cohete"],
  ["transporte", "dificil", "grúa, teleférico, carreta"],
  ["naturaleza", "media", "volcán, ola"],
  ["naturaleza", "dificil", "cascada, eclipse, cueva"],
  ["cuerpo", "dificil", "ombligo, pestañas, ceja"],
  ["lugares", "facil", "escuela, parque, isla"],
  ["lugares", "media", "cine, biblioteca, zoológico, alberca, estadio, aeropuerto, panadería, circo"],
  ["lugares", "dificil", "museo, gasolinera, supermercado, peluquería, desierto"],
  ["acciones", "facil", "correr, dormir, nadar, bailar, saltar, comer, llorar, reír, cantar, leer"],
  ["acciones", "media", "pescar, cocinar, barrer, estornudar, bostezar, pintar, volar un papalote, esquiar, lavarse los dientes, tomar una foto, patinar, escalar, aplaudir, roncar, regar las plantas"],
  ["acciones", "dificil", "hacer malabares, tropezarse, tener hipo, soñar, mudarse de casa, esperar en la fila, hacer la tarea, buscar las llaves, perder el camión, surfear, tejer"],
  ["personajes", "facil", "pirata, payaso, fantasma, robot, princesa, rey, bruja, astronauta"],
  ["personajes", "media", "bombero, doctora, chef, mago, vampiro, vaquero, extraterrestre, policía, unicornio, caballero, momia, hada, dragón, superhéroe"],
  ["personajes", "dificil", "maestra, detective, científica, cartero, buzo, espantapájaros, jardinero"],
  ["mexico", "facil", "taco, maracas, nopal, chile, elote, pirámide, tortilla, trompo, balero"],
  ["mexico", "media", "mariachi, papel picado, lotería, luchador, ajolote, molcajete, quesadilla, tamal, churro, concha, cempasúchil, catrina, jarrito, metro, chapulín, pan de muerto"],
  ["mexico", "dificil", "ofrenda, trajinera, voladores de Papantla, Ángel de la Independencia, alebrije, pozole, tianguis, chinampa, huipil, rebozo, comal"],
  ["navidad", "facil", "árbol de Navidad, regalo, campana, piñata, bastón de dulce, esfera, gorro de Santa, galleta de jengibre, estrella de Belén"],
  ["navidad", "media", "nacimiento, pastor, reno, trineo, corona de Navidad, nochebuena, luces de colores, buñuelo, chocolate caliente, Santa Claus, Reyes Magos, rosca de Reyes, ponche, farolito, calcetín navideño, bolsita de dulces"],
  ["navidad", "dificil", "pedir posada, romper la piñata, Niño Dios, mula y buey, intercambio de regalos, peregrinos, pastorela, cena de Nochebuena, luz de bengala, villancico, colación"],
];

const desplegar = (bloques: Bloque[], garabato: boolean): Idea[] =>
  bloques.flatMap(([categoria, dificultad, lista]) =>
    lista.split(",").map((t) => ({ texto: t.trim(), categoria, dificultad, garabato })),
  );

export const IDEAS: Idea[] = [...desplegar(DE_GARABATO, true), ...desplegar(EXTRA, false)];

export interface Filtro {
  /** Vacío: todas las categorías. */
  categorias: CategoriaId[];
  /** Vacío: todas las dificultades. */
  dificultades: Dificultad[];
}

/** Las ideas que entran en el filtro, en el orden del catálogo. */
export function filtrar(ideas: Idea[], { categorias, dificultades }: Filtro): Idea[] {
  return ideas.filter(
    (i) => (categorias.length === 0 || categorias.includes(i.categoria)) && (dificultades.length === 0 || dificultades.includes(i.dificultad)),
  );
}

const indice = (n: number, rand: () => number) => Math.min(n - 1, Math.floor(rand() * n));

/**
 * Una idea al azar de `pool`. Evita las `recientes` (la más nueva primero) mientras quede otra, y la
 * anterior siempre que haya más de una: «Otra» nunca repite la que está en pantalla.
 */
export function elegir(pool: Idea[], recientes: string[] = [], rand: () => number = Math.random): Idea | null {
  if (pool.length === 0) return null;
  let candidatas = pool.filter((i) => !recientes.includes(i.texto));
  if (candidatas.length === 0) candidatas = pool.filter((i) => i.texto !== recientes[0]);
  if (candidatas.length === 0) candidatas = pool;
  return candidatas[indice(candidatas.length, rand)];
}

/** El historial con `texto` al frente, sin repetidos y con `max` como mucho. */
export function recordar(historial: string[], texto: string, max = 5): string[] {
  return [texto, ...historial.filter((t) => t !== texto)].slice(0, max);
}

export const FIESTA_MIN = 1;
export const FIESTA_MAX = 60;

/** `n` ideas distintas de `pool`, en orden al azar (todas si hay menos de `n`). */
export function fiesta(pool: Idea[], n: number, rand: () => number = Math.random): Idea[] {
  const copia = [...pool];
  const total = Math.max(0, Math.min(Math.floor(n), copia.length));
  // Fisher-Yates parcial: solo se barajan las que se van a usar.
  for (let i = 0; i < total; i++) {
    const j = i + indice(copia.length - i, rand);
    [copia[i], copia[j]] = [copia[j], copia[i]];
  }
  return copia.slice(0, total);
}

/** La primera letra en mayúscula, para mostrar la idea («árbol de Navidad» → «Árbol de Navidad»). */
export const mayuscula = (t: string) => t.charAt(0).toLocaleUpperCase("es-MX") + t.slice(1);

export const nombreCategoria = (id: CategoriaId) => CATEGORIAS.find((c) => c.id === id)?.nombre ?? id;
export const nombreDificultad = (id: Dificultad) => DIFICULTADES.find((d) => d.id === id)?.nombre ?? id;

/** La lista del modo fiesta como texto para copiar: numerada, una por renglón. */
export const listaComoTexto = (ideas: Idea[]) => ideas.map((i, n) => `${n + 1}. ${mayuscula(i.texto)}`).join("\n");

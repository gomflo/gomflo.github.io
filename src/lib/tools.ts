export type ToolSlug =
  | "formatear-json"
  | "decodificar-jwt"
  | "base64-archivo"
  | "base64-texto"
  | "codificar-url"
  | "timestamp-unix"
  | "contar-caracteres"
  | "convertir-mayusculas-minusculas"
  | "remover-acentos"
  | "ordenar-lista"
  | "comparar-diff"
  | "numeros-a-letras"
  | "generador-contrasenas"
  | "generador-uuid"
  | "generador-hash"
  | "conversor-colores"
  | "conversor-cron"
  | "user-agent"
  | "validar-clabe"
  | "calculadora-iva"
  | "dias-habiles"
  | "numeros-romanos"
  | "codigo-morse"
  | "texto-a-binario";

export type CategoryId = "texto" | "codigo" | "generadores" | "mexico" | "conversores";

export interface Category {
  id: CategoryId;
  title: string;
  desc: string;
}

export interface Tool {
  slug: ToolSlug;
  href: `/${ToolSlug}`;
  title: string;
  desc: string;
  category: CategoryId;
}

export const categories: Category[] = [
  { id: "texto", title: "Texto", desc: "Cuenta, limpia, ordena y transforma lo que escribes." },
  { id: "codigo", title: "Código y datos", desc: "Formatos que aparecen todos los días en una API." },
  { id: "generadores", title: "Generadores y utilidades", desc: "Contraseñas, identificadores, hashes y colores." },
  { id: "mexico", title: "Dinero y plazos en México", desc: "CLABE, IVA y días hábiles con las reglas de aquí." },
  { id: "conversores", title: "Conversores", desc: "Romanos, morse y binario, de ida y de vuelta." },
];

export const tools: Tool[] = [
  // Texto
  { slug: "contar-caracteres", href: "/contar-caracteres", title: "Contar caracteres", desc: "Caracteres, palabras y líneas al instante.", category: "texto" },
  { slug: "convertir-mayusculas-minusculas", href: "/convertir-mayusculas-minusculas", title: "Mayúsculas y minúsculas", desc: "Cambia el texto a MAYÚSCULAS, minúsculas, camelCase y más.", category: "texto" },
  { slug: "remover-acentos", href: "/remover-acentos", title: "Remover acentos", desc: "Quita tildes y diacríticos de un texto.", category: "texto" },
  { slug: "ordenar-lista", href: "/ordenar-lista", title: "Ordenar lista", desc: "Ordena líneas de la A a la Z, o al revés.", category: "texto" },
  { slug: "comparar-diff", href: "/comparar-diff", title: "Comparar texto", desc: "Encuentra diferencias línea por línea.", category: "texto" },
  { slug: "numeros-a-letras", href: "/numeros-a-letras", title: "Números a letras", desc: "Escribe cantidades con letra, en pesos M.N. o como número.", category: "texto" },

  // Código y datos
  { slug: "formatear-json", href: "/formatear-json", title: "Formatear JSON", desc: "Formatea o minifica JSON con un clic.", category: "codigo" },
  { slug: "decodificar-jwt", href: "/decodificar-jwt", title: "Decodificar JWT", desc: "Separa el header y el payload de un token.", category: "codigo" },
  { slug: "base64-texto", href: "/base64-texto", title: "Base64 de texto", desc: "Codifica y decodifica texto en Base64, con acentos y emojis.", category: "codigo" },
  { slug: "base64-archivo", href: "/base64-archivo", title: "Base64 ↔ Archivo", desc: "Convierte archivos a Base64 y de vuelta.", category: "codigo" },
  { slug: "codificar-url", href: "/codificar-url", title: "Codificar URL", desc: "Codifica, decodifica y desarma los parámetros de una URL.", category: "codigo" },
  { slug: "timestamp-unix", href: "/timestamp-unix", title: "Timestamp Unix", desc: "Convierte un timestamp a fecha y una fecha a timestamp.", category: "codigo" },

  // Generadores y utilidades
  { slug: "generador-contrasenas", href: "/generador-contrasenas", title: "Generador de contraseñas", desc: "Contraseñas seguras y aleatorias con la longitud que elijas.", category: "generadores" },
  { slug: "generador-uuid", href: "/generador-uuid", title: "Generador de UUID", desc: "UUID v4 y v7, uno o cien a la vez.", category: "generadores" },
  { slug: "generador-hash", href: "/generador-hash", title: "Generador de hash", desc: "MD5, SHA-1 y SHA-256 de un texto o archivo.", category: "generadores" },
  { slug: "conversor-colores", href: "/conversor-colores", title: "Conversor de colores", desc: "HEX, RGB, HSL y OKLCH, con contraste WCAG.", category: "generadores" },
  { slug: "conversor-cron", href: "/conversor-cron", title: "Conversor de Cron", desc: "Arma y explica expresiones cron en español.", category: "generadores" },
  { slug: "user-agent", href: "/user-agent", title: "Mi User Agent", desc: "Consulta qué dice tu navegador de sí mismo.", category: "generadores" },

  // Dinero y plazos en México
  { slug: "validar-clabe", href: "/validar-clabe", title: "Validar CLABE", desc: "Revisa el dígito de control y de qué banco es una CLABE.", category: "mexico" },
  { slug: "calculadora-iva", href: "/calculadora-iva", title: "Calculadora de IVA", desc: "Agrega o quita el IVA, con retenciones de ISR e IVA.", category: "mexico" },
  { slug: "dias-habiles", href: "/dias-habiles", title: "Días hábiles", desc: "Cuenta días hábiles entre fechas, con los feriados de México.", category: "mexico" },

  // Conversores
  { slug: "numeros-romanos", href: "/numeros-romanos", title: "Números romanos", desc: "Convierte números a romanos y romanos a números.", category: "conversores" },
  { slug: "codigo-morse", href: "/codigo-morse", title: "Código morse", desc: "Traduce texto a morse y de vuelta, y escúchalo.", category: "conversores" },
  { slug: "texto-a-binario", href: "/texto-a-binario", title: "Texto a binario", desc: "Texto a binario, hexadecimal, octal o decimal, y al revés.", category: "conversores" },
];

export const getTool = (slug: ToolSlug): Tool => {
  const tool = tools.find((t) => t.slug === slug);
  if (!tool) throw new Error(`Herramienta desconocida: ${slug}`);
  return tool;
};

export const getCategory = (id: CategoryId): Category => {
  const category = categories.find((c) => c.id === id);
  if (!category) throw new Error(`Categoría desconocida: ${id}`);
  return category;
};

export const toolsIn = (id: CategoryId): Tool[] => tools.filter((t) => t.category === id);

/**
 * Días naturales y hábiles entre fechas en México. Las fechas viajan como
 * "AAAA-MM-DD" y se operan en UTC para no tropezar con horarios de verano.
 */

export interface Feriado {
  fecha: string;
  nombre: string;
  /** Solo en el calendario bancario (CNBV), no en la Ley Federal del Trabajo. */
  bancario?: boolean;
}

export interface OpcionesDias {
  /** Suma los días inhábiles bancarios: Semana Santa, 2 de noviembre y 12 de diciembre. */
  bancario: boolean;
  /** Cuenta la fecha de inicio como parte del periodo. */
  incluirInicio: boolean;
}

const DIA = 86_400_000;

export const aFecha = (iso: string): Date | null => {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(iso)) return null;
  const d = new Date(`${iso}T00:00:00Z`);
  return Number.isNaN(d.getTime()) ? null : d;
};

export const aIso = (d: Date) => d.toISOString().slice(0, 10);

const utc = (y: number, m: number, d: number) => new Date(Date.UTC(y, m - 1, d));

/** n-ésimo lunes del mes (1 = primero). */
const lunes = (y: number, m: number, n: number) => {
  const primero = utc(y, m, 1);
  const offset = (8 - primero.getUTCDay()) % 7;
  return utc(y, m, 1 + offset + (n - 1) * 7);
};

/** Domingo de Pascua (algoritmo de Meeus/Jones/Butcher). */
const pascua = (y: number) => {
  const a = y % 19;
  const b = Math.floor(y / 100);
  const c = y % 100;
  const d = Math.floor(b / 4);
  const e = b % 4;
  const f = Math.floor((b + 8) / 25);
  const g = Math.floor((b - f + 1) / 3);
  const h = (19 * a + b - d - g + 15) % 30;
  const i = Math.floor(c / 4);
  const k = c % 4;
  const l = (32 + 2 * e + 2 * i - h - k) % 7;
  const m = Math.floor((a + 11 * h + 22 * l) / 451);
  const mes = Math.floor((h + l - 7 * m + 114) / 31);
  const dia = ((h + l - 7 * m + 114) % 31) + 1;
  return utc(y, mes, dia);
};

/** Descansos obligatorios del artículo 74 de la LFT y, si se pide, los bancarios. */
export const feriadosDe = (y: number, bancario: boolean): Feriado[] => {
  const lista: Feriado[] = [
    { fecha: aIso(utc(y, 1, 1)), nombre: "Año Nuevo" },
    { fecha: aIso(lunes(y, 2, 1)), nombre: "Día de la Constitución" },
    { fecha: aIso(lunes(y, 3, 3)), nombre: "Natalicio de Benito Juárez" },
    { fecha: aIso(utc(y, 5, 1)), nombre: "Día del Trabajo" },
    { fecha: aIso(utc(y, 9, 16)), nombre: "Día de la Independencia" },
    { fecha: aIso(lunes(y, 11, 3)), nombre: "Día de la Revolución" },
    { fecha: aIso(utc(y, 12, 25)), nombre: "Navidad" },
  ];
  // Transmisión del Poder Ejecutivo: 1 de octubre desde 2024, antes 1 de diciembre.
  if (y >= 2024 && (y - 2024) % 6 === 0) lista.push({ fecha: aIso(utc(y, 10, 1)), nombre: "Transmisión del Poder Ejecutivo" });
  if (y < 2024 && (2024 - y) % 6 === 0) lista.push({ fecha: aIso(utc(y, 12, 1)), nombre: "Transmisión del Poder Ejecutivo" });

  if (bancario) {
    const p = pascua(y).getTime();
    lista.push(
      { fecha: aIso(new Date(p - 3 * DIA)), nombre: "Jueves Santo", bancario: true },
      { fecha: aIso(new Date(p - 2 * DIA)), nombre: "Viernes Santo", bancario: true },
      { fecha: aIso(utc(y, 11, 2)), nombre: "Día de Muertos", bancario: true },
      { fecha: aIso(utc(y, 12, 12)), nombre: "Día de la Virgen de Guadalupe", bancario: true }
    );
  }
  return lista.sort((a, b) => a.fecha.localeCompare(b.fecha));
};

const mapaFeriados = (desde: number, hasta: number, bancario: boolean) => {
  const mapa = new Map<string, Feriado>();
  for (let y = desde; y <= hasta; y++) for (const f of feriadosDe(y, bancario)) mapa.set(f.fecha, f);
  return mapa;
};

const esFinDeSemana = (d: Date) => d.getUTCDay() === 0 || d.getUTCDay() === 6;

export interface ResultadoDias {
  naturales: number;
  habiles: number;
  finesDeSemana: number;
  /** Feriados que caen entre semana dentro del periodo. */
  feriados: Feriado[];
}

/** Máximo de días que se recorren, para no colgar la página con fechas absurdas. */
export const MAX_DIAS = 366 * 100;

export const contarDias = (inicio: Date, fin: Date, { bancario, incluirInicio }: OpcionesDias): ResultadoDias => {
  const signo = fin < inicio ? -1 : 1;
  const [a, b] = signo === 1 ? [inicio, fin] : [fin, inicio];
  const total = Math.round((b.getTime() - a.getTime()) / DIA);
  if (total > MAX_DIAS) throw new RangeError("El periodo es de más de 100 años.");

  const mapa = mapaFeriados(a.getUTCFullYear(), b.getUTCFullYear(), bancario);
  let habiles = 0;
  let finesDeSemana = 0;
  const feriados: Feriado[] = [];
  for (let i = incluirInicio ? 0 : 1; i <= total; i++) {
    const d = new Date(a.getTime() + i * DIA);
    if (esFinDeSemana(d)) finesDeSemana++;
    else {
      const feriado = mapa.get(aIso(d));
      if (feriado) feriados.push(feriado);
      else habiles++;
    }
  }
  const naturales = total + (incluirInicio ? 1 : 0);
  return { naturales: naturales * signo, habiles: habiles * signo, finesDeSemana, feriados };
};

/**
 * Fecha en que vence un plazo de n días hábiles. El conteo empieza el día
 * siguiente al de inicio, como en los plazos legales.
 */
export const sumarHabiles = (inicio: Date, n: number, bancario: boolean): Date => {
  if (n > MAX_DIAS) throw new RangeError("Son demasiados días.");
  const paso = n < 0 ? -1 : 1;
  let restantes = Math.abs(n);
  let d = inicio;
  const porAnio = new Map<number, Set<string>>();
  const esFeriado = (fecha: Date) => {
    const y = fecha.getUTCFullYear();
    if (!porAnio.has(y)) porAnio.set(y, new Set(feriadosDe(y, bancario).map((f) => f.fecha)));
    return porAnio.get(y)!.has(aIso(fecha));
  };
  while (restantes > 0) {
    d = new Date(d.getTime() + paso * DIA);
    if (!esFinDeSemana(d) && !esFeriado(d)) restantes--;
  }
  return d;
};

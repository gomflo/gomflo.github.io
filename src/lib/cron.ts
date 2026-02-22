/**
 * Utilidades para expresiones Cron (5 campos: minuto hora día-mes mes día-semana).
 * Genera descripciones en lenguaje natural en español.
 */

const MESES = [
  "enero", "febrero", "marzo", "abril", "mayo", "junio",
  "julio", "agosto", "septiembre", "octubre", "noviembre", "diciembre"
] as const;

const DIAS_SEMANA = [
  "domingo", "lunes", "martes", "miércoles", "jueves", "viernes", "sábado"
] as const;

export type CronFields = {
  minute: string;
  hour: string;
  dayOfMonth: string;
  month: string;
  dayOfWeek: string;
};


/**
 * Parsea una expresión cron de 5 campos y devuelve los campos o null si es inválida.
 */
export function parseCron(expr: string): CronFields | null {
  const trimmed = expr.trim().replace(/\s+/g, " ");
  const parts = trimmed.split(" ");
  if (parts.length !== 5) return null;
  const [minute, hour, dayOfMonth, month, dayOfWeek] = parts;
  if (!isValidField(minute, 0, 59) || !isValidField(hour, 0, 23) ||
      !isValidField(dayOfMonth, 1, 31) || !isValidField(month, 1, 12) ||
      !isValidField(dayOfWeek, 0, 7)) return null;
  return { minute, hour, dayOfMonth, month, dayOfWeek };
}

function isValidField(
  value: string,
  min: number,
  max: number
): boolean {
  if (value === "*") return true;
  if (/^\d+$/.test(value)) {
    const n = parseInt(value, 10);
    return n >= min && n <= max;
  }
  if (/^\d+-\d+$/.test(value)) {
    const [a, b] = value.split("-").map((x) => parseInt(x, 10));
    return a >= min && b <= max && a <= b;
  }
  if (/^[\d,-]+$/.test(value)) {
    return value.split(",").every((part) => {
      const n = parseInt(part.trim(), 10);
      return !Number.isNaN(n) && n >= min && n <= max;
    });
  }
  if (/^\*\/\d+$/.test(value)) {
    const step = parseInt(value.slice(2), 10);
    return step > 0 && step <= max - min + 1;
  }
  if (/^\d+-\d+\/\d+$/.test(value)) {
    const [range, stepStr] = value.split("/");
    const [a, b] = range.split("-").map((x) => parseInt(x, 10));
    const step = parseInt(stepStr, 10);
    return a >= min && b <= max && a <= b && step > 0;
  }
  return false;
}

/**
 * Construye la expresión cron a partir de los campos.
 */
export function buildCron(f: CronFields): string {
  return `${f.minute} ${f.hour} ${f.dayOfMonth} ${f.month} ${f.dayOfWeek}`;
}

/**
 * Describe en español cuándo se ejecutará la expresión cron.
 */
export function cronToHuman(fields: CronFields): string {
  const { minute, hour, dayOfMonth, month, dayOfWeek } = fields;
  const everyMinute = minute === "*";
  const everyHour = hour === "*";
  const everyDom = dayOfMonth === "*";
  const everyMonth = month === "*";
  const everyDow = dayOfWeek === "*";

  const minDesc = describeMinute(minute);
  const hourDesc = describeHour(hour);
  const domDesc = describeDayOfMonth(dayOfMonth);
  const monthDesc = describeMonth(month);
  const dowDesc = describeDayOfWeek(dayOfWeek);

  if (everyMinute && everyHour && everyDom && everyMonth && everyDow) {
    return "Cada minuto.";
  }
  if (!everyMinute && everyHour && everyDom && everyMonth && everyDow) {
    return `Cada hora, en el minuto ${minDesc}.`;
  }
  if (everyMinute && !everyHour && everyDom && everyMonth && everyDow) {
    return `Cada hora, a las ${hourDesc}.`;
  }

  const timeStr =
    everyHour && everyMinute
      ? ""
      : everyHour
        ? `en el minuto ${minDesc}`
        : everyMinute
          ? `a las ${hourDesc}`
          : `a las ${hourDesc}:${minDesc}`;

  if (everyDom && everyMonth && everyDow) {
    return timeStr ? `Todos los días ${timeStr}.` : "Cada minuto.";
  }

  let dayPart: string;
  if (!everyDom && everyMonth && everyDow) {
    dayPart = `el día ${domDesc} de cada mes`;
  } else if (everyDom && everyMonth && !everyDow) {
    dayPart = `cada ${dowDesc}`;
  } else if (!everyDom && everyMonth && !everyDow) {
    dayPart = `el día ${domDesc} de cada mes (solo si es ${dowDesc})`;
  } else if (everyDom && !everyMonth && everyDow) {
    dayPart = `todos los días en ${monthDesc}`;
  } else if (everyDom && !everyMonth && !everyDow) {
    dayPart = `cada ${dowDesc} en ${monthDesc}`;
  } else if (!everyDom && !everyMonth && everyDow) {
    dayPart = `el día ${domDesc} de ${monthDesc}`;
  } else {
    dayPart = `el día ${domDesc} de ${monthDesc}`;
  }

  const timeSuffix = timeStr ? ` ${timeStr}` : "";
  return `Se ejecuta ${dayPart}${timeSuffix}.`;
}

function describeMinute(m: string): string {
  if (m === "*") return "*";
  if (/^\d+$/.test(m)) return m.padStart(2, "0");
  if (m === "0") return "00";
  return m;
}

function describeHour(h: string): string {
  if (h === "*") return "*";
  if (/^\d+$/.test(h)) return h.padStart(2, "0");
  return h;
}

function describeDayOfMonth(d: string): string {
  if (d === "*") return "cada día";
  const n = parseInt(d, 10);
  if (!Number.isNaN(n)) {
    if (n === 1) return "1";
    return `día ${n}`;
  }
  if (d.includes("-")) {
    const [a, b] = d.split("-").map((x) => x.trim());
    return `del ${a} al ${b}`;
  }
  if (d.includes("/")) {
    const [range, step] = d.split("/");
    return `cada ${step} días${range !== "*" ? ` (${range})` : ""}`;
  }
  return d;
}

function describeMonth(m: string): string {
  if (m === "*") return "cada mes";
  if (/^\d+$/.test(m)) {
    const n = parseInt(m, 10);
    return MESES[n - 1] ?? m;
  }
  if (m.includes(",")) {
    const nums = m.split(",").map((x) => parseInt(x.trim(), 10));
    return nums.map((n) => MESES[n - 1]).join(", ");
  }
  if (m.includes("-")) {
    const [a, b] = m.split("-").map((x) => parseInt(x.trim(), 10));
    return `de ${MESES[a - 1]} a ${MESES[b - 1]}`;
  }
  return m;
}

function describeDayOfWeek(d: string): string {
  if (d === "*") return "cualquier día";
  const mapDay = (n: number) => DIAS_SEMANA[n === 7 ? 0 : n] ?? String(n);
  if (/^\d+$/.test(d)) {
    const n = parseInt(d, 10);
    return mapDay(n);
  }
  if (d === "1-5") return "lunes a viernes";
  if (d === "0-6") return "todos los días de la semana";
  if (d.includes(",")) {
    const nums = d.split(",").map((x) => mapDay(parseInt(x.trim(), 10)));
    return nums.join(", ");
  }
  if (d.includes("-")) {
    const [a, b] = d.split("-").map((x) => parseInt(x.trim(), 10));
    return `de ${mapDay(a)} a ${mapDay(b)}`;
  }
  return d;
}

/**
 * Genera la descripción en español para una expresión cron.
 * Si la expresión es inválida, devuelve un mensaje de error.
 */
export function explainCron(expr: string): string {
  const fields = parseCron(expr);
  if (!fields) return "Expresión cron inválida. Usa 5 campos: minuto hora día-mes mes día-semana (ej. 0 0 * * *).";
  return cronToHuman(fields);
}

/**
 * Presets comunes con su expresión y etiqueta.
 */
export const CRON_PRESETS: { label: string; expr: string }[] = [
  { label: "Cada minuto", expr: "* * * * *" },
  { label: "Cada hora", expr: "0 * * * *" },
  { label: "Todos los días a medianoche", expr: "0 0 * * *" },
  { label: "Todos los días a las 9:00", expr: "0 9 * * *" },
  { label: "Lunes a viernes a las 9:00", expr: "0 9 * * 1-5" },
  { label: "Lunes a viernes a las 8:30", expr: "30 8 * * 1-5" },
  { label: "Domingos a medianoche", expr: "0 0 * * 0" },
  { label: "Primer día del mes a medianoche", expr: "0 0 1 * *" },
  { label: "Cada 15 minutos", expr: "*/15 * * * *" },
  { label: "Cada 5 minutos", expr: "*/5 * * * *" },
];

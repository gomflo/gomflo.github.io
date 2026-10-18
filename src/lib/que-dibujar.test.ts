// npm test: node --test con jiti para leer TypeScript.
import { test } from "node:test";
import assert from "node:assert/strict";
import { CATEGORIAS, DIFICULTADES, IDEAS, elegir, fiesta, filtrar, listaComoTexto, mayuscula, recordar, type Idea } from "./que-dibujar";

/** Un azar que se repite: la misma secuencia en cada corrida. */
const semilla = (s: number) => () => {
  s = (Math.imul(s, 1664525) + 1013904223) >>> 0;
  return s / 2 ** 32;
};

test("cada idea va una sola vez y sin espacios sobrantes", () => {
  const textos = IDEAS.map((i) => i.texto);
  assert.equal(new Set(textos).size, textos.length);
  for (const t of textos) assert.equal(t, t.trim());
  for (const t of textos) assert.ok(t.length > 0);
});

test("hay ideas en cada categoría y cada dificultad, y de las dos juntas", () => {
  for (const c of CATEGORIAS) {
    for (const d of DIFICULTADES) {
      const n = filtrar(IDEAS, { categorias: [c.id], dificultades: [d.id] }).length;
      assert.ok(n >= 3, `${c.nombre} / ${d.nombre} tiene ${n}`);
    }
  }
});

test("las palabras de Garabato están, sin las que no son de familia", () => {
  const deGarabato = IDEAS.filter((i) => i.garabato).map((i) => i.texto);
  assert.equal(deGarabato.length, 300);
  for (const t of ["gato", "piñata", "pozole", "pedir posada", "correr"]) assert.ok(IDEAS.some((i) => i.texto === t), t);
  for (const t of ["botella de vino", "copa", "calzones", "cerveza", "tequila"]) assert.ok(!IDEAS.some((i) => i.texto === t), t);
});

test("filtrar: sin filtros salen todas", () => {
  assert.equal(filtrar(IDEAS, { categorias: [], dificultades: [] }).length, IDEAS.length);
});

test("filtrar: solo la categoría pedida", () => {
  const r = filtrar(IDEAS, { categorias: ["navidad"], dificultades: [] });
  assert.ok(r.length > 0);
  assert.ok(r.every((i) => i.categoria === "navidad"));
  assert.ok(r.some((i) => i.texto === "piñata"));
});

test("filtrar: varias categorías y una dificultad", () => {
  const r = filtrar(IDEAS, { categorias: ["animales", "comida"], dificultades: ["facil"] });
  assert.ok(r.every((i) => (i.categoria === "animales" || i.categoria === "comida") && i.dificultad === "facil"));
  assert.ok(r.some((i) => i.categoria === "animales"));
  assert.ok(r.some((i) => i.categoria === "comida"));
  assert.equal(
    r.length,
    IDEAS.filter((i) => ["animales", "comida"].includes(i.categoria) && i.dificultad === "facil").length,
  );
});

test("filtrar: solo la dificultad", () => {
  const r = filtrar(IDEAS, { categorias: [], dificultades: ["dificil", "media"] });
  assert.ok(r.every((i) => i.dificultad !== "facil"));
});

test("elegir: nunca repite la idea anterior, mil veces seguidas", () => {
  const pool = filtrar(IDEAS, { categorias: ["lugares"], dificultades: ["facil"] });
  const rand = semilla(7);
  let anterior = elegir(pool, [], rand)!;
  for (let k = 0; k < 1000; k++) {
    const nueva = elegir(pool, [anterior.texto], rand)!;
    assert.notEqual(nueva.texto, anterior.texto);
    anterior = nueva;
  }
});

test("elegir: con dos ideas, alterna", () => {
  const pool = IDEAS.slice(0, 2);
  assert.equal(elegir(pool, [pool[0].texto], () => 0)!.texto, pool[1].texto);
  assert.equal(elegir(pool, [pool[1].texto], () => 0.99)!.texto, pool[0].texto);
});

test("elegir: evita el historial mientras haya otras", () => {
  const pool = IDEAS.slice(0, 6);
  const recientes = pool.slice(0, 5).map((i) => i.texto);
  for (const r of [0, 0.3, 0.6, 0.999]) assert.equal(elegir(pool, recientes, () => r)!.texto, pool[5].texto);
});

test("elegir: si todo está en el historial, solo evita la anterior", () => {
  const pool = IDEAS.slice(0, 3);
  const recientes = [pool[2].texto, pool[1].texto, pool[0].texto];
  for (const r of [0, 0.5, 0.999]) assert.notEqual(elegir(pool, recientes, () => r)!.texto, pool[2].texto);
});

test("elegir: con una sola idea la repite, y sin ideas no hay", () => {
  const una = IDEAS.slice(0, 1);
  assert.equal(elegir(una, [una[0].texto])!.texto, una[0].texto);
  assert.equal(elegir([], []), null);
});

test("elegir: rand() que da 1 no se sale de la lista", () => {
  assert.ok(elegir(IDEAS, [], () => 1));
});

test("recordar: la más nueva primero, sin repetidos y hasta cinco", () => {
  let h: string[] = [];
  for (const t of ["a", "b", "c", "a", "d", "e", "f"]) h = recordar(h, t);
  assert.deepEqual(h, ["f", "e", "d", "a", "c"]);
});

test("fiesta: N ideas distintas", () => {
  for (const n of [1, 5, 12, 30, 60]) {
    const r = fiesta(IDEAS, n, semilla(n));
    assert.equal(r.length, n);
    assert.equal(new Set(r.map((i) => i.texto)).size, n);
  }
});

test("fiesta: respeta los filtros", () => {
  const pool = filtrar(IDEAS, { categorias: ["navidad"], dificultades: ["facil", "media"] });
  const r = fiesta(pool, 15, semilla(3));
  assert.equal(r.length, 15);
  assert.ok(r.every((i) => i.categoria === "navidad" && i.dificultad !== "dificil"));
});

test("fiesta: si piden más de las que hay, salen todas una vez", () => {
  const pool = filtrar(IDEAS, { categorias: ["transporte"], dificultades: ["dificil"] });
  const r = fiesta(pool, 50, semilla(1));
  assert.equal(r.length, pool.length);
  assert.deepEqual(new Set(r.map((i) => i.texto)), new Set(pool.map((i) => i.texto)));
});

test("fiesta: no cambia la lista original y con N inválido da vacío", () => {
  const pool: Idea[] = IDEAS.slice(0, 10);
  const antes = pool.map((i) => i.texto);
  fiesta(pool, 10, semilla(9));
  assert.deepEqual(pool.map((i) => i.texto), antes);
  assert.deepEqual(fiesta(pool, 0), []);
  assert.deepEqual(fiesta(pool, -3), []);
  assert.deepEqual(fiesta(pool, NaN), []);
});

test("fiesta: cambia el orden con otro azar", () => {
  const a = fiesta(IDEAS, 20, semilla(1)).map((i) => i.texto);
  const b = fiesta(IDEAS, 20, semilla(2)).map((i) => i.texto);
  assert.notDeepEqual(a, b);
});

test("texto para copiar y mayúscula inicial", () => {
  assert.equal(mayuscula("árbol de Navidad"), "Árbol de Navidad");
  const lista = IDEAS.filter((i) => i.texto === "gato" || i.texto === "piñata");
  assert.equal(listaComoTexto(lista), "1. Gato\n2. Piñata");
});

# Notas del rediseño del inicio (tasteskill v2)

Lectura: rediseño del inicio (`/`), conservando la marca "Bloques" (paleta y Bricolage) y todo lo que funciona
(mesa de pruebas, líneas en vivo, buscador, color entre páginas, JSON-LD). Composición nueva.

## Inventario
- El nombre gomflo y su marca: cuatro piezas en una caja de 2×2.
- 24 piezas, 5 categorías, un color por categoría (menta, coral, lila, sol, cielo).
- La mesa de pruebas: "¡Hola, México!" pasa en vivo por las 24 piezas.
- CLABE de 18 dígitos, IVA del 16 %, "M.N.", feriados de México, morse, romanos.
- La regla: sin cuenta, sin instalar, nada sale del navegador.
- Apps para Mac: Susurro (fn), Destello, Brinco. Íconos reales de 256 px.
- El cajón: 10 apps de Android con capturas reales (quincena, sobres, rifa, medicinas).

## Dirección
`one-motif` (seed 1213831213), con `--keep palette,type`. Elegida porque el sujeto ya tiene una forma propia:
la pieza de esquinas redondas del logo. Las otras (borrowed-category) pedían vestir el sitio de otra cosa.

## Idea
En esta página, **la pieza del logo de gomflo** se vuelve **la mesa de pruebas gigante del primer pliegue,
la viñeta de cada herramienta, la franja de cada categoría, el botón y el pie construido con bloques**.
Prueba del competidor: otro sitio de herramientas no tiene piezas de color por categoría que ya trabajan.

## Lo vivo
La mesa de pruebas, ahora el bloque gigante del primer pliegue: lo que escribes pasa por las 24 piezas
(cuatro responden ahí mismo, las 24 en la lista).

## Argumento
1. Son herramientas gratis, en español, que corren en tu navegador → titular, frase, botón, la mesa gigante.
2. Son 24 y ya están trabajando con lo que escribiste → la lista por categoría con su línea en vivo y buscador.
3. También hago apps para Mac y Android → mosaico escalonado con íconos y capturas reales.
4. Cierre → la marca construida con bloques, enlaces, la regla.

## Tamaños (cinco)
display (h1) · título (h2, categorías, la mesa) · destacado (frase, nombres) · texto 17 px · chico 14 px (código, pies).

---

# Segunda vuelta: "esperaba algo más sobrio" (2026-10-15)

Lectura: misma página, mismo contenido y comportamiento; bajar la voz. Fondo neutro, el color de las categorías
solo como puntos chicos, sin franjas ni bloques gigantes, letra en peso medio.

## Dirección
Opciones (tono quiet): product-performs, type-only-statement, quiet-instrument.
Elegida `product-performs` (seed 1239652883, `--keep palette,type`): el sujeto ES software que trabaja en vivo;
la mesa de pruebas ya es un fragmento real de interfaz. quiet-instrument se quedaba corto para 24 piezas;
type-only-statement no tiene dónde poner la mesa.
Hoja: hero "Column on one line" · showcase "Input half, output half" · list "Two-ended rows" ·
work "Quiet ledger, side preview" · footer "A footer of tiles" · motion "Slow crossfade".

## Idea
En esta página, **la mesa de pruebas (lo que escribes pasando por las piezas)** se vuelve **la mitad de entrada
y la mitad de salida: a la izquierda tu texto crudo, a la derecha un fragmento real de la caja respondiendo**.
Prueba del competidor: otro sitio de herramientas no tiene sus 24 piezas trabajando con el mismo texto.

## Lo vivo
La mitad de entrada (textarea) cambia la mitad de salida y las 24 líneas de la lista.

## Argumento
1. Herramientas gratis, en español, en tu navegador → titular modesto en una columna, frase, botón.
2. Trabajan con lo que escribes → mitad de entrada / mitad de salida.
3. Son 24 → lista de dos extremos con buscador en el riel izquierdo.
4. También hago apps → libro mayor con vista a un lado (se cruzan las imágenes).
5. Cierre → pie de mosaicos.

## Decisiones contra la hoja
- La cabecera del sitio se queda (navegación compartida y botón de tema): restricción de marca.
- Titular a 4–6vw (dirección) y no a 27px (blueprint del hero): la dirección manda sobre el blueprint.
- Un solo radio (0.75rem) para botones, campos, filas y mosaicos.

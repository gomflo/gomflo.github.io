// Copias chicas para las páginas de /frijolito/: las capturas de la app a 270 px (srcset de App.astro; en el
// teléfono se ven de ~100 px), las cartas a 208 px en cartas/chica/ (srcset de Cara.astro en las fichas de
// /frijolito/cartas-de-la-loteria/, que miden 104 px) y el icono a 64 px (favicon) y 96 px (la marca de la
// barra, 36 px en pantalla). La captura de la tele (tele/mesa.webp, 1440 px, de docs/ficha/tv/captura-1.png de la
// app) sale en 480, 720 y 1080 px para el srcset de /frijolito/loteria-para-posadas/ (44rem de ancho como mucho).
// Córrelo después de cambiar una captura, una carta o el icono: node scripts/frijolito-chicas.mjs
import sharp from "sharp";
import { mkdirSync, readdirSync } from "node:fs";

for (const dir of ["public/img/frijolito", "public/img/frijolito/en"]) {
  for (const f of readdirSync(dir).filter((f) => /^captura-[a-z]+\.webp$/.test(f))) {
    await sharp(`${dir}/${f}`).resize({ width: 270 }).webp({ quality: 80 }).toFile(`${dir}/${f.replace(".webp", "-270.webp")}`);
  }
}
const cartas = "public/frijolito/cartas";
mkdirSync(`${cartas}/chica`, { recursive: true });
for (const f of readdirSync(cartas).filter((f) => /^\d\d-[a-z-]+\.webp$/.test(f))) {
  await sharp(`${cartas}/${f}`).resize({ width: 208 }).webp({ quality: 80 }).toFile(`${cartas}/chica/${f}`);
}
for (const w of [480, 720, 1080]) {
  await sharp("public/img/frijolito/tele/mesa.webp").resize({ width: w }).webp({ quality: 80 }).toFile(`public/img/frijolito/tele/mesa-${w}.webp`);
}
const icono = "public/img/android/frijolito/icono.png";
await sharp(icono).resize(64, 64).png({ compressionLevel: 9 }).toFile("public/img/android/frijolito/icono-64.png");
await sharp(icono).resize(96, 96).webp({ quality: 90 }).toFile("public/img/android/frijolito/icono-96.webp");

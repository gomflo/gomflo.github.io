// Copias chicas para las páginas de /frijolito/: las capturas de la app a 270 px (srcset de App.astro; en el
// teléfono se ven de ~100 px) y el icono a 64 px (favicon) y 96 px (la marca de la barra, 36 px en pantalla).
// Córrelo después de cambiar una captura o el icono: node scripts/frijolito-chicas.mjs
import sharp from "sharp";
import { readdirSync } from "node:fs";

for (const dir of ["public/img/frijolito", "public/img/frijolito/en"]) {
  for (const f of readdirSync(dir).filter((f) => /^captura-[a-z]+\.webp$/.test(f))) {
    await sharp(`${dir}/${f}`).resize({ width: 270 }).webp({ quality: 80 }).toFile(`${dir}/${f.replace(".webp", "-270.webp")}`);
  }
}
const icono = "public/img/android/frijolito/icono.png";
await sharp(icono).resize(64, 64).png({ compressionLevel: 9 }).toFile("public/img/android/frijolito/icono-64.png");
await sharp(icono).resize(96, 96).webp({ quality: 90 }).toFile("public/img/android/frijolito/icono-96.webp");

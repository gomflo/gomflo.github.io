import { chromium } from "playwright";
const url = process.argv[2];
const b = await chromium.launch({ channel: "chrome" });
for (const [name, w, h] of [["desktop", 1440, 900], ["mobile", 390, 844]]) {
  const p = await b.newPage({ viewport: { width: w, height: h }, colorScheme: "light", reducedMotion: "reduce" });
  await p.goto(url, { waitUntil: "networkidle" });
  await p.screenshot({ path: `.taste-skill/claro-${name}-fold.jpg`, quality: 70 });
  await p.screenshot({ path: `.taste-skill/claro-${name}-full.jpg`, fullPage: true, quality: 60 });
  await p.close();
}
await b.close();

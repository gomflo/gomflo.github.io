// Sonidos cortos con Web Audio: ya decodificados en memoria se disparan sin latencia. Son los mismos de la
// app (tic de madera y el del ganador). Se cargan con el primer toque, porque el navegador no deja sonar
// nada antes de que la persona interactúe.

let context: AudioContext | null = null;
const buffers: Record<string, AudioBuffer> = {};
let loading: Promise<void> | null = null;

const FILES = {
  tic: "/tinmarin/sonidos/tic.wav",
  gano: "/tinmarin/sonidos/gano.m4a",
};

/** Crea el contexto y carga los sonidos sin reanudarlo. Crear un AudioContext tarda ~75 ms; hecho en el toque de
 *  «Girar» era el tirón del primer cuadro. Queda suspendido hasta que prepareSounds() lo reanude con el toque. */
export function warmSounds() {
  if (typeof AudioContext === "undefined") return;
  context ??= new AudioContext();
  load();
}

export function prepareSounds() {
  if (typeof AudioContext === "undefined") return;
  context ??= new AudioContext();
  if (context.state === "suspended") void context.resume();
  load();
}

function load() {
  loading ??= Promise.all(
    Object.entries(FILES).map(async ([name, url]) => {
      const data = await (await fetch(url)).arrayBuffer();
      buffers[name] = await context!.decodeAudioData(data);
    }),
  ).then(
    () => undefined,
    () => undefined,
  );
}

export function play(name: keyof typeof FILES, rate = 1, volume = 1) {
  const buffer = buffers[name];
  if (!context || !buffer) return;
  const source = context.createBufferSource();
  source.buffer = buffer;
  source.playbackRate.value = Math.min(2, Math.max(0.5, rate));
  const gain = context.createGain();
  gain.gain.value = volume;
  source.connect(gain).connect(context.destination);
  source.start();
}

/** Vibración corta donde el navegador la tiene (Android). En iPhone no hace nada. */
export function buzz(pattern: number | number[]) {
  if ("vibrate" in navigator) navigator.vibrate(pattern);
}

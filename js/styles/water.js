// Water — поверхность воды через сложение нескольких синусоид + fBM-ряби.

import { makeNoise2D } from "../noise.js";
import { makeColorRamp } from "../palettes.js";

export const water = {
  id: "water",
  name: "Water",
  category: "Organic",
  blurb: "Water surface: Perlin noise + sine waves with a specular highlight.",
  defaults: {
    scale: 0.006,
    octaves: 4,
    persistence: 0.5,
    lacunarity: 2.0,
    waveAmp: 30,
    highlight: 0.8,
    bgTint: 0,
  },
  params: [
    { key: "scale", label: "Scale", min: 0.001, max: 0.02, step: 0.001 },
    { key: "octaves", label: "Octaves", min: 1, max: 6, step: 1 },
    { key: "waveAmp", label: "Amplitude", min: 5, max: 80, step: 1 },
    { key: "highlight", label: "Highlight", min: 0, max: 1.5, step: 0.02 },
  ],

  createState(opts, w, h) {
    const noise = makeNoise2D(hashSeed(opts.seed));
    const ramp = makeColorRamp(opts.palette.colors);
    return { noise, ramp, w, h };
  },

  paint(ctx, opts, state) {
    const { w, h, noise, ramp } = state;
    const palette = opts.palette;
    const scale = opts.scale;
    const octaves = Math.round(opts.octaves);
    const persistence = opts.persistence;
    const lacunarity = opts.lacunarity;
    const ampPx = opts.waveAmp;

    // Только для каждой 4-й строки — ускоряем
    const img = ctx.createImageData(w, h);
    const data = img.data;
    // ramp(0.0) — самый тёмный стоп палитры, почти сливающийся с фоном;
    // это значение ещё и домножается на `base` (0..1) ниже, темнея дальше.
    // При низкочастотном шуме (малый scale/octaves) `v` почти постоянна
    // по всему холсту, и весь рендер схлопывался в один near-bg цвет.
    const baseR = +(/rgb\((\d+),(\d+),(\d+)\)/.exec(ramp(0.35)))[1];
    const baseG = +(/rgb\((\d+),(\d+),(\d+)\)/.exec(ramp(0.35)))[2];
    const baseB = +(/rgb\((\d+),(\d+),(\d+)\)/.exec(ramp(0.35)))[3];
    const hiR = +(/rgb\((\d+),(\d+),(\d+)\)/.exec(ramp(0.9)))[1];
    const hiG = +(/rgb\((\d+),(\d+),(\d+)\)/.exec(ramp(0.9)))[2];
    const hiB = +(/rgb\((\d+),(\d+),(\d+)\)/.exec(ramp(0.9)))[3];

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let amp = 1, freq = 1, sum = 0, max = 0;
        for (let o = 0; o < octaves; o++) {
          sum += noise(x * scale * freq, y * scale * freq) * amp;
          max += amp;
          amp *= persistence;
          freq *= lacunarity;
        }
        // sample полей на соседях для подсчёта «склона»
        let slope = 0;
        const slopeAmp = ampPx;
        const samples = [
          noise(x * scale, (y - slopeAmp) * scale),
          noise(x * scale, (y + slopeAmp) * scale),
          noise((x - slopeAmp) * scale, y * scale),
          noise((x + slopeAmp) * scale, y * scale),
        ];
        for (const s of samples) slope += s;
        slope = sum / max - slope / 4;

        let v = (sum / max) * 0.5 + 0.5;
        v = Math.max(0, Math.min(1, v + slope * 0.5));
        const i = (y * w + x) * 4;
        const base = v;
        const highlightF = opts.highlight * Math.max(0, 1 - Math.abs(v - 0.7) * 4) * 0.4;
        data[i] = baseR * base + hiR * highlightF;
        data[i + 1] = baseG * base + hiG * highlightF;
        data[i + 2] = baseB * base + hiB * highlightF;
        data[i + 3] = 255;
      }
    }
    const off = scratchCanvas(w, h);
    off.getContext("2d").putImageData(img, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(off, 0, 0);

    if (opts.bgTint > 0) {
      ctx.fillStyle = `rgba(0,0,0,${opts.bgTint})`;
      ctx.fillRect(0, 0, w, h);
    }
  },
};

const SCRATCHES = new Map();
function scratchCanvas(w, h) {
  const key = `${w}x${h}`;
  let c = SCRATCHES.get(key);
  if (!c) { c = document.createElement("canvas"); SCRATCHES.set(key, c); }
  if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
  return c;
}
function hashSeed(seed) {
  const s = String(seed ?? "");
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

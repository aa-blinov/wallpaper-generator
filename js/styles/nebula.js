// Nebula — галактические облака пыли и звёзд. Multi-octave noise + звёздные точки.

import { makeNoise2D } from "../noise.js";
import { makeRng } from "../rng.js";
import { makeColorRamp, hexToRgb } from "../palettes.js";

export const nebula = {
  id: "nebula",
  name: "Nebula",
  category: "Шум",
  blurb: "Туманность: fBM-облака + точечные звёзды разной яркости.",
  defaults: {
    scale: 0.003,
    octaves: 6,
    persistence: 0.55,
    lacunarity: 2.0,
    starDensity: 0.0008,
    contrast: 1.2,
    bgTint: 0,
  },
  params: [
    { key: "scale", label: "Масштаб облаков", min: 0.0005, max: 0.02, step: 0.0005 },
    { key: "octaves", label: "Октавы", min: 1, max: 7, step: 1 },
    { key: "persistence", label: "Затухание", min: 0.2, max: 0.95, step: 0.01 },
    { key: "lacunarity", label: "Лакunarность", min: 1.4, max: 3.0, step: 0.05 },
    { key: "starDensity", label: "Плотность звёзд", min: 0, max: 0.005, step: 0.0001 },
    { key: "contrast", label: "Контраст", min: 0.4, max: 3, step: 0.05 },
  ],

  createState(opts, w, h) {
    const noise = makeNoise2D(hashSeed(opts.seed));
    const rng = makeRng(opts.seed + ":neb");
    const ramp = makeColorRamp(opts.palette.colors);
    return { noise, rng, ramp, w, h };
  },

  paint(ctx, opts, state) {
    const { w, h, noise, rng, ramp } = state;
    const palette = opts.palette;
    const img = ctx.createImageData(w, h);
    const data = img.data;
    const bg = hexToRgb(palette.bg);
    const cols = palette.colors;
    const cold = hexToRgb(cols[Math.floor(cols.length / 2)]);
    const hot = hexToRgb(cols[cols.length - 1]);

    const scale = opts.scale;
    const octaves = Math.round(opts.octaves);
    const persistence = opts.persistence;
    const lacunarity = opts.lacunarity;
    const contrast = opts.contrast;
    const bgR = bg[0], bgG = bg[1], bgB = bg[2];
    const coldR = cold[0], coldG = cold[1], coldB = cold[2];
    const hotR = hot[0], hotG = hot[1], hotB = hot[2];

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        let amp = 1, freq = 1, sum = 0, max = 0;
        for (let o = 0; o < octaves; o++) {
          sum += noise(x * scale * freq, y * scale * freq) * amp;
          max += amp;
          amp *= persistence;
          freq *= lacunarity;
        }
        let v = (sum / max) * 0.5 + 0.5;
        v = clamp01(((v - 0.5) * contrast) + 0.5);
        const i = (y * w + x) * 4;
        if (v < 0.45) {
          const t = v / 0.45 * 0.3;
          data[i] = bgR * (1 - t) + coldR * t * 0.1;
          data[i + 1] = bgG * (1 - t) + coldG * t * 0.1;
          data[i + 2] = bgB * (1 - t) + coldB * t * 0.1;
        } else {
          const t = (v - 0.45) / 0.55;
          data[i] = coldR + (hotR - coldR) * t;
          data[i + 1] = coldG + (hotG - coldG) * t;
          data[i + 2] = coldB + (hotB - coldB) * t;
        }
        data[i + 3] = 255;
      }
    }
    const off = scratchCanvas(w, h);
    off.getContext("2d").putImageData(img, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(off, 0, 0, w, h);

    const starCount = (w * h * opts.starDensity) | 0;
    for (let i = 0; i < starCount; i++) {
      const x = (rng() * w) | 0, y = (rng() * h) | 0;
      ctx.fillStyle = `rgba(255,255,255,${0.3 + rng() * 0.7})`;
      const sz = rng() < 0.92 ? 1 : (rng() < 0.96 ? 2 : 3);
      ctx.fillRect(x, y, sz, sz);
      if (sz > 1) {
        ctx.fillStyle = `rgba(220,220,220,0.3)`;
        ctx.fillRect(x - 1, y, sz + 2, sz);
        ctx.fillRect(x, y - 1, sz, sz + 2);
      }
    }

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
function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
function hashSeed(seed) {
  const s = String(seed ?? "");
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

// Cloud Puff — объёмные облака: fBM + 2 уровня порога и мягкие маски.
//
// Поддерживает chunked-paint: если в opts есть _chunk и _yield, рисуем по
// частям, делая yield между ними. Это сохраняет UI отзывчивым на тяжёлых
// разрешениях. При обычном sync-вызове — рисуем как раньше.

import { makeNoise2D } from "../noise.js";
import { makeColorRamp } from "../palettes.js";

export const cloudpuff = {
  id: "cloudpuff",
  name: "Cloud Puff",
  category: "Organic",
  blurb: "Volumetric clouds: two-tier brightening via noise.",
  defaults: {
    scale: 0.004,
    octaves: 6,
    contrast: 1.0,
    softness: 0.05,
    bgTint: 0,
  },
  params: [
    { key: "scale", label: "Scale", min: 0.001, max: 0.02, step: 0.0005 },
    { key: "octaves", label: "Octaves", min: 3, max: 7, step: 1 },
    { key: "contrast", label: "Contrast", min: 0.4, max: 3, step: 0.05 },
    { key: "softness", label: "Softness", min: 0, max: 0.2, step: 0.005 },
  ],

  createState(opts, w, h) {
    const noise = makeNoise2D(hashSeed(opts.seed));
    const ramp = makeColorRamp(opts.palette.colors);
    return { noise, ramp, w, h };
  },

  paint(ctx, opts, state) {
    const { w, h, noise, ramp } = state;
    const palette = opts.palette;
    const img = ctx.createImageData(w, h);
    const data = img.data;
    const scale = opts.scale;
    const octaves = Math.round(opts.octaves);
    const softness = opts.softness;
    const persistence = 0.55, lacunarity = 2.1;
    const contrast = opts.contrast;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        paintPixel(data, x, y, w, noise, ramp, scale, octaves, softness, persistence, lacunarity, contrast);
      }
    }
    const off = scratchCanvas(w, h);
    off.getContext("2d").putImageData(img, 0, 0);
    ctx.drawImage(off, 0, 0);
    if (opts.bgTint > 0) {
      ctx.fillStyle = `rgba(0,0,0,${opts.bgTint})`;
      ctx.fillRect(0, 0, w, h);
    }
  },

  // Chunked variant: вызывается вместо paint, если opts._yield определён.
  // opts._rowChunk: число строк за тик (по умолчанию 64).
  async paintChunked(ctx, opts, state) {
    const { w, h, noise, ramp } = state;
    const img = ctx.createImageData(w, h);
    const data = img.data;
    const scale = opts.scale;
    const octaves = Math.round(opts.octaves);
    const softness = opts.softness;
    const persistence = 0.55, lacunarity = 2.1;
    const contrast = opts.contrast;
    const rowChunk = Math.max(8, Math.min(256, opts._rowChunk || 64));
    const yieldFn = opts._yield || (() => new Promise((r) => setTimeout(r, 0)));

    for (let y = 0; y < h; y += rowChunk) {
      const yEnd = Math.min(h, y + rowChunk);
      for (let yy = y; yy < yEnd; yy++) {
        for (let x = 0; x < w; x++) {
          paintPixel(data, x, yy, w, noise, ramp, scale, octaves, softness, persistence, lacunarity, contrast);
        }
      }
      // yield управляется вызывающим кодом; opts._yield всегда async-функция.
      await yieldFn();
    }
    const off = scratchCanvas(w, h);
    off.getContext("2d").putImageData(img, 0, 0);
    ctx.drawImage(off, 0, 0);
    if (opts.bgTint > 0) {
      ctx.fillStyle = `rgba(0,0,0,${opts.bgTint})`;
      ctx.fillRect(0, 0, w, h);
    }
  },
};

function paintPixel(data, x, y, w, noise, ramp, scale, octaves, softness, persistence, lacunarity, contrast) {
  let amp = 1, freq = 1, sum = 0, max = 0;
  for (let o = 0; o < octaves; o++) {
    sum += noise(x * scale * freq, y * scale * freq) * amp;
    max += amp;
    amp *= persistence;
    freq *= lacunarity;
  }
  let v = (sum / max) * 0.5 + 0.5;
  const a = Math.max(0, v - 0.5 - softness) / (1 - 0.5 - softness);
  const a2 = Math.max(0, v - 0.8) / 0.2;
  const i = (y * w + x) * 4;
  const base = ramp(v * contrast);
  const highlight = ramp(Math.min(1, (v + a2 * 0.4) * contrast));
  const m = /rgb\((\d+),(\d+),(\d+)\)/.exec(base);
  const m2 = /rgb\((\d+),(\d+),(\d+)\)/.exec(highlight);
  if (m) {
    data[i] = +m[1] + (+m2[1] - +m[1]) * a * 0.6;
    data[i + 1] = +m[2] + (+m2[2] - +m[2]) * a * 0.6;
    data[i + 2] = +m[3] + (+m2[3] - +m[3]) * a * 0.6;
  }
  data[i + 3] = 255;
}

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

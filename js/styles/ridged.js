// Ridged Multifractal — модификация fBM: 1 - |noise| на каждой октаве.
// Тонкие «горные хребты». Поддерживает async paintChunked.

import { makeNoise2D } from "../noise.js";
import { makeColorRamp } from "../palettes.js";

export const ridged = {
  id: "ridged",
  name: "Ridged Multifractal",
  category: "Noise",
  blurb: "\"Mountain ridges\": 1 - |noise| across octaves.",
  defaults: {
    scale: 0.005,
    octaves: 6,
    persistence: 0.5,
    lacunarity: 2.0,
    offset: 1.0,
    gain: 2.0,
    contrast: 1.0,
    bgTint: 0,
  },
  params: [
    { key: "scale", label: "Scale", min: 0.001, max: 0.04, step: 0.0005 },
    { key: "octaves", label: "Octaves", min: 1, max: 7, step: 1 },
    { key: "persistence", label: "Decay", min: 0.2, max: 0.95, step: 0.01 },
    { key: "lacunarity", label: "Lacunarity", min: 1.5, max: 3.0, step: 0.05 },
    { key: "gain", label: "Gain", min: 1.0, max: 3.0, step: 0.05 },
    { key: "contrast", label: "Contrast", min: 0.4, max: 3, step: 0.05 },
    { key: "bgTint", label: "Darken background", min: 0, max: 1, step: 0.02 },
  ],

  createState(opts, w, h) {
    const noise = makeNoise2D(hashSeed(opts.seed));
    const ramp = makeColorRamp(opts.palette.colors);
    return { noise, ramp, w, h };
  },

  paint(ctx, opts, state) {
    const { w, h, noise, ramp } = state;
    const img = ctx.createImageData(w, h);
    const data = img.data;
    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        paintPixel(data, x, y, w, noise, ramp, opts);
      }
    }
    finishImage(ctx, img, w, h);
    if (opts.bgTint > 0) {
      ctx.fillStyle = `rgba(0,0,0,${opts.bgTint})`;
      ctx.fillRect(0, 0, w, h);
    }
  },

  async paintChunked(ctx, opts, state) {
    const { w, h, noise, ramp } = state;
    const img = ctx.createImageData(w, h);
    const data = img.data;
    const rowChunk = Math.max(8, Math.min(256, opts._rowChunk || 32));
    const yieldFn = opts._yield || (() => new Promise((r) => setTimeout(r, 0)));
    for (let y = 0; y < h; y += rowChunk) {
      const yEnd = Math.min(h, y + rowChunk);
      for (let yy = y; yy < yEnd; yy++) {
        for (let x = 0; x < w; x++) {
          paintPixel(data, x, yy, w, noise, ramp, opts);
        }
      }
      await yieldFn();
    }
    finishImage(ctx, img, w, h);
    if (opts.bgTint > 0) {
      ctx.fillStyle = `rgba(0,0,0,${opts.bgTint})`;
      ctx.fillRect(0, 0, w, h);
    }
  },
};

function paintPixel(data, x, y, w, noise, ramp, opts) {
  const scale = opts.scale;
  const octaves = opts.octaves;
  const persistence = opts.persistence;
  const lacunarity = opts.lacunarity;
  const gain = opts.gain;
  const contrast = opts.contrast;
  let amp = 1, freq = 1, sum = 0, weight = 1;
  for (let o = 0; o < octaves; o++) {
    let n = Math.abs(noise(x * scale * freq, y * scale * freq));
    n = gain * (1 - n);
    n *= n * weight;
    weight = Math.min(1, n * 4);
    sum += n * amp;
    amp *= persistence;
    freq *= lacunarity;
  }
  let v = clamp01(sum * 0.5 * contrast);
  const col = ramp(v);
  const m = /rgb\((\d+),(\d+),(\d+)\)/.exec(col);
  const i = (y * w + x) * 4;
  if (m) { data[i] = +m[1]; data[i + 1] = +m[2]; data[i + 2] = +m[3]; data[i + 3] = 255; }
}

function finishImage(ctx, img, w, h) {
  const off = scratchCanvas(w, h);
  off.getContext("2d").putImageData(img, 0, 0);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(off, 0, 0, w, h);
}

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

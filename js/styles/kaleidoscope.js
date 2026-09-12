// Kaleidoscope — сектор N-кратной симметрии + облака шума.
// Поддерживает async paintChunked для неблокирующего render.

import { makeNoise2D } from "../noise.js";
import { makeColorRamp } from "../palettes.js";

export const kaleidoscope = {
  id: "kaleidoscope",
  name: "Kaleidoscope",
  category: "Органические",
  blurb: "Калейдоскоп: N-секторов симметрии с шумовым заполнением.",
  defaults: {
    sectors: 8,
    scale: 0.006,
    octaves: 4,
    contrast: 1.1,
    bgTint: 0,
  },
  params: [
    { key: "sectors", label: "Секторов", min: 2, max: 18, step: 1 },
    { key: "scale", label: "Масштаб", min: 0.002, max: 0.02, step: 0.001 },
    { key: "octaves", label: "Октавы", min: 1, max: 6, step: 1 },
    { key: "contrast", label: "Контраст", min: 0.5, max: 3, step: 0.05 },
  ],

  createState(opts, w, h) {
    const noise = makeNoise2D(hashSeed(opts.seed));
    const ramp = makeColorRamp(opts.palette.colors);
    return { noise, ramp, w, h };
  },

  paint(ctx, opts, state) {
    const { w, h, noise, ramp } = state;
    const palette = opts.palette;
    const N = Math.max(2, Math.round(opts.sectors));
    const secAngle = (Math.PI * 2) / N;
    const img = ctx.createImageData(w, h);
    const data = img.data;
    const cx = w / 2, cy = h / 2;
    const octaves = Math.round(opts.octaves);
    const scale = opts.scale;
    const persistence = 0.55, lacunarity = 2.0;
    const contrast = opts.contrast;

    for (let y = 0; y < h; y++) {
      for (let x = 0; x < w; x++) {
        paintPixel(data, x, y, w, noise, ramp, scale, octaves, persistence, lacunarity, secAngle, cx, cy, contrast);
      }
    }
    flushImage(ctx, img, w, h);
    if (opts.bgTint > 0) {
      ctx.fillStyle = `rgba(0,0,0,${opts.bgTint})`;
      ctx.fillRect(0, 0, w, h);
    }
  },

  async paintChunked(ctx, opts, state) {
    const { w, h, noise, ramp } = state;
    const N = Math.max(2, Math.round(opts.sectors));
    const secAngle = (Math.PI * 2) / N;
    const img = ctx.createImageData(w, h);
    const data = img.data;
    const cx = w / 2, cy = h / 2;
    const octaves = Math.round(opts.octaves);
    const scale = opts.scale;
    const persistence = 0.55, lacunarity = 2.0;
    const contrast = opts.contrast;
    const rowChunk = Math.max(8, Math.min(256, opts._rowChunk || 32));
    const yieldFn = opts._yield || (() => new Promise((r) => setTimeout(r, 0)));

    for (let y = 0; y < h; y += rowChunk) {
      const yEnd = Math.min(h, y + rowChunk);
      for (let yy = y; yy < yEnd; yy++) {
        for (let x = 0; x < w; x++) {
          paintPixel(data, x, yy, w, noise, ramp, scale, octaves, persistence, lacunarity, secAngle, cx, cy, contrast);
        }
      }
      await yieldFn();
    }
    flushImage(ctx, img, w, h);
    if (opts.bgTint > 0) {
      ctx.fillStyle = `rgba(0,0,0,${opts.bgTint})`;
      ctx.fillRect(0, 0, w, h);
    }
  },
};

function paintPixel(data, x, y, w, noise, ramp, scale, octaves, persistence, lacunarity, secAngle, cx, cy, contrast) {
  const dx = x - cx, dy = y - cy;
  let ang = Math.atan2(dy, dx);
  const r = Math.hypot(dx, dy);
  let a = ang % secAngle;
  if (a < 0) a += secAngle;
  if (a > secAngle / 2) a = secAngle - a;
  const nx = cx + r * Math.cos(a);
  const ny = cy + r * Math.sin(a);
  let amp = 1, freq = 1, sum = 0, max = 0;
  for (let o = 0; o < octaves; o++) {
    sum += noise(nx * scale * freq, ny * scale * freq) * amp;
    max += amp;
    amp *= persistence;
    freq *= lacunarity;
  }
  let v = (sum / max) * 0.5 + 0.5;
  v = clamp01(v * contrast);
  const c = ramp(v);
  const m = /rgb\((\d+),(\d+),(\d+)\)/.exec(c);
  const i = (y * w + x) * 4;
  if (m) { data[i] = +m[1]; data[i + 1] = +m[2]; data[i + 2] = +m[3]; }
  data[i + 3] = 255;
}

function flushImage(ctx, img, w, h) {
  const off = scratchCanvas(w, h);
  off.getContext("2d").putImageData(img, 0, 0);
  ctx.drawImage(off, 0, 0);
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

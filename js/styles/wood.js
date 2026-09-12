// Wood — деревянные волокна: fBM + sin-деформация + контраст по вертикали.

import { makeNoise2D } from "../noise.js";
import { makeColorRamp } from "../palettes.js";

export const wood = {
  id: "wood",
  name: "Wood",
  category: "Textures",
  blurb: "Wood: grain from warped noise.",
  defaults: {
    scale: 0.012,
    rings: 9,
    contrast: 1.2,
    bgTint: 0,
  },
  params: [
    { key: "scale", label: "Noise", min: 0.002, max: 0.05, step: 0.001 },
    { key: "rings", label: "Rings", min: 2, max: 30, step: 0.5 },
    { key: "contrast", label: "Contrast", min: 0.5, max: 3, step: 0.05 },
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
        paintPixel(data, x, y, w, h, noise, ramp, opts);
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
    const img = ctx.createImageData(w, h);
    const data = img.data;
    const rowChunk = Math.max(8, Math.min(256, opts._rowChunk || 32));
    const yieldFn = opts._yield || (() => new Promise((r) => setTimeout(r, 0)));
    for (let y = 0; y < h; y += rowChunk) {
      const yEnd = Math.min(h, y + rowChunk);
      for (let yy = y; yy < yEnd; yy++) {
        for (let x = 0; x < w; x++) {
          paintPixel(data, x, yy, w, h, noise, ramp, opts);
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

function paintPixel(data, x, y, w, h, noise, ramp, opts) {
  const scale = opts.scale;
  // Параметр `rings` — число колец, видимых поперёк короткой стороны канваса.
  const ringFreq = (opts.rings / Math.min(w, h)) * Math.PI * 2;
  const contrast = opts.contrast;
  const cx = w / 2, cy = h;
  // Деформация через шум
  const dx = noise(x * scale, y * scale) * 18;
  const dy = noise((x + 100) * scale, (y + 100) * scale) * 18;
  const d = Math.hypot(x - cx + dx * 0.5, y - cy + dy * 0.5);
  // Концентрические кольца
  let v = 0.5 + 0.5 * Math.sin((d + (noise(x * scale * 0.4, y * scale * 0.4) * 60)) * ringFreq);
  v += 0.2 * noise(x * scale * 0.5, y * scale * 0.5);
  v *= 0.5 + 0.5 * (1 - y / h);
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

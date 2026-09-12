// Marble — классический мраморный паттерн через деформацию: sin(x*freq + warp).

import { makeNoise2D } from "../noise.js";
import { makeColorRamp } from "../palettes.js";

export const marble = {
  id: "marble",
  name: "Marble",
  category: "Textures",
  blurb: "Marble: sine-wave bands warped by noise.",
  defaults: {
    scale: 0.005,
    warp: 0.04,
    bands: 0.025,
    contrast: 1.0,
    bgTint: 0,
  },
  params: [
    { key: "scale", label: "Noise", min: 0.001, max: 0.02, step: 0.0005 },
    { key: "warp", label: "Warp strength", min: 0, max: 0.2, step: 0.005 },
    { key: "bands", label: "Stripe frequency", min: 0.005, max: 0.08, step: 0.001 },
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
    const warp = opts.warp * Math.min(w, h);
    const bands = opts.bands * Math.min(w, h);
    for (let y = 0; y < h; y += rowChunk) {
      const yEnd = Math.min(h, y + rowChunk);
      for (let yy = y; yy < yEnd; yy++) {
        for (let x = 0; x < w; x++) {
          paintPixelImpl(data, x, yy, w, h, noise, ramp, opts.scale, warp, bands, opts.contrast);
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
  const warp = opts.warp * Math.min(w, h);
  const bands = opts.bands * Math.min(w, h);
  paintPixelImpl(data, x, y, w, h, noise, ramp, scale, warp, bands, opts.contrast);
}

function paintPixelImpl(data, x, y, w, h, noise, ramp, scale, warp, bands, contrast) {
  const nx = noise(x * scale, y * scale) * warp;
  const ny = noise((x + 99) * scale, (y + 99) * scale) * warp;
  let v = Math.sin((x + nx) * bands + (y + ny) * bands * 0.7);
  v = (v * 0.5 + 0.5) * contrast;
  const c = ramp(clamp01(v));
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

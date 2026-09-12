// Log-Polar Spiral — координаты трактуются как лог-полярные: r = exp(t)*k.
// После такого маппинга обычный Simplex/FBM-шум «вытягивается» в спираль,
// создавая галактики, воронки, ураганы.

import { makeNoise2D, makeFbm } from "../noise.js";
import { makeColorRamp } from "../palettes.js";

export const logpolar = {
  id: "logpolar",
  name: "Log-Polar Spiral",
  category: "Noise",
  blurb: "Noise unrolled into log-polar coordinates — galaxies and whirlpools.",
  defaults: {
    scale: 4.0,           // базовый масштаб (больше — больше «веток»)
    octaves: 5,
    persistence: 0.5,
    lacunarity: 2.0,
    contrast: 1.3,
    brightness: 0.0,
    shift: 0.5,
    twist: 0.0,           // постоянное «кручение» спирали
    armlines: 1,
    sampleStep: 2,
  },
  params: [
    { key: "scale", label: "Spiral frequency", min: 1.5, max: 12, step: 0.1 },
    { key: "twist", label: "Twist", min: 0, max: 2, step: 0.05, format: (v) => v.toFixed(2) },
    { key: "armlines", label: "Branch count", min: 1, max: 8, step: 1 },
    { key: "octaves", label: "Octaves", min: 1, max: 8, step: 1 },
    { key: "persistence", label: "Decay", min: 0.2, max: 0.9, step: 0.01 },
    { key: "lacunarity", label: "Lacunarity", min: 1.2, max: 3.5, step: 0.05 },
    { key: "contrast", label: "Contrast", min: 0.4, max: 3, step: 0.05 },
    { key: "brightness", label: "Brightness", min: -0.5, max: 0.5, step: 0.02 },
    { key: "shift", label: "Color shift", min: 0, max: 1, step: 0.005 },
    { key: "sampleStep", label: "Sample step", min: 1, max: 8, step: 1, format: (v) => `${v.toFixed(0)} px` },
  ],

  createState(opts, w, h) {
    const noise2D = makeNoise2D(hashSeed(opts.seed));
    const fbm = makeFbm(noise2D, { octaves: opts.octaves, persistence: opts.persistence, lacunarity: opts.lacunarity });
    const ramp = makeColorRamp(opts.palette.colors);
    return { noise2D, fbm, ramp, w, h };
  },

  paint(ctx, opts, state) {
    sampleToCanvas(ctx, opts, state, 0, 0);
  },

  animate(ctx, opts, state, t) {
    sampleToCanvas(ctx, opts, state, t * 0.0008, t * 0.0005);
  },
};

function sampleToCanvas(ctx, opts, state, dx, dy) {
  const { w, h } = state;
  const { scale, octaves, persistence, lacunarity, contrast, brightness, shift, twist, armlines, sampleStep } = opts;
  const ramp = state.ramp;
  const fbm = state.fbm;

  const step = Math.max(1, Math.round(sampleStep));
  const W = Math.max(1, Math.round(Math.ceil(w / step)));
  const H = Math.max(1, Math.round(Math.ceil(h / step)));
  const img = ctx.createImageData(W, H);
  const data = img.data;

  const cx = w * 0.5;
  const cy = h * 0.5;
  const LOG_E = Math.log(Math.E);
  const arms = Math.max(1, Math.round(armlines));

  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const px = x * step - cx;
      const py = y * step - cy;
      const r = Math.sqrt(px * px + py * py);
      const theta = Math.atan2(py, px);
      //  log r  -> имитируем «спираль»
      const logr = (r > 0.001) ? Math.log(r) : -10;
      const ux = (theta / Math.PI + 1) * scale;
      const uy = (logr + twist * theta) * scale;
      let n = fbm(ux + dx, uy + dy);
      // ритм по количеству «веток»
      if (arms > 1) n *= 1 + 0.3 * Math.cos(theta * arms);
      n = (n - 0) * contrast + brightness + (shift - 0.5);
      n = clamp01((n + 1) * 0.5);
      const color = ramp(n);
      const m = /rgb\((\d+),(\d+),(\d+)\)/.exec(color);
      const i = (y * W + x) * 4;
      data[i] = +m[1]; data[i + 1] = +m[2]; data[i + 2] = +m[3]; data[i + 3] = 255;
    }
  }

  const off = scratchCanvas(W, H);
  off.getContext("2d").putImageData(img, 0, 0);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(off, 0, 0, W, H, 0, 0, w, h);
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
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

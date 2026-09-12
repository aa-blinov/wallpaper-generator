// Domain Warp — FBM, чьи координаты искажены другим FBM.
// Классический приём Inigo Quilez / Tyler Hobbs.
// Один уровень warp'а даёт "течение внутри облаков", два — кьютюрные
// "инцепшен"-узоры с глубокой многослойной текстурой.

import { makeNoise2D, makeFbm } from "../noise.js";
import { makeColorRamp } from "../palettes.js";

export const domainwarp = {
  id: "domainwarp",
  name: "Domain Warp",
  category: "Шум",
  blurb: "Шум, искажённый другим шумом — течения и инцепшен-узоры.",
  defaults: {
    scale: 0.0018,
    octaves: 5,
    persistence: 0.5,
    lacunarity: 2.0,
    warp1: 3.5,
    warp2: 2.5,
    contrast: 1.3,
    shift: 0.5,
    brightness: 0.0,
    sampleStep: 3,
  },
  params: [
    { key: "scale", label: "Масштаб", min: 0.0008, max: 0.02, step: 0.0001, format: (v) => v.toFixed(4) },
    { key: "octaves", label: "Октавы", min: 1, max: 8, step: 1 },
    { key: "persistence", label: "Затухание", min: 0.2, max: 0.9, step: 0.01 },
    { key: "lacunarity", label: "Лакунарность", min: 1.2, max: 3.5, step: 0.05 },
    { key: "warp1", label: "Сила warp 1", min: 0, max: 8, step: 0.1 },
    { key: "warp2", label: "Сила warp 2", min: 0, max: 8, step: 0.1 },
    { key: "contrast", label: "Контраст", min: 0.4, max: 3, step: 0.05 },
    { key: "brightness", label: "Яркость", min: -0.5, max: 0.5, step: 0.02 },
    { key: "shift", label: "Сдвиг цвета", min: 0, max: 1, step: 0.005, format: (v) => v.toFixed(3) },
    { key: "sampleStep", label: "Шаг сэмпла", min: 1, max: 8, step: 1, format: (v) => `${v.toFixed(0)} px` },
  ],

  createState(opts, w, h) {
    const seed = hashSeed(opts.seed);
    const noise = makeNoise2D(seed);
    const fbm = makeFbm(noise, { octaves: opts.octaves, persistence: opts.persistence, lacunarity: opts.lacunarity });
    // Используем то же поле шума, но с разными смещениями — эквивалент
    // "независимого" второго источника.
    const fbm2 = makeFbm(noise, { octaves: opts.octaves, persistence: opts.persistence, lacunarity: opts.lacunarity });
    const ramp = makeColorRamp(opts.palette.colors);
    return { noise, fbm, fbm2, ramp, w, h };
  },

  paint(ctx, opts, state) {
    sampleToCanvas(ctx, opts, state, 0, 0);
  },

  animate(ctx, opts, state, t) {
    const dx = t * 0.0006;
    const dy = t * 0.0004;
    sampleToCanvas(ctx, opts, state, dx, dy);
  },
};

function sampleToCanvas(ctx, opts, state, dx, dy) {
  const { w, h } = state;
  const { scale, octaves, persistence, lacunarity, warp1, warp2, contrast, shift, brightness, sampleStep } = opts;
  const ramp = state.ramp;
  const fbm = state.fbm;
  const fbm2 = state.fbm2;

  const step = Math.max(1, Math.round(sampleStep));
  const W = Math.max(1, Math.round(Math.ceil(w / step)));
  const H = Math.max(1, Math.round(Math.ceil(h / step)));
  const img = ctx.createImageData(W, H);
  const data = img.data;

  // Оффсеты-«зерна» для четырёх вызовов fbm (как в эталоне Tyler Hobbs).
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      const px = x * scale * step;
      const py = y * scale * step;

      const qx = fbm(px + dx, py + dy);
      const qy = fbm2(px + 5.2 + dx, py + 1.3 + dy);

      let rx, ry;
      if (warp2 > 0) {
        rx = fbm(px + warp1 * qx + 1.7 + dx, py + warp1 * qy + 9.2 + dy);
        ry = fbm2(px + warp1 * qx + 8.3 + dx, py + warp1 * qy + 2.8 + dy);
      } else {
        rx = qx; ry = qy;
      }

      let n = fbm(px + warp2 * rx + dx, py + warp2 * ry + dy);
      n = (n - 0) * contrast + brightness + (shift - 0.5);
      n = clamp01((n + 1) * 0.5);

      const color = ramp(n);
      const m = PARSE_RGB.exec(color);
      const i = (y * W + x) * 4;
      data[i] = +m[1];
      data[i + 1] = +m[2];
      data[i + 2] = +m[3];
      data[i + 3] = 255;
    }
  }

  const off = scratchCanvas(W, H);
  off.getContext("2d").putImageData(img, 0, 0);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(off, 0, 0, W, H, 0, 0, w, h);
}

const PARSE_RGB = /rgb\((\d+),(\d+),(\d+)\)/;
function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }

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
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

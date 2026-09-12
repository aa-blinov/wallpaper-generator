// Topographic Contours — изолинии по FBM-полю.
// Как географическая карта высот, только плавная. Контуры превращаются
// в цветовую штриховку или просто тёмные линии — зависит от настроек.

import { makeNoise2D, makeFbm } from "../noise.js";
import { makeColorRamp } from "../palettes.js";

export const topography = {
  id: "topography",
  name: "Topographic",
  category: "Noise",
  blurb: "Contour lines over a noise field — a topographic relief map.",
  defaults: {
    scale: 0.0035,
    octaves: 5,
    persistence: 0.5,
    lacunarity: 2.0,
    lineDensity: 14,     // кол-во уровней (линий)
    lineThickness: 1.2,
    lineColor: 0.0,      // 0..1 — где в палитре брать цвет линии
    bgShade: 0.0,        // 0..1 — примесь темнее в "lowlands"
    showFill: 0.4,       // 0..1 — заливка между линиями
    fillLevels: 6,
    sampleStep: 2,
  },
  params: [
    { key: "scale", label: "Scale", min: 0.0008, max: 0.02, step: 0.0001, format: (v) => v.toFixed(4) },
    { key: "octaves", label: "Octaves", min: 1, max: 8, step: 1 },
    { key: "lineDensity", label: "Line count", min: 2, max: 60, step: 1 },
    { key: "lineThickness", label: "Thickness", min: 0.2, max: 4, step: 0.1 },
    { key: "lineColor", label: "Line color", min: 0, max: 1, step: 0.02 },
    { key: "bgShade", label: "Darken lowlands", min: 0, max: 1, step: 0.02 },
    { key: "showFill", label: "Fill between lines", min: 0, max: 1, step: 0.02 },
    { key: "fillLevels", label: "Fill levels", min: 2, max: 20, step: 1 },
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
    const dx = t * 0.0009;
    const dy = t * 0.0005;
    sampleToCanvas(ctx, opts, state, dx, dy);
  },
};

function sampleToCanvas(ctx, opts, state, dx, dy) {
  const { w, h } = state;
  const { scale, lineDensity, lineThickness, lineColor, bgShade, showFill, fillLevels, sampleStep, persistence, lacunarity, octaves } = opts;
  const ramp = state.ramp;
  const fbm = state.fbm;
  const step = Math.max(1, Math.round(sampleStep));
  const W = Math.max(1, Math.round(Math.ceil(w / step)));
  const H = Math.max(1, Math.round(Math.ceil(h / step)));

  const img = ctx.createImageData(W, H);
  const data = img.data;
  const levels = Math.max(2, Math.round(lineDensity));

  // Шаг 1: вычислить поле и нормализовать в [0..1].
  const field = new Float32Array(W * H);
  let mn = Infinity, mx = -Infinity;
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      let v = fbm(x * scale * step + dx, y * scale * step + dy);
      v = (v + 1) * 0.5;
      field[y * W + x] = v;
      if (v < mn) mn = v;
      if (v > mx) mx = v;
    }
  }
  const range = Math.max(0.001, mx - mn);
  const invRange = 1 / range;

  // Шаг 2: для каждого пикселя вычислить ближайший уровень и расстояние до него.
  const fillStep = Math.max(1, Math.round(fillLevels));
  for (let y = 0; y < H; y++) {
    for (let x = 0; x < W; x++) {
      let v = (field[y * W + x] - mn) * invRange;
      // Найти расстояние до ближайшего уровня.
      const lvl = v * levels;
      const nearest = Math.round(lvl);
      let dist = Math.abs(lvl - nearest) / levels; // 0..0.5
      // сглаживание линии
      const t = Math.exp(-(dist * dist) * 1000 / Math.max(0.1, lineThickness));
      let r, g, b;
      // фон — диапазон по полю
      const bg = ramp(v * 0.9 + 0.05);
      const mbg = /rgb\((\d+),(\d+),(\d+)\)/.exec(bg);
      if (!mbg) continue;
      r = +mbg[1]; g = +mbg[2]; b = +mbg[3];
      // Затемнение низин
      if (bgShade > 0) {
        const shade = (1 - v) * bgShade * 0.7;
        r = Math.round(r * (1 - shade));
        g = Math.round(g * (1 - shade));
        b = Math.round(b * (1 - shade));
      }
      // Заливка уровней
      if (showFill > 0) {
        const flvl = Math.floor(v * fillLevels);
        const ft = flvl / fillLevels;
        const fillColor = ramp(ft * 0.85 + 0.1);
        const mf = /rgb\((\d+),(\d+),(\d+)\)/.exec(fillColor);
        r = Math.round(r * (1 - showFill) + (+mf[1]) * showFill);
        g = Math.round(g * (1 - showFill) + (+mf[2]) * showFill);
        b = Math.round(b * (1 - showFill) + (+mf[3]) * showFill);
      }
      // Цвет линии
      const lineCol = ramp(lineColor);
      const ml = /rgb\((\d+),(\d+),(\d+)\)/.exec(lineCol);
      r = Math.round(r * (1 - t) + (+ml[1]) * t);
      g = Math.round(g * (1 - t) + (+ml[2]) * t);
      b = Math.round(b * (1 - t) + (+ml[3]) * t);
      const i = (y * W + x) * 4;
      data[i] = r; data[i + 1] = g; data[i + 2] = b; data[i + 3] = 255;
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

function hashSeed(seed) {
  const s = String(seed ?? "");
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

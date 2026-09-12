// Brick — кирпичная стена со смещением рядов и шумовыми вариациями цвета.

import { makeNoise2D } from "../noise.js";
import { makeRng } from "../rng.js";
import { makeColorRamp } from "../palettes.js";

export const brick = {
  id: "brick",
  name: "Brick Wall",
  category: "Геометрия",
  blurb: "Кирпичная кладка с шумовыми вариациями каждого кирпича.",
  defaults: {
    brickW: 70,
    brickH: 24,
    gap: 3,
    mortarTint: 0.4,
    colorVariation: 0.35,
    noiseScale: 0.02,
    paletteMode: "По палитре", // "По палитре" | "Случайный"
    bgTint: 0,
  },
  params: [
    { key: "brickW", label: "Ширина кирпича", min: 30, max: 200, step: 2 },
    { key: "brickH", label: "Высота", min: 12, max: 60, step: 1 },
    { key: "gap", label: "Раствор", min: 0, max: 10, step: 0.5 },
    { key: "mortarTint", label: "Цвет раствора", min: 0, max: 1, step: 0.02 },
    { key: "colorVariation", label: "Вариация цвета", min: 0, max: 1, step: 0.02 },
    { key: "noiseScale", label: "Масштаб шума", min: 0, max: 0.05, step: 0.001 },
  ],

  createState(opts, w, h) {
    const noise = makeNoise2D(hashSeed(opts.seed));
    const rng = makeRng(opts.seed + ":brick");
    const ramp = makeColorRamp(opts.palette.colors);
    return { noise, rng, ramp, w, h };
  },

  paint(ctx, opts, state) {
    const { w, h, noise, rng, ramp } = state;
    const palette = opts.palette;
    const bw = opts.brickW, bh = opts.brickH;
    const gap = opts.gap;
    const mortar = ramp(opts.mortarTint);

    ctx.fillStyle = mortar;
    ctx.fillRect(0, 0, w, h);

    const rows = Math.ceil(h / (bh + gap)) + 1;
    const cols = Math.ceil(w / bw) + 2;
    for (let r = -1; r < rows; r++) {
      const offset = (r & 1) ? bw / 2 : 0;
      for (let c = -1; c < cols; c++) {
        const x = c * bw + offset;
        const y = r * (bh + gap);
        // Цвет: t = шум + вариация по позиции
        let t = 0.5 + 0.5 * noise(x * opts.noiseScale, y * opts.noiseScale);
        t = (t + (rng() - 0.5) * opts.colorVariation) % 1;
        if (t < 0) t += 1;
        ctx.fillStyle = ramp(t);
        ctx.fillRect(x + gap / 2, y + gap / 2, bw - gap, bh);
      }
    }

    if (opts.bgTint > 0) {
      ctx.fillStyle = `rgba(0,0,0,${opts.bgTint})`;
      ctx.fillRect(0, 0, w, h);
    }
  },
};

function hashSeed(seed) {
  const s = String(seed ?? "");
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
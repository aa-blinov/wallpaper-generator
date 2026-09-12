// Scatter — точки по гладкой поверхности шума + соединительные линии от центра/друг к другу.

import { makeNoise2D } from "../noise.js";
import { makeRng } from "../rng.js";
import { makeColorRamp } from "../palettes.js";

export const scatter = {
  id: "scatter",
  name: "Scatter",
  category: "Точки",
  blurb: "Точки, разбросанные по шумовой плотности.",
  defaults: {
    count: 600,
    densityScale: 0.004,
    radius: 3.5,
    paletteMode: "По плотности",
    bgTint: 0,
  },
  params: [
    { key: "count", label: "Точек", min: 100, max: 3000, step: 50 },
    { key: "densityScale", label: "Масштаб плотности", min: 0.001, max: 0.02, step: 0.0005 },
    { key: "radius", label: "Радиус", min: 1, max: 12, step: 0.5 },
    { key: "paletteMode", label: "Цвет", enum: ["По плотности", "Один цвет"] },
  ],

  createState(opts, w, h) {
    const noise = makeNoise2D(hashSeed(opts.seed));
    const rng = makeRng(opts.seed + ":scatter");
    const ramp = makeColorRamp(opts.palette.colors);
    return { noise, rng, ramp, w, h };
  },

  paint(ctx, opts, state) {
    const { w, h, noise, rng, ramp } = state;
    const palette = opts.palette;
    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, w, h);

    const count = Math.round(opts.count);
    let placed = 0, attempts = 0;
    const placements = [];
    while (placed < count && attempts < count * 8) {
      attempts++;
      const x = rng() * w;
      const y = rng() * h;
      const d = noise(x * opts.densityScale, y * opts.densityScale) * 0.5 + 0.5;
      if (rng() > d * 1.2) continue;
      placements.push([x, y, d]);
      placed++;
    }
    for (const [x, y, d] of placements) {
      const r = opts.radius * (0.6 + d * 0.6);
      ctx.fillStyle = opts.paletteMode === "Один цвет"
        ? palette.colors[palette.colors.length - 1]
        : ramp(d);
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
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

// Rings3 — толстые полосатые кольца с шумовым смещением.

import { makeNoise2D } from "../noise.js";
import { makeColorRamp } from "../palettes.js";

export const rings3 = {
  id: "rings3",
  name: "Rings Stack",
  category: "Геометрия",
  blurb: "Стопка толстых колец разного размера.",
  defaults: {
    count: 14,
    noise: 0.0,
    minR: 30,
    bgTint: 0,
  },
  params: [
    { key: "count", label: "Колец", min: 4, max: 40, step: 1 },
    { key: "noise", label: "Шум радиуса", min: 0, max: 1, step: 0.02 },
    { key: "minR", label: "Мин. радиус", min: 10, max: 100, step: 1 },
  ],

  createState(opts, w, h) {
    const noise = makeNoise2D(hashSeed(opts.seed));
    const ramp = makeColorRamp(opts.palette.colors);
    return { noise, ramp, w, h };
  },

  paint(ctx, opts, state) {
    const { w, h, noise, ramp } = state;
    const palette = opts.palette;
    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, w, h);
    const cx = w / 2, cy = h / 2;
    const R = Math.min(w, h) * 0.48;
    const N = Math.round(opts.count);
    const cols = palette.colors;

    for (let i = 0; i < N; i++) {
      const t = i / Math.max(1, N - 1);
      const ringR = opts.minR + (1 - t) * (R - opts.minR);
      const off = noise(ringR * 0.05, 0) * R * opts.noise;
      ctx.lineWidth = (R - opts.minR) / N * 0.8;
      ctx.strokeStyle = ramp(t);
      ctx.beginPath();
      ctx.arc(cx + off, cy + off, ringR, 0, Math.PI * 2);
      ctx.stroke();
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

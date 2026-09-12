// Pulse — пульсирующие круги, исходящие из случайных точек.

import { makeRng } from "../rng.js";
import { makeColorRamp } from "../palettes.js";

export const pulse = {
  id: "pulse",
  name: "Pulse",
  category: "Dots",
  blurb: "Random centers with expanding ring waves.",
  defaults: {
    sources: 12,
    rings: 12,
    maxRadius: 240,
    ringWidth: 1.4,
    bgTint: 0,
  },
  params: [
    { key: "sources", label: "Centers", min: 2, max: 60, step: 1 },
    { key: "rings", label: "Rings", min: 2, max: 30, step: 1 },
    { key: "maxRadius", label: "Max radius", min: 30, max: 600, step: 10 },
    { key: "ringWidth", label: "Thickness", min: 0.2, max: 4, step: 0.1 },
  ],

  createState(opts, w, h) {
    const rng = makeRng(opts.seed + ":pulse");
    const ramp = makeColorRamp(opts.palette.colors);
    return { rng, ramp, w, h };
  },

  paint(ctx, opts, state) {
    const { w, h, rng, ramp } = state;
    const palette = opts.palette;
    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, w, h);
    ctx.lineWidth = opts.ringWidth;
    const N = Math.max(1, Math.round(opts.sources));
    const K = Math.max(1, Math.round(opts.rings));

    for (let i = 0; i < N; i++) {
      const cx = rng() * w;
      const cy = rng() * h;
      const baseR = 10 + rng() * (opts.maxRadius - 10);
      for (let k = 1; k <= K; k++) {
        const r = (k / K) * baseR;
        const t = 1 - (k / K);
        ctx.strokeStyle = ramp(t);
        ctx.globalAlpha = 0.4 + t * 0.4;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.globalAlpha = 1;
      // Сам центр
      ctx.fillStyle = ramp(1);
      ctx.beginPath();
      ctx.arc(cx, cy, 2.5, 0, Math.PI * 2);
      ctx.fill();
    }

    if (opts.bgTint > 0) {
      ctx.fillStyle = `rgba(0,0,0,${opts.bgTint})`;
      ctx.fillRect(0, 0, w, h);
    }
  },
};

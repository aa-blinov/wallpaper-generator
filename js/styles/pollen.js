// Pollen — пыльца: кольца из точек разного размера, расходящиеся от случайных центров.

import { makeRng } from "../rng.js";
import { makeColorRamp } from "../palettes.js";

export const pollen = {
  id: "pollen",
  name: "Pollen",
  category: "Точки",
  blurb: "Пыльца: кольца из точек вокруг центров.",
  defaults: {
    centers: 18,
    pointsPerRing: 12,
    rings: 6,
    paletteMode: "Случайный",
    bgTint: 0,
  },
  params: [
    { key: "centers", label: "Центров", min: 2, max: 60, step: 1 },
    { key: "rings", label: "Колец", min: 2, max: 24, step: 1 },
    { key: "pointsPerRing", label: "Точек в кольце", min: 4, max: 60, step: 1 },
  ],

  createState(opts, w, h) {
    const rng = makeRng(opts.seed + ":pol");
    const ramp = makeColorRamp(opts.palette.colors);
    return { rng, ramp, w, h };
  },

  paint(ctx, opts, state) {
    const { w, h, rng, ramp } = state;
    const palette = opts.palette;
    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, w, h);
    const C = Math.max(1, Math.round(opts.centers));
    const K = Math.max(1, Math.round(opts.rings));
    const P = Math.max(2, Math.round(opts.pointsPerRing));
    const cols = palette.colors;
    for (let c = 0; c < C; c++) {
      const cx = rng() * w;
      const cy = rng() * h;
      const baseR = 30 + rng() * Math.min(w, h) * 0.25;
      for (let r = 1; r <= K; r++) {
        const t = r / K;
        const radius = baseR * t;
        for (let p = 0; p < P; p++) {
          const ang = (p / P) * Math.PI * 2;
          const offR = radius * (1 + (rng() - 0.5) * 0.2);
          const x = cx + offR * Math.cos(ang);
          const y = cy + offR * Math.sin(ang);
          ctx.fillStyle = opts.paletteMode === "Случайный" ? cols[(p + c) % cols.length] : ramp(t);
          ctx.beginPath();
          ctx.arc(x, y, 1.5 + t * 3, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }
    if (opts.bgTint > 0) {
      ctx.fillStyle = `rgba(0,0,0,${opts.bgTint})`;
      ctx.fillRect(0, 0, w, h);
    }
  },
};

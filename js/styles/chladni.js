// Chladni Patterns — the nodal lines of a vibrating plate: f(x,y) =
// cos(n·π·x)·cos(m·π·y) − cos(m·π·x)·cos(n·π·y). In the real experiment,
// sand sprinkled on the plate collects where the surface doesn't move
// (|f|≈0) — we reproduce that by scattering dots near the zero set.

import { makeRng } from "../rng.js";

export const chladni = {
  id: "chladni",
  name: "Chladni Patterns",
  category: "Geometry",
  blurb: "Nodal lines of a vibrating plate — sand settling where the surface stays still.",
  defaults: {
    n: 6,
    m: 5,
    particles: 40000,
    dotSize: 1.4,
    bgTint: 0,
  },
  params: [
    { key: "n", label: "Mode n", min: 1, max: 14, step: 1 },
    { key: "m", label: "Mode m", min: 1, max: 14, step: 1 },
    { key: "particles", label: "Grains", min: 5000, max: 90000, step: 1000 },
    { key: "dotSize", label: "Grain size", min: 0.6, max: 3, step: 0.1 },
  ],

  createState(opts, w, h) {
    const rng = makeRng(opts.seed + ":chl");
    return { rng, w, h };
  },

  paint(ctx, opts, state) {
    const { w, h, rng } = state;
    const palette = opts.palette;
    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, w, h);

    const n = Math.round(opts.n), m = Math.round(opts.m);
    const side = Math.min(w, h) * 0.92;
    const cx = w / 2, cy = h / 2;
    const target = Math.round(opts.particles);
    const threshold = 0.045;
    const maxAttempts = target * 30;
    const fg = palette.colors[palette.colors.length - 1];
    ctx.fillStyle = fg;

    let placed = 0;
    for (let a = 0; a < maxAttempts && placed < target; a++) {
      const x = rng() * 2 - 1;
      const y = rng() * 2 - 1;
      const f = Math.cos(n * Math.PI * x) * Math.cos(m * Math.PI * y)
              - Math.cos(m * Math.PI * x) * Math.cos(n * Math.PI * y);
      if (Math.abs(f) > threshold) continue;
      const px = cx + x * side / 2;
      const py = cy + y * side / 2;
      ctx.globalAlpha = 0.55 + 0.45 * (1 - Math.abs(f) / threshold);
      ctx.beginPath();
      ctx.arc(px, py, opts.dotSize, 0, Math.PI * 2);
      ctx.fill();
      placed++;
    }
    ctx.globalAlpha = 1;

    if (opts.bgTint > 0) {
      ctx.fillStyle = `rgba(0,0,0,${opts.bgTint})`;
      ctx.fillRect(0, 0, w, h);
    }
  },
};

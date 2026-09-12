// Frost — кристаллические «звёздочки» инея. Каждая ветвь растёт по 6 направлениям,
// с побочными ответвлениями на половине длины.

import { makeRng } from "../rng.js";

export const frost = {
  id: "frost",
  name: "Frost",
  category: "Algorithms",
  blurb: "Frost: branching crystals with 6-fold symmetry.",
  defaults: {
    crystals: 90,
    size: 80,
    branches: 4,
    branchProb: 0.55,
    bgTint: 0,
  },
  params: [
    { key: "crystals", label: "Crystal count", min: 5, max: 400, step: 5 },
    { key: "size", label: "Max length", min: 20, max: 200, step: 5 },
    { key: "branches", label: "Levels", min: 1, max: 5, step: 1 },
    { key: "branchProb", label: "Branch chance", min: 0, max: 1, step: 0.02 },
  ],

  createState(opts, w, h) {
    const rng = makeRng(opts.seed + ":frost");
    return { rng, w, h };
  },

  paint(ctx, opts, state) {
    const { w, h, rng } = state;
    const palette = opts.palette;
    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, w, h);
    const fg = palette.colors[palette.colors.length - 1];
    ctx.strokeStyle = fg;
    ctx.lineCap = "round";
    ctx.lineWidth = 1.0;

    const N = Math.max(1, Math.round(opts.crystals));
    const maxLen = opts.size;
    const levels = Math.max(1, Math.round(opts.branches));

    function grow(x, y, dir, len, level) {
      const steps = 4 + (level === 0 ? 1 : 0);
      for (let s = 0; s < steps; s++) {
        const t1 = s / steps, t2 = (s + 1) / steps;
        const r1 = len * t1, r2 = len * t2;
        const x1 = x + r1 * Math.cos(dir);
        const y1 = y + r1 * Math.sin(dir);
        const x2 = x + r2 * Math.cos(dir);
        const y2 = y + r2 * Math.sin(dir);
        ctx.beginPath();
        ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.stroke();
        if (level > 0 && s === Math.floor(steps / 2) && rng() < opts.branchProb) {
          const ang = (rng() - 0.5) * 1.2 + (rng() < 0.5 ? -0.4 : 0.4);
          grow(x2, y2, dir + ang, len * 0.55 * t2, level - 1);
        }
      }
    }

    for (let i = 0; i < N; i++) {
      const cx = rng() * w;
      const cy = rng() * h;
      const baseLen = (0.2 + rng() * 0.8) * maxLen;
      const baseDir = rng() * Math.PI * 2;
      // 6-лучевая симметрия
      for (let k = 0; k < 6; k++) {
        const dir = baseDir + (k / 6) * Math.PI * 2;
        grow(cx, cy, dir, baseLen, levels);
      }
    }

    if (opts.bgTint > 0) {
      ctx.fillStyle = `rgba(0,0,0,${opts.bgTint})`;
      ctx.fillRect(0, 0, w, h);
    }
  },
};

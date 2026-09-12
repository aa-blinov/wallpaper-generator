// Lightning — разряды молний: случайные ветвящиеся деревья на сетке.

import { makeRng } from "../rng.js";
import { makeColorRamp } from "../palettes.js";

export const lightning = {
  id: "lightning",
  name: "Lightning",
  category: "Органические",
  blurb: "Молнии: ветвящиеся разряды от верхней кромки.",
  defaults: {
    bolts: 7,
    branchProb: 0.5,
    steps: 32,
    strokeWidth: 1.4,
    glow: 0.6,
    bgTint: 0,
  },
  params: [
    { key: "bolts", label: "Разрядов", min: 1, max: 20, step: 1 },
    { key: "branchProb", label: "Шанс ветки", min: 0, max: 1, step: 0.02 },
    { key: "steps", label: "Шагов", min: 8, max: 80, step: 1 },
    { key: "strokeWidth", label: "Толщина", min: 0.4, max: 5, step: 0.1 },
    { key: "glow", label: "Свечение", min: 0, max: 1, step: 0.02 },
  ],

  createState(opts, w, h) {
    const rng = makeRng(opts.seed + ":bolt");
    return { rng, w, h };
  },

  paint(ctx, opts, state) {
    const { w, h, rng } = state;
    const palette = opts.palette;
    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, w, h);

    const steps = Math.round(opts.steps);
    const fg = palette.colors[palette.colors.length - 1];

    // Glow layer
    if (opts.glow > 0) {
      ctx.shadowColor = fg;
      ctx.shadowBlur = 12 * opts.glow;
    }

    function drawBolt(x1, y1, stepsLeft, dir, len, depth) {
      if (stepsLeft <= 0) return;
      ctx.strokeStyle = fg;
      ctx.lineWidth = opts.strokeWidth * Math.max(0.3, 1 - depth * 0.3);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      let cx = x1, cy = y1;
      const dy = Math.sin(dir);
      const dx = Math.cos(dir);
      for (let s = 0; s < stepsLeft; s++) {
        const nx = cx + dx * len + (rng() - 0.5) * len * 1.2;
        const ny = cy + dy * len + (rng() - 0.5) * len * 1.2;
        ctx.lineTo(nx, ny);
        cx = nx; cy = ny;
        // Возможна боковая ветка
        if (depth < 3 && rng() < opts.branchProb) {
          drawBolt(cx, cy, Math.floor(stepsLeft * 0.6), dir + (rng() - 0.5) * 1.2, len * 0.7, depth + 1);
        }
      }
      ctx.stroke();
    }

    const N = Math.max(1, Math.round(opts.bolts));
    for (let i = 0; i < N; i++) {
      const x = (i + 0.5) / N * w;
      drawBolt(x + (rng() - 0.5) * w * 0.05, 0, steps, Math.PI / 2 + (rng() - 0.5) * 0.2, h / steps, 0);
    }

    ctx.shadowBlur = 0;

    if (opts.bgTint > 0) {
      ctx.fillStyle = `rgba(0,0,0,${opts.bgTint})`;
      ctx.fillRect(0, 0, w, h);
    }
  },
};

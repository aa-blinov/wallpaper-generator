// Cantor Dust — двумерное обобщение канторовского множества с квадрантным делением.

import { makeRng } from "../rng.js";

export const cantor = {
  id: "cantor",
  name: "Cantor Dust",
  category: "Algorithms",
  blurb: "Cantor dust: quadrant subdivision with a keep probability.",
  defaults: {
    depth: 6,
    prob: 0.22,
    bgTint: 0,
  },
  params: [
    { key: "depth", label: "Depth", min: 1, max: 6, step: 1 },
    { key: "prob", label: "Probability", min: 0.1, max: 1, step: 0.02 },
  ],

  createState(opts, w, h) {
    const rng = makeRng(opts.seed + ":cantor");
    return { rng, w, h };
  },

  paint(ctx, opts, state) {
    const { w, h, rng } = state;
    const palette = opts.palette;
    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, w, h);

    const depth = Math.round(opts.depth);
    // Low prob means most cells recurse instead of filling, so the 9-way
    // branching factor compounds almost unchecked — at depth 6 that's up to
    // 9^6 ≈ 531k node visits per tile, most ending in a real fillRect call.
    // That took 19s on a real render before this cap existed. Hard
    // per-tile budget bounds it regardless of prob/depth/size, and resets
    // per tile so a budget drained early doesn't leave later tiles blank.
    let budget = 0;
    function rec(x, y, s, d) {
      if (d >= depth || s < 1 || budget-- <= 0) return;
      const step = s / 3;
      for (let j = 0; j < 3; j++) {
        for (let i = 0; i < 3; i++) {
          if (i === 1 && j === 1) {
            // Центральный квадрат
            if (rng() < opts.prob) {
              ctx.fillStyle = palette.colors[palette.colors.length - 1];
              ctx.fillRect(x + step, y + step, step, step);
            } else {
              rec(x + step, y + step, step, d + 1);
            }
          } else if (rng() < opts.prob) {
            ctx.fillStyle = palette.colors[palette.colors.length - 1];
            ctx.fillRect(x + i * step, y + j * step, step, step);
          } else {
            rec(x + i * step, y + j * step, step, d + 1);
          }
        }
      }
    }
    // Одна фигура покрывала только квадрат min(w,h) в углу, оставляя
    // остальной холст пустым на широких/высоких разрешениях — тайлим её.
    const tileSize = Math.min(w, h) / 2;
    for (let ty = 0; ty < h; ty += tileSize) {
      for (let tx = 0; tx < w; tx += tileSize) {
        budget = 45000;
        rec(tx, ty, tileSize, 0);
      }
    }

    if (opts.bgTint > 0) {
      ctx.fillStyle = `rgba(0,0,0,${opts.bgTint})`;
      ctx.fillRect(0, 0, w, h);
    }
  },
};

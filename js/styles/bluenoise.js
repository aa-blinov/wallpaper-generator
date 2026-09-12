// Blue-Noise Stippling — Bridson's Poisson-disk sampling: every point keeps
// a minimum distance from its neighbors, giving an even, non-clumping
// "blue noise" dot distribution (unlike density-driven stippling, which
// follows a noise field on purpose).

import { makeRng } from "../rng.js";

export const bluenoise = {
  id: "bluenoise",
  name: "Blue-Noise Stippling",
  category: "Dots",
  blurb: "Poisson-disk sampled dots — evenly spaced, no clumps, no gaps.",
  defaults: {
    radius: 12,
    dotSize: 2.2,
    sizeVariation: 0.4,
    colorMode: "Palette",
    bgTint: 0,
  },
  params: [
    { key: "radius", label: "Min spacing (px)", min: 5, max: 40, step: 1 },
    { key: "dotSize", label: "Dot size", min: 0.8, max: 6, step: 0.1 },
    { key: "sizeVariation", label: "Size variation", min: 0, max: 1, step: 0.05 },
    { key: "colorMode", label: "Color", enum: ["Palette", "Single color"] },
  ],

  createState(opts, w, h) {
    const rng = makeRng(opts.seed + ":bn");
    const r = opts.radius;
    const cellSize = r / Math.SQRT2;
    const gridW = Math.ceil(w / cellSize);
    const gridH = Math.ceil(h / cellSize);
    const grid = new Int32Array(gridW * gridH).fill(-1);
    const points = [];
    const active = [];

    function gridIndex(x, y) {
      const gx = Math.floor(x / cellSize), gy = Math.floor(y / cellSize);
      return { gx, gy, idx: gy * gridW + gx };
    }
    function fits(x, y) {
      if (x < 0 || y < 0 || x >= w || y >= h) return false;
      const { gx, gy } = gridIndex(x, y);
      for (let j = Math.max(0, gy - 2); j <= Math.min(gridH - 1, gy + 2); j++) {
        for (let i = Math.max(0, gx - 2); i <= Math.min(gridW - 1, gx + 2); i++) {
          const pi = grid[j * gridW + i];
          if (pi < 0) continue;
          const dx = points[pi][0] - x, dy = points[pi][1] - y;
          if (dx * dx + dy * dy < r * r) return false;
        }
      }
      return true;
    }

    const x0 = rng() * w, y0 = rng() * h;
    points.push([x0, y0]);
    active.push(0);
    grid[gridIndex(x0, y0).idx] = 0;

    const k = 24;
    // Cap attempts so pathologically small radii on huge canvases can't hang.
    let guard = 0;
    const guardMax = 400000;
    while (active.length && guard++ < guardMax) {
      const ai = (rng() * active.length) | 0;
      const p = points[active[ai]];
      let found = false;
      for (let t = 0; t < k; t++) {
        const ang = rng() * Math.PI * 2;
        const rad = r * (1 + rng());
        const nx = p[0] + Math.cos(ang) * rad;
        const ny = p[1] + Math.sin(ang) * rad;
        if (fits(nx, ny)) {
          const idx = points.length;
          points.push([nx, ny]);
          active.push(idx);
          grid[gridIndex(nx, ny).idx] = idx;
          found = true;
          break;
        }
      }
      if (!found) active.splice(ai, 1);
    }

    return { points, rng, w, h };
  },

  paint(ctx, opts, state) {
    const { points, rng, w, h } = state;
    const palette = opts.palette;
    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, w, h);

    const colors = palette.colors;
    const fg = colors[colors.length - 1];
    const baseSize = opts.dotSize;
    const variation = opts.sizeVariation;

    for (let i = 0; i < points.length; i++) {
      const [x, y] = points[i];
      ctx.fillStyle = opts.colorMode === "Single color"
        ? fg
        : colors[i % colors.length];
      const jitter = 1 + (((i * 2654435761) % 1000) / 1000 - 0.5) * variation;
      ctx.beginPath();
      ctx.arc(x, y, Math.max(0.3, baseSize * jitter), 0, Math.PI * 2);
      ctx.fill();
    }

    if (opts.bgTint > 0) {
      ctx.fillStyle = `rgba(0,0,0,${opts.bgTint})`;
      ctx.fillRect(0, 0, w, h);
    }
  },
};

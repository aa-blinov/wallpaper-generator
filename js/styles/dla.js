// Diffusion-Limited Aggregation — random walkers released from the edges
// stick the moment they touch the growing cluster. Produces lichen/coral/
// lightning-like branching structures.

import { makeRng } from "../rng.js";

export const dla = {
  id: "dla",
  name: "Diffusion-Limited Aggregation",
  category: "Algorithms",
  blurb: "DLA: random walkers freeze onto a growing cluster — coral, lichen, frost.",
  defaults: {
    particles: 7000,
    gridSize: 300,
    stickiness: 1.0,
    colorMode: "By age",
    bgTint: 0,
  },
  params: [
    { key: "particles", label: "Particles", min: 500, max: 8000, step: 100 },
    { key: "gridSize", label: "Grid resolution", min: 100, max: 420, step: 10 },
    { key: "stickiness", label: "Stickiness", min: 0.3, max: 1, step: 0.05 },
    { key: "colorMode", label: "Color", enum: ["By age", "Single color"] },
  ],

  createState(opts, w, h) {
    const rng = makeRng(opts.seed + ":dla");
    const N = Math.round(opts.gridSize);
    const grid = new Int32Array(N * N).fill(-1);
    const cx = N >> 1, cy = N >> 1;
    grid[cy * N + cx] = 0;
    let order = 1;
    const R0 = 2;
    let radius = R0;
    const maxR = N / 2 - 2;
    const particles = Math.round(opts.particles);
    const stick = opts.stickiness;

    for (let p = 0; p < particles && radius < maxR; p++) {
      // Launch from a circle just outside the current cluster radius.
      const launchR = Math.min(maxR, radius + 6);
      let ang = rng() * Math.PI * 2;
      let x = Math.round(cx + launchR * Math.cos(ang));
      let y = Math.round(cy + launchR * Math.sin(ang));
      let stuck = false;
      const killR = launchR + 24;
      for (let step = 0; step < 4000; step++) {
        // Random walk.
        const dir = rng() * 4 | 0;
        if (dir === 0) x++; else if (dir === 1) x--; else if (dir === 2) y++; else y--;
        if (x < 1 || y < 1 || x >= N - 1 || y >= N - 1) break;
        const dcx = x - cx, dcy = y - cy;
        if (dcx * dcx + dcy * dcy > killR * killR) break; // wandered too far, discard
        // Check 4-neighborhood for a stuck neighbor.
        if (grid[(y - 1) * N + x] >= 0 || grid[(y + 1) * N + x] >= 0 ||
            grid[y * N + x - 1] >= 0 || grid[y * N + x + 1] >= 0) {
          if (rng() < stick) {
            grid[y * N + x] = order++;
            const dr = Math.hypot(dcx, dcy);
            if (dr > radius) radius = dr;
            stuck = true;
          }
          break;
        }
      }
    }
    return { grid, N, order, w, h };
  },

  paint(ctx, opts, state) {
    const { grid, N, order, w, h } = state;
    const palette = opts.palette;
    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, w, h);

    const colors = palette.colors;
    const fg = colors[colors.length - 1];
    const cell = (Math.min(w, h) * 0.95) / N;
    const ox = (w - N * cell) / 2, oy = (h - N * cell) / 2;

    for (let y = 0; y < N; y++) {
      for (let x = 0; x < N; x++) {
        const v = grid[y * N + x];
        if (v < 0) continue;
        ctx.fillStyle = opts.colorMode === "Single color"
          ? fg
          : colors[Math.floor((v / order) * (colors.length - 1))];
        ctx.fillRect(ox + x * cell, oy + y * cell, Math.ceil(cell), Math.ceil(cell));
      }
    }

    if (opts.bgTint > 0) {
      ctx.fillStyle = `rgba(0,0,0,${opts.bgTint})`;
      ctx.fillRect(0, 0, w, h);
    }
  },
};

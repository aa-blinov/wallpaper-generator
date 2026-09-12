// Conway's Game of Life — classic cellular automaton (rules B3/S23), run
// forward from a random seed for a number of generations and painted as-is.

import { makeRng } from "../rng.js";

export const gameoflife = {
  id: "gameoflife",
  name: "Game of Life",
  category: "Algorithms",
  blurb: "Conway's Game of Life: a random soup evolved forward, frozen mid-run.",
  defaults: {
    cellSize: 18,
    density: 0.25,
    generations: 40,
    colorMode: "By age",
    bgTint: 0,
  },
  params: [
    { key: "cellSize", label: "Cell size (px)", min: 3, max: 24, step: 1 },
    { key: "density", label: "Initial density", min: 0.1, max: 0.6, step: 0.02 },
    { key: "generations", label: "Generations", min: 0, max: 300, step: 5 },
    { key: "colorMode", label: "Color", enum: ["By age", "Single color"] },
  ],

  createState(opts, w, h) {
    const rng = makeRng(opts.seed + ":gol");
    const cell = Math.max(1, Math.round(opts.cellSize));
    const cols = Math.ceil(w / cell);
    const rows = Math.ceil(h / cell);
    let grid = new Uint8Array(cols * rows);
    for (let i = 0; i < grid.length; i++) grid[i] = rng() < opts.density ? 1 : 0;
    const age = new Uint16Array(cols * rows);

    const steps = Math.round(opts.generations);
    for (let s = 0; s < steps; s++) {
      const next = new Uint8Array(cols * rows);
      for (let y = 0; y < rows; y++) {
        for (let x = 0; x < cols; x++) {
          let n = 0;
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              if (dx === 0 && dy === 0) continue;
              const nx = (x + dx + cols) % cols;
              const ny = (y + dy + rows) % rows;
              n += grid[ny * cols + nx];
            }
          }
          const i = y * cols + x;
          const alive = grid[i] === 1;
          next[i] = alive ? (n === 2 || n === 3 ? 1 : 0) : (n === 3 ? 1 : 0);
          if (next[i]) age[i]++; else age[i] = 0;
        }
      }
      grid = next;
    }
    return { grid, age, cols, rows, cell, w, h };
  },

  paint(ctx, opts, state) {
    const { grid, age, cols, rows, cell, w, h } = state;
    const palette = opts.palette;
    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, w, h);
    const colors = palette.colors;
    const fg = colors[colors.length - 1];
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const i = y * cols + x;
        if (!grid[i]) continue;
        ctx.fillStyle = opts.colorMode === "Single color"
          ? fg
          : colors[Math.min(colors.length - 1, age[i] % colors.length)];
        ctx.fillRect(x * cell, y * cell, cell - 1, cell - 1);
      }
    }
    if (opts.bgTint > 0) {
      ctx.fillStyle = `rgba(0,0,0,${opts.bgTint})`;
      ctx.fillRect(0, 0, w, h);
    }
  },

  animate(ctx, opts, state, t) {
    // Advance one generation roughly every 120ms of animation time.
    const tick = Math.floor(t / 120);
    if (state._lastTick === tick) { this.paint(ctx, opts, state); return; }
    state._lastTick = tick;
    const { grid, age, cols, rows } = state;
    const next = new Uint8Array(cols * rows);
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        let n = 0;
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            if (dx === 0 && dy === 0) continue;
            const nx = (x + dx + cols) % cols;
            const ny = (y + dy + rows) % rows;
            n += grid[ny * cols + nx];
          }
        }
        const i = y * cols + x;
        const alive = grid[i] === 1;
        next[i] = alive ? (n === 2 || n === 3 ? 1 : 0) : (n === 3 ? 1 : 0);
        if (next[i]) age[i]++; else age[i] = 0;
      }
    }
    state.grid = next;
    this.paint(ctx, opts, state);
  },
};

// Maze — рекурсивный backtracker на сетке.
// Каждая ячейка имеет 4 стенки; алгоритм пробивает случайные стены.

import { makeRng } from "../rng.js";
import { makeColorRamp } from "../palettes.js";

export const maze = {
  id: "maze",
  name: "Maze",
  category: "Algorithms",
  blurb: "Recursive backtracker: a fresh maze every frame.",
  defaults: {
    cellSize: 28,
    lineWidth: 2,
    paletteMode: "Monochrome",   // "Monochrome" | "By depth" | "Random"
    branchColor: 1,
    bgTint: 0.0,
  },
  params: [
    { key: "cellSize", label: "Cell size", min: 8, max: 80, step: 2 },
    { key: "lineWidth", label: "Wall thickness", min: 0.5, max: 6, step: 0.1 },
    { key: "paletteMode", label: "Coloring", enum: ["Monochrome", "By depth", "Random"] },
    { key: "branchColor", label: "Wall color (from palette)", min: 0, max: 1, step: 0.02 },
    { key: "bgTint", label: "Darken background", min: 0, max: 1, step: 0.02 },
  ],

  createState(opts, w, h) {
    const rng = makeRng(opts.seed + ":maze");
    const ramp = makeColorRamp(opts.palette.colors);
    return { rng, ramp, w, h };
  },

  paint(ctx, opts, state) {
    const { w, h, rng, ramp } = state;
    const palette = opts.palette;
    const cellSize = Math.max(4, opts.cellSize);
    const cols = Math.ceil(w / cellSize) + 1;
    const rows = Math.ceil(h / cellSize) + 1;

    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, w, h);

    // Каждая ячейка: walls[top, right, bottom, left] = true.
    const cells = new Uint8Array(cols * rows * 4);
    for (let i = 0; i < cells.length; i += 4) {
      cells[i] = 1; cells[i + 1] = 1; cells[i + 2] = 1; cells[i + 3] = 1;
    }
    // Recursive backtracker (iterative через стек).
    const visited = new Uint8Array(cols * rows);
    const stack = [[0, 0]];
    visited[0] = 1;
    const dirs = [[0, 1, 0, 3], [1, 0, 1, 2], [0, -1, 2, 1], [-1, 0, 3, 0]]; // dx, dy, wallSelf, wallOther
    while (stack.length) {
      const [cx, cy] = stack[stack.length - 1];
      const shuffled = [...dirs];
      for (let i = shuffled.length - 1; i > 0; i--) {
        const j = (rng() * (i + 1)) | 0;
        [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
      }
      let moved = false;
      for (const [dx, dy, ws, wo] of shuffled) {
        const nx = cx + dx, ny = cy + dy;
        if (nx < 0 || ny < 0 || nx >= cols || ny >= rows) continue;
        if (visited[ny * cols + nx]) continue;
        visited[ny * cols + nx] = 1;
        const idx = (cy * cols + cx) * 4;
        const nidx = (ny * cols + nx) * 4;
        cells[idx + ws] = 0; cells[nidx + wo] = 0;
        stack.push([nx, ny]);
        moved = true;
        break;
      }
      if (!moved) stack.pop();
    }

    // Рисуем стены.
    ctx.strokeStyle = ramp(opts.branchColor);
    ctx.lineWidth = opts.lineWidth;
    ctx.lineCap = "square";
    ctx.beginPath();
    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const x0 = x * cellSize, y0 = y * cellSize;
        const idx = (y * cols + x) * 4;
        if (cells[idx] === 1) { ctx.moveTo(x0, y0); ctx.lineTo(x0 + cellSize, y0); }                 // top
        if (cells[idx + 1] === 1) { ctx.moveTo(x0 + cellSize, y0); ctx.lineTo(x0 + cellSize, y0 + cellSize); } // right
        if (y === rows - 1 && cells[idx + 2] === 1) { ctx.moveTo(x0, y0 + cellSize); ctx.lineTo(x0 + cellSize, y0 + cellSize); } // bottom
        if (x === cols - 1 && cells[idx + 3] === 1) { ctx.moveTo(x0, y0); ctx.lineTo(x0, y0 + cellSize); } // left
      }
    }
    ctx.stroke();

    if (opts.bgTint > 0) {
      ctx.fillStyle = `rgba(0,0,0,${opts.bgTint})`;
      ctx.fillRect(0, 0, w, h);
    }
  },
};
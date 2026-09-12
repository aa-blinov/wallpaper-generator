// Langton's Ant — a single ant on a binary grid: turn right on a white cell
// and flip it black, turn left on a black cell and flip it white, step
// forward. Simple rule, chaotic middle phase, an emergent diagonal
// "highway" after tens of thousands of steps.

export const langtonsant = {
  id: "langtonsant",
  name: "Langton's Ant",
  category: "Algorithms",
  blurb: "A single ant flipping cells by a two-rule law — chaos, then a highway.",
  defaults: {
    cellSize: 6,
    steps: 45000,
    colorMode: "By age",
    bgTint: 0,
  },
  params: [
    { key: "cellSize", label: "Cell size (px)", min: 2, max: 14, step: 1 },
    { key: "steps", label: "Steps", min: 500, max: 150000, step: 500 },
    { key: "colorMode", label: "Color", enum: ["By age", "Single color"] },
  ],

  createState(opts, w, h) {
    const cell = Math.max(1, Math.round(opts.cellSize));
    const cols = Math.ceil(w / cell);
    const rows = Math.ceil(h / cell);
    const grid = new Uint8Array(cols * rows);
    const age = new Float32Array(cols * rows);
    let x = cols >> 1, y = rows >> 1;
    let dir = 0; // 0=up,1=right,2=down,3=left
    const dx = [0, 1, 0, -1], dy = [-1, 0, 1, 0];
    const steps = Math.round(opts.steps);
    for (let s = 0; s < steps; s++) {
      const i = y * cols + x;
      if (grid[i] === 0) { dir = (dir + 1) % 4; grid[i] = 1; }
      else { dir = (dir + 3) % 4; grid[i] = 0; }
      age[i] = s / steps;
      x = (x + dx[dir] + cols) % cols;
      y = (y + dy[dir] + rows) % rows;
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
          : colors[Math.floor(age[i] * (colors.length - 1))];
        ctx.fillRect(x * cell, y * cell, cell, cell);
      }
    }
    if (opts.bgTint > 0) {
      ctx.fillStyle = `rgba(0,0,0,${opts.bgTint})`;
      ctx.fillRect(0, 0, w, h);
    }
  },
};

// Waves Grid — синусоидальные волны по 2D-сетке.

export const waves_grid = {
  id: "waves_grid",
  name: "Waves Grid",
  category: "Organic",
  blurb: "Sine waves along two axes.",
  defaults: {
    rows: 50,
    cols: 50,
    freqX: 0.18,
    freqY: 0.12,
    strokeWidth: 0.5,
    bgTint: 0,
  },
  params: [
    { key: "rows", label: "Rows", min: 8, max: 200, step: 1 },
    { key: "cols", label: "Columns", min: 8, max: 200, step: 1 },
    { key: "freqX", label: "Frequency X", min: 0.01, max: 1, step: 0.01 },
    { key: "freqY", label: "Frequency Y", min: 0.01, max: 1, step: 0.01 },
  ],

  createState(opts, w, h) {
    return { w, h };
  },

  paint(ctx, opts, state) {
    const { w, h } = state;
    const palette = opts.palette;
    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, w, h);
    const rows = Math.max(2, Math.round(opts.rows));
    const cols = Math.max(2, Math.round(opts.cols));
    const dy = h / rows, dx = w / cols;
    const amp = Math.min(w, h) / 6;
    ctx.lineWidth = opts.strokeWidth;
    ctx.strokeStyle = palette.colors[palette.colors.length - 1];

    ctx.beginPath();
    for (let i = 0; i < rows; i++) {
      const py = (i + 0.5) * dy;
      const phase = i * 0.5;
      let first = true;
      for (let j = 0; j <= cols; j++) {
        const px = j * dx;
        const y = py + Math.sin(px * opts.freqX + phase) * amp * (0.5 + (i / rows) * 0.5);
        if (first) { ctx.moveTo(px, y); first = false; }
        else ctx.lineTo(px, y);
      }
    }
    ctx.stroke();

    ctx.strokeStyle = palette.colors[Math.floor(palette.colors.length / 2)];
    ctx.beginPath();
    for (let j = 0; j < cols; j++) {
      const px = (j + 0.5) * dx;
      const phase = j * 0.4;
      let first = true;
      for (let i = 0; i <= rows; i++) {
        const py = i * dy;
        const x = px + Math.sin(py * opts.freqY + phase) * amp * (0.5 + (j / cols) * 0.5);
        if (first) { ctx.moveTo(x, py); first = false; }
        else ctx.lineTo(x, py);
      }
    }
    ctx.stroke();

    if (opts.bgTint > 0) {
      ctx.fillStyle = `rgba(0,0,0,${opts.bgTint})`;
      ctx.fillRect(0, 0, w, h);
    }
  },
};

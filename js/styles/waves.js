// Waves — сетка пересекающихся синусоид разных частот и фаз.

export const waves = {
  id: "waves",
  name: "Waves",
  category: "Organic",
  blurb: "A grid of intersecting sine waves at different frequencies.",
  defaults: {
    rows: 60,
    cols: 60,
    freq1: 1.2,
    freq2: 2.7,
    phaseStep: 0.07,
    amp: 0.4,
    bgTint: 0,
  },
  params: [
    { key: "rows", label: "Rows", min: 8, max: 200, step: 1 },
    { key: "cols", label: "Columns", min: 8, max: 200, step: 1 },
    { key: "freq1", label: "Frequency 1", min: 0.1, max: 6.0, step: 0.05 },
    { key: "freq2", label: "Frequency 2", min: 0.1, max: 6.0, step: 0.05 },
    { key: "phaseStep", label: "Phase shift", min: 0, max: 0.4, step: 0.005 },
    { key: "amp", label: "Amplitude", min: 0.05, max: 1.0, step: 0.02 },
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
    const dy = h / rows;
    const dx = w / cols;
    const ampPx = opts.amp * Math.min(w, h) * 0.5;

    ctx.strokeStyle = palette.colors[Math.max(0, Math.floor(palette.colors.length / 2))];
    ctx.lineWidth = Math.max(0.4, Math.min(dx, dy) * 0.35);
    ctx.lineCap = "round";

    // Горизонтальные: y = baseY + amp * sin(freq1 * x + i * phase)
    ctx.beginPath();
    for (let i = 0; i < rows; i++) {
      const baseY = (i + 0.5) * dy;
      const phi = i * opts.phaseStep * 30;
      for (let j = 0; j <= cols; j++) {
        const x = j * dx;
        const y = baseY + ampPx * Math.sin(opts.freq1 * (x / dx) * Math.PI + phi) * 0.4;
        if (j === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
    }
    ctx.stroke();

    const col = palette.colors[palette.colors.length - 1];
    ctx.strokeStyle = col;
    ctx.beginPath();
    for (let i = 0; i < cols; i++) {
      const baseX = (i + 0.5) * dx;
      const phi = i * opts.phaseStep * 30;
      for (let j = 0; j <= rows; j++) {
        const y = j * dy;
        const x = baseX + ampPx * Math.sin(opts.freq2 * (y / dy) * Math.PI + phi) * 0.4;
        if (j === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
    }
    ctx.stroke();

    if (opts.bgTint > 0) {
      ctx.fillStyle = `rgba(0,0,0,${opts.bgTint})`;
      ctx.fillRect(0, 0, w, h);
    }
  },
};

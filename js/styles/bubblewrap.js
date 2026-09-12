// Bubblewrap — пузырчатая плёнка: сетка кружков с градиентом и бликами.

export const bubblewrap = {
  id: "bubblewrap",
  name: "Bubblewrap",
  category: "Текстуры",
  blurb: "Пузырчатая плёнка: гекс-сетка пузырей с градиентами.",
  defaults: {
    cell: 40,
    highlight: 0.7,
    bgTint: 0,
  },
  params: [
    { key: "cell", label: "Размер ячейки", min: 12, max: 90, step: 2 },
    { key: "highlight", label: "Блик", min: 0, max: 1.5, step: 0.02 },
  ],

  createState(opts, w, h) {
    return { w, h };
  },

  paint(ctx, opts, state) {
    const { w, h } = state;
    const palette = opts.palette;
    const cols = palette.colors;
    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, w, h);

    const cell = opts.cell;
    const r = cell * 0.45;
    const dx = cell, dy = cell * Math.sin(Math.PI / 3) * 2;
    const rows = Math.ceil(h / dy) + 1;
    const colsN = Math.ceil(w / dx) + 2;

    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < colsN; i++) {
        const cx = i * dx + (j & 1) * dx / 2;
        const cy = j * dy;
        const c = cols[j % cols.length];
        const rad = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, r * 0.05, cx, cy, r);
        rad.addColorStop(0, "#ffffff");
        rad.addColorStop(Math.min(0.999, Math.max(0.001, opts.highlight)), c);
        rad.addColorStop(1, palette.colors[0]);
        ctx.fillStyle = rad;
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.fill();
        // Контур
        ctx.strokeStyle = palette.colors[0];
        ctx.lineWidth = 0.5;
        ctx.stroke();
        // Блик
        if (opts.highlight > 0) {
          ctx.fillStyle = `rgba(255,255,255,${Math.min(1, opts.highlight * 0.7)})`;
          ctx.beginPath();
          ctx.ellipse(cx - r * 0.35, cy - r * 0.45, r * 0.25, r * 0.13, -Math.PI / 5, 0, Math.PI * 2);
          ctx.fill();
        }
      }
    }

    if (opts.bgTint > 0) {
      ctx.fillStyle = `rgba(0,0,0,${opts.bgTint})`;
      ctx.fillRect(0, 0, w, h);
    }
  },
};

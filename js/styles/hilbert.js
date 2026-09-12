// Hilbert Curve — рекурсивная space-filling кривая. Линия заполняет квадрат.

export const hilbert = {
  id: "hilbert",
  name: "Hilbert Curve",
  category: "Algorithms",
  blurb: "Recursive Hilbert space-filling curve.",
  defaults: {
    order: 5,
    strokeWidth: 1.4,
    colorMode: "By index", // "By index" | "Single color"
    bgTint: 0,
  },
  params: [
    { key: "order", label: "Recursion order", min: 1, max: 7, step: 1 },
    { key: "strokeWidth", label: "Thickness", min: 0.4, max: 4, step: 0.1 },
    { key: "colorMode", label: "Color", enum: ["By index", "Single color"] },
    { key: "bgTint", label: "Darken", min: 0, max: 1, step: 0.02 },
  ],

  createState(opts, w, h) {
    return { w, h };
  },

  paint(ctx, opts, state) {
    const { w, h } = state;
    const palette = opts.palette;
    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, w, h);

    const order = Math.round(opts.order);
    const side = Math.min(w, h) * 0.9;
    const cell = side / ((1 << order) - 1);
    const ox = (w - side) / 2 + cell / 2;
    const oy = (h - side) / 2 + cell / 2;
    const total = (1 << (2 * order));
    const colors = palette.colors;
    const fg = colors[colors.length - 1];

    ctx.lineWidth = opts.strokeWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    function hilbert(d, x, y, ax, ay, bx, by) {
      // Рекурсивный алгоритм из Wikipedia.
      if (d === 0) {
        const px = ox + x * cell;
        const py = oy + y * cell;
        const tx = ox + (x + ax + bx) * cell;
        const ty = oy + (y + ay + by) * cell;
        if (opts.colorMode === "By index") {
          // Цвет по позиции
        const idx = (Math.round(x) * (1 << order) + Math.round(y)) % total;
        ctx.strokeStyle = colors[(idx / total * (colors.length - 1)) | 0];
        }
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(tx, ty);
        ctx.stroke();
        return;
      }
      hilbert(d - 1, x,           y,           ay, ax,  by, bx);
      hilbert(d - 1, x + ax,      y + ay,      ax, ay,  bx, by);
      hilbert(d - 1, x + ax + bx, y + ay + by, ax, ay,  bx, by);
      hilbert(d - 1, x + bx,      y + by,      ay, ax,  bx, by);
    }
    if (opts.colorMode === "Single color") ctx.strokeStyle = fg;
    hilbert(order, 0, 0, 1, 0, 0, 1);

    if (opts.bgTint > 0) {
      ctx.fillStyle = `rgba(0,0,0,${opts.bgTint})`;
      ctx.fillRect(0, 0, w, h);
    }
  },
};
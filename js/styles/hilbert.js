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
    const ox = (w - side) / 2;
    const oy = (h - side) / 2;
    const colors = palette.colors;
    const fg = colors[colors.length - 1];

    ctx.lineWidth = opts.strokeWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    // Классическая рекурсия (Wikipedia): шаговые вектора (xi,xj)/(yi,yj)
    // делятся пополам на каждом уровне. Старая версия держала их
    // константными — кривая никогда не разворачивалась за пределы
    // крошечной области у начала координат.
    const pts = [];
    function hilbert(x0, y0, xi, xj, yi, yj, n) {
      if (n <= 0) {
        pts.push([x0 + (xi + yi) / 2, y0 + (xj + yj) / 2]);
        return;
      }
      hilbert(x0, y0, yi / 2, yj / 2, xi / 2, xj / 2, n - 1);
      hilbert(x0 + xi / 2, y0 + xj / 2, xi / 2, xj / 2, yi / 2, yj / 2, n - 1);
      hilbert(x0 + xi / 2 + yi / 2, y0 + xj / 2 + yj / 2, xi / 2, xj / 2, yi / 2, yj / 2, n - 1);
      hilbert(x0 + xi / 2 + yi, y0 + xj / 2 + yj, -yi / 2, -yj / 2, -xi / 2, -xj / 2, n - 1);
    }
    hilbert(0, 0, side, 0, 0, side, order);

    if (opts.colorMode === "Single color") {
      ctx.strokeStyle = fg;
      ctx.beginPath();
      ctx.moveTo(ox + pts[0][0], oy + pts[0][1]);
      for (let i = 1; i < pts.length; i++) ctx.lineTo(ox + pts[i][0], oy + pts[i][1]);
      ctx.stroke();
    } else {
      for (let i = 1; i < pts.length; i++) {
        ctx.strokeStyle = colors[Math.floor((i / pts.length) * (colors.length - 1))];
        ctx.beginPath();
        ctx.moveTo(ox + pts[i - 1][0], oy + pts[i - 1][1]);
        ctx.lineTo(ox + pts[i][0], oy + pts[i][1]);
        ctx.stroke();
      }
    }

    if (opts.bgTint > 0) {
      ctx.fillStyle = `rgba(0,0,0,${opts.bgTint})`;
      ctx.fillRect(0, 0, w, h);
    }
  },
};
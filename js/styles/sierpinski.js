// Sierpinski Triangle — рекурсивное вычитание треугольников.

export const sierpinski = {
  id: "sierpinski",
  name: "Sierpinski Triangle",
  category: "Алгоритмы",
  blurb: "Рекурсивный фрактал Серпинского (треугольник).",
  defaults: {
    iterations: 7,
    paletteMode: "По глубине", // "По глубине" | "Один цвет"
    strokeWidth: 0,
    bgTint: 0,
  },
  params: [
    { key: "iterations", label: "Итерации", min: 1, max: 8, step: 1 },
    { key: "paletteMode", label: "Цвет", enum: ["По глубине", "Один цвет"] },
    { key: "strokeWidth", label: "Контур", min: 0, max: 4, step: 0.2 },
  ],

  createState(opts, w, h) {
    return { w, h };
  },

  paint(ctx, opts, state) {
    const { w, h } = state;
    const palette = opts.palette;
    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, w, h);

    const n = Math.round(opts.iterations);
    const colors = palette.colors;
    const fg = colors[colors.length - 1];
    const side = Math.min(w, h) * 0.92;
    const ox = (w - side) / 2;
    const oy = h * 0.05;
    // Вершины: левый низ, правый низ, верх середина
    const Ax = ox,            Ay = oy + side;
    const Bx = ox + side,     By = oy + side;
    const Cx = ox + side / 2, Cy = oy;

    ctx.lineWidth = opts.strokeWidth;
    if (opts.strokeWidth > 0) ctx.strokeStyle = fg;

    function tri(x1, y1, x2, y2, x3, y3, depth) {
      if (depth === 0) {
        // Заполненный треугольник
        const col = opts.paletteMode === "По глубине"
          ? colors[(n - depth) % colors.length]
          : fg;
        ctx.fillStyle = col;
        ctx.beginPath();
        ctx.moveTo(x1, y1); ctx.lineTo(x2, y2); ctx.lineTo(x3, y3);
        ctx.closePath();
        ctx.fill();
        if (opts.strokeWidth > 0) ctx.stroke();
      } else {
        const mxAB = (x1 + x2) / 2, myAB = (y1 + y2) / 2;
        const mxBC = (x2 + x3) / 2, myBC = (y2 + y3) / 2;
        const mxCA = (x3 + x1) / 2, myCA = (y3 + y1) / 2;
        tri(x1, y1, mxAB, myAB, mxCA, myCA, depth - 1);
        tri(mxAB, myAB, x2, y2, mxBC, myBC, depth - 1);
        tri(mxCA, myCA, mxBC, myBC, x3, y3, depth - 1);
      }
    }
    tri(Ax, Ay, Bx, By, Cx, Cy, n);

    if (opts.bgTint > 0) {
      ctx.fillStyle = `rgba(0,0,0,${opts.bgTint})`;
      ctx.fillRect(0, 0, w, h);
    }
  },
};
// Strings — струны: несколько протянутых верёвок между опорами с гравитацией.

import { makeRng } from "../rng.js";

export const strings = {
  id: "strings",
  name: "Strings",
  category: "Геометрия",
  blurb: "Струны: нити между опорами, провисающие под гравитацией.",
  defaults: {
    columns: 5,
    rows: 4,
    sag: 0.4,
    strokeWidth: 1.0,
    bgTint: 0,
  },
  params: [
    { key: "columns", label: "Колонок опор", min: 2, max: 12, step: 1 },
    { key: "rows", label: "Рядов опор", min: 2, max: 8, step: 1 },
    { key: "sag", label: "Провисание", min: 0, max: 1.5, step: 0.02 },
    { key: "strokeWidth", label: "Толщина", min: 0.3, max: 3, step: 0.05 },
  ],

  createState(opts, w, h) {
    const rng = makeRng(opts.seed + ":str");
    return { rng, w, h };
  },

  paint(ctx, opts, state) {
    const { w, h, rng } = state;
    const palette = opts.palette;
    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, w, h);
    const cols = Math.round(opts.columns);
    const rows = Math.round(opts.rows);
    const sag = opts.sag;
    const cols_p = palette.colors;
    ctx.lineWidth = opts.strokeWidth;
    ctx.lineCap = "round";

    // Позиции опор
    const poles = [];
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        poles.push([(i + 0.5) * w / cols + (rng() - 0.5) * w / cols * 0.3, (j + 0.5) * h / rows]);
      }
    }
    // Все пары опор
    for (let i = 0; i < poles.length; i++) {
      for (let j = i + 1; j < poles.length; j++) {
        const a = poles[i], b = poles[j];
        const dx = a[0] - b[0], dy = a[1] - b[1];
        const d = Math.hypot(dx, dy);
        if (d > w / 2) continue;
        const mx = (a[0] + b[0]) / 2;
        const my = (a[1] + b[1]) / 2 + sag * d * 0.3;
        ctx.strokeStyle = cols_p[(i + j) % cols_p.length];
        ctx.globalAlpha = 0.3 + Math.random() * 0.6;
        ctx.beginPath();
        ctx.moveTo(a[0], a[1]);
        ctx.quadraticCurveTo(mx, my, b[0], b[1]);
        ctx.stroke();
      }
    }
    // Опоры
    ctx.globalAlpha = 1;
    ctx.fillStyle = palette.colors[0];
    for (const [x, y] of poles) {
      ctx.beginPath();
      ctx.arc(x, y, 3, 0, Math.PI * 2);
      ctx.fill();
    }

    if (opts.bgTint > 0) {
      ctx.fillStyle = `rgba(0,0,0,${opts.bgTint})`;
      ctx.fillRect(0, 0, w, h);
    }
  },
};

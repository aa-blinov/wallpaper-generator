// Bubbles — пузыри с перекрытиями и реалистичными бликами.

import { makeRng } from "../rng.js";
import { makeColorRamp } from "../palettes.js";

export const bubbles = {
  id: "bubbles",
  name: "Bubbles",
  category: "Органические",
  blurb: "Пузыри с перекрытиями и реалистичными бликами.",
  defaults: {
    count: 24,
    sizeMin: 30,
    sizeMax: 130,
    highlight: 0.7,
    bgTint: 0,
  },
  params: [
    { key: "count", label: "Пузырей", min: 4, max: 80, step: 1 },
    { key: "sizeMin", label: "Мин. радиус", min: 8, max: 80, step: 1 },
    { key: "sizeMax", label: "Макс. радиус", min: 30, max: 200, step: 2 },
    { key: "highlight", label: "Блик", min: 0, max: 1.5, step: 0.02 },
  ],

  createState(opts, w, h) {
    const rng = makeRng(opts.seed + ":bub");
    const N = Math.round(opts.count);
    const bs = new Array(N);
    for (let i = 0; i < N; i++) {
      const r = opts.sizeMin + rng() * (opts.sizeMax - opts.sizeMin);
      bs[i] = [rng() * w, rng() * h, r];
    }
    // Сортируем по радиусу (рисуем сначала мелкие)
    bs.sort((a, b) => a[2] - b[2]);
    return { bs, w, h };
  },

  paint(ctx, opts, state) {
    const { w, h, bs } = state;
    const palette = opts.palette;
    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, w, h);
    const cols = palette.colors;
    for (let i = 0; i < bs.length; i++) {
      const [x, y, r] = bs[i];
      // Полупрозрачный контур
      ctx.fillStyle = `${cols[i % cols.length]}55`;
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
      // Контур
      ctx.strokeStyle = cols[i % cols.length];
      ctx.lineWidth = 1.5;
      ctx.stroke();
      // Блик
      if (opts.highlight > 0) {
        ctx.fillStyle = `rgba(255,255,255,${Math.min(1, opts.highlight * 0.6)})`;
        ctx.beginPath();
        ctx.ellipse(x - r * 0.4, y - r * 0.45, r * 0.35, r * 0.18, -Math.PI / 5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    if (opts.bgTint > 0) {
      ctx.fillStyle = `rgba(0,0,0,${opts.bgTint})`;
      ctx.fillRect(0, 0, w, h);
    }
  },
};

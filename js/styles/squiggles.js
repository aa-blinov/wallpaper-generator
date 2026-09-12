// Squiggles — случайные закорючки из кубических Безье.

import { makeRng } from "../rng.js";
import { makeColorRamp } from "../palettes.js";

export const squiggles = {
  id: "squiggles",
  name: "Squiggles",
  category: "Геометрия",
  blurb: "Случайные закорючки из кривых Безье.",
  defaults: {
    count: 60,
    strokeWidth: 1.2,
    length: 80,
    paletteMode: "Палитра",
    bgTint: 0,
  },
  params: [
    { key: "count", label: "Закорючек", min: 5, max: 200, step: 5 },
    { key: "length", label: "Средняя длина", min: 20, max: 200, step: 5 },
    { key: "strokeWidth", label: "Толщина", min: 0.3, max: 4, step: 0.1 },
    { key: "paletteMode", label: "Цвет", enum: ["Палитра", "Один цвет"] },
  ],

  createState(opts, w, h) {
    const rng = makeRng(opts.seed + ":squ");
    const ramp = makeColorRamp(opts.palette.colors);
    return { rng, ramp, w, h };
  },

  paint(ctx, opts, state) {
    const { w, h, rng, ramp } = state;
    const palette = opts.palette;
    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, w, h);
    const N = Math.round(opts.count);
    ctx.lineWidth = opts.strokeWidth;
    ctx.lineCap = "round";

    for (let i = 0; i < N; i++) {
      const x1 = rng() * w;
      const y1 = rng() * h;
      const L = opts.length * (0.5 + rng() * 1.0);
      const ang = rng() * Math.PI * 2;
      const x2 = x1 + Math.cos(ang) * L;
      const y2 = y1 + Math.sin(ang) * L;
      const cx1 = x1 + Math.cos(ang + Math.PI / 2) * (rng() - 0.5) * L * 0.9;
      const cy1 = y1 + Math.sin(ang + Math.PI / 2) * (rng() - 0.5) * L * 0.9;
      const cx2 = x2 + Math.cos(ang + Math.PI / 2) * (rng() - 0.5) * L * 0.9;
      const cy2 = y2 + Math.sin(ang + Math.PI / 2) * (rng() - 0.5) * L * 0.9;
      ctx.strokeStyle = opts.paletteMode === "Один цвет"
        ? palette.colors[palette.colors.length - 1]
        : ramp(rng());
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.bezierCurveTo(cx1, cy1, cx2, cy2, x2, y2);
      ctx.stroke();
    }

    if (opts.bgTint > 0) {
      ctx.fillStyle = `rgba(0,0,0,${opts.bgTint})`;
      ctx.fillRect(0, 0, w, h);
    }
  },
};

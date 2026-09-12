// Stars — случайные звёзды с лучами разной длины и цвета.

import { makeRng } from "../rng.js";
import { makeColorRamp } from "../palettes.js";

export const stars = {
  id: "stars",
  name: "Sparkling Stars",
  category: "Точки",
  blurb: "Звёзды с лучами: случайный размер, яркость и ориентация.",
  defaults: {
    count: 80,
    rayChance: 0.5,
    paletteMode: "Случайный",
    bgTint: 0,
  },
  params: [
    { key: "count", label: "Звёзд", min: 10, max: 400, step: 5 },
    { key: "rayChance", label: "Шанс лучей", min: 0, max: 1, step: 0.02 },
    { key: "paletteMode", label: "Цвет", enum: ["Случайный", "Белый", "Палитра"] },
  ],

  createState(opts, w, h) {
    const rng = makeRng(opts.seed + ":stars");
    const ramp = makeColorRamp(opts.palette.colors);
    return { rng, ramp, w, h };
  },

  paint(ctx, opts, state) {
    const { w, h, rng, ramp } = state;
    const palette = opts.palette;
    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, w, h);
    const N = Math.round(opts.count);
    const fg = opts.paletteMode === "Белый" ? "#ffffff" : (opts.paletteMode === "Палитра" ? palette.colors[palette.colors.length - 1] : null);

    for (let i = 0; i < N; i++) {
      const cx = rng() * w;
      const cy = rng() * h;
      const size = 1 + rng() * 4;
      const color = fg || ramp(rng());
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(cx, cy, size, 0, Math.PI * 2);
      ctx.fill();
      if (rng() < opts.rayChance) {
        const len = size * (3 + rng() * 6);
        const angle = rng() * Math.PI;
        ctx.strokeStyle = color;
        ctx.lineWidth = Math.max(0.4, size / 3);
        ctx.globalAlpha = 0.7 + rng() * 0.3;
        ctx.beginPath();
        ctx.moveTo(cx - Math.cos(angle) * len, cy - Math.sin(angle) * len);
        ctx.lineTo(cx + Math.cos(angle) * len, cy + Math.sin(angle) * len);
        ctx.moveTo(cx - Math.cos(angle + Math.PI / 2) * len, cy - Math.sin(angle + Math.PI / 2) * len);
        ctx.lineTo(cx + Math.cos(angle + Math.PI / 2) * len, cy + Math.sin(angle + Math.PI / 2) * len);
        ctx.stroke();
        ctx.globalAlpha = 1;
      }
    }

    if (opts.bgTint > 0) {
      ctx.fillStyle = `rgba(0,0,0,${opts.bgTint})`;
      ctx.fillRect(0, 0, w, h);
    }
  },
};

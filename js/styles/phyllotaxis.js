// Phyllotaxis — распределение точек по золотому углу (137.5°).
// Это спираль Фибоначчи — то самое распределение в подсолнухах и шишках.
// Получается очень медитативный спиральный узор.

import { makeRng } from "../rng.js";
import { makeColorRamp } from "../palettes.js";

const PHI = (1 + Math.sqrt(5)) / 2;     // ≈ 1.618
const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5));  // ≈ 2.39996 рад ≈ 137.5°

export const phyllotaxis = {
  id: "phyllotaxis",
  name: "Phyllotaxis",
  category: "Dots",
  blurb: "A Fibonacci spiral by the golden angle — sunflower / pine cone.",
  defaults: {
    count: 4500,
    scale: 0.7,
    radiusFactor: 0.9,    // 0 = одинаковые, 1 = спиральный рост
    paletteCycle: 0.0,    // 0..1 — насколько часто чередовать цвета
    dotMin: 0.6,
    dotMax: 2.4,
    spiralTwist: 0.0,
    bgTint: 0.0,
  },
  params: [
    { key: "count", label: "Point count", min: 200, max: 12000, step: 50 },
    { key: "scale", label: "Overall scale", min: 0.1, max: 1.2, step: 0.02 },
    { key: "radiusFactor", label: "Radial growth", min: 0.0, max: 1.2, step: 0.02 },
    { key: "paletteCycle", label: "Palette cycle", min: 0.0, max: 1.0, step: 0.02 },
    { key: "spiralTwist", label: "Extra twist", min: -0.5, max: 0.5, step: 0.01 },
    { key: "dotMin", label: "Min radius", min: 0.2, max: 5, step: 0.1 },
    { key: "dotMax", label: "Max radius", min: 0.2, max: 8, step: 0.1 },
    { key: "bgTint", label: "Blend with background", min: 0, max: 1, step: 0.02 },
  ],

  createState(opts, w, h) {
    const rng = makeRng(opts.seed + ":phy");
    const ramp = makeColorRamp(opts.palette.colors);
    return { rng, ramp, w, h };
  },

  paint(ctx, opts, state) {
    const { w, h } = state;
    const palette = opts.palette;
    const { count, scale, radiusFactor, paletteCycle, spiralTwist, dotMin, dotMax } = opts;

    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, w, h);

    const cx = w / 2;
    const cy = h / 2;
    const maxR = Math.min(w, h) * 0.45 * scale;

    for (let i = 0; i < count; i++) {
      const ang = i * GOLDEN_ANGLE + spiralTwist * i;
      const r = Math.sqrt(i) * (maxR / Math.sqrt(count)) * radiusFactor + maxR * 0.01;
      const x = cx + Math.cos(ang) * r;
      const y = cy + Math.sin(ang) * r;
      // Радиус точки — колеблется по палитре + размер чуть зависит от позиции.
      const radius = dotMin + (dotMax - dotMin) * (0.4 + 0.6 * Math.sin(i * 0.13));
      // Цвет: чередуем по палитре через `paletteCycle`.
      // paletteCycle=0 — все точки одного цвета, paletteCycle=1 — полный цикл по палитре.
      const paletteT = (i * paletteCycle / count) % 1;
      const color = state.ramp(paletteT);
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(x, y, radius, 0, Math.PI * 2);
      ctx.fill();
    }

    if (opts.bgTint > 0) {
      ctx.fillStyle = `rgba(0,0,0,${opts.bgTint})`;
      ctx.fillRect(0, 0, w, h);
    }
  },

  animate(ctx, opts, state, t) {
    opts.spiralTwist = Math.sin(t * 0.0002) * 0.3;
    this.paint(ctx, opts, state);
  },
};

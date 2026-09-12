// Barcode — набор случайных полос переменной ширины на белом/чёрном фоне.
// Разные размеры полос + мусор под штрихкодом.

import { makeRng } from "../rng.js";
import { makeColorRamp } from "../palettes.js";

export const barcode = {
  id: "barcode",
  name: "Barcode",
  category: "Геометрия",
  blurb: "Штрих-код: случайные полосы разной ширины.",
  defaults: {
    minBar: 2,
    maxBar: 14,
    minGap: 2,
    maxGap: 10,
    jitter: 0.0,
    paletteMode: "Бинарный",   // "Бинарный" | "Палитра"
    bgTint: 0.0,
  },
  params: [
    { key: "minBar", label: "Мин. ширина полосы", min: 1, max: 30, step: 1 },
    { key: "maxBar", label: "Макс. ширина полосы", min: 2, max: 40, step: 1 },
    { key: "minGap", label: "Мин. зазор", min: 1, max: 30, step: 1 },
    { key: "maxGap", label: "Макс. зазор", min: 1, max: 30, step: 1 },
    { key: "jitter", label: "Дрожание краёв", min: 0, max: 1, step: 0.02 },
    { key: "paletteMode", label: "Цвет", enum: ["Бинарный", "Палитра"] },
    { key: "bgTint", label: "Затемнить фон", min: 0, max: 1, step: 0.02 },
  ],

  createState(opts, w, h) {
    const rng = makeRng(opts.seed + ":bar");
    const ramp = makeColorRamp(opts.palette.colors);
    return { rng, ramp, w, h };
  },

  paint(ctx, opts, state) {
    const { w, h, rng } = state;
    const palette = opts.palette;
    const minBar = opts.minBar, maxBar = opts.maxBar;
    const minGap = opts.minGap, maxGap = opts.maxGap;
    const jitter = opts.jitter;

    ctx.fillStyle = palette.colors[0];
    ctx.fillRect(0, 0, w, h);

    const fg = palette.colors[palette.colors.length - 1];
    ctx.fillStyle = fg;
    const top = h * 0.1, bottom = h * 0.9;
    let x = w * 0.05;
    while (x < w * 0.95) {
      const barW = minBar + rng() * (maxBar - minBar);
      const yJit = (rng() - 0.5) * jitter * (bottom - top);
      const topJ = top + Math.max(0, yJit);
      const botJ = bottom + Math.min(0, yJit);
      ctx.fillRect(x, topJ, barW, botJ - topJ);
      x += barW + minGap + rng() * (maxGap - minGap);
    }

    if (opts.bgTint > 0) {
      ctx.fillStyle = `rgba(0,0,0,${opts.bgTint})`;
      ctx.fillRect(0, 0, w, h);
    }
  },
};
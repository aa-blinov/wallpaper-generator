// Inkblot — симметричные кляксы по горизонтали: левая сторона зеркальна правой.
// Случайные эллипсы с разной прозрачностью.

import { makeRng } from "../rng.js";

export const inkblot = {
  id: "inkblot",
  name: "Inkblot",
  category: "Органические",
  blurb: "Симметричные чернильные кляксы (тест Роршаха).",
  defaults: {
    blobs: 14,
    paletteMode: "Чёрно-белый",
    bgTint: 0,
  },
  params: [
    { key: "blobs", label: "Кол-во пар", min: 2, max: 60, step: 1 },
    { key: "paletteMode", label: "Цвет", enum: ["Чёрно-белый", "Палитра"] },
    { key: "bgTint", label: "Затемнить", min: 0, max: 1, step: 0.02 },
  ],

  createState(opts, w, h) {
    const rng = makeRng(opts.seed + ":ink");
    return { rng, w, h };
  },

  paint(ctx, opts, state) {
    const { w, h, rng } = state;
    const palette = opts.palette;
    ctx.fillStyle = opts.paletteMode === "Чёрно-белый" ? "#ffffff" : palette.bg;
    ctx.fillRect(0, 0, w, h);

    const cx = w / 2, cy = h / 2;
    const N = Math.max(1, Math.round(opts.blobs));
    const fg = opts.paletteMode === "Чёрно-белый" ? "rgba(40,40,80,1)" : palette.colors[palette.colors.length - 1];
    const accent = opts.paletteMode === "Чёрно-белый" ? "rgba(150,60,60,0.9)" : palette.colors[Math.floor(palette.colors.length / 2)];

    for (let i = 0; i < N; i++) {
      const offX = (rng() - 0.5) * w * 0.85;
      const offY = (rng() - 0.5) * h * 0.85;
      const rx = (0.05 + rng() * 0.18) * w;
      const ry = (0.05 + rng() * 0.18) * h;
      const rot = rng() * Math.PI;
      const color = rng() < 0.18 ? accent : fg;
      const alpha = 0.35 + rng() * 0.5;

      ctx.save();
      ctx.translate(cx + offX, cy + offY);
      ctx.rotate(rot);
      ctx.scale(1, ry / rx);
      ctx.fillStyle = withAlpha(color, alpha);
      ctx.beginPath();
      ctx.arc(0, 0, rx, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Зеркальная копия по горизонтали
      ctx.save();
      ctx.translate(cx - offX, cy + offY);
      ctx.rotate(-rot);
      ctx.scale(1, ry / rx);
      ctx.fillStyle = withAlpha(color, alpha);
      ctx.beginPath();
      ctx.arc(0, 0, rx, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // Центральная ось
    ctx.fillStyle = withAlpha(fg, 0.15);
    ctx.fillRect(cx - 0.5, 0, 1, h);

    if (opts.bgTint > 0) {
      ctx.fillStyle = `rgba(0,0,0,${opts.bgTint})`;
      ctx.fillRect(0, 0, w, h);
    }
  },
};

function withAlpha(rgb, a) {
  // hex → rgba()
  if (rgb.startsWith("#")) {
    const r = parseInt(rgb.slice(1, 3), 16);
    const g = parseInt(rgb.slice(3, 5), 16);
    const b = parseInt(rgb.slice(5, 7), 16);
    return `rgba(${r},${g},${b},${a})`;
  }
  // rgb(r,g,b) → rgba(r,g,b,a)
  if (rgb.startsWith("rgb(") && !rgb.startsWith("rgba")) {
    return rgb.replace(/^rgb\(/, "rgba(").replace(/\)$/, `,${a})`);
  }
  // rgba(r,g,b,?) → заменяем альфу
  if (rgb.startsWith("rgba")) {
    return rgb.replace(/,\s*[\d.]+\s*\)$/, `,${a})`);
  }
  return rgb;
}

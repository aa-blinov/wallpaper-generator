// Fractal Tree — рекурсивное ветвление. Каждая ветвь делится на 2 с углом и масштабом.

import { makeColorRamp } from "../palettes.js";
import { makeRng } from "../rng.js";

export const tree = {
  id: "tree",
  name: "Fractal Tree",
  category: "Алгоритмы",
  blurb: "Рекурсивное фрактальное дерево с настраиваемым ветвлением.",
  defaults: {
    depth: 9,
    branchAngle: 25,
    lengthScale: 0.72,
    startLength: 0.22,
    spread: 0.42,
    wind: 0,
    paletteMode: "По глубине",
    bgTint: 0,
  },
  params: [
    { key: "depth", label: "Глубина", min: 3, max: 12, step: 1 },
    { key: "branchAngle", label: "Угол", min: 5, max: 60, step: 1, format: (v) => `${v.toFixed(0)}°` },
    { key: "lengthScale", label: "Коэф. длины", min: 0.4, max: 0.9, step: 0.01 },
    { key: "spread", label: "Разброс", min: 0, max: 1, step: 0.02 },
    { key: "wind", label: "Ветер", min: -1, max: 1, step: 0.02 },
    { key: "startLength", label: "Старт. длина", min: 0.05, max: 0.5, step: 0.01 },
    { key: "paletteMode", label: "Цвет", enum: ["По глубине", "Сезон", "Один цвет"] },
  ],

  createState(opts, w, h) {
    const ramp = makeColorRamp(opts.palette.colors);
    const rng = makeRng(opts.seed + ":tree");
    return { ramp, rng, w, h };
  },

  paint(ctx, opts, state) {
    const { w, h, ramp, rng } = state;
    const palette = opts.palette;
    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, w, h);
    const ang = opts.branchAngle * Math.PI / 180;
    const maxDepth = Math.round(opts.depth);

    ctx.lineCap = "round";

    function grow(x1, y1, len, dir, depth) {
      if (depth > maxDepth || len < 1) return;
      const x2 = x1 + len * Math.cos(dir);
      const y2 = y1 + len * Math.sin(dir);
      let color;
      if (opts.paletteMode === "Один цвет") color = palette.colors[palette.colors.length - 1];
      else if (opts.paletteMode === "Сезон") {
        const t = (depth - 1) / Math.max(1, maxDepth - 1);
        color = ramp(0.2 + t * 0.7);
      } else {
        color = ramp(1 - depth / Math.max(1, maxDepth));
      }
      ctx.strokeStyle = color;
      ctx.lineWidth = Math.max(0.3, (maxDepth - depth) * 1.2);
      ctx.beginPath();
      ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
      ctx.stroke();

      const wob = opts.wind * 0.03 * depth;
      const da = ang * (1 - opts.spread + rng() * opts.spread * 2);
      grow(x2, y2, len * opts.lengthScale, dir - da + wob, depth + 1);
      grow(x2, y2, len * opts.lengthScale, dir + da + wob, depth + 1);
    }

    grow(w / 2, h, h * opts.startLength, -Math.PI / 2, 1);

    if (opts.bgTint > 0) {
      ctx.fillStyle = `rgba(0,0,0,${opts.bgTint})`;
      ctx.fillRect(0, 0, w, h);
    }
  },
};

// Glyphs — сетка случайных символов/глифов разного размера и ориентации.

import { makeRng } from "../rng.js";

const GLYPHS = [
  // Геометрические фигуры
  "●", "○", "■", "□", "▲", "△", "▼", "▽", "◆", "◇",
  "✚", "✜", "✦", "✧", "✱", "✲", "✸", "❄", "❅", "❉",
  "✺", "✹", "✪", "✫", "✬", "✭", "✮", "✯",
  // Арабские/индийские
  "۞", "۩", "ﷲ",
  // Кружки/стрелки
  "◐", "◑", "◒", "◓", "◔", "◕", "◖", "◗", "◢", "◣",
  // Прочие
  "✕", "✖", "✗", "✘", "❀", "❁", "❂", "❍", "❎", "❏",
];

export const glyphs = {
  id: "glyphs",
  name: "Glyphs",
  category: "Точки",
  blurb: "Сетка разнообразных глифов и символов.",
  defaults: {
    rows: 14,
    cols: 14,
    size: 32,
    bgTint: 0,
  },
  params: [
    { key: "rows", label: "Строк", min: 4, max: 50, step: 1 },
    { key: "cols", label: "Колонок", min: 4, max: 50, step: 1 },
    { key: "size", label: "Размер (px)", min: 8, max: 80, step: 1 },
    { key: "bgTint", label: "Затемнить", min: 0, max: 1, step: 0.02 },
  ],

  createState(opts, w, h) {
    const rng = makeRng(opts.seed + ":gly");
    return { rng, w, h };
  },

  paint(ctx, opts, state) {
    const { w, h, rng } = state;
    const palette = opts.palette;
    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, w, h);

    const rows = Math.max(2, Math.round(opts.rows));
    const cols = Math.max(2, Math.round(opts.cols));
    const font = `${opts.size}px serif`;
    ctx.font = font;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    const cs = palette.colors;
    const cellW = w / cols, cellH = h / rows;

    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        const g = GLYPHS[(rng() * GLYPHS.length) | 0];
        const color = cs[((rng() * cs.length) | 0) % cs.length];
        ctx.fillStyle = color;
        ctx.save();
        ctx.translate(i * cellW + cellW / 2, j * cellH + cellH / 2);
        ctx.rotate((rng() - 0.5) * 0.6);
        ctx.fillText(g, 0, 0);
        ctx.restore();
      }
    }

    if (opts.bgTint > 0) {
      ctx.fillStyle = `rgba(0,0,0,${opts.bgTint})`;
      ctx.fillRect(0, 0, w, h);
    }
  },
};

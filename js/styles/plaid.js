// Plaid — шотландка: горизонтальные + вертикальные полосы разной ширины и цвета.

import { makeRng } from "../rng.js";

export const plaid = {
  id: "plaid",
  name: "Plaid",
  category: "Textures",
  blurb: "Tartan plaid: bands of varying width, crossing.",
  defaults: {
    hStrips: 7,
    vStrips: 7,
    alpha: 0.5,
    bgTint: 0,
  },
  params: [
    { key: "hStrips", label: "Horizontal stripes", min: 2, max: 18, step: 1 },
    { key: "vStrips", label: "Vertical stripes", min: 2, max: 18, step: 1 },
    { key: "alpha", label: "Opacity", min: 0.1, max: 1.0, step: 0.02 },
    { key: "bgTint", label: "Darken", min: 0, max: 1, step: 0.02 },
  ],

  createState(opts, w, h) {
    const rng = makeRng(opts.seed + ":plaid");
    const palette = opts.palette;
    // Генерируем набор ширин и цветов для каждого слоя.
    const tmp = document.createElement("canvas");
    tmp.width = w; tmp.height = h;
    const ctx = tmp.getContext("2d");
    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, w, h);
    const cw = w, ch = h;

    // Горизонтальные полосы
    const hArr = [];
    let acc = 0;
    for (let i = 0; i < opts.hStrips; i++) {
      const t = i / Math.max(1, opts.hStrips - 1);
      const colorIdx = ((t * (palette.colors.length - 1)) | 0) % palette.colors.length;
      const color = palette.colors[colorIdx];
      const thick = (0.05 + rng() * 0.18) * ch;
      hArr.push({ y: acc, thick, color });
      acc += thick + (ch - acc) / Math.max(1, opts.hStrips - 1 - i);
    }
    const vArr = [];
    let acc2 = 0;
    for (let i = 0; i < opts.vStrips; i++) {
      const t = i / Math.max(1, opts.vStrips - 1);
      const colorIdx = ((t * (palette.colors.length - 1)) + 2) % palette.colors.length;
      const color = palette.colors[colorIdx];
      const thick = (0.05 + rng() * 0.18) * cw;
      vArr.push({ x: acc2, thick, color });
      acc2 += thick + (cw - acc2) / Math.max(1, opts.vStrips - 1 - i);
    }
    return { tmp, hArr, vArr, w, h };
  },

  paint(ctx, opts, state) {
    const { w, h, tmp, hArr, vArr } = state;
    const tctx = tmp.getContext("2d");
    tctx.clearRect(0, 0, w, h);
    tctx.fillStyle = opts.palette.bg;
    tctx.fillRect(0, 0, w, h);
    tctx.globalAlpha = opts.alpha;
    for (const s of hArr) {
      tctx.fillStyle = s.color;
      tctx.fillRect(0, s.y, w, s.thick);
    }
    for (const s of vArr) {
      tctx.fillStyle = s.color;
      tctx.fillRect(s.x, 0, s.thick, h);
    }
    tctx.globalAlpha = 1;
    ctx.drawImage(tmp, 0, 0);

    if (opts.bgTint > 0) {
      ctx.fillStyle = `rgba(0,0,0,${opts.bgTint})`;
      ctx.fillRect(0, 0, w, h);
    }
  },
};

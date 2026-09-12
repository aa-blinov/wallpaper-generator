// Celtic — кельтский узор: множественные параллельные кривые, огибающие круг и линии.

import { makeRng } from "../rng.js";

export const celtic = {
  id: "celtic",
  name: "Celtic Knot",
  category: "Геометрия",
  blurb: "Кельтский узор: переплетающиеся ленты вокруг кругов.",
  defaults: {
    strands: 4,
    rings: 4,
    strWidth: 4,
    bgTint: 0,
  },
  params: [
    { key: "rings", label: "Кругов по сетке", min: 1, max: 6, step: 1 },
    { key: "strands", label: "Нитей", min: 2, max: 8, step: 1 },
    { key: "strWidth", label: "Толщина", min: 1, max: 12, step: 0.5 },
  ],

  createState(opts, w, h) {
    const rng = makeRng(opts.seed + ":celt");
    return { rng, w, h };
  },

  paint(ctx, opts, state) {
    const { w, h } = state;
    const palette = opts.palette;
    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, w, h);

    const R = Math.min(w, h) / (opts.rings * 2 + 1) * 0.9;
    const cols = palette.colors;
    const fg = cols[cols.length - 1];
    const strandW = opts.strWidth;
    ctx.lineWidth = strandW;
    ctx.strokeStyle = fg;
    ctx.lineCap = "round";
    const K = Math.max(1, Math.round(opts.strands));

    // Сетка центров
    for (let j = 0; j < opts.rings; j++) {
      for (let i = 0; i < opts.rings; i++) {
        const cx = w / 2 + (i - (opts.rings - 1) / 2) * R * 2.4;
        const cy = h / 2 + (j - (opts.rings - 1) / 2) * R * 2.4;

        // K концентрических окружностей
        for (let k = 0; k < K; k++) {
          ctx.beginPath();
          ctx.arc(cx, cy, R * (0.4 + k * 0.18), 0, Math.PI * 2);
          ctx.stroke();
        }
      }
    }

    // Соединительные ленты между соседними кругами
    ctx.strokeStyle = cols[1] || fg;
    for (let j = 0; j < opts.rings; j++) {
      for (let i = 0; i < opts.rings; i++) {
        const cx = w / 2 + (i - (opts.rings - 1) / 2) * R * 2.4;
        const cy = h / 2 + (j - (opts.rings - 1) / 2) * R * 2.4;
        // К правому соседу
        if (i + 1 < opts.rings) {
          const cx2 = w / 2 + (i + 1 - (opts.rings - 1) / 2) * R * 2.4;
          const cy2 = cy;
          for (let k = 0; k < K; k++) {
            ctx.beginPath();
            const off = R * (0.4 + k * 0.18);
            ctx.moveTo(cx + off, cy + (k - K / 2) * 2);
            ctx.bezierCurveTo(
              (cx + cx2) / 2, cy + (k - K / 2) * 2 - off * 1.4,
              (cx + cx2) / 2, cy2 + (k - K / 2) * 2 + off * 1.4,
              cx2 - off, cy2 + (k - K / 2) * 2
            );
            ctx.stroke();
          }
        }
        // К нижнему соседу
        if (j + 1 < opts.rings) {
          const cx2 = cx;
          const cy2 = h / 2 + (j + 1 - (opts.rings - 1) / 2) * R * 2.4;
          for (let k = 0; k < K; k++) {
            ctx.beginPath();
            const off = R * (0.4 + k * 0.18);
            ctx.moveTo(cx + (k - K / 2) * 2, cy + off);
            ctx.bezierCurveTo(
              cx2 + (k - K / 2) * 2 - off * 1.4, (cy + cy2) / 2,
              cx2 + (k - K / 2) * 2 + off * 1.4, (cy + cy2) / 2,
              cx2 + (k - K / 2) * 2, cy2 - off
            );
            ctx.stroke();
          }
        }
      }
    }

    if (opts.bgTint > 0) {
      ctx.fillStyle = `rgba(0,0,0,${opts.bgTint})`;
      ctx.fillRect(0, 0, w, h);
    }
  },
};

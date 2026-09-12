// Azulejo — португальская плитка: квадратная сетка с раскраской по типу «разделённого креста».

import { makeRng } from "../rng.js";
import { makeColorRamp } from "../palettes.js";

export const azulejo = {
  id: "azulejo",
  name: "Azulejo",
  category: "Геометрия",
  blurb: "Азулежу: квадратная плитка с крестообразным узором в центре.",
  defaults: {
    cell: 60,
    paletteMode: "Палитра",
    bgTint: 0,
  },
  params: [
    { key: "cell", label: "Размер плитки", min: 24, max: 160, step: 4 },
    { key: "paletteMode", label: "Цвет", enum: ["Палитра", "Случайный"] },
  ],

  createState(opts, w, h) {
    const rng = makeRng(opts.seed + ":az");
    const ramp = makeColorRamp(opts.palette.colors);
    return { rng, ramp, w, h };
  },

  paint(ctx, opts, state) {
    const { w, h, rng, ramp } = state;
    const palette = opts.palette;
    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, w, h);
    const cell = opts.cell;
    const cols = Math.ceil(w / cell) + 1;
    const rows = Math.ceil(h / cell) + 1;
    const paletteCols = palette.colors;

    for (let j = -1; j < rows; j++) {
      for (let i = -1; i < cols; i++) {
        const x = i * cell, y = j * cell;
        const c = opts.paletteMode === "Случайный" ? paletteCols[(i * 7 + j * 11 + 0) % paletteCols.length] : ramp((i + j) / (cols + rows));
        ctx.fillStyle = c;
        ctx.fillRect(x, y, cell, cell);
        // Внутренний крест
        ctx.fillStyle = palette.colors[palette.colors.length - 1];
        ctx.fillRect(x + cell * 0.4, y + cell * 0.45, cell * 0.2, cell * 0.1);
        ctx.fillRect(x + cell * 0.45, y + cell * 0.4, cell * 0.1, cell * 0.2);
        // Уголки
        ctx.fillStyle = palette.colors[0];
        for (let k = 0; k < 4; k++) {
          ctx.beginPath();
          ctx.arc(x + (k & 1) * cell, y + (k >> 1) * cell, cell * 0.12, 0, Math.PI * 2);
          ctx.fill();
        }
        // Сетка
        ctx.strokeStyle = palette.colors[0];
        ctx.lineWidth = 1.0;
        ctx.strokeRect(x, y, cell, cell);
      }
    }
    if (opts.bgTint > 0) {
      ctx.fillStyle = `rgba(0,0,0,${opts.bgTint})`;
      ctx.fillRect(0, 0, w, h);
    }
  },
};

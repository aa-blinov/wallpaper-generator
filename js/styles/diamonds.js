// Diamonds — сетка из ромбов с разной заливкой (Монохром / Палитра / Случайный).

import { makeColorRamp } from "../palettes.js";

export const diamonds = {
  id: "diamonds",
  name: "Diamond Grid",
  category: "Geometry",
  blurb: "A diamond grid with noise-driven variation.",
  defaults: {
    cellSize: 60,
    strokeWidth: 1.2,
    paletteMode: "Palette",
    noiseScale: 0.01,
    bgTint: 0,
  },
  params: [
    { key: "cellSize", label: "Cell size", min: 20, max: 200, step: 5 },
    { key: "strokeWidth", label: "Outline", min: 0, max: 4, step: 0.1 },
    { key: "noiseScale", label: "Variation noise", min: 0, max: 0.05, step: 0.001 },
    { key: "paletteMode", label: "Color", enum: ["Palette", "Black and white"] },
  ],

  createState(opts, w, h) {
    // Простой шум для вариаций цветов
    let h0 = 2166136261;
    const s = String(opts.seed ?? "");
    for (let i = 0; i < s.length; i++) { h0 ^= s.charCodeAt(i); h0 = Math.imul(h0, 16777619); }
    const noise2 = (x, y) => {
      let hash = (Math.imul(Math.floor(x * 1000) | 0, 374761393) ^ Math.imul(Math.floor(y * 1000) | 0, 668265263) ^ h0) >>> 0;
      hash = Math.imul(hash ^ (hash >>> 13), 1274126177);
      return ((hash ^ (hash >>> 16)) >>> 0) / 4294967295;
    };
    const ramp = makeColorRamp(opts.palette.colors);
    return { ramp, noise2, w, h };
  },

  paint(ctx, opts, state) {
    const { w, h, ramp, noise2 } = state;
    const palette = opts.palette;
    const cell = opts.cellSize;
    const half = cell / 2;
    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, w, h);

    ctx.lineWidth = opts.strokeWidth;
    ctx.strokeStyle = palette.colors[0];
    ctx.lineJoin = "round";

    const cols = Math.ceil(w / half) + 2;
    const rows = Math.ceil(h / half) + 2;
    for (let j = -1; j < rows; j++) {
      for (let i = -1; i < cols; i++) {
        const x = i * half;
        const y = j * half;
        const t = noise2(i, j);
        ctx.fillStyle = opts.paletteMode === "Black and white"
          ? `rgb(${(t * 255) | 0},${(t * 255) | 0},${(t * 255) | 0})`
          : ramp(t);
        ctx.beginPath();
        ctx.moveTo(x, y + half);
        ctx.lineTo(x + half, y);
        ctx.lineTo(x + cell, y + half);
        ctx.lineTo(x + half, y + cell);
        ctx.closePath();
        ctx.fill();
        if (opts.strokeWidth > 0) ctx.stroke();
      }
    }

    if (opts.bgTint > 0) {
      ctx.fillStyle = `rgba(0,0,0,${opts.bgTint})`;
      ctx.fillRect(0, 0, w, h);
    }
  },
};

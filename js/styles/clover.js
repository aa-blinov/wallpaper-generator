// Clover — клевер: 4 сцепленные окружности в квадрате (4-circle trefoil).
// Параметрическая сетка таких «листочков».

import { makeColorRamp } from "../palettes.js";

export const clover = {
  id: "clover",
  name: "Clover Grid",
  category: "Geometry",
  blurb: "A grid of 4 interlocked circles (square clover).",
  defaults: {
    cellSize: 90,
    strokeWidth: 2.0,
    paletteMode: "By palette",
    bgTint: 0,
  },
  params: [
    { key: "cellSize", label: "Cell size", min: 30, max: 240, step: 5 },
    { key: "strokeWidth", label: "Thickness", min: 0.5, max: 8, step: 0.2 },
    { key: "paletteMode", label: "Color", enum: ["By palette", "Single color", "Transparent"] },
    { key: "bgTint", label: "Darken", min: 0, max: 1, step: 0.02 },
  ],

  createState(opts, w, h) {
    const ramp = makeColorRamp(opts.palette.colors);
    return { ramp, w, h };
  },

  paint(ctx, opts, state) {
    const { w, h, ramp } = state;
    const palette = opts.palette;
    const cell = opts.cellSize;
    const cols = Math.ceil(w / cell) + 1;
    const rows = Math.ceil(h / cell) + 1;
    const r = cell / 2; // радиус каждой окружности

    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, w, h);

    ctx.lineWidth = opts.strokeWidth;
    ctx.lineCap = "round";

    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        const ox = i * cell, oy = j * cell;
        // Четыре центра: (ox + r, oy + r), (ox + r, oy + 3r), (ox + 3r, oy + r), (ox + 3r, oy + 3r)
        const centers = [
          [ox + r, oy + r],
          [ox + r, oy + 3 * r],
          [ox + 3 * r, oy + r],
          [ox + 3 * r, oy + 3 * r],
        ];
        for (let k = 0; k < centers.length; k++) {
          let color;
          if (opts.paletteMode === "Single color") color = palette.colors[palette.colors.length - 1];
          else if (opts.paletteMode === "Transparent") {
            color = `rgba(${parseColor(palette.colors[2] || palette.colors[0])},0.6)`;
          } else {
            color = ramp((j * cols + i + k * 0.25) / (rows * cols));
          }
          ctx.strokeStyle = color;
          ctx.beginPath();
          ctx.arc(centers[k][0], centers[k][1], r, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
    }

    if (opts.bgTint > 0) {
      ctx.fillStyle = `rgba(0,0,0,${opts.bgTint})`;
      ctx.fillRect(0, 0, w, h);
    }
  },
};

function parseColor(rgb) {
  const m = /rgb\((\d+),(\d+),(\d+)\)/.exec(rgb);
  if (!m) return "100,100,100";
  return `${m[1]},${m[2]},${m[3]}`;
}

// Gears — сцепленные шестерни по сетке.

import { makeRng } from "../rng.js";
import { makeColorRamp } from "../palettes.js";

export const gears = {
  id: "gears",
  name: "Gears",
  category: "Geometry",
  blurb: "Interlocking toothed gears.",
  defaults: {
    cols: 3,
    rows: 3,
    teeth: 14,
    strokeWidth: 1.4,
    bgTint: 0,
  },
  params: [
    { key: "cols", label: "Columns", min: 1, max: 8, step: 1 },
    { key: "rows", label: "Rows", min: 1, max: 8, step: 1 },
    { key: "teeth", label: "Teeth", min: 6, max: 32, step: 1 },
    { key: "strokeWidth", label: "Thickness", min: 0.5, max: 4, step: 0.1 },
  ],

  createState(opts, w, h) {
    const rng = makeRng(opts.seed + ":gear");
    const ramp = makeColorRamp(opts.palette.colors);
    return { rng, ramp, w, h };
  },

  paint(ctx, opts, state) {
    const { w, h, ramp } = state;
    const palette = opts.palette;
    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, w, h);

    const cols = Math.round(opts.cols);
    const rows = Math.round(opts.rows);
    const teeth = Math.round(opts.teeth);
    const radius = Math.min(w / cols, h / rows) * 0.42;
    const innerR = radius * 0.7;

    ctx.lineWidth = opts.strokeWidth;
    ctx.lineJoin = "round";

    function drawGear(cx, cy, R, r, T, color) {
      ctx.beginPath();
      for (let i = 0; i <= T * 2; i++) {
        const a = (i / (T * 2)) * Math.PI * 2;
        const radius = i % 2 === 0 ? R : R * 0.85;
        if (i === 0) ctx.moveTo(cx + radius * Math.cos(a), cy + radius * Math.sin(a));
        else ctx.lineTo(cx + radius * Math.cos(a), cy + radius * Math.sin(a));
      }
      ctx.closePath();
      ctx.fillStyle = color;
      ctx.fill();
      ctx.strokeStyle = palette.colors[0];
      ctx.stroke();
      // Центральная ось
      ctx.beginPath();
      ctx.arc(cx, cy, r * 0.3, 0, Math.PI * 2);
      ctx.fillStyle = palette.colors[0];
      ctx.fill();
    }

    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        const cx = (i + 0.5) * w / cols;
        const cy = (j + 0.5) * h / rows;
        drawGear(cx, cy, radius, innerR, teeth, ramp(((j * cols + i) % (cols * rows)) / (cols * rows)));
      }
    }

    if (opts.bgTint > 0) {
      ctx.fillStyle = `rgba(0,0,0,${opts.bgTint})`;
      ctx.fillRect(0, 0, w, h);
    }
  },
};

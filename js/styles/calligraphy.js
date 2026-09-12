// Calligraphy — каллиграфические завитки: широкие линии переменной толщины.

import { makeRng } from "../rng.js";
import { makeColorRamp } from "../palettes.js";

export const calligraphy = {
  id: "calligraphy",
  name: "Calligraphy",
  category: "Organic",
  blurb: "Calligraphic flourishes with variable stroke width.",
  defaults: {
    count: 16,
    length: 220,
    maxWidth: 22,
    paletteMode: "Black on white",
    bgTint: 0,
  },
  params: [
    { key: "count", label: "Curls", min: 4, max: 50, step: 1 },
    { key: "length", label: "Length", min: 60, max: 600, step: 10 },
    { key: "maxWidth", label: "Max thickness", min: 4, max: 60, step: 1 },
    { key: "paletteMode", label: "Color", enum: ["Black on white", "Palette"] },
  ],

  createState(opts, w, h) {
    const rng = makeRng(opts.seed + ":call");
    const ramp = makeColorRamp(opts.palette.colors);
    return { rng, ramp, w, h };
  },

  paint(ctx, opts, state) {
    const { w, h, rng, ramp } = state;
    const palette = opts.palette;
    const bgColor = opts.paletteMode === "Black on white" ? "#fafaf2" : palette.bg;
    const fg = opts.paletteMode === "Black on white" ? "#1a1410" : palette.colors[palette.colors.length - 1];
    ctx.fillStyle = bgColor;
    ctx.fillRect(0, 0, w, h);
    const N = Math.round(opts.count);
    const segs = 24;

    for (let i = 0; i < N; i++) {
      const x1 = rng() * w;
      const y1 = rng() * h;
      const ang = rng() * Math.PI * 2;
      const L = opts.length * (0.5 + rng() * 0.8);
      const W = opts.maxWidth * (0.5 + rng() * 1.0);
      ctx.fillStyle = fg;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      // Сторона 1 (слева)
      const ptsL = [], ptsR = [];
      for (let s = 0; s <= segs; s++) {
        const t = s / segs;
        const cx = x1 + Math.cos(ang) * t * L + Math.cos(ang + Math.PI / 2) * 0;
        const cy = y1 + Math.sin(ang) * t * L;
        const widthHere = W * Math.sin(t * Math.PI) * (1 - Math.abs(t - 0.5) * 0.7);
        const normalX = -Math.sin(ang), normalY = Math.cos(ang);
        // Извилистость (sin перпендикулярного смещения)
        const wiggle = Math.sin(t * Math.PI * 4 + i) * widthHere * 0.4;
        const wx = cx + normalX * widthHere + normalX * wiggle;
        const wy = cy + normalY * widthHere + normalY * wiggle;
        const wx2 = cx - normalX * widthHere - normalX * wiggle;
        const wy2 = cy - normalY * widthHere - normalY * wiggle;
        ptsL.push([wx, wy]);
        ptsR.push([wx2, wy2]);
      }
      ctx.moveTo(ptsL[0][0], ptsL[0][1]);
      for (let s = 0; s <= segs; s++) ctx.lineTo(ptsL[s][0], ptsL[s][1]);
      for (let s = segs; s >= 0; s--) ctx.lineTo(ptsR[s][0], ptsR[s][1]);
      ctx.closePath();
      ctx.fill();
    }
    if (opts.bgTint > 0) {
      ctx.fillStyle = `rgba(0,0,0,${opts.bgTint})`;
      ctx.fillRect(0, 0, w, h);
    }
  },
};

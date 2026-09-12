// Neon — неоновые полосы с шумовыми траекториями и сильным bloom-эффектом.

import { makeNoise2D } from "../noise.js";

export const neon = {
  id: "neon",
  name: "Neon",
  category: "Геометрия",
  blurb: "Неон: кривые линии с сильным glow.",
  defaults: {
    strips: 7,
    curveScale: 0.006,
    strokeWidth: 1.6,
    glow: 0.7,
    bgTint: 0,
  },
  params: [
    { key: "strips", label: "Полос", min: 2, max: 30, step: 1 },
    { key: "curveScale", label: "Кривизна", min: 0.001, max: 0.02, step: 0.001 },
    { key: "strokeWidth", label: "Толщина", min: 0.4, max: 6, step: 0.1 },
    { key: "glow", label: "Свечение", min: 0, max: 1.5, step: 0.02 },
  ],

  createState(opts, w, h) {
    const noise = makeNoise2D(hashSeed(opts.seed));
    return { noise, w, h };
  },

  paint(ctx, opts, state) {
    const { w, h, noise } = state;
    const palette = opts.palette;
    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, w, h);
    const N = Math.round(opts.strips);
    ctx.lineCap = "round";

    for (let i = 0; i < N; i++) {
      const baseY = ((i + 0.5) / N) * h;
      const color = palette.colors[(i * 3) % palette.colors.length];
      ctx.strokeStyle = color;
      ctx.lineWidth = opts.strokeWidth;
      ctx.shadowColor = color;
      ctx.shadowBlur = 16 * opts.glow;
      ctx.beginPath();
      const cells = 200;
      for (let s = 0; s <= cells; s++) {
        const x = (s / cells) * w;
        const off = noise(x * opts.curveScale, baseY * opts.curveScale) * h / 3;
        const y = baseY + off;
        if (s === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.shadowBlur = 0;

    if (opts.bgTint > 0) {
      ctx.fillStyle = `rgba(0,0,0,${opts.bgTint})`;
      ctx.fillRect(0, 0, w, h);
    }
  },
};

function hashSeed(seed) {
  const s = String(seed ?? "");
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

// Stripes Curved — изогнутые полосы вдоль шумовой топологии.

import { makeNoise2D } from "../noise.js";
import { makeColorRamp } from "../palettes.js";

export const stripes_curved = {
  id: "stripes_curved",
  name: "Curved Stripes",
  category: "Геометрия",
  blurb: "Изогнутые полосы по шумовой топологии.",
  defaults: {
    count: 24,
    curveScale: 0.006,
    thickness: 1.0,
    paletteMode: "Палитра",
    bgTint: 0,
  },
  params: [
    { key: "count", label: "Полос", min: 4, max: 80, step: 1 },
    { key: "curveScale", label: "Шум кривизны", min: 0.001, max: 0.02, step: 0.001 },
    { key: "thickness", label: "Толщина", min: 0.3, max: 3, step: 0.05 },
  ],

  createState(opts, w, h) {
    const noise = makeNoise2D(hashSeed(opts.seed));
    const ramp = makeColorRamp(opts.palette.colors);
    return { noise, ramp, w, h };
  },

  paint(ctx, opts, state) {
    const { w, h, noise, ramp } = state;
    const palette = opts.palette;
    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, w, h);
    const count = Math.round(opts.count);
    const thickness = opts.thickness;
    const scale = opts.curveScale;
    const cells = w * 6;

    for (let s = 0; s < count; s++) {
      const baseY = (s / count) * h;
      ctx.strokeStyle = ramp(s / Math.max(1, count - 1));
      ctx.lineWidth = thickness;
      ctx.beginPath();
      for (let i = 0; i < cells; i++) {
        const x = i / cells * w;
        const offset = noise(x * scale, baseY * scale) * h / 4;
        const y = baseY + offset;
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

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

// Dotgrid — точечная сетка разной яркости: точки, цвет по шуму.

import { makeNoise2D } from "../noise.js";
import { makeColorRamp } from "../palettes.js";

export const dotgrid = {
  id: "dotgrid",
  name: "Dot Grid",
  category: "Dots",
  blurb: "A dot grid with brightness driven by noise.",
  defaults: {
    spacing: 12,
    size: 2.5,
    noiseScale: 0.03,
    bgTint: 0,
  },
  params: [
    { key: "spacing", label: "Step", min: 4, max: 60, step: 1 },
    { key: "size", label: "Size", min: 0.5, max: 8, step: 0.2 },
    { key: "noiseScale", label: "Noise frequency", min: 0.005, max: 0.1, step: 0.002 },
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
    const sp = opts.spacing;
    const cols = Math.ceil(w / sp) + 2;
    const rows = Math.ceil(h / sp) + 2;
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        const x = i * sp, y = j * sp;
        const t = (noise(x * opts.noiseScale, y * opts.noiseScale) + 1) * 0.5;
        ctx.fillStyle = ramp(t);
        ctx.beginPath();
        ctx.arc(x, y, opts.size * (0.4 + t * 0.8), 0, Math.PI * 2);
        ctx.fill();
      }
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

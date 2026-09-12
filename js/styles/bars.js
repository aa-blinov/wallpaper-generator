// Bars — горизонтальные полосы с шумом по плотности и шумовым «дребезгом».

import { makeNoise2D } from "../noise.js";
import { makeColorRamp } from "../palettes.js";

export const bars = {
  id: "bars",
  name: "Bars",
  category: "Textures",
  blurb: "Horizontal bars of random thickness.",
  defaults: {
    min: 8,
    max: 60,
    scale: 0.012,
    paletteMode: "By thickness",
    bgTint: 0,
  },
  params: [
    { key: "min", label: "Min thickness", min: 2, max: 30, step: 1 },
    { key: "max", label: "Max thickness", min: 5, max: 80, step: 1 },
    { key: "scale", label: "Jitter noise", min: 0.002, max: 0.05, step: 0.001 },
    { key: "paletteMode", label: "Color", enum: ["By thickness", "Palette"] },
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
    let y = 0;
    let i = 0;
    while (y < h) {
      const baseThick = opts.min + Math.abs(noise(i * 0.5, 0)) * (opts.max - opts.min);
      const phase = noise(0, y * opts.scale) * 0.3 * baseThick;
      ctx.fillStyle = opts.paletteMode === "Palette"
        ? ramp((i % (palette.colors.length * 3)) / 3)
        : ramp((baseThick - opts.min) / (opts.max - opts.min || 1));
      ctx.fillRect(phase, y, w, baseThick);
      y += baseThick;
      i++;
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

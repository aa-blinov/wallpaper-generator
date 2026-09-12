// Sand — песок: плотное зерно из мелких точек с лёгким шумом.

import { makeRng } from "../rng.js";
import { makeNoise2D } from "../noise.js";
import { makeColorRamp } from "../palettes.js";

export const sand = {
  id: "sand",
  name: "Sand",
  category: "Textures",
  blurb: "Sand: fine grain with noise regions of varying brightness.",
  defaults: {
    density: 0.55,
    noiseScale: 0.01,
    grainSize: 1,
    bgTint: 0,
  },
  params: [
    { key: "density", label: "Density", min: 0.1, max: 1.0, step: 0.02 },
    { key: "noiseScale", label: "Region scale", min: 0.002, max: 0.04, step: 0.001 },
    { key: "grainSize", label: "Grain size", min: 1, max: 4, step: 1 },
  ],

  createState(opts, w, h) {
    const noise = makeNoise2D(hashSeed(opts.seed));
    const rng = makeRng(opts.seed + ":sand");
    const ramp = makeColorRamp(opts.palette.colors);
    return { noise, rng, ramp, w, h };
  },

  paint(ctx, opts, state) {
    const { w, h, noise, rng, ramp } = state;
    const palette = opts.palette;
    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, w, h);
    const grain = opts.grainSize;
    const count = Math.floor(w * h * opts.density * 0.05);
    for (let i = 0; i < count; i++) {
      const x = Math.floor(rng() * w);
      const y = Math.floor(rng() * h);
      const t = noise(x * opts.noiseScale, y * opts.noiseScale) * 0.5 + 0.5;
      ctx.fillStyle = ramp(t);
      ctx.fillRect(x, y, grain, grain);
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

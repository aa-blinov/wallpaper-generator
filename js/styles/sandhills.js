// Sandhills — песчаные дюны: суперпозиция sin-волн разной частоты + шум.

import { makeNoise2D } from "../noise.js";
import { makeColorRamp } from "../palettes.js";

export const sandhills = {
  id: "sandhills",
  name: "Sand Dunes",
  category: "Органические",
  blurb: "Песчаные дюны: силуэт из шумовых слоёв.",
  defaults: {
    scale: 0.005,
    octaves: 5,
    contrast: 1.2,
    bgTint: 0,
  },
  params: [
    { key: "scale", label: "Масштаб", min: 0.001, max: 0.02, step: 0.0005 },
    { key: "octaves", label: "Октавы", min: 1, max: 7, step: 1 },
    { key: "contrast", label: "Контраст", min: 0.4, max: 3, step: 0.05 },
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
    const steps = 80;
    const dh = h / steps;
    const scale = opts.scale;
    const octaves = Math.round(opts.octaves);
    const persistence = 0.55, lacunarity = 2.0;

    for (let j = 0; j < steps; j++) {
      const y = h - (j + 0.5) * dh;
      const depth = j / steps;
      ctx.fillStyle = ramp(depth * opts.contrast);
      ctx.beginPath();
      ctx.moveTo(0, h);
      for (let x = 0; x <= w; x += 3) {
        let amp = 1, freq = 1, sum = 0, max = 0;
        for (let o = 0; o < octaves; o++) {
          sum += noise(x * scale * freq, (h - y) * scale * freq) * amp;
          max += amp;
          amp *= persistence;
          freq *= lacunarity;
        }
        const v = sum / max * 0.5 + 0.5;
        const height = depth + v * 0.5 - 0.25;
        const yy = h - (height + 0.5 - 0.5) * h;
        if (x === 0) ctx.moveTo(x, yy);
        else ctx.lineTo(x, yy);
      }
      ctx.lineTo(w, h);
      ctx.closePath();
      ctx.fill();
    }
    if (opts.bgTint > 0) {
      ctx.fillStyle = `rgba(0,0,0,${opts.bgTint})`;
      ctx.fillRect(0, 0, w, h);
    }
  },
};

const SCRATCHES = new Map();
function scratchCanvas(w, h) {
  const key = `${w}x${h}`;
  let c = SCRATCHES.get(key);
  if (!c) { c = document.createElement("canvas"); SCRATCHES.set(key, c); }
  if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
  return c;
}
function hashSeed(seed) {
  const s = String(seed ?? "");
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

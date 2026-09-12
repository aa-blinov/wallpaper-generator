// Fire — огонь снизу: колонки перлин-шума смешиваются с градиентом и идут вверх.

import { makeNoise2D } from "../noise.js";
import { makeColorRamp } from "../palettes.js";

export const fire = {
  id: "fire",
  name: "Fire",
  category: "Organic",
  blurb: "Fire: rising noise columns with a color gradient.",
  defaults: {
    scale: 0.012,
    octaves: 4,
    speed: 0.4,
    intensity: 1.4,
    bgTint: 0,
  },
  params: [
    { key: "scale", label: "Scale", min: 0.002, max: 0.04, step: 0.001 },
    { key: "octaves", label: "Octaves", min: 1, max: 6, step: 1 },
    { key: "intensity", label: "Strength", min: 0.5, max: 3, step: 0.05 },
  ],

  createState(opts, w, h) {
    const noise = makeNoise2D(hashSeed(opts.seed));
    const ramp = makeColorRamp(opts.palette.colors);
    return { noise, ramp, w, h };
  },

  paint(ctx, opts, state) {
    const { w, h, noise, ramp } = state;
    const palette = opts.palette;
    const img = ctx.createImageData(w, h);
    const data = img.data;
    const scale = opts.scale;
    const octaves = Math.round(opts.octaves);
    const persistence = 0.55;
    const lacunarity = 2.0;

    // Цветовой градиент из палитры: тёмный → конечные цвета палитры.
    // Холодный фон берём из opts.palette.bg; горячие цвета — из palette.colors.
    const bgRgb = hexToRgb(opts.palette.bg);
    const palCols = opts.palette.colors.map(hexToRgb);
    const stops = [bgRgb, ...palCols];
    const cols = stops.map((col, i) => ({ t: i / (stops.length - 1), col }));
    function heatColor(v) {
      v = Math.max(0, Math.min(1, v));
      for (let i = 1; i < cols.length; i++) {
        if (v <= cols[i].t) {
          const a = cols[i - 1], b = cols[i];
          const f = (v - a.t) / (b.t - a.t);
          return [
            a.col[0] + (b.col[0] - a.col[0]) * f,
            a.col[1] + (b.col[1] - a.col[1]) * f,
            a.col[2] + (b.col[2] - a.col[2]) * f,
          ];
        }
      }
      return cols[cols.length - 1].col;
    }

    for (let y = 0; y < h; y++) {
      // Низ — горячо, верх — холоднее
      const heightT = 1 - y / h;
      const heatBase = Math.pow(heightT, 1.3);
      for (let x = 0; x < w; x++) {
        let amp = 1, freq = 1, sum = 0, max = 0;
        for (let o = 0; o < octaves; o++) {
          sum += noise(x * scale * freq + y * scale * freq * 1.7, y * scale * freq * 0.6) * amp;
          max += amp;
          amp *= persistence;
          freq *= lacunarity;
        }
        let v = sum / max * 0.5 + 0.5;
        v *= heatBase * opts.intensity;
        const c = heatColor(v);
        const i = (y * w + x) * 4;
        data[i] = c[0] | 0;
        data[i + 1] = c[1] | 0;
        data[i + 2] = c[2] | 0;
        data[i + 3] = 255;
      }
    }
    const off = scratchCanvas(w, h);
    off.getContext("2d").putImageData(img, 0, 0);
    ctx.drawImage(off, 0, 0);

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

function hexToRgb(hex) {
  const m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(hex);
  return m ? [parseInt(m[1], 16), parseInt(m[2], 16), parseInt(m[3], 16)] : [0, 0, 0];
}

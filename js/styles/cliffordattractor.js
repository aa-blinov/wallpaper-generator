// Clifford / de Jong strange attractors — iterate a simple 2D map millions
// of times and accumulate a density histogram; unlike Lorenz's butterfly
// (an explicit 3D curve), these read as a soft, smoky point-cloud texture.

import { makeRng } from "../rng.js";

export const cliffordattractor = {
  id: "cliffordattractor",
  name: "Clifford Attractor",
  category: "Algorithms",
  blurb: "A million-point density cloud from a simple iterated map — smoky, not linear like Lorenz.",
  defaults: {
    family: "Clifford",
    iterations: 1200000,
    exposure: 1.0,
    bgTint: 0,
  },
  params: [
    { key: "family", label: "Attractor", enum: ["Clifford", "De Jong"] },
    { key: "iterations", label: "Points", min: 100000, max: 3000000, step: 100000 },
    { key: "exposure", label: "Exposure", min: 0.3, max: 2.5, step: 0.05 },
  ],

  createState(opts, w, h) {
    const rng = makeRng(opts.seed + ":clf");
    return { rng, w, h };
  },

  paint(ctx, opts, state) {
    const { w, h, rng } = state;
    const palette = opts.palette;
    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, w, h);

    // Fixed set of well-known parameters per family/seed — pick one
    // deterministically from the seed so it stays stable across re-renders
    // with the same seed, but varies across seeds.
    const presetsClifford = [
      [-1.4, 1.6, 1.0, 0.7],
      [-1.7, 1.3, -0.1, -1.21],
      [1.7, 1.7, 0.06, 1.5],
      [-1.8, -2.0, -0.5, -0.9],
    ];
    const presetsDeJong = [
      [1.641, 1.902, 0.316, 1.525],
      [-2.0, -2.0, -1.2, 2.0],
      [1.4, -2.3, 2.4, -2.1],
      [-2.7, -0.09, -0.86, -2.2],
    ];
    const pick = (arr) => arr[Math.floor(rng() * arr.length)];
    const [a, b, c, d] = opts.family === "De Jong" ? pick(presetsDeJong) : pick(presetsClifford);

    // Internal accumulation buffer at a capped resolution — plenty of
    // detail, far cheaper than one Uint32 cell per output pixel at 4K.
    const scale = Math.min(1, 900 / Math.max(w, h));
    const bw = Math.max(64, Math.round(w * scale));
    const bh = Math.max(64, Math.round(h * scale));
    const density = new Uint32Array(bw * bh);

    const iterations = Math.round(opts.iterations);
    let x = 0.1, y = 0.1;
    let maxX = -Infinity, minX = Infinity, maxY = -Infinity, minY = Infinity;
    // Discard a short burn-in, then sample the extent before histogramming
    // (attractor extent isn't known in closed form).
    const sample = [];
    const sampleN = Math.min(20000, iterations);
    for (let i = 0; i < sampleN; i++) {
      const nx = opts.family === "De Jong"
        ? Math.sin(a * y) - Math.cos(b * x)
        : Math.sin(a * y) + c * Math.cos(a * x);
      const ny = opts.family === "De Jong"
        ? Math.sin(c * x) - Math.cos(d * y)
        : Math.sin(b * x) + d * Math.cos(b * y);
      x = nx; y = ny;
      if (i > 200) {
        sample.push(x, y);
        if (x < minX) minX = x; if (x > maxX) maxX = x;
        if (y < minY) minY = y; if (y > maxY) maxY = y;
      }
    }
    const spanX = Math.max(1e-6, maxX - minX), spanY = Math.max(1e-6, maxY - minY);
    const fit = Math.min((bw * 0.94) / spanX, (bh * 0.94) / spanY);
    const ox = bw / 2 - (minX + maxX) / 2 * fit;
    const oy = bh / 2 - (minY + maxY) / 2 * fit;

    for (let i = 0; i < sample.length; i += 2) {
      const px = (sample[i] * fit + ox) | 0;
      const py = (sample[i + 1] * fit + oy) | 0;
      if (px >= 0 && px < bw && py >= 0 && py < bh) density[py * bw + px]++;
    }
    for (let i = sampleN; i < iterations; i++) {
      const nx = opts.family === "De Jong"
        ? Math.sin(a * y) - Math.cos(b * x)
        : Math.sin(a * y) + c * Math.cos(a * x);
      const ny = opts.family === "De Jong"
        ? Math.sin(c * x) - Math.cos(d * y)
        : Math.sin(b * x) + d * Math.cos(b * y);
      x = nx; y = ny;
      const px = (x * fit + ox) | 0;
      const py = (y * fit + oy) | 0;
      if (px >= 0 && px < bw && py >= 0 && py < bh) density[py * bw + px]++;
    }

    let maxD = 1;
    for (let i = 0; i < density.length; i++) if (density[i] > maxD) maxD = density[i];
    const logMax = Math.log(maxD + 1);
    const ramp = makeColorRamp(palette.colors);
    const bgRgb = hexToRgb(palette.bg);
    const img = new ImageData(bw, bh);
    const data = img.data;
    const exposure = opts.exposure;
    for (let i = 0; i < density.length; i++) {
      const v = density[i];
      const t = Math.min(1, (Math.log(v + 1) / logMax) * exposure);
      const [r, g, bch] = t <= 0.02 ? bgRgb : ramp(t);
      const k = i * 4;
      data[k] = r; data[k + 1] = g; data[k + 2] = bch; data[k + 3] = 255;
    }
    const off = document.createElement("canvas");
    off.width = bw; off.height = bh;
    off.getContext("2d").putImageData(img, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.drawImage(off, 0, 0, bw, bh, 0, 0, w, h);

    if (opts.bgTint > 0) {
      ctx.fillStyle = `rgba(0,0,0,${opts.bgTint})`;
      ctx.fillRect(0, 0, w, h);
    }
  },
};

function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
function hexToRgb(hex) {
  const h = hex.replace("#", "");
  const v = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
}
function makeColorRamp(colors) {
  const stops = colors.map(hexToRgb);
  return function ramp(t) {
    t = clamp01(t);
    const n = stops.length - 1;
    const seg = t * n;
    const i = Math.min(n - 1, Math.floor(seg));
    const f = seg - i;
    const a = stops[i], b = stops[i + 1];
    return [a[0] + (b[0] - a[0]) * f, a[1] + (b[1] - a[1]) * f, a[2] + (b[2] - a[2]) * f];
  };
}

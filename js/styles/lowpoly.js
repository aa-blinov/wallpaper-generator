// Low-Poly Terrain — a flat-shaded triangle mesh over an fBM heightmap: each
// facet is lit by its own normal against a fixed light direction, and tinted
// by height (hypsometric ramp), giving the classic faceted low-poly look.

import { makeNoise2D, makeFbm } from "../noise.js";

export const lowpoly = {
  id: "lowpoly",
  name: "Low-Poly Terrain",
  category: "Noise",
  blurb: "A flat-shaded triangle mesh over noise terrain — faceted, hypsometric.",
  defaults: {
    cellSize: 46,
    heightScale: 130,
    noiseScale: 0.9,
    lightAngle: 40,
    bgTint: 0,
  },
  params: [
    { key: "cellSize", label: "Cell size (px)", min: 20, max: 100, step: 2 },
    { key: "heightScale", label: "Relief height", min: 20, max: 300, step: 5 },
    { key: "noiseScale", label: "Terrain scale", min: 0.3, max: 2.5, step: 0.05 },
    { key: "lightAngle", label: "Light angle (°)", min: 0, max: 360, step: 5 },
  ],

  createState(opts, w, h) {
    const noise2D = makeNoise2D(hashSeed(opts.seed));
    const fbm = makeFbm(noise2D, { octaves: 5, persistence: 0.5, lacunarity: 2.05 });
    return { fbm, w, h };
  },

  paint(ctx, opts, state) {
    const { w, h, fbm } = state;
    const palette = opts.palette;
    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, w, h);

    const cell = opts.cellSize;
    const cols = Math.ceil(w / cell) + 1;
    const rows = Math.ceil(h / cell) + 1;
    const nf = opts.noiseScale / Math.min(w, h) * 4;
    const hs = opts.heightScale;

    const height = new Float32Array(cols * rows);
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        height[j * cols + i] = fbm(i * cell * nf, j * cell * nf) * hs;
      }
    }

    const rad = (opts.lightAngle * Math.PI) / 180;
    const light = normalize3([Math.cos(rad), Math.sin(rad), 1.1]);
    const cols2 = palette.colors;
    const ramp = makeColorRamp(cols2);

    function triangle(p0, p1, p2) {
      const ux = p1[0] - p0[0], uy = p1[1] - p0[1], uz = p1[2] - p0[2];
      const vx = p2[0] - p0[0], vy = p2[1] - p0[1], vz = p2[2] - p0[2];
      let nx = uy * vz - uz * vy;
      let ny = uz * vx - ux * vz;
      let nz = ux * vy - uy * vx;
      if (nz < 0) { nx = -nx; ny = -ny; nz = -nz; }
      const len = Math.hypot(nx, ny, nz) || 1;
      const shade = Math.max(0.12, (nx / len) * light[0] + (ny / len) * light[1] + (nz / len) * light[2]);
      const avgH = (p0[2] + p1[2] + p2[2]) / 3;
      const t = clamp01(avgH / hs * 0.5 + 0.5);
      const [r, g, b] = ramp(t);
      ctx.fillStyle = `rgb(${(r * shade) | 0},${(g * shade) | 0},${(b * shade) | 0})`;
      ctx.beginPath();
      ctx.moveTo(p0[0], p0[1]);
      ctx.lineTo(p1[0], p1[1]);
      ctx.lineTo(p2[0], p2[1]);
      ctx.closePath();
      ctx.fill();
    }

    for (let j = 0; j < rows - 1; j++) {
      for (let i = 0; i < cols - 1; i++) {
        const x0 = i * cell, x1 = (i + 1) * cell;
        const y0 = j * cell, y1 = (j + 1) * cell;
        const h00 = [x0, y0, height[j * cols + i]];
        const h10 = [x1, y0, height[j * cols + i + 1]];
        const h01 = [x0, y1, height[(j + 1) * cols + i]];
        const h11 = [x1, y1, height[(j + 1) * cols + i + 1]];
        triangle(h00, h10, h11);
        triangle(h00, h11, h01);
      }
    }

    if (opts.bgTint > 0) {
      ctx.fillStyle = `rgba(0,0,0,${opts.bgTint})`;
      ctx.fillRect(0, 0, w, h);
    }
  },
};

function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
function normalize3(v) {
  const len = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / len, v[1] / len, v[2] / len];
}
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
function hashSeed(seed) {
  const s = String(seed ?? "");
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

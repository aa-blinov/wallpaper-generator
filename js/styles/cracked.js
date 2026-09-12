// Cracked Earth — модификация Voronoi, чьи ячейки окрашены тёплыми тонами
// почвы с трещинами на границах. Плюс легкая развертка шума для нерегулярности.

import { makeNoise2D } from "../noise.js";
import { makeRng } from "../rng.js";
import { makeColorRamp } from "../palettes.js";

export const cracked = {
  id: "cracked",
  name: "Cracked Earth",
  category: "Textures",
  blurb: "Cracked earth — Voronoi cells filled in earthy tones, with cracks.",
  defaults: {
    cellSize: 90,
    edgeWidth: 2.2,
    softness: 1.2,
    noiseScale: 0.012,
    fillMode: "Noise",
    hueShift: 0.0,
    bgTint: 0.0,
  },
  params: [
    { key: "cellSize", label: "Slab size", min: 24, max: 240, step: 2, format: (v) => `${v.toFixed(0)} px` },
    { key: "edgeWidth", label: "Crack width", min: 0, max: 8, step: 0.1 },
    { key: "softness", label: "Edge softness", min: 0.4, max: 4, step: 0.1 },
    { key: "noiseScale", label: "Noise warp", min: 0.0, max: 0.04, step: 0.001 },
    { key: "fillMode", label: "Fill by", enum: ["Noise", "Point ID", "Distance"] },
    { key: "hueShift", label: "Offset", min: -0.5, max: 0.5, step: 0.01 },
    { key: "bgTint", label: "Blend with background", min: 0, max: 1, step: 0.02 },
  ],

  createState(opts, w, h) {
    const noise = makeNoise2D(hashSeed(opts.seed));
    const rng = makeRng(opts.seed + ":cr");
    const ramp = makeColorRamp(opts.palette.colors);
    const cellSize = Math.max(16, opts.cellSize);
    const cols = Math.ceil(w / cellSize) + 2;
    const rows = Math.ceil(h / cellSize) + 2;

    const grid = new Array(rows);
    const points = [];
    for (let j = 0; j < rows; j++) {
      grid[j] = new Array(cols).fill(null);
      for (let i = 0; i < cols; i++) {
        const cx = (i + 0.5) * cellSize - cellSize;
        const cy = (j + 0.5) * cellSize - cellSize;
        const jit = cellSize * 0.55;
        const p = {
          x: cx + (rng() - 0.5) * jit,
          y: cy + (rng() - 0.5) * jit,
          col: rng(),
        };
        grid[j][i] = p;
        points.push(p);
      }
    }
    return { noise, grid, cols, rows, cellSize, points, ramp, w, h };
  },

  paint(ctx, opts, state) {
    const { w, h, grid, cols, rows, cellSize, noise, ramp, points } = state;
    const palette = opts.palette;
    const edgeWidth = opts.edgeWidth;
    const softness = opts.softness;
    const noiseScale = opts.noiseScale;
    const fillMode = opts.fillMode;
    const hueShift = opts.hueShift;
    const edgeColor = palette.colors[palette.colors.length - 1];

    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, w, h);

    const step = Math.max(2, Math.min(4, Math.round(cellSize / 14)));
    const SW = Math.max(1, Math.round(Math.ceil(w / step)));
    const SH = Math.max(1, Math.round(Math.ceil(h / step)));
    const img = ctx.createImageData(SW, SH);
    const data = img.data;

    for (let y = 0; y < SH; y++) {
      for (let x = 0; x < SW; x++) {
        const px = x * step;
        const py = y * step;
        const gi = Math.floor((px + cellSize) / cellSize);
        const gj = Math.floor((py + cellSize) / cellSize);

        let f1 = Infinity, f2 = Infinity, f1p = null;
        for (let dj = -1; dj <= 1; dj++) {
          const j = gj + dj;
          if (j < 0 || j >= rows) continue;
          const row = grid[j];
          for (let di = -1; di <= 1; di++) {
            const i = gi + di;
            if (i < 0 || i >= cols) continue;
            const p = row[i];
            if (!p) continue;
            let dx = px - p.x, dy = py - p.y;
            if (noiseScale > 0.0001) {
              dx += noise(p.x * noiseScale + 1000, p.y * noiseScale + 1000) * 30;
              dy += noise(p.y * noiseScale - 500, p.x * noiseScale - 500) * 30;
            }
            const d = dx * dx + dy * dy;
            if (d < f1) { f2 = f1; f1 = d; f1p = p; }
            else if (d < f2) f2 = d;
          }
        }

        const f1s = Math.sqrt(f1);
        const f2s = Math.sqrt(f2);
        const edge = f2s - f1s;
        const inside = edge / Math.max(0.001, softness);
        const edgeMask = Math.exp(-inside * inside);

        let t;
        if (fillMode === "Noise" && f1p) {
          t = 0.5 + 0.5 * noise(f1p.x * 0.02, f1p.y * 0.02);
        } else if (fillMode === "Point ID" && f1p) {
          t = f1p.col;
        } else {
          t = clamp01(f1s / (cellSize * 1.3));
        }
        t = (t + hueShift) % 1;
        if (t < 0) t += 1;

        // Цвет ячейки + затемнение на границе (трещины).
        const fg = ramp(t);
        const m = /rgb\((\d+),(\d+),(\d+)\)/.exec(fg);
        if (!m) continue;
        const mr = +m[1], mg = +m[2], mb = +m[3];
        const dim = edgeWidth === 0 ? 1 : Math.pow(1 - edgeMask, Math.max(0.5, edgeWidth));
        let r = Math.round(mr * (1 - dim * 0.85));
        let g = Math.round(mg * (1 - dim * 0.85));
        let b = Math.round(mb * (1 - dim * 0.85));

        // Трещины — почти чёрные края.
        if (edgeMask > 0.7 && edgeWidth > 0) {
          r = Math.round(r * (1 - (edgeMask - 0.7) * 2));
          g = Math.round(g * (1 - (edgeMask - 0.7) * 2));
          b = Math.round(b * (1 - (edgeMask - 0.7) * 2));
        }
        const i = (y * SW + x) * 4;
        data[i] = Math.max(0, r);
        data[i + 1] = Math.max(0, g);
        data[i + 2] = Math.max(0, b);
        data[i + 3] = 255;
      }
    }

    const off = scratchCanvas(SW, SH);
    off.getContext("2d").putImageData(img, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(off, 0, 0, SW, SH, 0, 0, w, h);

    if (opts.bgTint > 0) {
      ctx.fillStyle = `rgba(0,0,0,${opts.bgTint})`;
      ctx.fillRect(0, 0, w, h);
    }
  },

  animate(ctx, opts, state, t) {
    // Дрейф точек со временем
    const pts = state.points;
    for (let i = 0; i < pts.length; i++) {
      const p = pts[i];
      p.x += Math.cos(t * 0.0008 + i * 0.13) * 0.4;
      p.y += Math.sin(t * 0.0006 + i * 0.27) * 0.4;
    }
    this.paint(ctx, opts, state);
  },
};

function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
function hashSeed(seed) {
  const s = String(seed ?? "");
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}
const SCRATCHES = new Map();
function scratchCanvas(w, h) {
  const key = `${w}x${h}`;
  let c = SCRATCHES.get(key);
  if (!c) { c = document.createElement("canvas"); SCRATCHES.set(key, c); }
  if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
  return c;
}

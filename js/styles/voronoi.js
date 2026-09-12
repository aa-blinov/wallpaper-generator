// Voronoi — клеточная диаграмма (Worley noise) с F1/F2-метриками.
// Делит плоскость на ячейки вокруг случайных точек на сетке с шумовым
// сдвигом (поэтому НЕ статичный «квадратный» Voronoi — то есть «органичный»).
// Grid-индексированный поиск: пиксель смотрит только 3x3 соседних ячейки.

import { makeNoise2D } from "../noise.js";
import { makeRng, rngRange } from "../rng.js";
import { makeColorRamp } from "../palettes.js";

export const voronoi = {
  id: "voronoi",
  name: "Voronoi Cells",
  category: "Geometry",
  blurb: "Worley cell diagrams — cracks, coral, cracked glass.",
  defaults: {
    cellSize: 70,
    edgeWidth: 1.6,
    softness: 1.4,
    edgeInvert: 0,
    fillMode: "Point ID",
    cellThickness: 0.5,
    jitter: 0.85,
    warp: 0.0,
  },
  params: [
    { key: "cellSize", label: "Cell size", min: 16, max: 220, step: 2, format: (v) => `${v.toFixed(0)} px` },
    { key: "edgeWidth", label: "Border width", min: 0, max: 8, step: 0.1 },
    { key: "softness", label: "Softness", min: 0.2, max: 5, step: 0.1 },
    { key: "edgeInvert", label: "Invert (on dark)", enum: [0, 1] },
    { key: "fillMode", label: "Color by", enum: ["F1 (distance)", "Point ID", "Angle to point"] },
    { key: "cellThickness", label: "Cell fill", min: 0, max: 1, step: 0.02 },
    { key: "jitter", label: "Jitter amount", min: 0, max: 1, step: 0.05 },
    { key: "warp", label: "Noise warp", min: 0, max: 0.04, step: 0.001, format: (v) => v.toFixed(3) },
  ],

  createState(opts, w, h) {
    const rng = makeRng(opts.seed + ":voronoi");
    const noise = makeNoise2D(hashSeed(opts.seed + ":voronoi-n"));

    const cellSize = Math.max(16, opts.cellSize);
    const cols = Math.ceil(w / cellSize) + 2;
    const rows = Math.ceil(h / cellSize) + 2;
    const offsetX = -cellSize;
    const offsetY = -cellSize;

    // В каждой ячейке сетки — одна (или ноль — пусто) точка.
    // Сначала инициализируем все ячейки пустыми.
    const grid = new Array(rows);
    for (let j = 0; j < rows; j++) {
      grid[j] = new Array(cols).fill(null);
    }
    const points = [];
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        const cx = offsetX + (i + 0.5) * cellSize;
        const cy = offsetY + (j + 0.5) * cellSize;
        const jx = cx + (rng() - 0.5) * cellSize * 2 * Math.min(1, opts.jitter);
        const jy = cy + (rng() - 0.5) * cellSize * 2 * Math.min(1, opts.jitter);
        const p = {
          x: jx, y: jy,
          col: rng(),
          ang: rng() * Math.PI * 2,
        };
        points.push(p);
        grid[j][i] = p;
      }
    }

    const ramp = makeColorRamp(opts.palette.colors);
    return { noise, grid, cols, rows, cellSize, offsetX, offsetY, points, ramp, w, h };
  },

  paint(ctx, opts, state) {
    const { grid, cols, rows, cellSize, offsetX, offsetY, noise, ramp, w, h } = state;
    const edgeWidth = opts.edgeWidth;
    const softness = opts.softness;
    const edgeInvert = !!opts.edgeInvert;
    const cellThickness = opts.cellThickness;
    const warp = opts.warp;
    const fillMode = opts.fillMode;

    ctx.fillStyle = opts.palette.bg;
    ctx.fillRect(0, 0, w, h);

    // Шаг сэмпла — компромисс между резкостью и скоростью.
    // Большие ячейки можно рисовать реже, малые — почти попиксельно.
    const step = Math.max(2, Math.min(4, Math.round(cellSize / 12)));
    const W = Math.ceil(w / step);
    const H = Math.ceil(h / step);

    const img = ctx.createImageData(W, H);
    const data = img.data;

    for (let y = 0; y < H; y++) {
      for (let x = 0; x < W; x++) {
        const px = x * step;
        const py = y * step;

        // Координаты сетки для центра.
        const gi = Math.floor((px - offsetX) / cellSize);
        const gj = Math.floor((py - offsetY) / cellSize);

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
            let dx = px - p.x;
            let dy = py - p.y;
            if (warp > 0) {
              // Искажение точек шумом — даёт «органичные» не-Worley ячейки.
              const wdx = noise(p.x * warp + 1000, p.y * warp + 1000) * 35;
              const wdy = noise(p.y * warp - 500, p.x * warp - 500) * 35;
              dx += wdx;
              dy += wdy;
            }
            const d = dx * dx + dy * dy;
            if (d < f1) {
              f2 = f1; f1 = d; f1p = p;
            } else if (d < f2) {
              f2 = d;
            }
          }
        }

        const f1s = Math.sqrt(f1);
        const f2s = Math.sqrt(f2);
        const edge = f2s - f1s;
        // Чем меньше edge, тем ближе к границе.
        // softness — антиалиас-радиус.
        const inside = edge / Math.max(0.001, softness);
        const edgeMask = Math.exp(-inside * inside);  // 1 в центре, 0 на границе.

        let t;
        if (fillMode === "Point ID" && f1p) t = f1p.col;
        else if (fillMode === "Angle to point" && f1p) t = (f1p.ang / (Math.PI * 2) + 1) % 1;
        else t = Math.min(1, f1s / (cellSize * 1.2));

        const fg = ramp(t);
        const m = /rgb\((\d+),(\d+),(\d+)\)/.exec(fg);
        if (!m) continue;
        const mr = +m[1], mg = +m[2], mb = +m[3];

        let r, g, b;
        if (edgeInvert) {
          // Границы светятся, внутренности тёмные.
          const intensity = Math.pow(edgeMask, Math.max(0.1, edgeWidth)) * 0.95;
          r = Math.round(mr * intensity);
          g = Math.round(mg * intensity);
          b = Math.round(mb * intensity);
        } else {
          // Базовая заливка ячейки цветом; граница затемняется/усиливается.
          // «Яркость» ячейки варьируем от центра к границе, чтобы рисовать объём.
          const cellShade = 0.65 + 0.35 * edgeMask;  // центр ярче
          r = Math.round(mr * cellShade);
          g = Math.round(mg * cellShade);
          b = Math.round(mb * cellShade);
          if (cellThickness > 0) {
            const mix = cellThickness * edgeMask;
            r = Math.round(r * (1 - mix) + mr * mix);
            g = Math.round(g * (1 - mix) + mg * mix);
            b = Math.round(b * (1 - mix) + mb * mix);
          }
          // Лёгкое затемнение по самой границе.
          const edgeDark = Math.pow(edgeMask, Math.max(0.5, edgeWidth * 1.2)) * (edgeWidth > 0 ? 0.55 : 0);
          r = Math.round(r * (1 - edgeDark));
          g = Math.round(g * (1 - edgeDark));
          b = Math.round(b * (1 - edgeDark));
        }
        const i = (y * W + x) * 4;
        data[i] = r; data[i + 1] = g; data[i + 2] = b; data[i + 3] = 255;
      }
    }

    const off = scratchCanvas(W, H);
    off.getContext("2d").putImageData(img, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(off, 0, 0, W, H, 0, 0, w, h);
  },

  animate(ctx, opts, state, t) {
    // Лёгкая «жизнь» — сдвигаем каждую точку по синусу.
    const points = state.points;
    for (let i = 0; i < points.length; i++) {
      const p = points[i];
      p.x += Math.cos(t * 0.0008 + i * 0.13) * 0.4;
      p.y += Math.sin(t * 0.0006 + i * 0.27) * 0.4;
    }
    this.paint(ctx, opts, state);
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
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

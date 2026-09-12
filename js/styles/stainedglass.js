// Stained Glass — Вороной + толстый контур + лёгкая «текстура» внутри плиток.

import { makeRng } from "../rng.js";
import { makeColorRamp } from "../palettes.js";

export const stainedglass = {
  id: "stainedglass",
  name: "Stained Glass",
  category: "Textures",
  blurb: "Stained glass: Voronoi cells with a thick dark outline.",
  defaults: {
    sites: 60,
    leadWidth: 4,
    bgTint: 0,
  },
  params: [
    { key: "sites", label: "Tile count", min: 8, max: 200, step: 4 },
    { key: "leadWidth", label: "Lead thickness", min: 1, max: 14, step: 0.5 },
  ],

  createState(opts, w, h) {
    const rng = makeRng(opts.seed + ":sg");
    const ramp = makeColorRamp(opts.palette.colors);
    const N = Math.max(4, Math.round(opts.sites));
    const sites = new Array(N);
    for (let i = 0; i < N; i++) sites[i] = [rng() * w, rng() * h];
    return { rng, ramp, sites, w, h };
  },

  paint(ctx, opts, state) {
    const { w, h, sites, ramp } = state;
    const palette = opts.palette;
    const cols = palette.colors;
    const step = 4;
    const seed = opts.seed + ":sgpaint";
    const rng = makeRng(seed);

    // Сначала рисуем заливки
    for (let y = 0; y < h; y += step) {
      for (let x = 0; x < w; x += step) {
        const cx = x + step / 2, cy = y + step / 2;
        let best1 = Infinity, best2 = Infinity, idx1 = 0;
        for (let i = 0; i < sites.length; i++) {
          const dx = cx - sites[i][0], dy = cy - sites[i][1];
          const d2 = dx * dx + dy * dy;
          if (d2 < best1) { best2 = best1; best1 = d2; idx1 = i; }
          else if (d2 < best2) { best2 = d2; }
        }
        // Внутренность: шумное тонирование по индексу
        const tint = (rng() * 0.5 - 0.25) * 0.4;
        const c = parseRgb(ramp(((idx1 + tint) % (cols.length * 4)) / 4));
        ctx.fillStyle = `rgb(${c[0]|0},${c[1]|0},${c[2]|0})`;
        ctx.fillRect(x, y, step, step);
      }
    }

    // Контуры
    ctx.strokeStyle = "#1a1410";
    ctx.lineWidth = opts.leadWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    for (let i = 0; i < sites.length; i++) {
      for (let j = i + 1; j < sites.length; j++) {
        const dx = sites[i][0] - sites[j][0];
        const dy = sites[i][1] - sites[j][1];
        if (dx * dx + dy * dy > (Math.min(w, h) * 0.7) ** 2) continue;
        // Перпендикулярный биссектор: середина + нормаль
        const mx = (sites[i][0] + sites[j][0]) / 2;
        const my = (sites[i][1] + sites[j][1]) / 2;
        const nx = -dy, ny = dx;
        const lenN = Math.hypot(nx, ny);
        const ux = nx / lenN, uy = ny / lenN;
        const L = Math.min(w, h) * 0.6;
        ctx.beginPath();
        ctx.moveTo(mx - ux * L, my - uy * L);
        ctx.lineTo(mx + ux * L, my + uy * L);
        ctx.stroke();
      }
    }

    if (opts.bgTint > 0) {
      ctx.fillStyle = `rgba(0,0,0,${opts.bgTint})`;
      ctx.fillRect(0, 0, w, h);
    }
  },
};

function parseRgb(rgb) {
  const m = /rgb\((\d+),(\d+),(\d+)\)/.exec(rgb);
  return m ? [+m[1], +m[2], +m[3]] : [200, 200, 200];
}

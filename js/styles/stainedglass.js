// Stained Glass — Вороной + толстый контур + лёгкая «текстура» внутри плиток.

import { makeRng } from "../rng.js";
import { hexToRgb } from "../palettes.js";

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
    const N = Math.max(4, Math.round(opts.sites));
    const sites = new Array(N);
    for (let i = 0; i < N; i++) sites[i] = [rng() * w, rng() * h];
    return { rng, sites, w, h };
  },

  paint(ctx, opts, state) {
    const { w, h, sites } = state;
    const palette = opts.palette;
    const cols = palette.colors;
    const step = 4;
    const seed = opts.seed + ":sgpaint";
    const rng = makeRng(seed);
    const leadHalf = opts.leadWidth / 2;
    const leadRgb = [26, 20, 16]; // "#1a1410"
    const rgbCols = cols.map(hexToRgb);

    // Заливка + свинцовый шов в один проход: для каждой клетки сетки находим
    // расстояние до ближайшего (best1) и второго ближайшего (best2) сайта —
    // разница sqrt(best2)-sqrt(best1) это честное расстояние до границы
    // Вороного. Внутри leadHalf от границы — цвет свинца, иначе — плитка.
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
        const edgeDist = Math.sqrt(best2) - Math.sqrt(best1);
        let r, g, b;
        if (edgeDist < leadHalf) {
          r = leadRgb[0]; g = leadRgb[1]; b = leadRgb[2];
        } else {
          // Цикличная заливка по всей палитре, а не clamp за границей [0,1]
          // (там был баг: почти все плитки зажимало в один крайний цвет).
          // Лёгкая подмешка соседнего цвета — только текстура, не смена оттенка.
          const base = rgbCols[idx1 % rgbCols.length];
          const next = rgbCols[(idx1 + 1) % rgbCols.length];
          const tint = rng() * 0.3;
          r = base[0] + (next[0] - base[0]) * tint;
          g = base[1] + (next[1] - base[1]) * tint;
          b = base[2] + (next[2] - base[2]) * tint;
        }
        ctx.fillStyle = `rgb(${r},${g},${b})`;
        ctx.fillRect(x, y, step, step);
      }
    }

    if (opts.bgTint > 0) {
      ctx.fillStyle = `rgba(0,0,0,${opts.bgTint})`;
      ctx.fillRect(0, 0, w, h);
    }
  },
};

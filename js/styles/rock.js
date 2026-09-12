// Rock — каменная кладка: Вороной + Perlin шум для трещин.

import { makeNoise2D } from "../noise.js";
import { makeRng } from "../rng.js";

export const rock = {
  id: "rock",
  name: "Rock",
  category: "Текстуры",
  blurb: "Камень: неровные куски с шумовыми трещинами.",
  defaults: {
    pieces: 60,
    veinScale: 0.05,
    veinDepth: 0.4,
    bgTint: 0,
  },
  params: [
    { key: "pieces", label: "Кусков", min: 10, max: 200, step: 5 },
    { key: "veinScale", label: "Частота трещин", min: 0.01, max: 0.15, step: 0.005 },
    { key: "veinDepth", label: "Глубина трещин", min: 0, max: 1, step: 0.02 },
  ],

  createState(opts, w, h) {
    const noise = makeNoise2D(hashSeed(opts.seed));
    const rng = makeRng(opts.seed + ":rock");
    const N = Math.round(opts.pieces);
    const sites = new Array(N);
    for (let i = 0; i < N; i++) sites[i] = [rng() * w, rng() * h];
    return { noise, rng, sites, w, h };
  },

  paint(ctx, opts, state) {
    const { w, h, noise, sites } = state;
    const palette = opts.palette;
    const cols = palette.colors;
    // Шаг для скорости
    const step = 3;
    for (let y = 0; y < h; y += step) {
      for (let x = 0; x < w; x += step) {
        let best1 = Infinity, best2 = Infinity, idx1 = 0;
        const cx = x + step / 2, cy = y + step / 2;
        for (let i = 0; i < sites.length; i++) {
          const dx = cx - sites[i][0], dy = cy - sites[i][1];
          const d2 = dx * dx + dy * dy;
          if (d2 < best1) { best2 = best1; best1 = d2; idx1 = i; }
          else if (d2 < best2) { best2 = d2; }
        }
        // Трещина если близко к биссектору между 1 и 2 местами
        const edge = best2 - best1 < 60 ? 0.5 : 0;
        const n = noise(cx * opts.veinScale, cy * opts.veinScale) * 0.5 + 0.5;
        const t = (((idx1 % (cols.length * 3)) / 3) + n * 0.2 + edge * 0.3) * opts.veinDepth + 0.4;
        const c = cols[Math.max(0, Math.min(cols.length - 1, Math.floor(t * cols.length)))];
        ctx.fillStyle = c;
        ctx.fillRect(x, y, step, step);
        if (edge > 0) {
          ctx.fillStyle = cols[0];
          ctx.fillRect(x, y, step, step);
        }
      }
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

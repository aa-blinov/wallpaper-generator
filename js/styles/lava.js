// Lava — потоки лавы: извилистые «потоки» между границами Вороного.

import { makeNoise2D } from "../noise.js";
import { makeRng } from "../rng.js";

export const lava = {
  id: "lava",
  name: "Lava",
  category: "Organic",
  blurb: "Lava: cracks in the dark with glowing edges.",
  defaults: {
    cracks: 30,
    width: 6,
    glow: 0.8,
    bgTint: 0,
  },
  params: [
    { key: "cracks", label: "Cracks", min: 5, max: 100, step: 5 },
    { key: "width", label: "Thickness", min: 1, max: 16, step: 0.5 },
    { key: "glow", label: "Glow", min: 0, max: 1.5, step: 0.02 },
  ],

  createState(opts, w, h) {
    const noise = makeNoise2D(hashSeed(opts.seed));
    const rng = makeRng(opts.seed + ":lava");
    return { noise, rng, w, h };
  },

  paint(ctx, opts, state) {
    const { w, h, noise, rng } = state;
    const palette = opts.palette;
    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, w, h);

    // Сгенерируем «узлы» трещин
    const nodes = [];
    const N = Math.round(opts.cracks);
    for (let i = 0; i < N; i++) nodes.push([rng() * w, rng() * h]);
    const fireCol = palette.colors[palette.colors.length - 1];
    ctx.shadowColor = fireCol;
    ctx.shadowBlur = 12 * opts.glow;
    ctx.lineCap = "round";

    for (const node of nodes) {
      if (node === undefined) continue;
      const x1 = node[0], y1 = node[1];
      // Ищем ближайших 2 соседа
      const dists = [];
      for (let j = 0; j < nodes.length; j++) {
        if (nodes[j] === undefined) continue;
        const dx = nodes[j][0] - x1, dy = nodes[j][1] - y1;
        dists.push([j, dx * dx + dy * dy]);
      }
      dists.sort((a, b) => a[1] - b[1]);
      const targets = dists.slice(1, 3);
      for (const [j] of targets) {
        if (nodes[j] === undefined) continue;
        const x2 = nodes[j][0], y2 = nodes[j][1];
        ctx.strokeStyle = fireCol;
        ctx.lineWidth = opts.width;
        ctx.beginPath();
        const segs = 20;
        for (let s = 0; s <= segs; s++) {
          const t = s / segs;
          const cx = x1 + (x2 - x1) * t;
          const cy = y1 + (y2 - y1) * t;
          const off = noise(cx * 0.01, cy * 0.01) * 30;
          const px = cx + Math.cos(t * 7) * off;
          const py = cy + Math.sin(t * 9) * off;
          if (s === 0) ctx.moveTo(px, py); else ctx.lineTo(px, py);
        }
        ctx.stroke();
        // Удаляем, чтобы не проходить дважды
        nodes[j] = undefined;
      }
    }
    ctx.shadowBlur = 0;
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

// Shards — кристаллические осколки: случайные острые многоугольники.

import { makeRng } from "../rng.js";

export const shards = {
  id: "shards",
  name: "Shards",
  category: "Geometry",
  blurb: "Shards: random sharp-angled polygons.",
  defaults: {
    count: 20,
    strokeWidth: 1.2,
    paletteMode: "Palette",
    bgTint: 0,
  },
  params: [
    { key: "count", label: "Shards", min: 4, max: 60, step: 1 },
    { key: "strokeWidth", label: "Outline", min: 0, max: 3, step: 0.1 },
    { key: "paletteMode", label: "Color", enum: ["Palette", "Random"] },
  ],

  createState(opts, w, h) {
    const rng = makeRng(opts.seed + ":shard");
    const N = Math.round(opts.count);
    const polys = [];
    for (let i = 0; i < N; i++) {
      const cx = rng() * w;
      const cy = rng() * h;
      const r = (0.08 + rng() * 0.18) * Math.min(w, h);
      const V = 5 + Math.floor(rng() * 5);
      const poly = [];
      for (let k = 0; k < V; k++) {
        const a = (k / V) * Math.PI * 2 + rng() * 0.5;
        const rr = r * (0.5 + rng() * 0.8);
        poly.push([cx + rr * Math.cos(a), cy + rr * Math.sin(a)]);
      }
      polys.push(poly);
    }
    return { polys, w, h };
  },

  paint(ctx, opts, state) {
    const { w, h, polys } = state;
    const palette = opts.palette;
    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, w, h);
    const cols = palette.colors;
    ctx.lineWidth = opts.strokeWidth;

    for (let i = 0; i < polys.length; i++) {
      const poly = polys[i];
      const color = opts.paletteMode === "Random" ? cols[i % cols.length] : cols[Math.floor((i / polys.length) * cols.length)];
      ctx.fillStyle = color;
      ctx.strokeStyle = palette.colors[0];
      ctx.beginPath();
      ctx.moveTo(poly[0][0], poly[0][1]);
      for (let k = 1; k < poly.length; k++) ctx.lineTo(poly[k][0], poly[k][1]);
      ctx.closePath();
      ctx.fill();
      if (opts.strokeWidth > 0) ctx.stroke();
    }

    if (opts.bgTint > 0) {
      ctx.fillStyle = `rgba(0,0,0,${opts.bgTint})`;
      ctx.fillRect(0, 0, w, h);
    }
  },
};

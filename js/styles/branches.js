// Branches — ветви с листьями: случайные ветвящиеся пути с маленькими листьями на концах.

import { makeRng } from "../rng.js";
import { makeColorRamp } from "../palettes.js";

export const branches = {
  id: "branches",
  name: "Branches",
  category: "Algorithms",
  blurb: "Branches with leaves: recursive forking.",
  defaults: {
    sources: 8,
    depth: 6,
    length: 80,
    leafSize: 7,
    paletteMode: "Season",
    bgTint: 0,
  },
  params: [
    { key: "sources", label: "Roots", min: 1, max: 30, step: 1 },
    { key: "depth", label: "Depth", min: 2, max: 8, step: 1 },
    { key: "length", label: "Length", min: 30, max: 200, step: 5 },
    { key: "leafSize", label: "Leaf size", min: 2, max: 30, step: 1 },
    { key: "paletteMode", label: "Color", enum: ["Season", "Palette"] },
  ],

  createState(opts, w, h) {
    const rng = makeRng(opts.seed + ":br");
    const ramp = makeColorRamp(opts.palette.colors);
    return { rng, ramp, w, h };
  },

  paint(ctx, opts, state) {
    const { w, h, rng, ramp } = state;
    const palette = opts.palette;
    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, w, h);
    const cols = palette.colors;
    const maxDepth = Math.round(opts.depth);
    const len = opts.length;
    const leafSize = opts.leafSize;

    function grow(x1, y1, dir, length, depth) {
      if (depth > maxDepth || length < 2) {
        // Лист
        const ang = rng() * Math.PI * 2;
        const tipX = x1 + Math.cos(dir) * 1;
        const tipY = y1 + Math.sin(dir) * 1;
        const cx = tipX + Math.cos(ang) * leafSize;
        const cy = tipY + Math.sin(ang) * leafSize;
        ctx.fillStyle = opts.paletteMode === "Palette"
          ? ramp(1 - depth / Math.max(1, maxDepth))
          : ramp((1 - depth / maxDepth) * 0.7 + 0.15);
        ctx.beginPath();
        ctx.ellipse(cx, cy, leafSize, leafSize * 0.5, ang, 0, Math.PI * 2);
        ctx.fill();
        return;
      }
      const x2 = x1 + Math.cos(dir) * length;
      const y2 = y1 + Math.sin(dir) * length;
      ctx.strokeStyle = palette.colors[0];
      ctx.lineWidth = Math.max(0.5, (maxDepth - depth) * 0.7);
      ctx.beginPath();
      ctx.moveTo(x1, y1); ctx.lineTo(x2, y2);
      ctx.stroke();
      const fan = Math.PI / 5;
      grow(x2, y2, dir - fan + (rng() - 0.5) * 0.2, length * 0.72, depth + 1);
      grow(x2, y2, dir + fan + (rng() - 0.5) * 0.2, length * 0.72, depth + 1);
    }

    const S = Math.max(1, Math.round(opts.sources));
    for (let i = 0; i < S; i++) {
      const ang = rng() * Math.PI * 2;
      grow(rng() * w, rng() * h, ang, len, 1);
    }

    if (opts.bgTint > 0) {
      ctx.fillStyle = `rgba(0,0,0,${opts.bgTint})`;
      ctx.fillRect(0, 0, w, h);
    }
  },
};

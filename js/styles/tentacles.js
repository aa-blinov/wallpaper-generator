// Tentacles — щупальца из сглаженных случайных Безье-кривых с затуханием.

import { makeRng } from "../rng.js";
import { makeColorRamp } from "../palettes.js";

export const tentacles = {
  id: "tentacles",
  name: "Tentacles",
  category: "Органические",
  blurb: "Щупальца: случайные кривые Безье с затуханием толщины.",
  defaults: {
    count: 14,
    segments: 60,
    length: 350,
    width: 18,
    bgTint: 0,
  },
  params: [
    { key: "count", label: "Щупалец", min: 2, max: 40, step: 1 },
    { key: "segments", label: "Сегментов", min: 12, max: 120, step: 2 },
    { key: "length", label: "Длина", min: 80, max: 800, step: 10 },
    { key: "width", label: "Толщина", min: 4, max: 60, step: 1 },
  ],

  createState(opts, w, h) {
    const rng = makeRng(opts.seed + ":tent");
    const ramp = makeColorRamp(opts.palette.colors);
    return { rng, ramp, w, h };
  },

  paint(ctx, opts, state) {
    const { w, h, rng, ramp } = state;
    const palette = opts.palette;
    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, w, h);
    const N = Math.round(opts.count);
    const segs = Math.round(opts.segments);
    const len = opts.length;
    const W = opts.width;
    const cols = palette.colors;

    for (let i = 0; i < N; i++) {
      const baseX = rng() * w;
      const baseY = rng() * h;
      const baseAng = rng() * Math.PI * 2;
      const points = [];
      let x = baseX, y = baseY, dir = baseAng;
      for (let s = 0; s < segs; s++) {
        dir += (rng() - 0.5) * 0.4;
        x += Math.cos(dir) * len / segs;
        y += Math.sin(dir) * len / segs;
        points.push([x, y]);
      }
      // Трапеция с затуханием ширины
      ctx.fillStyle = ramp(i / Math.max(1, N - 1));
      ctx.beginPath();
      ctx.moveTo(baseX - Math.cos(baseAng + Math.PI / 2) * W / 2, baseY - Math.sin(baseAng + Math.PI / 2) * W / 2);
      for (let s = 0; s < points.length; s++) {
        const t = s / points.length;
        const w = W * (1 - t) * 0.5;
        const ang = Math.atan2(points[s][1] - (s > 0 ? points[s - 1][1] : baseY), points[s][0] - (s > 0 ? points[s - 1][0] : baseX));
        ctx.lineTo(points[s][0] - Math.cos(ang + Math.PI / 2) * w, points[s][1] - Math.sin(ang + Math.PI / 2) * w);
      }
      for (let s = points.length - 1; s >= 0; s--) {
        const t = s / points.length;
        const w = W * (1 - t) * 0.5;
        const ang = Math.atan2(points[s][1] - (s > 0 ? points[s - 1][1] : baseY), points[s][0] - (s > 0 ? points[s - 1][0] : baseX));
        ctx.lineTo(points[s][0] + Math.cos(ang + Math.PI / 2) * w, points[s][1] + Math.sin(ang + Math.PI / 2) * w);
      }
      ctx.closePath();
      ctx.fill();
    }

    if (opts.bgTint > 0) {
      ctx.fillStyle = `rgba(0,0,0,${opts.bgTint})`;
      ctx.fillRect(0, 0, w, h);
    }
  },
};

// MessyHair — путаница: множество Безье-кривых, соединяющих случайные точки.

import { makeRng } from "../rng.js";
import { makeColorRamp } from "../palettes.js";

export const messyhair = {
  id: "messyhair",
  name: "Messy Hair",
  category: "Algorithms",
  blurb: "Tangle: random Bézier curves between points.",
  defaults: {
    points: 20,
    strands: 30,
    strokeWidth: 1.0,
    paletteMode: "Palette",
    bgTint: 0,
  },
  params: [
    { key: "points", label: "Points", min: 8, max: 60, step: 1 },
    { key: "strands", label: "Links", min: 10, max: 100, step: 5 },
    { key: "strokeWidth", label: "Thickness", min: 0.4, max: 3, step: 0.05 },
  ],

  createState(opts, w, h) {
    const rng = makeRng(opts.seed + ":mesh");
    const ramp = makeColorRamp(opts.palette.colors);
    return { rng, ramp, w, h };
  },

  paint(ctx, opts, state) {
    const { w, h, rng, ramp } = state;
    const palette = opts.palette;
    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, w, h);
    const N = Math.round(opts.points);
    const pts = [];
    for (let i = 0; i < N; i++) pts.push([rng() * w, rng() * h]);
    const K = Math.round(opts.strands);
    ctx.lineCap = "round";
    ctx.lineWidth = opts.strokeWidth;
    for (let k = 0; k < K; k++) {
      const a = Math.floor(rng() * N);
      let b = Math.floor(rng() * N);
      if (b === a) b = (a + 1) % N;
      const x1 = pts[a][0], y1 = pts[a][1];
      const x2 = pts[b][0], y2 = pts[b][1];
      ctx.strokeStyle = opts.paletteMode === "Palette" ? ramp(rng()) : palette.colors[palette.colors.length - 1];
      ctx.globalAlpha = 0.4 + rng() * 0.5;
      const mx = (x1 + x2) / 2 + (rng() - 0.5) * w * 0.2;
      const my = (y1 + y2) / 2 + (rng() - 0.5) * h * 0.2;
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.quadraticCurveTo(mx, my, x2, y2);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    if (opts.bgTint > 0) {
      ctx.fillStyle = `rgba(0,0,0,${opts.bgTint})`;
      ctx.fillRect(0, 0, w, h);
    }
  },
};

// Gradient Mesh — mesh gradient: радиальные градиенты в нескольких точках + alpha-blend.

import { makeRng } from "../rng.js";
import { makeColorRamp } from "../palettes.js";

export const gradient_mesh = {
  id: "gradient_mesh",
  name: "Gradient Mesh",
  category: "Noise",
  blurb: "Mesh gradient: overlapping radial gradients at random points.",
  defaults: {
    points: 6,
    radius: 360,
    contrast: 1.2,
    bgTint: 0,
  },
  params: [
    { key: "points", label: "Points", min: 2, max: 16, step: 1 },
    { key: "radius", label: "Radius", min: 60, max: 800, step: 10 },
    { key: "contrast", label: "Contrast", min: 0.5, max: 3, step: 0.05 },
  ],

  createState(opts, w, h) {
    const rng = makeRng(opts.seed + ":mesh");
    const N = Math.round(opts.points);
    const ps = new Array(N);
    for (let i = 0; i < N; i++) {
      ps[i] = [rng() * w, rng() * h, i % palette_len(opts)];
    }
    return { rng, ps, w, h };
  },

  paint(ctx, opts, state) {
    const { w, h, ps, ramp } = state;
    const palette = opts.palette;
    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, w, h);
    // contrast < 1 размыливает пятна, > 1 делает их плотнее.
    const r = opts.radius / Math.max(0.1, opts.contrast);
    const cols = palette.colors;
    for (const [x, y, idx] of ps) {
      const grd = ctx.createRadialGradient(x, y, 0, x, y, r);
      grd.addColorStop(0, cols[idx % cols.length]);
      grd.addColorStop(1, "rgba(0,0,0,0)");
      ctx.fillStyle = grd;
      ctx.fillRect(0, 0, w, h);
    }
    if (opts.bgTint > 0) {
      ctx.fillStyle = `rgba(0,0,0,${opts.bgTint})`;
      ctx.fillRect(0, 0, w, h);
    }
  },
};

function palette_len(opts) {
  return opts.palette.colors.length;
}

// Ripples — концентрические кольца от случайных центров на «воде».

import { makeRng } from "../rng.js";
import { makeColorRamp } from "../palettes.js";

export const ripples = {
  id: "ripples",
  name: "Ripples",
  category: "Органические",
  blurb: "Круги на воде: пересекающиеся волновые фронты.",
  defaults: {
    centers: 8,
    waveLength: 30,
    decay: 0.95,
    strokeWidth: 1.2,
    bgTint: 0,
  },
  params: [
    { key: "centers", label: "Центров", min: 1, max: 30, step: 1 },
    { key: "waveLength", label: "Длина волны (px)", min: 8, max: 120, step: 2 },
    { key: "decay", label: "Затухание", min: 0.6, max: 1.0, step: 0.005 },
    { key: "strokeWidth", label: "Толщина", min: 0.4, max: 4, step: 0.1 },
  ],

  createState(opts, w, h) {
    const rng = makeRng(opts.seed + ":rip");
    const ramp = makeColorRamp(opts.palette.colors);
    const N = Math.round(opts.centers);
    const cs = new Array(N);
    for (let i = 0; i < N; i++) cs[i] = [rng() * w, rng() * h];
    return { rng, ramp, cs, w, h };
  },

  paint(ctx, opts, state) {
    const { w, h, cs, ramp } = state;
    const palette = opts.palette;
    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, w, h);
    const L = opts.waveLength;
    ctx.lineWidth = opts.strokeWidth;
    ctx.lineCap = "round";

    for (let i = 0; i < cs.length; i++) {
      const rmax = Math.max(w, h);
      ctx.strokeStyle = ramp(i / Math.max(1, cs.length - 1));
      const cx = cs[i][0], cy = cs[i][1];
      for (let r = L; r < rmax; r += L) {
        const fade = Math.pow(opts.decay, r / L) * 0.8;
        ctx.globalAlpha = Math.max(0.05, fade);
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.stroke();
      }
    }
    ctx.globalAlpha = 1;
    if (opts.bgTint > 0) {
      ctx.fillStyle = `rgba(0,0,0,${opts.bgTint})`;
      ctx.fillRect(0, 0, w, h);
    }
  },
};

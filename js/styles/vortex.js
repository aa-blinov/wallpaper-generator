// Vortex — водоворот: спиральное движение точек с затуханием.

import { makeRng } from "../rng.js";
import { makeColorRamp } from "../palettes.js";

export const vortex = {
  id: "vortex",
  name: "Vortex",
  category: "Органические",
  blurb: "Вихрь: спираль с втягивающимися в центр траекториями.",
  defaults: {
    turns: 6,
    arms: 5,
    lineWidth: 0.8,
    bgTint: 0,
  },
  params: [
    { key: "turns", label: "Витков", min: 1, max: 20, step: 0.5 },
    { key: "arms", label: "Рукавов", min: 1, max: 16, step: 1 },
    { key: "lineWidth", label: "Толщина", min: 0.3, max: 3, step: 0.05 },
  ],

  createState(opts, w, h) {
    const ramp = makeColorRamp(opts.palette.colors);
    return { ramp, w, h };
  },

  paint(ctx, opts, state) {
    const { w, h, ramp } = state;
    const palette = opts.palette;
    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, w, h);
    const cx = w / 2, cy = h / 2;
    const R = Math.min(w, h) * 0.48;
    const turns = opts.turns;
    const arms = Math.round(opts.arms);
    ctx.lineWidth = opts.lineWidth;

    for (let a = 0; a < arms; a++) {
      const phi0 = (a / arms) * Math.PI * 2;
      ctx.strokeStyle = ramp(a / Math.max(1, arms - 1));
      ctx.beginPath();
      const samples = 600;
      for (let i = 0; i <= samples; i++) {
        const t = i / samples;
        const ang = phi0 + t * Math.PI * 2 * turns;
        const r = (1 - Math.pow(t, 1.3)) * R;
        const x = cx + r * Math.cos(ang);
        const y = cy + r * Math.sin(ang);
        if (i === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    if (opts.bgTint > 0) {
      ctx.fillStyle = `rgba(0,0,0,${opts.bgTint})`;
      ctx.fillRect(0, 0, w, h);
    }
  },
};

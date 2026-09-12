// Chains — цепи из звеньев: попарные эллипсы со связями.

import { makeRng } from "../rng.js";

export const chains = {
  id: "chains",
  name: "Chains",
  category: "Алгоритмы",
  blurb: "Цепи: соединённые эллиптические звенья.",
  defaults: {
    chains: 6,
    links: 14,
    strokeWidth: 4,
    bgTint: 0,
  },
  params: [
    { key: "chains", label: "Цепей", min: 1, max: 16, step: 1 },
    { key: "links", label: "Звеньев", min: 4, max: 60, step: 1 },
    { key: "strokeWidth", label: "Толщина", min: 0.5, max: 12, step: 0.2 },
  ],

  createState(opts, w, h) {
    const rng = makeRng(opts.seed + ":chains");
    return { rng, w, h };
  },

  paint(ctx, opts, state) {
    const { w, h, rng } = state;
    const palette = opts.palette;
    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, w, h);
    const fg = palette.colors[palette.colors.length - 1];
    ctx.strokeStyle = fg;
    ctx.lineWidth = opts.strokeWidth;

    const C = Math.max(1, Math.round(opts.chains));
    const L = Math.max(2, Math.round(opts.links));
    const linkLen = Math.min(w, h) / (C * 2.4);
    const linkR = linkLen * 0.7;

    for (let c = 0; c < C; c++) {
      const x0 = (w - linkLen * L) / 2 + (c - (C - 1) / 2) * w / C;
      const y0 = h / 2 + (c - (C - 1) / 2) * 30;
      const rot0 = rng() * 0.8 - 0.4;
      let dx = Math.cos(rot0) * linkLen * 0.92;
      let dy = Math.sin(rot0) * linkLen * 0.92;
      let x = x0, y = y0;
      for (let i = 0; i < L; i++) {
        ctx.save();
        ctx.translate(x, y);
        ctx.rotate(rot0 + i * Math.PI / 2);
        ctx.beginPath();
        ctx.ellipse(0, 0, linkR, linkR * 0.5, 0, 0, Math.PI * 2);
        ctx.stroke();
        ctx.restore();
        // Следующая точка
        const ang = rot0 + i * Math.PI / 2;
        const tx = x + Math.cos(ang) * linkLen * 0.95;
        const ty = y + Math.sin(ang) * linkLen * 0.95;
        x = tx; y = ty;
      }
    }

    if (opts.bgTint > 0) {
      ctx.fillStyle = `rgba(0,0,0,${opts.bgTint})`;
      ctx.fillRect(0, 0, w, h);
    }
  },
};

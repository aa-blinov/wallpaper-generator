// Flowsnake 2 — Peano-кривая в Gosper-style.

import { makeColorRamp } from "../palettes.js";

export const flowsnake2 = {
  id: "flowsnake2",
  name: "Flowsnake 2",
  category: "Algorithms",
  blurb: "Peano-Gosper curve, colored by recursion depth.",
  defaults: {
    iterations: 4,
    strokeWidth: 1.2,
    bgTint: 0,
  },
  params: [
    { key: "iterations", label: "Iterations", min: 1, max: 6, step: 1 },
    { key: "strokeWidth", label: "Thickness", min: 0.4, max: 4, step: 0.05 },
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
    const n = Math.round(opts.iterations);
    const ang = Math.PI / 3;
    let s = "F";
    for (let i = 0; i < n; i++) {
      s = s.replace(/F/g, "F+G");
    }
    s = s.replace(/G/g, "F-G");
    // На самом деле нужен правильный L-system
    s = "F";
    for (let i = 0; i < n; i++) {
      let next = "";
      for (const c of s) {
        if (c === "F") next += "F+F-F-F-F+F";
        else next += c;
      }
      s = next;
    }
    let x = w / 2, y = h / 2;
    let dir = 0;
    const len = Math.min(w, h) / Math.pow(3, n) * 1.5;
    const segments = [];
    for (const c of s) {
      if (c === "F") {
        const nx = x + Math.cos(dir) * len;
        const ny = y + Math.sin(dir) * len;
        segments.push([x, y, nx, ny]);
        x = nx; y = ny;
      } else if (c === "+") dir += ang;
      else if (c === "-") dir -= ang;
    }
    ctx.lineWidth = opts.strokeWidth;
    ctx.lineCap = "round";
    const fg = palette.colors[palette.colors.length - 1];
    for (let i = 0; i < segments.length; i++) {
      ctx.strokeStyle = ramp(i / segments.length);
      ctx.beginPath();
      ctx.moveTo(segments[i][0], segments[i][1]);
      ctx.lineTo(segments[i][2], segments[i][3]);
      ctx.stroke();
    }
    if (opts.bgTint > 0) {
      ctx.fillStyle = `rgba(0,0,0,${opts.bgTint})`;
      ctx.fillRect(0, 0, w, h);
    }
  },
};

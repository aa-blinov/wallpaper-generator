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
    // Единичный масштаб (len=1) + честный autofit по bounding box: формула
    // min(w,h)/3^n*1.5 предполагала теоретический охват кривой, который
    // на деле не совпадал с реальным — давало то микроскопическую, то
    // гигантскую кривую в зависимости от n.
    let x = 0, y = 0;
    let dir = 0;
    const segments = [];
    let minX = 0, maxX = 0, minY = 0, maxY = 0;
    for (const c of s) {
      if (c === "F") {
        const nx = x + Math.cos(dir);
        const ny = y + Math.sin(dir);
        segments.push([x, y, nx, ny]);
        x = nx; y = ny;
        if (x < minX) minX = x; else if (x > maxX) maxX = x;
        if (y < minY) minY = y; else if (y > maxY) maxY = y;
      } else if (c === "+") dir += ang;
      else if (c === "-") dir -= ang;
    }
    const bboxW = Math.max(1e-6, maxX - minX);
    const bboxH = Math.max(1e-6, maxY - minY);
    const scale = Math.min(w * 0.9 / bboxW, h * 0.9 / bboxH);
    const ox = w / 2 - (minX + maxX) / 2 * scale;
    const oy = h / 2 - (minY + maxY) / 2 * scale;
    for (const seg of segments) {
      seg[0] = ox + seg[0] * scale; seg[1] = oy + seg[1] * scale;
      seg[2] = ox + seg[2] * scale; seg[3] = oy + seg[3] * scale;
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

// Hatching — штриховка: параллельные линии разной плотности (по шуму).

import { makeNoise2D } from "../noise.js";

export const hatching = {
  id: "hatching",
  name: "Hatching",
  category: "Textures",
  blurb: "Hatching: parallel lines with noise-driven density.",
  defaults: {
    spacing: 8,
    angle: 30,
    densityScale: 0.01,
    strokeWidth: 0.7,
    paletteMode: "Monochrome",
    bgTint: 0,
  },
  params: [
    { key: "spacing", label: "Step (px)", min: 2, max: 30, step: 0.5 },
    { key: "angle", label: "Angle (°)", min: 0, max: 180, step: 1, format: (v) => `${v.toFixed(0)}°` },
    { key: "densityScale", label: "Noise scale", min: 0.002, max: 0.04, step: 0.001 },
    { key: "strokeWidth", label: "Thickness", min: 0.2, max: 3, step: 0.05 },
  ],

  createState(opts, w, h) {
    const noise = makeNoise2D(hashSeed(opts.seed));
    return { noise, w, h };
  },

  paint(ctx, opts, state) {
    const { w, h, noise } = state;
    const palette = opts.palette;
    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, w, h);
    const spacing = opts.spacing;
    const ang = opts.angle * Math.PI / 180;
    const dx = Math.cos(ang), dy = Math.sin(ang);
    const ndx = -dy, ndy = dx;
    const D = Math.max(w, h) * 1.5;
    ctx.strokeStyle = opts.paletteMode === "Monochrome"
      ? palette.colors[palette.colors.length - 1]
      : palette.colors[palette.colors.length - 1];
    ctx.lineWidth = opts.strokeWidth;

    // Соберём список линий, потом отфильтруем по плотности
    const lines = [];
    const steps = Math.ceil(D / spacing);
    for (let i = -steps; i <= steps; i++) {
      const ox = i * spacing * dx;
      const oy = i * spacing * dy;
      const ax = ox - ndx * D;
      const ay = oy - ndy * D;
      const bx = ox + ndx * D;
      const by = oy + ndy * D;
      const mx = (ax + bx) / 2, my = (ay + by) / 2;
      const t = noise(mx * opts.densityScale, my * opts.densityScale) * 0.5 + 0.5;
      if (t > 0.3) lines.push([ax, ay, bx, by, t]);
    }
    // Было: globalAlpha менялся в цикле, но действует только на момент
    // stroke() — единственный вызов в конце красил ВСЕ линии альфой
    // последней добавленной (в дефолте ~0.03, холст выглядел пустым).
    // Каждой линии нужен свой stroke().
    for (const [ax, ay, bx, by, t] of lines) {
      ctx.globalAlpha = (t - 0.3) / 0.7;
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    if (opts.bgTint > 0) {
      ctx.fillStyle = `rgba(0,0,0,${opts.bgTint})`;
      ctx.fillRect(0, 0, w, h);
    }
  },
};

function hashSeed(seed) {
  const s = String(seed ?? "");
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}

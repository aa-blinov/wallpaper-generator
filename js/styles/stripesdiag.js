// Stripes Diagonal — диагональные полосы с шумовым смещением.

import { makeNoise2D } from "../noise.js";
import { makeColorRamp } from "../palettes.js";

export const stripesdiag = {
  id: "stripesdiag",
  name: "Diagonal Stripes",
  category: "Geometry",
  blurb: "Diagonal stripes with noise-based offset.",
  defaults: {
    spacing: 12,
    angle: 45,
    noiseScale: 0.005,
    paletteMode: "Palette",
    bgTint: 0,
  },
  params: [
    { key: "spacing", label: "Step", min: 4, max: 50, step: 1 },
    { key: "angle", label: "Angle", min: 0, max: 180, step: 1, format: (v) => `${v.toFixed(0)}°` },
    { key: "noiseScale", label: "Noise", min: 0, max: 0.02, step: 0.001 },
    { key: "paletteMode", label: "Color", enum: ["Palette", "Monochrome"] },
  ],

  createState(opts, w, h) {
    const noise = makeNoise2D(hashSeed(opts.seed));
    const ramp = makeColorRamp(opts.palette.colors);
    return { noise, ramp, w, h };
  },

  paint(ctx, opts, state) {
    const { w, h, noise, ramp } = state;
    const palette = opts.palette;
    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, w, h);
    const spacing = opts.spacing;
    const ang = opts.angle * Math.PI / 180;
    const sin = Math.sin(ang), cos = Math.cos(ang);
    const dx = cos * spacing, dy = sin * spacing;

    const D = Math.max(w, h) * 2;
    const steps = Math.ceil(D / spacing) + 2;
    for (let i = -steps; i <= steps; i++) {
      const ox = i * dx, oy = i * dy;
      // Смещение через шум
      const mx = ox + cos * h * 0.6;
      const my = oy + sin * h * 0.6;
      const off = noise(mx * opts.noiseScale, my * opts.noiseScale) * spacing * 3;
      const Nx = -sin, Ny = cos;
      ctx.strokeStyle = opts.paletteMode === "Palette" ? ramp((i % 7 + 7) % 7 / 7) : palette.colors[palette.colors.length - 1];
      ctx.lineWidth = spacing;
      ctx.beginPath();
      ctx.moveTo(ox - Nx * D + Nx * off, oy - Ny * D + Ny * off);
      ctx.lineTo(ox + Nx * D + Nx * off, oy + Ny * D + Ny * off);
      ctx.stroke();
    }

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

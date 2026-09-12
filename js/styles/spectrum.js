// Spectrum — спектр: вертикальные полосы по «амплитуде» из шума.

import { makeNoise2D } from "../noise.js";
import { makeColorRamp } from "../palettes.js";

export const spectrum = {
  id: "spectrum",
  name: "Spectrum",
  category: "Текстуры",
  blurb: "Спектр: столбцы разной высоты по шуму.",
  defaults: {
    bars: 80,
    noiseScale: 0.05,
    mode: "Симметрично",
    bgTint: 0,
  },
  params: [
    { key: "bars", label: "Столбцов", min: 10, max: 240, step: 5 },
    { key: "noiseScale", label: "Частота", min: 0.005, max: 0.3, step: 0.005 },
    { key: "mode", label: "Режим", enum: ["Симметрично", "От низа", "От верха"] },
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
    const N = Math.round(opts.bars);
    const dx = w / N;
    const cols = palette.colors;

    // Генерируем «амплитуды» из шумовой функции
    const amps = new Array(N);
    for (let i = 0; i < N; i++) {
      const t = i / N;
      const a = (Math.sin(t * 20) + 1) * 0.3 + noise(t * opts.noiseScale * 100, 0) * 0.7 + 0.3;
      amps[i] = Math.max(0, Math.min(1, a));
    }

    for (let i = 0; i < N; i++) {
      const amp = amps[i];
      ctx.fillStyle = ramp(i / N);
      if (opts.mode === "От верха") {
        ctx.fillRect(i * dx, 0, dx - 1, amp * h);
      } else if (opts.mode === "От низа") {
        ctx.fillRect(i * dx, h - amp * h, dx - 1, amp * h);
      } else {
        ctx.fillRect(i * dx, (h - amp * h) / 2, dx - 1, amp * h);
      }
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

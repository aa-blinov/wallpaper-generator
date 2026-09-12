// Hex Grid — правильная шестиугольная сетка с шумовым возмущением центра
// и случайным "fill" внутри. Пчелиные соты + заливка цветом по шуму.

import { makeNoise2D } from "../noise.js";
import { makeRng } from "../rng.js";
import { makeColorRamp } from "../palettes.js";

export const hexgrid = {
  id: "hexgrid",
  name: "Hex Grid",
  category: "Geometry",
  blurb: "Hexagonal honeycomb with noise-offset centers and fills.",
  defaults: {
    cellSize: 60,
    jitter: 0.55,
    noiseScale: 0.012,
    strokeWidth: 1.5,
    fillMode: "Noise",
    fillStrength: 0.55,
    bgTint: 0.0,
  },
  params: [
    { key: "cellSize", label: "Cell size", min: 18, max: 240, step: 2, format: (v) => `${v.toFixed(0)} px` },
    { key: "jitter", label: "Center offset", min: 0, max: 1, step: 0.05 },
    { key: "noiseScale", label: "Noise scale", min: 0.001, max: 0.04, step: 0.0005 },
    { key: "fillMode", label: "Fill", enum: ["Noise", "Seed rings", "Gradient"] },
    { key: "fillStrength", label: "Fill strength", min: 0, max: 1, step: 0.02 },
    { key: "strokeWidth", label: "Stroke thickness", min: 0, max: 6, step: 0.1 },
    { key: "bgTint", label: "Blend with background", min: 0, max: 1, step: 0.02 },
  ],

  createState(opts, w, h) {
    const noise = makeNoise2D(hashSeed(opts.seed));
    const rng = makeRng(opts.seed + ":hex");
    const ramp = makeColorRamp(opts.palette.colors);
    return { noise, rng, ramp, w, h };
  },

  paint(ctx, opts, state) {
    const { w, h, noise, rng, ramp } = state;
    const palette = opts.palette;
    const cellSize = Math.max(8, opts.cellSize);
    const rowH = cellSize * Math.sqrt(3);     // высота равностороннего шестиугольника
    const stepX = cellSize * 1.5;             // расстояние между центрами по X
    const r = cellSize;

    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, w, h);

    const rows = Math.ceil(h / rowH) + 1;
    const cols = Math.ceil(w / stepX) + 1;

    ctx.lineWidth = opts.strokeWidth;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    const fillMode = opts.fillMode;
    const fillStrength = opts.fillStrength;

    for (let row = -1; row < rows; row++) {
      for (let col = -1; col < cols; col++) {
        // Центры в упаковке "honeycomb": чётные строки смещены на stepX/2.
        const isOdd = row % 2 !== 0;
        let cx = col * stepX + (isOdd ? stepX / 2 : 0);
        const cy = row * rowH;

        // Шумовое возмущение центра (диапазон ~ cellSize*jitter).
        const nx = noise(cx * opts.noiseScale, cy * opts.noiseScale) * opts.jitter * cellSize * 0.45;
        const ny = noise(cy * opts.noiseScale + 99.7, cx * opts.noiseScale + 33.1) * opts.jitter * cellSize * 0.45;
        cx += nx; // для центра столбца оставим смещение только по X
        const cyy = cy + ny;

        // Цвет заливки/обводки.
        let t;
        if (fillMode === "Noise") {
          t = clamp01(0.5 + 0.5 * noise(cx * opts.noiseScale * 0.5, cyy * opts.noiseScale * 0.5));
        } else if (fillMode === "Seed rings") {
          t = ((col + row * 7) % 5) / 4;
        } else {
          // Градиент по диагонали.
          t = clamp01(((cx + cyy) / (w + h)) * 1.3);
        }

        const fg = ramp(t);
        const m = /rgb\((\d+),(\d+),(\d+)\)/.exec(fg);
        if (!m) continue;
        const mr = +m[1], mg = +m[2], mb = +m[3];

        // Заливка шестиугольника: рисуем 6 точек по радиусу r и заливаем.
        ctx.beginPath();
        for (let k = 0; k < 6; k++) {
          const ang = (Math.PI / 3) * k;
          const px = cx + Math.cos(ang) * r;
          const py = cyy + Math.sin(ang) * r;
          if (k === 0) ctx.moveTo(px, py);
          else ctx.lineTo(px, py);
        }
        ctx.closePath();
        // Заливка если включена
        if (fillStrength > 0) {
          ctx.fillStyle = fg;
          ctx.globalAlpha = fillStrength;
          ctx.fill();
          ctx.globalAlpha = 1;
        }
        // Обводка всегда (если толщина > 0)
        if (opts.strokeWidth > 0) {
          ctx.strokeStyle = fg;
          ctx.globalAlpha = Math.min(1, 0.4 + fillStrength * 0.6);
          ctx.stroke();
          ctx.globalAlpha = 1;
        }
      }
    }

    if (opts.bgTint > 0) {
      ctx.fillStyle = `rgba(0,0,0,${opts.bgTint})`;
      ctx.fillRect(0, 0, w, h);
    }
  },

  animate(ctx, opts, state, t) {
    // сдвиг шума со временем
    state.noise._seedT = t * 0.0008;
    // подменим hashSeed — проще сместить centers через подмешивание t:
    opts.seed = `${opts.seed.split(':t')[0]}:t${(t * 0.001) | 0}`;
    // Перегенерируем шум с новым сидом
    state.noise = makeNoise2D(hashSeed(opts.seed));
    this.paint(ctx, opts, state);
  },
};

function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
function hashSeed(seed) {
  const s = String(seed ?? "");
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

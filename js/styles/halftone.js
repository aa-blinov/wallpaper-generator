// Halftone — печатные растровые полутоновые точки. На вход — яркостное поле
// (fBM), на выход — сетка круглых точек, чей размер пропорционален яркости.
// Выглядит как газетная печать или поп-арт.

import { makeNoise2D, makeFbm } from "../noise.js";
import { makeColorRamp } from "../palettes.js";

export const halftone = {
  id: "halftone",
  name: "Halftone",
  category: "Textures",
  blurb: "A halftone dot grid, newspaper-print style.",
  defaults: {
    cellSize: 12,        // px между центрами точек
    scale: 0.006,
    octaves: 5,
    persistence: 0.5,
    lacunarity: 2.0,
    dotSoftness: 1.0,    // антиалиас
    bgTint: 0,
    pattern: "circle",  // "circle" | "diamond" | "square" | "cross"
    angleDeg: 45,
  },
  params: [
    { key: "cellSize", label: "Cell size", min: 4, max: 40, step: 1, format: (v) => `${v.toFixed(0)} px` },
    { key: "scale", label: "Noise scale", min: 0.001, max: 0.04, step: 0.0005 },
    { key: "octaves", label: "Octaves", min: 1, max: 7, step: 1 },
    { key: "dotSoftness", label: "Antialiasing", min: 0.5, max: 3, step: 0.1 },
    { key: "pattern", label: "Point shape", enum: ["circle", "diamond", "square", "cross"] },
    { key: "angleDeg", label: "Grid angle", min: 0, max: 90, step: 1, format: (v) => `${v.toFixed(0)}°` },
    { key: "bgTint", label: "Blend with background", min: 0, max: 1, step: 0.02 },
  ],

  createState(opts, w, h) {
    const noise2D = makeNoise2D(hashSeed(opts.seed));
    const fbm = makeFbm(noise2D, { octaves: opts.octaves, persistence: opts.persistence, lacunarity: opts.lacunarity });
    const ramp = makeColorRamp(opts.palette.colors);
    return { noise2D, fbm, ramp, w, h };
  },

  paint(ctx, opts, state) {
    const { w, h, fbm, ramp } = state;
    const palette = opts.palette;
    const cellSize = Math.max(3, opts.cellSize);
    const scale = opts.scale;
    const pattern = opts.pattern;
    const angle = (opts.angleDeg || 0) * Math.PI / 180;

    const SKIP_STEP = Math.max(1, Math.round(cellSize));  // сэмплируем 1 раз на ячейку

    // Вычислим значения в центрах ячеек (в гриде, повёрнутом на angle).
    const cosA = Math.cos(angle), sinA = Math.sin(angle);
    const cx = w / 2, cy = h / 2;

    // Фон
    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, w, h);

    // Диапазон цветов
    const rampOff = ramp(0);
    const rampHi = ramp(1);
    const mo = /rgb\((\d+),(\d+),(\d+)\)/.exec(rampOff);
    const mh = /rgb\((\d+),(\d+),(\d+)\)/.exec(rampHi);
    const fgR = +mh[1], fgG = +mh[2], fgB = +mh[3];

    // Шаг по ячейкам с поворотом: итерируем по (u, v) в повёрнутой системе,
    // преобразуем в (x, y).
    const u_max = Math.ceil(w / cellSize) + 4;
    const v_max = Math.ceil(h / cellSize) + 4;

    const step = 1;  // отрисовываем все ячейки
    for (let v = -2; v < v_max; v++) {
      for (let u = -2; u < u_max; u++) {
        // Центр ячейки (в пиксельных координатах).
        let lx = (u - u_max / 2) * cellSize;
        let ly = (v - v_max / 2) * cellSize;
        // Поворот
        const X = lx * cosA - ly * sinA + cx;
        const Y = lx * sinA + ly * cosA + cy;
        if (X < -cellSize || X > w + cellSize || Y < -cellSize || Y > h + cellSize) continue;

        // Значение поля в этой точке.
        let val = fbm(X * scale, Y * scale);
        val = (val + 1) * 0.5;  // 0..1
        // Радиус "droplets"
        const cellR = cellSize * 0.5 * Math.sqrt(Math.max(0.0001, val)) * opts.dotSoftness;
        // Цвет
        ctx.fillStyle = ramp(val);

        if (pattern === "circle") {
          ctx.beginPath();
          ctx.arc(X, Y, cellR, 0, Math.PI * 2);
          ctx.fill();
        } else if (pattern === "diamond") {
          ctx.save();
          ctx.translate(X, Y);
          ctx.rotate(Math.PI / 4);
          ctx.fillRect(-cellR * 0.85, -cellR * 0.85, cellR * 1.7, cellR * 1.7);
          ctx.restore();
        } else if (pattern === "square") {
          ctx.fillRect(X - cellR * 0.85, Y - cellR * 0.85, cellR * 1.7, cellR * 1.7);
        } else if (pattern === "cross") {
          ctx.fillRect(X - cellR * 0.35, Y - cellR * 1.1, cellR * 0.7, cellR * 2.2);
          ctx.fillRect(X - cellR * 1.1, Y - cellR * 0.35, cellR * 2.2, cellR * 0.7);
        }
      }
    }

    if (opts.bgTint > 0) {
      ctx.fillStyle = `rgba(0,0,0,${opts.bgTint})`;
      ctx.fillRect(0, 0, w, h);
    }
  },

  animate(ctx, opts, state, t) {
    // Сдвиг шума
    state.fbm = makeFbm(state.noise2D, { octaves: opts.octaves });
    state._fbmDx = (state._fbmDx || 0) + t * 0.0008;
    this.paint(ctx, { ...opts, seed: opts.seed }, state);
  },
};

function hashSeed(seed) {
  const s = String(seed ?? "");
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

// Metaballs — marching squares на поле скаляров из суммы 1/r² по нескольким центрам.

import { hexToRgb } from "../palettes.js";

export const metaballs = {
  id: "metaballs",
  name: "Metaballs",
  category: "Algorithms",
  blurb: "Metaballs: marching squares over the isosurface of summed fields.",
  defaults: {
    count: 9,
    threshold: 0.12,
    radius: 180,
    smoothness: 0.05,
    contour: 0,
    bgTint: 0,
  },
  params: [
    { key: "count", label: "Ball count", min: 2, max: 30, step: 1 },
    { key: "threshold", label: "Threshold", min: 0.005, max: 0.2, step: 0.005 },
    { key: "smoothness", label: "Smoothing", min: 0, max: 0.02, step: 0.001 },
    { key: "contour", label: "Outline", min: 0, max: 1, step: 0.05 },
  ],

  createState(opts, w, h) {
    return { w, h };
  },

  paint(ctx, opts, state) {
    const { w, h } = state;
    const palette = opts.palette;
    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, w, h);

    const N = Math.max(2, Math.round(opts.count));
    // сетка баксов (уменьшаем разрешение для скорости)
    const step = Math.max(2, Math.round(Math.min(w, h) / Math.min(w, h) * 6)); // ~6 px шаг
    const cols = Math.ceil(w / step) + 1;
    const rows = Math.ceil(h / step) + 1;

    // Центры — гексагональная упаковка + лёгкое смещение
    const centers = [];
    for (let i = 0; i < N; i++) {
      const ang = (i / N) * Math.PI * 2;
      const r = (0.15 + (i % 3) * 0.18) * Math.min(w, h);
      centers.push([
        w / 2 + r * Math.cos(ang),
        h / 2 + r * Math.sin(ang),
      ]);
    }

    // Вычисляем скалярное поле. Каждый центр даёт f = max(0, 1 - (d/R)²) —
// классическая «коническая» форма, значения суммы ∈ [0, centers.length], поэтому
// rampIdx хорошо различает зоны.
    const field = new Float32Array(cols * rows);
    const R = opts.radius;
    const invR2 = R > 0 ? 1 / (R * R) : 0;
    for (let j = 0; j < rows; j++) {
      const y = j * step;
      for (let i = 0; i < cols; i++) {
        const x = i * step;
        let sum = 0;
        for (let k = 0; k < centers.length; k++) {
          const dx = x - centers[k][0];
          const dy = y - centers[k][1];
          const d2 = dx * dx + dy * dy;
          const w = 1 - d2 * invR2;
          if (w > 0) sum += w;
        }
        field[j * cols + i] = sum;
      }
    }

    // Marching squares: рисуем заливку там, где sum > threshold
    const t = opts.threshold;
    const sm = opts.smoothness;
    const minT = t - sm, maxT = t + sm;
    const cols2 = palette.colors.map(hexToRgb);
    const bgCol = hexToRgb(palette.bg);
    const rampIdx = (val) => {
      const n = (val - t + sm) / (2 * sm);
      return cols2[Math.max(0, Math.min(cols2.length - 1, Math.floor(n * cols2.length)))];
    };

    const img = ctx.createImageData(w, h);
    const data = img.data;
    for (let i = 0; i < data.length; i += 4) {
      data[i] = bgCol[0]; data[i + 1] = bgCol[1]; data[i + 2] = bgCol[2]; data[i + 3] = 255;
    }
    for (let j = 0; j < rows - 1; j++) {
      for (let i = 0; i < cols - 1; i++) {
        const v00 = field[j * cols + i];
        const v10 = field[j * cols + i + 1];
        const v01 = field[(j + 1) * cols + i];
        const v11 = field[(j + 1) * cols + i + 1];
        const x0 = i * step, y0 = j * step;
        if (v00 >= minT && v10 >= minT && v01 >= minT && v11 >= minT) {
          const vAvg = (v00 + v10 + v01 + v11) / 4;
          const c = rampIdx(vAvg);
          for (let y = y0; y < y0 + step; y++) {
            for (let x = x0; x < x0 + step; x++) {
              if (x < w && y < h) {
                const k = (y * w + x) * 4;
                data[k] = c[0]; data[k + 1] = c[1]; data[k + 2] = c[2]; data[k + 3] = 255;
              }
            }
          }
        }
      }
    }
    const off = scratchCanvas(w, h);
    off.getContext("2d").putImageData(img, 0, 0);
    ctx.drawImage(off, 0, 0);

    // Контур (если нужно)
    if (opts.contour > 0) {
      ctx.strokeStyle = palette.colors[palette.colors.length - 1];
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      for (let j = 0; j < rows - 1; j++) {
        for (let i = 0; i < cols - 1; i++) {
          const v00 = field[j * cols + i];
          const v10 = field[j * cols + i + 1];
          const v01 = field[(j + 1) * cols + i];
          // Сегмент на верхней грани
          if ((v00 > t) !== (v10 > t)) {
            const x = (i + (t - v00) / (v10 - v00)) * step;
            ctx.moveTo(x, j * step); ctx.lineTo(x, (j + 1) * step);
          }
          if ((v00 > t) !== (v01 > t)) {
            const y = (j + (t - v00) / (v01 - v00)) * step;
            ctx.moveTo(i * step, y); ctx.lineTo((i + 1) * step, y);
          }
        }
      }
      ctx.stroke();
    }

    if (opts.bgTint > 0) {
      ctx.fillStyle = `rgba(0,0,0,${opts.bgTint})`;
      ctx.fillRect(0, 0, w, h);
    }
  },
};

const SCRATCHES = new Map();
function scratchCanvas(w, h) {
  const key = `${w}x${h}`;
  let c = SCRATCHES.get(key);
  if (!c) { c = document.createElement("canvas"); SCRATCHES.set(key, c); }
  if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
  return c;
}

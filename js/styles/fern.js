// Fern — папоротник Барнсли (Barnsley fern). Аффинные IFS-преобразования, 4 варианта.

import { makeRng } from "../rng.js";
import { makeColorRamp, hexToRgb } from "../palettes.js";

export const fern = {
  id: "fern",
  name: "Barnsley Fern",
  category: "Algorithms",
  blurb: "Barnsley fern: IFS points from four affine transforms.",
  defaults: {
    points: 120000,
    colorMode: "Green",
    bgTint: 0,
  },
  params: [
    { key: "points", label: "Point count", min: 20000, max: 400000, step: 10000 },
    { key: "colorMode", label: "Color", enum: ["Green", "Palette", "By Y"] },
  ],

  createState(opts, w, h) {
    const rng = makeRng(opts.seed + ":fern");
    return { rng, w, h, points: [] };
  },

  paint(ctx, opts, state) {
    const { w, h, rng } = state;
    const palette = opts.palette;
    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, w, h);

    const N = Math.round(opts.points);
    // Генерируем точки IFS
    let x = 0, y = 0;
    const points = [];
    for (let i = 0; i < N; i++) {
      const r = rng();
      let nx, ny;
      if (r < 0.85) {
        nx = 0.85 * x + 0.04 * y;
        ny = -0.04 * x + 0.85 * y + 1.6;
      } else if (r < 0.92) {
        nx = 0.2 * x - 0.26 * y;
        ny = 0.23 * x + 0.22 * y + 1.6;
      } else if (r < 0.99) {
        nx = -0.15 * x + 0.28 * y;
        ny = 0.26 * x + 0.24 * y + 0.44;
      } else {
        nx = 0;
        ny = 0.16 * y;
      }
      points.push([nx, ny]);
      x = nx; y = ny;
    }

    // Отображаем на канвас.
    // Было: `cx = px*sx` без вычета minX — у папоротника x лежит в
    // [-2.18, 2.66], то есть почти половина точек (весь левый край, где как
    // раз основная масса кроны) уходила в отрицательные cx и обрезалась
    // проверкой `cx < 0`. Нужен честный bbox-autofit по обеим осям.
    let minX = Infinity, maxX = -Infinity, minY = Infinity, maxY = -Infinity;
    for (const [px, py] of points) {
      if (px < minX) minX = px; if (px > maxX) maxX = px;
      if (py < minY) minY = py; if (py > maxY) maxY = py;
    }
    const bboxW = maxX - minX + 0.01, bboxH = maxY - minY + 0.01;
    const scale = Math.min((w * 0.9) / bboxW, (h * 0.9) / bboxH);
    const offsetX = (w - bboxW * scale) / 2 - minX * scale;
    const offsetY = h - minY * scale - (h - bboxH * scale) / 2;

    const img = ctx.createImageData(w, h);
    const data = img.data;
    // Найдём уникальные цвета
    let colBase;
    if (opts.colorMode === "Green") {
      colBase = [40, 130, 60];
    } else {
      colBase = hexToRgb(palette.colors[palette.colors.length - 1]);
    }
    const colsRgb = palette.colors.map(hexToRgb);

    const useColor = opts.colorMode !== "Green";
    for (const [px, py] of points) {
      const cx = (px * scale + offsetX) | 0;
      const cy = (offsetY - py * scale) | 0;
      if (cx < 0 || cx >= w || cy < 0 || cy >= h) continue;
      const k = (cy * w + cx) * 4;
      let r, g, b;
      if (useColor && opts.colorMode === "By Y") {
        const t = (py - minY) / (maxY - minY);
        const idx = (t * (colsRgb.length - 1)) | 0;
        const c = colsRgb[idx];
        r = c[0]; g = c[1]; b = c[2];
      } else if (useColor) {
        r = colBase[0]; g = colBase[1]; b = colBase[2];
      } else {
        r = colBase[0]; g = colBase[1]; b = colBase[2];
      }
      // Было `r*30/255` — с ~120k точек на весь холст большинство "попавших"
      // пикселей задеваются один раз, и такой инкремент (≤~15 из 255) не
      // отличим от фона. Нужна доля канала, а не деление на 255 поверх него.
      const alpha = 0.55;
      data[k] = Math.min(255, data[k] + r * alpha);
      data[k + 1] = Math.min(255, data[k + 1] + g * alpha);
      data[k + 2] = Math.min(255, data[k + 2] + b * alpha);
      data[k + 3] = 255;
    }
    const off = scratchCanvas(w, h);
    off.getContext("2d").putImageData(img, 0, 0);
    ctx.drawImage(off, 0, 0);

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

// Burning Ship — модификация Мандельброта: |Re(z)|, |Im(z)| перед возведением в квадрат.

import { hexToRgb } from "../palettes.js";

export const burning = {
  id: "burning",
  name: "Burning Ship",
  category: "Алгоритмы",
  blurb: "Burning Ship: |Re|+|Im|, искажённый родственник Мандельброта.",
  defaults: {
    maxIter: 120,
    zoom: 1.0,
    centerX: -0.5,
    centerY: -0.6,
    bgTint: 0,
  },
  params: [
    { key: "maxIter", label: "Итерации", min: 50, max: 400, step: 10 },
    { key: "zoom", label: "Зум", min: 0.4, max: 4.0, step: 0.05 },
    { key: "centerX", label: "Центр X", min: -1.5, max: 1.5, step: 0.01, format: (v) => v.toFixed(2) },
    { key: "centerY", label: "Центр Y", min: -1.0, max: 0.2, step: 0.01, format: (v) => v.toFixed(2) },
  ],

  createState(opts, w, h) {
    return { w, h };
  },

  paint(ctx, opts, state) {
    const { w, h } = state;
    const palette = opts.palette;
    const maxIter = Math.round(opts.maxIter);
    const zoom = opts.zoom;
    const cxc = opts.centerX, cyc = opts.centerY;
    const cols = palette.colors.map(hexToRgb);
    const bgCol = hexToRgb(palette.bg);
    const aspect = w / h;

    const img = ctx.createImageData(w, h);
    const data = img.data;
    const range = 3.0 / zoom;

    for (let y = 0; y < h; y++) {
      const yi = cyc + (y / h - 0.5) * range;
      for (let x = 0; x < w; x++) {
        const xi = cxc + (x / w - 0.5) * range * aspect;
        let zx = xi, zy = yi;
        let iter = 0;
        while (iter < maxIter && zx * zx + zy * zy < 4) {
          const ax = Math.abs(zx), ay = Math.abs(zy);
          zx = ax * ax - ay * ay + xi;
          zy = 2 * ax * ay + yi;
          iter++;
        }
        const i = (y * w + x) * 4;
        if (iter === maxIter) {
          data[i] = bgCol[0]; data[i + 1] = bgCol[1]; data[i + 2] = bgCol[2];
        } else {
          const t = iter / maxIter;
          const idx = Math.max(0, Math.min(cols.length - 1, Math.floor(t * cols.length * 1.5)));
          const c = cols[idx];
          data[i] = c[0]; data[i + 1] = c[1]; data[i + 2] = c[2];
        }
        data[i + 3] = 255;
      }
    }
    const off = scratchCanvas(w, h);
    off.getContext("2d").putImageData(img, 0, 0);
    ctx.imageSmoothingEnabled = false;
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

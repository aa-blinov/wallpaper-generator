// Julia Set — фрактал Жюлиа, рендеринг в ImageData с палитрой.

import { hexToRgb } from "../palettes.js";

export const julia = {
  id: "julia",
  name: "Julia Set",
  category: "Алгоритмы",
  blurb: "Множество Жюлиа для комплексной квадратичной формы.",
  defaults: {
    cx: -0.7,
    cy: 0.27015,
    maxIter: 180,
    zoom: 1.0,
    colorMode: "Сглажено",
    bgTint: 0,
  },
  params: [
    { key: "cx", label: "Re(c)", min: -1.5, max: 1.5, step: 0.01, format: (v) => v.toFixed(2) },
    { key: "cy", label: "Im(c)", min: -1.5, max: 1.5, step: 0.01, format: (v) => v.toFixed(2) },
    { key: "maxIter", label: "Итерации", min: 50, max: 500, step: 10 },
    { key: "zoom", label: "Зум", min: 0.3, max: 5.0, step: 0.05 },
  ],

  createState(opts, w, h) {
    return { w, h };
  },

  paint(ctx, opts, state) {
    const { w, h } = state;
    const palette = opts.palette;
    const maxIter = Math.round(opts.maxIter);
    const cx = opts.cx, cy = opts.cy;
    const zoom = opts.zoom;
    const cols = palette.colors.map(hexToRgb);
    const bgCol = hexToRgb(palette.bg);
    const aspect = w / h;

    const img = ctx.createImageData(w, h);
    const data = img.data;
    const range = 2.5 / zoom;

    for (let y = 0; y < h; y++) {
      const yi = (y / h - 0.5) * range;
      for (let x = 0; x < w; x++) {
        const xi = (x / w - 0.5) * range * aspect;
        let zx = xi, zy = yi;
        let iter = 0;
        while (iter < maxIter && zx * zx + zy * zy < 4) {
          const t = zx * zx - zy * zy + cx;
          zy = 2 * zx * zy + cy;
          zx = t;
          iter++;
        }
        const i = (y * w + x) * 4;
        if (iter === maxIter) {
          data[i] = bgCol[0]; data[i + 1] = bgCol[1]; data[i + 2] = bgCol[2];
        } else {
          const t = iter / maxIter;
          const idx = Math.max(0, Math.min(cols.length - 1, Math.floor(t * cols.length * 1.2)));
          const c = cols[idx];
          // smooth coloring через log(n)
          const smoothIter = iter + 1 - Math.log(Math.log(zx * zx + zy * zy)) / Math.log(2);
          const f = Math.max(0, Math.min(1, smoothIter / maxIter));
          data[i] = (c[0] * f) | 0;
          data[i + 1] = (c[1] * f) | 0;
          data[i + 2] = (c[2] * f) | 0;
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

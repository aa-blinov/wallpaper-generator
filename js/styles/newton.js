// Newton Fractal — метод Ньютона для z^3 - 1 = 0. Каждый пиксель —
// ближайший к какому корню пришёл итерационный процесс.

import { hexToRgb } from "../palettes.js";

export const newton = {
  id: "newton",
  name: "Newton Fractal",
  category: "Algorithms",
  blurb: "The Newton fractal for z³ - 1 = 0: three basins of attraction.",
  defaults: {
    maxIter: 60,
    zoom: 1.0,
    bgTint: 0,
  },
  params: [
    { key: "maxIter", label: "Iterations", min: 20, max: 200, step: 5 },
    { key: "zoom", label: "Zoom", min: 0.3, max: 5.0, step: 0.05 },
  ],

  createState(opts, w, h) {
    return { w, h };
  },

  paint(ctx, opts, state) {
    const { w, h } = state;
    const palette = opts.palette;
    const maxIter = Math.round(opts.maxIter);
    const zoom = opts.zoom;
    const cols = palette.colors.map(hexToRgb);
    const bgCol = hexToRgb(palette.bg);
    const roots = [
      [1, 0],
      [-0.5, Math.sqrt(3) / 2],
      [-0.5, -Math.sqrt(3) / 2],
    ];

    const img = ctx.createImageData(w, h);
    const data = img.data;
    const range = 2.0 / zoom;
    const aspect = w / h;

    for (let y = 0; y < h; y++) {
      const yi = (y / h - 0.5) * range;
      for (let x = 0; x < w; x++) {
        const xi = (x / w - 0.5) * range * aspect;
        let zx = xi, zy = yi;
        let iter = 0;
        let which = -1;
        while (iter < maxIter) {
          // f(z) = z^3 - 1, f'(z) = 3 z^2
          const z2r = zx * zx - zy * zy;
          const z2i = 2 * zx * zy;
          const z3r = z2r * zx - z2i * zy;
          const z3i = z2r * zy + z2i * zx;
          const fr = z3r - 1;
          const fi = z3i;
          const denom = 3 * (z2r * z2r + z2i * z2i);
          if (denom < 1e-10) break;
          const dx = (fr * z2r + fi * z2i) / denom;
          const dy = (fi * z2r - fr * z2i) / denom;
          zx -= dx; zy -= dy;
          // Проверим близость к корню
          for (let k = 0; k < 3; k++) {
            const ddx = zx - roots[k][0], ddy = zy - roots[k][1];
            if (ddx * ddx + ddy * ddy < 1e-5) { which = k; break; }
          }
          if (which >= 0) break;
          iter++;
        }
        const i = (y * w + x) * 4;
        if (which < 0) {
          data[i] = bgCol[0]; data[i + 1] = bgCol[1]; data[i + 2] = bgCol[2];
        } else {
          const c = cols[which % cols.length];
          const f = 0.4 + 0.6 * (iter / maxIter);
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

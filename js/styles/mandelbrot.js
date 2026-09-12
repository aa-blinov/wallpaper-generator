// Mandelbrot — классический escape-time фрактал. Для каждого пикселя
// итерируем z = z² + c, считаем число итераций до "burst" (|z|>2).
// Раскраска по числу итераций через палитру. Также поддерживает Julia.

import { makeColorRamp } from "../palettes.js";

export const mandelbrot = {
  id: "mandelbrot",
  name: "Mandelbrot / Julia",
  category: "Algorithms",
  blurb: "Escape-time fractal: classic Mandelbrot or a Julia variant.",
  defaults: {
    mode: "Mandelbrot",    // "Mandelbrot" | "Julia"
    juliaRe: -0.7269,
    juliaIm: 0.1889,
    cx: -0.5,
    cy: 0.0,
    zoom: 1.0,
    maxIter: 80,
    sampleStep: 2,
    cyclePalette: 1.0,
  },
  params: [
    { key: "mode", label: "Mode", enum: ["Mandelbrot", "Julia"] },
    { key: "juliaRe", label: "Julia: Re(c)", min: -1.0, max: 1.0, step: 0.001 },
    { key: "juliaIm", label: "Julia: Im(c)", min: -1.0, max: 1.0, step: 0.001 },
    { key: "cx", label: "Center X", min: -2.0, max: 2.0, step: 0.005 },
    { key: "cy", label: "Center Y", min: -2.0, max: 2.0, step: 0.005 },
    { key: "zoom", label: "Zoom", min: 0.2, max: 12.0, step: 0.05 },
    { key: "maxIter", label: "Iteration depth", min: 20, max: 500, step: 5 },
    { key: "sampleStep", label: "Sample step", min: 1, max: 8, step: 1 },
    { key: "cyclePalette", label: "Palette cycle", min: 0.0, max: 2.0, step: 0.05 },
  ],

  createState(opts, w, h) {
    const ramp = makeColorRamp(opts.palette.colors);
    return { ramp, w, h };
  },

  paint(ctx, opts, state) {
    const { w, h, ramp } = state;
    const palette = opts.palette;
    const mode = opts.mode === "Julia" ? "julia" : "mandelbrot";
    const step = Math.max(1, Math.round(opts.sampleStep));
    const SW = Math.max(1, Math.round(Math.ceil(w / step)));
    const SH = Math.max(1, Math.round(Math.ceil(h / step)));
    const img = ctx.createImageData(SW, SH);
    const data = img.data;
    const maxIter = Math.max(20, Math.round(opts.maxIter));
    const zoom = opts.zoom;
    const cx0 = opts.cx;
    const cy0 = opts.cy;
    const juliaRe = opts.juliaRe;
    const juliaIm = opts.juliaIm;
    const cycle = opts.cyclePalette;

    for (let y = 0; y < SH; y++) {
      for (let x = 0; x < SW; x++) {
        // Нормализуем пиксель в [-1.5..1.5] / zoom.
        const px = (x / SW - 0.5) * 3.0 / zoom + cx0;
        const py = (y / SH - 0.5) * 3.0 / zoom + cy0;
        let zr = mode === "julia" ? px : 0;
        let zi = mode === "julia" ? py : 0;
        let cr, ci;
        if (mode === "julia") { cr = juliaRe; ci = juliaIm; }
        else { cr = px; ci = py; }
        let iter = 0;
        let zr2 = zr * zr, zi2 = zi * zi;
        while (zr2 + zi2 <= 4 && iter < maxIter) {
          zi = 2 * zr * zi + ci;
          zr = zr2 - zi2 + cr;
          zr2 = zr * zr;
          zi2 = zi * zi;
          iter++;
        }
        // 0 → попал во множество (чёрный), иначе цвет по iter.
        let t;
        if (iter === maxIter) {
          t = 0;
        } else {
          // Лёгкое сглаживание для антиалиаса на границе.
          const m = Math.sqrt(zr2 + zi2);
          t = (iter + 1 - Math.log(Math.log(Math.max(1.0001, m))) / Math.log(2));
          t /= maxIter;
          let raw = (t * cycle) % 1;
          if (raw < 0) raw += 1;
          // Было `raw` напрямую — при cyclePalette=0 (минимум слайдера) все
          // внешние точки схлопывались в ramp(0), тот же тёмный стоп, что и
          // у "внутренних" точек множества, и картинка выглядела сплошной/
          // пустой. Сдвигаем диапазон, чтобы внешние точки никогда не
          // совпадали с ramp(0) вне зависимости от cycle.
          t = 0.12 + raw * 0.88;
        }
        const col = ramp(t);
        const m = /rgb\((\d+),(\d+),(\d+)\)/.exec(col);
        const i = (y * SW + x) * 4;
        if (m) {
          data[i] = +m[1]; data[i + 1] = +m[2]; data[i + 2] = +m[3]; data[i + 3] = 255;
        } else {
          data[i] = 0; data[i + 1] = 0; data[i + 2] = 0; data[i + 3] = 255;
        }
      }
    }

    const off = scratchCanvas(SW, SH);
    off.getContext("2d").putImageData(img, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(off, 0, 0, SW, SH, 0, 0, w, h);
  },

  animate(ctx, opts, state, t) {
    // Лёгкий zoom + дрейф.
    opts.cx = opts.cx || 0;
    opts.cy = opts.cy || 0;
    opts.zoom = (opts.zoom || 1) * Math.pow(1.0001, t * 0.001);
    this.paint(ctx, opts, state);
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

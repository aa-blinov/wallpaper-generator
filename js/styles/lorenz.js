// Lorenz Attractor — странный аттрактор Лоренца: x = σ(y-x), y = x(ρ-z)-y, z = xy - βz.

import { hexToRgb } from "../palettes.js";

export const lorenz = {
  id: "lorenz",
  name: "Lorenz Attractor",
  category: "Algorithms",
  blurb: "The Lorenz strange attractor, projected in 3D.",
  defaults: {
    sigma: 10,
    rho: 28,
    beta: 8 / 3,
    steps: 60000,
    strokeWidth: 0.4,
    bgTint: 0,
  },
  params: [
    { key: "sigma", label: "σ (sigma)", min: 1, max: 20, step: 0.1 },
    { key: "rho", label: "ρ (rho)", min: 5, max: 60, step: 0.5 },
    { key: "beta", label: "β (beta)", min: 0.5, max: 5, step: 0.05 },
    { key: "steps", label: "Steps", min: 10000, max: 200000, step: 5000 },
    { key: "strokeWidth", label: "Trail thickness", min: 0.2, max: 2, step: 0.05 },
  ],

  createState(opts, w, h) {
    return { w, h };
  },

  paint(ctx, opts, state) {
    const { w, h } = state;
    const palette = opts.palette;
    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, w, h);

    const sigma = opts.sigma;
    const rho = opts.rho;
    const beta = opts.beta;
    const N = Math.round(opts.steps);
    const dt = 0.005;

    let x = 1, y = 1, z = 1;
    let minX = Infinity, maxX = -Infinity, minZ = Infinity, maxZ = -Infinity;
    const pts = new Array(N);
    for (let i = 0; i < N; i++) {
      const dx = sigma * (y - x);
      const dy = x * (rho - z) - y;
      const dz = x * y - beta * z;
      x += dx * dt; y += dy * dt; z += dz * dt;
      pts[i] = [x, z];
      if (x < minX) minX = x; if (x > maxX) maxX = x;
      if (z < minZ) minZ = z; if (z > maxZ) maxZ = z;
    }
    const sx = w / (maxX - minX + 0.001);
    const sy = h / (maxZ - minZ + 0.001);

    const img = ctx.createImageData(w, h);
    const data = img.data;
    // palette.colors это hex-строки, а не "rgb()" — старый parseRgb никогда
    // не матчился и всегда падал в серый фолбэк, игнорируя палитру целиком.
    const cols = palette.colors.map(hexToRgb);

    // Было `c[0]*a/255` — при default strokeWidth=0.4 это ~9 из 255 на
    // попадание, а большинство точек аттрактора на холст попадают по разу.
    // Нужна доля канала, а не деление на 255 поверх неё.
    const alpha = Math.min(1, opts.strokeWidth * 1.5);
    const c = cols[cols.length - 1];
    for (const [px, pz] of pts) {
      const cx = ((px - minX) * sx) | 0;
      const cy = h - ((pz - minZ) * sy) | 0;
      if (cx < 0 || cx >= w || cy < 0 || cy >= h) continue;
      const k = (cy * w + cx) * 4;
      data[k] = Math.min(255, data[k] + c[0] * alpha);
      data[k + 1] = Math.min(255, data[k + 1] + c[1] * alpha);
      data[k + 2] = Math.min(255, data[k + 2] + c[2] * alpha);
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

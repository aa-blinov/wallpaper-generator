// Curl Flow — частицы в divergence-free поле (curl noise).
// Поле получено как curl от потенциала ψ(x,y): v = (∂ψ/∂y, -∂ψ/∂x).
// Частицы, адвектируемые таким полем, не "слипаются" —
// они закручиваются вокруг вихрей, давая живые, текучие узоры.

import { makeNoise2D } from "../noise.js";
import { makeColorRamp } from "../palettes.js";
import { withAlpha } from "../utils.js";

export const curlflow = {
  id: "curlflow",
  name: "Curl Flow",
  category: "Поток",
  blurb: "Частицы в divergence-free поле — настоящие вихри, без слипания.",
  defaults: {
    density: 0.00028,
    noiseScale: 0.0028,
    stepLength: 2.5,
    maxSteps: 400,
    lineOpacity: 0.06,
    lineWidth: 0.9,
    curlStrength: 1.6,
    bgFade: 0.07,
  },
  params: [
    { key: "density", label: "Плотность", min: 0.00002, max: 0.0006, step: 0.00002 },
    { key: "noiseScale", label: "Масштаб поля", min: 0.0005, max: 0.01, step: 0.0001, format: (v) => v.toFixed(4) },
    { key: "stepLength", label: "Длина шага", min: 1, max: 12, step: 0.1 },
    { key: "curlStrength", label: "Сила вращения", min: 0.2, max: 4, step: 0.05 },
    { key: "lineOpacity", label: "Прозрачность следа", min: 0.01, max: 0.4, step: 0.005 },
    { key: "lineWidth", label: "Толщина линии", min: 0.3, max: 4, step: 0.1 },
    { key: "maxSteps", label: "Длина следа (статика)", min: 30, max: 1500, step: 10 },
  ],

  createState(opts, w, h) {
    const noise = makeNoise2D(hashSeed(opts.seed));
    const ramp = makeColorRamp(opts.palette.colors);
    // Функция скорости через разности потенциала (curl приближение).
    const vel = makeCurlField(noise);
    return { noise, vel, ramp, w, h };
  },

  paint(ctx, opts, state) {
    const { vel, ramp, w, h } = state;
    const { density, noiseScale, stepLength, maxSteps, lineOpacity, lineWidth } = opts;

    ctx.fillStyle = opts.palette.bg;
    ctx.fillRect(0, 0, w, h);

    const grad = ctx.createRadialGradient(w / 2, h / 2, 0, w / 2, h / 2, Math.max(w, h) * 0.7);
    grad.addColorStop(0, "rgba(255,255,255,0.04)");
    grad.addColorStop(1, "rgba(0,0,0,0.55)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, w, h);

    const count = Math.floor(w * h * density);
    ctx.lineCap = "round";
    ctx.lineWidth = lineWidth;

    for (let i = 0; i < count; i++) {
      const x0 = Math.random() * w;
      const y0 = Math.random() * h;
      const path = integrate(x0, y0, w, h, vel, noiseScale, stepLength, opts.curlStrength, maxSteps);
      if (path.length < 2) continue;
      ctx.strokeStyle = ramp(Math.random());
      ctx.globalAlpha = lineOpacity;
      ctx.beginPath();
      ctx.moveTo(path[0].x, path[0].y);
      for (let k = 1; k < path.length; k++) ctx.lineTo(path[k].x, path[k].y);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  },

  animate(ctx, opts, state, time) {
    const { vel, ramp, w, h } = state;
    const { density, noiseScale, stepLength, lineOpacity, lineWidth, curlStrength, bgFade } = opts;

    ctx.fillStyle = opts.palette.bg;
    withAlpha(ctx, bgFade, () => ctx.fillRect(0, 0, w, h));

    const drift = time * 0.0002;
    const count = Math.floor(w * h * density);
    ctx.lineCap = "round";
    ctx.lineWidth = lineWidth;

    for (let i = 0; i < count; i++) {
      const x0 = Math.random() * w;
      const y0 = Math.random() * h;
      const path = integrate(x0, y0, w, h, vel, noiseScale, stepLength, curlStrength, 22, drift);
      if (path.length < 2) continue;
      ctx.strokeStyle = ramp(Math.random());
      ctx.globalAlpha = lineOpacity * 1.4;
      ctx.beginPath();
      ctx.moveTo(path[0].x, path[0].y);
      for (let k = 1; k < path.length; k++) ctx.lineTo(path[k].x, path[k].y);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  },
};

function makeCurlField(noise2D) {
  // Центральная разность по ψ = noise(x,y), даёт v = (∂ψ/∂y, -∂ψ/∂x)
  const EPS = 0.5;
  return function vel(x, y) {
    const nYp = noise2D(x, y + EPS);
    const nYm = noise2D(x, y - EPS);
    const nXp = noise2D(x + EPS, y);
    const nXm = noise2D(x - EPS, y);
    return [(nYp - nYm) / (2 * EPS), -(nXp - nXm) / (2 * EPS)];
  };
}

function integrate(x0, y0, w, h, vel, scale, step, strength, maxSteps, drift = 0) {
  const out = [{ x: x0, y: y0 }];
  let x = x0, y = y0;
  for (let i = 0; i < maxSteps; i++) {
    const [vx, vy] = vel(x * scale + drift, y * scale + drift);
    x += vx * step * 90 * strength;
    y += vy * step * 90 * strength;
    if (x < 0 || y < 0 || x > w || y > h) break;
    out.push({ x, y });
  }
  return out;
}

function hashSeed(seed) {
  const s = String(seed ?? "");
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

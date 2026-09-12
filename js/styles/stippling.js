// Stippling — тысячи мелких точек, плотность которых меняется по noise-полю.
// Классика графического арта (Istvan Kantor / Tiffany Blue-Cloud).
// Выглядит как газетная печать или научная иллюстрация.

import { makeNoise2D } from "../noise.js";
import { makeRng } from "../rng.js";
import { makeColorRamp } from "../palettes.js";

export const stippling = {
  id: "stippling",
  name: "Stippling",
  category: "Точки",
  blurb: "Тысячи точек, плотность которых следует за noise-полем.",
  defaults: {
    density: 0.0042,
    dotRadius: 1.4,
    noiseScale: 0.005,
    octaves: 4,
    contrast: 1.2,
    bgInvert: 0,             // 0 — тёмные точки на светлом фоне
    shade: 1.0,              // пер-пиксельный контраст точек
    blur: 0,
  },
  params: [
    { key: "density", label: "Плотность точек", min: 0.0006, max: 0.012, step: 0.0002, format: (v) => `${(v*1e6).toFixed(0)} ppm` },
    { key: "noiseScale", label: "Масштаб шума", min: 0.001, max: 0.04, step: 0.0005 },
    { key: "octaves", label: "Октавы (детали)", min: 1, max: 6, step: 1 },
    { key: "contrast", label: "Контраст", min: 0.4, max: 3, step: 0.05 },
    { key: "shade", label: "Сила градации", min: 0.4, max: 2.5, step: 0.05 },
    { key: "dotRadius", label: "Радиус точки", min: 0.4, max: 5, step: 0.1 },
    { key: "bgInvert", label: "Инверсия", enum: ["Светлый фон", "Тёмный фон"] },
  ],

  createState(opts, w, h) {
    const noise = makeNoise2D(hashSeed(opts.seed));
    const ramp = makeColorRamp(opts.palette.colors);
    // Шум с фрактальной октавностью считаем на месте.
    return { noise, ramp, w, h };
  },

  paint(ctx, opts, state) {
    const { w, h } = state;
    const palette = opts.palette;
    const ramp = state.ramp;
    const noiseScale = opts.noiseScale;
    const octaves = opts.octaves;
    const contrast = opts.contrast;
    const shade = opts.shade;
    const dotRadius = opts.dotRadius;
    const density = opts.density;
    const bgInvert = opts.bgInvert === "Тёмный фон" ? 1 : 0;
    const noise = state.noise;

    // Заливка фона градиентом (крайний цвет палитры).
    ctx.fillStyle = bgInvert ? palette.colors[palette.colors.length - 1] : palette.colors[0];
    ctx.fillRect(0, 0, w, h);

    // Чтобы рисунок не был шумным на мелком масштабе, используем fBM.
    function fbm(x, y) {
      let total = 0, amp = 1, freq = 1, max = 0;
      for (let o = 0; o < octaves; o++) {
        total += noise(x * freq, y * freq) * amp;
        max += amp;
        amp *= 0.5;
        freq *= 2;
      }
      return total / max;
    }

    const count = Math.floor(w * h * density);
    const fg = bgInvert ? palette.colors[0] : palette.colors[palette.colors.length - 1];
    ctx.fillStyle = fg;

    for (let i = 0; i < count; i++) {
      const x = Math.random() * w;
      const y = Math.random() * h;
      let v = fbm(x * noiseScale, y * noiseScale);
      // Сдвигаем середину в "пороговое" поведение: чем больше v, тем крупнее точка.
      v = (v + 1) * 0.5;
      v = (v - 0.5) * contrast + 0.5;
      v = Math.pow(Math.max(0, Math.min(1, v)), shade);
      const r = Math.max(0.1, dotRadius * (0.25 + 0.85 * v));
      ctx.beginPath();
      ctx.arc(x, y, r, 0, Math.PI * 2);
      ctx.fill();
    }
  },

  animate(ctx, opts, state, _t) {
    // Для анимации перегенерируем с новым seed-фрагментом по времени.
    state._tAnim = (_t * 0.0005) | 0;
    opts.seed = `${opts.seed}:t${state._tAnim}`;
    this.paint(ctx, opts, state);
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

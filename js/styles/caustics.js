// Caustics — сумма нескольких бегущих синусоидальных волн, как
// лучи света на дне бассейна. Использует raiseToPower, чтобы получить
// тонкие яркие линии.

import { makeRng } from "../rng.js";
import { makeColorRamp } from "../palettes.js";

export const caustics = {
  id: "caustics",
  name: "Caustics",
  category: "Organic",
  blurb: "A sum of traveling waves — underwater light rays.",
  defaults: {
    waves: 5,
    speed: 0.6,
    detailScale: 9.0,
    contrast: 1.0,
    gamma: 4.5,
    bgBrightness: 0.06,
    sampleStep: 4,
  },
  params: [
    { key: "waves", label: "Wave count", min: 2, max: 16, step: 1 },
    { key: "speed", label: "Speed", min: 0, max: 3, step: 0.05 },
    { key: "detailScale", label: "Frequency", min: 0.3, max: 6, step: 0.1 },
    { key: "contrast", label: "Contrast", min: 1.5, max: 16, step: 0.5 },
    { key: "gamma", label: "Gamma (thin lines)", min: 0.1, max: 1.4, step: 0.02 },
    { key: "bgBrightness", label: "Background brightness", min: 0, max: 1, step: 0.02 },
    { key: "sampleStep", label: "Sample step", min: 1, max: 6, step: 1, format: (v) => `${v.toFixed(0)} px` },
  ],

  createState(opts, w, h) {
    const rng = makeRng(opts.seed + ":cau");
    // Заранее сгенерируем параметры волн (фаза, направление, скорость).
    const N = Math.max(2, Math.round(opts.waves));
    const waves = [];
    for (let i = 0; i < N; i++) {
      waves.push({
        // направление волны (угол)
        ang: rng() * Math.PI * 2,
        // скорость
        phaseSpeed: 0.6 + rng() * 0.8,
        // частота (длина волны) — нормируется через detailScale в paint
        freq: 0.6 + rng() * 1.0,
        // сдвиг фазы
        phase0: rng() * Math.PI * 2,
      });
    }
    const ramp = makeColorRamp(opts.palette.colors);
    return { waves, ramp, w, h };
  },

  paint(ctx, opts, state) {
    const { w, h, waves, ramp } = state;
    const palette = opts.palette;
    const detailScale = opts.detailScale;
    const contrast = opts.contrast;
    const gamma = opts.gamma;
    const bgBright = opts.bgBrightness;
    const step = Math.max(1, Math.round(opts.sampleStep));
    const SW = Math.max(1, Math.round(Math.ceil(w / step)));
    const SH = Math.max(1, Math.round(Math.ceil(h / step)));
    const img = ctx.createImageData(SW, SH);
    const data = img.data;
    const pi2 = Math.PI * 2;

    for (let y = 0; y < SH; y++) {
      for (let x = 0; x < SW; x++) {
        const px = x * step;
        const py = y * step;
        let s = 0;
        for (let i = 0; i < waves.length; i++) {
          const wv = waves[i];
          // Проекция (px, py) на направление волны.
          const proj = Math.cos(wv.ang) * px + Math.sin(wv.ang) * py;
          // freq в createState ~0.6..1.6, * 0.01 = 0.006..0.016, * detailScale=9 = 0.05..0.14
          // На 1920px: proj*0.14 ≈ 270, ~43 периода.
          // speed масштабирует фазу: 0 — стоит на месте, >0.6 — быстрее.
          const speedScale = (opts.speed ?? 0.6) / 0.6;
          s += Math.sin(proj * wv.freq * 0.01 * detailScale + wv.phase0 * speedScale);
        }
        // Нормализуем в [0..1]: среднее -> 0.5, узлы -> 0/1
        s = s / waves.length * 0.5 + 0.5;
        // gamma > 1 даёт тонкие яркие лучи
        s = Math.pow(Math.max(0, Math.min(1, s)), gamma);
        // Контраст регулирует общую яркость/контрастность
        s = bgBright + (1 - bgBright) * (s * contrast);
        s = Math.max(0, Math.min(1, s));
        const col = ramp(s);
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
    // Сдвигаем фазы всех волн.
    const waves = state.waves;
    for (let i = 0; i < waves.length; i++) {
      const wv = waves[i];
      const proj = 0;
      const newPhase = wv.phase0 + wv.phaseSpeed * opts.speed * t * 0.0006;
      wv.phase0 = newPhase;
    }
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

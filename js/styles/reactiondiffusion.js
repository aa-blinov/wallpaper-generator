// Reaction-Diffusion (Gray-Scott) — симуляция двух реагентов A и B.
// Сложная часть (warmup, каждый шаг) теперь считается в Web Worker,
// благодаря чему main thread не блокируется. Если Worker недоступен —
// есть fallback на синхронный путь (старый код, выполняется в main).

import { makeRng, rngRange } from "../rng.js";

const PRESETS = {
  coral:     { feed: 0.0545, kill: 0.062 },
  mitosis:   { feed: 0.0367, kill: 0.0649 },
  maze:      { feed: 0.0290, kill: 0.057 },
  spots:     { feed: 0.0300, kill: 0.062 },
  worms:     { feed: 0.078,  kill: 0.061 },
  fingerprint: { feed: 0.055, kill: 0.062 },
  solitons:  { feed: 0.025,  kill: 0.060 },
  holes:     { feed: 0.039,  kill: 0.058 },
};

const WORKER_URL = new URL("./rd-worker.js", import.meta.url);

export const reactiondiffusion = {
  id: "reactiondiffusion",
  name: "Reaction-Diffusion",
  category: "Алгоритмы",
  blurb: "Gray-Scott: A и B диффундируют и взаимодействуют. Кораллы, лабиринты, митозы.",
  defaults: {
    preset: "coral",
    presetTune: 0,
    stepsPerFrame: 10,
    simResolution: 180,
    colorMix: 0.85,
    contrast: 1.4,
    brightness: 0.0,
  },
  params: [
    { key: "preset", label: "Пресет", enum: Object.keys(PRESETS) },
    { key: "presetTune", label: "Отстройка", min: -0.02, max: 0.02, step: 0.001 },
    { key: "stepsPerFrame", label: "Шагов на кадр", min: 1, max: 80, step: 1 },
    { key: "simResolution", label: "Разрешение симуляции", min: 96, max: 720, step: 16 },
    { key: "colorMix", label: "Цветовая насыщенность", min: 0, max: 1, step: 0.02 },
    { key: "contrast", label: "Контраст", min: 0.4, max: 3, step: 0.05 },
    { key: "brightness", label: "Яркость", min: -0.5, max: 0.5, step: 0.02 },
  ],

  createState(opts, w, h) {
    const sw = Math.min(w, h);
    const cellSize = Math.max(1, Math.round(sw / Math.max(96, opts.simResolution)));
    const SW = Math.floor(w / cellSize);
    const SH = Math.floor(h / cellSize);
    const palette = opts.palette;
    const state = {
      SW, SH, cellSize, palette,
      w, h,
      a0: null, b0: null,
      _worker: null,
      _ready: false,
      _busy: false,
      _timings: null,
      _mode: "sync", // "worker" | "sync"
      _onReady: null,
      _onStep: null,
    };

    // Пробуем запустить Worker; если нельзя — fallback на main.
    // В lite-режиме (для шаринга URL / preview) форсим sync — Worker в headless
    // часто не получает времени при virtual-time-budget, что приводит к вечному loader.
    const lite = typeof location !== "undefined"
      && new URLSearchParams(location.search).get("lite") === "1";
    let worker = null;
    if (typeof Worker !== "undefined" && !lite) {
      try {
        worker = new Worker(WORKER_URL.href, { type: "module" });
      } catch (e) {
        worker = null;
      }
    }

    if (worker) {
      state._worker = worker;
      state._mode = "worker";
      state._onReady = () => {}; // по умолчанию — no-op; app.js перезапишет реальным обработчиком
      state._onStep = () => {};
      state._terminated = false;
      const seedNum = hashSeed(opts.seed + ":rd");
      worker.onmessage = (e) => {
        if (state._terminated) return; // защита от сообщений, пришедших после terminate
        const msg = e.data;
        if (msg.type === "ready") {
          state.a0 = msg.a;
          state.b0 = msg.b;
          state._timings = msg.timings;
          state._ready = true;
          if (state._onReady) state._onReady(msg.timings);
        } else if (msg.type === "stepped") {
          state.a0 = msg.a;
          state.b0 = msg.b;
          state._busy = false;
          if (state._onStep) state._onStep();
        }
      };
      worker.onerror = (e) => {
        console.error("[rd-worker] error", e);
      };
      const t0 = performance.now();
      worker.postMessage({
        type: "warmup",
        SW, SH,
        seed: seedNum,
        steps: 4000,
        preset: opts.preset,
        presetTune: opts.presetTune,
      });
      state._kickoff = t0;
      // Возвращаемся сразу — main thread не блокируется. _ready станет true позже.
    } else {
      // Fallback: всё в main thread, как раньше.
      state._mode = "sync";
      const a0 = new Float32Array(SW * SH);
      const b0 = new Float32Array(SW * SH);
      const t0 = performance.now();
      // Local стартовая инициализация (как раньше).
      const rng = makeRng(opts.seed + ":rd");
      for (let i = 0; i < a0.length; i++) {
        a0[i] = 1 - rng() * 0.05;
        b0[i] = rng() * 0.05;
      }
      const seedCount = 18;
      for (let s = 0; s < seedCount; s++) {
        const cx = Math.floor(rngRange(rng, 0, SW));
        const cy = Math.floor(rngRange(rng, 0, SH));
        const r = 3 + Math.floor(rng() * 5);
        for (let y = Math.max(0, cy - r); y < Math.min(SH, cy + r); y++) {
          for (let x = Math.max(0, cx - r); x < Math.min(SW, cx + r); x++) {
            const dx = x - cx, dy = y - cy;
            if (dx * dx + dy * dy < r * r) {
              b0[y * SW + x] = 1;
              a0[y * SW + x] = 0;
            }
          }
        }
      }
      const basePreset = PRESETS[opts.preset] || PRESETS.coral;
      const warmupFeed = basePreset.feed + opts.presetTune * 5;
      const warmupKill = basePreset.kill + opts.presetTune * 5;
      state.a0 = a0;
      state.b0 = b0;
      state._timings = { total: +(performance.now() - t0).toFixed(1), syncFallback: true };
      // Синхронный warmup быстрый — не моделируем, реальный шаг не критичен.
      // Запустим 1000 шагов сразу, чтобы узор начал формироваться.
      syncStepMany(a0, b0, SW, SH, warmupFeed, warmupKill, 1000);
      state._ready = true;
    }
    return state;
  },

  paint(ctx, opts, state) {
    if (!state._ready) return false; // Worker ещё не вернул данные → ждём
    // В worker-режиме запускаем новые шаги
    if (state._mode === "worker") {
      if (!state._busy) {
        const preset = PRESETS[opts.preset] || PRESETS.coral;
        state._busy = true;
        state._worker.postMessage({
          type: "step",
          steps: Math.max(1, Math.round(opts.stepsPerFrame)),
          feed: preset.feed + (opts.presetTune || 0) * 5,
          kill: preset.kill + (opts.presetTune || 0) * 5,
        });
      }
      // Рисуем текущим буфером (последний ready или предыдущий step).
      const newOff = drawB(ctx, opts, state);
      return newOff; // даже false — renderState обновился. но обычно true.
    } else {
      // Синхронный путь: сами считаем шаги
      const preset = PRESETS[opts.preset] || PRESETS.coral;
      syncStepMany(state.a0, state.b0, state.SW, state.SH,
        preset.feed + (opts.presetTune || 0) * 5,
        preset.kill + (opts.presetTune || 0) * 5,
        Math.max(1, Math.round(opts.stepsPerFrame)));
      drawB(ctx, opts, state);
      return true;
    }
  },

  animate(ctx, opts, state, t) {
    // Reuse paint() — оно умеет и step, и draw.
    return this.paint(ctx, opts, state);
  },

  // При смене state: terminate старого Worker (вызывается из app.js).
  dispose(state) {
    if (state && state._worker) {
      state._terminated = true;
      try { state._worker.terminate(); } catch (e) { /* noop */ }
      state._worker = null;
    }
  },
};

function drawB(ctx, opts, state) {
  const SW = state.SW, SH = state.SH, cellSize = state.cellSize;
  const W = state.w, H = state.h;
  // ImageData в размере сима → upscale через drawImage.
  const img = ctx.createImageData(SW, SH);
  const data = img.data;
  const b = state.b0;
  const ramp = state._ramp = state._ramp || makeRamp(opts.palette.colors);
  const mix = clamp01(opts.colorMix);
  const contrast = opts.contrast;
  const brightness = opts.brightness;
  const palette = opts.palette;

  // Оптимизация: один пробег по пикселям.
  for (let y = 0; y < SH; y++) {
    for (let x = 0; x < SW; x++) {
      let v = b[y * SW + x];
      v = v * contrast + brightness;
      v = clamp01(v);
      const c = ramp(v);
      const m = PARSE_RGB.exec(c);
      const i = (y * SW + x) * 4;
      if (mix < 1) {
        data[i] = Math.round(+m[1] * mix + 128 * (1 - mix));
        data[i + 1] = Math.round(+m[2] * mix + 128 * (1 - mix));
        data[i + 2] = Math.round(+m[3] * mix + 128 * (1 - mix));
      } else {
        data[i] = +m[1]; data[i + 1] = +m[2]; data[i + 2] = +m[3];
      }
      data[i + 3] = 255;
    }
  }

  const off = scratchCanvas(SW, SH);
  off.getContext("2d").putImageData(img, 0, 0);
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  ctx.drawImage(off, 0, 0, SW, SH, 0, 0, W, H);
  return true;
}

// --- Sync fallback helpers ---

function syncStepMany(a, b, SW, SH, feed, kill, n) {
  const na = new Float32Array(SW * SH);
  const nb = new Float32Array(SW * SH);
  for (let s = 0; s < n; s++) {
    for (let y = 0; y < SH; y++) {
      const ym = (y === 0 ? SH - 1 : y - 1);
      const yp = (y === SH - 1 ? 0 : y + 1);
      const yW = y * SW;
      const ymW = ym * SW;
      const ypW = yp * SW;
      for (let x = 0; x < SW; x++) {
        const xm = (x === 0 ? SW - 1 : x - 1);
        const xp = (x === SW - 1 ? 0 : x + 1);
        const i = yW + x;
        const A = a[i]; const B = b[i];
        const lapA = a[yW + xm] + a[yW + xp] + a[ymW + x] + a[ypW + x] - 4 * A;
        const lapB = b[yW + xm] + b[yW + xp] + b[ymW + x] + b[ypW + x] - 4 * B;
        const r = A * B * B;
        // Da=0.2, Db=0.1 — см. комментарий в rd-worker.js про устойчивость схемы.
        na[i] = A + (0.2 * lapA - r + feed * (1 - A));
        nb[i] = B + (0.1 * lapB + r - (kill + feed) * B);
      }
    }
    for (let i = 0; i < a.length; i++) {
      let va = na[i], vb = nb[i];
      if (!Number.isFinite(va)) va = 1;
      if (!Number.isFinite(vb)) vb = 0;
      a[i] = va < 0 ? 0 : va > 1 ? 1 : va;
      b[i] = vb < 0 ? 0 : vb > 1 ? 1 : vb;
    }
  }
}

function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
const PARSE_RGB = /rgb\((\d+),(\d+),(\d+)\)/;
const SCRATCHES = new Map();
function scratchCanvas(w, h) {
  const key = `${w}x${h}`;
  let c = SCRATCHES.get(key);
  if (!c) { c = document.createElement("canvas"); SCRATCHES.set(key, c); }
  if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
  return c;
}
function makeRamp(colors) {
  const stops = colors.map(hexToRgb);
  return function ramp(t) {
    if (t <= 0) return rgbStr(stops[0]);
    if (t >= 1) return rgbStr(stops[stops.length - 1]);
    const n = stops.length - 1;
    const seg = t * n;
    const i = Math.floor(seg);
    const f = seg - i;
    const a = stops[i]; const b = stops[i + 1];
    const r = Math.round(a[0] + (b[0] - a[0]) * f);
    const g = Math.round(a[1] + (b[1] - a[1]) * f);
    const bl = Math.round(a[2] + (b[2] - a[2]) * f);
    return rgbStr([r, g, bl]);
  };
}
function rgbStr(a) { return `rgb(${a[0]},${a[1]},${a[2]})`; }
function hexToRgb(hex) {
  const h = hex.replace("#", "");
  const v = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
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

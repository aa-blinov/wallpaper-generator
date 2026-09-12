// Sorting — визуализация сортировки в 2D: горизонтальные полосы «значений» в каждый момент.

import { makeRng } from "../rng.js";
import { makeColorRamp } from "../palettes.js";

export const sorting = {
  id: "sorting",
  name: "Sorting Art",
  category: "Algorithms",
  blurb: "Sorting: each frame is a snapshot of an array mid-sort.",
  defaults: {
    width: 60,
    sortMode: "Bubble",
    bgTint: 0,
  },
  params: [
    { key: "width", label: "Array width", min: 10, max: 200, step: 5 },
    { key: "sortMode", label: "Algorithm", enum: ["Bubble", "Selection", "Insertion"] },
  ],

  createState(opts, w, h) {
    const rng = makeRng(opts.seed + ":sort");
    const ramp = makeColorRamp(opts.palette.colors);
    return { rng, ramp, w, h };
  },

  paint(ctx, opts, state) {
    const { w, h, rng, ramp } = state;
    const palette = opts.palette;
    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, w, h);

    const N = Math.round(opts.width);
    const arr = new Array(N);
    for (let i = 0; i < N; i++) arr[i] = rng();

    const history = [arr.slice()];
    if (opts.sortMode === "Bubble") {
      for (let pass = 0; pass < N; pass++) {
        for (let i = 0; i < N - 1 - pass; i++) {
          if (arr[i] > arr[i + 1]) { const t = arr[i]; arr[i] = arr[i + 1]; arr[i + 1] = t; }
          history.push(arr.slice());
        }
      }
    } else if (opts.sortMode === "Selection") {
      for (let i = 0; i < N - 1; i++) {
        let minJ = i;
        for (let j = i + 1; j < N; j++) {
          if (arr[j] < arr[minJ]) minJ = j;
          history.push(arr.slice());
        }
        const t = arr[i]; arr[i] = arr[minJ]; arr[minJ] = t;
        history.push(arr.slice());
      }
    } else {
      for (let i = 1; i < N; i++) {
        let j = i;
        while (j > 0 && arr[j - 1] > arr[j]) {
          const t = arr[j]; arr[j] = arr[j - 1]; arr[j - 1] = t;
          j--;
          history.push(arr.slice());
        }
      }
    }

    // Сколько кадров помещается в канвас по высоте
    const frameH = Math.max(2, Math.floor(h / Math.min(history.length, 600)));
    const maxFrames = Math.min(history.length, Math.floor(h / frameH));
    const idxs = Math.floor(history.length / maxFrames);
    for (let f = 0; f < maxFrames; f++) {
      const frame = history[f * idxs] || history[history.length - 1];
      const col = ramp(f / maxFrames);
      ctx.fillStyle = col;
      for (let i = 0; i < N; i++) {
        const barH = Math.max(1, frame[i] * frameH);
        ctx.fillRect(i * (w / N), h - (f + 1) * frameH + (frameH - barH), w / N, barH);
      }
    }

    if (opts.bgTint > 0) {
      ctx.fillStyle = `rgba(0,0,0,${opts.bgTint})`;
      ctx.fillRect(0, 0, w, h);
    }
  },
};

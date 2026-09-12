// Circuit — печатная плата: ортогональные проводники с «площадками» в узлах.

import { makeRng } from "../rng.js";
import { makeColorRamp } from "../palettes.js";

export const circuit = {
  id: "circuit",
  name: "Circuit Board",
  category: "Алгоритмы",
  blurb: "Печатная плата: ортогональные проводники и чипы.",
  defaults: {
    chips: 12,
    traces: 60,
    grid: 24,
    traceWidth: 1.5,
    bgTint: 0,
  },
  params: [
    { key: "chips", label: "Чипов", min: 4, max: 40, step: 1 },
    { key: "traces", label: "Проводников", min: 10, max: 200, step: 5 },
    { key: "grid", label: "Шаг сетки (px)", min: 10, max: 60, step: 1 },
    { key: "traceWidth", label: "Толщина", min: 0.5, max: 4, step: 0.1 },
  ],

  createState(opts, w, h) {
    const rng = makeRng(opts.seed + ":cir");
    const ramp = makeColorRamp(opts.palette.colors);
    const cols = Math.ceil(w / opts.grid) + 1;
    const rows = Math.ceil(h / opts.grid) + 1;
    const chips = [];
    const N = Math.round(opts.chips);
    for (let i = 0; i < N; i++) {
      const gx = Math.floor(rng() * cols);
      const gy = Math.floor(rng() * rows);
      const w0 = 1 + Math.floor(rng() * 3);
      const h0 = 1 + Math.floor(rng() * 3);
      chips.push({ gx, gy, w: w0, h: h0 });
    }
    return { rng, ramp, cols, rows, chips, w, h };
  },

  paint(ctx, opts, state) {
    const { w, h, ramp, cols, rows, chips } = state;
    const palette = opts.palette;
    const fg = palette.colors[palette.colors.length - 1];
    const accent = palette.colors[Math.floor(palette.colors.length / 2)];
    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, w, h);

    const grid = opts.grid;
    ctx.lineWidth = opts.traceWidth;
    ctx.lineCap = "square";

    // Контактные площадки чипов
    ctx.fillStyle = accent;
    for (const c of chips) {
      const cx = c.gx * grid, cy = c.gy * grid;
      ctx.fillRect(cx, cy, c.w * grid, c.h * grid);
    }

    // Проводники
    for (let i = 0; i < chips.length - 1; i++) {
      const ni = i + (i % 2 === 0 ? 1 : chips.length - 1);
      if (ni >= chips.length) continue;
      const a = chips[i], b = chips[ni];
      const ax = a.gx * grid + a.w * grid / 2;
      const ay = a.gy * grid + a.h * grid / 2;
      const bx = b.gx * grid + b.w * grid / 2;
      const by = b.gy * grid + b.h * grid / 2;
      ctx.strokeStyle = fg;
      ctx.beginPath();
      ctx.moveTo(Math.round(ax / grid) * grid, Math.round(ay / grid) * grid);
      ctx.lineTo(Math.round(bx / grid) * grid, Math.round(ay / grid) * grid);
      ctx.lineTo(Math.round(bx / grid) * grid, Math.round(by / grid) * grid);
      ctx.stroke();
    }

    // Дополнительные случайные проводники
    const T = Math.min(120, Math.round(opts.traces));
    for (let i = 0; i < T; i++) {
      ctx.strokeStyle = ramp(0.4 + Math.random() * 0.6);
      let x = Math.floor(Math.random() * cols) * grid;
      let y = Math.floor(Math.random() * rows) * grid;
      ctx.beginPath();
      ctx.moveTo(x, y);
      const segs = 4 + Math.floor(Math.random() * 6);
      for (let s = 0; s < segs; s++) {
        if (Math.random() < 0.5) x += grid * (Math.random() < 0.5 ? -1 : 1);
        else y += grid * (Math.random() < 0.5 ? -1 : 1);
        ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    if (opts.bgTint > 0) {
      ctx.fillStyle = `rgba(0,0,0,${opts.bgTint})`;
      ctx.fillRect(0, 0, w, h);
    }
  },
};

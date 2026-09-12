// Orbital Trails — орбитальные трассы: длинные кривые с циклическим возвратом.

import { makeRng } from "../rng.js";
import { makeColorRamp } from "../palettes.js";

export const orbital = {
  id: "orbital",
  name: "Orbital Trails",
  category: "Точки",
  blurb: "Орбитальные трассы: следы из частиц, летящих по гладким петлям.",
  defaults: {
    trails: 14,
    length: 200,
    samples: 800,
    strokeWidth: 1.0,
    bgTint: 0,
  },
  params: [
    { key: "trails", label: "Трасс", min: 2, max: 60, step: 1 },
    { key: "length", label: "Длина следа (точек)", min: 50, max: 1200, step: 50 },
    { key: "samples", label: "Точек кривой", min: 200, max: 4000, step: 100 },
    { key: "strokeWidth", label: "Толщина", min: 0.3, max: 4, step: 0.1 },
  ],

  createState(opts, w, h) {
    const rng = makeRng(opts.seed + ":orbital");
    const ramp = makeColorRamp(opts.palette.colors);
    return { rng, ramp, w, h };
  },

  paint(ctx, opts, state) {
    const { w, h, rng, ramp } = state;
    const palette = opts.palette;
    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, w, h);
    const N = Math.max(1, Math.round(opts.trails));
    const samples = Math.round(opts.samples);
    const length = Math.round(opts.length);
    ctx.lineCap = "round";
    ctx.lineWidth = opts.strokeWidth;

    for (let i = 0; i < N; i++) {
      // Параметры Лиссажу для каждой трассы
      const a = 1 + Math.floor(rng() * 4);
      const b = 1 + Math.floor(rng() * 4);
      const delta = rng() * Math.PI * 2;
      const speed = 0.5 + rng() * 1.5;
      const offX = rng() * w;
      const offY = rng() * h;
      const ampX = (0.1 + rng() * 0.2) * w;
      const ampY = (0.1 + rng() * 0.2) * h;

      // Соберём позиции за один полный цикл
      const pts = new Array(samples);
      for (let s = 0; s < samples; s++) {
        const t = (s / samples) * Math.PI * 2;
        pts[s] = [
          offX + ampX * Math.sin(a * t + delta),
          offY + ampY * Math.sin(b * t),
        ];
      }
      // Бегущая точка, оставляющая след длиной opts.length
      let pos = 0;
      let vel = speed;
      ctx.strokeStyle = ramp(rng());
      ctx.beginPath();
      const pts2 = [];
      for (let j = 0; j < length; j++) {
        const idx = Math.floor(pos) % samples;
        pts2.push(pts[idx]);
        pos += vel;
      }
      ctx.moveTo(pts2[0][0], pts2[0][1]);
      for (let j = 1; j < pts2.length; j++) ctx.lineTo(pts2[j][0], pts2[j][1]);
      ctx.stroke();
    }

    if (opts.bgTint > 0) {
      ctx.fillStyle = `rgba(0,0,0,${opts.bgTint})`;
      ctx.fillRect(0, 0, w, h);
    }
  },
};

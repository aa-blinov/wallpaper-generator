// Wave Field — поле синусоид с разными частотами: y-scale distortion.

import { makeNoise2D } from "../noise.js";
import { makeColorRamp } from "../palettes.js";

export const wave_field = {
  id: "wave_field",
  name: "Wave Field",
  category: "Organic",
  blurb: "Wave field: top and bottom edges from two different sine waves.",
  defaults: {
    rows: 80,
    ampTop: 0.3,
    ampBot: 0.5,
    freqTop: 0.08,
    freqBot: 0.05,
    bgTint: 0,
  },
  params: [
    { key: "rows", label: "Lines", min: 20, max: 300, step: 5 },
    { key: "ampTop", label: "Top amplitude", min: 0, max: 1, step: 0.02 },
    { key: "ampBot", label: "Bottom amplitude", min: 0, max: 1, step: 0.02 },
    { key: "freqTop", label: "Top frequency", min: 0.01, max: 0.2, step: 0.005 },
    { key: "freqBot", label: "Bottom frequency", min: 0.01, max: 0.2, step: 0.005 },
  ],

  createState(opts, w, h) {
    const ramp = makeColorRamp(opts.palette.colors);
    return { ramp, w, h };
  },

  paint(ctx, opts, state) {
    const { w, h, ramp } = state;
    const palette = opts.palette;
    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, w, h);

    const rows = Math.max(2, Math.round(opts.rows));
    const ampTop = opts.ampTop * h / 2;
    const ampBot = opts.ampBot * h / 2;
    const freqTop = opts.freqTop;
    const freqBot = opts.freqBot;
    ctx.lineWidth = Math.max(0.5, h / rows / 2);

    for (let i = 0; i < rows; i++) {
      const t = i / rows;
      const baseY = t * h;
      ctx.strokeStyle = ramp(t);
      ctx.beginPath();
      for (let x = 0; x <= w; x += 2) {
        const phase = i * 0.3;
        // Линейная интерполяция: top-синусоида доминирует у t=0, bottom — у t=1.
        const yt = baseY + Math.sin(x * freqTop + phase) * ampTop * (1 - t);
        const yb = baseY + Math.sin(x * freqBot + phase + 1.5) * ampBot * t;
        const y = yt * (1 - t) + yb * t;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }

    if (opts.bgTint > 0) {
      ctx.fillStyle = `rgba(0,0,0,${opts.bgTint})`;
      ctx.fillRect(0, 0, w, h);
    }
  },
};

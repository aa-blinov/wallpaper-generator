// Asemic Writing — генеративная "calligraphy": случайные плавные штрихи,
// напоминающие арабскую вязь или рунические письмена. Медитативные
// (нечитаемые) символы.

import { makeRng } from "../rng.js";
import { makeColorRamp } from "../palettes.js";

export const asemic = {
  id: "asemic",
  name: "Asemic Writing",
  category: "Organic",
  blurb: "Generative calligraphy — flowing, unreadable strokes.",
  defaults: {
    columns: 12,
    strokesPerGlyph: 4,
    columnSpacing: 1.15, // доля от высоты
    baselineJitter: 0.18,
    strokeWidth: 5,
    strokeSoftness: 1.0,
    randomness: 0.45,
    colorMode: "by-column",  // "by-column" | "single" | "by-shape"
    bgTint: 0.0,
  },
  params: [
    { key: "columns", label: "Columns", min: 3, max: 40, step: 1 },
    { key: "strokesPerGlyph", label: "Strokes per glyph", min: 1, max: 12, step: 1 },
    { key: "columnSpacing", label: "Column spacing", min: 0.6, max: 2.5, step: 0.05 },
    { key: "baselineJitter", label: "Baseline jitter", min: 0, max: 0.6, step: 0.02 },
    { key: "strokeWidth", label: "Stroke thickness", min: 0.5, max: 20, step: 0.5 },
    { key: "strokeSoftness", label: "Softness", min: 0.3, max: 3, step: 0.1 },
    { key: "randomness", label: "Randomness amount", min: 0, max: 1, step: 0.02 },
    { key: "colorMode", label: "Color", enum: ["by-column", "single", "by-shape"] },
    { key: "bgTint", label: "Blend with background", min: 0, max: 1, step: 0.02 },
  ],

  createState(opts, w, h) {
    const rng = makeRng(opts.seed + ":ase");
    const ramp = makeColorRamp(opts.palette.colors);
    return { rng, ramp, w, h };
  },

  paint(ctx, opts, state) {
    const { w, h, rng, ramp } = state;
    const palette = opts.palette;
    const cols = Math.max(2, Math.round(opts.columns));
    const strokesPer = Math.max(1, Math.round(opts.strokesPerGlyph));
    const colSpacing = Math.min(w, h) / cols * opts.columnSpacing;
    const baselineJitter = opts.baselineJitter;
    const randomness = opts.randomness;
    const strokeW = opts.strokeWidth;
    const colorMode = opts.colorMode;

    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, w, h);

    ctx.lineWidth = strokeW;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";

    const colW = colSpacing;
    for (let c = 0; c < cols; c++) {
      const baseColor = colorMode === "single" ? ramp(0.6) :
                         colorMode === "by-column" ? ramp(c / Math.max(1, cols - 1)) :
                         ramp(rng());
      ctx.strokeStyle = baseColor;

      const colX = (c + 0.5) * colW + (rng() - 0.5) * baselineJitter * colW;
      const rowH = h / Math.max(1, Math.floor(h / (colW * 0.9)));
      // Проходим по строкам в колонке сверху вниз.
      for (let row = 0; row < Math.ceil(h / rowH); row++) {
        const cy = (row + 0.5) * rowH + (rng() - 0.5) * baselineJitter * rowH;
        // Каждая строка — набор штрихов (глиф).
        for (let s = 0; s < strokesPer; s++) {
          ctx.beginPath();
          // Штрих: 4-7 точек, плавная кривая (кубический Безье-аналог через 2-ю производную).
          const points = [];
          const segCount = 5 + ((rng() * 5) | 0);
          let cx = colX + (rng() - 0.5) * colW * 0.4;
          let cyy = cy + (rng() - 0.5) * rowH * 0.4;
          points.push({ x: cx, y: cyy });
          for (let k = 1; k <= segCount; k++) {
            cx += (rng() - 0.5) * colW * 0.5 * randomness * 2;
            cyy += (rng() - 0.5) * rowH * 0.4 * randomness * 2;
            points.push({ x: cx, y: cyy });
          }
          ctx.moveTo(points[0].x, points[0].y);
          for (let k = 1; k < points.length; k++) {
            const prev = points[k - 1];
            const cur = points[k];
            const mx = (prev.x + cur.x) / 2;
            const my = (prev.y + cur.y) / 2;
            ctx.quadraticCurveTo(prev.x, prev.y, mx, my);
          }
          ctx.stroke();
        }
      }
    }

    if (opts.bgTint > 0) {
      ctx.fillStyle = `rgba(0,0,0,${opts.bgTint})`;
      ctx.fillRect(0, 0, w, h);
    }
  },

  animate(ctx, opts, state, _t) {
    state.rng = makeRng(`${opts.seed}:t${(_t * 0.001) | 0}`);
    this.paint(ctx, opts, state);
  },
};

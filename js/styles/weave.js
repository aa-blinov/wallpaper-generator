// Weave — плетение: горизонтальные и вертикальные нити, переплетённые с
// поправкой освещения «сверху-слева».

import { makeColorRamp } from "../palettes.js";

export const weave = {
  id: "weave",
  name: "Weave",
  category: "Текстуры",
  blurb: "Переплетение горизонтальных и вертикальных нитей.",
  defaults: {
    threads: 18,
    thickness: 0.7,
    shadow: 0.45,
    paletteMode: "Полосатый",
    bgTint: 0,
  },
  params: [
    { key: "threads", label: "Число нитей", min: 4, max: 60, step: 1 },
    { key: "thickness", label: "Толщина", min: 0.3, max: 1.4, step: 0.05 },
    { key: "shadow", label: "Тень", min: 0, max: 1, step: 0.02 },
    { key: "paletteMode", label: "Цвет нитей", enum: ["Полосатый", "Один"] },
  ],

  createState(opts, w, h) {
    const ramp = makeColorRamp(opts.palette.colors);
    return { ramp, w, h };
  },

  paint(ctx, opts, state) {
    const { w, h, ramp } = state;
    const palette = opts.palette;
    const N = Math.max(2, Math.round(opts.threads));
    const cellW = w / N, cellH = h / N;
    const fw = cellW * opts.thickness;
    const fh = cellH * opts.thickness;
    const shadow = opts.shadow;

    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, w, h);

    // Определяем, какая нить проходит сверху по формуле (i+j)%2 == 0 ⇒ горизонталь.
    for (let j = 0; j < N; j++) {
      for (let i = 0; i < N; i++) {
        const horizOnTop = ((i + j) & 1) === 0;
        const x = i * cellW, y = j * cellH;
        // Горизонтальная нить
        const horizColor = opts.paletteMode === "Полосатый" ? ramp(j / Math.max(1, N - 1)) : palette.colors[palette.colors.length - 1];
        const vertColor = opts.paletteMode === "Полосатый" ? ramp(i / Math.max(1, N - 1)) : palette.colors[1] || palette.colors[0];
        if (horizOnTop) {
          // Сначала вертикаль, потом горизонталь сверху
          ctx.fillStyle = shade(vertColor, -shadow * 0.4);
          ctx.fillRect(x + (cellW - fw) / 2, y, fw, cellH);
          ctx.fillStyle = horizColor;
          ctx.fillRect(x, y + (cellH - fh) / 2, cellW, fh);
          // Тень от горизонтальной
          ctx.fillStyle = `rgba(0,0,0,${shadow * 0.5})`;
          ctx.fillRect(x, y + (cellH - fh) / 2 + fh * 0.85, cellW, fh * 0.15);
        } else {
          ctx.fillStyle = horizColor;
          ctx.fillRect(x, y + (cellH - fh) / 2, cellW, fh);
          ctx.fillStyle = shade(vertColor, -shadow * 0.4);
          ctx.fillRect(x + (cellW - fw) / 2, y, fw, cellH);
          // Тень от вертикальной
          ctx.fillStyle = `rgba(0,0,0,${shadow * 0.5})`;
          ctx.fillRect(x + (cellW - fw) / 2 + fw * 0.85, y, fw * 0.15, cellH);
        }
      }
    }

    if (opts.bgTint > 0) {
      ctx.fillStyle = `rgba(0,0,0,${opts.bgTint})`;
      ctx.fillRect(0, 0, w, h);
    }
  },
};

function shade(rgb, k) {
  // k ∈ [-1, 1]. rgb = "rgb(r,g,b)"
  const m = /rgb\((\d+),(\d+),(\d+)\)/.exec(rgb);
  if (!m) return rgb;
  const r = +m[1], g = +m[2], b = +m[3];
  const mul = k < 0 ? 1 + k : 1 - k * 0.7;
  const add = k > 0 ? k * 60 : 0;
  return `rgb(${clamp255(r * mul + add)},${clamp255(g * mul + add)},${clamp255(b * mul + add)})`;
}
function clamp255(v) { return Math.max(0, Math.min(255, v | 0)); }

// Porthole — иллюминаторы: тесселяция шестиугольная или квадратная, в каждой
// ячейке концентрические круги + блик.

import { makeColorRamp } from "../palettes.js";

export const porthole = {
  id: "porthole",
  name: "Portholes",
  category: "Textures",
  blurb: "A grid of portholes: concentric circles with a highlight.",
  defaults: {
    tileMode: "Square",
    size: 100,
    rings: 5,
    highlight: 0.7,
    bgTint: 0,
  },
  params: [
    { key: "tileMode", label: "Tiling", enum: ["Square", "Hexagonal"] },
    { key: "size", label: "Cell size", min: 40, max: 220, step: 5 },
    { key: "rings", label: "Rings", min: 2, max: 12, step: 1 },
    { key: "highlight", label: "Highlight strength", min: 0, max: 1.5, step: 0.02 },
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

    const rings = Math.max(2, Math.round(opts.rings));

    if (opts.tileMode === "Hexagonal") {
      drawHexGrid(ctx, opts, w, h, rings, ramp, palette);
    } else {
      drawSquareGrid(ctx, opts, w, h, rings, ramp, palette);
    }

    if (opts.bgTint > 0) {
      ctx.fillStyle = `rgba(0,0,0,${opts.bgTint})`;
      ctx.fillRect(0, 0, w, h);
    }
  },
};

function drawSquareGrid(ctx, opts, w, h, rings, ramp, palette) {
  const cell = opts.size;
  const cols = Math.ceil(w / cell) + 1;
  const rows = Math.ceil(h / cell) + 1;
  const fg = palette.colors[palette.colors.length - 1];
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const cx = i * cell + cell / 2, cy = j * cell + cell / 2;
      const r = cell * 0.46;
      // Концентрические кольца
      for (let k = rings; k >= 1; k--) {
        const f = k / rings;
        ctx.fillStyle = ramp((1 - f) * 0.95);
        ctx.beginPath();
        ctx.arc(cx, cy, r * f, 0, Math.PI * 2);
        ctx.fill();
      }
      // Контур и блик
      ctx.strokeStyle = ramp(0);
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.stroke();
      // Блик
      if (opts.highlight > 0) {
        ctx.fillStyle = `rgba(255,255,255,${opts.highlight * 0.5})`;
        ctx.beginPath();
        ctx.ellipse(cx - r * 0.35, cy - r * 0.45, r * 0.3, r * 0.18, -Math.PI / 5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}

function drawHexGrid(ctx, opts, w, h, rings, ramp, palette) {
  const cell = opts.size;
  const r = cell * 0.5;
  const hexH = r * Math.sqrt(3);
  const cols = Math.ceil(w / (r * 1.5)) + 1;
  const rows = Math.ceil(h / hexH) + 1;
  for (let j = 0; j < rows; j++) {
    for (let i = 0; i < cols; i++) {
      const cx = i * r * 1.5;
      const cy = j * hexH + ((i & 1) ? hexH / 2 : 0);
      // Вписываем круг в шестиугольник со стороной r: радиус описанной = r
      const rad = r * 0.85;
      for (let k = rings; k >= 1; k--) {
        const f = k / rings;
        ctx.fillStyle = ramp((1 - f) * 0.95);
        ctx.beginPath();
        ctx.arc(cx, cy, rad * f, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.strokeStyle = ramp(0);
      ctx.lineWidth = 1.0;
      ctx.beginPath();
      ctx.arc(cx, cy, rad, 0, Math.PI * 2);
      ctx.stroke();
      if (opts.highlight > 0) {
        ctx.fillStyle = `rgba(255,255,255,${opts.highlight * 0.5})`;
        ctx.beginPath();
        ctx.ellipse(cx - rad * 0.35, cy - rad * 0.45, rad * 0.3, rad * 0.18, -Math.PI / 5, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }
}

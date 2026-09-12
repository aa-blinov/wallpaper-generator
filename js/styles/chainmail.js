// Chainmail — кольчуга: кольца, переплетённые в шахматном порядке.

export const chainmail = {
  id: "chainmail",
  name: "Chainmail",
  category: "Текстуры",
  blurb: "Кольчуга: кольца в шахматном порядке с градиентами.",
  defaults: {
    ringR: 22,
    strokeWidth: 3,
    paletteMode: "Металл",
    bgTint: 0,
  },
  params: [
    { key: "ringR", label: "Радиус кольца", min: 8, max: 60, step: 1 },
    { key: "strokeWidth", label: "Толщина", min: 1, max: 10, step: 0.5 },
    { key: "paletteMode", label: "Цвет", enum: ["Металл", "Палитра"] },
  ],

  createState(opts, w, h) {
    return { w, h };
  },

  paint(ctx, opts, state) {
    const { w, h } = state;
    const palette = opts.palette;
    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, w, h);
    const r = opts.ringR;
    const dx = r * 1.0, dy = r * Math.sqrt(3) * 0.5;
    const cols = Math.ceil(w / dx) + 2;
    const rows = Math.ceil(h / dy) + 2;
    ctx.lineWidth = opts.strokeWidth;
    const cols_p = palette.colors;

    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        const cx = i * dx + (j & 1) * dx / 2;
        const cy = j * dy;
        const baseColor = opts.paletteMode === "Металл"
          ? cols_p[(i + j) % cols_p.length]
          : cols_p[(i * j + i + j) % cols_p.length];
        // Простой градиент с иллюзией блика
        const grd = ctx.createRadialGradient(cx - r * 0.4, cy - r * 0.4, r * 0.1, cx, cy, r);
        grd.addColorStop(0, lighten(baseColor, 0.4));
        grd.addColorStop(0.5, baseColor);
        grd.addColorStop(1, darken(baseColor, 0.4));
        ctx.strokeStyle = grd;
        ctx.beginPath();
        ctx.arc(cx, cy, r * 0.85, 0, Math.PI * 2);
        ctx.stroke();
      }
    }

    if (opts.bgTint > 0) {
      ctx.fillStyle = `rgba(0,0,0,${opts.bgTint})`;
      ctx.fillRect(0, 0, w, h);
    }
  },
};

function lighten(rgb, k) {
  const m = /rgb\((\d+),(\d+),(\d+)\)/.exec(rgb);
  if (!m) return rgb;
  return `rgb(${Math.min(255, +m[1] + 200 * k) | 0},${Math.min(255, +m[2] + 200 * k) | 0},${Math.min(255, +m[3] + 200 * k) | 0})`;
}
function darken(rgb, k) {
  const m = /rgb\((\d+),(\d+),(\d+)\)/.exec(rgb);
  if (!m) return rgb;
  return `rgb(${Math.max(0, +m[1] * (1 - k)) | 0},${Math.max(0, +m[2] * (1 - k)) | 0},${Math.max(0, +m[3] * (1 - k)) | 0})`;
}

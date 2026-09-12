// Honeycomb 3D — псевдо-3D пчелиные соты с освещением сверху-слева.

export const honeycomb3d = {
  id: "honeycomb3d",
  name: "Honeycomb 3D",
  category: "Textures",
  blurb: "Pseudo-3D honeycomb: each hexagon shaded with a gradient and shadow.",
  defaults: {
    cellSize: 50,
    light: 0.7,
    bgTint: 0,
  },
  params: [
    { key: "cellSize", label: "Cell size", min: 20, max: 120, step: 2 },
    { key: "light", label: "Lighting", min: 0, max: 1.5, step: 0.02 },
  ],

  createState(opts, w, h) {
    return { w, h };
  },

  paint(ctx, opts, state) {
    const { w, h } = state;
    const palette = opts.palette;
    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, w, h);
    const cell = opts.cellSize;
    const hexH = cell * Math.sqrt(3) / 2;
    const cols = Math.ceil(w / (cell * 1.5)) + 2;
    const rows = Math.ceil(h / hexH) + 2;
    const cols_p = palette.colors;

    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        const cx = i * cell * 1.5;
        const cy = j * hexH + ((i & 1) ? hexH / 2 : 0);
        const r = cell * 0.5;
        const c = cols_p[(i + j) % cols_p.length];
        const grd = ctx.createRadialGradient(cx - r * 0.4, cy - r * 0.4, r * 0.1, cx, cy, r);
        grd.addColorStop(0, lighten(c, opts.light * 0.6));
        grd.addColorStop(1, darken(c, opts.light * 0.4));
        ctx.fillStyle = grd;
        ctx.beginPath();
        for (let k = 0; k < 6; k++) {
          const a = (k / 6) * Math.PI * 2 + Math.PI / 6;
          const x = cx + r * Math.cos(a);
          const y = cy + r * Math.sin(a);
          if (k === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.fill();
        ctx.strokeStyle = palette.colors[0];
        ctx.lineWidth = 0.8;
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

// Moiré — two identical grids (concentric rings, or parallel lines at a
// slight angle) overlaid; the interference between their spacings produces
// the classic moiré fringes without any special blending trick.

export const moire = {
  id: "moire",
  name: "Moiré Interference",
  category: "Geometry",
  blurb: "Two overlaid grids beat against each other — pure line-density interference.",
  defaults: {
    pattern: "Circles",
    spacing: 14,
    offset: 90,
    angle: 8,
    lineWidth: 1,
    bgTint: 0,
  },
  params: [
    { key: "pattern", label: "Pattern", enum: ["Circles", "Lines"] },
    { key: "spacing", label: "Spacing (px)", min: 4, max: 40, step: 1 },
    { key: "offset", label: "Offset (px)", min: 0, max: 300, step: 5 },
    { key: "angle", label: "Angle (°)", min: 0, max: 45, step: 0.5 },
    { key: "lineWidth", label: "Line width", min: 0.3, max: 3, step: 0.1 },
  ],

  createState(opts, w, h) {
    return { w, h };
  },

  paint(ctx, opts, state) {
    const { w, h } = state;
    const palette = opts.palette;
    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, w, h);

    const colors = palette.colors;
    ctx.lineWidth = opts.lineWidth;
    const spacing = opts.spacing;

    if (opts.pattern === "Circles") {
      const cx = w / 2, cy = h / 2;
      const maxR = Math.hypot(w, h) * 0.6;
      ctx.strokeStyle = colors[colors.length - 1];
      for (let r = spacing; r < maxR; r += spacing) {
        ctx.beginPath();
        ctx.arc(cx - opts.offset / 2, cy, r, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.strokeStyle = colors[Math.floor(colors.length / 2)];
      for (let r = spacing; r < maxR; r += spacing) {
        ctx.beginPath();
        ctx.arc(cx + opts.offset / 2, cy, r, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else {
      const diag = Math.hypot(w, h);
      ctx.strokeStyle = colors[colors.length - 1];
      for (let y = -diag; y < diag; y += spacing) {
        ctx.beginPath();
        ctx.moveTo(-diag, y);
        ctx.lineTo(diag, y);
        ctx.stroke();
      }
      ctx.save();
      ctx.translate(w / 2 + opts.offset - w / 2, h / 2);
      ctx.rotate((opts.angle * Math.PI) / 180);
      ctx.translate(-w / 2, -h / 2);
      ctx.strokeStyle = colors[Math.floor(colors.length / 2)];
      for (let y = -diag; y < diag; y += spacing) {
        ctx.beginPath();
        ctx.moveTo(-diag, y);
        ctx.lineTo(diag, y);
        ctx.stroke();
      }
      ctx.restore();
    }

    if (opts.bgTint > 0) {
      ctx.fillStyle = `rgba(0,0,0,${opts.bgTint})`;
      ctx.fillRect(0, 0, w, h);
    }
  },
};

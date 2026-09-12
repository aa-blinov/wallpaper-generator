// Archimedean Spiral — классическая спираль Архимеда: r = a + b * theta.
// Плюс 1-2 дублирующие копии для плотности.

export const archimedes = {
  id: "archimedes",
  name: "Archimedean Spiral",
  category: "Geometry",
  blurb: "Archimedean spiral r = a + b·θ with several arms.",
  defaults: {
    turns: 6,
    copies: 5,
    spacing: 18,
    strokeWidth: 0.8,
    bgTint: 0,
  },
  params: [
    { key: "turns", label: "Revolutions", min: 1, max: 20, step: 0.5 },
    { key: "copies", label: "Copies around circle", min: 1, max: 16, step: 1 },
    { key: "spacing", label: "Step (px)", min: 4, max: 60, step: 1 },
    { key: "strokeWidth", label: "Thickness", min: 0.2, max: 4, step: 0.1 },
  ],

  createState(opts, w, h) {
    return { w, h };
  },

  paint(ctx, opts, state) {
    const { w, h } = state;
    const palette = opts.palette;
    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, w, h);

    const cx = w / 2, cy = h / 2;
    const turns = opts.turns;
    const copies = Math.max(1, Math.round(opts.copies));
    const spacing = opts.spacing;
    const fg = palette.colors[palette.colors.length - 1];

    // Точек хватает: 200 на оборот.
    const samples = Math.max(400, Math.round(200 * turns));
    const rMax = Math.min(w, h) * 0.46;
    ctx.lineWidth = opts.strokeWidth;
    ctx.lineCap = "round";

    ctx.strokeStyle = fg;
    for (let c = 0; c < copies; c++) {
      const phi0 = (c / copies) * Math.PI * 2;
      ctx.beginPath();
      for (let i = 0; i <= samples; i++) {
        const t = (i / samples) * turns * Math.PI * 2;
        const r = (spacing / Math.PI) * t;
        const rr = Math.min(r, rMax);
        const x = cx + rr * Math.cos(t + phi0);
        const y = cy + rr * Math.sin(t + phi0);
        if (i === 0) ctx.moveTo(x, y);
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

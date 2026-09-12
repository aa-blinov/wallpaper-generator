// Spring — спиральные пружины в 2D: sin*cos на кривой Безье или «змейка».

export const spring = {
  id: "spring",
  name: "Spring",
  category: "Геометрия",
  blurb: "Пружина: синусоидальная лента между двумя точками.",
  defaults: {
    coils: 14,
    sway: 0,
    strokeWidth: 1.6,
    bgTint: 0,
  },
  params: [
    { key: "coils", label: "Витков", min: 3, max: 60, step: 1 },
    { key: "sway", label: "Изгиб", min: -1, max: 1, step: 0.02 },
    { key: "strokeWidth", label: "Толщина", min: 0.4, max: 5, step: 0.1 },
  ],

  createState(opts, w, h) {
    return { w, h };
  },

  paint(ctx, opts, state) {
    const { w, h } = state;
    const palette = opts.palette;
    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, w, h);

    const fg = palette.colors[palette.colors.length - 1];
    ctx.strokeStyle = fg;
    ctx.lineWidth = opts.strokeWidth;
    ctx.lineCap = "round";

    const coils = Math.round(opts.coils);
    const x1 = w * 0.1, y1 = h * 0.5;
    const x2 = w * 0.9, y2 = h * 0.5;
    const amp = h * 0.18;
    const samples = Math.max(100, coils * 30);
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    for (let i = 1; i < samples; i++) {
      const t = i / samples;
      const x = x1 + (x2 - x1) * t;
      const wave = Math.sin(t * coils * Math.PI * 2) * amp;
      const swayY = opts.sway * Math.sin(t * Math.PI) * amp * 1.5;
      ctx.lineTo(x, y1 + wave + swayY);
    }
    ctx.lineTo(x2, y2);
    ctx.stroke();

    if (opts.bgTint > 0) {
      ctx.fillStyle = `rgba(0,0,0,${opts.bgTint})`;
      ctx.fillRect(0, 0, w, h);
    }
  },
};

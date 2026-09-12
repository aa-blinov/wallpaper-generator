// Spring — спиральные пружины в 2D: sin*cos на кривой Безье или «змейка».

export const spring = {
  id: "spring",
  name: "Spring",
  category: "Geometry",
  blurb: "Spring: a sinusoidal ribbon between two points.",
  defaults: {
    coils: 14,
    sway: 0,
    strokeWidth: 1.6,
    bgTint: 0,
  },
  params: [
    { key: "coils", label: "Turns", min: 3, max: 60, step: 1 },
    { key: "sway", label: "Bend", min: -1, max: 1, step: 0.02 },
    { key: "strokeWidth", label: "Thickness", min: 0.4, max: 5, step: 0.1 },
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
    ctx.lineWidth = opts.strokeWidth;
    ctx.lineCap = "round";

    // Один провод посередине оставлял верх/низ кадра пустыми — теперь
    // стопка пружин на всю высоту, с небольшим сдвигом фазы/цвета за ряд.
    const coils = Math.round(opts.coils);
    const rows = Math.max(1, Math.round(h / (h * 0.14)));
    const rowH = h / rows;
    const x1 = w * 0.06, x2 = w * 0.94;
    const amp = rowH * 0.36;
    const samples = Math.max(100, coils * 30);

    for (let r = 0; r < rows; r++) {
      const y1 = rowH * (r + 0.5);
      ctx.strokeStyle = colors[r % colors.length];
      const phase = (r * 0.6) % (Math.PI * 2);
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      for (let i = 1; i < samples; i++) {
        const t = i / samples;
        const x = x1 + (x2 - x1) * t;
        const wave = Math.sin(t * coils * Math.PI * 2 + phase) * amp;
        const swayY = opts.sway * Math.sin(t * Math.PI) * amp * 1.5;
        ctx.lineTo(x, y1 + wave + swayY);
      }
      ctx.lineTo(x2, y1);
      ctx.stroke();
    }

    if (opts.bgTint > 0) {
      ctx.fillStyle = `rgba(0,0,0,${opts.bgTint})`;
      ctx.fillRect(0, 0, w, h);
    }
  },
};

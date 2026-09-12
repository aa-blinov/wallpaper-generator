// Lissajous — кривые Лиссажу: x=A*sin(a*t+δ), y=B*sin(b*t).
// Сложение двух гармоник с разными частотами и фазами.

export const lissajous = {
  id: "lissajous",
  name: "Lissajous",
  category: "Geometry",
  blurb: "Lissajous curves — parametric figures from two sine waves.",
  defaults: {
    a: 3,
    b: 4,
    delta: Math.PI / 2,
    samples: 6000,
    strokeWidth: 1.0,
    ampX: 0.95,
    ampY: 0.95,
    bgTint: 0,
  },
  params: [
    { key: "a", label: "Frequency X", min: 1, max: 12, step: 1 },
    { key: "b", label: "Frequency Y", min: 1, max: 12, step: 1 },
    { key: "delta", label: "Phase (°)", min: 0, max: 360, step: 1, format: (v) => `${v.toFixed(0)}°` },
    { key: "samples", label: "Point count", min: 500, max: 30000, step: 100 },
    { key: "strokeWidth", label: "Thickness", min: 0.2, max: 5, step: 0.1 },
    { key: "ampX", label: "Amplitude X", min: 0.3, max: 1.0, step: 0.02 },
    { key: "ampY", label: "Amplitude Y", min: 0.3, max: 1.0, step: 0.02 },
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
    const ax = w * 0.45 * opts.ampX;
    const ay = h * 0.45 * opts.ampY;
    const a = Math.round(opts.a), b = Math.round(opts.b);
    const delta = opts.delta * Math.PI / 180;
    const samples = Math.round(opts.samples);

    ctx.strokeStyle = palette.colors[palette.colors.length - 1];
    ctx.lineWidth = opts.strokeWidth;
    ctx.beginPath();
    for (let i = 0; i <= samples; i++) {
      const t = (i / samples) * Math.PI * 2;
      const x = cx + ax * Math.sin(a * t + delta);
      const y = cy + ay * Math.sin(b * t);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.stroke();

    if (opts.bgTint > 0) {
      ctx.fillStyle = `rgba(0,0,0,${opts.bgTint})`;
      ctx.fillRect(0, 0, w, h);
    }
  },
};
// Polar Rose — роза Леонарда: r = cos(k * theta).
// При рациональном k получается замкнутая фигура с k лепестками (если k нечётное) или 2k (если чётное).

export const polarrose = {
  id: "polarrose",
  name: "Polar Rose",
  category: "Geometry",
  blurb: "Polar rose: r = cos(k·θ), parametric petals.",
  defaults: {
    k: 5,
    samples: 8000,
    strokeWidth: 1.0,
    spin: 0,
    ampX: 0.95,
    ampY: 0.95,
    bgTint: 0,
  },
  params: [
    { key: "k", label: "Petals (k)", min: 1, max: 16, step: 0.25, format: (v) => v.toFixed(2) },
    { key: "samples", label: "Points per petal", min: 500, max: 30000, step: 100 },
    { key: "spin", label: "Rotation (°)", min: 0, max: 360, step: 1, format: (v) => `${v.toFixed(0)}°` },
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
    const k = opts.k;
    const samples = Math.round(opts.samples);
    const spin = opts.spin * Math.PI / 180;

    ctx.strokeStyle = palette.colors[palette.colors.length - 1];
    ctx.lineWidth = opts.strokeWidth;
    ctx.lineCap = "round";

    // Хак: при рациональном k роза замыкается через steps = k * ((denom) lcm).
    // Для красоты берём samples как число точек на один полный оборот.
    const steps = samples;
    ctx.beginPath();
    for (let i = 0; i <= steps; i++) {
      const t = (i / steps) * Math.PI * 2;
      const r = Math.cos(k * t + spin);
      const x = cx + ax * r * Math.cos(t);
      const y = cy + ay * r * Math.sin(t);
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.closePath();
    ctx.stroke();

    if (opts.bgTint > 0) {
      ctx.fillStyle = `rgba(0,0,0,${opts.bgTint})`;
      ctx.fillRect(0, 0, w, h);
    }
  },
};

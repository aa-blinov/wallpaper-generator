// String Art — pins evenly spaced around a circle, each connected by a
// straight chord to pin (i × multiplier) mod N. The classic "times table"
// construction: multiplier 2 traces a cardioid, 3 a nephroid, and larger
// values weave a dense envelope curve out of nothing but straight lines.

export const stringart = {
  id: "stringart",
  name: "String Art",
  category: "Geometry",
  blurb: "Straight chords between numbered pins on a circle — envelope curves from pure geometry.",
  defaults: {
    pins: 200,
    multiplier: 2,
    strokeWidth: 0.6,
    lineAlpha: 0.35,
    colorMode: "By angle",
    bgTint: 0,
  },
  params: [
    { key: "pins", label: "Pins", min: 20, max: 400, step: 5 },
    { key: "multiplier", label: "Multiplier", min: 2, max: 60, step: 1 },
    { key: "strokeWidth", label: "Thread width", min: 0.2, max: 2, step: 0.05 },
    { key: "lineAlpha", label: "Thread opacity", min: 0.05, max: 1, step: 0.02 },
    { key: "colorMode", label: "Color", enum: ["By angle", "Single color"] },
  ],

  createState(opts, w, h) {
    return { w, h };
  },

  paint(ctx, opts, state) {
    const { w, h } = state;
    const palette = opts.palette;
    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, w, h);

    const N = Math.round(opts.pins);
    const k = Math.round(opts.multiplier);
    const R = Math.min(w, h) * 0.46;
    const cx = w / 2, cy = h / 2;
    const cols = palette.colors;
    const fg = cols[cols.length - 1];

    const pinX = new Float32Array(N), pinY = new Float32Array(N);
    for (let i = 0; i < N; i++) {
      const ang = (i / N) * Math.PI * 2 - Math.PI / 2;
      pinX[i] = cx + R * Math.cos(ang);
      pinY[i] = cy + R * Math.sin(ang);
    }

    ctx.lineWidth = opts.strokeWidth;
    ctx.globalAlpha = opts.lineAlpha;
    for (let i = 0; i < N; i++) {
      const j = (i * k) % N;
      ctx.strokeStyle = opts.colorMode === "Single color"
        ? fg
        : cols[Math.floor((i / N) * (cols.length - 1))];
      ctx.beginPath();
      ctx.moveTo(pinX[i], pinY[i]);
      ctx.lineTo(pinX[j], pinY[j]);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;

    if (opts.bgTint > 0) {
      ctx.fillStyle = `rgba(0,0,0,${opts.bgTint})`;
      ctx.fillRect(0, 0, w, h);
    }
  },
};

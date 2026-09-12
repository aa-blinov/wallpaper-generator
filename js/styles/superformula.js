// Superformula (Gielis, 2003) — one equation, r(θ) = (|cos(mθ/4)/a|^n2 +
// |sin(mθ/4)/b|^n3)^(-1/n1), covers everything from stars to flowers to
// near-polygons depending on its five parameters. Tiled as a wallpaper motif.

export const superformula = {
  id: "superformula",
  name: "Superformula Motif",
  category: "Geometry",
  blurb: "Gielis' one-equation shape family — stars, flowers, gears — tiled as a print motif.",
  defaults: {
    m: 7,
    n1: 3.0,
    n2: 6.0,
    n3: 6.0,
    cellSize: 140,
    colorMode: "Two-tone",
    bgTint: 0,
  },
  params: [
    { key: "m", label: "Symmetry (m)", min: 2, max: 16, step: 1 },
    { key: "n1", label: "Shape n1", min: 0.2, max: 12, step: 0.1 },
    { key: "n2", label: "Shape n2", min: 0.2, max: 16, step: 0.1 },
    { key: "n3", label: "Shape n3", min: 0.2, max: 16, step: 0.1 },
    { key: "cellSize", label: "Motif size (px)", min: 60, max: 300, step: 5 },
    { key: "colorMode", label: "Color", enum: ["Two-tone", "By angle"] },
  ],

  createState(opts, w, h) {
    const steps = 160;
    const pts = new Float32Array(steps * 2);
    const m = opts.m, n1 = opts.n1, n2 = opts.n2, n3 = opts.n3;
    let maxR = 0;
    for (let i = 0; i < steps; i++) {
      const theta = (i / steps) * Math.PI * 2;
      const t1 = Math.pow(Math.abs(Math.cos((m * theta) / 4)), n2);
      const t2 = Math.pow(Math.abs(Math.sin((m * theta) / 4)), n3);
      const r = Math.pow(t1 + t2, -1 / n1) || 0.001;
      maxR = Math.max(maxR, r);
      pts[i * 2] = r * Math.cos(theta);
      pts[i * 2 + 1] = r * Math.sin(theta);
    }
    // Normalize so the motif's own radius is 1 (cellSize scales it later).
    for (let i = 0; i < steps; i++) { pts[i * 2] /= maxR; pts[i * 2 + 1] /= maxR; }
    return { pts, steps, w, h };
  },

  paint(ctx, opts, state) {
    const { pts, steps, w, h } = state;
    const palette = opts.palette;
    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, w, h);

    const cols = palette.colors;
    const cell = opts.cellSize;
    const R = cell * 0.42;
    const nx = Math.ceil(w / cell) + 1;
    const ny = Math.ceil(h / cell) + 1;

    function motif(cx, cy, rot, fill) {
      ctx.beginPath();
      for (let i = 0; i < steps; i++) {
        const x0 = pts[i * 2], y0 = pts[i * 2 + 1];
        const x = cx + (x0 * Math.cos(rot) - y0 * Math.sin(rot)) * R;
        const y = cy + (x0 * Math.sin(rot) + y0 * Math.cos(rot)) * R;
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fillStyle = fill;
      ctx.fill();
    }

    for (let gy = -1; gy < ny; gy++) {
      for (let gx = -1; gx < nx; gx++) {
        const cx = gx * cell + ((gy % 2) ? cell / 2 : 0);
        const cy = gy * cell * 0.87;
        const checker = (Math.round(gx) + Math.round(gy)) % 2 === 0;
        const rot = checker ? 0 : Math.PI / opts.m;
        const fill = opts.colorMode === "By angle"
          ? cols[Math.abs((gx * 3 + gy * 5)) % cols.length]
          : (checker ? cols[cols.length - 1] : cols[Math.floor(cols.length / 2)]);
        motif(cx, cy, rot, fill);
      }
    }

    if (opts.bgTint > 0) {
      ctx.fillStyle = `rgba(0,0,0,${opts.bgTint})`;
      ctx.fillRect(0, 0, w, h);
    }
  },
};

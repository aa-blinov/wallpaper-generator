// Girih — a grid of interlocking star polygons in the spirit of Islamic
// geometric strapwork (a decorative approximation, not the exact aperiodic
// girih tile set, which needs five distinct tile shapes to lay out properly).

export const girih = {
  id: "girih",
  name: "Girih Star Grid",
  category: "Geometry",
  blurb: "Interlocking star polygons on a grid, Islamic geometric strapwork style.",
  defaults: {
    points: 8,
    cellSize: 130,
    innerRatio: 0.5,
    strokeWidth: 1.5,
    bgTint: 0,
  },
  params: [
    { key: "points", label: "Star points", min: 5, max: 12, step: 1 },
    { key: "cellSize", label: "Cell size (px)", min: 60, max: 260, step: 5 },
    { key: "innerRatio", label: "Point sharpness", min: 0.3, max: 0.7, step: 0.02 },
    { key: "strokeWidth", label: "Strap width", min: 0.5, max: 4, step: 0.1 },
  ],

  createState(opts, w, h) {
    return { w, h };
  },

  paint(ctx, opts, state) {
    const { w, h } = state;
    const palette = opts.palette;
    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, w, h);

    const cols = palette.colors;
    const cell = opts.cellSize;
    const n = Math.round(opts.points);
    const R = cell * 0.62;
    const r = R * opts.innerRatio;
    const nx = Math.ceil(w / cell) + 1;
    const ny = Math.ceil(h / cell) + 1;

    ctx.lineWidth = opts.strokeWidth;

    function star(cx, cy, rot, fill, stroke) {
      ctx.beginPath();
      for (let i = 0; i < n * 2; i++) {
        const rad = i % 2 === 0 ? R : r;
        const ang = rot + (i / (n * 2)) * Math.PI * 2;
        const x = cx + rad * Math.cos(ang);
        const y = cy + rad * Math.sin(ang);
        if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
      }
      ctx.closePath();
      ctx.fillStyle = fill;
      ctx.fill();
      ctx.strokeStyle = stroke;
      ctx.stroke();
    }

    for (let gy = -1; gy < ny; gy++) {
      for (let gx = -1; gx < nx; gx++) {
        const cx = gx * cell + ((gy % 2) ? cell / 2 : 0);
        const cy = gy * cell * 0.87;
        const checker = (Math.round(gx) + Math.round(gy)) % 2 === 0;
        const rot = checker ? 0 : Math.PI / n;
        const fill = checker ? cols[Math.floor(cols.length / 2)] : cols[cols.length - 1];
        star(cx, cy, rot, fill, palette.bg);
      }
    }

    if (opts.bgTint > 0) {
      ctx.fillStyle = `rgba(0,0,0,${opts.bgTint})`;
      ctx.fillRect(0, 0, w, h);
    }
  },
};

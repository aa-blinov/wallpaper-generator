// Penrose Tiling — aperiodic rhombus tiling built by repeated deflation of
// Robinson triangles (the standard "kite and dart" construction). Each pair
// of triangles sharing their long edge reads visually as one rhombus.

const PHI = (1 + Math.sqrt(5)) / 2;

function subdivide(triangles) {
  const out = [];
  for (const { color, A, B, C } of triangles) {
    if (color === 0) {
      // "Half kite": split in two.
      const P = { x: A.x + (B.x - A.x) / PHI, y: A.y + (B.y - A.y) / PHI };
      out.push({ color: 0, A: C, B: P, C: B });
      out.push({ color: 1, A: P, B: C, C: A });
    } else {
      // "Half dart": split in three.
      const Q = { x: B.x + (A.x - B.x) / PHI, y: B.y + (A.y - B.y) / PHI };
      const R = { x: B.x + (C.x - B.x) / PHI, y: B.y + (C.y - B.y) / PHI };
      out.push({ color: 1, A: R, B: C, C: A });
      out.push({ color: 1, A: Q, B: R, C: B });
      out.push({ color: 0, A: R, B: Q, C: A });
    }
  }
  return out;
}

export const penrose = {
  id: "penrose",
  name: "Penrose Tiling",
  category: "Geometry",
  blurb: "Aperiodic rhombus tiling by deflation — never repeats, no matter how far it tiles.",
  defaults: {
    depth: 6,
    strokeWidth: 1,
    colorMode: "Two-tone",
    bgTint: 0,
  },
  params: [
    { key: "depth", label: "Deflation depth", min: 2, max: 8, step: 1 },
    { key: "strokeWidth", label: "Outline width", min: 0, max: 3, step: 0.1 },
    { key: "colorMode", label: "Color", enum: ["Two-tone", "By distance"] },
  ],

  createState(opts, w, h) {
    let triangles = [];
    for (let i = 0; i < 10; i++) {
      const angleA = (Math.PI * (2 * i - 1)) / 10;
      const angleB = (Math.PI * (2 * i + 1)) / 10;
      const A = { x: 0, y: 0 };
      let B = { x: Math.cos(angleA), y: Math.sin(angleA) };
      let C = { x: Math.cos(angleB), y: Math.sin(angleB) };
      if (i % 2 === 0) { const t = B; B = C; C = t; }
      triangles.push({ color: 0, A, B, C });
    }
    const depth = Math.round(opts.depth);
    for (let i = 0; i < depth; i++) triangles = subdivide(triangles);
    return { triangles, w, h };
  },

  paint(ctx, opts, state) {
    const { triangles, w, h } = state;
    const palette = opts.palette;
    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, w, h);

    const cols = palette.colors;
    const R = Math.min(w, h) * 0.48;
    const cx = w / 2, cy = h / 2;
    ctx.lineWidth = opts.strokeWidth;
    ctx.strokeStyle = palette.bg;

    for (const t of triangles) {
      const ax = cx + t.A.x * R, ay = cy + t.A.y * R;
      const bx = cx + t.B.x * R, by = cy + t.B.y * R;
      const cx2 = cx + t.C.x * R, cy2 = cy + t.C.y * R;
      if (opts.colorMode === "By distance") {
        const d = Math.hypot((t.A.x + t.B.x + t.C.x) / 3, (t.A.y + t.B.y + t.C.y) / 3);
        ctx.fillStyle = cols[Math.min(cols.length - 1, Math.floor(d * (cols.length - 1)))];
      } else {
        ctx.fillStyle = t.color === 0 ? cols[cols.length - 1] : cols[Math.floor(cols.length / 2)];
      }
      ctx.beginPath();
      ctx.moveTo(ax, ay);
      ctx.lineTo(bx, by);
      ctx.lineTo(cx2, cy2);
      ctx.closePath();
      ctx.fill();
      if (opts.strokeWidth > 0) ctx.stroke();
    }

    if (opts.bgTint > 0) {
      ctx.fillStyle = `rgba(0,0,0,${opts.bgTint})`;
      ctx.fillRect(0, 0, w, h);
    }
  },
};

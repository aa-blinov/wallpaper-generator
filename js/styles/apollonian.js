// Apollonian Gasket — start from four mutually tangent circles, then walk
// the linear Descartes recurrence: given a tangent quadruple (A,B,C,D),
// solving for the circle that replaces any one of them (say D, keeping
// A,B,C) is k_new = 2(kA+kB+kC) − kD, with the same linear combination for
// the (curvature-weighted) center. That's the standard way to enumerate a
// whole gasket without the sign ambiguity of the quadratic form.

export const apollonian = {
  id: "apollonian",
  name: "Apollonian Gasket",
  category: "Geometry",
  blurb: "Circles packed into circles packed into circles, forever — Descartes' theorem made visible.",
  defaults: {
    depth: 9,
    minRadius: 2.5,
    strokeWidth: 1,
    colorMode: "By depth",
    bgTint: 0,
  },
  params: [
    { key: "depth", label: "Recursion depth", min: 3, max: 14, step: 1 },
    { key: "minRadius", label: "Min radius (px)", min: 0.5, max: 8, step: 0.25 },
    { key: "strokeWidth", label: "Outline width", min: 0, max: 3, step: 0.1 },
    { key: "colorMode", label: "Color", enum: ["By depth", "By radius", "Single color"] },
  ],

  createState(opts, w, h) {
    const R = Math.min(w, h) * 0.48;
    // Outer circle (negative curvature, encloses everything), two equal
    // circles of radius R/2 inside it tangent to it and each other, and the
    // small circle nestled between all three — our starting quadruple.
    const outer = { x: 0, y: 0, r: -R };
    const r1 = R / 2;
    const c1 = { x: -r1, y: 0, r: r1 };
    const c2 = { x: r1, y: 0, r: r1 };
    // Quadratic Descartes just this once, to seed the quadruple; the small
    // circle centered at the top gap between outer/c1/c2.
    const k1 = 1 / outer.r, k2 = 1 / c1.r, k3 = 1 / c2.r;
    const k4 = k1 + k2 + k3 + 2 * Math.sqrt(Math.abs(k1 * k2 + k2 * k3 + k3 * k1));
    const r4 = 1 / k4;
    // Two equal circles tangent to each other inside the outer one leave TWO
    // curvilinear gaps (above and below the line through their centers) —
    // recursing from only one gap's quadruple leaves half the gasket blank.
    const c3top = { x: 0, y: -(R - r4), r: r4 };
    const c3bot = { x: 0, y: R - r4, r: r4 };

    const circles = [outer, c1, c2, c3top, c3bot];
    const minR = opts.minRadius;
    const maxDepth = Math.round(opts.depth);
    const maxCircles = 20000; // hard safety cap, independent of any recursion bug

    function next(a, b, c, d) {
      const ka = 1 / a.r, kb = 1 / b.r, kc = 1 / c.r, kd = 1 / d.r;
      const k5 = 2 * (ka + kb + kc) - kd;
      if (Math.abs(k5) < 1e-9) return null;
      const xk = 2 * (a.x * ka + b.x * kb + c.x * kc) - d.x * kd;
      const yk = 2 * (a.y * ka + b.y * kb + c.y * kc) - d.y * kd;
      return { x: xk / k5, y: yk / k5, r: 1 / k5 };
    }

    function fill(a, b, c, d, depth) {
      if (depth > maxDepth || circles.length > maxCircles) return;
      for (const [x, y, z, skip] of [[a, b, d, c], [a, c, d, b], [b, c, d, a]]) {
        const n = next(x, y, z, skip);
        if (!n || Math.abs(n.r) < minR) continue;
        n.depth = depth;
        circles.push(n);
        fill(x, y, z, n, depth + 1);
      }
    }
    fill(outer, c1, c2, c3top, 1);
    fill(outer, c1, c2, c3bot, 1);

    return { circles, R, w, h };
  },

  paint(ctx, opts, state) {
    const { circles, R, w, h } = state;
    const palette = opts.palette;
    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, w, h);

    const cols = palette.colors;
    const fg = cols[cols.length - 1];
    const cx = w / 2, cy = h / 2;
    ctx.lineWidth = opts.strokeWidth;
    ctx.strokeStyle = palette.bg;

    for (const c of circles) {
      const r = Math.abs(c.r);
      if (r < 0.5 || r > R * 1.02) continue; // skip the enclosing circle itself
      if (opts.colorMode === "Single color") ctx.fillStyle = fg;
      else if (opts.colorMode === "By radius") ctx.fillStyle = cols[Math.min(cols.length - 1, Math.floor((1 - Math.min(1, r / (R * 0.5))) * (cols.length - 1)))];
      else ctx.fillStyle = cols[(c.depth || 0) % cols.length];
      ctx.beginPath();
      ctx.arc(cx + c.x, cy + c.y, r, 0, Math.PI * 2);
      ctx.fill();
      if (opts.strokeWidth > 0) ctx.stroke();
    }

    if (opts.bgTint > 0) {
      ctx.fillStyle = `rgba(0,0,0,${opts.bgTint})`;
      ctx.fillRect(0, 0, w, h);
    }
  },
};

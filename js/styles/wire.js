// Wire — связный случайный граф (из узлов с Nearest Neighbor). Рёбра с лёгким шумом.

import { makeRng } from "../rng.js";
import { makeColorRamp } from "../palettes.js";

export const wire = {
  id: "wire",
  name: "Wire Net",
  category: "Algorithms",
  blurb: "A connected nearest-neighbor graph: edges + nodes.",
  defaults: {
    nodes: 110,
    radius: 220,
    edgeWidth: 0.5,
    showNodes: 1,
    bgTint: 0,
  },
  params: [
    { key: "nodes", label: "Node count", min: 20, max: 400, step: 5 },
    { key: "radius", label: "Connection radius", min: 20, max: 320, step: 5 },
    { key: "edgeWidth", label: "Edge thickness", min: 0.2, max: 3, step: 0.1 },
    { key: "showNodes", label: "Show nodes", enum: ["yes", "no"] },
  ],

  createState(opts, w, h) {
    const rng = makeRng(opts.seed + ":wire");
    const ramp = makeColorRamp(opts.palette.colors);
    const N = Math.round(opts.nodes);
    const pts = new Array(N);
    for (let i = 0; i < N; i++) {
      pts[i] = [rng() * w, rng() * h];
    }
    return { rng, ramp, pts, w, h };
  },

  paint(ctx, opts, state) {
    const { w, h, pts, ramp } = state;
    const palette = opts.palette;
    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, w, h);

    const r = opts.radius;
    ctx.strokeStyle = ramp(0.3);
    ctx.lineWidth = opts.edgeWidth;
    ctx.beginPath();
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        const dx = pts[i][0] - pts[j][0], dy = pts[i][1] - pts[j][1];
        if (dx * dx + dy * dy < r * r) {
          ctx.moveTo(pts[i][0], pts[i][1]);
          ctx.lineTo(pts[j][0], pts[j][1]);
        }
      }
    }
    ctx.stroke();

    if (opts.showNodes === "yes") {
      ctx.fillStyle = ramp(0.9);
      for (let i = 0; i < pts.length; i++) {
        ctx.beginPath();
        ctx.arc(pts[i][0], pts[i][1], 2, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    if (opts.bgTint > 0) {
      ctx.fillStyle = `rgba(0,0,0,${opts.bgTint})`;
      ctx.fillRect(0, 0, w, h);
    }
  },
};

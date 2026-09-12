// NetGraph — сетевой граф с раскраской узлов по числу связей.

import { makeRng } from "../rng.js";
import { makeColorRamp } from "../palettes.js";

export const netgraph = {
  id: "netgraph",
  name: "Net Graph",
  category: "Algorithms",
  blurb: "Network graph: random nodes, edges highlighted by degree.",
  defaults: {
    nodes: 80,
    avgDegree: 6,
    nodeRadius: 6,
    edgeWidth: 0.6,
    bgTint: 0,
  },
  params: [
    { key: "nodes", label: "Nodes", min: 20, max: 400, step: 5 },
    { key: "avgDegree", label: "Average edge count", min: 2, max: 14, step: 0.5 },
    { key: "nodeRadius", label: "Node radius", min: 1, max: 20, step: 0.5 },
    { key: "edgeWidth", label: "Edge thickness", min: 0.2, max: 2, step: 0.05 },
  ],

  createState(opts, w, h) {
    const rng = makeRng(opts.seed + ":net");
    const ramp = makeColorRamp(opts.palette.colors);
    const N = Math.round(opts.nodes);
    const pts = new Array(N);
    for (let i = 0; i < N; i++) pts[i] = [rng() * w, rng() * h];
    return { rng, ramp, pts, w, h };
  },

  paint(ctx, opts, state) {
    const { w, h, pts, ramp } = state;
    const palette = opts.palette;
    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, w, h);
    const avgD = opts.avgDegree;
    const totalLen = avgD * pts.length;
    // Составим список рёбер на основе K ближайших соседей
    const edges = [];
    const degree = new Array(pts.length).fill(0);
    for (let i = 0; i < pts.length; i++) {
      const distances = [];
      for (let j = 0; j < pts.length; j++) {
        if (j === i) continue;
        const dx = pts[j][0] - pts[i][0], dy = pts[j][1] - pts[i][1];
        distances.push([j, dx * dx + dy * dy]);
      }
      distances.sort((a, b) => a[1] - b[1]);
      const take = Math.min(distances.length, Math.ceil(avgD + 1));
      for (let k = 0; k < take && edges.length < totalLen / 2; k++) {
        const j = distances[k][0];
        if (j > i) {
          edges.push([i, j]);
          degree[i]++;
          degree[j]++;
        }
      }
    }

    ctx.lineWidth = opts.edgeWidth;
    ctx.strokeStyle = palette.colors[Math.floor(palette.colors.length / 2)];
    for (const [a, b] of edges) {
      ctx.beginPath();
      ctx.moveTo(pts[a][0], pts[a][1]);
      ctx.lineTo(pts[b][0], pts[b][1]);
      ctx.stroke();
    }

    // Узлы
    const maxDeg = Math.max(...degree);
    for (let i = 0; i < pts.length; i++) {
      ctx.fillStyle = ramp(degree[i] / Math.max(1, maxDeg));
      ctx.beginPath();
      ctx.arc(pts[i][0], pts[i][1], opts.nodeRadius * (0.6 + degree[i] / Math.max(1, maxDeg) * 0.6), 0, Math.PI * 2);
      ctx.fill();
    }

    if (opts.bgTint > 0) {
      ctx.fillStyle = `rgba(0,0,0,${opts.bgTint})`;
      ctx.fillRect(0, 0, w, h);
    }
  },
};

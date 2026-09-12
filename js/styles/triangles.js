// Triangles — триангуляция случайных точек (упрощённый Delaunay через Bowyer–Watson
// или просто рисуем треугольники по соседям + выпуклое разбиение).

import { makeRng } from "../rng.js";
import { makeColorRamp } from "../palettes.js";

// Лёгкая триангуляция: каждая точка соединяется с K ближайшими, образуя «звёзды»;
// затем рисуем ещё рёбра между ближайшими парами. Получается похоже на Delaunay.

export const triangles = {
  id: "triangles",
  name: "Triangulation",
  category: "Геометрия",
  blurb: "Триангуляция случайных точек с раскраской треугольников.",
  defaults: {
    points: 60,
    neighbors: 4,
    strokeWidth: 0.4,
    bgTint: 0,
  },
  params: [
    { key: "points", label: "Точек", min: 10, max: 200, step: 5 },
    { key: "neighbors", label: "Соседей", min: 3, max: 8, step: 1 },
    { key: "strokeWidth", label: "Контур", min: 0, max: 2, step: 0.05 },
  ],

  createState(opts, w, h) {
    const rng = makeRng(opts.seed + ":tri");
    const ramp = makeColorRamp(opts.palette.colors);
    const N = Math.max(4, Math.round(opts.points));
    const pts = new Array(N);
    // Добавим углы, чтобы покрыть прямоугольник
    for (let i = 0; i < N; i++) pts[i] = [rng() * w, rng() * h];
    return { rng, ramp, pts, w, h };
  },

  paint(ctx, opts, state) {
    const { w, h, pts, ramp } = state;
    const palette = opts.palette;
    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, w, h);

    const K = Math.round(opts.neighbors);
    const colors = palette.colors;
    // Соберём все рёбра + середины треугольников (через center-point + 2 ближайших соседа)
    // Чтобы не вызывать Delaunay, рисуем fan-triangulation: каждый узел с K ближайшими соседями
    // соединяется в «веер» с центром в этом узле.
    const fanTris = [];
    for (let i = 0; i < pts.length; i++) {
      // Найдём K ближайших к pts[i]
      const distances = [];
      for (let j = 0; j < pts.length; j++) {
        if (j === i) continue;
        const dx = pts[j][0] - pts[i][0], dy = pts[j][1] - pts[i][1];
        distances.push([j, dx * dx + dy * dy]);
      }
      distances.sort((a, b) => a[1] - b[1]);
      const ring = distances.slice(0, K);
      // Сортируем по углу для согласованного fan
      ring.sort((a, b) => Math.atan2(pts[a[0]][1] - pts[i][1], pts[a[0]][0] - pts[i][0]) - Math.atan2(pts[b[0]][1] - pts[i][1], pts[b[0]][0] - pts[i][0]));
      for (let k = 0; k < K; k++) {
        const a = ring[k][0];
        const b = ring[(k + 1) % K][0];
        fanTris.push([i, a, b]);
      }
    }

    // Рисуем фаны
    for (const [i, a, b] of fanTris) {
      ctx.beginPath();
      ctx.moveTo(pts[i][0], pts[i][1]);
      ctx.lineTo(pts[a][0], pts[a][1]);
      ctx.lineTo(pts[b][0], pts[b][1]);
      ctx.closePath();
      ctx.fillStyle = ramp(((i * 13) % 100) / 100);
      ctx.fill();
      if (opts.strokeWidth > 0) {
        ctx.strokeStyle = palette.colors[0];
        ctx.lineWidth = opts.strokeWidth;
        ctx.stroke();
      }
    }

    // Дополнительные диагонали между ближайшими парами
    ctx.strokeStyle = palette.colors[palette.colors.length - 1];
    ctx.lineWidth = 0.3;
    for (let i = 0; i < pts.length; i++) {
      const dists = [];
      for (let j = 0; j < pts.length; j++) {
        if (j === i) continue;
        const dx = pts[j][0] - pts[i][0], dy = pts[j][1] - pts[i][1];
        dists.push([j, dx * dx + dy * dy]);
      }
      dists.sort((a, b) => a[1] - b[1]);
      const set = new Set([i]);
      for (let n = 0; n < 2; n++) {
        const j = dists[n][0];
        if (set.has(j)) continue;
        set.add(j);
        ctx.beginPath();
        ctx.moveTo(pts[i][0], pts[i][1]);
        ctx.lineTo(pts[j][0], pts[j][1]);
        ctx.stroke();
      }
    }

    if (opts.bgTint > 0) {
      ctx.fillStyle = `rgba(0,0,0,${opts.bgTint})`;
      ctx.fillRect(0, 0, w, h);
    }
  },
};

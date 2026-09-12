// Tessellation — гиперболическая тесселяция Пуанкаре в круге Пуанкаре.
// Каждая ячейка — многоугольник, раскрашенный случайным цветом.

import { makeRng } from "../rng.js";
import { makeColorRamp } from "../palettes.js";

// p-угольники с q сходящимися в одной вершине. {3,7}, {4,5}, {6,4} и т.д.
function reflect(p1, mirror, scale) {
  // Reflect point p1 across line through origin with normal direction mirror
  // mirror = (mx, my) — единичный вектор.
  const dot = p1[0] * mirror[0] + p1[1] * mirror[1];
  return [p1[0] - 2 * dot * mirror[0], p1[1] - 2 * dot * mirror[1]];
}
function invert(p, R) {
  const d2 = p[0] * p[0] + p[1] * p[1];
  if (d2 < 1e-12) return [0, 0];
  const k = (R * R) / d2;
  return [p[0] * k, p[1] * k];
}

export const tessellation = {
  id: "tessellation",
  name: "Hyperbolic Tessellation",
  category: "Geometry",
  blurb: "Hyperbolic tessellation in the Poincaré disk.",
  defaults: {
    p: 6,
    q: 4,
    radiusRatio: 0.96,
    bgTint: 0,
  },
  params: [
    { key: "p", label: "Sides (p)", min: 3, max: 10, step: 1 },
    { key: "q", label: "At vertex (q)", min: 3, max: 8, step: 1 },
    { key: "radiusRatio", label: "Fill", min: 0.7, max: 0.99, step: 0.01 },
  ],

  createState(opts, w, h) {
    const rng = makeRng(opts.seed + ":hyper");
    const ramp = makeColorRamp(opts.palette.colors);
    return { rng, ramp, w, h };
  },

  paint(ctx, opts, state) {
    const { w, h, rng, ramp } = state;
    const palette = opts.palette;
    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, w, h);

    const p = Math.round(opts.p);
    const q = Math.round(opts.q);
    if ((p - 2) * (q - 2) <= 4) {
      // Невалидная тесселяция — рисуем только круг
      const R = Math.min(w, h) * opts.radiusRatio * 0.5;
      ctx.fillStyle = palette.colors[palette.colors.length - 1];
      ctx.beginPath();
      ctx.arc(w / 2, h / 2, R, 0, Math.PI * 2);
      ctx.fill();
      return;
    }
    const R = Math.min(w, h) * 0.5 * opts.radiusRatio;
    const cx = w / 2, cy = h / 2;

    // Строим все рёбра и сохраняем центры ячеек
    const edges = new Set();
    const cells = []; // {center, edgesId}
    function addEdgeIfNew(a, b) {
      const k = a[0].toFixed(4) + "," + a[1].toFixed(4) + "|" + b[0].toFixed(4) + "," + b[1].toFixed(4);
      const kr = b[0].toFixed(4) + "," + b[1].toFixed(4) + "|" + a[0].toFixed(4) + "," + a[1].toFixed(4);
      if (edges.has(k) || edges.has(kr)) return false;
      edges.add(k);
      edges.add(kr);
      return true;
    }

    // Начальная ячейка — правильный p-угольник со стороной 1 (вычислительно)
    // Радиус описанной = 1 / (2 sin(π/p))
    const rCirc = 1 / (2 * Math.sin(Math.PI / p));
    const firstPoly = [];
    for (let i = 0; i < p; i++) {
      const a = (i / p) * Math.PI * 2 - Math.PI / 2;
      firstPoly.push([rCirc * Math.cos(a), rCirc * Math.sin(a)]);
    }
    const queue = [firstPoly];
    const processed = new Set();
    processed.add(firstPoly.map(([x, y]) => x.toFixed(3) + "," + y.toFixed(3)).join(";"));
    while (queue.length) {
      const poly = queue.shift();
      cells.push(poly);
      for (let i = 0; i < p; i++) {
        const a = poly[i], b = poly[(i + 1) % p];
        addEdgeIfNew(a, b);
        // Генерация соседа: отражение от грани [a,b]
        const ax = a[0], ay = a[1];
        const bx = b[0], by = b[1];
        // нормаль направлена к центру полигона (полигон с центром около 0,0)
        let nx = -(by - ay), ny = bx - ax; // one normal
        let nl = Math.hypot(nx, ny);
        nx /= nl; ny /= nl;
        // Центр полигона: ((ax+bx)/2, (ay+by)/2) — нужно направить наружу от 0
        const mxc = (ax + bx) / 2, myc = (ay + by) / 2;
        // Проверим знак: dot нормали с mid должен быть >0
        if (nx * mxc + ny * myc < 0) { nx = -nx; ny = -ny; }
        const glides = q - 1;
        let cur = poly;
        let prevEdge = [a, b];
        for (let step = 0; step < glides; step++) {
          // Reflect cur across prevEdge line through mid
          const midX = (prevEdge[0][0] + prevEdge[1][0]) / 2;
          const midY = (prevEdge[0][1] + prevEdge[1][1]) / 2;
          // Преобразуем координаты: сдвиг, отражение, обратный сдвиг
          const relPoly = cur.map(([x, y]) => [x - midX, y - midY]);
          const reflPoly = relPoly.map(([x, y]) => reflect([x, y], [nx, ny], null));
          const newPoly = reflPoly.map(([x, y]) => [x + midX, y + midY]);
          const key = newPoly.map(([x, y]) => x.toFixed(3) + "," + y.toFixed(3)).join(";");
          // Invert в круг Пуанкаре (это последняя в q-1 итерация)
          if (step === glides - 1) {
            const invPoly = newPoly.map(([x, y]) => invert([x, y], 1));
            const key2 = invPoly.map(([x, y]) => x.toFixed(3) + "," + y.toFixed(3)).join(";");
            if (!processed.has(key2) && q > 1) {
              processed.add(key2);
              queue.push(invPoly);
            }
          } else {
            if (!processed.has(key)) {
              processed.add(key);
              queue.push(newPoly);
            }
          }
          cur = newPoly;
          prevEdge = [cur[(i + p - 1) % p], cur[(i + p) % p] === undefined ? cur[0] : cur[i]];
        }
      }
      // Ограничим число ячеек для скорости
      if (cells.length > 800) break;
    }

    // Рисуем: заливка + контур
    for (const poly of cells) {
      // проверим, что полигон в круге Пуанкаре
      let outside = false;
      const transformed = poly.map(([x, y]) => invert([x, y], 1));
      const visible = transformed.map(([x, y]) => [x, y]).filter(([x, y]) => x * x + y * y <= 1);
      if (visible.length < 3) continue;
      ctx.beginPath();
      const proj = transformed.map(([x, y]) => [cx + x * R, cy + y * R]);
      ctx.moveTo(proj[0][0], proj[0][1]);
      for (let i = 1; i < proj.length; i++) ctx.lineTo(proj[i][0], proj[i][1]);
      ctx.closePath();
      ctx.fillStyle = ramp(rng());
      ctx.fill();
      ctx.strokeStyle = palette.colors[0];
      ctx.lineWidth = 1.0;
      ctx.stroke();
    }

    // Круг Пуанкаре — внешняя граница
    ctx.strokeStyle = palette.colors[palette.colors.length - 1];
    ctx.lineWidth = 2.0;
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.stroke();

    if (opts.bgTint > 0) {
      ctx.fillStyle = `rgba(0,0,0,${opts.bgTint})`;
      ctx.fillRect(0, 0, w, h);
    }
  },
};

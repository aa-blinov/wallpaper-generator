// Truchet Tiles — случайные изогнутые плитки на сетке.
// Каждая ячейка рисует одну из двух конфигураций дуг (TL+BR или TR+BL).
// Выглядит как бесконечная мозаика; при анимации плитки переключаются.

import { makeRng, rngRange } from "../rng.js";
import { makeColorRamp } from "../palettes.js";

export const truchet = {
  id: "truchet",
  name: "Truchet Tiles",
  category: "Geometry",
  blurb: "Random curved arcs on a grid — an Escher-style tiling.",
  defaults: {
    cellSize: 80,
    thickness: 6,
    arcRatio: 1.0,        // 1.0 — полные дуги, 0.5 — четверть
    tileVariation: 0,     // 0: только дуги, 1: добавляем диагонали/квадраты
    animateSpeed: 0.0,
    bgTint: 0,
  },
  params: [
    { key: "cellSize", label: "Tile size", min: 16, max: 220, step: 2, format: (v) => `${v.toFixed(0)} px` },
    { key: "thickness", label: "Thickness", min: 1, max: 20, step: 0.5, format: (v) => `${v.toFixed(1)} px` },
    { key: "arcRatio", label: "Arc radius", min: 0.3, max: 1.4, step: 0.02 },
    { key: "tileVariation", label: "Tile variation", enum: ["Arcs only", "Arcs + diagonals", "Full (3 kinds)"] },
    { key: "animateSpeed", label: "Animation speed", min: 0, max: 1, step: 0.02 },
    { key: "bgTint", label: "Blend with background", min: 0, max: 1, step: 0.02 },
  ],

  createState(opts, w, h) {
    const rng = makeRng(opts.seed + ":truchet");
    const ramp = makeColorRamp(opts.palette.colors);
    const cells = computeTiles(w, h, opts.cellSize, rng);
    return { cells, ramp, w, h, rngSeed: opts.seed };
  },

  paint(ctx, opts, state, _time = 0) {
    const { cells, ramp, w, h } = state;
    const { cellSize, thickness, arcRatio, tileVariation, bgTint } = opts;
    const palette = opts.palette;
    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, w, h);

    ctx.lineCap = "round";
    ctx.lineWidth = thickness;

    const variation = variationIndex(tileVariation);
    const rng = makeRng(state.rngSeed + ":truchet:t" + Math.floor(_time * 0.5));

    for (const cell of cells) {
      if (variation >= 2 && (rng() < 0.18)) {
        ctx.strokeStyle = ramp(rng());
        ctx.beginPath();
        ctx.moveTo(cell.x, cell.y);
        ctx.lineTo(cell.x + cellSize, cell.y + cellSize);
        ctx.stroke();
        continue;
      }
      if (variation >= 1 && (rng() < 0.12)) {
        // Сплошная заливка ячейки — крупные «плитки».
        ctx.fillStyle = ramp(rng());
        ctx.fillRect(cell.x, cell.y, cellSize, cellSize);
        continue;
      }
      const r = cellSize * 0.5 * arcRatio;
      const cx = cell.x + cellSize * 0.5;
      const cy = cell.y + cellSize * 0.5;
      ctx.strokeStyle = ramp(rng());
      ctx.beginPath();
      if (cell.kind === 0) {
        ctx.arc(cx - cellSize * 0.5, cy - cellSize * 0.5, r, 0, Math.PI / 2);
        ctx.moveTo(cx - cellSize * 0.5, cy - cellSize * 0.5);
        ctx.arc(cx + cellSize * 0.5, cy + cellSize * 0.5, r, Math.PI, Math.PI * 1.5);
      } else {
        ctx.arc(cx + cellSize * 0.5, cy - cellSize * 0.5, r, Math.PI / 2, Math.PI);
        ctx.moveTo(cx + cellSize * 0.5, cy - cellSize * 0.5);
        ctx.arc(cx - cellSize * 0.5, cy + cellSize * 0.5, r, -Math.PI / 2, 0);
      }
      ctx.stroke();
    }

    if (bgTint > 0) {
      ctx.fillStyle = `rgba(0,0,0,${bgTint})`;
      ctx.fillRect(0, 0, w, h);
    }
  },

  animate(ctx, opts, state, t) {
    // Подёргиваем плитки при анимации, чтобы получился "traveling" паттерн.
    this.paint(ctx, opts, state, t * opts.animateSpeed * 1000);
  },
};

function computeTiles(w, h, cellSize, rng) {
  const cols = Math.ceil(w / cellSize) + 2;
  const rows = Math.ceil(h / cellSize) + 2;
  const cells = [];
  for (let j = -1; j < rows; j++) {
    for (let i = -1; i < cols; i++) {
      cells.push({
        x: i * cellSize,
        y: j * cellSize,
        kind: rng() < 0.5 ? 0 : 1,
      });
    }
  }
  return cells;
}

function variationIndex(v) {
  if (v === "Arcs + diagonals") return 1;
  if (v === "Full (3 kinds)") return 2;
  return 0;
}

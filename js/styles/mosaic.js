// Mosaic — Вороной-разбиение с лёгким шумом краёв и заливкой тайлов.

import { makeRng } from "../rng.js";
import { makeColorRamp } from "../palettes.js";

export const mosaic = {
  id: "mosaic",
  name: "Mosaic",
  category: "Текстуры",
  blurb: "Мозаика: Вороной с шумовыми краями и палитрой по тайлам.",
  defaults: {
    sites: 80,
    grout: 2.0,
    paletteMode: "Палитра",
    bgTint: 0,
  },
  params: [
    { key: "sites", label: "Кол-во сайтов", min: 20, max: 400, step: 5 },
    { key: "grout", label: "Шов (px)", min: 0, max: 8, step: 0.2 },
    { key: "paletteMode", label: "Цвет", enum: ["Палитра", "Случайный"] },
  ],

  createState(opts, w, h) {
    const rng = makeRng(opts.seed + ":mosaic");
    const ramp = makeColorRamp(opts.palette.colors);
    const sites = [];
    const N = Math.max(4, Math.round(opts.sites));
    for (let i = 0; i < N; i++) {
      sites.push([rng() * w, rng() * h]);
    }
    return { rng, ramp, sites, w, h };
  },

  paint(ctx, opts, state) {
    const { w, h, sites, ramp } = state;
    const palette = opts.palette;
    // Рисуем фон-«замазку» = grout
    ctx.fillStyle = palette.colors[0];
    ctx.fillRect(0, 0, w, h);

    const cols = palette.colors;
    // Обходим канвас блоками 4×4 для скорости; для каждого блока находим ближайший сайт.
    const STEP = 4;
    for (let by = 0; by < h; by += STEP) {
      for (let bx = 0; bx < w; bx += STEP) {
        // Средняя точка
        const cx = bx + STEP / 2, cy = by + STEP / 2;
        // Найдём 2 ближайших сайта
        let best1 = Infinity, best2 = Infinity;
        let idx1 = 0;
        for (let i = 0; i < sites.length; i++) {
          const dx = cx - sites[i][0], dy = cy - sites[i][1];
          const d2 = dx * dx + dy * dy;
          if (d2 < best1) { best2 = best1; best1 = d2; idx1 = i; }
          else if (d2 < best2) { best2 = d2; }
        }
        // Если блок пересекает перпендикуляр между двумя сайтами — пропускаем.
        if (best2 - best1 < 32) {
          // рисуем «шов» в фоне (grout)
          ctx.fillStyle = palette.colors[0];
          ctx.fillRect(bx, by, STEP, STEP);
          continue;
        }
        const c = opts.paletteMode === "Случайный"
          ? cols[idx1 % cols.length]
          : ramp((idx1 % (cols.length * 7)) / 7);
        ctx.fillStyle = c;
        ctx.fillRect(bx, by, STEP, STEP);
      }
    }

    // Сглаживание швов простым шумом точек
    const grout = opts.grout;
    if (grout > 0) {
      ctx.fillStyle = palette.colors[0];
      ctx.globalAlpha = grout / 8;
      for (let by = 0; by < h; by += STEP) {
        for (let bx = 0; bx < w; bx += STEP) {
          // re-check
          const cx = bx + STEP / 2, cy = by + STEP / 2;
          let best1 = Infinity, best2 = Infinity;
          for (let i = 0; i < sites.length; i++) {
            const dx = cx - sites[i][0], dy = cy - sites[i][1];
            const d2 = dx * dx + dy * dy;
            if (d2 < best1) { best2 = best1; best1 = d2; }
            else if (d2 < best2) { best2 = d2; }
          }
          if (best2 - best1 < 28 + grout * 10) {
            ctx.fillRect(bx, by, STEP, STEP);
          }
        }
      }
      ctx.globalAlpha = 1;
    }

    if (opts.bgTint > 0) {
      ctx.fillStyle = `rgba(0,0,0,${opts.bgTint})`;
      ctx.fillRect(0, 0, w, h);
    }
  },
};

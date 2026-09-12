// Spirograph — трассировка нескольких гипотрохоид.
// Каждая кривая: точка на окружности радиуса r, катящейся внутри/снаружи
// окружности радиуса R. Параметрически:
//   x = (R-r) cos(t) + d cos((R-r)/r * t)
//   y = (R-r) sin(t) - d sin((R-r)/r * t)
// Несколько «перьев» с разными R,r,d рисуются одновременно, создавая
// «звёздные» узоры.

import { makeRng, rngRange } from "../rng.js";
import { makeColorRamp } from "../palettes.js";

export const spirograph = {
  id: "spirograph",
  name: "Spirograph",
  category: "Геометрия",
  blurb: "Гипотрохоиды — математические узоры, классическая игрушка.",
  defaults: {
    pens: 7,
    rimRatio: 0.6,      // R / width
    innerRatio: 0.18,   // r / width
    penRatio: 0.12,     // d / width
    thickness: 1.2,
    colorMode: "iter",  // 'iter' | 'one' | 'paletteCycle'
    stepCount: 2000,
    loops: 1.0,         // сколько «полных оборотов» прорисовать
    rotationSpeed: 0.0,
    bgTint: 0.0,
  },
  params: [
    { key: "pens", label: "Кол-во «перьев»", min: 1, max: 24, step: 1 },
    { key: "rimRatio", label: "Радиус обода (R)", min: 0.1, max: 0.9, step: 0.01 },
    { key: "innerRatio", label: "Радиус колеса (r)", min: 0.05, max: 0.45, step: 0.01 },
    { key: "penRatio", label: "Смещение пера (d)", min: 0.01, max: 0.4, step: 0.005 },
    { key: "stepCount", label: "Точек на кривую", min: 200, max: 6000, step: 50 },
    { key: "loops", label: "Длина следа", min: 0.25, max: 4, step: 0.05 },
    { key: "thickness", label: "Толщина", min: 0.2, max: 5, step: 0.1 },
    { key: "rotationSpeed", label: "Скорость вращения", min: 0, max: 0.5, step: 0.005 },
    { key: "bgTint", label: "Подмешивать фон", min: 0, max: 1, step: 0.02 },
    { key: "colorMode", label: "Цвет", enum: ["iter", "one", "paletteCycle"] },
  ],

  createState(opts, w, h) {
    const rng = makeRng(opts.seed + ":spiro");
    const ramp = makeColorRamp(opts.palette.colors);
    return { rng, ramp, w, h };
  },

  paint(ctx, opts, state, _time = 0) {
    const { w, h } = state;
    const palette = opts.palette;
    const short = Math.min(w, h);
    const R = short * opts.rimRatio;
    const r = short * opts.innerRatio;
    const d = short * opts.penRatio;
    const cx = w / 2;
    const cy = h / 2;
    const penCount = Math.max(1, Math.round(opts.pens));
    const steps = Math.max(50, Math.round(opts.stepCount));
    const loops = opts.loops;
    const finalT = Math.PI * 2 * loops * (R / Math.max(0.001, r));

    const angle0 = _time * opts.rotationSpeed * 1000 * 0.001;

    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, w, h);

    ctx.lineWidth = opts.thickness;
    ctx.lineCap = "round";

    for (let p = 0; p < penCount; p++) {
      const localD = d * (1 + (p - penCount / 2) * 0.06);
      const localR = r * (1 + (p - penCount / 2) * 0.04);
      ctx.strokeStyle = pickColor(state.ramp, opts.colorMode, p, penCount);
      ctx.beginPath();
      for (let s = 0; s <= steps; s++) {
        const t = (s / steps) * finalT + angle0;
        const x = (R - localR) * Math.cos(t) + localD * Math.cos(((R - localR) / localR) * t);
        const y = (R - localR) * Math.sin(t) - localD * Math.sin(((R - localR) / localR) * t);
        if (s === 0) ctx.moveTo(cx + x, cy + y);
        else ctx.lineTo(cx + x, cy + y);
      }
      ctx.stroke();
    }

    if (opts.bgTint > 0) {
      ctx.fillStyle = `rgba(0,0,0,${opts.bgTint})`;
      ctx.fillRect(0, 0, w, h);
    }
  },

  animate(ctx, opts, state, t) {
    this.paint(ctx, opts, state, t * opts.rotationSpeed * 1000);
  },
};

function pickColor(ramp, mode, idx, count) {
  if (mode === "one") return ramp(0.5);
  if (mode === "paletteCycle") return ramp(idx / Math.max(1, count - 1));
  return ramp(Math.random());
}

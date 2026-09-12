// Concentric Rings — кольца с шумовым смещением, как зин-анимация в Tunnel.app
// или классические "топографические горизонтали". Залипательно за счёт
// "дышащей" деформации.

import { makeNoise2D, makeFbm } from "../noise.js";
import { makeColorRamp } from "../palettes.js";

export const concentric = {
  id: "concentric",
  name: "Concentric Rings",
  category: "Геометрия",
  blurb: "Концентрические кольца с шумовой деформацией — Tunnel-стиль.",
  defaults: {
    rings: 28,
    thickness: 1.8,
    noiseScale: 0.004,
    noiseStrength: 1.0,
    octaves: 4,
    centerX: 0.5,         // доля от w
    centerY: 0.5,
    smoothMode: "Смешение колец",  // "Смешение колец" | "Линии уровня" | "Только контуры"
    bgFade: 0.0,
  },
  params: [
    { key: "rings", label: "Кол-во колец", min: 4, max: 200, step: 1 },
    { key: "thickness", label: "Толщина", min: 0.2, max: 10, step: 0.1 },
    { key: "noiseScale", label: "Шум (детализация)", min: 0.0005, max: 0.04, step: 0.0005 },
    { key: "noiseStrength", label: "Амплитуда деформации", min: 0.0, max: 3.0, step: 0.05 },
    { key: "octaves", label: "Октавы", min: 1, max: 6, step: 1 },
    { key: "centerX", label: "Центр X", min: -0.5, max: 1.5, step: 0.02 },
    { key: "centerY", label: "Центр Y", min: -0.5, max: 1.5, step: 0.02 },
    { key: "smoothMode", label: "Режим", enum: ["Смешение колец", "Линии уровня", "Только контуры"] },
    { key: "bgFade", label: "Затемнение фона", min: 0, max: 1, step: 0.02 },
  ],

  createState(opts, w, h) {
    const noise = makeNoise2D(hashSeed(opts.seed));
    const ramp = makeColorRamp(opts.palette.colors);
    return { noise, ramp, w, h };
  },

  paint(ctx, opts, state) {
    const { w, h } = state;
    const palette = opts.palette;
    const noise = state.noise;
    const ramp = state.ramp;
    const SW = w, SH = h;
    const cx = w * opts.centerX;
    const cy = h * opts.centerY;
    const rings = Math.max(2, Math.round(opts.rings));
    const noiseScale = opts.noiseScale;
    const noiseStrength = opts.noiseStrength;
    const octaves = Math.max(1, Math.min(8, Math.round(opts.octaves)));
    const contrast = 1;
    const mode = opts.smoothMode;
    const rings01 = rings;

    // Шаг 1: вычислим поле (для каждого пикселя — модулированное расстояние).
    const img = ctx.createImageData(SW, SH);
    const data = img.data;
    const maxR = Math.max(w, h);
    for (let y = 0; y < SH; y++) {
      for (let x = 0; x < SW; x++) {
        const dx = x - cx;
        const dy = y - cy;
        let r = Math.sqrt(dx * dx + dy * dy);
        // fBM-шумовое смещение: чем больше octaves, тем «рванее» край колец.
        let amp = 1, freq = 1, sum = 0, norm = 0;
        for (let o = 0; o < octaves; o++) {
          sum += noise(x * noiseScale * freq + o * 17.3, y * noiseScale * freq + o * 9.1) * amp;
          norm += amp;
          amp *= 0.55;
          freq *= 2.0;
        }
        const n = (sum / norm) * noiseStrength * 80;
        r += n;
        // Нормируем в [0, 1] по максимальному радиусу.
        let v = clamp01(r / (maxR * 0.7));
        // Теперь превращаем в «уровневую» функцию: ближайшее кольцо = 0, линия = 1.
        const lvl = v * rings;
        const d = Math.abs(lvl - Math.round(lvl));
        // d ∈ [0, 0.5]; маленькое — на границе.
        const edge = clamp01(d * rings / Math.max(0.5, opts.thickness));
        let t;
        if (mode === "Линии уровня") {
          // Чем дальше от края — насыщеннее цвет уровня.
          t = v;
        } else if (mode === "Только контуры") {
          t = edge * 0.95;
        } else {
          // Смешение колец — смешать уровень v и edge.
          t = v * 0.6 + edge * 0.4;
        }
        const col = ramp(t);
        const m = PARSE_RGB.exec(col);
        const i = (y * SW + x) * 4;
        data[i] = +m[1]; data[i + 1] = +m[2]; data[i + 2] = +m[3]; data[i + 3] = 255;
      }
    }
    const off = scratchCanvas(SW, SH);
    off.getContext("2d").putImageData(img, 0, 0);
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";
    ctx.drawImage(off, 0, 0, SW, SH, 0, 0, w, h);

    if (opts.bgFade > 0) {
      ctx.fillStyle = `rgba(0,0,0,${opts.bgFade})`;
      ctx.fillRect(0, 0, w, h);
    }
  },

  animate(ctx, opts, state, t) {
    // Медленная "деформация" смещения.
    opts.centerX = 0.5 + Math.sin(t * 0.0002) * 0.05;
    opts.centerY = 0.5 + Math.cos(t * 0.00015) * 0.05;
    this.paint(ctx, opts, state);
  },
};

const PARSE_RGB = /rgb\((\d+),(\d+),(\d+)\)/;
function clamp01(v) { return v < 0 ? 0 : v > 1 ? 1 : v; }
const SCRATCHES = new Map();
function scratchCanvas(w, h) {
  const key = `${w}x${h}`;
  let c = SCRATCHES.get(key);
  if (!c) { c = document.createElement("canvas"); SCRATCHES.set(key, c); }
  if (c.width !== w || c.height !== h) { c.width = w; c.height = h; }
  return c;
}
function hashSeed(seed) {
  const s = String(seed ?? "");
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

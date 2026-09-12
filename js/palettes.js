// Библиотека курируемых палитр + утилиты.

export const PALETTES = [
  // "Lava"
  { id: "lava", name: "Lava", colors: ["#1a0a14", "#5a0a26", "#cc2a3f", "#ff8a4c", "#ffd166"], bg: "#0f0710" },
  // "Aurora"
  { id: "aurora", name: "Aurora", colors: ["#0b132b", "#1c2541", "#3a506b", "#5bc0be", "#6fffe9"], bg: "#070b16" },
  // "Sunset"
  { id: "sunset", name: "Sunset", colors: ["#2d1b4e", "#822b62", "#d54a72", "#f7b15c", "#ffe6a7"], bg: "#170a25" },
  // "Mono ink"
  { id: "ink", name: "Ink", colors: ["#111418", "#2d3340", "#5b6273", "#9aa3b6", "#e6ebf5"], bg: "#0a0d12" },
  // "Ocean"
  { id: "ocean", name: "Ocean", colors: ["#031830", "#0a4a6a", "#1b8eb0", "#7ed6df", "#f2f7f5"], bg: "#020d18" },
  // "Botanic"
  { id: "botanic", name: "Botanic", colors: ["#0e1d14", "#1a3a26", "#3e7c4d", "#9bc773", "#f4ecc0"], bg: "#070e0a" },
  // "Bubblegum"
  { id: "bubblegum", name: "Bubblegum", colors: ["#241038", "#7a2cbf", "#e94cb7", "#ff9ad5", "#fff1ff"], bg: "#160a22" },
  // "Desert"
  { id: "desert", name: "Desert", colors: ["#2a1a10", "#7d3f1a", "#c87b32", "#f4a259", "#ffe1a3"], bg: "#180d09" },
  // "Cyber"
  { id: "cyber", name: "Cyber", colors: ["#08010f", "#290060", "#7a00ff", "#ff2bd6", "#ffe8ff"], bg: "#050008" },
  // "Pastel"
  { id: "pastel", name: "Pastel", colors: ["#dad7cd", "#a3b18a", "#588157", "#3a5a40", "#344e41"], bg: "#f4f1ed" },
  // "Sapphire"
  { id: "sapphire", name: "Sapphire", colors: ["#020617", "#0b1e3f", "#1d4ed8", "#60a5fa", "#e0f2fe"], bg: "#010410" },
  // "Coral"
  { id: "coral", name: "Coral", colors: ["#160a14", "#5a1332", "#e63259", "#ffa08e", "#ffeacb"], bg: "#0b0510" },
];

export function getPalette(id) {
  return PALETTES.find((p) => p.id === id) ?? PALETTES[0];
}

// Преобразует цвет "#rrggbb" в [r,g,b] 0..255
export function hexToRgb(hex) {
  const h = hex.replace("#", "");
  const v = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
}

// Смешивает несколько цветов в один (для генерации фона градиентом).
export function mixHex(colors, weights) {
  let r = 0, g = 0, b = 0, total = 0;
  for (let i = 0; i < colors.length; i++) {
    const w = weights[i] ?? 1;
    const [cr, cg, cb] = hexToRgb(colors[i]);
    r += cr * w; g += cg * w; b += cb * w;
    total += w;
  }
  r = Math.round(r / total); g = Math.round(g / total); b = Math.round(b / total);
  return `rgb(${r},${g},${b})`;
}

// Возвращает функцию интерполяции цвета: t ∈ [0,1] → CSS-цвет (rgb).
export function makeColorRamp(colors) {
  const stops = colors.map(hexToRgb);
  return function ramp(t) {
    if (t <= 0) return `rgb(${stops[0][0]},${stops[0][1]},${stops[0][2]})`;
    if (t >= 1) {
      const last = stops[stops.length - 1];
      return `rgb(${last[0]},${last[1]},${last[2]})`;
    }
    const n = stops.length - 1;
    const seg = t * n;
    const i = Math.floor(seg);
    const f = seg - i;
    const a = stops[i];
    const b = stops[i + 1];
    const r = Math.round(a[0] + (b[0] - a[0]) * f);
    const g = Math.round(a[1] + (b[1] - a[1]) * f);
    const bl = Math.round(a[2] + (b[2] - a[2]) * f);
    return `rgb(${r},${g},${bl})`;
  };
}

// Быстрое цветовое смешивание — возвращает [r,g,b] массив
export function mixRgb(a, b, t) {
  return [
    Math.round(a[0] + (b[0] - a[0]) * t),
    Math.round(a[1] + (b[1] - a[1]) * t),
    Math.round(a[2] + (b[2] - a[2]) * t),
  ];
}

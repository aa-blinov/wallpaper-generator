// Elementary Cellular Automaton — Wolfram's 1D rule table (Rule 30, 90, 110,
// 184, ...) run for many generations, each row stacked below the previous.

export const elementaryca = {
  id: "elementaryca",
  name: "Elementary CA",
  category: "Algorithms",
  blurb: "Wolfram's 1D cellular automaton (Rule 30 and friends), rows stacked into a field.",
  defaults: {
    rule: 30,
    cellSize: 4,
    startMode: "Single",
    colorMode: "Age",
    bgTint: 0,
  },
  params: [
    { key: "rule", label: "Rule number", min: 0, max: 255, step: 1 },
    { key: "cellSize", label: "Cell size (px)", min: 1, max: 10, step: 1 },
    { key: "startMode", label: "Start row", enum: ["Single", "Random"] },
    { key: "colorMode", label: "Color", enum: ["Age", "Single color"] },
  ],

  createState(opts, w, h) {
    return { w, h };
  },

  paint(ctx, opts, state) {
    const { w, h } = state;
    const palette = opts.palette;
    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, w, h);

    const cell = Math.max(1, Math.round(opts.cellSize));
    const cols = Math.ceil(w / cell);
    const rows = Math.ceil(h / cell);
    const rule = Math.round(opts.rule) & 255;
    // Precompute the 8-entry lookup table for this rule number.
    const table = new Uint8Array(8);
    for (let i = 0; i < 8; i++) table[i] = (rule >> i) & 1;

    let row = new Uint8Array(cols);
    if (opts.startMode === "Random") {
      let s = hashSeed(opts.seed) >>> 0;
      const rnd = () => { s = (Math.imul(s, 1664525) + 1013904223) >>> 0; return s / 4294967296; };
      for (let x = 0; x < cols; x++) row[x] = rnd() < 0.5 ? 1 : 0;
    } else {
      row[cols >> 1] = 1;
    }

    const colors = palette.colors;
    const fg = colors[colors.length - 1];
    const img = ctx.createImageData(cols, rows);
    const data = img.data;
    const bgRgb = hexToRgb(palette.bg);
    const fgRgb = hexToRgb(fg);
    const ramp = colors.map(hexToRgb);

    for (let y = 0; y < rows; y++) {
      for (let x = 0; x < cols; x++) {
        const i = (y * cols + x) * 4;
        if (row[x]) {
          // ramp[0] обычно почти совпадает с фоном (тот же паттерн, что и
          // везде): при `y % ramp.length === 0` (например, самая первая
          // строка) живая клетка была бы неотличима от фона. Пропускаем
          // индекс 0 для "живых" клеток.
          const c = opts.colorMode === "Single color" ? fgRgb : ramp[1 + (y % (ramp.length - 1))];
          data[i] = c[0]; data[i + 1] = c[1]; data[i + 2] = c[2]; data[i + 3] = 255;
        } else {
          data[i] = bgRgb[0]; data[i + 1] = bgRgb[1]; data[i + 2] = bgRgb[2]; data[i + 3] = 255;
        }
      }
      const next = new Uint8Array(cols);
      for (let x = 0; x < cols; x++) {
        const l = row[(x - 1 + cols) % cols];
        const c = row[x];
        const r = row[(x + 1) % cols];
        const idx = (l << 2) | (c << 1) | r;
        next[x] = table[idx];
      }
      row = next;
    }

    const off = document.createElement("canvas");
    off.width = cols; off.height = rows;
    off.getContext("2d").putImageData(img, 0, 0);
    ctx.imageSmoothingEnabled = false;
    ctx.drawImage(off, 0, 0, cols, rows, 0, 0, w, h);

    if (opts.bgTint > 0) {
      ctx.fillStyle = `rgba(0,0,0,${opts.bgTint})`;
      ctx.fillRect(0, 0, w, h);
    }
  },
};

function hashSeed(seed) {
  const s = String(seed ?? "");
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); }
  return h >>> 0;
}
function hexToRgb(hex) {
  const h = hex.replace("#", "");
  const v = parseInt(h.length === 3 ? h.split("").map((c) => c + c).join("") : h, 16);
  return [(v >> 16) & 255, (v >> 8) & 255, v & 255];
}

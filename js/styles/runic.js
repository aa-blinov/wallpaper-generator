// Runic — магические руны: символы из Unicode, скомпонованные в стилизованную надпись.

const RUNES = [
  "ᚠ", "ᚢ", "ᚦ", "ᚨ", "ᚱ", "ᚲ", "ᚷ", "ᚹ", "ᚺ", "ᚾ",
  "ᛁ", "ᛂ", "ᛇ", "ᛈ", "ᛉ", "ᛊ", "ᛏ", "ᛒ", "ᛖ", "ᛗ",
  "ᛚ", "ᛜ", "ᛞ", "ᛟ", "ᛡ", "ᛣ", "ᛥ", "ᛧ", "ᛩ", "ᛪ",
];

export const runic = {
  id: "runic",
  name: "Runic",
  category: "Dots",
  blurb: "Arcane runes: Unicode glyphs on \"parchment\".",
  defaults: {
    rows: 8,
    cols: 8,
    size: 36,
    paletteMode: "Parchment",
    bgTint: 0,
  },
  params: [
    { key: "rows", label: "Rows", min: 4, max: 24, step: 1 },
    { key: "cols", label: "Columns", min: 4, max: 24, step: 1 },
    { key: "size", label: "Size", min: 16, max: 80, step: 2 },
    { key: "paletteMode", label: "Style", enum: ["Parchment", "Palette"] },
  ],

  createState(opts, w, h) {
    return { w, h };
  },

  paint(ctx, opts, state) {
    const { w, h } = state;
    const palette = opts.palette;
    const bg = opts.paletteMode === "Parchment" ? "#f3e6c4" : palette.bg;
    const fg = opts.paletteMode === "Parchment" ? "#3a2a14" : palette.colors[palette.colors.length - 1];
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, w, h);
    const rows = Math.max(2, Math.round(opts.rows));
    const cols = Math.max(2, Math.round(opts.cols));
    const cellW = w / cols, cellH = h / rows;
    ctx.font = `${opts.size}px serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillStyle = fg;
    for (let j = 0; j < rows; j++) {
      for (let i = 0; i < cols; i++) {
        const ch = RUNES[(i * 7 + j * 13) % RUNES.length];
        ctx.fillText(ch, i * cellW + cellW / 2, j * cellH + cellH / 2);
      }
    }
    if (opts.bgTint > 0) {
      ctx.fillStyle = `rgba(0,0,0,${opts.bgTint})`;
      ctx.fillRect(0, 0, w, h);
    }
  },
};

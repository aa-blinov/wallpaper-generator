// Echo — эхо-сигнал: затухающие копии одной кривой, разнесённые по углу.

export const echo = {
  id: "echo",
  name: "Echo Rings",
  category: "Organic",
  blurb: "Echo: a source curve and its fading copies, rotated around a circle.",
  defaults: {
    copies: 8,
    decay: 0.7,
    strokeWidth: 1.2,
    paletteMode: "By angle",
    bgTint: 0,
  },
  params: [
    { key: "copies", label: "Copies", min: 1, max: 24, step: 1 },
    { key: "decay", label: "Decay", min: 0.2, max: 1, step: 0.02 },
    { key: "strokeWidth", label: "Thickness", min: 0.3, max: 4, step: 0.1 },
    { key: "paletteMode", label: "Color", enum: ["By angle", "By distance", "Single color"] },
  ],

  createState(opts, w, h) {
    return { w, h };
  },

  paint(ctx, opts, state) {
    const { w, h } = state;
    const palette = opts.palette;
    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, w, h);
    const cx = w / 2, cy = h / 2;
    const copies = Math.round(opts.copies);
    const R = Math.min(w, h) * 0.3;
    const fg = palette.colors[palette.colors.length - 1];
    const cols = palette.colors;
    ctx.lineWidth = opts.strokeWidth;
    ctx.lineCap = "round";
    const samples = 240;
    // Исходная форма — параметрическое «лицо»: комбинация гармоник
    const basePath = [];
    for (let i = 0; i <= samples; i++) {
      const t = i / samples;
      const ang = t * Math.PI * 2;
      const r = R * (0.6 + 0.4 * Math.cos(ang * 3 + Math.sin(ang * 2)));
      basePath.push({ r, ang });
    }
    for (let i = 0; i < copies; i++) {
      const phi = (i / copies) * Math.PI * 2;
      const alpha = Math.pow(opts.decay, i);
      if (opts.paletteMode === "By angle") ctx.strokeStyle = cols[Math.floor(i / copies * (cols.length - 1))];
      else if (opts.paletteMode === "By distance") ctx.strokeStyle = cols[Math.floor(alpha * (cols.length - 1))];
      else ctx.strokeStyle = fg;
      ctx.globalAlpha = alpha;
      ctx.beginPath();
      for (let j = 0; j < basePath.length; j++) {
        const a = basePath[j].ang + phi;
        const x = cx + basePath[j].r * Math.cos(a);
        const y = cy + basePath[j].r * Math.sin(a);
        if (j === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
    if (opts.bgTint > 0) {
      ctx.fillStyle = `rgba(0,0,0,${opts.bgTint})`;
      ctx.fillRect(0, 0, w, h);
    }
  },
};

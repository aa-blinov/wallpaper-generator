// Flowsnake (Gosper curve) — L-system кривая, заполняющая плоскость.

export const flowsnake = {
  id: "flowsnake",
  name: "Flowsnake",
  category: "Algorithms",
  blurb: "Gosper curve (flowsnake) — an L-system fractal.",
  defaults: {
    iterations: 4,
    strokeWidth: 1.4,
    paletteMode: "By depth",
    bgTint: 0,
  },
  params: [
    { key: "iterations", label: "Iterations", min: 1, max: 6, step: 1 },
    { key: "strokeWidth", label: "Thickness", min: 0.4, max: 5, step: 0.1 },
    { key: "paletteMode", label: "Color", enum: ["By depth", "Single color"] },
  ],

  createState(opts, w, h) {
    return { w, h };
  },

  paint(ctx, opts, state) {
    const { w, h } = state;
    const palette = opts.palette;
    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, w, h);

    const n = Math.round(opts.iterations);
    // L-system: A -> A-B--B+A++A+B-- B -> +A-B--B-A++A+B
    let s = "A";
    for (let i = 0; i < n; i++) {
      let next = "";
      for (let c = 0; c < s.length; c++) {
        if (s[c] === "A") next += "A-B--B+A++A+B--";
        else if (s[c] === "B") next += "+A-B--B-A++A+B";
        else next += s[c];
      }
      s = next;
    }

    // Рисуем черепашкой с приращением угла 60°
    const ang = Math.PI / 3;
    let x = w / 2 - w * 0.3;
    let y = h * 0.5;
    const totalLen = w * 0.85;
    const len = totalLen / Math.pow(Math.sqrt(7), n);
    let dir = 0;
    ctx.lineWidth = opts.strokeWidth;
    ctx.lineCap = "round";
    const fg = palette.colors[palette.colors.length - 1];
    ctx.strokeStyle = fg;
    const segments = [];
    let cx = x, cy = y, cdir = dir;
    for (let i = 0; i < s.length; i++) {
      const c = s[i];
      if (c === "A" || c === "B") {
        const nx = cx + len * Math.cos(cdir);
        const ny = cy + len * Math.sin(cdir);
        segments.push([cx, cy, nx, ny, i]);
        cx = nx; cy = ny;
      } else if (c === "+") cdir += ang;
      else if (c === "-") cdir -= ang;
    }

    if (opts.paletteMode === "Single color") {
      ctx.beginPath();
      for (const [ax, ay, bx, by] of segments) {
        ctx.moveTo(ax, ay); ctx.lineTo(bx, by);
      }
      ctx.stroke();
    } else {
      // Цвет по индексу сегмента
      for (let i = 0; i < segments.length; i++) {
        const t = i / segments.length;
        const idx = Math.floor(t * (palette.colors.length - 1));
        ctx.strokeStyle = palette.colors[Math.max(0, Math.min(palette.colors.length - 1, idx))];
        ctx.beginPath();
        ctx.moveTo(segments[i][0], segments[i][1]);
        ctx.lineTo(segments[i][2], segments[i][3]);
        ctx.stroke();
      }
    }

    if (opts.bgTint > 0) {
      ctx.fillStyle = `rgba(0,0,0,${opts.bgTint})`;
      ctx.fillRect(0, 0, w, h);
    }
  },
};

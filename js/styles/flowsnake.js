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

    // Рисуем черепашкой с приращением угла 60°. Сначала в единичном
    // масштабе (len=1), чтобы честно вычислить bounding box — формула
    // totalLen/sqrt(7)^n предполагала теоретический охват кривой, но
    // реальный охват от неё отличался и давал то крошечную, то гигантскую
    // кривую в зависимости от n (как было с драконом).
    const ang = Math.PI / 3;
    let dir = 0;
    ctx.lineWidth = opts.strokeWidth;
    ctx.lineCap = "round";
    const fg = palette.colors[palette.colors.length - 1];
    ctx.strokeStyle = fg;
    const segments = [];
    let cx = 0, cy = 0, cdir = dir;
    let minX = 0, maxX = 0, minY = 0, maxY = 0;
    for (let i = 0; i < s.length; i++) {
      const c = s[i];
      if (c === "A" || c === "B") {
        const nx = cx + Math.cos(cdir);
        const ny = cy + Math.sin(cdir);
        segments.push([cx, cy, nx, ny, i]);
        cx = nx; cy = ny;
        if (cx < minX) minX = cx; else if (cx > maxX) maxX = cx;
        if (cy < minY) minY = cy; else if (cy > maxY) maxY = cy;
      } else if (c === "+") cdir += ang;
      else if (c === "-") cdir -= ang;
    }
    const bboxW = Math.max(1e-6, maxX - minX);
    const bboxH = Math.max(1e-6, maxY - minY);
    const scale = Math.min(w * 0.9 / bboxW, h * 0.9 / bboxH);
    const ox = w / 2 - (minX + maxX) / 2 * scale;
    const oy = h / 2 - (minY + maxY) / 2 * scale;
    for (const seg of segments) {
      seg[0] = ox + seg[0] * scale; seg[1] = oy + seg[1] * scale;
      seg[2] = ox + seg[2] * scale; seg[3] = oy + seg[3] * scale;
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

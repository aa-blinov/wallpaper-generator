// Compass — многолучевая роза ветров с N стрелками, метками и градациями.

export const compass = {
  id: "compass",
  name: "Compass Rose",
  category: "Geometry",
  blurb: "Compass rose: N arrows, rings and tick marks.",
  defaults: {
    points: 8,
    rings: 3,
    labelMode: "Simple",
    bgTint: 0,
  },
  params: [
    { key: "points", label: "Arrows", min: 3, max: 32, step: 1 },
    { key: "rings", label: "Rings", min: 1, max: 6, step: 1 },
    { key: "labelMode", label: "Tick marks", enum: ["Simple", "Degrees", "None"] },
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
    const R = Math.min(w, h) * 0.45;
    const N = Math.round(opts.points);
    const rings = Math.round(opts.rings);
    const cols = palette.colors;
    const fg = cols[cols.length - 1];

    // Кольца
    ctx.strokeStyle = cols[1] || fg;
    ctx.lineWidth = 0.6;
    for (let k = 1; k <= rings; k++) {
      ctx.beginPath();
      ctx.arc(cx, cy, R * k / rings, 0, Math.PI * 2);
      ctx.stroke();
    }

    // Стрелки
    for (let i = 0; i < N; i++) {
      const ang = (i / N) * Math.PI * 2 - Math.PI / 2;
      const x = cx + R * Math.cos(ang);
      const y = cy + R * Math.sin(ang);
      ctx.strokeStyle = i % 2 === 0 ? fg : cols[1] || fg;
      ctx.lineWidth = i % 2 === 0 ? 1.2 : 0.7;
      ctx.beginPath();
      ctx.moveTo(cx, cy);
      ctx.lineTo(x, y);
      ctx.stroke();
      // Стрелка-наконечник
      const head = 14;
      ctx.fillStyle = i % 2 === 0 ? fg : cols[1] || fg;
      ctx.beginPath();
      ctx.moveTo(x, y);
      ctx.lineTo(x - head * Math.cos(ang - 0.2), y - head * Math.sin(ang - 0.2));
      ctx.lineTo(x - head * Math.cos(ang + 0.2), y - head * Math.sin(ang + 0.2));
      ctx.closePath();
      ctx.fill();
      // Градусы/метки
      if (opts.labelMode !== "None") {
        ctx.fillStyle = fg;
        ctx.font = `${Math.max(10, R / 12)}px serif`;
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";
        const lx = cx + (R + 20) * Math.cos(ang);
        const ly = cy + (R + 20) * Math.sin(ang);
        const txt = opts.labelMode === "Degrees" ? `${(i * 360 / N).toFixed(0)}°` : "✦";
        ctx.fillText(txt, lx, ly);
      }
    }

    // Центральная точка
    ctx.fillStyle = fg;
    ctx.beginPath();
    ctx.arc(cx, cy, 4, 0, Math.PI * 2);
    ctx.fill();

    if (opts.bgTint > 0) {
      ctx.fillStyle = `rgba(0,0,0,${opts.bgTint})`;
      ctx.fillRect(0, 0, w, h);
    }
  },
};

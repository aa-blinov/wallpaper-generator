// Dragon Curve — фрактальная кривая Хартера-Хейтуэя. L-system подобный рекурсивный фолдинг.

export const dragon = {
  id: "dragon",
  name: "Dragon Curve",
  category: "Algorithms",
  blurb: "The Harter–Heighway dragon curve.",
  defaults: {
    iterations: 12,
    strokeWidth: 1.2,
    colorMode: "By depth",
    bgTint: 0,
  },
  params: [
    { key: "iterations", label: "Iterations", min: 4, max: 16, step: 1 },
    { key: "strokeWidth", label: "Thickness", min: 0.4, max: 4, step: 0.1 },
    { key: "colorMode", label: "Color", enum: ["By depth", "Single color"] },
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
    // Генерируем последовательность поворотов: +1/-1 для каждого следующего сегмента.
    // turn[i] = 1 если fold "right", -1 если "left"
    let turns = [1];
    for (let i = 0; i < n; i++) {
      const next = new Array(turns.length * 2 + 1);
      for (let j = 0; j < turns.length; j++) next[j] = turns[j];
      next[turns.length] = 1;
      for (let j = 0; j < turns.length; j++) next[turns.length + 1 + j] = -turns[turns.length - 1 - j];
      turns = next;
    }
    const segments = 1 << n;
    // Длина стороны: подгоняем под квадрат.
    const totalLen = Math.min(w, h) * 0.95;
    const len = totalLen / segments;
    // Начинаем из левого нижнего угла
    let x = w / 2 - totalLen / 2;
    let y = h / 2 + totalLen / 2;
    let dir = 0; // 0=right, 1=up, 2=left, 3=down
    const dx = [1, 0, -1, 0], dy = [0, -1, 0, 1];

    ctx.lineWidth = opts.strokeWidth;
    ctx.lineCap = "round";
    const colors = palette.colors;

    ctx.beginPath();
    ctx.moveTo(x, y);
    for (let i = 0; i < turns.length; i++) {
      dir = (dir + (turns[i] > 0 ? 1 : -1) + 4) % 4;
      x += dx[dir] * len;
      y += dy[dir] * len;
      ctx.lineTo(x, y);
    }
    if (opts.colorMode === "Single color") {
      ctx.strokeStyle = colors[colors.length - 1];
      ctx.stroke();
    } else {
      // Цвет постепенно меняется вдоль кривой
      for (let pass = 0; pass < 1; pass++) {
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(w / 2 - totalLen / 2, h / 2 + totalLen / 2);
        let cx = w / 2 - totalLen / 2, cy = h / 2 + totalLen / 2, cdir = 0;
        for (let i = 0; i < turns.length; i++) {
          const t = i / turns.length;
          ctx.strokeStyle = colors[(t * (colors.length - 1)) | 0];
          cdir = (cdir + (turns[i] > 0 ? 1 : -1) + 4) % 4;
          cx += dx[cdir] * len;
          cy += dy[cdir] * len;
          ctx.beginPath();
          ctx.moveTo(cx - dx[cdir] * len, cy - dy[cdir] * len);
          ctx.lineTo(cx, cy);
          ctx.stroke();
        }
      }
    }

    if (opts.bgTint > 0) {
      ctx.fillStyle = `rgba(0,0,0,${opts.bgTint})`;
      ctx.fillRect(0, 0, w, h);
    }
  },
};
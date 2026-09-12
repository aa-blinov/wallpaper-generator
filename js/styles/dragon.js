// Dragon Curve — фрактальная кривая Хартера-Хейтуэя. L-system подобный рекурсивный фолдинг.

export const dragon = {
  id: "dragon",
  name: "Dragon Curve",
  category: "Algorithms",
  blurb: "The Harter–Heighway dragon curve.",
  defaults: {
    iterations: 16,
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
    const dx = [1, 0, -1, 0], dy = [0, -1, 0, 1];

    // Проход в единичном масштабе (len=1), чтобы найти настоящий bounding
    // box кривой. Дракон складывается сам на себя, так что его bbox НЕ
    // растёт линейно с числом сегментов — фиксированный масштаб
    // totalLen/segments (как было раньше) давал то микроскопическую, то
    // огромную кривую в зависимости от n. Автофит — единственный надёжный
    // способ вписать её в кадр при любом n.
    let dir = 0, x = 0, y = 0;
    let minX = 0, maxX = 0, minY = 0, maxY = 0;
    const pts = new Float32Array((turns.length + 1) * 2);
    for (let i = 0; i < turns.length; i++) {
      dir = (dir + (turns[i] > 0 ? 1 : -1) + 4) % 4;
      x += dx[dir]; y += dy[dir];
      pts[(i + 1) * 2] = x; pts[(i + 1) * 2 + 1] = y;
      if (x < minX) minX = x; else if (x > maxX) maxX = x;
      if (y < minY) minY = y; else if (y > maxY) maxY = y;
    }
    const bboxW = Math.max(1, maxX - minX);
    const bboxH = Math.max(1, maxY - minY);
    // "contain"-fit по обеим осям отдельно — min(w,h)/max(bbox) был
    // излишне консервативен, если bbox не квадратный (недоиспользовал
    // широкий кадр).
    const scale = Math.min(w * 0.9 / bboxW, h * 0.9 / bboxH);
    const ox = w / 2 - (minX + maxX) / 2 * scale;
    const oy = h / 2 - (minY + maxY) / 2 * scale;

    ctx.lineWidth = opts.strokeWidth;
    ctx.lineCap = "round";
    const colors = palette.colors;

    if (opts.colorMode === "Single color") {
      ctx.strokeStyle = colors[colors.length - 1];
      ctx.beginPath();
      ctx.moveTo(ox + pts[0] * scale, oy + pts[1] * scale);
      for (let i = 1; i <= turns.length; i++) {
        ctx.lineTo(ox + pts[i * 2] * scale, oy + pts[i * 2 + 1] * scale);
      }
      ctx.stroke();
    } else {
      // Цвет постепенно меняется вдоль кривой
      for (let i = 1; i <= turns.length; i++) {
        const t = (i - 1) / turns.length;
        ctx.strokeStyle = colors[(t * (colors.length - 1)) | 0];
        ctx.beginPath();
        ctx.moveTo(ox + pts[(i - 1) * 2] * scale, oy + pts[(i - 1) * 2 + 1] * scale);
        ctx.lineTo(ox + pts[i * 2] * scale, oy + pts[i * 2 + 1] * scale);
        ctx.stroke();
      }
    }

    if (opts.bgTint > 0) {
      ctx.fillStyle = `rgba(0,0,0,${opts.bgTint})`;
      ctx.fillRect(0, 0, w, h);
    }
  },
};
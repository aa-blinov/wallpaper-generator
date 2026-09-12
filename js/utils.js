// Мелкие утилиты, общие для всех стилей.

export function clamp(v, lo, hi) {
  return v < lo ? lo : v > hi ? hi : v;
}

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function smoothstep(edge0, edge1, x) {
  const t = clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

// Заполняет канвас сплошным цветом
export function paintSolid(ctx, w, h, color) {
  ctx.fillStyle = color;
  ctx.fillRect(0, 0, w, h);
}

// Простой вертикальный / радиальный градиент для фона
export function paintBackground(ctx, w, h, palette) {
  // Радиальный градиент от центра: фон + один акцент.
  const cx = w / 2;
  const cy = h / 2;
  const r = Math.hypot(cx, cy);
  const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
  g.addColorStop(0, palette.colors[Math.min(2, palette.colors.length - 1)] || palette.bg);
  g.addColorStop(1, palette.bg);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, w, h);
}

// Миксер для globalAlpha-эффектов
export function withAlpha(ctx, alpha, fn) {
  ctx.globalAlpha = alpha;
  fn();
  ctx.globalAlpha = 1;
}

// Инициализация канваса под размер (с учётом DPR)
export function resizeCanvas(canvas, w, h, dpr = Math.min(2, window.devicePixelRatio || 1)) {
  canvas.width = Math.round(w * dpr);
  canvas.height = Math.round(h * dpr);
  const ctx = canvas.getContext("2d");
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  // Сглаживание при drawImage (сценарии когда стили рисуют в scratch-canvas
  // и перекладывают через drawImage — это основная масса createImageData-стилей).
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = "high";
  return ctx;
}

// Конвертация канваса в Blob (для скачивания / записи)
export function canvasToBlob(canvas, type = "image/png", quality) {
  return new Promise((resolve) => canvas.toBlob((b) => resolve(b), type, quality));
}

// Скачивание канваса как файла
export async function downloadCanvas(canvas, fileName, type = "image/png") {
  const blob = await canvasToBlob(canvas, type);
  if (!blob) return;
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 5000);
}

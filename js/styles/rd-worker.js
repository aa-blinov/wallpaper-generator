// Web Worker для Reaction-Diffusion (Gray-Scott).
// Запускает симуляцию в отдельном потоке, чтобы main thread не
// блокировался на heavy warmup или анимации.
//
// Протокол:
//   postMessage({type:'warmup', SW, SH, seed, steps, preset, presetTune})
//       → postMessage({type:'ready',   a, b, SW, SH, timings})
//   postMessage({type:'step', steps, feed, kill})
//       → postMessage({type:'stepped', a, b, timing})

const PRESETS = {
  coral: { feed: 0.0545, kill: 0.062 },
  mitosis: { feed: 0.0367, kill: 0.0649 },
  maze: { feed: 0.0290, kill: 0.057 },
  spots: { feed: 0.0300, kill: 0.062 },
  worms: { feed: 0.078, kill: 0.061 },
  fingerprint: { feed: 0.055, kill: 0.062 },
  solitons: { feed: 0.025, kill: 0.060 },
  holes: { feed: 0.039, kill: 0.058 },
};

let a, b, na, nb;
let W = 0, H = 0;
let feed = 0.0545, kill = 0.062;
// Da/Db — коэффициенты диффузии для невзвешенного 5-точечного Лапласиана
// (сумма соседей - 4×центр). При dt=1 схема устойчива только при Da<=0.25 —
// значения 1.0/0.5 (из reference-реализаций с 9-точечным weighted-кернелом)
// здесь давали численную неустойчивость (шахматный шум вместо кораллов/лабиринтов).
const Da = 0.2, Db = 0.1, dt = 1.0;

function mulberry32(seed) {
  let s = (seed | 0) || 1;
  return function () {
    s |= 0; s = (s + 0x6D2B79F5) | 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function initState(rng) {
  a = new Float32Array(W * H);
  b = new Float32Array(W * H);
  na = new Float32Array(W * H);
  nb = new Float32Array(W * H);
  // Старт: A≈1, B≈0 + редкий шум.
  for (let i = 0; i < a.length; i++) {
    a[i] = 1 - rng() * 0.05;
    b[i] = rng() * 0.05;
  }
  // 18 круглых семян B=1, чтобы стартовать формирование узора.
  const SEEDS = 18;
  for (let s = 0; s < SEEDS; s++) {
    const cx = (rng() * W) | 0;
    const cy = (rng() * H) | 0;
    const r = 3 + ((rng() * 5) | 0);
    for (let y = Math.max(0, cy - r); y < Math.min(H, cy + r); y++) {
      const dy = y - cy;
      const yy = y * W;
      for (let x = Math.max(0, cx - r); x < Math.min(W, cx + r); x++) {
        const dx = x - cx;
        if (dx * dx + dy * dy < r * r) {
          b[yy + x] = 1;
          a[yy + x] = 0;
        }
      }
    }
  }
}

function stepN(n) {
  for (let s = 0; s < n; s++) {
    // Фаза обновления: считаем na/nb на основе a/b текущей итерации.
    for (let y = 0; y < H; y++) {
      const ym = (y === 0 ? H - 1 : y - 1);
      const yp = (y === H - 1 ? 0 : y + 1);
      const yW = y * W;
      const ymW = ym * W;
      const ypW = yp * W;
      for (let x = 0; x < W; x++) {
        const xm = (x === 0 ? W - 1 : x - 1);
        const xp = (x === W - 1 ? 0 : x + 1);
        const i = yW + x;
        const A = a[i];
        const B = b[i];
        const lapA = a[yW + xm] + a[yW + xp] + a[ymW + x] + a[ypW + x] - 4 * A;
        const lapB = b[yW + xm] + b[yW + xp] + b[ymW + x] + b[ypW + x] - 4 * B;
        const r = A * B * B;
        na[i] = A + (Da * lapA - r + feed * (1 - A)) * dt;
        nb[i] = B + (Db * lapB + r - (kill + feed) * B) * dt;
      }
    }
    // Копируем + clamp.
    for (let i = 0; i < a.length; i++) {
      let va = na[i];
      let vb = nb[i];
      if (!Number.isFinite(va)) va = 1;
      if (!Number.isFinite(vb)) vb = 0;
      a[i] = va < 0 ? 0 : va > 1 ? 1 : va;
      b[i] = vb < 0 ? 0 : vb > 1 ? 1 : vb;
    }
  }
}

self.onmessage = function (e) {
  const msg = e.data;
  if (msg.type === 'warmup') {
    const t0 = performance.now();
    W = msg.SW;
    H = msg.SH;
    const seedNum = typeof msg.seed === 'number'
      ? msg.seed
      : (function (s) {
          let h = 2166136261;
          for (let i = 0; i < s.length; i++) {
            h ^= s.charCodeAt(i);
            h = Math.imul(h, 16777619);
          }
          return h >>> 0;
        })(String(msg.seed ?? ''));
    const rng = mulberry32(seedNum);
    const t1 = performance.now();
    initState(rng);
    const t2 = performance.now();
    const preset = PRESETS[msg.preset] || PRESETS.coral;
    feed = preset.feed + (msg.presetTune || 0) * 5;
    kill = preset.kill + (msg.presetTune || 0) * 5;
    stepN(msg.steps || 4000);
    const t3 = performance.now();
    // Возвращаем копии (без transferable — main может пользоваться ими многократно).
    self.postMessage({
      type: 'ready',
      a: new Float32Array(a),
      b: new Float32Array(b),
      SW: W,
      SH: H,
      timings: {
        initSeed: +(t1 - t0).toFixed(1),
        initState: +(t2 - t1).toFixed(1),
        warmup: +(t3 - t2).toFixed(1),
        total: +(t3 - t0).toFixed(1),
      },
    });
  } else if (msg.type === 'step') {
    const t0 = performance.now();
    if (typeof msg.feed === 'number') feed = msg.feed;
    if (typeof msg.kill === 'number') kill = msg.kill;
    stepN(msg.steps || 1);
    const t1 = performance.now();
    self.postMessage({
      type: 'stepped',
      a: new Float32Array(a),
      b: new Float32Array(b),
      timing: +(t1 - t0).toFixed(1),
    });
  } else if (msg.type === 'reset') {
    // Перезапуск: тот же seed применяется заново с новыми параметрами.
    const t0 = performance.now();
    W = msg.SW;
    H = msg.SH;
    const seedNum = typeof msg.seed === 'number'
      ? msg.seed
      : (function (s) {
          let h = 2166136261;
          for (let i = 0; i < s.length; i++) {
            h ^= s.charCodeAt(i);
            h = Math.imul(h, 16777619);
          }
          return h >>> 0;
        })(String(msg.seed ?? ''));
    const rng = mulberry32(seedNum);
    initState(rng);
    const t1 = performance.now();
    const preset = PRESETS[msg.preset] || PRESETS.coral;
    feed = preset.feed + (msg.presetTune || 0) * 5;
    kill = preset.kill + (msg.presetTune || 0) * 5;
    stepN(msg.warmupSteps || 4000);
    const t2 = performance.now();
    self.postMessage({
      type: 'ready',
      a: new Float32Array(a),
      b: new Float32Array(b),
      SW: W,
      SH: H,
      timings: {
        initState: +(t1 - t0).toFixed(1),
        warmup: +(t2 - t1).toFixed(1),
        total: +(t2 - t0).toFixed(1),
      },
    });
  }
};

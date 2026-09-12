// L-System Tree — фрактальное дерево, вырастающее из начального "F" согласно
// правилам подстановки (F → F[+F]F[-F]F). Рисуется стэк-интерпретатором через
// черепаху (turtle graphics).

import { makeRng } from "../rng.js";
import { makeColorRamp } from "../palettes.js";

const RULES = {
  tree:        { axiom: "F", rules: { F: "F[+F]F[-F][F]" }, angle: 22, lenMul: 0.75 },
  fern:        { axiom: "X", rules: { X: "F+[[X]-X]-F[-FX]+X", F: "FF" }, angle: 25, lenMul: 0.45 },
  bush:        { axiom: "F", rules: { F: "FF-[-F+F+F]+[+F-F-F]" }, angle: 22, lenMul: 0.6 },
  spirals:     { axiom: "F", rules: { F: "F[+F]F[-F]F" }, angle: 35, lenMul: 0.7 },
  algae:       { axiom: "F", rules: { F: "F[+FF][-FF]F[-F][+F]F" }, angle: 27, lenMul: 0.5 },
};

function expand(axiom, rules, iter) {
  let s = axiom;
  for (let n = 0; n < iter; n++) {
    let next = "";
    for (let i = 0; i < s.length; i++) {
      const c = s[i];
      next += rules[c] ?? c;
    }
    s = next;
    if (s.length > 200000) break; // защита
  }
  return s;
}

function turtle(s, opts, ctx, palette, ramp) {
  const angle = (opts.angleDeg || RULES[opts.preset]?.angle || 22) * Math.PI / 180;
  const len = opts.startLength || 8;
  const lenMul = RULES[opts.preset]?.lenMul || 0.7;
  const wMul = opts.widthMul || 0.75;
  const depth = opts.iterations || 4;
  const cx = opts.centerX * 1, cy = opts.centerY * 1;
  const x = opts.startX || 0.5 * window.innerWidth || 960;
  const y = opts.startY || 0.95 * window.innerHeight || 1080;
  const angle0 = (opts.startAngleDeg || -90) * Math.PI / 180;

  const stack = [];
  let px = x, py = y, dir = angle0, l = len, lineW = opts.startWidth || 4;
  for (let i = 0; i < s.length; i++) {
    const c = s[i];
    if (c === "F") {
      const nx = px + Math.cos(dir) * l;
      const ny = py + Math.sin(dir) * l;
      ctx.lineWidth = Math.max(0.5, lineW);
      ctx.beginPath();
      ctx.moveTo(px, py);
      ctx.lineTo(nx, ny);
      ctx.stroke();
      px = nx;
      py = ny;
      l *= lenMul;
      lineW *= wMul;
    } else if (c === "+") {
      dir += angle;
    } else if (c === "-") {
      dir -= angle;
    } else if (c === "[") {
      stack.push({ x: px, y: py, dir, l, lineW });
    } else if (c === "]") {
      const st = stack.pop();
      if (st) {
        px = st.x;
        py = st.y;
        dir = st.dir;
        l = st.l;
        lineW = st.lineW;
      }
    }
  }
}

export const lsystem = {
  id: "lsystem",
  name: "L-System Trees",
  category: "Algorithms",
  blurb: "Fractal trees via an L-system — turtle graphics.",
  defaults: {
    preset: "tree",
    iterations: 5,
    startAngleDeg: -90,
    angleDeg: 22,
    startLength: 230,
    lenMul: 0.78,
    startWidth: 8,
    widthMul: 0.78,
    colorMode: "Depth",
    bgTint: 0,
  },
  params: [
    { key: "preset", label: "Preset", enum: ["tree", "fern", "bush", "spirals", "algae"] },
    { key: "iterations", label: "Iterations", min: 1, max: 7, step: 1 },
    { key: "angleDeg", label: "Rotation angle", min: 5, max: 60, step: 1 },
    { key: "startLength", label: "Branch length", min: 4, max: 60, step: 1 },
    { key: "lenMul", label: "Branch shortening", min: 0.4, max: 0.95, step: 0.01 },
    { key: "startWidth", label: "Trunk thickness", min: 1, max: 20, step: 0.5 },
    { key: "widthMul", label: "Taper", min: 0.4, max: 0.95, step: 0.01 },
    { key: "startAngleDeg", label: "Start angle", min: -180, max: 180, step: 5, format: (v) => `${v.toFixed(0)}°` },
    { key: "colorMode", label: "Color", enum: ["Depth", "Length", "Random"] },
    { key: "bgTint", label: "Blend with background", min: 0, max: 1, step: 0.02 },
  ],

  createState(opts, w, h) {
    const rng = makeRng(opts.seed + ":lsy");
    const ramp = makeColorRamp(opts.palette.colors);
    const preset = RULES[opts.preset] || RULES.tree;
    const iters = Math.min(opts.iterations || 4, 6);
    const expanded = expand(preset.axiom, preset.rules, iters);
    return { expanded, ramp, rng, preset, w, h };
  },

  paint(ctx, opts, state) {
    const { w, h, expanded, ramp, rng, preset } = state;
    const palette = opts.palette;
    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, w, h);

    const angle = (opts.angleDeg || preset.angle) * Math.PI / 180;
    const startX = w / 2;
    const startY = h * (opts.startAngleDeg < -45 ? 0.95 : 0.5);
    let px = startX, py = startY;
    let dir = (opts.startAngleDeg || -90) * Math.PI / 180;
    // Автоскейлинг: подбираем длину ветки, чтобы дерево занимало ~75% высоты.
    const targetH = h * 0.75;
    const iters = opts.iterations || 5;
    const lenMul0 = opts.lenMul || 0.78;
    const depthSum = (1 - Math.pow(lenMul0, iters)) / (1 - lenMul0);
    let l = targetH / (depthSum * 1.6);
    let lineW = opts.startWidth;
    const lenMul = opts.lenMul;
    const widthMul = opts.widthMul;
    const colorMode = opts.colorMode;

    const stack = [];
    let depth = 0;
    let maxDepth = 1;
    // Первый проход — посчитать глубины по стеку.
    {
      let d = 0;
      let track = [];
      const tstack = [];
      track.push(d);
      let tl = l;
      for (let i = 0; i < expanded.length; i++) {
        const c = expanded[i];
        if (c === "[") { d++; track.push(d); tstack.push(d); }
        else if (c === "]") { d = tstack.pop() ?? d; track.push(d); }
        else if (c === "F") { track.push(d); tl *= lenMul; if (d > maxDepth) maxDepth = d; }
      }
      track.length = 0;
      depth = 0;
    }

    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    for (let i = 0; i < expanded.length; i++) {
      const c = expanded[i];
      if (c === "F") {
        const nx = px + Math.cos(dir) * l;
        const ny = py + Math.sin(dir) * l;
        ctx.lineWidth = Math.max(0.4, lineW);
        let t;
        if (colorMode === "Depth") t = 1 - depth / Math.max(1, maxDepth);
        else if (colorMode === "Length") t = Math.max(0, Math.min(1, 1 - l / Math.max(1, opts.startLength)));
        else t = rng();
        ctx.strokeStyle = ramp(t);
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(nx, ny);
        ctx.stroke();
        px = nx;
        py = ny;
        l *= lenMul;
        lineW *= widthMul;
      } else if (c === "+") {
        dir += angle + (rng() - 0.5) * 0.05;
      } else if (c === "-") {
        dir -= angle + (rng() - 0.5) * 0.05;
      } else if (c === "[") {
        depth++;
        stack.push({ x: px, y: py, dir, l, lineW, depth });
      } else if (c === "]") {
        const st = stack.pop();
        if (st) {
          px = st.x;
          py = st.y;
          dir = st.dir;
          l = st.l;
          lineW = st.lineW;
          depth = st.depth;
        }
      }
    }

    if (opts.bgTint > 0) {
      ctx.fillStyle = `rgba(0,0,0,${opts.bgTint})`;
      ctx.fillRect(0, 0, w, h);
    }
  },

  animate(ctx, opts, state, t) {
    // Лёгкое "breathing" — меняем стартовый угол.
    opts.startAngleDeg = -90 + Math.sin(t * 0.00015) * 6;
    this.paint(ctx, opts, state);
  },
};

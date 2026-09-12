// Boids — Reynolds' flocking rules (separation, alignment, cohesion). Unlike
// curlflow, where particles just follow a fixed vector field, these agents
// react to each other — the swirl and clustering is emergent, not sampled
// from a formula.

import { makeRng } from "../rng.js";
import { makeColorRamp } from "../palettes.js";

export const boids = {
  id: "boids",
  name: "Boids Flocking",
  category: "Flow",
  blurb: "Separation, alignment, cohesion — flock trails that emerge, not a field they follow.",
  defaults: {
    count: 140,
    steps: 260,
    perception: 70,
    maxSpeed: 3.2,
    trailOpacity: 0.28,
    lineWidth: 1.3,
  },
  params: [
    { key: "count", label: "Flock size", min: 30, max: 400, step: 10 },
    { key: "steps", label: "Trail length", min: 60, max: 600, step: 10 },
    { key: "perception", label: "Perception radius", min: 20, max: 160, step: 5 },
    { key: "maxSpeed", label: "Max speed", min: 1, max: 8, step: 0.2 },
    { key: "trailOpacity", label: "Trail opacity", min: 0.02, max: 0.5, step: 0.01 },
    { key: "lineWidth", label: "Line thickness", min: 0.3, max: 3, step: 0.1 },
  ],

  createState(opts, w, h) {
    const rng = makeRng(opts.seed + ":boids");
    const ramp = makeColorRamp(opts.palette.colors);
    return { rng, ramp, w, h };
  },

  paint(ctx, opts, state) {
    const { w, h, rng, ramp } = state;
    const palette = opts.palette;
    ctx.fillStyle = palette.bg;
    ctx.fillRect(0, 0, w, h);

    const N = Math.round(opts.count);
    const steps = Math.round(opts.steps);
    const perception = opts.perception;
    const perception2 = perception * perception;
    const maxSpeed = opts.maxSpeed;
    const sepRadius2 = (perception * 0.4) ** 2;

    const px = new Float64Array(N), py = new Float64Array(N);
    const vx = new Float64Array(N), vy = new Float64Array(N);
    for (let i = 0; i < N; i++) {
      px[i] = rng() * w; py[i] = rng() * h;
      const ang = rng() * Math.PI * 2;
      vx[i] = Math.cos(ang) * maxSpeed * 0.5;
      vy[i] = Math.sin(ang) * maxSpeed * 0.5;
    }

    const trailX = new Float64Array(N * steps);
    const trailY = new Float64Array(N * steps);

    for (let s = 0; s < steps; s++) {
      for (let i = 0; i < N; i++) {
        let alignX = 0, alignY = 0, cohX = 0, cohY = 0, sepX = 0, sepY = 0, n = 0;
        for (let j = 0; j < N; j++) {
          if (j === i) continue;
          const dx = px[j] - px[i], dy = py[j] - py[i];
          const d2 = dx * dx + dy * dy;
          if (d2 > perception2) continue;
          alignX += vx[j]; alignY += vy[j];
          cohX += px[j]; cohY += py[j];
          n++;
          if (d2 < sepRadius2 && d2 > 1e-6) { sepX -= dx / d2; sepY -= dy / d2; }
        }
        if (n > 0) {
          alignX /= n; alignY /= n;
          cohX = cohX / n - px[i]; cohY = cohY / n - py[i];
          vx[i] += alignX * 0.02 + cohX * 0.0006 + sepX * 1.2;
          vy[i] += alignY * 0.02 + cohY * 0.0006 + sepY * 1.2;
        }
        // Gentle pull back toward the canvas if drifting off-frame.
        if (px[i] < 0) vx[i] += 0.15; else if (px[i] > w) vx[i] -= 0.15;
        if (py[i] < 0) vy[i] += 0.15; else if (py[i] > h) vy[i] -= 0.15;
        const sp = Math.hypot(vx[i], vy[i]) || 1;
        const cl = Math.min(sp, maxSpeed) / sp;
        vx[i] *= cl; vy[i] *= cl;
        px[i] += vx[i]; py[i] += vy[i];
        trailX[i * steps + s] = px[i];
        trailY[i * steps + s] = py[i];
      }
    }

    ctx.lineCap = "round";
    ctx.lineWidth = opts.lineWidth;
    ctx.globalAlpha = opts.trailOpacity;
    for (let i = 0; i < N; i++) {
      ctx.strokeStyle = ramp(i / N);
      ctx.beginPath();
      ctx.moveTo(trailX[i * steps], trailY[i * steps]);
      for (let s = 1; s < steps; s++) ctx.lineTo(trailX[i * steps + s], trailY[i * steps + s]);
      ctx.stroke();
    }
    ctx.globalAlpha = 1;
  },
};

// Seedable PRNG (Mulberry32) — позволяет повторять результаты по сиду.
export function makeRng(seedStr) {
  let s = 0;
  const text = String(seedStr ?? "");
  for (let i = 0; i < text.length; i++) {
    s = (s * 31 + text.charCodeAt(i)) | 0;
  }
  if (s === 0) s = 1;
  let a = s >>> 0;
  return function rng() {
    a |= 0;
    a = (a + 0x6D2B79F5) | 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function rngInt(rng, lo, hi) {
  return lo + Math.floor(rng() * (hi - lo + 1));
}

export function rngPick(rng, arr) {
  return arr[Math.floor(rng() * arr.length)];
}

export function rngRange(rng, lo, hi) {
  return lo + rng() * (hi - lo);
}

// Главный оркестратор: связывает UI, реестр стилей и канвас.

import { STYLES, getStyle, listStyles, CATEGORIES, stylesByCategory } from "./styles.js";
import { PALETTES, getPalette } from "./palettes.js";
import { resizeCanvas, downloadCanvas } from "./utils.js";

const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));

// ---------- Состояние ----------
const state = {
  styleId: STYLES[0].id,
  paletteId: PALETTES[0].id,
  seed: String(Math.floor(Math.random() * 9999999)),
  resolution: "1920x1080",
  mode: "static",           // static | animated
  animSpeed: 60,            // 0..200 — коэффициент скорости
  params: { ...STYLES[0].defaults },
  lite: false,              // lite-режим без UI (для шеринга URL с ?lite=1)
  running: false,
  startedAt: 0,
  raf: 0,
  recorder: null,
  recChunks: [],
};

// ---------- DOM ----------
const canvas = $("#canvas");
// willReadFrequently: true — у Chrome/FF это включает быстрый 2D-путь
// для getImageData (используется экспортером PNG и хэш-аудитом).
const ctx = canvas.getContext("2d", { willReadFrequently: true, alpha: false });
const canvasWrap = $("#canvasWrap");

let CANVAS_W = 1920, CANVAS_H = 1080;
let renderState = null;  // последний созданный state стиля

// ---------- Инициализация UI ----------
function initStyleList() {
  const host = $("#styleList");
  host.innerHTML = "";
  const groups = stylesByCategory();
  let idx = 0;
  for (const cat of CATEGORIES) {
    const items = groups[cat] || [];
    if (!items.length) continue;
    const head = document.createElement("h3");
    head.textContent = cat;
    host.appendChild(head);
    for (const s of items) {
      const btn = document.createElement("button");
      btn.className = "style-item";
      btn.type = "button";
      btn.dataset.style = s.id;
      btn.dataset.index = idx;
      btn.setAttribute("role", "tab");
      if (s.id === state.styleId) {
        btn.classList.add("active");
        btn.setAttribute("aria-current", "true");
        btn.setAttribute("aria-selected", "true");
      }
      btn.setAttribute("aria-label", `${s.name} — ${s.blurb}`);
      btn.tabIndex = 0;
      btn.innerHTML = `<span class="name">${escapeHTML(s.name)}</span><span class="blurb">${escapeHTML(s.blurb)}</span>`;
      btn.addEventListener("click", () => switchStyle(s.id));
      host.appendChild(btn);
      idx++;
    }
  }
  // Search filter с дебаунсом 120мс: на каждое нажатие фильтровать 105 стилей — лишняя работа.
  const search = $("#styleSearch");
  if (search) {
    let searchTimer = 0;
    const applySearch = () => {
      const q = search.value.trim().toLowerCase();
      const items = host.querySelectorAll(".style-item");
      for (const it of items) {
        const text = (it.textContent || "").toLowerCase();
        it.style.display = (!q || text.includes(q)) ? "" : "none";
      }
      // скрываем заголовки категорий, у которых не видно ни одного потомка
      const all = Array.from(host.children);
      let i = 0;
      while (i < all.length) {
        const el = all[i];
        if (el.tagName === "H3") {
          let hasVisible = false;
          let j = i + 1;
          while (j < all.length && all[j].tagName !== "H3") {
            if (all[j].style.display !== "none") { hasVisible = true; break; }
            j++;
          }
          el.style.display = hasVisible ? "" : "none";
          i = j;
        } else {
          i++;
        }
      }
    };
    search.addEventListener("input", () => {
      clearTimeout(searchTimer);
      searchTimer = setTimeout(applySearch, 120);
    });
  }
}

function initPaletteList() {
  const host = $("#paletteList");
  host.innerHTML = "";
  for (const p of PALETTES) {
    const sw = document.createElement("button");
    sw.className = "swatch";
    sw.type = "button";
    sw.title = p.name;
    sw.style.setProperty("--bg", `linear-gradient(135deg, ${p.colors.join(", ")})`);
    sw.dataset.id = p.id;
    sw.setAttribute("role", "radio");
    sw.setAttribute("aria-checked", String(p.id === state.paletteId));
    sw.setAttribute("aria-label", p.name);
    if (p.id === state.paletteId) sw.classList.add("active");
    sw.addEventListener("click", () => switchPalette(p.id));
    host.appendChild(sw);
  }
}

function initParams() {
  const host = $("#paramsHost");
  host.innerHTML = "";
  const def = getStyle(state.styleId);
  for (const p of def.params) {
    const wrap = document.createElement("label");
    wrap.className = "field";

    const head = document.createElement("div");
    head.className = "d-flex justify-content-between align-items-baseline mb-1";
    const lbl = document.createElement("span");
    lbl.className = "form-label";
    lbl.textContent = p.label;
    head.appendChild(lbl);

    let input;
    let valEl;
    if (p.enum) {
      input = document.createElement("select");
      input.className = "form-select form-select-sm";
      input.id = `param-${p.key}`;
      lbl.htmlFor = input.id;
      for (const v of p.enum) {
        const o = document.createElement("option");
        o.value = v;
        o.textContent = v;
        if (state.params[p.key] === v) o.selected = true;
        input.appendChild(o);
      }
      input.addEventListener("change", () => { state.params[p.key] = input.value; scheduleRender(); });
      wrap.appendChild(head);
      wrap.appendChild(input);
    } else {
      input = document.createElement("input");
      input.type = "range";
      input.className = "form-range";
      input.id = `param-${p.key}`;
      lbl.htmlFor = input.id;
      input.min = p.min;
      input.max = p.max;
      input.step = p.step;
      input.value = state.params[p.key] ?? def.defaults[p.key];
      input.setAttribute("aria-valuemin", String(p.min));
      input.setAttribute("aria-valuemax", String(p.max));
      input.setAttribute("aria-label", `${p.label} (${p.min}…${p.max})`);
      valEl = document.createElement("span");
      valEl.className = "badge text-bg-secondary row-val";
      const fmt = p.format ?? ((v) => {
        const n = Number(v);
        const abs = Math.abs(n);
        if (abs > 0 && abs < 0.01) return n.toPrecision(2);
        return n.toFixed(2);
      });
      const updateVal = () => {
        const v = +input.value;
        valEl.textContent = fmt(v);
        input.setAttribute("aria-valuenow", String(v));
        updateRangeFill(input);
      };
      updateVal();
      input.addEventListener("input", () => {
        state.params[p.key] = +input.value;
        updateVal();
        scheduleRender();
      });
      head.appendChild(valEl);
      wrap.appendChild(head);
      wrap.appendChild(input);
    }
    host.appendChild(wrap);
  }
}

function updateRangeFill(input) {
  const min = +input.min, max = +input.max, v = +input.value;
  const pct = ((v - min) / (max - min)) * 100;
  input.style.setProperty("--fill", `${pct}%`);
}

function initBaseControls() {
  $("#seedInput").value = state.seed;
  $("#resolution").value = state.resolution;
  $("#animSpeed").value = state.animSpeed;
  updateRangeFill($("#animSpeed"));

  $("#seedInput").addEventListener("change", (e) => {
    state.seed = e.target.value || "0";
    scheduleRender({ heavy: true });
    updateUrlHash();
  });
  $("#seedRandom").addEventListener("click", () => {
    state.seed = String(Math.floor(Math.random() * 9999999));
    $("#seedInput").value = state.seed;
    scheduleRender({ heavy: true });
    updateUrlHash();
  });
  $("#regenerate").addEventListener("click", () => {
    state.seed = String(Math.floor(Math.random() * 9999999));
    $("#seedInput").value = state.seed;
    scheduleRender({ heavy: true });
    updateUrlHash();
  });
  $("#resolution").addEventListener("change", (e) => {
    state.resolution = e.target.value;
    applyResolution();
    scheduleRender({ heavy: true });
    updateHud();
  });

  $$("#modeTabs button").forEach((b) =>
    b.addEventListener("click", () => switchMode(b.dataset.mode))
  );

  $("#animSpeed").addEventListener("input", (e) => {
    state.animSpeed = +e.target.value;
    updateRangeFill(e.target);
  });

  $("#exportPng").addEventListener("click", exportPng);
  $("#exportWebm").addEventListener("click", exportWebm);
}

function switchStyle(id) {
  state.styleId = id;
  $$("#styleList .style-item").forEach((b) => {
    const active = b.dataset.style === id;
    b.classList.toggle("active", active);
    if (active) {
      b.setAttribute("aria-current", "true");
      b.setAttribute("aria-selected", "true");
    } else {
      b.removeAttribute("aria-current");
      b.removeAttribute("aria-selected");
    }
  });
  const def = getStyle(id);
  state.params = { ...def.defaults };
  initParams();
  updateModeAvailability();
  scheduleRender({ heavy: true });
  updateUrlHash();
}

// Большинство стилей не реализуют animate() (это чисто статичные узоры) —
// startAnimation() раньше всё равно вызывал style.animate(...) вслепую,
// что бросало исключение на первом кадре и молча зависало с активной
// вкладкой "Animated", ничего не делая. Прячем/дизейблим вкладку и
// откатываемся на static при переключении на такой стиль.
function updateModeAvailability() {
  const supportsAnimation = typeof getStyle(state.styleId).animate === "function";
  const animBtn = $('#modeTabs button[data-mode="animated"]');
  if (animBtn) {
    animBtn.disabled = !supportsAnimation;
    animBtn.title = supportsAnimation ? "" : "This style has no animated mode";
  }
  if (!supportsAnimation && state.mode === "animated") switchMode("static");
}

function switchPalette(id) {
  state.paletteId = id;
  $$(".palette-list .swatch").forEach((s) => {
    const active = s.dataset.id === id;
    s.classList.toggle("active", active);
    s.setAttribute("aria-checked", String(active));
  });
  scheduleRender({ heavy: true });
  updateUrlHash();
}

function switchMode(mode) {
  state.mode = mode;
  $$("#modeTabs button").forEach((b) =>
    b.classList.toggle("active", b.dataset.mode === mode)
  );
  const speedField = $("#animSpeedField");
  const exportBtn = $("#exportWebm");
  if (mode === "animated") {
    speedField.hidden = false;
    exportBtn.hidden = false;
    if (!state.running) startAnimation();
  } else {
    speedField.hidden = true;
    exportBtn.hidden = true;
    stopAnimation();
    scheduleRender({ heavy: true });
  }
}

function applyResolution() {
  const [w, h] = state.resolution.split("x").map(Number);
  CANVAS_W = w; CANVAS_H = h;
  resizeCanvas(canvas, w, h);
  // CSS-размер wrap не задаём: канвас сам подгоняется через
  // max-width/max-height: 100% + flex-center на wrap. Картинка центруется
  // по центру экрана и помещается целиком, без полей по краям.
  canvasWrap.style.width = "";
  canvasWrap.style.height = "";
}

// ---------- Loader / тосты ----------
const overlayEl = document.getElementById("overlay");
const overlayText = document.getElementById("overlayText");
const overlaySub = document.getElementById("overlaySub");
const toastEl = document.getElementById("toast");
let toastTimer = 0;

function showOverlay(label, sub) {
  if (overlayText) overlayText.textContent = label || "Generating…";
  if (overlaySub) overlaySub.textContent = sub || "";
  if (overlayEl) {
    overlayEl.classList.remove("error");
    overlayEl.hidden = false;
  }
}
function showOverlayError(label, sub) {
  if (overlayText) overlayText.textContent = label || "Error";
  if (overlaySub) overlaySub.textContent = sub || "";
  if (overlayEl) {
    overlayEl.classList.add("error");
    overlayEl.hidden = false;
  }
}
function hideOverlay() {
  if (overlayEl) overlayEl.hidden = true;
}
function showToast(msg, kind) {
  if (!toastEl) return;
  toastEl.innerHTML = msg;
  toastEl.classList.remove("warn", "error");
  if (kind === "warn") toastEl.classList.add("warn");
  if (kind === "error") toastEl.classList.add("error");
  toastEl.hidden = false;
  // double-rAF чтобы transition сработало (hidden→show)
  requestAnimationFrame(() => toastEl.classList.add("show"));
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => {
    toastEl.classList.remove("show");
    setTimeout(() => { toastEl.hidden = true; }, 250);
  }, 1800);
}
function formatMs(dt) {
  if (!Number.isFinite(dt)) return "? ms";
  if (dt < 1000) return `${dt.toFixed(0)} ms`;
  return `${(dt / 1000).toFixed(2)} s`;
}

// Обёртка: показывает overlay, даёт браузеру отрисовать его (2 rAF),
// запускает тяжёлую работу, по окончании — прячет overlay и тостит со временем.
// Если work() вернёт false — overlay не закрываем (ждём асинхронных данных).
function runWithLoader(label, sub, work) {
  showOverlay(label, sub);
  requestAnimationFrame(() => requestAnimationFrame(() => {
    const t0 = performance.now();
    let keepOpen = false;
    let result;
    try {
      result = work();
    } catch (e) {
      console.error("[wallpaper] render error:", e);
      const msg = e && e.stack ? e.stack : (e.message || String(e));
      showOverlayError("Error", String(msg).slice(0, 600));
      showToast(`Error: <strong>${escapeHTML(e.message || String(e))}</strong>`, "error");
      return;
    }
    if (result === false) {
      keepOpen = true;
    }
    if (keepOpen) {
      // Оверлей остаётся — ждём асинхронного ответа от воркера.
      // Спиннер продолжает крутиться. Когда worker ответит и вызовет
      // scheduleRender, мы снова пройдём через этот loader с реальной отрисовкой.
      return;
    }
    const dt = performance.now() - t0;
    hideOverlay();
    showToast(`Done in <strong>${formatMs(dt)}</strong>`);
  }));
}

function escapeHTML(s) {
  return String(s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
}

// ---------- Рендер ----------
// Планировщик:
//   scheduleRender({heavy}) - ставит pending-флаг и RAF.
//   тяжёлые изменения (style/palette/seed/resolution) идут с heavy=true и
//   показывают overlay+spinner; слайдер-инпуты идут с heavy=false и просто
//   рендерят следующий кадр без overlay.
// renderToken инкрементируется на каждый запрос — если style.paint идёт, а
// пользователь прислал новый запрос, старый render отбрасывает свой результат.
let renderPending = false;
let pendingHeavy = false;
let renderBusy = false;
let renderToken = 0;

function scheduleRender(opts = {}) {
  const forceRebuild = !!opts.forceRebuild;
  const heavy = !!opts.heavy;
  renderPending = true;
  pendingHeavy = pendingHeavy || heavy;
  if (forceRebuild) renderState = null;
  renderToken++;
  if (state.running) {
    // Анимированный: цикл сам подхватит новые state.params,
    // но state.inner нужно пересоздать — рестартуем цикл.
    startAnimation();
    return;
  }
  // Если уже рисуем — новый кадр будет инициирован в finally.
  if (renderBusy) return;
  requestAnimationFrame(performStaticRender);
}

function performStaticRender() {
  if (renderBusy || !renderPending) return;
  const myToken = renderToken;
  const heavy = pendingHeavy;
  pendingHeavy = false;
  renderPending = false;
  renderBusy = true;

  ensureState();
  const style = getStyle(state.styleId);
  const palette = getPalette(state.paletteId);

  const actuallyPaint = async () => {
    const t0 = performance.now();
    let ok = true;
    let notReady = false;
    try {
      // Если стиль поддерживает chunked async paint — используем его
      // с yield'ами, чтобы UI реагировал на клики/перерисовки.
      const opts = buildOpts();
      if (typeof style.paintChunked === "function") {
        opts._yield = () => new Promise((r) => requestAnimationFrame(r));
        opts._rowChunk = computeChunkSize(CANVAS_H, style.id);
        await style.paintChunked(ctx, opts, renderState.inner);
      } else {
        // paint() может вернуть false (например RD-стиль, пока воркер
        // прогревается) — тогда холст ещё не обновлён, и прятать
        // оверлей/показывать "Готово" рано. Дождёмся scheduleRender,
        // который стиль вызовет сам через _onReady.
        notReady = style.paint(ctx, opts, renderState.inner) === false;
      }
    } catch (e) {
      console.error("[wallpaper] render error:", e);
      ok = false;
      const msg = e && e.stack ? e.stack : (e.message || String(e));
      showOverlayError("Error", String(msg).slice(0, 600));
      showToast(`Error: <strong>${escapeHTML(e.message || String(e))}</strong>`, "error");
    }
    const dt = performance.now() - t0;
    renderBusy = false;

    // Если пока мы рисовали приехал новый запрос и он тяжелее текущего,
    // форсируем overlay и лёгкий render.
    if (renderPending) {
      if (pendingHeavy && !heavy) pendingHeavy = pendingHeavy; // оставить
      if (heavy) pendingHeavy = pendingHeavy; // уже не нужно
      requestAnimationFrame(performStaticRender);
    }

    if (notReady) {
      // Оверлей/спиннер остаются — сам стиль вызовет scheduleRender,
      // когда данные будут готовы (см. _onReady в ensureState).
      return;
    }

    if (heavy || dt > 250) {
      hideOverlay();
      if (ok && heavy) showToast(`Done in <strong>${formatMs(dt)}</strong>`);
      return;
    }
    if (ok && dt > 80) showToast(`Done in <strong>${formatMs(dt)}</strong>`);
  };

// Подбираем размер чанка так, чтобы один чанк занимал ~16мс — это один кадр.
const _PAINT_MS_BUDGET = 16;
function computeChunkSize(h, id) {
  // Эвристика: доля 1/16 от высоты, в границах [16, 256].
  const c = Math.max(16, Math.min(256, h >> 4));
  return c;
}

  if (heavy) {
    showOverlay(
      `Generating "${style.name}"…`,
      `${state.resolution} · palette ${palette.name} · seed ${state.seed}`
    );
    // двойной rAF — дать браузеру нарисовать overlay
    requestAnimationFrame(() => requestAnimationFrame(actuallyPaint));
  } else {
    actuallyPaint();
  }
}

// Быстрая подпись params без JSON.stringify.
// Для плоских объектов с примитивами — достаточно toString с разделителем.
// Это избегает O(n) сериализации на каждом render.
function paramsSigOf(p) {
  if (!p) return "";
  const keys = Object.keys(p);
  // сортируем ключи для стабильности подписи
  if (keys.length > 1 && typeof keys[0] === "string") keys.sort();
  let s = "";
  for (let i = 0; i < keys.length; i++) {
    const k = keys[i];
    const v = p[k];
    if (s) s += "\u0000";
    s += k + "\u0001" + (typeof v === "number" ? String(v) : (v == null ? "" : String(v)));
  }
  return s;
}

function ensureState() {
  const style = getStyle(state.styleId);
  // Подпись текущих параметров: меняется при любом движении слайдера/enum'а,
  // форсирует пересоздание state.inner, чтобы кэшированные точки/фракции не устаревали.
  const paramsSig = paramsSigOf(state.params);
  const rebuildNeeded = !renderState
    || renderState.styleId !== style.id
    || renderState.seed !== state.seed
    || renderState.paletteId !== state.paletteId
    || renderState.w !== CANVAS_W
    || renderState.h !== CANVAS_H
    || renderState.paramsSig !== paramsSig;
  if (!rebuildNeeded) return;
  // Освобождаем предыдущее состояние (например, RD-воркер).
  if (renderState && renderState.inner && renderState.inner.dispose) {
    try { renderState.inner.dispose(); } catch (e) { /* noop */ }
  }
  const inner = style.createState(buildOpts(), CANVAS_W, CANVAS_H);
  renderState = {
    styleId: style.id,
    seed: state.seed,
    paletteId: state.paletteId,
    w: CANVAS_W,
    h: CANVAS_H,
    paramsSig,
    inner,
  };
  // Если стиль асинхронный (RD-Warmup в воркере), регистрируем обработчик.
  if (inner && typeof inner._onReady === "function") {
    inner._onReady = (timings) => {
      const total = timings && timings.total != null ? timings.total : null;
      const warm = timings && timings.warmup != null ? timings.warmup : null;
      if (total != null) {
        showOverlay(`RD ready`, `warmup in worker: ${warm ?? total} ms`);
      }
      scheduleRender({ heavy: true });
    };
    inner._onStep = () => {
      // В анимированном режиме основной цикл сам вызывает paint() каждый кадр.
    };
  }
}

function buildOpts() {
  return {
    seed: state.seed,
    palette: getPalette(state.paletteId),
    ...state.params,
  };
}

function startAnimation() {
  const style = getStyle(state.styleId);
  if (typeof style.animate !== "function") {
    // Стиль без animate() — не виснем на первом кадре, остаёмся в static.
    switchMode("static");
    return;
  }
  if (state.running) cancelAnimationFrame(state.raf);
  state.running = true;
  state.startedAt = performance.now();
  ensureState();

  const tick = () => {
    if (!state.running) return;
    const t = (performance.now() - state.startedAt) * (state.animSpeed / 100);
    style.animate(ctx, buildOpts(), renderState.inner, t);
    state.raf = requestAnimationFrame(tick);
  };
  state.raf = requestAnimationFrame(tick);
}

function stopAnimation() {
  state.running = false;
  if (state.raf) cancelAnimationFrame(state.raf);
  state.raf = 0;
}

// ---------- Экспорт ----------
async function exportPng() {
  const btn = $("#exportPng");
  btn.disabled = true;
  const name = `wallpaper_${state.styleId}_${state.seed}_${CANVAS_W}x${CANVAS_H}.png`;
  const t0 = performance.now();
  runWithLoader(
    "Saving PNG…",
    `${CANVAS_W}×${CANVAS_H}`,
    async () => {
      await downloadCanvas(canvas, name, "image/png");
    }
  );
  // runWithLoader спрячет оверлей после paint(), но download асинхронный —
  // отдельно спрячем overlay через небольшой таймер.
  setTimeout(() => {
    hideOverlay();
    const dt = performance.now() - t0;
    showToast(`PNG saved · <strong>${formatMs(dt)}</strong>`);
    btn.disabled = false;
  }, 60);
}

async function exportWebm() {
  if (!canvas.captureStream) {
    showToast("Browser doesn't support canvas.captureStream", "warn");
    return;
  }
  const btn = $("#exportWebm");
  btn.disabled = true;
  const original = btn.textContent;
  btn.textContent = "Recording… (5s)";
  showOverlay("Recording WebM…", "5 seconds left");
  state.recChunks = [];

  const stream = canvas.captureStream(60);
  const mime = MediaRecorder.isTypeSupported("video/webm;codecs=vp9")
    ? "video/webm;codecs=vp9"
    : "video/webm";
  const rec = new MediaRecorder(stream, { mimeType: mime });
  state.recorder = rec;

  let countdown = 5;
  const t = setInterval(() => {
    countdown--;
    if (overlayText) overlayText.textContent = "Recording WebM…";
    if (overlaySub) overlaySub.textContent = `${countdown}s left`;
  }, 1000);

  rec.ondataavailable = (e) => { if (e.data && e.data.size) state.recChunks.push(e.data); };
  rec.onstop = async () => {
    clearInterval(t);
    hideOverlay();
    btn.disabled = false;
    btn.textContent = original;
    const blob = new Blob(state.recChunks, { type: "video/webm" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `wallpaper_${state.styleId}_${state.seed}.webm`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 5000);
    showToast(`WebM saved · <strong>5 s</strong>`);
  };

  rec.start();
  await new Promise((r) => setTimeout(r, 5000));
  rec.stop();
}

// ---------- Boot ----------
function applyUrlParams() {
  // Поддерживаем и ?query=... и #hash=... — hash удобнее для шеринга (не уходит в server logs).
  const querySrc = location.search;
  const hashSrc = location.hash.startsWith("#") ? location.hash.slice(1) : "";
  const parse = (src) => {
    if (!src) return new Map();
    const p = new URLSearchParams(src);
    const m = new Map();
    for (const k of new Set(p.keys())) m.set(k, p.get(k) ?? "");
    return m;
  };
  const q = parse(querySrc);
  const h = parse(hashSrc);
  // hash имеет приоритет над query (новее/явный шеринг)
  const get = (k) => h.has(k) ? h.get(k) : q.get(k);

  if (get("style")) {
    const id = get("style");
    if (STYLES.some((s) => s.id === id)) {
      state.styleId = id;
      state.params = { ...getStyle(id).defaults };
    }
  }
  if (get("palette")) {
    const id = get("palette");
    if (PALETTES.some((x) => x.id === id)) state.paletteId = id;
  }
  if (get("seed")) state.seed = String(get("seed"));
  if (get("resolution")) state.resolution = String(get("resolution"));
  if (get("mode")) {
    const m = get("mode");
    if (m === "static" || m === "animated") state.mode = m;
  }
  // lite=1 — спрятать UI и растянуть канвас (для шеринга превью).
  if (h.has("lite") || q.has("lite")) state.lite = (get("lite") || "") !== "0";
}

// Обновляем hash в URL при смене state.styleId / paletteId / seed.
// Режим/static не включаем — чтобы URL оставался коротким.
function updateHud() {
  const hudStyle = document.getElementById("hudStyle");
  const hudRes = document.getElementById("hudRes");
  const hudSeed = document.getElementById("hudSeed");
  if (hudStyle) hudStyle.textContent = getStyle(state.styleId).name;
  if (hudRes) hudRes.textContent = state.resolution.replace("x", "×");
  if (hudSeed) hudSeed.textContent = state.seed;
}

let hashUpdateTimer = 0;
function updateUrlHash() {
  updateHud();
  clearTimeout(hashUpdateTimer);
  hashUpdateTimer = setTimeout(() => {
    const parts = [`style=${state.styleId}`, `palette=${state.paletteId}`, `seed=${state.seed}`];
    const newHash = "#" + parts.join("&");
    if (location.hash !== newHash) {
      history.replaceState(null, "", newHash);
    }
  }, 300);
}

function applyLite() {
  if (!state.lite) return;
  document.documentElement.classList.add("lite");
  const grid = document.getElementById("app");
  if (grid) grid.style.gridTemplateColumns = "1fr";
  const panel = document.getElementById("panel");
  if (panel) {
    panel.style.display = "none";
    panel.classList.remove("is-open");
  }
  const stage = document.getElementById("stage");
  if (stage) {
    stage.style.padding = "0";
    stage.style.alignItems = "stretch";
    stage.style.justifyContent = "stretch";
  }
  const wrap = document.getElementById("canvasWrap");
  if (wrap) {
    wrap.style.width = "100vw";
    wrap.style.height = "100vh";
    wrap.style.borderRadius = "0";
    wrap.style.maxWidth = "none";
    wrap.style.maxHeight = "none";
  }
}

// ---------- Mobile bottom-sheet drawer ----------
function initMobileDrawer() {
  const panel = document.getElementById("panel");
  const handle = document.getElementById("panelHandle");
  const closeBtn = document.getElementById("panelClose");
  const burger = document.getElementById("panelBurger");
  if (!panel || !handle) return;
  const isMobile = window.matchMedia && window.matchMedia("(max-width: 820px)").matches;
  if (!isMobile) {
    // Десктоп: убираем классы drawer, обычный sticky panel.
    panel.classList.remove("is-open", "is-collapsed");
    return;
  }

  const isOpen = () => panel.classList.contains("is-open");
  const syncAria = () => { if (burger) burger.setAttribute("aria-expanded", String(isOpen())); };
  const open = () => { panel.classList.add("is-open"); syncAria(); };
  const close = () => { panel.classList.remove("is-open"); syncAria(); };
  const toggle = () => { panel.classList.toggle("is-open"); syncAria(); };

  handle.addEventListener("click", toggle);
  handle.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") { toggle(); e.preventDefault(); }
  });
  if (closeBtn) closeBtn.addEventListener("click", close);
  if (burger) burger.addEventListener("click", toggle);

  // Свайп вверх по handle открывает; свайп вниз по контенту — закрывает.
  let touchStartY = 0, touchStartTime = 0;
  handle.addEventListener("touchstart", (e) => {
    touchStartY = e.touches[0].clientY;
    touchStartTime = Date.now();
  }, { passive: true });
  handle.addEventListener("touchend", (e) => {
    const y = (e.changedTouches[0] && e.changedTouches[0].clientY) || touchStartY;
    if (touchStartY - y > 25 && !isOpen()) open();
  });

  // Тап по canvas при открытой панели → закрыть.
  const canvasWrap = document.getElementById("canvasWrap");
  if (canvasWrap) {
    canvasWrap.addEventListener("click", () => {
      if (isMobile && isOpen()) close();
    });
  }

  // Пересчитываем состояние при повороте экрана.
  window.matchMedia("(max-width: 820px)").addEventListener("change", (e) => {
    if (!e.matches) panel.classList.remove("is-open");
  });
}

// ---------- Клавиатурные шорткаты (как в профессиональных инструментах) ----------
function initKeyboardShortcuts() {
  document.addEventListener("keydown", (e) => {
    const tag = (e.target && e.target.tagName) || "";
    if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") return;
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    switch (e.key) {
      case " ":
        e.preventDefault();
        $("#regenerate").click();
        break;
      case "ArrowRight":
      case "ArrowLeft": {
        e.preventDefault();
        const idx = STYLES.findIndex((s) => s.id === state.styleId);
        const dir = e.key === "ArrowRight" ? 1 : -1;
        const next = STYLES[(idx + dir + STYLES.length) % STYLES.length];
        switchStyle(next.id);
        const btn = document.querySelector(`.style-item[data-style="${next.id}"]`);
        if (btn) btn.scrollIntoView({ block: "nearest" });
        break;
      }
      case "a":
      case "A":
        switchMode(state.mode === "animated" ? "static" : "animated");
        break;
      case "s":
      case "S":
        e.preventDefault();
        exportPng();
        break;
    }
  });
}

function boot() {
  applyUrlParams();
  initStyleList();
  initPaletteList();
  initBaseControls();
  initParams();
  applyResolution();
  applyLite();
  initMobileDrawer();
  initKeyboardShortcuts();
  updateHud();
  updateModeAvailability();
  // Если URL просит анимацию — включим её после инициализации
  if (state.mode === "animated") {
    $$("#modeTabs button").forEach((b) =>
      b.classList.toggle("active", b.dataset.mode === "animated")
    );
    $("#animSpeedField").hidden = false;
    $("#exportWebm").hidden = false;
    startAnimation();
  } else {
    scheduleRender({ heavy: true });
  }
  window.addEventListener("resize", () => {
    applyResolution();
    if (state.mode === "static") scheduleRender(true);
  });
}

document.addEventListener("DOMContentLoaded", boot);

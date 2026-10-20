# AGENTS.md — agent context for `wallpaper-generator`

A browser toy: 120 abstract wallpaper generators that draw on a Canvas 2D
surface in real time, with PNG and WebM export and a URL for every picture. It
is a static page with no build step, no package manifest, no server and no
tests.

This file is the re-entry surface: everything below is what you need to work
on the project without reading all of it.

## Run / build / test

```bash
python3 -m http.server 8765   # serve the page; there is nothing to install
```

Then open http://localhost:8765/.

There is nothing to install and nothing to build. `index.html` loads ES
modules and a module Web Worker, so a browser refuses to run the page over
`file://`: opening the file directly gives a blank page and an empty console.
The panel is styled with Bootstrap 5.3.3 and Bootstrap Icons 1.11.3 from
jsDelivr, so without a network the canvas still renders and the panel does not
look right.

There is no test suite, no linter and no CI. The check that matters is
opening the page and looking at the canvas.

## Where things live

| Path | What it holds |
| --- | --- |
| `index.html` | The product. The panel shell, the canvas, the spinner overlay, the toast, and the two CDN tags. |
| `styles.css` | The panel, the stage, the mobile drawer, and the Bootstrap dark-theme overrides. |
| `js/app.js` | The state, the panel builder, the render scheduler, the keyboard, the URL, and the two exports. |
| `js/styles.js` | The registry: the 120 style modules, the seven category names, and the lookups. |
| `js/styles/` | One module per generator, 120 of them, plus `rd-worker.js`. |
| `js/rng.js` | Mulberry32 and three helpers over it. |
| `js/noise.js` | 2D Simplex noise, fBM and ridge. |
| `js/palettes.js` | The 12 palettes, the colour ramp and the mixing helpers. |
| `js/utils.js` | Clamp, lerp, smoothstep, the canvas resize and the download. |
| `docs/` | 105 style previews and one interface screenshot. |

## Traps

- **The panel order and the registry order are two different lists.**
  `js/styles.js` exports `STYLES` in a hand-written order, and
  `stylesByCategory()` sorts by name inside each category, which is the order
  the panel shows. The `Left` and `Right` arrow keys walk `STYLES`, so the
  style the key picks is rarely the next style on screen.
- **Two generators sit in the wrong block of the registry array.**
  `sandhills` and `waves_grid` are filed under the noise and geometry comments
  in `js/styles.js`, while their `category` field says `Organic`. The panel
  reads the field and puts them under Organic, and the registry order keeps
  them where they are.
- **Any parameter move rebuilds the generator's state.** `ensureState()` in
  `js/app.js` hashes the parameter object and calls `createState()` again
  whenever the hash, the style, the palette, the seed or the size changes.
  Whatever a generator precomputes in `createState()` is thrown away on every
  slider tick.
- **`paint()` may return `false`, and it means "not ready yet".** `js/app.js`
  keeps the spinner up when `paint` returns false and expects the generator to
  call `scheduleRender()` itself once it has the data. That is the contract
  the Reaction-Diffusion worker uses, through `_onReady`. A generator that
  returns false without a way back leaves the spinner up for good.
- **The seed is a string and every generator derives its own.** 60 of the 120
  import `makeRng` from `js/rng.js`, which hashes the string, and 37 derive a
  number with FNV-1a over the seed plus a short suffix. The suffix is what
  keeps two generators from drawing from the same stream. The other 34 take
  no seed at all.
- **The `heavy` flag decides whether the spinner appears.** Only
  `scheduleRender({heavy: true})` puts the overlay up. The slider and select
  handlers call `scheduleRender()` without it and the frame comes on the next
  animation frame. A control that calls the heavy path on every input event
  flashes the spinner on every event. The resize handler gets there by
  accident: it calls `scheduleRender(true)`, passing a boolean where an
  options object is expected, so the render happens without the overlay.
- **A second paint never starts while one is running.** `renderBusy` and
  `renderToken` hold the queue: a request that arrives during a paint is
  picked up when the current one ends, and the older result is dropped. A
  generator that paints asynchronously without awaiting its own promise
  interleaves with the next render.
- **Six generators implement `paintChunked`**: Billow, Cloud Puff, Kaleidoscope,
  Marble, Ridged and Wood. `js/app.js` calls it in place of `paint`, and
  injects `opts._yield` and `opts._rowChunk` on that path only. A chunked
  generator that does not await the yield blocks the main thread exactly as a
  synchronous one would.
- **The Reaction-Diffusion worker is disabled by `?lite=1` in the query
  string, and by nothing else.** `js/styles/reactiondiffusion.js` reads
  `location.search` itself instead of the parsed parameters, so `#lite=1`
  hides the panel and leaves the worker running. The worker posts copies of
  both fields rather than transferables, because the main thread keeps using
  the buffer.
- **The exported PNG follows the device pixel ratio, not the resolution
  setting.** `resizeCanvas()` sizes the backing store at
  `min(2, devicePixelRatio)` and scales the context, so the file is 1920x1080
  on a 1x screen and 3840x2160 on a 2x screen, under a file name that says
  1920x1080. The generators built on `createImageData` also draw at 1x and are
  upscaled on the way to the screen.
- **The URL keeps three things.** `updateUrlHash()` writes `style`, `palette`
  and `seed` into the hash after 300 milliseconds. `resolution`, `mode` and
  `lite` are read from the URL and never written to it. The hash wins over
  the query when both carry a value.
- **`buildOpts()` spreads the parameters over the seed and the palette.**
  `{ seed, palette, ...state.params }`, so a parameter named `seed` or
  `palette` would replace the real one. No generator has such a parameter
  today.
- **`exportPng()` shows two toasts.** `runWithLoader()` gets an async
  function, gets a promise back, and treats the promise as a finished job, so
  it closes the overlay and says "Done in 340 ms" before the file has been
  written. A 60 millisecond timer then hides the overlay again and says "PNG
  saved", and puts the button back. The button is re-enabled on that timer
  rather than when the download ends.

## Style / safety rails

- **No dependencies in the application code, and no bundler.** The only
  external code is Bootstrap and Bootstrap Icons, and `index.html` pulls them
  from a CDN. A package means a bundler, and a bundler means the page stops
  being a folder of files.
- **The interface is English, the source comments are Russian.** The commit
  history has both, including "Localize UI and content to English". Leave the
  comments as they are; the code is written in the owner's own language.
- **`js/noise.js` is public domain.** It is Stefan Gustavson's Simplex noise
  implementation, public domain, and it carries that notice. Do not replace it
  with a dependency.
- **A generator has to be looked at.** The history is full of generators that
  drew nothing: "Fix 12 styles that rendered as near-empty or degenerate at
  1920x1080", "Fix fern and lorenz: invisible renders at default params",
  "Fix phyllotaxis: default paletteCycle=0 painted every dot the same
  near-invisible color". A new generator is checked at its defaults, on a
  light palette and on a dark one, at 1920x1080.
- **The panel is built in JavaScript.** `index.html` holds the sections and
  `js/app.js` fills the style list, the palette swatches and the parameter
  controls with `document.createElement`. A new control belongs in the markup
  and in the builder, not in a string of HTML.
- **Comments explain why, never what.**

## Where the product truth lives

`PRODUCT.md` holds it. Read it before changing the behaviour of the page, and
write the change there when the behaviour changes.

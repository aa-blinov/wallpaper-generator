# Architecture

How `wallpaper-generator` is put together.

## The shape

A static page with a canvas, a control panel and a registry of generator
modules. There is no build step: the browser loads the ES modules directly,
so the repository is served as it is on disk.

```
url parameters, panel, keyboard
    -> js/app.js         state, render scheduler, exports
    -> js/styles.js      registry of 120 generators
    -> js/styles/<id>.js one module per generator
    -> canvas 2d
```

| Module | What it is responsible for |
| --- | --- |
| `index.html` | The shell: the panel, the canvas, the overlay, the toast, the HUD. |
| `styles.css` | The panel, the stage, the phone sheet, and the Bootstrap theme overrides. |
| `js/app.js` | The state, the panel, the render scheduler, the keyboard, the URL, the exports. |
| `js/styles.js` | The registry: it imports the 120 style modules and groups them under the seven categories. |
| `js/styles/<id>.js` | One generator each. 120 files, plus `rd-worker.js`. |
| `js/rng.js` | Mulberry32, seeded from a string, and three helpers over it. |
| `js/noise.js` | 2D Simplex noise in the public domain, with fBM and ridge on top. |
| `js/palettes.js` | The 12 palettes, the colour ramp and the mixing helpers. |
| `js/utils.js` | Clamp, lerp, smoothstep, the canvas resize and the download. |
| `docs/` | 105 style previews and one picture of the interface. |

## The data flow

A picture is made by a style module drawing into the canvas, and everything
else is bookkeeping around that.

```
the URL, the panel or a key
  -> state { styleId, paletteId, seed, resolution, mode, params }
  -> buildOpts()          the seed, the palette and the style's parameters
  -> the style's createState(opts, w, h)   a cache that survives between frames
  -> the style's paint(ctx, opts, state)    one frame
  -> the canvas
```

The state is one object. A change to the style, the palette, the seed or
the resolution is a heavy change: `scheduleRender()` puts the spinner over
the canvas and repaints. A slider move is a light one: it repaints on the
next frame with no overlay at all.

While a paint is running, a second one does not start. The request is kept
and picked up when the first one ends, so a fast slider cannot queue ten
paints of a 4K frame.

The style module contract is fixed:

| Member | What it is |
| --- | --- |
| `id`, `name`, `category`, `blurb` | What the panel and the search box read. |
| `defaults`, `params` | The parameter values, and the sliders the panel builds. |
| `createState(opts, w, h)` | The cache that survives between frames. |
| `paint(ctx, opts, state)` | One frame. |
| `animate(ctx, opts, state, t)` | Optional. `t` is milliseconds since the animation started. |
| `paintChunked` | The asynchronous variant, for the slow generators. |

## The data

Randomness is deterministic. `js/rng.js` holds a Mulberry32 generator
seeded from a string, and 37 of the styles derive a numeric seed of their
own with FNV-1a over the user's seed and a short suffix, so two styles
never draw from the same stream. The other 34 take no seed at all and are
fully determined by their parameters.

The colours come from `js/palettes.js`. Each palette is five anchors and a
background, and `makeColorRamp` turns the anchors into an interpolation
function over the range 0 to 1.

The canvas is sized by the device pixel ratio, up to 2, so the drawing
coordinates are CSS pixels while the bitmap behind them is larger.

## Decisions worth knowing about

### Rendering is scheduled, not immediate

`scheduleRender()` in `js/app.js` is the single entry point. A heavy change
puts the spinner over the canvas, a light change repaints on the next
frame, and a paint that arrives while another is running is kept rather
than started.

### The slow generators paint in chunks

Six of them, Billow, Cloud Puff, Kaleidoscope, Marble, Ridged and Wood,
use `paintChunked` and yield to the browser between chunks. The chunk
height is computed from a 16 millisecond budget, so the panel stays
responsive while a 4K frame is being computed.

### The reaction-diffusion generator runs in a worker

`js/styles/rd-worker.js` is a Web Worker. It is the one generator that
cannot paint in a frame, because the simulation has to run for a while
before there is anything to draw.

### The URL holds the picture

The style, the palette and the seed are written into the hash as
`#style=…&palette=…&seed=…` after a pause of 300 milliseconds. The
resolution, the mode and `lite` are read from the URL and never written
to it. A seed is hashed rather than parsed, so `42` and `042` give two
different pictures.

### The panel is 360 pixels wide and scrolls on its own

The style list has its own scroll box, capped at 38vh, inside a panel that
scrolls as well. Without the inner box, the 120 entries push the sliders
and the export buttons off the screen.

### The interface is Bootstrap with the palette overridden

`index.html` loads Bootstrap 5.3.3 and Bootstrap Icons 1.11.3 from
jsDelivr, and `styles.css` rewrites the Bootstrap variables to the
project's own colours. The canvas does not need the network; the panel
does.

### The panel and the canvas are isolated from each other

`#app` carries `contain: layout`, and `#panel` carries
`contain: layout style paint`, so scrolling the panel does not repaint the
canvas.

## Boundaries

- **A generator draws and nothing else.** It receives a context, the
  options and its own state, and it does not touch the DOM, the panel or
  the URL.
- **A generator owns its parameters.** The panel builds the sliders from
  `params` and the `defaults`, and it does not know what a parameter
  means.
- **`js/app.js` owns the state.** The generators receive it as `opts` and
  keep nothing but their own cache.
- **`js/styles.js` is the registry.** A new generator is a file and an
  import, and the panel finds it through the category field and the search
  box through the name.
- **`js/rng.js` and `js/noise.js` are the only sources of randomness.**
  A generator that calls `Math.random` breaks the promise that a seed
  gives the same picture.
- **`js/palettes.js` is the only source of colour.** A generator that
  hard-codes a hex breaks the palette.

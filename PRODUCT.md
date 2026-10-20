# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

The product is a single static page. The `index.html` at the root of the
repository is the application: the panel, the canvas and the export controls.
Any file server will do, and GitHub Pages serves the root of `master` at
<https://aa-blinov.github.io/wallpaper-generator/>.

The application code is JavaScript. ES modules are loaded straight by the
browser, Canvas 2D does the drawing, a Web Worker runs the Reaction-Diffusion
simulation, and `MediaRecorder` with `canvas.captureStream` records the video
export. The panel around the canvas is styled with Bootstrap 5.3.3 and
Bootstrap Icons 1.11.3 from a CDN. There is no build step, no package
manifest and no server-side code.

## Users

The repository does not record who uses it, and there is nowhere to count: the
product is a page, so there is no download, no account and no telemetry. The
GitHub repository has 0 stars and 0 forks, and its description names the
product rather than an audience: "120 abstract-wallpaper generators running
live in the browser".

What the code says about the job: a person who wants an abstract picture for
a screen and wants it now. Nothing to install, nothing to sign up for,
nothing uploaded anywhere. The seed and the URL make a picture findable again,
which is the only thing about it a person would want to keep.

The second audience is the owner. The interface is in English, the source
comments are in Russian, the repository carries topics for generative art,
fractals, creative coding and procedural generation, and it sits next to a set
of small personal tools. All 20 commits are dated 2026-09-12.

## Product Purpose

The product turns a seed into an abstract picture and hands the picture over
as a file.

Everything in the interface serves that one move: pick a style, adjust the
parameters, change the seed until the picture is right, save it. The panel
holds nothing else. There is no account, no collection, no history, no
gallery, no upload.

Everything hangs off the seed. A picture is fully determined by the style, the
palette, the seed, the resolution and the parameters, so any picture can be
written down as a URL and found again, and the URL can be sent to somebody
else who then sees the same picture.

Success for the user: a PNG on the disk that is the picture they wanted, and
a link that brings it back. Success for the product: the page loads from a
folder of files with nothing to build and nothing to install, and the
catalogue grows by one file at a time.

## Positioning

A wallpaper generator that runs in the browser is not a new idea. What is
unusual here is the combination: 120 generators, 539 parameters, 12 palettes
and 5 resolutions, with no dependencies in the application code, no build step
and no install.

Two details make the combination hold together.

The catalogue is one file per generator, and the file is the whole contract:
an id, a name, a category, a blurb, the defaults, the parameters and three
functions. A new generator is one file and one import, which is part of why
the count is 120 and not 12.

The URL is the share format. Style, palette and seed go into the hash, and
the hash reproduces the picture exactly on another machine. A generated
picture travels as a link, with no account and no server holding the file.

## Operating Context

The usual session is short. Open the page, pick a style from the list or
search for one, move two or three sliders, press New seed until something
lands, then save the PNG. The HUD in the corner of the canvas always names
the style, the resolution and the seed, so a picture can be written down
without opening the panel.

On a phone the layout changes. Below 820 pixels the panel becomes a bottom
sheet that is 64 pixels tall until it is opened to 84vh, the style list
becomes a horizontal strip of cards, and the buttons grow to 50 pixels. The
canvas keeps the whole width of the screen.

Sharing is a separate mode. `lite=1` hides the panel and gives the whole
window to the canvas, which is what a link to a finished wallpaper should
look like when it is opened on a phone.

The work happens on the machine of the person using it. The picture never
leaves the browser, and there is no server that can be down.

## Capabilities and Constraints

Confirmed by the code:

- 120 generators in seven categories: Flow 2, Noise 8, Geometry 33,
  Algorithms 30, Dots 11, Textures 17, Organic 19.
- 539 parameters in total, between 2 and 10 per generator.
- 12 palettes, each five anchor colours interpolated from 0 to 1, plus a
  background colour.
- 19 of the 120 generators animate. The Animated control is disabled for the
  other 101 rather than left to fail.
- 5 resolutions: 1920x1080, 2560x1440, 3840x2160, 1080x1920, 1280x720.
- PNG export of the canvas, and a 5 second WebM recorded at 60 frames per
  second, with VP9 where the browser has it.
- 6 URL parameters, read from the query string or from the hash: `style`,
  `palette`, `seed`, `resolution`, `mode`, `lite`.
- Determinism: the same style, palette, seed, resolution and parameters give
  the same picture. 60 generators use Mulberry32 over a hashed seed string,
  37 use FNV-1a over the seed and a suffix, and 34 take no seed at all.
- The Reaction-Diffusion simulation runs 4000 warmup steps in a Web Worker,
  and falls back to the main thread when the worker is unavailable.
- The canvas is sized by the device pixel ratio, capped at 2.
- The interface is in English. The source comments are in Russian.

Deliberately not true, and worth knowing before a change:

- There is no build step, so a cold load fetches 126 modules and the worker.
- The panel needs Bootstrap from a CDN. Without a network the canvas renders
  and the panel looks broken.
- There is no test suite, no linter and no CI.
- The resolution in the URL is not checked against the five offered values.
  Any value is accepted and the canvas follows it.
- The exported PNG is twice the named resolution on a display with a device
  pixel ratio of 2.
- The 105 style previews in `docs/` are crops of an earlier layout, six of
  them show no picture at all, and `docs/preview-ui.png` shows the interface
  before it was translated.
- `?lite=1` disables the Reaction-Diffusion worker and `#lite=1` does not.
- The style list is sorted by name inside a category, while the arrow keys
  walk the registry order, so the two lists disagree.
- The WebM export is only reachable in animated mode. The button is hidden in
  static mode, because the recording captures the canvas while it moves.

## Brand Commitments

**Name:** Wallpaper Generator. The repository, the page title and the panel
heading all use it. The favicon is an inline SVG: a ring and a disc in the
lava palette, `#0f0710`, `#ff8a4c` and `#ffd166`.

**Tone:** plain and technical. The interface reports the state of the work
rather than reassuring the user. The overlay says "Generating" and names the
resolution, the palette and the seed underneath. The toast says "Done in 340
ms". The Reaction-Diffusion overlay says "RD ready" and reports how long the
warmup took in the worker. There is no congratulation anywhere.

**The picture is the interface.** The panel is a control surface beside the
canvas, and the canvas keeps the largest share of the window. Nothing in the
panel competes with the picture.

**The state is on screen.** The style, the resolution and the seed sit in a
corner of the canvas at all times, so the person looking at a picture can
read off how to make it again.

## Evidence on Hand

- `js/styles.js` holds the registry: 120 entries, seven categories, and the
  lookup helpers.
- `index.html` and `styles.css` are the interface, and `js/app.js` holds the
  whole of the behaviour: state, panel, scheduler, keyboard, URL and exports.
- `docs/` holds 105 style previews at 320 by 320 and one interface screenshot
  at 1400 by 900. All of them come from an earlier build.
- The published site, <https://aa-blinov.github.io/wallpaper-generator/>, is
  GitHub Pages serving the root of `master`.
- The repository: 20 commits, all dated 2026-09-12, one open pull request,
  0 stars, 0 forks, no releases and no tags.
- The frame times in the old README were measured on the author's machine at
  1280x720 and have not been reproduced anywhere else.

Absent, and not to be invented: no download counts, no usage numbers, no
testimonials, no comparison with other wallpaper generators, no accessibility
audit, and no performance measurement on any machine but the author's.

## Product Principles

1. **The canvas is the product.** The panel is a control surface next to it,
   and every addition to the panel has to earn the space it takes on screen.
2. **A seed is a URL.** Any picture has to be reproducible from text, and the
   text has to be short enough to paste into a chat.
3. **Nothing to install, ever.** The page is a folder of files a browser can
   open over HTTP. A dependency, a bundler or a server would each take that
   away.
4. **One generator is one file.** The registry imports modules and nothing
   else, so adding a generator cannot disturb the ones that already work.
5. **The interface states what happened.** The time a frame took, the time a
   worker took, the reason a control is disabled: the page says it, in words,
   where the person can read it.

## Accessibility & Inclusion

What the code does today:

- The panel is reachable from the keyboard. `Space` gives a new seed, the
  arrow keys change the style, `A` switches the mode and `S` saves the PNG.
  The handler stands down when the focus is in an input, a select or a
  textarea.
- The style list is a tablist, each style is a tab with an accessible name
  built from the style name and its blurb, and the selected one carries
  `aria-selected` and `aria-current`. The palette swatches are radios with
  `aria-checked`.
- The drawer handle has a button role and a tab stop, it answers Enter and
  Space, and the floating burger button carries `aria-expanded`.
- The text colours hold up. The body text on the panel is 14.3:1, the muted
  text runs from 5.1:1 to 6.1:1, and the accent on the page background is
  6.4:1.

What is missing, and worth writing down before it is guessed:

- The canvas has no accessible name and no text alternative, and the HUD that
  names the style, the resolution and the seed is `aria-hidden`. A screen
  reader is told nothing about the picture.
- The toast carries no live region, so "Done in 340 ms" is never announced.
- `prefers-reduced-motion` is not handled. The animated mode runs a frame
  loop, and the drawer animates over 280 milliseconds whatever the setting
  says.
- The focus ring is the browser default everywhere except the search field,
  where it is replaced by a border colour and a box shadow. There is no
  `focus-visible` styling in the repository.
- On a phone the palette swatches are 36 by 36 pixels and the range inputs
  are 40 pixels tall, under a CSS comment that claims 44. The buttons meet
  the claim; the swatches and the sliders do not.
- No standard has been set. The repository names no accessibility target, and
  no audit of any kind has been run against it.

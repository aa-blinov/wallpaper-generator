---
name: wallpaper-generator
description: A dark control panel beside the canvas. Bootstrap 5.3.3 with the palette overridden, and twelve curated palettes for the picture itself.
colors:
  primary: "#7c8cff"
  neutral-bg: "#0f1115"
  surface: "#181b22"
  surface-2: "#1f232c"
  rule: "#2a2f3a"
  text: "#e7eaf0"
  muted: "#8a93a6"
  accent-2: "#ff7ac6"
  success: "#6fcf97"
  danger: "#ff6b9b"
  warning: "#ffd166"
typography:
  body:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter, sans-serif"
    fontSize: "13px"
    fontWeight: 400
    lineHeight: 1.3
  title:
    fontFamily: "ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Inter, sans-serif"
    fontSize: "18px"
    fontWeight: 700
    lineHeight: 1.2
    letterSpacing: "0.2px"
  code:
    fontFamily: "ui-monospace, SF Mono, Cascadia Code, JetBrains Mono, Consolas, monospace"
    fontSize: "11px"
    fontWeight: 500
    lineHeight: 1.4
rounded:
  sm: "4px"
  md: "8px"
  lg: "10px"
  pill: "999px"
  sheet: "22px"
spacing:
  xs: "3px"
  sm: "6px"
  md: "10px"
  lg: "18px"
---

# Design system: wallpaper-generator

## Overview

**Creative North Star: "the instrument panel around a window"**

The application is a control panel on the left and a picture on the right,
and the picture is the point. Everything in the panel is quiet, small and
dark so that nothing competes with what is on the canvas. The panel is
360 pixels wide on a desktop, and below 820 pixels it becomes a bottom
sheet that opens to 84vh over the picture.

The interface is Bootstrap 5.3.3 with the dark theme overridden. The
stylesheet writes the whole palette out: the Bootstrap variables
(`--bs-body-bg`, `--bs-primary`, `--bs-border-color` and the rest) are
repointed at the project's own colours, and the components that Bootstrap
draws square, the buttons and the inputs, are rounded to 10 pixels. The
framework supplies the layout and the behaviour, and the stylesheet
supplies the look.

The picture has a palette of its own, and it is a different thing from the
interface palette. Twelve curated palettes hold five anchor colours and a
background, and a generator interpolates along them. The interface never
takes a colour from an artwork palette, and an artwork palette never
reaches the panel.

Key characteristics:

- One dark theme. There is no light mode and no theme switch.
- The interface palette is cool and near-neutral, so the picture is the
  only saturated thing on the screen.
- Numbers are monospaced and tabular, the way a value on an instrument is.
- The panel is a grid of sections with a rule between them, not a stack of
  cards.

## Colors

### Interface

The tokens in `:root` in `styles.css`, mirrored into the Bootstrap
variables under `[data-bs-theme="dark"]`.

- **Ground** (`#0f1115`): the page, and the Bootstrap body background.
- **Panel** (`#181b22`): the control panel, and the toast.
- **Panel raised** (`#1f232c`): the fields, the style items, the segmented
  control, the keyboard hints and the Bootstrap secondary background.
- **Rule** (`#2a2f3a`): every border, the section separators and the
  scrollbar.
- **Text** (`#e7eaf0`): the labels and the values.
- **Muted** (`#8a93a6`): the section headings, the hints, the descriptions
  and the placeholder text.

### Accents

- **Periwinkle** (`#7c8cff`): the accent. The primary button, the active
  style item, the active palette swatch, the slider fill and the focus
  ring. Its hover tint is `#a8b3ff`.
- **Pink** (`#ff7ac6`): the second accent. It appears once, on the second
  arc of the spinner, so that the spinner reads as two colours turning.
- **Success** (`#6fcf97`), **danger** (`#ff6b9b`), **warning** (`#ffd166`)
  and **info** (`#6fffe9`): the Bootstrap semantic colours, kept for the
  components that use them.

### Picture palettes

The twelve palettes in `js/palettes.js` belong to the artwork and to
nothing else. Each one is five anchor colours from dark to light, plus a
background colour, and a generator interpolates along the anchors.

| Palette | From | To | Background |
| --- | --- | --- | --- |
| Lava | `#1a0a14` | `#ffd166` | `#0f0710` |
| Aurora | `#0b132b` | `#6fffe9` | `#070b16` |
| Sunset | `#2d1b4e` | `#ffe6a7` | `#170a25` |
| Ink | `#111418` | `#e6ebf5` | `#0a0d12` |
| Ocean | `#031830` | `#f2f7f5` | `#020d18` |
| Botanic | `#0e1d14` | `#f4ecc0` | `#070e0a` |
| Bubblegum | `#241038` | `#fff1ff` | `#160a22` |
| Desert | `#2a1a10` | `#ffe1a3` | `#180d09` |
| Cyber | `#08010f` | `#ffe8ff` | `#050008` |
| Pastel | `#dad7cd` | `#344e41` | `#f4f1ed` |
| Sapphire | `#020617` | `#e0f2fe` | `#010410` |
| Coral | `#160a14` | `#ffeacb` | `#0b0510` |

Pastel is the only light one, and the only one whose anchors run from
light to dark. The other eleven run dark to light.

### Rules

**The interface palette never takes a colour from the picture.** A
generator's colours stop at the canvas.

**One accent, and it means the current thing.** The periwinkle marks the
selected style, the selected palette, the slider fill and the focus ring.
A second accent would make the first one ambiguous.

**The dark theme is the only theme.** There is no light variant and no
switch, because the canvas is the bright thing on the screen.

## Typography

**Display Font:** ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto,
Inter, sans-serif
**Body Font:** ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto,
Inter, sans-serif
**Code Font:** ui-monospace, SF Mono, Cascadia Code, JetBrains Mono, Consolas,
monospace

The panel is set small, because the panel holds a lot of it.

- **Panel title**: 18 pixels, weight 700, letter spacing 0.2 pixels. It is
  the only heading in the panel.
- **Section heading**: 11 pixels, weight 600, uppercase, letter spacing
  0.12em, in the muted colour.
- **Body and labels**: 13 pixels in the fields, 12 pixels in the hints and
  the descriptions, 11 pixels in the HUD and the shortcut list.
- **Numbers**: the parameter values, the seed field, the HUD and the
  keyboard hints are set in the monospace family with tabular figures, so
  a number does not shift its neighbours while a slider moves.

On a phone the sizes grow: the buttons go to 15 pixels, the fields to 16
pixels, and the tap targets to at least 44 pixels.

## Layout

The desktop layout is a grid of two columns: a 360 pixel panel and the
stage, at the full height of the window. The panel scrolls; the stage
does not.

```
+--------------------+--------------------------------+
|  Wallpaper         |                                |
|  STYLE             |                                |
|  [search           |        +----------------+      |
|   style list]      |        |                |      |
|  CANVAS            |        |     canvas     |      |
|  [resolution]      |        |                |      |
|  [static|animated] |        +----------------+      |
|  SEED              |   +----------------------+    |
|  PALETTE           |   | style · 1920x1080 · 42 |   |
|  STYLE PARAMETERS  |   +----------------------+    |
|  EXPORT            |                                |
+--------------------+--------------------------------+
```

Inside the panel, each group is a section with a one pixel rule on top,
except the first. The groups are Style, Canvas, Seed, Palette, Style
parameters and Export, and the keyboard shortcuts sit in a footer under
the last rule.

Below 820 pixels the grid becomes one column, the stage fills it, and the
panel becomes a fixed sheet at the bottom of the window: 64 pixels tall
when it is closed, 84vh when it is open, with 22 pixel corners at the top.
A floating round button at the lower right opens it. In landscape the
button is hidden, because the panel is already close to the thumb.

The style list is a column with its own scroll box capped at 38vh on a
desktop, so the 120 entries never push the sliders and the export buttons
off the screen. On a phone it turns into a horizontal strip of cards.

## Elevation & Depth

The interface is flat. Nothing has a shadow except the picture, which is
lifted by `0 6px 24px rgba(0, 0, 0, 0.35)`, and the phone sheet, which
carries `0 -16px 40px rgba(0, 0, 0, 0.7)`.

The separation between the panel and the stage is a single pixel of rule
colour on the panel's right edge, and the stage's own ground is darker
than the page (`#06070a`), so the picture sits in a well.

The overlay that covers the canvas during a heavy render is a different
kind of thing: `rgba(8, 10, 14, 0.78)` with a 6 pixel backdrop blur. It
dims the picture rather than hiding it.

## Shapes

- 4 pixels for the keyboard hints.
- 8 pixels for the fields, the style items, the palette swatches and the
  search box.
- 10 pixels for the buttons, the inputs, the selects and the segmented
  control, which overrides the square shapes Bootstrap draws.
- 6 pixels for the picture itself.
- 22 pixels at the top of the phone sheet.
- 999 pixels for the toast.
- 50 percent for the palette swatches, the floating button and the spinner.

## Components

### The style item

- **Shape:** a button with 8 pixel corners, the raised panel colour and a
  one pixel rule border.
- **Content:** the name in 13 pixel semibold, and the blurb in 11 pixel
  muted text, clipped to one line on a desktop and shown in full on a
  phone.
- **Active:** the periwinkle at 18 percent over the raised colour, with a
  border at 55 percent and an inset ring at 40 percent.
- **Hover:** the border lightens to `#3a4150` and the background becomes
  `#24283299`.

### The palette swatch

- **Shape:** a square with 8 pixel corners and a rule border, filled with
  the palette's background colour.
- **Active:** a 2 pixel periwinkle outline with a 2 pixel offset.
- **Hover:** it scales to 1.04.

### The slider

- **Track:** 6 pixels high, with a 3 pixel radius and a rule border. The
  part before the thumb is filled with the periwinkle, and the fill is
  driven by a `--fill` custom property that the application sets.
- **Thumb:** 18 pixels round, the periwinkle, with a 2 pixel border in the
  panel colour and a 1 pixel ring of the accent.
- **Focus:** a 4 pixel halo of the accent at 25 percent.

### The segmented control

- **Shape:** a grid of equal columns with a 4 pixel gap, inside a 10 pixel
  rounded box with a 4 pixel inset.
- **Active:** the periwinkle at 18 percent with an inset ring, and the
  text in the full text colour.
- **Disabled:** 40 percent opacity, and the cursor becomes the forbidden
  one. The Animated button is disabled for the 101 generators that do not
  move.

### The primary button

- **Shape:** 10 pixel corners, at least 50 pixels high on a phone.
- **Colour:** the periwinkle background, the ground colour as the text,
  weight 600.
- **Hover:** the lighter `#a8b3ff`.
- **Pressed:** it scales to 0.98.

### The keyboard hint

- **Shape:** an inline-flex box, 18 pixels high and at least 18 wide, with
  4 pixel corners and a 2 pixel bottom border.
- **Content:** the key in the monospace family at 10 pixels, in the muted
  colour.

### The toast

- **Shape:** a pill at the bottom centre of the stage, with the panel
  colour at 92 percent and the shadow.
- **Content:** the message, with the leading word in the accent. A warning
  leading word is `#ffb86c` and an error leading word is `#ff6b6b`.
- **Motion:** it fades in and rises 8 pixels over 180 milliseconds.

### The HUD

- **Shape:** a box at the upper left of the canvas, with 7 pixel corners,
  a blurred translucent background and a hairline border.
- **Content:** the style, the resolution and the seed, separated by dots.
  The style is the only value in the full text colour.

## Do's and Don'ts

### Do:

- **Do** take the colours from the `:root` tokens, or from the Bootstrap
  variables that point at them.
- **Do** set the number in the monospace family with tabular figures, so
  the value does not move while it changes.
- **Do** keep the panel quiet. A new colour in the panel has to earn its
  place against a picture that is on the same screen.
- **Do** hide a control that does not apply. The Animated button is
  disabled rather than hidden, and the WebM button stays hidden until a
  moving generator is loaded.

### Don't:

- **Don't** take a colour from an artwork palette and use it in the
  interface.
- **Don't** add a light theme. The canvas is the bright thing.
- **Don't** add a shadow to a panel element. The picture has the only one,
  and the phone sheet has the only other.
- **Don't** round the corners a second time. Bootstrap's square shapes are
  overridden once, at 10 pixels, and nothing else changes them.
- **Don't** change the panel's width or the phone sheet's height without
  checking the style list, which is capped against the panel height.

# Screenshots

The images in this folder are the previews of the generators. There are
106 PNG files: 105 style previews and one picture of the interface.

## The style previews

`preview-<id>.png`, one per generator, named after the generator's id in
the registry. `preview-domainwarp.png` is the picture in the README's
header, and `preview-curlflow.png`, `preview-mandelbrot.png` and
`preview-voronoi.png` join it in the README's table, which shows four.

Every one of them is a 320 by 320 crop of a page from an earlier build,
where the canvas sat in the top-left corner of the window. The picture
occupies roughly 270 by 150 pixels of each square and the rest of the
square is the page background, so the previews are thumbnails of a layout
that no longer exists.

Six of the previews show no picture at all: `preview-fern.png`,
`preview-flowsnake.png`, `preview-flowsnake2.png`,
`preview-halftone.png`, `preview-metaballs.png` and
`preview-wire.png`. They were captured before the fixes that made those
generators draw, and the files have not been taken again. The generators
themselves work today.

## The interface picture

`preview-ui.png` is the whole panel, from the same build and before the
interface was translated into English. It is the only picture of the
interface in the repository, and it shows the old labels.

## The `screenshots/` folder

This folder is empty apart from this file. The repository has no
screenshots of the current interface.

If one is added, it goes in this folder and is referenced from the README
by a relative path, so it resolves on GitHub and in a local checkout. The
house-style checker verifies that every image reference points at a file
that exists, so a renamed screenshot cannot quietly break the README.

## Taking new ones

The application draws into a canvas and saves the result, so a new
preview is a matter of loading the generator, setting a seed, and saving
the PNG. The application itself writes the file, with the canvas at the
size the generator's defaults ask for. There is no capture script in the
repository, and the previews above were taken by hand.

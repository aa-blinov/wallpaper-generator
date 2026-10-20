# Documentation

The documents of `wallpaper-generator`, a page of 120 abstract generators
that draw on a canvas and save the result as a PNG or a five-second WebM.
It is static files: no build step, no dependencies, no install.

| Document | What it covers |
| --- | --- |
| [architecture.md](architecture.md) | The shell, the registry, the generator contract and the render scheduler. |
| [screenshots/README.md](screenshots/README.md) | The preview images in this folder, what each one shows and what is missing. |
| [../README.md](../README.md) | The front door: the generators, the parameters, the URL parameters and the keys. |
| [../AGENTS.md](../AGENTS.md) | The traps, the commands and the rules of the project. |
| [../PRODUCT.md](../PRODUCT.md) | The product truth: who it is for, and what it promises. |
| [../DESIGN.md](../DESIGN.md) | The panel, the palette, the type and the components, as the stylesheet has them. |

This folder also holds 106 PNG files: 105 style previews and one picture
of the interface. They are described in
[screenshots/README.md](screenshots/README.md).

## Reading order

New here: [../README.md](../README.md), then
[architecture.md](architecture.md). The README has the list of what the
application does, and the architecture has the shape of a generator.

Writing a generator: [architecture.md](architecture.md) for the contract of
a style module, then the example in the [README](../README.md#development).
A generator is one file and one import.

Changing the interface: [../DESIGN.md](../DESIGN.md) for the tokens, the
type and the components. The stylesheet holds all three, and it is where
they are defined.

## A note on the languages

The documents in this folder are in English, like the interface. The
comments in the stylesheet and in the scripts are in Russian, and they
stay that way: the code speaks the owner's language.

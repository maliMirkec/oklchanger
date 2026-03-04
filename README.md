# OKLCHanger!

![oklchanger](https://raw.githubusercontent.com/maliMirkec/oklchanger/5a2a93f680c0401ad0e3951b924c51a0635dcf4d/gfx/oklchanger.gif)

Convert any colors to oklch!

A Visual Studio Code extension that converts various color definitions to the OKLCH color format.

## Features

- **Supports Multiple Color Formats**: Converts named colors, HEX, RGB/RGBA, HSL/HSLA, HWB, Lab, OKLAB, LCH, OKLCH, and `color()` (display-p3, srgb, rec2020, etc.)
- **Modern CSS Syntax**: Handles both legacy comma-separated and modern space-separated syntax (e.g. `rgb(255 0 0 / 50%)`)
- **Works on Any Selection**: Select a block of code to convert only that part, or run with nothing selected to process the entire file
- **Multi-value Properties**: Correctly converts all colors in multi-value properties like `background`
- **User Feedback**: Reports colors that could not be converted

## Usage

1. Optionally select the text you want to convert (or select nothing to process the whole file).
2. Open the command palette (`Ctrl+Shift+P` / `Cmd+Shift+P` on Mac).
3. Type `OKLCHanger!` and select the command.
4. The converted OKLCH values replace the original color definitions.

## Supported Color Formats

- Named colors (e.g. `red`, `cornflowerblue`)
- HEX (e.g. `#f00`, `#ff0000`, `#ff0000ff`)
- RGB/RGBA — legacy and modern (e.g. `rgb(255, 0, 0)`, `rgb(255 0 0 / 50%)`)
- HSL/HSLA — legacy and modern (e.g. `hsl(0, 100%, 50%)`, `hsl(0 100% 50% / 1)`)
- HWB (e.g. `hwb(0 0% 0%)`)
- Lab (e.g. `lab(50% 75 60)`)
- OKLAB (e.g. `oklab(0.6 0.2 0.1)`)
- LCH (e.g. `lch(53% 105 40)`)
- OKLCH (e.g. `oklch(0.6 0.25 20)`)
- `color()` function (e.g. `color(display-p3 1 0 0)`)

## Settings

| Setting | Default | Description |
|---|---|---|
| `oklchConverter.useOpacity` | `true` | Include the `/ alpha` part in the OKLCH output |

## License

MIT — see [LICENSE](https://raw.githubusercontent.com/maliMirkec/oklchanger/refs/heads/master/LICENSE.md).

> Built with assistance of Claude Code.

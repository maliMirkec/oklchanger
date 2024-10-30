# OKLCHanger!

![oklchanger](https://raw.githubusercontent.com/maliMirkec/oklchanger/5a2a93f680c0401ad0e3951b924c51a0635dcf4d/gfx/oklchanger.gif)

Convert any colors to oklch!

A Visual Studio Code extension that converts various color definitions in selected text to the OKLCH color format. This extension supports named colors, HEX, RGB, RGBA, HSL, HSLA, Lab, and LCH color models.

## Features

- **Supports Multiple Color Formats**: Converts color definitions from named colors, HEX, RGB, RGBA, HSL, HSLA, Lab, and LCH formats to **OKLCH**.
- **User Feedback**: Displays error messages for colors that cannot be converted.

## Usage

1. Select the color definitions you want to convert in your code. It can be the whole code block.
2. Open the command palette (`Ctrl+Shift+P` or `Cmd+Shift+P` on Mac).
3. Type `OKLCHanger!` and select the command.
4. The converted colors will replace the original definitions in your selected text.

## Regex Explanation

The extension uses a regex pattern to match the following color formats:

- Named colors (e.g., `red`, `green`, `blue`)
- HEX colors (e.g., `#ff0000`, `#f00`)
- RGB/RGBA (e.g., `rgb(255, 0, 0)`, `rgba(255, 0, 0, 0.5)`)
- HSL/HSLA (e.g., `hsl(0, 100%, 50%)`, `hsla(0, 100%, 50%, 0.5)`)
- Lab and LCH colors (e.g., `lab(53.2329, 80.1093, 67.2201)`, `lch(53.23, 107.24, 0deg)`)
- CSS variable syntax (e.g., `--color-named: red;`)

## Unsupported Color Formats

Please note that the following color formats are not supported by this extension:

- **Grayscale Colors**: Colors such as `#000`, `#fff`, `#efefef`, `8a8a8a`, and `#666` are not recognized.
- **8-Character Hex Colors**: Hexadecimal color codes with 8 characters (e.g., `#818181FF`) are also unsupported.

Ensure that the colors you wish to convert are in the correct format for the best results.

## Development

To contribute to this project or modify it:

1. Make your changes to the code.
2. Test your changes by launching the extension in the Extension Development Host.

## License

This project is licensed under the MIT License. See the [LICENSE](https://raw.githubusercontent.com/maliMirkec/oklchanger/refs/heads/master/LICENSE.md) file for details.

## Acknowledgments

This extension uses the `colorjs.io` library for color conversions. For more information, visit the [colorjs.io](https://colorjs.io) website.

> Built with assistance of ChatGPT. ¯\(ツ)/¯

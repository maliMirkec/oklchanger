# Changelog

All notable changes to OKLCHanger! are in this file. I follow [Keep a Changelog](https://keepachangelog.com/), more or less.

## [0.1.0] - 2026-11-09

This is a big one. I reviewed the whole extension and found more bugs than I'd like to admit.

### Added

- You can now convert colors in many selections at once.
- I added `black`, `rebeccapurple`, and the `grey` spellings. Yes, `black` was missing all this time.
- Modern syntax now supports `none`, negative hues, numbers like `.5`, and percentages.

### Changed

- Lightness and chroma now have 3 decimals instead of 2. The converted colors are more accurate.
- The extension now replaces only the colors, not the whole file. The cursor stays where it was, and undo works as expected.

### Fixed

- Uppercase functions like `RGB(255 0 0)` didn't convert.
- Hex-like IDs like `#cafe-menu` were converted to `oklch(...)-menu`.
- Color names in `--red`, `$red`, `@tan`, `Math.tan`, and the CSS `tan()` function were converted.
- An invalid `oklch()` had its `lch()` part converted on its own.
- The repository URL in `package.json` was broken.

## [0.0.9] - 2026-03-05

### Fixed

- Color names in hyphenated identifiers, like `white-space`, are no longer converted.
- I added `transparent`.

## [0.0.8] - 2026-03-04

### Added

- Support for `oklch()`, `oklab()`, and `color()`, like `display-p3`, `srgb`, and `rec2020`.
- Support for the modern space syntax in `rgb()`, `hsl()`, `hwb()`, `lab()`, and `lch()`.
- Support for 4-digit hex colors, like `#f00a`.
- If nothing is selected, the extension converts the whole file.

### Fixed

- Multi-value properties, like `background: red, blue`, now convert all colors.
- `lch()` no longer needs the `deg` unit on the hue.

## [0.0.7] - 2025-11-25

### Fixed

- Color names in CSS selectors, like `.b-color-blue`, were converted. Now only property values are converted.

## [0.0.6] - 2024

- First release.

# Change Log

All notable changes to the "oklchanger" extension will be documented in this file.

Check [Keep a Changelog](http://keepachangelog.com/) for recommendations on how to structure this file.

## [0.0.8] - 2026-03-04

### Added
- Support for `oklch()`, `oklab()`, and `color()` (display-p3, srgb, rec2020, etc.) color formats
- Support for modern space-separated syntax in `rgb()`, `hsl()`, `hwb()`, `lab()`, and `lch()`
- Support for 4-digit hex colors (`#rgba`)
- When nothing is selected, the entire file is processed

### Fixed
- Multi-value properties (e.g. `background: red, blue`) now convert all colors correctly
- `lch()` no longer requires the `deg` suffix on the hue value

## [0.0.7] - 2025-11-25

### Fixed
- Fixed bug where color names in CSS selectors (like `.b-color-blue`) were incorrectly converted. Now only converts colors in CSS property values.

## [0.0.6] - 2024

- Initial release
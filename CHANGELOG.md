# Changelog

All notable changes to **Notebook Cell Index** are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.1] - 2026-04-28

### Removed
- `notebookCellIndex.includeMarkdownCells` setting. Use `notebookCellIndex.showMarkdownNumbers` instead. (The deprecated alias was only present in 0.3.0.)

## [0.3.0] - 2026-04-28

### Added
- `notebookCellIndex.customFormat` setting. Free-text template with tokens `{n}`, `{n0}`, `{total}`, `{grandTotal}`, `{section}`, `{kind}`. Examples: `"Cell {n}/{total}"`, `"{section}.{n}"`.
- `notebookCellIndex.alignment` setting (`left` | `right`). Controls which side of the cell status bar the badge sits on.
- `notebookCellIndex.hideWhenSingle` setting. Hide the badge entirely on notebooks with 0 or 1 displayed cells.
- `notebookCellIndex.showCodeNumbers` setting. Lets users disable numbering on code cells (e.g. to number markdown cells only).
- `notebookCellIndex.showMarkdownNumbers` setting. Replaces the legacy `includeMarkdownCells` setting (kept as a deprecated fallback).
- `notebookCellIndex.resetCounterOnSection` setting (`none` | `h1` | `h1-h2`). Restarts the counter at H1 (or H1+H2) markdown cells, enabling labels like `1.3`, `2.1` via the `{section}` token.

### Changed
- Tooltip now appends `(section N)` when section reset is enabled.
- `format` setting is now a preset that's overridden by `customFormat` when set.
- Provider re-fires when notebook structure changes, and when markdown cells change while section reset is enabled, so section-based numbering stays in sync.

### Deprecated
- `notebookCellIndex.includeMarkdownCells` — superseded by `showMarkdownNumbers` (still honored as a fallback default).

## [0.2.0] - 2026-04-28

### Added
- `notebookCellIndex.includeMarkdownCells` setting. When enabled, markdown cells receive a status-bar number and count toward the total.

### Changed
- Tooltip text now distinguishes between `Code cell` and `Markdown cell`.
- Bumped minimum VS Code engine to **1.74** for a more reliable notebook API surface.
- Bundled output is now minified.

## [0.1.1] - 2026-03-10

### Fixed
- Packaging metadata polish.

## [0.1.0] - 2026-03-09

### Added
- Initial release: status-bar cell numbering for code cells with configurable label format (`Cell N`, `#N`, `[N]`) and optional total count.

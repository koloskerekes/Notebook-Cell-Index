# Changelog

All notable changes to **Notebook Cell Index** are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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

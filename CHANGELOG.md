# Changelog

All notable changes to **Notebook Cell Index** are documented here.

The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.5.1] - 2026-04-28

### Added
- **Default keybinding `Ctrl+K G` (Mac: `Cmd+K G`)** for the `Jump to Cell…` command, scoped to `notebookEditorFocused` so it never fires outside a notebook.
- **Section grouping in the cell picker.** When `resetCounterOnSection` is enabled, the quick-pick now shows a separator before each section, labeled with the heading text (or `Section N` if the heading is empty). Makes a 100-cell notebook scannable.

## [0.5.0] - 2026-04-28

### Added
- **`{sectionTitle}` token** for `customFormat`. Resolves to the heading text of the markdown cell that opened the current section (with `#` stripped). Use `customFormat: "{sectionTitle} · {n}"` to render labels like `Data loading · 4` instead of bare numbers. Requires `resetCounterOnSection`.

### Changed
- Marketplace summary, README intro, and keyword list refreshed to reflect everything shipped through v0.4.0 (click-to-jump, status bar item, custom templates, execution numbering, copy-reference command, section resets) plus the new `{sectionTitle}` token.

## [0.4.0] - 2026-04-28

### Added
- **Click-to-jump cell picker.** Click any cell-number badge to open a quick-pick of all numbered cells. Arrow keys live-preview by scrolling to each cell; Enter focuses it; Escape restores the original view. Toggle via `notebookCellIndex.clickToJump`.
- **Active-cell status bar item.** A `Cell N` indicator in the window status bar (bottom right) tracks the focused cell across the whole notebook. Click to open the cell picker. Toggle via `notebookCellIndex.showGlobalStatusItem`.
- **`Jump to Cell…` command** (`notebookCellIndex.openCellPicker`) on the command palette.
- **`Copy Cell Reference` command** (`notebookCellIndex.copyCellReference`) on the command palette. Puts the rendered label (e.g. `Cell 7`, `2.3`, `In[12]`) on the clipboard.
- **`{exec}` token** for `customFormat`. Resolves to the cell's execution counter (`In[N]`); cells without an execution count are hidden when the template uses `{exec}`. Use `customFormat: "In[{exec}]"` for Jupyter-style numbering.

### Changed
- Tooltip on each cell badge now hints that it's clickable when `clickToJump` is on.
- Provider re-fires when execution counters change so `{exec}` templates stay current.

## [0.3.2] - 2026-04-28

### Changed
- Settings UI now displays options in a deliberate order (`format`, `customFormat`, `showTotal`, `alignment`, `hideWhenSingle`, `showCodeNumbers`, `showMarkdownNumbers`, `resetCounterOnSection`) instead of alphabetical, so the custom-format template sits next to the preset it overrides.

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

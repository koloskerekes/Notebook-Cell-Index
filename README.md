# Notebook Cell Index

[![Visual Studio Marketplace Version](https://vsmarketplacebadges.dev/version-short/KolosKerekes.notebook-cell-index.svg?label=VS%20Marketplace&color=007ACC)](https://marketplace.visualstudio.com/items?itemName=KolosKerekes.notebook-cell-index)
[![Visual Studio Marketplace Installs](https://vsmarketplacebadges.dev/installs-short/KolosKerekes.notebook-cell-index.svg)](https://marketplace.visualstudio.com/items?itemName=KolosKerekes.notebook-cell-index)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Display sequential cell numbers (`Cell 1`, `Cell 2`, ...) in the status bar of every notebook cell in VS Code. Lightweight, zero-dependency, works with Jupyter notebooks and any other notebook-based editor.

## Features

- **Status-bar numbering** on every code cell — no clutter, no UI overrides
- **Optional markdown numbering** — toggle on to include markdown cells in the index
- **Three label styles** — `Cell N`, `#N`, or `[N]`
- **Optional total** — show position out of total (e.g. `Cell 2/5`)
- **Live updates** — numbers re-flow automatically as cells are added, removed, or reordered
- **Works everywhere** — Jupyter, polyglot notebooks, custom notebook controllers

## Install

**From the Marketplace:**

[Install Notebook Cell Index](https://marketplace.visualstudio.com/items?itemName=KolosKerekes.notebook-cell-index)

Or in VS Code: `Ctrl+P` → `ext install KolosKerekes.notebook-cell-index`

**From a `.vsix`:**

```bash
code --install-extension notebook-cell-index-<version>.vsix
```

## Settings

| Setting | Type | Default | Description |
| --- | --- | --- | --- |
| `notebookCellIndex.format` | `"Cell N"` \| `"#N"` \| `"[N]"` | `"Cell N"` | Preset label format. Ignored when `customFormat` is set. |
| `notebookCellIndex.customFormat` | string | `""` | Custom label template, e.g. `"Cell {n}/{total}"`, `"{section}.{n}"`. |
| `notebookCellIndex.showTotal` | boolean | `false` | Append the total count to the index (e.g. `Cell 2/5`). |
| `notebookCellIndex.alignment` | `"left"` \| `"right"` | `"left"` | Which side of the cell status bar the badge sits on. |
| `notebookCellIndex.hideWhenSingle` | boolean | `false` | Hide the badge on notebooks with 0 or 1 displayed cells. |
| `notebookCellIndex.showCodeNumbers` | boolean | `true` | Number code cells. |
| `notebookCellIndex.showMarkdownNumbers` | boolean | `false` | Number markdown cells (replaces the legacy `includeMarkdownCells`). |
| `notebookCellIndex.resetCounterOnSection` | `"none"` \| `"h1"` \| `"h1-h2"` | `"none"` | Restart the counter at every H1 / H1+H2 markdown cell. |

### Custom format tokens

The `customFormat` template supports:

| Token | Meaning |
| --- | --- |
| `{n}` | 1-based index within the current section |
| `{n0}` | 0-based index |
| `{total}` | Total cells in the current section (or whole notebook if reset is `none`) |
| `{grandTotal}` | Total across the whole notebook |
| `{section}` | 1-based section number (when reset is enabled) |
| `{kind}` | `Code` or `Markdown` |

Examples:

| Template | Result |
| --- | --- |
| `Cell {n}` | `Cell 7` |
| `Cell {n}/{total}` | `Cell 7/12` |
| `{section}.{n}` | `2.3` |
| `[{kind} {n}]` | `[Code 7]` |

Open settings with `Ctrl+,` and search for `notebookCellIndex`.

## Requirements

- VS Code **1.74** or later
- Any notebook open in the editor

## Development

```bash
git clone https://github.com/koloskerekes/Notebook-Cell-Index.git
cd Notebook-Cell-Index
npm install
npm run compile
```

Press `F5` in VS Code to launch an Extension Development Host with the extension loaded.

To produce a distributable `.vsix`:

```bash
npm run package
```

To publish to the Marketplace (maintainers only):

```bash
npm run publish
```

## Contributing

Issues and pull requests are welcome at [github.com/koloskerekes/Notebook-Cell-Index](https://github.com/koloskerekes/Notebook-Cell-Index). Please open an issue first for substantial changes.

## License

[MIT](LICENSE) © Kolos Kerekes

# Notebook Cell Index

[![Visual Studio Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/KolosKerekes.notebook-cell-index?label=VS%20Marketplace&color=007ACC)](https://marketplace.visualstudio.com/items?itemName=KolosKerekes.notebook-cell-index)
[![Visual Studio Marketplace Installs](https://img.shields.io/visual-studio-marketplace/i/KolosKerekes.notebook-cell-index)](https://marketplace.visualstudio.com/items?itemName=KolosKerekes.notebook-cell-index)
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
| `notebookCellIndex.format` | `"Cell N"` \| `"#N"` \| `"[N]"` | `"Cell N"` | Label format for cell numbers. |
| `notebookCellIndex.showTotal` | boolean | `false` | Show total count alongside the index (e.g. `Cell 2/5`). |
| `notebookCellIndex.includeMarkdownCells` | boolean | `false` | Include markdown cells in numbering. When enabled, markdown cells also display a number and count toward the total. |

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

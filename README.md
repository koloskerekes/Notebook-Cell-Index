# Notebook Cell Index

[![Visual Studio Marketplace Version](https://vsmarketplacebadges.dev/version-short/KolosKerekes.notebook-cell-index.svg?label=VS%20Marketplace&color=007ACC)](https://marketplace.visualstudio.com/items?itemName=KolosKerekes.notebook-cell-index)
[![Visual Studio Marketplace Installs](https://vsmarketplacebadges.dev/installs-short/KolosKerekes.notebook-cell-index.svg)](https://marketplace.visualstudio.com/items?itemName=KolosKerekes.notebook-cell-index)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Display sequential cell numbers (`Cell 1`, `Cell 2`, ...) in the status bar of every notebook cell in VS Code. Lightweight, zero-dependency, works with Jupyter notebooks and any other notebook-based editor.

## Features

- **Status-bar numbering** on every code cell — no clutter, no UI overrides
- **Click-to-jump cell picker** — click any cell badge to open a quick-pick of all cells, with live preview as you arrow through it
- **Active-cell window status item** — a `Cell N` indicator in the bottom status bar tracks the focused cell
- **Custom format templates** — write your own label like `Cell {n}/{total}`, `{section}.{n}`, or `In[{exec}]`
- **Section-based counter resets** — restart numbering at every `#` or `##` markdown cell for `1.3`-style hierarchies
- **Per-kind toggles** — number code cells, markdown cells, both, or either
- **Execution-order numbering** — `{exec}` token mirrors Jupyter's `In[N]`
- **Copy Cell Reference** command — drop `Cell 7` (or `2.3`, or `In[12]`) on the clipboard for chat / PRs
- **Three preset label styles** — `Cell N`, `#N`, or `[N]`, plus your own template
- **Live updates** — numbers re-flow as cells are added, removed, reordered, or executed
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
| `notebookCellIndex.showMarkdownNumbers` | boolean | `false` | Number markdown cells. |
| `notebookCellIndex.resetCounterOnSection` | `"none"` \| `"h1"` \| `"h1-h2"` | `"none"` | Restart the counter at every H1 / H1+H2 markdown cell. |
| `notebookCellIndex.clickToJump` | boolean | `true` | Make each cell's badge clickable to open the cell picker. |
| `notebookCellIndex.showGlobalStatusItem` | boolean | `true` | Show the active cell's number in the window status bar. |

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
| `{exec}` | Cell's execution counter (`In[N]`). Cells without an execution count are hidden when this token is used. |

Examples:

| Template | Result |
| --- | --- |
| `Cell {n}` | `Cell 7` |
| `Cell {n}/{total}` | `Cell 7/12` |
| `{section}.{n}` | `2.3` |
| `[{kind} {n}]` | `[Code 7]` |
| `In[{exec}]` | `In[12]` (Jupyter-style; un-executed cells hide) |

## Commands

| Command | What it does |
| --- | --- |
| **Notebook Cell Index: Jump to Cell…** | Open a quick-pick of all numbered cells with live preview. Bound to the cell-badge click when `clickToJump` is on. |
| **Notebook Cell Index: Copy Cell Reference** | Copy the rendered label of the currently focused cell to the clipboard. |

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

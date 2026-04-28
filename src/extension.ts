import * as vscode from 'vscode';

const NS = 'notebookCellIndex';

const LEGACY_TEMPLATES: Record<string, string> = {
  'Cell N': 'Cell {n}',
  '#N': '#{n}',
  '[N]': '[{n}]',
};

type ResetMode = 'none' | 'h1' | 'h1-h2';

interface Cfg {
  template: string;
  alignment: vscode.NotebookCellStatusBarAlignment;
  hideWhenSingle: boolean;
  showCodeNumbers: boolean;
  showMarkdownNumbers: boolean;
  resetMode: ResetMode;
  showTotal: boolean;
}

function loadConfig(): Cfg {
  const c = vscode.workspace.getConfiguration(NS);
  const legacyMarkdown = c.get<boolean>('includeMarkdownCells', false);
  const customFormat = c.get<string>('customFormat', '').trim();
  const preset = c.get<string>('format', 'Cell N');
  const template = customFormat || LEGACY_TEMPLATES[preset] || preset;
  const alignment = c.get<'left' | 'right'>('alignment', 'left') === 'right'
    ? vscode.NotebookCellStatusBarAlignment.Right
    : vscode.NotebookCellStatusBarAlignment.Left;
  return {
    template,
    alignment,
    hideWhenSingle: c.get<boolean>('hideWhenSingle', false),
    showCodeNumbers: c.get<boolean>('showCodeNumbers', true),
    showMarkdownNumbers: c.get<boolean>('showMarkdownNumbers', legacyMarkdown),
    resetMode: c.get<ResetMode>('resetCounterOnSection', 'none'),
    showTotal: c.get<boolean>('showTotal', false),
  };
}

function counts(cell: vscode.NotebookCell, cfg: Cfg): boolean {
  return cell.kind === vscode.NotebookCellKind.Code ? cfg.showCodeNumbers : cfg.showMarkdownNumbers;
}

function isHeading(cell: vscode.NotebookCell, mode: ResetMode): boolean {
  if (mode === 'none') return false;
  if (cell.kind !== vscode.NotebookCellKind.Markup) return false;
  const text = cell.document.getText().trimStart();
  return mode === 'h1' ? /^#\s/.test(text) : /^#{1,2}\s/.test(text);
}

interface Pos {
  n: number;
  section: number;
  sectionTotal: number;
  total: number;
}

function computePosition(target: vscode.NotebookCell, cfg: Cfg): Pos | undefined {
  const cells = target.notebook.getCells();
  let section = 1;
  let firstHeadingSeen = false;
  let sectionN = 0;
  let total = 0;
  let found: { n: number; section: number } | undefined;
  const sectionTotals: number[] = [];
  sectionTotals[1] = 0;

  for (const c of cells) {
    if (isHeading(c, cfg.resetMode)) {
      if (firstHeadingSeen) {
        section++;
        sectionTotals[section] = 0;
      }
      firstHeadingSeen = true;
      sectionN = 0;
    }
    if (counts(c, cfg)) {
      sectionN++;
      total++;
      sectionTotals[section] = sectionN;
      if (c === target) {
        found = { n: sectionN, section };
      }
    }
  }

  if (!found) return undefined;
  return {
    n: found.n,
    section: found.section,
    sectionTotal: sectionTotals[found.section] ?? found.n,
    total,
  };
}

function resolveTemplate(cfg: Cfg): string {
  if (cfg.showTotal && /\{n\}/.test(cfg.template) && !/\{total\}/.test(cfg.template)) {
    return cfg.template.replace(/\{n\}/, '{n}/{total}');
  }
  return cfg.template;
}

function formatLabel(template: string, pos: Pos, cell: vscode.NotebookCell): string {
  const kind = cell.kind === vscode.NotebookCellKind.Code ? 'Code' : 'Markdown';
  return template
    .replace(/\{n0\}/g, String(pos.n - 1))
    .replace(/\{n\}/g, String(pos.n))
    .replace(/\{grandTotal\}/g, String(pos.total))
    .replace(/\{total\}/g, String(pos.sectionTotal))
    .replace(/\{section\}/g, String(pos.section))
    .replace(/\{kind\}/g, kind);
}

class CellNumberProvider implements vscode.NotebookCellStatusBarItemProvider {
  readonly onDidChangeCellStatusBarItems: vscode.Event<void>;
  private readonly _onDidChange = new vscode.EventEmitter<void>();

  constructor() {
    this.onDidChangeCellStatusBarItems = this._onDidChange.event;
  }

  notifyChange(): void {
    this._onDidChange.fire();
  }

  provideCellStatusBarItems(
    cell: vscode.NotebookCell,
    _token: vscode.CancellationToken
  ): vscode.NotebookCellStatusBarItem | undefined {
    const cfg = loadConfig();
    if (!counts(cell, cfg)) {
      return undefined;
    }
    const pos = computePosition(cell, cfg);
    if (!pos) {
      return undefined;
    }
    if (cfg.hideWhenSingle && pos.total <= 1) {
      return undefined;
    }

    const template = resolveTemplate(cfg);
    const text = formatLabel(template, pos, cell);
    const kindLabel = cell.kind === vscode.NotebookCellKind.Code ? 'Code cell' : 'Markdown cell';
    const sectionSuffix = cfg.resetMode !== 'none' ? ` (section ${pos.section})` : '';
    const item = new vscode.NotebookCellStatusBarItem(text, cfg.alignment);
    item.tooltip = `${kindLabel} ${pos.n} of ${pos.sectionTotal}${sectionSuffix}`;
    return item;
  }
}

export function activate(context: vscode.ExtensionContext): void {
  const provider = new CellNumberProvider();
  context.subscriptions.push(
    vscode.notebooks.registerNotebookCellStatusBarItemProvider('*', provider),
    vscode.workspace.onDidChangeConfiguration(e => {
      if (e.affectsConfiguration(NS)) {
        provider.notifyChange();
      }
    }),
    vscode.workspace.onDidChangeNotebookDocument(e => {
      if (e.contentChanges.length > 0) {
        provider.notifyChange();
        return;
      }
      const cfg = loadConfig();
      if (cfg.resetMode === 'none') {
        return;
      }
      for (const change of e.cellChanges) {
        if (change.cell.kind === vscode.NotebookCellKind.Markup && change.document) {
          provider.notifyChange();
          return;
        }
      }
    })
  );
}

export function deactivate(): void {}

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
  showGlobalStatusItem: boolean;
  clickToJump: boolean;
}

function loadConfig(): Cfg {
  const c = vscode.workspace.getConfiguration(NS);
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
    showMarkdownNumbers: c.get<boolean>('showMarkdownNumbers', false),
    resetMode: c.get<ResetMode>('resetCounterOnSection', 'none'),
    showTotal: c.get<boolean>('showTotal', false),
    showGlobalStatusItem: c.get<boolean>('showGlobalStatusItem', true),
    clickToJump: c.get<boolean>('clickToJump', true),
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
  const exec = cell.executionSummary?.executionOrder;
  const execStr = typeof exec === 'number' ? String(exec) : '';
  return template
    .replace(/\{n0\}/g, String(pos.n - 1))
    .replace(/\{n\}/g, String(pos.n))
    .replace(/\{grandTotal\}/g, String(pos.total))
    .replace(/\{total\}/g, String(pos.sectionTotal))
    .replace(/\{section\}/g, String(pos.section))
    .replace(/\{kind\}/g, kind)
    .replace(/\{exec\}/g, execStr);
}

function previewText(cell: vscode.NotebookCell): string {
  const lines = cell.document.getText().split('\n');
  for (const line of lines) {
    const trimmed = line.trim();
    if (trimmed) {
      return trimmed.length > 80 ? trimmed.slice(0, 80) + '…' : trimmed;
    }
  }
  return '— empty cell —';
}

function templateRequiresExecution(template: string): boolean {
  return /\{exec\}/.test(template);
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
    if (templateRequiresExecution(template) && typeof cell.executionSummary?.executionOrder !== 'number') {
      return undefined;
    }
    const text = formatLabel(template, pos, cell);
    const kindLabel = cell.kind === vscode.NotebookCellKind.Code ? 'Code cell' : 'Markdown cell';
    const sectionSuffix = cfg.resetMode !== 'none' ? ` (section ${pos.section})` : '';
    const tooltipBase = `${kindLabel} ${pos.n} of ${pos.sectionTotal}${sectionSuffix}`;
    const item = new vscode.NotebookCellStatusBarItem(text, cfg.alignment);
    item.tooltip = cfg.clickToJump ? `${tooltipBase} — click to jump to another cell` : tooltipBase;
    if (cfg.clickToJump) {
      item.command = {
        command: 'notebookCellIndex.openCellPicker',
        title: 'Jump to cell',
      };
    }
    return item;
  }
}

function getActiveSelection(): { editor: vscode.NotebookEditor; cell: vscode.NotebookCell } | undefined {
  const editor = vscode.window.activeNotebookEditor;
  if (!editor || editor.selections.length === 0) {
    return undefined;
  }
  const sel = editor.selections[0];
  if (sel.isEmpty) {
    return undefined;
  }
  const cell = editor.notebook.cellAt(sel.start);
  return { editor, cell };
}

function revealCell(editor: vscode.NotebookEditor, cell: vscode.NotebookCell, focus: boolean): void {
  const range = new vscode.NotebookRange(cell.index, cell.index + 1);
  if (focus) {
    editor.selection = range;
  }
  editor.revealRange(range, vscode.NotebookEditorRevealType.InCenterIfOutsideViewport);
}

async function openCellPicker(): Promise<void> {
  const editor = vscode.window.activeNotebookEditor;
  if (!editor) {
    vscode.window.showInformationMessage('Notebook Cell Index: open a notebook to use the cell picker.');
    return;
  }
  const cfg = loadConfig();
  const cells = editor.notebook.getCells();

  type Item = vscode.QuickPickItem & { cell: vscode.NotebookCell };
  const items: Item[] = [];
  for (const cell of cells) {
    if (!counts(cell, cfg)) {
      continue;
    }
    const pos = computePosition(cell, cfg);
    if (!pos) {
      continue;
    }
    const template = resolveTemplate(cfg);
    if (templateRequiresExecution(template) && typeof cell.executionSummary?.executionOrder !== 'number') {
      continue;
    }
    const label = formatLabel(template, pos, cell);
    items.push({
      label,
      description: cell.kind === vscode.NotebookCellKind.Code ? '$(code) Code' : '$(book) Markdown',
      detail: previewText(cell),
      cell,
    });
  }
  if (items.length === 0) {
    vscode.window.showInformationMessage('Notebook Cell Index: no numbered cells in this notebook.');
    return;
  }

  const originalSelection = editor.selection;
  const originalVisible = editor.visibleRanges.length > 0 ? editor.visibleRanges[0] : undefined;
  const ctx = getActiveSelection();
  const currentItem = items.find(i => i.cell === ctx?.cell);

  const picker = vscode.window.createQuickPick<Item>();
  picker.items = items;
  picker.placeholder = 'Jump to cell…';
  picker.matchOnDetail = true;
  if (currentItem) {
    picker.activeItems = [currentItem];
  }

  let accepted = false;

  picker.onDidChangeActive(active => {
    if (active.length > 0) {
      revealCell(editor, active[0].cell, false);
    }
  });
  picker.onDidAccept(() => {
    accepted = true;
    const sel = picker.selectedItems[0] ?? picker.activeItems[0];
    if (sel) {
      revealCell(editor, sel.cell, true);
    }
    picker.hide();
  });
  picker.onDidHide(() => {
    if (!accepted) {
      editor.selection = originalSelection;
      if (originalVisible) {
        editor.revealRange(originalVisible, vscode.NotebookEditorRevealType.Default);
      }
    }
    picker.dispose();
  });

  picker.show();
}

interface CellMenuArg {
  notebookEditor?: { notebookUri?: vscode.Uri };
  cellIndex?: number;
}

function isCellMenuArg(value: unknown): value is CellMenuArg {
  return !!value && typeof value === 'object' && 'cellIndex' in (value as Record<string, unknown>);
}

function isNotebookCell(value: unknown): value is vscode.NotebookCell {
  return !!value && typeof value === 'object'
    && 'kind' in (value as Record<string, unknown>)
    && 'document' in (value as Record<string, unknown>)
    && 'notebook' in (value as Record<string, unknown>);
}

function resolveCellArg(arg: unknown): vscode.NotebookCell | undefined {
  if (isNotebookCell(arg)) {
    return arg;
  }
  if (isCellMenuArg(arg) && arg.notebookEditor?.notebookUri && typeof arg.cellIndex === 'number') {
    const uri = arg.notebookEditor.notebookUri.toString();
    const notebook = vscode.workspace.notebookDocuments.find(n => n.uri.toString() === uri);
    if (notebook && arg.cellIndex >= 0 && arg.cellIndex < notebook.cellCount) {
      return notebook.cellAt(arg.cellIndex);
    }
  }
  return undefined;
}

async function copyCellReference(arg?: unknown): Promise<void> {
  const cell = resolveCellArg(arg) ?? getActiveSelection()?.cell;
  if (!cell) {
    vscode.window.showInformationMessage('Notebook Cell Index: no active notebook cell.');
    return;
  }
  const cfg = loadConfig();
  const pos = computePosition(cell, cfg);
  if (!pos) {
    vscode.window.showInformationMessage('Notebook Cell Index: this cell has no number under the current settings.');
    return;
  }
  const template = resolveTemplate(cfg);
  if (templateRequiresExecution(template) && typeof cell.executionSummary?.executionOrder !== 'number') {
    vscode.window.showInformationMessage('Notebook Cell Index: this cell has no number until it is executed.');
    return;
  }
  const text = formatLabel(template, pos, cell);
  await vscode.env.clipboard.writeText(text);
  vscode.window.setStatusBarMessage(`Copied "${text}"`, 2000);
}

class GlobalStatusItem {
  private item: vscode.StatusBarItem;

  constructor() {
    this.item = vscode.window.createStatusBarItem('notebookCellIndex.global', vscode.StatusBarAlignment.Right, 100);
    this.item.name = 'Notebook Cell Index';
  }

  update(): void {
    const cfg = loadConfig();
    if (!cfg.showGlobalStatusItem) {
      this.item.hide();
      return;
    }
    const ctx = getActiveSelection();
    if (!ctx || !counts(ctx.cell, cfg)) {
      this.item.hide();
      return;
    }
    const pos = computePosition(ctx.cell, cfg);
    if (!pos) {
      this.item.hide();
      return;
    }
    const template = resolveTemplate(cfg);
    if (templateRequiresExecution(template) && typeof ctx.cell.executionSummary?.executionOrder !== 'number') {
      this.item.hide();
      return;
    }
    const label = formatLabel(template, pos, ctx.cell);
    this.item.text = `$(symbol-numeric) ${label}`;
    this.item.tooltip = `Notebook Cell Index — click to jump to a cell`;
    this.item.command = 'notebookCellIndex.openCellPicker';
    this.item.show();
  }

  dispose(): void {
    this.item.dispose();
  }
}

export function activate(context: vscode.ExtensionContext): void {
  const provider = new CellNumberProvider();
  const globalStatus = new GlobalStatusItem();

  const refreshAll = (): void => {
    provider.notifyChange();
    globalStatus.update();
  };

  context.subscriptions.push(
    vscode.notebooks.registerNotebookCellStatusBarItemProvider('*', provider),
    vscode.commands.registerCommand('notebookCellIndex.openCellPicker', openCellPicker),
    vscode.commands.registerCommand('notebookCellIndex.copyCellReference', copyCellReference),
    vscode.workspace.onDidChangeConfiguration(e => {
      if (e.affectsConfiguration(NS)) {
        refreshAll();
      }
    }),
    vscode.workspace.onDidChangeNotebookDocument(e => {
      if (e.contentChanges.length > 0) {
        refreshAll();
        return;
      }
      const cfg = loadConfig();
      if (cfg.resetMode !== 'none') {
        for (const change of e.cellChanges) {
          if (change.cell.kind === vscode.NotebookCellKind.Markup && change.document) {
            refreshAll();
            return;
          }
        }
      }
      if (templateRequiresExecution(resolveTemplate(cfg))) {
        for (const change of e.cellChanges) {
          if (change.executionSummary !== undefined) {
            refreshAll();
            return;
          }
        }
      }
    }),
    vscode.window.onDidChangeActiveNotebookEditor(() => globalStatus.update()),
    vscode.window.onDidChangeNotebookEditorSelection(() => globalStatus.update()),
    globalStatus,
  );

  globalStatus.update();
}

export function deactivate(): void {}

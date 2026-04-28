import * as vscode from 'vscode';

class CellNumberProvider implements vscode.NotebookCellStatusBarItemProvider {
  readonly onDidChangeCellStatusBarItems: vscode.Event<void>;
  private readonly _onDidChange = new vscode.EventEmitter<void>();

  constructor() {
    this.onDidChangeCellStatusBarItems = this._onDidChange.event;
  }

  notifyChange() {
    this._onDidChange.fire();
  }

  provideCellStatusBarItems(
    cell: vscode.NotebookCell,
    _token: vscode.CancellationToken
  ): vscode.NotebookCellStatusBarItem | undefined {
    const config = vscode.workspace.getConfiguration('notebookCellIndex');
    const format = config.get<string>('format', 'Cell N');
    const showTotal = config.get<boolean>('showTotal', false);
    const includeMarkdownCells = config.get<boolean>('includeMarkdownCells', false);

    if (!includeMarkdownCells && cell.kind !== vscode.NotebookCellKind.Code) {
      return undefined;
    }

    const notebook = cell.notebook;
    let cellIndex = 0;
    let totalCells = 0;

    for (const c of notebook.getCells()) {
      const counts = includeMarkdownCells || c.kind === vscode.NotebookCellKind.Code;
      if (c === cell) {
        cellIndex = totalCells;
      }
      if (counts) {
        totalCells++;
      }
    }

    const n = cellIndex + 1;
    const total = showTotal ? `/${totalCells}` : '';

    let text: string;
    switch (format) {
      case '#N':   text = `#${n}${total}`; break;
      case '[N]':  text = `[${n}${total}]`; break;
      default:     text = `Cell ${n}${total}`; break;
    }

    const kindLabel = cell.kind === vscode.NotebookCellKind.Code ? 'Code cell' : 'Markdown cell';
    const item = new vscode.NotebookCellStatusBarItem(text, vscode.NotebookCellStatusBarAlignment.Left);
    item.tooltip = `${kindLabel} ${n} of ${totalCells}`;
    return item;
  }
}

export function activate(context: vscode.ExtensionContext) {
  const provider = new CellNumberProvider();

  context.subscriptions.push(
    vscode.notebooks.registerNotebookCellStatusBarItemProvider('*', provider),
    vscode.workspace.onDidChangeConfiguration(e => {
      if (e.affectsConfiguration('notebookCellIndex')) {
        provider.notifyChange();
      }
    })
  );
}

export function deactivate() {
}

import * as vscode from 'vscode';

class CellNumberProvider implements vscode.NotebookCellStatusBarItemProvider {
  provideCellStatusBarItems(
    cell: vscode.NotebookCell,
    _token: vscode.CancellationToken
  ): vscode.NotebookCellStatusBarItem | undefined {
    if (cell.kind !== vscode.NotebookCellKind.Code) {
      return undefined;
    }

    const notebook = cell.notebook;
    let codeIndex = 0;

    for (const c of notebook.getCells()) {
      if (c === cell) {
        break;
      }
      if (c.kind === vscode.NotebookCellKind.Code) {
        codeIndex++;
      }
    }

    const item = new vscode.NotebookCellStatusBarItem(
      `Cell ${codeIndex + 1}`,
      vscode.NotebookCellStatusBarAlignment.Left
    );
    item.tooltip = `Code cell #${codeIndex + 1}`;

    return item;
  }
}

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.notebooks.registerNotebookCellStatusBarItemProvider(
      'jupyter-notebook',
      new CellNumberProvider()
    )
  );
}

export function deactivate() {
}

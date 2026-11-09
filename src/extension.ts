import * as vscode from 'vscode';
import { findColors, toOklch } from './convert';

const MAX_ERRORS_IN_MESSAGE = 5;

export function activate(context: vscode.ExtensionContext) {
  context.subscriptions.push(
    vscode.commands.registerCommand(
      'extension.convertColorsToOKLCH',
      convertColors,
    ),
  );
}

async function convertColors(): Promise<void> {
  const editor = vscode.window.activeTextEditor;
  if (!editor) {
    return;
  }

  const { document } = editor;
  const useOpacity = vscode.workspace
    .getConfiguration('oklchConverter', document.uri)
    .get<boolean>('useOpacity', true);

  const ranges = editor.selections.every((selection) => selection.isEmpty)
    ? [new vscode.Range(document.positionAt(0), document.positionAt(document.getText().length))]
    : editor.selections.filter((selection) => !selection.isEmpty);

  const edits: Array<{ range: vscode.Range; text: string }> = [];
  const failed: string[] = [];
  let found = 0;

  for (const range of ranges) {
    const offset = document.offsetAt(range.start);
    for (const match of findColors(document.getText(range))) {
      found++;
      const converted = toOklch(match.text, useOpacity);
      if (converted === undefined) {
        failed.push(match.text);
        continue;
      }
      if (converted !== match.text) {
        const start = document.positionAt(offset + match.index);
        const end = document.positionAt(offset + match.index + match.text.length);
        edits.push({ range: new vscode.Range(start, end), text: converted });
      }
    }
  }

  if (found === 0) {
    vscode.window.showInformationMessage('No colors found.');
    return;
  }

  if (edits.length > 0) {
    await editor.edit((builder) => {
      for (const edit of edits) {
        builder.replace(edit.range, edit.text);
      }
    });
  }

  if (failed.length > 0) {
    showErrors(failed);
  } else if (edits.length === 0) {
    vscode.window.showInformationMessage('All colors are already in OKLCH.');
  }
}

async function showErrors(failed: string[]): Promise<void> {
  const shown = failed.slice(0, MAX_ERRORS_IN_MESSAGE).join(', ');
  const more = failed.length > MAX_ERRORS_IN_MESSAGE ? ', …' : '';
  const choice = await vscode.window.showErrorMessage(
    `Cannot convert ${failed.length} color(s): ${shown}${more}`,
    'View All',
  );

  if (choice === 'View All') {
    const doc = await vscode.workspace.openTextDocument({
      content: failed.join('\n'),
      language: 'plaintext',
    });
    await vscode.window.showTextDocument(doc);
  }
}

export function deactivate() {}

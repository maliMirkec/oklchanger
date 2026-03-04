import * as vscode from 'vscode';
import * as culori from 'culori';

const NAMED_COLORS = '(?:aliceblue|antiquewhite|aqua|aquamarine|azure|beige|bisque|blanchedalmond|blue|blueviolet|brown|burlywood|cadetblue|chartreuse|chocolate|coral|cornflowerblue|cornsilk|crimson|cyan|darkblue|darkcyan|darkgoldenrod|darkgray|darkgreen|darkkhaki|darkmagenta|darkolivegreen|darkorange|darkorchid|darkred|darksalmon|darkseagreen|darkslateblue|darkslategray|darkturquoise|darkviolet|deeppink|deepskyblue|dimgray|dodgerblue|firebrick|floralwhite|forestgreen|fuchsia|gainsboro|ghostwhite|gold|goldenrod|gray|green|greenyellow|honeydew|hotpink|indianred|indigo|ivory|khaki|lavender|lavenderblush|lawngreen|lemonchiffon|lightblue|lightcoral|lightcyan|lightgoldenrodyellow|lightgray|lightgreen|lightpink|lightsalmon|lightseagreen|lightskyblue|lightslategray|lightsteelblue|lightyellow|lime|limegreen|linen|magenta|maroon|mediumaquamarine|mediumblue|mediumorchid|mediumpurple|mediumseagreen|mediumslateblue|mediumspringgreen|mediumturquoise|mediumvioletred|midnightblue|mintcream|mistyrose|moccasin|navajowhite|navy|oldlace|olive|olivedrab|orange|orangered|orchid|palegoldenrod|palegreen|paleturquoise|palevioletred|papayawhip|peachpuff|peru|pink|plum|powderblue|purple|red|rosybrown|royalblue|saddlebrown|salmon|sandybrown|seagreen|seashell|sienna|silver|skyblue|slateblue|slategray|snow|springgreen|steelblue|tan|teal|thistle|tomato|turquoise|violet|wheat|white|whitesmoke|yellow|yellowgreen)';

const HEX_COLOR = '#(?:[0-9a-fA-F]{8}|[0-9a-fA-F]{6}|[0-9a-fA-F]{4}|[0-9a-fA-F]{3})';

// Modern (space-separated) and legacy (comma-separated) RGB/RGBA
const RGB_COLOR = 'rgba?\\(\\s*\\d+(?:\\.\\d+)?%?(?:\\s+\\d+(?:\\.\\d+)?%?\\s+\\d+(?:\\.\\d+)?%?(?:\\s*/\\s*\\d*\\.?\\d+%?)?|\\s*,\\s*\\d+(?:\\.\\d+)?%?\\s*,\\s*\\d+(?:\\.\\d+)?%?(?:\\s*,\\s*\\d*\\.?\\d+%?)?)\\s*\\)';

// Modern (space-separated) and legacy (comma-separated) HSL/HSLA
const HSL_COLOR = 'hsla?\\(\\s*(?:\\d+(?:\\.\\d+)?(?:deg|rad|turn|grad)?)(?:\\s+\\d+(?:\\.\\d+)?%\\s+\\d+(?:\\.\\d+)?%(?:\\s*/\\s*\\d*\\.?\\d+%?)?|\\s*,\\s*\\d+(?:\\.\\d+)?%\\s*,\\s*\\d+(?:\\.\\d+)?%(?:\\s*,\\s*\\d*\\.?\\d+%?)?)\\s*\\)';

// HWB - modern space-separated
const HWB_COLOR = 'hwb\\(\\s*\\d+(?:\\.\\d+)?(?:deg|rad|turn|grad)?\\s+\\d+(?:\\.\\d+)?%\\s+\\d+(?:\\.\\d+)?%(?:\\s*/\\s*\\d*\\.?\\d+%?)?\\s*\\)';

// LAB - space-separated, optional % for lightness
const LAB_COLOR = 'lab\\(\\s*-?\\d+(?:\\.\\d+)?%?\\s+-?\\d+(?:\\.\\d+)?\\s+-?\\d+(?:\\.\\d+)?(?:\\s*/\\s*\\d*\\.?\\d+%?)?\\s*\\)';

// OKLAB - space-separated
const OKLAB_COLOR = 'oklab\\(\\s*-?\\d+(?:\\.\\d+)?%?\\s+-?\\d+(?:\\.\\d+)?\\s+-?\\d+(?:\\.\\d+)?(?:\\s*/\\s*\\d*\\.?\\d+%?)?\\s*\\)';

// LCH - space-separated, optional % and optional deg suffix
const LCH_COLOR = 'lch\\(\\s*-?\\d+(?:\\.\\d+)?%?\\s+-?\\d+(?:\\.\\d+)?\\s+-?\\d+(?:\\.\\d+)?(?:deg)?(?:\\s*/\\s*\\d*\\.?\\d+%?)?\\s*\\)';

// OKLCH - space-separated
const OKLCH_COLOR = 'oklch\\(\\s*-?\\d+(?:\\.\\d+)?%?\\s+-?\\d+(?:\\.\\d+)?\\s+-?\\d+(?:\\.\\d+)?(?:deg)?(?:\\s*/\\s*\\d*\\.?\\d+%?)?\\s*\\)';

// color() function for wide-gamut color spaces
const COLOR_FUNC = 'color\\(\\s*(?:display-p3|srgb|srgb-linear|a98-rgb|prophoto-rgb|rec2020|xyz|xyz-d50|xyz-d65)(?:\\s+-?\\d+(?:\\.\\d+)?){3}(?:\\s*/\\s*\\d*\\.?\\d+%?)?\\s*\\)';

// Match color values directly anywhere in the text (not tied to a CSS property context)
const colorRegex = new RegExp(
  `(${HEX_COLOR}|${OKLCH_COLOR}|${OKLAB_COLOR}|${LCH_COLOR}|${LAB_COLOR}|${HWB_COLOR}|${HSL_COLOR}|${RGB_COLOR}|${COLOR_FUNC}|${NAMED_COLORS})`,
  'gi'
);

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand('extension.convertColorsToOKLCH', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return;
    }

    const selection = editor.selection;
    const targetRange = selection.isEmpty
      ? new vscode.Range(editor.document.positionAt(0), editor.document.positionAt(editor.document.getText().length))
      : selection;
    const selectedText = editor.document.getText(targetRange);

    const matches = Array.from(selectedText.matchAll(colorRegex));
    const errorMessages: string[] = [];

    if (matches.length > 0) {
      // Build replacements using match indices, then apply in reverse to preserve positions
      const replacements: Array<{ index: number; length: number; replacement: string }> = [];

      for (const match of matches) {
        const colorStr = match[0];
        const converted = convertColor(colorStr, errorMessages);
        if (converted) {
          replacements.push({ index: match.index!, length: colorStr.length, replacement: converted.converted });
        }
      }

      let updatedText = selectedText;
      for (let i = replacements.length - 1; i >= 0; i--) {
        const { index, length, replacement } = replacements[i];
        updatedText = updatedText.slice(0, index) + replacement + updatedText.slice(index + length);
      }

      // Update the text in the editor
      editor.edit(editBuilder => {
        editBuilder.replace(targetRange, updatedText);
      });

      if (errorMessages.length) {
        showErrorMessages(errorMessages);
      }
    } else {
      vscode.window.showInformationMessage('No color definitions found in the selected text.');
    }
  });

  context.subscriptions.push(disposable);
}

function convertColor(colorStr: string, errorMessages: string[]): { original: string; converted: string } | undefined {
  try {
    const parsed = culori.parse(colorStr);

    if (!parsed) {
      throw new Error(`Cannot parse ${colorStr}.`);
    }

    parsed.alpha = parsed.alpha ?? 1;
    const oklchColor = culori.oklch(parsed);

    const useOpacity = vscode.workspace.getConfiguration().get<boolean>("oklchConverter.useOpacity", true);
    const alphaPart = useOpacity || parsed.alpha < 1 ? ` / ${formatValue(parsed.alpha)}` : "";

    return {
      original: colorStr,
      converted: `oklch(${formatValue(oklchColor.l ?? 0)} ${formatValue(oklchColor.c ?? 0)} ${formatValue(oklchColor.h ?? 0)}${alphaPart})`
    };
  } catch (error) {
    errorMessages.push(colorStr);
    return undefined;
  }
}

function formatValue(value: number): string {
  const formatted = value.toFixed(2).replace(/\.00$/, '');
  return Object.is(formatted, '-0') ? '0' : formatted;
}

function showErrorMessages(errorMessages: string[]): void {
  const maxErrorsToShow = 100;
  const displayedErrors = `Cannot convert colors: ${errorMessages.slice(0, maxErrorsToShow).join(', ')}.`;

  vscode.window.showErrorMessage(displayedErrors, 'View More').then(selection => {
    if (selection === 'View More') {
      const allErrorsText = errorMessages.join('\n');
      vscode.workspace.openTextDocument({ content: allErrorsText, language: 'plaintext' })
        .then(doc => vscode.window.showTextDocument(doc));
    }
  });
}

export function deactivate() {}

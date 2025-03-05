import * as vscode from 'vscode';
import * as culori from 'culori';

const NAMED_COLORS = '(?:aliceblue|antiquewhite|aqua|aquamarine|azure|beige|bisque|blanchedalmond|blue|blueviolet|brown|burlywood|cadetblue|chartreuse|chocolate|coral|cornflowerblue|cornsilk|crimson|cyan|darkblue|darkcyan|darkgoldenrod|darkgray|darkgreen|darkkhaki|darkmagenta|darkolivegreen|darkorange|darkorchid|darkred|darksalmon|darkseagreen|darkslateblue|darkslategray|darkturquoise|darkviolet|deeppink|deepskyblue|dimgray|dodgerblue|firebrick|floralwhite|forestgreen|fuchsia|gainsboro|ghostwhite|gold|goldenrod|gray|green|greenyellow|honeydew|hotpink|indianred|indigo|ivory|khaki|lavender|lavenderblush|lawngreen|lemonchiffon|lightblue|lightcoral|lightcyan|lightgoldenrodyellow|lightgray|lightgreen|lightpink|lightsalmon|lightseagreen|lightskyblue|lightslategray|lightsteelblue|lightyellow|lime|limegreen|linen|magenta|maroon|mediumaquamarine|mediumblue|mediumorchid|mediumpurple|mediumseagreen|mediumslateblue|mediumspringgreen|mediumturquoise|mediumvioletred|midnightblue|mintcream|mistyrose|moccasin|navajowhite|navy|oldlace|olive|olivedrab|orange|orangered|orchid|palegoldenrod|palegreen|paleturquoise|palevioletred|papayawhip|peachpuff|peru|pink|plum|powderblue|purple|red|rosybrown|royalblue|saddlebrown|salmon|sandybrown|seagreen|seashell|sienna|silver|skyblue|slateblue|slategray|snow|springgreen|steelblue|tan|teal|thistle|tomato|turquoise|violet|wheat|white|whitesmoke|yellow|yellowgreen)';

const HEX_COLOR = '#(?:[0-9a-fA-F]{3}){1,2}|#(?:[0-9a-fA-F]{8})';

const RGB_COLOR = 'rgba?\\(\\s*\\d{1,3}\\s*,\\s*\\d{1,3}\\s*,\\s*\\d{1,3}(?:,\\s*\\d?\\.?\\d+)?\\)';

const HSL_COLOR = 'hsla?\\(\\s*\\d{1,3}\\s*,\\s*\\d{1,3}%?\\s*,\\s*\\d{1,3}%?(?:,\\s*\\d?\\.?\\d+)?\\)';

const LAB_COLOR = 'lab\\(\\s*-?\\d+(?:\\.\\d+)?\\s*,\\s*-?\\d+(?:\\.\\d+)?\\s*,\\s*-?\\d+(?:\\.\\d+)?\\)';

const LCH_COLOR = 'lch\\(\\s*-?\\d+(?:\\.\\d+)?\\s*,\\s*-?\\d+(?:\\.\\d+)?\\s*,\\s*-?\\d+(?:\\.\\d+)?\\s*deg\\)';

const HWB_COLOR = 'hwb\\(\\s*\\d{1,3}\\s*,\\s*\\d{1,3}%\\s*,\\s*\\d{1,3}%\\s*\\)';

// Combine all parts into one regex
const colorRegex = new RegExp(`(?<!\\w)(--\\w+:\\s*)?(?:${NAMED_COLORS}|${HEX_COLOR}|${RGB_COLOR}|${HSL_COLOR}|${HWB_COLOR}|${LAB_COLOR}|${LCH_COLOR})(?=\\s*;|\\s*$)`, 'gi');

export function activate(context: vscode.ExtensionContext) {
  const disposable = vscode.commands.registerCommand('extension.convertColorsToOKLCH', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) return;

    const selection = editor.selection;
    const selectedText = editor.document.getText(selection);

    const matches = selectedText.match(colorRegex);
    const errorMessages: string[] = [];

    if (matches) {
      let updatedText = selectedText;
      const convertedColors = matches.map(colorStr => convertColor(colorStr, errorMessages));

      // Filter out undefined entries
      const validColors = convertedColors.filter((color): color is { original: string; converted: string } => color !== undefined);

      // Update the text in the editor
      editor.edit(editBuilder => {
        updatedText = validColors.reduce((text, { original, converted }) => text.replace(original, converted), updatedText);
        editBuilder.replace(selection, updatedText);
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
  let rgbaColor;

  try {
    rgbaColor = culori.parse(colorStr);

    if (!rgbaColor) {
      const labColorMatch = colorStr.match(/lab\(\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*\)/i);
      const lchMatch = colorStr.match(/lch\(\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)\s*,\s*(-?\d+(?:\.\d+)?)deg\s*\)/i);
      const hwbColorMatch = colorStr.match(/hwb\(\s*(\d{1,3})\s*,\s*(\d{1,3})%\s*,\s*(\d{1,3})%\s*\)/i);

      if (labColorMatch) {
        const l = parseFloat(labColorMatch[1]);
        const a = parseFloat(labColorMatch[2]);
        const b = parseFloat(labColorMatch[3]);
        rgbaColor = culori.rgb({ mode: 'lab', l, a, b });
      } else if (lchMatch) {
        const l = parseFloat(lchMatch[1]);
        const c = parseFloat(lchMatch[2]);
        const h = parseFloat(lchMatch[3]);
        rgbaColor = culori.rgb({ mode: 'lch', l, c, h });
      } else if (hwbColorMatch) {
        const h = parseFloat(hwbColorMatch[1]);
        const w = parseFloat(hwbColorMatch[2]);
        const b = parseFloat(hwbColorMatch[3]);
        rgbaColor = culori.rgb({ mode: 'hwb', h, w, b });
      } else {
        throw new Error(`Cannot convert ${colorStr}.`);
      }
    }

    rgbaColor.alpha = rgbaColor.alpha ?? 1;
    const oklchColor = culori.oklch(rgbaColor);

    // Read setting
    const useOpacity = vscode.workspace.getConfiguration().get<boolean>("oklchConverter.useOpacity", true);
    const alphaPart = useOpacity || rgbaColor.alpha < 1 ? ` / ${formatValue(rgbaColor.alpha)}` : "";

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

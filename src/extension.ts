import * as vscode from 'vscode';
import Color from 'colorjs.io';

export function activate(context: vscode.ExtensionContext) {
  let disposable = vscode.commands.registerCommand('extension.convertColorsToOKLCH', async () => {
    const editor = vscode.window.activeTextEditor;
    if (!editor) {
      return; // No active text editor
    }

    const selection = editor.selection;
    const selectedText = editor.document.getText(selection);

    // Regex to match color definitions (hex, rgb, rgba, hsl, hsla, named colors)
    const colorRegex = /(?<!\w)(--\w+:\s*)?(?:aliceblue|antiquewhite|aqua|aquamarine|azure|beige|bisque|blanchedalmond|blue|blueviolet|brown|burlywood|cadetblue|chartreuse|chocolate|coral|cornflowerblue|cornsilk|crimson|cyan|darkblue|darkcyan|darkgoldenrod|darkgray|darkgreen|darkkhaki|darkmagenta|darkolivegreen|darkorange|darkorchid|darkred|darksalmon|darkseagreen|darkslateblue|darkslategray|darkturquoise|darkviolet|deeppink|deepskyblue|dimgray|dodgerblue|firebrick|floralwhite|forestgreen|fuchsia|gainsboro|ghostwhite|gold|goldenrod|gray|green|greenyellow|honeydew|hotpink|indianred|indigo|ivory|khaki|lavender|lavenderblush|lawngreen|lemonchiffon|lightblue|lightcoral|lightcyan|lightgoldenrodyellow|lightgray|lightgreen|lightpink|lightsalmon|lightseagreen|lightskyblue|lightslategray|lightsteelblue|lightyellow|lime|limegreen|linen|magenta|maroon|mediumaquamarine|mediumblue|mediumorchid|mediumpurple|mediumseagreen|mediumslateblue|mediumspringgreen|mediumturquoise|mediumvioletred|midnightblue|mintcream|mistyrose|moccasin|navajowhite|navy|oldlace|olive|olivedrab|orange|orangered|orchid|palegoldenrod|palegreen|paleturquoise|palevioletred|papayawhip|peachpuff|peru|pink|plum|powderblue|purple|red|rosybrown|royalblue|saddlebrown|salmon|sandybrown|seagreen|seashell|sienna|silver|skyblue|slateblue|slategray|snow|springgreen|steelblue|tan|teal|thistle|tomato|turquoise|violet|wheat|white|whitesmoke|yellow|yellowgreen|#(?:[0-9a-fA-F]{3}){1,2}|rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}(?:,\s*\d?\.?\d+)?\)|hsla?\(\s*\d{1,3}\s*,\s*\d{1,3}%?\s*,\s*\d{1,3}%?(?:,\s*\d?\.?\d+)?\)|lab\(\s*-?\d+(?:\.\d+)?\s*,\s*-?\d+(?:\.\d+)?\s*,\s*-?\d+(?:\.\d+)?\)|lch\(\s*-?\d+(?:\.\d+)?\s*,\s*-?\d+(?:\.\d+)?\s*,\s*-?\d+(?:\.\d+)?\s*deg\))(?=\s*;|\s*$)/gi;

    const matches = selectedText.match(colorRegex);

    if (matches) {
      let updatedText = selectedText; // Keep a copy of the selected text to update
      const convertedColors = matches.map(colorStr => {
        let oklch: string;

        // Convert 'transparent' to 'rgba(0, 0, 0, 0)' for conversion
        if (colorStr.trim() === 'transparent') {
          colorStr = 'rgba(0, 0, 0, 0)';
        }

        try {
          const color = new Color(colorStr); // Create a Color object
          const [l, c, h] = color.to('oklch').coords; // Convert to OKLCH

          // Check for NaN values
          if (isNaN(l) || isNaN(c) || isNaN(h)) {
            throw new Error('Invalid OKLCH values');
          }

          oklch = `oklch(${(l * 100).toFixed(2)}% ${c.toFixed(2)} ${h.toFixed(2)}deg)`;
        } catch (error) {
          const errorMessage = `Error converting color: ${colorStr}`;
          vscode.window.showErrorMessage(errorMessage); // Show error message
          return {
            original: colorStr,
            converted: 'Error converting color'
          };
        }

        // Replace original color in the updated text
        updatedText = updatedText.replace(colorStr, oklch);

        return {
          original: colorStr,
          converted: oklch
        };
      });

      // Display the results only if there were errors
      const hasError = convertedColors.some(c => c.converted === 'Error converting color');
      if (hasError) {
        const resultMessage = convertedColors.map(c => `${c.original} → ${c.converted}`).join('\n');
        vscode.window.showInformationMessage(resultMessage);
      }

      // Update the text in the editor
      editor.edit(editBuilder => {
        editBuilder.replace(selection, updatedText);
      });
    } else {
      vscode.window.showInformationMessage('No color definitions found in the selected text.');
    }
  });

  context.subscriptions.push(disposable);
}

export function deactivate() {}

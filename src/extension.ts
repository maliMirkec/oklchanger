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
    const errorMessages: string[] = []; // Array to store error messages

    if (matches) {
      let updatedText = selectedText; // Keep a copy of the selected text to update
      const convertedColors = matches.map(colorStr => {
        let oklch: string;

        try {
          const color = new Color(colorStr); // Create a Color object
          const [l, c, h] = color.to('oklch').coords; // Convert to OKLCH

          // Check for NaN values
          if (isNaN(l) || isNaN(c) || isNaN(h)) {
            throw new Error('Invalid OKLCH values');
          }

          oklch = `oklch(${(l * 100).toFixed(2)}% ${c.toFixed(2)} ${h.toFixed(2)}deg)`;
        } catch (error: any) {
          errorMessages.push(colorStr);
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

      // Show consolidated error message if there were errors
      if (errorMessages.length > 0) {
        const maxErrorsToShow = 100; // Show first 100 errors in the error box
        const displayedErrors = `Cannot convert colors: ${errorMessages.slice(0, maxErrorsToShow).join(', ')}. OKLCH transformation not supported. See Unsupported Color Formats.`;

        vscode.window.showErrorMessage(displayedErrors, 'View More').then(selection => {
          if (selection === 'View More') {
            // Open a new document with all errors if 'View More' is clicked
            const allErrorsText = errorMessages.join('\n');
            vscode.workspace.openTextDocument({ content: allErrorsText, language: 'plaintext' })
              .then(doc => vscode.window.showTextDocument(doc));
          }
        });
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

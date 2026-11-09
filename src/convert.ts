import { oklch, parse } from 'culori';

const NUM = '[+-]?(?:\\d+(?:\\.\\d*)?|\\.\\d+)(?:e[+-]?\\d+)?';
const PCT = `${NUM}%?`;
const VAL = `(?:${PCT}|none)`;
const HUE = `(?:${NUM}(?:deg|rad|grad|turn)?|none)`;
const ALPHA = `(?:\\s*/\\s*${VAL})?`;
const SP = '\\s+';
const CM = '\\s*,\\s*';
const START = '(?<![\\w.$@#-])';

const fn = (name: string, ...bodies: string[]) =>
  `${START}${name}\\(\\s*(?:${bodies.join('|')})\\s*\\)`;

const HEX = '#(?:[0-9a-f]{8}|[0-9a-f]{6}|[0-9a-f]{3,4})(?![\\w-])';

const RGB = fn(
  'rgba?',
  `${VAL}${SP}${VAL}${SP}${VAL}${ALPHA}`,
  `${PCT}${CM}${PCT}${CM}${PCT}(?:${CM}${PCT})?`,
);

const HSL = fn(
  'hsla?',
  `${HUE}${SP}${VAL}${SP}${VAL}${ALPHA}`,
  `${HUE}${CM}${PCT}${CM}${PCT}(?:${CM}${PCT})?`,
);

const HWB = fn('hwb', `${HUE}${SP}${VAL}${SP}${VAL}${ALPHA}`);
const LAB = fn('(?:ok)?lab', `${VAL}${SP}${VAL}${SP}${VAL}${ALPHA}`);
const LCH = fn('(?:ok)?lch', `${VAL}${SP}${VAL}${SP}${HUE}${ALPHA}`);

const COLOR = fn(
  'color',
  `(?:display-p3|srgb|srgb-linear|a98-rgb|prophoto-rgb|rec2020|xyz|xyz-d50|xyz-d65)(?:${SP}${VAL}){3}${ALPHA}`,
);

const NAMED_COLORS = [
  'aliceblue', 'antiquewhite', 'aqua', 'aquamarine', 'azure', 'beige',
  'bisque', 'black', 'blanchedalmond', 'blue', 'blueviolet', 'brown',
  'burlywood', 'cadetblue', 'chartreuse', 'chocolate', 'coral',
  'cornflowerblue', 'cornsilk', 'crimson', 'cyan', 'darkblue', 'darkcyan',
  'darkgoldenrod', 'darkgray', 'darkgreen', 'darkgrey', 'darkkhaki',
  'darkmagenta', 'darkolivegreen', 'darkorange', 'darkorchid', 'darkred',
  'darksalmon', 'darkseagreen', 'darkslateblue', 'darkslategray',
  'darkslategrey', 'darkturquoise', 'darkviolet', 'deeppink', 'deepskyblue',
  'dimgray', 'dimgrey', 'dodgerblue', 'firebrick', 'floralwhite',
  'forestgreen', 'fuchsia', 'gainsboro', 'ghostwhite', 'gold', 'goldenrod',
  'gray', 'green', 'greenyellow', 'grey', 'honeydew', 'hotpink', 'indianred',
  'indigo', 'ivory', 'khaki', 'lavender', 'lavenderblush', 'lawngreen',
  'lemonchiffon', 'lightblue', 'lightcoral', 'lightcyan',
  'lightgoldenrodyellow', 'lightgray', 'lightgreen', 'lightgrey', 'lightpink',
  'lightsalmon', 'lightseagreen', 'lightskyblue', 'lightslategray',
  'lightslategrey', 'lightsteelblue', 'lightyellow', 'lime', 'limegreen',
  'linen', 'magenta', 'maroon', 'mediumaquamarine', 'mediumblue',
  'mediumorchid', 'mediumpurple', 'mediumseagreen', 'mediumslateblue',
  'mediumspringgreen', 'mediumturquoise', 'mediumvioletred', 'midnightblue',
  'mintcream', 'mistyrose', 'moccasin', 'navajowhite', 'navy', 'oldlace',
  'olive', 'olivedrab', 'orange', 'orangered', 'orchid', 'palegoldenrod',
  'palegreen', 'paleturquoise', 'palevioletred', 'papayawhip', 'peachpuff',
  'peru', 'pink', 'plum', 'powderblue', 'purple', 'rebeccapurple', 'red',
  'rosybrown', 'royalblue', 'saddlebrown', 'salmon', 'sandybrown', 'seagreen',
  'seashell', 'sienna', 'silver', 'skyblue', 'slateblue', 'slategray',
  'slategrey', 'snow', 'springgreen', 'steelblue', 'tan', 'teal', 'thistle',
  'tomato', 'transparent', 'turquoise', 'violet', 'wheat', 'white',
  'whitesmoke', 'yellow', 'yellowgreen',
];

const NAMED = `${START}(?:${NAMED_COLORS.join('|')})(?![\\w(-])`;

const COLOR_PATTERN = [HEX, LCH, LAB, HWB, HSL, RGB, COLOR, NAMED].join('|');

export interface ColorMatch {
  index: number;
  text: string;
}

export function findColors(text: string): ColorMatch[] {
  const regex = new RegExp(COLOR_PATTERN, 'gi');
  return Array.from(text.matchAll(regex), (match) => ({
    index: match.index ?? 0,
    text: match[0],
  }));
}

export function formatNumber(value: number, digits: number): string {
  const rounded = Number(value.toFixed(digits));
  return Object.is(rounded, -0) ? '0' : String(rounded);
}

export function toOklch(color: string, useOpacity: boolean): string | undefined {
  const parsed = parse(color.toLowerCase());
  if (!parsed) {
    return undefined;
  }

  const { l = 0, c = 0, h = 0 } = oklch(parsed);
  const alpha = parsed.alpha ?? 1;
  const hue = c === 0 || Number.isNaN(h) ? 0 : h;
  const alphaPart =
    useOpacity || alpha < 1 ? ` / ${formatNumber(alpha, 3)}` : '';

  return `oklch(${formatNumber(l, 3)} ${formatNumber(c, 3)} ${formatNumber(hue, 2)}${alphaPart})`;
}

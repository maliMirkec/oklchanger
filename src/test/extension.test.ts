import * as assert from 'assert';
import { findColors, formatNumber, toOklch } from '../convert';

const texts = (input: string) => findColors(input).map((match) => match.text);

suite('findColors', () => {
  test('finds hex colors', () => {
    assert.deepStrictEqual(texts('a: #fff; b: #FF0000; c: #ff000080;'), [
      '#fff',
      '#FF0000',
      '#ff000080',
    ]);
  });

  test('skips hex-like ids and longer strings', () => {
    assert.deepStrictEqual(texts('#cafe-menu #add-button #abcdef123'), []);
  });

  test('finds legacy and modern functions', () => {
    assert.deepStrictEqual(
      texts('rgb(255, 0, 0) rgb(255 0 0 / .5) hsl(-30 50% 50%) hsla(120deg, 50%, 50%, 0.5)'),
      ['rgb(255, 0, 0)', 'rgb(255 0 0 / .5)', 'hsl(-30 50% 50%)', 'hsla(120deg, 50%, 50%, 0.5)'],
    );
  });

  test('finds uppercase functions', () => {
    assert.deepStrictEqual(texts('RGB(255 0 0)'), ['RGB(255 0 0)']);
  });

  test('finds lab, lch, oklab, oklch, hwb, and color()', () => {
    assert.deepStrictEqual(
      texts('lab(50% 75 60) lch(53% 105 40) oklab(0.6 0.2 0.1) oklch(0.6 0.25 none) hwb(0 0% 0%) color(display-p3 1 0 0)'),
      ['lab(50% 75 60)', 'lch(53% 105 40)', 'oklab(0.6 0.2 0.1)', 'oklch(0.6 0.25 none)', 'hwb(0 0% 0%)', 'color(display-p3 1 0 0)'],
    );
  });

  test('does not match lch inside a broken oklch', () => {
    assert.deepStrictEqual(texts('oklch(0.6, 0.25, 20)'), []);
  });

  test('finds all colors in multi-value properties', () => {
    assert.deepStrictEqual(texts('background: linear-gradient(red, #00f 50%, blue);'), [
      'red',
      '#00f',
      'blue',
    ]);
  });

  test('skips names that are part of identifiers', () => {
    assert.deepStrictEqual(
      texts('.b-color-blue white-space --red $red @tan Math.tan(1) tan(45deg) redirect'),
      [],
    );
  });

  test('finds names that were missing before', () => {
    assert.deepStrictEqual(texts('black grey rebeccapurple'), [
      'black',
      'grey',
      'rebeccapurple',
    ]);
  });
});

suite('toOklch', () => {
  test('converts named colors', () => {
    assert.strictEqual(toOklch('red', false), 'oklch(0.628 0.258 29.23)');
  });

  test('adds opacity when enabled', () => {
    assert.strictEqual(toOklch('red', true), 'oklch(0.628 0.258 29.23 / 1)');
  });

  test('keeps opacity below 1 when disabled', () => {
    assert.strictEqual(toOklch('rgb(255 0 0 / 50%)', false), 'oklch(0.628 0.258 29.23 / 0.5)');
  });

  test('converts uppercase input', () => {
    assert.strictEqual(toOklch('RGB(255 0 0)', false), 'oklch(0.628 0.258 29.23)');
  });

  test('uses 0 hue for grays', () => {
    assert.strictEqual(toOklch('#fff', false), 'oklch(1 0 0)');
    assert.strictEqual(toOklch('black', false), 'oklch(0 0 0)');
  });

  test('converts transparent', () => {
    assert.strictEqual(toOklch('transparent', false), 'oklch(0 0 0 / 0)');
  });

  test('returns undefined for invalid colors', () => {
    assert.strictEqual(toOklch('rgb(foo)', false), undefined);
  });
});

suite('formatNumber', () => {
  test('trims trailing zeros and negative zero', () => {
    assert.strictEqual(formatNumber(0.5, 3), '0.5');
    assert.strictEqual(formatNumber(1, 3), '1');
    assert.strictEqual(formatNumber(-0.0001, 3), '0');
  });
});

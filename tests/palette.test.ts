import assert from 'node:assert/strict';
import test from 'node:test';

import {
  ACCENT_TOKENS,
  buildPalette,
  isAccentId,
  mix,
  type ColorScheme,
} from '../constants/palette';
import { ACCENT_IDS } from '../types/settings';

function relativeLuminance(hex: string): number {
  const value = hex.replace('#', '');
  const channels = [0, 2, 4].map((i) => parseInt(value.slice(i, i + 2), 16) / 255);
  const [r, g, b] = channels.map((c) => (c <= 0.04045 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4));
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(a: string, b: string): number {
  const la = relativeLuminance(a);
  const lb = relativeLuminance(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

const AA = 4.5;
const SCHEMES: ColorScheme[] = ['light', 'dark'];

test('every accent clears WCAG AA against every surface it is used on', () => {
  for (const accent of ACCENT_IDS) {
    for (const scheme of SCHEMES) {
      const c = buildPalette(scheme, accent);
      const pairs: Array<[string, string, string]> = [
        ['accent/bg', c.accent, c.bg],
        ['accent/surface', c.accent, c.surface],
        ['accent/surfaceAlt', c.accent, c.surfaceAlt],
        ['accent/surfaceSunken', c.accent, c.surfaceSunken],
        ['accent/calmBg', c.accent, c.calmBg],
        ['accent/accentSoft', c.accent, c.accentSoft],
        ['onAccent/accent', c.onAccent, c.accent],
        ['accentSoftText/accentSoft', c.accentSoftText, c.accentSoft],
      ];

      for (const [name, fg, bg] of pairs) {
        const ratio = contrast(fg, bg);
        assert.ok(
          ratio >= AA,
          `${accent}/${scheme} ${name} is ${ratio.toFixed(2)}:1, needs ${AA}:1`
        );
      }
    }
  }
});

test('body text stays readable on the accent-tinted calm background', () => {
  for (const accent of ACCENT_IDS) {
    for (const scheme of SCHEMES) {
      const c = buildPalette(scheme, accent);
      for (const [name, fg] of [
        ['text', c.text],
        ['textMuted', c.textMuted],
        ['textSubtle', c.textSubtle],
      ] as const) {
        const ratio = contrast(fg, c.calmBg);
        assert.ok(
          ratio >= AA,
          `${accent}/${scheme} ${name} on calmBg is ${ratio.toFixed(2)}:1`
        );
      }
    }
  }
});

test('accents are actually distinct from one another', () => {
  for (const scheme of SCHEMES) {
    const seen = new Set<string>();
    for (const accent of ACCENT_IDS) {
      const { accent: color } = buildPalette(scheme, accent);
      assert.ok(!seen.has(color), `${accent} duplicates another accent in ${scheme}`);
      seen.add(color);
    }
  }
});

test('the palette list and the id union stay in sync', () => {
  assert.deepEqual([...ACCENT_IDS].sort(), Object.keys(ACCENT_TOKENS).sort());
  assert.ok(ACCENT_IDS.includes('blush'), 'pink is one of the options');
  for (const accent of ACCENT_IDS) {
    assert.ok(ACCENT_TOKENS[accent].label.length > 0);
  }
});

test('a corrupted stored accent falls back instead of crashing', () => {
  assert.equal(isAccentId('blush'), true);
  assert.equal(isAccentId('chartreuse'), false);
  assert.equal(isAccentId(undefined), false);
  assert.equal(isAccentId(null), false);

  // @ts-expect-error — simulating a value read back from storage
  const palette = buildPalette('light', 'chartreuse');
  assert.equal(palette.accent, buildPalette('light', 'forest').accent);
});

test('mix blends predictably', () => {
  assert.equal(mix('#000000', '#FFFFFF', 0), '#000000');
  assert.equal(mix('#000000', '#FFFFFF', 1), '#FFFFFF');
  assert.equal(mix('#000000', '#FFFFFF', 0.5), '#808080');
});

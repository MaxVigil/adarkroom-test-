import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import vm from 'node:vm';
import { describe, expect, it } from 'vitest';

const intentionallyUntranslated = new Set([
  'android',
  'dropbox.',
  'facebook',
  'github.',
  'google+',
  'iOS.',
  'ios',
  'reddit',
  'twitter',
  '{0}:{1}',
]);

function javascriptFiles(directory: string): string[] {
  return readdirSync(directory).flatMap((entry) => {
    const path = join(directory, entry);
    return statSync(path).isDirectory() ? javascriptFiles(path) : path.endsWith('.js') ? [path] : [];
  });
}

function translatedKeys(): Set<string> {
  let translations: Record<string, string> = {};
  vm.runInNewContext(readFileSync(resolve('lang/uk/strings.js'), 'utf8'), {
    _: { setTranslation: (value: Record<string, string>) => { translations = value; } },
  });
  return new Set(Object.keys(translations));
}

function sourceTranslationKeys(): Set<string> {
  const keys = new Set<string>();
  for (const file of javascriptFiles(resolve('script'))) {
    if (file.endsWith(join('events', 'marketing.js'))) continue;
    const source = readFileSync(file, 'utf8');
    const call = /\b_\(\s*(['"])/g;
    for (const match of source.matchAll(call)) {
      const quote = match[1]!;
      let value = '';
      let escaped = false;
      for (let index = match.index + match[0].length; index < source.length; index += 1) {
        const character = source[index]!;
        if (escaped) {
          const escapes: Record<string, string> = { n: '\n', r: '\r', t: '\t', b: '\b', f: '\f', v: '\v' };
          value += escapes[character] ?? character;
          escaped = false;
        } else if (character === '\\') {
          escaped = true;
        } else if (character === quote) {
          keys.add(value);
          break;
        } else {
          value += character;
        }
      }
    }
  }
  return keys;
}

describe('Ukrainian localization', () => {
  it('covers every literal player-facing source string except proper names and neutral formats', () => {
    const translated = translatedKeys();
    const missing = [...sourceTranslationKeys()]
      .filter((key) => !translated.has(key) && !intentionallyUntranslated.has(key))
      .sort();
    expect(missing).toEqual([]);
  });
});

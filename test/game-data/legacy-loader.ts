import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import vm from 'node:vm';

export interface LegacyLoadOptions {
  buildingCounts?: Record<string, number>;
}

export function loadLegacy<T>(
  sourceFile: string,
  expression: string,
  options: LegacyLoadOptions = {},
): T {
  let blackHole: unknown;
  const callable = () => blackHole;
  blackHole = new Proxy(callable, {
    get: () => blackHole,
    apply: () => blackHole,
    construct: () => blackHole as object,
    ownKeys: () => [],
    getOwnPropertyDescriptor: () => ({ configurable: true, enumerable: false }),
  });

  const buildingCounts = options.buildingCounts ?? {};
  const context = vm.createContext({
    console,
    _: (value: string) => value,
    AudioLibrary: blackHole,
    AudioEngine: blackHole,
    Button: blackHole,
    Header: blackHole,
    Notifications: blackHole,
    Engine: blackHole,
    Events: { _LEAVE_COOLDOWN: 1, _EVENT_TIME: 1 },
    Enemies: undefined,
    Fabricator: blackHole,
    Outside: blackHole,
    Path: blackHole,
    Prestige: blackHole,
    Room: blackHole,
    Ship: blackHole,
    Space: blackHole,
    World: blackHole,
    State: {},
    document: blackHole,
    navigator: blackHole,
    localStorage: blackHole,
    setTimeout: blackHole,
    clearTimeout: blackHole,
    setInterval: blackHole,
    clearInterval: blackHole,
    $SM: {
      get(path: string): number {
        const match = path.match(/^game\.buildings\["(.+)"\]$/);
        return match?.[1] ? buildingCounts[match[1]] ?? 0 : 0;
      },
    },
    $: Object.assign(() => blackHole, { extend: (...args: unknown[]) => args.at(-1) }),
    jQuery: { Callbacks: () => blackHole },
  });
  context.window = context;

  const source = readFileSync(resolve(process.cwd(), sourceFile), 'utf8');
  new vm.Script(`${source}\n;globalThis.__legacyResult = (${expression});`, { filename: sourceFile })
    .runInContext(context);
  return context.__legacyResult as T;
}

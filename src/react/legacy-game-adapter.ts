export interface GameUiSnapshot {
  speed: number;
  speedLabel: string;
}

interface LegacyEngine {
  getGameSpeed(): number;
  showSpeedMenu(): void;
}

interface LegacyWindow {
  Engine: LegacyEngine;
  _: (key: string, ...values: unknown[]) => string;
}

const SPEED_EVENT = 'light-room:speed-change';
let cachedSnapshot: GameUiSnapshot | undefined;

export function getGameUiSnapshot(): GameUiSnapshot {
  const legacy = window as unknown as LegacyWindow;
  const speed = legacy.Engine?.getGameSpeed?.() ?? 1;
  if (!cachedSnapshot || cachedSnapshot.speed !== speed) {
    cachedSnapshot = { speed, speedLabel: `${legacy._('speed')} x${speed}.` };
  }
  return cachedSnapshot;
}

export function subscribeToGameUi(listener: () => void): () => void {
  window.addEventListener(SPEED_EVENT, listener);
  return () => window.removeEventListener(SPEED_EVENT, listener);
}

export function showSpeedMenu(): void {
  (window as unknown as LegacyWindow).Engine.showSpeedMenu();
}

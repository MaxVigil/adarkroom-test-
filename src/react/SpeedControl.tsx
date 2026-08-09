import { UnstyledButton } from '@mantine/core';
import { useSyncExternalStore } from 'react';
import {
  getGameUiSnapshot,
  showSpeedMenu,
  subscribeToGameUi,
} from './legacy-game-adapter.js';

export function SpeedControl() {
  const snapshot = useSyncExternalStore(subscribeToGameUi, getGameUiSnapshot);

  return (
    <UnstyledButton
      className="hyper light-room-react-speed"
      onClick={showSpeedMenu}
      aria-label={snapshot.speedLabel}
    >
      {snapshot.speedLabel}
    </UnstyledButton>
  );
}

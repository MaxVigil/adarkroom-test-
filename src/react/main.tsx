import '@mantine/core/styles.css';
import { MantineProvider } from '@mantine/core';
import { createRoot, type Root } from 'react-dom/client';
import { SpeedControl } from './SpeedControl.js';
import './react-shell.css';

let root: Root | undefined;

export function mount(target: HTMLElement | null): void {
  if (!target || root) return;
  root = createRoot(target);
  root.render(
    <MantineProvider>
      <SpeedControl />
    </MantineProvider>,
  );
}

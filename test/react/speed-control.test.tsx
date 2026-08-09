// @vitest-environment jsdom

import '@testing-library/jest-dom/vitest';
import { MantineProvider } from '@mantine/core';
import { render, screen } from '@testing-library/react';
import { userEvent } from '@testing-library/user-event';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { SpeedControl } from '../../src/react/SpeedControl.js';

describe('React speed control migration slice', () => {
  const showSpeedMenu = vi.fn();

  beforeEach(() => {
    showSpeedMenu.mockClear();
    Object.defineProperty(window, 'matchMedia', {
      configurable: true,
      value: vi.fn().mockImplementation((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
    Object.assign(window, {
      Engine: { getGameSpeed: () => 4, showSpeedMenu },
      _: (key: string) => key,
    });
  });

  it('reads the legacy snapshot and dispatches only the speed-menu command', async () => {
    const user = userEvent.setup();
    render(
      <MantineProvider>
        <SpeedControl />
      </MantineProvider>,
    );

    const control = screen.getByRole('button', { name: 'speed x4.' });
    expect(control).toHaveTextContent('speed x4.');
    await user.click(control);
    expect(showSpeedMenu).toHaveBeenCalledOnce();
  });
});

# React migration readiness for Light Room

- Status: In progress; first UI slice complete
- Date: 2026-08-08
- Updated: 2026-08-09

## Outcome

Move the interface to React incrementally while keeping the verified simulation,
catalog, saves, and balancing tests operational. React renders state and dispatches
commands; it does not own economy rules, timers, random generation, or save migration.

The target remains React + TypeScript + Vite. Vite provides an official `react-ts`
template and React plugin, while type checking stays a separate `tsc --noEmit` step.
No server-side rendering or full-stack framework is required for this offline-first
single-player game.

## Boundary to create before the first component

Expose a framework-neutral game application API:

```text
getSnapshot() -> immutable GameSnapshot
subscribe(listener) -> unsubscribe
dispatch(GameCommand) -> CommandResult
loadSave(raw) -> validated state
exportSave() -> versioned data
```

During coexistence, React can subscribe to the legacy state through
`useSyncExternalStore`, whose intended use includes integration with existing
non-React stores. Snapshots must be immutable and cached until state actually changes.

Do not let components read `$SM`, `Outside`, `Room`, mutable globals, or jQuery nodes
directly. One temporary adapter may do so; it becomes the single seam that is removed
after migration.

## Recommended sequence

1. **Contracts and adapters.** Define `GameSnapshot`, `GameCommand`, clock, random,
   storage, and localization ports. Wrap the existing runtime without changing the
   visible UI.
2. **React shell beside the legacy screen.** Add Vite and mount one React root. Keep
   the old runtime loaded and connect it through the adapter. **Completed for the
   speed-control root.**
3. **Low-risk vertical slice.** Migrate settings, speed, language, and the bottom menu.
   This proves state subscription, commands, localization, styling, and persistence
   without touching progression. **Speed is complete; language and remaining menu
   controls are next.**
4. **Settlement slice.** Migrate resource rows, buildings, jobs, tooltips, Logger Hut,
   and Guest House using catalog-driven view models.
5. **Events and expeditions.** Migrate only after event state and combat commands have
   framework-neutral contracts and parity scenarios.
6. **Remove the legacy adapter.** Delete jQuery UI code only after every critical
   Playwright journey runs against React and save compatibility remains green.

## Dependency discipline

Start the React shell with the smallest useful set:

- runtime: `react`, `react-dom`, `@mantine/core`, `@mantine/hooks`, `zod`;
- build: `vite`, `@vitejs/plugin-react`, TypeScript;
- tests: existing Vitest and Playwright plus `@testing-library/react`,
  `@testing-library/dom`, and `@testing-library/user-event`;
- add Zustand only when multiple React surfaces need shared client-only state that is
  not already part of the game snapshot;
- add i18next when typed catalog localization is insufficient for full interface
  copy, plurals, and formatting.

Avoid adding a router, server framework, query cache, form framework, or animation
library until a real screen requires it. All recommended packages are open source; no
paid service is required for the migration.

## Test contract

- Keep pure Vitest tests for economy, progression, queues, random distributions with
  injected rolls, and save migrations.
- Add React Testing Library tests that query semantic roles and accessible names rather
  than component internals.
- Keep Playwright for only critical player journeys and run it against the production
  Vite build before retiring a legacy slice.
- Require `pnpm typecheck`, unit tests, a production build, and browser tests in CI.

## Definition of ready for React work

- [ ] all tunable content consumed from validated catalogs;
- [x] one immutable snapshot and command boundary exists for the migrated speed slice;
- [ ] clock, random source, storage, and localization are injectable;
- [ ] current save schema has versioned migrations and fixtures;
- [ ] critical settlement and expedition journeys have browser parity tests;
- [ ] no new feature adds DOM manipulation outside the legacy adapter;
- [x] a single React shell can coexist with the current playable build.

## Implemented bridge

- `src/react/legacy-game-adapter.ts` is the only React-side seam into the current
  global runtime for this slice.
- `src/react/SpeedControl.tsx` has no knowledge of jQuery, saves, or timers.
- Vite produces a checked-in compatibility bundle under `script/generated/react/`.
- React Testing Library checks the semantic button and command dispatch; the existing
  Playwright speed journey verifies Ukrainian copy, x20 timing, and persistence.
- `process.env.NODE_ENV` is fixed to production at build time so the IIFE bundle does
  not depend on a Node.js `process` global in the browser.

## Primary references

- React: <https://react.dev/reference/react/useSyncExternalStore>
- Vite getting started: <https://vite.dev/guide/>
- Vite TypeScript behavior: <https://vite.dev/guide/features.html#typescript>
- React Testing Library: <https://testing-library.com/docs/react-testing-library/intro/>
- Semantic query priority: <https://testing-library.com/docs/queries/about/#priority>
- Playwright configuration: <https://playwright.dev/docs/test-configuration>

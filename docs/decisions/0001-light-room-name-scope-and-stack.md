# ADR 0001: Light Room name, scope, and target stack

- Status: Accepted
- Date: 2026-08-08
- Owner: MaxVigil
- Notion: https://maxvigil.notion.site/3b581cc4e8c281628319d853adf08fdc

## Decision

The official project and game name is **Light Room**.

Light Room is a separate game inspired by *A Dark Room*. The inherited codebase and
the original game's public documentation may be used as implementation and design
references, but they do not define the future product identity or constrain the
technology choices.

This decision does not authorize a blind, repository-wide rename or a one-shot
rewrite. User-facing renames and migration work should be delivered in reviewed,
testable slices.

## Product scope

Development is not limited to visual changes. The design and balance work covers the
complete game system, including:

- resources and storage;
- buildings and their upgrades;
- professions, workers, and production assignments;
- items, tools, weapons, armor, consumables, and crafting recipes;
- production and consumption chains;
- events, expeditions, world exploration, and combat;
- unlocks, progression, pacing, and mathematical balance;
- saves and migrations;
- UI/UX, accessibility, audio, and localization.

New systems should be designed as a coherent economy rather than isolated features.
For example, a new Logger's Hut must specify its build cost, unlock condition,
worker role, base output, tool bonuses, dependencies, and its effect on surrounding
resource bottlenecks.

## Target technical direction

The target stack is:

- TypeScript;
- React and Vite;
- Mantine with a project theme and CSS Modules;
- a UI-independent simulation/domain layer written in pure TypeScript;
- Zustand for client state where shared reactive state is needed;
- Zod for validation of catalogs, configuration, and save data;
- i18next and react-i18next for localization;
- Howler.js for audio;
- Storybook for isolated UI development and visual states;
- Vitest for unit and economy tests;
- Playwright for critical player journeys and accessibility checks.

The stack is a migration target. Existing HTML, CSS, and JavaScript may remain until
the relevant vertical slice is replaced and its behavior is covered by tests.

## Architecture constraints

1. Game rules must not depend on React components or the browser DOM.
2. Resources, buildings, professions, items, recipes, and unlocks should be modeled
   as validated data catalogs wherever practical.
3. Production rates and costs must use explicit units and timing; balance changes
   require tests or a reproducible simulation.
4. Save data must be versioned, validated, and migrated instead of being silently
   discarded after schema changes.
5. UI components should reuse Mantine and shared Light Room design tokens before a
   custom control is created.
6. New player-facing text must be localizable.
7. Prefer open-source dependencies with licenses suitable for distribution. Adding a
   paid service or proprietary runtime dependency requires an explicit decision.
8. Migration should proceed through small vertical slices that can be played and
   verified independently.

## Consequences

- The repository may temporarily contain legacy and target implementations together.
- Product documentation must refer to the new game as Light Room.
- *A Dark Room* names may remain when identifying inherited code, upstream behavior,
  or historical reference material.
- Economy work should begin with a canonical catalog and simulation model before the
  new interface becomes the source of truth.
- Codex instructions in `AGENTS.md` enforce this decision for future changes.

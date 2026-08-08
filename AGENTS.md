# Light Room development instructions

## Project identity

- The official project and game name is **Light Room**.
- Light Room is a separate game inspired by *A Dark Room*.
- Treat inherited *A Dark Room* code and public documentation as reference material,
  not as immutable product or architecture requirements.
- Do not perform a repository-wide rename or rewrite unless a task explicitly scopes
  and validates it.

Read `docs/decisions/0001-light-room-name-scope-and-stack.md` before making product,
architecture, economy, or UI decisions.

## Full game scope

Do not assume a request is only a UI reskin. The planned redesign includes resources,
storage, buildings, upgrades, professions, workers, items, equipment, crafting,
production chains, events, expeditions, exploration, combat, progression, balance,
saves, UI/UX, accessibility, audio, and localization.

When changing one of these systems, identify its inputs, outputs, unlocks, downstream
dependencies, balance impact, UI representation, save-data impact, and required
tests.

## Target architecture

- Use TypeScript for new target-architecture modules.
- Keep the simulation/domain layer independent from React and the DOM.
- Prefer validated data catalogs for resources, buildings, professions, items,
  recipes, upgrades, and unlock rules.
- Use React + Vite for migrated UI surfaces and Mantine plus shared Light Room theme
  tokens for controls and layout.
- Use Zustand only for shared reactive client state; keep derived values and game
  rules in the domain layer.
- Use Zod at data and save boundaries.
- Route new player-facing strings through i18next.
- Use Howler.js for new audio integration.
- Add Storybook stories for reusable UI components and important states.
- Use Vitest for game rules and economy calculations; use Playwright for critical
  player journeys.

This is an incremental migration target. Preserve working legacy behavior until the
replacement slice is playable and tested.

## Economy and content rules

For every new or changed resource, building, profession, item, or recipe, document:

- stable identifier and displayed name;
- unlock condition;
- construction or crafting costs;
- production and consumption rates with explicit time units;
- worker requirements and assignment rules;
- storage limits and overflow behavior;
- tool, upgrade, and building modifiers;
- prerequisites and downstream consumers;
- intended pacing or bottleneck;
- save migration and balance-test coverage.

Avoid hidden constants in UI code. Put tunable values in typed, validated catalogs or
balance configuration. Prefer deterministic calculations that can be simulated in
tests.

## Stable IDs and inherited baseline

- Treat `src/game-data/` as the machine-readable A Dark Room baseline.
- Never rename or recycle a published stable ID. Display names and translations may
  change without changing IDs.
- Keep inherited names in `legacyKey` only for compatibility and traceability.
- Do not mix approved Light Room additions into the inherited baseline. Add them as
  an explicit overlay after the baseline is validated.
- When inherited event scenes change, run `pnpm catalog:generate` and commit the
  regenerated scene and combat catalogs.
- Run `pnpm typecheck`, `pnpm test`, and `pnpm test:browser` after changes to saves,
  legacy runtime behavior, or critical player journeys. A deliberate balance
  change must update the relevant scenario and be documented as a Light Room change.
- Preserve the validated save boundary in `script/save_manager.js`; imported data
  must be validated before replacing current progress, and state paths must never be
  evaluated as JavaScript.

## Change discipline

- Make small, reviewable vertical slices.
- Preserve unrelated user changes.
- Do not introduce paid services, proprietary UI kits, or assets with unclear
  redistribution rights without explicit approval.
- Reuse established components and design tokens before creating new UI primitives.
- Version and migrate save schemas; never silently invalidate player progress.
- Record lasting product or architecture choices as decision documents.
- Update tests and documentation with behavior changes.

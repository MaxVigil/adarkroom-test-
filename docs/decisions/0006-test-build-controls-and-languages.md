# ADR 0006: Keep focused controls in the Light Room test build

- Status: Accepted
- Date: 2026-08-08
- Owner: MaxVigil

## Decision

The playable Light Room test build exposes five persistent game speeds: `x1`, `x2`,
`x3`, `x4`, and `x20`. Changing speed reschedules active managed game timers and
rescales active button cooldowns; it is not limited to timers created after the
selection.

Only English (`en`) and Ukrainian (`uk`) are offered. Unsupported URL or saved
language values fall back to English before any language path is loaded. Ukrainian
uses the completed dictionary from the earlier Codex implementation plus translations
for messages introduced by baseline hardening. An automated coverage test rejects new
literal player-facing strings without a Ukrainian translation, except proper service
names and neutral formatting tokens.

The inherited Penrose cross-promotion is not loaded by `index.html` and is not
registered in the runtime event pool. Its source remains unchanged as read-only
baseline evidence so the inherited catalog and parity tests stay reproducible.

## Rationale

These controls shorten manual balancing and progression tests, keep the language menu
focused on the two supported languages, and remove an unrelated external-game prompt
from development sessions without mutating the preserved A Dark Room reference model.

## Validation

- Playwright checks the exact EN/UK language list and safe fallback.
- Playwright checks Ukrainian hardening messages and interface labels.
- Playwright opens the speed menu, selects `x20`, verifies persistence, and proves an
  already-running timer is rescheduled.
- Playwright verifies that the marketing script, global, and event-pool entry are
  absent from the playable runtime.
- Unit coverage audits literal runtime strings against the Ukrainian dictionary.

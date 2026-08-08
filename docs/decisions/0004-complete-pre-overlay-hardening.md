# ADR 0004: Complete pre-overlay hardening

- Status: Accepted
- Date: 2026-08-08
- Owner: MaxVigil

## Decision

The inherited baseline receives one final bounded preparation cycle before approved
Light Room content is added as an overlay.

1. Save loading, writing, backup recovery, and importing use one structural validator.
   Invalid imports cannot overwrite current progress, and the last valid save is kept
   as a recoverable local backup.
2. The state manager parses supported dot and bracket paths without executing them.
   Dangerous prototype keys and malformed paths are rejected.
3. The frozen catalog covers every inherited enemy, combat encounter, and loot table
   with stable IDs and explicit max-exclusive loot ranges.
4. A permanent test validates all inherited `nextScene` and `nextEvent` references,
   including complete probability branches.
5. Playwright smoke tests run the actual legacy page in local Chromium and verify
   startup, save/reload, backup recovery, and corrected trading/Fabricator behavior.

## Balance boundary

This decision does not change combat stats, loot probability, loot ranges, economy,
building costs, profession output, or progression. `item.fleet-beacon` is added only
to represent an already-existing inherited reward that was missing from the typed
catalog. Blueprint drops map to the six existing stable blueprint IDs.

## Consequences

- Light Room additions can now be reviewed as intentional overlay differences rather
  than being mixed with baseline extraction or inherited defects.
- Save corruption and malformed imports no longer silently destroy current progress.
- Event edits that introduce dangling branches fail the automated suite.
- Critical runtime checks are reproducible locally without a paid browser service.

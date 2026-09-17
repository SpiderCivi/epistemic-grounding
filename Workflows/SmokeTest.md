# SmokeTest

Run `bun Tools/Orchestrator.ts` from the skill root. It executes two built-in toy scenarios
against the stubbed pipeline and prints PASS/FAIL:

1. **Contradiction scenario** — two sources disagree on the same claim → expects `verdict:
   "contradicted"` and confidence `<= 0.20` per `CalibratePrompt.md`'s mapping.
2. **Abstention scenario** — a claim with zero supporting sources → expects COMPOSE to omit it
   or surface it as a gap, never assert it as fact.

No live model calls are made — this validates JSON-contract shape, stage wiring order, and the
taint-propagation rule only.

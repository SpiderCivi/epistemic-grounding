---
name: EpistemicGrounding
description: Grounded-answer pipeline (Threat Scan → Decompose → Ground & Attribute → Calibrate → Compose) that decomposes a draft answer into atomic claims, attributes each to supplied sources only, calibrates confidence across N samples, and gates the final answer at a confidence threshold — abstaining rather than asserting ungrounded facts. USE WHEN grounded answer, calibrated confidence, claim attribution, abstain rather than hallucinate, epistemic grounding pipeline.
---

# EpistemicGrounding

Packaged from `epistemic-grounding-pipeline.md`. Five stages share one MASTER governance
prompt (trusted/untrusted channel split, provenance discipline, hard abstention rule).

**⚠️ Model calls are STUBBED in this scaffold — `Tools/Orchestrator.ts` validates JSON-contract
shape and stage wiring only. It does not call the Claude API. Wire in real calls (per the
`claude-api` skill's `output_config.format` structured-output guidance) before using this for
anything real.**

## Stage Prompts (root — context files, not subdirectories)

- `MasterPrompt.md` — governance prompt, prepended as system prompt on every stage call
- `ThreatScanPrompt.md` — stage [A], injection/poisoning detector
- `DecomposePrompt.md` — stage [B], draft → atomic claims
- `GroundAttributePrompt.md` — stage [C], claim → provenance + support + verdict (run ×N)
- `CalibratePrompt.md` — stage [D], N samples → calibrated confidence (bootstrap only — see note)
- `ComposePrompt.md` — stage [E], abstention gate + final assembly

## Workflow Routing

| Trigger | Workflow |
|---|---|
| "run the grounding pipeline smoke test" | `Workflows/SmokeTest.md` |

## Quick Reference

- Contracts (`Source`, `Claim`, `Attribution`, `Confidence`) and the taint-propagation rule are
  implemented in `Tools/Orchestrator.ts`.
- Run: `bun Tools/Orchestrator.ts` — executes 4 built-in smoke scenarios (contradiction, abstention,
  quarantine+sanitize+authority-spoofing, escalation-ceiling) and prints PASS/FAIL for each (18/18
  assertions passing as of iteration 2).
- Fixed in iteration 2 (2026-09-17): quarantine now filters only actually-flagged source IDs, not
  a blanket sweep; contradiction verdict is authority-weighted (one low-authority outlier can no
  longer veto multiple entailing sources); source authority is computed by the orchestrator from
  origin, never taken from a source's own self-declared `meta.authority`; literal
  `<untrusted>`/`</untrusted>` strings inside source content are sanitized before use; sample
  escalation has a hard ceiling (`MAX_SAMPLES = 8`) instead of looping until agreement.
- Still open (from the 2026-09-17 skill-review PRD): CALIBRATE's self-consistency-only confidence
  band is generous — self-consistency measures model stability, not truth (see PRD Decisions);
  temperature-based sampling in `GroundAttributePrompt.md` needs replacing with repeated
  independent calls on current models (temperature is removed on Opus 5 / Sonnet 5 / Fable 5.1).

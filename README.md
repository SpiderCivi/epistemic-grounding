# Epistemic Grounding

A grounded-answer pipeline: **Threat Scan → Decompose → Ground & Attribute → Calibrate → Compose**.

Given a question, a draft answer, and a set of sources, the pipeline decomposes the draft into
atomic claims, attributes each claim to the supplied sources only (never to the model's own
training knowledge), calibrates a confidence score across N samples, and gates the final answer
at a confidence threshold — abstaining or surfacing a gap rather than asserting an ungrounded
fact.

All five stages share one MASTER governance prompt: a strict trusted/untrusted channel split,
provenance discipline (`retrieved` / `parametric` / `inferred`), and a hard abstention rule for
anything that can't be grounded.

> **⚠️ Model calls are stubbed in this scaffold.** `Tools/Orchestrator.ts` validates the
> JSON-contract shape and stage wiring only — it does not call the Claude API. Wire in real model
> calls (see the per-stage prompt files, and the structured-output guidance referenced below)
> before using this for anything real.

## Stages

| File | Stage | Purpose |
|---|---|---|
| `MasterPrompt.md` | — | Governance prompt, prepended as system prompt on every stage call |
| `ThreatScanPrompt.md` | [A] | Injection / poisoning detector over untrusted sources |
| `DecomposePrompt.md` | [B] | Draft answer → atomic, self-contained claims |
| `GroundAttributePrompt.md` | [C] | Claim → provenance + source support + verdict (run ×N) |
| `CalibratePrompt.md` | [D] | N samples → a single calibrated confidence score |
| `ComposePrompt.md` | [E] | Abstention gate + final answer assembly |

## Orchestrator

`Tools/Orchestrator.ts` implements the `Source` / `Claim` / `Attribution` / `Confidence` JSON
contracts and wires the five stages together (A → B → C → D → E), plus several defenses beyond
what the original prompt design specified:

- **Taint propagation** — any attribution whose support includes an untrusted source is marked
  tainted, and that mark is never dropped downstream.
- **Precise quarantine** — Threat Scan quarantines only the specific source IDs it actually
  flags, never a blanket sweep of everything untrusted.
- **Authority-weighted contradiction** — a single low-authority contradicting source can no
  longer veto multiple entailing sources; authority is computed by the orchestrator from a
  source's origin, never taken from a source's own self-declared metadata.
- **Delimiter sanitization** — literal `<untrusted>` / `</untrusted>` strings inside source
  content are neutralized before they can be mistaken for real trust boundaries.
- **Escalation ceiling** — sample escalation on disagreement is capped (`MAX_SAMPLES = 8`)
  instead of looping indefinitely.

Run it with:

```bash
bun Tools/Orchestrator.ts
```

This executes 4 built-in smoke scenarios (contradiction, abstention, quarantine + sanitization +
authority-spoofing, escalation ceiling) and prints PASS/FAIL for each — 18/18 assertions passing
as of the current revision.

## Known open gaps

- `CalibratePrompt.md`'s self-consistency-only confidence band is generous: agreement across
  samples measures the model's own stability, not truth, and can't distinguish a stably-correct
  model from a stably-wrong one.
- `GroundAttributePrompt.md`'s temperature-based sampling needs replacing with repeated
  independent calls — `temperature`/`top_p`/`top_k` are removed on current flagship Claude models
  (Opus 5, Sonnet 5, Fable 5/5.1) with adaptive thinking on.

## Origin

Packaged from a standalone prompt-pack design document into a runnable PAI skill, then hardened
against a set of concrete findings from a security and architecture review (prompt-injection
testing, Claude API grounding, red-team/first-principles analysis).

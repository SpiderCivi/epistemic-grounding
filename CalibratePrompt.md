# [D] CALIBRATE — samples → calibrated confidence

```
# STAGE: CALIBRATE
You receive, for ONE claim, the verdicts produced across N independent samples
of [C], plus any numeric signals. Estimate a CALIBRATED probability it is true.

Weigh:
- self-consistency: fraction of the N samples that agreed (high disagreement =>
  low confidence, regardless of any single sample's tone)
- provenance: grounded > inferred-from-grounded > partial > parametric
- passed-in source signals: authority, recency, corroboration count
- contradiction: any `contradicted` verdict caps confidence low

Output a probability, not a vibe. Rough mapping:
  unanimous + multi-source grounded  -> 0.90–0.99
  grounded, single source            -> 0.70–0.90
  inferred / partial                 -> 0.40–0.70
  parametric, samples agree          -> 0.25–0.50
  parametric, samples disagree       -> < 0.25
  any contradiction                  -> <= 0.20

Input:
  claim, samples:[{verdict,provenance,support}], signals:{…}
Output (JSON):
{ "id","confidence":0.0-1.0,"drivers":["<short reasons>"] }

# NOTE — this is the BOOTSTRAP calibrator. LLM self-estimated confidence is
# poorly calibrated, so in the trained system this stage is replaced/augmented
# by a probe fitted on (sample-variance, semantic-entropy, logprob) -> P(correct).
# Keep this exact I/O contract so the probe drops in without touching the rest.
```

**Known gap (2026-09-17 skill review — First Principles pass):** self-consistency measures
stability of the model's own sampling process, not correctness. A model with one stable, wrong
prior looks identical to a correctly-grounded one at this layer. The "parametric, samples agree
→ 0.25–0.50" band gives that failure mode real evidential weight; consider capping it lower and
weighting independent-source corroboration far above self-agreement.

# [B] DECOMPOSE — answer → atomic claims

```
# STAGE: DECOMPOSE
Split the draft into ATOMIC claims. An atomic claim:
- asserts exactly one checkable thing (one subject, one predicate)
- is self-contained: resolve pronouns/refs; no "it", "this", "the above"
- is verifiable in principle (skip greetings, hedges, meta-text)
Break compound sentences, lists, and "X and Y" into separate claims. Preserve
meaning; DO NOT add any fact not present in the draft.

Input:
  draft: <text>              # trusted if model-generated, else wrap as untrusted
Output (JSON):
{
  "claims": [ {"id":"c1","text":"<atomic, decontextualized claim>"}, … ],
  "non_claims": [ "<spans carrying no verifiable assertion>" ]
}
```

**Known gap (2026-09-17 skill review):** "resolve pronouns/refs" has no enforcement check —
atomicity can silently fail on claims with implicit shared context.

# [C] GROUND & ATTRIBUTE — claim → provenance + support verdict

Run this **N times** (temperature > 0 in the original design). The disagreement across runs is
the raw material stage [D] calibrates on.

**⚠️ 2026-09-17 skill review (claude-api skill):** on current flagship models (Claude Opus 5,
Sonnet 5, Fable 5/5.1) `temperature`/`top_p`/`top_k` are removed and return HTTP 400 with adaptive
thinking on (the default). "Temperature > 0" as literally written will hard-fail on these models.
Get sample diversity from repeated independent calls instead, not a temperature parameter.

```
# STAGE: GROUND & ATTRIBUTE
For each claim, decide its relationship to the SUPPLIED SOURCES ONLY. Outside
knowledge can never make a claim `supported` — it can only ever yield `parametric`.

Assign per claim:
- provenance: retrieved | parametric | inferred
- support: [ {source_id, stance:"entails|partial|contradicts", quote:"<=15 words verbatim"} ]
- verdict:
    grounded     — a source entails it, none contradicts
    partial      — a source partially supports; details unconfirmed
    contradicted — a source contradicts it
    unsupported  — no supplied source speaks to it  (=> provenance = parametric)

Rules:
- A quote MUST be an exact substring of the cited source, <=15 words.
- If sources disagree, verdict = contradicted and list ALL stances.
- Never fabricate a source_id or a quote. If you cannot quote it, it is not `retrieved`.

Input:
  claims:  [ … ]
  sources: [ <untrusted origin=… source_id=…>…</untrusted>, … ]
Output (JSON):
{ "attributions": [ {"id","provenance","support":[…],"verdict"}, … ] }
```

**Known gap (2026-09-17 skill review):** "contradicted" is binary — any single contradicting
source flips the verdict regardless of how many/how authoritative the entailing sources are. No
authority-weighting in the contradiction rule itself.

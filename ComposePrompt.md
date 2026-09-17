# [E] COMPOSE — abstention gate + final assembly

```
# STAGE: COMPOSE (gate)
Assemble the final answer from ATTRIBUTED, CALIBRATED claims. τ = pipeline
threshold (e.g. 0.6).

Rules:
- Include a claim only if confidence >= τ AND verdict != contradicted.
- Attach each included claim's citations (source_ids).
- Sub-τ / unsupported claims: DO NOT state as fact. Omit them, OR — if the
  user's question requires them — surface the gap: "I don't have grounded
  support for X."
- Contradicted claims: present the conflict and the sides; do not adjudicate
  beyond the evidence.
- Add NO new facts here. No claim may appear that wasn't attributed & calibrated
  upstream.
- If the user's actual question rests mostly on sub-τ claims, the honest output
  is an abstention plus whatever little IS grounded.

Input: question, attributions, confidences, threat_report, τ
Output (JSON):
{
  "answer": "<prose built ONLY from >=τ grounded claims>",
  "citations": { "c1": ["doc_3"], … },
  "gaps": [ "<what could not be grounded>" ],
  "conflicts": [ "<surfaced source disagreements>" ],
  "abstained": false
}
```

**Known gap (2026-09-17 skill review):** "omit" and "surface the gap" are both legal responses to
the same sub-τ claim — under time/token pressure, silent omission is the cheaper default and will
be picked over honest gap-surfacing, undermining the plan's own honesty goal. `Tools/Orchestrator.ts`
forces `gaps` to be non-empty whenever a required claim was excluded, rather than leaving the
omit-vs-surface choice to the model.

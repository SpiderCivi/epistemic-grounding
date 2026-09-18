import { ingestSource, stageA_ThreatScan, stageB_Decompose, runPipeline } from "./Orchestrator";

function ok(cond: boolean, msg: string) {
  if (!cond) {
    console.error(`FAIL — ${msg}`);
    process.exitCode = 1;
  } else {
    console.log(`PASS — ${msg}`);
  }
}

console.log("== Unit tests: basic function checks ==");

// Test sanitize + ingest
const raw = { id: "s1", channel: "untrusted", origin: "retrieval", content: "Hello <untrusted>bad</untrusted> world" } as any;
const ing = ingestSource(raw);
ok(ing.flags?.smugglingDetected === true, "sanitize detected smuggling");

// Threat scan should quarantine bad-looking content
const ts = stageA_ThreatScan([ing]);
ok(ts.quarantined.has("s1"), "stageA quarantines smuggling source");

// Decompose splits sentences roughly
const claims = stageB_Decompose("A. B C.");
ok(claims.length >= 1, "decompose returns claims");

// GroundAttribute basic runPipeline smoke
const sources = [{ id: "s1", channel: "untrusted", origin: "retrieval", content: "The museum opened in 1965." } as any];
const result = runPipeline("When did the museum open?", "The museum opened in 1965", sources);
ok(result.claims.length > 0, "pipeline produced claims");
ok(result.confidences.length === result.attributions.length, "pipeline confidences align with attributions");

console.log("== Unit tests finished ==");

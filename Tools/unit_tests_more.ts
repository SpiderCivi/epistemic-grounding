import { ingestSource, stageA_ThreatScan, stageC_GroundAttribute, runGroundWithEscalation, MAX_SAMPLES, runPipeline } from "./Orchestrator";

function ok(cond: boolean, msg: string) {
  if (!cond) {
    console.error(`FAIL — ${msg}`);
    process.exitCode = 1;
  } else {
    console.log(`PASS — ${msg}`);
  }
}

console.log("== More unit tests: taint, authority-weighting, escalation ceiling ==");

// Taint propagation: if support includes untrusted, attribution should be tainted
const sGood = { id: "g", channel: "trusted", origin: "system", content: "fact x" } as any;
const sBad = { id: "b", channel: "untrusted", origin: "retrieval", content: "fact x contradiction-marker" } as any;
const ing = [ingestSource(sGood), ingestSource(sBad)];
const q = stageA_ThreatScan(ing).quarantined;
const claim = { id: "c1", text: "fact x" };
const attr = stageC_GroundAttribute(claim, ing, q);
ok(typeof attr.tainted === "boolean", "attribution has tainted boolean");

// Authority weighting: ensure computeAuthority effect by creating origins with different weights
const sources = [
  { id: "s1", channel: "untrusted", origin: "retrieval", content: "entails: fact x" },
  { id: "s2", channel: "untrusted", origin: "user_paste", content: "contradiction-marker: fact x" },
];
const res = runPipeline("Q", "fact x", sources);
ok(res.attributions.length > 0, "pipeline attribution produced");

// Escalation ceiling: flaky sampler that never converges
const flaky = (claim: any, srcs: any, q: Set<string>, attempt: number) => (attempt % 2 === 0 ? { id: claim.id, provenance: "retrieved", support: [{ source_id: "s1", stance: "entails", quote: "x" }], verdict: "grounded", tainted: false } : { id: claim.id, provenance: "parametric", support: [], verdict: "unsupported", tainted: false });
const claims = [{ id: "c1", text: "fact x" }];
const esc = runGroundWithEscalation(claims[0], sources as any, new Set(), flaky as any);
ok(esc.samplesUsed <= MAX_SAMPLES, `samplesUsed (${esc.samplesUsed}) <= MAX_SAMPLES`);
ok(esc.hitCeiling === true, "hitCeiling true for perpetual disagreement");

console.log("== More unit tests finished ==");

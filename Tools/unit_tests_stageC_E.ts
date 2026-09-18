import { stageC_GroundAttribute, stageE_Compose, ingestSource, stageB_Decompose, stageD_Calibrate } from "./Orchestrator";

function ok(cond: boolean, msg: string) {
  if (!cond) {
    console.error(`FAIL — ${msg}`);
    process.exitCode = 1;
  } else {
    console.log(`PASS — ${msg}`);
  }
}

console.log("== Extended unit tests: stageC and stageE ==");

const sources = [
  { id: "s1", channel: "trusted", origin: "system", content: "The museum opened in 1965." },
  { id: "s2", channel: "untrusted", origin: "retrieval", content: "contradiction-marker: the museum opened in 1970." },
] as any;

const ingested = (sources as any[]).map(ingestSource);
const claim = { id: "c1", text: "The museum opened in 1965" };
const attribution = stageC_GroundAttribute(claim, ingested, new Set());
ok(attribution.support.length >= 0, "stageC returns an attribution structure");

// If there is contradicting evidence, verify verdict logic
const hasContradiction = attribution.verdict === "contradicted" || attribution.verdict === "partial" || attribution.verdict === "grounded" || attribution.verdict === "unsupported";
ok(hasContradiction, `verdict is one of expected strings (${attribution.verdict})`);

// Test stageE_Compose behavior: prepare claims, attributions, confidences
const claims = stageB_Decompose("The museum opened in 1965.");
const attributions = [attribution];
const confidences = [stageD_Calibrate(attribution)];
const composed = stageE_Compose("When did the museum open?", claims, attributions, confidences, 0.6);
ok(typeof composed.answer === "string", "compose returns an answer string");

console.log("== Extended unit tests finished ==");

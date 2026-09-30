import { createHash } from "node:crypto";
import {
  snapshotSchema,
  type AssetSnapshot,
  type Finding,
  type Inspection,
} from "./types";

export const SCANNER_VERSION = 3;
export const snapshotHash = (snapshot: AssetSnapshot) =>
  createHash("sha256")
    .update(JSON.stringify(snapshotSchema.parse(snapshot)))
    .digest("hex");

const rules: [string, RegExp, Finding["severity"], string][] = [
  [
    "dynamic-code",
    /\b(?:loadstring|loadfile|dofile|getfenv|setfenv)\b/i,
    "blocked",
    "Dynamic code execution or environment manipulation.",
  ],
  [
    "remote-code",
    /\b(?:HttpGet|HttpPost|GetAsync|PostAsync|RequestAsync|LoadAsset|LoadAssetAsync|LoadAssetVersion|GetObjects)\s*\(/i,
    "blocked",
    "Network access or additional asset loading needs review.",
  ],
  [
    "obfuscation",
    /\b(?:string\s*\.\s*char|utf8\s*\.\s*char|bit32|Luraph|IronBrew)\b|(?:\\\d{2,3}){6,}/i,
    "review",
    "Encoded or obfuscated code needs review.",
  ],
  ["commerce-teleport", /\b(?:Prompt\w*Purchase|Teleport\w*)\s*\(/i, "blocked", "Purchase prompts or teleports are not permitted in this imported component."],
  ["hidden-execution", /\[\s*["'](?:require|loadstring|HttpGet|GetAsync|PostAsync|RequestAsync)["']\s*\]/i, "blocked", "Indirect executable or network API access."],
  [
    "source-write",
    /\.Source\s*=|UpdateSourceAsync|ScriptEditorService/,
    "blocked",
    "Code attempts to modify script source.",
  ],
];

/** Conservative static screening. It never runs imported code or claims malware absence. */
export function inspectSnapshot(input: AssetSnapshot): Inspection {
  const snapshot = snapshotSchema.parse(input),
    findings: Finding[] = [],
    limitations: string[] = [];
  if (!snapshot.complete || snapshot.issues.length)
    limitations.push(
      "Inspection coverage is incomplete. Uninspected content remains unknown. " +
        snapshot.issues.join("; ").slice(0, 900),
    );
  const actualScripts = snapshot.nodes.filter((n) =>
    ["Script", "LocalScript", "ModuleScript"].includes(n.className),
  );
  if (actualScripts.length !== snapshot.scripts.length)
    findings.push({
      rule: "coverage",
      severity: "review",
      message: "Not every script has readable source.",
    });
  if (snapshot.nodes.some((n) => n.className === "PackageLink"))
    findings.push({
      rule: "package",
      severity: "review",
      message: "Linked packages can introduce separately updated content.",
    });
  for (const script of snapshot.scripts) {
    // Do not strip comments/strings: suspicious text is surfaced conservatively.
    for (const [rule, pattern, severity, message] of rules)
      if (pattern.test(script.source))
        findings.push({ rule, severity, script: script.name, message });
    if (/\brequire\b/.test(script.source))
      findings.push({
        rule: "module-graph",
        severity: "review",
        script: script.name,
        message: "Module loading needs dependency review before attachment.",
      });
    for (const match of script.source.matchAll(
      /\brequire\s*(?:\(([^\r\n)]*)\)|(["'][^\r\n]*))/g,
    )) {
      const target = (match[1] ?? match[2] ?? "").trim();
      if (!/^script(?:\.[A-Za-z_]\w*)+$/.test(target)) {
        findings.push({
          rule: "unresolved-module",
          severity: "blocked",
          script: script.name,
          message:
            "External or unresolved module dependency; its code was not inspected.",
        });
        break;
      }
    }
    if (script.source.length > 8000 && !script.source.includes("\n"))
      findings.push({
        rule: "minified",
        severity: "review",
        script: script.name,
        message: "Large single-line code needs review.",
      });
  }
  return {
    ...(snapshot.nativeRoles ? { nativeRoles: snapshot.nativeRoles } : {}),
    scannerVersion: SCANNER_VERSION,
    contentHash: snapshotHash(snapshot),
    inspectedAt: new Date().toISOString(),
    status: findings.some((f) => f.severity === "blocked")
      ? "blocked"
      : findings.length
        ? "review_required"
        : limitations.length
          ? "limited"
          : "no_issues_found",
    ...(limitations.length ? { limitations } : {}),
    findings: findings.slice(0, 200),
    scriptCount: snapshot.scripts.length,
    nodeCount: snapshot.nodes.length,
  };
}

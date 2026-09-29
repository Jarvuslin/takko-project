import { z } from "zod";
import { baseWorld } from "./base-world";
import type { Project } from "./schema";

export const worldChoiceSchema = z.object({
  kind: z.enum(["baseplate_template", "none", "custom"]),
  sourceQuote: z.string().max(1200).optional(),
  question: z.string().min(1).max(600).optional(),
}).strict();
export type WorldDecision = {
  kind: "baseplate_template" | "none" | "custom";
  template?: typeof baseWorld;
  sourceQuote?: string;
  question?: string;
};
export function initialWorld(): WorldDecision {
  return {kind:"baseplate_template",template:structuredClone(baseWorld)};
}
export function recordedTemplate(p: Pick<Project,"world">) {
  return p.world?.kind === "baseplate_template" ? p.world.template : undefined;
}
export const worldInstructions = "Use the saved world decision. For a fresh proposal choose none/custom only with an exact user sourceQuote explicitly requesting an alternative world (space, underwater, custom terrain, void, no baseplate). If uncertain, return world.question and keep the current kind. A follow-up must reuse the saved world and existing scene. Do not reset lighting, add another ground/spawn or duplicate a prop unless explicitly requested. Legacy projects have no implicit baseplate. Answer a pending world question explicitly before approval.";

/** Validate before committing a proposal, so a failed edit cannot alter its world. */
export function proposedWorld(p: Project, choice?: z.infer<typeof worldChoiceSchema>): WorldDecision | undefined {
  if (!p.world) return undefined;
  if (!choice) {
    if(!p.artifact && /\b(space|underwater|custom terrain|void|no baseplate|floating islands?)\b/i.test(p.request) && p.world.kind==="baseplate_template")
      return {...p.world,question:"Should this world use the Baseplate template, no baseplate, or a custom world? Describe the ground you want."};
    return p.world;
  }
  if (p.artifact) {
    if(choice.kind!==p.world.kind || choice.question) throw Error("Follow-up builds must preserve the existing world decision.");
    return p.world;
  }
  if(choice.question) return {...p.world,question:choice.question};
  if(choice.kind!=="baseplate_template") {
    const quote=choice.sourceQuote?.trim();
    const sources=[p.request,...Object.values(p.answers),...(p.briefChanges??[]).map(c=>c.text)];
    if(!quote || !sources.some(s=>s.includes(quote)) || !/\b(space|underwater|custom terrain|void|no baseplate|without (?:a |the )?baseplate)\b/i.test(quote))
      throw Error("A non-template world requires an exact explicit alternative-world user source. Ask a world question when ambiguous.");
    return {kind:choice.kind,sourceQuote:quote};
  }
  if(/\b(no baseplate|without (?:a |the )?baseplate)\b/i.test([p.request,...Object.values(p.answers)].join("\n"))) throw Error("The user requested no baseplate. Choose none/custom with the exact user source.");
  return {...initialWorld(),template:p.world.template??initialWorld().template};
}
export function existingProjectContext(p: Project) {
  const original=p.implementationBackup?.artifact ?? p.artifact;
  return structuredClone({world:p.world??null,worldInstructions,
    existingScene:original?.scene??[],
    existingFiles:original?.files??[],
    currentScene:p.artifact?.scene??[],
    currentFileHierarchy:(p.artifact?.files??[]).map(f=>({path:f.path,kind:f.kind})),
    editablePaths:p.implementationBackup?.scopedPaths??null,
    instruction:"Existing scene and files are read-only outside the explicit editable paths. Add only requested work. Preserve unaffected source and node properties byte-for-byte."});
}

import type { Bundle, Project } from "./schema";
import { projectComponents } from "./component-integration";
import { approvedClipContext } from "../marketplace/selected-clip-context";
import { runtimeSourceAst } from "./runtime-source-check";

type Component = Pick<
  ReturnType<typeof projectComponents>[number],
  "reference" | "record" | "evidence"
>;

/** Derive the exact descendant path from the approved selection and retained capture. */
export function retainedStudioAnimation(
  project: Project,
  component: Component,
) {
  const { reference, evidence, record } = component;
  const clip = approvedClipContext(project, record.need, evidence);
  const node = evidence.nodes.find((n) => n.index === clip?.instanceIndex);
  if (
    clip?.resolution !== "captured" ||
    node?.className !== "KeyframeSequence" ||
    !clip.instancePath
  )
    return undefined;
  const sequencePath = [
    ...reference.destinationPath.split("/"),
    reference.rootName,
    ...clip.instancePath.slice(1),
  ];
  const lookup =
    "game" +
    sequencePath.map((n) => `:WaitForChild(${JSON.stringify(n)})`).join("");
  return {
    sequencePath: sequencePath.join("/"),
    target:
      "Studio place for testing. Local animation playback is supported. Reference retained content in place, never fetch the pack ID.",
    playbackContract: {
      documentation:
        "https://create.roblox.com/docs/reference/engine/classes/KeyframeSequenceProvider#RegisterKeyframeSequence",
      lifetime: "Temporary Studio-only ID. Not valid in published games.",
      execution:
        "Resolve and register the sequence in the same runtime context that loads its Animation. Client playback requires the actual sequence to be present on that client. Check this in Play. Do not assume a server-registered ID works across runtimes or that a file hierarchy pass proves replication.",
      failureHandling:
        "Use bounded waits with explicit missing-path diagnostics. Keep input and unrelated mechanics responsive if a sequence is unavailable. Never silently select another clip.",
    },
    code: `local sequence = ${lookup}\nassert(sequence:IsA("KeyframeSequence"))\nlocal provider = game:GetService("KeyframeSequenceProvider")\nlocal registeredId = provider:RegisterKeyframeSequence(sequence)\nlocal animation = Instance.new("Animation")\nanimation.AnimationId = registeredId -- use this string unchanged, with no prefix\n-- humanoid is the current character's Humanoid\nlocal animator = humanoid:WaitForChild("Animator")\nlocal track = animator:LoadAnimation(animation)\n-- Play track in the appropriate input/gameplay handler.`,
  };
}

/** Reject the known invalid pack-as-animation assignment, including local aliases.
 * AST traversal excludes comments. This is bounded static provenance, not a full Luau interpreter.
 */
export function validateRetainedAnimations(
  project: Project,
  directory: string,
  files: Bundle["files"],
) {
  const retained = projectComponents(project, directory).filter((c) =>
    retainedStudioAnimation(project, c),
  );
  if (!retained.length) return;
  for (const file of files) {
    const ast: any = runtimeSourceAst(file.source);
    const aliases = new Map<string, string>();
    const identity = (n: any): string | undefined =>
      n?.type === "AstExprLocal"
        ? JSON.stringify(n.local)
        : n?.type === "AstExprGlobal"
          ? n.name
          : undefined;
    const value = (n: any): string | undefined => {
      if (n?.type === "AstExprConstantString") return n.value;
      if (n?.type === "AstExprGroup" || n?.type === "AstExprTypeAssertion")
        return value(n.expr);
      const key = identity(n);
      return key ? aliases.get(key) : undefined;
    };
    const visit = (n: any) => {
      if (!n || typeof n !== "object") return;
      if (n.type === "AstStatLocal") {
        n.vars?.forEach((v: any, i: number) => {
          const literal = value(n.values?.[i]);
          if (literal !== undefined) aliases.set(JSON.stringify(v), literal);
        });
      }
      if (n.type === "AstStatAssign") {
        n.vars?.forEach((target: any, i: number) => {
          const literal = value(n.values?.[i]);
          const property =
            target.type === "AstExprIndexName"
              ? target.index
              : target.type === "AstExprIndexExpr"
                ? value(target.index)
                : undefined;
          if (property === "AnimationId") {
            const component = retained.find(
              (c) => literal === `rbxassetid://${c.reference.candidateId}`,
            );
            if (component)
              throw Error(
                `${file.path}: need ${component.reference.needId} retains a raw KeyframeSequence at ${component.reference.destinationPath}. Do not assign its pack ID to Animation.AnimationId. Use the supplied local sequence, RegisterKeyframeSequence, and assign the returned string unchanged.`,
              );
          }
          const key = identity(target);
          if (key) {
            if (literal === undefined) aliases.delete(key);
            else aliases.set(key, literal);
          }
        });
      }
      for (const child of Object.values(n)) {
        if (Array.isArray(child)) child.forEach(visit);
        else if (child && typeof child === "object") visit(child);
      }
    };
    visit(ast);
  }
}

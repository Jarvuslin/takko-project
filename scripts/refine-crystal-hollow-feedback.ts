import type { Project } from "../src/generation/schema";

/** Targeted expert refinement; returns a new project and never writes the input. */
export function refineCrystalHollowFeedback(input: Project): Project {
  const project = structuredClone(input);
  if (!project.artifact) throw Error("Feedback refinement requires an artifact");
  const replace = (suffix: string, before: string, after: string) => {
    const file = project.artifact!.files.find((f) => f.path.endsWith(suffix));
    if (!file || file.source.split(before).length !== 2)
      throw Error("Feedback refinement source changed: " + suffix);
    file.source = file.source.replace(before, after);
  };
  replace("HUD.module.luau", "local toastUntil = 0", "local toastUntil = 0\n\tlocal toastPriority = nil");
  replace("HUD.module.luau", "function handles.toast(message)", "function handles.toast(message, priority)");
  replace("HUD.module.luau", 'toastMessage = tostring(message or "")', 'if toastPriority == "goal" and os.clock() < toastUntil and priority ~= "goal" then return end\n\t\ttoastPriority = priority\n\t\ttoastMessage = tostring(message or "")');
  replace("Feedback.module.luau", "local activeTweens = {}", 'local activeTweens = {}\nlocal baseButtonColors = setmetatable({}, {__mode = "k"})');
  replace("Feedback.module.luau", "local original = button.BackgroundColor3", "local original = baseButtonColors[button] or button.BackgroundColor3\n\tbaseButtonColors[button] = original");
  replace("Feedback.module.luau", "if not payload.steady and hud then hud.toast(payload.message) end", 'if not payload.steady and hud then hud.toast(payload.message, "goal") end');
  project.studioEvidence = null;
  if (project.visualEvidence) project.visualEvidence.reviewStatus = "awaiting_inspection";
  return project;
}

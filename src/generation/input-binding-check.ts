import type { Bundle, Check, Project } from "./schema";

/** Bounded static input check. Dynamic aliases still require native verification. */
export function checkInputBindings(
  bundle: Bundle,
  p: Pick<Project, "platform">,
): Check[] {
  if (p.platform?.kind !== "pc") return [];
  return bundle.files.flatMap((file) => {
    // Preserve string tokens for BindAction's name argument, but ignore comments.
    const tokens =
      file.source.match(
        /--\[(=*)\[[\s\S]*?\]\1\]|--[^\n]*|\[(=*)\[[\s\S]*?\]\2\]|"(?:\\.|[^"\\])*"|'(?:\\.|[^'\\])*'|[A-Za-z_][A-Za-z_0-9]*|[^\s]/g,
      ) ?? [];
    const code = tokens
      .filter((t) => !t.startsWith("--"))
      .map((t) => (/^["']|^\[=*\[/.test(t) ? '"string"' : t))
      .join(" ");
    const reasons: string[] = [];
    if (
      /Enum\s*\.\s*KeyCode\s*\.\s*(?:Button\w+|DPad\w+|Thumbstick\w+)/.test(
        code,
      ) ||
      /Enum\s*\.\s*UserInputType\s*\.\s*(?:Gamepad\d+|Touch)/.test(code)
    )
      reasons.push("touch or gamepad input enum");
    if (
      /\b(?:TouchTap|TouchTapInWorld|TouchStarted|TouchMoved|TouchEnded|TouchLongPress|TouchPan|TouchPinch|TouchRotate|TouchSwipe|GamepadConnected|GamepadDisconnected)\b/.test(
        code,
      )
    )
      reasons.push("touch or gamepad handler");
    // BindAction(name, callback, createTouchButton, ...), including AtPriority.
    for (const match of code.matchAll(/\bBindAction(?:AtPriority)?\s*\(/g)) {
      let depth = 0,
        arg = "",
        args: string[] = [];
      for (const char of code.slice(match.index! + match[0].length)) {
        if (char === "(" || char === "{" || char === "[") depth++;
        if (char === ")" && depth === 0) {
          args.push(arg.trim());
          break;
        }
        if (char === ")" || char === "}" || char === "]") depth--;
        if (char === "," && depth === 0) {
          args.push(arg.trim());
          arg = "";
        } else arg += char;
      }
      if (args.length >= 3 && args[2] !== "false")
        reasons.push(
          "ContextActionService touch button flag must be the literal false on PC",
        );
    }
    return reasons.length
      ? [
          {
            id: "platform:input:" + file.path,
            status: "failed" as const,
            detail: `${file.path}: ${[...new Set(reasons)].join("; ")}. Saved target is PC keyboard and mouse only. Remove these bindings and touch buttons before resubmitting.`,
          },
        ]
      : [];
  });
}

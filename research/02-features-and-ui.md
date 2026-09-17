# Feature inventory and UI observations

Status meanings: **implemented** = visible in this plugin build, **observed** = rendered public UI, **unverified** = private workflow or backend functionality not inspected. Implementation does not prove that every account exposes a feature or that the agent calls it successfully.

## Feature parity inventory

| Capability | Status / concrete contract | Source |
|---|---|---|
| Roblox account sign-in | Observed; Clerk integration, Roblox sign-in button | Public sign-in page and HTML |
| Browser projects / active project matching | Plugin supports project ID/name/prompt count, detects switches | `129-ProjectApi`, `055-Core`, `001-App` |
| Natural-language game creation | Public product claim and homepage composer; private generation not exercised | Homepage |
| Create scripts | `createScript(parentId, robloxClass, content, name)` | `068-createScript` |
| Replace script source | `updateScript(uniqueId, content)` | `094-updateScript` |
| Targeted code edits | Literal replacement, rejects ambiguous matches unless `replace_all` | `071-editScript` |
| Read source / line ranges | Full source or bounded lines; line count returned | `088-readScript` |
| Create/update instances | Classes, names, properties, attributes | `067-createInstance`, `093-updateInstance` |
| Inspect instances/properties | General metadata and named live property reads | `086-readInstance`, `087-readProperties` |
| Move, rename, delete | ID-based actions | `082-move`, `069-delete` |
| Browse hierarchy | Depth limit, up to 500 results, skipped dependency folders | `081-list` |
| Search instances | Glob patterns and optional class filter | `074-glob` |
| Search scripts | Literal/Lua-pattern search, context lines, result limits | `075-grep`, `076-grepUtils` |
| Creator Store asset import | Load asset ID; remove descendant script containers | `079-importAsset` |
| Library/package import | Base64 RBXM deserialization; retains script content | `080-importRbxm` |
| Run edit-mode code | `loadstring`, output capture, timeout wrapper | `090-runCode` |
| Error-log smoke test | `runTests`; simulated run, reports one aggregate test | `091-runTests` |
| Playtesting | Server/local test scripts, client/server logs, optional frames | `085-playtest` |
| Edit-mode screenshot | Viewport/template capture and image rendering | `066-captureScreenshot` |
| Play-mode screenshot | Setup script, readiness/capture windows, rendering-health diagnostics | `065-capturePlaytestScreenshot` |
| Rollback snapshots | Serialize instance state and deserialize | `092-serialize`, `070-deserialize` |
| Batch rollback | Per-operation results; partial failures possible | `062-batchRollback` |
| Plugin connection UI | Connect, disconnect, status, project, prompt count, last operation, log toggle | `041-Connected`, `044-NotConnected` |
| Compatibility / onboarding | Version checks, help, script/CDN permission guidance | `001-App`, `048-Welcome`, `003-CdnPermission` |
| Paid subscriptions | Public terms identify monthly billing and Polar | Terms/privacy pages |
| Current plan prices and credit rules | Unverified; old community guide prices are not a current source of truth | Authenticated dashboard needed |
| Game map / feature graph | Mentioned in a user review; unverified in current app | Review is a lead only |
| Mesh/image generation, voice, collaboration, export/publish, model picker | Unverified; asset import and script-based geometry are not proof of generative 3D models | Backend/UI access needed |

The action registry contains exactly 23 public instance methods. Constructors and private helper modules are not counted as additional tools. The backend may expose more tools than the plugin registry, including web retrieval or asset generation; we cannot infer their existence or absence from this asset alone.

## Current visual design

The rendered homepage uses a cyan/aqua background fading to white, large condensed uppercase headings, a yellow/lime highlight, rounded game-art cards, a large central white prompt composer, and translucent rounded calls to action. The navigation has Lemonade branding, Careers, and Start Building. The lower page has a game-art conveyor with an interactive speed control and social/legal links.

The public sign-in page has a compact welcome panel, Roblox sign-in button, explanatory profile-access text, and an expandable permission table. The available browser was not already authenticated.

The Studio plugin is a compact Fusion dock widget with theme-based colors and typography. The connected view emphasizes project/prompt counts, connection status, the last tool-related path, disconnect, and logging. Its construction is inspectable, but it was not rendered or installed anew during this research.

**The authenticated editor's layout has not been observed.** A similar UI can only be specified accurately after inspecting the private workspace. The public landing page should not be mistaken for the editor.

## Proposed design direction for the later build

Keep a familiar project-and-chat workflow and improve the visibility of game outcomes:

- A project navigator and feature checklist on the left; task conversation in the center; game preview, changes, and validation on the right.
- Distinct progress states: planning, building, applying, testing, repairing, and ready. A successful HTTP call must not be presented as a validated game.
- A concrete completion card: features delivered, files/instances changed, actual tests exercised, screenshots and device dimensions, remaining issues, and a working undo checkpoint.
- A single connection panel distinguishing account mismatch, plugin version, Studio attachment, project machine readiness, and blocked rendering. Show one specific recovery action for the current problem.
- A controlled visual vocabulary: fewer decorative animations in the editor, strong readable code/text contrast, consistent spacing, and preview-led design feedback.
- User-selectable quality/budget intent with understandable costs and stopping rules. Exact tiers should follow measured economics, not guessed competitor pricing.

This is an original proposed information architecture, not a claim about Lemonade's current private UI. No replacement UI was built in this phase.

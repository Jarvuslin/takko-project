# Retired approval API assertions

These tests exercised deleted endpoints. Per-need safety coverage is in asset-picking and chat-flow-redesign. Read-only discovery coverage remains in asset-choices.

- offers the preserved raw-only mapped pack for Studio asset choices
- replaces one approved recommendation, preserving other choices and pinning the override
- retains the proposal if a replacement inspection fails
- binds richer inspected version metadata to automatic recommendations for any game
- saves an unpreviewed selection when inspection adds a version without changing its listed timestamp
- refreshes displayed identity after an explicit preview and still rejects a later version change
- requires explicit brief approval and complete choices
- previews a real clip, persists inspected choices and sends exact references to the planner
- does not approve unseen clips or arbitrary asset IDs
- fails closed for unsafe sources without partially saving selections
- preserves the accepted concept while attaching assets without another clarification loop
- does not approve unresolved concepts
- rejects animation version changes after preview
- only treats the chosen clip as provided, not every previewed animation
- offers only approved references to the build and blocks silent replacements
- does not offer approved combat models for an unrelated optional backdrop
- reopens choices without typing and invalidates the previous plan
- retains a previewed coverage-limited selection only with acknowledgement

Deleted UI paths, replaced by proposal question tests and the seven Electron journeys:

- tests/browser/ui-polish.spec.ts: one simple decision stays inline and custom answers remain available
- tests/browser/ui-polish.spec.ts: dialog custom input, focus loop, Escape and restored draft work without submission
- tests/browser/ui-polish.spec.ts: focused decisions retain choices, support multiple and skip, and save a compact receipt
- tests/browser/workflow.spec.ts: builds an approved non-combat project through a real HTTP provider adapter

- surgical-ux: legacy concept Question dialog flow. Inline proposal Back/Other/save coverage remains in proposal-questions.spec.ts. Historical reproduction helpers remain unchanged.

Additional removed endpoint assertions:

- rejects changed content at exact proposal approval and retains the prior proposal

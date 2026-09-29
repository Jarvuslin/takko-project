# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: proposal-questions.spec.ts >> unanswered proposal questions pause automatic Marketplace work even with a connected Studio
- Location: tests\browser\proposal-questions.spec.ts:6:1

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByRole('button', { name: 'Find assets', exact: true })
Expected: visible
Timeout: 5000ms
Error: element(s) not found

Call log:
  - Expect "toBeVisible" getByRole('button', { name: 'Find assets', exact: true }) with timeout 5000ms
  - waiting for getByRole('button', { name: 'Find assets', exact: true })

```

```yaml
- complementary:
  - link "Takko home":
    - /url: /
    - text: takko
  - button "New project"
  - button "Marketplace"
  - navigation "Workspace":
    - button "Models"
    - button "Presets"
- main:
  - text: Your projects
  - combobox "Open project":
    - option "New project"
    - option "A fighting game where the player punches a stationary target dum" [selected]
  - region "Game architecture":
    - strong: Game architecture
    - text: draft · Game architecture
    - button "Build details": Build
    - button "Source details": Source
    - button "Studio details": Studio
    - text: 0 systems · 0 connections
    - button "Connections"
    - button "Add system"
    - strong: Start with your first game system
    - paragraph: Describe your game to Takko, or add a system using the toolbar.
    - button "Ask Takko"
    - img "System connections"
    - button "Zoom out canvas": −
    - text: 100%
    - button "Zoom in canvas": +
    - button "Fit"
    - button "Auto layout"
  - heading "A fighting game where the player punches a stationary target dum" [level=1]
  - region "Project conversation":
    - strong: Takko
    - text: draft
    - button "Latest ↓"
    - button "History"
    - text: $0.2132 / $8.0000
    - article:
      - strong: You
      - text: r1 · 01:39 PM
      - paragraph: A fighting game where the player punches a stationary target dummy. Include a punching animation, a punch/hit sound when the player hits the dummy, and an on-screen counter that increments on each successful hit.
    - article:
      - strong: Takko
      - text: r1 · 01:40 PM
      - paragraph: draft
      - group: draft · Activity · $0.0590
      - button "Helpful"
      - button "Needs work"
    - article:
      - strong: Takko
      - text: r1 · 01:46 PM
      - paragraph: draft
      - group: draft · Activity · $0.0130
      - button "Helpful"
      - button "Needs work"
    - article:
      - strong: Takko
      - text: r1 · 01:47 PM
      - paragraph: draft
      - group: draft · Activity · $0.0130
      - button "Helpful"
      - button "Needs work"
    - article:
      - strong: Takko
      - text: r1 · 01:48 PM
      - paragraph: draft
      - group: draft · Activity · $0.0130
      - button "Helpful"
      - button "Needs work"
    - article:
      - strong: Takko
      - text: r1 · 01:48 PM
      - paragraph: draft
      - group: draft · Activity · $0.0130
      - button "Helpful"
      - button "Needs work"
    - article:
      - strong: Takko
      - text: r1 · 01:49 PM
      - paragraph: draft
      - group: draft · Activity · $0.0130
      - button "Helpful"
      - button "Needs work"
    - article:
      - strong: Takko
      - text: r1 · 01:50 PM
      - paragraph: draft
      - group: draft · Activity · $0.0130
      - button "Helpful"
      - button "Needs work"
    - article:
      - strong: Takko
      - text: r1 · 01:58 PM
      - paragraph: draft
      - group: draft · Activity · $0.0130
      - button "Helpful"
      - button "Needs work"
    - article:
      - strong: Takko
      - text: r1 · 01:59 PM
      - paragraph: draft
      - group: draft · Activity · $0.0130
      - button "Helpful"
      - button "Needs work"
    - article:
      - strong: Takko
      - text: r1 · 02:00 PM
      - paragraph: draft
      - group: draft · Activity · $0.0130
      - button "Helpful"
      - button "Needs work"
    - article:
      - strong: Takko
      - text: r1 · 02:01 PM
      - paragraph: draft
      - group: draft · Activity · $0.0130
      - button "Helpful"
      - button "Needs work"
    - article:
      - strong: Takko
      - text: r1 · 02:01 PM
      - paragraph: draft
      - group: draft · Activity · $0.0130
      - button "Helpful"
      - button "Needs work"
    - article:
      - strong: Takko
      - text: r1 · 02:02 PM
      - paragraph: draft
      - group: draft · Activity · $0.0113
      - button "Helpful"
      - button "Needs work"
    - group: Preview an animation clip
    - region "Studio in conversation"
    - region "Game proposal":
      - 'heading "Dummy Strike: Punch Counter Trainer" [level=2]'
      - button "5 questions need answers"
      - paragraph: Saved proposal · revision 1
      - paragraph: "World: Baseplate template."
      - heading "Mechanics" [level=3]
      - paragraph: "The player spawns near a single stationary target dummy planted on the baseplate. Clicking (PC) or tapping (mobile/console equivalent) while facing the dummy and within punch range triggers the player's punching animation on their character. When the animation's active punch frame overlaps the dummy's hit region, a hit registers: the game plays a punch/hit sound anchored to the dummy, briefly flashes or nudges the dummy for visual feedback, and increments a persistent-for-session on-screen hit counter displayed in a HUD label. The dummy does not take damage, fall over, or despawn; it remains anchored in place so the player can repeat punches indefinitely. A short per-punch cooldown (matching the animation length, roughly 0.5-0.8s) prevents multiple hits from a single swing and paces repeated attacks. The counter starts at 0 on join and increases by 1 per successfully landed punch; there is no upper limit, timer, or end condition, making this a practice/scoring loop rather than a win/lose fight."
      - paragraph: "Assumptions: Only one target dummy is required; the request describes a single stationary target, not multiple opponents. The dummy has no health, damage numbers, or knockback; 'stationary target dummy' implies a passive punching target, not a defeatable enemy. Hit counter resets to 0 each time the player joins/respawns; no cross-session leaderboard or data persistence was requested. A short punch cooldown equal to the animation duration prevents double-counting a single swing as multiple hits. Input is a simple click/tap-to-punch action; no combo system, blocking, or multiple attack types were requested. The counter UI is a simple always-visible on-screen label (e.g., top of screen); no additional menus or resets are requested."
      - status: "Unresolved: Should this limit apply, or should the mechanic support more? Only one target dummy is required; the request describes a single stationary target, not multiple opponents. Should this limit apply, or should the mechanic support more? The dummy has no health, damage numbers, or knockback; 'stationary target dummy' implies a passive punching target, not a defeatable enemy. Should this limit apply, or should the mechanic support more? Hit counter resets to 0 each time the player joins/respawns; no cross-session leaderboard or data persistence was requested. Should this limit apply, or should the mechanic support more? Input is a simple click/tap-to-punch action; no combo system, blocking, or multiple attack types were requested. Should this limit apply, or should the mechanic support more? The counter UI is a simple always-visible on-screen label (e.g., top of screen); no additional menus or resets are requested."
      - heading "Theme" [level=3]
      - paragraph: "A casual arcade training-gym theme: a lone punching dummy standing on open ground evokes a boxing/martial-arts practice yard rather than a narrative fight. The presentation favors clarity and immediate feedback (visible dummy reaction, audible hit sound, incrementing counter) over story or environment lore, matching the simple 'test your punches' loop the request describes."
      - paragraph: "Assumptions: No specific fighting-game IP, character, or narrative setting was requested, so a generic neutral training theme is used. The dummy's visual style is a generic humanoid-shaped training dummy (sandbag/mannequin style) rather than a stylized character."
      - heading "Environment & layout" [level=3]
      - paragraph: Build directly on the existing baseplate (top at y=0) with no added floor, walls, or ceiling. The player spawns near the world origin in open space. A single target dummy is placed a short, comfortable punching distance away (a few studs in front of spawn) so it's immediately visible and reachable within the first seconds of play. The on-screen hit counter is a persistent HUD label (e.g., top-center or top-right of the screen) visible at all times during play. No additional landmarks, routes, or elevated structures are needed since the entire loop happens at one fixed interaction point.
      - paragraph: "Assumptions: Spawn stays at/near the baseplate origin at ground level; no elevation or enclosure is added since none was requested. The dummy is placed close enough to spawn (roughly 5-10 studs away) that the player can see and reach it within the first few seconds without additional navigation."
      - heading "Marketplace assets" [level=3]
      - paragraph: Connect Marketplace to retrieve recommendations. Your game proposal stays editable.
      - paragraph: Recommendations use inspected content. Playback, permissions and gameplay still need Studio testing. Preview or replace assets below.
      - button "Answer 5 questions first"
    - region "Assets for your brief":
      - text: ASSETS FOR YOUR BRIEF
      - heading "Find your game’s look and movement" [level=2]
      - paragraph: Takko searches the free Creator Store using your brief. Nothing is inserted yet.
      - button "Preview & choose assets"
    - paragraph: Your build plan appears after planning.
    - text: Message
    - textbox "Message":
      - /placeholder: What would you like to add or change?
    - button "Browse Marketplace assets"
    - button "Attach Studio feedback"
    - button "Presets"
    - button "Budget for this generation": Budget
    - button "Send message and update plan" [disabled]
    - text: Enter to send · Shift + Enter for a new line
```

# Test source

```ts
  1   | import fs from "node:fs";
  2   | import { test, expect } from "./workspace-fixture";
  3   | import { proposalQuestions } from "../../src/generation/proposal-questions";
  4   | import { structuredQuestionSchema } from "../../src/generation/questions";
  5   | 
  6   | test("unanswered proposal questions pause automatic Marketplace work even with a connected Studio", async ({
  7   |   page,
  8   | }) => {
  9   |   const p = JSON.parse(
  10  |     fs.readFileSync(
  11  |       "docs/results/question-modal-20260928/live-project-before.json",
  12  |       "utf8",
  13  |     ),
  14  |   );
  15  |   p.clarificationQuestions = proposalQuestions(p);
  16  |   delete p.assetDiscovery;
  17  |   let searches = 0,
  18  |     connectionChecks = 0;
  19  |   await page.route("**/api/status", (r) =>
  20  |     r.fulfill({
  21  |       json: {
  22  |         studios: [],
  23  |         proposals: true,
  24  |         concepts: true,
  25  |         assetChoices: true,
  26  |         studioConnectionGate: false,
  27  |       },
  28  |     }),
  29  |   );
  30  |   await page.route("**/api/marketplace/studios", (r) => {
  31  |     connectionChecks++;
  32  |     return r.fulfill({
  33  |       json: { studios: [{ id: "offline-studio", name: "Offline studio" }] },
  34  |     });
  35  |   });
  36  |   await page.route("**/api/projects", (r) => r.fulfill({ json: [p] }));
  37  |   await page.route(`**/api/projects/${p.id}{,/**}`, (r) => {
  38  |     const action = new URL(r.request().url()).pathname.split("/")[4];
  39  |     if (action === "asset-options") searches++;
  40  |     return r.fulfill({ json: action === "studio-operations" ? [] : p });
  41  |   });
  42  |   await page.goto(`/?project=${p.id}`);
  43  |   await expect(page.getByRole("dialog")).toBeVisible();
  44  |   await expect.poll(() => connectionChecks).toBeGreaterThan(0);
  45  |   await page.keyboard.press("Escape");
  46  |   await expect(
  47  |     page.getByRole("button", { name: "Find assets", exact: true }),
> 48  |   ).toBeVisible();
      |     ^ Error: expect(locator).toBeVisible() failed
  49  |   expect(searches).toBe(0);
  50  | });
  51  | 
  52  | test("real saved proposal questions support review, Other, closing, keyboard and free answers", async ({
  53  |   page,
  54  | }, info) => {
  55  |   const p = JSON.parse(
  56  |     fs.readFileSync(
  57  |       "docs/results/question-modal-20260928/live-project-before.json",
  58  |       "utf8",
  59  |     ),
  60  |   );
  61  |   const questions = proposalQuestions(p).map((q) =>
  62  |     structuredQuestionSchema.parse({
  63  |       ...q,
  64  |       fallback: false,
  65  |       options: [
  66  |         q.options[0],
  67  |         {
  68  |           id: "expand",
  69  |           label: "Expand this mechanic",
  70  |           description: "Ask the planner to extend this specific behavior.",
  71  |         },
  72  |         {
  73  |           id: "replace",
  74  |           label: "Choose a different approach",
  75  |           description:
  76  |             "Ask the planner for a replacement for this part of the game.",
  77  |         },
  78  |       ],
  79  |     }),
  80  |   );
  81  |   p.clarificationQuestions = questions;
  82  |   let writes = 0,
  83  |     approvals = 0;
  84  |   await page.route("**/api/status", (r) =>
  85  |     r.fulfill({
  86  |       json: {
  87  |         studios: [],
  88  |         proposals: true,
  89  |         concepts: true,
  90  |         assetChoices: false,
  91  |         studioConnectionGate: false,
  92  |       },
  93  |     }),
  94  |   );
  95  |   await page.route("**/api/projects", (r) => r.fulfill({ json: [p] }));
  96  |   await page.route(`**/api/projects/${p.id}{,/**}`, async (r) => {
  97  |     const action = new URL(r.request().url()).pathname.split("/")[4];
  98  |     if (action === "studio-operations") return r.fulfill({ json: [] });
  99  |     if (action === "approve-proposal") approvals++;
  100 |     if (r.request().method() === "PATCH") {
  101 |       writes++;
  102 |       p.answers = r.request().postDataJSON().answers;
  103 |       p.clarificationQuestions = [];
  104 |       p.revision++;
  105 |       for (const id of ["mechanics", "theme", "environment"])
  106 |         p.proposal[id].unresolved = [];
  107 |     }
  108 |     await r.fulfill({ json: p });
  109 |   });
  110 |   await page.goto(`/?project=${p.id}`);
  111 |   const dialog = page.getByRole("dialog");
  112 |   await expect(dialog).toBeVisible();
  113 |   await expect(dialog.getByRole("radio")).toHaveCount(4);
  114 |   await expect(dialog.getByText("· Recommended", { exact: true })).toHaveCount(
  115 |     1,
  116 |   );
  117 |   await page.screenshot({
  118 |     path: `docs/results/question-modal-20260928/modal-${info.project.name}.png`,
  119 |     fullPage: true,
  120 |   });
  121 |   await page.keyboard.press("Escape");
  122 |   await expect(dialog).toHaveCount(0);
  123 |   const gate = page.getByRole("button", {
  124 |     name: `Answer ${questions.length} questions first`,
  125 |   });
  126 |   await expect(gate).toBeVisible();
  127 |   await gate.click();
  128 |   await expect(dialog).toBeVisible();
  129 |   expect(approvals).toBe(0);
  130 |   const close = dialog.getByRole("button", {
  131 |     name: "Close dialog",
  132 |     exact: true,
  133 |   });
  134 |   await close.focus();
  135 |   await page.keyboard.press("Shift+Tab");
  136 |   expect(
  137 |     await dialog.evaluate((el) => el.contains(document.activeElement)),
  138 |   ).toBe(true);
  139 |   await dialog.getByRole("radio", { name: "Other", exact: true }).check();
  140 |   await dialog
  141 |     .getByLabel("Your answer")
  142 |     .fill("A distinct choice that should survive closing.");
  143 |   await page.keyboard.press("Escape");
  144 |   await page
  145 |     .getByRole("button", { name: `${questions.length} questions need answers` })
  146 |     .click();
  147 |   await expect(dialog.getByLabel("Your answer")).toHaveValue(
  148 |     "A distinct choice that should survive closing.",
```
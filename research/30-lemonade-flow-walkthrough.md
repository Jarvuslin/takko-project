# Lemonade flow walkthrough and Takko UI direction

Observed 2026-09-28 in the user's signed-in Chrome session, with the user's approval. Read-only. No prompt sent, no generation started, no credits spent, no project created or changed. The New Project dialog was opened and closed without submitting. Only the existing project "supafire" was inspected. Screenshots: `research/evidence/lemonade-walkthrough-20260928/`.

This covers what the web UI shows. It does not establish how Lemonade's backend works. A live generation in progress was not observed, because that would spend the user's credits.

## What was observed

**Dashboard.** Dark left sidebar with New Project, recent projects, a Discord card, Download plugin, Billing and profile. The main area is a blue gradient with a large "DESCRIBE A GAME MECHANIC" heading, a scrolling row of example chips and one dark composer. The composer holds the prompt, the model picker, the credit balance (1.47) and Generate.

**Model picker.** Tabs for Recommended, Low cost, Advanced and All, price symbols, and a performance panel for simple tasks, complex tasks and speed. The default recommended model is **GLM 5.3 Flash ($)**. The All list: GLM 5.3 Flash, Hy3, GPT-5.6 Luna, Gemini 3.7 Flash, Composer 2.5, GPT-6 Luna, and GPT-6 Astra and GPT-5.6 Sol as Pro-only. No Claude model is offered. The picker is disabled inside a project while the plugin is disconnected.

**New Project.** A small modal: one "Roblox Game" starting point, a project name and Create project. Nothing else.

**Project workspace.** A mechanics canvas on the left with a collapsed icon rail. The header shows "3 mechanics · 3 links", an Agent/Explore switch, Quests 0/2 and Import Game. Built mechanics are hexagon nodes with a green check and a "+N" subnode count. Clicking one opens a popover listing its subnodes (Basic Melee, Defense, Practice, Animations). Faded dashed satellite cards around the graph are suggested additions, each with an Add button. The right ~30% is Chat.

**Chat flow.** The actual recorded conversation:
1. User: "create a simple jujutsu shenanigan style game".
2. Lemonade replies in plain chat text. It explains the full game is large, recommends one buildable slice (arena, one technique, melee, server damage, cooldowns, UI) and ends with "Confirm if you want me to start with that." **No modal, no form, no approval screen.**
3. User: "ok create it".
4. One "Generation complete, 27 actions in this build" card. Expanding Activity lists pills: Plan ready for approval, Finding references, Searched Roblox docs, Loading references, Task completed successfully, then one pill per created instance (Created Folder at ReplicatedStorage/Events, Created RemoteEvent ..., Created Part at Workspace/CombatArena/ArenaFloor ...), then Running playtest (8s).
5. Smart Suggestions: five clickable next-step cards.
6. A "What changed" summary with green (created) and yellow (updated) bullets, the playtest result, and an honest note that the visual review could not run because Studio was minimized.
7. User: "theres no animations, add those". Lemonade **created** CombatPunch and TechniqueBurst animations itself and showed each in an orbitable 3D preview with R6/R15 toggles, then a summary of the files it changed.
8. Every generation has "Rate this generation". Every user message has a restore-checkpoint icon.

**Other panels.** History lists conversations with "Start a new chat". Quests is a small progress popover ("Mechanics linked 3/5", "Refine"). While disconnected, the composer reads "Plugin disconnected, reconnect Roblox Studio to continue" and the map actions are disabled.

## Differences that matter for Takko

| Lemonade | Takko today |
| --- | --- |
| Questions are ordinary chat replies with a recommendation. The user answers by typing. | Questions sit behind separate gates. They needed a new modal just to be answerable. |
| One composer, one Generate. The plan approval is an activity pill inside the build. | Concept, questions, brief approval, asset approval, proposal approval, build, review, export, each with its own surface. |
| Builds live in Studio through the plugin, playtests, then reports what changed. | Builds offline, reviews, then exports a file for the user to open. |
| Every build ends with a concrete "what changed" list and suggestions. | Results are spread across Brief, Build, Source and Studio views. |
| Creates animations itself and previews them in chat. | Searches the free Creator Store and relies on whatever clips it finds. |
| Defaults to a cheap model (GLM 5.3 Flash). | Sonnet 5 on every paid route. |

Lemonade also built an arena floor and four boundary walls in this project. The enclosed-box habit is not unique to Takko's models.

## Recommendation

Clone the interaction model and layout, not the brand. Keep Takko's name, logo, palette and copy, and do not reuse Lemonade's shipped JavaScript.

1. **Make chat the single flow.** Replace the gates with chat turns. The planner replies with a short plan plus a recommendation and at most a few questions, answerable by typing or by tapping suggestion chips under the message. One Build action. Keep Takko's cost cap and approval as a compact inline confirm, not a separate screen.
2. **One result card per build.** Collapsed Activity pills, a "what changed" list, check results, screenshots, and suggestion cards.
3. **Asset picks inside chat.** Show asset and clip choices as inline cards with previews, not a separate step.
4. **Canvas second.** The mechanics map stays, but only after something is built. No empty "0 systems" canvas at the start.
5. **One stylesheet.** Rebuild on tokens.css only and delete the four stacked earlier sheets instead of overriding them again.
6. **Separate follow-ups.** Animation generation and a controlled cheap-model comparison (GLM 5.3 Flash or Luna against Sonnet on the same request) are worth their own work items. They are not part of the UI change.

Timing: finish the in-flight fighting-game run (project c8550a5b on port 4340) on the current UI before starting the redesign.

# Authenticated Lemonade UI observation — 2026-09-14

The user authorized exploring Lemonade in their existing Chrome session and copying the interface into Forge. This pass used the visible dashboard and the existing `supafire` project. It supersedes earlier notes saying authenticated project history was unavailable for UI inspection. Backend source, prompts and infrastructure remain unavailable.

## Directly observed in the browser

- **Dashboard:** approximately 288 px dark sidebar at a 1920 px browser width; white New Project button; recent project list; bottom promotional card, plugin, billing and profile controls. Main surface is a cyan/blue atmospheric gradient with large condensed white/yellow heading, horizontal mechanic prompt chips and a rounded dark composer. Clicking a chip fills and focuses the prompt; it does not generate immediately.
- **Model picker:** compact popover anchored to the composer. Recommended / Low cost / Advanced / All filters, selected model, relative price symbols and a details/performance panel. In this account's observed All list: GPT-5.6 Luna, Hy3, Gemini 3.7 Flash and Composer 2.5. These are UI labels, not verified model routing or quality measurements.
- **New Project:** modal with Clean Start, disabled Remix option, project name and Continue. The modal was inspected and dismissed without creating a project.
- **Project workspace:** sidebar collapses to an icon rail. Main area is a dotted mechanics canvas with project identity, Agent/Explore switch, quests, import control and zoom. The existing project displayed three mechanics and three links, with smaller suggested additions around them. The right roughly 30% is a Chat panel.
- **Chat:** existing user messages, checkpoint restore controls, expandable generation activity, rendered result text, smart suggestions, UI image and animation preview cards with R6/R15 controls. History switches the panel to conversation selection. Restore, rating and new chat were not submitted.
- **Activity detail:** an expanded four-action group showed animation creation, script editing, a seven-second playtest request and a reported play-session timeout. This is historical client-visible output; the test was not rerun and its underlying cause was not independently verified.
- **Explore:** right panel becomes searchable Public Prompts, with creator attribution, usage/like counts and estimated credits. A leaderboard overlays the canvas. A prompt opens an image/prompt preview. No like, publication or reuse was submitted.
- **Studio gate:** existing project composer, model selection and send control disabled while disconnected. Connection control opens “Reconnect Roblox Studio” instructions to press Connect in the plugin. No connection or import was initiated.

No Lemonade generation was submitted and no credits were spent in this pass. No existing project content was changed. Lemonade was returned to its dashboard.

## Forge implementation choices

The local UI adopts the observed visual structure: blue dashboard, condensed two-line heading, yellow highlight, prompt chips, dark composer, full/collapsed sidebar, dotted task graph, Agent/Explore controls and a right-hand project panel. The graph uses actual saved plan tasks and declared dependencies. Completed task indicators mean build progress; they do not imply a passing Studio test.

Forge's current backend does not have Lemonade's mechanics knowledge graph, community feed, hosted credit billing, conversational checkpoints or browser animation renderer. Explore therefore identifies its entries as Forge starter prompts, model selection uses configured providers and prices, and the sidebar card downloads Forge's actual plugin. It does not fabricate public creators, credits, metrics, community activity or animation previews. Existing source, approval, build, export, Studio pairing and visual-feedback features remain accessible.

Follow-up messages append to the saved request, preserving the original request and clarification answers, then run the existing planner. This is a brief revision workflow, not Lemonade's unobserved internal chat orchestration. User approval is still required before building the revised specification.

## Verification

See `docs/lemonade-ui-rebuild.md` for implementation validation and local screenshots. This UI pass does not add a native Studio generation-quality result.

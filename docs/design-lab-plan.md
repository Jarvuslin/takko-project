# Design lab plan

Build a temporary high-fidelity comparison inside the actual React/Vite stack. Reuse ArchitectureEditor, its graph schema and editing behavior, AnimationPlayer/TakkoViewport, Icons, TakkoMark and current CSS tokens. No alternate HTML app, new dependency or provider request. `/design-lab` lazy-loads its own scoped CSS and local fixtures. All other routes retain App.

## Scope

In: three 1440×900 workspaces, live variant switching, real graph interaction and WebGL clip playback, local review/Studio/composer states, visual inspection and full regression checks.

Out: applying a design to the production workspace, model inference, native Studio actions, fake live integration, Figma writes and a fourth direction.

## Design decisions before implementation

| Attribute | A: Refined Takko | B: AI Native | C: Game Dev |
| --- | --- | --- | --- |
| Hierarchy | Project, graph, action result, asset | Current intent, agent outcome, graph context | Systems, contracts, selected object, agent result |
| Layout | 196px labeled sidebar, flexible canvas, 408px agent | 76px rail, generous canvas, 448px agent | 176px project strip, graph-focused canvas, 392px agent |
| Surfaces | Existing canvas/sidebar/panel tokens, one boundary per region | Inset agent surface, borderless feed, selected layers | Flat instrument surfaces, thin separators, floating toolbar |
| Type | Existing Segoe/system font, 14px body, 12px meta, 18px headings | Same face, 15px prose, 20px result title, generous leading | Same face, 13px UI, 12px labels, strong node names |
| Spacing | 8/12/16/24 scale | 12/16/24/32 scale | 6/8/12/16 scale |
| Nodes | Rounded outlined cards with clear status and ports | Soft capsules, increased whitespace, subtle selected halo | Structured cards with stronger runtime header and port strip |
| Agent | Compact result disclosure, bordered artifact, pinned composer | Editorial progress narrative, integrated artifact, soft composer | Task receipt, compact artifact, next-action prompts |
| Interaction | Existing graph editing, focused details and local review sheet | Minimal exposed actions, disclosures retain context | Contextual inspector, canvas action grouping, visible resize grip |
| Motion | 140ms feedback, 220ms disclosure | 180ms surface fades, 280ms panel entry | 140ms selection, 300ms inspector transition |

Use the same graph topology, project request, selected Combat node, working Energy demonstration, three pending review items and real R6 imported walk clip. Demonstration states are labeled in the lab toolbar. No completion claim implies verified gameplay. Preserve reduced-motion behavior.

## Action items

1. Record the design specification and preserve source baselines.
2. Add a lazy isolated route and sanitized local fixtures.
3. Compose the shared real graph and real animation viewport.
4. Style A, B and C with scoped design tokens and distinct anatomy.
5. Add local state review, composer, Studio status and inspector interactions.
6. Capture and inspect each direction at 1440×900, then refine observed defects.
7. Test route isolation, switching, graph edits, real playback and local-only actions.
8. Run npm run check, document exact results and stop for selection.

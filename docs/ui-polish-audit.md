# Takko UI polish audit

Audit started 2026-09-21. Observed the existing production browser on 4358 and inspected shared source before edits. User screenshots are additional observations of the running desktop. No inference authorized or used.

## Direction

Quiet, functional refinement of the selected B foundation. Preserve the taco, warm charcoal surfaces, system font, restrained cream selection and graph. Use 4/8/12/16/24 spacing, readable 12px metadata and 14px controls. No new visual framework, fonts or decorative effects. Brief opacity/translate entrances only, with reduced motion. Resize is direct manipulation, without animated width.

## Findings and fixes

| Surface | Observed cause | Intended correction |
| --- | --- | --- |
| Clarification | Concept and specification render every question and custom input in the feed | Shared focused decision dialog, review step, retained answers, compact receipt, inline simple choice |
| Agent pane | Fixed width and excessive inset padding | Pointer-captured and keyboard-accessible divider, persisted width, bounded canvas and chat sizes |
| Inspector | Three narrow columns with independent scrollbars at a 1049px viewport | Contextual system/connections views in the existing bottom dock, one scroll area |
| Brief | Original request starts expanded and dominates a draft conversation | Collapsed brief editor and shorter action guidance |
| Build plan | Empty accordion occupies a large rounded block, repeated heading and oversized task cards | Single empty-state line, compact ordered task rows with truthful state and expandable source detail |
| Composer | Tall empty textarea, heavy inner focus ring, redundant two-line explanation | Autosizing textarea, outer focus treatment, compact controls and explicit keyboard hint |
| Feed | Repeated full question prompts, tiny revision metadata, nested media surfaces | Structured answer receipts, readable metadata, lighter activity and artifact surfaces |
| Models | Repeated connection explanation, two provider rows and nested catalog scrolling push the selection down | Compact connected state, disclosure for management, hidden known fields and clearer model summary |
| Navigation | Models and Marketplace share the same grid icon in the narrow rail | Distinct icons and discoverable native labels |
| Marketplace | Narrow view covers the conversation without modal focus semantics | Review narrow-screen focus/escape behavior and use a consistent drawer |
| Loading | Catalog loses useful structure while loading | Stable loading rows and status text |
| Desktop | Shortcut resolves to Electron package, process 31724 currently running | Rebuild shared frontend into new package, launch actual executable in isolated workspace, request permission only when replacing the user's running app |

## Verification plan

Offline fixtures for single, multiple, custom, optional and multi-select decisions. Verify focus loop, Escape, Back, confirmation, persisted answers, no accidental paid submission, keyboard resizer, pointer extremes and reload. Check desktop/mobile browser, actual packaged Electron at minimum/normal/maximized/restored sizes, Models, presets, Marketplace, graph, inspector, history, source, Studio, animation and composer. Capture and inspect final images. Run every npm run check stage and preserve failures.

The existing native dialog wrapper is reused. There is no installed resize primitive. A small pointer-capture separator can keep resizing local to the split surface without rerendering the graph on each pointer move. No dependency migration is needed.

## Skills read

choose-skill, frontend-design, ui-ux-pro-max, baseline-ui, fixing-accessibility, fixing-motion-performance, react-best-practices, electron-development and its detailed guide. Existing stack and user constraints take precedence over generic template or framework suggestions.

# UI diagnosis and token consolidation

2026-09-23. Requested as a UI diagnosis of the Electron app with areas for polish, then "fix all of it".

**Two of the seven diagnosed findings were wrong and were reverted. One fix attempt caused a regression and was reverted. The rest landed and `npm run check` passes clean.** No paid inference ran. No servers were started, killed or restarted. No Studio session.

## What was wrong with the diagnosis

Both errors have the same shape: reading one stylesheet and concluding from it, in an app whose renderer loads five sheets that override each other by import order. The base sheet does not tell you the result.

### Fonts were not a broken wiring

Claimed: `src/web/fonts/` holds Saira Condensed, EB Garamond and JetBrains Mono, no `@font-face` exists, all three font tokens resolve to the same system stack, so the documented typography was never shipped.

The files and the absence of `@font-face` are real. The conclusion was not. `docs/takko-grok-ui-implementation.md` line 13 records the decision:

> Fonts remain the existing system stack with Segoe UI fallback, so the app has no new font download or external font dependency.

The woff2 files are leftovers from a 2026-09-14 direction that the grok redesign superseded. `tests/browser/typography.spec.ts` asserts the system stack in four places and asserts zero requests to `fonts.googleapis.com` or `fonts.gstatic.com`.

The fonts were wired in, two typography tests went red, and the change was reverted. What was actually defective is documentation that claimed the opposite:

- `docs/agent-context/orientation.md` said "Self-hosted fonts: Saira Condensed display, EB Garamond prose, JetBrains Mono controls." Corrected.
- `src/web/fonts/README.md` said "Vite bundles these assets locally." It did not, because nothing referenced them. Rewritten as a superseded-assets note pointing at the decision record and the test, with instructions for wiring them back if the direction is revisited.

The woff2 files and their SIL OFL licenses were **not** deleted. They were a deliberate licensed download and the direction may be revisited. They cost nothing in the bundle because Vite only emits referenced assets.

### The chat composer collapse was already fixed

Claimed: `.chat-thread-scroll` has `flex: 1; min-height: 0` and `.chat-composer` has `flex-shrink: 0`, so tall attachment rows starve the thread, matching the 16px chat area recorded at 844x575 in `continuation.md`.

Those declarations are in `conversation.css`. `ui-polish.css` loads later and already caps the composer at `max-height: 55%` with `.asset-attachments { max-height: 120px; overflow-y: auto }`.

Verified by restoring the exact pre-session rules and running `tests/browser/chat-architecture.spec.ts` at 844x575 with four attachments: 4 passed. The pre-session layout satisfies both assertions on its own, thread height >= 140 and send button bottom <= 575.

The attempted fix added `min-height: 132px` to the composer and `min-height: 140px` to the thread. Those floors sum above the available height in a short panel and pushed the send button out of view. All of it was reverted to the pre-session rules.

## Regression caused and reverted

Breakpoint consolidation. 27 distinct width values clustered at 500, 600, 640, 650, 680, 700 and 760px. Near-duplicates in the same band were merged by pattern.

`ui-polish.css` had `@media (max-width: 820px)` widened to 900px. That block switches `.resizable-workspace` from side-by-side columns to stacked rows. At 844px it previously did not apply. After the merge it did.

Measured at 844x575 with the browser, before and after:

| element | merged breakpoints | reverted |
|---|---|---|
| `.chat-panel` height | 253px | 483px |
| `.chat-thread-scroll` height | 96px | 172px |
| `.chat-composer` bottom | 642px | 547px |
| viewport height | 575px | 575px |

Every media query value was restored and diffed against a pre-change backup to confirm parity. Breakpoint consolidation needs each block looked at at its own width. It is not a mechanical change and it is still open. The reasoning is recorded in a comment at the bottom of `src/web/tokens.css` so the next attempt starts from the evidence.

## What landed

### One token layer

`src/web/tokens.css` is new and imported first in both `App.tsx` and `main.tsx`.

Before, three stylesheets each declared a `:root` block and the last one loaded won:

| token | `styles.css` | `grok-theme.css` | effective |
|---|---|---|---|
| `--ink` | `#f2f3f4` | `#f4f4f4` | grok |
| `--line` | `#353535` | `#333` | grok |
| `--panel` | `#202020` | `#1d1d1d` | grok |
| `--green` | `#e8e8e8` | `#f4f4f4` | grok, and grey |

`ui-polish.css` added a third block with a parallel vocabulary. The built CSS now contains one token block. **Every value in it is the value that was already winning**, so the consolidation changed no pixel. It is now true that changing a value changes it everywhere, which was not true before.

Renames, all semantic corrections:

- `--green` and `--yellow` had been grey for a long time. Now `--accent` and `--accent-dim`.
- `--focus-ring` in `ui-polish.css` was never used for a focus outline. It styles the active resize divider and the checked radio border. Renamed `--selected`.
- Three different focus colours existed: `#9cbbc9` in `focus.css`, `#b8dfff` in `grok-theme.css`, `#c8bc9e` in `ui-polish.css`. One `--focus-ring: #9cbbc9` now. This changed two pixels: the design-lab focus outline and the checkbox `accent-color`, both from `#b8dfff` to `#9cbbc9`.

### 91 repeated colour literals lifted into tokens

343 distinct hex values across 463 occurrences. Only 21 values repeat three or more times, covering 91 occurrences. Those 21 are now tokens. The remaining long tail is genuinely one-off and stays inline, because inventing 300 tokens is worse than the problem.

Verified lossless by script: all 21 tokens resolve to the exact literal they replaced.

### The one contrast failure

`#555` borders measured 2.40:1 against the canvas. Replaced with `--line-strong: #6b6b6b` at 3.54:1, above the 3:1 requirement for non-text UI. Two `#555` text colours in `design-lab.css` went to `--muted` at 8.13:1.

Measured against the real canvas `#111`, not the dead `#171717` in `styles.css` that `grok-theme.css` overrides:

```
17.17  --ink on canvas          ok
 8.13  --muted on canvas        ok
 9.32  --focus-ring on canvas   ok
 3.54  --line-strong on canvas  ok
 2.53  old #555                 FAIL
```

Text contrast elsewhere was already good and needed nothing.

### Type scale

27 distinct font sizes down to 16. Nothing below 11px, where there had been nine rules at 8px, four at 9px and 36 at 10px. Sizes were snapped onto scale values by 1 to 2px each, which is imperceptible individually and removes a whole tier of unreadable text. The sheets still write px literals; the tokens are there for new rules.

### Hit targets

25 buttons and selects below the project's established 36px standard were raised. 20 to `var(--control-min)` at 36px, 5 inside compact media queries to 32px, where vertical space is genuinely constrained. Native checkbox and radio boxes, textareas and layout containers were left alone, because those are content sizing, not hit targets.

### Electron shell

- `backgroundColor` was `#141414` while the renderer canvas is `#111` and `styles.css` claims `#171717`. Three different darks, visible as a flash during the hard navigation from the status page to the workspace. Now `#111111`, and `desktop/status.html` matches.
- `nativeTheme.themeSource = "dark"` gives Windows 11 a dark native title bar. `titleBarOverlay` was considered and rejected: it requires `titleBarStyle: "hidden"`, which hides the menu bar that carries Service to Retry service and Connection details. That is a functional regression, and relocating the menu into the renderer is a product decision, not a polish task.
- `ready-to-show` now triggers `show()`, with the previous unconditional `show()` kept as a fallback for a renderer that never paints.

### Stylelint

`stylelint` and `stylelint-config-standard` added. `.stylelintrc.json` configured. `npm run lint:css` added and wired into `npm run check` between `test:guards` and `build`.

Current state: **0 errors, 556 warnings, exit 0.**

Hard rules: `declaration-block-no-duplicate-custom-properties` (the rule that would have caught the three competing `:root` blocks), `declaration-block-no-duplicate-properties`, `color-hex-length`, plus the standard config. `--fix` resolved the mechanical shorthand, pseudo-element and hex-length issues. `clip: rect(0,0,0,0)` in the sr-only helper became `clip-path: inset(50%)`.

Warnings, deliberately not blocking:

- `color-no-hex`, 500-odd, the one-off colour tail. Off for `tokens.css`.
- `no-duplicate-selectors`, within-file duplicates. Merging them reorders the cascade and needs per-case review. Off for `design-lab/`, where stacked variant blocks are the point.

## Correction to the diagnosis: axe was already there

The diagnosis recommended adding `@axe-core/playwright`. It is already a devDependency and already used in at least nine browser specs, including full-page scans in `lemonade-layout`, `marketplace`, `studio-connection` and `workflow`. The recommendation was wrong. What the existing scans do not cover is the `design-lab` route, which is where the `#555` text contrast failure lived.

## Verification

`npm run check`, full chain, exit 0:

| stage | result |
|---|---|
| vitest | 1,449 passed, 93 files |
| test:luau | 6 scenarios, 4 source compiles |
| test:plugin | 14 mock groups, 8 injected compiles |
| test:guards | passed |
| **lint:css** (new) | 0 errors, 556 warnings |
| build (tsc --noEmit + vite) | 170 modules, clean |
| test:desktop | 14 tests |
| test:production | smoke passed |
| test:e2e | **155 passed, 1 skipped, 0 failed** (9.5m) |

The skip is the pre-existing intentional mobile horizontal-resizer skip.

An earlier full run in this session failed 6 browser tests: 2 typography (the font change) and 1 chat-architecture (the breakpoint merge), across desktop and mobile. **That failure is preserved here as the record of the two wrong findings.** It is not a flake and it should not be described as one.

### What this does not establish

- The browser suite results are computed values and assertions, not visual review. Only the two desktop screenshots below were actually looked at, and only at 1440x960.
- Two dangling CSS variable references exist, `--border` in `asset-choices.css` and `--agent-width` in `ui-polish.css`. Both have fallbacks and both predate this work. Not touched.

## Electron shell verified natively

Run after the fact, because the first version of this report listed the shell changes as applied-but-untested.

`docs/results/ui-polish-shell/shell-verify.mjs` imports the **real** `dist-desktop/main.mjs` into an Electron main process and observes the `BrowserWindow` the shipped code creates, rather than building its own. The existing `desktop/tests/electron-smoke.mjs` cannot cover this: it creates its own `show: false` window and never exercises the `main.mjs` window path. Run against an isolated `--user-data-dir`. The user application on its own release build was not touched, its five PIDs were unchanged before and after.

Observed:

| check | result |
|---|---|
| `backgroundColor` | `#111111` |
| `nativeTheme.themeSource` | `dark`, `shouldUseDarkColors: true` |
| visible at creation | `false`, then shown |
| first-frame colour | `#111111`, the status page |
| frames during navigation | `#111111` then `#161616`, both in palette, **no off-palette flash** |
| renderer `--control-min` | `36px` |
| renderer `--focus-ring` | `#9cbbc9` |
| renderer root background | `rgb(17, 17, 17)` |
| renderer font | system stack, correctly not the woff2 files |

Screenshots at 1440x960: `shell-1-startup.png` and `shell-2-workspace.png`. Both were looked at. The startup page and the workspace render correctly and share the same dark ground.

### A defect this found in my own change

The first `ready-to-show` implementation was dead code. Measured event order:

```
browser-window-created @+61ms
  visible-at-creation=false
show           @+151ms
ready-to-show  @+153ms
```

`await window.loadURL()` resolves before the first frame is painted, so the fallback `if (!isVisible()) show()` always won the race and `ready-to-show` never did anything. Fixed by awaiting the paint with a 4 second timeout instead. Re-measured:

```
browser-window-created @+132ms
  visible-at-creation=false
ready-to-show  @+247ms
show           @+266ms
```

`npm run test:desktop` re-run after that change: 14 passed, 0 failed. The browser suite was not re-run, because `desktop/main.mjs` is not reachable from it.

## Still open

- **62 selectors defined across more than one file**, out of 1,023. This is the four-sheet override architecture, `styles.css` then `grok-theme.css` then `conversation.css` then `workspace-native.css` then `ui-polish.css` then `marketplace-polish.css`. Collapsing it is the single biggest remaining cleanup and the one that caused both wrong findings in this diagnosis. It needs visual verification that is not available here. Stylelint cannot see across files.
- **Breakpoints.** 27 width values, reverted after the regression above.
- **Streaming.** Untouched. `complete()` in `src/generation/providers.ts` is a single non-streaming function across five provider transports, and the engine consumes whole JSON responses that it validates against a schema, so partial JSON buys the engine nothing. The value is UI feedback during multi-minute calls, which needs a new SSE endpoint, a client transport and five SSE parsers. It cannot be verified without paid calls, which `AGENTS.md` gates behind per-run authorization.
- **`.primary` hover.** Not in the original diagnosis, found while renaming `--green`. The primary button is `--accent` (`#f4f4f4`, white) with `--accent-ink` text, and hovers to `#f0fa76`, a bright yellow-green. That is residue from when `--green` was actually green. White to bright yellow on hover is almost certainly unintended, but changing it is a design decision and it was left alone.
- **Bundle size.** `index.js` 713 KB, `TakkoViewport.js` 567 KB, CSS 126 KB. Only `DesignLab` and the viewport are split.

## Files changed

New: `src/web/tokens.css`, `.stylelintrc.json`, this report.

Modified: `src/web/App.tsx` and `main.tsx` (token import), `styles.css`, `grok-theme.css`, `ui-polish.css`, `conversation.css`, `workspace-native.css`, `settings-workspace.css`, `model-library.css`, `marketplace-polish.css`, `studio-connection.css`, `game-concept.css`, `asset-choices.css`, `focus.css`, `design-lab/design-lab.css`, `desktop/main.mjs`, `desktop/status.html`, `package.json`, `package-lock.json`, `docs/agent-context/orientation.md`, `src/web/fonts/README.md`.

No engine, server, provider, budget, Studio or generation code was touched.

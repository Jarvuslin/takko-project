# TODO: double-check for Astra

## Reviewed 2026-09-19

Review and fixes completed. See [the item-by-item findings and verification report](docs/todo-review-and-fixes.md). Fixed A1 through A5, B1, B7 and the constant-allocation part of B10. A4 was a latent naming issue. A6 and the remaining cleanup suggestions were assessed and left unchanged for the reasons in the report. Corrections include the App state-hook count, the non-interchangeable snapshot hash wrapper, and the fresh-checkout Luau claim.

Full `npm run check` passed: 1,285 unit/API tests, 10 desktop tests, 48 browser tests, and every other stage. No paid inference or native Studio work. Ports 4324 and 4336 were not restarted. The original diagnosis list and its earlier failures remain below unchanged as the historical record.

---

Independent verification list for a codebase inspection run on 2026-09-19 against branch `codex/marketplace-asset-library` at commit `7ab9332` plus uncommitted work.

**Nothing here is a fix. No source file was edited. This is a claim list to be checked.**

Each item states what was claimed, where, how strong the evidence is, how to reproduce, and what would falsify it. Treat "verified by reading" as a hypothesis, not a result. Treat "verified by execution" as one observation on one Windows machine, not a general proof.

## How to check these

```
npx tsc --noEmit
```

was the only gate run during the inspection and it passed. No vitest, luau, plugin, guards, desktop, production or e2e stage was run. Do not describe any item below as confirmed against the suite until you have run it.

Probes were written under `.forge/` and deleted afterward. Recreate them rather than trusting the transcripts.

Do not touch ports 4324 or 4336. Both were reported live and holding in-memory keys.

---

## Baseline facts to re-confirm first

If any of these are wrong, the items that follow are suspect.

- [ ] `npx tsc --noEmit` exits 0
- [ ] Zero `TODO`, `FIXME`, `HACK`, `XXX`, `@ts-ignore`, `@ts-expect-error` or `eslint-disable` markers in `src/`
- [ ] Exactly one `console.log` in `src/`, at `src/server/start.ts:27`
- [ ] 67 `.ts`/`.tsx` files under `src/`
- [ ] Import-reachability from `src/server/app.ts`, `src/server/start.ts`, `src/web/main.tsx`, plus every file in `tests/`, `scripts/` and `desktop/`, leaves exactly two unreached files: `src/server/store.ts` and `src/web/vite-env.d.ts`

---

## A. Defects

### A1. One bad project file prevents the server from booting

**Severity: highest. Reachable without any file corruption. Not currently triggered.**

Claim: `createApp()` throws and the process never serves if a single project JSON in the data directory is unreadable, or is a legacy record whose request is missing, empty or under 5 characters.

Chain to verify:

- `src/generation/store.ts:66` `get()` calls `JSON.parse` with no try/catch
- `src/generation/store.ts:74` migration calls `newProject(String(p.request ?? ""), 2_000_000)`
- `src/generation/store.ts:84` `list()` maps every matching file through `get()`
- `src/generation/store.ts:91` `recover()` iterates `this.list()`
- `src/generation/engine.ts:300` the `Engine` constructor calls `store.recover()`
- `src/server/app.ts:36` `new GenerationStore(directory)`, note the store root is `directory` itself, **not** `directory/projects`

`newProject` enforces `z.string().trim().min(5)`. `p.request ?? ""` converts a missing field to the empty string, so an absent `request` fails the same way.

Evidence: verified by execution. A probe seeded temp data directories and called `createApp(dir, {})`:

```
clean boot                        -> OK
truncated project json            -> THREW SyntaxError: Unterminated string in JSON
legacy project, normal request    -> OK
legacy project, empty request     -> THREW ZodError: too_small
legacy project, 3-char request    -> THREW ZodError: too_small
legacy project, no request field  -> THREW ZodError: too_small
```

- [ ] Reproduce the probe. Confirm `createApp` throws rather than returning
- [ ] Confirm `recover()` is genuinely on the constructor path and not lazily deferred
- [ ] Confirm the store root really is `directory` and not a subdirectory

**Exposure on this machine: 0 files affected.** A read-only scan of `.forge/` and `%LOCALAPPDATA%/Forge Desktop` found 70 real store roots, 1,746 project files, 4 legacy records, 0 unparseable, 0 boot-blocking.

- [ ] Re-run the exposure scan before scheduling this. It may have changed
- [ ] The scan **must exclude `traces/` subdirectories**. `trace()` at `src/generation/store.ts:47` writes `traces/<uuid>.json` holding event objects, not projects, and `list()` never reads them. A first scan that included them wrongly reported 286 at-risk files. Do not repeat that error

Secondary smell in the same method, worth confirming separately:

- [ ] `list()` is a read that writes. `get()` writes a `.legacy` backup and saves a migrated project mid-iteration

Falsified if: `createApp` catches this somewhere upstream, or `recover()` is not reached during construction.

### A2. The HTTP error handler has no 500 path and selects status by regex

Location: the error middleware at the tail of `src/server/app.ts`, roughly lines 332 to 360.

```js
error instanceof z.ZodError ? 400
  : /revision|approve|budget|configure|build|already|plan the|unresolved Studio operation/i.test(error.message) ? 409
  : /not found/i.test(error.message) ? 404 : 400
```

Three separate claims:

- [ ] There is no `500` response anywhere in `src/server/`. Every server fault is reported to the client as a client error
- [ ] Status is chosen by string-matching error prose, so an unrelated error containing "build" or "already" returns 409
- [ ] `error.message` is returned raw for non-Zod errors, leaking internal detail such as absolute paths from an `ENOENT`

Supporting claim: 11 typed error classes already exist and none are used by the handler. Confirm the list is `AssetOperationError`, `PipelineHalt`, `PersistenceHalt`, `AudioCandidateEvidenceError`, `GenerationFailure`, `InputRequired`, `AssetPipelineFailure`, `ProviderError`, `StudioAssetError`, `AudioRuntimeError`, `StudioMcpError`.

Evidence: verified by reading only. Not exercised against a live request.

- [ ] Send a request that triggers a genuine server fault and record the actual status and body

Note the link to A3: a corrupt cache file surfaces as `400 "Invalid request. Check the supplied fields."` for a request that was valid. That is the same mislabeling class `docs/marketplace-transfer-fix.md` was written to fix, reappearing at the top level. Confirm that reading of the doc before citing it.

### A3. `AssetLibrary.list()` breaks permanently on one malformed file

Location: `src/marketplace/library.ts:74-81`.

Evidence: verified by execution.

```
baseline list      -> [ '123' ]
after corrupt file -> THREW: Expected property name or '}' in JSON at position 2
after oversized id -> THREW: ZodError invalid_format
```

- [ ] Reproduce both rows
- [ ] Confirm the filter mismatch. `list()` line 77 accepts `/^[1-9]\d*\.json$/`, but `file()` at lines 46 to 48 validates through `assetIdSchema`, which also caps length at 16 digits and requires a safe integer. A 20-digit filename passes the first gate and throws at the second
- [ ] Confirm the non-null assertion at line 78, `this.get(f.slice(0, -5))!`, hides a TOCTOU window where the file disappears between `readdirSync` and `read`

Context worth weighing: `attachments()` at line 171 explicitly recomputes the verdict "rather than trusting an editable local JSON status field", so tampering is already in this module's threat model while `list()` assumes well-formed input.

Falsified if: callers already catch this, or the directory is guaranteed machine-written only.

### A4. `type Record` shadows the built-in `Record<K, V>`

Location: `src/marketplace/library.ts:27`.

- [ ] Confirm the declaration exists and that the TypeScript utility type is unreachable inside this module
- [ ] Confirm by adding a throwaway `const x: Record<string, number> = {}` in that file and checking the compiler reports "Type 'Record' is not generic". Remove it afterward

Latent only. Nothing in the file currently needs the utility type.

### A5. The UI poller can overwrite fresh state with stale state

Location: `src/web/App.tsx:717-741`.

`setInterval(refresh, 1500)` where `refresh` is async with up to two sequential awaits. The `active` flag guards unmount and dependency change, not ordering between two in-flight refreshes from the same effect instance.

- [ ] Confirm overlapping invocations are possible when a response exceeds 1500ms
- [ ] Confirm a slow earlier response can resolve last and call `setProject` with stale data
- [ ] Confirm `setError` at roughly line 734 makes any transient poll failure paint a banner that only `work()` clears

Evidence: verified by reading only. Not reproduced against a slow server.

This matters most during generation, which is exactly when the server is loaded.

### A6. Fixed temp filename, low priority

`src/generation/store.ts:61` writes to a fixed `file + ".tmp"`. `src/marketplace/library.ts:66` uses `randomUUID()` in the temp name.

- [ ] Confirm no in-process trigger exists. `writeFileSync` blocks and Node is single-threaded, so two saves cannot interleave within one process
- [ ] Decide whether two processes sharing one data directory is a real scenario here

Reported as a consistency gap, not a demonstrated bug. Do not escalate it without a reproduction.

---

## B. Cleanliness

### B1. `src/server/store.ts` is orphaned

- [ ] Confirm zero importers anywhere in `src/`, `tests/`, `scripts/`, `desktop/`
- [ ] Confirm it duplicates `GenerationStore` in `src/generation/store.ts`, which is what `engine.ts:26` and `bridge.ts:10` actually use
- [ ] Note the trap: grepping for `"./store"` inside `src/generation/` resolves to `src/generation/store.ts`, not this file. An earlier grep was misread because of this

### B2. `core/budget.ts` and `core/provider.ts` have no production consumer

- [ ] `getAdvice` at `src/core/provider.ts:14` is imported only by `tests/provider.test.ts`. It is the pre-Takko combat scoping call, still hardcoded to `cinder|jade|violet`
- [ ] `Budget` at `src/core/budget.ts:3` is imported only by `src/core/provider.ts` and two tests
- [ ] Confirm `Budget` duplicates accounting the engine already does inline at `src/generation/engine.ts:1066-1147` via `p.reservedMicros`, `p.charges` and `reserve`

**Do not delete `src/core/project.ts` or `src/core/recipe.ts`.** They are live:

- [ ] Confirm `scripts/export-sample.ts:2-3` imports them
- [ ] Confirm `scripts/test-luau.mjs:19` runs `export-sample` to produce `.forge/sample/*.luau`, then compiles those files
- [ ] Confirm `test:luau` is in the `npm run check` chain

Deleting them breaks the Luau compile gate. This caveat was the easiest thing to get wrong in the whole audit.

### B3. The sha256 one-liner is declared 13 times under 4 names

- [ ] `digest` at `benchmark/asset-execution.ts:16`, `benchmark/evidence-files.ts:7`, `component-archive.ts:12`
- [ ] `hash` at `benchmark/pairwise.ts:13`, `component-adaptation.ts:20`, `component-derivative.ts:12`, `component-integration.ts:16`, `component-preservation.ts:16`, `component-xml-conversion.ts:9`, `component-xml.ts:23`
- [ ] `sha` at `asset-pipeline.ts:114`, `component-review.ts:69`
- [ ] `snapshotHash` at `marketplace/inspection.ts:10`

Check whether the signatures really are interchangeable. Some take `string`, some take `string | Buffer`. A single shared helper must accept both.

### B4. Four divergent copies of the MCP envelope unwrapper

`unpack` at `audio-capture.ts:50`, `studio-asset-adapter.ts:115`, `studio-audio-runtime.ts:33`, and `unpackMarketplace` at `marketplace/studio.ts:17`.

- [ ] Confirm iteration caps differ: 5, 6, 6, 8
- [ ] Confirm `audio-capture.ts:55` calls `JSON.parse` without try/catch while the other three catch and return the string
- [ ] Confirm two filter `content` for text blocks and two require `content.length === 1`

**This is not a live bug.** The missing `isError` check in two copies is covered at the call sites, `studio-asset-adapter.ts:611` and `studio-audio-runtime.ts:98`. An earlier draft of this audit nearly reported it as a defect. Verify the call-site ordering yourself before consolidating, because a naive merge could remove a check that is load-bearing in one path and redundant in another.

### B5. `src/web/App.tsx` is 1980 lines holding three components

- [ ] `App()` at line 673 is 1308 lines with 25 `useState` calls and roughly 1100 lines of JSX
- [ ] `Models()` at line 43 is 542 lines
- [ ] Tab bodies inline at lines 1107 Brief, 1452 Build, 1547 Source, 1626 Studio
- [ ] `useAssetAttachments` in `Marketplace.tsx` is the existing hook pattern to follow

### B6. Roughly 243 lines of stale CSS in `src/web/styles.css`

8 classes with no markup in any `src/web` file or `index.html`: `plugin-card`, `plugin-card-action`, `ideas`, `explore-prompts`, `explore-icon`, `model-chip`, `sidebar-toggle`, `sidebar-expanded`.

Two corrections a naive sweep will get wrong. Check both before deleting anything:

- [ ] `.pending` is **live**, not dead. `App.tsx:1494` builds `"check-icon " + c.status`, and `Check["status"]` includes `"pending"` per `schema.ts:262`
- [ ] Rules written `.editor:not(.sidebar-expanded)` **always match**, precisely because the class is never applied. Deleting them changes rendering. They should have the `:not()` dropped and be merged, not removed. Affected: lines 707-735, 1608, 1626, 1936-2022, 2209-2234
- [ ] Only `.editor.sidebar-expanded` rules are genuinely unreachable: lines 1517, 1520, 1578, 1592, 1637

### B7. Four hardcoded Luau compiler paths ignore `LUAU_BIN_DIR`

Three conventions coexist:

- [ ] `process.env.LUAU_BIN_DIR ?? "research/tools/luau"` in six places
- [ ] `process.env.LUAU_BIN_DIR ?? ".forge/tools/luau"` at `runtime-source-check.ts:9`, a different default for the same tool
- [ ] Hardcoded, env ignored, at `tests/studio-asset-adapter.test.ts:1938`, `:1987`, `:2052` pinning `research/tools/luau`, and `tests/component-adaptation.test.ts:317` pinning `.forge/tools/luau/luau-compile.exe`

`AGENTS.md:33` tells a fresh checkout to set `LUAU_BIN_DIR = '.forge/tools/luau'`. Under those instructions the three `research/tools/luau` hardcodes are wrong, and `studio-asset-adapter.test.ts:2052` asserts `fs.existsSync(compiler)` is true, so it fails outright.

- [ ] Confirm both directories are currently populated on this machine, which is the only reason these pass today
- [ ] Confirm the literal `.exe` at `component-adaptation.test.ts:317` makes that test Windows-only

### B8. 475 lines of Luau embedded in `studio-asset-adapter.ts`

- [ ] Confirm 19% of the file sits inside template literals, with a 240-line block at lines 269 to 509
- [ ] Confirm `scripts/test-luau.mjs` compiles `tests/combat.luau` and `.forge/sample/**/*.luau` only, so it never touches these strings
- [ ] Coverage is **partial, not absent**. `tests/studio-asset-adapter.test.ts:1938` and `:1987` extract emitted scripts and compile them. Do not claim this Luau is untested

### B9. 37 of 46 files in `scripts/` have no live caller

Referenced only from `docs/` and `research/`. Mostly the one-off `verify-*` and `refine-*` probes.

- [ ] Keep `build-builtin-assets.mjs` and `build-roblox-capabilities.mjs`. They regenerate committed JSON data files
- [ ] Flag only. Deletion is the user's call under the AGENTS.md evidence-preservation rule

### B10. `inspectSnapshot` mixes levels and rebuilds a constant

Location: `src/marketplace/inspection.ts:16`, 105 lines.

- [ ] Confirm the 5-entry `rules` table is rebuilt on every invocation and is a module-level constant
- [ ] Confirm the function mixes coverage checks with per-script regex scanning

---

## C. Known errors made during this audit

Recorded so they are not repeated, per the AGENTS.md rule on preserving failures.

1. A first exposure scan counted `traces/*.json` event files as projects and reported **286 boot-blocking files**. The correct figure after excluding `traces/` is **0**. See A1.
2. A first boot probe seeded `dir/projects/` instead of `dir/`, so it reported a clean boot and appeared to disprove A1. The store root is `directory` itself.
3. A dead-export scan produced a false positive list naming almost every export, including `createApp`, `Engine` and `App`. Its regex was corrupted by shell heredoc escaping. Results were discarded and replaced with an import-reachability graph. Do not use heredocs for scripts containing backslash escapes.
4. B4 was nearly reported as a live bug before the call sites were checked.

## D. Not established

- No test suite was run beyond `tsc --noEmit`. Pass or fail state of vitest, luau, plugin, guards, desktop, production and e2e is unknown
- No item was fixed, and no fix was measured
- Severity ordering is a judgement, not a measurement
- The exposure scan covers this machine only, at one point in time

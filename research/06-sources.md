# Sources, provenance, and limitations

The follow-up generation-quality research has a separate [primary-source registry](09-generation-research-sources.md), covering context, prompt optimization, verification, test-time compute, cost accounting and current Roblox testing APIs. Its recommendations are proposed adaptations rather than findings about the unavailable backend.

All observations were collected on **2026-09-13** unless another date is explicitly stated. Search snippets and public metrics can lag the live page. Local snapshots preserve the reviewed build.

## Primary product evidence

| ID | Source | What it supports | Limits |
|---|---|---|---|
| P01 | [Lemonade homepage](https://lemonade.gg/) | Brand, prompt-first positioning, current public design, social/legal/careers links | Marketing is not a capability benchmark; 500K creators is a company claim |
| P02 | [User-supplied project](https://lemonade.gg/code/k57999whzvnpa7x4m93zjfekrh8ebbt7) | Identifies the intended project | Redirected to sign-in; project data not read |
| P03 | [Creator Store listing](https://create.roblox.com/store/asset/85716018250741/Lemonade-AI) | Official Lemonade Labs plugin, asset identity, listing details | Store update date does not identify exact installed source revision |
| P04 | Installed plugin copy | Executable source contracts, code paths, manifest and dependencies | Client only; may differ from team repository/head or other releases |
| P05 | [Privacy policy](https://lemonade.gg/privacy-policy) | Stated project/code storage policy, Polar payment processor | Policy statement is not observed backend retention behavior |
| P06 | [Terms](https://lemonade.gg/terms-of-service) | Subscription/payment structure | No current account-specific price/credit entitlement established |
| P07 | Public JavaScript/HTML linked from those pages | Next.js/React client, Clerk integration, homepage implementation | Does not include authenticated editor/agent server source |
| P08 | [Careers link](https://www.notion.so/Join-Lemonade-3347fbd021e480d58066c1613499bcff) | Official homepage links here | Contents unavailable through web fetch; no architecture inferred from it |

P04 original location: `C:\Users\7474g\AppData\Local\Roblox\11119876005\InstalledPlugins\85716018250741\68657693815716\Plugin.rbxm`.

The file was copied into `evidence/plugin/installed-68657693815716.rbxm`; original size **604,925 bytes**. Its SHA-256, 241 object count, chunk inventory, 216 source records, per-source hashes and hierarchy paths are in `evidence/plugin/source/manifest.json`. **137** source containers sit outside Packages/DevPackages; that classification is structural and is not an authorship claim. The asset contains **15** filenames including `.spec.`. Its manifest version is **2.2.4**.

The anonymous public asset download endpoint returned 401. No authentication bypass was attempted; analysis used the local installed copy. Plugin settings, browser credentials and unrelated local project contents were not collected.

P07 originals: `home.html`, `code.html`, `privacy.html` and 26 linked bundles. First collection URLs, sizes, final redirect URLs and hashes are in `evidence/web/manifest.json`. Prettier 3.6.2 generated separately stored formatted copies. No source-map URL was found in those downloaded bundles; this is not an exhaustive claim about all deployed assets.

## Provider and platform evidence

| ID | Source | Interpretation |
|---|---|---|
| X01 | [OpenRouter Lemonade application](https://openrouter.ai/apps/lemonade) | Primary provider's public attribution; strong lead on model usage, not internal routing or quality |
| X02 | [Convex limits](https://docs.convex.dev/production/state/limits) | Concurrency is bounded and depends on deployment class; Lemonade's class is unknown |
| X03 | [Roblox ScriptEditorService](https://create.roblox.com/docs/reference/engine/classes/ScriptEditorService) | Supported editor-source/update interfaces for the proposed edit contract |
| X04 | [Roblox RunService](https://create.roblox.com/docs/reference/engine/classes/RunService) | Run/Stop API context; a running simulation is not an acceptance assertion |
| X05 | [rbx-dom binary format](https://github.com/rojo-rbx/rbx-dom/blob/master/docs/binary.md) | Implementer-authored format reference used for extraction |
| X06 | [Luau 0.738 release](https://github.com/luau-lang/luau/releases/tag/0.738) | Official CLI used for isolated probes |

Live rendered X01 observation: headline **1.13T** total tokens, **35** models used, active since December 2025, and a last-30-days usage chart. The displayed top-model table included GPT-5.6 Luna **823B**, Hy3 **126B**, Gemini 3.7 Flash **113B**, Ox Alpha **39.6B**, GLM 5.3 Flash **12B**, Gemini 3 Flash Preview **7.55B**, Grok 4.5 **4.12B**, and Claude Opus 4.6 **2.04B** tokens. These are time-sensitive rounded page values. Search-index values differed; use the live snapshot. Do not treat the headline as lifetime spend or the model table as a count of requests. Attribution does not establish all of Lemonade's direct-provider usage.

Rendered P03 observation: Lemonade Labs; 88% with approximately 10K votes; 2,351 reviews; created August 3, 2025; updated September 1, 2026. Counts are dynamic. These are adoption/listing signals, not a controlled quality evaluation.

## Open-source search

- The local manifest names `lemonade-rbx/lemonade`, marks the package private, and contains Apache-2.0 metadata. [The candidate GitHub repository](https://github.com/lemonade-rbx/lemonade) was not publicly retrievable; GitHub's unauthenticated repository API returned 404, saved as `github-lemonade-repo.json`. This does not establish whether it is private, renamed, or nonexistent.
- [RoClaude](https://github.com/MarcelCodingAT/RoClaude) is an independent MIT-licensed implementation inspired by Lemonade's workflow. Its published architecture describes a local MCP server, Studio plugin and command queue. It is a reference implementation, **not Lemonade's source or proof of Lemonade's backend**. Architecture and license snapshots were saved.
- [Silverfox0338's starter guide](https://github.com/Silverfox0338/lemonade-starterguide) is a community guide, not the product's source repository. Its older descriptions/pricing are leads only; current plugin source supersedes older feature limitations.
- [lemonade-sdk/lemonade](https://github.com/lemonade-sdk/lemonade) is an unrelated local inference server. Excluded from product architecture findings.

No authoritative public backend repository was found in this scoped search. This is not a guarantee that none exists.

## Secondary feedback

[Trustpilot reviews](https://www.trustpilot.com/review/lemonade.gg) include reports about credit consumption, broken game changes, and useful results. They are small, self-selected anecdotes with unknown versions and reproducibility. Creator Store search results also surfaced connection/version complaints. These informed potential benchmark categories but were not used to prove technical root causes. Unsupported claims about account compromise were not adopted as findings.

## Research method

The audit-context-building skill guided bottom-up module and state tracing. Its referenced `OUTPUT_REQUIREMENTS.md` and `COMPLETENESS_CHECKLIST.md` files were missing at the listed location; the main skill's explicit structure was used directly. The analysis scopes are documented in `notes/code-trace.md`. It is not a claim of line-by-line review of all 216 extracted source containers or a completed security audit.

No purchase, generation submission, external message, backend mutation, plugin installation/update, or change to the current Studio DataModel occurred. Public HTTP retrievals, browser inspection, local source extraction, and mocked CLI probes were used.

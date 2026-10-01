# Documentation map

Read [current state](../research/notes/continuation.md) first. It is the sole authority for live processes, budgets and paused work.

## Current documents

- [Final bounded evaluation](results/final-evaluation/RESULTS.md): production changes, five paid attempts, zero accepted games, infrastructure confounds and reconciled $0.92562963 cost under the $5 cap.
- [Generation diagnostic brief](generation-diagnostic-brief.md): architecture, models, versions, failure history and spend, written for a fresh diagnosing agent.
- [Model history and game-building research](../research/25-next-models-lemonade-forgegui.md): audited live model tests, Roblox competitor attribution, Unity/Unreal/Godot evidence, community reports and a priced candidate shortlist.
- [Guided demo rehearsal](guided-demo-rehearsal.md): a manually repaired fighting demo tested in a reopened Studio export, asset decisions, reproducible failures and architecture lessons. Not an automated Takko success or measured provider-cost improvement.
- [Desktop](desktop.md): launch, storage, service lifecycle and credentials.
- [Maintenance](repository-maintenance.md): what to keep, where output belongs and how to recover history.
- [Cleanup](cleanup.md): removals, retained uncertain files and verification.
- [Improvement plan](improvement-plan.md): next work, including app/workspace consolidation and generation reliability.
- [Chat and asset implementation](chat-clean-20260929.md) and [flow design](flow-redesign.md): latest implementation record, not confirmation of successful real generation.
- [OpenCode adapter](opencode-adapter-implementation.md) and [comparison](opencode-competitor-reevaluation.md): current coding integration and the earlier warning about keeping duplicate planning loops.
- [Trial-failure diagnosis and candidate gate](results/trial-failure-diagnosis/PLAN.md): protected review budget, native role evidence and isolated staged rehearsal. Includes the reviewable D1 proposal and verification limits.
- [Asset generalization](results/generalization/RESULTS.md): native role gates, user-reviewed animation timing, general attack contracts and preregistered holdout validation.
- [Scene-reference regression](scene-reference-fix.md), [Studio acceptance](studio-acceptance.md) and [native acceptance](native-generation-acceptance.md): native evidence and its limits.
- [Crystal Hollow native record](crystal-hollow-polished-native-verification.md): retained because the benchmark catalog references it.

## Source map

| Path | Responsibility |
| --- | --- |
| `src/server/` | Local API, provider connections and service startup |
| `src/generation/` | Proposal, planning, generation, persistence, export and Studio integration |
| `src/core/` | Budget and shared domain behavior |
| `src/marketplace/` | Search, saved assets and static inspection |
| `src/web/` | Desktop interface |
| `desktop/` | Electron lifecycle, workspace identity and packaging |
| `plugin/Forge.plugin.luau` | Namespaced Studio apply/test bridge |
| `tests/`, `desktop/tests/` | Automated checks |
| `scripts/` | Build/test tools and retained diagnostic utilities |
| `benchmarks/` | Quality definitions and recorded runs |
| `research/` | Research findings and source evidence |

## Historical records

Older task reports were removed from the working tree after committing them. Read them at [the pre-cleanup snapshot](https://github.com/Jarvuslin/takko-project/tree/4622b0f/docs), or locally with `git show 4622b0f:docs/<filename>.md`. The commit is local until explicitly pushed, so local Git is the reliable recovery method.

`docs/results/`, `research/results/` and `benchmarks/runs/` retain original observations, failures, receipts and regression inputs. They are historical records, not startup documentation. Relative paths inside those records refer to the repository layout at their recorded commit. Do not duplicate them before tests. New routine check output goes in ignored `test-artifacts/`.

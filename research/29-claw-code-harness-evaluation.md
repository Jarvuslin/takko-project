# Claw Code harness evaluation

2026-09-19. [Detailed evaluation and implementation priorities](https://github.com/Jarvuslin/takko-project/blob/4622b0f/docs/claw-code-evaluation.md).

Useful ideas for Takko are request fingerprint and size diagnostics, explicit provider capabilities, task verification contracts, bounded tool feedback inside difficult repairs, and correlated attempt records. Takko already has stable context ordering, cache-read usage, scoped tasks, protected acceptance scenarios, budget reservations and recovery records. Recommendations extend those mechanisms.

Evaluated the current public Rust implementation at [`08106b0c3771ef5b4a5aa176acccd460e88b7325`](https://github.com/ultraworkers/claw-code/tree/08106b0c3771ef5b4a5aa176acccd460e88b7325). This is not authentication of the original Claude Code leak or evidence of Anthropic production behavior. The current README describes an agent-managed exhibit and disclaims ownership of original Claude Code material.

Do not transplant lossy compaction, the effectively unbounded main conversation default, fixed family pricing or local answer replay. `RunTaskPacket` registers metadata while a separate `Agent` path executes jobs. The inspected ToolSearch path still sends all allowed tool definitions. The prompt boundary marker does not establish provider cache savings. These distinctions come from source paths, not feature checklists.

Preferred first change: lossless context and capability diagnostics using the saved V15 packet and offline provider mocks. No implementation or new model experiment was performed in this review.

Evidence: 86 original files, 4,623,630 bytes, with all SHA-256 and Git blob checks matching. Preserved under ignored `research/evidence/claw-code-20260919/`, alongside an eleven-file Takko comparison snapshot. [Verification record](results/claw-code-review-20260919/verification.json). Downloaded code was not executed. Zero application tests, paid calls or Studio operations. Cost $0. No gameplay, relative model quality or cost improvement was measured.

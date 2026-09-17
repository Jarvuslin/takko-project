# Agent architecture source index

Collected September 16, 2026. Public repository metadata and pinned raw files; downloaded code was not executed. The report uses focused implementation inspection, not a full repository audit.

The user-supplied Spacebot URL returned 404. The official https://spacebot.sh/ Self-host link resolved to `spacedriveapp/spacebot`; its metadata is preserved separately from the original failed lookup. Goose resolves to `aaif-goose/goose`; OpenHands resolves to `OpenHands/OpenHands`. The linked OpenHands SDK is a companion source, not an extra replacement recommendation.

The manifest records each full SHA-256 and byte count. Root licenses and maintenance notices are discussed in [the report](../23-agent-architecture-comparison.md).

## anomalyco/opencode

Commit: [e03db9bc6908f75c9334d8aa997deeaac81c0298](https://github.com/anomalyco/opencode/commit/e03db9bc6908f75c9334d8aa997deeaac81c0298); committed 2026-09-14T21:41:36Z; default branch dev; GitHub archived flag false.

- [LICENSE](<https://github.com/anomalyco/opencode/blob/e03db9bc6908f75c9334d8aa997deeaac81c0298/LICENSE>) — [local snapshot](<../evidence/agent-architecture-20260916/anomalyco--opencode/files/LICENSE>), 1065 bytes.
- [README.md](<https://github.com/anomalyco/opencode/blob/e03db9bc6908f75c9334d8aa997deeaac81c0298/README.md>) — [local snapshot](<../evidence/agent-architecture-20260916/anomalyco--opencode/files/README.md>), 5402 bytes.
- [packages/opencode/src/session/processor.ts](<https://github.com/anomalyco/opencode/blob/e03db9bc6908f75c9334d8aa997deeaac81c0298/packages/opencode/src/session/processor.ts>) — [local snapshot](<../evidence/agent-architecture-20260916/anomalyco--opencode/files/packages/opencode/src/session/processor.ts>), 27266 bytes.
- [packages/opencode/src/session/compaction.ts](<https://github.com/anomalyco/opencode/blob/e03db9bc6908f75c9334d8aa997deeaac81c0298/packages/opencode/src/session/compaction.ts>) — [local snapshot](<../evidence/agent-architecture-20260916/anomalyco--opencode/files/packages/opencode/src/session/compaction.ts>), 21236 bytes.
- [packages/opencode/src/agent/agent.ts](<https://github.com/anomalyco/opencode/blob/e03db9bc6908f75c9334d8aa997deeaac81c0298/packages/opencode/src/agent/agent.ts>) — [local snapshot](<../evidence/agent-architecture-20260916/anomalyco--opencode/files/packages/opencode/src/agent/agent.ts>), 16746 bytes.
- [packages/opencode/src/permission/evaluate.ts](<https://github.com/anomalyco/opencode/blob/e03db9bc6908f75c9334d8aa997deeaac81c0298/packages/opencode/src/permission/evaluate.ts>) — [local snapshot](<../evidence/agent-architecture-20260916/anomalyco--opencode/files/packages/opencode/src/permission/evaluate.ts>), 29 bytes.
- [packages/opencode/test/session/compaction.test.ts](<https://github.com/anomalyco/opencode/blob/e03db9bc6908f75c9334d8aa997deeaac81c0298/packages/opencode/test/session/compaction.test.ts>) — [local snapshot](<../evidence/agent-architecture-20260916/anomalyco--opencode/files/packages/opencode/test/session/compaction.test.ts>), 69163 bytes.
- [packages/opencode/src/permission/index.ts](<https://github.com/anomalyco/opencode/blob/e03db9bc6908f75c9334d8aa997deeaac81c0298/packages/opencode/src/permission/index.ts>) — [local snapshot](<../evidence/agent-architecture-20260916/anomalyco--opencode/files/packages/opencode/src/permission/index.ts>), 7861 bytes.

## cline/cline

Commit: [82b8e1fa0471f728e3d9540fd19aa063e2049497](https://github.com/cline/cline/commit/82b8e1fa0471f728e3d9540fd19aa063e2049497); committed 2026-09-15T18:57:30Z; default branch main; GitHub archived flag false.

- [LICENSE](<https://github.com/cline/cline/blob/82b8e1fa0471f728e3d9540fd19aa063e2049497/LICENSE>) — [local snapshot](<../evidence/agent-architecture-20260916/cline--cline/files/LICENSE>), 11344 bytes.
- [README.md](<https://github.com/cline/cline/blob/82b8e1fa0471f728e3d9540fd19aa063e2049497/README.md>) — [local snapshot](<../evidence/agent-architecture-20260916/cline--cline/files/README.md>), 9239 bytes.
- [sdk/packages/core/src/extensions/context/basic-compaction.ts](<https://github.com/cline/cline/blob/82b8e1fa0471f728e3d9540fd19aa063e2049497/sdk/packages/core/src/extensions/context/basic-compaction.ts>) — [local snapshot](<../evidence/agent-architecture-20260916/cline--cline/files/sdk/packages/core/src/extensions/context/basic-compaction.ts>), 21984 bytes.
- [sdk/packages/core/src/extensions/context/agentic-compaction.ts](<https://github.com/cline/cline/blob/82b8e1fa0471f728e3d9540fd19aa063e2049497/sdk/packages/core/src/extensions/context/agentic-compaction.ts>) — [local snapshot](<../evidence/agent-architecture-20260916/cline--cline/files/sdk/packages/core/src/extensions/context/agentic-compaction.ts>), 10243 bytes.
- [sdk/packages/core/src/extensions/tools/runtime.ts](<https://github.com/cline/cline/blob/82b8e1fa0471f728e3d9540fd19aa063e2049497/sdk/packages/core/src/extensions/tools/runtime.ts>) — [local snapshot](<../evidence/agent-architecture-20260916/cline--cline/files/sdk/packages/core/src/extensions/tools/runtime.ts>), 9363 bytes.
- [sdk/packages/core/src/extensions/tools/executors/output-limits.ts](<https://github.com/cline/cline/blob/82b8e1fa0471f728e3d9540fd19aa063e2049497/sdk/packages/core/src/extensions/tools/executors/output-limits.ts>) — [local snapshot](<../evidence/agent-architecture-20260916/cline--cline/files/sdk/packages/core/src/extensions/tools/executors/output-limits.ts>), 2072 bytes.
- [sdk/packages/core/src/extensions/tools/team/delegated-agent.ts](<https://github.com/cline/cline/blob/82b8e1fa0471f728e3d9540fd19aa063e2049497/sdk/packages/core/src/extensions/tools/team/delegated-agent.ts>) — [local snapshot](<../evidence/agent-architecture-20260916/cline--cline/files/sdk/packages/core/src/extensions/tools/team/delegated-agent.ts>), 4461 bytes.
- [sdk/packages/core/src/runtime/safety/loop-detection.ts](<https://github.com/cline/cline/blob/82b8e1fa0471f728e3d9540fd19aa063e2049497/sdk/packages/core/src/runtime/safety/loop-detection.ts>) — [local snapshot](<../evidence/agent-architecture-20260916/cline--cline/files/sdk/packages/core/src/runtime/safety/loop-detection.ts>), 4900 bytes.
- [sdk/packages/core/src/hooks/checkpoint-hooks.ts](<https://github.com/cline/cline/blob/82b8e1fa0471f728e3d9540fd19aa063e2049497/sdk/packages/core/src/hooks/checkpoint-hooks.ts>) — [local snapshot](<../evidence/agent-architecture-20260916/cline--cline/files/sdk/packages/core/src/hooks/checkpoint-hooks.ts>), 23085 bytes.
- [sdk/packages/core/src/extensions/tools/model-tool-routing.ts](<https://github.com/cline/cline/blob/82b8e1fa0471f728e3d9540fd19aa063e2049497/sdk/packages/core/src/extensions/tools/model-tool-routing.ts>) — [local snapshot](<../evidence/agent-architecture-20260916/cline--cline/files/sdk/packages/core/src/extensions/tools/model-tool-routing.ts>), 3192 bytes.
- [sdk/packages/core/src/extensions/tools/executors/apply-patch.ts](<https://github.com/cline/cline/blob/82b8e1fa0471f728e3d9540fd19aa063e2049497/sdk/packages/core/src/extensions/tools/executors/apply-patch.ts>) — [local snapshot](<../evidence/agent-architecture-20260916/cline--cline/files/sdk/packages/core/src/extensions/tools/executors/apply-patch.ts>), 11453 bytes.
- [sdk/packages/core/src/runtime/tools/tool-approval.ts](<https://github.com/cline/cline/blob/82b8e1fa0471f728e3d9540fd19aa063e2049497/sdk/packages/core/src/runtime/tools/tool-approval.ts>) — [local snapshot](<../evidence/agent-architecture-20260916/cline--cline/files/sdk/packages/core/src/runtime/tools/tool-approval.ts>), 2597 bytes.

## aaif-goose/goose

Commit: [df1e2850c21e012689b4e5606ec4b5eac486de91](https://github.com/aaif-goose/goose/commit/df1e2850c21e012689b4e5606ec4b5eac486de91); committed 2026-09-16T04:22:39Z; default branch main; GitHub archived flag false.

- [LICENSE](<https://github.com/aaif-goose/goose/blob/df1e2850c21e012689b4e5606ec4b5eac486de91/LICENSE>) — [local snapshot](<../evidence/agent-architecture-20260916/block--goose/files/LICENSE>), 11341 bytes.
- [README.md](<https://github.com/aaif-goose/goose/blob/df1e2850c21e012689b4e5606ec4b5eac486de91/README.md>) — [local snapshot](<../evidence/agent-architecture-20260916/block--goose/files/README.md>), 3449 bytes.
- [crates/goose/src/agents/state_machine/mod.rs](<https://github.com/aaif-goose/goose/blob/df1e2850c21e012689b4e5606ec4b5eac486de91/crates/goose/src/agents/state_machine/mod.rs>) — [local snapshot](<../evidence/agent-architecture-20260916/block--goose/files/crates/goose/src/agents/state_machine/mod.rs>), 2785 bytes.
- [crates/goose/src/agents/state_machine/ops_tool_pair_compaction.rs](<https://github.com/aaif-goose/goose/blob/df1e2850c21e012689b4e5606ec4b5eac486de91/crates/goose/src/agents/state_machine/ops_tool_pair_compaction.rs>) — [local snapshot](<../evidence/agent-architecture-20260916/block--goose/files/crates/goose/src/agents/state_machine/ops_tool_pair_compaction.rs>), 5652 bytes.
- [crates/goose/src/agents/state_machine/ops_compaction.rs](<https://github.com/aaif-goose/goose/blob/df1e2850c21e012689b4e5606ec4b5eac486de91/crates/goose/src/agents/state_machine/ops_compaction.rs>) — [local snapshot](<../evidence/agent-architecture-20260916/block--goose/files/crates/goose/src/agents/state_machine/ops_compaction.rs>), 10578 bytes.
- [crates/goose/src/agents/large_response_handler.rs](<https://github.com/aaif-goose/goose/blob/df1e2850c21e012689b4e5606ec4b5eac486de91/crates/goose/src/agents/large_response_handler.rs>) — [local snapshot](<../evidence/agent-architecture-20260916/block--goose/files/crates/goose/src/agents/large_response_handler.rs>), 10038 bytes.
- [documentation/docs/guides/recipes/recipe-reference.md](<https://github.com/aaif-goose/goose/blob/df1e2850c21e012689b4e5606ec4b5eac486de91/documentation/docs/guides/recipes/recipe-reference.md>) — [local snapshot](<../evidence/agent-architecture-20260916/block--goose/files/documentation/docs/guides/recipes/recipe-reference.md>), 32594 bytes.
- [crates/goose-context-management/src/structured.rs](<https://github.com/aaif-goose/goose/blob/df1e2850c21e012689b4e5606ec4b5eac486de91/crates/goose-context-management/src/structured.rs>) — [local snapshot](<../evidence/agent-architecture-20260916/block--goose/files/crates/goose-context-management/src/structured.rs>), 19773 bytes.

## Aider-AI/aider

Commit: [5dc9490bb35f9729ef2c95d00a19ccd30c26339c](https://github.com/Aider-AI/aider/commit/5dc9490bb35f9729ef2c95d00a19ccd30c26339c); committed 2026-05-22T14:02:20Z; default branch main; GitHub archived flag false.

- [LICENSE.txt](<https://github.com/Aider-AI/aider/blob/5dc9490bb35f9729ef2c95d00a19ccd30c26339c/LICENSE.txt>) — [local snapshot](<../evidence/agent-architecture-20260916/Aider-AI--aider/files/LICENSE.txt>), 11358 bytes.
- [README.md](<https://github.com/Aider-AI/aider/blob/5dc9490bb35f9729ef2c95d00a19ccd30c26339c/README.md>) — [local snapshot](<../evidence/agent-architecture-20260916/Aider-AI--aider/files/README.md>), 12406 bytes.
- [aider/repomap.py](<https://github.com/Aider-AI/aider/blob/5dc9490bb35f9729ef2c95d00a19ccd30c26339c/aider/repomap.py>) — [local snapshot](<../evidence/agent-architecture-20260916/Aider-AI--aider/files/aider/repomap.py>), 27306 bytes.
- [aider/coders/architect_coder.py](<https://github.com/Aider-AI/aider/blob/5dc9490bb35f9729ef2c95d00a19ccd30c26339c/aider/coders/architect_coder.py>) — [local snapshot](<../evidence/agent-architecture-20260916/Aider-AI--aider/files/aider/coders/architect_coder.py>), 1622 bytes.
- [aider/coders/editblock_coder.py](<https://github.com/Aider-AI/aider/blob/5dc9490bb35f9729ef2c95d00a19ccd30c26339c/aider/coders/editblock_coder.py>) — [local snapshot](<../evidence/agent-architecture-20260916/Aider-AI--aider/files/aider/coders/editblock_coder.py>), 19616 bytes.
- [tests/basic/test_repomap.py](<https://github.com/Aider-AI/aider/blob/5dc9490bb35f9729ef2c95d00a19ccd30c26339c/tests/basic/test_repomap.py>) — [local snapshot](<../evidence/agent-architecture-20260916/Aider-AI--aider/files/tests/basic/test_repomap.py>), 18820 bytes.

## SWE-agent/SWE-agent

Commit: [3ea751c087f32b16e039a2233dd6eefecef325d5](https://github.com/SWE-agent/SWE-agent/commit/3ea751c087f32b16e039a2233dd6eefecef325d5); committed 2026-07-16T15:21:18Z; default branch main; GitHub archived flag false.

- [LICENSE](<https://github.com/SWE-agent/SWE-agent/blob/3ea751c087f32b16e039a2233dd6eefecef325d5/LICENSE>) — [local snapshot](<../evidence/agent-architecture-20260916/SWE-agent--SWE-agent/files/LICENSE>), 1147 bytes.
- [README.md](<https://github.com/SWE-agent/SWE-agent/blob/3ea751c087f32b16e039a2233dd6eefecef325d5/README.md>) — [local snapshot](<../evidence/agent-architecture-20260916/SWE-agent--SWE-agent/files/README.md>), 8158 bytes.
- [sweagent/agent/agents.py](<https://github.com/SWE-agent/SWE-agent/blob/3ea751c087f32b16e039a2233dd6eefecef325d5/sweagent/agent/agents.py>) — [local snapshot](<../evidence/agent-architecture-20260916/SWE-agent--SWE-agent/files/sweagent/agent/agents.py>), 55804 bytes.
- [sweagent/agent/history_processors.py](<https://github.com/SWE-agent/SWE-agent/blob/3ea751c087f32b16e039a2233dd6eefecef325d5/sweagent/agent/history_processors.py>) — [local snapshot](<../evidence/agent-architecture-20260916/SWE-agent--SWE-agent/files/sweagent/agent/history_processors.py>), 14869 bytes.
- [tests/test_history_processors.py](<https://github.com/SWE-agent/SWE-agent/blob/3ea751c087f32b16e039a2233dd6eefecef325d5/tests/test_history_processors.py>) — [local snapshot](<../evidence/agent-architecture-20260916/SWE-agent--SWE-agent/files/tests/test_history_processors.py>), 1437 bytes.

## SWE-agent/mini-swe-agent

Commit: [04d809ceab9df28f9adaed044884180159172930](https://github.com/SWE-agent/mini-swe-agent/commit/04d809ceab9df28f9adaed044884180159172930); committed 2026-09-03T05:05:59Z; default branch main; GitHub archived flag false.

- [LICENSE.md](<https://github.com/SWE-agent/mini-swe-agent/blob/04d809ceab9df28f9adaed044884180159172930/LICENSE.md>) — [local snapshot](<../evidence/agent-architecture-20260916/SWE-agent--mini-swe-agent/files/LICENSE.md>), 1094 bytes.
- [README.md](<https://github.com/SWE-agent/mini-swe-agent/blob/04d809ceab9df28f9adaed044884180159172930/README.md>) — [local snapshot](<../evidence/agent-architecture-20260916/SWE-agent--mini-swe-agent/files/README.md>), 11106 bytes.
- [src/minisweagent/agents/default.py](<https://github.com/SWE-agent/mini-swe-agent/blob/04d809ceab9df28f9adaed044884180159172930/src/minisweagent/agents/default.py>) — [local snapshot](<../evidence/agent-architecture-20260916/SWE-agent--mini-swe-agent/files/src/minisweagent/agents/default.py>), 8043 bytes.
- [src/minisweagent/environments/local.py](<https://github.com/SWE-agent/mini-swe-agent/blob/04d809ceab9df28f9adaed044884180159172930/src/minisweagent/environments/local.py>) — [local snapshot](<../evidence/agent-architecture-20260916/SWE-agent--mini-swe-agent/files/src/minisweagent/environments/local.py>), 3617 bytes.
- [src/minisweagent/config/default.yaml](<https://github.com/SWE-agent/mini-swe-agent/blob/04d809ceab9df28f9adaed044884180159172930/src/minisweagent/config/default.yaml>) — [local snapshot](<../evidence/agent-architecture-20260916/SWE-agent--mini-swe-agent/files/src/minisweagent/config/default.yaml>), 5829 bytes.
- [tests/agents/test_default.py](<https://github.com/SWE-agent/mini-swe-agent/blob/04d809ceab9df28f9adaed044884180159172930/tests/agents/test_default.py>) — [local snapshot](<../evidence/agent-architecture-20260916/SWE-agent--mini-swe-agent/files/tests/agents/test_default.py>), 20154 bytes.

## SWE-agent/SWE-ReX

Commit: [5c995c365dfb1fd5bc56fda688be5d8538f9931f](https://github.com/SWE-agent/SWE-ReX/commit/5c995c365dfb1fd5bc56fda688be5d8538f9931f); committed 2026-03-02T22:43:36Z; default branch main; GitHub archived flag false.

- [LICENSE.txt](<https://github.com/SWE-agent/SWE-ReX/blob/5c995c365dfb1fd5bc56fda688be5d8538f9931f/LICENSE.txt>) — [local snapshot](<../evidence/agent-architecture-20260916/SWE-agent--SWE-ReX/files/LICENSE.txt>), 1089 bytes.
- [README.md](<https://github.com/SWE-agent/SWE-ReX/blob/5c995c365dfb1fd5bc56fda688be5d8538f9931f/README.md>) — [local snapshot](<../evidence/agent-architecture-20260916/SWE-agent--SWE-ReX/files/README.md>), 4258 bytes.
- [src/swerex/runtime/abstract.py](<https://github.com/SWE-agent/SWE-ReX/blob/5c995c365dfb1fd5bc56fda688be5d8538f9931f/src/swerex/runtime/abstract.py>) — [local snapshot](<../evidence/agent-architecture-20260916/SWE-agent--SWE-ReX/files/src/swerex/runtime/abstract.py>), 8492 bytes.
- [src/swerex/runtime/remote.py](<https://github.com/SWE-agent/SWE-ReX/blob/5c995c365dfb1fd5bc56fda688be5d8538f9931f/src/swerex/runtime/remote.py>) — [local snapshot](<../evidence/agent-architecture-20260916/SWE-agent--SWE-ReX/files/src/swerex/runtime/remote.py>), 11427 bytes.
- [src/swerex/runtime/local.py](<https://github.com/SWE-agent/SWE-ReX/blob/5c995c365dfb1fd5bc56fda688be5d8538f9931f/src/swerex/runtime/local.py>) — [local snapshot](<../evidence/agent-architecture-20260916/SWE-agent--SWE-ReX/files/src/swerex/runtime/local.py>), 19275 bytes.
- [src/swerex/deployment/abstract.py](<https://github.com/SWE-agent/SWE-ReX/blob/5c995c365dfb1fd5bc56fda688be5d8538f9931f/src/swerex/deployment/abstract.py>) — [local snapshot](<../evidence/agent-architecture-20260916/SWE-agent--SWE-ReX/files/src/swerex/deployment/abstract.py>), 1764 bytes.

## OpenHands/OpenHands

Commit: [82203bb1011cdf0e6eb318a32111806a6f6f734a](https://github.com/OpenHands/OpenHands/commit/82203bb1011cdf0e6eb318a32111806a6f6f734a); committed 2026-09-15T04:51:14Z; default branch main; GitHub archived flag false.

- [LICENSE](<https://github.com/OpenHands/OpenHands/blob/82203bb1011cdf0e6eb318a32111806a6f6f734a/LICENSE>) — [local snapshot](<../evidence/agent-architecture-20260916/All-Hands-AI--OpenHands/files/LICENSE>), 1096 bytes.
- [README.md](<https://github.com/OpenHands/OpenHands/blob/82203bb1011cdf0e6eb318a32111806a6f6f734a/README.md>) — [local snapshot](<../evidence/agent-architecture-20260916/All-Hands-AI--OpenHands/files/README.md>), 10126 bytes.
- [package.json](<https://github.com/OpenHands/OpenHands/blob/82203bb1011cdf0e6eb318a32111806a6f6f734a/package.json>) — [local snapshot](<../evidence/agent-architecture-20260916/All-Hands-AI--OpenHands/files/package.json>), 9494 bytes.
- [scripts/check-sdk-version-sync.mjs](<https://github.com/OpenHands/OpenHands/blob/82203bb1011cdf0e6eb318a32111806a6f6f734a/scripts/check-sdk-version-sync.mjs>) — [local snapshot](<../evidence/agent-architecture-20260916/All-Hands-AI--OpenHands/files/scripts/check-sdk-version-sync.mjs>), 16665 bytes.

## OpenHands/software-agent-sdk

Commit: [22c85eb0e0db8f4386380d095e9fe6933af2e65f](https://github.com/OpenHands/software-agent-sdk/commit/22c85eb0e0db8f4386380d095e9fe6933af2e65f); committed 2026-09-16T03:19:19Z; default branch main; GitHub archived flag false.

- [LICENSE](<https://github.com/OpenHands/software-agent-sdk/blob/22c85eb0e0db8f4386380d095e9fe6933af2e65f/LICENSE>) — [local snapshot](<../evidence/agent-architecture-20260916/OpenHands--software-agent-sdk/files/LICENSE>), 1079 bytes.
- [README.md](<https://github.com/OpenHands/software-agent-sdk/blob/22c85eb0e0db8f4386380d095e9fe6933af2e65f/README.md>) — [local snapshot](<../evidence/agent-architecture-20260916/OpenHands--software-agent-sdk/files/README.md>), 10835 bytes.
- [openhands-sdk/openhands/sdk/conversation/event_store.py](<https://github.com/OpenHands/software-agent-sdk/blob/22c85eb0e0db8f4386380d095e9fe6933af2e65f/openhands-sdk/openhands/sdk/conversation/event_store.py>) — [local snapshot](<../evidence/agent-architecture-20260916/OpenHands--software-agent-sdk/files/openhands-sdk/openhands/sdk/conversation/event_store.py>), 14192 bytes.
- [openhands-sdk/openhands/sdk/conversation/state.py](<https://github.com/OpenHands/software-agent-sdk/blob/22c85eb0e0db8f4386380d095e9fe6933af2e65f/openhands-sdk/openhands/sdk/conversation/state.py>) — [local snapshot](<../evidence/agent-architecture-20260916/OpenHands--software-agent-sdk/files/openhands-sdk/openhands/sdk/conversation/state.py>), 32638 bytes.
- [openhands-sdk/openhands/sdk/conversation/stuck_detector.py](<https://github.com/OpenHands/software-agent-sdk/blob/22c85eb0e0db8f4386380d095e9fe6933af2e65f/openhands-sdk/openhands/sdk/conversation/stuck_detector.py>) — [local snapshot](<../evidence/agent-architecture-20260916/OpenHands--software-agent-sdk/files/openhands-sdk/openhands/sdk/conversation/stuck_detector.py>), 14399 bytes.
- [openhands-sdk/openhands/sdk/event/types.py](<https://github.com/OpenHands/software-agent-sdk/blob/22c85eb0e0db8f4386380d095e9fe6933af2e65f/openhands-sdk/openhands/sdk/event/types.py>) — [local snapshot](<../evidence/agent-architecture-20260916/OpenHands--software-agent-sdk/files/openhands-sdk/openhands/sdk/event/types.py>), 596 bytes.
- [openhands-sdk/openhands/sdk/tool/schema.py](<https://github.com/OpenHands/software-agent-sdk/blob/22c85eb0e0db8f4386380d095e9fe6933af2e65f/openhands-sdk/openhands/sdk/tool/schema.py>) — [local snapshot](<../evidence/agent-architecture-20260916/OpenHands--software-agent-sdk/files/openhands-sdk/openhands/sdk/tool/schema.py>), 15774 bytes.
- [openhands-sdk/openhands/sdk/context/condenser/llm_summarizing_condenser.py](<https://github.com/OpenHands/software-agent-sdk/blob/22c85eb0e0db8f4386380d095e9fe6933af2e65f/openhands-sdk/openhands/sdk/context/condenser/llm_summarizing_condenser.py>) — [local snapshot](<../evidence/agent-architecture-20260916/OpenHands--software-agent-sdk/files/openhands-sdk/openhands/sdk/context/condenser/llm_summarizing_condenser.py>), 20744 bytes.
- [openhands-sdk/openhands/sdk/agent/parallel_executor.py](<https://github.com/OpenHands/software-agent-sdk/blob/22c85eb0e0db8f4386380d095e9fe6933af2e65f/openhands-sdk/openhands/sdk/agent/parallel_executor.py>) — [local snapshot](<../evidence/agent-architecture-20260916/OpenHands--software-agent-sdk/files/openhands-sdk/openhands/sdk/agent/parallel_executor.py>), 13625 bytes.

## continuedev/continue

Commit: [5522c6f44ca0ac3528b37244818fbfa39b5af470](https://github.com/continuedev/continue/commit/5522c6f44ca0ac3528b37244818fbfa39b5af470); committed 2026-07-21T04:00:09Z; default branch main; GitHub archived flag false.

- [LICENSE](<https://github.com/continuedev/continue/blob/5522c6f44ca0ac3528b37244818fbfa39b5af470/LICENSE>) — [local snapshot](<../evidence/agent-architecture-20260916/continuedev--continue/files/LICENSE>), 11348 bytes.
- [README.md](<https://github.com/continuedev/continue/blob/5522c6f44ca0ac3528b37244818fbfa39b5af470/README.md>) — [local snapshot](<../evidence/agent-architecture-20260916/continuedev--continue/files/README.md>), 2791 bytes.
- [core/context/retrieval/pipelines/BaseRetrievalPipeline.ts](<https://github.com/continuedev/continue/blob/5522c6f44ca0ac3528b37244818fbfa39b5af470/core/context/retrieval/pipelines/BaseRetrievalPipeline.ts>) — [local snapshot](<../evidence/agent-architecture-20260916/continuedev--continue/files/core/context/retrieval/pipelines/BaseRetrievalPipeline.ts>), 8866 bytes.
- [extensions/cli/src/compaction.ts](<https://github.com/continuedev/continue/blob/5522c6f44ca0ac3528b37244818fbfa39b5af470/extensions/cli/src/compaction.ts>) — [local snapshot](<../evidence/agent-architecture-20260916/continuedev--continue/files/extensions/cli/src/compaction.ts>), 10264 bytes.
- [core/util/conversationCompaction.ts](<https://github.com/continuedev/continue/blob/5522c6f44ca0ac3528b37244818fbfa39b5af470/core/util/conversationCompaction.ts>) — [local snapshot](<../evidence/agent-architecture-20260916/continuedev--continue/files/core/util/conversationCompaction.ts>), 5128 bytes.
- [core/context/retrieval/pipelines/RerankerRetrievalPipeline.ts](<https://github.com/continuedev/continue/blob/5522c6f44ca0ac3528b37244818fbfa39b5af470/core/context/retrieval/pipelines/RerankerRetrievalPipeline.ts>) — [local snapshot](<../evidence/agent-architecture-20260916/continuedev--continue/files/core/context/retrieval/pipelines/RerankerRetrievalPipeline.ts>), 6006 bytes.

## RooCodeInc/Roo-Code

Commit: [b867ec9145750d0ae1ff7f02d35406e9bf2a0b16](https://github.com/RooCodeInc/Roo-Code/commit/b867ec9145750d0ae1ff7f02d35406e9bf2a0b16); committed 2026-05-15T18:04:45Z; default branch main; GitHub archived flag true.

- [LICENSE](<https://github.com/RooCodeInc/Roo-Code/blob/b867ec9145750d0ae1ff7f02d35406e9bf2a0b16/LICENSE>) — [local snapshot](<../evidence/agent-architecture-20260916/RooCodeInc--Roo-Code/files/LICENSE>), 11344 bytes.
- [README.md](<https://github.com/RooCodeInc/Roo-Code/blob/b867ec9145750d0ae1ff7f02d35406e9bf2a0b16/README.md>) — [local snapshot](<../evidence/agent-architecture-20260916/RooCodeInc--Roo-Code/files/README.md>), 3387 bytes.
- [src/core/tools/NewTaskTool.ts](<https://github.com/RooCodeInc/Roo-Code/blob/b867ec9145750d0ae1ff7f02d35406e9bf2a0b16/src/core/tools/NewTaskTool.ts>) — [local snapshot](<../evidence/agent-architecture-20260916/RooCodeInc--Roo-Code/files/src/core/tools/NewTaskTool.ts>), 4379 bytes.
- [src/core/tools/ToolRepetitionDetector.ts](<https://github.com/RooCodeInc/Roo-Code/blob/b867ec9145750d0ae1ff7f02d35406e9bf2a0b16/src/core/tools/ToolRepetitionDetector.ts>) — [local snapshot](<../evidence/agent-architecture-20260916/RooCodeInc--Roo-Code/files/src/core/tools/ToolRepetitionDetector.ts>), 2811 bytes.
- [src/core/task/build-tools.ts](<https://github.com/RooCodeInc/Roo-Code/blob/b867ec9145750d0ae1ff7f02d35406e9bf2a0b16/src/core/task/build-tools.ts>) — [local snapshot](<../evidence/agent-architecture-20260916/RooCodeInc--Roo-Code/files/src/core/task/build-tools.ts>), 5876 bytes.
- [src/core/condense/index.ts](<https://github.com/RooCodeInc/Roo-Code/blob/b867ec9145750d0ae1ff7f02d35406e9bf2a0b16/src/core/condense/index.ts>) — [local snapshot](<../evidence/agent-architecture-20260916/RooCodeInc--Roo-Code/files/src/core/condense/index.ts>), 25509 bytes.
- [src/core/checkpoints/index.ts](<https://github.com/RooCodeInc/Roo-Code/blob/b867ec9145750d0ae1ff7f02d35406e9bf2a0b16/src/core/checkpoints/index.ts>) — [local snapshot](<../evidence/agent-architecture-20260916/RooCodeInc--Roo-Code/files/src/core/checkpoints/index.ts>), 11586 bytes.
- [src/core/task/__tests__/new-task-isolation.spec.ts](<https://github.com/RooCodeInc/Roo-Code/blob/b867ec9145750d0ae1ff7f02d35406e9bf2a0b16/src/core/task/__tests__/new-task-isolation.spec.ts>) — [local snapshot](<../evidence/agent-architecture-20260916/RooCodeInc--Roo-Code/files/src/core/task/__tests__/new-task-isolation.spec.ts>), 12751 bytes.
- [src/shared/modes.ts](<https://github.com/RooCodeInc/Roo-Code/blob/b867ec9145750d0ae1ff7f02d35406e9bf2a0b16/src/shared/modes.ts>) — [local snapshot](<../evidence/agent-architecture-20260916/RooCodeInc--Roo-Code/files/src/shared/modes.ts>), 8305 bytes.

## spacedriveapp/spacebot

Commit: [ab2c16086f0237ed0ec212efb6c1061f37e37f0d](https://github.com/spacedriveapp/spacebot/commit/ab2c16086f0237ed0ec212efb6c1061f37e37f0d); committed 2026-08-18T00:55:48Z; default branch main; GitHub archived flag false.

- [LICENSE](<https://github.com/spacedriveapp/spacebot/blob/ab2c16086f0237ed0ec212efb6c1061f37e37f0d/LICENSE>) — [local snapshot](<../evidence/agent-architecture-20260916/spacedriveapp--spacebot/files/LICENSE>), 3758 bytes.
- [README.md](<https://github.com/spacedriveapp/spacebot/blob/ab2c16086f0237ed0ec212efb6c1061f37e37f0d/README.md>) — [local snapshot](<../evidence/agent-architecture-20260916/spacedriveapp--spacebot/files/README.md>), 30501 bytes.
- [docs/content/docs/(core)/architecture.mdx](<https://github.com/spacedriveapp/spacebot/blob/ab2c16086f0237ed0ec212efb6c1061f37e37f0d/docs/content/docs/(core)/architecture.mdx>) — [local snapshot](<../evidence/agent-architecture-20260916/spacedriveapp--spacebot/files/docs/content/docs/(core)/architecture.mdx>), 23903 bytes.
- [docs/content/docs/(core)/chronicles.mdx](<https://github.com/spacedriveapp/spacebot/blob/ab2c16086f0237ed0ec212efb6c1061f37e37f0d/docs/content/docs/(core)/chronicles.mdx>) — [local snapshot](<../evidence/agent-architecture-20260916/spacedriveapp--spacebot/files/docs/content/docs/(core)/chronicles.mdx>), 2604 bytes.
- [docs/content/docs/(features)/workers.mdx](<https://github.com/spacedriveapp/spacebot/blob/ab2c16086f0237ed0ec212efb6c1061f37e37f0d/docs/content/docs/(features)/workers.mdx>) — [local snapshot](<../evidence/agent-architecture-20260916/spacedriveapp--spacebot/files/docs/content/docs/(features)/workers.mdx>), 3053 bytes.
- [src/agent/branch.rs](<https://github.com/spacedriveapp/spacebot/blob/ab2c16086f0237ed0ec212efb6c1061f37e37f0d/src/agent/branch.rs>) — [local snapshot](<../evidence/agent-architecture-20260916/spacedriveapp--spacebot/files/src/agent/branch.rs>), 20198 bytes.
- [src/agent/worker.rs](<https://github.com/spacedriveapp/spacebot/blob/ab2c16086f0237ed0ec212efb6c1061f37e37f0d/src/agent/worker.rs>) — [local snapshot](<../evidence/agent-architecture-20260916/spacedriveapp--spacebot/files/src/agent/worker.rs>), 74626 bytes.
- [src/agent/compactor.rs](<https://github.com/spacedriveapp/spacebot/blob/ab2c16086f0237ed0ec212efb6c1061f37e37f0d/src/agent/compactor.rs>) — [local snapshot](<../evidence/agent-architecture-20260916/spacedriveapp--spacebot/files/src/agent/compactor.rs>), 35520 bytes.
- [src/memory/search.rs](<https://github.com/spacedriveapp/spacebot/blob/ab2c16086f0237ed0ec212efb6c1061f37e37f0d/src/memory/search.rs>) — [local snapshot](<../evidence/agent-architecture-20260916/spacedriveapp--spacebot/files/src/memory/search.rs>), 28629 bytes.
- [src/llm/routing.rs](<https://github.com/spacedriveapp/spacebot/blob/ab2c16086f0237ed0ec212efb6c1061f37e37f0d/src/llm/routing.rs>) — [local snapshot](<../evidence/agent-architecture-20260916/spacedriveapp--spacebot/files/src/llm/routing.rs>), 28893 bytes.

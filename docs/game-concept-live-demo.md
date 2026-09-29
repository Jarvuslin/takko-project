# Live concept evaluation and recorded walkthrough

The live test failed its first semantic gate. The new provider contract worked, but Haiku 4.5 selected rescue before resolving the request's rescue-versus-battle choice. No clarification, full plan, clear-request case, build or native Studio test followed. This does not establish the full capability of Takko or stronger models.

The user explicitly raised the combined evaluation ceiling to **$5** and requested a demo and workflow presentation. Continued the systematic debugging and concise planning skills. No product source changed during this evaluation.

## Watch the demo

- Local presentation: http://127.0.0.1:4349/demo/
- Video: `research/results/concept-live-v3/demo/takko-workflow-review.mp4`
- Duration: **141.606 seconds**, approximately 2 minutes 22 seconds, 1440 × 1000, H.264 video with AAC narration.
- Narration uses the locally installed Microsoft David Desktop synthetic voice. No paid audio or media service.

The first part records the actual UI in an empty demonstration workspace. The paid segment records the actual isolated application calling OpenRouter and displaying its response. The full model-response wait is retained. Summary cards explain findings and intended later steps. No response was replaced or edited to manufacture a pass. Both original recordings remain available alongside the final MP4.

| Approximate time | Content |
| --- | --- |
| 0:00 | What is being demonstrated and the observed limitation |
| 0:19 | Models, presets, an ordinary-language idea and project creation |
| 1:00 | Actual paid concept request and returned UI |
| 1:31 | Failed content gate, successful structure and cost controls |
| 1:52 | Intended later workflow, explicitly marked unverified in this run |

## What happened

The previous encrypted testing credential was rejected by OpenRouter's key endpoint with HTTP 401 during preparation. No inference was sent. A read-only diagnostic confirmed that status. The user entered a replacement in a local password field on port 4347. The new key had a $5 allowance and remains in that process's memory only. No key was stored in browser storage, logged, or saved to disk. The old credential artifact was not overwritten.

Recorded authorization is `research/results/concept-live-v3/authorization.json`. The earlier $0.20 proposal is preserved separately. The revised protocol retains one dispatch per stage and stops on contract or semantic failure. Raising the ceiling does not authorize automatic retries. The runner checks the exact reservation against both cumulative authorized spending and available key allowance, rather than requiring the entire maximum ceiling to be prepaid for each request.

The run used **anthropic/claude-haiku-4.5**, pinned to Anthropic through OpenRouter. It sent a strict `json_schema` response format, required parameter support, disabled provider fallback and capped provider prices. Source hashes match the product implementation that passed the prior full check.

The exact request was:

> I want to make a pet game, but I am not sure if players should rescue lost pets or battle with them. Help me choose what players actually do before building anything.

The response was valid against the complete local output schema. It returned one question, `rescue_mechanic`, asking what happens when the player finds a lost pet. Its three options were puzzle, catching or dialogue. All presupposed rescue. The recorded game-premise decision already selected rescue and exploration, without an answer or explicit delegation of the rescue-versus-battle choice. The playtest also assumed an obstacle before the rescue mechanic was decided.

The app correctly retained `needs_choices`, displayed its unresolved notices and did not produce a specification. The response contained player actions and observable outcomes without asking the user to write scripts or place objects. Those are improvements over earlier replies, but they do not satisfy the frozen content gate.

The phrase “help me choose” could invite a recommendation. This review does not treat every recommendation as invalid. The predeclared acceptance gate required surfacing the unresolved rescue-versus-battle choice, and the actual response neither asked it nor offered the alternative. The gate was not relaxed after seeing the answer.

## Root-cause boundary

The shipped code verifies field shape, permitted source IDs, answered question identities, paired playtest checks and unresolved-state readiness. It does not prove that an inferred choice attached to source `request` represents an explicit user decision. The prompt permits inferred defaults. That is an observed acceptance gap in the contract. This single response cannot establish the model's internal reason for choosing rescue.

A useful next design change is to distinguish an unresolved consequential choice, a model recommendation and an explicitly accepted choice. A recommendation may be shown, but it should not silently settle an unresolved fork. This needs representative tests across genres and delegated-choice wording. Hard-coding rescue/battle detection or merely adding another prompt sentence would not establish a general fix.

The trial's `initial-review.json` and `stopped.json` preserve the failed content review. No paid stage was retried and no later inference stage was dispatched. A stronger-model comparison remains untested.

## Costs and reconciliation

| Item | Amount |
| --- | ---: |
| User-authorized combined ceiling | $5.000000 |
| New paid calls | 1 |
| Initial call reservation | $0.018439 |
| Actual initial charge | **$0.005008** |
| Earlier trials' actual charges | $0.011967 |
| Combined historical actual charges | $0.016975 |
| Combined historical outbound reservations | $0.064752 |
| New key starting allowance | $5.000000 |
| New key settled remaining allowance | **$4.994992** |

The live dispatch occurred at **2026-09-20T23:21:18.927Z**, took **19,467 ms**, and used **2,328 input tokens and 536 output tokens**. Receipt `gen-1789946478-tbtwLgbE9pbU5b8d2bv7`, provider Anthropic. The first post-call key read was stale and is preserved. The settled balance at **2026-09-20T23:23:00.965Z** matches the receipt exactly. Previous trials used a different key and are included in the combined authorized reservation accounting, not in the new key's deduction.

`research/results/concept-live-v3/audit.json` verifies the request hash, exact wire-schema reservation, receipt, provider controls, unchanged product hashes, one app charge, failed review and absence of later stage locks. The text artifact scan found zero OpenRouter key-pattern matches across 39 artifacts at audit time. That scan is supporting evidence, not a substitute for keeping credentials out of persisted data.

## Verification

- **Five** standalone budget-policy tests passed, including the distinction between an authorized ceiling and available balance.
- Live audit passed all assertions. One real provider response passed structural validation and failed the manual semantic review.
- **Five** presentation checks passed: duration/dimensions, advancing playback, seeking to five chapter positions, all evidence links available and no page errors.
- Full MP4 audio/video decode exited **0**. Visually inspected the recorded response and final workflow slide.
- Product source is unchanged from the preceding full `npm run check`: 1,339 unit/API tests in 81 files, six offline combat scenarios, 14 plugin groups plus plugin/eight injected source compilations, six guard fixtures, TypeScript/Vite, 10 desktop tests, production smoke and 86 browser tests.
- **No new full check was run this turn.** All eight stages were skipped here because this turn changed the evaluation runner and presentation, not product implementation. Previous failures remain preserved. No native Studio session occurred.

## Walkthrough for a first-time user

1. In **Models**, save the provider and model you want to use. Enter the key in the local connection field. It stays in server memory.
2. In **Presets**, name a reusable team, choose the models for its roles and set its spending allowance.
3. Write your idea in ordinary language and create a project. **Shape my idea** asks for a compact concept before a full plan.
4. Compare the concept with your intention. Select an offered answer, write your own answer or use **Choose for me** for a choice you want to delegate. Check the displayed defaults and unresolved issues.
5. Once the choices are settled, use **Use this concept & plan**. Review and approve the specification before generating game files.
6. After generation, connect to Studio and follow the player-facing playtest guide. **Ready to test** does not mean gameplay has been verified.

This evaluation stopped at step 4. Steps 5 and 6 explain the intended workflow, not a successful result from this run.

## Processes and preservation

Automatic approval review rejected the attempted restart command for preview 4346 with `blocked by policy`, without a more specific reason. The command did not run. Used a separate current-code application for the live stage, which closed normally afterward. Existing listeners remain **4346/PID 12300**, **4345/PID 30804**, **4343/PID 31044** and static **4342/PID 28132**.

New local services left available: **4347/PID 30440** holds the replacement testing key in memory, **4348/PID 36712** is the credential-free introduction workspace, and **4349/PID 14716** serves the recorded presentation read-only. Do not restart the key service casually. The paid trial is stopped even though its key service remains available for balance inspection.

No Studio state changed, no game was built or published, and the paused generation goal remains paused. No commit or push. Preserve the original v1/v2/v3 failure evidence, unrelated dirty work and memory-only keys.

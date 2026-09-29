# Studio connection and reply recovery

The asset chooser now distinguishes a connected Studio from a blocked asset search. Both Marketplace surfaces use the same checking, connected, disconnected, offline and failed-check states. Refresh has a spinner, disables duplicate requests, times out after 20 seconds, clears stale selections on failure and cancels work when its owner unmounts. Refreshing retries an initial failed asset discovery without replacing existing results or choices. Search and paging are disabled while the connection cannot be confirmed.

The dropdown and neighboring buttons now share a 44-pixel control height and bottom alignment. The old chooser label had a 16-pixel bottom margin that moved its select above the button. The shared row removes child margins and wraps whole controls on narrow screens. It also covers Marketplace search and model credential entry. Marketplace's larger search controls retain their matching 48-pixel height. This is a targeted correction within the existing design.

## Truncation evidence and change

Read-only inspection of the user's running surgical-UX executable found project `88df0678-b7f9-44b5-bec3-5b111ff547a6`, revision 7, failed. Its configured Sonnet 5 output limit is 8,192. Four retained planner failures report exactly 8,192 output tokens with no answer text in the saved trace. The trace did not retain reasoning usage, so reasoning exhaustion is an inference, not a measured breakdown of those calls. The hidden 2,000-token concept cap was investigated first and is not the cause of these full-plan failures. It remains unchanged.

The public OpenRouter model metadata read during this task reports Sonnet 5 reasoning enabled by default, high effort, and support for low effort. [OpenRouter's reasoning documentation](https://openrouter.ai/docs/guides/best-practices/reasoning-tokens) describes empty answer text with a length finish reason when reasoning consumes the shared output allowance. Its suggested controls include a lower reasoning effort.

Requests for `anthropic/claude-sonnet-5` through OpenRouter now default to low reasoning effort. The total token limit, price rates, spend reservations and project budget remain unchanged. An optional OpenRouter reasoning-effort selector in Models permits low, medium or high, or Automatic. Automatic retains provider defaults for other models. Compatible endpoints do not receive OpenRouter-specific reasoning options. Lower effort trades reasoning depth for more room to return the requested data. Live plan quality has not been established by this change.

Truncation messages now name the effective token limit and distinguish an empty answer. Reasoning-token counts are retained as metadata when supplied and are not added twice to charges. Failed traces include output, reasoning and effective-limit numbers. The UI replaces the raw error with a compact explanation, preserves the provider detail in a disclosure and offers Open model settings. Opening settings does not retry generation. Existing configured fallback policy is unchanged. Incomplete data is still rejected.

## Verification

Final results are recorded in [RESULTS.md](results/connection-recovery/RESULTS.md). Tests use offline provider fixtures. Native Marketplace checks use actual read-only Studio discovery and public Creator Store results. No paid inference is authorized or performed during this task, so a successful new live plan is not claimed. No Studio scripts or place contents are changed.

Preserved failures include the first unit subset's old exact-result assertion, the first full run's matching audio assertion, and two browser harness iterations. The browser harness initially counted an independent project-entry Studio check as the refresh under test, then failed to enable its held-response mode. Both harness failures were corrected without weakening the checking, stale-selection, retry or alignment assertions.

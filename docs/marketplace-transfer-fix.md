# Marketplace drop: truncated inspection response

2026-09-17. The user reported **Invalid request. Check the supplied fields.** after dragging Marketplace assets into chat.

Reproduced against the real Studio using **[🚶] Best Walk Animation R6**, asset `127964771902906`, version `32134270188`. Metadata lookup succeeded. The old snapshot response was a **100,015-character string ending in `... (truncated)`**, rather than parseable JSON. Studio had cut the inspection's JSON at its 100,000-character output boundary. Zod then rejected a string where an object was expected; the shared HTTP handler incorrectly presented this upstream failure as invalid user input. This was a Takko transfer/error-reporting bug, not evidence of a bad asset or an incorrect drag.

The first native butter test had only 57 objects and one script, so it did not exercise this limit. The failing animation model has 1,722 objects, including many nested animation poses with long paths.

## Fix

Inspection snapshots now transfer as bounded 32 KiB byte chunks, hex encoded to keep each Studio reply under 66,000 characters. A canonical array representation avoids object-key ordering differences. Each reply identifies its offset, total bytes and SHA-256 digest; Takko checks every chunk, the final length and the assembled digest before parsing or scanning. A 4 MiB total transfer bound prevents unbounded accumulation. Unicode and scripts crossing chunk boundaries are preserved.

Each page recaptures detached objects and destroys them before returning, so no temporary transfer objects are stored inside the user's game. Captures must match the same full digest across pages or the drop fails closed. Asset revision checks before/after inspection remain in force. Large first-time inspections require more native calls; cached repeat drops still skip source capture.

Upstream metadata/snapshot validation now reports the failing inspection stage instead of reusing the generic invalid-request message. Existing source/node limits and suspicious-code checks remain in force; the transfer fix does not bypass them.

## Tests

Focused tests: **43 passed**, including seven new cases for a response above 100K, Unicode, source beyond the first chunk, inconsistent captures, missing bytes, incorrect digests, truncated/invalid replies and malformed upstream metadata. The large-source test places an external `require` after the first chunk and verifies it is still blocked. TypeScript passed.

`npm run check` passed **1,267 unit/API tests, 10 desktop tests and all pre-browser stages**. Browser results were 40/42 initially, with two unrelated timing failures; `npx playwright test --last-failed` then passed both in 24.9 seconds without further source edits. All six Marketplace browser cases passed initially. The computer slept during the initial run: Windows Power-Troubleshooter event 1 reports sleep at `2026-09-17T05:05:45Z` and wake at `15:39:58Z`, explaining the reported 10.6-hour suite duration. This was not uninterrupted active testing. [Initial full output](results/marketplace-transfer-check.txt) and [two-test rerun](results/marketplace-transfer-retry.txt) are preserved separately.

Native checks in the user's existing Edit-mode Studio:

- The previously failing walk model captured all **1,722 objects and one readable script**. A physical drag in the user's preview tab then displayed **Inspected and attached**.
- **Evade Animations | Character Animations [v1]**, asset `74987847468722`, now transfers its partial result rather than failing JSON validation. It correctly reports the existing **3,000 inspected instances** limit and requires review.

No imported scripts were executed. No paid model calls or game generation. The preview on port 4336 was restarted to load the fix; the original app on port 4324 was untouched.

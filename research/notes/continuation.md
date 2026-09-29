# Current state

Updated 2026-09-29. Fresh-generation handoff. History through 2026-09-29 is in `archive/continuation-2026-09-13-to-2026-09-29.md`.

## Live now

- **4318, PID 47716**: fresh browser app at http://127.0.0.1:4318. Current source, `.forge/fresh-browser-20260929`, launched by `.forge/fresh-browser-start.ts`. No `.env` import. GET returned 200. No projects or provider connections at handoff verification.
- **Desktop 0.2.0**, main PID **32384**, service **65219 / PID 41392**: `release/takko-fresh-20260929/Takko-win32-x64/Takko.exe`. Built with `npm run desktop:package` from committed application source **0c25e2b**. Native renderer shows the refreshed UI and Geist font.
- Reopen the fresh desktop through `release/takko-fresh-20260929/Start Takko Fresh.lnk`. It supplies `--user-data-dir="D:\RobloxProjects\Roblox Gen\.forge\fresh-desktop-20260929"`. The executable alone still defaults to the existing `%APPDATA%/Forge Desktop` workspace. Desktop service ports change on launch. Service > Connection details shows the plugin endpoint.
- Both fresh setups have the exact source model profiles, routes and My first preset from `.forge/world-policy-live-20260928/configuration/models.json`, an **$8 cap and repairLimit 0**. Only schema-validated, key-free settings were copied. No old vault, key or `.env` was read or copied. The user connects OpenRouter themselves in Models, separately in each setup.
- The user authorized closing the old desktop. Main PID 46464 was closed normally and its old processes exited. The old desktop service on 55085 stopped with it.
- **4340, PID 26772** remains the old `.forge/asset-search-host.mjs` with `.forge/world-policy-live-20260928`. Project **c8550a5b-5b9f-4b79-8a25-b7ee0827618c**, last recorded revision 5, draft, no job. Its process/store/project were not changed or restarted. Never rerun the old scope-answer recovery helper. No permission to restart 4340 was given.
- Final full `npm run check` passed: 1,757 unit, 100 desktop browser, 14 desktop, 6 Luau, 15 plugin mocks, 6 guards, build/CSS/production smoke. No skips. Liveness rechecked 2026-09-29T18:13:45Z. Test service 4319 stopped. Report and retained failures: `docs/fresh-generation-handoff-20260929.md`.
- No native Studio session was opened or modified. Recheck live PIDs before touching any process.

## Money

- Fresh setups: $8 project budget each, repairLimit 0, zero projects/spend at verification. This preparation cost **$0**. No paid inference, generation or provider balance query.
- Preserved c8550a5b: **$8 cumulative cap**, ledger spend $0.385091, retained reservation $0.002688, remaining $7.612221.
- Last provider reconciliation remains 2026-09-29T00:26:25Z. Key balance $15.240844430, account $16.748365904. These are historical values, not refreshed balances.
- The user runs generation themselves. No automatic retry, paid Choose for me or paused-generation resume by the assistant.

## Paused

- All older generation goals/projects, including 8a81efe9-b8ed-44bc-a21a-5aad132813ac. Preserve their evidence.
- Existing deny-dispatch flags in `docs/results/question-modal-20260928/live/` and `docs/results/single-punch-recovery-20260928/` remain.
- Old c8550a5b saved dummy 108353927891814 and sound 133175949071305 remain as last recorded. Animation unchosen, five saved answers, single-punch scope. Pack 12061946559 remains excluded. Do not alter this project as part of the fresh generation.

## Next up

1. User connects their OpenRouter key in Models, connects Studio and the Takko plugin to their chosen app, then submits their own fresh prompt and Marketplace attachments.
2. User reviews chosen assets, resolves warnings and chooses actual animation clips before approving and testing in Studio. No assistant generation run is authorized.
3. Any refresh of 4340 remains a separate task requiring explicit restart permission and preservation checks.

## Recent decisions

- Composer attachments now enter the initial proposal's structured context. Explicit selectedAssetId binds needs to actual user attachments and rejects invented identities. Card initialization uses inspected cached choices without another search. Unbound legacy attachments remain visible without guessing their role.
- Dropping a Marketplace card onto a need row persists that exact pick and runs normal verification. Exclusions, type checks, script warnings, Keep it and playable clip gates remain. Interrupted saved checks offer an explicit retry.
- Both UIs clearly state that animation clips need the Takko plugin when Studio is disconnected. Short desktop windows keep Send visible while the attachment list scrolls.
- Takko remains desktop-only. Baseplate/world policy, namespace and Forge protocol/env/storage identifiers are unchanged. Static inspection and offline tests are not native gameplay or publishing verification. Takko stops at ready to test.

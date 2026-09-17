# Component review feedback

V11 exposed two independent contract errors in one raw response: extra permission-impact rows and a local ModuleScript classified as an external module asset. First-error-only feedback used the correction attempt on the former and surfaced the latter only afterward. The old asset-ID diagnostic also conflated a nonnumeric value with an uncited numeric ID.

The generic interface now distinguishes local `instance_reference`, numeric external `module_asset`/`media_asset`, and `dynamic_or_unresolved`. It explicitly limits permissionImpacts to the supplied removedCapabilities list. Other capability concerns remain expressible through source dependencies, unresolved entries and integration notes.

After schema and evidence identity validation, independent semantic errors are collected into bounded feedback. Every check still runs. Up to six unique diagnostics of at most400 characters each fit inside Engine's correction budget; omitted errors keep the response invalid. Source-body mismatches cannot crash later citation checks. Nothing repairs raw responses, relaxes citations or increases the existing attempt limit.

Regression coverage includes simultaneous errors, valid local/external/dynamic dependency representations, strict configuration/citation matching, unknown source hashes, identity failure, diagnostic bounds and the actual Engine correction handoff. Offline replay of the unchanged V11 responses tests feedback against the observed failure. A fresh bounded Sol diagnostic measures model behavior separately; it cannot demonstrate native component or game success.

Final commands and results are recorded in [the diagnostic report](../research/results/component-review-feedback-v1/RESULTS.md). No Studio/plugin change or live-app restart is part of this fix.

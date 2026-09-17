# Independent controller and evidence audit

2026-09-16. Reviewed the controller, offline fixtures, protocol, reconstructed input, terminal verifier and saved results. The reviewer made no paid or native calls and edited no model answer, production code or benchmark request.

**Audit conclusion: no remaining blocker found in this bounded diagnostic.** Contract and evidence validation do not establish semantic correctness or a game pass.

## Reconstruction and prompt boundary

The controller reconstructs V13's second-adaptation context from the event prefix ending before sequence 20, the immutable first-hop chain and frozen production helpers. It verifies the planned request/specification/scope/revision, matching asset need, current candidate/evidence identity, first-hop plan, prior negative review and attempt-two metadata. It rebuilds the stage before appending the adaptation-call event and obtains full sources from validated sidecars rather than treating truncated event previews as complete evidence.

During review, I identified that the previous review initially used the raw parsed object after discarding the production validator's return. The engineer corrected this to use the validated, schema-parsed return, matching the production handoff. Early zero-call projection/sequence failures remain preserved separately.

I independently checked the canonical offline artifacts: all 61 production source pins match; controller hash is `4e378166ce0a67c2c20c36fb41fc7721f0cbfc21a1a04e78645574d5e2f68e9e`; request hash is `523ba2e253b0384d16dfd9e17e8bb0b54ecd5848034c21421d5b308891d99388`; reconstructed Gemini/Sol request bodies differ only in model; user-message JSON matches saved input; and the current evidence/prior review both bind packet `032c789d833227640f12e6af8e8c08a58d89803749cdcc40bc1109600fe89e06`. The later V13 second-capture packet and source hashes are absent from the request. The later answer is used only as an offline validation fixture.

Historical HTTP request bytes were not retained. Matching the historical 160,273-microdollar Engine reservation corroborates the reconstructed input allowance, not historical byte identity. Exact offline-to-live equality is supported; exact historical-to-live equality is not. The preregistered rubric also discloses that the evaluator had already seen V13's outcome, so this comparison is not blinded.

## Dispatch, secrecy and financial bounds

The controller uses a one-shot transport, exact URL/method/body checks and an irreversible dispatch latch, with durable reservation before sending. It calls the production provider directly rather than the Engine correction loop. Timeout, invalid output and unknown billing cannot trigger another paid request. DPAPI restoration is internal; no key is placed in the saved request, and response/errors are redacted. The inspected fixtures cover these guards, unknown/malformed/HTTP failure, known-invalid conservative liability and current-evidence validation. Canonical offline execution records one local fixture dispatch and zero paid calls.

Admission is 8,110,213 carried microdollars + 600,000 cap + 400,000 headroom = **9,110,213**, below the 9,500,000 ceiling. The actual pre-dispatch allowance is 448,184. Known-invalid output retains at least that allowance or any higher known charge; unknown output retains full liability. Prior unknown liabilities are carried independently of aggregate provider usage. Historical Engine reservations and this probe's transport reservation are explicitly distinguished.

The live run ended after one valid response, with known cost **$0.1689635**, rounded to 168,964 microdollars, and generation ID `gen-1789589523-i0jOhzgVKiopf7JS0enD`. New conservative prior is 8,279,177. The final verifier links result charge/liability/ID to the reservation, checks the provider receipt and matching aggregate usage delta, and separately classifies local termination versus an unknown remote outcome. It also handles a valid saved decision whose billing settlement fails, preserving evidence instead of assuming every failure lacks a decision. Both final offline/live verification files passed 61 source pins and key-absence checks. No new unknown liability occurred.

## Syntax and remaining boundaries

The installed Luau compiler reports success for both unchanged Gemini replacement sources and Sol's replacement/addition. I independently verified all four extracted files equal their raw model source text and recorded hashes. Compiler success establishes syntax only: no proposed Sol plan was applied, no imported code executed, and no native gameplay, media playback, listening, permissions or placement acceptance was performed. Semantic findings are recorded separately in `ASSESSMENT.md`.

# Models page and reusable provider keys

Takko now follows the supplied Models reference. The saved library and provider explorer have separate surfaces, branded provider tiles, search, provider and price filters, catalog sorting, clear reading/writing prices and context lengths when the provider supplies them. The existing sidebar, mascot, typography and selected workspace design remain in use. Speed, popularity and capability claims from the reference are not invented.

## Provider flow

Choose a provider, enter its API key and select **Validate & connect**. Catalog requests and new model saves are gated on provider validation. OpenRouter uses its authenticated key endpoint because its catalog is public. OpenAI, Anthropic, Gemini and compatible endpoints use authenticated model listing. Every request refuses redirects. This is a read-only check, not inference, billing verification or proof that every listed model can generate successfully.

One provider connection serves every model at the same canonical endpoint. Official providers require their official endpoint. Changing a custom endpoint never forwards the previous endpoint's key. Legacy session keys can be validated and promoted without being entered again. Imported model profiles may remain in the library without a connection and show that they need a key. The legacy bulk configuration API remains available for imports and offline fixtures. Normal add-model and catalog APIs enforce the connection requirement.

Replace key validates the candidate before replacing a working key. Disconnect removes the provider credential while retaining model profiles. Removing a model does not delete the provider connection. Test checks provider authentication without a completion request. Models selected from the catalog carry their published rates. Unknown prices remain unknown. Manual IDs and optional generation settings remain available after connection.

## Storage

The Windows server and desktop service save provider keys with Windows CurrentUser DPAPI. The browser never receives a saved key. Plaintext secrets are never written to project JSON, browser storage, command arguments or logs. The helper receives data through standard input and only encrypted bytes reach disk. Writes use a temporary encrypted file and rename. Encryption or decryption failure has no plaintext fallback.

Desktop storage is `%APPDATA%/Forge Desktop/provider-keys.dpapi`. The normal browser server uses `configuration/provider-keys.dpapi` under its configured data directory. They are separate workspaces. Other platforms and custom servers without an injected vault explicitly show session-only storage. Legacy environment and per-model API keys remain session-only until promoted through validation. Provider validation is checked again when browsing after restart.

## Verification and limits

Focused API tests cover key rejection, catalog and model-save gating, shared keys across two models, failed replacement, disconnect, endpoint isolation, auth headers, redirect refusal, failed encryption and a real Windows DPAPI round trip in a disposable directory. Browser tests use synthetic provider boundaries and separately exercise blocked catalogs, failed validation, adding two models without repeated key entry, refresh persistence, provider switching and no secrets in browser storage.

The real saved OpenRouter testing key was reused through the new local connection API. Authentication succeeded and the catalog returned 440 models at the time of inspection. A GLM Flash Latest profile was selected and saved in the isolated preview without another key entry. No paid inference or Studio operation was performed.

Visual inspection at 1440 by 900 found an oversized connection card. It was reduced to a compact row so the catalog takes more of the page. Selecting a model now collapses the duplicate catalog in its dialog. Mobile verification and final checks are recorded in the results file.

Detailed test counts, preserved failures, package and shortcut verification are in [RESULTS.md](results/provider-models/RESULTS.md).

## Provider API references

- [OpenRouter current key](https://openrouter.ai/docs/api/api-reference/api-keys/get-current-key)
- [Anthropic models](https://platform.claude.com/docs/en/api/models)
- [Gemini models](https://ai.google.dev/api/models)

These references establish the provider endpoints. They do not establish access to untested providers or successful generation.

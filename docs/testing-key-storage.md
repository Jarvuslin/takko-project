# Saved OpenRouter testing credential

The user explicitly requested persistent storage of the replacement key on 2026-09-20. This authorizes encrypted credential storage despite the repository's default memory-only rule.

Saved outside the repository at `%LOCALAPPDATA%/Takko/secrets/openrouter-testing.dpapi`, using Windows DPAPI for the current Windows account. Replaced the revoked prior testing credential. The file has inheritance disabled and one explicit full-control rule for the current user. No plaintext key was written, printed, or passed on a command line.

The running key service supplied the key to the existing runner through child standard input. A one-use authorization file enabled the storage operation during a read-only balance check. That authorization was consumed after successful storage. The helper encrypted a temporary file, verified decryption matched the input, and moved the encrypted file into place. The user entry form and Takko product storage were not changed.

Future authorized tests should reuse the existing runner's default DPAPI restoration path. Do not request key re-entry unless the saved credential is missing, cannot be decrypted, or is rejected. This storage request does not authorize a new paid trial or restarting the stopped evaluation.

Verification: standalone synthetic creation and replacement checks passed, including round-trip verification, no plaintext output and current-user-only access. A fresh process then restored the actual saved key and successfully read OpenRouter's allowance: **$4.994992 at 2026-09-20T23:34:36.757Z**. No paid inference, cost $0. Existing services were not restarted.

Three initial synthetic test invocations failed before the helper was corrected. The failures exposed legacy PowerShell module loading, excessive audit-privilege requirements in Set-Acl, and null-string binding in File.Replace. The final helper uses the existing PowerShell 7 runtime, applies only the file access descriptor through .NET, and moves the encrypted replacement into place. Failure logs and the passing check are retained under `docs/results/openrouter-key-storage-test*.txt`, with the first failure retained in task output. No actual credential was used in those synthetic tests.

No product source changed. Full npm check was not rerun: unit/API, Luau, plugin, guards, build, desktop, production and browser stages were skipped for this credential-storage operation. The focused Windows storage verification and real read-only authentication check establish the result described here.

# Repository maintenance

The private repository is https://github.com/Jarvuslin/takko-project.

## What belongs in Git

Keep application source, desktop/native/plugin source, tests, recipes, build scripts, dependency locks, research findings and regression evidence. Historical benchmark artifacts are not all disposable: current tests replay archived model responses and component manifests.

Keep dependencies, generated builds, local project data, API credentials, downloaded research evidence and third-party extraction derivatives local. `.gitignore` covers these paths. The Superbullet architecture reports are included; extracted/deobfuscated application code is excluded.

## Cleanup on 2026-09-16

Five obsolete Forge/Takko desktop bundles and the previous disposable browser-test reports were moved out of the workspace to `D:\RobloxProjects\Takko-cleanup-archive-20260916`. Approximately 1.98 GB was removed from the project folder, but remains recoverable in that archive. This does not reclaim disk space. The current `release/Takko-win32-x64` bundle, installed dependencies, saved projects, research originals and benchmark evidence were retained.

Recursive deletion was blocked by automatic approval review, so cleanup used a reversible archive. Automated verification regenerates its own ignored reports and build directories.

One regression helper was copied from ignored `.forge/component-repair-route-probe.ts` into versioned `scripts/component-repair-route-probe.ts`; its test import and self-hash path now use the versioned location. The archived original remains unchanged. Luau setup now provisions both current and legacy test tool locations from the same hash-verified download.

## Fresh Windows setup

```powershell
npm ci
./scripts/setup-luau.ps1
npx playwright install chromium
$env:LUAU_BIN_DIR = '.forge/tools/luau'
npm run check
```

These checks do not spend model credits or establish Studio gameplay success. Native integration, paid model trials and full-game acceptance have separate evidence and budgets.

## Initial publication verification

`npm run check` passed in the working folder and in a separate checkout exported from the Git index: 1,224 unit/API tests, 10 desktop tests and 36 browser tests, plus Luau, plugin, guard, build and production smoke stages. The separate checkout shared the installed `node_modules` through a directory junction, but bootstrapped both Luau locations using the setup script and had no local project data or ignored helper scripts. This checks repository completeness, not a fresh dependency installation.

The staged-file audit found no matching provider/GitHub/Google credentials, private keys or Roblox cookie markers. All included historical evidence compared byte-for-byte with its local original. This pattern scan is not a guarantee that every possible secret format is detectable.

For deeply nested Windows clones, enable Git long paths for the clone (`git -c core.longpaths=true clone ...`) or choose a short destination path. The temporary verification checkout required that Git option.

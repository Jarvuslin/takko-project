# Lemonate source index

Collected for the 2026-09-14 Forge architecture review. 48 source/document/license files are pinned to repository commits. All 62 manifest entries were hash-verified after collection. Original artifacts are under `research/evidence/lemonate-2026-09-14/`. No upstream code or tests were executed.

The engine recursive tree response has `truncated: true`; the remaining four tree responses are not truncated. File selection was targeted, not an exhaustive repository audit. The original blog HTML is a client-rendered shell. Article content was read through the browser after it loaded, with title **Desktop version, subnodes and lifecycle changes**, author **Lemonate Admin**, and displayed date **5/26/2026**. The notes below summarize the rendered page rather than reproducing it.

## Rendered article observations

- Experimental Windows Electron desktop build; Tauri experiments for smaller builds.
- At publication, desktop projects still used cloud storage; offline support was future work.
- Subnodes expose previously hidden mesh/rig descendants in the scene graph; described as immutable with additional child attachments allowed.
- New preupdate/lateupdate phases and changed prerender timing; these are engine frame hooks.
- WebGPU and live collaboration described as future work at that date, not established production capabilities.

[Original article](https://lemonate.io/blog/desktop-subnodes-lifecycle). Newer source must be assessed separately from the article.

## Pinned files

### lemonate-docs

Revision: `d303855fbf2392747998f8336f38b09ad77f8dc2`.

- [docs/scripting/lifecyclemethods.rst](https://codeberg.org/Luminocity/lemonate-docs/src/commit/d303855fbf2392747998f8336f38b09ad77f8dc2/docs/scripting/lifecyclemethods.rst) — [local evidence](../evidence/lemonate-2026-09-14/lemonate-docs/source/docs/scripting/lifecyclemethods.rst)
- [docs/scripting/nodeevents.rst](https://codeberg.org/Luminocity/lemonate-docs/src/commit/d303855fbf2392747998f8336f38b09ad77f8dc2/docs/scripting/nodeevents.rst) — [local evidence](../evidence/lemonate-2026-09-14/lemonate-docs/source/docs/scripting/nodeevents.rst)

### lemonate-engine

Revision: `28f99d7861ad8fbdead6bc71dfe40cac4770c36e`.

- [headlessrenderer/HeadlessRenderer.ts](https://codeberg.org/Luminocity/lemonate-engine/src/commit/28f99d7861ad8fbdead6bc71dfe40cac4770c36e/headlessrenderer/HeadlessRenderer.ts) — [local evidence](../evidence/lemonate-2026-09-14/lemonate-engine/source/headlessrenderer/HeadlessRenderer.ts)
- [LICENSE.txt](https://codeberg.org/Luminocity/lemonate-engine/src/commit/28f99d7861ad8fbdead6bc71dfe40cac4770c36e/LICENSE.txt) — [local evidence](../evidence/lemonate-2026-09-14/lemonate-engine/source/LICENSE.txt)
- [package.json](https://codeberg.org/Luminocity/lemonate-engine/src/commit/28f99d7861ad8fbdead6bc71dfe40cac4770c36e/package.json) — [local evidence](../evidence/lemonate-2026-09-14/lemonate-engine/source/package.json)
- [README.md](https://codeberg.org/Luminocity/lemonate-engine/src/commit/28f99d7861ad8fbdead6bc71dfe40cac4770c36e/README.md) — [local evidence](../evidence/lemonate-2026-09-14/lemonate-engine/source/README.md)
- [src/Engine.ts](https://codeberg.org/Luminocity/lemonate-engine/src/commit/28f99d7861ad8fbdead6bc71dfe40cac4770c36e/src/Engine.ts) — [local evidence](../evidence/lemonate-2026-09-14/lemonate-engine/source/src/Engine.ts)
- [src/scenegraph/SgItem.ts](https://codeberg.org/Luminocity/lemonate-engine/src/commit/28f99d7861ad8fbdead6bc71dfe40cac4770c36e/src/scenegraph/SgItem.ts) — [local evidence](../evidence/lemonate-2026-09-14/lemonate-engine/source/src/scenegraph/SgItem.ts)
- [src/scenegraph/SgItemSubNode.ts](https://codeberg.org/Luminocity/lemonate-engine/src/commit/28f99d7861ad8fbdead6bc71dfe40cac4770c36e/src/scenegraph/SgItemSubNode.ts) — [local evidence](../evidence/lemonate-2026-09-14/lemonate-engine/source/src/scenegraph/SgItemSubNode.ts)
- [src/subsystems/preview/AssetPreviewService.ts](https://codeberg.org/Luminocity/lemonate-engine/src/commit/28f99d7861ad8fbdead6bc71dfe40cac4770c36e/src/subsystems/preview/AssetPreviewService.ts) — [local evidence](../evidence/lemonate-2026-09-14/lemonate-engine/source/src/subsystems/preview/AssetPreviewService.ts)
- [src/subsystems/scripting/lualibs/eventhooks.lua](https://codeberg.org/Luminocity/lemonate-engine/src/commit/28f99d7861ad8fbdead6bc71dfe40cac4770c36e/src/subsystems/scripting/lualibs/eventhooks.lua) — [local evidence](../evidence/lemonate-2026-09-14/lemonate-engine/source/src/subsystems/scripting/lualibs/eventhooks.lua)
- [src/subsystems/scripting/ScriptEngine.ts](https://codeberg.org/Luminocity/lemonate-engine/src/commit/28f99d7861ad8fbdead6bc71dfe40cac4770c36e/src/subsystems/scripting/ScriptEngine.ts) — [local evidence](../evidence/lemonate-2026-09-14/lemonate-engine/source/src/subsystems/scripting/ScriptEngine.ts)
- [src/subsystems/scripting/ScriptRunner.ts](https://codeberg.org/Luminocity/lemonate-engine/src/commit/28f99d7861ad8fbdead6bc71dfe40cac4770c36e/src/subsystems/scripting/ScriptRunner.ts) — [local evidence](../evidence/lemonate-2026-09-14/lemonate-engine/source/src/subsystems/scripting/ScriptRunner.ts)
- [test/enginetests/Lifecycle.ts](https://codeberg.org/Luminocity/lemonate-engine/src/commit/28f99d7861ad8fbdead6bc71dfe40cac4770c36e/test/enginetests/Lifecycle.ts) — [local evidence](../evidence/lemonate-2026-09-14/lemonate-engine/source/test/enginetests/Lifecycle.ts)
- [src/Player.ts](https://codeberg.org/Luminocity/lemonate-engine/src/commit/28f99d7861ad8fbdead6bc71dfe40cac4770c36e/src/Player.ts) — [local evidence](../evidence/lemonate-2026-09-14/lemonate-engine/source/src/Player.ts)

### lemonate-gateway

Revision: `03cd440d11b56a5b2e744192c51a61eca565e91b`.

- [LICENSE.txt](https://codeberg.org/Luminocity/lemonate-gateway/src/commit/03cd440d11b56a5b2e744192c51a61eca565e91b/LICENSE.txt) — [local evidence](../evidence/lemonate-2026-09-14/lemonate-gateway/source/LICENSE.txt)
- [README.md](https://codeberg.org/Luminocity/lemonate-gateway/src/commit/03cd440d11b56a5b2e744192c51a61eca565e91b/README.md) — [local evidence](../evidence/lemonate-2026-09-14/lemonate-gateway/source/README.md)
- [src/AttachmentCache.ts](https://codeberg.org/Luminocity/lemonate-gateway/src/commit/03cd440d11b56a5b2e744192c51a61eca565e91b/src/AttachmentCache.ts) — [local evidence](../evidence/lemonate-2026-09-14/lemonate-gateway/source/src/AttachmentCache.ts)
- [src/filesystem/IFileSystem.ts](https://codeberg.org/Luminocity/lemonate-gateway/src/commit/03cd440d11b56a5b2e744192c51a61eca565e91b/src/filesystem/IFileSystem.ts) — [local evidence](../evidence/lemonate-2026-09-14/lemonate-gateway/source/src/filesystem/IFileSystem.ts)
- [src/filesystem/IItemBackend.ts](https://codeberg.org/Luminocity/lemonate-gateway/src/commit/03cd440d11b56a5b2e744192c51a61eca565e91b/src/filesystem/IItemBackend.ts) — [local evidence](../evidence/lemonate-2026-09-14/lemonate-gateway/source/src/filesystem/IItemBackend.ts)
- [src/filesystem/local/LocalFsItemBackend.ts](https://codeberg.org/Luminocity/lemonate-gateway/src/commit/03cd440d11b56a5b2e744192c51a61eca565e91b/src/filesystem/local/LocalFsItemBackend.ts) — [local evidence](../evidence/lemonate-2026-09-14/lemonate-gateway/source/src/filesystem/local/LocalFsItemBackend.ts)
- [src/filesystem/local/NodeFileSystem.ts](https://codeberg.org/Luminocity/lemonate-gateway/src/commit/03cd440d11b56a5b2e744192c51a61eca565e91b/src/filesystem/local/NodeFileSystem.ts) — [local evidence](../evidence/lemonate-2026-09-14/lemonate-gateway/source/src/filesystem/local/NodeFileSystem.ts)
- [src/filesystem/local/OfflineProjectRegistry.ts](https://codeberg.org/Luminocity/lemonate-gateway/src/commit/03cd440d11b56a5b2e744192c51a61eca565e91b/src/filesystem/local/OfflineProjectRegistry.ts) — [local evidence](../evidence/lemonate-2026-09-14/lemonate-gateway/source/src/filesystem/local/OfflineProjectRegistry.ts)
- [src/filesystem/local/ProjectSync.ts](https://codeberg.org/Luminocity/lemonate-gateway/src/commit/03cd440d11b56a5b2e744192c51a61eca565e91b/src/filesystem/local/ProjectSync.ts) — [local evidence](../evidence/lemonate-2026-09-14/lemonate-gateway/source/src/filesystem/local/ProjectSync.ts)
- [src/ItemRepo.ts](https://codeberg.org/Luminocity/lemonate-gateway/src/commit/03cd440d11b56a5b2e744192c51a61eca565e91b/src/ItemRepo.ts) — [local evidence](../evidence/lemonate-2026-09-14/lemonate-gateway/source/src/ItemRepo.ts)
- [src/JobManager.ts](https://codeberg.org/Luminocity/lemonate-gateway/src/commit/03cd440d11b56a5b2e744192c51a61eca565e91b/src/JobManager.ts) — [local evidence](../evidence/lemonate-2026-09-14/lemonate-gateway/source/src/JobManager.ts)
- [src/PlayModeUserEdits.ts](https://codeberg.org/Luminocity/lemonate-gateway/src/commit/03cd440d11b56a5b2e744192c51a61eca565e91b/src/PlayModeUserEdits.ts) — [local evidence](../evidence/lemonate-2026-09-14/lemonate-gateway/source/src/PlayModeUserEdits.ts)
- [src/repo/ApiGateway.ts](https://codeberg.org/Luminocity/lemonate-gateway/src/commit/03cd440d11b56a5b2e744192c51a61eca565e91b/src/repo/ApiGateway.ts) — [local evidence](../evidence/lemonate-2026-09-14/lemonate-gateway/source/src/repo/ApiGateway.ts)
- [src/UndoManager.ts](https://codeberg.org/Luminocity/lemonate-gateway/src/commit/03cd440d11b56a5b2e744192c51a61eca565e91b/src/UndoManager.ts) — [local evidence](../evidence/lemonate-2026-09-14/lemonate-gateway/source/src/UndoManager.ts)
- [test/testLocalFs.ts](https://codeberg.org/Luminocity/lemonate-gateway/src/commit/03cd440d11b56a5b2e744192c51a61eca565e91b/test/testLocalFs.ts) — [local evidence](../evidence/lemonate-2026-09-14/lemonate-gateway/source/test/testLocalFs.ts)
- [src/ApiClient.ts](https://codeberg.org/Luminocity/lemonate-gateway/src/commit/03cd440d11b56a5b2e744192c51a61eca565e91b/src/ApiClient.ts) — [local evidence](../evidence/lemonate-2026-09-14/lemonate-gateway/source/src/ApiClient.ts)

### lemonate-shared-ui

Revision: `b70070205fe260b4be2b44416f60fa9fe8a5e20f`.

- [LICENSE.txt](https://codeberg.org/Luminocity/lemonate-shared-ui/src/commit/b70070205fe260b4be2b44416f60fa9fe8a5e20f/LICENSE.txt) — [local evidence](../evidence/lemonate-2026-09-14/lemonate-shared-ui/source/LICENSE.txt)
- [README.md](https://codeberg.org/Luminocity/lemonate-shared-ui/src/commit/b70070205fe260b4be2b44416f60fa9fe8a5e20f/README.md) — [local evidence](../evidence/lemonate-2026-09-14/lemonate-shared-ui/source/README.md)

### lemonate-studio

Revision: `49b4c75ab225675be055ab175ad6426732ee8655`.

- [LICENSE.txt](https://codeberg.org/Luminocity/lemonate-studio/src/commit/49b4c75ab225675be055ab175ad6426732ee8655/LICENSE.txt) — [local evidence](../evidence/lemonate-2026-09-14/lemonate-studio/source/LICENSE.txt)
- [package.json](https://codeberg.org/Luminocity/lemonate-studio/src/commit/49b4c75ab225675be055ab175ad6426732ee8655/package.json) — [local evidence](../evidence/lemonate-2026-09-14/lemonate-studio/source/package.json)
- [src-electron/electron-main.ts](https://codeberg.org/Luminocity/lemonate-studio/src/commit/49b4c75ab225675be055ab175ad6426732ee8655/src-electron/electron-main.ts) — [local evidence](../evidence/lemonate-2026-09-14/lemonate-studio/source/src-electron/electron-main.ts)
- [src-electron/electron-preload.ts](https://codeberg.org/Luminocity/lemonate-studio/src/commit/49b4c75ab225675be055ab175ad6426732ee8655/src-electron/electron-preload.ts) — [local evidence](../evidence/lemonate-2026-09-14/lemonate-studio/source/src-electron/electron-preload.ts)
- [src-electron/fs-ipc.ts](https://codeberg.org/Luminocity/lemonate-studio/src/commit/49b4c75ab225675be055ab175ad6426732ee8655/src-electron/fs-ipc.ts) — [local evidence](../evidence/lemonate-2026-09-14/lemonate-studio/source/src-electron/fs-ipc.ts)
- [src-tauri/capabilities/default.json](https://codeberg.org/Luminocity/lemonate-studio/src/commit/49b4c75ab225675be055ab175ad6426732ee8655/src-tauri/capabilities/default.json) — [local evidence](../evidence/lemonate-2026-09-14/lemonate-studio/source/src-tauri/capabilities/default.json)
- [src-tauri/src/lib.rs](https://codeberg.org/Luminocity/lemonate-studio/src/commit/49b4c75ab225675be055ab175ad6426732ee8655/src-tauri/src/lib.rs) — [local evidence](../evidence/lemonate-2026-09-14/lemonate-studio/source/src-tauri/src/lib.rs)
- [src/boot/engine.ts](https://codeberg.org/Luminocity/lemonate-studio/src/commit/49b4c75ab225675be055ab175ad6426732ee8655/src/boot/engine.ts) — [local evidence](../evidence/lemonate-2026-09-14/lemonate-studio/source/src/boot/engine.ts)
- [src/boot/environment.ts](https://codeberg.org/Luminocity/lemonate-studio/src/commit/49b4c75ab225675be055ab175ad6426732ee8655/src/boot/environment.ts) — [local evidence](../evidence/lemonate-2026-09-14/lemonate-studio/source/src/boot/environment.ts)
- [src/modules/docking/layout.spec.ts](https://codeberg.org/Luminocity/lemonate-studio/src/commit/49b4c75ab225675be055ab175ad6426732ee8655/src/modules/docking/layout.spec.ts) — [local evidence](../evidence/lemonate-2026-09-14/lemonate-studio/source/src/modules/docking/layout.spec.ts)
- [src/modules/docking/layout.ts](https://codeberg.org/Luminocity/lemonate-studio/src/commit/49b4c75ab225675be055ab175ad6426732ee8655/src/modules/docking/layout.ts) — [local evidence](../evidence/lemonate-2026-09-14/lemonate-studio/source/src/modules/docking/layout.ts)
- [src/modules/ElectronFileSystem.ts](https://codeberg.org/Luminocity/lemonate-studio/src/commit/49b4c75ab225675be055ab175ad6426732ee8655/src/modules/ElectronFileSystem.ts) — [local evidence](../evidence/lemonate-2026-09-14/lemonate-studio/source/src/modules/ElectronFileSystem.ts)
- [src/modules/Environment.ts](https://codeberg.org/Luminocity/lemonate-studio/src/commit/49b4c75ab225675be055ab175ad6426732ee8655/src/modules/Environment.ts) — [local evidence](../evidence/lemonate-2026-09-14/lemonate-studio/source/src/modules/Environment.ts)
- [src/store/index.ts](https://codeberg.org/Luminocity/lemonate-studio/src/commit/49b4c75ab225675be055ab175ad6426732ee8655/src/store/index.ts) — [local evidence](../evidence/lemonate-2026-09-14/lemonate-studio/source/src/store/index.ts)
- [src/modules/docking/dockcontainer.ts](https://codeberg.org/Luminocity/lemonate-studio/src/commit/49b4c75ab225675be055ab175ad6426732ee8655/src/modules/docking/dockcontainer.ts) — [local evidence](../evidence/lemonate-2026-09-14/lemonate-studio/source/src/modules/docking/dockcontainer.ts)

## Verification limits

Hash verification checks preservation, not correctness. The JobManager polling and ProjectSync conflict findings are static control-flow inferences, not executed probes or production frequency measurements. No authenticated Lemonate cloud project or server deployment was inspected. Top-level license notices were collected for the engine, gateway, studio and shared UI; no upstream application code was incorporated into Forge.

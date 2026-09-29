# Post-plan gate inventory

76 textual throw sites in the selected current-source surface. This is an inventory, not a claim that all paths executed. The diagnosis's historical 54 is not a branch-coverage target. State conflicts, external failures and unsafe-content rejection must remain blockers.

| File | Line | Category | Throw expression |
|---|---:|---|---|
| src/generation/proposal.ts | 104 | Approval/edit state or patch contract | throw new ConflictError( "This proposal changed. Review it before applying this edit.", ); |
| src/generation/proposal.ts | 111 | Approval/edit state or patch contract | throw new ConflictError( "The edit replaces an unrelated or duplicate proposal section.", ); |
| src/generation/proposal.ts | 119 | Approval/edit state or patch contract | throw new ConflictError( "The edit contains no content change. The saved proposal and approval are retained.", ); |
| src/generation/proposal.ts | 145 | Approval/edit state or patch contract | throw new ConflictError( "This saved build has no complete proposal dependency map. Files and evidence are retained. Broad regeneration requires an explicit new build decision.", ); |
| src/generation/proposal.ts | 201 | Approval/edit state or patch contract | throw Error( "A scoped plan must replace only the affected tasks and requirements, preserving their IDs.", ); |
| src/generation/proposal.ts | 211 | Approval/edit state or patch contract | throw Error( "This edit changes file ownership or contracts beyond the declared dependency set. A broader plan must be reviewed explicitly.", ); |
| src/generation/proposal.ts | 219 | Approval/edit state or patch contract | throw Error("A scoped edit cannot drop existing proposal dependencies."); |
| src/generation/proposal.ts | 260 | Candidate structure/provenance | if (errors.length) throw Error(errors.join("\n")); |
| src/generation/plan-validation.ts | 22 | Candidate structure/provenance | throw Error( "This request requires an explicit asset strategy and assetNeeds for relevant external content.", ); |
| src/generation/plan-validation.ts | 31 | Candidate structure/provenance | throw Error( "Asset needs must have unique IDs and refer to existing requirements", ); |
| src/generation/plan-validation.ts | 46 | Candidate structure/provenance | throw Error("Asset need query, role and constraints cannot be blank"); |
| src/marketplace/asset-binding.ts | 55 | Candidate structure/provenance | throw Error( "Approved asset need link is stale or incompatible: " + group.label, ); |
| src/marketplace/asset-binding.ts | 76 | Candidate structure/provenance | throw Error("Ambiguous approved asset need link: " + group.label); |
| src/marketplace/asset-binding.ts | 89 | Approval/edit state or patch contract | throw Error("Approved asset option is missing: " + group.label); |
| src/marketplace/asset-binding.ts | 91 | Approval/edit state or patch contract | throw Error("Approved asset attachment is missing: " + group.label); |
| src/marketplace/asset-binding.ts | 104 | Candidate structure/provenance | throw Error( "Ambiguous legacy approved asset requirement: " + group.label, ); |
| src/marketplace/asset-binding.ts | 114 | Candidate structure/provenance | throw Error("Ambiguous legacy approved asset need: " + group.label); |
| src/marketplace/asset-binding.ts | 129 | Candidate structure/provenance | throw Error( "Approved asset needs a linked requirement before building: " + group.label + " #" + option.assetId, ); |
| src/marketplace/asset-binding.ts | 136 | Candidate structure/provenance | throw Error( "Approved asset kind is incompatible with its linked need: " + group.label, ); |
| src/marketplace/asset-binding.ts | 141 | Candidate structure/provenance | throw Error( "Multiple approved groups link to the same asset need: " + need.id, ); |
| src/marketplace/approved-adapter.ts | 106 | Approved selection enforcement | throw new AssetOperationError( "No approved asset matches " + need.role + ". Review asset choices before building. Find later remains unresolved.", [], "none", ); |
| src/marketplace/approved-adapter.ts | 136 | Approved selection enforcement | throw new AssetOperationError( "This asset was not approved for this requirement. Review the asset choices before importing a replacement.", [], "none", ); |
| src/generation/asset-pipeline.ts | 142 | External acquisition, evidence or lifecycle | throw Error( "Component stage need differs from declared acquisition context", ); |
| src/generation/asset-pipeline.ts | 150 | External acquisition, evidence or lifecycle | throw Error( "Component stage entries differ from declared acquisition context", ); |
| src/generation/asset-pipeline.ts | 159 | External acquisition, evidence or lifecycle | throw Error("Component stage candidate differs from current selection"); |
| src/generation/asset-pipeline.ts | 162 | External acquisition, evidence or lifecycle | throw Error("Component stage namespace is invalid"); |
| src/generation/asset-pipeline.ts | 204 | External acquisition, evidence or lifecycle | throw Error( "Component stage retained reference is not bound to this accepted context", ); |
| src/generation/asset-pipeline.ts | 327 | External acquisition, evidence or lifecycle | throw Error("Audio receipts do not identify one selected Studio"); |
| src/generation/asset-pipeline.ts | 341 | External acquisition, evidence or lifecycle | throw Error( "Placement audio must be a fresh capture from the same bound Studio process", ); |
| src/generation/asset-pipeline.ts | 384 | External acquisition, evidence or lifecycle | throw Error( "Asset pipeline requires a fresh run; historical/interrupted receipts cannot be reused", ); |
| src/generation/asset-pipeline.ts | 390 | External acquisition, evidence or lifecycle | throw Error("Duplicate asset need IDs"); |
| src/generation/asset-pipeline.ts | 396 | Candidate structure/provenance | throw Error("Asset need query, role and constraints cannot be blank"); |
| src/generation/asset-pipeline.ts | 403 | External acquisition, evidence or lifecycle | throw Error("Asset run/adapter identity mismatch"); |
| src/generation/asset-pipeline.ts | 410 | External acquisition, evidence or lifecycle | throw Error("Asset run entries do not match needs"); |
| src/generation/asset-pipeline.ts | 435 | External acquisition, evidence or lifecycle | throw new PersistenceHalt( "Asset history exceeded its bounded storage limit", !!owned \|\| run.requiresReconciliation === true, ); |
| src/generation/asset-pipeline.ts | 442 | External acquisition, evidence or lifecycle | throw new PersistenceHalt( "Cannot persist asset pipeline history: " + String(error), !!owned \|\| run.requiresReconciliation === true, ); |
| src/generation/asset-pipeline.ts | 450 | External acquisition, evidence or lifecycle | throw new PipelineHalt("Asset pipeline cancelled", "interrupted"); |
| src/generation/asset-pipeline.ts | 468 | External acquisition, evidence or lifecycle | if (error instanceof PersistenceHalt) throw error; |
| src/generation/asset-pipeline.ts | 508 | External acquisition, evidence or lifecycle | if (retry) throw adapterFailure; |
| src/generation/asset-pipeline.ts | 509 | External acquisition, evidence or lifecycle | throw new PipelineHalt( String(error), signal.aborted ? "interrupted" : "failed", uncertainMutation, ); |
| src/generation/asset-pipeline.ts | 532 | External acquisition, evidence or lifecycle | if (error instanceof PersistenceHalt) throw error; |
| src/generation/asset-pipeline.ts | 552 | External acquisition, evidence or lifecycle | throw new PipelineHalt( "Owned asset cleanup failed: " + String(error), signal.aborted ? "interrupted" : "failed", !cleaned, ); |
| src/generation/asset-pipeline.ts | 680 | External acquisition, evidence or lifecycle | throw error; |
| src/generation/asset-pipeline.ts | 750 | External acquisition, evidence or lifecycle | throw new PipelineHalt( "Embedded audio discovery requires an unchanged current-run retained component", ); |
| src/generation/asset-pipeline.ts | 779 | External acquisition, evidence or lifecycle | throw new PipelineHalt( "Embedded audio candidate origin differs from the retained component reference", ); |
| src/generation/asset-pipeline.ts | 868 | External acquisition, evidence or lifecycle | throw new PipelineHalt("Retry decision requires a nonblank query"); |
| src/generation/asset-pipeline.ts | 879 | External acquisition, evidence or lifecycle | throw new PipelineHalt( "Model selected an unoffered or already attempted candidate ID", ); |
| src/generation/asset-pipeline.ts | 909 | External acquisition, evidence or lifecycle | throw Error( "Inspection returned no owned token; native import outcome is unresolved", ); |
| src/generation/asset-pipeline.ts | 928 | External acquisition, evidence or lifecycle | throw new PipelineHalt( "Inspection did not return the selected candidate and an owned token", ); |
| src/generation/asset-pipeline.ts | 968 | External acquisition, evidence or lifecycle | throw Error( "Prepared component identity differs from selected asset or game context", ); |
| src/generation/asset-pipeline.ts | 1109 | External acquisition, evidence or lifecycle | throw Error( "Adapted component identity differs from selected asset/context or was not recaptured", ); |
| src/generation/asset-pipeline.ts | 1187 | External acquisition, evidence or lifecycle | throw Error( "Integration reference differs from reviewed need/component", ); |
| src/generation/asset-pipeline.ts | 1203 | External acquisition, evidence or lifecycle | throw new PipelineHalt( "Component preparation returned an unrelated generated bundle", ); |
| src/generation/asset-pipeline.ts | 1455 | External acquisition, evidence or lifecycle | throw new PipelineHalt( "Asset export must contain scene objects and no executable scripts", ); |
| src/generation/asset-pipeline.ts | 1518 | External acquisition, evidence or lifecycle | if (error instanceof PersistenceHalt) throw error; // Never issue an unlogged follow-up mutation. |
| src/generation/asset-pipeline.ts | 1530 | External acquisition, evidence or lifecycle | if (cleanupError instanceof PersistenceHalt) throw cleanupError; |
| src/generation/opencode-runtime.ts | 169 | Runtime protocol/admission | throw Error("Unknown output reference or offset."); |
| src/generation/opencode-runtime.ts | 217 | Runtime protocol/admission | if (res.destroyed) throw Error("Runtime disconnected."); |
| src/generation/opencode-runtime.ts | 275 | Runtime protocol/admission | if (!tool) throw Error("Unknown host tool."); |
| src/generation/opencode-runtime.ts | 289 | Runtime protocol/admission | throw Error( "OpenCode stopped after 12 tools without a validated checkpoint.", ); |
| src/generation/opencode-runtime.ts | 294 | Runtime protocol/admission | throw Error( "Tool evidence exceeds the bounded retrieval capacity. Saved project data remains intact.", ); |
| src/generation/opencode-runtime.ts | 327 | Runtime protocol/admission | throw Error("Missing local OpenCode address."); |
| src/generation/opencode-runtime.ts | 334 | Runtime protocol/admission | if (error) throw error; |
| src/generation/opencode-runtime.ts | 350 | Runtime protocol/admission | throw Error( "Configure FORGE_OPENCODE_BINARY with the absolute path to the pinned OpenCode 1.18.31 Windows executable.", ); |
| src/generation/opencode-runtime.ts | 360 | Runtime protocol/admission | throw Error( "OpenCode executable does not match the tested 1.18.31 Windows binary. Runtime was not started.", ); |
| src/generation/opencode-runtime.ts | 524 | Runtime protocol/admission | throw Error( "OpenCode exited without completing the required validated patches.", ); |
| src/generation/opencode-runtime.ts | 531 | Runtime protocol/admission | throw e; |
| src/generation/engine.ts | 2601 | Approval/edit state or patch contract | throw Error("Approve the exact saved proposal before building."); |
| src/generation/engine.ts | 2694 | Approval/edit state or patch contract | throw Error("Approved proposal changed or build cancelled."); |
| src/generation/engine.ts | 2696 | Approval/edit state or patch contract | throw Error( "Implementation planning needs a decision: " + p .spec!.questions.filter((q) => !q.optional && !p.answers[q.id]) .map((q) => q.prompt) .join(" ") + " Answer through the proposal conversation before continuing.", ); |
| src/generation/engine.ts | 2720 | Approval/edit state or patch contract | throw Error( "Scoped build changed an unrelated path: " + original.path + ". Previous artifact retained.", ); |
| src/generation/engine.ts | 3094 | Worker output or compiler contract | throw Error( "Takko resolved the requested assets. Return an updated task using only these retained imports and exact paths: " + JSON.stringify( p.assetPipeline?.entries.map((e) => ({ selected: e.selected, assets: e.bundle?.assets, paths: e.bundle?.scene.map((n) => n.path), component: e.component, })), ).slice(0, 2200), ); |
| src/generation/engine.ts | 3129 | Worker output or compiler contract | throw Error( "Builder returned an empty task for " + task.id + ": provide implemented coverage for every task requirement using existing context paths, or supply its implementation. Available evidence: " + [...existing].join(", "), ); |
| src/generation/engine.ts | 3151 | Worker output or compiler contract | throw Error(taskFailures.map((check) => check.detail).join("\n")); |
| src/generation/engine.ts | 3162 | Worker output or compiler contract | throw Error( "Task scripts must compile before becoming dependencies:\n" + failures .map((check) => check.id + ": " + check.detail) .join("\n"), ); |
| src/generation/engine.ts | 3188 | Approval/edit state or patch contract | throw Error("Generation cancelled before committing worker output"); |

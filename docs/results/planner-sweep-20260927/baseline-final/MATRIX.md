# Preserved planner corpus

No model calls. Raw outputs unchanged. Invalid optional metadata may be omitted ONLY in the labelled diagnostic projection. That does not count as a pass. Proposals are evaluated with their producer contract.

| Output | Accepted unchanged | Violations | Blocked / diagnostic omissions |
|---|---|---|---|
| demo-export-20260927/0 | true |  | Implementation-only gates: proposal output, not an implementation plan |
| demo-export-20260927/1 | false | plannerSchema: tasks.5.proposalSections.1: Invalid option: expected one of "mechanics"\|"theme"\|"environment"\|"assets"<br>plannerSchema: tasks.6.proposalSections.0: Invalid option: expected one of "mechanics"\|"theme"\|"environment"\|"assets" | tasks.5.proposalSections (schema issues retained)<br>tasks.6.proposalSections (schema issues retained) |
| demo-export-20260927/2 | false | plannerSchema: architectureProposal: Edge e8 connects hit_counter_state to itself. Internal lifecycle behaviour belongs on the system, not as an edge. Remove it. | architectureProposal (schema issues retained) |
| run13-live-20260927/0 | true |  | Implementation-only gates: proposal output, not an implementation plan |
| run13-live-20260927/1 | false | marketplaceDiscovery: Model discovery must start with a short subject query (at most four terms). Put descriptive constraints in constraints and search the complete reusable component before a replacement prop. The planner must choose the query; no substitute query is supplied.<br>completeCallback: Model discovery must start with a short subject query (at most four terms). Put descriptive constraints in constraints and search the complete reusable component before a replacement prop. The planner must choose the query; no substitute query is supplied. |  |
| run13-live-20260927/2 | false | plannerSchema: tasks.7.proposalSections.1: Invalid option: expected one of "mechanics"\|"theme"\|"environment"\|"assets" | tasks.7.proposalSections (schema issues retained) |
| run13-live-20260927/3 | false | JSON: Expected double-quoted property name in JSON at position 20993 (line 154 column 254) | All typed validation: malformed JSON |
| run13-live-20260927/4 | false | plannerSchema: tasks.7.proposalSections.0: Invalid option: expected one of "mechanics"\|"theme"\|"environment"\|"assets" | tasks.7.proposalSections (schema issues retained) |

# Additional research completion audit

Scope: additional research into Cursor-like systems, relevant open source and research papers that could improve Roblox generation while retaining inexpensive models. This phase does not require building the product or proving parity experimentally.

| Requirement | Completed evidence |
|---|---|
| Find relevant open-source implementations | 13 repository metadata/tree snapshots; 46 selected source, documentation and license files |
| Inspect rather than merely list resources | Focused functions and configuration findings in `12-open-source-reuse.md`; immutable file links in `notes/open-source-index.md` |
| Investigate papers and other engineering evidence | SkillsBench, SWE-agent, AlphaCodium, SWE-smith, Voyager, Holodeck, multi-turn conversation research and Vercel experiment; linked primary sources in `13-research-findings-and-experiments.md` |
| Connect findings to the user's requested product | Guided brief, actual HUD previews, verified recipes, project context, semantic tools, Studio verification and targeted repair |
| Evaluate low-cost and parity claims honestly | Eight controlled experiments, equal-system Astra comparator, total-cost accounting, and no claimed measured improvement |
| Preserve reusable notes and reproducibility | README and continuation updates; collection and integrity scripts; SHA-256/Git blob verification |

Verification commands: `node research/scripts/verify-open-source.cjs` and `node research/scripts/verify-dossier.cjs`. Their output artifacts record integrity and local-link results. Source integrity is not a generation-quality test.

No public source can establish Lemonade's unavailable backend implementation or actual failure frequencies. No paid model calls, asset imports, Studio modifications, or execution of downloaded agent code were needed. Those limits do not block completion of this research scope. Live integrations and quality/cost experiments remain future implementation work.

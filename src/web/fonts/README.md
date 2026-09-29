# Superseded typography assets

**These files are not referenced by any stylesheet and are not bundled.** The grok UI
redesign kept the existing system stack with a Segoe UI fallback so the app has no
font download and no external font dependency. See `docs/takko-grok-ui-implementation.md`
and `tests/browser/typography.spec.ts`, which asserts it.

They are kept, not deleted, because they were a deliberate licensed download and the
direction may be revisited. Wiring them back in means adding `@font-face` rules to
`src/web/tokens.css`, pointing `--font-display`, `--font-body` and `--font-mono` at
them, and updating the Segoe UI assertions in the typography spec.

Original note follows.

---

Selected from the open-source substitutes in the [Bugatti design analysis](https://github.com/VoltAgent/awesome-design-md/blob/main/design-md/bugatti/DESIGN.md), as requested on 2026-09-14:

- Saira Condensed 400: display headings and wordmark.
- EB Garamond 400–600: prose and creator prompt fields.
- JetBrains Mono 400–600: controls, metadata and source code.

These are the Google Fonts Latin WOFF2 subsets, downloaded on 2026-09-14 using the CSS2 API with `display=swap`. Garamond and JetBrains are variable weight files. Other characters use the CSS fallback stacks. Each font's unmodified SIL Open Font License is included alongside its binary, from the corresponding `ofl/` directory in [google/fonts](https://github.com/google/fonts).

Vite bundles these assets locally; the application makes no Google Fonts request. These are open-source substitutes, not Bugatti's proprietary fonts. The reference informs typography only; Forge retains its existing UI structure, colors, surfaces and interaction behavior.

# Forge typography assets

Selected from the open-source substitutes in the [Bugatti design analysis](https://github.com/VoltAgent/awesome-design-md/blob/main/design-md/bugatti/DESIGN.md), as requested on 2026-09-14:

- Saira Condensed 400: display headings and wordmark.
- EB Garamond 400–600: prose and creator prompt fields.
- JetBrains Mono 400–600: controls, metadata and source code.

These are the Google Fonts Latin WOFF2 subsets, downloaded on 2026-09-14 using the CSS2 API with `display=swap`. Garamond and JetBrains are variable weight files. Other characters use the CSS fallback stacks. Each font's unmodified SIL Open Font License is included alongside its binary, from the corresponding `ofl/` directory in [google/fonts](https://github.com/google/fonts).

Vite bundles these assets locally; the application makes no Google Fonts request. These are open-source substitutes, not Bugatti's proprietary fonts. The reference informs typography only; Forge retains its existing UI structure, colors, surfaces and interaction behavior.

# Current mascot variations

[Open the editable Figma board](https://www.figma.com/design/YfjtZOJSKgn85oXSE1NsY5/Takko?node-id=4-314).

Six variations of the current taco artwork: Chubby, Tallboy, Wink, Big grin, Cozy and Sidekick. Each has a standalone SVG and transparent 512px PNG. The board includes the original logo for comparison. These remain proposals, and the running app is unchanged.

Rebuild with `node design/takko-logo/current-style/build.mjs`. Verify with `node --test design/takko-logo/current-style/verify.mjs`. The builder reads `public/takko.svg` and uses the installed bundled Sharp runtime. The Figma import was visually verified as vector and text layers.

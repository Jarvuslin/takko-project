# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: b-foundation.spec.ts >> selected B workspace docks editing below the visible graph and preserves contracts
- Location: tests\browser\b-foundation.spec.ts:3:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('button', { name: 'Review changes', exact: true })
    - locator resolved to <button>Review changes</button>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div class="chat-heading">…</div> from <section class="chat-panel" aria-label="Project conversation">…</section> subtree intercepts pointer events
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <div class="chat-heading">…</div> from <section class="chat-panel" aria-label="Project conversation">…</section> subtree intercepts pointer events
    - retrying click action
      - waiting 100ms
    51 × waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - <div class="chat-heading">…</div> from <section class="chat-panel" aria-label="Project conversation">…</section> subtree intercepts pointer events
     - retrying click action
       - waiting 500ms
    - waiting for element to be visible, enabled and stable

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - complementary [ref=e4]:
    - link "Takko home" [ref=e5] [cursor=pointer]:
      - /url: /
      - generic [ref=e8]: takko
    - button "New project" [ref=e9] [cursor=pointer]
    - button "Marketplace" [ref=e13] [cursor=pointer]
    - navigation "Workspace" [ref=e17]:
      - button "Models" [ref=e18] [cursor=pointer]
      - button "Presets" [ref=e22] [cursor=pointer]
  - main [ref=e26]:
    - generic [ref=e27]:
      - text: Your projects
      - combobox "Open project" [ref=e28]:
        - option "New project"
        - option "Arena architecture dock regression" [selected]
        - option "Animation accessibility test"
        - option "A combat game"
        - option "A combat game"
        - option "An arena with short rounds"
        - option "A garden for friends to explore"
        - option "Navigation from the B icon rail"
        - option "Arena architecture dock regression"
        - option "A punch animation preview"
        - option "A cooperative garden game"
        - option "A combat game with energy"
        - option "Orchard"
        - option "Make a farming loop with crop growth, harvesting, selling and a"
        - option "A small puzzle game"
        - option "A cooperative farming game with a harvest shop"
        - option "A Studio recovery fixture"
        - option "A castle puzzle adventure"
        - option "A polling fixture game"
        - option "Build a butter game"
        - option "Animation pack preview test"
        - option "A cooperative farming game"
        - option "A farming game with a harvest shop"
        - option "Build a cookie scene"
        - option "A Steal a Brainrot style game"
        - option "Animation accessibility test"
        - option "A combat game"
        - option "A combat game"
        - option "An arena with short rounds"
        - option "A garden for friends to explore"
        - option "Make a game about a space station"
        - option "Make a pet rescue game"
        - option "Make a pet rescue game with trading"
        - option "Make a pet rescue game with trading"
        - option "Make a pet rescue game with trading"
        - option "Asset execution UI regression"
        - option "A punch animation preview"
        - option "A cooperative garden game"
        - option "A combat game with energy"
        - option "Orchard"
        - option "Make a farming loop with crop growth, harvesting, selling and a"
        - option "A small puzzle game"
        - option "A cooperative farming game with a harvest shop"
        - option "A Studio recovery fixture"
        - option "A castle puzzle adventure"
        - option "A polling fixture game"
        - option "Build a butter game"
        - option "Animation pack preview test"
        - option "A cooperative farming game"
        - option "A farming game with a harvest shop"
        - option "Build a cookie scene"
        - option "A Steal a Brainrot style game"
        - option "Animation accessibility test"
        - option "A combat game"
        - option "A combat game"
        - option "An arena with short rounds"
        - option "A garden for friends to explore"
        - option "Make a game about a space station"
        - option "Make a pet rescue game"
        - option "Make a pet rescue game with trading"
        - option "Make a pet rescue game with trading"
        - option "Make a pet rescue game with trading"
        - option "Asset execution UI regression"
        - option "A punch animation preview"
        - option "A cooperative garden game"
        - option "A combat game with energy"
        - option "Orchard"
        - option "Make a farming loop with crop growth, harvesting, selling and a"
        - option "A small puzzle game"
        - option "A cooperative farming game with a harvest shop"
        - option "A Studio recovery fixture"
        - option "A castle puzzle adventure"
        - option "A polling fixture game"
        - option "Build a butter game"
        - option "Animation pack preview test"
        - option "A cooperative farming game"
        - option "A farming game with a harvest shop"
        - option "Build a cookie scene"
        - option "A Steal a Brainrot style game"
        - option "Animation accessibility test"
        - option "A combat game"
        - option "A combat game"
        - option "An arena with short rounds"
        - option "A garden for friends to explore"
        - option "Make a game about a space station"
        - option "Make a pet rescue game"
        - option "Make a pet rescue game with trading"
        - option "Make a pet rescue game with trading"
        - option "Make a pet rescue game with trading"
        - option "Asset execution UI regression"
        - option "A punch animation preview"
        - option "A cooperative garden game"
        - option "A combat game with energy"
        - option "Orchard"
        - option "Make a farming loop with crop growth, harvesting, selling and a"
        - option "A small puzzle game"
        - option "A cooperative farming game with a harvest shop"
        - option "A Studio recovery fixture"
        - option "A castle puzzle adventure"
        - option "A polling fixture game"
        - option "Build a butter game"
        - option "Animation pack preview test"
        - option "A cooperative farming game"
        - option "A farming game with a harvest shop"
        - option "Build a cookie scene"
        - option "A Steal a Brainrot style game"
        - option "Animation accessibility test"
        - option "A combat game"
        - option "A combat game"
        - option "An arena with short rounds"
        - option "A garden for friends to explore"
        - option "Make a game about a space station"
        - option "Make a pet rescue game"
        - option "Make a pet rescue game with trading"
        - option "Make a pet rescue game with trading"
        - option "Make a pet rescue game with trading"
        - option "Asset execution UI regression"
        - option "A punch animation preview"
        - option "A cooperative garden game"
        - option "A combat game with energy"
        - option "Orchard"
        - option "Make a farming loop with crop growth, harvesting, selling and a"
        - option "A small puzzle game"
        - option "A cooperative farming game with a harvest shop"
        - option "A Studio recovery fixture"
        - option "A castle puzzle adventure"
        - option "A polling fixture game"
        - option "Build a butter game"
        - option "Animation pack preview test"
        - option "A cooperative farming game"
        - option "A farming game with a harvest shop"
        - option "Build a cookie scene"
        - option "A Steal a Brainrot style game"
        - option "Animation accessibility test"
        - option "A combat game"
        - option "A combat game"
        - option "An arena with short rounds"
        - option "A garden for friends to explore"
        - option "Make a game about a space station"
        - option "Make a pet rescue game"
        - option "Make a pet rescue game with trading"
        - option "Make a pet rescue game with trading"
        - option "Make a pet rescue game with trading"
        - option "Asset execution UI regression"
        - option "A punch animation preview"
        - option "A cooperative garden game"
        - option "A combat game with energy"
        - option "Orchard"
        - option "Make a farming loop with crop growth, harvesting, selling and a"
        - option "A small puzzle game"
        - option "A cooperative farming game with a harvest shop"
        - option "A Studio recovery fixture"
        - option "A castle puzzle adventure"
        - option "A polling fixture game"
        - option "Build a butter game"
        - option "Animation pack preview test"
        - option "A cooperative farming game"
        - option "A farming game with a harvest shop"
        - option "Build a cookie scene"
        - option "A Steal a Brainrot style game"
        - option "Animation accessibility test"
        - option "A combat game"
        - option "A combat game"
        - option "An arena with short rounds"
        - option "A garden for friends to explore"
        - option "Make a game about a space station"
        - option "Make a pet rescue game"
        - option "Make a pet rescue game with trading"
        - option "Make a pet rescue game with trading"
        - option "Make a pet rescue game with trading"
        - option "Asset execution UI regression"
        - option "A punch animation preview"
        - option "A cooperative garden game"
        - option "A combat game with energy"
        - option "Orchard"
        - option "Make a farming loop with crop growth, harvesting, selling and a"
        - option "A small puzzle game"
        - option "A cooperative farming game with a harvest shop"
        - option "A Studio recovery fixture"
        - option "A castle puzzle adventure"
        - option "A polling fixture game"
        - option "Build a butter game"
        - option "Animation pack preview test"
        - option "A cooperative farming game"
        - option "A farming game with a harvest shop"
        - option "Build a cookie scene"
        - option "A Steal a Brainrot style game"
        - option "Animation accessibility test"
        - option "A combat game"
        - option "A combat game"
        - option "An arena with short rounds"
        - option "A garden for friends to explore"
        - option "Make a game about a space station"
        - option "Make a pet rescue game"
        - option "Make a pet rescue game with trading"
        - option "Make a pet rescue game with trading"
        - option "Make a pet rescue game with trading"
        - option "Asset execution UI regression"
        - option "A punch animation preview"
        - option "A cooperative garden game"
        - option "A combat game with energy"
        - option "Orchard"
        - option "Make a farming loop with crop growth, harvesting, selling and a"
        - option "A small puzzle game"
        - option "A cooperative farming game with a harvest shop"
        - option "A Studio recovery fixture"
        - option "A castle puzzle adventure"
        - option "A polling fixture game"
        - option "Build a butter game"
        - option "Animation pack preview test"
        - option "A cooperative farming game"
        - option "A farming game with a harvest shop"
        - option "Build a cookie scene"
        - option "A Steal a Brainrot style game"
        - option "Animation accessibility test"
        - option "A combat game"
        - option "A combat game"
        - option "An arena with short rounds"
        - option "A garden for friends to explore"
        - option "Make a game about a space station"
        - option "Make a pet rescue game"
        - option "Make a pet rescue game with trading"
        - option "Make a pet rescue game with trading"
        - option "Make a pet rescue game with trading"
        - option "Asset execution UI regression"
        - option "Animation pack preview test"
        - option "A punch animation preview"
        - option "A cooperative garden game"
        - option "A combat game with energy"
        - option "Animation pack preview test"
        - option "A punch animation preview"
        - option "A cooperative garden game"
        - option "A combat game with energy"
        - option "A punch animation preview"
        - option "A cooperative garden game"
        - option "A combat game with energy"
        - option "Orchard"
        - option "Make a farming loop with crop growth, harvesting, selling and a"
        - option "A small puzzle game"
        - option "A cooperative farming game with a harvest shop"
        - option "A Studio recovery fixture"
        - option "A castle puzzle adventure"
        - option "A polling fixture game"
        - option "Build a butter game"
        - option "A cooperative farming game"
        - option "A farming game with a harvest shop"
        - option "Build a cookie scene"
        - option "A Steal a Brainrot style game"
        - option "Animation accessibility test"
        - option "A combat game"
        - option "A combat game"
        - option "An arena with short rounds"
        - option "A garden for friends to explore"
        - option "Make a game about a space station"
        - option "Make a pet rescue game"
        - option "Make a pet rescue game with trading"
        - option "Make a pet rescue game with trading"
        - option "Make a pet rescue game with trading"
        - option "Asset execution UI regression"
        - option "A punch animation preview"
        - option "A cooperative garden game"
        - option "A combat game with energy"
        - option "Orchard"
        - option "Make a farming loop with crop growth, harvesting, selling and a"
        - option "A small puzzle game"
        - option "A cooperative farming game with a harvest shop"
        - option "A Studio recovery fixture"
        - option "A castle puzzle adventure"
        - option "A polling fixture game"
        - option "Build a butter game"
        - option "A cooperative farming game"
        - option "A farming game with a harvest shop"
        - option "Build a cookie scene"
        - option "A Steal a Brainrot style game"
        - option "Animation accessibility test"
        - option "A combat game"
        - option "A combat game"
        - option "An arena with short rounds"
        - option "A garden for friends to explore"
        - option "Make a game about a space station"
        - option "Make a pet rescue game"
        - option "Make a pet rescue game with trading"
        - option "Make a pet rescue game with trading"
        - option "Make a pet rescue game with trading"
        - option "Asset execution UI regression"
        - option "A punch animation preview"
        - option "A cooperative garden game"
        - option "A combat game with energy"
        - option "Orchard"
        - option "Make a farming loop with crop growth, harvesting, selling and a"
        - option "A small puzzle game"
        - option "A cooperative farming game with a harvest shop"
        - option "A Studio recovery fixture"
        - option "A castle puzzle adventure"
        - option "A polling fixture game"
        - option "Build a butter game"
        - option "A cooperative farming game"
        - option "A farming game with a harvest shop"
        - option "Build a cookie scene"
        - option "A Steal a Brainrot style game"
        - option "Animation accessibility test"
        - option "A combat game"
        - option "A combat game"
        - option "An arena with short rounds"
        - option "A garden for friends to explore"
        - option "Make a game about a space station"
        - option "Make a pet rescue game"
        - option "Make a pet rescue game with trading"
        - option "Make a pet rescue game with trading"
        - option "Make a pet rescue game with trading"
        - option "Asset execution UI regression"
        - option "A punch animation preview"
        - option "A cooperative garden game"
        - option "A combat game with energy"
        - option "Orchard"
        - option "Make a farming loop with crop growth, harvesting, selling and a"
        - option "A small puzzle game"
        - option "A cooperative farming game with a harvest shop"
        - option "A Studio recovery fixture"
        - option "A castle puzzle adventure"
        - option "A polling fixture game"
        - option "Build a butter game"
        - option "A cooperative farming game"
        - option "A farming game with a harvest shop"
        - option "Build a cookie scene"
        - option "A Steal a Brainrot style game"
        - option "Animation accessibility test"
        - option "A combat game"
        - option "A combat game"
        - option "An arena with short rounds"
        - option "A garden for friends to explore"
        - option "Make a game about a space station"
        - option "Make a pet rescue game"
        - option "Make a pet rescue game with trading"
        - option "Make a pet rescue game with trading"
        - option "Make a pet rescue game with trading"
        - option "Asset execution UI regression"
        - option "A punch animation preview"
        - option "A cooperative garden game"
        - option "A combat game with energy"
        - option "Orchard"
        - option "Make a farming loop with crop growth, harvesting, selling and a"
        - option "A small puzzle game"
        - option "A cooperative farming game with a harvest shop"
        - option "A Studio recovery fixture"
        - option "A castle puzzle adventure"
        - option "A polling fixture game"
        - option "Build a butter game"
        - option "A cooperative farming game"
        - option "A farming game with a harvest shop"
        - option "Build a cookie scene"
        - option "A Steal a Brainrot style game"
        - option "Animation accessibility test"
        - option "A combat game"
        - option "A combat game"
        - option "An arena with short rounds"
        - option "A garden for friends to explore"
        - option "Make a game about a space station"
        - option "Make a pet rescue game"
        - option "Make a pet rescue game with trading"
        - option "Make a pet rescue game with trading"
        - option "Make a pet rescue game with trading"
        - option "Asset execution UI regression"
        - option "A punch animation preview"
        - option "A cooperative garden game"
        - option "A combat game with energy"
        - option "Orchard"
        - option "Make a farming loop with crop growth, harvesting, selling and a"
        - option "A small puzzle game"
        - option "A cooperative farming game with a harvest shop"
        - option "A Studio recovery fixture"
        - option "A castle puzzle adventure"
        - option "A polling fixture game"
        - option "Build a butter game"
        - option "A cooperative farming game"
        - option "A farming game with a harvest shop"
        - option "Build a cookie scene"
        - option "A Steal a Brainrot style game"
        - option "Animation accessibility test"
        - option "A combat game"
        - option "A combat game"
        - option "An arena with short rounds"
        - option "A garden for friends to explore"
        - option "Make a game about a space station"
        - option "Make a pet rescue game"
        - option "Make a pet rescue game with trading"
        - option "Make a pet rescue game with trading"
        - option "Make a pet rescue game with trading"
        - option "Asset execution UI regression"
        - option "A combat game"
        - option "A combat game"
        - option "A punch animation preview"
        - option "A combat game with energy"
        - option "A combat game"
        - option "A combat game"
        - option "A punch animation preview"
        - option "A cooperative garden game"
        - option "A combat game with energy"
        - option "A punch animation preview"
        - option "A cooperative garden game"
        - option "A combat game with energy"
        - option "A punch animation preview"
        - option "A cooperative garden game"
        - option "A combat game with energy"
        - option "A punch animation preview"
        - option "A cooperative garden game"
        - option "A combat game with energy"
        - option "A punch animation preview"
        - option "A cooperative garden game"
        - option "A combat game with energy"
        - option "A punch animation preview"
        - option "A cooperative garden game"
        - option "A combat game with energy"
        - option "Orchard"
        - option "Make a farming loop with crop growth, harvesting, selling and a"
        - option "A small puzzle game"
        - option "A cooperative farming game with a harvest shop"
        - option "A Studio recovery fixture"
        - option "A castle puzzle adventure"
        - option "A polling fixture game"
        - option "Build a butter game"
        - option "A cooperative farming game"
        - option "A farming game with a harvest shop"
        - option "Build a cookie scene"
        - option "A Steal a Brainrot style game"
        - option "An arena with short rounds"
        - option "A garden for friends to explore"
        - option "Make a game about a space station"
        - option "Make a pet rescue game"
        - option "Make a pet rescue game with trading"
        - option "Make a pet rescue game with trading"
        - option "Make a pet rescue game with trading"
        - option "Asset execution UI regression"
        - option "A punch animation preview"
        - option "A cooperative garden game"
        - option "A combat game with energy"
        - option "Orchard"
        - option "Make a farming loop with crop growth, harvesting, selling and a"
        - option "A small puzzle game"
        - option "A cooperative farming game with a harvest shop"
        - option "A Studio recovery fixture"
        - option "A castle puzzle adventure"
        - option "A polling fixture game"
        - option "Build a butter game"
        - option "A cooperative farming game"
        - option "A farming game with a harvest shop"
        - option "Build a cookie scene"
        - option "A Steal a Brainrot style game"
        - option "An arena with short rounds"
        - option "A garden for friends to explore"
        - option "Make a game about a space station"
        - option "Make a pet rescue game"
        - option "Make a pet rescue game with trading"
        - option "Make a pet rescue game with trading"
        - option "Make a pet rescue game with trading"
        - option "Asset execution UI regression"
        - option "A punch animation preview"
        - option "A cooperative garden game"
        - option "A combat game with energy"
        - option "Orchard"
        - option "Make a farming loop with crop growth, harvesting, selling and a"
        - option "A small puzzle game"
        - option "A cooperative farming game with a harvest shop"
        - option "A Studio recovery fixture"
        - option "A castle puzzle adventure"
        - option "A polling fixture game"
        - option "Build a butter game"
        - option "A cooperative farming game"
        - option "A farming game with a harvest shop"
        - option "Build a cookie scene"
        - option "A Steal a Brainrot style game"
        - option "An arena with short rounds"
        - option "A garden for friends to explore"
        - option "Make a game about a space station"
        - option "Make a pet rescue game"
        - option "Make a pet rescue game with trading"
        - option "Make a pet rescue game with trading"
        - option "Make a pet rescue game with trading"
        - option "Asset execution UI regression"
        - option "A punch animation preview"
        - option "A cooperative garden game"
        - option "A combat game with energy"
        - option "Orchard"
        - option "Make a farming loop with crop growth, harvesting, selling and a"
        - option "A small puzzle game"
        - option "A cooperative farming game with a harvest shop"
        - option "A Studio recovery fixture"
        - option "A castle puzzle adventure"
        - option "A polling fixture game"
        - option "Build a butter game"
        - option "A cooperative farming game"
        - option "A farming game with a harvest shop"
        - option "Build a cookie scene"
        - option "A Steal a Brainrot style game"
        - option "An arena with short rounds"
        - option "A garden for friends to explore"
        - option "Make a game about a space station"
        - option "Make a pet rescue game"
        - option "Make a pet rescue game with trading"
        - option "Make a pet rescue game with trading"
        - option "Make a pet rescue game with trading"
        - option "Asset execution UI regression"
        - option "Orchard"
        - option "A cooperative farming game with a harvest shop"
        - option "A Studio recovery fixture"
        - option "A punch animation preview"
        - option "A cooperative garden game"
        - option "A combat game with energy"
        - option "Orchard"
        - option "A cooperative farming game with a harvest shop"
        - option "A Studio recovery fixture"
        - option "A punch animation preview"
        - option "A cooperative garden game"
        - option "A combat game with energy"
        - option "A punch animation preview"
        - option "A cooperative garden game"
        - option "A combat game with energy"
        - option "Orchard"
        - option "Make a farming loop with crop growth, harvesting, selling and a"
        - option "A small puzzle game"
        - option "A cooperative farming game with a harvest shop"
        - option "A Studio recovery fixture"
        - option "A castle puzzle adventure"
        - option "A polling fixture game"
        - option "Build a butter game"
        - option "A cooperative farming game"
        - option "A farming game with a harvest shop"
        - option "Build a cookie scene"
        - option "A Steal a Brainrot style game"
        - option "An arena with short rounds"
        - option "A garden for friends to explore"
        - option "Make a game about a space station"
        - option "Make a pet rescue game"
        - option "Make a pet rescue game with trading"
        - option "Make a pet rescue game with trading"
        - option "Make a pet rescue game with trading"
        - option "Asset execution UI regression"
        - option "A punch animation preview"
        - option "A cooperative garden game"
        - option "A combat game with energy"
        - option "Orchard"
        - option "Make a farming loop with crop growth, harvesting, selling and a"
        - option "A small puzzle game"
        - option "A cooperative farming game with a harvest shop"
        - option "A Studio recovery fixture"
        - option "A castle puzzle adventure"
        - option "A polling fixture game"
        - option "Build a butter game"
        - option "A cooperative farming game"
        - option "A farming game with a harvest shop"
        - option "Build a cookie scene"
        - option "A Steal a Brainrot style game"
        - option "An arena with short rounds"
        - option "A garden for friends to explore"
        - option "Make a game about a space station"
        - option "Make a pet rescue game"
        - option "Make a pet rescue game with trading"
        - option "Make a pet rescue game with trading"
        - option "Make a pet rescue game with trading"
        - option "Asset execution UI regression"
    - generic [ref=e29]:
      - region "Game architecture" [ref=e30]:
        - generic [ref=e31]:
          - generic [ref=e32]:
            - strong [ref=e33]: Game architecture
            - generic [ref=e34]: draft · Unsaved architecture changes
          - generic [ref=e35]:
            - button "Build details" [ref=e36] [cursor=pointer]: Build
            - button "Source details" [ref=e37] [cursor=pointer]: Source
            - button "Studio details" [ref=e38] [cursor=pointer]: Studio
        - generic [ref=e39]:
          - generic [ref=e40]: 3 systems · 2 connections
          - button "Discard draft" [ref=e41] [cursor=pointer]
          - button "Connections" [ref=e42] [cursor=pointer]
          - button "Add system" [ref=e43] [cursor=pointer]
        - generic "Architecture canvas" [ref=e44]:
          - generic [ref=e45]:
            - img "System connections":
              - generic: Hit confirmed
              - generic: Energy changed
            - generic [ref=e46]:
              - button "Edit Combat rules" [ref=e47]:
                - generic [ref=e48]: Server · trusted logic
                - strong [ref=e49]: Combat rules
                - generic [ref=e50]: Design
              - generic [ref=e51]:
                - button "Receive at Combat rules" [ref=e52] [cursor=pointer]: ● In
                - button "Connect from Combat rules" [ref=e53] [cursor=pointer]: Out ●
            - generic [ref=e54]:
              - button "Edit Energy" [ref=e55]:
                - generic [ref=e56]: Server · trusted logic
                - strong [ref=e57]: Energy
                - generic [ref=e58]: Design
              - generic [ref=e59]:
                - button "Receive at Energy" [ref=e60] [cursor=pointer]: ● In
                - button "Connect from Energy" [ref=e61] [cursor=pointer]: Out ●
            - generic [ref=e62]:
              - button "Edit Ability HUD" [ref=e63]:
                - generic [ref=e64]: Player · presentation
                - strong [ref=e65]: Ability HUD
                - generic [ref=e66]: Design
              - generic [ref=e67]:
                - button "Receive at Ability HUD" [ref=e68] [cursor=pointer]: ● In
                - button "Connect from Ability HUD" [ref=e69] [cursor=pointer]: Out ●
        - generic "Canvas controls" [ref=e70]:
          - button "Zoom out canvas" [ref=e71] [cursor=pointer]: −
          - generic [ref=e72]: 25%
          - button "Zoom in canvas" [ref=e73] [cursor=pointer]: +
          - button "Fit" [ref=e74] [cursor=pointer]
          - button "Auto layout" [ref=e75] [cursor=pointer]
        - button "Review changes" [ref=e78] [cursor=pointer]
      - heading "Arena architecture dock regression" [level=1] [ref=e79]
      - region "Project conversation" [ref=e80]:
        - generic [ref=e81]:
          - strong [ref=e83]: Takko
          - generic [ref=e84]: draft
          - button "Latest ↓" [ref=e85] [cursor=pointer]
          - button "History" [ref=e86] [cursor=pointer]
        - generic [ref=e89]:
          - generic [ref=e90]: $0.0000 / $2.0000
          - generic "Saved conversation" [ref=e92]:
            - article [ref=e93]:
              - generic [ref=e94]:
                - strong [ref=e95]: You
                - generic [ref=e96]: Revision 1 · 12:03 PM
              - paragraph [ref=e97]: Arena architecture dock regression
            - article [ref=e98]:
              - generic [ref=e99]:
                - strong [ref=e100]: You
                - generic [ref=e101]: Revision 2 · 12:03 PM
              - paragraph [ref=e102]: "Updated game architecture: 3 systems, 2 connections."
          - group [ref=e103]:
            - generic "Preview an animation clip" [ref=e104] [cursor=pointer]
          - button "Plan the saved architecture, including every system and connection." [ref=e106] [cursor=pointer]:
            - text: Plan the saved architecture, including every system and connection.
            - generic [aria-hidden] [ref=e107]: ↗
          - generic [ref=e108]:
            - generic [ref=e109]:
              - region "Studio in conversation"
              - group [ref=e110]:
                - generic "Edit original brief" [ref=e111] [cursor=pointer]
                - generic [ref=e112]:
                  - heading "Your request" [level=2] [ref=e113]
                  - generic [ref=e114]: Revision 2
                - paragraph [ref=e115]: Editing the original brief replaces the active follow-up instructions. Your message history stays saved.
                - generic [ref=e116]: Project request
                - textbox "Project request" [ref=e117]: Arena architecture dock regression
              - generic [ref=e118]:
                - button "Shape my idea" [ref=e119] [cursor=pointer]
                - button "Plan this game ↗" [ref=e120] [cursor=pointer]:
                  - text: Plan this game
                  - generic [ref=e121]: ↗
                - button "Configure models" [ref=e122] [cursor=pointer]
              - paragraph [ref=e123]: Shape your idea into a clear game concept before planning. Uses your planner model and generation budget.
            - group [ref=e124]:
              - generic "Build plan · 0 tasks" [ref=e125] [cursor=pointer]
        - generic [ref=e126]:
          - generic [ref=e127]: Message
          - textbox "Message" [ref=e128]:
            - /placeholder: What would you like to add or change?
          - group "Attached assets"
          - generic [ref=e129]:
            - button "Browse Marketplace assets" [ref=e130] [cursor=pointer]
            - button "Attach Studio feedback" [ref=e133] [cursor=pointer]
            - button "Presets" [ref=e136] [cursor=pointer]
            - button "Budget for this generation" [ref=e139] [cursor=pointer]: Budget
            - button "Send message and update plan" [disabled] [ref=e140]
          - generic [ref=e143]: Sends your change for planning. Review the updated brief before building.
```

# Test source

```ts
  11  |     })
  12  |   ).json();
  13  |   const architecture = {
  14  |     nodes: [
  15  |       {
  16  |         id: "combat",
  17  |         name: "Combat",
  18  |         purpose: "Verify hits",
  19  |         authority: "server",
  20  |         x: 40,
  21  |         y: 50,
  22  |       },
  23  |       {
  24  |         id: "energy",
  25  |         name: "Energy",
  26  |         purpose: "Award energy",
  27  |         authority: "server",
  28  |         x: 320,
  29  |         y: 50,
  30  |       },
  31  |       {
  32  |         id: "hud",
  33  |         name: "Ability HUD",
  34  |         purpose: "Show energy",
  35  |         authority: "client",
  36  |         x: 600,
  37  |         y: 190,
  38  |       },
  39  |     ],
  40  |     edges: [
  41  |       {
  42  |         id: "hit",
  43  |         from: "combat",
  44  |         to: "energy",
  45  |         event: "Hit confirmed",
  46  |         effect: "Add ten energy",
  47  |         kind: "event",
  48  |       },
  49  |       {
  50  |         id: "meter",
  51  |         from: "energy",
  52  |         to: "hud",
  53  |         event: "Energy changed",
  54  |         effect: "Update ability meter",
  55  |         kind: "state",
  56  |       },
  57  |     ],
  58  |   };
  59  |   const save = await page.request.post(
  60  |     `/api/projects/${project.id}/architecture`,
  61  |     {
  62  |       data: {
  63  |         id: crypto.randomUUID(),
  64  |         revision: project.revision,
  65  |         architecture,
  66  |       },
  67  |     },
  68  |   );
  69  |   expect(save.ok()).toBeTruthy();
  70  |   await page.goto("/?project=" + project.id);
  71  |   const surface = page.locator(".map-surface");
  72  |   const closedHeight = (await surface.boundingBox())!.height;
  73  |   await page.getByRole("button", { name: "Edit Combat", exact: true }).click();
  74  |   const inspector = page.getByRole("complementary", {
  75  |     name: "Architecture inspector",
  76  |   });
  77  |   await expect(inspector).toBeVisible();
  78  |   await expect
  79  |     .poll(async () => {
  80  |       const map = (await surface.boundingBox())!;
  81  |       const dock = (await inspector.boundingBox())!;
  82  |       return map.y + map.height <= dock.y;
  83  |     })
  84  |     .toBe(true);
  85  |   if (info.project.name === "desktop") {
  86  |     expect((await surface.boundingBox())!.height).toBeLessThan(closedHeight);
  87  |     const chat = (await page
  88  |       .getByRole("region", { name: "Project conversation" })
  89  |       .boundingBox())!;
  90  |     expect((await surface.boundingBox())!.width).toBeGreaterThan(
  91  |       chat.width * 1.8,
  92  |     );
  93  |     const cards = await page.locator(".architecture-node").all();
  94  |     for (const label of await page.locator(".architecture-wires text").all()) {
  95  |       const l = (await label.boundingBox())!;
  96  |       for (const card of cards) {
  97  |         const c = (await card.boundingBox())!;
  98  |         expect(
  99  |           l.x + l.width <= c.x ||
  100 |             l.x >= c.x + c.width ||
  101 |             l.y + l.height <= c.y ||
  102 |             l.y >= c.y + c.height,
  103 |         ).toBe(true);
  104 |       }
  105 |     }
  106 |   }
  107 |   await page.getByLabel("System name", { exact: true }).fill("Combat rules");
  108 |   await page.getByRole("button", { name: "Close inspector" }).click();
  109 |   await page
  110 |     .getByRole("button", { name: "Review changes", exact: true })
> 111 |     .click();
      |      ^ Error: locator.click: Test timeout of 30000ms exceeded.
  112 |   await page
  113 |     .getByRole("button", { name: "Save architecture", exact: true })
  114 |     .click();
  115 |   await expect(
  116 |     page.getByRole("button", { name: "Review changes", exact: true }),
  117 |   ).toBeHidden();
  118 |   const saved = await (
  119 |     await page.request.get("/api/projects/" + project.id)
  120 |   ).json();
  121 |   expect(saved.architecture.nodes[0].name).toBe("Combat rules");
  122 |   expect(saved.architecture.edges).toEqual(architecture.edges);
  123 |   expect(saved.charges).toEqual([]);
  124 |   await page
  125 |     .getByRole("button", { name: "Edit Combat rules", exact: true })
  126 |     .click();
  127 |   await page.screenshot({
  128 |     path: `docs/results/b-foundation/dock-${info.project.name}.png`,
  129 |   });
  130 | });
  131 | 
  132 | test("B icon navigation retains project selection and real model settings", async ({
  133 |   page,
  134 | }, info) => {
  135 |   const p = await (
  136 |     await page.request.post("/api/projects", {
  137 |       data: { request: "Navigation from the B icon rail" },
  138 |     })
  139 |   ).json();
  140 |   await page.goto("/?project=" + p.id);
  141 |   if (info.project.name === "desktop") {
  142 |     await expect(page.locator(".workspace-native")).toBeVisible();
  143 |     await page.getByTitle("Projects", { exact: true }).click();
  144 |     await page.getByRole("searchbox", { name: "Search projects" }).fill(p.name);
  145 |     await page
  146 |       .getByRole("navigation", { name: "Projects", exact: true })
  147 |       .getByRole("button", { name: p.name, exact: true })
  148 |       .click();
  149 |     await expect(page.locator(".project-library")).not.toHaveAttribute(
  150 |       "open",
  151 |       "",
  152 |     );
  153 |   } else {
  154 |     await expect(page.getByLabel("Open project", { exact: true })).toBeVisible();
  155 |   }
  156 |   await page
  157 |     .getByRole("navigation", { name: "Workspace", exact: true })
  158 |     .getByRole("button", { name: "Models", exact: true })
  159 |     .click();
  160 |   await expect(page).toHaveURL(/#models$/);
  161 |   await expect(page.locator(".workspace-native")).toHaveCount(0);
  162 | });
  163 | 
```
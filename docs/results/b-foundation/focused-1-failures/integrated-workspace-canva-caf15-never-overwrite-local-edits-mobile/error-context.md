# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: integrated-workspace.spec.ts >> canvas and conversation stay visible and remote changes never overwrite local edits
- Location: tests\browser\integrated-workspace.spec.ts:11:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('region', { name: 'Game architecture' }).getByRole('button', { name: 'Load latest architecture' })
    - locator resolved to <button>Load latest architecture</button>
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
    48 × waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - <div class="chat-heading">…</div> from <section class="chat-panel" aria-label="Project conversation">…</section> subtree intercepts pointer events
     - retrying click action
       - waiting 500ms

```

# Page snapshot

```yaml
- generic [ref=f1e3]:
  - complementary [ref=f1e4]:
    - link "Takko home" [ref=f1e5] [cursor=pointer]:
      - /url: /
      - generic [ref=f1e8]: takko
    - button "New project" [ref=f1e9] [cursor=pointer]
    - button "Marketplace" [ref=f1e13] [cursor=pointer]
    - navigation "Workspace" [ref=f1e17]:
      - button "Models" [ref=f1e18] [cursor=pointer]
      - button "Presets" [ref=f1e22] [cursor=pointer]
  - main [ref=f1e26]:
    - generic [ref=f1e27]:
      - text: Your projects
      - combobox "Open project" [ref=f1e28]:
        - option "New project"
        - option "A combat game" [selected]
        - option "An arena with short rounds"
        - option "A garden for friends to explore"
        - option "Navigation from the B icon rail"
        - option "Arena architecture dock regression"
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
    - generic [ref=f1e29]:
      - region "Game architecture" [ref=f1e30]:
        - generic [ref=f1e31]:
          - generic [ref=f1e32]:
            - strong [ref=f1e33]: Game architecture
            - generic [ref=f1e34]: draft · Unsaved architecture changes
          - generic [ref=f1e35]:
            - button "Build details" [ref=f1e36] [cursor=pointer]: Build
            - button "Source details" [ref=f1e37] [cursor=pointer]: Source
            - button "Studio details" [ref=f1e38] [cursor=pointer]: Studio
        - generic [ref=f1e39]:
          - generic [ref=f1e40]: 2 systems · 0 connections
          - button "Discard draft" [ref=f1e41] [cursor=pointer]
          - button "Connections" [ref=f1e42] [cursor=pointer]
          - button "Add system" [ref=f1e43] [cursor=pointer]
        - generic "Architecture canvas" [ref=f1e44]:
          - generic [ref=f1e45]:
            - img "System connections"
            - generic [ref=f1e46]:
              - button "Edit Local combat" [ref=f1e47]:
                - generic [ref=f1e48]: Server · trusted logic
                - strong [ref=f1e49]: Local combat
                - generic [ref=f1e50]: Design
              - generic [ref=f1e51]:
                - button "Receive at Local combat" [ref=f1e52] [cursor=pointer]: ● In
                - button "Connect from Local combat" [ref=f1e53] [cursor=pointer]: Out ●
            - generic [ref=f1e54]:
              - button "Edit Energy" [ref=f1e55]:
                - generic [ref=f1e56]: Server · trusted logic
                - strong [ref=f1e57]: Energy
                - generic [ref=f1e58]: Design
              - generic [ref=f1e59]:
                - button "Receive at Energy" [ref=f1e60] [cursor=pointer]: ● In
                - button "Connect from Energy" [ref=f1e61] [cursor=pointer]: Out ●
        - generic "Canvas controls" [ref=f1e62]:
          - button "Zoom out canvas" [ref=f1e63] [cursor=pointer]: −
          - generic [ref=f1e64]: 25%
          - button "Zoom in canvas" [ref=f1e65] [cursor=pointer]: +
          - button "Fit" [ref=f1e66] [cursor=pointer]
          - button "Auto layout" [ref=f1e67] [cursor=pointer]
        - alert [ref=f1e69]:
          - text: A newer architecture arrived. Your edits are kept here.
          - button "Load latest architecture" [ref=f1e70] [cursor=pointer]
      - heading "A combat game" [level=1] [ref=f1e71]
      - region "Project conversation" [ref=f1e72]:
        - generic [ref=f1e73]:
          - strong [ref=f1e75]: Takko
          - generic [ref=f1e76]: draft
          - button "Latest ↓" [ref=f1e77] [cursor=pointer]
          - button "History" [ref=f1e78] [cursor=pointer]
        - generic [ref=f1e81]:
          - generic [ref=f1e82]: $0.0000 / $2.0000
          - generic "Saved conversation" [ref=f1e84]:
            - article [ref=f1e85]:
              - generic [ref=f1e86]:
                - strong [ref=f1e87]: You
                - generic [ref=f1e88]: Revision 1 · 12:04 PM
              - paragraph [ref=f1e89]: A combat game
          - group [ref=f1e90]:
            - generic "Preview an animation clip" [ref=f1e91] [cursor=pointer]
          - button "Plan the saved architecture, including every system and connection." [ref=f1e93] [cursor=pointer]:
            - text: Plan the saved architecture, including every system and connection.
            - generic [aria-hidden] [ref=f1e94]: ↗
          - generic [ref=f1e95]:
            - generic [ref=f1e96]:
              - region "Studio in conversation"
              - group [ref=f1e97]:
                - generic "Edit original brief" [ref=f1e98] [cursor=pointer]
                - generic [ref=f1e99]:
                  - heading "Your request" [level=2] [ref=f1e100]
                  - generic [ref=f1e101]: Revision 1
                - paragraph [ref=f1e102]: Editing the original brief replaces the active follow-up instructions. Your message history stays saved.
                - generic [ref=f1e103]: Project request
                - textbox "Project request" [ref=f1e104]: A combat game
              - generic [ref=f1e105]:
                - button "Shape my idea" [ref=f1e106] [cursor=pointer]
                - button "Plan this game ↗" [ref=f1e107] [cursor=pointer]:
                  - text: Plan this game
                  - generic [ref=f1e108]: ↗
                - button "Configure models" [ref=f1e109] [cursor=pointer]
              - paragraph [ref=f1e110]: Shape your idea into a clear game concept before planning. Uses your planner model and generation budget.
            - group [ref=f1e111]:
              - generic "Build plan · 0 tasks" [ref=f1e112] [cursor=pointer]
        - generic [ref=f1e113]:
          - generic [ref=f1e114]: Message
          - textbox "Message" [active] [ref=f1e115]:
            - /placeholder: What would you like to add or change?
            - text: Make attacks feel faster
          - group "Attached assets"
          - generic [ref=f1e116]:
            - button "Browse Marketplace assets" [ref=f1e117] [cursor=pointer]
            - button "Attach Studio feedback" [ref=f1e120] [cursor=pointer]
            - button "Presets" [ref=f1e123] [cursor=pointer]
            - button "Budget for this generation" [ref=f1e126] [cursor=pointer]: Budget
            - button "Send message and update plan" [ref=f1e127] [cursor=pointer]
          - generic [ref=f1e130]: Sends your change for planning. Review the updated brief before building.
```

# Test source

```ts
  1   | import { test, expect } from "@playwright/test";
  2   | import type { GameArchitecture } from "../../src/generation/architecture";
  3   | const node = (id: string) => ({
  4   |   id,
  5   |   name: id,
  6   |   purpose: "A game system",
  7   |   authority: "server" as const,
  8   |   x: 30,
  9   |   y: 30,
  10  | });
  11  | test("canvas and conversation stay visible and remote changes never overwrite local edits", async ({
  12  |   page,
  13  | }, info) => {
  14  |   const p = await (
  15  |     await page.request.post("/api/projects", {
  16  |       data: { request: "A combat game" },
  17  |     })
  18  |   ).json();
  19  |   let graph: GameArchitecture = { nodes: [node("Combat")], edges: [] };
  20  |   await page.route("**/api/projects/" + p.id, (r) =>
  21  |     r.fulfill({ json: { ...p, architecture: graph } }),
  22  |   );
  23  |   await page.goto("/?project=" + p.id);
  24  |   const map = page.getByRole("region", { name: "Game architecture" }),
  25  |     chat = page.getByRole("region", { name: "Project conversation" });
  26  |   await expect(map).toBeVisible();
  27  |   await expect(chat).toBeVisible();
  28  |   await expect(
  29  |     page.getByRole("tablist", { name: "Project views" }),
  30  |   ).toHaveCount(0);
  31  |   const m = await map.boundingBox(),
  32  |     c = await chat.boundingBox();
  33  |   if (info.project.name === "desktop") {
  34  |     expect(m!.width).toBeGreaterThan(c!.width);
  35  |     expect(m!.x + m!.width).toBeLessThanOrEqual(c!.x + 1);
  36  |   } else {
  37  |     expect(m!.y + m!.height).toBeLessThanOrEqual(c!.y + 1);
  38  |   }
  39  |   graph = { nodes: [node("Combat"), { ...node("Energy"), x: 270 }], edges: [] };
  40  |   await expect(
  41  |     map.getByRole("button", { name: "Edit Energy", exact: true }),
  42  |   ).toBeVisible({ timeout: 7000 });
  43  |   await map.getByRole("button", { name: "Edit Combat", exact: true }).click();
  44  |   await map.getByLabel("System name", { exact: true }).fill("Local combat");
  45  |   await page.reload();
  46  |   await map
  47  |     .getByRole("button", { name: "Edit Local combat", exact: true })
  48  |     .click();
  49  |   await expect(map.getByLabel("System name", { exact: true })).toHaveValue(
  50  |     "Local combat",
  51  |   );
  52  |   expect(
  53  |     await page.locator(".map-surface").evaluate((el) => el.scrollTop),
  54  |   ).toBe(0);
  55  |   expect(await map.evaluate((el) => el.scrollTop)).toBe(0);
  56  |   graph = {
  57  |     ...graph,
  58  |     nodes: [...graph.nodes, { ...node("HUD"), x: 270, y: 180 }],
  59  |   };
  60  |   await expect(map.getByRole("alert")).toContainText(
  61  |     "A newer architecture arrived",
  62  |     { timeout: 7000 },
  63  |   );
  64  |   await expect(map.getByLabel("System name", { exact: true })).toHaveValue(
  65  |     "Local combat",
  66  |   );
  67  |   await map.getByRole("button", { name: "Close inspector" }).click();
  68  |   await page
  69  |     .getByLabel("Message", { exact: true })
  70  |     .fill("Make attacks feel faster");
> 71  |   await map.getByRole("button", { name: "Load latest architecture" }).click();
      |                                                                       ^ Error: locator.click: Test timeout of 30000ms exceeded.
  72  |   await expect(
  73  |     map.getByRole("button", { name: "Edit HUD", exact: true }),
  74  |   ).toBeVisible();
  75  |   await expect(page.getByLabel("Message", { exact: true })).toHaveValue(
  76  |     "Make attacks feel faster",
  77  |   );
  78  |   await page.screenshot({
  79  |     path: `docs/results/integrated-workspace/workspace-${info.project.name}.png`,
  80  |   });
  81  | });
  82  | test("canvas pan, zoom, dragging and auto layout preserve game connection contracts", async ({
  83  |   page,
  84  | }, info) => {
  85  |   const p = await (
  86  |     await page.request.post("/api/projects", {
  87  |       data: { request: "A combat game" },
  88  |     })
  89  |   ).json();
  90  |   const architecture: GameArchitecture = {
  91  |     nodes: [node("Combat"), { ...node("Energy"), x: 260 }],
  92  |     edges: [
  93  |       {
  94  |         id: "hit",
  95  |         from: "Combat",
  96  |         to: "Energy",
  97  |         kind: "event",
  98  |         event: "Hit confirmed",
  99  |         effect: "Award energy",
  100 |       },
  101 |     ],
  102 |   };
  103 |   await page.request.post(`/api/projects/${p.id}/architecture`, {
  104 |     data: { id: crypto.randomUUID(), revision: p.revision, architecture },
  105 |   });
  106 |   await page.goto("/?project=" + p.id);
  107 |   const map = page.getByRole("region", { name: "Game architecture" }),
  108 |     surface = page.locator(".map-surface"),
  109 |     content = page.locator(".architecture-canvas");
  110 |   const before = await content.getAttribute("style");
  111 |   await map.getByRole("button", { name: "Zoom in canvas" }).click();
  112 |   await expect(content).not.toHaveAttribute("style", before!);
  113 |   if (info.project.name === "desktop") {
  114 |     const box = (await surface.boundingBox())!;
  115 |     await page.mouse.move(box.x + 30, box.y + box.height - 80);
  116 |     await page.mouse.down();
  117 |     await page.mouse.move(box.x + 80, box.y + box.height - 60);
  118 |     await page.mouse.up();
  119 |     const system = map.getByRole("button", {
  120 |       name: "Edit Combat",
  121 |       exact: true,
  122 |     });
  123 |     const b = (await system.boundingBox())!;
  124 |     await page.mouse.move(b.x + 25, b.y + 20);
  125 |     await page.mouse.down();
  126 |     await page.mouse.move(b.x + 65, b.y + 60, { steps: 5 });
  127 |     await page.mouse.up();
  128 |     await map.getByRole("button", { name: "Close inspector" }).click();
  129 |     await expect(
  130 |       map.getByRole("button", { name: "Review changes" }),
  131 |     ).toBeVisible();
  132 |   }
  133 |   await map.getByRole("button", { name: "Auto layout" }).click();
  134 |   await map.getByRole("button", { name: "Review changes" }).click();
  135 |   await expect(map).toContainText("Only node positions changed");
  136 |   await map.getByRole("button", { name: "Save architecture" }).click();
  137 |   await expect(
  138 |     map.getByRole("button", { name: "Review changes" }),
  139 |   ).toBeHidden();
  140 |   const saved = await (await page.request.get("/api/projects/" + p.id)).json();
  141 |   expect(saved.architecture.edges).toEqual(architecture.edges);
  142 |   expect(saved.architecture.nodes[1].x).toBeGreaterThan(
  143 |     saved.architecture.nodes[0].x,
  144 |   );
  145 | });
  146 | 
  147 | test("R15 previews respect reduced motion and recover explicitly when graphics context is lost", async ({
  148 |   page,
  149 | }) => {
  150 |   const p = await (
  151 |     await page.request.post("/api/projects", {
  152 |       data: { request: "Animation accessibility test" },
  153 |     })
  154 |   ).json();
  155 |   const clip = {
  156 |     version: 1,
  157 |     name: "R15 wave",
  158 |     rig: "R15",
  159 |     duration: 1,
  160 |     tracks: [
  161 |       {
  162 |         joint: "RightUpperArm",
  163 |         keys: [
  164 |           { time: 0, rotation: [0, 0, 0] },
  165 |           { time: 0.5, rotation: [0, 0, 1.2] },
  166 |           { time: 1, rotation: [0, 0, 0] },
  167 |         ],
  168 |       },
  169 |     ],
  170 |   };
  171 |   const imported = await page.request.post(`/api/projects/${p.id}/animations`, {
```
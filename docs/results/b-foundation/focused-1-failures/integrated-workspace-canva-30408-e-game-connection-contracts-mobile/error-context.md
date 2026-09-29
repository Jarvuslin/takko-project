# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: integrated-workspace.spec.ts >> canvas pan, zoom, dragging and auto layout preserve game connection contracts
- Location: tests\browser\integrated-workspace.spec.ts:82:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('region', { name: 'Game architecture' }).getByRole('button', { name: 'Review changes' })
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
    52 × waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - <div class="chat-heading">…</div> from <section class="chat-panel" aria-label="Project conversation">…</section> subtree intercepts pointer events
     - retrying click action
       - waiting 500ms

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
        - option "A combat game" [selected]
        - option "A combat game"
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
          - generic [ref=e40]: 2 systems · 1 connections
          - button "Discard draft" [ref=e41] [cursor=pointer]
          - button "Connections" [ref=e42] [cursor=pointer]
          - button "Add system" [ref=e43] [cursor=pointer]
        - generic "Architecture canvas" [ref=e44]:
          - generic [ref=e45]:
            - img "System connections":
              - generic: Hit confirmed
            - generic [ref=e46]:
              - button "Edit Combat" [ref=e47]:
                - generic [ref=e48]: Server · trusted logic
                - strong [ref=e49]: Combat
                - generic [ref=e50]: Design
              - generic [ref=e51]:
                - button "Receive at Combat" [ref=e52] [cursor=pointer]: ● In
                - button "Connect from Combat" [ref=e53] [cursor=pointer]: Out ●
            - generic [ref=e54]:
              - button "Edit Energy" [ref=e55]:
                - generic [ref=e56]: Server · trusted logic
                - strong [ref=e57]: Energy
                - generic [ref=e58]: Design
              - generic [ref=e59]:
                - button "Receive at Energy" [ref=e60] [cursor=pointer]: ● In
                - button "Connect from Energy" [ref=e61] [cursor=pointer]: Out ●
        - generic "Canvas controls" [ref=e62]:
          - button "Zoom out canvas" [ref=e63] [cursor=pointer]: −
          - generic [ref=e64]: 25%
          - button "Zoom in canvas" [ref=e65] [cursor=pointer]: +
          - button "Fit" [ref=e66] [cursor=pointer]
          - button "Auto layout" [active] [ref=e67] [cursor=pointer]
        - button "Review changes" [ref=e70] [cursor=pointer]
      - heading "A combat game" [level=1] [ref=e71]
      - region "Project conversation" [ref=e72]:
        - generic [ref=e73]:
          - strong [ref=e75]: Takko
          - generic [ref=e76]: draft
          - button "Latest ↓" [ref=e77] [cursor=pointer]
          - button "History" [ref=e78] [cursor=pointer]
        - generic [ref=e81]:
          - generic [ref=e82]: $0.0000 / $2.0000
          - generic "Saved conversation" [ref=e84]:
            - article [ref=e85]:
              - generic [ref=e86]:
                - strong [ref=e87]: You
                - generic [ref=e88]: Revision 1 · 12:04 PM
              - paragraph [ref=e89]: A combat game
            - article [ref=e90]:
              - generic [ref=e91]:
                - strong [ref=e92]: You
                - generic [ref=e93]: Revision 2 · 12:04 PM
              - paragraph [ref=e94]: "Updated game architecture: 2 systems, 1 connections."
          - group [ref=e95]:
            - generic "Preview an animation clip" [ref=e96] [cursor=pointer]
          - button "Plan the saved architecture, including every system and connection." [ref=e98] [cursor=pointer]:
            - text: Plan the saved architecture, including every system and connection.
            - generic [aria-hidden] [ref=e99]: ↗
          - generic [ref=e100]:
            - generic [ref=e101]:
              - region "Studio in conversation"
              - group [ref=e102]:
                - generic "Edit original brief" [ref=e103] [cursor=pointer]
                - generic [ref=e104]:
                  - heading "Your request" [level=2] [ref=e105]
                  - generic [ref=e106]: Revision 2
                - paragraph [ref=e107]: Editing the original brief replaces the active follow-up instructions. Your message history stays saved.
                - generic [ref=e108]: Project request
                - textbox "Project request" [ref=e109]: A combat game
              - generic [ref=e110]:
                - button "Shape my idea" [ref=e111] [cursor=pointer]
                - button "Plan this game ↗" [ref=e112] [cursor=pointer]:
                  - text: Plan this game
                  - generic [ref=e113]: ↗
                - button "Configure models" [ref=e114] [cursor=pointer]
              - paragraph [ref=e115]: Shape your idea into a clear game concept before planning. Uses your planner model and generation budget.
            - group [ref=e116]:
              - generic "Build plan · 0 tasks" [ref=e117] [cursor=pointer]
        - generic [ref=e118]:
          - generic [ref=e119]: Message
          - textbox "Message" [ref=e120]:
            - /placeholder: What would you like to add or change?
          - group "Attached assets"
          - generic [ref=e121]:
            - button "Browse Marketplace assets" [ref=e122] [cursor=pointer]
            - button "Attach Studio feedback" [ref=e125] [cursor=pointer]
            - button "Presets" [ref=e128] [cursor=pointer]
            - button "Budget for this generation" [ref=e131] [cursor=pointer]: Budget
            - button "Send message and update plan" [disabled] [ref=e132]
          - generic [ref=e135]: Sends your change for planning. Review the updated brief before building.
```

# Test source

```ts
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
  71  |   await map.getByRole("button", { name: "Load latest architecture" }).click();
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
> 134 |   await map.getByRole("button", { name: "Review changes" }).click();
      |                                                             ^ Error: locator.click: Test timeout of 30000ms exceeded.
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
  172 |     data: { id: crypto.randomUUID(), revision: p.revision, clip },
  173 |   });
  174 |   expect(imported.ok()).toBe(true);
  175 |   await page.emulateMedia({ reducedMotion: "reduce" });
  176 |   await page.goto("/?project=" + p.id);
  177 |   const viewer = page.getByRole("img", {
  178 |     name: "R15 wave on R15",
  179 |     exact: true,
  180 |   });
  181 |   await page.locator(".animation-player").scrollIntoViewIfNeeded();
  182 |   await viewer.scrollIntoViewIfNeeded();
  183 |   await expect(
  184 |     page.getByRole("button", { name: "Play animation", exact: true }),
  185 |   ).toBeVisible();
  186 |   await expect(viewer).toHaveAttribute("data-time", "0.000");
  187 |   await expect
  188 |     .poll(async () => Number(await viewer.getAttribute("data-triangles")))
  189 |     .toBe(180);
  190 |   await viewer.dispatchEvent("webglcontextlost");
  191 |   await expect(page.getByRole("alert")).toContainText(
  192 |     "lost its graphics context",
  193 |   );
  194 |   await page
  195 |     .getByRole("button", { name: "Retry preview", exact: true })
  196 |     .click();
  197 |   await viewer.scrollIntoViewIfNeeded();
  198 |   await expect
  199 |     .poll(async () => Number(await viewer.getAttribute("data-triangles")))
  200 |     .toBe(180);
  201 |   await expect(page.getByRole("alert")).toHaveCount(0);
  202 | });
  203 | 
```
# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: chat-architecture.spec.ts >> reviewed node connections persist and do not dispatch generation
- Location: tests\browser\chat-architecture.spec.ts:5:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('region', { name: 'Game architecture' }).getByRole('button', { name: 'Save architecture', exact: true })
    - locator resolved to <button>Save architecture</button>
  - attempting click action
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <textarea id="followup" maxlength="6000" placeholder="What would you like to add or change?"></textarea> from <section class="chat-panel" aria-label="Project conversation">…</section> subtree intercepts pointer events
    - retrying click action
    - waiting 20ms
    2 × waiting for element to be visible, enabled and stable
      - element is visible, enabled and stable
      - scrolling into view if needed
      - done scrolling
      - <textarea id="followup" maxlength="6000" placeholder="What would you like to add or change?"></textarea> from <section class="chat-panel" aria-label="Project conversation">…</section> subtree intercepts pointer events
    - retrying click action
      - waiting 100ms
    51 × waiting for element to be visible, enabled and stable
       - element is visible, enabled and stable
       - scrolling into view if needed
       - done scrolling
       - <textarea id="followup" maxlength="6000" placeholder="What would you like to add or change?"></textarea> from <section class="chat-panel" aria-label="Project conversation">…</section> subtree intercepts pointer events
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
        - option "A combat game with energy" [selected]
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
        - option "B icon rail c03868b7-413b-4b35-9c4c-e9a412930b74"
        - option "Arena architecture dock regression"
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
        - option "B icon rail fb172b23-7722-460f-b4b5-38b81ca55879"
        - option "Arena architecture dock regression"
        - option "Asset execution UI regression"
        - option "Animation accessibility test"
        - option "A combat game"
        - option "A combat game"
        - option "Navigation from the B icon rail"
        - option "Arena architecture dock regression"
        - option "Animation accessibility test"
        - option "A combat game"
        - option "A combat game"
        - option "Navigation from the B icon rail"
        - option "Arena architecture dock regression"
        - option "Animation accessibility test"
        - option "A combat game"
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
            - generic [ref=e34]: draft · Game architecture
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
          - button "Auto layout" [ref=e67] [cursor=pointer]
        - complementary "Architecture inspector" [ref=e68]:
          - generic [ref=e69]:
            - strong [ref=e70]: Energy
            - button "Close inspector" [ref=e71] [cursor=pointer]: ×
          - group "System details" [ref=e72]:
            - generic [ref=e74]:
              - text: System name
              - textbox "System name" [ref=e75]: Energy
            - generic [ref=e76]:
              - text: What does it do?
              - textbox "What does it do?" [ref=e77]: Store each player's energy.
            - generic [ref=e78]:
              - text: Runs on
              - combobox "Runs on" [ref=e79]:
                - 'option "Server: rules, rewards, damage" [selected]'
                - 'option "Player: controls, visuals, sound"'
                - 'option "Shared: reusable logic"'
            - paragraph [ref=e80]: No implementation is linked yet. Save and plan this architecture to assign files.
            - button "Discuss this system" [ref=e81] [cursor=pointer]
            - button "Remove system and its connections" [ref=e82] [cursor=pointer]
          - group "Connect systems" [ref=e83]:
            - generic [ref=e85]:
              - generic [ref=e86]:
                - text: From
                - combobox "From" [ref=e87]:
                  - option "Choose system"
                  - option "Combat" [selected]
                  - option "Energy"
              - generic [ref=e88]:
                - text: To
                - combobox "To" [ref=e89]:
                  - option "Choose system"
                  - option "Energy" [selected]
              - generic [ref=e90]:
                - text: Connection type
                - combobox "Connection type" [ref=e91]:
                  - option "When something happens" [selected]
                  - option "When a value changes"
            - generic [ref=e92]:
              - text: When
              - textbox "When" [ref=e93]:
                - /placeholder: A hit lands
            - generic [ref=e94]:
              - text: Then
              - textbox "Then" [ref=e95]:
                - /placeholder: Add 10 energy to the attacker. The server verifies the hit first.
            - button "Add connection" [ref=e96] [cursor=pointer]
          - list [ref=e97]:
            - listitem [ref=e98]:
              - generic [ref=e99]:
                - strong [ref=e100]: Combat → Energy
                - paragraph [ref=e101]: "When Hit confirmed: Award ten energy after server validation."
              - button "Remove connection Hit confirmed" [ref=e102] [cursor=pointer]: Remove
        - generic [ref=e103]:
          - generic [ref=e104]:
            - strong [ref=e105]: Review before saving
            - paragraph [ref=e106]: This replaces the architecture with 2 systems and 1 connections. Your old plan and approval will be cleared. The previous artifact stays in project history. Saving does not change Studio or spend money.
            - paragraph [ref=e107]: The next plan must assign every system and connection to requirements and implementation tasks. Runtime behavior still needs a build and a playtest.
          - button "Save architecture" [active] [ref=e109] [cursor=pointer]
      - heading "A combat game with energy" [level=1] [ref=e110]
      - region "Project conversation" [ref=e111]:
        - generic [ref=e112]:
          - strong [ref=e114]: Takko
          - generic [ref=e115]: draft
          - button "Latest ↓" [ref=e116] [cursor=pointer]
          - button "History" [ref=e117] [cursor=pointer]
        - generic [ref=e120]:
          - generic [ref=e121]: $0.0000 / $2.0000
          - generic "Saved conversation" [ref=e123]:
            - article [ref=e124]:
              - generic [ref=e125]:
                - strong [ref=e126]: You
                - generic [ref=e127]: Revision 1 · 12:17 PM
              - paragraph [ref=e128]: A combat game with energy
          - group [ref=e129]:
            - generic "Preview an animation clip" [ref=e130] [cursor=pointer]
          - generic [ref=e131]:
            - generic [ref=e132]:
              - region "Studio in conversation"
              - group [ref=e133]:
                - generic "Edit original brief" [ref=e134] [cursor=pointer]
                - generic [ref=e135]:
                  - heading "Your request" [level=2] [ref=e136]
                  - generic [ref=e137]: Revision 1
                - paragraph [ref=e138]: Editing the original brief replaces the active follow-up instructions. Your message history stays saved.
                - generic [ref=e139]: Project request
                - textbox "Project request" [ref=e140]: A combat game with energy
              - generic [ref=e141]:
                - button "Shape my idea" [ref=e142] [cursor=pointer]
                - button "Plan this game ↗" [ref=e143] [cursor=pointer]:
                  - text: Plan this game
                  - generic [ref=e144]: ↗
                - button "Configure models" [ref=e145] [cursor=pointer]
              - paragraph [ref=e146]: Shape your idea into a clear game concept before planning. Uses your planner model and generation budget.
            - group [ref=e147]:
              - generic "Build plan · 0 tasks" [ref=e148] [cursor=pointer]
        - generic [ref=e149]:
          - generic [ref=e150]: Message
          - textbox "Message" [ref=e151]:
            - /placeholder: What would you like to add or change?
          - group "Attached assets"
          - generic [ref=e152]:
            - button "Browse Marketplace assets" [ref=e153] [cursor=pointer]
            - button "Attach Studio feedback" [ref=e156] [cursor=pointer]
            - button "Presets" [ref=e159] [cursor=pointer]
            - button "Budget for this generation" [ref=e162] [cursor=pointer]: Budget
            - button "Send message and update plan" [disabled] [ref=e163]
          - generic [ref=e166]: Sends your change for planning. Review the updated brief before building.
```

# Test source

```ts
  1   | import { test, expect } from "@playwright/test";
  2   | import { randomUUID } from "node:crypto";
  3   | test.use({ video: "on" });
  4   | 
  5   | test("reviewed node connections persist and do not dispatch generation", async ({
  6   |   page,
  7   | }, info) => {
  8   |   const p = await (
  9   |     await page.request.post("/api/projects", {
  10  |       data: { request: "A combat game with energy" },
  11  |     })
  12  |   ).json();
  13  |   let generations = 0;
  14  |   await page.route(/\/api\/projects\/[^/]+\/(plan|build|concept)$/, (route) => {
  15  |     generations++;
  16  |     return route.abort();
  17  |   });
  18  |   await page.goto(`/?project=${p.id}`);
  19  |   const dialog = page.getByRole("region", { name: "Game architecture" });
  20  |   await dialog.getByRole("button", { name: "Add system", exact: true }).click();
  21  |   await dialog.getByLabel("System name", { exact: true }).fill("Combat");
  22  |   await dialog
  23  |     .getByLabel("What does it do?", { exact: true })
  24  |     .fill("Validate attacks and deal damage on the server.");
  25  |   await dialog.getByRole("button", { name: "Close inspector" }).click();
  26  |   await dialog.getByRole("button", { name: "Add system", exact: true }).click();
  27  |   await dialog.getByLabel("System name", { exact: true }).fill("Energy");
  28  |   await dialog
  29  |     .getByLabel("What does it do?", { exact: true })
  30  |     .fill("Store each player's energy.");
  31  |   await dialog
  32  |     .getByLabel("From", { exact: true })
  33  |     .selectOption({ label: "Combat" });
  34  |   await dialog
  35  |     .getByLabel("To", { exact: true })
  36  |     .selectOption({ label: "Energy" });
  37  |   await dialog.getByLabel("When", { exact: true }).fill("Hit confirmed");
  38  |   await dialog
  39  |     .getByLabel("Then", { exact: true })
  40  |     .fill("Award ten energy after server validation.");
  41  |   await dialog
  42  |     .getByRole("button", { name: "Add connection", exact: true })
  43  |     .click();
  44  |   await dialog
  45  |     .getByRole("button", { name: "Review changes", exact: true })
  46  |     .click();
  47  |   await expect(dialog).toContainText(
  48  |     "Saving does not change Studio or spend money",
  49  |   );
  50  |   expect(
  51  |     (await (await page.request.get(`/api/projects/${p.id}`)).json())
  52  |       .architecture,
  53  |   ).toBeUndefined();
  54  |   await dialog
  55  |     .getByRole("button", { name: "Save architecture", exact: true })
> 56  |     .click();
      |      ^ Error: locator.click: Test timeout of 30000ms exceeded.
  57  |   await expect(
  58  |     dialog.getByRole("button", { name: "Review changes", exact: true }),
  59  |   ).toBeHidden();
  60  |   await expect(dialog).toBeVisible();
  61  |   await expect(page.getByLabel("Saved conversation")).toContainText(
  62  |     "2 systems, 1 connections",
  63  |   );
  64  |   await page.reload();
  65  |   await expect(
  66  |     dialog.getByRole("button", { name: "Edit Combat", exact: true }),
  67  |   ).toBeVisible();
  68  |   await dialog
  69  |     .getByRole("button", { name: "Connections", exact: true })
  70  |     .click();
  71  |   await expect(dialog).toContainText(
  72  |     "Award ten energy after server validation",
  73  |   );
  74  |   await dialog.screenshot({
  75  |     path: `docs/results/chat-architecture-${info.project.name}.png`,
  76  |   });
  77  |   await page.keyboard.press("Escape");
  78  |   expect(generations).toBe(0);
  79  | });
  80  | 
  81  | test("chat retains message drafts and opens technical details without losing them", async ({
  82  |   page,
  83  | }) => {
  84  |   const p = await (
  85  |     await page.request.post("/api/projects", {
  86  |       data: { request: "A cooperative garden game" },
  87  |     })
  88  |   ).json();
  89  |   await page.goto(`/?project=${p.id}`);
  90  |   await page
  91  |     .getByLabel("Message", { exact: true })
  92  |     .fill("Add a shared harvest basket");
  93  |   await page.reload();
  94  |   const composer = await page.locator(".chat-composer").boundingBox();
  95  |   expect(composer!.y + composer!.height).toBeLessThanOrEqual(
  96  |     page.viewportSize()!.height + 1,
  97  |   );
  98  |   await expect(page.getByLabel("Message", { exact: true })).toHaveValue(
  99  |     "Add a shared harvest basket",
  100 |   );
  101 |   await page
  102 |     .getByRole("button", { name: "Source details", exact: true })
  103 |     .click();
  104 |   await expect(
  105 |     page.getByRole("dialog", { name: "Source details" }),
  106 |   ).toBeVisible();
  107 |   await page.keyboard.press("Escape");
  108 |   await expect(page.getByLabel("Message", { exact: true })).toHaveValue(
  109 |     "Add a shared harvest basket",
  110 |   );
  111 |   await page.getByRole("button", { name: "History", exact: true }).click();
  112 |   await page
  113 |     .getByLabel("Search saved messages", { exact: true })
  114 |     .fill("garden");
  115 |   await expect(page.getByRole("dialog")).toContainText(
  116 |     "A cooperative garden game",
  117 |   );
  118 |   await page.keyboard.press("Escape");
  119 |   await expect(
  120 |     page.getByRole("button", { name: "History", exact: true }),
  121 |   ).toBeFocused();
  122 | });
  123 | 
  124 | test("actual imported keyframes move the inline rig and survive refresh", async ({
  125 |   page,
  126 | }, info) => {
  127 |   const p = await (
  128 |     await page.request.post("/api/projects", {
  129 |       data: { request: "A punch animation preview" },
  130 |     })
  131 |   ).json();
  132 |   const clip = {
  133 |     version: 1,
  134 |     name: "Test punch",
  135 |     rig: "R6",
  136 |     duration: 1,
  137 |     tracks: [
  138 |       {
  139 |         joint: "Right Arm",
  140 |         keys: [
  141 |           { time: 0, rotation: [0, 0, 0] },
  142 |           { time: 0.5, rotation: [-1.5, 0, 0] },
  143 |           { time: 1, rotation: [0, 0, 0] },
  144 |         ],
  145 |       },
  146 |     ],
  147 |   };
  148 |   await page.goto(`/?project=${p.id}`);
  149 |   await page.getByText("Preview an animation clip", { exact: true }).click();
  150 |   await page.getByLabel("Animation clip JSON", { exact: true }).setInputFiles({
  151 |     name: "punch.json",
  152 |     mimeType: "application/json",
  153 |     buffer: Buffer.from(JSON.stringify(clip)),
  154 |   });
  155 |   const viewer = page.getByRole("img", {
  156 |     name: "Test punch on R6",
```
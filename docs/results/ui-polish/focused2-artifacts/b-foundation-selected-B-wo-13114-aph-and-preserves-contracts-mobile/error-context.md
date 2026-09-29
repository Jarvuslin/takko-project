# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: b-foundation.spec.ts >> selected B workspace docks editing below the visible graph and preserves contracts
- Location: tests\browser\b-foundation.spec.ts:3:1

# Error details

```
Error: expect(received).toBe(expected) // Object.is equality

Expected: true
Received: false

Call Log:
- Timeout 5000ms exceeded while waiting on the predicate
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
        - option "Orchard"
        - option "Make a farming loop with crop growth, harvesting, selling and a"
        - option "A small puzzle game"
        - option "A castle puzzle adventure"
        - option "Make a game about a space station"
        - option "Make a pet rescue game"
        - option "Make a pet rescue game with trading"
        - option "Make a pet rescue game with trading"
        - option "Make a pet rescue game with trading"
        - option "B icon rail 7f5ccc48-56aa-4f99-829f-53200f6f9240"
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
        - option "B icon rail 0ab438ee-08a4-4a50-8a61-39ca55134367"
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
        - option "B icon rail ed8a19e9-0e5e-481f-92f9-cef5dcf1eeca"
        - option "Arena architecture dock regression"
        - option "Asset execution UI regression"
        - option "Orchard"
        - option "Make a farming loop with crop growth, harvesting, selling and a"
        - option "A small puzzle game"
        - option "A castle puzzle adventure"
        - option "Orchard"
        - option "Make a farming loop with crop growth, harvesting, selling and a"
        - option "A small puzzle game"
        - option "A castle puzzle adventure"
        - option "Orchard"
        - option "Make a farming loop with crop growth, harvesting, selling and a"
        - option "A small puzzle game"
        - option "A castle puzzle adventure"
        - option "Orchard"
        - option "Make a farming loop with crop growth, harvesting, selling and a"
        - option "A small puzzle game"
        - option "A castle puzzle adventure"
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
        - option "B icon rail 911eaf10-0a0e-4084-8d41-142663a737f0"
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
        - option "B icon rail 70aaf97a-b73c-4dda-b24e-fe8f70b8e231"
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
            - generic [ref=e34]: draft · Saved architecture
          - generic [ref=e35]:
            - button "Build details" [ref=e36] [cursor=pointer]: Build
            - button "Source details" [ref=e37] [cursor=pointer]: Source
            - button "Studio details" [ref=e38] [cursor=pointer]: Studio
        - generic [ref=e39]:
          - generic [ref=e40]: 3 systems · 2 connections
          - button "Connections" [ref=e41] [cursor=pointer]
          - button "Add system" [ref=e42] [cursor=pointer]
        - generic "Architecture canvas" [ref=e43]:
          - generic [ref=e44]:
            - img "System connections":
              - generic: Hit confirmed
              - generic: Energy changed
            - generic [ref=e45]:
              - button "Edit Combat" [active] [ref=e46]:
                - generic [ref=e47]: Server · trusted logic
                - strong [ref=e48]: Combat
                - generic [ref=e49]: Design
              - generic [ref=e50]:
                - button "Receive at Combat" [ref=e51] [cursor=pointer]: ● In
                - button "Connect from Combat" [ref=e52] [cursor=pointer]: Out ●
            - generic [ref=e53]:
              - button "Edit Energy" [ref=e54]:
                - generic [ref=e55]: Server · trusted logic
                - strong [ref=e56]: Energy
                - generic [ref=e57]: Design
              - generic [ref=e58]:
                - button "Receive at Energy" [ref=e59] [cursor=pointer]: ● In
                - button "Connect from Energy" [ref=e60] [cursor=pointer]: Out ●
            - generic [ref=e61]:
              - button "Edit Ability HUD" [ref=e62]:
                - generic [ref=e63]: Player · presentation
                - strong [ref=e64]: Ability HUD
                - generic [ref=e65]: Design
              - generic [ref=e66]:
                - button "Receive at Ability HUD" [ref=e67] [cursor=pointer]: ● In
                - button "Connect from Ability HUD" [ref=e68] [cursor=pointer]: Out ●
        - generic "Canvas controls" [ref=e69]:
          - button "Zoom out canvas" [ref=e70] [cursor=pointer]: −
          - generic [ref=e71]: 25%
          - button "Zoom in canvas" [ref=e72] [cursor=pointer]: +
          - button "Fit" [ref=e73] [cursor=pointer]
          - button "Auto layout" [ref=e74] [cursor=pointer]
        - complementary "Architecture inspector" [ref=e75]:
          - generic [ref=e76]:
            - strong [ref=e77]: Combat
            - button "Connections" [ref=e78] [cursor=pointer]
            - button "Close inspector" [ref=e79] [cursor=pointer]: ×
          - group "System details" [ref=e80]:
            - generic [ref=e81]:
              - text: System name
              - textbox "System name" [ref=e82]: Combat
            - generic [ref=e83]:
              - text: What does it do?
              - textbox "What does it do?" [ref=e84]: Verify hits
            - generic [ref=e85]:
              - text: Runs on
              - combobox "Runs on" [ref=e86]:
                - 'option "Server: rules, rewards, damage" [selected]'
                - 'option "Player: controls, visuals, sound"'
                - 'option "Shared: reusable logic"'
            - paragraph [ref=e87]: No implementation is linked yet. Save and plan this architecture to assign files.
            - button "Discuss this system" [ref=e88] [cursor=pointer]
            - button "Remove system and its connections" [ref=e89] [cursor=pointer]
      - heading "Arena architecture dock regression" [level=1] [ref=e90]
      - region "Project conversation" [ref=e91]:
        - generic [ref=e92]:
          - strong [ref=e94]: Takko
          - generic [ref=e95]: draft
          - button "Latest ↓" [ref=e96] [cursor=pointer]
          - button "History" [ref=e97] [cursor=pointer]
        - generic [ref=e100]:
          - generic [ref=e101]: $0.0000 / $2.0000
          - generic "Saved conversation" [ref=e103]:
            - article [ref=e104]:
              - generic [ref=e105]:
                - strong [ref=e106]: You
                - generic [ref=e107]: r1 · 02:48 PM
              - paragraph [ref=e108]: Arena architecture dock regression
            - article [ref=e109]:
              - generic [ref=e110]:
                - strong [ref=e111]: You
                - generic [ref=e112]: r2 · 02:48 PM
              - paragraph [ref=e113]: "Updated game architecture: 3 systems, 2 connections."
          - group [ref=e114]:
            - generic "Preview an animation clip" [ref=e115] [cursor=pointer]
          - button "Plan the saved architecture, including every system and connection." [ref=e117] [cursor=pointer]:
            - text: Plan the saved architecture, including every system and connection.
            - generic [aria-hidden] [ref=e118]: ↗
          - generic [ref=e119]:
            - generic [ref=e120]:
              - region "Studio in conversation"
              - group [ref=e121]:
                - generic "Edit original brief" [ref=e122] [cursor=pointer]
              - generic [ref=e123]:
                - button "Shape my idea" [ref=e124] [cursor=pointer]
                - button "Plan this game ↗" [ref=e125] [cursor=pointer]:
                  - text: Plan this game
                  - generic [ref=e126]: ↗
                - button "Configure models" [ref=e127] [cursor=pointer]
              - paragraph [ref=e128]: Shape your idea, then review the plan before building. Uses your planner and generation budget.
            - paragraph [ref=e129]: Your build plan appears after planning.
        - generic [ref=e130]:
          - generic [ref=e131]: Message
          - textbox "Message" [ref=e132]:
            - /placeholder: What would you like to add or change?
          - generic [ref=e133]:
            - button "Browse Marketplace assets" [ref=e134] [cursor=pointer]
            - button "Attach Studio feedback" [ref=e137] [cursor=pointer]
            - button "Presets" [ref=e140] [cursor=pointer]
            - button "Budget for this generation" [ref=e143] [cursor=pointer]: Budget
            - button "Send message and update plan" [disabled] [ref=e144]
          - generic [ref=e147]: Enter to send · Shift + Enter for a new line
```

# Test source

```ts
  1   | import { test, expect } from "@playwright/test";
  2   | 
  3   | test("selected B workspace docks editing below the visible graph and preserves contracts", async ({
  4   |   page,
  5   | }, info) => {
  6   |   if (info.project.name === "desktop")
  7   |     await page.setViewportSize({ width: 1440, height: 900 });
  8   |   const project = await (
  9   |     await page.request.post("/api/projects", {
  10  |       data: { request: "Arena architecture dock regression" },
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
  85  |   await expect
  86  |     .poll(async () => {
  87  |       const map = (await surface.boundingBox())!;
  88  |       for (const card of await page.locator(".architecture-node").all()) {
  89  |         const box = (await card.boundingBox())!;
  90  |         if (box.y < map.y - 1 || box.y + box.height > map.y + map.height + 1)
  91  |           return false;
  92  |       }
  93  |       return true;
  94  |     })
> 95  |     .toBe(true);
      |      ^ Error: expect(received).toBe(expected) // Object.is equality
  96  |   if (info.project.name === "desktop") {
  97  |     expect((await surface.boundingBox())!.height).toBeLessThan(closedHeight);
  98  |     const chat = (await page
  99  |       .getByRole("region", { name: "Project conversation" })
  100 |       .boundingBox())!;
  101 |     expect((await surface.boundingBox())!.width).toBeGreaterThan(
  102 |       chat.width * 1.8,
  103 |     );
  104 |     const cards = await page.locator(".architecture-node").all();
  105 |     for (const label of await page.locator(".architecture-wires text").all()) {
  106 |       const l = (await label.boundingBox())!;
  107 |       const wires = (await page.locator(".architecture-wires").boundingBox())!;
  108 |       expect(l.y + l.height).toBeLessThanOrEqual(wires.y + wires.height);
  109 |       for (const card of cards) {
  110 |         const c = (await card.boundingBox())!;
  111 |         expect(
  112 |           l.x + l.width <= c.x ||
  113 |             l.x >= c.x + c.width ||
  114 |             l.y + l.height <= c.y ||
  115 |             l.y >= c.y + c.height,
  116 |         ).toBe(true);
  117 |       }
  118 |     }
  119 |   }
  120 |   await page.getByLabel("System name", { exact: true }).fill("Combat rules");
  121 |   await page.getByRole("button", { name: "Close inspector" }).click();
  122 |   await page
  123 |     .getByRole("button", { name: "Review changes", exact: true })
  124 |     .click();
  125 |   await page
  126 |     .getByRole("button", { name: "Save architecture", exact: true })
  127 |     .click();
  128 |   await expect(
  129 |     page.getByRole("button", { name: "Review changes", exact: true }),
  130 |   ).toBeHidden();
  131 |   const saved = await (
  132 |     await page.request.get("/api/projects/" + project.id)
  133 |   ).json();
  134 |   expect(saved.architecture.nodes[0].name).toBe("Combat rules");
  135 |   expect(saved.architecture.edges).toEqual(architecture.edges);
  136 |   expect(saved.charges).toEqual([]);
  137 |   await page
  138 |     .getByRole("button", { name: "Edit Combat rules", exact: true })
  139 |     .click();
  140 |   await page.screenshot({
  141 |     path: `docs/results/b-foundation/dock-${info.project.name}.png`,
  142 |   });
  143 | });
  144 | 
  145 | test("B icon navigation retains project selection and real model settings", async ({
  146 |   page,
  147 | }, info) => {
  148 |   const p = await (
  149 |     await page.request.post("/api/projects", {
  150 |       data: { request: "B icon rail " + crypto.randomUUID() },
  151 |     })
  152 |   ).json();
  153 |   await page.goto("/?project=" + p.id);
  154 |   if (info.project.name === "desktop") {
  155 |     await expect(page.locator(".workspace-native")).toBeVisible();
  156 |     await page.getByTitle("Projects", { exact: true }).click();
  157 |     await page.getByRole("searchbox", { name: "Search projects" }).fill(p.name);
  158 |     await page
  159 |       .getByRole("navigation", { name: "Projects", exact: true })
  160 |       .getByRole("button", { name: p.name, exact: true })
  161 |       .click();
  162 |     await expect(page.locator(".project-library")).not.toHaveAttribute(
  163 |       "open",
  164 |       "",
  165 |     );
  166 |   } else {
  167 |     await expect(
  168 |       page.getByLabel("Open project", { exact: true }),
  169 |     ).toBeVisible();
  170 |   }
  171 |   await page
  172 |     .getByRole("navigation", { name: "Workspace", exact: true })
  173 |     .getByRole("button", { name: "Models", exact: true })
  174 |     .click();
  175 |   await expect(page).toHaveURL(/#models$/);
  176 |   await expect(page.locator(".workspace-native")).toHaveCount(0);
  177 | });
  178 | 
```
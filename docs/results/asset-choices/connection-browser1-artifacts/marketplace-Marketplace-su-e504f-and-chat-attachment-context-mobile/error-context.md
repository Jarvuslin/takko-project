# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: marketplace.spec.ts >> Marketplace supports saved assets, inspected drag/drop and chat attachment context
- Location: tests\browser\marketplace.spec.ts:100:1

# Error details

```
Test timeout of 30000ms exceeded.
```

```
Error: locator.click: Test timeout of 30000ms exceeded.
Call log:
  - waiting for getByRole('complementary', { name: 'Marketplace' }).getByRole('button', { name: 'Close Marketplace' })

```

# Page snapshot

```yaml
- generic [ref=e3]:
  - complementary [ref=e4]:
    - link "Takko home" [ref=e5] [cursor=pointer]:
      - /url: /
      - generic [ref=e8]: takko
    - button "New project" [ref=e9] [cursor=pointer]
    - button "Marketplace" [expanded] [ref=e13] [cursor=pointer]
    - navigation "Workspace" [ref=e17]:
      - button "Models" [ref=e18] [cursor=pointer]
      - button "Presets" [ref=e22] [cursor=pointer]
    - group
  - main [ref=e26]:
    - button "Models" [ref=e29] [cursor=pointer]
    - generic [ref=e32]:
      - text: Your projects
      - combobox "Open project" [ref=e33]:
        - option "New project" [selected]
        - option "Build a butter game"
        - option "A quiet forest game"
        - option "Build a butter game"
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
        - option "B icon rail 42b8dfe0-9572-4cea-8dc5-bbc90b99357d"
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
        - option "B icon rail 9e482440-bab2-44cf-91c3-601b198f0cd8"
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
        - option "B icon rail d2bca917-09af-4dee-a80a-e9943cfcf5de"
        - option "Arena architecture dock regression"
        - option "Asset execution UI regression"
        - option "Make a game about a space station"
        - option "Make a pet rescue game"
        - option "Make a pet rescue game with trading"
        - option "Make a pet rescue game with trading"
        - option "Make a pet rescue game with trading"
        - option "Make a game about a space station"
        - option "Make a pet rescue game"
        - option "Make a pet rescue game with trading"
        - option "Make a pet rescue game with trading"
        - option "Make a pet rescue game with trading"
        - option "Make a game about a space station"
        - option "Make a pet rescue game"
        - option "Make a pet rescue game with trading"
        - option "Make a pet rescue game with trading"
        - option "Make a pet rescue game with trading"
        - option "Make a game about a space station"
        - option "Make a pet rescue game"
        - option "Make a pet rescue game with trading"
        - option "Make a pet rescue game with trading"
        - option "Make a pet rescue game with trading"
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
        - option "B icon rail e14af6e0-8f3e-4cb1-aaf4-8a834e1d7662"
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
        - option "B icon rail 0a1d1cf7-3c0c-45a6-aeb5-025777c1d997"
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
        - option "B icon rail 4e7d9ca5-df40-4272-826f-43b844bb86b7"
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
        - option "B icon rail a2d760a1-65cd-4be5-a628-9286d9a264e2"
        - option "Arena architecture dock regression"
        - option "Asset execution UI regression"
        - option "Orchard"
        - option "Make a farming loop with crop growth, harvesting, selling and a"
        - option "A small puzzle game"
        - option "A castle puzzle adventure"
        - option "Make a game about a space station"
        - option "Make a pet rescue game"
        - option "Make a pet rescue game with trading"
        - option "Make a pet rescue game with trading"
        - option "Make a pet rescue game with trading"
        - option "B icon rail 2c8d11c2-882d-495e-b202-a2120014c97c"
        - option "Arena architecture dock regression"
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
    - generic [ref=e34]:
      - heading "What do you want to build?" [level=1] [ref=e36]
      - paragraph [ref=e37]: Your next Roblox game starts with an idea.
      - generic [ref=e38]:
        - generic [ref=e39]: Game idea
        - textbox "Game idea" [ref=e40]:
          - /placeholder: Describe your game. Start with the fun part.
          - text: Make a satisfying butter game
        - group "Attached assets" [ref=e41]:
          - paragraph [ref=e42]: Selected assets · tell the AI what to keep or change
          - generic [ref=e43]:
            - generic [ref=e44]:
              - strong [ref=e45]: Working Butter
              - generic [ref=e46]: "#123 · inspected"
            - button "Remove Working Butter" [ref=e47] [cursor=pointer]
            - textbox "Use for Working Butter" [ref=e50]:
              - /placeholder: Use for… preserve its animations, change its controls…
          - status [ref=e51]: Inspected and attached. No issues found by static checks.
        - generic [ref=e52]:
          - button "Browse Marketplace assets" [ref=e53] [cursor=pointer]
          - button "Presets" [ref=e56] [cursor=pointer]
          - button "Budget for this generation" [ref=e59] [cursor=pointer]: Budget
          - button "Create project" [ref=e60] [cursor=pointer]
      - generic "Starting points" [ref=e64]:
        - button "Build an obby" [disabled] [ref=e65]
        - button "Make an arena" [disabled] [ref=e68]
        - button "Create a cozy world" [disabled] [ref=e71]
      - region "Recent projects" [ref=e74]:
        - heading "Pick up where you left off" [level=2] [ref=e75]
        - generic [ref=e76]:
          - button "Build a butter game draft" [ref=e77] [cursor=pointer]:
            - strong [ref=e78]: Build a butter game
            - generic [ref=e79]: draft
          - button "A quiet forest game draft" [ref=e80] [cursor=pointer]:
            - strong [ref=e81]: A quiet forest game
            - generic [ref=e82]: draft
          - button "Build a butter game draft" [ref=e83] [cursor=pointer]:
            - strong [ref=e84]: Build a butter game
            - generic [ref=e85]: draft
      - paragraph [ref=e86]: Plan it. Build it. Then test it in Studio.
  - dialog "Marketplace" [ref=e87]:
    - banner [ref=e88]:
      - generic [ref=e89]:
        - heading "Marketplace" [level=2] [ref=e90]
        - paragraph [ref=e91]: Discover free Roblox assets for your next idea.
      - button "Close Marketplace" [ref=e92] [cursor=pointer]
    - complementary "Marketplace" [ref=e95]:
      - generic [ref=e96]:
        - generic [ref=e97]:
          - text: Studio
          - combobox "Marketplace Studio" [ref=e98]:
            - option "Select Studio"
            - option "Test Studio" [selected]
        - button "Refresh Studios" [ref=e99] [cursor=pointer]
      - generic "Asset collections" [ref=e100]:
        - button "Search" [ref=e101] [cursor=pointer]
        - button "Library" [ref=e102] [cursor=pointer]
        - button "Liked" [ref=e103] [cursor=pointer]
        - button "Saved" [pressed] [ref=e104] [cursor=pointer]
      - generic [ref=e105]:
        - heading "Saved assets" [level=3] [ref=e106]
        - generic [ref=e107]: 1 assets · Free
      - article [ref=e109]:
        - link "Working Butter" [ref=e113] [cursor=pointer]:
          - /url: https://create.roblox.com/store/asset/123
        - generic [ref=e114]: Test Creator · Model
        - generic [ref=e115]: Inspected snapshot
        - generic [ref=e116]:
          - button "Like Working Butter" [pressed] [ref=e117] [cursor=pointer]
          - button "Save Working Butter" [pressed] [ref=e120] [cursor=pointer]:
            - generic [ref=e123]: Save
          - button "Add" [ref=e124] [cursor=pointer]
      - paragraph [ref=e127]: Add an asset to inspect it and attach it to your brief. Models with animation clips open a preview in your conversation. Static inspection does not verify gameplay or media permissions.
```

# Test source

```ts
  92  |   ).toHaveValue("Keep the animation and sound");
  93  |   await page.getByRole("link", { name: "Takko home", exact: true }).click();
  94  |   await expect(page.getByLabel("Game idea")).toBeVisible();
  95  |   await expect(
  96  |     page.getByLabel("Use for Working Butter", { exact: true }),
  97  |   ).toHaveCount(0);
  98  | });
  99  | 
  100 | test("Marketplace supports saved assets, inspected drag/drop and chat attachment context", async ({
  101 |   page,
  102 | }, testInfo) => {
  103 |   const asset: any = {
  104 |     assetId: "123",
  105 |     name: "Working Butter",
  106 |     kind: "Model",
  107 |     creatorName: "Test Creator",
  108 |     updated: "2026-09-16",
  109 |     versionId: "456",
  110 |     liked: false,
  111 |     saved: false,
  112 |   };
  113 |   let inspections = 0,
  114 |     submitted: any;
  115 |   await page.route("**/api/marketplace/**", async (route) => {
  116 |     const url = new URL(route.request().url()),
  117 |       body =
  118 |         route.request().method() === "GET"
  119 |           ? {}
  120 |           : route.request().postDataJSON();
  121 |     let result: any = {};
  122 |     if (url.pathname.endsWith("/studios"))
  123 |       result = {
  124 |         studios: [
  125 |           { id: "392fce6b-fea7-4de3-bb2e-49a95231c3f5", name: "Test Studio" },
  126 |         ],
  127 |       };
  128 |     else if (url.pathname.endsWith("/search")) result = { assets: [asset] };
  129 |     else if (url.pathname.endsWith("/inspect")) {
  130 |       inspections++;
  131 |       asset.inspection = {
  132 |         scannerVersion: 1,
  133 |         contentHash: "a".repeat(64),
  134 |         inspectedAt: new Date().toISOString(),
  135 |         status: "no_issues_found",
  136 |         findings: [],
  137 |         scriptCount: 1,
  138 |         nodeCount: 2,
  139 |       };
  140 |       result = { asset, cacheHit: inspections > 1 };
  141 |     } else if (url.pathname.endsWith("/library/123")) {
  142 |       Object.assign(asset, body);
  143 |       result = asset;
  144 |     } else if (url.pathname.endsWith("/library"))
  145 |       result = {
  146 |         assets: [asset].filter(
  147 |           (a) =>
  148 |             url.searchParams.get("filter") === "all" ||
  149 |             a[url.searchParams.get("filter")!],
  150 |         ),
  151 |       };
  152 |     await route.fulfill({ json: result });
  153 |   });
  154 |   await page.route("**/api/projects", async (route) => {
  155 |     if (route.request().method() !== "POST") return route.continue();
  156 |     submitted = route.request().postDataJSON();
  157 |     await route.fulfill({
  158 |       status: 400,
  159 |       json: {
  160 |         error: "Offline browser fixture: submitted attachment captured.",
  161 |       },
  162 |     });
  163 |   });
  164 |   await page.goto("/");
  165 |   await page.getByLabel("Game idea").fill("Make a satisfying butter game");
  166 |   await page
  167 |     .getByRole("button", { name: "Browse Marketplace assets", exact: true })
  168 |     .click();
  169 |   const panel = page.getByRole("complementary", { name: "Marketplace" });
  170 |   await expect(panel.getByLabel("Marketplace Studio")).toHaveValue(
  171 |     "392fce6b-fea7-4de3-bb2e-49a95231c3f5",
  172 |   );
  173 |   await panel.getByLabel("Search Marketplace", { exact: true }).fill("butter");
  174 |   await panel
  175 |     .getByRole("button", { name: "Search assets", exact: true })
  176 |     .click();
  177 |   const card = panel.getByRole("article");
  178 |   await expect(card.getByRole("link")).toHaveText("Working Butter");
  179 |   await card.getByLabel("Like Working Butter", { exact: true }).click();
  180 |   await expect(
  181 |     card.getByLabel("Like Working Butter", { exact: true }),
  182 |   ).toHaveAttribute("aria-pressed", "true");
  183 |   await card.getByLabel("Save Working Butter", { exact: true }).click();
  184 |   await panel.getByRole("button", { name: "Saved", exact: true }).click();
  185 |   await expect(card).toHaveCount(1);
  186 |   if (testInfo.project.name === "desktop") {
  187 |     await card.dragTo(page.getByLabel("Game idea"));
  188 |   } else await card.getByRole("button", { name: "Add", exact: true }).click();
  189 |   await expect(page.getByRole("status")).toContainText(
  190 |     "Inspected and attached",
  191 |   );
> 192 |   await page.getByRole("button", { name: "Close Marketplace" }).click();
      |                                                                  ^ Error: locator.click: Test timeout of 30000ms exceeded.
  193 |   await page
  194 |     .getByLabel("Use for Working Butter", { exact: true })
  195 |     .fill("Preserve its animation and sound");
  196 |   const accessibility = await new AxeBuilder({ page }).analyze();
  197 |   expect(accessibility.violations).toEqual([]);
  198 |   await page
  199 |     .getByRole("button", { name: "Create project", exact: true })
  200 |     .click();
  201 |   await expect
  202 |     .poll(() => submitted?.assetAttachments?.[0]?.usage)
  203 |     .toBe("Preserve its animation and sound");
  204 |   expect(submitted.assetAttachments[0].assetId).toBe("123");
  205 |   expect(submitted.assetAttachments[0].contentHash).toBe("a".repeat(64));
  206 |   await page.getByRole("button", { name: "Remove Working Butter" }).click();
  207 |   await page
  208 |     .getByRole("button", { name: "Browse Marketplace assets", exact: true })
  209 |     .click();
  210 |   await panel.getByRole("button", { name: "Saved", exact: true }).click();
  211 |   await card.getByRole("button", { name: "Add", exact: true }).click();
  212 |   await expect(page.getByRole("status")).toContainText("cached inspection");
  213 |   expect(
  214 |     await page.evaluate(
  215 |       () => document.documentElement.scrollWidth <= innerWidth,
  216 |     ),
  217 |   ).toBe(true);
  218 | });
  219 | 
  220 | test("blocked first drops display findings and never become chat attachments", async ({
  221 |   page,
  222 | }) => {
  223 |   await page.route("**/api/marketplace/studios", (r) =>
  224 |     r.fulfill({
  225 |       json: {
  226 |         studios: [
  227 |           { id: "392fce6b-fea7-4de3-bb2e-49a95231c3f5", name: "Test Studio" },
  228 |         ],
  229 |       },
  230 |     }),
  231 |   );
  232 |   await page.route("**/api/marketplace/inspect", (r) =>
  233 |     r.fulfill({
  234 |       json: {
  235 |         cacheHit: false,
  236 |         asset: {
  237 |           assetId: "123",
  238 |           name: "Suspicious model",
  239 |           inspection: {
  240 |             status: "blocked",
  241 |             findings: [
  242 |               {
  243 |                 rule: "dynamic-code",
  244 |                 message: "Dynamic code execution or environment manipulation.",
  245 |               },
  246 |             ],
  247 |           },
  248 |         },
  249 |       },
  250 |     }),
  251 |   );
  252 |   await page.goto("/");
  253 |   await page
  254 |     .getByRole("button", { name: "Browse Marketplace assets", exact: true })
  255 |     .click();
  256 |   await expect(page.getByLabel("Marketplace Studio")).not.toHaveValue("");
  257 |   await page.getByRole("button", { name: "Close Marketplace" }).click();
  258 |   const data = await page.evaluateHandle(() => {
  259 |     const d = new DataTransfer();
  260 |     d.setData("text/uri-list", "https://create.roblox.com/store/asset/123");
  261 |     return d;
  262 |   });
  263 |   await page
  264 |     .getByLabel("Game idea")
  265 |     .dispatchEvent("drop", { dataTransfer: data });
  266 |   await expect(page.getByRole("status")).toContainText("was not attached");
  267 |   await expect(
  268 |     page.getByText("Dynamic code execution or environment manipulation."),
  269 |   ).toBeVisible();
  270 |   await expect(
  271 |     page.getByRole("button", { name: "Remove Suspicious model" }),
  272 |   ).toHaveCount(0);
  273 | });
  274 | 
```
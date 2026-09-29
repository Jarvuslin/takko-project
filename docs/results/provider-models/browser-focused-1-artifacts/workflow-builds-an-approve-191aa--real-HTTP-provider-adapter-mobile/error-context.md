# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: workflow.spec.ts >> builds an approved non-combat project through a real HTTP provider adapter
- Location: tests\browser\workflow.spec.ts:223:1

# Error details

```
Error: "route.fetch: Test ended.
Call log:
  - → GET http://127.0.0.1:4319/api/models
    - user-agent: Mozilla/5.0 (iPhone; CPU iPhone OS 15_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/26.6 Mobile/15E148 Safari/604.1
    - accept: */*
    - accept-encoding: gzip,deflate,br
    - accept-language: en-US
    - content-type: application/json
    - referer: http://127.0.0.1:4319/
    - sec-ch-ua: "HeadlessChrome";v="153", "Not_A Brand";v="8", "Chromium";v="153"
    - sec-ch-ua-mobile: ?1
    - sec-ch-ua-platform: "iOS"
" while running route callback.
Consider awaiting `await page.unrouteAll({ behavior: 'ignoreErrors' })`
before the end of the test to ignore remaining routes in flight.
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
        - option "Orchard" [selected]
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
    - generic [ref=f1e29]:
      - region "Game architecture" [ref=f1e30]:
        - generic [ref=f1e31]:
          - generic [ref=f1e32]:
            - strong [ref=f1e33]: Game architecture
            - generic [ref=f1e34]: failed · Game architecture
          - generic [ref=f1e35]:
            - button "Build details" [ref=f1e36] [cursor=pointer]: Build
            - button "Source details" [ref=f1e37] [cursor=pointer]: Source
            - button "Studio details" [ref=f1e38] [cursor=pointer]: Studio
        - generic [ref=f1e39]:
          - generic [ref=f1e40]: 0 systems · 0 connections
          - button "Connections" [ref=f1e41] [cursor=pointer]
          - button "Add system" [ref=f1e42] [cursor=pointer]
        - generic "Architecture canvas" [ref=f1e43]:
          - generic [ref=f1e44]:
            - img "System connections"
            - paragraph [ref=f1e45]: Add your first system, such as Combat, Inventory or Quests.Connect an event to the behavior it should trigger.
        - generic "Canvas controls" [ref=f1e46]:
          - button "Zoom out canvas" [ref=f1e47] [cursor=pointer]: −
          - generic [ref=f1e48]: 100%
          - button "Zoom in canvas" [ref=f1e49] [cursor=pointer]: +
          - button "Fit" [ref=f1e50] [cursor=pointer]
          - button "Auto layout" [ref=f1e51] [cursor=pointer]
      - heading "Orchard" [level=1] [ref=f1e52]
      - region "Project conversation" [ref=f1e53]:
        - generic [ref=f1e54]:
          - strong [ref=f1e56]: Takko
          - generic [ref=f1e57]: failed
          - button "Latest ↓" [ref=f1e58] [cursor=pointer]
          - button "History" [ref=f1e59] [cursor=pointer]
        - generic [ref=f1e62]:
          - generic [ref=f1e63]: $0.0020 / $2.0000
          - generic "Saved conversation" [ref=f1e65]:
            - article [ref=f1e66]:
              - generic [ref=f1e67]:
                - strong [ref=f1e68]: You
                - generic [ref=f1e69]: Revision 1 · 01:37 PM
              - paragraph [ref=f1e70]: Build a farming game
            - article [ref=f1e71]:
              - generic [ref=f1e72]:
                - strong [ref=f1e73]: Takko
                - generic [ref=f1e74]: Revision 2 · 01:37 PM
              - paragraph [ref=f1e75]: Build a farming game
              - group [ref=f1e76]:
                - generic "Saved plan · Orchard" [ref=f1e77] [cursor=pointer]
              - group [ref=f1e78]:
                - generic "clarification · Activity · $0.0005" [ref=f1e79] [cursor=pointer]
              - generic "Rate this run" [ref=f1e80]:
                - button "Helpful" [ref=f1e81] [cursor=pointer]
                - button "Needs work" [ref=f1e82] [cursor=pointer]
            - article [ref=f1e83]:
              - generic [ref=f1e84]:
                - strong [ref=f1e85]: You
                - generic [ref=f1e86]: Revision 3 · 01:37 PM
              - paragraph [ref=f1e87]: "Which devices?: Desktop"
            - article [ref=f1e88]:
              - generic [ref=f1e89]:
                - strong [ref=f1e90]: Takko
                - generic [ref=f1e91]: Revision 3 · 01:37 PM
              - paragraph [ref=f1e92]: Build a farming game
              - group [ref=f1e93]:
                - generic "Saved plan · Orchard" [ref=f1e94] [cursor=pointer]
              - group [ref=f1e95]:
                - generic "review · Activity · $0.0005" [ref=f1e96] [cursor=pointer]
              - generic "Rate this run" [ref=f1e97]:
                - button "Helpful" [ref=f1e98] [cursor=pointer]
                - button "Needs work" [ref=f1e99] [cursor=pointer]
            - article [ref=f1e100]:
              - generic [ref=f1e101]:
                - strong [ref=f1e102]: Takko
                - generic [ref=f1e103]: Revision 3 · 01:38 PM
              - paragraph [ref=f1e104]: Approved plan for revision 3.
            - article [ref=f1e105]:
              - generic [ref=f1e106]:
                - strong [ref=f1e107]: Takko
                - generic [ref=f1e108]: Revision 3 · 01:38 PM
              - paragraph [ref=f1e109]: Build ready to test in Studio
              - group [ref=f1e110]:
                - generic "Saved plan · Orchard" [ref=f1e111] [cursor=pointer]
              - group [ref=f1e112]:
                - generic "ready to test · Activity · $0.0010" [ref=f1e113] [cursor=pointer]
              - generic "Rate this run" [ref=f1e114]:
                - button "Helpful" [ref=f1e115] [cursor=pointer]
                - button "Needs work" [ref=f1e116] [cursor=pointer]
              - group [ref=f1e117]:
                - generic "1 scripts in this build" [ref=f1e118] [cursor=pointer]
          - group [ref=f1e119]:
            - generic "Preview an animation clip" [ref=f1e120] [cursor=pointer]
          - 'button "Revise the plan to address this failure without changing the game''s scope: Builder stopped before final validation" [ref=f1e122] [cursor=pointer]':
            - text: "Revise the plan to address this failure without changing the game's scope: Builder stopped before final validation"
            - generic [aria-hidden] [ref=f1e123]: ↗
          - alert [ref=f1e124]:
            - paragraph [ref=f1e125]: Builder stopped before final validation
          - generic [ref=f1e126]:
            - generic [ref=f1e127]:
              - region "Studio in conversation" [ref=f1e128]:
                - generic [ref=f1e129]:
                  - generic [ref=f1e130]: Connect Studio to apply and test. Chat remains available.
                  - button "Connect Studio" [ref=f1e131] [cursor=pointer]
                  - button "Attach screenshot or review details" [ref=f1e132] [cursor=pointer]
              - group [ref=f1e133]:
                - generic "Edit original brief" [ref=f1e134] [cursor=pointer]
              - generic [ref=f1e135]:
                - button "Update & replan ↗" [ref=f1e136] [cursor=pointer]:
                  - text: Update & replan
                  - generic [ref=f1e137]: ↗
                - button "Configure models" [ref=f1e138] [cursor=pointer]
              - generic [ref=f1e139]:
                - text: EXPERIENCE DIRECTION
                - heading "Build a farming game" [level=2] [ref=f1e140]
                - paragraph [ref=f1e141]: Readable silhouettes and warm lighting
              - group [ref=f1e142]:
                - generic "Specification · 1 requirements" [ref=f1e143] [cursor=pointer]
              - button "Approve specification" [ref=f1e145] [cursor=pointer]
            - group [ref=f1e146]:
              - generic "Build plan · 1 tasks" [ref=f1e147] [cursor=pointer]
          - dialog "Source details" [ref=f1e148]:
            - generic [ref=f1e149]:
              - heading "Source details" [level=2] [ref=f1e151]
              - button "Close dialog" [active] [ref=f1e152] [cursor=pointer]
            - generic [ref=f1e156]:
              - generic [ref=f1e158]:
                - heading "The generated project" [level=2] [ref=f1e159]
                - paragraph [ref=f1e160]: These are the actual scripts and scene objects exported to Studio.
              - generic [ref=f1e161]:
                - navigation "Generated scripts" [ref=f1e162]:
                  - button "ServerScriptService/Forge_a08c0c4cdf9e/Game.server.luau" [ref=f1e163] [cursor=pointer]
                - generic [ref=f1e164]:
                  - generic [ref=f1e165]: Script · Game.server.luau
                  - code [ref=f1e167]: local state = Instance.new("IntValue") state.Name = "Harvest" state.Value = 1 state.Parent = script.Parent
              - group [ref=f1e168]:
                - generic "Scene manifest · 1 objects" [ref=f1e169] [cursor=pointer]
              - group [ref=f1e170]:
                - generic "Assets · 0" [ref=f1e171] [cursor=pointer]
        - generic [ref=f1e172]:
          - generic [ref=f1e173]: Message
          - textbox "Message" [ref=f1e174]:
            - /placeholder: What would you like to add or change?
          - group "Attached assets"
          - generic [ref=f1e175]:
            - button "Browse Marketplace assets" [ref=f1e176] [cursor=pointer]
            - button "Attach Studio feedback" [ref=f1e179] [cursor=pointer]
            - button "Presets" [ref=f1e182] [cursor=pointer]
            - button "Budget for this generation" [ref=f1e185] [cursor=pointer]: Budget
            - button "Send message and update plan" [disabled] [ref=f1e186]
          - generic [ref=f1e189]: Sends your change for planning. Review the updated brief before building.
```

# Test source

```ts
  1  | import type { Page } from "@playwright/test";
  2  | 
  3  | // Browser-only provider boundary. Backend authentication and persistence have separate API tests.
  4  | export async function mockProviderConnections(page: Page) {
  5  |   let connections: {
  6  |     provider: string;
  7  |     baseUrl: string;
  8  |     hasKey: boolean;
  9  |     validated: boolean;
  10 |   }[] = [];
  11 |   await page.route("**/api/models", async (route) => {
  12 |     if (route.request().method() !== "GET") return route.continue();
> 13 |     const response = await route.fetch();
     |                                  ^ Error: "route.fetch: Test ended.
  14 |     await route.fulfill({
  15 |       json: {
  16 |         ...(await response.json()),
  17 |         connections,
  18 |         credentialStorage: "windows-encrypted",
  19 |       },
  20 |     });
  21 |   });
  22 |   await page.route("**/api/provider-connections", async (route) => {
  23 |     const { profile, key } = route.request().postDataJSON();
  24 |     if (key === "rejected-fixture")
  25 |       return route.fulfill({
  26 |         status: 400,
  27 |         json: { error: "Provider rejected this key" },
  28 |       });
  29 |     connections = connections.filter(
  30 |       (c) => c.provider !== profile.provider || c.baseUrl !== profile.baseUrl,
  31 |     );
  32 |     if (route.request().method() !== "DELETE")
  33 |       connections.push({
  34 |         provider: profile.provider,
  35 |         baseUrl: profile.baseUrl,
  36 |         hasKey: true,
  37 |         validated: true,
  38 |       });
  39 |     const response = await page.request.get("/api/models");
  40 |     await route.fulfill({
  41 |       json: {
  42 |         ...(await response.json()),
  43 |         connections,
  44 |         credentialStorage: "windows-encrypted",
  45 |       },
  46 |     });
  47 |   });
  48 |   await page.route("**/api/model-profiles/*", async (route) => {
  49 |     if (route.request().method() !== "PUT") return route.continue();
  50 |     const { profile } = route.request().postDataJSON();
  51 |     if (
  52 |       !connections.some(
  53 |         (c) => c.provider === profile.provider && c.baseUrl === profile.baseUrl,
  54 |       )
  55 |     )
  56 |       return route.fulfill({
  57 |         status: 400,
  58 |         json: { error: "Validate provider first" },
  59 |       });
  60 |     const { connections: _connections, credentialStorage: _storage, ...current } = await (await page.request.get("/api/models")).json();
  61 |     current.profiles = current.profiles.map(({ hasKey: _hasKey, ...p }: any) => p);
  62 |     const result = await page.request.put("/api/models", {
  63 |       data: {
  64 |         ...current,
  65 |         profiles: [
  66 |           ...current.profiles.filter(
  67 |             (p: { id: string }) => p.id !== profile.id,
  68 |           ),
  69 |           profile,
  70 |         ],
  71 |       },
  72 |     });
  73 |     await route.fulfill({ status: result.status(),
  74 |       json: {
  75 |         ...(await result.json()),
  76 |         connections,
  77 |         credentialStorage: "windows-encrypted",
  78 |       },
  79 |     });
  80 |   });
  81 | }
  82 | export async function connectFixture(page: Page, inDialog = false) {
  83 |   const scope = inDialog
  84 |     ? page.getByRole("dialog")
  85 |     : page.locator(".provider-browser");
  86 |   await scope
  87 |     .getByLabel("API key", { exact: true })
  88 |     .fill("browser-test-secret");
  89 |   await scope.getByRole("button", { name: "Validate & connect" }).click();
  90 | }
  91 | 
```
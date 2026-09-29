# Lemonade chat and architecture findings

Observed 2026-09-21 UTC. This investigation combines the supplied screenshots, a read-only inspection of the user's open Lemonade editor, and the exact public JavaScript assets loaded by that editor. It does not establish how Lemonade's private generation backend works.

## What is directly observable

The current editor shows a mechanics map beside a persistent conversation. The inspected project has three mechanics and three links. Generation cards expand into activity, suggestions insert text into the composer, screenshots appear in messages, and animation cards have rig controls. Restore-checkpoint controls are present. The disconnected plugin disables the composer and map actions in that session. A failed playtest remains visible.

No prompt was sent, project changed, checkpoint restored, import started or credits spent during inspection. Existing screenshots are observations supplied by the user. The newly inspected frontend adds implementation evidence that was unavailable in earlier research.

## What the shipped frontend actually does

| Feature | Source observation | What this does not prove |
| --- | --- | --- |
| Mechanics graph | The editor passes a game-memory Markdown string into a parser. The parser reads mechanics with IDs, descriptions, icons, positions, connections and satellite suggestions. Connection strings become node links. | It does not prove that drawing a connection compiles executable Roblox logic, or that each displayed link matches runtime behavior. |
| Graph counts | The frontend computes unique link pairs for the mechanics count. | A count is not an integration or gameplay test. |
| Animation message | A chat component accepts a clip name, clip URL and rig. It mounts a separate animation viewer and changes the selected rig. | The wrapper does not reveal the process that authored the clip or applied it in Studio. |
| Animation playback | The viewer fetches JSON clip data, builds a browser 3D scene, uses joint transformations and interpolation, and supplies orbit controls. It is a real player, not a sequence of screenshots. | Browser motion does not establish Roblox playback, permissions to publish the animation, or compatibility with every character rig. |
| Suggestions | Accessible controls explicitly add a suggestion to the prompt. | The inspected UI does not demonstrate automatic implementation after selecting a suggestion. |
| Playtest failure | The UI reports a timeout and a minimized/not-rendering Studio explanation. | The screenshot and frontend cannot independently establish that explanation as the backend root cause. |

Original downloaded assets, exact public URLs, timestamps, byte sizes and SHA-256 hashes are in [the evidence manifest](../research/evidence/lemonade-chat-frontend-20260921/manifest.json). All 17 observed public chunk URLs returned HTTP 200. Requests did not send browser cookies or credentials. Readable formatting is kept separately in [analysis](../research/analysis/lemonade-chat-20260921/).

The key inspected derivatives are `4150-05857f685679b1f2.js` for the Markdown parser, `3556-ed55f7372def1235.js` for graph wiring, `2596.d1dbd5cc1d01894c.js` for the chat animation wrapper, and `3217.c14c2a982138a723.js` for the clip player. Product code was written independently. Lemonade code remains research evidence.

## The useful distinction from n8n

n8n nodes perform actions and expose execution controls. That makes a connection part of the workflow's behavior, rather than merely a diagram. [Official n8n node documentation](https://github.com/n8n-io/n8n-docs/blob/main/docs/build/understand-workflows/workflow-components/work-with-nodes.md).

For Takko, the useful unit is a game system and an explicit behavior contract. Example: **Combat → Energy**, when **Hit confirmed**, then **award ten energy after server validation**. Systems also state whether they run on the server, player or in shared logic. This avoids confusing a build-task dependency with a runtime event.

The implemented first step stores these systems and connections as user requirements. Every saved system and connection must appear in the plan and be assigned to implementation tasks. Editing the graph requires review and invalidates the old plan approval. Files can be associated through the resulting requirements. This is a contract driving generation, not a general visual Luau interpreter or proof that the generated code satisfies the contract.

## Remaining unknowns

The private prompt assembly, model routing, retry policy, animation authoring/publishing pipeline, checkpoint implementation, arbitrary existing-game import behavior and backend graph semantics remain unverified. The publicly loaded frontend gives a concrete answer for rendering and data representation. It does not justify claiming a full reverse-engineering of Lemonade.

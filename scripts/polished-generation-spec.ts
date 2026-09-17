import type { Spec } from "../src/generation/schema";

/** An authored evaluation brief, not evidence of model-generated planning or gameplay. */
export const polishedGenerationBriefSource = "authored benchmark brief";

const brief = {
  world:
    "Create Crystal Hollow, a compact stylized luminous crystal quarry. The exported place must already look composed in Studio Edit mode: authored slate terrain terraces, connected pale paths and gentle ramps, six cyan/violet crystal clusters, a rock arch landmark, a warm amber sell station, a clearly distinct upgrade station, and a central crystal beacon. Use 35–45 explicit scene entries for the world, arranged inside a 96-by-96-stud floor; avoid a vast empty baseplate, three isolated blocks, or scenery created only after Play.",
  onboarding:
    "Place a safe spawn overlooking the quarry loop. The first crystal is within 12 studs of spawn; sell and upgrade stations are visible from spawn and each within 24 studs. Use readable in-world labels and contrasting path edges, a consistent restrained palette, and distinct silhouettes instead of uploaded artwork. No required jump, climb, or invisible trigger should block the first harvest and sale.",
  contract:
    "Use exactly seven Luau files with one shared Contract, a World scene resolver, server Economy and Game scripts, and client HUD, Feedback and Controller scripts. Keep the declared module interfaces, RemoteEvent names, player attributes and world names identical across tasks. Each task owns only its assigned files and scene objects; dependencies are read-only.",
  harvest:
    "Harvest luminous crystals by pressing E or the Harvest button near a node. There are six shared nodes with six crystals each; a successful action takes the minimum of harvest yield, free bag space and node stock. Start with yield one and capacity eight. Empty nodes visibly dim, cannot award crystals, and refill after six seconds. Harvest interval is at least 0.65 seconds per player; stock cannot become negative when two players harvest together.",
  economy:
    "At the amber sell station, Q or Sell converts all carried crystals to five coins each and empties the bag. Selling an empty bag changes nothing. The first full bag earns 40 coins, enough to choose a useful first upgrade; the first minute should include harvesting, selling and seeing an upgrade improve the next trip.",
  upgrades:
    "At the upgrade station offer two independent two-level tracks: pick power raises crystals per harvest from 1 to 2 to 3 and costs 40 then 100 coins; bag capacity rises from 8 to 14 to 20 and costs 30 then 80 coins. Purchases deduct server-owned coins once and reject insufficient funds or a maxed track. Show each current level, next benefit, price and affordability before buying. Power improves harvest pace; capacity reduces sell trips.",
  progression:
    "Give each player a short personal goal: sell 40 total crystals and buy at least one level in both tracks to restore their Crystal Hollow beacon. Show progress from the start, celebrate completion once with a local beacon glow and clear success message, and leave the ordinary loop playable afterward. Do not turn goal completion into shared global progress or award free coins for reopening the UI.",
  authority:
    "The server owns Carry, Coins, PowerLevel, CapacityLevel, Capacity, TotalSold and GoalComplete. Accept only the four declared action names and an optional known node ID; never trust client amounts, prices, distance or rewards. Validate a living character, proximity, action cooldown, harvest interval, capacity, stock and affordability before changing state. Each player has independent economy and upgrade state; node stock alone is shared.",
  lifecycle:
    "Initialize existing and newly joined players, retain their session economy and upgrades across character respawns, reconnect input and UI safely, and clean per-player bookkeeping when they leave. Do not duplicate world geometry, HUDs, listeners or rewards after respawn. No cross-join persistence, monetization, uploaded meshes, image IDs, animation IDs, audio, external HTTP or numeric require calls are part of this slice.",
  hud: "Build a legible responsive HUD with the Crystal Hollow title, bag count/capacity, coins, both upgrade tracks, a goal progress line and one concise contextual hint. Use clear hierarchy, generous contrast and readable system-supported Roblox fonts, with controls fitting a 375-by-667 viewport and desktop. The HUD component must render real supplied state snapshots immediately, update displayed prices and progress, and replace only its own previous GUI when mounted again.",
  controls:
    "Wire one live HUD to replicated player attributes at join, after actions and after respawn. Support E/Harvest, Q/Sell, 1/Buy power and 2/Buy bag through the same validated action path, with touch buttons for every action and disabled-looking out-of-range or unavailable actions. Explain bag-full, empty-node, too-far, insufficient-coins and max-level results. Add a brief local harvest sparkle, a sell coin-count emphasis and an upgrade pulse using procedural parts or UI tweens; effects must clean up and must not grant rewards.",
} as const;

export const polishedGenerationPrompt = Object.values(brief).join("\n\n");

export function polishedGenerationSpecification(scope: string): Spec {
  const shared = `ReplicatedStorage/${scope}`;
  const server = `ServerScriptService/${scope}`;
  const client = `StarterPlayer/StarterPlayerScripts/${scope}`;
  const world = `Workspace/${scope}/World`;
  const requirement = (
    id: keyof typeof brief,
    category: Spec["requirements"][number]["category"],
    description: string,
    acceptance: string,
  ): Spec["requirements"][number] => ({
    id,
    category,
    description,
    acceptance,
    priority: "required",
    origin: "user",
    sourceId: "request",
    sourceQuote: brief[id],
  });

  return {
    title: "Crystal Hollow",
    visualDirection:
      "A small intentionally composed quarry, readable from spawn in Edit mode: layered dark slate, pale stone paths, clustered cyan/violet faceted crystals, warm amber station accents, an arch silhouette and a central beacon. Three-piece crystal clusters and overlapping rock forms give depth without high part counts. Use authored Part/WedgePart geometry, selective Neon and at most three local PointLights; do not alter global Lighting or Terrain services. No external asset IDs.",
    summary: `This is an authored evaluation specification. Target a satisfying first minute: harvest cyan crystals, sell for coins, choose a power or bag upgrade, and visibly improve the next trip. A personal beacon goal provides closure after both first upgrades and 40 lifetime crystals sold. All static scenery must be visible before Play.

FIXED INTERFACES AND OWNERSHIP:
1. Contract.module.luau at ${shared} returns a plain constants table: CAPACITIES={8,14,20}, POWER_YIELDS={1,2,3}, POWER_COSTS={40,100}, CAPACITY_COSTS={30,80}, SELL_VALUE=5, INTERACT_DISTANCE=10, ACTION_COOLDOWN=0.2, HARVEST_COOLDOWN=0.65, NODE_CAPACITY=6, NODE_RESPAWN=6, GOAL_SOLD=40. Levels are 0,1,2; index capacities/yields with level+1 and the next purchase price with currentLevel+1. The contract task alone declares RemoteEvents ${shared}/Action and ${shared}/Feedback. Module runtime name is Contract, not Contract.module.
2. The world task alone authors the static Workspace scene, including the namespace Folder and ${world}. All 35–45 world scene entries belong beneath that namespace. Primary harvest BaseParts have EXACT paths ${world}/Nodes/Node01 through Node06; decorative cluster shards can be their anchored child parts. Other required objects: ${world}/Ground (safe collidable floor), ${world}/Spawn (SpawnLocation), ${world}/SellStation (BasePart), ${world}/UpgradeStation (BasePart), ${world}/Beacon (BasePart), and a three-piece Arch landmark. Place Spawn near (0,2,18), Node01 near (-6,2,10), SellStation near (-16,1,10), UpgradeStation near (14,1,10), Beacon near (0,5,-18), and the other nodes along a short loop. Keep signage above interaction surfaces. Include paths, two shallow terraces, ramps, six three-piece clusters and station/beacon/arch detail within the scene-entry budget; do not inflate the budget with invisible trigger parts. Main geometry MUST be in artifact.scene and exported before Play; no runtime-only construction or unrelated-place modification.
3. ${server}/World.module.luau exports resolve(root), where root is Workspace/${scope}. It validates and returns {nodes: {[nodeId]: BasePart}, sell: BasePart, upgrades: BasePart, beacon: BasePart, spawn: SpawnLocation}, locating the authored objects above. Missing authored geometry is an explicit error, not permission to create a substitute world. This resolver has no player, economy or remote connections.
4. ${server}/Economy.module.luau exports newState() and apply(state, action, nodeRemaining?). State keys are Carry=0, Coins=0, PowerLevel=0, CapacityLevel=0, Capacity=8, TotalSold=0, GoalComplete=false. apply mutates this server-local table only for valid economic transitions and returns {ok:boolean, amount:number, message:string}; amount is actual crystals removed on harvest or actual coins gained on sale, otherwise zero. It uses the fixed Contract constants, computes Capacity after a bag upgrade and permanently sets GoalComplete once TotalSold>=40 and both levels>=1. Reject unsupported actions, a full bag, zero stock, empty sale, insufficient funds and maxed upgrades without partial state changes. No geometry/player/event side effects in Economy.
5. ${server}/Game.server.luau is the sole server bootstrap. It requires the existing Contract, World and Economy, resolves the authored world, initializes the six node attributes Remaining=6 and Available=true, owns per-player state/cooldowns, validates and processes Action, mirrors the seven state fields to Player attributes, and owns node depletion/refill. Action:FireServer(action, nodeId?) accepts only 'harvest','sell','upgradePower','upgradeCapacity'; only harvest accepts one of 'Node01'..'Node06', all other actions require nil nodeId, and reject extra arguments. Use distance to the selected node, SellStation or UpgradeStation as appropriate. Do not reset economy on CharacterAdded. Feedback:FireClient(player, {kind='harvest'|'sell'|'upgrade'|'goal'|'error', message=string, position=Vector3?}) carries only server-confirmed results. Only successful harvest feedback includes the node position. Emit goal feedback once when GoalComplete flips false->true; current attributes remain sufficient for a respawned client to restore completed-goal presentation.
6. ${client}/HUD.module.luau exports mount(playerGui), returning {render=function(stats,context), toast=function(message), destroy=function()}. Call these functions with dot syntax. The returned closures own a ScreenGui named CrystalHollowHUD with ResetOnSpawn=false and replace only an older CrystalHollowHUD. Named descendants: CarryLabel, CoinsLabel, GoalLabel (TextLabels), HarvestButton, SellButton, PowerButton, CapacityButton (TextButtons). stats uses the seven exact player-attribute names. context={nodeId:string?,nodeRemaining:number?,nearSell:boolean,nearUpgrades:boolean}. render sets actual counts, levels, next prices, contextual hint and button availability. Expose those four button instances as handles.harvestButton, handles.sellButton, handles.powerButton, handles.capacityButton on the same returned object for Controller to bind; HUD must not fire remotes or own player state.
7. ${client}/Feedback.module.luau exports play(payload, hud) and destroy(); play calls hud.toast(payload.message) and owns only short-lived cosmetic effects/tweens. Goal glow is local to the observing player, beneath the scoped World or own GUI; never change shared economy or globally restore the beacon. Controller owns the fact that goal celebration is once per local session. Restore steady completed-goal presentation after respawn without replaying rewards or celebration. No audio/image/mesh dependencies.
8. ${client}/Controller.client.luau is the sole client bootstrap. It reads Contract, authored World nodes and player attributes, mounts HUD, wires the named button handles and E/Q/1/2 once, ignores keyboard input already consumed by Roblox/text entry, derives nearest valid node and station proximity, listens to the seven attributes, and refreshes on CharacterAdded. It sends only the action and optional node ID; server validation remains authoritative even if a control looks disabled. It handles Feedback through the existing Feedback module and cleans connections/effects on teardown. No alternate remotes or duplicated modules.
Task order is contract -> world -> gameplay, with hud after contract and presentation after gameplay+hud. Emit only the current task's owned files/scene; do not fill future files with placeholders. Tests must verify the exported scene's authored world paths and composed geometry in Edit mode, then separately test economy, multiplayer validation, live controls, respawn and visual feedback in Play mode. A code or manifest assertion is not a claim of an observed gameplay/visual pass.`,
    questions: [],
    requirements: [
      requirement(
        "world",
        "world",
        "A cohesive editable crystal quarry, not a runtime-only sketch",
        "Before Play, artifact.scene and the opened exported place contain the named World geometry, six three-piece crystal clusters, connected paths/ramps/terraces, two stations, beacon and arch within 35–45 world entries. A view from Spawn shows a composed quarry rather than only isolated interaction blocks. World.resolve fails on missing authored landmarks instead of inventing replacements.",
      ),
      requirement(
        "onboarding",
        "presentation",
        "An immediately legible route from spawn to harvest, sale and upgrades",
        "In the authored scene, Node01 is within 12 studs of Spawn and both labeled stations within 24 studs; paths connect them without required jumping. A new player can identify the cyan harvest cluster, amber sell station and distinct upgrade station. Confirm legibility and walkability in Studio rather than inferring them solely from coordinates.",
      ),
      requirement(
        "contract",
        "network",
        "One stable set of constants, remotes and task-owned interfaces",
        "Contract exposes the exact constants; Action and Feedback RemoteEvents are declared once. The seven files have unique owners and runtime module names agree with the fixed interfaces. No task overwrites dependency files or substitutes alternate event/attribute names.",
      ),
      requirement(
        "harvest",
        "mechanic",
        "Capacity-limited shared crystal harvesting and visible node recovery",
        "At Node01, harvest moves one crystal from Remaining to Carry initially; full bags, empty nodes, distant or rapid requests add nothing. With one remaining crystal and two players, at most one crystal is awarded. Depletion dims the authored node and six seconds later restores stock and appearance. Upgraded yield never exceeds free bag space or node stock.",
      ),
      requirement(
        "economy",
        "mechanic",
        "A rewarding harvest-to-sale loop",
        "Selling Carry=8 at SellStation yields Coins=40, Carry=0 and TotalSold=8; repeated empty sale adds zero. After walking the authored route, a player can harvest, sell and afford a first upgrade during the first minute; confirm actual timing in Play mode.",
      ),
      requirement(
        "upgrades",
        "mechanic",
        "Two independently useful and correctly priced upgrade tracks",
        "From Coins=200, buying power level1 costs40 and raises yield to2; buying bag level1 costs30 and raises capacity to14, leaving130 coins. Second costs are100 and80, limits are level2, and insufficient/maxed purchases leave all state unchanged. Test that each upgrade changes subsequent harvesting or carrying behavior.",
      ),
      requirement(
        "progression",
        "mechanic",
        "A short personal beacon-restoration goal",
        "TotalSold>=40 alone or upgrades alone do not complete the goal. Meeting both level1 upgrades and TotalSold>=40 sets that player's GoalComplete once, emits one goal event and retains ordinary play. A second player's goal remains independent; respawn or remount does not grant rewards.",
      ),
      requirement(
        "authority",
        "network",
        "Server validation and independent player economies",
        "Malformed actions/IDs, extra count/price arguments, nonexistent/dead characters, out-of-range actions and throttled requests cannot alter state. Two players have independent Carry/Coins/levels while shared node stock remains nonnegative. The client only requests actions; all amounts and prices come from server state/Contract.",
      ),
      requirement(
        "lifecycle",
        "lifecycle",
        "Respawn-safe session state without duplicate systems or external dependencies",
        "Existing and new players initialize correctly; character respawn retains all seven state fields and a later join starts a fresh session. Player removal clears bookkeeping. All authored static geometry remains unique and in the namespace; no uploaded asset IDs, external fetches, numeric requires or persistence/monetization systems appear.",
      ),
      requirement(
        "hud",
        "ui",
        "A reusable readable HUD reflecting supplied state snapshots",
        "Calling mount twice leaves one CrystalHollowHUD. render with successive state snapshots updates carry/capacity, coins, both next upgrade prices/benefits and goal progress correctly; all four named button handles exist. At 375x667 and desktop, text and actionable controls remain inside the viewport without overlap; visual legibility requires actual screenshot inspection.",
      ),
      requirement(
        "controls",
        "ui",
        "Responsive live controls, contextual explanations and bounded visual feedback",
        "E/Q/1/2 and corresponding touch buttons reach the same server action path. One HUD immediately reflects real attributes at join and after harvest/sell/upgrades/respawn. Full bag, depleted node, distance and purchase failures have understandable messages. Accepted actions produce visible local feedback; effects and listeners clean up, and beacon celebration happens once without modifying rewards.",
      ),
    ],
    tasks: [
      {
        id: "contract",
        title: "Define exact shared constants and two remotes",
        requirements: ["contract"],
        dependsOn: [],
        files: [`${shared}/Contract.module.luau`],
      },
      {
        id: "world",
        title: "Author the editable quarry scene and strict world resolver",
        requirements: ["world", "onboarding"],
        dependsOn: ["contract"],
        files: [`${server}/World.module.luau`],
      },
      {
        id: "gameplay",
        title:
          "Implement authoritative economy, node stock and personal progression",
        requirements: [
          "harvest",
          "economy",
          "upgrades",
          "progression",
          "authority",
          "lifecycle",
        ],
        dependsOn: ["contract", "world"],
        files: [`${server}/Economy.module.luau`, `${server}/Game.server.luau`],
      },
      {
        id: "hud",
        title: "Build the responsive state-driven HUD component",
        requirements: ["hud"],
        dependsOn: ["contract"],
        files: [`${client}/HUD.module.luau`],
      },
      {
        id: "presentation",
        title: "Connect live input, state, messages and procedural feedback",
        requirements: ["controls"],
        dependsOn: ["gameplay", "hud"],
        files: [
          `${client}/Feedback.module.luau`,
          `${client}/Controller.client.luau`,
        ],
      },
    ],
  };
}

export const prompt = polishedGenerationPrompt;
export const spec = polishedGenerationSpecification;

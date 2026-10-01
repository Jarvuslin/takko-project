import fs from "node:fs";
import path from "node:path";
import os from "node:os";
import { execFileSync } from "node:child_process";
import { expect, it } from "vitest";
import infinity from "./fixtures/asset-roles/15008746676-infinity.json";
import census from "./fixtures/asset-roles/15008746676.json";
import { animationClipSchema } from "../src/generation/animation";
import { nativeRolesSchema } from "../src/marketplace/role-capture";
import { punchSegments } from "../src/marketplace/punch-segments";

const clip = animationClipSchema.parse(infinity.clip);
const sequence = nativeRolesSchema
  .parse(census.snapshot.nativeRoles)
  .sequences.find((s) => s.poseDigest === clip.sourcePoseDigest)!;
const segments = punchSegments(clip, sequence)!.segments;
function run(source: string) {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), "takko-combo-contract-"));
  try {
    fs.copyFileSync(
      "docs/results/guided-demo-rehearsal/Combo.luau",
      path.join(dir, "combo-contract.luau"),
    );
    const table =
      "{" +
      segments
        .map((s) => `{start=${s.start},hit=${s.hit},finish=${s.end}}`)
        .join(",") +
      "}";
    const file = path.join(dir, "test.luau");
    fs.writeFileSync(
      file,
      `local Combo = require("./combo-contract")\nlocal segments = ${table}\n${source}\nprint("contract passed")\n`,
    );
    const executable = path.resolve(
      process.env.LUAU_BIN_DIR ?? ".forge/tools/luau",
      process.platform === "win32" ? "luau.exe" : "luau",
    );
    expect(
      execFileSync(executable, [file], {
        cwd: dir,
        encoding: "utf8",
        windowsHide: true,
        timeout: 15000,
      }),
    ).toContain("contract passed");
  } finally {
    if (
      path.dirname(fs.realpathSync(dir)) !== fs.realpathSync(os.tmpdir()) ||
      !path.basename(dir).startsWith("takko-combo-contract-")
    )
      throw Error("Unexpected contract workspace");
    fs.rmSync(dir, { recursive: true, force: true });
  }
}
it.each(segments)(
  "crosses native segment $index hit exactly once and clamps skipped frames",
  (s) => {
    run(`local c=Combo.client(segments)
  c.index=${s.index - 1} c.holdAt=0
  Combo.click(c,0)
  Combo.tick(c,10)
  assert(#c.hits==1 and c.hits[1]==${s.index})
  Combo.tick(c,11)
  assert(#c.hits==1)
  `);
  },
);
it("one click then silence never executes a later hit and resets after the hold grace", () =>
  run(`
  local c=Combo.client(segments) Combo.click(c,0)
  Combo.tick(c,segments[1].finish) assert(c.index==1 and not c.active and #c.hits==1)
  assert(c.position==segments[1].finish)
  Combo.tick(c,segments[1].finish+0.34) assert(c.index==1)
  Combo.tick(c,segments[1].finish+0.36) assert(c.index==0 and #c.hits==1)
  assert(math.abs(c.fadeUntil-(segments[1].finish+0.44))<1e-6)
`));
it("rapid input buffers at most one segment and all 13 require fresh edges", () =>
  run(`
  local c=Combo.client(segments) local now=0 Combo.click(c,now)
  for i=1,13 do
    assert(c.index==i)
    for _=1,100 do Combo.click(c,now) end
    now+=segments[i].finish-segments[i].start+0.00001
    Combo.tick(c,now)
    assert(#c.hits==i)
  end
  assert(c.index==0 and not c.buffered)
  Combo.tick(c,now+1) assert(#c.hits==13)
  Combo.click(c,now+1) assert(c.index==1 and c.active)
`));
it("server rejects stale nonce, replay, wrong order and excessive early arrival", () =>
  run(`
  local s=Combo.server(segments)
  assert(not Combo.accept(s,0,1,0)) assert(not Combo.accept(s,1,2,0))
  assert(Combo.accept(s,1,1,0)) assert(not Combo.accept(s,1,1,0))
  assert(not Combo.accept(s,1,2,s.endAt-0.101))
  local previousEnd=s.endAt
  assert(Combo.accept(s,1,2,previousEnd-0.09))
  assert(s.pending.hitAt>=previousEnd+segments[2].hit-segments[2].start)
`));
it("server owns hit timing, range, facing, line of sight, target scope and one hit per target", () =>
  run(`
  local function target() return {id="dummy",alive=true,inScope=true,distance=4,facing=1,lineOfSight=true} end
  for _,field in ipairs({"alive","inScope","distance","facing","lineOfSight"}) do
    local s=Combo.server(segments) assert(Combo.accept(s,1,1,0))
    local t=target()
    if field=="distance" then t.distance=7 elseif field=="facing" then t.facing=0 else t[field]=false end
    assert(0 == Combo.hit(s,s.nonce,s.pending.hitAt,t)) assert(s.counter==0)
  end
  local s=Combo.server(segments) assert(Combo.accept(s,1,1,0))
  assert(0 == Combo.hit(s,s.nonce,s.pending.hitAt-0.001,target()))
  local at=s.pending.hitAt
  assert(0 < Combo.hit(s,s.nonce,at,target()))
  assert(0 == Combo.hit(s,s.nonce,at,target())) assert(s.counter==1)
`));
it("timeout, death and respawn invalidate pending server hits and old combo requests", () =>
  run(`
  local s=Combo.server(segments) assert(Combo.accept(s,1,1,0))
  assert(not Combo.accept(s,1,2,s.endAt+0.351)) assert(s.nonce==2 and s.pending==nil)
  assert(Combo.accept(s,2,1,1))
  s.alive=false Combo.cancel(s)
  assert(s.pending==nil and not Combo.accept(s,2,1,2))
  s.alive=true assert(not Combo.accept(s,2,1,2)) assert(Combo.accept(s,3,1,2))
  local target={id="dummy",alive=true,inScope=true,distance=4,facing=1,lineOfSight=true}
  assert(0 == Combo.hit(s,2,s.pending.hitAt,target,1))
  assert(0 < Combo.hit(s,3,s.pending.hitAt,target,1))
`));
it("an early next-segment request cannot erase the preceding segment's scheduled hit", () =>
  run(`
  local s=Combo.server(segments)
  assert(Combo.accept(s,1,1,0))
  local first=s.pending
  assert(Combo.accept(s,1,2,s.endAt-0.09))
  assert(0 < Combo.hit(s,s.nonce,first.hitAt,{id="dummy",alive=true,inScope=true,distance=4,facing=1,lineOfSight=true},1))
  assert(s.counter==1)
`));
it("server completion at segment 13 rotates the nonce before a fresh combo", () =>
  run(`
  local s=Combo.server(segments) local now=0
  for i=1,13 do assert(Combo.accept(s,1,i,now)) now=s.endAt end
  assert(not Combo.finish(s,now-0.001))
  assert(Combo.finish(s,now) and s.nonce==2 and s.pending==nil)
  assert(not Combo.accept(s,1,1,now)) assert(Combo.accept(s,2,1,now))
`));

it("combo counter resets while total confirmed hits survive timeout and respawn", () =>
  run(`
  local s=Combo.server(segments)
  assert(Combo.accept(s,1,1,0))
  local t={id="dummy",alive=true,inScope=true,distance=4,facing=1,lineOfSight=true}
  assert(Combo.hit(s,1,s.pending.hitAt,t)==1)
  assert(s.counter==1 and s.comboCounter==1)
  assert(Combo.finish(s,s.endAt+0.351))
  assert(s.counter==1 and s.comboCounter==0)
  Combo.respawn(s)
  assert(s.counter==1 and s.comboCounter==0)
`));

it("buffered playback resynchronizes at the next segment after a late frame", () =>
  run(`
  local c=Combo.client(segments)
  local track={IsPlaying=true,TimePosition=0,AdjustSpeed=function() end}
  Combo.click(c,0) Combo.playback(c,track)
  Combo.click(c,0.1)
  track.TimePosition=segments[1].finish+0.02
  Combo.tick(c,segments[1].finish+0.02)
  assert(c.index==2)
  Combo.playback(c,track)
  assert(track.TimePosition==segments[2].start)
`));

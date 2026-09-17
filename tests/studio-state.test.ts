import { describe, expect, it } from "vitest";
import {
  isVerifiedEditState,
  isVerifiedClientPlayState,
} from "../src/generation/studio-state";

const observed =
  "- Current Studio Mode: Edit\n- Available DataModels: Edit\n- Focused DataModel in the viewport: Edit";
describe("Studio state mutation boundary", () => {
  it("requires a full uncontradicted Client runtime", () => {
    expect(
      isVerifiedClientPlayState(
        "- Current Studio Mode: Play\n- Available DataModels: Client, Server\n- Focused DataModel in the viewport: Client",
      ),
    ).toBe(true);
    expect(
      isVerifiedClientPlayState({
        playState: "Play",
        availableDatamodelTypes: ["Server", "Client"],
      }),
    ).toBe(true);
    for (const state of [
      observed,
      { playState: "Play" },
      { playState: "Play", availableDatamodelTypes: ["Client"] },
      {
        playState: "Play",
        mode: "Edit",
        availableDatamodelTypes: ["Client", "Server"],
      },
      {
        playState: "Play",
        isPlaying: false,
        availableDatamodelTypes: ["Client", "Server"],
      },
    ])
      expect(isVerifiedClientPlayState(state)).toBe(false);
  });
  it("recognizes the exact native MCP receipt from the failed Butter Crunch run", () => {
    expect(isVerifiedEditState(observed)).toBe(true);
    expect(isVerifiedEditState(`\n${observed.replace(/\n/g, "\r\n")}\n`)).toBe(
      true,
    );
  });
  it.each([
    observed.replace("Mode: Edit", "Mode: Play"),
    observed.replace("DataModels: Edit", "DataModels: Edit, Client, Server"),
    observed.replace("viewport: Edit", "viewport: Client"),
    observed.split("\n").slice(0, 2).join("\n"),
    `${observed}\n- Current Studio Mode: Play`,
    `unverified report:\n${observed}`,
    "Edit",
  ])("rejects incomplete or conflicting textual state: %s", (state) => {
    expect(isVerifiedEditState(state)).toBe(false);
  });
  it("retains structured support and rejects contradictory aliases", () => {
    expect(
      isVerifiedEditState({
        playState: "Edit",
        availableDatamodelTypes: ["Edit"],
      }),
    ).toBe(true);
    expect(isVerifiedEditState({ state: "Stopped" })).toBe(true);
    expect(isVerifiedEditState({ availableDataModelTypes: ["Edit"] })).toBe(
      true,
    );
    for (const state of [
      null,
      {},
      [],
      { mode: "Play", availableDatamodelTypes: ["Edit"] },
      { playState: "Edit", mode: "Play" },
      { mode: "Edit", isPlaying: true },
      { mode: "Edit", datamodelTypes: ["Server"] },
      { mode: "Edit", datamodelTypes: [] },
    ]) {
      expect(isVerifiedEditState(state)).toBe(false);
    }
  });
});

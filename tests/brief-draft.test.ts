import { expect, it } from "vitest";
import { sameAnswers } from "../src/web/brief-draft";

it("compares saved answers without key order while retaining actual edits", () => {
  expect(
    sameAnswers({ attack: "punch", rig: "R6" }, { rig: "R6", attack: "punch" }),
  ).toBe(true);
  expect(sameAnswers({ attack: "kick" }, { attack: "punch" })).toBe(false);
  expect(sameAnswers({ attack: "" }, {})).toBe(false);
  expect(sameAnswers({ attack: "punch" }, { rig: "R6" })).toBe(false);
});

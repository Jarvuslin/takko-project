import { test } from "node:test";
import assert from "node:assert/strict";
import {
  authorizeDispatch,
  reservation,
  receipt,
  model,
} from "./concept-live-guard.mjs";
const body = {
  model,
  max_tokens: 2000,
  messages: [
    { role: "system", content: "System" },
    { role: "user", content: "Idea" },
  ],
};
test("reserves UTF-8 bytes plus overhead and the entire output cap", () => {
  assert.equal(reservation(body), 11034);
  assert.equal(
    reservation({ ...body, messages: [{ content: "é" }, { content: "🌮" }] }),
    11030,
  );
});
test("permits one dispatch and rejects the same stage even with a paid receipt", () => {
  const amount = authorizeDispatch("initial", body, []);
  assert.throws(
    () =>
      authorizeDispatch("initial", body, [
        { stage: "initial", reservedMicros: amount, status: "reconciled" },
      ]),
    /retry/,
  );
});
test("blocks any new spend after an unknown charge", () => {
  assert.throws(
    () =>
      authorizeDispatch("clarify", body, [
        { stage: "initial", reservedMicros: 12000, status: "dispatched" },
      ]),
    /unreconciled/,
  );
});
test("enforces cumulative reservations even when actual earlier charges are lower", () => {
  assert.throws(
    () =>
      authorizeDispatch("plan", body, [
        {
          stage: "initial",
          reservedMicros: 145000,
          status: "reconciled",
          costUsd: 0,
        },
      ]),
    /ceiling/,
  );
});
test("rejects a different model and unexpected payloads", () => {
  assert.throws(() => reservation({ ...body, model: "other" }));
  assert.throws(() => reservation({ ...body, max_tokens: 8001 }));
  assert.throws(() => reservation({ ...body, messages: [] }));
  assert.throws(() => authorizeDispatch("build", body, []));
});
test("requires a monetary receipt and refuses charges exceeding the reservation", () => {
  assert.throws(() =>
    receipt(
      { id: "r", usage: { prompt_tokens: 1, completion_tokens: 1 } },
      100,
    ),
  );
  assert.throws(() =>
    receipt(
      {
        id: "r",
        usage: { cost: 0.01, prompt_tokens: 1, completion_tokens: 1 },
      },
      100,
    ),
  );
  assert.equal(
    receipt(
      {
        id: "r",
        usage: { cost: 0.000006, prompt_tokens: 1, completion_tokens: 1 },
      },
      100,
    ).costUsd,
    0.000006,
  );
});

import { test } from "node:test";
import assert from "node:assert/strict";
import { serviceLease } from "../service-lease.ts";

for (const ordering of ["check-first", "heartbeat-first"]) {
  test(`sleep survives ${ordering} wake ordering`, () => {
    let time = 0;
    const lease = serviceLease(() => time);
    time = 6 * 60 * 60 * 1000;
    if (ordering === "heartbeat-first") lease.heartbeat();
    assert.equal(lease.expired(), false);
    if (ordering === "check-first") lease.heartbeat();
    for (let tick = 0; tick < 10; tick++) {
      time += 2000;
      assert.equal(lease.expired(), false);
      lease.heartbeat();
    }
  });
}
test("late check grants only one normal lease without fresh heartbeat", () => {
  let time = 0;
  const lease = serviceLease(() => time);
  time = 60000;
  assert.equal(lease.expired(), false);
  for (let tick = 0; tick < 5; tick++) {
    time += 2000;
    assert.equal(lease.expired(), false);
  }
  time += 2000;
  assert.equal(lease.expired(), true);
});
test("ordinary missing heartbeats expire without wake grace", () => {
  let time = 0;
  const lease = serviceLease(() => time);
  for (time = 2000; time <= 10000; time += 2000) assert.equal(lease.expired(), false);
  assert.equal(lease.expired(), true);
});
test("clock rollback cannot indefinitely retain a future heartbeat", () => {
  let time = 60000;
  const lease = serviceLease(() => time);
  time = 0;
  assert.equal(lease.expired(), false);
  for (time = 2000; time <= 10000; time += 2000) assert.equal(lease.expired(), false);
  assert.equal(lease.expired(), true);
});

import test from "node:test";
import assert from "node:assert/strict";
import { Time } from "../src/engine/core/Time.js";

test("Time clamps delta to the configured maximum", () => {
  const time = new Time({ maxDelta: 0.1 });
  time.update(1000);
  time.update(1500);
  assert.equal(time.delta, 0.1);
  assert.equal(time.elapsed, 0.1);
});

test("Time never produces a negative delta", () => {
  const time = new Time();
  time.update(1000);
  time.update(900);
  assert.equal(time.delta, 0);
});

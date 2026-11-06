import test from "node:test";
import assert from "node:assert/strict";
import { detectCollision } from "../src/engine/physics/Collision.js";

test("detects circle-circle overlap and rejects separated circles", () => {
  const a = { type: "circle", center: { x: 0, y: 0 }, radius: 10 };
  const touching = { type: "circle", center: { x: 18, y: 0 }, radius: 10 };
  const separated = { type: "circle", center: { x: 21, y: 0 }, radius: 10 };
  assert.equal(detectCollision(a, touching).penetration, 2);
  assert.equal(detectCollision(a, separated), null);
});

test("detects box-box overlap on the shallowest axis", () => {
  const a = { type: "box", center: { x: 0, y: 0 }, halfWidth: 10, halfHeight: 10 };
  const b = { type: "box", center: { x: 15, y: 2 }, halfWidth: 10, halfHeight: 10 };
  const contact = detectCollision(a, b);
  assert.equal(contact.penetration, 5);
  assert.equal(contact.normal.x, 1);
  assert.equal(contact.normal.y, 0);
});

test("detects circle-box overlap and returns a reversed normal for box-circle", () => {
  const circle = { type: "circle", center: { x: 8, y: 0 }, radius: 5 };
  const box = { type: "box", center: { x: 0, y: 0 }, halfWidth: 5, halfHeight: 5 };
  const forward = detectCollision(circle, box);
  const reverse = detectCollision(box, circle);
  assert.ok(forward);
  assert.equal(forward.penetration, 2);
  assert.equal(reverse.normal.x, -forward.normal.x);
  assert.equal(reverse.normal.y, -forward.normal.y);
});

test("detects a circle contained inside a box", () => {
  const circle = { type: "circle", center: { x: 0, y: 0 }, radius: 4 };
  const box = { type: "box", center: { x: 0, y: 0 }, halfWidth: 10, halfHeight: 10 };
  const contact = detectCollision(circle, box);
  assert.ok(contact);
  assert.equal(contact.penetration, 14);
});

import test from "node:test";
import assert from "node:assert/strict";
import { Entity } from "../src/engine/entities/Entity.js";
import { RigidBody } from "../src/engine/physics/RigidBody.js";
import { Camera2D } from "../src/engine/world/Camera2D.js";

function createMovingTarget() {
  const entity = new Entity("Target");
  const body = entity.addComponent(new RigidBody());
  return { entity, body };
}

test("camera anticipates the target velocity with a capped look-ahead", () => {
  const { entity, body } = createMovingTarget();
  entity.transform.position.set(100, 50);
  body.velocity.set(200, 0);
  const camera = new Camera2D({ smoothing: 100, lookAhead: 0.2, maxLookAhead: 30, dynamicZoom: 0 });
  camera.follow(entity);
  camera.update(1);
  assert.ok(Math.abs(camera.position.x - 130) < 0.1);
  assert.ok(Math.abs(camera.position.y - 50) < 0.1);
});

test("camera keeps a close framing and only pulls back slightly at speed", () => {
  const { entity, body } = createMovingTarget();
  body.velocity.set(220, 0);
  const camera = new Camera2D({ smoothing: 0, lookAhead: 0, dynamicZoom: 0.08, zoomSmoothing: 100 });
  camera.follow(entity);
  camera.update(1);
  assert.equal(camera.baseZoom, 1.25);
  assert.ok(camera.zoom < camera.baseZoom);
  assert.ok(camera.zoom >= camera.baseZoom * 0.94 - 0.001);
});

test("camera can still follow a plain position vector", () => {
  const camera = new Camera2D({ smoothing: 0, dynamicZoom: 0 });
  camera.follow({ x: 24, y: -12 });
  camera.update(0.016);
  assert.equal(camera.position.x, 24);
  assert.equal(camera.position.y, -12);
});

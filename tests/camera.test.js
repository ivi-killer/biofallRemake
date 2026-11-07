import test from "node:test";
import assert from "node:assert/strict";
import { Entity } from "../src/engine/entities/Entity.js";
import { Camera2D } from "../src/engine/world/Camera2D.js";

test("camera stays centered on the target without look-ahead", () => {
  const target = new Entity("Target");
  target.transform.position.set(100, 50);
  const camera = new Camera2D();
  camera.follow(target);
  camera.update(1);

  assert.equal(camera.position.x, 100);
  assert.equal(camera.position.y, 50);
  assert.equal(camera.zoom, 1.25);
});

test("camera keeps its framing fixed while the target moves", () => {
  const target = new Entity("Target");
  const camera = new Camera2D();
  camera.follow(target);

  target.transform.position.set(40, -20);
  camera.update(0.016);
  assert.deepEqual(camera.position, target.transform.position);
  assert.equal(camera.zoom, 1.25);

  target.transform.position.set(80, 15);
  camera.update(0.016);
  assert.deepEqual(camera.position, target.transform.position);
  assert.equal(camera.zoom, 1.25);
});

test("camera centers the target in screen coordinates", () => {
  const target = new Entity("Target");
  target.transform.position.set(24, -12);
  const camera = new Camera2D({ zoom: 1.25 });
  camera.setViewport(1280, 720);
  camera.follow(target);
  camera.update(0.016);

  const screen = camera.worldToScreen(target.transform.position);
  assert.equal(screen.x, 640);
  assert.equal(screen.y, 360);
});

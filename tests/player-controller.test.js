import test from "node:test";
import assert from "node:assert/strict";
import { Entity } from "../src/engine/entities/Entity.js";
import { RigidBody } from "../src/engine/physics/RigidBody.js";
import { PlayerController } from "../src/game/components/PlayerController.js";

function createPlayer(options = {}) {
  const input = {
    virtualJoystick: { x: 0, y: 0, active: true },
    pointer: { x: 0, y: 0, down: false, button: -1, type: "touch", moved: false },
    isKeyDown: () => false
  };
  const camera = { screenToWorld: point => point };
  const renderer = { canvas: { getBoundingClientRect: () => ({ left: 100, top: 50 }) } };
  const player = new Entity("Player");
  const body = player.addComponent(new RigidBody());
  const controller = player.addComponent(new PlayerController(options));
  player.attachContext({
    services: {
      get: name => name === "input" ? input : name === "camera" ? camera : name === "renderer" ? renderer : null
    }
  });
  return { player, body, controller, input };
}

test("movement reaches the requested speed immediately", () => {
  const { body, controller, input } = createPlayer();
  input.virtualJoystick.x = 1;

  controller.update(0.016);
  assert.equal(body.velocity.x, controller.speed);
  assert.equal(body.velocity.y, 0);
});

test("movement stops immediately when the input is released", () => {
  const { body, controller, input } = createPlayer();
  input.virtualJoystick.x = 1;
  controller.update(0.016);
  input.virtualJoystick.x = 0;
  controller.update(0.016);

  assert.equal(body.velocity.x, 0);
  assert.equal(body.velocity.y, 0);
});

test("diagonal keyboard movement is normalized", () => {
  const { body, controller, input } = createPlayer();
  input.virtualJoystick.active = false;
  input.isKeyDown = code => code === "KeyW" || code === "KeyD";

  controller.update(0.016);

  assert.ok(Math.abs(controller.direction.length() - 1) < 0.001);
  assert.ok(Math.abs(body.velocity.length() - controller.speed) < 0.001);
  assert.ok(Math.abs(Math.abs(controller.direction.x) - Math.abs(controller.direction.y)) < 0.001);
});

test("mouse aim is independent from keyboard movement", () => {
  const { player, body, controller, input } = createPlayer();
  input.virtualJoystick.active = false;
  input.isKeyDown = code => code === "KeyW";
  input.pointer = { x: 200, y: 50, type: "mouse", moved: true };

  controller.update(0.016);

  assert.equal(body.velocity.x, 0);
  assert.equal(body.velocity.y, -controller.speed);
  assert.ok(Math.abs(player.transform.rotation - Math.PI / 2) < 0.001);
  assert.equal(controller.aimingWithPointer, true);
});

test("touch movement determines facing when no mouse aim is available", () => {
  const { player, controller, input } = createPlayer();
  input.virtualJoystick.x = -1;
  input.pointer.type = "touch";

  controller.update(0.016);

  assert.ok(Math.abs(player.transform.rotation - Math.PI * 1.5) < 0.001);
  assert.equal(controller.aimingWithPointer, false);
});

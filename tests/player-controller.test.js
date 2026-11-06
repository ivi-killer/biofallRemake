import test from "node:test";
import assert from "node:assert/strict";
import { Entity } from "../src/engine/entities/Entity.js";
import { RigidBody } from "../src/engine/physics/RigidBody.js";
import { PlayerController } from "../src/game/components/PlayerController.js";

function createPlayer(options = {}) {
  const input = {
    virtualJoystick: { x: 0, y: 0, active: true },
    pointer: { x: 0, y: 0, down: false, button: -1 },
    isKeyDown: () => false
  };
  const player = new Entity("Player");
  const body = player.addComponent(new RigidBody());
  const controller = player.addComponent(new PlayerController(options));
  player.attachContext({ services: { get: name => name === "input" ? input : null } });
  return { player, body, controller, input };
}

test("player accelerates toward the requested movement speed", () => {
  const { body, controller, input } = createPlayer();
  input.virtualJoystick.x = 1;

  controller.update(0.1);
  assert.ok(body.velocity.x > 100);
  assert.ok(body.velocity.x < controller.speed);

  controller.update(0.2);
  assert.ok(Math.abs(body.velocity.x - controller.speed) < 0.001);
});

test("player decelerates smoothly when the movement input is released", () => {
  const { body, controller, input } = createPlayer();
  input.virtualJoystick.x = 1;
  controller.update(0.2);
  const previousSpeed = body.velocity.length();

  input.virtualJoystick.x = 0;
  controller.update(0.05);

  assert.ok(body.velocity.length() < previousSpeed);
  assert.ok(body.velocity.length() > 0);
});

test("diagonal keyboard movement is normalized", () => {
  const { controller, input } = createPlayer();
  input.virtualJoystick.active = false;
  input.isKeyDown = code => code === "KeyW" || code === "KeyD";

  controller.update(0.05);

  assert.ok(Math.abs(controller.direction.length() - 1) < 0.001);
  assert.ok(Math.abs(controller.direction.x - controller.direction.y) < 0.001);
});

test("player rotates to face the movement direction", () => {
  const { player, controller, input } = createPlayer();
  input.virtualJoystick.x = 1;

  controller.update(0.05);

  assert.ok(Math.abs(player.transform.rotation - Math.PI / 2) < 0.001);
});

import test from "node:test";
import assert from "node:assert/strict";
import { Entity } from "../src/engine/entities/Entity.js";
import { CircleCollider, BoxCollider } from "../src/engine/physics/Collider.js";
import { RigidBody } from "../src/engine/physics/RigidBody.js";
import { PhysicsWorld } from "../src/engine/physics/PhysicsWorld.js";

function createWorld(entities) {
  const emitted = [];
  const context = {
    services: { get: name => name === "entities" ? { getAll: () => entities } : null },
    events: { emit: (name, payload) => emitted.push({ name, payload }) }
  };
  return { world: new PhysicsWorld(context), emitted };
}

test("resolves a moving circle against a static box", () => {
  const player = new Entity("player");
  player.transform.position.set(0, 0);
  player.addComponent(new CircleCollider({ radius: 10 }));
  const body = player.addComponent(new RigidBody({ velocityX: 100 }));

  const wall = new Entity("wall");
  wall.transform.position.set(12, 0);
  wall.addComponent(new BoxCollider({ width: 10, height: 40 }));

  const { world, emitted } = createWorld([player, wall]);
  world.update();

  assert.ok(player.transform.position.x < 0);
  assert.equal(body.velocity.x, 0);
  assert.equal(emitted[0].name, "physics:collision-enter");
  world.update();
  assert.ok(emitted.some(event => event.name === "physics:collision-stay"));
});

test("does not resolve trigger overlaps", () => {
  const actor = new Entity("actor");
  actor.addComponent(new CircleCollider({ radius: 10, isTrigger: true }));
  const body = actor.addComponent(new RigidBody({ velocityX: 20 }));

  const zone = new Entity("zone");
  zone.transform.position.set(5, 0);
  zone.addComponent(new BoxCollider({ width: 20, height: 20 }));

  const { world } = createWorld([actor, zone]);
  world.update();
  assert.equal(actor.transform.position.x, 0);
  assert.equal(body.velocity.x, 20);
});

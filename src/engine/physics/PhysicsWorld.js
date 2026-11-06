import { Collider } from "./Collider.js";
import { RigidBody } from "./RigidBody.js";
import { detectCollision } from "./Collision.js";

export class PhysicsWorld {
  constructor(context) {
    this.context = context;
    this.previousPairs = new Map();
  }

  update() {
    const colliders = [];
    for (const entity of this.context.services.get("entities").getAll()) {
      if (!entity.active) continue;
      for (const component of entity.components.values()) {
        if (component instanceof Collider && component.enabled && component.entity === entity) {
          colliders.push(component);
        }
      }
    }

    const currentPairs = new Map();
    for (let i = 0; i < colliders.length; i += 1) {
      const a = colliders[i];
      for (let j = i + 1; j < colliders.length; j += 1) {
        const b = colliders[j];
        if (a.entity === b.entity) continue;
        if ((a.mask & b.layer) === 0 || (b.mask & a.layer) === 0) continue;

        const contact = detectCollision(a.getShape(), b.getShape());
        if (!contact) continue;

        const key = a.id < b.id ? `${a.id}:${b.id}` : `${b.id}:${a.id}`;
        const pair = { a, b, contact: { ...contact, isTrigger: a.isTrigger || b.isTrigger } };
        currentPairs.set(key, pair);
        if (!pair.contact.isTrigger) this.#resolve(pair);
        this.#dispatch(this.previousPairs.has(key) ? "stay" : "enter", pair);
      }
    }

    for (const [key, pair] of this.previousPairs) {
      if (!currentPairs.has(key)) this.#dispatch("exit", pair);
    }
    this.previousPairs = currentPairs;
  }

  #resolve({ a, b, contact }) {
    const bodyA = a.entity.getComponent(RigidBody);
    const bodyB = b.entity.getComponent(RigidBody);
    const inverseA = bodyA?.inverseMass ?? 0;
    const inverseB = bodyB?.inverseMass ?? 0;
    const inverseTotal = inverseA + inverseB;
    if (inverseTotal <= 0) return;

    const normal = contact.normal;
    const correction = Math.max(contact.penetration - 0.001, 0) / inverseTotal;
    if (inverseA > 0) {
      a.entity.transform.position.x -= normal.x * correction * inverseA;
      a.entity.transform.position.y -= normal.y * correction * inverseA;
    }
    if (inverseB > 0) {
      b.entity.transform.position.x += normal.x * correction * inverseB;
      b.entity.transform.position.y += normal.y * correction * inverseB;
    }

    const velocityA = bodyA?.velocity ?? { x: 0, y: 0 };
    const velocityB = bodyB?.velocity ?? { x: 0, y: 0 };
    const relativeX = velocityB.x - velocityA.x;
    const relativeY = velocityB.y - velocityA.y;
    const velocityAlongNormal = relativeX * normal.x + relativeY * normal.y;
    if (velocityAlongNormal >= 0) return;

    const restitution = Math.min(bodyA?.restitution ?? 0, bodyB?.restitution ?? 0);
    const impulseMagnitude = -(1 + restitution) * velocityAlongNormal / inverseTotal;
    const impulseX = impulseMagnitude * normal.x;
    const impulseY = impulseMagnitude * normal.y;
    if (bodyA) {
      bodyA.velocity.x -= impulseX * inverseA;
      bodyA.velocity.y -= impulseY * inverseA;
    }
    if (bodyB) {
      bodyB.velocity.x += impulseX * inverseB;
      bodyB.velocity.y += impulseY * inverseB;
    }
  }

  #dispatch(phase, pair) {
    const { a, b, contact } = pair;
    const eventName = `physics:collision-${phase}`;
    a[`onCollision${phase[0].toUpperCase()}${phase.slice(1)}`](b, contact);
    const reversed = {
      normal: { x: -contact.normal.x, y: -contact.normal.y },
      penetration: contact.penetration,
      point: contact.point,
      isTrigger: contact.isTrigger
    };
    b[`onCollision${phase[0].toUpperCase()}${phase.slice(1)}`](a, reversed);
    this.context.events.emit(eventName, { a, b, contact, phase });
  }

  clear() {
    this.previousPairs.clear();
  }

  destroy() {
    this.clear();
    this.context = null;
  }
}

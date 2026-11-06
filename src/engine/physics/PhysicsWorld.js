import { Collider } from "./Collider.js";
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
        this.#dispatch(this.previousPairs.has(key) ? "stay" : "enter", pair);
      }
    }

    for (const [key, pair] of this.previousPairs) {
      if (!currentPairs.has(key)) this.#dispatch("exit", pair);
    }
    this.previousPairs = currentPairs;
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

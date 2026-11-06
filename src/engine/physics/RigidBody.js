import { Component } from "../entities/Component.js";
import { Vector2 } from "../math/Vector2.js";

export class RigidBody extends Component {
  constructor({ mass = 1, velocityX = 0, velocityY = 0, restitution = 0, drag = 0 } = {}) {
    super();
    if (!(mass > 0)) throw new RangeError("La masa debe ser mayor que cero.");
    this.mass = mass;
    this.inverseMass = 1 / mass;
    this.velocity = new Vector2(velocityX, velocityY);
    this.restitution = Math.max(0, Math.min(1, restitution));
    this.drag = Math.max(0, drag);
  }

  update(delta) {
    const transform = this.entity?.transform;
    if (!transform || !this.enabled) return;
    transform.position.x += this.velocity.x * delta;
    transform.position.y += this.velocity.y * delta;
    if (this.drag > 0) {
      const damping = Math.exp(-this.drag * delta);
      this.velocity.scale(damping);
    }
  }

  stop() {
    this.velocity.set(0, 0);
  }
}

import { Component } from "../entities/Component.js";
import { Vector2 } from "../math/Vector2.js";

let nextColliderId = 1;

export class Collider extends Component {
  constructor({ offsetX = 0, offsetY = 0, isTrigger = false, layer = 1, mask = 0xffffffff } = {}) {
    super();
    this.id = nextColliderId++;
    this.offset = new Vector2(offsetX, offsetY);
    this.isTrigger = Boolean(isTrigger);
    this.layer = layer >>> 0;
    this.mask = mask >>> 0;
  }

  getWorldCenter() {
    const transform = this.entity?.transform;
    if (!transform) return this.offset.clone();
    const { position, rotation, scale } = transform;
    const x = this.offset.x * scale.x;
    const y = this.offset.y * scale.y;
    const cos = Math.cos(rotation);
    const sin = Math.sin(rotation);
    return new Vector2(
      position.x + x * cos - y * sin,
      position.y + x * sin + y * cos
    );
  }

  getShape() {
    throw new Error("Collider.getShape() debe implementarse en una subclase.");
  }

  onCollisionEnter() {}
  onCollisionStay() {}
  onCollisionExit() {}
}

export class CircleCollider extends Collider {
  constructor({ radius = 16, ...options } = {}) {
    super(options);
    if (!(radius > 0)) throw new RangeError("El radio debe ser mayor que cero.");
    this.radius = radius;
  }

  getShape() {
    const scale = this.entity?.transform?.scale;
    const factor = scale ? Math.max(Math.abs(scale.x), Math.abs(scale.y)) : 1;
    return { type: "circle", center: this.getWorldCenter(), radius: this.radius * factor };
  }
}

export class BoxCollider extends Collider {
  constructor({ width = 32, height = 32, ...options } = {}) {
    super(options);
    if (!(width > 0) || !(height > 0)) throw new RangeError("El ancho y alto deben ser mayores que cero.");
    this.width = width;
    this.height = height;
  }

  getShape() {
    const scale = this.entity?.transform?.scale;
    const scaleX = scale ? Math.abs(scale.x) : 1;
    const scaleY = scale ? Math.abs(scale.y) : 1;
    return {
      type: "box",
      center: this.getWorldCenter(),
      halfWidth: this.width * scaleX / 2,
      halfHeight: this.height * scaleY / 2
    };
  }
}

import { Component } from "../../engine/entities/Component.js";
import { RigidBody } from "../../engine/physics/RigidBody.js";
import { Vector2 } from "../../engine/math/Vector2.js";

export class PlayerController extends Component {
  constructor({ speed = 190, pointerThreshold = 14 } = {}) {
    super();
    this.speed = speed;
    this.pointerThreshold = pointerThreshold;
    this.direction = new Vector2();
  }

  update() {
    const input = this.context?.services.get("input");
    const body = this.entity.getComponent(RigidBody);
    if (!input || !body) return;

    let x = 0;
    let y = 0;
    if (input.virtualJoystick.active) {
      x = input.virtualJoystick.x;
      y = input.virtualJoystick.y;
    } else {
      if (input.isKeyDown("KeyA") || input.isKeyDown("ArrowLeft")) x -= 1;
      if (input.isKeyDown("KeyD") || input.isKeyDown("ArrowRight")) x += 1;
      if (input.isKeyDown("KeyW") || input.isKeyDown("ArrowUp")) y -= 1;
      if (input.isKeyDown("KeyS") || input.isKeyDown("ArrowDown")) y += 1;
    }

    if (x === 0 && y === 0 && !input.virtualJoystick.active && input.pointer.down) {
      const camera = this.context.services.get("camera");
      const target = camera.screenToWorld(input.pointer);
      x = target.x - this.entity.transform.position.x;
      y = target.y - this.entity.transform.position.y;
      if (Math.hypot(x, y) < this.pointerThreshold) x = y = 0;
    }

    this.direction.set(x, y);
    if (x !== 0 || y !== 0) this.direction.normalize();
    body.velocity.set(this.direction.x * this.speed, this.direction.y * this.speed);
  }
}

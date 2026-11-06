import { Component } from "../../engine/entities/Component.js";
import { RigidBody } from "../../engine/physics/RigidBody.js";
import { Vector2 } from "../../engine/math/Vector2.js";

export class PlayerController extends Component {
  constructor({
    speed = 220,
    acceleration = 1250,
    deceleration = 1750,
    pointerThreshold = 14
  } = {}) {
    super();
    this.speed = Math.max(1, Number(speed) || 220);
    this.acceleration = Math.max(0, Number(acceleration) || 0);
    this.deceleration = Math.max(0, Number(deceleration) || 0);
    this.pointerThreshold = Math.max(0, Number(pointerThreshold) || 0);
    this.direction = new Vector2();
    this.inputStrength = 0;
    this.moving = false;
  }

  update(delta = 0) {
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

    if (x === 0 && y === 0 && !input.virtualJoystick.active &&
        input.pointer.down && input.pointer.button === 0) {
      const camera = this.context.services.get("camera");
      const target = camera.screenToWorld(input.pointer);
      x = target.x - this.entity.transform.position.x;
      y = target.y - this.entity.transform.position.y;

      const distance = Math.hypot(x, y);
      if (distance < this.pointerThreshold) {
        x = 0;
        y = 0;
      } else {
        x /= distance;
        y /= distance;
      }
    }

    const magnitude = Math.hypot(x, y);
    const hasInput = magnitude > 0.001;
    this.inputStrength = hasInput ? Math.min(magnitude, 1) : 0;
    this.moving = hasInput;

    if (hasInput) {
      this.direction.set(x / magnitude, y / magnitude);
      this.entity.transform.rotation = Math.atan2(this.direction.y, this.direction.x) + Math.PI / 2;
    } else {
      this.direction.set(0, 0);
    }

    const targetX = this.direction.x * this.speed * this.inputStrength;
    const targetY = this.direction.y * this.speed * this.inputStrength;
    const differenceX = targetX - body.velocity.x;
    const differenceY = targetY - body.velocity.y;
    const difference = Math.hypot(differenceX, differenceY);
    const reversing = hasInput &&
      body.velocity.x * this.direction.x + body.velocity.y * this.direction.y < -20;
    const response = hasInput
      ? this.acceleration * (reversing ? 1.35 : 1)
      : this.deceleration;
    const maxChange = response * Math.max(0, Number(delta) || 0);

    if (difference <= maxChange || difference === 0) {
      body.velocity.set(targetX, targetY);
    } else {
      const ratio = maxChange / difference;
      body.velocity.x += differenceX * ratio;
      body.velocity.y += differenceY * ratio;
    }
  }
}

import { Component } from "../../engine/entities/Component.js";
import { RigidBody } from "../../engine/physics/RigidBody.js";
import { Vector2 } from "../../engine/math/Vector2.js";

export class PlayerController extends Component {
  constructor({ speed = 220 } = {}) {
    super();
    this.speed = Math.max(1, Number(speed) || 220);
    this.direction = new Vector2();
    this.aimDirection = new Vector2(0, -1);
    this.inputStrength = 0;
    this.moving = false;
    this.aimingWithPointer = false;
    this.aimingWithJoystick = false;
  }

  update() {
    const services = this.context?.services;
    const input = services?.get("input");
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

    const magnitude = Math.hypot(x, y);
    const hasInput = magnitude > 0.001;
    this.inputStrength = hasInput ? Math.min(magnitude, 1) : 0;
    this.moving = hasInput;

    if (hasInput) this.direction.set(x / magnitude, y / magnitude);
    else this.direction.set(0, 0);

    body.velocity.set(
      this.direction.x * this.speed * this.inputStrength,
      this.direction.y * this.speed * this.inputStrength
    );

    this.aimingWithPointer = false;
    this.aimingWithJoystick = false;

    const aimStick = input.aimJoystick;
    if (aimStick?.active) {
      const aimLength = Math.hypot(aimStick.x, aimStick.y);
      if (aimLength > 0.001) {
        this.aimDirection.set(aimStick.x / aimLength, aimStick.y / aimLength);
        this.aimingWithJoystick = true;
      }
    }

    if (!this.aimingWithJoystick) {
      const pointer = input.pointer;
      if (pointer?.type === "mouse" && pointer.moved) {
        const renderer = services.get("renderer");
        const camera = services.get("camera");
        const bounds = renderer?.canvas?.getBoundingClientRect?.();
        if (bounds && camera) {
          const worldPointer = camera.screenToWorld({
            x: pointer.x - bounds.left,
            y: pointer.y - bounds.top
          });
          const aimX = worldPointer.x - this.entity.transform.position.x;
          const aimY = worldPointer.y - this.entity.transform.position.y;
          const aimLength = Math.hypot(aimX, aimY);
          if (aimLength > 0.001) {
            this.aimDirection.set(aimX / aimLength, aimY / aimLength);
            this.aimingWithPointer = true;
          }
        }
      }
    }

    // If neither independent aim control is active, face the movement direction.
    if (!this.aimingWithJoystick && !this.aimingWithPointer && hasInput) {
      this.aimDirection.copy(this.direction);
    }

    if (this.aimDirection.lengthSquared() > 0.0001) {
      this.entity.transform.rotation = Math.atan2(this.aimDirection.y, this.aimDirection.x) + Math.PI / 2;
    }
  }
}

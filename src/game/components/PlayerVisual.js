import { Component } from "../../engine/entities/Component.js";
import { RigidBody } from "../../engine/physics/RigidBody.js";
import { PlayerController } from "./PlayerController.js";

const OUTLINE = "#171914";

export class PlayerVisual extends Component {
  constructor() {
    super();
    this.phase = 0;
    this.motion = 0;
  }

  update(delta = 0) {
    const body = this.entity.getComponent(RigidBody);
    const controller = this.entity.getComponent(PlayerController);
    const maxSpeed = controller?.speed ?? 220;
    const speed = body?.velocity.length() ?? 0;
    const targetMotion = Math.min(speed / Math.max(1, maxSpeed), 1);
    const blend = 1 - Math.exp(-(targetMotion > this.motion ? 14 : 18) * Math.max(0, delta));
    this.motion += (targetMotion - this.motion) * blend;
    this.phase += Math.max(0, delta) * (7 + this.motion * 8);
  }

  render(context) {
    const bob = Math.sin(this.phase * 2) * 0.7 * this.motion;
    const armSwing = Math.sin(this.phase) * 1.8 * this.motion;
    const handY = 2;

    context.save();
    context.translate(0, -bob);
    context.scale(1 + this.motion * 0.018, 1 - this.motion * 0.018);

    // The ground shadow is separate from the character's collision geometry.
    context.fillStyle = "rgba(25, 29, 22, .18)";
    context.beginPath();
    context.ellipse(1, 7, 13.5, 6.5, 0, 0, Math.PI * 2);
    context.fill();

    // Arms: dark outline first, then the flat sleeve color.
    context.lineCap = "round";
    context.lineJoin = "round";
    context.strokeStyle = OUTLINE;
    context.lineWidth = 8;
    context.beginPath();
    context.moveTo(-7, 2);
    context.lineTo(-14, handY + armSwing);
    context.moveTo(7, 2);
    context.lineTo(14, handY - armSwing);
    context.stroke();

    context.strokeStyle = "#788f68";
    context.lineWidth = 4.5;
    context.stroke();

    // Hands have their own independent outlines.
    for (const [x, y] of [[-15, handY + armSwing], [15, handY - armSwing]]) {
      context.beginPath();
      context.arc(x, y, 3.5, 0, Math.PI * 2);
      context.fillStyle = "#e3c9a2";
      context.fill();
      context.strokeStyle = OUTLINE;
      context.lineWidth = 2.5;
      context.stroke();
    }

    // Circular body; its 12.4 world-unit radius matches the player collider.
    context.beginPath();
    context.arc(0, 0, 12.4, 0, Math.PI * 2);
    context.fillStyle = "#e3e2d7";
    context.fill();
    context.strokeStyle = OUTLINE;
    context.lineWidth = 3;
    context.stroke();

    // Subtle flat highlight, kept inside the outline.
    context.beginPath();
    context.arc(-4.2, -5.8, 2.6, 0, Math.PI * 2);
    context.fillStyle = "#f5f1df";
    context.fill();

    // Eyes sit toward local -Y; the entity rotation turns them toward the current aim direction.
    context.fillStyle = "#171914";
    context.beginPath();
    context.arc(-4.1, -3.5, 1.7, 0, Math.PI * 2);
    context.arc(4.1, -3.5, 1.7, 0, Math.PI * 2);
    context.fill();

    context.restore();
  }
}

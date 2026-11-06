import { Component } from "../../engine/entities/Component.js";
import { RigidBody } from "../../engine/physics/RigidBody.js";
import { PlayerController } from "./PlayerController.js";

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
    const bob = Math.sin(this.phase * 2) * 1.15 * this.motion;
    const armSwing = Math.sin(this.phase) * 1.8 * this.motion;

    context.save();
    context.translate(0, -bob);
    context.scale(1 + this.motion * 0.018, 1 - this.motion * 0.018);

    // Soft ground shadow keeps the character visually anchored.
    context.fillStyle = "rgba(28, 39, 27, .25)";
    context.beginPath();
    context.ellipse(1, 8, 13.5, 7.2, 0, 0, Math.PI * 2);
    context.fill();

    // Two short arms remain visible around the circular body.
    context.lineCap = "round";
    context.lineJoin = "round";
    context.beginPath();
    context.moveTo(-7, 2);
    context.lineTo(-14, 2 + armSwing);
    context.moveTo(7, 2);
    context.lineTo(14, 2 - armSwing);
    context.strokeStyle = "#354333";
    context.lineWidth = 7.2;
    context.stroke();

    context.beginPath();
    context.moveTo(-7, 2);
    context.lineTo(-14, 2 + armSwing);
    context.moveTo(7, 2);
    context.lineTo(14, 2 - armSwing);
    context.strokeStyle = "#78916b";
    context.lineWidth = 4.6;
    context.stroke();

    // Small hands give the silhouette the classic top-down survivor look.
    context.fillStyle = "#e1c9a5";
    context.strokeStyle = "#354333";
    context.lineWidth = 1.35;
    context.beginPath();
    context.arc(-14.5, 2 + armSwing, 3.2, 0, Math.PI * 2);
    context.arc(14.5, 2 - armSwing, 3.2, 0, Math.PI * 2);
    context.fill();
    context.stroke();

    // Main body: deliberately simple, circular and easy to read in motion.
    context.fillStyle = "#dedfd3";
    context.strokeStyle = "#344033";
    context.lineWidth = 2;
    context.beginPath();
    context.arc(0, 0, 12.4, 0, Math.PI * 2);
    context.fill();
    context.stroke();

    context.fillStyle = "rgba(255, 255, 246, .32)";
    context.beginPath();
    context.arc(-4.2, -6.2, 3.1, 0, Math.PI * 2);
    context.fill();

    // Eyes point toward the character's facing direction.
    context.fillStyle = "#202920";
    context.beginPath();
    context.arc(-4.1, -3.4, 1.55, 0, Math.PI * 2);
    context.arc(4.1, -3.4, 1.55, 0, Math.PI * 2);
    context.fill();

    context.restore();
  }
}

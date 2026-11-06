import { Component } from "../../engine/entities/Component.js";

export class PlayerVisual extends Component {
  render(context) {
    context.fillStyle = "#dce8d1";
    context.strokeStyle = "#26352a";
    context.lineWidth = 2.5;
    context.beginPath();
    context.arc(0, 0, 13, 0, Math.PI * 2);
    context.fill();
    context.stroke();

    context.fillStyle = "#26352a";
    context.beginPath();
    context.arc(-4.2, -2, 1.8, 0, Math.PI * 2);
    context.arc(4.2, -2, 1.8, 0, Math.PI * 2);
    context.fill();

    context.strokeStyle = "#26352a";
    context.lineWidth = 1.5;
    context.beginPath();
    context.moveTo(-3, 5);
    context.quadraticCurveTo(0, 7, 3, 5);
    context.stroke();
  }
}

import { Component } from "../../engine/entities/Component.js";

export class PlayerVisual extends Component {
  render(context) {
    // Ground shadow.
    context.fillStyle = "rgba(34, 48, 31, .25)";
    context.beginPath();
    context.ellipse(1, 5, 14, 10, 0, 0, Math.PI * 2);
    context.fill();

    // Backpack, visible behind the body from the top-down view.
    context.fillStyle = "#765b3d";
    context.strokeStyle = "#3e382b";
    context.lineWidth = 1.8;
    context.beginPath();
    context.roundRect(-7, 3, 14, 11, 4);
    context.fill();
    context.stroke();
    context.fillStyle = "#a17b4e";
    context.fillRect(-4, 5, 8, 2);

    // Feet and arms.
    context.fillStyle = "#554638";
    context.strokeStyle = "#302f27";
    context.lineWidth = 1.5;
    context.beginPath();
    context.roundRect(-8, 7, 6, 8, 2);
    context.roundRect(2, 7, 6, 8, 2);
    context.fill();
    context.stroke();

    context.fillStyle = "#d7b58a";
    context.beginPath();
    context.roundRect(-15, -5, 7, 11, 3);
    context.roundRect(8, -5, 7, 11, 3);
    context.fill();
    context.stroke();

    // Jacket / torso.
    context.fillStyle = "#547d49";
    context.strokeStyle = "#304a32";
    context.lineWidth = 2;
    context.beginPath();
    context.ellipse(0, 0, 10.5, 12, 0, 0, Math.PI * 2);
    context.fill();
    context.stroke();

    // Head and face, oriented toward the top of the screen.
    context.fillStyle = "#e8c49b";
    context.strokeStyle = "#6c5942";
    context.lineWidth = 1.5;
    context.beginPath();
    context.arc(0, -5, 7.4, 0, Math.PI * 2);
    context.fill();
    context.stroke();

    context.fillStyle = "#473a2e";
    context.beginPath();
    context.arc(-2.5, -6, 1, 0, Math.PI * 2);
    context.arc(2.5, -6, 1, 0, Math.PI * 2);
    context.fill();

    context.fillStyle = "#b9d18a";
    context.beginPath();
    context.arc(0, 1, 2.3, 0, Math.PI * 2);
    context.fill();
  }
}

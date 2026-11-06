import { Component } from "../../engine/entities/Component.js";

export class ShapeRenderer extends Component {
  constructor({ shape = "circle", radius = 12, width = 32, height = 32, fill = "#d8e6ce", stroke = "#26352a", lineWidth = 2 } = {}) {
    super();
    this.shape = shape;
    this.radius = radius;
    this.width = width;
    this.height = height;
    this.fill = fill;
    this.stroke = stroke;
    this.lineWidth = lineWidth;
  }

  render(context) {
    context.fillStyle = this.fill;
    context.strokeStyle = this.stroke;
    context.lineWidth = this.lineWidth;
    if (this.shape === "circle") {
      context.beginPath();
      context.arc(0, 0, this.radius, 0, Math.PI * 2);
      context.fill();
      context.stroke();
      return;
    }
    context.beginPath();
    context.roundRect(-this.width / 2, -this.height / 2, this.width, this.height, 5);
    context.fill();
    context.stroke();
  }
}

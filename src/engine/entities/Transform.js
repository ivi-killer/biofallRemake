import { Component } from "./Component.js";
import { Vector2 } from "../math/Vector2.js";

export class Transform extends Component {
  constructor({ x = 0, y = 0, rotation = 0, scaleX = 1, scaleY = 1 } = {}) {
    super();
    this.position = new Vector2(x, y);
    this.rotation = rotation;
    this.scale = new Vector2(scaleX, scaleY);
  }
  translate(x, y) {
    this.position.x += x;
    this.position.y += y;
    return this;
  }
}

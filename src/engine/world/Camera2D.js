import { Vector2 } from "../math/Vector2.js";
import { MathUtils } from "../math/MathUtils.js";

export class Camera2D {
  constructor({ x = 0, y = 0, zoom = 1, smoothing = 0 } = {}) {
    this.position = new Vector2(x, y);
    this.target = null;
    this.zoom = Math.max(0.1, zoom);
    this.smoothing = Math.max(0, smoothing);
    this.offset = new Vector2();
    this.viewport = { width: 0, height: 0 };
  }

  follow(target) { this.target = target; return this; }
  setViewport(width, height) {
    this.viewport.width = width;
    this.viewport.height = height;
  }
  setZoom(zoom) { this.zoom = Math.max(0.1, zoom); }

  update(delta) {
    if (!this.target) return;
    const destination = this.target.position ?? this.target;
    if (this.smoothing <= 0) {
      this.position.copy(destination);
      return;
    }
    const blend = 1 - Math.exp(-this.smoothing * delta);
    this.position.x = MathUtils.lerp(this.position.x, destination.x, blend);
    this.position.y = MathUtils.lerp(this.position.y, destination.y, blend);
  }

  worldToScreen(point) {
    return new Vector2(
      (point.x - this.position.x) * this.zoom + this.viewport.width / 2 + this.offset.x,
      (point.y - this.position.y) * this.zoom + this.viewport.height / 2 + this.offset.y
    );
  }

  screenToWorld(point) {
    return new Vector2(
      (point.x - this.viewport.width / 2 - this.offset.x) / this.zoom + this.position.x,
      (point.y - this.viewport.height / 2 - this.offset.y) / this.zoom + this.position.y
    );
  }

  applyTransform(context) {
    context.translate(this.viewport.width / 2 + this.offset.x, this.viewport.height / 2 + this.offset.y);
    context.scale(this.zoom, this.zoom);
    context.translate(-this.position.x, -this.position.y);
  }
}

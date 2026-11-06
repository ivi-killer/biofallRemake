import { Vector2 } from "../math/Vector2.js";
import { MathUtils } from "../math/MathUtils.js";
import { RigidBody } from "../physics/RigidBody.js";

export class Camera2D {
  constructor({
    x = 0,
    y = 0,
    zoom = 1,
    smoothing = 8,
    lookAhead = 0.15,
    maxLookAhead = 42,
    dynamicZoom = 0.045,
    zoomSmoothing = 5
  } = {}) {
    this.position = new Vector2(x, y);
    this.target = null;
    this.baseZoom = Math.max(0.1, zoom);
    this.zoom = this.baseZoom;
    this.smoothing = Math.max(0, smoothing);
    this.lookAhead = Math.max(0, lookAhead);
    this.maxLookAhead = Math.max(0, maxLookAhead);
    this.dynamicZoom = Math.max(0, dynamicZoom);
    this.zoomSmoothing = Math.max(0, zoomSmoothing);
    this.offset = new Vector2();
    this.viewport = { width: 0, height: 0 };
  }

  follow(target) {
    this.target = target;
    return this;
  }

  setViewport(width, height) {
    this.viewport.width = width;
    this.viewport.height = height;
  }

  setZoom(zoom) {
    this.baseZoom = Math.max(0.1, zoom);
    this.zoom = this.baseZoom;
  }

  update(delta = 0) {
    if (!this.target) return;

    const focus = this.target.transform?.position ?? this.target.position ?? this.target;
    const body = this.target.getComponent?.(RigidBody);
    const velocity = body?.velocity ?? this.target.velocity ?? { x: 0, y: 0 };
    const speed = Math.hypot(velocity.x, velocity.y);

    let lookX = velocity.x * this.lookAhead;
    let lookY = velocity.y * this.lookAhead;
    const lookDistance = Math.hypot(lookX, lookY);

    if (lookDistance > this.maxLookAhead && lookDistance > 0) {
      const scale = this.maxLookAhead / lookDistance;
      lookX *= scale;
      lookY *= scale;
    }

    const destinationX = focus.x + lookX;
    const destinationY = focus.y + lookY;
    const frameDelta = Math.max(0, Number(delta) || 0);
    const positionBlend = this.smoothing <= 0
      ? 1
      : 1 - Math.exp(-this.smoothing * frameDelta);

    this.position.x = MathUtils.lerp(this.position.x, destinationX, positionBlend);
    this.position.y = MathUtils.lerp(this.position.y, destinationY, positionBlend);

    const speedRatio = Math.min(speed / 230, 1);
    const targetZoom = Math.max(0.1, this.baseZoom - this.dynamicZoom * speedRatio);
    const zoomBlend = this.zoomSmoothing <= 0
      ? 1
      : 1 - Math.exp(-this.zoomSmoothing * frameDelta);
    this.zoom = MathUtils.lerp(this.zoom, targetZoom, zoomBlend);
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

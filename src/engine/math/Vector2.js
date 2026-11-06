export class Vector2 {
  constructor(x = 0, y = 0) { this.x = x; this.y = y; }
  set(x, y) { this.x = x; this.y = y; return this; }
  copy(vector) { return this.set(vector.x, vector.y); }
  clone() { return new Vector2(this.x, this.y); }
  add(vector) { this.x += vector.x; this.y += vector.y; return this; }
  subtract(vector) { this.x -= vector.x; this.y -= vector.y; return this; }
  scale(value) { this.x *= value; this.y *= value; return this; }
  lengthSquared() { return this.x * this.x + this.y * this.y; }
  length() { return Math.hypot(this.x, this.y); }
  normalize() {
    const magnitude = this.length();
    if (magnitude > 0) this.scale(1 / magnitude);
    return this;
  }
  distanceTo(vector) { return Math.hypot(this.x - vector.x, this.y - vector.y); }
  dot(vector) { return this.x * vector.x + this.y * vector.y; }
  equals(vector) { return this.x === vector.x && this.y === vector.y; }
  static add(a, b) { return new Vector2(a.x + b.x, a.y + b.y); }
  static subtract(a, b) { return new Vector2(a.x - b.x, a.y - b.y); }
  static fromAngle(radians, magnitude = 1) {
    return new Vector2(Math.cos(radians) * magnitude, Math.sin(radians) * magnitude);
  }
}

import { Vector2 } from "../math/Vector2.js";

function circleCircle(a, b) {
  const dx = b.center.x - a.center.x;
  const dy = b.center.y - a.center.y;
  const radius = a.radius + b.radius;
  const distanceSquared = dx * dx + dy * dy;
  if (distanceSquared > radius * radius) return null;

  const distance = Math.sqrt(distanceSquared);
  const normal = distance > 0 ? new Vector2(dx / distance, dy / distance) : new Vector2(1, 0);
  return {
    normal,
    penetration: radius - distance,
    point: new Vector2(a.center.x + normal.x * (a.radius - (radius - distance) / 2),
      a.center.y + normal.y * (a.radius - (radius - distance) / 2))
  };
}

function boxBox(a, b) {
  const dx = b.center.x - a.center.x;
  const dy = b.center.y - a.center.y;
  const overlapX = a.halfWidth + b.halfWidth - Math.abs(dx);
  const overlapY = a.halfHeight + b.halfHeight - Math.abs(dy);
  if (overlapX < 0 || overlapY < 0) return null;

  if (overlapX < overlapY) {
    const direction = dx < 0 ? -1 : 1;
    return {
      normal: new Vector2(direction, 0),
      penetration: overlapX,
      point: new Vector2(a.center.x + direction * a.halfWidth, (a.center.y + b.center.y) / 2)
    };
  }
  const direction = dy < 0 ? -1 : 1;
  return {
    normal: new Vector2(0, direction),
    penetration: overlapY,
    point: new Vector2((a.center.x + b.center.x) / 2, a.center.y + direction * a.halfHeight)
  };
}

function circleBox(circle, box) {
  const left = box.center.x - box.halfWidth;
  const right = box.center.x + box.halfWidth;
  const top = box.center.y - box.halfHeight;
  const bottom = box.center.y + box.halfHeight;
  const closestX = Math.max(left, Math.min(circle.center.x, right));
  const closestY = Math.max(top, Math.min(circle.center.y, bottom));
  const dx = closestX - circle.center.x;
  const dy = closestY - circle.center.y;
  const distanceSquared = dx * dx + dy * dy;

  if (distanceSquared > circle.radius * circle.radius) return null;

  if (distanceSquared > 0) {
    const distance = Math.sqrt(distanceSquared);
    return {
      normal: new Vector2(dx / distance, dy / distance),
      penetration: circle.radius - distance,
      point: new Vector2(closestX, closestY)
    };
  }

  const distances = [
    { value: circle.center.x - left, normal: new Vector2(-1, 0), point: new Vector2(left, circle.center.y) },
    { value: right - circle.center.x, normal: new Vector2(1, 0), point: new Vector2(right, circle.center.y) },
    { value: circle.center.y - top, normal: new Vector2(0, -1), point: new Vector2(circle.center.x, top) },
    { value: bottom - circle.center.y, normal: new Vector2(0, 1), point: new Vector2(circle.center.x, bottom) }
  ];
  distances.sort((a, b) => a.value - b.value);
  const nearest = distances[0];
  return {
    normal: nearest.normal.clone().scale(-1),
    penetration: circle.radius + nearest.value,
    point: nearest.point
  };
}

export function detectCollision(a, b) {
  if (!a || !b) return null;
  if (a.type === "circle" && b.type === "circle") return circleCircle(a, b);
  if (a.type === "box" && b.type === "box") return boxBox(a, b);
  if (a.type === "circle" && b.type === "box") return circleBox(a, b);
  if (a.type === "box" && b.type === "circle") {
    const contact = circleBox(b, a);
    if (!contact) return null;
    contact.normal.scale(-1);
    return contact;
  }
  return null;
}

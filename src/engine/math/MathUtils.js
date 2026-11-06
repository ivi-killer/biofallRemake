export const MathUtils = Object.freeze({
  clamp(value, min, max) { return Math.min(max, Math.max(min, value)); },
  lerp(start, end, amount) { return start + (end - start) * amount; },
  inverseLerp(start, end, value) {
    return start === end ? 0 : (value - start) / (end - start);
  },
  randomRange(min, max) { return min + Math.random() * (max - min); },
  randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  },
  moveTowards(current, target, maxDelta) {
    const difference = target - current;
    if (Math.abs(difference) <= maxDelta) return target;
    return current + Math.sign(difference) * maxDelta;
  },
  degToRad(degrees) { return degrees * Math.PI / 180; },
  radToDeg(radians) { return radians * 180 / Math.PI; }
});

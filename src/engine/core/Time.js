export class Time {
  constructor({ maxDelta = 0.05 } = {}) {
    this.maxDelta = Math.max(0, Number(maxDelta) || 0);
    this.elapsed = 0;
    this.delta = 0;
    this.frame = 0;
    this.#lastTimestamp = null;
  }

  #lastTimestamp;

  update(timestamp) {
    if (this.#lastTimestamp === null) {
      this.delta = 0;
    } else {
      this.delta = Math.min(Math.max(0, (timestamp - this.#lastTimestamp) / 1000), this.maxDelta);
    }
    this.#lastTimestamp = timestamp;
    this.elapsed += this.delta;
    this.frame += 1;
  }

  reset() {
    this.elapsed = 0;
    this.delta = 0;
    this.frame = 0;
    this.#lastTimestamp = null;
  }
}

export class Time {
  constructor() {
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
      this.delta = Math.min((timestamp - this.#lastTimestamp) / 1000, 0.05);
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

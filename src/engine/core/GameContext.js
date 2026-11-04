export class GameContext {
  constructor({ services, events, time, config }) {
    this.services = services;
    this.events = events;
    this.time = time;
    this.config = Object.freeze({ ...config });
  }
}

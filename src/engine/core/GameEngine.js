import { EventBus } from "./EventBus.js";
import { Time } from "./Time.js";
import { ServiceContainer } from "./ServiceContainer.js";
import { GameContext } from "./GameContext.js";
import { Renderer } from "../rendering/Renderer.js";

export class GameEngine {
  static VERSION = "0.1.0";

  constructor({ canvas, config = {} }) {
    this.events = new EventBus();
    this.time = new Time();
    this.services = new ServiceContainer();
    this.config = { maxDelta: 0.05, ...config };
    this.context = new GameContext({
      services: this.services,
      events: this.events,
      time: this.time,
      config: this.config
    });
    this.renderer = this.services.register("renderer", new Renderer(canvas));
    this.running = false;
    this.frameRequest = null;
    this.boundFrame = (timestamp) => this.#frame(timestamp);
  }

  async start() {
    if (this.running) return;
    this.running = true;
    this.time.reset();
    this.events.emit("engine:start", this.context);
    this.frameRequest = requestAnimationFrame(this.boundFrame);
  }

  #frame(timestamp) {
    if (!this.running) return;
    this.time.update(timestamp);
    this.events.emit("engine:update", this.context);
    this.renderer.render(this.context);
    this.events.emit("engine:render", this.context);
    this.frameRequest = requestAnimationFrame(this.boundFrame);
  }

  stop() {
    if (!this.running) return;
    this.running = false;
    if (this.frameRequest !== null) cancelAnimationFrame(this.frameRequest);
    this.frameRequest = null;
    this.events.emit("engine:stop", this.context);
  }

  destroy() {
    this.stop();
    this.services.clear();
    this.events.clear();
  }
}

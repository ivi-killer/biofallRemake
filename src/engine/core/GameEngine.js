import { EventBus } from "./EventBus.js";
import { Time } from "./Time.js";
import { ServiceContainer } from "./ServiceContainer.js";
import { GameContext } from "./GameContext.js";
import { Renderer } from "../rendering/Renderer.js";
import { InputManager } from "../input/InputManager.js";
import { Camera2D } from "../world/Camera2D.js";
import { SceneManager } from "../scenes/SceneManager.js";
import { EntityManager } from "../entities/EntityManager.js";
import { PhysicsWorld } from "../physics/PhysicsWorld.js";
import { Collider } from "../physics/Collider.js";

export class GameEngine {
  static VERSION = "0.8.0";
  constructor({ canvas, config = {} }) {
    this.config = { maxDelta: 0.05, ...config };
    this.events = new EventBus();
    this.time = new Time({ maxDelta: this.config.maxDelta });
    this.services = new ServiceContainer();
    this.context = new GameContext({
      services: this.services, events: this.events, time: this.time, config: this.config
    });
    this.renderer = this.services.register("renderer", new Renderer(canvas));
    this.input = this.services.register("input", new InputManager(window));
    this.camera = this.services.register("camera", new Camera2D({
      zoom: 1.25,
      smoothing: 0,
      lookAhead: 0,
      maxLookAhead: 0,
      dynamicZoom: 0,
      zoomSmoothing: 0
    }));
    this.entities = this.services.register("entities", new EntityManager(this.context));
    this.scenes = this.services.register("scenes", new SceneManager(this.context));
    this.physics = this.services.register("physics", new PhysicsWorld(this.context));
    this.running = false;
    this.debugDrawColliders = false;
    this.frameRequest = null;
    this.boundFrame = timestamp => this.#frame(timestamp);
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
    const { delta } = this.time;
    this.camera.setViewport(this.renderer.width, this.renderer.height);
    this.entities.update(delta);
    this.physics.update();
    this.scenes.update(delta);
    this.events.emit("engine:update", this.context);
    // Follow the final simulated position, after movement and collision resolution.
    this.camera.update(delta);
    this.renderer.render(this.context);
    this.scenes.render(this.renderer.context, this.camera);
    this.entities.render(this.renderer.context, this.camera);
    if (this.debugDrawColliders) this.#renderColliders();
    this.events.emit("engine:render", this.context);
    this.input.endFrame();
    this.frameRequest = requestAnimationFrame(this.boundFrame);
  }
  #renderColliders() {
    const context = this.renderer.context;
    context.save();
    this.camera.applyTransform(context);
    context.lineWidth = 1.5 / this.camera.zoom;
    for (const entity of this.entities.getAll()) {
      for (const component of entity.components.values()) {
        if (!(component instanceof Collider) || !component.enabled) continue;
        const shape = component.getShape();
        context.strokeStyle = component.isTrigger ? "#f3cf63" : entity.name === "Player" ? "#62e7ff" : "#ff6f68";
        context.beginPath();
        if (shape.type === "circle") {
          context.arc(shape.center.x, shape.center.y, shape.radius, 0, Math.PI * 2);
        } else {
          context.rect(shape.center.x - shape.halfWidth, shape.center.y - shape.halfHeight,
            shape.halfWidth * 2, shape.halfHeight * 2);
        }
        context.stroke();
      }
    }
    context.restore();
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

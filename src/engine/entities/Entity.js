import { Transform } from "./Transform.js";

let nextEntityId = 1;

export class Entity {
  constructor(name = "Entity") {
    this.id = nextEntityId++;
    this.name = name;
    this.active = true;
    this.context = null;
    this.components = new Map();
    this.transform = this.addComponent(new Transform());
  }

  addComponent(component) {
    if (!component || typeof component !== "object") throw new TypeError("Componente no válido.");
    const key = component.constructor;
    if (this.components.has(key)) throw new Error(`La entidad "${this.name}" ya tiene ese componente.`);
    component.entity = this;
    this.components.set(key, component);
    if (this.context) component.onAttach();
    if (component instanceof Transform) this.transform = component;
    return component;
  }

  getComponent(ComponentType) { return this.components.get(ComponentType) ?? null; }
  hasComponent(ComponentType) { return this.components.has(ComponentType); }

  removeComponent(ComponentType) {
    const component = this.components.get(ComponentType);
    if (!component) return false;
    component.onDetach();
    component.destroy();
    component.entity = null;
    this.components.delete(ComponentType);
    if (component === this.transform) this.transform = null;
    return true;
  }

  attachContext(context) {
    this.context = context;
    for (const component of this.components.values()) component.onAttach();
  }

  update(delta) {
    if (!this.active) return;
    for (const component of this.components.values()) {
      if (component.enabled) component.update(delta);
    }
  }

  render(context) {
    if (!this.active) return;
    context.save();
    if (this.transform) {
      const { position, rotation, scale } = this.transform;
      context.translate(position.x, position.y);
      context.rotate(rotation);
      context.scale(scale.x, scale.y);
    }
    for (const component of this.components.values()) {
      if (component.enabled) component.render(context);
    }
    context.restore();
  }

  destroy() {
    for (const component of this.components.values()) {
      component.onDetach();
      component.destroy();
      component.entity = null;
    }
    this.components.clear();
    this.context = null;
    this.active = false;
  }
}

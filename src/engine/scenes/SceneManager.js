export class SceneManager {
  constructor(context) {
    this.context = context;
    this.scenes = new Map();
    this.current = null;
    this.pending = null;
  }

  add(scene) {
    if (!scene?.name) throw new TypeError("La escena no es válida.");
    if (this.scenes.has(scene.name)) throw new Error(`La escena "${scene.name}" ya existe.`);
    scene.context = this.context;
    this.scenes.set(scene.name, scene);
    return scene;
  }

  has(name) { return this.scenes.has(name); }
  get(name) {
    const scene = this.scenes.get(name);
    if (!scene) throw new Error(`No existe la escena "${name}".`);
    return scene;
  }

  change(name, data = undefined) {
    this.get(name);
    this.pending = { name, data };
  }

  #commitTransition() {
    if (!this.pending) return;
    const { name, data } = this.pending;
    this.pending = null;
    const next = this.get(name);
    if (this.current === next) return;
    if (this.current) {
      this.current.active = false;
      this.current.onExit();
    }
    this.current = next;
    this.current.active = true;
    this.current.onEnter(data);
    this.context.events.emit("scene:changed", { name, scene: next });
  }

  update(delta) {
    this.#commitTransition();
    this.current?.update(delta, this.context);
  }

  render(context, camera) {
    if (!this.current) return;
    context.save();
    if (camera) camera.applyTransform(context);
    this.current.render(context, this.context);
    context.restore();
  }

  destroy() {
    for (const scene of this.scenes.values()) scene.destroy();
    this.scenes.clear();
    this.current = null;
    this.pending = null;
  }
}

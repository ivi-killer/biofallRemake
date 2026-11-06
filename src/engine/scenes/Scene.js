export class Scene {
  constructor(name) {
    if (!name) throw new Error("Una escena necesita un nombre.");
    this.name = name;
    this.context = null;
    this.active = false;
  }
  onEnter() {}
  onExit() {}
  update() {}
  render() {}
  destroy() {}
}

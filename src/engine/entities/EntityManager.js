export class EntityManager {
  constructor(context) {
    this.context = context;
    this.entities = new Map();
    this.pendingAdd = [];
    this.pendingRemove = new Set();
    this.updating = false;
  }
  add(entity) {
    if (!entity?.id) throw new TypeError("Entidad no válida.");
    if (this.entities.has(entity.id) || this.pendingAdd.some(item => item.id === entity.id)) {
      throw new Error(`La entidad "${entity.name}" ya está registrada.`);
    }
    entity.attachContext(this.context);
    if (this.updating) this.pendingAdd.push(entity);
    else this.entities.set(entity.id, entity);
    return entity;
  }
  remove(entityOrId) {
    const id = typeof entityOrId === "number" ? entityOrId : entityOrId?.id;
    if (!this.entities.has(id) && !this.pendingAdd.some(item => item.id === id)) return false;
    if (this.updating) this.pendingRemove.add(id);
    else {
      const entity = this.entities.get(id) ?? this.pendingAdd.find(item => item.id === id);
      this.entities.delete(id);
      this.pendingAdd = this.pendingAdd.filter(item => item.id !== id);
      entity?.destroy();
    }
    return true;
  }
  get(id) { return this.entities.get(id) ?? null; }
  findByName(name) { return [...this.entities.values()].find(entity => entity.name === name) ?? null; }
  update(delta) {
    this.updating = true;
    try {
      for (const entity of this.entities.values()) {
        if (!this.pendingRemove.has(entity.id)) entity.update(delta);
      }
    } finally {
      this.updating = false;
      for (const id of this.pendingRemove) {
        const entity = this.entities.get(id) ?? this.pendingAdd.find(item => item.id === id);
        this.entities.delete(id);
        entity?.destroy();
      }
      this.pendingRemove.clear();
      for (const entity of this.pendingAdd) {
        if (!this.entities.has(entity.id)) this.entities.set(entity.id, entity);
      }
      this.pendingAdd.length = 0;
    }
  }
  render(context, camera = null) {
    context.save();
    if (camera) camera.applyTransform(context);
    for (const entity of this.entities.values()) {
      if (!this.pendingRemove.has(entity.id)) entity.render(context);
    }
    context.restore();
  }
  clear() {
    for (const entity of this.entities.values()) entity.destroy();
    for (const entity of this.pendingAdd) entity.destroy();
    this.entities.clear();
    this.pendingAdd.length = 0;
    this.pendingRemove.clear();
  }
  destroy() { this.clear(); }
}

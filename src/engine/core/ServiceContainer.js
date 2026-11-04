export class ServiceContainer {
  #services = new Map();

  register(name, service) {
    if (this.#services.has(name)) throw new Error(`El servicio "${name}" ya está registrado.`);
    this.#services.set(name, service);
    return service;
  }

  replace(name, service) {
    this.#services.set(name, service);
    return service;
  }

  get(name) {
    if (!this.#services.has(name)) throw new Error(`No existe el servicio "${name}".`);
    return this.#services.get(name);
  }

  has(name) { return this.#services.has(name); }

  clear() {
    for (const service of this.#services.values()) service?.destroy?.();
    this.#services.clear();
  }
}

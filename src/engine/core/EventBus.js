export class EventBus {
  #listeners = new Map();

  on(eventName, listener) {
    if (typeof listener !== "function") throw new TypeError("El listener debe ser una función.");
    const listeners = this.#listeners.get(eventName) ?? new Set();
    listeners.add(listener);
    this.#listeners.set(eventName, listeners);
    return () => this.off(eventName, listener);
  }

  once(eventName, listener) {
    let unsubscribe;
    unsubscribe = this.on(eventName, (...args) => {
      unsubscribe();
      listener(...args);
    });
    return unsubscribe;
  }

  emit(eventName, ...args) {
    const listeners = this.#listeners.get(eventName);
    if (!listeners) return;
    for (const listener of [...listeners]) listener(...args);
  }

  off(eventName, listener) {
    const listeners = this.#listeners.get(eventName);
    if (!listeners) return;
    listeners.delete(listener);
    if (listeners.size === 0) this.#listeners.delete(eventName);
  }

  clear() { this.#listeners.clear(); }
}

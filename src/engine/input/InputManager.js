const DEFAULT_PREVENTED_KEYS = new Set([
  "ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", "Space"
]);

export class InputManager {
  constructor(target = window) {
    this.target = target;
    this.keysDown = new Set();
    this.keysPressed = new Set();
    this.keysReleased = new Set();
    this.pointer = { x: 0, y: 0, down: false, pressed: false, released: false, button: -1 };
    this.pointerInside = false;
    this.virtualJoystick = { x: 0, y: 0, active: false };
    this.boundHandlers = {
      keydown: event => this.#onKeyDown(event),
      keyup: event => this.#onKeyUp(event),
      blur: () => this.reset(),
      pointermove: event => this.#onPointerMove(event),
      pointerdown: event => this.#onPointerDown(event),
      pointerup: event => this.#onPointerUp(event),
      pointercancel: () => this.#onPointerUp(null),
      pointerenter: () => { this.pointerInside = true; },
      pointerleave: () => { this.pointerInside = false; }
    };
    target.addEventListener("keydown", this.boundHandlers.keydown);
    target.addEventListener("keyup", this.boundHandlers.keyup);
    target.addEventListener("blur", this.boundHandlers.blur);
    target.addEventListener("pointermove", this.boundHandlers.pointermove);
    target.addEventListener("pointerdown", this.boundHandlers.pointerdown);
    target.addEventListener("pointerup", this.boundHandlers.pointerup);
    target.addEventListener("pointercancel", this.boundHandlers.pointercancel);
    target.addEventListener("pointerenter", this.boundHandlers.pointerenter);
    target.addEventListener("pointerleave", this.boundHandlers.pointerleave);
  }

  #onKeyDown(event) {
    if (DEFAULT_PREVENTED_KEYS.has(event.code)) event.preventDefault();
    if (!this.keysDown.has(event.code)) this.keysPressed.add(event.code);
    this.keysDown.add(event.code);
  }

  #onKeyUp(event) {
    if (this.keysDown.has(event.code)) this.keysReleased.add(event.code);
    this.keysDown.delete(event.code);
  }

  #onPointerMove(event) {
    this.pointer.x = event.clientX;
    this.pointer.y = event.clientY;
  }

  #onPointerDown(event) {
    if (event) {
      this.#onPointerMove(event);
      this.pointer.button = event.button;
    }
    if (!this.pointer.down) this.pointer.pressed = true;
    this.pointer.down = true;
  }

  #onPointerUp(event) {
    if (event) this.#onPointerMove(event);
    if (this.pointer.down) this.pointer.released = true;
    this.pointer.down = false;
    this.pointer.button = -1;
  }

  isKeyDown(code) { return this.keysDown.has(code); }
  wasKeyPressed(code) { return this.keysPressed.has(code); }
  wasKeyReleased(code) { return this.keysReleased.has(code); }

  endFrame() {
    this.keysPressed.clear();
    this.keysReleased.clear();
    this.pointer.pressed = false;
    this.pointer.released = false;
  }

  reset() {
    this.keysDown.clear();
    this.keysPressed.clear();
    this.keysReleased.clear();
    this.pointer.down = false;
    this.pointer.pressed = false;
    this.pointer.released = false;
    this.pointer.button = -1;
    this.virtualJoystick.x = 0;
    this.virtualJoystick.y = 0;
    this.virtualJoystick.active = false;
  }

  destroy() {
    for (const [eventName, handler] of Object.entries(this.boundHandlers)) {
      this.target.removeEventListener(eventName, handler);
    }
    this.reset();
  }
}

import { MathUtils } from "../../engine/math/MathUtils.js";

export class VirtualJoystick {
  constructor({ element, input, deadZone = 0.14 } = {}) {
    if (!element || !input) throw new TypeError("VirtualJoystick necesita un elemento e InputManager.");
    this.element = element;
    this.knob = element.querySelector("#joystick-knob");
    this.input = input;
    this.deadZone = MathUtils.clamp(deadZone, 0, 0.5);
    this.pointerId = null;
    this.bound = {
      down: event => this.onPointerDown(event),
      move: event => this.onPointerMove(event),
      up: event => this.onPointerUp(event),
      cancel: event => this.onPointerUp(event),
      blur: () => this.reset()
    };
    element.addEventListener("pointerdown", this.bound.down);
    element.addEventListener("pointermove", this.bound.move);
    element.addEventListener("pointerup", this.bound.up);
    element.addEventListener("pointercancel", this.bound.cancel);
    window.addEventListener("blur", this.bound.blur);
  }

  onPointerDown(event) {
    if (this.pointerId !== null || (event.pointerType === "mouse" && event.button !== 0)) return;
    event.preventDefault();
    event.stopPropagation();
    this.pointerId = event.pointerId;
    this.element.setPointerCapture(event.pointerId);
    this.input.virtualJoystick.active = true;
    this.update(event);
  }

  onPointerMove(event) {
    if (event.pointerId !== this.pointerId) return;
    event.preventDefault();
    event.stopPropagation();
    this.update(event);
  }

  update(event) {
    const rect = this.element.getBoundingClientRect();
    const radius = rect.width / 2;
    const maxTravel = radius * 0.62;
    const dx = event.clientX - (rect.left + radius);
    const dy = event.clientY - (rect.top + radius);
    const distance = Math.hypot(dx, dy);
    const normalized = Math.min(distance / maxTravel, 1);
    const strength = normalized <= this.deadZone ? 0 : (normalized - this.deadZone) / (1 - this.deadZone);
    const angleX = distance > 0 ? dx / distance : 0;
    const angleY = distance > 0 ? dy / distance : 0;
    this.input.virtualJoystick.x = angleX * strength;
    this.input.virtualJoystick.y = angleY * strength;
    const knobX = angleX * Math.min(distance, maxTravel);
    const knobY = angleY * Math.min(distance, maxTravel);
    this.knob.style.transform = `translate(calc(-50% + ${knobX}px), calc(-50% + ${knobY}px))`;
  }

  onPointerUp(event) {
    if (event.pointerId !== this.pointerId) return;
    event.preventDefault();
    event.stopPropagation();
    this.reset();
  }

  reset() {
    if (this.pointerId !== null && this.element.hasPointerCapture(this.pointerId)) {
      this.element.releasePointerCapture(this.pointerId);
    }
    this.pointerId = null;
    this.input.virtualJoystick.x = 0;
    this.input.virtualJoystick.y = 0;
    this.input.virtualJoystick.active = false;
    this.knob.style.transform = "translate(-50%, -50%)";
  }

  destroy() {
    this.reset();
    this.element.removeEventListener("pointerdown", this.bound.down);
    this.element.removeEventListener("pointermove", this.bound.move);
    this.element.removeEventListener("pointerup", this.bound.up);
    this.element.removeEventListener("pointercancel", this.bound.cancel);
    window.removeEventListener("blur", this.bound.blur);
  }
}

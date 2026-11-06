import { Collider } from "../engine/physics/Collider.js";
import { RigidBody } from "../engine/physics/RigidBody.js";
import { PlayerController } from "../game/components/PlayerController.js";

const ACCESS_PASSWORD = "0911";

export class DebugPanel {
  constructor(engine) {
    this.engine = engine;
    this.root = document.querySelector("#app");
    this.accessButton = document.querySelector("#debug-access");
    this.gate = document.querySelector("#debug-gate");
    this.login = document.querySelector("#debug-login");
    this.password = document.querySelector("#debug-password");
    this.loginError = document.querySelector("#debug-login-error");
    this.panel = document.querySelector("#debug-panel");
    this.logElement = document.querySelector("#debug-log");
    this.logs = [];
    this.interval = null;
    this.frameTimes = [];
    this.lastFrame = performance.now();
    this.wasRunningBeforePause = true;
    this.boundKeydown = event => {
      if (event.code === "F2") {
        event.preventDefault();
        if (!this.panel.hidden) this.closePanel();
        else if (!this.gate.hidden) this.closeGate();
        else this.openGate();
      }
      if (event.code === "Escape") {
        if (!this.panel.hidden) this.closePanel();
        if (!this.gate.hidden) this.closeGate();
      }
    };
    this.boundError = event => this.addLog("Error", event.message || "Error desconocido");
    this.boundRejection = event => this.addLog("Promesa", event.reason?.message || String(event.reason));
  }

  mount() {
    this.accessButton.addEventListener("click", () => this.openGate());
    this.login.addEventListener("submit", event => this.handleLogin(event));
    this.gate.querySelector("[data-close-gate]").addEventListener("click", () => this.closeGate());
    this.panel.querySelector("[data-close-panel]").addEventListener("click", () => this.closePanel());
    this.panel.querySelector("#debug-hitboxes").addEventListener("change", event => {
      this.engine.debugDrawColliders = event.target.checked;
    });
    this.panel.querySelector("#debug-speed").addEventListener("input", event => {
      const controller = this.getPlayer()?.getComponent(PlayerController);
      if (controller) controller.speed = Number(event.target.value);
      this.panel.querySelector("#debug-speed-value").textContent = event.target.value;
    });
    this.panel.querySelector("#debug-teleport").addEventListener("click", () => {
      const player = this.getPlayer();
      if (!player) return;
      player.transform.position.set(0, 0);
      player.getComponent(RigidBody)?.stop();
      this.engine.camera.position.set(0, 0);
    });
    this.panel.querySelector("#debug-stop").addEventListener("click", () => {
      this.getPlayer()?.getComponent(RigidBody)?.stop();
    });
    this.panel.querySelector("#debug-pause").addEventListener("click", () => this.togglePause());
    this.panel.querySelector("#debug-clear-log").addEventListener("click", () => {
      this.logs.length = 0;
      this.renderLogs();
    });
    window.addEventListener("keydown", this.boundKeydown);
    window.addEventListener("error", this.boundError);
    window.addEventListener("unhandledrejection", this.boundRejection);
    this.interval = window.setInterval(() => this.refresh(), 200);
  }

  handleLogin(event) {
    event.preventDefault();
    if (this.password.value !== ACCESS_PASSWORD) {
      this.loginError.textContent = "Contraseña incorrecta.";
      this.password.select();
      return;
    }
    this.password.value = "";
    this.loginError.textContent = "";
    this.gate.hidden = true;
    this.panel.hidden = false;
    this.refresh();
  }

  openGate() {
    this.gate.hidden = false;
    this.password.focus();
  }

  closeGate() {
    this.gate.hidden = true;
    this.password.value = "";
    this.loginError.textContent = "";
  }

  closePanel() {
    this.panel.hidden = true;
    this.engine.debugDrawColliders = false;
    this.panel.querySelector("#debug-hitboxes").checked = false;
  }

  getPlayer() {
    return this.engine.entities.findByName("Player");
  }

  refresh() {
    if (this.panel.hidden) return;
    const now = performance.now();
    const elapsed = now - this.lastFrame;
    this.lastFrame = now;
    if (elapsed > 0) this.frameTimes.push(elapsed);
    if (this.frameTimes.length > 30) this.frameTimes.shift();
    const average = this.frameTimes.reduce((sum, value) => sum + value, 0) / Math.max(1, this.frameTimes.length);
    const player = this.getPlayer();
    const body = player?.getComponent(RigidBody);
    const colliders = this.engine.entities.getAll().flatMap(entity =>
      [...entity.components.values()].filter(component => component instanceof Collider && component.enabled)
    );
    const fmt = value => Number.isFinite(value) ? value.toFixed(1) : "—";
    this.panel.querySelector("#debug-fps").textContent = `${Math.round(1000 / Math.max(1, average))} FPS`;
    this.panel.querySelector("#debug-engine-state").textContent = this.engine.running ? "Motor activo" : "Motor pausado";
    this.panel.querySelector("#debug-position").textContent = player ? `${fmt(player.transform.position.x)} / ${fmt(player.transform.position.y)}` : "No encontrado";
    this.panel.querySelector("#debug-velocity").textContent = body ? `${fmt(body.velocity.x)} / ${fmt(body.velocity.y)}` : "—";
    this.panel.querySelector("#debug-entities").textContent = String(this.engine.entities.getAll().length);
    this.panel.querySelector("#debug-colliders").textContent = String(colliders.length);
    this.panel.querySelector("#debug-camera").textContent = `${fmt(this.engine.camera.position.x)} / ${fmt(this.engine.camera.position.y)} · ${fmt(this.engine.camera.zoom)}x`;
    this.panel.querySelector("#debug-time").textContent = `${this.engine.time.elapsed.toFixed(1)} s · frame ${this.engine.time.frame}`;
    this.panel.querySelector("#debug-pause").textContent = this.engine.running ? "Pausar motor" : "Reanudar motor";
  }

  togglePause() {
    if (this.engine.running) {
      this.engine.stop();
    } else {
      this.engine.start();
    }
    this.refresh();
  }

  addLog(type, message) {
    this.logs.push({ type, message: String(message).slice(0, 500), time: new Date().toLocaleTimeString() });
    if (this.logs.length > 40) this.logs.shift();
    this.renderLogs();
  }

  renderLogs() {
    this.logElement.textContent = this.logs.length
      ? this.logs.map(log => `[${log.time}] ${log.type}: ${log.message}`).join("\n")
      : "Sin errores registrados.";
    this.logElement.scrollTop = this.logElement.scrollHeight;
  }

  destroy() {
    if (this.interval !== null) window.clearInterval(this.interval);
    window.removeEventListener("keydown", this.boundKeydown);
    window.removeEventListener("error", this.boundError);
    window.removeEventListener("unhandledrejection", this.boundRejection);
  }
}
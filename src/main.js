import { createGame } from "./game/createGame.js";
import { DebugPanel } from "./debug/DebugPanel.js";
import { VirtualJoystick } from "./game/input/VirtualJoystick.js";

const message = document.querySelector("#boot-message");
const version = document.querySelector("#engine-version");

async function start() {
  try {
    const game = createGame({ canvas: document.querySelector("#game-canvas") });
    await game.start();
    version.textContent = "ENGINE " + game.version;
    message.textContent = "WASD / flechas para moverte · ratón o joystick derecho para mirar.";
    window.biofall = Object.freeze({ version: game.version, engine: game.engine });
    const input = game.engine.input;
    const moveJoystick = new VirtualJoystick({
      element: document.querySelector("#virtual-joystick"),
      input
    });
    const aimJoystick = new VirtualJoystick({
      element: document.querySelector("#aim-joystick"),
      input,
      stateKey: "aimJoystick",
      knobSelector: "#aim-joystick-knob"
    });
    const debugPanel = new DebugPanel(game.engine);
    debugPanel.mount();
    window.addEventListener("beforeunload", () => {
      debugPanel.destroy();
      moveJoystick.destroy();
      aimJoystick.destroy();
    }, { once: true });
  } catch (error) {
    console.error("[BioFall] No se pudo iniciar el motor:", error);
    message.textContent = "No se pudo iniciar el juego. Revisa la consola del navegador.";
    message.dataset.state = "error";
  }
}

start();
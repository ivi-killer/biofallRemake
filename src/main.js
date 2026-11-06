import { createGame } from "./game/createGame.js";

const message = document.querySelector("#boot-message");
const version = document.querySelector("#engine-version");

async function start() {
  try {
    const game = createGame({ canvas: document.querySelector("#game-canvas") });
    await game.start();
    version.textContent = `ENGINE ${game.version}`;
    message.textContent = "Usa WASD o las flechas para moverte.";
    window.biofall = Object.freeze({ version: game.version, engine: game });
  } catch (error) {
    console.error("[BioFall] No se pudo iniciar el motor:", error);
    message.textContent = "No se pudo iniciar el juego. Revisa la consola del navegador.";
    message.dataset.state = "error";
  }
}

start();

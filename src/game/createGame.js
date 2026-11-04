import { GameEngine } from "../engine/core/GameEngine.js";

export function createGame({ canvas }) {
  if (!canvas) throw new Error("No se encontró el canvas principal.");
  const engine = new GameEngine({ canvas });
  return {
    version: GameEngine.VERSION,
    engine,
    start: () => engine.start(),
    stop: () => engine.stop(),
    destroy: () => engine.destroy()
  };
}

import { GameEngine } from "../engine/core/GameEngine.js";
import { WorldScene } from "./scenes/WorldScene.js";

export function createGame({ canvas }) {
  if (!canvas) throw new Error("No se encontró el canvas principal.");
  const engine = new GameEngine({ canvas });
  engine.scenes.add(new WorldScene());
  engine.scenes.change("world");
  return {
    version: GameEngine.VERSION,
    engine,
    start: () => engine.start(),
    stop: () => engine.stop(),
    destroy: () => engine.destroy()
  };
}

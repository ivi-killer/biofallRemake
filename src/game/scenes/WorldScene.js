import { Scene } from "../../engine/scenes/Scene.js";
import { Entity } from "../../engine/entities/Entity.js";
import { CircleCollider, BoxCollider } from "../../engine/physics/Collider.js";
import { RigidBody } from "../../engine/physics/RigidBody.js";
import { PlayerController } from "../components/PlayerController.js";
import { PlayerVisual } from "../components/PlayerVisual.js";
import { ShapeRenderer } from "../components/ShapeRenderer.js";

export class WorldScene extends Scene {
  constructor() {
    super("world");
    this.player = null;
    this.obstacles = [];
  }

  onEnter() {
    const entities = this.context.services.get("entities");
    const player = new Entity("Player");
    player.transform.position.set(0, 0);
    player.addComponent(new CircleCollider({ radius: 11 }));
    player.addComponent(new PlayerController({ speed: 190 }));
    player.addComponent(new RigidBody({ mass: 1 }));
    player.addComponent(new PlayerVisual());
    entities.add(player);
    this.player = player;
    this.context.services.get("camera").follow(player.transform);

    const walls = [
      { x: -180, y: -95, width: 120, height: 28 },
      { x: 150, y: -135, width: 32, height: 150 },
      { x: 80, y: 115, width: 170, height: 30 },
      { x: -175, y: 145, width: 34, height: 120 },
      { x: -360, y: 0, width: 28, height: 700 },
      { x: 360, y: 0, width: 28, height: 700 },
      { x: 0, y: -350, width: 740, height: 28 },
      { x: 0, y: 350, width: 740, height: 28 }
    ];

    for (const wall of walls) {
      const entity = new Entity("Obstacle");
      entity.transform.position.set(wall.x, wall.y);
      entity.addComponent(new BoxCollider({ width: wall.width, height: wall.height }));
      entity.addComponent(new ShapeRenderer({
        shape: "box",
        width: wall.width,
        height: wall.height,
        fill: "#53614d",
        stroke: "#26352a",
        lineWidth: 3
      }));
      entities.add(entity);
      this.obstacles.push(entity);
    }
  }

  render(context) {
    const camera = this.context.services.get("camera");
    const width = camera.viewport.width / camera.zoom;
    const height = camera.viewport.height / camera.zoom;
    const left = camera.position.x - width / 2;
    const right = camera.position.x + width / 2;
    const top = camera.position.y - height / 2;
    const bottom = camera.position.y + height / 2;
    const spacing = 48;
    context.strokeStyle = "rgba(172, 193, 158, 0.075)";
    context.lineWidth = 1 / camera.zoom;
    context.beginPath();
    for (let x = Math.floor(left / spacing) * spacing; x <= right; x += spacing) {
      context.moveTo(x, top);
      context.lineTo(x, bottom);
    }
    for (let y = Math.floor(top / spacing) * spacing; y <= bottom; y += spacing) {
      context.moveTo(left, y);
      context.lineTo(right, y);
    }
    context.stroke();
  }

  onExit() {
    const entities = this.context.services.get("entities");
    if (this.player) entities.remove(this.player);
    for (const obstacle of this.obstacles) entities.remove(obstacle);
    this.player = null;
    this.obstacles.length = 0;
    this.context.services.get("camera").follow(null);
  }
}

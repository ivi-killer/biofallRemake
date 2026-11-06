import { Scene } from "../../engine/scenes/Scene.js";
import { Entity } from "../../engine/entities/Entity.js";
import { CircleCollider, BoxCollider } from "../../engine/physics/Collider.js";
import { RigidBody } from "../../engine/physics/RigidBody.js";
import { PlayerController } from "../components/PlayerController.js";
import { PlayerVisual } from "../components/PlayerVisual.js";

const TREES = [
  [-245, -205], [-135, -245], [35, -250], [230, -215],
  [275, -65], [245, 185], [110, 260], [-80, 235],
  [-260, 170], [-285, 5], [-190, 65], [175, 65],
  [65, -105], [-105, -120]
];
const ROCKS = [
  [-205, -125], [-65, -205], [190, -155],
  [205, 125], [-205, 205], [35, 185]
];

function noise(x, y) {
  const value = Math.sin(x * 127.1 + y * 311.7) * 43758.5453;
  return value - Math.floor(value);
}

function drawTree(context, x, y, scale = 1) {
  context.save();
  context.translate(x, y);
  context.scale(scale, scale);
  context.fillStyle = "rgba(37, 57, 34, .22)";
  context.beginPath();
  context.ellipse(4, 10, 22, 13, 0, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = "#765438";
  context.beginPath();
  context.roundRect(-6, -3, 12, 23, 4);
  context.fill();
  context.fillStyle = "#315c36";
  context.strokeStyle = "#24482d";
  context.lineWidth = 2;
  context.beginPath();
  context.arc(0, -7, 20, 0, Math.PI * 2);
  context.fill();
  context.stroke();
  context.fillStyle = "#477d43";
  context.beginPath();
  context.arc(-7, -13, 10, 0, Math.PI * 2);
  context.arc(8, -10, 9, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = "rgba(157, 190, 91, .32)";
  context.beginPath();
  context.arc(-6, -16, 4, 0, Math.PI * 2);
  context.fill();
  context.restore();
}

function drawRock(context, x, y, scale = 1) {
  context.save();
  context.translate(x, y);
  context.scale(scale, scale);
  context.fillStyle = "rgba(38, 53, 34, .2)";
  context.beginPath();
  context.ellipse(3, 7, 18, 10, 0, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = "#858d79";
  context.strokeStyle = "#59634f";
  context.lineWidth = 2;
  context.beginPath();
  context.moveTo(-15, 5);
  context.lineTo(-12, -7);
  context.lineTo(-3, -14);
  context.lineTo(10, -11);
  context.lineTo(17, 0);
  context.lineTo(12, 9);
  context.lineTo(-8, 11);
  context.closePath();
  context.fill();
  context.stroke();
  context.fillStyle = "rgba(226, 229, 190, .4)";
  context.beginPath();
  context.moveTo(-9, -6);
  context.lineTo(-2, -11);
  context.lineTo(5, -9);
  context.lineTo(-2, -4);
  context.closePath();
  context.fill();
  context.restore();
}

function drawBush(context, x, y) {
  context.save();
  context.translate(x, y);
  context.fillStyle = "rgba(35, 55, 31, .18)";
  context.beginPath();
  context.ellipse(2, 5, 16, 8, 0, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = "#4d8744";
  context.strokeStyle = "#35643a";
  context.lineWidth = 1.5;
  context.beginPath();
  context.arc(-7, 0, 9, 0, Math.PI * 2);
  context.arc(3, -4, 10, 0, Math.PI * 2);
  context.arc(10, 2, 8, 0, Math.PI * 2);
  context.fill();
  context.stroke();
  context.restore();
}

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

    const addCollider = (name, x, y, collider) => {
      const entity = new Entity(name);
      entity.transform.position.set(x, y);
      entity.addComponent(collider);
      entities.add(entity);
      this.obstacles.push(entity);
    };

    for (const [x, y] of TREES) {
      addCollider("Tree trunk", x, y, new CircleCollider({ radius: 12 }));
    }
    for (const [x, y] of ROCKS) {
      addCollider("Rock", x, y, new BoxCollider({ width: 25, height: 19 }));
    }

    const bounds = [
      { x: -375, y: 0, width: 30, height: 780 },
      { x: 375, y: 0, width: 30, height: 780 },
      { x: 0, y: -375, width: 780, height: 30 },
      { x: 0, y: 375, width: 780, height: 30 }
    ];
    for (const wall of bounds) {
      addCollider("World boundary", wall.x, wall.y,
        new BoxCollider({ width: wall.width, height: wall.height }));
    }
  }

  render(context) {
    const camera = this.context.services.get("camera");
    const width = camera.viewport.width / camera.zoom;
    const height = camera.viewport.height / camera.zoom;
    const left = camera.position.x - width / 2 - 40;
    const right = camera.position.x + width / 2 + 40;
    const top = camera.position.y - height / 2 - 40;
    const bottom = camera.position.y + height / 2 + 40;

    context.fillStyle = "#83ad60";
    context.fillRect(-390, -390, 780, 780);

    // Irregular patches give the grass depth without a distracting grid.
    for (let x = Math.floor(left / 72) * 72; x < right; x += 72) {
      for (let y = Math.floor(top / 72) * 72; y < bottom; y += 72) {
        const value = noise(x, y);
        if (value > 0.38) {
          context.fillStyle = value > 0.72 ? "rgba(177, 194, 104, .13)" : "rgba(54, 105, 54, .09)";
          context.beginPath();
          context.ellipse(x + value * 24, y + noise(y, x) * 24, 25 + value * 13, 17 + value * 9, value * 2, 0, Math.PI * 2);
          context.fill();
        }
      }
    }

    // Small grass strokes are placed deterministically in world space.
    for (let x = Math.floor(left / 30) * 30; x < right; x += 30) {
      for (let y = Math.floor(top / 30) * 30; y < bottom; y += 30) {
        const value = noise(x + 19, y - 7);
        if (value > 0.56) {
          const gx = x + value * 22;
          const gy = y + noise(y, x + 31) * 22;
          context.strokeStyle = "rgba(43, 91, 46, .28)";
          context.lineWidth = 1.5;
          context.beginPath();
          context.moveTo(gx, gy + 3);
          context.lineTo(gx - 2, gy - 3);
          context.moveTo(gx + 3, gy + 3);
          context.lineTo(gx + 4, gy - 2);
          context.stroke();
        }
      }
    }

    // A subtle worn clearing around the spawn point.
    context.fillStyle = "rgba(191, 183, 119, .12)";
    context.beginPath();
    context.ellipse(0, 0, 105, 82, -0.18, 0, Math.PI * 2);
    context.fill();

    for (const [x, y] of ROCKS) drawRock(context, x, y, 0.9 + noise(x, y) * 0.25);
    for (const [x, y] of TREES) drawTree(context, x, y, 0.9 + noise(y, x) * 0.2);

    for (let i = 0; i < 12; i++) {
      const x = -300 + i * 53;
      const y = 285 + noise(i, 8) * 28;
      drawBush(context, x, y);
    }

    context.strokeStyle = "#496d3d";
    context.lineWidth = 8;
    context.strokeRect(-370, -370, 740, 740);
    context.strokeStyle = "rgba(205, 218, 142, .32)";
    context.lineWidth = 2;
    context.strokeRect(-366, -366, 732, 732);
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

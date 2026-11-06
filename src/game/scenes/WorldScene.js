import { Scene } from "../../engine/scenes/Scene.js";
import { Entity } from "../../engine/entities/Entity.js";
import { CircleCollider, BoxCollider } from "../../engine/physics/Collider.js";
import { RigidBody } from "../../engine/physics/RigidBody.js";
import { PlayerController } from "../components/PlayerController.js";
import { PlayerVisual } from "../components/PlayerVisual.js";
import {
  WORLD_CONFIG, getStage, getBiomeInfo, getStageKey, worldToStage
} from "../world/WorldGenerator.js";

function noise(x, y, seed = 0) {
  const value = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453;
  return value - Math.floor(value);
}

function drawTree(context, x, y, scale = 1, dead = false) {
  context.save();
  context.translate(x, y);
  context.scale(scale, scale);

  // True top-down silhouette: round shadow, circular canopy and visible trunk.
  context.fillStyle = "rgba(27, 43, 25, .25)";
  context.beginPath();
  context.ellipse(3, 5, 24, 21, 0, 0, Math.PI * 2);
  context.fill();

  context.fillStyle = dead ? "#8a7457" : "#315c36";
  context.strokeStyle = dead ? "#5f4b37" : "#24482d";
  context.lineWidth = 2;
  context.beginPath();
  context.arc(0, 0, dead ? 17 : 21, 0, Math.PI * 2);
  context.fill();
  context.stroke();

  if (!dead) {
    context.fillStyle = "#477d43";
    context.beginPath();
    context.arc(-7, -7, 11, 0, Math.PI * 2);
    context.arc(8, -5, 10, 0, Math.PI * 2);
    context.arc(3, 9, 9, 0, Math.PI * 2);
    context.fill();

    context.fillStyle = "rgba(177, 210, 119, .28)";
    context.beginPath();
    context.arc(-7, -8, 5, 0, Math.PI * 2);
    context.arc(7, -5, 4, 0, Math.PI * 2);
    context.fill();
  } else {
    context.strokeStyle = "#b09a76";
    context.lineWidth = 2;
    context.beginPath();
    context.moveTo(-8, -5); context.lineTo(8, 6);
    context.moveTo(7, -8); context.lineTo(-6, 8);
    context.stroke();
  }

  // Small circular trunk remains visible above the canopy.
  context.fillStyle = dead ? "#70563d" : "#765238";
  context.strokeStyle = dead ? "#493d30" : "#503b2c";
  context.lineWidth = 2;
  context.beginPath();
  context.arc(0, 0, dead ? 10 : 9, 0, Math.PI * 2);
  context.fill();
  context.stroke();

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
  context.moveTo(-15, 5); context.lineTo(-12, -7); context.lineTo(-3, -14);
  context.lineTo(10, -11); context.lineTo(17, 0); context.lineTo(12, 9);
  context.lineTo(-8, 11); context.closePath();
  context.fill(); context.stroke();
  context.restore();
}

function drawBush(context, x, y, scale = 1) {
  context.save();
  context.translate(x, y);
  context.scale(scale, scale);
  context.fillStyle = "rgba(35, 55, 31, .18)";
  context.beginPath(); context.ellipse(2, 5, 16, 8, 0, 0, Math.PI * 2); context.fill();
  context.fillStyle = "#4d8744";
  context.strokeStyle = "#35643a";
  context.lineWidth = 1.5;
  context.beginPath();
  context.arc(-7, 0, 9, 0, Math.PI * 2);
  context.arc(3, -4, 10, 0, Math.PI * 2);
  context.arc(10, 2, 8, 0, Math.PI * 2);
  context.fill(); context.stroke();
  context.restore();
}

function drawCactus(context, x, y, scale = 1) {
  context.save();
  context.translate(x, y);
  context.scale(scale, scale);
  context.fillStyle = "rgba(45, 53, 34, .18)";
  context.beginPath(); context.ellipse(2, 7, 13, 7, 0, 0, Math.PI * 2); context.fill();
  context.strokeStyle = "#47734a";
  context.lineWidth = 9;
  context.lineCap = "round";
  context.beginPath();
  context.moveTo(0, 9); context.lineTo(0, -15);
  context.moveTo(0, -3); context.lineTo(-9, -3); context.lineTo(-9, -11);
  context.moveTo(0, 2); context.lineTo(9, 2); context.lineTo(9, -7);
  context.stroke();
  context.restore();
}

function drawRuin(context, x, y, scale = 1) {
  context.save();
  context.translate(x, y);
  context.scale(scale, scale);
  context.fillStyle = "rgba(40, 46, 39, .2)";
  context.fillRect(-15, -8, 34, 24);
  context.fillStyle = "#777b70";
  context.strokeStyle = "#555e54";
  context.lineWidth = 2;
  context.fillRect(-17, -13, 34, 24);
  context.strokeRect(-17, -13, 34, 24);
  context.fillStyle = "#555e54";
  context.fillRect(-5, -5, 9, 16);
  context.restore();
}

function drawObject(context, object) {
  if (object.kind === "tree") drawTree(context, object.x, object.y, object.scale);
  else if (object.kind === "pine") drawTree(context, object.x, object.y, object.scale, true);
  else if (object.kind === "deadTree") drawTree(context, object.x, object.y, object.scale, true);
  else if (object.kind === "rock") drawRock(context, object.x, object.y, object.scale);
  else if (object.kind === "bush") drawBush(context, object.x, object.y, object.scale);
  else if (object.kind === "cactus") drawCactus(context, object.x, object.y, object.scale);
  else if (object.kind === "ruin") drawRuin(context, object.x, object.y, object.scale);
}

export class WorldScene extends Scene {
  constructor() {
    super("world");
    this.player = null;
    this.activeStages = new Map();
    this.loadedStageCenter = null;
  }

  onEnter() {
    const entities = this.context.services.get("entities");
    const player = new Entity("Player");
    player.transform.position.set(0, 0);
    player.addComponent(new CircleCollider({ radius: 11 }));
    player.addComponent(new PlayerController({
      speed: 220,
      acceleration: 1250,
      deceleration: 1750
    }));
    player.addComponent(new RigidBody({ mass: 1 }));
    player.addComponent(new PlayerVisual());
    entities.add(player);

    this.player = player;
    this.context.services.get("camera").follow(player);
    this.#refreshActiveStages(true);

    const half = WORLD_CONFIG.halfSize;
    const bounds = [
      { x: -half - 15, y: 0, width: 30, height: WORLD_CONFIG.size },
      { x: half + 15, y: 0, width: 30, height: WORLD_CONFIG.size },
      { x: 0, y: -half - 15, width: WORLD_CONFIG.size, height: 30 },
      { x: 0, y: half + 15, width: WORLD_CONFIG.size, height: 30 }
    ];

    for (const wall of bounds) {
      this.#addCollider("World boundary", wall.x, wall.y,
        new BoxCollider({ width: wall.width, height: wall.height }));
    }
  }

  update() {
    this.#refreshActiveStages();
  }

  #addCollider(name, x, y, collider) {
    const entity = new Entity(name);
    entity.transform.position.set(x, y);
    entity.addComponent(collider);
    this.context.services.get("entities").add(entity);
    return entity;
  }

  #refreshActiveStages(force = false) {
    if (!this.player) return;

    const stageX = worldToStage(this.player.transform.position.x);
    const stageY = worldToStage(this.player.transform.position.y);
    if (!force && this.loadedStageCenter?.x === stageX &&
        this.loadedStageCenter?.y === stageY) return;

    const wanted = new Set();
    const radius = WORLD_CONFIG.activeStageRadius;

    for (let x = stageX - radius; x <= stageX + radius; x += 1) {
      for (let y = stageY - radius; y <= stageY + radius; y += 1) {
        wanted.add(getStageKey(x, y));
      }
    }

    const entities = this.context.services.get("entities");
    for (const [key, list] of this.activeStages) {
      if (wanted.has(key)) continue;
      for (const entity of list) entities.remove(entity);
      this.activeStages.delete(key);
    }

    for (let x = stageX - radius; x <= stageX + radius; x += 1) {
      for (let y = stageY - radius; y <= stageY + radius; y += 1) {
        const key = getStageKey(x, y);
        if (this.activeStages.has(key)) continue;

        const stage = getStage(x, y);
        const list = [];

        for (const object of stage.objects) {
          let collider = null;
          if (["tree", "pine", "deadTree"].includes(object.kind)) {
            collider = new CircleCollider({ radius: 9 * object.scale });
          } else if (object.kind === "rock") {
            collider = new BoxCollider({ width: 25 * object.scale, height: 19 * object.scale });
          } else if (object.kind === "ruin") {
            collider = new BoxCollider({ width: 34 * object.scale, height: 24 * object.scale });
          }

          if (collider) {
            list.push(this.#addCollider(object.kind, object.x, object.y, collider));
          }
        }

        this.activeStages.set(key, list);
      }
    }

    this.loadedStageCenter = { x: stageX, y: stageY };
  }

  render(context) {
    const camera = this.context.services.get("camera");
    const halfWidth = camera.viewport.width / camera.zoom / 2 + 40;
    const halfHeight = camera.viewport.height / camera.zoom / 2 + 40;
    const left = camera.position.x - halfWidth;
    const right = camera.position.x + halfWidth;
    const top = camera.position.y - halfHeight;
    const bottom = camera.position.y + halfHeight;
    const size = WORLD_CONFIG.stageSize;
    const minX = Math.max(-WORLD_CONFIG.halfSize, Math.floor(left / size) * size);
    const maxX = Math.min(WORLD_CONFIG.halfSize, right);
    const minY = Math.max(-WORLD_CONFIG.halfSize, Math.floor(top / size) * size);
    const maxY = Math.min(WORLD_CONFIG.halfSize, bottom);

    context.fillStyle = "#83ad60";
    context.fillRect(-WORLD_CONFIG.halfSize, -WORLD_CONFIG.halfSize,
      WORLD_CONFIG.size, WORLD_CONFIG.size);

    for (let x = minX; x < maxX; x += size) {
      for (let y = minY; y < maxY; y += size) {
        const stage = getStage(Math.floor(x / size), Math.floor(y / size));
        const palette = getBiomeInfo(stage.biome);
        context.fillStyle = palette.ground;
        context.fillRect(stage.x, stage.y, size, size);

        for (let i = 0; i < 9; i += 1) {
          const value = noise(stage.cx * 9 + i, stage.cy * 7 - i, 5);
          context.fillStyle = value > 0.5 ? palette.patch : palette.accent;
          context.globalAlpha = 0.1;
          context.beginPath();
          context.ellipse(stage.x + noise(i, stage.cy, 8) * size,
            stage.y + noise(stage.cx, i, 9) * size,
            18 + value * 28, 13 + value * 18, value * 2, 0, Math.PI * 2);
          context.fill();
        }
        context.globalAlpha = 1;

        for (let i = 0; i < 30; i += 1) {
          const gx = stage.x + noise(i, stage.cx, 12) * size;
          const gy = stage.y + noise(stage.cy, i, 13) * size;
          context.fillStyle = palette.patch;
          context.globalAlpha = 0.24;
          context.fillRect(gx, gy, 2, 2);
        }
        context.globalAlpha = 1;

        for (const object of stage.objects) drawObject(context, object);
      }
    }

    context.strokeStyle = "#526b49";
    context.lineWidth = 12;
    context.strokeRect(-WORLD_CONFIG.halfSize, -WORLD_CONFIG.halfSize,
      WORLD_CONFIG.size, WORLD_CONFIG.size);
  }

  onExit() {
    const entities = this.context.services.get("entities");
    if (this.player) entities.remove(this.player);

    for (const list of this.activeStages.values()) {
      for (const entity of list) entities.remove(entity);
    }

    this.activeStages.clear();
    this.player = null;
    this.loadedStageCenter = null;
    this.context.services.get("camera").follow(null);
  }
}

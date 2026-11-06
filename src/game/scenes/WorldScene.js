import { Scene } from "../../engine/scenes/Scene.js";
import { Entity } from "../../engine/entities/Entity.js";
import { CircleCollider, BoxCollider } from "../../engine/physics/Collider.js";
import { RigidBody } from "../../engine/physics/RigidBody.js";
import { PlayerController } from "../components/PlayerController.js";
import { PlayerVisual } from "../components/PlayerVisual.js";
import {
  WORLD_CONFIG, getChunk, getBiomeInfo, getChunkKey, worldToChunk
} from "../world/WorldGenerator.js";

function noise(x, y, seed = 0) {
  const value = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453;
  return value - Math.floor(value);
}

function drawTree(context, x, y, scale = 1, dead = false) {
  context.save();
  context.translate(x, y);
  context.scale(scale, scale);
  context.fillStyle = "rgba(37, 57, 34, .2)";
  context.beginPath();
  context.ellipse(4, 10, 22, 13, 0, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = dead ? "#66513d" : "#765438";
  context.fillRect(-5, -3, 10, 24);
  context.strokeStyle = dead ? "#514638" : "#24482d";
  context.lineWidth = 2;
  context.fillStyle = dead ? "#74604a" : "#315c36";
  context.beginPath();
  if (dead) {
    context.moveTo(0, -30); context.lineTo(-13, -10); context.lineTo(-8, 1);
    context.lineTo(0, -12); context.lineTo(12, 1); context.lineTo(8, -13);
    context.closePath();
  } else {
    context.arc(0, -7, 20, 0, Math.PI * 2);
  }
  context.fill();
  context.stroke();
  if (!dead) {
    context.fillStyle = "#477d43";
    context.beginPath();
    context.arc(-7, -13, 10, 0, Math.PI * 2);
    context.arc(8, -10, 9, 0, Math.PI * 2);
    context.fill();
  }
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
    this.obstacles = new Map();
    this.loadedCenter = null;
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
    this.#refreshActiveChunks(true);

    const half = WORLD_CONFIG.halfSize;
    const bounds = [
      { x: -half - 15, y: 0, width: 30, height: WORLD_CONFIG.size },
      { x: half + 15, y: 0, width: 30, height: WORLD_CONFIG.size },
      { x: 0, y: -half - 15, width: WORLD_CONFIG.size, height: 30 },
      { x: 0, y: half + 15, width: WORLD_CONFIG.size, height: 30 }
    ];
    for (const wall of bounds) this.#addCollider("World boundary", wall.x, wall.y,
      new BoxCollider({ width: wall.width, height: wall.height }));
  }

  update() {
    this.#refreshActiveChunks();
  }

  #addCollider(name, x, y, collider) {
    const entity = new Entity(name);
    entity.transform.position.set(x, y);
    entity.addComponent(collider);
    this.context.services.get("entities").add(entity);
    return entity;
  }

  #refreshActiveChunks(force = false) {
    if (!this.player) return;
    const cx = worldToChunk(this.player.transform.position.x);
    const cy = worldToChunk(this.player.transform.position.y);
    if (!force && this.loadedCenter?.cx === cx && this.loadedCenter?.cy === cy) return;

    const wanted = new Set();
    const radius = WORLD_CONFIG.activeChunkRadius;
    for (let x = cx - radius; x <= cx + radius; x += 1) {
      for (let y = cy - radius; y <= cy + radius; y += 1) {
        wanted.add(getChunkKey(x, y));
      }
    }

    const entities = this.context.services.get("entities");
    for (const [key, list] of this.obstacles) {
      if (wanted.has(key)) continue;
      for (const entity of list) entities.remove(entity);
      this.obstacles.delete(key);
    }

    for (let x = cx - radius; x <= cx + radius; x += 1) {
      for (let y = cy - radius; y <= cy + radius; y += 1) {
        const key = getChunkKey(x, y);
        if (this.obstacles.has(key)) continue;
        const chunk = getChunk(x, y);
        const list = [];
        for (const object of chunk.objects) {
          let collider = null;
          if (["tree", "pine", "deadTree"].includes(object.kind)) {
            collider = new CircleCollider({ radius: 12 * object.scale });
          } else if (object.kind === "rock") {
            collider = new BoxCollider({ width: 25 * object.scale, height: 19 * object.scale });
          } else if (object.kind === "ruin") {
            collider = new BoxCollider({ width: 34 * object.scale, height: 24 * object.scale });
          }
          if (collider) list.push(this.#addCollider(object.kind, object.x, object.y, collider));
        }
        this.obstacles.set(key, list);
      }
    }
    this.loadedCenter = { cx, cy };
  }

  render(context) {
    const camera = this.context.services.get("camera");
    const halfWidth = camera.viewport.width / camera.zoom / 2 + 40;
    const halfHeight = camera.viewport.height / camera.zoom / 2 + 40;
    const left = camera.position.x - halfWidth;
    const right = camera.position.x + halfWidth;
    const top = camera.position.y - halfHeight;
    const bottom = camera.position.y + halfHeight;
    const size = WORLD_CONFIG.chunkSize;
    const minX = Math.max(-WORLD_CONFIG.halfSize, Math.floor(left / size) * size);
    const maxX = Math.min(WORLD_CONFIG.halfSize, right);
    const minY = Math.max(-WORLD_CONFIG.halfSize, Math.floor(top / size) * size);
    const maxY = Math.min(WORLD_CONFIG.halfSize, bottom);

    context.fillStyle = "#83ad60";
    context.fillRect(-WORLD_CONFIG.halfSize, -WORLD_CONFIG.halfSize,
      WORLD_CONFIG.size, WORLD_CONFIG.size);

    for (let x = minX; x < maxX; x += size) {
      for (let y = minY; y < maxY; y += size) {
        const chunk = getChunk(Math.floor(x / size), Math.floor(y / size));
        const palette = getBiomeInfo(chunk.biome);
        context.fillStyle = palette.ground;
        context.fillRect(chunk.x, chunk.y, size, size);

        for (let i = 0; i < 9; i += 1) {
          const value = noise(chunk.cx * 9 + i, chunk.cy * 7 - i, 5);
          context.fillStyle = value > 0.5 ? palette.patch : palette.accent;
          context.globalAlpha = 0.1;
          context.beginPath();
          context.ellipse(chunk.x + noise(i, chunk.cy, 8) * size,
            chunk.y + noise(chunk.cx, i, 9) * size,
            18 + value * 28, 13 + value * 18, value * 2, 0, Math.PI * 2);
          context.fill();
        }
        context.globalAlpha = 1;

        for (let i = 0; i < 30; i += 1) {
          const gx = chunk.x + noise(i, chunk.cx, 12) * size;
          const gy = chunk.y + noise(chunk.cy, i, 13) * size;
          context.fillStyle = palette.patch;
          context.globalAlpha = 0.24;
          context.fillRect(gx, gy, 2, 2);
        }
        context.globalAlpha = 1;
        for (const object of chunk.objects) drawObject(context, object);
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
    for (const list of this.obstacles.values()) {
      for (const entity of list) entities.remove(entity);
    }
    this.obstacles.clear();
    this.player = null;
    this.loadedCenter = null;
    this.context.services.get("camera").follow(null);
  }
}

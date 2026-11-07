import { Scene } from "../../engine/scenes/Scene.js";
import { Entity } from "../../engine/entities/Entity.js";
import { CircleCollider, BoxCollider } from "../../engine/physics/Collider.js";
import { RigidBody } from "../../engine/physics/RigidBody.js";
import { PlayerController } from "../components/PlayerController.js";
import { PlayerVisual } from "../components/PlayerVisual.js";
import { WORLD_CONFIG, getStage, getStageKey, worldToStage } from "../world/WorldGenerator.js";
import { ART_STYLE, drawGroundDetails, drawWorldObject } from "../rendering/WorldAssets.js";
import { preloadCreatorKitAssets } from "../rendering/CreatorKitAssets.js";

export class WorldScene extends Scene {
  constructor() {
    super("world");
    this.player = null;
    this.activeStages = new Map();
    this.loadedStageCenter = null;
  }

  onEnter() {
    preloadCreatorKitAssets();
    const entities = this.context.services.get("entities");
    const player = new Entity("Player");
    player.transform.position.set(0, 0);
    player.addComponent(new CircleCollider({ radius: 12.4 }));
    player.addComponent(new PlayerController({ speed: 220 }));
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
            // The canopy is decorative; collision follows the outlined trunk.
            collider = new CircleCollider({ radius: 8.9 * object.scale });
          } else if (object.kind === "rock") {
            // Matches the rock's outer silhouette including its outline.
            collider = new BoxCollider({ width: 37 * object.scale, height: 31 * object.scale });
          } else if (object.kind === "ruin") {
            // Matches the ruin's outer footprint.
            collider = new BoxCollider({ width: 39 * object.scale, height: 29 * object.scale });
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

    context.fillStyle = ART_STYLE.palette.forest.ground;
    context.fillRect(-WORLD_CONFIG.halfSize, -WORLD_CONFIG.halfSize,
      WORLD_CONFIG.size, WORLD_CONFIG.size);

    for (let x = minX; x < maxX; x += size) {
      for (let y = minY; y < maxY; y += size) {
        const stage = getStage(Math.floor(x / size), Math.floor(y / size));
        const palette = ART_STYLE.palette[stage.biome] ?? ART_STYLE.palette.forest;
        context.fillStyle = palette.ground;
        context.fillRect(stage.x, stage.y, size, size);
        drawGroundDetails(context, stage, palette);
        for (const object of stage.objects) drawWorldObject(context, object);
      }
    }

    context.strokeStyle = ART_STYLE.groundOutline;
    context.lineWidth = 4;
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

import test from "node:test";
import assert from "node:assert/strict";
import {
  ART_STYLE, drawTree, drawRock, drawBush, drawCactus, drawRuin,
  drawWorldObject, drawGroundDetails
} from "../src/game/rendering/WorldAssets.js";

function createContext() {
  return new Proxy({}, {
    get(target, key) {
      if (!(key in target)) target[key] = () => {};
      return target[key];
    },
    set(target, key, value) {
      target[key] = value;
      return true;
    }
  });
}

test("visual palette uses one dark outline and flat biome colors", () => {
  assert.equal(ART_STYLE.outline, "#171914");
  assert.equal(ART_STYLE.outlineWidth, 3);
  for (const biome of Object.values(ART_STYLE.palette)) {
    assert.match(biome.ground, /^#[0-9a-f]{6}$/i);
    assert.match(biome.dark, /^#[0-9a-f]{6}$/i);
  }
});

test("all world assets render through the shared Canvas 2D context", () => {
  const ctx = createContext();
  const objects = [
    { kind: "tree", x: 0, y: 0, scale: 1 },
    { kind: "pine", x: 20, y: 0, scale: 1 },
    { kind: "deadTree", x: 40, y: 0, scale: 1 },
    { kind: "rock", x: 60, y: 0, scale: 1 },
    { kind: "bush", x: 80, y: 0, scale: 1 },
    { kind: "cactus", x: 100, y: 0, scale: 1 },
    { kind: "ruin", x: 120, y: 0, scale: 1 }
  ];
  assert.doesNotThrow(() => {
    drawTree(ctx, 0, 0);
    drawRock(ctx, 0, 0);
    drawBush(ctx, 0, 0);
    drawCactus(ctx, 0, 0);
    drawRuin(ctx, 0, 0);
    for (const object of objects) drawWorldObject(ctx, object);
    drawGroundDetails(ctx, { x: 0, y: 0, size: 320, cx: 0, cy: 0 }, ART_STYLE.palette.forest);
  });
});

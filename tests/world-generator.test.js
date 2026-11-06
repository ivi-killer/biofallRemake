import test from "node:test";
import assert from "node:assert/strict";
import {
  getBiomeAt, getChunk, getChunkKey, worldToChunk, WORLD_CONFIG,
  getStage, getStageKey, worldToStage
} from "../src/game/world/WorldGenerator.js";

test("world is divided into distinct biome regions", () => {
  assert.equal(getBiomeAt(0, 0), "forest");
  assert.equal(getBiomeAt(900, 0), "drylands");
  assert.equal(getBiomeAt(0, 900), "swamp");
  assert.equal(getBiomeAt(-900, 0), "ruins");
  assert.equal(getBiomeAt(0, -900), "highlands");
});

test("stage generation is deterministic and cached", () => {
  assert.deepEqual(getChunk(2, -3), getChunk(2, -3));
  assert.notDeepEqual(getChunk(2, -3).objects, getChunk(3, -3).objects);
  assert.equal(getStage(2, -3), getStage(2, -3));
});

test("world stage coordinates and bounds are consistent", () => {
  assert.equal(worldToChunk(0), 0);
  assert.equal(worldToChunk(WORLD_CONFIG.chunkSize), 1);
  assert.equal(worldToChunk(-1), -1);
  assert.equal(getChunkKey(2, -4), "2,-4");
  assert.equal(WORLD_CONFIG.size, WORLD_CONFIG.halfSize * 2);
  assert.equal(WORLD_CONFIG.stageSize, WORLD_CONFIG.chunkSize);
  assert.equal(worldToStage(WORLD_CONFIG.stageSize), 1);
  assert.equal(getStageKey(2, -4), "2,-4");
});

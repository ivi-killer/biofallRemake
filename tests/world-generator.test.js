import test from "node:test";
import assert from "node:assert/strict";
import { getBiomeAt, getChunk, getChunkKey, worldToChunk, WORLD_CONFIG } from "../src/game/world/WorldGenerator.js";

test("world is divided into distinct biome regions", () => {
  assert.equal(getBiomeAt(0, 0), "forest");
  assert.equal(getBiomeAt(900, 0), "drylands");
  assert.equal(getBiomeAt(0, 900), "swamp");
  assert.equal(getBiomeAt(-900, 0), "ruins");
  assert.equal(getBiomeAt(0, -900), "highlands");
});

test("chunk generation is deterministic", () => {
  assert.deepEqual(getChunk(2, -3), getChunk(2, -3));
  assert.notDeepEqual(getChunk(2, -3).objects, getChunk(3, -3).objects);
});

test("chunk coordinates and world bounds are consistent", () => {
  assert.equal(worldToChunk(0), 0);
  assert.equal(worldToChunk(WORLD_CONFIG.chunkSize), 1);
  assert.equal(worldToChunk(-1), -1);
  assert.equal(getChunkKey(2, -4), "2,-4");
  assert.equal(WORLD_CONFIG.size, WORLD_CONFIG.halfSize * 2);
});

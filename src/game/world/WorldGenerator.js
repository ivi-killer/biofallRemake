const BIOMES = Object.freeze({
  forest: { name: "Bosque", ground: "#83ad60", patch: "#6f9954", accent: "#b7c875" },
  drylands: { name: "Tierras secas", ground: "#c5b477", patch: "#b49c62", accent: "#dfca8c" },
  swamp: { name: "Pantano", ground: "#718d68", patch: "#58765b", accent: "#9eaa72" },
  ruins: { name: "Zona abandonada", ground: "#92927b", patch: "#777d6d", accent: "#b7ad8b" },
  highlands: { name: "Tierras altas", ground: "#999d91", patch: "#818a83", accent: "#c4c4ae" }
});

const STAGE_SIZE = 320;
const stageCache = new Map();

export const WORLD_CONFIG = Object.freeze({
  size: 3600,
  halfSize: 1800,
  stageSize: STAGE_SIZE,
  activeStageRadius: 1,
  // Compatibility aliases: a stage is the same streamed unit as the former chunk.
  chunkSize: STAGE_SIZE,
  activeChunkRadius: 1
});

function hash(x, y, seed = 0) {
  const value = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453;
  return value - Math.floor(value);
}

export function getBiomeAt(x, y) {
  if (x > 600) return "drylands";
  if (y > 600) return "swamp";
  if (x < -600) return "ruins";
  if (y < -600) return "highlands";
  return "forest";
}

export function getChunk(cx, cy) {
  const key = getChunkKey(cx, cy);
  const cached = stageCache.get(key);
  if (cached) return cached;

  const size = WORLD_CONFIG.stageSize;
  const x = cx * size;
  const y = cy * size;
  const centerX = x + size / 2;
  const centerY = y + size / 2;
  const biome = getBiomeAt(centerX, centerY);
  const objects = [];
  const count = 4 + Math.floor(hash(cx, cy, 3) * 4);

  for (let i = 0; i < count; i += 1) {
    const px = x + 24 + hash(cx * 13 + i, cy * 7 - i, 11) * (size - 48);
    const py = y + 24 + hash(cx * 5 - i, cy * 17 + i, 19) * (size - 48);
    if (Math.hypot(px, py) < 145) continue;

    const variant = hash(cx + i * 3, cy - i * 5, 29);
    let kind = "tree";
    if (biome === "drylands") kind = variant > 0.48 ? "cactus" : "rock";
    else if (biome === "swamp") kind = variant > 0.58 ? "deadTree" : "bush";
    else if (biome === "ruins") kind = variant > 0.55 ? "ruin" : "rock";
    else if (biome === "highlands") kind = variant > 0.42 ? "rock" : "pine";
    else if (variant > 0.76) kind = "rock";
    else if (variant > 0.62) kind = "bush";

    objects.push({
      id: cx + ":" + cy + ":" + i,
      kind,
      x: px,
      y: py,
      scale: 0.82 + hash(cx + i, cy - i, 41) * 0.42
    });
  }

  const stage = { cx, cy, x, y, size, biome, objects };
  stageCache.set(key, stage);
  return stage;
}

export function getStage(stageX, stageY) {
  return getChunk(stageX, stageY);
}

export function getBiomeInfo(biome) {
  return BIOMES[biome] ?? BIOMES.forest;
}

export function getChunkKey(cx, cy) {
  return String(cx) + "," + String(cy);
}

export function getStageKey(stageX, stageY) {
  return getChunkKey(stageX, stageY);
}

export function worldToChunk(value) {
  return Math.floor(value / WORLD_CONFIG.stageSize);
}

export function worldToStage(value) {
  return worldToChunk(value);
}

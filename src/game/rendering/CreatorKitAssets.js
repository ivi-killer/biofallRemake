const SOURCES = Object.freeze({
  tree: new URL("../../../assets/creator-kit/obstacles/tree-01.svg", import.meta.url).href,
  bush: new URL("../../../assets/creator-kit/obstacles/bush-01.svg", import.meta.url).href,
  rock: new URL("../../../assets/creator-kit/obstacles/stone-01.svg", import.meta.url).href
});

const sprites = new Map();
let loading = null;

export const CREATOR_KIT_SPRITES = Object.freeze(Object.keys(SOURCES));

export function preloadCreatorKitAssets() {
  if (loading) return loading;
  if (typeof Image === "undefined") return Promise.resolve(false);

  loading = Promise.all(Object.entries(SOURCES).map(([name, source]) => new Promise(resolve => {
    const image = new Image();
    image.onload = () => {
      sprites.set(name, image);
      resolve(true);
    };
    image.onerror = () => resolve(false);
    image.src = source;
  }))).then(results => results.some(Boolean));

  return loading;
}

export function getCreatorKitSprite(name) {
  return sprites.get(name) ?? null;
}

import { getCreatorKitSprite } from "./CreatorKitAssets.js";

export const ART_STYLE = Object.freeze({
  outline: "#171914",
  outlineWidth: 3,
  groundOutline: "#343a2b",
  palette: Object.freeze({
    forest: { ground: "#88ad62", light: "#9bbb70", dark: "#739653", detail: "#66884e" },
    drylands: { ground: "#cbb77d", light: "#ddc98e", dark: "#b49c62", detail: "#a78e59" },
    swamp: { ground: "#82966d", light: "#98a77a", dark: "#697f5e", detail: "#5f7657" },
    ruins: { ground: "#9b9a83", light: "#b0aa8d", dark: "#858674", detail: "#777a6c" },
    highlands: { ground: "#a4a99c", light: "#b9bcae", dark: "#8b9589", detail: "#7d897e" }
  })
});

const TAU = Math.PI * 2;
const OUTLINE = ART_STYLE.outline;

function circle(ctx, x, y, radius, fill, stroke = OUTLINE, width = ART_STYLE.outlineWidth) {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, TAU);
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = width;
    ctx.stroke();
  }
}

function polygon(ctx, points, fill, stroke = OUTLINE, width = ART_STYLE.outlineWidth) {
  ctx.beginPath();
  ctx.moveTo(points[0][0], points[0][1]);
  for (let i = 1; i < points.length; i += 1) ctx.lineTo(points[i][0], points[i][1]);
  ctx.closePath();
  ctx.fillStyle = fill;
  ctx.fill();
  if (stroke) {
    ctx.strokeStyle = stroke;
    ctx.lineWidth = width;
    ctx.lineJoin = "round";
    ctx.stroke();
  }
}

function groundShadow(ctx, rx, ry, alpha = 0.16) {
  ctx.fillStyle = `rgba(25, 30, 20, ${alpha})`;
  ctx.beginPath();
  ctx.ellipse(3, 5, rx, ry, 0, 0, TAU);
  ctx.fill();
}

function drawTrunk(ctx, color = "#795638") {
  circle(ctx, 0, 0, 7.5, color, OUTLINE, 2.8);
  circle(ctx, -2, -2, 2.2, "#a27a4d", null);
}

export function drawTree(ctx, x, y, scale = 1, dead = false) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  groundShadow(ctx, 23, 21, 0.18);
  circle(ctx, 0, 0, dead ? 18 : 22, dead ? "#8f795d" : "#376b3c", OUTLINE, 3);
  if (dead) {
    circle(ctx, -7, -5, 7, "#a88d68", "#514536", 2.5);
    circle(ctx, 8, 5, 6, "#a88d68", "#514536", 2.5);
    polygon(ctx, [[-2,-3],[3,-1],[8,5],[4,8],[-2,2]], "#765a3e", OUTLINE, 2.5);
    drawTrunk(ctx, "#705239");
  } else {
    circle(ctx, -9, -7, 10, "#4b8547", OUTLINE, 2.4);
    circle(ctx, 8, -8, 10, "#4b8547", OUTLINE, 2.4);
    circle(ctx, 7, 9, 9, "#427b40", OUTLINE, 2.4);
    circle(ctx, -5, 3, 8, "#5a914b", OUTLINE, 2.2);
    drawTrunk(ctx);
  }
  ctx.restore();
}

export function drawPine(ctx, x, y, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  groundShadow(ctx, 21, 18, 0.16);
  circle(ctx, 0, 0, 19, "#315c3b", OUTLINE, 3);
  circle(ctx, -6, -7, 8, "#47764a", OUTLINE, 2.3);
  circle(ctx, 7, -5, 8, "#3d6c43", OUTLINE, 2.3);
  circle(ctx, 5, 8, 7, "#3a6840", OUTLINE, 2.3);
  drawTrunk(ctx, "#75543a");
  ctx.restore();
}

export function drawRock(ctx, x, y, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  groundShadow(ctx, 18, 11);
  polygon(ctx, [[-17,2],[-14,-9],[-5,-15],[9,-13],[17,-3],[14,9],[2,13],[-12,10]],
    "#929b8b", OUTLINE, 3);
  polygon(ctx, [[-12,-7],[-5,-13],[8,-11],[2,-3],[-9,0]], "#b4bcaa", "#4c5549", 2);
  ctx.restore();
}

export function drawBush(ctx, x, y, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  groundShadow(ctx, 16, 8, 0.12);
  circle(ctx, -7, 2, 8, "#4b8241", OUTLINE, 2.6);
  circle(ctx, 3, -4, 10, "#60954d", OUTLINE, 2.6);
  circle(ctx, 11, 3, 7, "#4f8745", OUTLINE, 2.6);
  circle(ctx, 1, 1, 4, "#78a85a", "#344d2f", 1.8);
  ctx.restore();
}

export function drawCactus(ctx, x, y, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  groundShadow(ctx, 13, 7, 0.13);
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = 13;
  ctx.beginPath();
  ctx.moveTo(0, 10); ctx.lineTo(0, -13);
  ctx.moveTo(0, -2); ctx.lineTo(-9, -2); ctx.lineTo(-9, -10);
  ctx.moveTo(0, 3); ctx.lineTo(9, 3); ctx.lineTo(9, -6);
  ctx.stroke();
  ctx.strokeStyle = "#4e8c50";
  ctx.lineWidth = 8;
  ctx.stroke();
  ctx.restore();
}

export function drawRuin(ctx, x, y, scale = 1) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  groundShadow(ctx, 19, 13, 0.15);
  polygon(ctx, [[-18,-12],[12,-12],[18,-5],[18,14],[-18,14]], "#858879", OUTLINE, 3);
  polygon(ctx, [[-13,-8],[5,-8],[10,-3],[-9,-3]], "#b0ad94", "#555b4d", 2);
  polygon(ctx, [[-5,0],[5,0],[5,14],[-5,14]], "#555b4e", OUTLINE, 2.5);
  ctx.restore();
}

export function drawWorldObject(ctx, object) {
  if (!object) return;

  const spriteName = object.kind === "tree" ? "tree"
    : object.kind === "bush" ? "bush"
      : object.kind === "rock" ? "rock" : null;
  const sprite = spriteName ? getCreatorKitSprite(spriteName) : null;

  if (sprite) {
    const size = (object.kind === "tree" ? 56 : 42) * object.scale;
    ctx.drawImage(sprite, object.x - size / 2, object.y - size / 2, size, size);
    return;
  }

  // Vector fallback keeps the world visible while local sprites are loading.
  if (object.kind === "tree") drawTree(ctx, object.x, object.y, object.scale);
  else if (object.kind === "pine") drawPine(ctx, object.x, object.y, object.scale);
  else if (object.kind === "deadTree") drawTree(ctx, object.x, object.y, object.scale, true);
  else if (object.kind === "rock") drawRock(ctx, object.x, object.y, object.scale);
  else if (object.kind === "bush") drawBush(ctx, object.x, object.y, object.scale);
  else if (object.kind === "cactus") drawCactus(ctx, object.x, object.y, object.scale);
  else if (object.kind === "ruin") drawRuin(ctx, object.x, object.y, object.scale);
}

function hash(x, y, seed = 0) {
  const value = Math.sin(x * 127.1 + y * 311.7 + seed * 74.7) * 43758.5453;
  return value - Math.floor(value);
}

export function drawGroundDetails(ctx, stage, palette, density = 42) {
  const size = stage.size;
  ctx.save();
  ctx.globalAlpha = 0.32;
  for (let i = 0; i < density; i += 1) {
    const x = stage.x + 8 + hash(stage.cx * 17 + i, stage.cy * 11 - i, 23) * (size - 16);
    const y = stage.y + 8 + hash(stage.cx * 7 - i, stage.cy * 19 + i, 31) * (size - 16);
    const angle = hash(i, stage.cx + stage.cy, 37) * TAU;
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(angle);
    ctx.strokeStyle = palette.detail;
    ctx.lineWidth = 1.8;
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(-2, 2);
    ctx.lineTo(0, -3);
    ctx.lineTo(3, 1);
    ctx.stroke();
    ctx.restore();
  }
  ctx.restore();
}

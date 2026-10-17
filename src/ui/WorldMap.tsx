import { useEffect, useRef } from "react";
import { useGameStore } from "@/store/gameStore";
import { crystals, spots } from "@/game/config";
import { runtime } from "@/game/runtime";
import { BOUNDS, GARAGE, HOUSE } from "@/game/world/layout";
import { iconPaths } from "./Icon";
import { Dialog } from "./Dialog";

// Jendela peta (koordinat dunia): plot + sedikit tepi. Utara = -z (atas).
const VIEW = { minX: BOUNDS.minX - 2, maxX: BOUNDS.maxX + 2, minZ: BOUNDS.minZ - 1.5, maxZ: BOUNDS.maxZ + 2 };
const WORLD_W = VIEW.maxX - VIEW.minX;
const WORLD_H = VIEW.maxZ - VIEW.minZ;
export const MAP_ASPECT = WORLD_W / WORLD_H;

const trees: [number, number, number][] = [
  [-18.4, 11.4, 3.6],
  [11.3, 0.6, 1.2],
  [-19.6, -6.4, 1.2],
  [-12.5, -8.3, 1.2],
  [12, -7.8, 1.2],
  [10.9, -4.6, 1.1],
  [-19.8, 1.8, 1.1],
  [10.7, 13.7, 1.1],
  [7.6, -7.9, 0.9],
  [-4, -8.1, 0.9],
  [11, 9.2, 0.9],
  [3.5, -8.4, 1.4],
  [-8.4, -8.3, 1.2],
];

/** Nama area dari posisi (dipakai widget lokasi dan peta). */
export function areaName(x: number, y: number, z: number) {
  const inGarage = Math.abs(x) < GARAGE.maxX + 0.2 && z > GARAGE.minZ - 0.2 && z < GARAGE.maxZ + 0.2;
  if (y > 3.6 && inGarage) return "Teras atap";
  if (inGarage) return "Garasi";
  if (y > 1.5 && x < HOUSE.maxX && x > HOUSE.minX) return "Teras rumah";
  if (x < HOUSE.minX) return "Taman tebing";
  if (z < GARAGE.minZ - 0.5) return "Lorong belakang";
  if (x > 8.5) return "Kebun palem";
  if (x < -14 && z > 8) return "Pohon lentera";
  return "Halaman";
}

type Painter = { ctx: CanvasRenderingContext2D; s: number; px: (x: number) => number; pz: (z: number) => number };

function painter(ctx: CanvasRenderingContext2D, width: number): Painter {
  const s = width / WORLD_W;
  return { ctx, s, px: (x) => (x - VIEW.minX) * s, pz: (z) => (z - VIEW.minZ) * s };
}

function rect(p: Painter, x1: number, z1: number, x2: number, z2: number, fill: string, stroke?: string) {
  p.ctx.fillStyle = fill;
  p.ctx.fillRect(p.px(x1), p.pz(z1), (x2 - x1) * p.s, (z2 - z1) * p.s);
  if (stroke) {
    p.ctx.strokeStyle = stroke;
    p.ctx.lineWidth = 1.5;
    p.ctx.strokeRect(p.px(x1), p.pz(z1), (x2 - x1) * p.s, (z2 - z1) * p.s);
  }
}

function label(p: Painter, text: string, x: number, z: number, size = 11, color = "#f3dccb") {
  p.ctx.font = `600 ${size}px Manrope, sans-serif`;
  p.ctx.textAlign = "center";
  p.ctx.textBaseline = "middle";
  p.ctx.fillStyle = "#140c22cc";
  p.ctx.fillText(text, p.px(x) + 1, p.pz(z) + 1);
  p.ctx.fillStyle = color;
  p.ctx.fillText(text, p.px(x), p.pz(z));
}

/** Lapisan statis: tanah, bangunan, pohon, label area. */
function drawBase(p: Painter, labels: boolean) {
  const { ctx } = p;
  ctx.fillStyle = "#1a1126";
  ctx.fillRect(0, 0, WORLD_W * p.s, WORLD_H * p.s);
  // Laut di sisi kiri-atas (arah matahari).
  const sea = ctx.createLinearGradient(0, 0, p.px(BOUNDS.minX), 0);
  sea.addColorStop(0, "#3b2a63");
  sea.addColorStop(1, "#1a1126");
  ctx.fillStyle = sea;
  ctx.fillRect(0, 0, p.px(BOUNDS.minX), WORLD_H * p.s);
  rect(p, BOUNDS.minX, BOUNDS.minZ, BOUNDS.maxX, BOUNDS.maxZ, "#2b4231");
  rect(p, BOUNDS.minX, 5, 9, BOUNDS.maxZ, "#5d4853");
  rect(p, BOUNDS.minX, -9, -17.4, 5, "#5d4853");
  rect(p, HOUSE.minX, HOUSE.minZ, HOUSE.maxX, HOUSE.maxZ, "#b98a6e", "#7a4c32");
  rect(p, HOUSE.porch.minX, HOUSE.maxZ, HOUSE.porch.maxX, HOUSE.porch.maxZ, "#8a5634");
  rect(p, HOUSE.stairs.x - HOUSE.stairs.half, HOUSE.porch.maxZ, HOUSE.stairs.x + HOUSE.stairs.half, HOUSE.porch.maxZ + HOUSE.stairs.depth, "#8b7676");
  rect(p, GARAGE.minX - 0.15, GARAGE.minZ - 0.15, GARAGE.maxX + 0.15, GARAGE.maxZ + 0.15, "#7a4c32");
  // Dinding garasi dengan bukaan pintu di depan.
  ctx.strokeStyle = "#f1d9bf";
  ctx.lineWidth = Math.max(2, p.s * 0.3);
  ctx.beginPath();
  ctx.moveTo(p.px(-GARAGE.doorHalf), p.pz(GARAGE.maxZ));
  ctx.lineTo(p.px(GARAGE.minX), p.pz(GARAGE.maxZ));
  ctx.lineTo(p.px(GARAGE.minX), p.pz(GARAGE.minZ));
  ctx.lineTo(p.px(GARAGE.maxX), p.pz(GARAGE.minZ));
  ctx.lineTo(p.px(GARAGE.maxX), p.pz(GARAGE.maxZ));
  ctx.lineTo(p.px(GARAGE.doorHalf), p.pz(GARAGE.maxZ));
  ctx.stroke();
  // Tembok batu depan & kiri, pagar tanaman kanan & belakang.
  ctx.lineWidth = Math.max(2, p.s * 0.45);
  ctx.strokeStyle = "#9c8582";
  ctx.beginPath();
  ctx.moveTo(p.px(BOUNDS.minX), p.pz(BOUNDS.minZ));
  ctx.lineTo(p.px(BOUNDS.minX), p.pz(BOUNDS.maxZ));
  ctx.lineTo(p.px(BOUNDS.maxX), p.pz(BOUNDS.maxZ));
  ctx.stroke();
  ctx.strokeStyle = "#1f3a26";
  ctx.beginPath();
  ctx.moveTo(p.px(BOUNDS.maxX), p.pz(BOUNDS.maxZ));
  ctx.lineTo(p.px(BOUNDS.maxX), p.pz(BOUNDS.minZ));
  ctx.lineTo(p.px(BOUNDS.minX), p.pz(BOUNDS.minZ));
  ctx.stroke();
  for (const [x, z, r] of trees) {
    ctx.fillStyle = r > 2 ? "#3d6a37cc" : "#4f7d3fcc";
    ctx.beginPath();
    ctx.arc(p.px(x), p.pz(z), r * p.s, 0, Math.PI * 2);
    ctx.fill();
  }
  if (labels) {
    label(p, "Rumah", (HOUSE.minX + HOUSE.maxX) / 2, -2, 13);
    label(p, "Garasi", 0, -1.2, 13);
    label(p, "Halaman", -4, 11.5, 12);
    label(p, "Kebun", 11, -1.5, 11);
    label(p, "Taman", -19.2, -2.5, 11);
    label(p, "← Laut", BOUNDS.minX + 1.6, BOUNDS.minZ - 0.8, 10, "#c9a7ff");
  }
}

function icon(p: Painter, name: keyof typeof iconPaths, x: number, z: number, size: number, color: string) {
  const { ctx } = p;
  ctx.save();
  ctx.fillStyle = "#140c22e6";
  ctx.strokeStyle = color;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(p.px(x), p.pz(z), size * 0.75, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.translate(p.px(x) - size / 2, p.pz(z) - size / 2);
  ctx.scale(size / 24, size / 24);
  ctx.lineWidth = 2;
  ctx.lineCap = "round";
  ctx.lineJoin = "round";
  ctx.strokeStyle = "#ffffff";
  ctx.stroke(new Path2D(iconPaths[name]));
  ctx.restore();
}

/** Lapisan dinamis: benda, kristal yang ditemukan, posisi & arah pemain. */
function drawDynamic(p: Painter, large: boolean, found: string[], time: number) {
  const { ctx } = p;
  for (const spot of spots) {
    if (spot.id === "roof") continue;
    if (large) icon(p, spot.icon, spot.position[0], spot.position[2], 13, spot.color);
    else {
      ctx.fillStyle = spot.color;
      ctx.beginPath();
      ctx.arc(p.px(spot.position[0]), p.pz(spot.position[2]), 2.6, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  for (const c of crystals) {
    if (!found.includes(c.id)) continue;
    const x = p.px(c.position[0]);
    const y = p.pz(c.position[2]);
    const r = large ? 6 : 4;
    ctx.fillStyle = "#c79bff";
    ctx.shadowColor = "#9b5cff";
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(x, y - r);
    ctx.lineTo(x + r * 0.7, y);
    ctx.lineTo(x, y + r);
    ctx.lineTo(x - r * 0.7, y);
    ctx.fill();
    ctx.shadowBlur = 0;
  }
  const x = p.px(runtime.player.x);
  const y = p.pz(runtime.player.z);
  // Kerucut pandang kamera: kamera berada di belakang pemain sejauh yaw.
  const look = Math.atan2(-Math.cos(runtime.yaw), -Math.sin(runtime.yaw));
  const cone = ctx.createRadialGradient(x, y, 0, x, y, large ? 70 : 34);
  cone.addColorStop(0, "#ffd29a55");
  cone.addColorStop(1, "#ffd29a00");
  ctx.fillStyle = cone;
  ctx.beginPath();
  ctx.moveTo(x, y);
  ctx.arc(x, y, large ? 70 : 34, look - 0.55, look + 0.55);
  ctx.fill();
  const pulse = 1 + Math.sin(time * 4) * 0.15;
  ctx.fillStyle = "#ffb35c44";
  ctx.beginPath();
  ctx.arc(x, y, (large ? 13 : 8) * pulse, 0, Math.PI * 2);
  ctx.fill();
  const h = runtime.heading;
  const fx = Math.sin(h);
  const fz = Math.cos(h);
  const size = large ? 10 : 6.5;
  ctx.fillStyle = "#ffb35c";
  ctx.strokeStyle = "#140c22";
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(x + fx * size, y + fz * size);
  ctx.lineTo(x - fx * size * 0.6 + fz * size * 0.6, y - fz * size * 0.6 - fx * size * 0.6);
  ctx.lineTo(x - fx * size * 0.25, y - fz * size * 0.25);
  ctx.lineTo(x - fx * size * 0.6 - fz * size * 0.6, y - fz * size * 0.6 + fx * size * 0.6);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
}

/** Kanvas peta yang menggambar ulang ~20 fps dari runtime (tanpa rerender React). */
function MapCanvas({ width, large, className }: { width: number; large: boolean; className?: string }) {
  const canvas = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const el = canvas.current;
    if (!el) return;
    const height = width / MAP_ASPECT;
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    el.width = Math.round(width * dpr);
    el.height = Math.round(height * dpr);
    const base = document.createElement("canvas");
    base.width = el.width;
    base.height = el.height;
    const baseCtx = base.getContext("2d")!;
    baseCtx.scale(dpr, dpr);
    drawBase(painter(baseCtx, width), large);
    const ctx = el.getContext("2d")!;
    let frame = 0;
    let last = 0;
    const loop = (time: number) => {
      frame = requestAnimationFrame(loop);
      if (time - last < 50) return;
      last = time;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.drawImage(base, 0, 0);
      ctx.scale(dpr, dpr);
      drawDynamic(painter(ctx, width), large, useGameStore.getState().found, time / 1000);
    };
    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [width, large]);
  return (
    <canvas
      ref={canvas}
      className={className}
      style={{ width, height: width / MAP_ASPECT }}
      role="img"
      aria-label="Peta workshop: posisi Omen, benda yang bisa dipakai, dan kristal yang ditemukan"
    />
  );
}

/** Minimap di pojok; klik untuk membuka peta besar. */
export function MiniMap({ width = 176 }: { width?: number }) {
  return (
    <button className="minimap" onClick={() => useGameStore.getState().toggleMap(true)} aria-label="Buka peta besar (Tab)">
      <MapCanvas width={width} large={false} />
      <span className="minimap-hint">
        <kbd>Tab</kbd> Peta
      </span>
    </button>
  );
}

/** Peta besar dengan label area dan legenda. */
export function MapOverlay() {
  const open = useGameStore((s) => s.mapOpen);
  const found = useGameStore((s) => s.found);
  if (!open) return null;
  const width = Math.min(700, (typeof window === "undefined" ? 700 : window.innerWidth) - 80);
  return (
    <Dialog title="Peta workshop" subtitle="Tab untuk menutup" onClose={() => useGameStore.getState().toggleMap(false)} wide>
      <div className="map-layout">
        <MapCanvas width={width} large className="map-canvas" />
        <ul className="map-legend">
          <li>
            <span className="legend-player" aria-hidden="true" /> Omen
          </li>
          {spots
            .filter((spot) => spot.id !== "roof")
            .map((spot) => (
              <li key={spot.id} style={{ ["--marker" as string]: spot.color }}>
                <span className="legend-dot" aria-hidden="true" /> {spot.object}
              </li>
            ))}
          <li>
            <span className="legend-crystal" aria-hidden="true" /> Kristal ditemukan ({found.length}/{crystals.length})
          </li>
        </ul>
      </div>
    </Dialog>
  );
}

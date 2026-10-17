import type { IconName } from "@/ui/Icon";

export type Vec3 = [number, number, number];
export type SpotId =
  "sofa" | "desk" | "workbench" | "radio" | "bike" | "portal" | "roof" | "door";
// Mulai di halaman depan, menghadap pintu garasi.
export const PLAYER_SPAWN: Vec3 = [0, 0.95, 9.5];
export const playerMotion = {
  walkSpeed: 2.6,
  runSpeed: 4.6,
  jumpSpeed: 5.3,
  gravity: -9.81,
};
export const characterAsset = {
  url: "/models/omen-character.glb" as string | null,
  height: 1.65,
  rotationY: 0,
  animations: { idle: "idle", walk: "walk", run: "run", jump: "jump", relax: "standing_relax", sit: "sit" },
  relaxAfterSeconds: 5,
  // Aset jump berisi beberapa hop. Gunakan hop pertama untuk satu tekan Space.
  jumpSegment: { startFrame: 0, endFrame: 11, fps: 24 },
};

export type SpotKind = "sit" | "toggle" | "pulse" | "teleport" | "knock";
export type Spot = {
  id: SpotId;
  kind: SpotKind;
  /** Kata kerja pada prompt, mis. "Duduk". */
  verb: string;
  object: string;
  /** Titik pusat; y = tinggi lantai tempat spot berada. */
  position: Vec3;
  radius: number;
  color: string;
  icon: IconName;
  /** Tinggi absolut ikon hotspot. */
  iconHeight: number;
  /** Pose duduk: titik origin model (kaki) dan arah hadap. */
  seat?: { position: Vec3; rotationY: number };
  /** Tujuan teleport: posisi capsule dan yaw kamera. */
  destination?: { position: Vec3; yaw: number };
};

export const spots: Spot[] = [
  {
    id: "sofa",
    kind: "sit",
    verb: "Duduk santai",
    object: "Sofa",
    position: [-3.9, 0, 1.2],
    radius: 1.9,
    color: "#ff8fb8",
    icon: "sofa",
    iconHeight: 2.75,
    seat: { position: [-5.0, 0.3, 1.2], rotationY: Math.PI / 2 },
  },
  {
    id: "desk",
    kind: "sit",
    verb: "Nyalakan PC",
    object: "Meja komputer",
    position: [-3.3, 0, -2.75],
    radius: 1.7,
    color: "#5fe9ff",
    icon: "code",
    iconHeight: 3.55,
    seat: { position: [-3.3, 0.3, -3.3], rotationY: Math.PI },
  },
  {
    id: "workbench",
    kind: "toggle",
    verb: "Hidupkan workbench",
    object: "Workbench",
    position: [3.3, 0, -2.9],
    radius: 1.9,
    color: "#ffb35c",
    icon: "projects",
    iconHeight: 3.45,
  },
  {
    id: "radio",
    kind: "toggle",
    verb: "Putar radio",
    object: "Radio tua",
    position: [0, 0, -3.5],
    radius: 1.7,
    color: "#8fb7ff",
    icon: "music",
    iconHeight: 3.3,
  },
  {
    id: "bike",
    kind: "pulse",
    verb: "Panaskan mesin",
    object: "Motor neon",
    position: [2.55, 0, 2.4],
    radius: 1.5,
    color: "#5fe9ff",
    icon: "bike",
    iconHeight: 2.2,
  },
  {
    id: "portal",
    kind: "teleport",
    verb: "Masuk portal",
    object: "Portal batu",
    position: [4.2, 0, -0.9],
    radius: 1.6,
    color: "#c08bff",
    icon: "featured",
    iconHeight: 3.35,
    // Tiba di depan pergola, kamera menghadap laut & matahari.
    destination: { position: [2.2, 5.45, 3.4], yaw: 0.96 },
  },
  {
    id: "roof",
    kind: "teleport",
    verb: "Kembali turun",
    object: "Portal atap",
    position: [-3.3, 4.45, -2.5],
    radius: 1.3,
    color: "#c08bff",
    icon: "featured",
    iconHeight: 6.55,
    destination: { position: [3.3, 0.95, -0.9], yaw: -Math.PI / 2 },
  },
  {
    id: "door",
    kind: "knock",
    verb: "Ketuk pintu",
    object: "Pintu rumah",
    position: [-11.6, 1.2, 4.1],
    radius: 1.3,
    color: "#ffb35c",
    icon: "door",
    iconHeight: 4.15,
  },
];

// Kristal Omen yang tersembunyi di seluruh dunia.
export const crystals: { id: string; position: Vec3; hint: string }[] = [
  { id: "pohon", position: [-16.9, 0.55, 13.6], hint: "Di bawah pohon berlampion" },
  { id: "tebing", position: [-19.9, 0.55, -8.4], hint: "Ujung taman menghadap laut" },
  { id: "teras", position: [-16.1, 1.7, 3.95], hint: "Sudut teras rumah" },
  { id: "atap", position: [4.4, 5.0, -3.0], hint: "Di bawah pergola atap" },
  { id: "belakang", position: [1.5, 0.55, -7.4], hint: "Lorong di belakang garasi" },
  { id: "palem", position: [11.5, 0.55, -2.4], hint: "Di antara palem kebun kanan" },
  { id: "trofi", position: [5.35, 1.55, 2.6], hint: "Di rak trofi" },
  { id: "pisang", position: [-6.6, 1.6, 4.85], hint: "Di bak tanaman pisang" },
];

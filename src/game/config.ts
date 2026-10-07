export type Vec3 = [number, number, number];
export type SectionId =
  "projects" | "skills" | "experience" | "about" | "journey" | "featured";
export const PLAYER_SPAWN: Vec3 = [0, 0.95, 0.9];
export const playerMotion = {
  walkSpeed: 2.6,
  runSpeed: 4.6,
  jumpSpeed: 5.3,
  gravity: -9.81,
};
export const characterAsset = {
  url: "/models/omen/chibi-animation-source.glb" as string | null,
  height: 1.65,
  rotationY: 0,
  animations: { idle: "idle", walk: "walk", run: "run", jump: "jump" },
  // Aset jump berisi beberapa hop. Gunakan hop pertama untuk satu tekan Space.
  jumpSegment: { startFrame: 0, endFrame: 11, fps: 24 },
};

export const stations: {
  id: SectionId;
  title: string;
  object: string;
  position: Vec3;
  radius: number;
  color: string;
}[] = [
  {
    id: "skills",
    title: "Keahlian",
    object: "Meja komputer",
    position: [-4, 0, -2.8],
    radius: 2.25,
    color: "#88b5aa",
  },
  {
    id: "projects",
    title: "Proyek",
    object: "Meja kerja",
    position: [3.7, 0, -2.8],
    radius: 2.25,
    color: "#eab980",
  },
  {
    id: "experience",
    title: "Pengalaman",
    object: "Rak koleksi",
    position: [4.8, 0, 0.2],
    radius: 2.0,
    color: "#d6be7e",
  },
  {
    id: "about",
    title: "Tentang saya",
    object: "Sudut santai",
    position: [-4.4, 0, 1.7],
    radius: 2.2,
    color: "#d0bca8",
  },
  {
    id: "journey",
    title: "Perjalanan",
    object: "Papan cerita",
    position: [0, 0, -4.2],
    radius: 2.15,
    color: "#dcb294",
  },
  {
    id: "featured",
    title: "Proyek pilihan",
    object: "Portal ide",
    position: [4.3, 0, 3.3],
    radius: 2.2,
    color: "#8dbdb4",
  },
];

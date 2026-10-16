import type { IconName } from "@/ui/Icon";

export type Vec3 = [number, number, number];
export type SectionId =
  "projects" | "skills" | "experience" | "about" | "journey" | "featured";
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
  animations: { idle: "idle", walk: "walk", run: "run", jump: "jump", relax: "standing_relax" },
  relaxAfterSeconds: 5,
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
  icon: IconName;
  /** Tinggi ikon hotspot di atas lantai. */
  iconHeight: number;
}[] = [
  {
    id: "skills",
    title: "Keahlian",
    object: "Meja komputer",
    position: [-3.3, 0, -3.0],
    radius: 2.2,
    color: "#5fe9ff",
    icon: "code",
    iconHeight: 3.55,
  },
  {
    id: "projects",
    title: "Proyek",
    object: "Workbench",
    position: [3.3, 0, -3.0],
    radius: 2.2,
    color: "#ffb35c",
    icon: "projects",
    iconHeight: 3.45,
  },
  {
    id: "experience",
    title: "Pengalaman",
    object: "Rak trofi",
    position: [4.5, 0, 2.6],
    radius: 1.8,
    color: "#ffd36b",
    icon: "experience",
    iconHeight: 3.2,
  },
  {
    id: "about",
    title: "Tentang saya",
    object: "Sudut santai",
    position: [-3.8, 0, 1.3],
    radius: 2.2,
    color: "#ff8fb8",
    icon: "about",
    iconHeight: 2.95,
  },
  {
    id: "journey",
    title: "Perjalanan",
    object: "Papan blueprint",
    position: [0, 0, -3.6],
    radius: 1.6,
    color: "#8fb7ff",
    icon: "journey",
    iconHeight: 3.3,
  },
  {
    id: "featured",
    title: "Proyek pilihan",
    object: "Portal ide",
    position: [4.2, 0, -0.9],
    radius: 1.9,
    color: "#c08bff",
    icon: "featured",
    iconHeight: 3.35,
  },
];

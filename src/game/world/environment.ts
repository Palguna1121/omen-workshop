import { Vector3 } from "three";

// Matahari terlihat rendah di atas laut (kiri-belakang), sedangkan cahaya
// directional sedikit lebih tinggi agar bayangan tetap terbaca di plot.
export const SUN_VISUAL = new Vector3(-0.82, 0.045, -0.57).normalize();
export const SUN_LIGHT = new Vector3(-0.72, 0.42, -0.55).normalize();

export const sky = {
  zenith: "#1f1747",
  upper: "#5b3488",
  horizon: "#d86a8a",
  horizonSun: "#ff9548",
  sun: "#ffc27a",
  cloudLit: "#ff9f78",
  cloudDark: "#4a2c63",
};

export const FOG = "#a0587e";
export const SEA_LEVEL = -28;

// Pusat plot yang bisa dijelajahi (rumah, garasi, halaman).
export const PLOT = { x: -4, z: 3, halfX: 17, halfZ: 12.5 };

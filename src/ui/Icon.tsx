export type IconName =
  | "arrow"
  | "sound"
  | "mute"
  | "menu"
  | "close"
  | "code"
  | "projects"
  | "experience"
  | "about"
  | "journey"
  | "featured"
  | "sofa"
  | "music"
  | "bike"
  | "door"
  | "crystal"
  | "sliders"
  | "map"
  | "lock"
  | "player";
export const iconPaths: Record<IconName, string> = {
  arrow: "M5 12h14m-6-6 6 6-6 6",
  sound: "M11 5 6 9H3v6h3l5 4V5Zm4 3a6 6 0 0 1 0 8m3-11a10 10 0 0 1 0 14",
  mute: "M11 5 6 9H3v6h3l5 4V5Zm5 5 5 5m0-5-5 5",
  menu: "M4 7h16M4 12h16M4 17h16",
  close: "m6 6 12 12M18 6 6 18",
  code: "m8 7-5 5 5 5m8-10 5 5-5 5m-3-12-2 14",
  projects: "M4 7h16v13H4V7Zm4 0V4h8v3M4 12h16m-10 0v3h4v-3",
  experience:
    "M8 3h8v7a4 4 0 0 1-8 0V3Zm0 2H4v3a4 4 0 0 0 4 4m8-7h4v3a4 4 0 0 1-4 4m-4 2v5m-4 2h8",
  about: "M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0ZM4 21v-2a8 8 0 0 1 16 0v2",
  journey: "M4 5h16v14H4V5Zm4 5h8m-8 4h5M8 3v4m8-4v4",
  featured: "m12 3 3 6 6 3-6 3-3 6-3-6-6-3 6-3 3-6Z",
  sofa: "M5 11V8a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2v3M3 18v-5a2 2 0 0 1 4 0v2h10v-2a2 2 0 0 1 4 0v5H3Zm2 0v2m14-2v2",
  music: "M9 18V5l11-2v13M9 18a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm11-2a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z",
  bike: "M5.5 17.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm13 0a3 3 0 1 0 0-6 3 3 0 0 0 0 6ZM5.5 14.5H11l3-5h3l1.5 5M10 9.5h3m2 0 1-3h3",
  door: "M6 21V4a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v17M3 21h18M14 12v1.5",
  crystal: "m12 2 5 6-5 14-5-14 5-6ZM7 8h10m-5-6v20",
  sliders: "M4 7h9m4 0h3M4 17h3m4 0h9M15 5v4M9 15v4",
  map: "m9 4-6 2v14l6-2 6 2 6-2V4l-6 2-6-2Zm0 0v14m6-12v14",
  lock: "M6 11h12v10H6V11Zm2 0V7a4 4 0 0 1 8 0v4m-4 4v2",
  player: "M12 3 19 20l-7-4-7 4 7-17Z",
};
export function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={iconPaths[name]} />
    </svg>
  );
}

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
  | "featured";
const paths: Record<IconName, string> = {
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
      <path d={paths[name]} />
    </svg>
  );
}

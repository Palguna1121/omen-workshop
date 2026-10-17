"use client";

import dynamic from "next/dynamic";
import { LoadingView } from "./LoadingScreen";

const Game = dynamic(() => import("@/game/Game"), {
  ssr: false,
  loading: () => <LoadingView stage={0} detail="Mengunduh mesin dunia (Three.js & physics)." />,
});

export function Experience() {
  return <Game />;
}

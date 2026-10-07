"use client";

import dynamic from "next/dynamic";
import Link from "next/link";

const Game = dynamic(() => import("@/game/Game"), {
  ssr: false,
  loading: () => (
    <div className="loading-screen">
      <span className="eyebrow">Palguna · Workshop</span>
      <h2>Membuka workshop...</h2>
      <Link href="/portfolio" className="quiet-link">
        Buka portfolio langsung ↗
      </Link>
    </div>
  ),
});

export function Experience() {
  return <Game />;
}

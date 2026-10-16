"use client";

import {
  Component,
  Suspense,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import Link from "next/link";
import { Canvas, useThree } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { ACESFilmicToneMapping, PCFShadowMap } from "three";
import { useGameStore } from "@/store/gameStore";
import { World } from "./World";
import { Player } from "./player/Player";
import { IntroCamera } from "./camera/IntroCamera";
import { GameCamera } from "./camera/GameCamera";
import { InteractionSystem } from "./interaction/InteractionSystem";
import { AudioHelper } from "./audio/AudioHelper";
import { Effects } from "./Effects";
import { HUD } from "@/ui/HUD";
import { ProjectPanel } from "@/ui/ProjectPanel";
import { LoadingScreen } from "@/ui/LoadingScreen";
import { playerMotion } from "./config";

export function GameFallback() {
  return (
    <div className="game-fallback">
      <span className="brand-mark">P.</span>
      <span className="eyebrow">Palguna · Workshop</span>
      <h1>
        Semua ide,
        <br />
        tetap di sini.
      </h1>
      <p>
        Dunia 3D belum bisa dibuka di perangkat ini.
        <br />
        Kamu tetap bisa membaca semua proyek dan cerita saya.
      </p>
      <Link className="button button-dark" href="/portfolio">
        Buka portfolio <span>↗</span>
      </Link>
    </div>
  );
}

class GameBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? <GameFallback /> : this.props.children;
  }
}

function SceneReady() {
  const { gl } = useThree();
  useEffect(() => {
    useGameStore.getState().ready();
  }, [gl]);
  return null;
}

function detectDevice() {
  const canvas = document.createElement("canvas");
  const gl = canvas.getContext("webgl2");
  if (!gl) return { supported: false, low: true };
  gl.getExtension("WEBGL_lose_context")?.loseContext();
  return {
    supported: true,
    low:
      matchMedia("(pointer: coarse)").matches ||
      navigator.hardwareConcurrency <= 4,
  };
}

function GameCanvas() {
  const [device] = useState(detectDevice);
  const [lost, setLost] = useState(false);
  const quality = useGameStore((s) => s.quality);
  const phase = useGameStore((s) => s.phase);
  const paused = useGameStore(
    (s) => s.menuOpen || !!s.section || s.phase !== "playing",
  );
  useEffect(() => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const configure = () =>
      useGameStore
        .getState()
        .configure(device.low ? "low" : "medium", reduced.matches);
    configure();
    reduced.addEventListener("change", configure);
    const unsubscribe = useGameStore.subscribe((state) => {
      if (state.reducedMotion && state.phase === "intro") state.finishIntro();
    });
    return () => {
      reduced.removeEventListener("change", configure);
      unsubscribe();
    };
  }, [device.low]);
  if (!device.supported || lost) return <GameFallback />;
  return (
    <main
      className={`game-shell phase-${phase}`}
      aria-label="Portfolio 3D Palguna"
    >
      <div className="game-canvas">
        <Canvas
          shadows={quality !== "low" ? { type: PCFShadowMap } : false}
          dpr={quality === "low" ? 1 : [1, 1.5]}
          camera={{ position: [19, 8.6, 31], fov: 45, near: 0.1, far: 1200 }}
          gl={{
            antialias: !device.low,
            powerPreference: "high-performance",
            toneMapping: ACESFilmicToneMapping,
          }}
          fallback={null}
          onCreated={({ gl }) => {
            gl.domElement.setAttribute(
              "aria-label",
              "Dunia workshop 3D; gunakan WASD untuk bergerak dan drag untuk kamera",
            );
            gl.domElement.addEventListener(
              "webglcontextlost",
              (event) => {
                event.preventDefault();
                setLost(true);
              },
              { once: true },
            );
          }}
        >
          <color attach="background" args={["#1c1430"]} />
          <Suspense fallback={null}>
            <Physics gravity={[0, playerMotion.gravity, 0]} paused={paused} timeStep={1 / 60}>
              <World />
              <Player />
              <InteractionSystem />
              <SceneReady />
              <GameCamera />
            </Physics>
          </Suspense>
          <IntroCamera />
          <Effects />
        </Canvas>
      </div>
      <HUD />
      <ProjectPanel />
      <LoadingScreen />
      <AudioHelper />
    </main>
  );
}

export default function Game() {
  return (
    <GameBoundary>
      <GameCanvas />
    </GameBoundary>
  );
}

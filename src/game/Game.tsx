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
import { HUD } from "@/ui/HUD";
import { ProjectPanel } from "@/ui/ProjectPanel";
import { LoadingScreen } from "@/ui/LoadingScreen";

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
          camera={{ position: [18, 11, 23], fov: 45, near: 0.1, far: 100 }}
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
          <color attach="background" args={["#c4cdc0"]} />
          <fog attach="fog" args={["#c4cdc0", 28, 65]} />
          <ambientLight intensity={phase === "playing" ? 0.48 : 0.9} color="#ffecd0" />
          <hemisphereLight args={["#d8e8e6", "#705745", phase === "playing" ? 0.7 : 1.2]} />
          <directionalLight
            position={[-8, 16, 10]}
            intensity={2.2}
            color="#ffe4b8"
            castShadow={quality !== "low"}
            shadow-mapSize={1024}
            shadow-camera-left={-18}
            shadow-camera-right={18}
            shadow-camera-top={18}
            shadow-camera-bottom={-18}
            shadow-bias={-0.001}
          />
          <spotLight
            position={[0, 3.55, 0.8]}
            color="#ffdeb0"
            intensity={45}
            angle={1.15}
            penumbra={0.65}
            distance={11}
            decay={2}
            castShadow={quality !== "low"}
            shadow-mapSize={512}
            shadow-bias={-0.002}
            shadow-camera-near={0.2}
            shadow-camera-far={12}
          />
          <Suspense fallback={null}>
            <Physics gravity={[0, -9.81, 0]} paused={paused} timeStep={1 / 60}>
              <World />
              <Player />
              <InteractionSystem />
              <SceneReady />
            </Physics>
          </Suspense>
          <IntroCamera />
          <GameCamera />
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

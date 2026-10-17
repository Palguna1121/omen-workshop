"use client";

import {
  Component,
  Suspense,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { Canvas, useThree } from "@react-three/fiber";
import { Physics } from "@react-three/rapier";
import { Preload } from "@react-three/drei";
import { ACESFilmicToneMapping, PCFShadowMap } from "three";
import { useGameStore } from "@/store/gameStore";
import { useSettings } from "@/store/settingsStore";
import { World } from "./World";
import { Player } from "./player/Player";
import { IntroCamera } from "./camera/IntroCamera";
import { GameCamera } from "./camera/GameCamera";
import { InteractionSystem } from "./interaction/InteractionSystem";
import { AudioHelper } from "./audio/AudioHelper";
import { Effects } from "./Effects";
import { SoundDriver } from "./audio/SoundDriver";
import { FpsMeter } from "./fps";
import { MapOverlay } from "@/ui/WorldMap";
import { SettingsPanel } from "@/ui/SettingsPanel";
import { HUD } from "@/ui/HUD";
import { LoadingScreen } from "@/ui/LoadingScreen";
import { playerMotion } from "./config";

export function GameFallback() {
  return (
    <div className="game-fallback">
      <span className="brand-mark" aria-hidden="true">✦</span>
      <span className="eyebrow">Workshop Omen</span>
      <h1>
        Workshopnya butuh
        <br />
        WebGL.
      </h1>
      <p>
        Perangkat atau browser ini belum bisa menampilkan dunia 3D.
        <br />
        Coba buka di Chrome, Edge, Firefox, atau Safari terbaru.
      </p>
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
  const resolution = useSettings((s) => s.graphics.resolution);
  const [deviceDpr] = useState(() => Math.min(globalThis.devicePixelRatio || 1, 1.5));
  const phase = useGameStore((s) => s.phase);
  const paused = useGameStore(
    (s) => s.menuOpen || s.mapOpen || s.phase !== "playing",
  );
  useEffect(() => {
    const reduced = matchMedia("(prefers-reduced-motion: reduce)");
    const configure = () =>
      useGameStore
        .getState()
        .configure(reduced.matches);
    configure();
    useGameStore.getState().hydrateFound();
    // Pengaturan tersimpan menang; tanpa itu, perangkat lemah mulai dari preset Ringan.
    const settings = useSettings.getState();
    settings.hydrate();
    if (!useSettings.getState().stored && device.low) settings.applyPreset("low", false);
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
      aria-label="Workshop Omen, dunia 3D"
    >
      <div className="game-canvas">
        <Canvas
          shadows={{ type: PCFShadowMap }}
          dpr={Math.max(0.5, deviceDpr * resolution)}
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
              <Preload all />
              <SceneReady />
              <GameCamera />
              <SoundDriver />
              <FpsMeter />
            </Physics>
          </Suspense>
          <IntroCamera />
          <Effects />
        </Canvas>
      </div>
      <HUD />
      <SettingsPanel />
      <MapOverlay />
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

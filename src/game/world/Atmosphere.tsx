import { useMemo } from "react";
import { Environment, Lightformer, Sparkles } from "@react-three/drei";
import { Object3D } from "three";
import { useGameStore } from "@/store/gameStore";
import { FOG, PLOT, SUN_LIGHT } from "./environment";
import { SkyDome } from "./Sky";

/** Cahaya global sunset, fog, environment untuk pantulan, dan partikel debu/kunang. */
export function Atmosphere() {
  const quality = useGameStore((s) => s.quality);
  const reduced = useGameStore((s) => s.reducedMotion);
  const target = useMemo(() => {
    const o = new Object3D();
    o.position.set(PLOT.x, 0, PLOT.z);
    return o;
  }, []);
  const sun = SUN_LIGHT.clone().multiplyScalar(45).add(target.position);
  return (
    <>
      <fog attach="fog" args={[FOG, 34, 300]} />
      <SkyDome />
      <hemisphereLight args={["#b38cf0", "#6b3b2c", 0.95]} />
      <ambientLight color="#ffcfa8" intensity={0.12} />
      <primitive object={target} />
      <directionalLight
        position={sun.toArray()}
        target={target}
        color="#ffa45c"
        intensity={2.4}
        castShadow={quality !== "low"}
        shadow-mapSize={quality === "low" ? 512 : 2048}
        shadow-camera-left={-26}
        shadow-camera-right={26}
        shadow-camera-top={22}
        shadow-camera-bottom={-22}
        shadow-camera-near={5}
        shadow-camera-far={110}
        shadow-bias={-0.0006}
        shadow-normalBias={0.04}
      />
      {/* Isi hangat dari arah kamera: fasad yang membelakangi matahari tetap terbaca. */}
      <directionalLight position={[PLOT.x + 26, 16, PLOT.z + 34]} target={target} color="#ffc39a" intensity={1.1} />
      {/* Pantulan lantai basah/kaca diambil dari langit sunset + panel cahaya. */}
      <Environment resolution={128} frames={1} environmentIntensity={0.65}>
        <SkyDome follow={false} />
        <Lightformer form="rect" intensity={3} color="#ff8a3c" position={[0, 3, 10]} scale={[10, 0.6, 1]} />
        <Lightformer form="rect" intensity={2.5} color="#9b5cff" position={[-8, 2, -4]} rotation={[0, Math.PI / 2, 0]} scale={[8, 0.5, 1]} />
      </Environment>
      {quality !== "low" && !reduced && (
        <>
          <Sparkles count={70} scale={[30, 5, 22]} position={[PLOT.x, 2.5, PLOT.z + 3]} size={3.2} speed={0.25} opacity={0.85} color="#ffc27a" noise={1.2} />
          <Sparkles count={40} scale={[11, 3.4, 9]} position={[0, 1.9, 0]} size={1.6} speed={0.12} opacity={0.5} color="#ffe2c2" />
        </>
      )}
    </>
  );
}

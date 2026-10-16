import {
  Component,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  type ReactNode,
} from "react";
import { useAnimations, useGLTF } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import { clone } from "three/examples/jsm/utils/SkeletonUtils.js";
import { Box3, DoubleSide, Group, Mesh, SkinnedMesh, Vector3, type Material } from "three";
import { characterAsset, playerMotion } from "../config";
import { runtime } from "../runtime";
import { useGameStore } from "@/store/gameStore";
import { configureJumpAction, pauseCharacterAnimation, prepareCharacterClips } from "./animations";

function Placeholder() {
  const torso = useRef<Group>(null);
  const left = useRef<Group>(null);
  const right = useRef<Group>(null);
  useFrame(({ clock }) => {
    const swing =
      Math.sin(clock.elapsedTime * 9) * Math.min(runtime.speed * 0.1, 0.45);
    if (left.current) left.current.rotation.x = swing;
    if (right.current) right.current.rotation.x = -swing;
    if (torso.current) torso.current.rotation.z = runtime.speed < 0.15 && runtime.grounded ? Math.sin(clock.elapsedTime * 1.3) * 0.018 : 0;
  });
  return (
    <group ref={torso}>
      <mesh position={[0, 0.88, 0]} castShadow>
        <capsuleGeometry args={[0.24, 0.38, 4, 8]} />
        <meshStandardMaterial color="#343147" />
      </mesh>
      <mesh position={[0, 1.35, 0]} castShadow>
        <sphereGeometry args={[0.36, 8, 8]} />
        <meshStandardMaterial color="#594275" />
      </mesh>
      <mesh position={[0, 1.34, 0.3]}>
        <sphereGeometry args={[0.23, 8, 6]} />
        <meshStandardMaterial color="#131421" />
      </mesh>
      {[-0.09, 0, 0.09].map((x) => (
        <mesh key={x} position={[x, 1.34, 0.52]}>
          <boxGeometry args={[0.028, 0.13, 0.02]} />
          <meshStandardMaterial color="#86e5ec" emissive="#39bfcf" emissiveIntensity={1} />
        </mesh>
      ))}
      {[-1, 1].map((sign) => (
        <group
          key={sign}
          ref={sign === -1 ? left : right}
          position={[sign * 0.13, 0.6, 0]}
        >
          <mesh position={[0, -0.28, 0]} castShadow>
            <capsuleGeometry args={[0.105, 0.42, 4, 8]} />
            <meshStandardMaterial color="#292839" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

class ModelBoundary extends Component<
  { children: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? <Placeholder /> : this.props.children;
  }
}

function Model({ url }: { url: string }) {
  const gltf = useGLTF(url, false);
  const { scene, clips, scale, floor } = useMemo(() => {
    const scene = clone(gltf.scene);
    scene.traverse((object) => {
      if (object instanceof Mesh) {
        object.castShadow = true;
        object.receiveShadow = true;
        object.frustumCulled = false;
        // Jubah tipis tetap terlihat saat lipatannya menghadap balik.
        const twoSided = (source: Material) => {
          const material = source.clone();
          material.side = DoubleSide;
          return material;
        };
        object.material = Array.isArray(object.material)
          ? object.material.map(twoSided)
          : twoSided(object.material);
      }
    });
    // Perbarui skeleton sebelum menghitung bounds dan menormalkan tinggi.
    scene.updateMatrixWorld(true);
    scene.traverse((object) => {
      if (object instanceof SkinnedMesh) {
        object.skeleton.update();
        object.computeBoundingBox();
      }
    });
    const box = new Box3().setFromObject(scene, true);
    const height = box.getSize(new Vector3()).y;
    const scale = characterAsset.height / Math.max(height, 0.1);
    return {
      scene,
      clips: prepareCharacterClips(gltf.animations, scene, characterAsset.animations, characterAsset.jumpSegment),
      scale,
      floor: -box.min.y * scale,
    };
  }, [gltf]);
  const { actions, mixer } = useAnimations(clips, scene);
  const current = useRef("");
  const stationaryTime = useRef(0);
  useEffect(() => {
    const idle = actions[characterAsset.animations.idle];
    const jump = actions[characterAsset.animations.jump];
    if (jump) configureJumpAction(jump, 2 * playerMotion.jumpSpeed / Math.abs(playerMotion.gravity));
    idle?.reset().play();
    current.current = characterAsset.animations.idle;
    return () => {
      Object.values(actions).forEach((action) => action?.stop());
    };
  }, [actions]);
  // Perbarui state sebelum mixer/physics agar jump dimulai pada frame input.
  useFrame((_, delta) => {
    const state = useGameStore.getState();
    const paused = state.phase === "playing" && (!!state.section || state.menuOpen);
    pauseCharacterAnimation(mixer, paused);
    if (paused) return;
    stationaryTime.current = state.phase === "playing" && runtime.grounded && runtime.speed <= 0.15
      ? stationaryTime.current + delta
      : 0;
    const configured =
      !runtime.grounded
        ? characterAsset.animations.jump
        : runtime.speed > 4
        ? characterAsset.animations.run
        : runtime.speed > 0.15
          ? characterAsset.animations.walk
          : stationaryTime.current >= characterAsset.relaxAfterSeconds && actions[characterAsset.animations.relax]
            ? characterAsset.animations.relax
            : characterAsset.animations.idle;
    const desired = actions[configured] ? configured : characterAsset.animations.walk;
    if (desired !== current.current && actions[desired]) {
      actions[current.current]?.fadeOut(0.2);
      actions[desired]?.reset().fadeIn(0.2).play();
      current.current = desired;
    }
    const action = actions[current.current];
    if (current.current !== characterAsset.animations.jump) {
      action?.setEffectiveTimeScale(runtime.grounded && runtime.speed > 4 && !actions[characterAsset.animations.run] ? 1.7 : 1);
    }
  }, -1);
  return (
    <group
      position={[0, floor, 0]}
      scale={scale}
      rotation={[0, characterAsset.rotationY, 0]}
    >
      <primitive object={scene} dispose={null} />
    </group>
  );
}

export function Character() {
  return (
    <ModelBoundary>
      <Suspense fallback={<Placeholder />}>
        {characterAsset.url ? (
          <Model url={characterAsset.url} />
        ) : (
          <Placeholder />
        )}
      </Suspense>
    </ModelBoundary>
  );
}

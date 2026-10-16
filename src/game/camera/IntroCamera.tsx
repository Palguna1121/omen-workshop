import { useEffect, useMemo } from "react";
import { useThree } from "@react-three/fiber";
import { gsap } from "gsap";
import { PerspectiveCamera, Vector3 } from "three";
import { useGameStore } from "@/store/gameStore";

export const introShots = [
  {
    title: "Rumah untuk segala ide",
    label: "Exterior",
    position: [19, 8.6, 31],
    target: [-17, 3.2, -4],
    duration: 0,
  },
  {
    title: "Ada sesuatu di dalam",
    label: "Approach",
    position: [8.5, 3.6, 21],
    target: [-3, 2, 4],
    duration: 3.4,
  },
  {
    title: "Pintunya selalu terbuka",
    label: "Entrance",
    position: [1.6, 2.4, 14.5],
    target: [0, 1.7, 3],
    duration: 2.6,
  },
  {
    title: "Selamat datang di workshop",
    label: "Halaman",
    position: [0, 2.62, 12.95],
    target: [0, 1.5, 9.5],
    duration: 2.4,
  },
];

export function IntroCamera() {
  const { camera } = useThree();
  const phase = useGameStore((s) => s.phase);
  const target = useMemo(() => new Vector3(0, 1.2, 0), []);
  useEffect(() => {
    if (phase === "playing") return;
    if (camera instanceof PerspectiveCamera) {
      camera.setFocalLength(camera.getFilmHeight() / (2 * Math.tan(45 * Math.PI / 360)));
    }
    const [first] = introShots;
    camera.position.set(...(first.position as [number, number, number]));
    target.set(...(first.target as [number, number, number]));
    camera.lookAt(target);
    if (phase !== "intro") return;
    const timeline = gsap.timeline({
      onComplete: () => useGameStore.getState().finishIntro(),
    });
    timeline.to({}, { duration: 0.8 });
    introShots.slice(1).forEach((shot, index) => {
      const time = timeline.duration();
      timeline.call(
        () => useGameStore.getState().setIntroStep(index + 1),
        undefined,
        time,
      );
      timeline.to(
        camera.position,
        {
          x: shot.position[0],
          y: shot.position[1],
          z: shot.position[2],
          duration: shot.duration,
          ease: "power1.inOut",
          onUpdate: () => camera.lookAt(target),
        },
        time,
      );
      timeline.to(
        target,
        {
          x: shot.target[0],
          y: shot.target[1],
          z: shot.target[2],
          duration: shot.duration,
          ease: "power1.inOut",
        },
        time,
      );
    });
    return () => {
      timeline.kill();
    };
  }, [camera, phase, target]);
  return null;
}

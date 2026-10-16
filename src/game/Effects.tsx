import {
  Bloom,
  EffectComposer,
  N8AO,
  SMAA,
  ToneMapping,
  Vignette,
} from "@react-three/postprocessing";
import { ToneMappingMode } from "postprocessing";
import { useGameStore } from "@/store/gameStore";

/**
 * Bloom hanya menangkap material glow (nilai HDR > 1), lalu tone mapping ACES.
 * MSAA composer bentrok dengan mipmap bloom pada three r186 (layar kosong),
 * jadi anti-aliasing memakai SMAA. Ambient occlusion (N8AO) hanya di kualitas
 * "high": di iGPU Radeon 780M interior turun dari 60 ke ~51 fps.
 */
export function Effects() {
  const quality = useGameStore((s) => s.quality);
  if (quality === "low") return null;
  return (
    <EffectComposer multisampling={0} enableNormalPass={false}>
      {quality === "high" ? (
        <N8AO halfRes aoRadius={1.1} intensity={2.4} distanceFalloff={0.8} color="#1e0f2a" />
      ) : (
        <></>
      )}
      <Bloom
        mipmapBlur
        intensity={0.85}
        luminanceThreshold={1}
        luminanceSmoothing={0.3}
        radius={0.7}
      />
      <Vignette offset={0.32} darkness={0.55} />
      <ToneMapping mode={ToneMappingMode.ACES_FILMIC} />
      <SMAA />
    </EffectComposer>
  );
}

import { useEffect, useState } from "react";
import { useProgress } from "@react-three/drei";
import { useGameStore } from "@/store/gameStore";
import { useSettings } from "@/store/settingsStore";
import { crystals, spots } from "@/game/config";
import { introShots } from "@/game/camera/IntroCamera";
import { enableAudioFromGesture, muteAudio } from "@/game/audio/AudioHelper";
import { togglePointerLock } from "@/game/camera/pointerLock";
import { interact } from "@/game/interaction/actions";
import { fps } from "@/game/fps";
import { runtime } from "@/game/runtime";
import { Icon } from "./Icon";
import { MobileControls } from "./MobileControls";
import { MiniMap, areaName } from "./WorldMap";

/** Pesan singkat; animasi CSS memudarkannya sendiri (key baru = animasi ulang). */
function Toast() {
  const toast = useGameStore((s) => s.toast);
  if (!toast) return null;
  return (
    <div className="toast" role="status" key={toast.id}>
      {toast.text}
    </div>
  );
}

/** Kilat layar saat melewati portal. */
function Flash() {
  const flashAt = useGameStore((s) => s.flashAt);
  if (!flashAt) return null;
  return <div className="portal-flash" key={flashAt} aria-hidden="true" />;
}

/** Nilai yang dibaca berkala dari runtime/loop render tanpa rerender per frame. */
function usePolled<T>(read: () => T, interval: number) {
  const [value, setValue] = useState(read);
  useEffect(() => {
    const timer = window.setInterval(() => setValue(read()), interval);
    return () => window.clearInterval(timer);
  }, [read, interval]);
  return value;
}

const readArea = () => areaName(runtime.player.x, runtime.player.y, runtime.player.z);
const readFps = () => Math.round(fps.value);

function LocationWidget() {
  const area = usePolled(readArea, 300);
  const showFps = useSettings((s) => s.graphics.showFps);
  return (
    <div className="widget-tl">
      <div className="widget chip location">
        <Icon name="crystal" size={16} />
        <span>
          <small>Workshop Omen</small>
          {area}
        </span>
      </div>
      {showFps && <FpsChip />}
    </div>
  );
}

function FpsChip() {
  const value = usePolled(readFps, 500);
  return (
    <div className="widget chip fps" aria-label={`${value} frame per detik`}>
      {value} <small>FPS</small>
    </div>
  );
}

function CrystalCounter({ compact = false }: { compact?: boolean }) {
  const found = useGameStore((s) => s.found);
  return (
    <aside className={compact ? "crystal-counter compact" : "crystal-counter widget"} aria-label={`${found.length} dari ${crystals.length} kristal ditemukan`}>
      <Icon name="crystal" size={20} />
      <span className="crystal-count">
        {String(found.length).padStart(2, "0")}
        <small> / {String(crystals.length).padStart(2, "0")}</small>
      </span>
      <span className="crystal-label">
        Kristal
        <span className="crystal-dots">
          {crystals.map((c) => (
            <i key={c.id} className={found.includes(c.id) ? "seen" : ""} />
          ))}
        </span>
      </span>
    </aside>
  );
}

/** Tombol widget kanan atas: suara, peta, pengaturan. */
function TopActions({ playing }: { playing: boolean }) {
  const audio = useGameStore((s) => s.audioEnabled);
  const state = useGameStore.getState;
  return (
    <div className="widget-actions" role="toolbar" aria-label="Kontrol dunia">
      <button
        className="widget icon-widget"
        aria-pressed={audio}
        aria-label={audio ? "Matikan suara" : "Nyalakan suara"}
        data-tip={audio ? "Suara nyala" : "Suara mati"}
        onClick={() => void (audio ? muteAudio() : enableAudioFromGesture())}
      >
        <Icon name={audio ? "sound" : "mute"} size={19} />
      </button>
      {playing && (
        <button className="widget icon-widget" aria-label="Buka peta (Tab)" data-tip="Peta · Tab" onClick={() => state().toggleMap(true)}>
          <Icon name="map" size={19} />
        </button>
      )}
      {playing && (
        <button className="widget icon-widget lock-widget" aria-label="Kunci kursor (M atau Alt)" data-tip="Kunci kursor · M" onClick={() => void togglePointerLock()}>
          <Icon name="lock" size={19} />
        </button>
      )}
      <button className="widget icon-widget" aria-label="Buka pengaturan (Esc)" data-tip="Pengaturan · Esc" onClick={() => state().toggleMenu()}>
        <Icon name="sliders" size={19} />
      </button>
    </div>
  );
}

const keys = [
  ["WASD", "Jalan"],
  ["Shift", "Lari"],
  ["Space", "Lompat"],
  ["E", "Aksi"],
] as const;

export function HUD() {
  const { active: loadingAssets } = useProgress();
  const phase = useGameStore((s) => s.phase);
  const nearest = useGameStore((s) => s.nearest);
  const seated = useGameStore((s) => s.seated);
  const menuOpen = useGameStore((s) => s.menuOpen);
  const mapOpen = useGameStore((s) => s.mapOpen);
  const locked = useGameStore((s) => s.pointerLocked);
  const found = useGameStore((s) => s.found);
  const step = useGameStore((s) => s.introStep);
  if (phase === "loading" || (phase === "ready" && loadingAssets)) return null;
  const state = useGameStore.getState;
  const spot = spots.find((item) => item.id === nearest);
  const playing = phase === "playing" && !menuOpen && !mapOpen;
  const enter = () => {
    state().start();
    void enableAudioFromGesture({ respectMute: true });
  };
  return (
    <>
      {phase !== "playing" && (
        <div className="widget-tl">
          <div className="widget chip brand-chip">
            <Icon name="crystal" size={16} />
            <span>Workshop Omen</span>
          </div>
        </div>
      )}
      {phase === "playing" && <LocationWidget />}
      <div className="widget-tr">
        <TopActions playing={phase === "playing"} />
        {phase === "playing" && (
          <>
            <CrystalCounter />
            <div className="minimap-slot">
              <MiniMap />
            </div>
          </>
        )}
      </div>
      {phase === "ready" && (
        <>
          <section className="hero" aria-labelledby="hero-title">
            <span className="hero-chip">
              <i className="status-dot" /> Senja di bukit · eksplorasi bebas
            </span>
            <h1 id="hero-title">
              Workshop <em>Omen</em>
            </h1>
            <p>
              Rumah, garasi, dan halaman Omen terbuka untuk dijelajahi. Duduk di
              sofa, nyalakan radio, lewati portal, dan cari kristal yang
              tersembunyi.
            </p>
            <div className="hero-actions">
              <button className="cta" onClick={enter}>
                Masuk <Icon name="arrow" />
              </button>
              <span className="hero-note">Suara ikut menyala saat masuk</span>
            </div>
            <ul className="hero-keys" aria-label="Kontrol">
              {keys.map(([key, label]) => (
                <li key={key}>
                  <kbd>{key}</kbd> {label}
                </li>
              ))}
              <li>
                <kbd>M</kbd> Kunci kursor
              </li>
              <li>
                <kbd>Tab</kbd> Peta
              </li>
            </ul>
          </section>
          <div className="hero-progress">
            <CrystalCounter compact />
          </div>
        </>
      )}
      {phase === "intro" && (
        <>
          <div className="cinematic-top" />
          <div className="cinematic-bottom" />
          <div className="intro-caption">
            <span className="eyebrow">0{step + 1} / 04</span>
            <h2>{introShots[step].title}</h2>
            <div className="intro-steps">
              {introShots.map((shot, i) => (
                <span key={shot.label} className={i <= step ? "active" : ""} />
              ))}
            </div>
          </div>
          <button className="skip-intro" onClick={() => state().finishIntro()}>
            Lewati intro <span>→</span>
          </button>
        </>
      )}
      {playing && (
        <>
          {locked && (
            <>
              <div className="crosshair" aria-hidden="true" />
              <div className="lock-hint">
                <kbd>M</kbd> / <kbd>Alt</kbd> lepas kursor
              </div>
            </>
          )}
          <Toast />
          <div className="interaction-prompt" aria-live="polite">
            {seated ? (
              <button onClick={() => interact(null)}>
                <kbd>E</kbd>
                <span>
                  <small>Atau gerak / lompat</small>
                  Berdiri
                </span>
                <Icon name="arrow" />
              </button>
            ) : spot ? (
              <button onClick={() => interact(spot.id)} style={{ ["--marker" as string]: spot.color }}>
                <kbd>E</kbd>
                <span>
                  <small>{spot.object}</small>
                  {spot.verb}
                </span>
                <Icon name={spot.icon} />
              </button>
            ) : (
              <span className="explore-hint">
                {found.length === crystals.length
                  ? "Semua kristal ditemukan. Nikmati senjanya."
                  : "Dekati benda bercahaya, atau cari kilau kristal ungu."}
              </span>
            )}
          </div>
          <div className="controls-guide">
            {keys.map(([key, label]) => (
              <span key={key}>
                <kbd>{key}</kbd> {label}
              </span>
            ))}
            <span>
              <kbd>M</kbd> Kursor
            </span>
            <span>
              <kbd>Tab</kbd> Peta
            </span>
            <span>
              <kbd>Esc</kbd> Pengaturan
            </span>
          </div>
          <MobileControls />
        </>
      )}
      <Flash />
    </>
  );
}

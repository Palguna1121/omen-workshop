import Link from "next/link";
import { useGameStore, type Quality } from "@/store/gameStore";
import { stations } from "@/game/config";
import { introShots } from "@/game/camera/IntroCamera";
import { enableAudioFromGesture } from "@/game/audio/AudioHelper";
import { Icon, type IconName } from "./Icon";
import { Dialog } from "./Dialog";
import { useProgress } from "@react-three/drei";
import { MobileControls } from "./MobileControls";

export function HUD() {
  const { active: loadingAssets } = useProgress();
  const phase = useGameStore((s) => s.phase);
  const nearest = useGameStore((s) => s.nearest);
  const section = useGameStore((s) => s.section);
  const menuOpen = useGameStore((s) => s.menuOpen);
  const audio = useGameStore((s) => s.audioEnabled);
  const visited = useGameStore((s) => s.visited);
  const step = useGameStore((s) => s.introStep);
  const quality = useGameStore((s) => s.quality);
  if (phase === "loading" || (phase === "ready" && loadingAssets)) return null;
  const state = useGameStore.getState;
  const station = stations.find((item) => item.id === nearest);
  return (
    <>
      <header className="game-header">
        <Link className="brand" href="/" aria-label="Omen Workshop, beranda">
          <span className="brand-mark">O.</span>
          <span>
            Omen<span className="brand-subtitle">WORKSHOP / PALGUNA</span>
          </span>
        </Link>
        <nav aria-label="Navigasi utama" className="header-actions">
          <Link className="portfolio-link" href="/portfolio">
            Portfolio <span>↗</span>
          </Link>
          <button
            className="icon-button"
            aria-label={audio ? "Matikan suara" : "Aktifkan suara"}
            aria-pressed={audio}
            onClick={() =>
              audio ? state().setAudio(false) : void enableAudioFromGesture()
            }
          >
            <Icon name={audio ? "sound" : "mute"} />
          </button>
          {phase === "playing" && (
            <button
              className="icon-button"
              aria-label="Buka menu workshop"
              onClick={() => state().toggleMenu()}
            >
              <Icon name="menu" />
            </button>
          )}
        </nav>
      </header>
      {phase === "ready" && (
        <>
          <div className="welcome-copy">
            <span className="eyebrow">
              <i className="status-dot" /> Ruang digital pribadi
            </span>
            <h1>
              Ide punya
              <br />
              tempat untuk
              <br /> <em>tumbuh.</em>
            </h1>
            <p>
              Jelajahi garage-lab bersama Omen. Temukan proyek,
              <br className="desktop-break" /> cerita, dan hal-hal yang sedang
              saya bangun.
            </p>
            <button
              className="button button-dark"
              onClick={() => state().start()}
            >
              Masuk workshop <Icon name="arrow" />
            </button>
            <span className="welcome-footnote">
              Sebuah portfolio yang bisa kamu jelajahi.
            </span>
          </div>
          <div className="scene-caption">
            <span className="caption-line" />
            <div>
              <span className="eyebrow">01 / TEMPAT SEGALA IDE</span>
              <span>Rumah kecil. Rasa ingin tahu besar.</span>
            </div>
          </div>
          <footer className="welcome-footer">
            <span>Dirancang untuk dijelajahi.</span>
            <span>
              WASD untuk bergerak <span className="footer-dot">·</span> Mouse
              untuk melihat
            </span>
            <span>© Palguna</span>
          </footer>
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
      {phase === "playing" && !section && !menuOpen && (
        <>
          <div className="hub-label">
            <span className="eyebrow">
              <i className="status-dot" /> OMEN / GARAGE-LAB
            </span>
            <h2>Ikuti rasa ingin tahumu.</h2>
          </div>
          <aside
            className="discovery"
            aria-label={`${visited.length} dari 6 sudut dijelajahi`}
          >
            <span>
              {String(visited.length).padStart(2, "0")}
              <small> / 06</small>
            </span>
            <div>
              Sudut dijelajahi
              <div className="discovery-dots">
                {stations.map((s) => (
                  <i
                    key={s.id}
                    className={visited.includes(s.id) ? "seen" : ""}
                  />
                ))}
              </div>
            </div>
          </aside>
          <div className="interaction-prompt" aria-live="polite">
            {station ? (
              <button onClick={() => state().openSection(station.id)}>
                <kbd>E</kbd>
                <span>
                  <small>{station.object}</small>
                  {station.title}
                </span>
                <Icon name="arrow" />
              </button>
            ) : (
              <span className="explore-hint">
                Dekati objek untuk menemukan ceritanya.
              </span>
            )}
          </div>
          <div className="controls-guide">
            <span>
              <kbd>W</kbd>
              <kbd>A</kbd>
              <kbd>S</kbd>
              <kbd>D</kbd> Bergerak
            </span>
            <span>
              <kbd>⇧</kbd> Berlari
            </span>
            <span>
              <kbd>Space</kbd> Lompat
            </span>
            <span>Drag mouse · Kamera</span>
            <span>
              <kbd>Esc</kbd> Menu
            </span>
          </div>
          <MobileControls />
        </>
      )}
      {menuOpen && (
        <Dialog
          title="Ke mana selanjutnya?"
          subtitle="Peta workshop"
          onClose={() => state().toggleMenu()}
        >
          <div className="menu-grid">
            {stations.map((station) => (
              <button
                key={station.id}
                onClick={() => state().openSection(station.id)}
              >
                <Icon
                  name={
                    (station.id === "skills" ? "code" : station.id) as IconName
                  }
                />
                <span>
                  <strong>{station.title}</strong>
                  <small>{station.object}</small>
                </span>
                <span>↗</span>
              </button>
            ))}
          </div>
          <div className="menu-settings">
            <label>
              Detail dunia
              <select
                aria-label="Detail dunia"
                value={quality}
                onChange={(event) =>
                  state().configure(
                    event.target.value as Quality,
                    state().reducedMotion,
                  )
                }
              >
                <option value="low">Ringan</option>
                <option value="medium">Standar</option>
                <option value="high">Tinggi (AO)</option>
              </select>
            </label>
            <button
              className="quiet-link"
              onClick={() => state().replayIntro()}
            >
              Putar intro lagi <span>↻</span>
            </button>
            <Link className="quiet-link" href="/portfolio">
              Baca portfolio <span>↗</span>
            </Link>
          </div>
        </Dialog>
      )}
    </>
  );
}

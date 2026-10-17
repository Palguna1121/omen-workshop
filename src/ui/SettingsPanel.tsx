import { useState } from "react";
import { useGameStore } from "@/store/gameStore";
import { useSettings, type Preset } from "@/store/settingsStore";
import { crystals } from "@/game/config";
import { enableAudioFromGesture, muteAudio } from "@/game/audio/AudioHelper";
import { sfx } from "@/game/audio/sound";
import { Segmented, Slider, Switch } from "./Controls";
import { Dialog } from "./Dialog";
import { Icon } from "./Icon";

const tabs = [
  { id: "graphics", label: "Grafis" },
  { id: "audio", label: "Suara" },
  { id: "controls", label: "Kontrol" },
  { id: "crystals", label: "Kristal" },
] as const;
type Tab = (typeof tabs)[number]["id"];

const percent = (value: number) => `${Math.round(value * 100)}%`;

function GraphicsTab() {
  const g = useSettings((s) => s.graphics);
  const { applyPreset, setGraphics } = useSettings.getState();
  return (
    <div className="settings-group">
      <Segmented<Preset>
        label="Preset kualitas"
        value={g.preset}
        options={[
          { value: "low", label: "Ringan" },
          { value: "medium", label: "Standar" },
          { value: "high", label: "Tinggi" },
        ]}
        onChange={(preset) => applyPreset(preset)}
      />
      {g.preset === "custom" && <p className="settings-note">Kustom: ada opsi yang diubah manual. Pilih preset untuk mengembalikan.</p>}
      <Slider
        label="Resolusi render"
        value={g.resolution}
        min={0.5}
        max={1}
        step={0.05}
        format={percent}
        onChange={(resolution) => setGraphics({ resolution })}
      />
      <Switch label="Bloom" hint="Cahaya lentera & neon berpendar" checked={g.bloom} onChange={(bloom) => setGraphics({ bloom })} />
      <Switch label="Bayangan matahari" checked={g.shadows} onChange={(shadows) => setGraphics({ shadows })} />
      <Switch label="Ambient occlusion" hint="Bayangan kontak; paling berat" checked={g.ao} onChange={(ao) => setGraphics({ ao })} />
      <Switch label="Partikel & debu" checked={g.particles} onChange={(particles) => setGraphics({ particles })} />
      <Switch label="Lampu tambahan" hint="Lentera kecil & lampu dekor" checked={g.extraLights} onChange={(extraLights) => setGraphics({ extraLights })} />
      <Switch label="Tampilkan FPS" checked={g.showFps} onChange={(showFps) => setGraphics({ showFps })} />
    </div>
  );
}

function AudioTab() {
  const audio = useSettings((s) => s.audio);
  const enabled = useGameStore((s) => s.audioEnabled);
  const { setAudio } = useSettings.getState();
  return (
    <div className="settings-group">
      <Switch
        label="Suara"
        hint="Ambient, langkah, radio, efek"
        checked={enabled}
        onChange={(on) => void (on ? enableAudioFromGesture() : muteAudio())}
      />
      <Slider label="Volume utama" value={audio.master} min={0} max={1} step={0.05} format={percent} onChange={(master) => setAudio({ master })} />
      <Slider label="Ambient senja" value={audio.ambient} min={0} max={1} step={0.05} format={percent} onChange={(ambient) => setAudio({ ambient })} />
      <Slider label="Musik radio" value={audio.music} min={0} max={1} step={0.05} format={percent} onChange={(music) => setAudio({ music })} />
      <Slider label="Efek" value={audio.effects} min={0} max={1} step={0.05} format={percent} onChange={(effects) => setAudio({ effects })} />
      <div className="setting-row">
        <span className="setting-label">Uji suara</span>
        <button type="button" className="pill-button" onClick={() => sfx("crystal")} disabled={!enabled}>
          Mainkan bunyi kristal
        </button>
      </div>
    </div>
  );
}

const bindings = [
  ["W A S D", "Jalan"],
  ["Shift", "Lari"],
  ["Space", "Lompat"],
  ["E", "Aksi / berdiri"],
  ["M atau Alt", "Kunci / lepas kursor"],
  ["Tab", "Peta"],
  ["Esc", "Pengaturan"],
] as const;

function ControlsTab() {
  const controls = useSettings((s) => s.controls);
  const reduced = useGameStore((s) => s.reducedMotion);
  const { setControls } = useSettings.getState();
  return (
    <div className="settings-group">
      <Slider
        label="Sensitivitas kamera"
        value={controls.sensitivity}
        min={0.3}
        max={2.5}
        step={0.1}
        format={(v) => `${v.toFixed(1)}×`}
        onChange={(sensitivity) => setControls({ sensitivity })}
      />
      <Switch label="Balik sumbu Y" checked={controls.invertY} onChange={(invertY) => setControls({ invertY })} />
      <Switch
        label="Kurangi gerakan"
        hint="Bekukan awan, laut, angin, dan animasi dekor"
        checked={reduced}
        onChange={(value) => useGameStore.getState().configure(value)}
      />
      <ul className="keybinds" aria-label="Tombol">
        {bindings.map(([key, action]) => (
          <li key={key}>
            <kbd>{key}</kbd>
            <span>{action}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function CrystalsTab() {
  const found = useGameStore((s) => s.found);
  const state = useGameStore.getState;
  return (
    <div className="settings-group">
      <div className="menu-crystals">
        <h3>
          Kristal {found.length} / {crystals.length}
        </h3>
        <ul>
          {crystals.map((c) => (
            <li key={c.id} className={found.includes(c.id) ? "seen" : ""}>
              <Icon name="crystal" size={16} />
              {found.includes(c.id) ? c.hint : "Belum ditemukan"}
            </li>
          ))}
        </ul>
      </div>
      <div className="settings-actions">
        <button type="button" className="pill-button" onClick={() => state().replayIntro()}>
          Putar intro lagi
        </button>
        <button type="button" className="pill-button" onClick={() => state().resetCrystals()}>
          Sembunyikan kristal lagi
        </button>
        <button type="button" className="pill-button ghost" onClick={() => useSettings.getState().reset()}>
          Reset pengaturan
        </button>
      </div>
    </div>
  );
}

/** Panel pengaturan (Esc / tombol pengaturan); kontrol kustom tanpa elemen form bawaan browser. */
export function SettingsPanel() {
  const open = useGameStore((s) => s.menuOpen);
  const [tab, setTab] = useState<Tab>("graphics");
  if (!open) return null;
  return (
    <Dialog title="Pengaturan" subtitle="Workshop Omen" onClose={() => useGameStore.getState().toggleMenu()}>
      <div className="tabs" role="tablist" aria-label="Kategori pengaturan">
        {tabs.map((item) => (
          <button
            key={item.id}
            type="button"
            role="tab"
            id={`tab-${item.id}`}
            aria-selected={tab === item.id}
            aria-controls={`panel-${item.id}`}
            className={tab === item.id ? "active" : ""}
            onClick={() => setTab(item.id)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
        {tab === "graphics" && <GraphicsTab />}
        {tab === "audio" && <AudioTab />}
        {tab === "controls" && <ControlsTab />}
        {tab === "crystals" && <CrystalsTab />}
      </div>
    </Dialog>
  );
}


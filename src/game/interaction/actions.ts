import { useGameStore } from "@/store/gameStore";
import { spots, type SpotId } from "../config";
import { sfx } from "../audio/sound";
import { runtime } from "../runtime";

const knockLines = [
  "Tok tok… tidak ada jawaban.",
  "Ada yang mengintip dari jendela atas?",
  "Sepertinya penghuninya pemalu.",
];

/** Bangun dari kursi/sofa; dipanggil saat bergerak, lompat, E, atau Esc. */
export function standUp() {
  if (!runtime.pose && !useGameStore.getState().seated) return;
  runtime.pose = null;
  useGameStore.getState().setSeated(null);
  sfx("click");
}

/** Jalankan aksi spot. Satu pintu masuk untuk keyboard, tombol HTML, dan sentuh. */
export function interact(id: SpotId | null) {
  const state = useGameStore.getState();
  if (state.phase !== "playing" || state.menuOpen) return;
  if (state.seated) {
    standUp();
    return;
  }
  const spot = spots.find((item) => item.id === id);
  if (!spot) return;
  switch (spot.kind) {
    case "sit":
      runtime.pose = { position: spot.seat!.position, rotationY: spot.seat!.rotationY };
      state.setSeated(spot.id);
      sfx("sit");
      if (spot.id === "desk" && !state.toggles.pc) {
        state.toggle("pc", true);
        sfx("boot");
      }
      state.say(spot.id === "desk" ? "Layar menyala. Gerak untuk berdiri." : "Nyaman sekali. Gerak untuk berdiri.");
      break;
    case "toggle": {
      const key = spot.id === "radio" ? "radio" : "workbench";
      const on = !state.toggles[key];
      state.toggle(key, on);
      sfx(on && key === "workbench" ? "workbench" : "click");
      if (key === "radio")
        state.say(
          on
            ? state.audioEnabled
              ? "Radio memutar lo-fi senja."
              : "Radio menyala. Aktifkan suara untuk mendengarnya."
            : "Radio dimatikan.",
        );
      else state.say(on ? "Workbench berdengung hidup." : "Workbench beristirahat.");
      break;
    }
    case "pulse":
      state.rev();
      sfx("rev");
      break;
    case "teleport":
      runtime.teleport = { position: spot.destination!.position, yaw: spot.destination!.yaw };
      state.flash();
      sfx("teleport");
      break;
    case "knock": {
      const count = state.knock();
      sfx("knock");
      state.say(knockLines[Math.min(count - 1, knockLines.length - 1)]);
      break;
    }
  }
}

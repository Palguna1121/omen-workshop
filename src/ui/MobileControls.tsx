import { useRef, useState, type PointerEvent } from "react";
import { requestJump, runtime } from "@/game/runtime";
import { useGameStore } from "@/store/gameStore";
import { interact } from "@/game/interaction/actions";

export function MobileControls() {
  const pointer = useRef<number | null>(null);
  const [thumb, setThumb] = useState({ x: 0, y: 0 });
  const nearest = useGameStore((s) => s.nearest);
  const seated = useGameStore((s) => s.seated);
  const move = (event: PointerEvent<HTMLDivElement>) => {
    if (pointer.current !== event.pointerId) return;
    const rect = event.currentTarget.getBoundingClientRect();
    let x = event.clientX - rect.x - rect.width / 2;
    let y = event.clientY - rect.y - rect.height / 2;
    const distance = Math.hypot(x, y);
    if (distance > 32) {
      x *= 32 / distance;
      y *= 32 / distance;
    }
    runtime.mobile.x = x / 32;
    runtime.mobile.y = y / 32;
    setThumb({ x, y });
  };
  const reset = () => {
    pointer.current = null;
    runtime.mobile.x = runtime.mobile.y = 0;
    setThumb({ x: 0, y: 0 });
  };
  return (
    <div className="mobile-controls">
      <div
        className="joystick"
        role="group"
        aria-label="Joystick gerak; alternatif keyboard WASD"
        onPointerDown={(event) => {
          pointer.current = event.pointerId;
          event.currentTarget.setPointerCapture(event.pointerId);
          move(event);
        }}
        onPointerMove={move}
        onPointerUp={reset}
        onPointerCancel={reset}
        onLostPointerCapture={reset}
      >
        <span style={{ transform: `translate(${thumb.x}px, ${thumb.y}px)` }} />
      </div>
      <button className="touch-jump" onClick={requestJump}>
        Lompat <span aria-hidden="true">↑</span>
      </button>
      {(nearest || seated) && (
        <button className="touch-interact" onClick={() => interact(nearest)}>
          {seated ? "Berdiri" : "Aksi"} <span aria-hidden="true">✦</span>
        </button>
      )}
      <span className="touch-camera-hint">Geser layar untuk melihat</span>
    </div>
  );
}

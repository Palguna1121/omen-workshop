import { useRef, type KeyboardEvent, type PointerEvent } from "react";

/** Pilihan segmen (radiogroup) dengan navigasi panah. */
export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T | "custom";
  options: { value: T; label: string }[];
  onChange: (value: T) => void;
}) {
  const keyNav = (event: KeyboardEvent<HTMLDivElement>) => {
    const index = options.findIndex((o) => o.value === value);
    const step = event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : event.key === "ArrowLeft" || event.key === "ArrowUp" ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const next = options[(Math.max(index, 0) + step + options.length) % options.length];
    onChange(next.value);
    (event.currentTarget.querySelector(`[data-value="${next.value}"]`) as HTMLElement | null)?.focus();
  };
  return (
    <div className="setting-row">
      <span className="setting-label">{label}</span>
      <div className="segmented" role="radiogroup" aria-label={label} onKeyDown={keyNav}>
        {options.map((option) => {
          const checked = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              role="radio"
              aria-checked={checked}
              data-value={option.value}
              tabIndex={checked || (value === "custom" && option === options[0]) ? 0 : -1}
              className={checked ? "active" : ""}
              onClick={() => onChange(option.value)}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/** Saklar on/off (role switch). */
export function Switch({
  label,
  hint,
  checked,
  onChange,
}: {
  label: string;
  hint?: string;
  checked: boolean;
  onChange: (value: boolean) => void;
}) {
  return (
    <div className="setting-row">
      <span className="setting-label">
        {label}
        {hint && <small>{hint}</small>}
      </span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        aria-label={label}
        className={checked ? "switch on" : "switch"}
        onClick={() => onChange(!checked)}
      >
        <span />
      </button>
    </div>
  );
}

/** Slider kustom (role slider): drag pointer, panah, PageUp/Down, Home/End. */
export function Slider({
  label,
  value,
  min,
  max,
  step,
  format,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (value: number) => string;
  onChange: (value: number) => void;
}) {
  const track = useRef<HTMLDivElement>(null);
  const snap = (raw: number) => {
    const stepped = Math.round((raw - min) / step) * step + min;
    return Math.min(max, Math.max(min, Number(stepped.toFixed(4))));
  };
  const fromPointer = (event: PointerEvent<HTMLDivElement>) => {
    const rect = track.current?.getBoundingClientRect();
    if (!rect) return;
    onChange(snap(min + ((event.clientX - rect.left) / rect.width) * (max - min)));
  };
  const keys = (event: KeyboardEvent<HTMLDivElement>) => {
    const big = (max - min) / 10;
    const next =
      event.key === "ArrowRight" || event.key === "ArrowUp" ? value + step
      : event.key === "ArrowLeft" || event.key === "ArrowDown" ? value - step
      : event.key === "PageUp" ? value + big
      : event.key === "PageDown" ? value - big
      : event.key === "Home" ? min
      : event.key === "End" ? max
      : null;
    if (next === null) return;
    event.preventDefault();
    onChange(snap(next));
  };
  const percent = ((value - min) / (max - min)) * 100;
  return (
    <div className="setting-row slider-row">
      <span className="setting-label">{label}</span>
      <div className="slider-wrap">
        <div
          ref={track}
          className="slider"
          role="slider"
          tabIndex={0}
          aria-label={label}
          aria-valuemin={min}
          aria-valuemax={max}
          aria-valuenow={value}
          aria-valuetext={format(value)}
          onKeyDown={keys}
          onPointerDown={(event) => {
            event.currentTarget.setPointerCapture(event.pointerId);
            fromPointer(event);
          }}
          onPointerMove={(event) => {
            if (event.currentTarget.hasPointerCapture(event.pointerId)) fromPointer(event);
          }}
        >
          <span className="slider-fill" style={{ width: `${percent}%` }} />
          <span className="slider-thumb" style={{ left: `${percent}%` }} />
        </div>
        <output className="slider-value">{format(value)}</output>
      </div>
    </div>
  );
}

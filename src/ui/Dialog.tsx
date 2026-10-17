import { useEffect, useRef, type ReactNode } from "react";
import { Icon } from "./Icon";

export function Dialog({
  children,
  title,
  subtitle,
  onClose,
  wide = false,
}: {
  children: ReactNode;
  title: string;
  subtitle?: string;
  onClose: () => void;
  wide?: boolean;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  const close = useRef(onClose);
  useEffect(() => {
    close.current = onClose;
  }, [onClose]);
  useEffect(() => {
    const dialog = ref.current;
    const previous = document.activeElement as HTMLElement | null;
    dialog?.showModal();
    return () => {
      dialog?.close();
      previous?.focus();
    };
  }, []);
  return (
    <dialog
      ref={ref}
      className={wide ? "world-dialog wide" : "world-dialog"}
      aria-labelledby="panel-title"
      onCancel={(event) => {
        event.preventDefault();
        close.current();
      }}
      onClick={(event) => {
        if (event.target === ref.current) close.current();
      }}
    >
      <div className="dialog-inner">
        <header className="dialog-header">
          <div>
            <span className="eyebrow">
              {subtitle ?? "Catatan dari workshop"}
            </span>
            <h2 id="panel-title">{title}</h2>
          </div>
          <button
            className="icon-button"
            onClick={onClose}
            aria-label="Tutup panel"
          >
            <Icon name="close" />
          </button>
        </header>
        {children}
      </div>
    </dialog>
  );
}

import { useEffect, useRef, type ReactNode } from "react";

const storageKey = "takko-agent-width";
export function panelLimits(width: number) {
  return { min: 320, max: Math.max(320, Math.min(640, width - 380 - 12)) };
}

/** Direct manipulation updates only the grid, not every React child per frame. */
export function WorkspaceSplit({
  canvas,
  children,
}: {
  canvas: ReactNode;
  children: ReactNode;
}) {
  const root = useRef<HTMLDivElement>(null);
  const divider = useRef<HTMLDivElement>(null);
  const current = useRef(400);
  const preferred = useRef(400);
  const edited = useRef(false);
  const persistence = useRef(Promise.resolve());
  const limits = useRef({ min: 320, max: 640 });
  const drag = useRef<{ x: number; width: number } | null>(null);
  function resize(width: number, persist = false) {
    current.current = Math.round(
      Math.max(limits.current.min, Math.min(limits.current.max, width)),
    );
    root.current?.style.setProperty("--agent-width", `${current.current}px`);
    divider.current?.setAttribute("aria-valuenow", String(current.current));
    divider.current?.setAttribute(
      "aria-valuetext",
      `${current.current} pixels wide`,
    );
    if (persist) {
      edited.current = true;
      preferred.current = current.current;
      try {
        localStorage.setItem(storageKey, String(current.current));
      } catch {
        /* Storage may be disabled. */
      }
      const agentWidth = current.current;
      persistence.current = persistence.current.then(async () => {
        // Desktop owns a new localhost port each launch. Save to its workspace too.
        try {
          await fetch("/api/ui-preferences", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ agentWidth }),
          });
        } catch {
          /* Local storage remains a fallback on older servers. */
        }
      });
    }
  }
  function finish() {
    if (!drag.current) return;
    drag.current = null;
    root.current?.classList.remove("is-resizing");
    resize(current.current, true);
  }
  useEffect(() => {
    let active = true;
    try {
      const stored = Number(localStorage.getItem(storageKey));
      if (Number.isFinite(stored) && stored >= 320) preferred.current = stored;
    } catch {
      /* Use the default. */
    }
    const observer = new ResizeObserver(([entry]) => {
      limits.current = panelLimits(entry.contentRect.width);
      divider.current?.setAttribute(
        "aria-valuemax",
        String(limits.current.max),
      );
      resize(preferred.current);
    });
    observer.observe(root.current!);
    void fetch("/api/ui-preferences")
      .then((r) => (r.ok ? r.json() : null))
      .then((value) => {
        if (
          active &&
          !edited.current &&
          Number.isInteger(value?.agentWidth) &&
          value.agentWidth >= 320 &&
          value.agentWidth <= 640
        ) {
          preferred.current = value.agentWidth;
          resize(value.agentWidth);
        }
      })
      .catch(() => {});
    return () => {
      active = false;
      observer.disconnect();
    };
  }, []);
  return (
    <div
      ref={root}
      className="workspace integrated-workspace resizable-workspace"
    >
      {canvas}
      <div
        ref={divider}
        className="workspace-divider"
        role="separator"
        tabIndex={0}
        aria-label="Resize Takko panel"
        aria-orientation="vertical"
        aria-controls="takko-agent-panel"
        aria-valuemin={320}
        aria-valuemax={640}
        aria-valuenow={400}
        title="Drag to resize · Arrow keys to adjust · Double-click to reset"
        onDoubleClick={() => resize(400, true)}
        onKeyDown={(e) => {
          const step = e.shiftKey ? 48 : 16;
          const next =
            e.key === "ArrowLeft"
              ? current.current + step
              : e.key === "ArrowRight"
                ? current.current - step
                : e.key === "Home"
                  ? limits.current.min
                  : e.key === "End"
                    ? limits.current.max
                    : null;
          if (next !== null) {
            e.preventDefault();
            resize(next, true);
          }
        }}
        onPointerDown={(e) => {
          if (e.button !== 0) return;
          e.preventDefault();
          e.currentTarget.focus();
          e.currentTarget.setPointerCapture(e.pointerId);
          drag.current = { x: e.clientX, width: current.current };
          root.current?.classList.add("is-resizing");
        }}
        onPointerMove={(e) => {
          if (drag.current)
            resize(drag.current.width + drag.current.x - e.clientX);
        }}
        onPointerUp={finish}
        onPointerCancel={finish}
        onLostPointerCapture={finish}
      />
      {children}
    </div>
  );
}

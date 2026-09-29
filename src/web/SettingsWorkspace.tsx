import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import type { Profile, Project, Settings } from "../generation/schema";
import { Icon } from "./Icons";

export type SettingsPage = "models" | "presets" | "routing" | "budget";
export type PublicSettings = Omit<Settings, "profiles"> & {
  profiles: (Profile & { hasKey?: boolean })[];
  credentialStorage?: "windows-encrypted" | "session";
  connections?: {
    provider: Profile["provider"];
    baseUrl: string;
    hasKey: boolean;
    validated: boolean;
  }[];
};
export async function settingsApi<T>(
  path: string,
  method = "GET",
  body?: unknown,
): Promise<T> {
  const response = await fetch("/api" + path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const value = await response.json();
  if (!response.ok) throw Error(value.error ?? "Could not save settings");
  return value;
}
const usd = (n: number) => "$" + (n / 1e6).toFixed(2);
let modalLocks = 0;
let bodyOverflow = "";

export function SettingsDialog({
  title,
  description,
  close,
  dirty = false,
  busy = false,
  drawer = false,
  closeLabel = "Close dialog",
  modal = true,
  scrollBody = false,
  footer,
  children,
}: {
  title: string;
  description?: string;
  close: () => void;
  dirty?: boolean;
  busy?: boolean;
  drawer?: boolean;
  closeLabel?: string;
  modal?: boolean;
  scrollBody?: boolean;
  footer?: ReactNode;
  children: ReactNode;
}) {
  const dialog = useRef<HTMLDialogElement>(null);
  const [discard, setDiscard] = useState(false);
  const requestClose = () => {
    if (!busy) dirty ? setDiscard(true) : close();
  };
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    if (modal) dialog.current?.showModal();
    else dialog.current?.show();
    if (modal && modalLocks++ === 0) {
      bodyOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";
    }
    return () => {
      if (modal && --modalLocks === 0)
        document.body.style.overflow = bodyOverflow;
      previous?.isConnected && previous.focus({ preventScroll: true });
    };
  }, []);
  return createPortal(
    <dialog
      ref={dialog}
      className={"focused-dialog" + (drawer ? " route-drawer" : "")}
      data-modal={modal}
      data-scroll-body={scrollBody}
      aria-label={title}
      onKeyDown={(event) => {
        if (!modal || event.key !== "Tab") return;
        const items = Array.from(
          event.currentTarget.querySelectorAll<HTMLElement>(
            "button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),summary,a[href]",
          ),
        ).filter(
          (element) =>
            !element.matches(":disabled") &&
            element.getClientRects().length > 0,
        );
        const first = items[0],
          last = items.at(-1);
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }}
      onCancel={(event) => {
        event.preventDefault();
        requestClose();
      }}
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          const bounds = event.currentTarget.getBoundingClientRect();
          if (
            event.clientX < bounds.left ||
            event.clientX > bounds.right ||
            event.clientY < bounds.top ||
            event.clientY > bounds.bottom
          )
            requestClose();
        }
      }}
    >
      <header>
        <div>
          <h2>{title}</h2>
          {description && <p className="muted">{description}</p>}
        </div>
        <button
          type="button"
          aria-label={closeLabel}
          disabled={busy}
          onClick={requestClose}
        >
          <Icon name="close" />
        </button>
      </header>
      {discard ? (
        <div className="dialog-body">
          <h3>Discard unsaved changes?</h3>
          <p>Your saved settings will stay as they are.</p>
          <div className="dialog-actions">
            <button autoFocus type="button" onClick={() => setDiscard(false)}>
              Keep editing
            </button>
            <button type="button" className="primary" onClick={close}>
              Discard changes
            </button>
          </div>
        </div>
      ) : scrollBody ? (
        <div className="dialog-body">{children}</div>
      ) : (
        children
      )}
      {!discard && footer && (
        <footer className="dialog-actions">{footer}</footer>
      )}
    </dialog>,
    document.querySelector(".app") ?? document.body,
  );
}

export function GenerationBudgetDialog({
  value,
  project,
  close,
  save,
}: {
  value?: number;
  project: Project | null;
  close: () => void;
  save: (value: number) => void;
}) {
  const [amount, setAmount] = useState(
    value !== undefined ? String(value / 1e6) : "",
  );
  const edited = useRef(false);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    if (value === undefined)
      settingsApi<PublicSettings>("/models")
        .then((s) => {
          if (!active || edited.current) return;
          setAmount(
            String(
              (project?.generation?.budgetMicros ??
                s.generationBudgetMicros ??
                s.budgetMicros) / 1e6,
            ),
          );
        })
        .catch((e) => {
          if (active) setError(e.message);
        });
    return () => {
      active = false;
    };
  }, []);
  return (
    <SettingsDialog
      title="This generation"
      description="Set the limit before starting the next step."
      close={close}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          save(Math.round(Number(amount) * 1e6));
          close();
        }}
      >
        <div className="dialog-body">
          {error && <p role="alert">{error}</p>}
          <label>
            Generation limit (USD)
            <input
              autoFocus
              required
              type="number"
              min="0.001"
              max="100"
              step="any"
              value={amount}
              onChange={(e) => {
                edited.current = true;
                setAmount(e.target.value);
              }}
            />
          </label>
          <p className="muted">
            Includes planning, building and repairs. Changing this limit does
            not reset spend already recorded in the cycle.
          </p>
          {project?.generation && (
            <p>
              Cycle spent:{" "}
              {usd(
                project.charges
                  .slice(project.generation.chargeStart)
                  .reduce((sum, c) => sum + c.chargedMicros, 0),
              )}
            </p>
          )}
          <p className="muted">
            The project limit still applies. This saves a choice for the next
            action and does not start generation.
          </p>
        </div>
        <footer className="dialog-actions">
          <button type="button" onClick={close}>
            Cancel
          </button>
          <button className="primary">Use limit</button>
        </footer>
      </form>
    </SettingsDialog>
  );
}

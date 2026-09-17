import { useEffect, useRef, useState } from "react";
import type { Profile, Settings } from "../generation/schema";

type PublicSettings = Omit<Settings, "profiles"> & {
  profiles: (Profile & { hasKey?: boolean })[];
};
export function ModelPicker({
  configure,
  refreshKey = false,
}: {
  configure: () => void;
  refreshKey?: boolean;
}) {
  const [settings, setSettings] = useState<PublicSettings | null>(null);
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("All");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const launcher = useRef<HTMLButtonElement>(null);
  useEffect(() => {
    let active = true;
    fetch("/api/models")
      .then(async (r) => {
        if (!r.ok) throw Error("Could not load models");
        return r.json();
      })
      .then((s) => {
        if (active) setSettings(s);
      })
      .catch((e) => {
        if (active) setError(e.message);
      });
    return () => {
      active = false;
    };
  }, [open, refreshKey]);
  useEffect(() => {
    if (!open) return;
    const outside = (event: PointerEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [open]);
  const current = settings?.profiles.find(
    (p) => p.id === settings.routes.builder[0],
  );
  const profiles =
    settings?.profiles.filter(
      (p) =>
        filter === "All" ||
        (filter === "Low cost"
          ? p.outputRate <= 1
          : p.hasKey || p.provider === "compatible"),
    ) ?? [];
  return (
    <div
      className="model-picker"
      ref={ref}
      onKeyDown={(e) => {
        if (e.key === "Escape") {
          setOpen(false);
          launcher.current?.focus();
        }
      }}
    >
      <button
        type="button"
        ref={launcher}
        className="model-launcher"
        aria-label={"Choose model: " + (current?.name ?? "Configure models")}
        aria-expanded={open}
        onClick={() => setOpen(!open)}
      >
        ◉ <span>{current?.model.split("/").at(-1) || "Choose model"}</span>⌄
      </button>
      {open && (
        <div className="model-popover" aria-label="Choose a model">
          <strong>Choose a model</strong>
          <div className="model-filters" aria-label="Filter models">
            {["Connected", "Low cost", "All"].map((name) => (
              <button
                type="button"
                key={name}
                aria-pressed={filter === name}
                onClick={() => setFilter(name)}
              >
                {name}
              </button>
            ))}
          </div>
          <p className="muted">
            Choose the builder model. Research, planner and review routes are
            set in Models.
          </p>
          {profiles.map((profile) => (
            <button
              type="button"
              className="model-option"
              key={profile.id}
              disabled={saving || !profile.model}
              aria-pressed={current?.id === profile.id}
              onClick={async () => {
                if (!settings) return;
                setSaving(true);
                setError("");
                try {
                  const response = await fetch("/api/models", {
                    method: "PUT",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({
                      ...settings,
                      profiles: settings.profiles.map(({ hasKey, ...p }) => p),
                      routes: {
                        ...settings.routes,
                        builder: [profile.id],
                      },
                    }),
                  });
                  const value = await response.json();
                  if (!response.ok)
                    throw Error(value.error ?? "Could not select model");
                  setSettings(value);
                  setOpen(false);
                  launcher.current?.focus();
                } catch (e) {
                  setError((e as Error).message);
                } finally {
                  setSaving(false);
                }
              }}
            >
              <span>
                ◉ {profile.name}
                <small>{profile.model || "Model ID required"}</small>
              </span>
              <span>
                ${profile.outputRate}
                <small>/ 1M output</small>
              </span>
            </button>
          ))}
          {!profiles.length && (
            <p className="muted">
              No models in this group. Add a provider in Models to get started.
            </p>
          )}
          {error && <p role="alert">{error}</p>}
          <button
            type="button"
            className="configure-models"
            onClick={() => {
              setOpen(false);
              configure();
            }}
          >
            Models & budget ↗
          </button>
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from "react";
import type { Project } from "../generation/schema";
import { settingsApi, type PublicSettings } from "./SettingsWorkspace";
import { chatState } from "./chat-state";

export function PresetPill({
  project,
  open,
}: {
  project?: Project;
  open: () => void;
}) {
  const [settings, setSettings] = useState<PublicSettings>();
  useEffect(() => {
    let active = true;
    settingsApi<PublicSettings>("/models")
      .then((s) => {
        if (active) setSettings(s);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, [project?.id]);
  const preset = settings?.presets?.find(
    (p) => p.id === settings.activePresetId,
  );
  const model = settings?.profiles.find(
    (p) => p.id === settings.routes.builder?.[0],
  );
  const label = `${preset?.name ?? "Models"}${model ? ` · ${model.name}` : ""} · $${((project?.generation?.budgetMicros ?? settings?.generationBudgetMicros ?? project?.budgetMicros ?? settings?.budgetMicros ?? 0) / 1e6).toFixed(2)} cap`;
  return (
    <button className="chat-preset" title={label} onClick={open}>
      {label}
    </button>
  );
}

export function ChatStatus({
  project,
  stop,
  checkingAssets = false,
  stopping = false,
}: {
  project: Project;
  stop: () => void;
  checkingAssets?: boolean;
  stopping?: boolean;
}) {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    if (!project.jobId) return;
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, [project.jobId]);
  const state = stopping && project.jobId ? "Stopping…" : checkingAssets ? "Checking assets" : chatState(project);
  const tasks = project.spec?.tasks ?? [];
  const done = tasks.filter((t) =>
    project.completedBuildTasks?.includes(t.id),
  ).length;
  const current = project.conversation?.find(t => t.runId === project.jobId)?.events?.at(-1)?.message ?? tasks.find(t => !project.completedBuildTasks?.includes(t.id))?.title ?? "Preparing your request";
  const start = project.conversation?.find(
    (t) => t.runId === project.jobId,
  )?.at;
  const seconds = start
    ? Math.max(0, Math.floor((now - Date.parse(start)) / 1000))
    : 0;
  return (
    <section
      className="chat-status"
      aria-label="Chat status"
      data-state={state}
    >
      <div className="chat-status-line">
        <strong>{state}</strong>
        <span className="bounded-name" title={current}>
          {project.jobId ? current : ""}
        </span>
        <small>
          $
          {(
            project.charges.reduce((n, c) => n + c.chargedMicros, 0) / 1e6
          ).toFixed(2)}
        </small>
        {project.jobId && <button disabled={stopping} onClick={stop}>{stopping ? "Stopping…" : "Stop"}</button>}
      </div>
      {state === "Building" && (
        <>
          <small>
            Step {Math.min(done + 1, tasks.length || 1)} of {tasks.length || 1}{" "}
            · {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}
          </small>
          <progress
            aria-label="Build progress"
            value={done}
            max={tasks.length || 1}
          />
        </>
      )}
    </section>
  );
}

export function LiveChecklist({ project }: { project: Project }) {
  if (!project.jobId) return null;
  const workers =
    project.coordination?.workers
      .filter(
        (w) => w.revision === undefined || w.revision === project.revision,
      )
      .slice(-4) ?? [];
  return (
    <section className="live-checklist" aria-label="Work checklist">
      <strong>Working on your game</strong>
      <ul>
        {workers.length
          ? workers.map((w) => (
              <li key={w.id}>
                {w.status === "completed"
                  ? "✓"
                  : w.status === "running"
                    ? "◌"
                    : "·"}{" "}
                {w.objective}
              </li>
            ))
          : project.events.slice(-3).map((e, i) => (
              <li key={i}>
                {i === project.events.slice(-3).length - 1 ? "◌" : "•"}{" "}
                {e.message}
              </li>
            ))}
      </ul>
    </section>
  );
}

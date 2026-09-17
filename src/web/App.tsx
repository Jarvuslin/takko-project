import { useEffect, useState, useRef, useCallback } from "react";
import type { Project, Profile, Settings, Phase } from "../generation/schema";
import { AssetExecution } from "./AssetExecution";
import "./styles.css";
import { ModelPicker } from "./ModelPicker";
async function api<T>(
  path: string,
  method = "GET",
  body?: unknown,
): Promise<T> {
  const r = await fetch("/api" + path, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body === undefined ? undefined : JSON.stringify(body),
  });
  const data = await r.json();
  if (!r.ok) throw Error(data.error ?? "Request failed");
  return data;
}
const phases: Phase[] = [
  "research",
  "planner",
  "builder",
  "reviewer",
  "repair",
];
const endpoints = {
  openrouter: "https://openrouter.ai/api/v1",
  openai: "https://api.openai.com/v1",
  anthropic: "https://api.anthropic.com/v1",
  gemini: "https://generativelanguage.googleapis.com/v1beta",
  compatible: "http://127.0.0.1:1234/v1",
};
const money = (micros: number) => "$" + (micros / 1e6).toFixed(4);
type PublicSettings = Omit<Settings, "profiles"> & {
  profiles: (Profile & { hasKey?: boolean })[];
};
function Models({ close }: { close: () => void }) {
  const [catalogFilter, setCatalogFilter] = useState<Record<string, string>>(
    {},
  );
  const dialogRef = useRef<HTMLElement>(null);
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    const dialog = dialogRef.current!;
    const focusable = () =>
      Array.from(
        dialog.querySelectorAll<HTMLElement>(
          "button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),a[href]",
        ),
      ).filter((e) => e.getClientRects().length);
    focusable()[0]?.focus();
    const listener = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
      }
      if (event.key === "Tab") {
        const items = focusable(),
          first = items[0],
          last = items.at(-1);
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last?.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first?.focus();
        }
      }
    };
    dialog.addEventListener("keydown", listener);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      dialog.removeEventListener("keydown", listener);
      document.body.style.overflow = overflow;
      previous?.focus();
    };
  }, [close]);
  const [settings, setSettings] = useState<PublicSettings | null>(null),
    [keys, setKeys] = useState<Record<string, string>>({}),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [catalogs, setCatalogs] = useState<
      Record<
        string,
        {
          id: string;
          name: string;
          inputRate: number | null;
          outputRate: number | null;
        }[]
      >
    >({});
  useEffect(() => {
    api<PublicSettings>("/models")
      .then(setSettings)
      .catch((e) => setMessage(e.message));
  }, []);
  function change(id: string, patch: Partial<Profile>) {
    setSettings(
      (s) =>
        s && {
          ...s,
          profiles: s.profiles.map((p) =>
            p.id === id ? { ...p, ...patch } : p,
          ),
        },
    );
  }
  async function save() {
    if (!settings) return;
    setBusy(true);
    try {
      const next = await api<PublicSettings>("/models", "PUT", {
        ...settings,
        profiles: settings.profiles.map(({ hasKey, ...p }) => p),
      });
      for (const [id, key] of Object.entries(keys))
        await api("/models/" + id + "/key", "PUT", { key });
      setKeys({});
      setSettings(await api<PublicSettings>("/models"));
      setMessage(
        "Settings saved. API keys remain in server memory until restart.",
      );
      return next;
    } catch (e) {
      setMessage((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  return (
    <div className="overlay">
      <section
        ref={dialogRef}
        className="settings"
        role="dialog"
        aria-modal="true"
        aria-labelledby="models-title"
      >
        <div className="section-head">
          <div>
            <span className="eyebrow">ENGINE CONFIGURATION</span>
            <h2 id="models-title">Models and budget</h2>
          </div>
          <button onClick={close} aria-label="Close models">
            Close
          </button>
        </div>
        <p className="muted">
          Connect a provider, choose a model for each stage, and set the maximum
          project spend. Keys are sent only to this local server and the
          selected provider. They are never saved in your browser or project
          files.
        </p>
        {message && (
          <p role="status" className="notice">
            {message}
          </p>
        )}
        {settings && (
          <>
            <div className="provider-list">
              {settings.profiles.map((p, i) => (
                <article className="provider" key={p.id}>
                  <div className="section-head">
                    <h3>
                      Model {i + 1} · {p.name}
                    </h3>
                    <button
                      className="text-button"
                      onClick={() =>
                        setSettings({
                          ...settings,
                          profiles: settings.profiles.filter(
                            (x) => x.id !== p.id,
                          ),
                          routes: Object.fromEntries(
                            Object.entries(settings.routes).map(
                              ([phase, route]) => [
                                phase,
                                (route ?? []).filter((id) => id !== p.id),
                              ],
                            ),
                          ) as Settings["routes"],
                        })
                      }
                    >
                      Remove
                    </button>
                  </div>
                  <div className="form-grid">
                    <label>
                      Profile name
                      <input
                        value={p.name}
                        onChange={(e) => change(p.id, { name: e.target.value })}
                      />
                    </label>
                    <label>
                      Provider
                      <select
                        value={p.provider}
                        onChange={(e) => {
                          const provider = e.target
                            .value as Profile["provider"];
                          change(p.id, {
                            provider,
                            baseUrl: endpoints[provider],
                          });
                        }}
                      >
                        {Object.keys(endpoints).map((k) => (
                          <option key={k}>{k}</option>
                        ))}
                      </select>
                    </label>
                    <label className="span-two">
                      Endpoint
                      <input
                        value={p.baseUrl}
                        readOnly={p.provider !== "compatible"}
                        onChange={(e) =>
                          change(p.id, { baseUrl: e.target.value })
                        }
                      />
                    </label>
                    <label className="span-two">
                      API key{" "}
                      {p.hasKey && (
                        <span className="accent">
                          {" "}
                          · connected for this session
                        </span>
                      )}
                      <input
                        type="password"
                        autoComplete="off"
                        placeholder={
                          p.hasKey
                            ? "Leave unchanged, or enter a replacement"
                            : "Paste API key"
                        }
                        value={keys[p.id] ?? ""}
                        onChange={(e) =>
                          setKeys({ ...keys, [p.id]: e.target.value })
                        }
                      />
                    </label>
                    <label className="span-two">
                      Model ID
                      <input
                        aria-label="Model ID"
                        list={"catalog-" + p.id}
                        value={p.model}
                        placeholder="Enter a provider model ID"
                        onChange={(e) => {
                          const item = catalogs[p.id]?.find(
                            (x) => x.id === e.target.value,
                          );
                          change(p.id, {
                            model: e.target.value,
                            ...(item?.inputRate != null &&
                            item.outputRate != null
                              ? {
                                  inputRate: item.inputRate,
                                  outputRate: item.outputRate,
                                }
                              : {}),
                          });
                        }}
                      />
                      <datalist id={"catalog-" + p.id}>
                        {catalogs[p.id]?.map((m) => (
                          <option key={m.id} value={m.id}>
                            {m.name}
                          </option>
                        ))}
                      </datalist>
                    </label>
                    <label>
                      Input USD / million tokens
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={p.inputRate}
                        onChange={(e) =>
                          change(p.id, { inputRate: Number(e.target.value) })
                        }
                      />
                    </label>
                    <label>
                      Output USD / million tokens
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={p.outputRate}
                        onChange={(e) =>
                          change(p.id, { outputRate: Number(e.target.value) })
                        }
                      />
                    </label>
                    <label>
                      Maximum output tokens
                      <input
                        type="number"
                        min="512"
                        max="32768"
                        value={p.maxOutputTokens}
                        onChange={(e) =>
                          change(p.id, {
                            maxOutputTokens: Number(e.target.value),
                          })
                        }
                      />
                    </label>
                    <label className="checkbox">
                      <input
                        type="checkbox"
                        checked={p.jsonMode}
                        onChange={(e) =>
                          change(p.id, { jsonMode: e.target.checked })
                        }
                      />{" "}
                      Request JSON mode
                    </label>
                  </div>
                  {catalogs[p.id] && (
                    <div className="catalog-picker">
                      <label>
                        Search available models
                        <input
                          value={catalogFilter[p.id] ?? ""}
                          placeholder="Search by provider or model name"
                          onChange={(e) =>
                            setCatalogFilter({
                              ...catalogFilter,
                              [p.id]: e.target.value,
                            })
                          }
                        />
                      </label>
                      <label>
                        Select a model from the catalog
                        <select
                          value={p.model}
                          onChange={(e) => {
                            const m = catalogs[p.id].find(
                              (m) => m.id === e.target.value,
                            );
                            if (m)
                              change(p.id, {
                                model: m.id,
                                ...(m.inputRate != null && m.outputRate != null
                                  ? {
                                      inputRate: m.inputRate,
                                      outputRate: m.outputRate,
                                    }
                                  : {}),
                              });
                          }}
                        >
                          <option value={p.model}>
                            {p.model || "Choose a model"}
                          </option>
                          {catalogs[p.id]
                            .filter((m) =>
                              (m.id + " " + m.name)
                                .toLowerCase()
                                .includes(
                                  (catalogFilter[p.id] ?? "").toLowerCase(),
                                ),
                            )
                            .slice(0, 100)
                            .map((m) => (
                              <option key={m.id} value={m.id}>
                                {m.id}
                                {m.inputRate != null
                                  ? " · $" +
                                    m.inputRate +
                                    " in / $" +
                                    m.outputRate +
                                    " out per million"
                                  : ""}
                              </option>
                            ))}
                        </select>
                      </label>
                      <p className="muted">
                        Showing up to 100 matches. Selection fills the rates
                        when the provider publishes them.
                      </p>
                    </div>
                  )}
                  <button
                    disabled={busy}
                    onClick={async () => {
                      const saved = await save();
                      if (saved)
                        try {
                          const list = await api<(typeof catalogs)[string]>(
                            "/models/" + p.id + "/catalog",
                          );
                          setCatalogs({ ...catalogs, [p.id]: list });
                          setMessage(
                            "Loaded " +
                              list.length +
                              " models. Select a model ID; confirm rates against provider billing.",
                          );
                        } catch (e) {
                          setMessage((e as Error).message);
                        }
                    }}
                  >
                    Save & fetch model catalog
                  </button>
                </article>
              ))}
            </div>
            <button
              onClick={() => {
                const id = crypto.randomUUID();
                setSettings({
                  ...settings,
                  profiles: [
                    ...settings.profiles,
                    {
                      id,
                      name: "OpenRouter",
                      provider: "openrouter",
                      baseUrl: endpoints.openrouter,
                      model: "",
                      inputRate: 0,
                      outputRate: 0,
                      maxOutputTokens: 8192,
                      jsonMode: true,
                    },
                  ],
                  routes: {
                    ...settings.routes,
                    ...Object.fromEntries(
                      phases.map((phase) => [
                        phase,
                        settings.routes[phase]?.length
                          ? settings.routes[phase]
                          : [id],
                      ]),
                    ),
                  } as Settings["routes"],
                });
              }}
            >
              + Add model
            </button>
            <div className="routing">
              <h3>Model routing</h3>
              <p className="muted">
                Use a capable planner and reviewer with a cheaper builder, or
                use the same model throughout. Fallbacks run only after provider
                failures or rejected output. The lead plans the task graph;
                Takko enforces budgets, dependencies and verification.
              </p>
              <label className="research-toggle">
                <input
                  type="checkbox"
                  checked={!!settings.researchEnabled}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      researchEnabled: e.target.checked,
                    })
                  }
                />
                Research game references before planning (OpenRouter web search)
              </label>
              <p className="muted">
                Research saves sources and unknowns in the brief. Search and
                model usage count toward the project budget. An empty research
                route uses the planner route.
              </p>
              {phases.map((phase) => (
                <div className="route" key={phase}>
                  <strong>
                    {phase === "planner" ? "planner / lead" : phase}
                  </strong>
                  {[0, 1].map((index) => (
                    <label key={index}>
                      {index ? "Fallback" : "Primary"}
                      <select
                        aria-label={
                          phase + " " + (index ? "fallback" : "primary")
                        }
                        value={settings.routes[phase]?.[index] ?? ""}
                        onChange={(e) => {
                          const route = [...(settings.routes[phase] ?? [])];
                          route[index] = e.target.value;
                          setSettings({
                            ...settings,
                            routes: {
                              ...settings.routes,
                              [phase]: route.filter(Boolean),
                            },
                          });
                        }}
                      >
                        <option value="">
                          {index ? "None" : "Choose model"}
                        </option>
                        {settings.profiles.map((p) => (
                          <option value={p.id} key={p.id}>
                            {p.name} · {p.model || "model required"}
                          </option>
                        ))}
                      </select>
                    </label>
                  ))}
                </div>
              ))}
            </div>
            <div className="form-grid">
              <label>
                Project budget (USD)
                <input
                  type="number"
                  min="0.001"
                  max="100"
                  step="0.1"
                  value={settings.budgetMicros / 1e6}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      budgetMicros: Math.round(Number(e.target.value) * 1e6),
                    })
                  }
                />
              </label>
              <label>
                Automatic repair rounds
                <select
                  value={settings.repairLimit}
                  onChange={(e) =>
                    setSettings({
                      ...settings,
                      repairLimit: Number(e.target.value),
                    })
                  }
                >
                  {[0, 1, 2, 3].map((n) => (
                    <option key={n}>{n}</option>
                  ))}
                </select>
              </label>
            </div>
            <p className="muted">
              Rates are your configured estimates, not a provider invoice. Enter
              current rates, or select them from OpenRouter’s catalog. Unknown
              usage retains the full request reservation. Zero rates disable
              meaningful cost accounting.
            </p>
            <div className="dialog-footer">
              <button
                className="primary"
                disabled={busy}
                onClick={async () => {
                  if (await save()) close();
                }}
              >
                {busy ? "Saving…" : "Save model settings"}
              </button>
            </div>
          </>
        )}
      </section>
    </div>
  );
}
function VisualFeedback({
  project,
  save,
  repair,
  disabled,
}: {
  project: Project;
  save: (dataUrl: string, notes: string) => Promise<void>;
  repair: () => void;
  disabled: boolean;
}) {
  const [data, setData] = useState(""),
    [notes, setNotes] = useState(""),
    [error, setError] = useState("");
  return (
    <div className="visual-feedback">
      <h3>Review the actual render</h3>
      <p className="muted">
        Upload a PNG from Studio and describe what needs improvement. A
        vision-capable reviewer and repair model can use it directly.
      </p>
      <label>
        Studio screenshot · PNG, under 800 KB
        <input
          type="file"
          accept="image/png"
          disabled={disabled}
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            if (file.size > 800000) {
              setError("Use a PNG under 800 KB and at most 2048 × 2048.");
              return;
            }
            setError("");
            const reader = new FileReader();
            reader.onload = () => setData(String(reader.result));
            reader.readAsDataURL(file);
          }}
        />
      </label>
      {(data || project.visualEvidence?.dataUrl) && (
        <img
          alt="User-supplied Studio screenshot"
          src={data || project.visualEvidence!.dataUrl}
        />
      )}
      <label>
        What should improve?
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="The HUD overlaps the action buttons, and the attack pose is barely visible…"
        />
      </label>
      {error && <p role="alert">{error}</p>}
      <div className="actions">
        <button
          disabled={disabled || !data || notes.trim().length < 5}
          onClick={() => save(data, notes)}
        >
          Attach visual feedback
        </button>
        {project.visualEvidence &&
          project.visualEvidence.reviewStatus !== "awaiting_inspection" && (
            <button disabled={disabled} onClick={repair}>
              Repair from screenshot
            </button>
          )}
      </div>
      {project.visualEvidence && (
        <p className="muted">
          Attached to revision {project.visualEvidence.revision}. This is a
          user-uploaded observation, not an automatic quality pass.
          {project.visualEvidence.reviewStatus === "awaiting_inspection" && (
            <>
              {" "}
              The artifact has changed since this screenshot. Earlier feedback
              is retained: {project.visualEvidence.notes} Inspect the updated
              game in Studio and attach a fresh screenshot to continue visual
              repair.
            </>
          )}
        </p>
      )}
    </div>
  );
}
export function App() {
  const [followup, setFollowup] = useState("");
  const [showHistory, setShowHistory] = useState(false);
  const followupRef = useRef<HTMLTextAreaElement>(null);
  const [project, setProject] = useState<Project | null>(null),
    [projects, setProjects] = useState<
      { id: string; name: string; stage: string }[]
    >([]),
    [request, setRequest] = useState(""),
    [answers, setAnswers] = useState<Record<string, string>>({}),
    [models, setModels] = useState(false),
    [tab, setTab] = useState("Brief"),
    [error, setError] = useState(""),
    [busy, setBusy] = useState(false),
    [file, setFile] = useState(""),
    [studios, setStudios] = useState<
      {
        id: string;
        name: string;
        protocolVersion?: number;
        capabilities?: string[];
        operation?: {
          id: string;
          kind: string;
          state: string;
          ok: boolean | null;
          logs: string[];
          reason?: string;
        } | null;
      }[]
    >([]),
    [pairing, setPairing] = useState(""),
    [studioMessage, setStudioMessage] = useState("");
  const loadList = () => api<typeof projects>("/projects").then(setProjects);
  const closeModels = useCallback(() => setModels(false), []);
  useEffect(() => {
    loadList().catch((e) => setError(e.message));
    const id = new URLSearchParams(location.search).get("project");
    if (id && /^[0-9a-f-]{36}$/i.test(id)) select(id);
  }, []);
  useEffect(() => {
    if (project) history.replaceState(null, "", "?project=" + project.id);
  }, [project?.id]);
  useEffect(() => {
    let active = true;
    const refresh = async () => {
      try {
        const status = await api<{ studios: typeof studios }>("/status");
        if (active) setStudios(status.studios);
        if (project?.jobId) {
          const p = await api<Project>("/projects/" + project.id);
          if (active) {
            setProject(p);
            if (!p.jobId) loadList();
          }
        } else if (project && tab === "Studio") {
          const p = await api<Project>("/projects/" + project.id);
          if (active) setProject(p);
        }
      } catch (e) {
        if (active) setError((e as Error).message);
      }
    };
    const timer = setInterval(refresh, 1500);
    return () => {
      active = false;
      clearInterval(timer);
    };
  }, [project?.id, project?.jobId, tab]);
  async function work(fn: () => Promise<void>) {
    setBusy(true);
    setError("");
    try {
      await fn();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }
  async function select(id: string) {
    await work(async () => {
      const p = await api<Project>("/projects/" + id);
      setProject(p);
      setRequest(p.request);
      setAnswers(p.answers);
      setTab("Brief");
      setFollowup("");
      setShowHistory(false);
    });
  }
  async function action(name: string) {
    if (!project) return;
    await work(async () => {
      setProject(
        await api<Project>("/projects/" + project.id + "/" + name, "POST", {
          revision: project.revision,
        }),
      );
    });
  }
  const running = busy || !!project?.jobId;
  const source =
    project?.artifact?.files.find((f) => f.path === file) ??
    project?.artifact?.files[0];
  return (
    <div className={"app minimal " + (!project ? "landing" : "editor")}>
      <aside className="sidebar" inert={models}>
        <a
          className="brand"
          aria-label="Takko home"
          href="/"
          onClick={(e) => {
            e.preventDefault();
            setProject(null);
            setRequest("");
            history.replaceState(null, "", "/");
          }}
        >
          <span className="brand-symbol">
            <svg viewBox="0 0 24 24" aria-hidden="true">
              <path d="M4 5h16v4h-6v11h-4V9H4Z" fill="currentColor" />
            </svg>
          </span>
          <span className="brand-word">takko</span>
        </a>
        <button
          className="new-project"
          title="New project"
          onClick={() => {
            setProject(null);
            setRequest("");
            setAnswers({});
            setError("");
            history.replaceState(null, "", "/");
          }}
        >
          + New project
        </button>
        <span className="nav-label">
          Recent projects <span>{projects.length}</span>
        </span>
        <nav aria-label="Projects">
          {projects.length ? (
            projects.map((p) => (
              <button
                key={p.id}
                className={
                  p.id === project?.id
                    ? "project-link selected"
                    : "project-link"
                }
                onClick={() => select(p.id)}
              >
                <span className="project-dot" />
                <span>{p.name}</span>
              </button>
            ))
          ) : (
            <p className="empty-nav">Your projects will appear here.</p>
          )}
        </nav>
        <div className="sidebar-bottom">
          <a
            className="sidebar-download"
            href="/api/studio/plugin"
            title="Download plugin"
          >
            ⚒ <span>Download plugin</span>
            <span>↗</span>
          </a>
          <button aria-label="Models & budget" onClick={() => setModels(true)}>
            <svg
              viewBox="0 0 24 24"
              width="18"
              height="18"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.6"
              aria-hidden="true"
            >
              <path d="M4 7h16M4 17h16" />
              <circle cx="9" cy="7" r="3" fill="currentColor" />
              <circle cx="15" cy="17" r="3" fill="currentColor" />
            </svg>
            <span>Models & budget</span>
          </button>
          <span className="local-status">
            <i /> Local workspace
          </span>
        </div>
      </aside>
      <main inert={models}>
        <header className="topbar">
          <div>
            <span className="muted">Workspace</span>
            <span className="slash">/</span>
            {project?.name ?? "New project"}
          </div>
          <button onClick={() => setModels(true)}>
            Models <span className="arrow">↗</span>
          </button>
        </header>
        <label className="mobile-project-picker">
          Your projects
          <select
            aria-label="Open project"
            value={project?.id ?? ""}
            onChange={(e) => {
              if (e.target.value) select(e.target.value);
              else {
                setProject(null);
                setRequest("");
                history.replaceState(null, "", "/");
              }
            }}
          >
            <option value="">New project</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                {p.name}
              </option>
            ))}
          </select>
        </label>
        {error && (
          <div role="alert" className="error-banner">
            {error}
            <button aria-label="Dismiss error" onClick={() => setError("")}>
              ×
            </button>
          </div>
        )}
        {!project ? (
          <div className="welcome">
            <span className="eyebrow">New project</span>
            <h1>What do you want to build?</h1>
            <p className="welcome-description">
              Describe your Roblox game. We’ll make a plan, build it, and check
              it in Studio.
            </p>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                work(async () => {
                  const p = await api<Project>("/projects", "POST", {
                    request,
                  });
                  setProject(p);
                  setAnswers({});
                  setTab("Brief");
                  await loadList();
                });
              }}
            >
              <label className="sr-only" htmlFor="new-request">
                Game idea
              </label>
              <textarea
                id="new-request"
                value={request}
                onChange={(e) => setRequest(e.target.value)}
                placeholder="Describe the game, its core mechanic, and what players should do."
                minLength={5}
                maxLength={12000}
                required
              />
              <div className="composer-footer">
                <ModelPicker
                  configure={() => setModels(true)}
                  refreshKey={models}
                />
                <button
                  className="primary"
                  disabled={busy || request.trim().length < 5}
                >
                  Create project
                </button>
              </div>
            </form>
          </div>
        ) : (
          <div className="workspace">
            <h1 className="sr-only">{project.name}</h1>
            <section className="chat-panel" aria-label="Project conversation">
              <div className="chat-heading">
                <strong>{project.name}</strong>
                <span className="stage">
                  {project.stage.replaceAll("_", " ")}
                </span>
                <button
                  aria-pressed={showHistory}
                  onClick={() => setShowHistory(!showHistory)}
                >
                  History
                </button>
              </div>
              {showHistory && (
                <div className="chat-history">
                  <h2>Project activity</h2>
                  {project.events.length ? (
                    project.events.map((event, i) => (
                      <p key={i}>
                        <time>
                          {new Date(event.at).toLocaleTimeString([], {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </time>
                        {event.message}
                      </p>
                    ))
                  ) : (
                    <p>Your project has no generation activity yet.</p>
                  )}
                </div>
              )}
              <>
                <div className="tabs" role="tablist" aria-label="Project views">
                  {["Brief", "Build", "Source", "Studio"].map((name) => (
                    <button
                      role="tab"
                      aria-selected={tab === name}
                      tabIndex={tab === name ? 0 : -1}
                      onKeyDown={(e) => {
                        const tabs = ["Brief", "Build", "Source", "Studio"];
                        const index = tabs.indexOf(name);
                        const next =
                          e.key === "ArrowRight"
                            ? (index + 1) % 4
                            : e.key === "ArrowLeft"
                              ? (index + 3) % 4
                              : e.key === "Home"
                                ? 0
                                : e.key === "End"
                                  ? 3
                                  : null;
                        if (next !== null) {
                          e.preventDefault();
                          setTab(tabs[next]);
                          (
                            e.currentTarget.parentElement!.querySelectorAll(
                              "[role=tab]",
                            )[next] as HTMLButtonElement
                          ).focus();
                        }
                      }}
                      key={name}
                      onClick={() => setTab(name)}
                    >
                      {name}
                    </button>
                  ))}
                  <span className="spend">
                    {money(
                      project.charges.reduce((a, c) => a + c.chargedMicros, 0),
                    )}{" "}
                    / {money(project.budgetMicros)}
                  </span>
                </div>
                {project.error && (
                  <div role="alert" className="notice failure">
                    <p>{project.error}</p>
                    {project.failure && (
                      <details>
                        <summary>Generation diagnostics</summary>
                        <p>
                          {project.failure.phase} · {project.failure.attempts}{" "}
                          model attempts
                        </p>
                        <pre>{project.failure.details}</pre>
                      </details>
                    )}
                  </div>
                )}
                {project.jobId && (
                  <div className="job" role="status" aria-live="polite">
                    <span className="spinner" />
                    <span>
                      {project.events.at(-1)?.message ?? "Starting generation…"}
                    </span>
                    <button onClick={() => action("cancel")}>Cancel</button>
                  </div>
                )}
                {tab === "Brief" && (
                  <div className="brief-layout">
                    <section>
                      <div className="section-head">
                        <h2>Your request</h2>
                        <span className="muted">
                          Revision {project.revision}
                        </span>
                      </div>
                      <label className="sr-only" htmlFor="project-request">
                        Project request
                      </label>
                      <textarea
                        id="project-request"
                        className="request-editor"
                        value={request}
                        disabled={running}
                        onChange={(e) => setRequest(e.target.value)}
                      />
                      <div className="actions">
                        <button
                          disabled={running}
                          onClick={() =>
                            work(async () => {
                              const p = await api<Project>(
                                "/projects/" + project.id,
                                "PATCH",
                                {
                                  revision: project.revision,
                                  request,
                                  answers,
                                },
                              );
                              setProject(p);
                              setProject(
                                await api<Project>(
                                  "/projects/" + p.id + "/plan",
                                  "POST",
                                  { revision: p.revision },
                                ),
                              );
                            })
                          }
                        >
                          {project.spec ? "Update & replan" : "Plan this game"}{" "}
                          <span>↗</span>
                        </button>
                        <button
                          className="text-button"
                          onClick={() => setModels(true)}
                        >
                          Configure models
                        </button>
                      </div>
                      {!!project.events.length && (
                        <details className="generation-card">
                          <summary>
                            <span>
                              ✦{" "}
                              {project.jobId
                                ? "Generation in progress"
                                : "Generation activity"}
                            </span>
                            <small>
                              {project.events.length} recorded events · expand
                            </small>
                          </summary>
                          {project.events.slice(-20).map((event, i) => (
                            <p key={i}>{event.message}</p>
                          ))}
                        </details>
                      )}
                      {project.research && (
                        <details className="generation-card" open>
                          <summary>
                            Game research · {project.research.referenceGame}
                          </summary>
                          <p>{project.research.summary}</p>
                          <p className="muted">
                            Retrieved{" "}
                            {new Date(
                              project.research.retrievedAt,
                            ).toLocaleString()}{" "}
                            · Web evidence, not a playtest
                          </p>
                          <ul>
                            {project.research.mechanics.map((m) => (
                              <li key={m.id}>
                                <strong>{m.importance}: </strong>
                                {m.description}
                              </li>
                            ))}
                          </ul>
                          {project.research.unknowns.length > 0 && (
                            <>
                              <h3>Still uncertain</h3>
                              <ul>
                                {project.research.unknowns.map((u, i) => (
                                  <li key={i}>{u}</li>
                                ))}
                              </ul>
                            </>
                          )}
                          <h3>Sources</h3>
                          <ul>
                            {project.research.sources.map((s) => (
                              <li key={s.url}>
                                <a
                                  href={s.url}
                                  target="_blank"
                                  rel="noreferrer"
                                >
                                  {s.title}
                                </a>
                              </li>
                            ))}
                          </ul>
                          {!!project.spec?.referenceDecisions?.length && (
                            <>
                              <h3>How the brief uses this research</h3>
                              <ul>
                                {project.spec.referenceDecisions.map((d) => (
                                  <li key={d.mechanicId}>
                                    {d.action}: {d.mechanicId} — {d.reason}
                                  </li>
                                ))}
                              </ul>
                            </>
                          )}
                        </details>
                      )}
                      {project.visualEvidence && (
                        <figure className="chat-preview">
                          <img
                            src={project.visualEvidence.dataUrl}
                            alt="Saved Studio observation"
                          />
                          <figcaption>
                            {project.visualEvidence.notes}
                          </figcaption>
                        </figure>
                      )}
                      {project.spec && (
                        <>
                          <div className="spec-summary">
                            <span className="eyebrow">
                              EXPERIENCE DIRECTION
                            </span>
                            <h2>{project.spec.summary}</h2>
                            <p>{project.spec.visualDirection}</p>
                          </div>
                          {project.spec.questions.length > 0 && (
                            <section className="questions">
                              <h2>A few details before we build</h2>
                              {project.spec.questions.map((q) => (
                                <div className="question-field" key={q.id}>
                                  <label htmlFor={"question-" + q.id}>
                                    {q.prompt}
                                  </label>
                                  <div className="answer-options">
                                    {q.options.map((o) => (
                                      <button
                                        type="button"
                                        key={o}
                                        className={
                                          answers[q.id] === o ? "chosen" : ""
                                        }
                                        onClick={() =>
                                          setAnswers({
                                            ...answers,
                                            [q.id]: o,
                                          })
                                        }
                                      >
                                        {o}
                                      </button>
                                    ))}
                                  </div>
                                  <input
                                    id={"question-" + q.id}
                                    value={answers[q.id] ?? ""}
                                    placeholder="Your answer, or ask Takko to choose"
                                    onChange={(e) =>
                                      setAnswers({
                                        ...answers,
                                        [q.id]: e.target.value,
                                      })
                                    }
                                  />
                                </div>
                              ))}
                              <p className="muted">
                                Use “Update & replan” to incorporate your
                                answers. Include any animation or audio asset
                                IDs you want to use.
                              </p>
                              <button
                                className="primary"
                                disabled={
                                  running ||
                                  project.spec.questions.some(
                                    (q) => !answers[q.id]?.trim(),
                                  )
                                }
                                onClick={() =>
                                  work(async () => {
                                    const p = await api<Project>(
                                      "/projects/" + project.id,
                                      "PATCH",
                                      {
                                        revision: project.revision,
                                        request,
                                        answers,
                                      },
                                    );
                                    setProject(p);
                                    setProject(
                                      await api<Project>(
                                        "/projects/" + p.id + "/plan",
                                        "POST",
                                        { revision: p.revision },
                                      ),
                                    );
                                  })
                                }
                              >
                                Save answers & update plan
                              </button>
                            </section>
                          )}
                          <details
                            className="brief-details"
                            open={project.approvedRevision !== project.revision}
                          >
                            <summary>
                              Specification · {project.spec.requirements.length}{" "}
                              requirements
                            </summary>
                            <div className="section-head">
                              <h2>What the game needs</h2>
                              <span>
                                {project.spec.requirements.length} requirements
                              </span>
                            </div>
                            <div className="requirements">
                              {project.spec.requirements.map((r) => (
                                <article key={r.id}>
                                  <span className="requirement-category">
                                    {r.category}
                                  </span>
                                  <h3>{r.description}</h3>
                                  <p>{r.acceptance}</p>
                                  <span className="muted">
                                    {r.origin === "user"
                                      ? r.sourceId?.startsWith("answer:")
                                        ? "From your clarification"
                                        : "From your request"
                                      : "Inferred · review this assumption"}{" "}
                                    · {r.priority}
                                  </span>
                                </article>
                              ))}
                            </div>
                          </details>
                          <div className="actions">
                            <button
                              className="primary"
                              disabled={
                                running ||
                                request !== project.request ||
                                project.spec.questions.length > 0
                              }
                              onClick={() =>
                                work(async () => {
                                  const p = await api<Project>(
                                    "/projects/" + project.id + "/approve",
                                    "POST",
                                    { revision: project.revision },
                                  );
                                  setProject(p);
                                  setTab("Build");
                                })
                              }
                            >
                              Approve specification
                            </button>
                          </div>
                        </>
                      )}
                    </section>
                    <details className="plan-aside">
                      <summary>
                        Build plan · {project.spec?.tasks.length ?? 0} tasks
                      </summary>
                      <span className="eyebrow">BUILD PLAN</span>
                      {project.spec ? (
                        project.spec.tasks.map((t, i) => (
                          <article key={t.id}>
                            <span className="step-number">
                              {String(i + 1).padStart(2, "0")}
                            </span>
                            <div>
                              <h3>{t.title}</h3>
                              <span className="task-status">
                                {project.completedBuildTasks?.includes(t.id)
                                  ? "Completed"
                                  : "Planned"}
                              </span>
                              <p>
                                {t.files.length} script
                                {t.files.length === 1 ? "" : "s"} ·{" "}
                                {t.requirements.length} requirements
                              </p>
                              {t.dependsOn.length > 0 && (
                                <p>Depends on: {t.dependsOn.join(", ")}</p>
                              )}
                              {t.files.map((taskFile) => (
                                <button
                                  type="button"
                                  className="task-source"
                                  key={taskFile}
                                  onClick={() => {
                                    setFile(taskFile);
                                    setTab("Source");
                                  }}
                                >
                                  {taskFile}
                                </button>
                              ))}
                            </div>
                          </article>
                        ))
                      ) : (
                        <div className="plan-empty">
                          <span>◇</span>
                          <h3>Start with a clear plan.</h3>
                          <p>
                            Takko will identify the mechanics, world, interface,
                            assets and tests your idea needs.
                          </p>
                        </div>
                      )}
                    </details>
                  </div>
                )}
                {tab === "Build" && (
                  <section>
                    <AssetExecution
                      key={project.id}
                      project={project}
                      onChange={setProject}
                    />
                    <div className="section-head">
                      <div>
                        <h2>Build and validation</h2>
                        <p className="muted">
                          Each task uses your selected builder. A separate
                          review checks coverage before bounded repairs.
                        </p>
                      </div>
                      <div className="actions">
                        <button
                          className="primary"
                          disabled={
                            running ||
                            project.approvedRevision !== project.revision
                          }
                          onClick={() => action("build")}
                        >
                          {project.artifact ? "Rebuild" : "Generate game"}
                        </button>
                        {project.artifact && (
                          <button
                            disabled={running}
                            onClick={() => action("repair")}
                          >
                            Repair findings
                          </button>
                        )}
                      </div>
                    </div>
                    <div className="build-columns">
                      <div>
                        <h3>Validation</h3>
                        {project.checks.length ? (
                          project.checks.map((c, i) => (
                            <div className="check" key={c.id + i}>
                              <span className={"check-icon " + c.status}>
                                {c.status === "passed"
                                  ? "✓"
                                  : c.status === "failed"
                                    ? "!"
                                    : "○"}
                              </span>
                              <div>
                                <strong>{c.id}</strong>
                                <p>{c.detail}</p>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="empty-panel">
                            {project.approvedRevision
                              ? "Ready to generate your approved game."
                              : "Review and approve the brief before generation."}
                          </div>
                        )}
                      </div>
                      <div className="activity">
                        <h3>Activity & cost</h3>
                        {project.events.slice(-20).map((e, i) => (
                          <p key={i}>
                            <time>
                              {new Date(e.at).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </time>
                            {e.message}
                          </p>
                        ))}
                        {project.charges.map((c, i) => (
                          <div className="charge" key={i}>
                            <span>
                              {c.phase} · {c.model}
                              <small>
                                {c.billingSource === "provider"
                                  ? "Provider-reported cost"
                                  : c.estimated
                                    ? "Reserved estimate"
                                    : "Usage × configured rates"}
                              </small>
                            </span>
                            <strong>{money(c.chargedMicros)}</strong>
                          </div>
                        ))}
                      </div>
                    </div>
                  </section>
                )}
                {tab === "Source" && (
                  <section>
                    <div className="section-head">
                      <div>
                        <h2>The generated project</h2>
                        <p className="muted">
                          These are the actual scripts and scene objects
                          exported to Studio.
                        </p>
                      </div>
                      {project.artifact &&
                        !project.jobId &&
                        ["ready_to_test", "verified"].includes(project.stage) &&
                        !project.checks.some((c) => c.status === "failed") && (
                          <a
                            className="button"
                            href={"/api/projects/" + project.id + "/export"}
                          >
                            Download place ↗
                          </a>
                        )}
                    </div>
                    {project.artifact ? (
                      <>
                        <div className="source-layout">
                          <nav aria-label="Generated scripts">
                            {project.artifact.files.map((f) => (
                              <button
                                key={f.path}
                                className={
                                  source?.path === f.path ? "selected" : ""
                                }
                                onClick={() => setFile(f.path)}
                              >
                                {f.path}
                              </button>
                            ))}
                          </nav>
                          <div className="code-panel">
                            <div>
                              {source?.kind} · {source?.path.split("/").at(-1)}
                            </div>
                            <pre>
                              <code>{source?.source}</code>
                            </pre>
                          </div>
                        </div>
                        <details>
                          <summary>
                            Scene manifest · {project.artifact.scene.length}{" "}
                            objects
                          </summary>
                          <div className="scene-list">
                            {project.artifact.scene.map((n) => (
                              <p key={n.path}>
                                <strong>{n.className}</strong> {n.path}
                              </p>
                            ))}
                          </div>
                        </details>
                        <details>
                          <summary>
                            Assets · {project.artifact.assets.length}
                          </summary>
                          {project.artifact.assets.map((a) => (
                            <p key={a.id}>
                              {a.kind} · {a.description} · {a.status}{" "}
                              {a.assetId ?? ""}
                            </p>
                          ))}
                        </details>
                      </>
                    ) : (
                      <div className="empty-panel">
                        Your generated source will appear here after a build.
                      </div>
                    )}
                  </section>
                )}
                {tab === "Studio" && (
                  <section>
                    <div className="section-head">
                      <div>
                        <h2>See what actually plays.</h2>
                        <p className="muted">
                          Connect Roblox Studio to apply your game and run its
                          acceptance scenarios.
                        </p>
                      </div>
                      <span className="stage">
                        {studios.length
                          ? "Studio connected"
                          : "Awaiting connection"}
                      </span>
                    </div>
                    <div className="studio-layout">
                      <div className="studio-view">
                        <div className="viewport-icon">▧</div>
                        <h3>Inspect the real game in Studio</h3>
                        <p>
                          The browser does not substitute an illustration for
                          your generated world. Play it in Studio to review
                          animation, sound, controls and visual quality.
                        </p>
                        {project.artifact && (
                          <VisualFeedback
                            project={project}
                            disabled={running}
                            save={async (dataUrl, notes) =>
                              work(async () =>
                                setProject(
                                  await api<Project>(
                                    "/projects/" + project.id + "/visual",
                                    "POST",
                                    {
                                      revision: project.revision,
                                      dataUrl,
                                      notes,
                                    },
                                  ),
                                ),
                              )
                            }
                            repair={() => {
                              setTab("Build");
                              action("repair");
                            }}
                          />
                        )}
                        {project.studioEvidence && (
                          <div className="runtime-results">
                            <h3>
                              Studio observations · revision{" "}
                              {project.studioEvidence.revision}
                            </h3>
                            {project.studioEvidence.checks.map((c, i) => (
                              <p
                                key={i}
                                className={
                                  c.status === "failed" ? "failure" : ""
                                }
                              >
                                {c.status} · {c.id}: {c.detail}
                              </p>
                            ))}
                            <details>
                              <summary>Runtime logs</summary>
                              <pre>
                                {project.studioEvidence.logs.join("\n")}
                              </pre>
                            </details>
                            <button
                              disabled={running}
                              onClick={() => {
                                setTab("Build");
                                action("repair");
                              }}
                            >
                              Repair using these observations
                            </button>
                          </div>
                        )}
                      </div>
                      <aside className="studio-setup">
                        <h3>Connect the plugin</h3>
                        <ol>
                          <li>
                            <a href="/api/studio/plugin">
                              Download Takko.rbxmx
                            </a>
                            . Insert it into Studio and use “Save as Local
                            Plugin” on the script.
                          </li>
                          <li>
                            Open a new Studio session after installing, then
                            open the Takko toolbar panel. Allow its local HTTP
                            connection when Studio asks.
                          </li>
                          <li>
                            Press Connect to Takko. The plugin pairs with this
                            local app automatically; your session appears below.
                          </li>
                        </ol>
                        <button
                          onClick={() =>
                            work(async () =>
                              setPairing(
                                (
                                  await api<{ token: string }>(
                                    "/studio/pairing",
                                  )
                                ).token,
                              ),
                            )
                          }
                        >
                          Show pairing token
                        </button>
                        {pairing && (
                          <label>
                            Session pairing token
                            <input
                              readOnly
                              value={pairing}
                              onFocus={(e) => e.target.select()}
                            />
                          </label>
                        )}
                        <p className="muted">
                          Use a saved test place. Review generated scripts
                          before applying. Press Reconnect after restarting
                          Takko.
                        </p>
                        {studios.map((s) => (
                          <div className="connected-studio" key={s.id}>
                            <strong>{s.name}</strong>
                            {s.protocolVersion !== 2 && (
                              <p>
                                Update the Takko plugin and reconnect to enable
                                operations.
                              </p>
                            )}
                            {s.operation && (
                              <p role="status">
                                {s.operation.kind === "apply"
                                  ? "Apply"
                                  : "Tests"}
                                :{" "}
                                {s.operation.state === "queued"
                                  ? "waiting for delivery"
                                  : s.operation.state === "dispatched"
                                    ? "delivered to Studio; awaiting confirmation or result"
                                    : s.operation.state === "unknown"
                                      ? "outcome unknown; inspect Studio before continuing"
                                      : s.operation.state === "cancelled"
                                        ? "cancelled before execution"
                                        : s.operation.state === "expired"
                                          ? "expired before delivery"
                                          : s.operation.ok
                                            ? "completed in Studio"
                                            : "failed in Studio"}
                                {s.operation.reason && (
                                  <span> · {s.operation.reason}</span>
                                )}
                                {s.operation.state === "done" &&
                                  !s.operation.ok && (
                                    <span>
                                      {" "}
                                      · {s.operation.logs.join(" · ")}
                                    </span>
                                  )}
                              </p>
                            )}
                            <div className="actions">
                              {(["apply", "test"] as const).map((kind) => (
                                <button
                                  key={kind}
                                  disabled={
                                    running ||
                                    s.protocolVersion !== 2 ||
                                    !s.capabilities?.includes(kind) ||
                                    [
                                      "queued",
                                      "dispatched",
                                      "unknown",
                                    ].includes(s.operation?.state ?? "") ||
                                    !["ready_to_test", "verified"].includes(
                                      project.stage,
                                    ) ||
                                    !project.artifact ||
                                    project.checks.some(
                                      (c) => c.status === "failed",
                                    )
                                  }
                                  onClick={() =>
                                    work(async () => {
                                      await api(
                                        "/projects/" + project.id + "/studio",
                                        "POST",
                                        { studioId: s.id, kind },
                                      );
                                      setStudioMessage(
                                        "Queued. Confirm " +
                                          kind +
                                          " in the Takko Studio plugin.",
                                      );
                                    })
                                  }
                                >
                                  {kind === "apply"
                                    ? "Apply to Studio"
                                    : "Run tests"}
                                </button>
                              ))}
                              {s.operation?.state === "queued" && (
                                <button
                                  onClick={() =>
                                    work(async () => {
                                      await api(
                                        `/studio/${s.id}/operations/${s.operation!.id}/cancel`,
                                        "POST",
                                        {},
                                      );
                                      setStudioMessage(
                                        "Queued operation cancelled before delivery.",
                                      );
                                    })
                                  }
                                >
                                  Cancel queued operation
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                        {studioMessage && <p role="status">{studioMessage}</p>}
                      </aside>
                    </div>
                  </section>
                )}
              </>
              {tab === "Brief" && (
                <form
                  className="chat-composer"
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (!followup.trim() || running) return;
                    work(async () => {
                      const nextRequest =
                        request + "\n\nFollow-up:\n" + followup.trim();
                      const revised = await api<Project>(
                        "/projects/" + project.id,
                        "PATCH",
                        {
                          revision: project.revision,
                          request: nextRequest,
                          answers,
                        },
                      );
                      setProject(revised);
                      setRequest(revised.request);
                      setFollowup("");
                      setProject(
                        await api<Project>(
                          "/projects/" + revised.id + "/plan",
                          "POST",
                          { revision: revised.revision },
                        ),
                      );
                    });
                  }}
                >
                  <label className="sr-only" htmlFor="followup">
                    Message
                  </label>
                  <textarea
                    ref={followupRef}
                    id="followup"
                    placeholder="What would you like to add or change?"
                    value={followup}
                    onChange={(e) => setFollowup(e.target.value)}
                    maxLength={Math.max(0, 12000 - request.length - 14)}
                    disabled={running}
                  />
                  <div className="composer-footer">
                    <button
                      type="button"
                      className="attach-button"
                      aria-label="Attach Studio feedback"
                      onClick={() => setTab("Studio")}
                    >
                      +
                    </button>
                    <ModelPicker
                      configure={() => setModels(true)}
                      refreshKey={models}
                    />
                    <button
                      className="primary"
                      aria-label="Send message and update plan"
                      disabled={
                        running ||
                        !followup.trim() ||
                        request.length + followup.trim().length + 14 > 12000
                      }
                    >
                      Send
                    </button>
                  </div>
                  <small className="composer-hint">
                    Sends your change for planning. Review the updated brief
                    before building.
                  </small>
                </form>
              )}
            </section>
          </div>
        )}
      </main>
      {models && <Models close={closeModels} />}
    </div>
  );
}

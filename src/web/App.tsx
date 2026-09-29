// Tokens first: every other sheet reads from this one.
import { useEffect, useState, useRef, useCallback } from "react";
import type { Project } from "../generation/schema";
import { AssetExecution } from "./AssetExecution";
import { WorkspaceSplit } from "./WorkspaceSplit";
import { BuildPlan } from "./BuildPlan";
import {
  Clarifications,
  ClarificationDialog,
  type ClarificationQuestion,
} from "./Clarifications";
import { GameConcept, FirstPlaytest } from "./GameConcept";
import { AssetCard, assetRequest } from "./AssetCard";
import { PlatformChip } from "./PlatformChip";
import { assetSearches } from "../marketplace/discovery";
import { sameAnswers } from "./brief-draft";
import { Proposal } from "./Proposal";
import {
  StudioConnectionScreen,
  useStudioConnection,
} from "./StudioConnection";
import { StudioConversation } from "./StudioConversation";
import { Conversation } from "./Conversation";
import { ArchitectureEditor } from "./ArchitectureEditor";
import { Icon, TakkoMark } from "./Icons";
import {
  GenerationBudgetDialog,
  SettingsDialog,
  type SettingsPage,
} from "./SettingsWorkspace";
import { SettingsWorkspace } from "./ModelLibrary";
import {
  Marketplace,
  AssetAttachments,
  useAssetAttachments,
} from "./Marketplace";
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
const money = (micros: number) => "$" + (micros / 1e6).toFixed(4);
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
  const settingsFromHash = () =>
    ["models", "presets", "routing", "budget"].includes(location.hash.slice(1))
      ? (location.hash.slice(1) as SettingsPage)
      : null;
  const [settingsPage, setSettingsPage] = useState<SettingsPage | null>(
    settingsFromHash,
  );
  const settingsGuard = useRef<() => boolean>(() => true);
  const [generationLimit, setGenerationLimit] = useState<number | undefined>();
  const [budgetDialog, setBudgetDialog] = useState(false);
  const navigateSettings = useCallback((next: SettingsPage | null) => {
    if (!settingsGuard.current()) return false;
    setSettingsPage(next);
    history.pushState(
      null,
      "",
      location.pathname + location.search + (next ? "#" + next : ""),
    );
    return true;
  }, []);
  useEffect(() => {
    const navigate = () => {
      if (settingsGuard.current()) setSettingsPage(settingsFromHash());
      else
        history.replaceState(
          null,
          "",
          location.pathname +
            location.search +
            (settingsPage ? "#" + settingsPage : ""),
        );
    };
    window.addEventListener("popstate", navigate);
    window.addEventListener("hashchange", navigate);
    return () => {
      window.removeEventListener("popstate", navigate);
      window.removeEventListener("hashchange", navigate);
    };
  }, [settingsPage]);
  const [marketOpen, setMarketOpen] = useState(false);
  const [projectSearch, setProjectSearch] = useState("");
  const [projectListLimit, setProjectListLimit] = useState(60);
  const requestRef = useRef<HTMLTextAreaElement>(null);
  const [followup, setFollowup] = useState("");
  const threadScroll = useRef<HTMLDivElement>(null);
  const followLatest = useRef(true);
  const messageSubmission = useRef<{ text: string; id: string } | null>(null);
  const [showHistory, setShowHistory] = useState(false);
  const [conceptsEnabled, setConceptsEnabled] = useState(false);
  const [proposalsEnabled, setProposalsEnabled] = useState(false);
  const [pickingGroup, setPickingGroup] = useState<string>();
  const [assetChoicesEnabled, setAssetChoicesEnabled] = useState(false);
  const [connectionGate, setConnectionGate] = useState(true);
  const followupRef = useRef<HTMLTextAreaElement>(null);
  const [editingAnswers, setEditingAnswers] = useState<
    ClarificationQuestion[] | null
  >(null);
  const [project, setProject] = useState<Project | null>(null),
    [projects, setProjects] = useState<
      { id: string; name: string; stage: string }[]
    >([]),
    [request, setRequest] = useState(""),
    [answers, setAnswers] = useState<Record<string, string>>({}),
    [tab, setTab] = useState("Brief"),
    [error, setError] = useState(""),
    [pollError, setPollError] = useState(""),
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
  const savedBrief = useRef<Project | null>(null);
  useEffect(() => {
    if (!project) {
      savedBrief.current = null;
      return;
    }
    const previous = savedBrief.current;
    if (previous?.id === project.id && project.revision > previous.revision) {
      // Compare with the last saved baseline, not the incoming server values.
      if (
        request === previous.request &&
        sameAnswers(answers, previous.answers)
      ) {
        setRequest(project.request);
        setAnswers(project.answers);
        try {
          sessionStorage.removeItem("takko-answers-" + project.id);
        } catch {
          /* The in-memory brief still follows the saved revision. */
        }
      }
    }
    savedBrief.current = project;
  }, [project]);
  useEffect(() => {
    if (
      !project?.proposal ||
      project.jobId ||
      project.pendingProposalEdit ||
      !messageSubmission.current
    )
      return;
    const sent = project.conversation?.find(
      (t) => t.id === messageSubmission.current?.id,
    );
    if (sent?.text === followup.trim()) {
      setFollowup("");
      sessionStorage.removeItem("takko-draft-" + project.id);
      messageSubmission.current = null;
    }
  }, [project, followup]);
  const studioConnection = useStudioConnection(project?.id, connectionGate);
  const offlineMode = connectionGate && studioConnection.state === "offline";
  const needsConnection =
    connectionGate &&
    !["connected", "offline"].includes(studioConnection.state);
  const openStudioSetup = () =>
    connectionGate && studioConnection.state !== "connected"
      ? studioConnection.open()
      : setTab("Studio");
  function toggleMarketplace() {
    if (project && connectionGate && studioConnection.state !== "connected") {
      studioConnection.open();
      return;
    }
    setMarketOpen((value) => !value);
  }
  useEffect(() => {
    if (project && (needsConnection || offlineMode)) setMarketOpen(false);
  }, [project?.id, needsConnection, offlineMode]);
  useEffect(() => {
    if (offlineMode) setTab("Brief");
  }, [offlineMode]);
  useEffect(() => {
    const el = threadScroll.current;
    if (el && followLatest.current) el.scrollTop = el.scrollHeight;
  }, [project?.conversation?.length, project?.conversation?.at(-1)?.text]);
  useEffect(() => {
    if (project?.jobId) setGenerationLimit(undefined);
  }, [project?.jobId]);
  const loadList = () => api<typeof projects>("/projects").then(setProjects);
  useEffect(() => {
    loadList().catch((e) => setError(e.message));
    const id = new URLSearchParams(location.search).get("project");
    if (id && /^[0-9a-f-]{36}$/i.test(id)) select(id, true);
  }, []);
  useEffect(() => {
    if (project)
      history.replaceState(null, "", "?project=" + project.id + location.hash);
  }, [project?.id]);
  useEffect(() => {
    let active = true;
    let timer: ReturnType<typeof setTimeout>;
    const refresh = async () => {
      try {
        const status = await api<{
          studios: typeof studios;
          concepts?: boolean;
          proposals?: boolean;
          assetChoices?: boolean;
          studioConnectionGate?: boolean;
        }>("/status");
        if (!active) return;
        setConceptsEnabled(status.concepts === true);
        setProposalsEnabled(status.proposals === true);
        setAssetChoicesEnabled(status.assetChoices === true);
        setConnectionGate(status.studioConnectionGate === true);
        if (active) setStudios(status.studios);
        if (project?.jobId) {
          const p = await api<Project>("/projects/" + project.id);
          if (active) {
            // Completion must not wait for a scan of every saved project.
            if (!p.jobId)
              setProjects((list) =>
                list.map((row) =>
                  row.id === p.id
                    ? { ...row, name: p.name, stage: p.stage }
                    : row,
                ),
              );
            setProject(p);
          }
        } else if (project) {
          const p = await api<Project>("/projects/" + project.id);
          if (active) setProject(p);
        }
        if (active) setPollError("");
      } catch (e) {
        if (active) setPollError((e as Error).message);
      } finally {
        if (active) timer = setTimeout(refresh, 1500);
      }
    };
    // A mutation or new project invalidates this refresh's pending responses.
    if (!busy) timer = setTimeout(refresh, 1500);
    return () => {
      active = false;
      clearTimeout(timer);
    };
  }, [project, busy]);
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
  async function select(id: string, preservePage = false) {
    if (!preservePage && !navigateSettings(null)) return;
    setGenerationLimit(undefined);
    await work(async () => {
      const p = await api<Project>("/projects/" + id);
      if (project?.id === id && connectionGate) studioConnection.check();
      setProject(p);
      setRequest(p.request);
      let restored = p.answers;
      try {
        const draft = JSON.parse(
          sessionStorage.getItem("takko-answers-" + id) ?? "null",
        );
        if (
          draft?.revision === p.revision &&
          draft.answers &&
          Object.values(draft.answers).every((v) => typeof v === "string")
        )
          restored = draft.answers;
      } catch {
        /* Ignore a damaged local draft. */
      }
      setAnswers(restored);
      setEditingAnswers(null);
      setTab("Brief");
      setFollowup(sessionStorage.getItem("takko-draft-" + id) ?? "");
      setShowHistory(false);
      setPickingGroup(undefined);
    });
  }
  async function action(name: string) {
    if (!project) return;
    await work(async () => {
      setProject(
        await api<Project>("/projects/" + project.id + "/" + name, "POST", {
          revision: project.revision,
          ...(["concept", "plan", "build", "repair"].includes(name) &&
          generationLimit !== undefined
            ? { generationBudgetMicros: generationLimit }
            : {}),
        }),
      );
    });
  }
  const running = busy || !!project?.jobId;
  const hasAssetCard =
    assetChoicesEnabled &&
    !!project &&
    !!(
      project.proposal ||
      project.spec ||
      project.assetDiscovery ||
      project.briefApprovedRevision !== undefined
    ) &&
    !!(project.assetDiscovery?.groups.length || assetSearches(project).length);
  const assetDraft = useAssetAttachments(
    project?.id ?? "new",
    project?.assetAttachments,
    running,
    project
      ? async (asset, studioId) => {
          const next = await api<Project>(
            `/projects/${project.id}/marketplace-animations`,
            "POST",
            {
              reference: asset.assetId,
              studioId,
              revision: project.revision,
            },
          );
          setProject((current) =>
            current?.id === next.id && current.revision <= next.revision
              ? next
              : current,
          );
        }
      : undefined,
  );
  const assetInputs = assetDraft.attachments.map(
    ({ assetId, contentHash, usage }) => ({ assetId, contentHash, usage }),
  );
  const assetsChanged =
    JSON.stringify(assetInputs) !==
    JSON.stringify(
      (project?.assetAttachments ?? []).map(
        ({ assetId, contentHash, usage }) => ({ assetId, contentHash, usage }),
      ),
    );
  const source =
    project?.artifact?.files.find((f) => f.path === file) ??
    project?.artifact?.files[0];
  const conceptDirty =
    !!project &&
    (request !== project.request ||
      assetsChanged ||
      !sameAnswers(answers, project.answers));
  const changeAnswers = (next: Record<string, string>) => {
    setAnswers(next);
    if (project) {
      try {
        sessionStorage.setItem(
          "takko-answers-" + project.id,
          JSON.stringify({ revision: project.revision, answers: next }),
        );
      } catch {
        /* The in-memory draft remains available. */
      }
    }
  };
  async function shapeIdea() {
    if (!project) return;
    await work(async () => {
      const savedAnswers = Object.fromEntries(
        Object.entries(answers).filter(([, value]) => value.trim()),
      );
      const p = conceptDirty
        ? await api<Project>("/projects/" + project.id, "PATCH", {
            revision: project.revision,
            request,
            answers: savedAnswers,
            assetAttachments: assetInputs,
          })
        : project;
      setProject(p);
      setAnswers(p.answers);
      setProject(
        await api<Project>("/projects/" + p.id + "/concept", "POST", {
          revision: p.revision,
          ...(generationLimit !== undefined
            ? { generationBudgetMicros: generationLimit }
            : {}),
        }),
      );
    });
  }
  async function approvePickedProject() {
    if (!project) return;
    if (project.proposal) {
      receiveAssetProject(
        await api<Project>(`/projects/${project.id}/approve-proposal`, "POST", {
          revision: project.revision,
          hash: project.proposal.hash,
          ...(generationLimit !== undefined
            ? { generationBudgetMicros: generationLimit }
            : {}),
        }),
      );
    } else {
      let p = await assetRequest<Project>(project.id, "approve-brief", {
        revision: project.revision,
      });
      const choices = Object.fromEntries(
        Object.entries(p.assetDiscovery?.choices ?? {}).map(([id, c]) => [
          id,
          {
            assetId: c.assetId,
            clipKey: c.clipKey,
            skip: c.skip,
            kept: c.kept,
            acknowledgeInspectionLimitations:
              c.acknowledgeInspectionLimitations,
          },
        ]),
      );
      p = await assetRequest<Project>(p.id, "approve-assets", {
        revision: p.revision,
        discoveryId: p.assetDiscovery!.id,
        choices,
      });
      receiveAssetProject(p);
      await planWithAssets(p);
    }
  }
  function receiveAssetProject(next: Project) {
    setProject((current) =>
      current?.id === next.id && current.revision <= next.revision
        ? next
        : current,
    );
    assetDraft.setAttachments(next.assetAttachments ?? []);
  }
  async function planWithAssets(p: Project) {
    await work(async () => {
      setProject(
        await api<Project>(`/projects/${p.id}/plan`, "POST", {
          revision: p.revision,
          ...(generationLimit !== undefined
            ? { generationBudgetMicros: generationLimit }
            : {}),
        }),
      );
    });
  }
  async function approveBrief() {
    if (!project) return;
    await work(async () => {
      const p = conceptDirty
        ? await api<Project>(`/projects/${project.id}`, "PATCH", {
            revision: project.revision,
            request,
            answers: Object.fromEntries(
              Object.entries(answers).filter(([, v]) => v.trim()),
            ),
            assetAttachments: assetInputs,
          })
        : project;
      setProject(p);
      setAnswers(p.answers);
      setProject(
        await api<Project>(`/projects/${p.id}/approve-brief`, "POST", {
          revision: p.revision,
        }),
      );
    });
  }
  return (
    <div
      className={
        "app minimal " +
        (settingsPage
          ? "settings-view"
          : !project
            ? "landing"
            : "editor workspace-native") +
        (marketOpen && !pickingGroup && !settingsPage ? " market-open" : "")
      }
    >
      <aside className="sidebar">
        <a
          className="brand"
          aria-label="Takko home"
          href="/"
          onClick={(e) => {
            e.preventDefault();
            if (!navigateSettings(null)) return;
            setGenerationLimit(undefined);
            setProject(null);
            setRequest("");
            history.replaceState(null, "", "/");
          }}
        >
          <span className="brand-symbol">
            <TakkoMark />
          </span>
          <span className="brand-word">takko</span>
        </a>
        <button
          className="new-project"
          title="New project"
          onClick={() => {
            if (!navigateSettings(null)) return;
            setGenerationLimit(undefined);
            setProject(null);
            setRequest("");
            setAnswers({});
            setError("");
            history.replaceState(null, "", "/");
          }}
        >
          <Icon name="plus" /> <span>New project</span>
        </button>
        <button
          type="button"
          className="marketplace-launch"
          title="Marketplace"
          onClick={toggleMarketplace}
          aria-expanded={marketOpen}
        >
          <Icon name="grid" /> <span>Marketplace</span>
        </button>
        <nav className="settings-sidebar-nav" aria-label="Workspace">
          {(["models", "presets"] as const).map((page) => (
            <button
              key={page}
              title={page[0].toUpperCase() + page.slice(1)}
              aria-current={
                settingsPage &&
                (settingsPage === "models" ? "models" : "presets") === page
                  ? "page"
                  : undefined
              }
              onClick={() => navigateSettings(page)}
            >
              <Icon name={page === "models" ? "models" : "sliders"} />
              <span>{page[0].toUpperCase() + page.slice(1)}</span>
            </button>
          ))}
        </nav>
        <details className="project-library" open={!project || !!settingsPage}>
          <summary title="Projects" aria-label="Projects">
            <Icon name="cube" />
            <span>Projects</span>
          </summary>
          <div className="project-library-content">
            <label className="project-search">
              <Icon name="search" size={18} />
              <span className="sr-only">Search projects</span>
              <input
                type="search"
                placeholder="Search projects"
                value={projectSearch}
                onChange={(event) => setProjectSearch(event.target.value)}
              />
            </label>
            <span className="nav-label">
              Recent projects <span>{projects.length}</span>
            </span>
            <nav aria-label="Projects">
              {projects.length ? (
                projects
                  .filter((p) =>
                    p.name
                      .toLowerCase()
                      .includes(projectSearch.trim().toLowerCase()),
                  )
                  .slice(0, projectListLimit)
                  .map((p) => (
                    <button
                      key={p.id}
                      className={
                        p.id === project?.id
                          ? "project-link selected"
                          : "project-link"
                      }
                      onClick={(event) => {
                        event.currentTarget
                          .closest("details")
                          ?.removeAttribute("open");
                        select(p.id);
                      }}
                      aria-current={p.id === project?.id ? "page" : undefined}
                    >
                      <span className="project-dot" />
                      <span className="bounded-name" title={p.name}>
                        {p.name}
                      </span>
                    </button>
                  ))
              ) : (
                <p className="empty-nav">Your projects will appear here.</p>
              )}
              {projects.filter((p) =>
                p.name
                  .toLowerCase()
                  .includes(projectSearch.trim().toLowerCase()),
              ).length > projectListLimit && (
                <button onClick={() => setProjectListLimit((n) => n + 60)}>
                  Show more projects
                </button>
              )}
              {!!projects.length &&
                !projects.some((p) =>
                  p.name
                    .toLowerCase()
                    .includes(projectSearch.trim().toLowerCase()),
                ) && <p className="empty-nav">No matching projects.</p>}
            </nav>
          </div>
        </details>
        <div className="sidebar-bottom">
          <a
            className="sidebar-download"
            href="/api/studio/plugin"
            title="Download plugin"
          >
            <Icon name="cube" /> <span>Download plugin</span>
            <Icon name="external" size={14} />
          </a>

          <span className="local-status">
            <i /> Local workspace
          </span>
        </div>
      </aside>
      <main>
        <header className="topbar">
          <div>
            <span className="muted">Workspace</span>
            <span className="slash">/</span>
            {settingsPage ? (
              settingsPage === "models" ? (
                "Models"
              ) : (
                "Presets"
              )
            ) : (
              <span
                className="bounded-name"
                title={project?.name ?? "New project"}
              >
                {project?.name ?? "New project"}
              </span>
            )}
          </div>
          <div className="topbar-actions">
            {project ? (
              <button
                className="connection-status"
                onClick={openStudioSetup}
                title="Open Studio connections"
              >
                <i
                  className={
                    (
                      connectionGate
                        ? studioConnection.state === "connected"
                        : studios.length
                    )
                      ? "connected"
                      : ""
                  }
                />
                {offlineMode
                  ? "Offline · Connect to Studio"
                  : (
                        connectionGate
                          ? studioConnection.state === "connected"
                          : studios.length
                      )
                    ? "Studio connected"
                    : "Connect to Studio"}
              </button>
            ) : (
              <span
                className="connection-status"
                title="Create or open a project to set up Studio"
              >
                <i className={studios.length ? "connected" : ""} />
                {studios.length ? "Studio connected" : "Studio not connected"}
              </span>
            )}
            {settingsPage ? (
              <button onClick={() => navigateSettings(null)}>
                Back to project
              </button>
            ) : (
              <button onClick={() => navigateSettings("models")}>
                <Icon name="sliders" size={16} /> Models
              </button>
            )}
          </div>
        </header>
        {!studios.length && (
          <p className="pick-note" role="status">
            Studio is not connected. Animation clips need the Takko plugin.
            Open Studio, enable its MCP connection, and connect the Takko plugin to this app.
          </p>
        )}
        {settingsPage ? (
          <SettingsWorkspace
            page={settingsPage}
            project={project}
            navigate={navigateSettings}
            guard={settingsGuard}
            changed={() => {}}
          />
        ) : (
          <>
            {(error || pollError) && (
              <div role="alert" className="error-banner">
                {error || pollError}
                <button
                  aria-label="Dismiss error"
                  onClick={() => {
                    setError("");
                    setPollError("");
                  }}
                >
                  ×
                </button>
              </div>
            )}
            {!project ? (
              <div className="welcome">
                <TakkoMark className="welcome-mark" />
                <h1>What do you want to build?</h1>
                <p className="welcome-description">
                  Your next Roblox game starts with an idea.
                </p>
                <form
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={assetDraft.drop}
                  onSubmit={(e) => {
                    e.preventDefault();
                    if (assetDraft.inspecting || busy) return;
                    work(async () => {
                      const [p, capabilities] = await Promise.all([
                        api<Project>("/projects", "POST", {
                          request,
                          ...(assetInputs.length
                            ? { assetAttachments: assetInputs }
                            : {}),
                        }),
                        api<{
                          proposals?: boolean;
                          concepts?: boolean;
                          assetChoices?: boolean;
                          studioConnectionGate?: boolean;
                        }>("/status"),
                      ]);
                      setConceptsEnabled(capabilities.concepts === true);
                      setProposalsEnabled(capabilities.proposals === true);
                      setAssetChoicesEnabled(
                        capabilities.assetChoices === true,
                      );
                      setConnectionGate(
                        capabilities.studioConnectionGate === true,
                      );
                      setProject(p);
                      setAnswers({});
                      setTab("Brief");
                      void loadList().catch((e) => setError(e.message));
                      if (capabilities.proposals)
                        setProject(
                          await api<Project>(
                            `/projects/${p.id}/proposal`,
                            "POST",
                            {
                              revision: p.revision,
                              ...(generationLimit !== undefined
                                ? { generationBudgetMicros: generationLimit }
                                : {}),
                            },
                          ),
                        );
                    });
                  }}
                >
                  <label className="sr-only" htmlFor="new-request">
                    Game idea
                  </label>
                  <textarea
                    ref={requestRef}
                    id="new-request"
                    value={request}
                    onChange={(e) => setRequest(e.target.value)}
                    placeholder="Describe your game. Start with the fun part."
                    minLength={5}
                    maxLength={12000}
                    required
                  />
                  <AssetAttachments
                    draft={assetDraft}
                    disabled={running || assetDraft.inspecting}
                  />
                  <div className="composer-footer">
                    <button
                      type="button"
                      className="attach-button"
                      onClick={toggleMarketplace}
                      aria-label="Browse Marketplace assets"
                    >
                      <Icon name="grid" size={18} />
                      <span>Marketplace</span>
                    </button>
                    <button
                      type="button"
                      className="composer-setting"
                      onClick={() => navigateSettings("presets")}
                    >
                      Presets <Icon name="chevron" size={14} />
                    </button>
                    <button
                      type="button"
                      className="composer-setting"
                      aria-label="Budget for this generation"
                      onClick={() => setBudgetDialog(true)}
                    >
                      Budget
                      {generationLimit !== undefined
                        ? " · $" + (generationLimit / 1e6).toFixed(2)
                        : ""}
                    </button>
                    <button
                      className="primary send-button"
                      aria-label="Create project"
                      title="Create project"
                      disabled={
                        busy ||
                        assetDraft.inspecting ||
                        request.trim().length < 5
                      }
                    >
                      <Icon name="arrow" />
                      <span className="sr-only">Create project</span>
                    </button>
                  </div>
                </form>
                <div className="starter-prompts" aria-label="Starting points">
                  {[
                    {
                      icon: "bolt" as const,
                      label: "Build an obby",
                      prompt:
                        "Build an obby with creative obstacles, checkpoints, and a finish line.",
                    },
                    {
                      icon: "play" as const,
                      label: "Make an arena",
                      prompt:
                        "Build a fast arena game with a dash move, a shrinking play zone, and short rounds.",
                    },
                    {
                      icon: "cube" as const,
                      label: "Create a cozy world",
                      prompt:
                        "Build a cozy island where friends can grow crops, decorate, and explore together.",
                    },
                  ].map((idea) => (
                    <button
                      key={idea.label}
                      type="button"
                      disabled={!!request.trim() || busy}
                      onClick={() => {
                        setRequest(idea.prompt);
                        requestRef.current?.focus();
                      }}
                    >
                      <Icon name={idea.icon} size={16} />
                      {idea.label}
                    </button>
                  ))}
                </div>
                {!!projects.length && (
                  <section
                    className="recent-projects"
                    aria-label="Recent projects"
                  >
                    <h2>Pick up where you left off</h2>
                    <div className="recent-project-grid">
                      {projects.slice(0, 3).map((p, index) => (
                        <button
                          key={p.id}
                          type="button"
                          className="recent-project-card"
                          onClick={() => select(p.id)}
                        >
                          <img
                            src={
                              "/ui/" +
                              ["arena", "portal", "obby"][index] +
                              ".svg"
                            }
                            alt=""
                          />
                          <strong className="bounded-name" title={p.name}>
                            {p.name}
                          </strong>
                          <small>{p.stage.replaceAll("_", " ")}</small>
                        </button>
                      ))}
                    </div>
                  </section>
                )}
                <p className="welcome-footnote">
                  Plan it. Build it. Then test it in Studio.
                </p>
              </div>
            ) : needsConnection ? (
              <StudioConnectionScreen
                name={project.name}
                checking={studioConnection.state === "checking"}
                error={studioConnection.error}
                pluginConnected={!!studios.length}
                check={studioConnection.check}
                offline={studioConnection.offline}
              />
            ) : (
              <WorkspaceSplit
                canvas={
                  offlineMode ? (
                    <section
                      className="studio-offline-space"
                      aria-label="Offline workspace"
                    >
                      <h2>Your idea starts here.</h2>
                      <p>
                        Refine your brief with Takko. Connect Studio when you
                        are ready to explore assets and open the architecture.
                      </p>
                      <button onClick={studioConnection.open}>
                        Connect Studio
                      </button>
                    </section>
                  ) : (
                    <ArchitectureEditor
                      key={project.id}
                      project={project}
                      docked
                      presentation={{ nodeHeight: 188, bottomInset: 20 }}
                      ask={(text) => {
                        setFollowup(text);
                        followupRef.current?.focus();
                      }}
                      details={setTab}
                      save={async (architecture, id) => {
                        const next = await api<Project>(
                          `/projects/${project.id}/architecture`,
                          "POST",
                          { revision: project.revision, id, architecture },
                        );
                        setProject(next);
                        setRequest(next.request);
                        setTab("Brief");
                      }}
                    />
                  )
                }
              >
                <h1 className="sr-only">{project.name}</h1>
                <section
                  className="chat-panel"
                  id="takko-agent-panel"
                  aria-label="Project conversation"
                >
                  {editingAnswers && (
                    <ClarificationDialog
                      questions={editingAnswers}
                      answers={answers}
                      change={changeAnswers}
                      close={() => setEditingAnswers(null)}
                      disabled={running}
                    />
                  )}
                  <div className="chat-heading">
                    <TakkoMark />
                    <strong>Takko</strong>
                    <div className="chat-budget">
                      <span className="spend">
                        {money(
                          project.charges.reduce(
                            (a, c) => a + c.chargedMicros,
                            0,
                          ),
                        )}{" "}
                        / {money(project.budgetMicros)}
                      </span>
                    </div>
                    <span className="stage">
                      {project.stage.replaceAll("_", " ")}
                    </span>

                    <button
                      onClick={() =>
                        threadScroll.current?.scrollTo({
                          top: threadScroll.current.scrollHeight,
                          behavior: matchMedia(
                            "(prefers-reduced-motion: reduce)",
                          ).matches
                            ? "instant"
                            : "smooth",
                        })
                      }
                    >
                      Latest ↓
                    </button>
                    <button
                      aria-pressed={showHistory}
                      onClick={() => setShowHistory(!showHistory)}
                    >
                      <Icon name="clock" size={16} /> History
                    </button>
                  </div>
                  <PlatformChip
                    project={project}
                    update={(next) => {
                      receiveAssetProject(next);
                      setAnswers(next.answers);
                    }}
                    disabled={running}
                  />
                  <div
                    className="chat-thread-scroll"
                    ref={threadScroll}
                    onScroll={(e) => {
                      const el = e.currentTarget;
                      followLatest.current =
                        el.scrollHeight - el.scrollTop - el.clientHeight < 70;
                    }}
                  >
                    {
                      <Conversation
                        key={project.id}
                        project={project}
                        history={showHistory}
                        closeHistory={() => setShowHistory(false)}
                        update={setProject}
                        openSource={() =>
                          offlineMode
                            ? studioConnection.open()
                            : setTab("Source")
                        }
                        editAnswers={setEditingAnswers}
                        stageMessage={(text) => {
                          setFollowup(text);
                          followupRef.current?.focus();
                        }}
                      />
                    }
                    {project.error && (
                      <div role="alert" className="notice failure">
                        {/Output truncated/i.test(project.error) ? (
                          <>
                            <strong>The model ran out of reply space</strong>
                            <p>
                              Your saved brief and asset choices are still
                              available. Adjust the model’s reply limit or
                              reasoning effort before trying again.
                            </p>
                            <button onClick={() => navigateSettings("models")}>
                              Open model settings
                            </button>
                            <details>
                              <summary>Reply details</summary>
                              <p>{project.error}</p>
                            </details>
                          </>
                        ) : (
                          <p>{project.error}</p>
                        )}
                        {project.failure && (
                          <details>
                            <summary>Generation diagnostics</summary>
                            <p>
                              {project.failure.phase} ·{" "}
                              {project.failure.attempts} model attempts
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
                          {project.events.at(-1)?.message ??
                            "Starting generation…"}
                        </span>
                        <button onClick={() => action("cancel")}>Cancel</button>
                      </div>
                    )}
                    {
                      <div className="brief-layout">
                        <section>
                          {!offlineMode && (
                            <StudioConversation
                              project={project}
                              studios={studios}
                              openSetup={openStudioSetup}
                              refresh={async () =>
                                setProject(
                                  await api<Project>("/projects/" + project.id),
                                )
                              }
                            />
                          )}
                          {project.proposal && (
                            <Proposal
                              project={project}
                              assetsInChat={hasAssetCard}
                              disabled={running}
                              discard={() => action("discard-proposal-edit")}
                              saveAnswers={async (chosen) => {
                                const next = await api<Project>(
                                  `/projects/${project.id}`,
                                  "PATCH",
                                  {
                                    revision: project.revision,
                                    request: project.request,
                                    answers: { ...project.answers, ...chosen },
                                  },
                                );
                                setProject(next);
                                setAnswers(next.answers);
                              }}
                              approve={async () => {
                                setBusy(true);
                                try {
                                  setProject(
                                    await api<Project>(
                                      `/projects/${project.id}/approve-proposal`,
                                      "POST",
                                      {
                                        revision: project.revision,
                                        hash: project.proposal!.hash,
                                        ...(generationLimit !== undefined
                                          ? {
                                              generationBudgetMicros:
                                                generationLimit,
                                            }
                                          : {}),
                                      },
                                    ),
                                  );
                                } finally {
                                  setBusy(false);
                                }
                              }}
                            />
                          )}
                          {!project.proposal && (
                            <>
                              {proposalsEnabled && (
                                <button
                                  disabled={running}
                                  onClick={() => action("proposal")}
                                >
                                  Prepare persistent proposal
                                </button>
                              )}
                              <details className="brief-editor">
                                <summary>Edit original brief</summary>
                                <div className="section-head">
                                  <h2>Your request</h2>
                                  <span className="muted">
                                    Revision {project.revision}
                                  </span>
                                </div>
                                <p className="muted">
                                  Editing the original brief replaces the active
                                  follow-up instructions. Your message history
                                  stays saved.
                                </p>
                                <label
                                  className="sr-only"
                                  htmlFor="project-request"
                                >
                                  Project request
                                </label>
                                <textarea
                                  id="project-request"
                                  className="request-editor"
                                  value={request}
                                  disabled={running}
                                  onChange={(e) => setRequest(e.target.value)}
                                />
                              </details>
                              <div
                                className={
                                  "actions" +
                                  (project.concept &&
                                  request === project.request &&
                                  !(
                                    conceptDirty &&
                                    !project.concept.questions.length
                                  )
                                    ? " is-context-idle"
                                    : "")
                                }
                              >
                                {conceptsEnabled &&
                                  (!project.spec || project.concept) && (
                                    <button
                                      disabled={
                                        running || request.trim().length < 5
                                      }
                                      onClick={shapeIdea}
                                    >
                                      {project.concept
                                        ? request === project.request
                                          ? "Update concept"
                                          : "Update concept from request"
                                        : "Shape my idea"}
                                    </button>
                                  )}
                                {assetChoicesEnabled &&
                                  (!project.concept || !!project.spec) && (
                                    <button
                                      className="primary"
                                      disabled={
                                        running ||
                                        request.trim().length < 5 ||
                                        (project.briefApprovedRevision ===
                                          project.revision &&
                                          !conceptDirty)
                                      }
                                      onClick={approveBrief}
                                    >
                                      {project.briefApprovedRevision ===
                                        project.revision && !conceptDirty
                                        ? "Brief approved"
                                        : "Approve brief"}
                                    </button>
                                  )}
                                {!project.concept &&
                                  project.briefApprovedRevision !==
                                    project.revision && (
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
                                              {
                                                revision: p.revision,
                                                ...(generationLimit !==
                                                undefined
                                                  ? {
                                                      generationBudgetMicros:
                                                        generationLimit,
                                                    }
                                                  : {}),
                                              },
                                            ),
                                          );
                                        })
                                      }
                                    >
                                      {project.spec
                                        ? "Update & replan"
                                        : "Plan this game"}{" "}
                                      <span>↗</span>
                                    </button>
                                  )}
                                <button
                                  className="text-button"
                                  onClick={() => navigateSettings("models")}
                                >
                                  Configure models
                                </button>
                              </div>
                              {conceptsEnabled &&
                                !project.spec &&
                                !project.concept && (
                                  <p className="muted">
                                    Shape your idea, then review the plan before
                                    building. Uses your planner and generation
                                    budget.
                                  </p>
                                )}
                              {project.concept?.revision === project.revision &&
                                (project.spec ? (
                                  <FirstPlaytest
                                    concept={project.concept}
                                    openStudio={openStudioSetup}
                                  />
                                ) : (
                                  <GameConcept
                                    concept={project.concept}
                                    answers={answers}
                                    onAnswers={changeAnswers}
                                    onRefine={shapeIdea}
                                    onPlan={
                                      assetChoicesEnabled
                                        ? approveBrief
                                        : () => action("plan")
                                    }
                                    approved={
                                      project.briefApprovedRevision ===
                                      project.revision
                                    }
                                    disabled={running || !conceptsEnabled}
                                    dirty={conceptDirty}
                                  />
                                ))}
                            </>
                          )}
                          {hasAssetCard &&
                            (!project.artifact || project.assetDiscovery) && (
                              <AssetCard
                                key={project.id}
                                project={project}
                                disabled={running || assetDraft.inspecting}
                                buildBlocked={
                                  conceptDirty
                                    ? "Save your brief changes before building."
                                    : project.platform?.question
                                      ? "Choose the target platform before building."
                                      : project.clarificationQuestions?.length
                                        ? "Answer the project questions before building."
                                        : undefined
                                }
                                update={receiveAssetProject}
                                choose={(id) => {
                                  setPickingGroup(id);
                                  setMarketOpen(true);
                                }}
                                approve={approvePickedProject}
                                connect={openStudioSetup}
                              />
                            )}
                          {!!project.events.length &&
                            !project.conversation?.some(
                              (t) => t.kind === "run",
                            ) && (
                              <details className="generation-card">
                                <summary>
                                  <span>
                                    ✦{" "}
                                    {project.jobId
                                      ? "Generation in progress"
                                      : "Generation activity"}
                                  </span>
                                  <small>
                                    {project.events.length} recorded events ·
                                    expand
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
                                    {project.spec.referenceDecisions.map(
                                      (d) => (
                                        <li key={d.mechanicId}>
                                          {d.action}: {d.mechanicId} —{" "}
                                          {d.reason}
                                        </li>
                                      ),
                                    )}
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
                                  <Clarifications
                                    key={project.id + ":" + project.revision}
                                    questions={project.spec.questions}
                                    answers={answers}
                                    change={changeAnswers}
                                    disabled={running}
                                  />
                                  <button
                                    className="primary"
                                    disabled={
                                      running ||
                                      project.spec.questions.some(
                                        (q) =>
                                          !q.optional && !answers[q.id]?.trim(),
                                      )
                                    }
                                    onClick={() =>
                                      work(async () => {
                                        if (project.proposal) {
                                          const decisions = Object.fromEntries(
                                            Object.entries(answers).filter(
                                              ([, value]) => value.trim(),
                                            ),
                                          );
                                          setProject(
                                            await api<Project>(
                                              `/projects/${project.id}/messages`,
                                              "POST",
                                              {
                                                revision: project.revision,
                                                id: crypto.randomUUID(),
                                                text:
                                                  "Use these decisions in the proposal: " +
                                                  project
                                                    .spec!.questions.filter(
                                                      (q) => decisions[q.id],
                                                    )
                                                    .map(
                                                      (q) =>
                                                        q.prompt +
                                                        " " +
                                                        decisions[q.id],
                                                    )
                                                    .join(". "),
                                                answers: decisions,
                                              },
                                            ),
                                          );
                                          return;
                                        }
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
                                            {
                                              revision: p.revision,
                                              ...(generationLimit !== undefined
                                                ? {
                                                    generationBudgetMicros:
                                                      generationLimit,
                                                  }
                                                : {}),
                                            },
                                          ),
                                        );
                                      })
                                    }
                                  >
                                    {project.proposal
                                      ? "Update proposal with answers"
                                      : "Save answers & update plan"}
                                  </button>
                                </section>
                              )}
                              <details
                                className="brief-details"
                                open={
                                  project.approvedRevision !== project.revision
                                }
                              >
                                <summary>
                                  Specification ·{" "}
                                  {project.spec.requirements.length}{" "}
                                  requirements
                                </summary>
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
                              {!project.proposal && (
                                <div className="actions">
                                  <button
                                    className="primary"
                                    disabled={
                                      running ||
                                      conceptDirty ||
                                      project.spec.questions.length > 0
                                    }
                                    onClick={() =>
                                      work(async () => {
                                        const p = await api<Project>(
                                          "/projects/" +
                                            project.id +
                                            "/approve",
                                          "POST",
                                          { revision: project.revision },
                                        );
                                        setProject(p);
                                      })
                                    }
                                  >
                                    Approve specification
                                  </button>
                                  {project.approvedRevision ===
                                    project.revision &&
                                    !offlineMode &&
                                    tab === "Brief" && (
                                      <button
                                        className="primary"
                                        disabled={
                                          running || request !== project.request
                                        }
                                        onClick={() => action("build")}
                                      >
                                        {project.artifact
                                          ? "Rebuild"
                                          : "Generate game"}
                                      </button>
                                    )}
                                </div>
                              )}
                            </>
                          )}
                        </section>
                        {!offlineMode && (
                          <BuildPlan
                            project={project}
                            openSource={(file) => {
                              if (offlineMode) {
                                studioConnection.open();
                                return;
                              }
                              setFile(file);
                              setTab("Source");
                            }}
                          />
                        )}
                      </div>
                    }
                    {!offlineMode && tab !== "Brief" && (
                      <SettingsDialog
                        title={tab + " details"}
                        close={() => setTab("Brief")}
                        drawer
                      >
                        <div className="dialog-body project-detail-drawer">
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
                                    Each task uses your selected builder. A
                                    separate review checks coverage before
                                    bounded repairs.
                                  </p>
                                </div>
                                <div className="actions">
                                  {!project.proposal && (
                                    <button
                                      className="primary"
                                      disabled={
                                        running ||
                                        project.approvedRevision !==
                                          project.revision
                                      }
                                      onClick={() => action("build")}
                                    >
                                      {project.artifact
                                        ? "Rebuild"
                                        : "Generate game"}
                                    </button>
                                  )}
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
                                        <span
                                          className={"check-icon " + c.status}
                                        >
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
                                    These are the actual scripts and scene
                                    objects exported to Studio.
                                  </p>
                                </div>
                                {project.artifact &&
                                  !project.jobId &&
                                  ["ready_to_test", "verified"].includes(
                                    project.stage,
                                  ) &&
                                  !project.checks.some(
                                    (c) => c.status === "failed",
                                  ) && (
                                    <a
                                      className="button"
                                      href={
                                        "/api/projects/" +
                                        project.id +
                                        "/export"
                                      }
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
                                            source?.path === f.path
                                              ? "selected"
                                              : ""
                                          }
                                          onClick={() => setFile(f.path)}
                                        >
                                          {f.path}
                                        </button>
                                      ))}
                                    </nav>
                                    <div className="code-panel">
                                      <div>
                                        {source?.kind} ·{" "}
                                        {source?.path.split("/").at(-1)}
                                      </div>
                                      <pre>
                                        <code>{source?.source}</code>
                                      </pre>
                                    </div>
                                  </div>
                                  <details>
                                    <summary>
                                      Scene manifest ·{" "}
                                      {project.artifact.scene.length} objects
                                    </summary>
                                    <div className="scene-list">
                                      {project.artifact.scene.map((n) => (
                                        <p key={n.path}>
                                          <strong>{n.className}</strong>{" "}
                                          {n.path}
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
                                  Your generated source will appear here after a
                                  build.
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
                                    Connect Roblox Studio to apply your game and
                                    run its acceptance scenarios.
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
                                    Play in Studio to check animation, sound,
                                    controls and visual quality.
                                  </p>
                                  {project.artifact && (
                                    <VisualFeedback
                                      project={project}
                                      disabled={running}
                                      save={async (dataUrl, notes) =>
                                        work(async () =>
                                          setProject(
                                            await api<Project>(
                                              "/projects/" +
                                                project.id +
                                                "/visual",
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
                                      {project.studioEvidence.checks.map(
                                        (c, i) => (
                                          <p
                                            key={i}
                                            className={
                                              c.status === "failed"
                                                ? "failure"
                                                : ""
                                            }
                                          >
                                            {c.status} · {c.id}: {c.detail}
                                          </p>
                                        ),
                                      )}
                                      <details>
                                        <summary>Runtime logs</summary>
                                        <pre>
                                          {project.studioEvidence.logs.join(
                                            "\n",
                                          )}
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
                                      . Insert it into Studio and use “Save as
                                      Local Plugin” on the script.
                                    </li>
                                    <li>
                                      Open a new Studio session after
                                      installing, then open the Takko toolbar
                                      panel. Allow its local HTTP connection
                                      when Studio asks.
                                    </li>
                                    <li>
                                      Press Connect to Takko. The plugin pairs
                                      with this local app automatically; your
                                      session appears below.
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
                                    Use a saved test place. Review generated
                                    scripts before applying. Press Reconnect
                                    after restarting Takko.
                                  </p>
                                  {studios.map((s) => (
                                    <div
                                      className="connected-studio"
                                      key={s.id}
                                    >
                                      <strong>{s.name}</strong>
                                      {s.protocolVersion !== 2 && (
                                        <p>
                                          Update the Takko plugin and reconnect
                                          to enable operations.
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
                                                : s.operation.state ===
                                                    "cancelled"
                                                  ? "cancelled before execution"
                                                  : s.operation.state ===
                                                      "expired"
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
                                        {(["apply", "test"] as const).map(
                                          (kind) => (
                                            <button
                                              key={kind}
                                              disabled={
                                                running ||
                                                s.protocolVersion !== 2 ||
                                                !s.capabilities?.includes(
                                                  kind,
                                                ) ||
                                                [
                                                  "queued",
                                                  "dispatched",
                                                  "unknown",
                                                ].includes(
                                                  s.operation?.state ?? "",
                                                ) ||
                                                ![
                                                  "ready_to_test",
                                                  "verified",
                                                ].includes(project.stage) ||
                                                !project.artifact ||
                                                project.checks.some(
                                                  (c) => c.status === "failed",
                                                )
                                              }
                                              onClick={() =>
                                                work(async () => {
                                                  await api(
                                                    "/projects/" +
                                                      project.id +
                                                      "/studio",
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
                                          ),
                                        )}
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
                                  {studioMessage && (
                                    <p role="status">{studioMessage}</p>
                                  )}
                                </aside>
                              </div>
                            </section>
                          )}
                        </div>
                      </SettingsDialog>
                    )}
                  </div>
                  {
                    <form
                      className="chat-composer"
                      onDragOver={(e) => e.preventDefault()}
                      onDrop={assetDraft.drop}
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (
                          (!followup.trim() && !assetsChanged) ||
                          running ||
                          assetDraft.inspecting
                        )
                          return;
                        work(async () => {
                          const text =
                            followup.trim() ||
                            "Use the updated asset attachments and their stated roles.";
                          const savedAnswers = Object.fromEntries(
                            Object.entries(answers).filter(([, value]) =>
                              value.trim(),
                            ),
                          );
                          if (
                            !messageSubmission.current ||
                            messageSubmission.current.text !==
                              JSON.stringify([text, assetInputs, savedAnswers])
                          )
                            messageSubmission.current = {
                              text: JSON.stringify([
                                text,
                                assetInputs,
                                savedAnswers,
                              ]),
                              id: crypto.randomUUID(),
                            };
                          const revised = await api<Project>(
                            "/projects/" + project.id + "/messages",
                            "POST",
                            {
                              revision: project.revision,
                              id: messageSubmission.current.id,
                              text,
                              answers: savedAnswers,
                              assetAttachments: assetInputs,
                            },
                          );
                          if (!revised.proposal)
                            messageSubmission.current = null;
                          setTab("Brief");
                          setProject(revised);
                          setRequest(revised.request);
                          if (!revised.proposal) {
                            setFollowup("");
                            sessionStorage.removeItem(
                              "takko-draft-" + project.id,
                            );
                          }
                          if (!revised.proposal)
                            setProject(
                              await api<Project>(
                                "/projects/" +
                                  revised.id +
                                  (project.concept && conceptsEnabled
                                    ? "/concept"
                                    : "/plan"),
                                "POST",
                                {
                                  revision: revised.revision,
                                  ...(generationLimit !== undefined
                                    ? {
                                        generationBudgetMicros: generationLimit,
                                      }
                                    : {}),
                                },
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
                        rows={1}
                        onKeyDown={(e) => {
                          if (
                            e.key === "Enter" &&
                            !e.shiftKey &&
                            !e.nativeEvent.isComposing
                          ) {
                            e.preventDefault();
                            if (
                              !running &&
                              !assetDraft.inspecting &&
                              request === project.request
                            )
                              e.currentTarget.form?.requestSubmit();
                          }
                        }}
                        placeholder="What would you like to add or change?"
                        value={followup}
                        onChange={(e) => {
                          setFollowup(e.target.value);
                          sessionStorage.setItem(
                            "takko-draft-" + project.id,
                            e.target.value,
                          );
                        }}
                        maxLength={6000}
                        disabled={running}
                      />
                      <AssetAttachments
                        draft={assetDraft}
                        disabled={running || assetDraft.inspecting}
                      />
                      <div className="composer-footer">
                        <button
                          type="button"
                          className="attach-button"
                          aria-label="Browse Marketplace assets"
                          onClick={toggleMarketplace}
                        >
                          <Icon name="grid" size={18} />
                          <span>Marketplace</span>
                        </button>
                        <button
                          type="button"
                          className="attach-button"
                          aria-label="Attach Studio feedback"
                          onClick={openStudioSetup}
                        >
                          <Icon name="plus" />
                        </button>
                        <button
                          type="button"
                          className="composer-setting"
                          onClick={() => navigateSettings("presets")}
                        >
                          Presets <Icon name="chevron" size={14} />
                        </button>
                        <button
                          type="button"
                          className="composer-setting"
                          aria-label="Budget for this generation"
                          onClick={() => setBudgetDialog(true)}
                        >
                          Budget
                          {generationLimit !== undefined
                            ? " · $" + (generationLimit / 1e6).toFixed(2)
                            : ""}
                        </button>
                        <button
                          className="primary send-button"
                          aria-label="Send message and update plan"
                          disabled={
                            running ||
                            assetDraft.inspecting ||
                            (!followup.trim() && !assetsChanged) ||
                            followup.trim().length > 6000 ||
                            request !== project.request
                          }
                        >
                          <Icon name="arrow" />
                        </button>
                      </div>
                      <small className="composer-hint">
                        {request !== project.request
                          ? "Save your edited brief using the plan button before sending a follow-up. "
                          : ""}
                        {running
                          ? "Takko is working. You can cancel above."
                          : "Enter to send · Shift + Enter for a new line"}
                      </small>
                    </form>
                  }
                </section>
              </WorkspaceSplit>
            )}
          </>
        )}
      </main>
      {marketOpen && !settingsPage && (
        <Marketplace
          key={project?.id + ":" + (pickingGroup ?? "browse")}
          picking={
            pickingGroup && project
              ? { project, groupId: pickingGroup, update: receiveAssetProject }
              : undefined
          }
          draft={assetDraft}
          disabled={running}
          close={() => {
            setMarketOpen(false);
            setPickingGroup(undefined);
          }}
        />
      )}
      {budgetDialog && (
        <GenerationBudgetDialog
          value={generationLimit}
          project={project}
          close={() => setBudgetDialog(false)}
          save={setGenerationLimit}
        />
      )}
    </div>
  );
}

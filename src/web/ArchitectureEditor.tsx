import { useEffect, useRef, useState } from "react";
import type { Project } from "../generation/schema";
import {
  architectureSemantics,
  architectureSchema,
  type GameArchitecture,
} from "../generation/architecture";
import { layoutGraph, projectGraph, systemEvidence } from "./workspace-graph";

export function ArchitectureEditor({
  project,
  ask,
  details,
  save,
  presentation,
  docked = false,
}: {
  project: Project;
  ask: (message: string) => void;
  details: (name: string) => void;
  save: (graph: GameArchitecture, id: string) => Promise<void>;
  docked?: boolean;
  /** Optional preview presentation. Does not alter graph contracts or execution. */
  presentation?: {
    initialSelection?: string;
    layoutKey?: string;
    nodeHeight?: number;
    bottomInset?: number;
    nodeStatus?: (id: string) => { label: string; working?: boolean };
  };
}) {
  const original = projectGraph(project);
  const remoteKey = JSON.stringify(original);
  const draftKey = `takko-architecture-draft-${project.id}`;
  const [initial] = useState(() => {
    try {
      const stored = JSON.parse(sessionStorage.getItem(draftKey) ?? "null");
      const parsed = architectureSchema.safeParse(stored?.graph);
      if (parsed.success && typeof stored.baseKey === "string")
        return { graph: parsed.data, baseKey: stored.baseKey };
    } catch {
      /* A damaged local draft must not prevent opening the project. */
    }
    return { graph: structuredClone(original), baseKey: remoteKey };
  });
  const [baseKey, setBaseKey] = useState(initial.baseKey);
  const [inspector, setInspector] = useState(false);
  const [connectionsView, setConnectionsView] = useState(false);
  const [camera, setCamera] = useState({ x: 20, y: 20, zoom: 1 });
  const surface = useRef<HTMLDivElement>(null);
  const pan = useRef<{ x: number; y: number; px: number; py: number } | null>(
    null,
  );
  const [changed, setChanged] = useState(false);
  const [graph, setGraph] = useState<GameArchitecture>(initial.graph);
  const [selected, setSelected] = useState(
    presentation?.initialSelection ?? "",
  );
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [event, setEvent] = useState("");
  const [effect, setEffect] = useState("");
  const [kind, setKind] = useState<"event" | "state">("event");
  const [review, setReview] = useState(false);
  const [saving, setBusy] = useState(false);
  const busy = saving || !!project.jobId;
  const [error, setError] = useState("");
  const submission = useRef(crypto.randomUUID());
  const drag = useRef<{
    id: string;
    x: number;
    y: number;
    px: number;
    py: number;
  } | null>(null);
  const dirty = JSON.stringify(graph) !== baseKey;
  const unsaved =
    JSON.stringify(graph) !==
    JSON.stringify(project.architecture ?? { nodes: [], edges: [] });
  const conflict = remoteKey !== baseKey && dirty;
  useEffect(() => {
    if (dirty)
      sessionStorage.setItem(draftKey, JSON.stringify({ graph, baseKey }));
    else sessionStorage.removeItem(draftKey);
  }, [graph, baseKey, dirty, draftKey]);
  useEffect(() => {
    if (remoteKey === baseKey || dirty) return;
    setGraph(structuredClone(original));
    setBaseKey(remoteKey);
    setChanged(true);
  }, [remoteKey, baseKey, dirty]);
  useEffect(() => {
    if (!changed) return;
    const timer = setTimeout(() => setChanged(false), 1800);
    return () => clearTimeout(timer);
  }, [changed]);
  const fit = (value = graph) => {
    const box = surface.current?.getBoundingClientRect();
    if (!box || !value.nodes.length) return;
    const minX = Math.min(...value.nodes.map((n) => n.x)),
      minY = Math.min(...value.nodes.map((n) => n.y));
    const width = Math.max(...value.nodes.map((n) => n.x + 200)) - minX,
      height =
        Math.max(
          ...value.nodes.map((n) => n.y + (presentation?.nodeHeight ?? 100)),
        ) - minY;
    const availableHeight = box.height - (presentation?.bottomInset ?? 0);
    const zoom = Math.max(
      0.25,
      Math.min(1.15, (box.width - 60) / width, (availableHeight - 60) / height),
    );
    setCamera({
      zoom,
      x: (box.width - width * zoom) / 2 - minX * zoom,
      y: (availableHeight - height * zoom) / 2 - minY * zoom,
    });
  };
  const fitted = useRef(0);
  const currentFit = useRef(fit);
  useEffect(() => {
    currentFit.current = fit;
  });
  useEffect(() => {
    if (!docked || !surface.current) return;
    let frame = 0;
    const observer = new ResizeObserver(() => {
      cancelAnimationFrame(frame);
      frame = requestAnimationFrame(() => currentFit.current());
    });
    observer.observe(surface.current);
    return () => {
      observer.disconnect();
      cancelAnimationFrame(frame);
    };
  }, [docked]);
  useEffect(() => {
    if (presentation?.layoutKey) fit();
  }, [presentation?.layoutKey]);
  useEffect(() => {
    if (graph.nodes.length > fitted.current) {
      fit();
    }
    fitted.current = graph.nodes.length;
  }, [graph.nodes.length]);
  const layoutOnly =
    !!project.architecture &&
    architectureSemantics(graph) ===
      architectureSemantics(project.architecture);
  const node = graph.nodes.find((n) => n.id === selected);
  const update = (next: GameArchitecture) => {
    setGraph(next);
    setReview(false);
    setError("");
    submission.current = crypto.randomUUID();
  };
  const linked =
    project.spec?.requirements.filter(
      (r) => r.sourceId === `architecture:node:${selected}`,
    ) ?? [];
  const files = [
    ...new Set(
      project.spec?.tasks
        .filter((t) => linked.some((r) => t.requirements.includes(r.id)))
        .flatMap((t) => t.files) ?? [],
    ),
  ];
  return (
    <section
      className={`architecture-editor architecture-workspace${docked ? " architecture-docked" : ""}${inspector ? " inspector-open" : ""}`}
      aria-label="Game architecture"
    >
      <header className="canvas-heading">
        <div>
          {docked && (
            <span className="canvas-eyebrow">Your game, connected</span>
          )}
          <strong
            className="bounded-name"
            title={docked ? "Game architecture" : project.name}
          >
            {docked ? "Game architecture" : project.name}
          </strong>
          <small>
            {project.stage.replaceAll("_", " ")} ·{" "}
            {project.architecture
              ? unsaved
                ? "Unsaved architecture changes"
                : "Saved architecture"
              : project.spec?.architectureProposal
                ? "Proposed architecture"
                : "Game architecture"}
          </small>
        </div>
        <div className="canvas-detail-actions">
          {["Build", "Source", "Studio"].map((name) => (
            <button
              key={name}
              aria-label={name + " details"}
              onClick={() => details(name)}
            >
              {name}
            </button>
          ))}
        </div>
      </header>
      <div className="architecture-toolbar">
        <span>
          {graph.nodes.length} systems · {graph.edges.length} connections
        </span>
        {dirty && (
          <button
            disabled={busy}
            onClick={() => {
              setGraph(structuredClone(original));
              setBaseKey(remoteKey);
              setReview(false);
            }}
          >
            Discard draft
          </button>
        )}
        <button
          disabled={busy}
          onClick={() => {
            setConnectionsView(true);
            setInspector(true);
          }}
        >
          Connections
        </button>
        <button
          disabled={busy || graph.nodes.length >= 24}
          onClick={() => {
            const id = crypto.randomUUID();
            update({
              ...graph,
              nodes: [
                ...graph.nodes,
                {
                  id,
                  name: "New system",
                  purpose: "Describe what this system does for the player.",
                  authority: "server",
                  x: 35 + (graph.nodes.length % 3) * (docked ? 280 : 230),
                  y:
                    40 +
                    Math.floor(graph.nodes.length / 3) * (docked ? 210 : 130),
                },
              ],
            });
            setSelected(id);
            setConnectionsView(false);
            setInspector(true);
          }}
        >
          Add system
        </button>
      </div>
      <div
        className={
          "architecture-scroll map-surface " + (changed ? "map-updated" : "")
        }
        ref={surface}
        aria-label="Architecture canvas"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.target !== e.currentTarget) return;
          const direction: Record<string, [number, number]> = {
            ArrowLeft: [40, 0],
            ArrowRight: [-40, 0],
            ArrowUp: [0, 40],
            ArrowDown: [0, -40],
          };
          const delta = direction[e.key];
          if (delta) {
            e.preventDefault();
            setCamera((c) => ({ ...c, x: c.x + delta[0], y: c.y + delta[1] }));
          }
        }}
        onWheel={(e) => {
          const rect = e.currentTarget.getBoundingClientRect();
          const px = e.clientX - rect.left,
            py = e.clientY - rect.top;
          setCamera((c) => {
            const zoom = Math.max(
              0.25,
              Math.min(2, c.zoom * Math.exp(-e.deltaY * 0.001)),
            );
            return {
              zoom,
              x: px - ((px - c.x) * zoom) / c.zoom,
              y: py - ((py - c.y) * zoom) / c.zoom,
            };
          });
        }}
        onPointerDown={(e) => {
          if ((e.target as HTMLElement).closest("button")) return;
          pan.current = {
            x: camera.x,
            y: camera.y,
            px: e.clientX,
            py: e.clientY,
          };
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          const p = pan.current;
          if (p && e.buttons)
            setCamera((c) => ({
              ...c,
              x: p.x + e.clientX - p.px,
              y: p.y + e.clientY - p.py,
            }));
        }}
        onPointerUp={() => {
          pan.current = null;
        }}
        onPointerCancel={() => {
          pan.current = null;
        }}
      >
        {!graph.nodes.length && (
          <div className="architecture-empty">
            <strong>Start with your first game system</strong>
            <p>
              Describe your game to Takko, or add a system using the toolbar.
            </p>
            <button
              type="button"
              onClick={() => ask("Help me plan the systems for this game.")}
            >
              Ask Takko
            </button>
            <small>Combat · Inventory · Quests</small>
          </div>
        )}
        <div
          className="architecture-canvas"
          style={{
            transform: `translate(${camera.x}px, ${camera.y}px) scale(${camera.zoom})`,
            width: Math.max(740, ...graph.nodes.map((n) => n.x + 230)),
            height: Math.max(
              330,
              ...graph.nodes.map((n) => n.y + (docked ? 200 : 130)),
            ),
          }}
        >
          <svg className="architecture-wires" aria-label="System connections">
            <defs>
              <marker
                id="flow-arrow"
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="7"
                markerHeight="7"
                orient="auto-start-reverse"
              >
                <path d="M 0 0 L 10 5 L 0 10 z" fill="currentColor" />
              </marker>
            </defs>
            {graph.edges.map((edge) => {
              const a = graph.nodes.find((n) => n.id === edge.from)!,
                b = graph.nodes.find((n) => n.id === edge.to)!;
              const portY = docked ? 126 : 45;
              const centerX = (a.x + (docked ? 200 : 190) + b.x) / 2;
              const channelY = Math.max(a.y, b.y) + 154;
              return (
                <g key={edge.id}>
                  <path
                    d={
                      docked
                        ? `M ${a.x + 200} ${a.y + portY} C ${a.x + 245} ${a.y + portY}, ${centerX - 30} ${channelY}, ${centerX} ${channelY} C ${centerX + 30} ${channelY}, ${b.x - 45} ${b.y + portY}, ${b.x} ${b.y + portY}`
                        : `M ${a.x + 190} ${a.y + portY} C ${a.x + 240} ${a.y + portY}, ${b.x - 50} ${b.y + portY}, ${b.x} ${b.y + portY}`
                    }
                    markerEnd="url(#flow-arrow)"
                  />
                  <text
                    x={centerX}
                    y={docked ? channelY + 19 : (a.y + b.y) / 2 + 35}
                  >
                    {edge.event}
                  </text>
                </g>
              );
            })}
          </svg>
          {graph.nodes.map((n) => (
            <div
              key={n.id}
              className={`architecture-node ${selected === n.id ? "selected" : ""} ${(presentation?.nodeStatus?.(n.id)?.working ?? systemEvidence(project, n.id).active) ? "node-working" : ""}`}
              style={{ left: n.x, top: n.y }}
            >
              <button
                className="architecture-node-title"
                aria-label={`Edit ${n.name}`}
                onClick={() => {
                  setSelected(n.id);
                  setConnectionsView(false);
                  setInspector(true);
                }}
                onPointerDown={(e) => {
                  if (busy) return;
                  drag.current = {
                    id: n.id,
                    x: n.x,
                    y: n.y,
                    px: e.clientX,
                    py: e.clientY,
                  };
                  e.currentTarget.setPointerCapture(e.pointerId);
                }}
                onPointerMove={(e) => {
                  const d = drag.current;
                  if (d?.id === n.id && e.buttons)
                    update({
                      ...graph,
                      nodes: graph.nodes.map((item) =>
                        item.id === d.id
                          ? {
                              ...item,
                              x: Math.min(
                                4000,
                                Math.max(
                                  0,
                                  d.x + (e.clientX - d.px) / camera.zoom,
                                ),
                              ),
                              y: Math.min(
                                4000,
                                Math.max(
                                  0,
                                  d.y + (e.clientY - d.py) / camera.zoom,
                                ),
                              ),
                            }
                          : item,
                      ),
                    });
                }}
                onPointerUp={() => {
                  drag.current = null;
                }}
                onPointerCancel={() => {
                  drag.current = null;
                }}
              >
                <small>
                  {n.authority === "server"
                    ? "Server · trusted logic"
                    : n.authority === "client"
                      ? "Player · presentation"
                      : "Shared module"}
                </small>
                <strong>{n.name}</strong>
                <small>
                  {presentation?.nodeStatus?.(n.id)?.label ??
                    systemEvidence(project, n.id).status}
                </small>
              </button>
              <div className="architecture-ports">
                <button
                  disabled={busy}
                  aria-label={`Receive at ${n.name}`}
                  onClick={() => {
                    setTo(n.id);
                    setConnectionsView(true);
                    setInspector(true);
                  }}
                >
                  ● In
                </button>
                <button
                  disabled={busy}
                  aria-label={`Connect from ${n.name}`}
                  onClick={() => {
                    setFrom(n.id);
                    setConnectionsView(true);
                    setInspector(true);
                  }}
                >
                  Out ●
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="canvas-controls" aria-label="Canvas controls">
        <button
          aria-label="Zoom out canvas"
          onClick={() =>
            setCamera((c) => ({ ...c, zoom: Math.max(0.25, c.zoom - 0.1) }))
          }
        >
          −
        </button>
        <span>{Math.round(camera.zoom * 100)}%</span>
        <button
          aria-label="Zoom in canvas"
          onClick={() =>
            setCamera((c) => ({ ...c, zoom: Math.min(2, c.zoom + 0.1) }))
          }
        >
          +
        </button>
        <button onClick={() => fit()}>Fit</button>
        <button
          disabled={busy}
          onClick={() => {
            const next = layoutGraph(graph);
            update(next);
            fit(next);
          }}
        >
          Auto layout
        </button>
      </div>
      {inspector && (
        <aside className="canvas-inspector" aria-label="Architecture inspector">
          <div className="inspector-heading">
            <strong>
              {connectionsView ? "Connections" : (node?.name ?? "Connections")}
            </strong>
            {node && (
              <button
                className="inspector-view-toggle"
                onClick={() => setConnectionsView((v) => !v)}
              >
                {connectionsView ? "System details" : "Connections"}
              </button>
            )}
            <button
              aria-label="Close inspector"
              onClick={() => setInspector(false)}
            >
              ×
            </button>
          </div>
          {node && !connectionsView && (
            <fieldset disabled={busy}>
              <legend>System details</legend>
              <label>
                System name
                <input
                  value={node.name}
                  maxLength={80}
                  onChange={(e) =>
                    update({
                      ...graph,
                      nodes: graph.nodes.map((n) =>
                        n.id === node.id ? { ...n, name: e.target.value } : n,
                      ),
                    })
                  }
                />
              </label>
              <label>
                What does it do?
                <textarea
                  aria-label="What does it do?"
                  value={node.purpose}
                  maxLength={600}
                  onChange={(e) =>
                    update({
                      ...graph,
                      nodes: graph.nodes.map((n) =>
                        n.id === node.id
                          ? { ...n, purpose: e.target.value }
                          : n,
                      ),
                    })
                  }
                />
              </label>
              <label>
                Runs on
                <select
                  value={node.authority}
                  onChange={(e) =>
                    update({
                      ...graph,
                      nodes: graph.nodes.map((n) =>
                        n.id === node.id
                          ? {
                              ...n,
                              authority: e.target.value as typeof n.authority,
                            }
                          : n,
                      ),
                    })
                  }
                >
                  <option value="server">Server: rules, rewards, damage</option>
                  <option value="client">
                    Player: controls, visuals, sound
                  </option>
                  <option value="shared">Shared: reusable logic</option>
                </select>
              </label>
              <p className="muted">
                {files.length
                  ? `Planned files: ${files.join(", ")}`
                  : "No implementation is linked yet. Save and plan this architecture to assign files."}
              </p>
              <button
                onClick={() =>
                  ask("Help me improve " + node.name + ": " + node.purpose)
                }
              >
                Discuss this system
              </button>
              {files.length > 0 && (
                <button onClick={() => details("Source")}>
                  View linked source
                </button>
              )}
              <button
                className="remove-system"
                onClick={() => {
                  update({
                    nodes: graph.nodes.filter((n) => n.id !== node.id),
                    edges: graph.edges.filter(
                      (e) => e.from !== node.id && e.to !== node.id,
                    ),
                  });
                  setSelected("");
                }}
              >
                Remove system and its connections
              </button>
            </fieldset>
          )}
          {(connectionsView || !node) && (
            <div className="inspector-connections-view">
              <fieldset disabled={busy || graph.nodes.length < 2}>
                <legend>Connect systems</legend>
                <div className="architecture-fields">
                  <label>
                    From
                    <select
                      aria-label="From"
                      value={from}
                      onChange={(e) => setFrom(e.target.value)}
                    >
                      <option value="">Choose system</option>
                      {graph.nodes.map((n) => (
                        <option key={n.id} value={n.id}>
                          {n.name}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label>
                    To
                    <select
                      aria-label="To"
                      value={to}
                      onChange={(e) => setTo(e.target.value)}
                    >
                      <option value="">Choose system</option>
                      {graph.nodes
                        .filter((n) => n.id !== from)
                        .map((n) => (
                          <option key={n.id} value={n.id}>
                            {n.name}
                          </option>
                        ))}
                    </select>
                  </label>
                  <label>
                    Connection type
                    <select
                      value={kind}
                      onChange={(e) => setKind(e.target.value as typeof kind)}
                    >
                      <option value="event">When something happens</option>
                      <option value="state">When a value changes</option>
                    </select>
                  </label>
                </div>
                <label>
                  When
                  <input
                    placeholder="A hit lands"
                    value={event}
                    maxLength={80}
                    onChange={(e) => setEvent(e.target.value)}
                  />
                </label>
                <label>
                  Then
                  <textarea
                    aria-label="Then"
                    placeholder="Add 10 energy to the attacker. The server verifies the hit first."
                    value={effect}
                    maxLength={600}
                    onChange={(e) => setEffect(e.target.value)}
                  />
                </label>
                <button
                  onClick={() => {
                    const next = {
                      ...graph,
                      edges: [
                        ...graph.edges,
                        {
                          id: crypto.randomUUID(),
                          from,
                          to,
                          kind,
                          event,
                          effect,
                        },
                      ],
                    };
                    const result = architectureSchema.safeParse(next);
                    if (!result.success)
                      setError(result.error.issues[0].message);
                    else {
                      update(result.data);
                      setEvent("");
                      setEffect("");
                    }
                  }}
                >
                  Add connection
                </button>
              </fieldset>
              <ul className="architecture-connections">
                {graph.edges.map((e) => (
                  <li key={e.id}>
                    <div>
                      <strong>
                        {graph.nodes.find((n) => n.id === e.from)?.name} →{" "}
                        {graph.nodes.find((n) => n.id === e.to)?.name}
                      </strong>
                      <p>
                        When {e.event}: {e.effect}
                      </p>
                    </div>
                    <button
                      disabled={busy}
                      aria-label={`Remove connection ${e.event}`}
                      onClick={() =>
                        update({
                          ...graph,
                          edges: graph.edges.filter((edge) => edge.id !== e.id),
                        })
                      }
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      )}
      <div className="canvas-save">
        {conflict && (
          <p role="alert">
            A newer architecture arrived. Your edits are kept here.{" "}
            <button
              onClick={() => {
                setGraph(structuredClone(original));
                setBaseKey(remoteKey);
                setReview(false);
              }}
            >
              Load latest architecture
            </button>
          </p>
        )}
        {review && (
          <div className="architecture-review">
            <strong>Review before saving</strong>
            {layoutOnly ? (
              <p>
                Only node positions changed. Saving preserves the game, plan and
                approval. No model call or Studio change is needed.
              </p>
            ) : (
              <p>
                This replaces the architecture with {graph.nodes.length} systems
                and {graph.edges.length} connections. Your old plan and approval
                will be cleared. The previous artifact stays in project history.
                Saving does not change Studio or spend money.
              </p>
            )}
            <p>
              The next plan must assign every system and connection to
              requirements and implementation tasks. Runtime behavior still
              needs a build and a playtest.
            </p>
          </div>
        )}
        {error && <p role="alert">{error}</p>}
        <div className="dialog-actions">
          <button
            disabled={busy || !unsaved || conflict}
            onClick={async () => {
              const result = architectureSchema.safeParse(graph);
              if (!result.success) {
                setError(result.error.issues[0].message);
                return;
              }
              if (!review) {
                if (docked) setInspector(false);
                setReview(true);
                return;
              }
              setBusy(true);
              try {
                await save(result.data, submission.current);
                setBaseKey(JSON.stringify(result.data));
                setReview(false);
              } catch (e) {
                setError((e as Error).message);
              } finally {
                setBusy(false);
              }
            }}
          >
            {busy ? "Saving…" : review ? "Save architecture" : "Review changes"}
          </button>
        </div>
      </div>
    </section>
  );
}

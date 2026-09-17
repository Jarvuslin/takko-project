import { useRef, useState } from "react";
import type { Project } from "../generation/schema";

export const examplePrompts = [
  {
    icon: "⚔",
    title: "Make a combat system",
    prompt:
      "Make an animated combat system with combos, blocking, hit reactions and mobile controls.",
  },
  {
    icon: "▦",
    title: "Build a shop UI",
    prompt:
      "Build a shop UI with item previews, prices, purchases and a coin balance.",
  },
  {
    icon: "♙",
    title: "Create claimable plots",
    prompt:
      "Create claimable plots that each player can own, build on and release when leaving.",
  },
  {
    icon: "◷",
    title: "Add timed rounds",
    prompt:
      "Add timed rounds with an intermission, a countdown, scoring and a results screen.",
  },
  {
    icon: "⚒",
    title: "Add a building mechanic",
    prompt:
      "Add a building mechanic with a placement preview, grid snapping and rotation.",
  },
  {
    icon: "♧",
    title: "Make a farming loop",
    prompt:
      "Make a farming loop with crop growth, harvesting, selling and a seasonal shop.",
  },
];

// Only declared task dependencies are edges. Completion is build progress,
// never a claim that a mechanic has passed a Studio playtest.
export function mapData(project: Project) {
  const tasks = project.spec?.tasks ?? [];
  const radius = tasks.length > 6 ? 260 : 210;
  const nodes = tasks.map((task, index) => {
    const angle = (index / tasks.length) * Math.PI * 2 - Math.PI / 2;
    return {
      ...task,
      x: 450 + Math.cos(angle) * radius,
      y: 350 + Math.sin(angle) * radius,
      built: project.completedBuildTasks?.includes(task.id) ?? false,
    };
  });
  const edges = nodes.flatMap((node) =>
    node.dependsOn.flatMap((id) => {
      const from = nodes.find((n) => n.id === id);
      return from ? [{ from, to: node }] : [];
    }),
  );
  return { nodes, edges };
}

export function MechanicsMap({
  project,
  explore,
  setExplore,
  openStudio,
  openSource,
  suggest,
}: {
  project: Project;
  explore: boolean;
  setExplore: (value: boolean) => void;
  openStudio: () => void;
  openSource: (file: string) => void;
  suggest: (prompt: string) => void;
}) {
  const { nodes, edges } = mapData(project);
  const [zoom, setZoom] = useState(1);
  const [offset, setOffset] = useState({ x: 0, y: 0 });
  const [selected, setSelected] = useState("");
  const drag = useRef<{ x: number; y: number; ox: number; oy: number } | null>(
    null,
  );
  const task = nodes.find((node) => node.id === selected);
  return (
    <section className="map-panel" aria-label="Mechanics map">
      <div className="map-toolbar">
        <div className="map-project">
          <strong>{project.name}</strong>
          <span>
            ♧ {nodes.length} tasks · {edges.length} links
          </span>
        </div>
        <div className="mode-switch" aria-label="Workspace mode">
          <button aria-pressed={!explore} onClick={() => setExplore(false)}>
            Agent
          </button>
          <button aria-pressed={explore} onClick={() => setExplore(true)}>
            Explore
          </button>
        </div>
        <button className="studio-launch" onClick={openStudio}>
          ▣ <span>Connect Studio</span>
        </button>
      </div>
      <div
        className="map-viewport"
        onPointerDown={(e) => {
          if ((e.target as HTMLElement).closest("button")) return;
          drag.current = {
            x: e.clientX,
            y: e.clientY,
            ox: offset.x,
            oy: offset.y,
          };
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (drag.current)
            setOffset({
              x: drag.current.ox + e.clientX - drag.current.x,
              y: drag.current.oy + e.clientY - drag.current.y,
            });
        }}
        onPointerUp={() => {
          drag.current = null;
        }}
        onPointerCancel={() => {
          drag.current = null;
        }}
      >
        <div
          className="map-world"
          style={{
            transform: `translate(calc(-50% + ${offset.x}px), calc(-50% + ${offset.y}px)) scale(calc(${zoom} * var(--map-fit, 1)))`,
          }}
        >
          <svg className="map-lines" viewBox="0 0 900 700" aria-hidden="true">
            <defs>
              <marker
                id="dependency-arrow"
                viewBox="0 0 10 10"
                refX="9"
                refY="5"
                markerWidth="5"
                markerHeight="5"
                orient="auto-start-reverse"
              >
                <path d="M0 0 L10 5 L0 10" fill="none" stroke="#70b9b4" />
              </marker>
            </defs>
            {edges.map(({ from, to }) => (
              <line
                key={from.id + to.id}
                x1={from.x}
                y1={from.y}
                x2={to.x}
                y2={to.y}
                markerEnd="url(#dependency-arrow)"
              />
            ))}
            {nodes.map((node) => (
              <line
                className="root-link"
                key={node.id}
                x1="450"
                y1="350"
                x2={node.x}
                y2={node.y}
              />
            ))}
          </svg>
          <div className="map-root">
            <span className="hexagon">✦</span>
            <strong>{project.name}</strong>
          </div>
          {nodes.map((node, index) => (
            <button
              className={
                "mechanic-node" + (selected === node.id ? " active" : "")
              }
              key={node.id}
              style={{ left: node.x, top: node.y }}
              onClick={() => setSelected(node.id)}
              aria-label={"Inspect task: " + node.title}
              aria-pressed={selected === node.id}
            >
              <span className="hexagon">
                {["⚒", "⚡", "▦", "◈", "♫", "✧"][index % 6]}
                <small>{node.built ? "✓" : "○"}</small>
              </span>
              <strong>{node.title}</strong>
              <span className="node-status">
                {node.built ? "Built · not a playtest result" : "Planned"}
              </span>
            </button>
          ))}
          {!nodes.length && (
            <div className="map-empty">
              <h2>Your game starts here</h2>
              <p>
                Describe a mechanic in chat. Your plan will appear here as
                connected tasks.
              </p>
            </div>
          )}
        </div>
      </div>
      {task && (
        <section className="task-inspector" aria-label="Task details">
          <div className="section-head">
            <h2>{task.title}</h2>
            <button
              aria-label="Close task details"
              onClick={() => setSelected("")}
            >
              ×
            </button>
          </div>
          <p className="muted">
            {task.built
              ? "Build task completed. Check Studio for runtime evidence."
              : "Planned task. No completed build recorded."}
          </p>
          {project.spec?.requirements
            .filter((r) => task.requirements.includes(r.id))
            .map((r) => (
              <p key={r.id}>
                <strong>{r.description}</strong>
                <br />
                {r.acceptance}
              </p>
            ))}
          {task.files.map((file) => (
            <button
              className="file-link"
              key={file}
              onClick={() => openSource(file)}
            >
              {file} ↗
            </button>
          ))}
          <button
            onClick={() => {
              suggest("For " + task.title + ", ");
              setSelected("");
            }}
          >
            Discuss this task ↗
          </button>
        </section>
      )}
      <div className="map-controls">
        <button
          aria-label="Zoom out"
          disabled={zoom <= 0.5}
          onClick={() => setZoom((z) => Math.max(0.5, z - 0.1))}
        >
          −
        </button>
        <output aria-label="Map zoom">{Math.round(zoom * 100)}%</output>
        <button
          aria-label="Zoom in"
          disabled={zoom >= 1.5}
          onClick={() => setZoom((z) => Math.min(1.5, z + 0.1))}
        >
          +
        </button>
        <button
          onClick={() => {
            setZoom(1);
            setOffset({ x: 0, y: 0 });
          }}
        >
          Reset view
        </button>
      </div>
      <span className="map-legend">
        Drag to pan · solid lines are task dependencies
      </span>
    </section>
  );
}

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type ReactNode,
} from "react";
import { ArchitectureEditor } from "../ArchitectureEditor";
import { AnimationPlayer } from "../AnimationPlayer";
import { Icon, TakkoMark } from "../Icons";
import {
  createLabProject,
  directions,
  importedWalk,
  type Direction,
  type RunState,
} from "./fixture";
import "./design-lab.css";

function GlyphButton({
  name,
  label,
  onClick,
}: {
  name: Parameters<typeof Icon>[0]["name"];
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      className="dl-icon-button"
      title={label}
      aria-label={label}
      onClick={onClick}
    >
      <Icon name={name} size={17} />
    </button>
  );
}
function Pill({
  children,
  tone = "quiet",
}: {
  children: ReactNode;
  tone?: string;
}) {
  return (
    <span className={`dl-pill ${tone}`}>
      <i />
      {children}
    </span>
  );
}
function Dialog({
  title,
  children,
  close,
}: {
  title: string;
  children: ReactNode;
  close: () => void;
}) {
  const ref = useRef<HTMLDialogElement>(null);
  useEffect(() => {
    ref.current?.showModal();
    return () => ref.current?.close();
  }, []);
  return (
    <dialog
      ref={ref}
      className="dl-dialog"
      aria-label={title}
      onCancel={close}
      onClick={(e) => {
        if (e.target === e.currentTarget) close();
      }}
    >
      <header>
        <div>
          <span className="dl-eyebrow">DESIGN LAB</span>
          <h2>{title}</h2>
        </div>
        <GlyphButton name="close" label="Close dialog" onClick={close} />
      </header>
      {children}
    </dialog>
  );
}

export default function DesignLab() {
  const [direction, setDirection] = useState<Direction>("A");
  const [project, setProject] = useState(createLabProject);
  const [run, setRun] = useState<RunState>("working");
  const [studio, setStudio] = useState("Disconnected");
  const [modal, setModal] = useState("");
  const [prompt, setPrompt] = useState("");
  const [message, setMessage] = useState("");
  const [reviewed, setReviewed] = useState(false);
  const [detail, setDetail] = useState(false);
  const [width, setWidth] = useState<number | null>(null);
  const [navigation, setNavigation] = useState("Architecture");
  const [loadingPreview, setLoadingPreview] = useState(false);
  const paneDrag = useRef<{ x: number; width: number } | null>(null);
  const messageRef = useRef<HTMLTextAreaElement>(null);
  useEffect(() => {
    const id = project.id;
    return () => sessionStorage.removeItem(`takko-architecture-draft-${id}`);
  }, [project.id]);
  const ask = (text: string) => {
    setPrompt(text);
    messageRef.current?.focus();
  };
  const selectDirection = (value: Direction) => {
    setDirection(value);
    setWidth(null);
  };
  const status = {
    queued: "Waiting to start",
    working: "Updating Energy",
    finished: "Changes ready to test",
    failed: "Energy update needs attention",
  }[run];
  return (
    <div
      className={`design-lab dl-${direction}`}
      style={
        width
          ? ({ "--dl-agent-width": `${width}px` } as CSSProperties)
          : undefined
      }
    >
      <header className="dl-labbar">
        <div className="dl-lab-title">
          <span className="dl-lab-dot" /> Design lab{" "}
          <span className="dl-dim">/ Workspace explorations</span>
        </div>
        <div className="dl-switch" role="group" aria-label="Design direction">
          {(Object.keys(directions) as Direction[]).map((key) => (
            <button
              key={key}
              aria-pressed={direction === key}
              onClick={() => selectDirection(key)}
            >
              <b>{key}</b>
              <span>{directions[key].name}</span>
            </button>
          ))}
        </div>
        <button
          className="dl-state-button"
          onClick={() => setModal("Design & states")}
        >
          <Icon name="sliders" size={15} /> Design & states
        </button>
      </header>
      <div className="dl-shell">
        <aside className="dl-sidebar">
          <div className="dl-brand">
            <TakkoMark />
            <strong>takko</strong>
            <span className="dl-brand-tail">/</span>
          </div>
          <button
            className="dl-project-picker"
            onClick={() => setModal("Project")}
          >
            <span className="dl-project-icon">
              <Icon name="cube" size={18} />
            </span>
            <span>
              <b>Arena</b>
              <small>Personal workspace</small>
            </span>
            <Icon name="chevron" size={14} />
          </button>
          <nav aria-label="Design lab navigation">
            <p className="dl-nav-label">WORKSPACE</p>
            {(
              [
                ["grid", "Architecture"],
                ["cube", "Assets"],
                ["clock", "Activity"],
              ] as const
            ).map(([icon, label]) => (
              <button
                key={label}
                title={label}
                className={navigation === label ? "active" : ""}
                onClick={() => {
                  setNavigation(label);
                  if (label !== "Architecture") setModal(label);
                }}
              >
                <Icon name={icon} size={18} />
                <span>{label}</span>
                {label === "Architecture" && <small>3</small>}
              </button>
            ))}
            <div className="dl-nav-divider" />
            {(
              [
                ["search", "Marketplace"],
                ["sliders", "Models"],
                ["bolt", "Presets"],
              ] as const
            ).map(([icon, label]) => (
              <button key={label} title={label} onClick={() => setModal(label)}>
                <Icon name={icon} size={18} />
                <span>{label}</span>
              </button>
            ))}
          </nav>
          <div className="dl-project-tree">
            <span className="dl-nav-label">IN THIS PROJECT</span>
            <span>
              <i /> First playable
            </span>
            <small>3 systems · 2 connections</small>
          </div>
          <div className="dl-sidebar-bottom">
            <button onClick={() => setModal("About this direction")}>
              <Icon name="sliders" size={18} />
              <span>Workspace settings</span>
            </button>
            <div className="dl-account">
              <span>YL</span>
              <div>
                <b>Your workspace</b>
                <small>Local · private</small>
              </div>
              <Icon name="chevron" size={14} />
            </div>
          </div>
        </aside>
        <main className="dl-main">
          <header className="dl-projectbar">
            <div>
              <span>Arena</span>
              <span className="dl-slash">/</span>
              <b>First playable</b>
              <span className="dl-draft">Draft</span>
            </div>
            <div>
              <button
                className="dl-studio"
                onClick={() => setModal("Studio connection")}
              >
                <i className={studio === "Connected" ? "connected" : ""} />
                {studio === "Disconnected" ? "Connect Studio" : studio}
                <Icon name="chevron" size={13} />
              </button>
              <GlyphButton
                name="clock"
                label="Version history"
                onClick={() => setModal("Activity")}
              />
            </div>
          </header>
          <div className="dl-workspace">
            <section
              className="dl-canvas-column"
              aria-label="Architecture design"
            >
              <header className="dl-canvas-intro">
                <div>
                  <span className="dl-eyebrow">YOUR GAME, CONNECTED</span>
                  <h1>Game architecture</h1>
                  <p>Confirmed hits become energy. Energy unlocks abilities.</p>
                </div>
                <button
                  className="dl-review-button"
                  onClick={() => setModal("Review changes")}
                >
                  <Icon name="check" size={16} /> Review changes{" "}
                  <span>{reviewed ? 0 : 3}</span>
                </button>
              </header>
              <div className="dl-graph-wrap">
                <ArchitectureEditor
                  project={project}
                  ask={ask}
                  details={setModal}
                  save={async (graph) =>
                    setProject((p) => ({ ...p, architecture: graph }))
                  }
                  presentation={{
                    initialSelection: "combat",
                    layoutKey: `${direction}-${width ?? "default"}`,
                    nodeHeight: 152,
                    bottomInset: 42,
                    nodeStatus: (id) => ({
                      label:
                        id === "energy"
                          ? {
                              queued: "Queued",
                              working: "Updating…",
                              finished: "Ready to test",
                              failed: "Needs attention",
                            }[run]
                          : id === "combat"
                            ? "Ready to test"
                            : "Unchanged",
                      working: id === "energy" && run === "working",
                    }),
                  }}
                />
                <div className="dl-graph-legend">
                  <span>
                    <i /> System
                  </span>
                  <span>
                    <i className="dl-working-dot" /> Updating
                  </span>
                  <span>→ Event or state</span>
                </div>
              </div>
              {direction === "C" && (
                <div className="dl-system-strip">
                  <div>
                    <span className="dl-eyebrow">RUNTIME</span>
                    <b>
                      <Icon name="cube" size={14} /> Server authoritative
                    </b>
                  </div>
                  <div>
                    <span className="dl-eyebrow">CONTRACTS</span>
                    <b>
                      2 signals <span>· event + state</span>
                    </b>
                  </div>
                  <div>
                    <span className="dl-eyebrow">PLAYTEST</span>
                    <b className="dl-test-pending">Not started</b>
                  </div>
                  <button
                    onClick={() => setModal("Build")}
                    aria-label="Inspect build"
                  >
                    <Icon name="external" size={15} />
                  </button>
                </div>
              )}
              <div className="dl-context">
                <div className="dl-context-icon">
                  <Icon name="bolt" size={20} />
                </div>
                <div>
                  <span className="dl-eyebrow">THE GAME LOOP</span>
                  <h3>Every hit moves you closer.</h3>
                  <p>
                    Server confirms a hit <span>→</span> +10 energy{" "}
                    <span>→</span> Ability ready at 100
                  </p>
                </div>
                <button
                  onClick={() =>
                    ask(
                      "Help me tune how quickly confirmed hits charge the ability.",
                    )
                  }
                  title="Discuss the game loop"
                >
                  <Icon name="arrow" size={17} />
                </button>
              </div>
              <footer className="dl-canvas-footer">
                <span>
                  <span className="dl-status-dot" /> Local design sandbox
                </span>
                <span>Drag to move · Scroll to zoom</span>
              </footer>
            </section>
            <div
              role="separator"
              aria-label="Resize agent panel"
              aria-orientation="vertical"
              aria-valuemin={360}
              aria-valuemax={520}
              aria-valuenow={
                width ??
                (direction === "B" ? 448 : direction === "C" ? 392 : 408)
              }
              tabIndex={0}
              className="dl-resize"
              onKeyDown={(e) => {
                if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
                  e.preventDefault();
                  setWidth((w) =>
                    Math.max(
                      360,
                      Math.min(
                        520,
                        (w ?? 408) + (e.key === "ArrowLeft" ? 16 : -16),
                      ),
                    ),
                  );
                }
              }}
              onPointerDown={(e) => {
                paneDrag.current = {
                  x: e.clientX,
                  width:
                    e.currentTarget.nextElementSibling!.getBoundingClientRect()
                      .width,
                };
                e.currentTarget.setPointerCapture(e.pointerId);
              }}
              onPointerMove={(e) => {
                if (paneDrag.current)
                  setWidth(
                    Math.max(
                      360,
                      Math.min(
                        520,
                        paneDrag.current.width + paneDrag.current.x - e.clientX,
                      ),
                    ),
                  );
              }}
              onPointerUp={() => (paneDrag.current = null)}
              onPointerCancel={() => (paneDrag.current = null)}
            >
              <span />
            </div>
            <aside className="dl-agent" aria-label="Takko agent">
              <header className="dl-agent-heading">
                <div>
                  <TakkoMark />
                  <strong>Takko</strong>
                  <span className="dl-agent-label">Your building partner</span>
                </div>
                <GlyphButton
                  name="clock"
                  label="Conversation history"
                  onClick={() => setModal("Activity")}
                />
              </header>
              <div className="dl-feed">
                <div className="dl-dayline">
                  <span />
                  TODAY
                  <span />
                </div>
                <div className="dl-user-message">
                  Build a small arena where confirmed hits charge an ability.
                </div>
                <div className="dl-agent-byline">
                  <span className="dl-tiny-mark">
                    <TakkoMark />
                  </span>
                  <b>Takko</b>
                  <span>Just now</span>
                </div>
                <h2 className="dl-result-title">Your arena is taking shape.</h2>
                <p className="dl-response">
                  Combat now charges Energy on confirmed hits. I’m connecting
                  the meter so you can see when the ability is ready.
                </p>
                <div className={`dl-generation ${run}`}>
                  <button
                    aria-expanded={detail}
                    onClick={() => setDetail((v) => !v)}
                  >
                    <span className="dl-generation-icon">
                      {run === "working" ? (
                        <span className="dl-spinner" />
                      ) : (
                        <Icon
                          name={
                            run === "failed"
                              ? "close"
                              : run === "queued"
                                ? "clock"
                                : "check"
                          }
                          size={17}
                        />
                      )}
                    </span>
                    <span>
                      <b>{status}</b>
                      <small>
                        {run === "finished"
                          ? "3 changes · Studio testing still needed"
                          : run === "failed"
                            ? "Combat is preserved · Review details"
                            : run === "queued"
                              ? "Your request is in the queue"
                              : "Combat complete · Connecting charge meter"}
                      </small>
                    </span>
                    <Icon name="chevron" size={15} />
                  </button>
                  {detail && (
                    <div className="dl-activity-details">
                      <p>
                        <Icon name="check" size={13} /> Combat · server hit
                        validation
                      </p>
                      <p>
                        <Icon name="bolt" size={13} /> Energy · +10 per
                        confirmed hit
                      </p>
                      <p>
                        <Icon name="cube" size={13} /> Abilities · player charge
                        meter
                      </p>
                      <small>
                        Demonstration state. No generation is running.
                      </small>
                    </div>
                  )}
                </div>
                <div className="dl-preview-card">
                  {loadingPreview ? (
                    <div className="dl-preview-loading">
                      <span className="dl-spinner" />
                      <b>Loading animation…</b>
                      <small>Preview of the loading state</small>
                    </div>
                  ) : (
                    <AnimationPlayer
                      animation={importedWalk}
                      provenance="Roblox #180426354 · Browser preview"
                    />
                  )}
                </div>
                <button
                  className="dl-next-idea"
                  onClick={() =>
                    ask(
                      "Add a training dummy that resets health so I can test the combat loop.",
                    )
                  }
                >
                  <Icon name="plus" size={15} />
                  <span>Add a training dummy</span>
                  <span>↗</span>
                </button>
                {message && (
                  <div className="dl-user-message dl-local-message">
                    {message}
                    <small>Saved in this sandbox only</small>
                  </div>
                )}
              </div>
              <form
                className="dl-composer"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (prompt.trim()) {
                    setMessage(prompt.trim());
                    setPrompt("");
                    setRun("queued");
                  }
                }}
              >
                <textarea
                  ref={messageRef}
                  aria-label="Message Takko"
                  placeholder="What should we build next?"
                  value={prompt}
                  onChange={(e) => setPrompt(e.target.value)}
                  onKeyDown={(e) => {
                    if (
                      e.key === "Enter" &&
                      !e.shiftKey &&
                      !e.nativeEvent.isComposing
                    ) {
                      e.preventDefault();
                      e.currentTarget.form?.requestSubmit();
                    }
                  }}
                />
                <div className="dl-composer-actions">
                  <GlyphButton
                    name="plus"
                    label="Attach an asset"
                    onClick={() => setModal("Assets")}
                  />
                  <button
                    type="button"
                    onClick={() => setModal("Preset & budget")}
                  >
                    <Icon name="bolt" size={14} /> Game builder{" "}
                    <Icon name="chevron" size={12} />
                  </button>
                  <span className="dl-composer-spacer" />
                  <button
                    type="submit"
                    className="dl-send"
                    aria-label="Send sandbox message"
                    disabled={!prompt.trim()}
                  >
                    <Icon name="arrow" size={18} />
                  </button>
                </div>
              </form>
              <footer className="dl-agent-footer">
                <span>Local demo · no model calls</span>
                <span>Enter to send</span>
              </footer>
            </aside>
          </div>
        </main>
      </div>
      {modal && (
        <Dialog
          title={modal}
          close={() => {
            setModal("");
            setNavigation("Architecture");
          }}
        >
          {modal === "Design & states" || modal === "About this direction" ? (
            <>
              <div className="dl-direction-summary">
                <Pill>
                  {direction} / {directions[direction].name}
                </Pill>
                <h3>{directions[direction].idea}</h3>
                <p>{directions[direction].description}</p>
                <small>{directions[direction].tradeoff}</small>
              </div>
              <div className="dl-state-grid">
                <label>
                  Generation state
                  <select
                    value={run}
                    onChange={(e) => setRun(e.target.value as RunState)}
                  >
                    {["queued", "working", "finished", "failed"].map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </label>
                <label>
                  Studio state
                  <select
                    value={studio}
                    onChange={(e) => setStudio(e.target.value)}
                  >
                    {[
                      "Disconnected",
                      "Connecting",
                      "Connected",
                      "Syncing",
                      "Error",
                    ].map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </label>
                <label className="dl-check">
                  <input
                    type="checkbox"
                    checked={loadingPreview}
                    onChange={(e) => setLoadingPreview(e.target.checked)}
                  />{" "}
                  Show viewport loading state
                </label>
                <label className="dl-check">
                  <input
                    type="checkbox"
                    checked={reviewed}
                    onChange={(e) => setReviewed(e.target.checked)}
                  />{" "}
                  No pending changes
                </label>
              </div>
              <p className="dl-dialog-note">
                These controls demonstrate product states. They never connect to
                Studio or call a model. Graph edits and messages stay in the
                sandbox.
              </p>
              <div className="dl-motion-note">
                <b>Motion language</b>
                <p>140 ms feedback · 220 ms disclosures · 280 ms panels</p>
                <small>
                  Reduced motion disables transitions and pauses autoplay. Drag
                  the panel divider or use its arrow keys to resize.
                </small>
              </div>
            </>
          ) : modal === "Review changes" ? (
            <>
              <p className="dl-dialog-note">
                {reviewed
                  ? "You're all caught up in this sandbox."
                  : "Three proposed changes to your arena. Review them before testing in Studio."}
              </p>
              {!reviewed && (
                <div className="dl-change-list">
                  {[
                    [
                      "Combat",
                      "Server validates hits before awarding energy",
                      "Updated",
                    ],
                    ["Energy", "Confirmed hits add ten energy", "Updated"],
                    [
                      "WalkLoopAnimation",
                      "R6 animation preview added",
                      "Asset",
                    ],
                  ].map(([name, desc, label]) => (
                    <div key={name}>
                      <Icon name="cube" size={19} />
                      <span>
                        <b>{name}</b>
                        <small>{desc}</small>
                      </span>
                      <Pill>{label}</Pill>
                    </div>
                  ))}
                </div>
              )}
              <button
                className="dl-primary"
                onClick={() => {
                  setReviewed(true);
                  setModal("");
                }}
              >
                Mark reviewed in sandbox
              </button>
              <p className="dl-dialog-note">
                Nothing is applied to a Roblox place.
              </p>
            </>
          ) : modal === "Studio connection" ? (
            <>
              <p>Connect the workspace to your open Roblox place.</p>
              <div className="dl-connection-preview">
                <Icon name="cube" size={32} />
                <b>{studio}</b>
                <small>This design sandbox has no Studio connection.</small>
              </div>
              <label>
                Preview connection status
                <select
                  value={studio}
                  onChange={(e) => setStudio(e.target.value)}
                >
                  {[
                    "Disconnected",
                    "Connecting",
                    "Connected",
                    "Syncing",
                    "Error",
                  ].map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
            </>
          ) : modal === "Assets" || modal === "Marketplace" ? (
            <>
              <p className="dl-dialog-note">
                One real imported clip is available in this design sandbox.
                Marketplace network actions are disabled.
              </p>
              <div className="dl-change-list">
                <div>
                  <Icon name="cube" />
                  <span>
                    <b>WalkLoopAnimation</b>
                    <small>
                      Roblox #180426354 · R6 · Imported joint tracks
                    </small>
                  </span>
                  <Pill>Ready</Pill>
                </div>
              </div>
              <button
                className="dl-primary"
                onClick={() => {
                  ask("Use WalkLoopAnimation for the player's movement.");
                  setModal("");
                }}
              >
                Reference in message
              </button>
            </>
          ) : modal === "Preset & budget" ||
            modal === "Models" ||
            modal === "Presets" ? (
            <>
              <p className="dl-dialog-note">
                A compact preset summary keeps technical configuration out of
                the creative flow.
              </p>
              <div className="dl-settings-preview">
                <Icon name="bolt" size={24} />
                <h3>Game builder</h3>
                <p>Plan → Build → Review</p>
                <div>
                  <span>Generation limit</span>
                  <b>$5.00</b>
                </div>
                <div>
                  <span>Model calls in this sandbox</span>
                  <b>Disabled</b>
                </div>
              </div>
            </>
          ) : modal === "Activity" ? (
            <div className="dl-change-list">
              {[
                "Combat changes ready to test",
                "Energy update in progress",
                "WalkLoopAnimation imported",
              ].map((s) => (
                <div key={s}>
                  <Icon name="clock" size={17} />
                  <span>
                    {s}
                    <small>Design demonstration</small>
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <>
              <h3>Arena / First playable</h3>
              <p>{project.request}</p>
              <p className="dl-dialog-note">
                {modal === "Source"
                  ? "Source inspection belongs here in the real workspace. This sandbox does not invent generated code."
                  : modal === "Build"
                    ? "Build results belong here in the real workspace. This design scenario has not generated a game."
                    : "This is a local design exploration, isolated from your saved projects."}
              </p>
            </>
          )}
        </Dialog>
      )}
    </div>
  );
}

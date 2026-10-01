import { TakkoMark } from "./Icons";
import type { ClarificationQuestion } from "./Clarifications";
import { clarificationReceipt } from "./clarification-receipt";
import { lazy, Suspense, useEffect, useRef, useState } from "react";
import type { Project } from "../generation/schema";
import type { ConversationTurn } from "../generation/conversation";
import { settingsApi, SettingsDialog } from "./SettingsWorkspace";
const AnimationPlayer = lazy(() =>
  import("./AnimationPlayer").then((m) => ({ default: m.AnimationPlayer })),
);
const AnimationGallery = lazy(() =>
  import("./AnimationGallery").then((m) => ({ default: m.AnimationGallery })),
);

export function conversationSuggestions(project: Project) {
  if (project.error)
    return [
      `Revise the plan to address this failure without changing the game's scope: ${project.error}`,
    ];
  if (project.architecture?.nodes.length && !project.spec)
    return [
      "Plan the saved architecture, including every system and connection.",
    ];
  if (project.stage === "ready_to_test")
    return [
      "Improve the controls and feedback for a first-time player while preserving the existing game loop.",
    ];
  if (project.concept?.questions.length) return [];
  return project.spec
    ? [
        "Review how the systems interact and identify anything the player cannot complete.",
      ]
    : [];
}
export function Conversation({
  project,
  history,
  closeHistory,
  stageMessage,
  update,
  openSource,
  editAnswers,
}: {
  project: Project;
  history: boolean;
  closeHistory: () => void;
  stageMessage: (text: string) => void;
  update: (p: Project) => void;
  openSource: () => void;
  editAnswers: (questions: ClarificationQuestion[]) => void;
}) {
  const [older, setOlder] = useState<ConversationTurn[]>([]);
  const [before, setBefore] = useState(project.conversationBefore ?? null);
  const [query, setQuery] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const upload = useRef<HTMLInputElement>(null);
  const previousWindow = useRef(project.conversation ?? []);
  const cursor =
    before ??
    (older.length === 0 ? (project.conversationBefore ?? null) : null);
  useEffect(() => {
    const current = project.conversation ?? [];
    const ids = new Set(current.map((t) => t.id));
    const evicted = previousWindow.current.filter((t) => !ids.has(t.id));
    if (evicted.length)
      setOlder((old) => [
        ...new Map([...old, ...evicted].map((t) => [t.id, t])).values(),
      ]);
    previousWindow.current = current;
  }, [project.conversation]);
  useEffect(() => {
    setOlder([]);
    setBefore(project.conversationBefore ?? null);
    setError("");
  }, [project.id]);
  const merged = [
    ...new Map(
      [...older, ...(project.conversation ?? [])].map((t) => [t.id, t]),
    ).values(),
  ];
  const turns = merged.length
    ? merged
    : [
        {
          id: "legacy",
          at: project.createdAt,
          revision: project.revision,
          kind: "snapshot" as const,
          text: `Saved project. Earlier conversation was not recorded. ${project.request}`,
        },
      ];
  const load = async () => {
    setLoading(true);
    setError("");
    try {
      const page = await settingsApi<{
        turns: ConversationTurn[];
        before: string | null;
      }>(
        `/projects/${project.id}/conversation?before=${encodeURIComponent(cursor!)}&limit=30`,
      );
      setOlder((current) => [...page.turns, ...current]);
      setBefore(page.before);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setLoading(false);
    }
  };
  const cards = (filter: string) => (
    <>
      {cursor && (
        <button disabled={loading} onClick={load}>
          {loading ? "Loading…" : "Load earlier messages"}
        </button>
      )}
      {error && <p role="alert">{error}</p>}
      {turns
        .filter(
          (t) =>
            !filter ||
            JSON.stringify(t).toLowerCase().includes(filter.toLowerCase()),
        )
        .map((savedTurn) => {
          const turn = {
            ...savedTurn,
            clarifications: clarificationReceipt(savedTurn, project),
          };
          return (
            <article
              key={turn.id}
              className={`conversation-turn ${turn.kind === "user" ? "user-turn" : "takko-turn"}`}
              data-turn-id={turn.id}
            >
              <div className="turn-byline">
                {turn.kind !== "user" && <TakkoMark />}
                <strong>{turn.kind === "user" ? "You" : "Takko"}</strong>
                <small>
                  r{turn.revision} ·{" "}
                  {new Date(turn.at).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </small>
              </div>
              {turn.status && ["queued", "applying", "applied", "held", "cancelled"].includes(turn.status) && <small className="queue-tag">{turn.status === "queued" ? "Queued · after this step" : turn.status === "applied" ? "Applied" : turn.status === "applying" ? "Applying to plan…" : turn.status === "cancelled" ? "Cancelled" : "Held · needs you"}</small>}
              {["queued", "held"].includes(turn.status ?? "") && <button onClick={async () => { try { update(await settingsApi<Project>(`/projects/${project.id}/queued-messages/${turn.id}/cancel`, "POST", { revision: project.revision })); } catch (e) { setError((e as Error).message); } }}>Remove queued change</button>}
              {turn.clarifications?.length ? (
                <div className="saved-clarifications">
                  <strong>Clarifications</strong>
                  <dl className="answer-receipt">
                    {turn.clarifications.map((answer) => (
                      <div key={answer.id}>
                        <dt>{answer.prompt}</dt>
                        <dd>{answer.answer}</dd>
                      </div>
                    ))}
                  </dl>
                  <button
                    type="button"
                    disabled={!!project.jobId || turn.id !== turns.at(-1)?.id}
                    onClick={() =>
                      editAnswers(
                        turn.clarifications!.map(({ id, prompt }) => ({
                          id,
                          prompt,
                          options: [],
                        })),
                      )
                    }
                  >
                    Edit answers
                  </button>
                </div>
              ) : (
                <p>{turn.text}</p>
              )}
              {turn.proposal && (
                <details>
                  <summary>Saved proposal · {turn.proposal.title}</summary>
                  <p>{turn.proposal.playerExperience}</p>
                  {turn.proposal.questions.map((q) => (
                    <p key={q.id}>
                      {q.prompt} ·{" "}
                      {q.options
                        .map((o) => (typeof o === "string" ? o : o.label))
                        .join(" / ")}
                    </p>
                  ))}
                  {turn.proposal.decisions?.map((d, i) => (
                    <p key={i}>
                      {d.topic}: {d.choice}
                    </p>
                  ))}
                </details>
              )}
              {turn.plan && (
                <details>
                  <summary>Saved plan · {turn.plan.title}</summary>
                  {turn.plan.requirements.map((r) => (
                    <p key={r.id}>{r.description}</p>
                  ))}
                </details>
              )}
              {turn.kind === "run" && (
                <>
                  <details className="run-activity">
                    <summary>
                      {turn.status === "running"
                        ? "Working…"
                        : turn.status?.replaceAll("_", " ")}{" "}
                      · Activity
                      {turn.costMicros !== undefined
                        ? ` · $${(turn.costMicros / 1e6).toFixed(4)}`
                        : ""}
                    </summary>
                    {(turn.events ?? []).map((event, i) => (
                      <p key={i}>
                        <time>{new Date(event.at).toLocaleTimeString()}</time>{" "}
                        {event.message}
                      </p>
                    ))}
                    {!!turn.files?.length && (
                      <div>
                        <strong>Files in this build</strong>
                        {turn.files.map((file) => (
                          <p key={file}>
                            <code>{file}</code>
                          </p>
                        ))}
                      </div>
                    )}
                  </details>
                  {turn.status !== "running" && (
                    <div className="turn-feedback" aria-label="Rate this run">
                      {(["helpful", "needs_work"] as const).map((feedback) => (
                        <button
                          key={feedback}
                          disabled={!!project.jobId}
                          aria-pressed={turn.feedback === feedback}
                          onClick={async () => {
                            try {
                              update(
                                await settingsApi<Project>(
                                  `/projects/${project.id}/conversation/${turn.id}/feedback`,
                                  "POST",
                                  { feedback },
                                ),
                              );
                            } catch (e) {
                              setError((e as Error).message);
                            }
                          }}
                        >
                          {feedback === "helpful" ? "Helpful" : "Needs work"}
                        </button>
                      ))}
                    </div>
                  )}
                </>
              )}
              {!!turn.files?.length && (
                <details className="result-card">
                  <summary>{turn.files.length} scripts in this build</summary>
                  {turn.files.map((file) => (
                    <p key={file}>
                      <code>{file}</code>
                    </p>
                  ))}
                  <button onClick={openSource}>Inspect current source</button>
                  <small>
                    Saved file list for revision {turn.revision}. Source opens
                    the current revision.
                  </small>
                </details>
              )}
              {!!turn.architecture?.nodes.length && (
                <details className="result-card">
                  <summary>
                    Architecture · {turn.architecture.nodes.length} systems
                  </summary>
                  <p>
                    {turn.architecture.nodes.map((n) => n.name).join(" · ")}
                  </p>
                  <small>
                    {turn.architecture.edges.length} proposed event/state
                    connections. Review them on the canvas.
                  </small>
                </details>
              )}
              {!!turn.assets?.length && (
                <details className="result-card">
                  <summary>Assets & sounds · {turn.assets.length}</summary>
                  {turn.assets.map((asset) => (
                    <div key={asset.id}>
                      <strong>
                        {asset.kind} · {asset.status.replaceAll("_", " ")}
                      </strong>
                      <p>{asset.description}</p>
                      <small>
                        {asset.assetId
                          ? "Roblox asset " + asset.assetId
                          : "No published asset ID"}
                      </small>
                    </div>
                  ))}
                </details>
              )}
              {!!turn.effects?.length && (
                <details className="result-card">
                  <summary>
                    Effects & scene audio · {turn.effects.length}
                  </summary>
                  {turn.effects.map((effect) => (
                    <p key={effect}>{effect}</p>
                  ))}
                  <small>
                    Declared in this build. Preview playback in Studio.
                  </small>
                </details>
              )}
              {turn.screenshot && (
                <figure>
                  <img
                    loading="lazy"
                    src={turn.screenshot}
                    alt="User-supplied Studio observation"
                  />
                  <figcaption>
                    Uploaded observation · revision {turn.revision}
                  </figcaption>
                </figure>
              )}
              {turn.animationPackId &&
                project.animationPacks
                  ?.filter((p) => p.id === turn.animationPackId)
                  .map((pack) => (
                    <Suspense
                      key={pack.id}
                      fallback={<p>Loading animations…</p>}
                    >
                      <AnimationGallery pack={pack} capture={async (selectedKey) => {
                        const studioId = project.assetStudioId || localStorage.getItem("takko-marketplace-studio");
                        if (!studioId) throw Error("Connect Studio to inspect this clip.");
                        const response = await fetch(`/api/projects/${project.id}/marketplace-animations`, {
                          method: "POST", headers: { "Content-Type": "application/json" },
                          body: JSON.stringify({ revision: project.revision, studioId, reference: pack.assetId, selectedKey }),
                        });
                        const result = await response.json();
                        if (!response.ok) throw Error(result.error ?? "Clip inspection failed.");
                        update(result);
                      }} />
                    </Suspense>
                  ))}
              {turn.animationId &&
                project.animationClips
                  ?.filter((a) => a.id === turn.animationId)
                  .map((animation) => (
                    <Suspense
                      key={animation.id}
                      fallback={<p>Loading animation viewer…</p>}
                    >
                      <AnimationPlayer animation={animation} />
                    </Suspense>
                  ))}
            </article>
          );
        })}
    </>
  );
  return (
    <>
      <div className="conversation-timeline" aria-label="Saved conversation">
        {cards("")}
      </div>
      <details className="animation-import">
        <summary>Preview an animation clip</summary>
        <p className="muted">
          Import Takko joint-track JSON to play R6 or R15 motion in chat. Asset
          IDs alone cannot be previewed. Importing does not change your game.
        </p>
        <input
          ref={upload}
          type="file"
          accept=".json,application/json"
          aria-label="Animation clip JSON"
          disabled={!!project.jobId || loading}
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setError("");
            setLoading(true);
            try {
              if (file.size > 250000) throw Error("Use a clip under 250 KB.");
              const clip = JSON.parse(await file.text());
              update(
                await settingsApi<Project>(
                  `/projects/${project.id}/animations`,
                  "POST",
                  { revision: project.revision, id: crypto.randomUUID(), clip },
                ),
              );
            } catch (e) {
              setError((e as Error).message);
            } finally {
              setLoading(false);
              if (upload.current) upload.current.value = "";
            }
          }}
        />
      </details>
      {!project.jobId && (
        <div className="conversation-suggestions">
          {conversationSuggestions(project).map((text) => (
            <button key={text} onClick={() => stageMessage(text)}>
              {text} <span aria-hidden="true">↗</span>
            </button>
          ))}
        </div>
      )}
      {history && (
        <SettingsDialog title="Conversation history" close={closeHistory}>
          <div className="dialog-body">
            <label>
              Search saved messages
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Message, system, error…"
              />
            </label>
            <p className="muted">
              Search covers loaded messages. Load earlier messages to extend it.
            </p>
            {cards(query)}
          </div>
        </SettingsDialog>
      )}
    </>
  );
}

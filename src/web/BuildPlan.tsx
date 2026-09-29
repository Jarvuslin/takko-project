import type { Project } from "../generation/schema";
function WorkerHistory({ project }: { project: Project }) {
  const workers = project.coordination?.workers ?? [];
  if (!workers.length) return null;
  return (
    <details className="plan-aside compact-plan" open={!!project.jobId}>
      <summary>
        Coordinator activity{" "}
        <span>
          {workers.filter((w) => w.status === "completed").length} completed
          assignments
        </span>
      </summary>
      <ol>
        {workers.slice(-12).map((worker) => (
          <li key={worker.id}>
            <span className="plan-state" aria-label={worker.status}>
              {worker.status === "completed"
                ? "✓"
                : worker.status === "running"
                  ? "◌"
                  : "·"}
            </span>
            <details open={worker.status === "running"}>
              <summary>
                <strong>{worker.objective}</strong>
                <small>{worker.status}</small>
              </summary>
              <p>
                {worker.kind}
                {worker.taskId ? " · " + worker.taskId : ""}
              </p>
              {worker.error && <p>{worker.error}</p>}
              {worker.findings?.map((finding, index) => (
                <p key={index}>{finding.detail}</p>
              ))}
            </details>
          </li>
        ))}
      </ol>
      <p>
        Completed assignments are saved. Gameplay still needs Studio testing.
      </p>
    </details>
  );
}
export function BuildPlan({
  project,
  openSource,
}: {
  project: Project;
  openSource: (file: string) => void;
}) {
  const tasks = project.spec?.tasks ?? [];
  if (!tasks.length)
    return (
      <>
        <WorkerHistory project={project} />
        <p className="plan-placeholder">
          Your build plan appears after planning.
        </p>
      </>
    );
  const completed = new Set(project.completedBuildTasks ?? []);
  return (
    <>
      <WorkerHistory project={project} />
      <details className="plan-aside compact-plan" open={!!project.jobId}>
        <summary>
          Build plan{" "}
          <span>
            {tasks.filter((t) => completed.has(t.id)).length} of {tasks.length}{" "}
            complete
          </span>
        </summary>
        <ol>
          {tasks.map((t) => {
            const done = completed.has(t.id);
            const blocked =
              !done && t.dependsOn.some((id) => !completed.has(id));
            const status = done
              ? "Complete"
              : blocked
                ? "Waiting on dependencies"
                : "Planned";
            return (
              <li key={t.id}>
                <span className="plan-state" aria-label={status}>
                  {done ? "✓" : blocked ? "·" : "○"}
                </span>
                <details>
                  <summary>
                    <strong>{t.title}</strong>
                    <small>{status}</small>
                  </summary>
                  <p>
                    {t.files.length} scripts · {t.requirements.length}{" "}
                    requirements
                  </p>
                  {!!t.dependsOn.length && (
                    <p>
                      After:{" "}
                      {t.dependsOn
                        .map(
                          (id) =>
                            tasks.find((task) => task.id === id)?.title ?? id,
                        )
                        .join(", ")}
                    </p>
                  )}
                  {t.files.map((file) => (
                    <button
                      type="button"
                      className="task-source"
                      key={file}
                      onClick={() => openSource(file)}
                    >
                      {file}
                    </button>
                  ))}
                </details>
              </li>
            );
          })}
        </ol>
        {project.error && (
          <p className="plan-blocked">
            Build stopped. Review the error above before continuing.
          </p>
        )}
      </details>
    </>
  );
}

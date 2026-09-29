import { useEffect, useState } from "react";
import type { Project } from "../generation/schema";
export function RetryStep({ project, retry }: { project: Project; retry: () => void }) {
  const [quote, setQuote] = useState<{ step: string; estimatedMicros: number; completed: number } | null>(null);
  useEffect(() => {
    let active = true;
    fetch(`/api/projects/${project.id}/retry-quote`).then(r => r.ok ? r.json() : null).then(q => { if (active) setQuote(q); }).catch(() => { if (active) setQuote(null); });
    return () => { active = false; };
  }, [project.id, project.revision, project.stage]);
  if (!quote || project.jobId) return null;
  return <section className="generation-card"><p>Failed at {quote.step}. {quote.completed} completed area plans are kept.</p><button onClick={retry}>Retry from this step · about ${(quote.estimatedMicros / 1e6).toFixed(2)}</button><p className="muted">Estimate uses the last planning call. Retries are charged against the existing cap. Building requires approval after planning.</p></section>;
}

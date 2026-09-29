import { Clarifications, answerComplete } from "./Clarifications";
import type { GameConcept as Concept } from "../generation/concept";
import { conceptCanPlan } from "../generation/concept";

export function GameConcept({
  concept,
  answers,
  onAnswers,
  onRefine,
  onPlan,
  disabled,
  dirty,
  approved = false,
}: {
  concept: Concept;
  answers: Record<string, string>;
  onAnswers: (answers: Record<string, string>) => void;
  onRefine: () => void;
  onPlan: () => void;
  disabled: boolean;
  dirty: boolean;
  approved?: boolean;
}) {
  const complete = concept.questions.every((q) => answerComplete(q, answers));
  return (
    <section className="game-concept" aria-label="Your game concept">
      <span className="eyebrow">YOUR GAME CONCEPT</span>
      <h2>{concept.title}</h2>
      <p>{concept.playerExperience}</p>
      <p className="muted">Look and feel: {concept.visualDirection}</p>
      <Clarifications
        key={concept.revision}
        questions={concept.questions}
        answers={answers}
        change={onAnswers}
        disabled={disabled}
      />
      {!!concept.decisions?.length && (
        <details>
          <summary>Choices to review</summary>
          <ul>
            {concept.decisions.map((decision, i) => (
              <li key={i}>
                <strong>{decision.topic}:</strong> {decision.choice}
                <small className="muted">
                  {" "}
                  ·{" "}
                  {decision.questionId === null
                    ? "Proposed interpretation, review before accepting"
                    : "Based on your saved answer"}
                </small>
              </li>
            ))}
          </ul>
        </details>
      )}
      {!!concept.notices?.length && (
        <div role="status">
          <p>Before planning</p>
          <ul>
            {concept.notices.map((notice, i) => (
              <li key={i}>{notice}</li>
            ))}
          </ul>
        </div>
      )}
      {!concept.readiness && (
        <p>This saved concept needs an update before planning.</p>
      )}
      {!!concept.assumptions.length && (
        <details>
          <summary>Suggested defaults · {concept.assumptions.length}</summary>
          <ul>
            {concept.assumptions.map((assumption, i) => (
              <li key={i}>{assumption}</li>
            ))}
          </ul>
        </details>
      )}
      <div className="concept-playtest">
        <h3>First thing to try</h3>
        <p>{concept.firstPlaytest.goal}</p>
        <details>
          <summary>How you’ll check it after building</summary>
          <ol>
            {concept.firstPlaytest.steps.map((step, i) => (
              <li key={i}>
                {step}
                {concept.firstPlaytest.checks?.find(
                  (c) => c.step === i + 1,
                ) && (
                  <p className="muted">
                    Look for:{" "}
                    {
                      concept.firstPlaytest.checks.find(
                        (c) => c.step === i + 1,
                      )!.expected
                    }
                  </p>
                )}
              </li>
            ))}
          </ol>
          <p>Look for: {concept.firstPlaytest.expected}</p>
        </details>
      </div>
      <p className="muted">
        This is a proposed direction. Your full request stays in scope.
      </p>
      <div className="actions">
        {approved ? (
          <p role="status">Brief approved. Preview and choose assets below.</p>
        ) : concept.questions.length ? (
          <button disabled={disabled || !complete} onClick={onRefine}>
            Update my concept
          </button>
        ) : conceptCanPlan(concept) ? (
          <button disabled={disabled || dirty} onClick={onPlan}>
            Approve brief
          </button>
        ) : (
          <button disabled={disabled || dirty} onClick={onRefine}>
            Update my concept
          </button>
        )}
      </div>
      {dirty && !concept.questions.length && (
        <p className="muted">
          Your choices or request have changed. Update the concept before
          continuing.
        </p>
      )}
    </section>
  );
}

export function FirstPlaytest({
  concept,
  openStudio,
}: {
  concept: Concept;
  openStudio: () => void;
}) {
  return (
    <details className="game-concept">
      <summary>First playtest guide</summary>
      <p>{concept.firstPlaytest.goal}</p>
      <ol>
        {concept.firstPlaytest.steps.map((step, i) => (
          <li key={i}>
            {step}
            {concept.firstPlaytest.checks?.find((c) => c.step === i + 1) && (
              <p>
                Look for:{" "}
                {
                  concept.firstPlaytest.checks.find((c) => c.step === i + 1)!
                    .expected
                }
              </p>
            )}
          </li>
        ))}
      </ol>
      <p>Look for: {concept.firstPlaytest.expected}</p>
      <p className="muted">
        Suggested checks after building. These have not been verified in Studio.
      </p>
      <button onClick={openStudio}>Open Studio steps</button>
    </details>
  );
}

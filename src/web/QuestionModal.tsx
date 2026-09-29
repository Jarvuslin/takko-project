import { useEffect, useState } from "react";
import type { StructuredQuestion } from "../generation/questions";
import { optionAnswer } from "../generation/questions";
import { SettingsDialog } from "./SettingsWorkspace";

export function QuestionModal({
  questions,
  disabled,
  save,
  open,
  close,
  free = false,
}: {
  questions: StructuredQuestion[];
  disabled: boolean;
  save: (answers: Record<string, string>) => Promise<void>;
  open: boolean;
  close: () => void;
  free?: boolean;
}) {
  const [step, setStep] = useState(0),
    [values, setValues] = useState<Record<string, string>>({});
  const [custom, setCustom] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false),
    [error, setError] = useState("");
  const signature = questions.map((q) => q.id).join(",");
  useEffect(() => {
    setStep(0);
    setError("");
  }, [signature]);
  if (!open || !questions.length) return null;
  const review = step >= questions.length,
    q = questions[Math.min(step, questions.length - 1)];
  const valid = questions.every((q) => !!values[q.id]?.trim());
  const paid =
    !free &&
    questions.some((q) => values[q.id] && values[q.id] !== "Keep these limits");
  return (
    <SettingsDialog
      title={
        review
          ? "Review your answers"
          : `Question ${step + 1} of ${questions.length}`
      }
      description="Choose how your game should work."
      close={close}
      busy={saving}
      scrollBody
    >
      <form
        onSubmit={async (event) => {
          event.preventDefault();
          if (!review) {
            setStep(step + 1);
            return;
          }
          if (!valid || disabled || saving) return;
          setSaving(true);
          setError("");
          try {
            await save(
              Object.fromEntries(
                questions.map((q) => [q.id, values[q.id].trim()]),
              ),
            );
            close();
          } catch (e) {
            setError((e as Error).message);
          } finally {
            setSaving(false);
          }
        }}
      >
        {review ? (
          <dl className="answer-receipt">
            {questions.map((q) => (
              <div key={q.id}>
                <dt>{q.prompt}</dt>
                <dd>{values[q.id]}</dd>
              </div>
            ))}
          </dl>
        ) : (
          <fieldset disabled={disabled || saving} className="decision-options">
            <legend>{q.prompt}</legend>
            {q.fallback && (
              <p className="muted">
                Fallback choices. The planner has not supplied tailored
                alternatives.
              </p>
            )}
            <div className="decision-choices">
              {q.options.map((option) => (
                <label className="decision-option" key={option.id}>
                  <input
                    type="radio"
                    name={q.id}
                    checked={
                      !custom[q.id] &&
                      values[q.id] === optionAnswer(q, option.id)
                    }
                    onChange={() => {
                      if (q.fallback && option.id === "change") {
                        setCustom({ ...custom, [q.id]: true });
                        setValues({ ...values, [q.id]: "" });
                      } else {
                        setCustom({ ...custom, [q.id]: false });
                        setValues({
                          ...values,
                          [q.id]: optionAnswer(q, option.id),
                        });
                      }
                    }}
                  />
                  <span>
                    <strong>{option.label}</strong>
                    {option.id === q.recommendedOptionId && (
                      <small> · Recommended</small>
                    )}
                    <br />
                    {option.description}
                    {option.id === q.recommendedOptionId && (
                      <p className="muted">{q.recommendationReason}</p>
                    )}
                  </span>
                </label>
              ))}
              {q.allowOther && (
                <label className="decision-option">
                  <input
                    type="radio"
                    name={q.id}
                    checked={!!custom[q.id]}
                    onChange={() => {
                      setCustom({ ...custom, [q.id]: true });
                      setValues({ ...values, [q.id]: "" });
                    }}
                  />
                  Other
                </label>
              )}
            </div>
            {custom[q.id] && (
              <label>
                Your answer
                <textarea
                  value={values[q.id] ?? ""}
                  maxLength={3000}
                  onChange={(e) =>
                    setValues({ ...values, [q.id]: e.target.value })
                  }
                />
              </label>
            )}
          </fieldset>
        )}
        <p className="muted">
          {free ? (
            "Your platform choice is saved without a model call."
          ) : (
            <>
              Keeping the proposed behavior is free. Scope changes require a
              paid planner edit within this project's existing spending cap. A
              failed edit keeps the previous proposal.
            </>
          )}
        </p>
        {review && (
          <p>
            {paid
              ? "These answers request a paid planner edit."
              : "These answers will be saved without a model call."}
          </p>
        )}
        {error && <p role="alert">{error}</p>}
        <footer className="dialog-actions">
          <button
            type="button"
            disabled={!step || saving}
            onClick={() => setStep(step - 1)}
          >
            Back
          </button>
          <button
            className="primary"
            disabled={
              disabled || saving || (review ? !valid : !values[q.id]?.trim())
            }
          >
            {saving
              ? "Saving…"
              : review
                ? "Submit answers"
                : step === questions.length - 1
                  ? "Review answers"
                  : "Next"}
          </button>
        </footer>
      </form>
    </SettingsDialog>
  );
}

import type { StructuredQuestion } from "../generation/questions";
import { QuestionModal } from "./QuestionModal";
import { useId, useRef, useState, useEffect } from "react";
import { SettingsDialog } from "./SettingsWorkspace";

export type ClarificationQuestion = {
  id: string;
  prompt: string;
  options: string[];
  selection?: "single" | "multiple" | "text";
  optional?: boolean;
};
export type AnswerValues = Record<string, string>;
const delegated = "Choose a sensible default for me.";

export function answerComplete(
  q: ClarificationQuestion | StructuredQuestion,
  answers: AnswerValues,
) {
  return ("optional" in q && q.optional) || !!answers[q.id]?.trim();
}
function AnswerField({
  question: q,
  value,
  change,
  disabled,
  compact = false,
}: {
  question: ClarificationQuestion;
  value: string;
  change: (value: string) => void;
  disabled: boolean;
  compact?: boolean;
}) {
  const id = useId();
  const [custom, setCustom] = useState(
    !!value &&
      value !== delegated &&
      !(q.selection === "multiple"
        ? value.split("\n").every((v) => q.options.includes(v))
        : q.options.includes(value)),
  );
  const multiple = q.selection === "multiple";
  const choices = multiple
    ? value.split("\n").filter((v) => q.options.includes(v))
    : [value];
  const textOnly = q.selection === "text" || !q.options.length;
  return (
    <fieldset
      className={compact ? "quick-question" : "decision-options"}
      disabled={disabled}
    >
      <legend>{q.prompt}</legend>
      {!textOnly && (
        <div className={compact ? "concept-choices" : "decision-choices"}>
          {q.options.map((option, index) => (
            <label className="decision-option" key={option}>
              <input
                type={multiple ? "checkbox" : "radio"}
                name={id}
                aria-label={option}
                checked={!custom && choices.includes(option)}
                onChange={() => {
                  setCustom(false);
                  change(
                    multiple
                      ? (custom
                          ? [option]
                          : choices.includes(option)
                            ? choices.filter((v) => v !== option)
                            : [...choices, option]
                        ).join("\n")
                      : option,
                  );
                }}
              />
              {!compact && (
                <span className="decision-number" aria-hidden="true">
                  {index + 1}
                </span>
              )}
              <span>{option}</span>
              {!compact && (
                <span className="decision-arrow" aria-hidden="true">
                  {!custom && choices.includes(option) ? "✓" : "→"}
                </span>
              )}
            </label>
          ))}
          {compact && (
            <button
              type="button"
              aria-pressed={custom}
              onClick={() => {
                setCustom(true);
                if (!custom) change("");
              }}
            >
              Other…
            </button>
          )}
        </div>
      )}
      {(!compact || custom || textOnly) && (
        <div className="custom-answer">
          <label
            className={compact ? undefined : "sr-only"}
            htmlFor={id + "-custom"}
          >
            Your answer
          </label>
          <textarea
            id={id + "-custom"}
            rows={compact ? 2 : 1}
            maxLength={3000}
            value={custom || textOnly ? value : ""}
            onChange={(e) => {
              setCustom(true);
              change(e.target.value);
            }}
            placeholder="Or write your own response…"
          />
        </div>
      )}
      <div className="decision-help">
        {compact && (
          <button
            type="button"
            className="text-button"
            aria-pressed={value === delegated}
            onClick={() => {
              setCustom(false);
              change(delegated);
            }}
          >
            Choose for me
          </button>
        )}
        {multiple && <small>Select all that apply.</small>}
      </div>
    </fieldset>
  );
}

export function ClarificationDialog({
  questions,
  answers,
  change,
  close,
  disabled = false,
}: {
  questions: ClarificationQuestion[];
  answers: AnswerValues;
  change: (answers: AnswerValues) => void;
  close: () => void;
  disabled?: boolean;
}) {
  const [step, setStep] = useState(0);
  const heading = useRef<HTMLHeadingElement>(null);
  const q = questions[step];
  const finish = () => {
    if (step === questions.length - 1) close();
    else setStep(step + 1);
  };
  useEffect(() => {
    heading.current?.focus({ preventScroll: true });
  }, [step]);
  return (
    <SettingsDialog
      title="Question"
      description={
        questions.length > 1
          ? `Question ${step + 1} of ${questions.length}`
          : undefined
      }
      close={close}
      busy={disabled}
    >
      <form
        className="clarification-flow"
        onSubmit={(e) => {
          e.preventDefault();
          if (!disabled && answerComplete(q, answers)) finish();
        }}
      >
        <div className="dialog-body decision-body">
          <h3
            ref={heading}
            tabIndex={-1}
            className="decision-step-title sr-only"
          >
            {q.prompt}
          </h3>
          <AnswerField
            key={q.id}
            question={q}
            value={answers[q.id] ?? ""}
            disabled={disabled}
            change={(value) => change({ ...answers, [q.id]: value })}
          />
          {!answerComplete(q, answers) && (
            <p className="decision-required">
              Choose an option or write an answer to continue.
            </p>
          )}
        </div>
        <footer className="dialog-actions decision-footer">
          <button
            type="button"
            disabled={disabled}
            onClick={() => (step ? setStep(step - 1) : close())}
          >
            {step ? "Back" : "Later"}
          </button>
          {q.optional && (
            <button
              type="button"
              disabled={disabled}
              onClick={() => {
                change({ ...answers, [q.id]: "" });
                finish();
              }}
            >
              Skip
            </button>
          )}
          <button
            className="primary"
            disabled={disabled || !answerComplete(q, answers)}
          >
            {step === questions.length - 1 ? "Send" : "Next"}
          </button>
        </footer>
      </form>
    </SettingsDialog>
  );
}

function LegacyClarifications({
  questions,
  answers,
  change,
  disabled,
}: {
  questions: ClarificationQuestion[];
  answers: AnswerValues;
  change: (answers: AnswerValues) => void;
  disabled: boolean;
}) {
  const simple =
    questions.length === 1 &&
    questions[0].options.length > 0 &&
    questions[0].options.length <= 3 &&
    questions[0].prompt.length <= 100 &&
    questions[0].selection !== "multiple" &&
    questions[0].selection !== "text";
  const [open, setOpen] = useState(
    !simple &&
      questions.length > 0 &&
      !questions.some((q) => answers[q.id]?.trim()),
  );
  const trigger = useRef<HTMLButtonElement>(null);
  if (!questions.length) return null;
  const answered = questions.filter((q) => answers[q.id]?.trim()).length;
  return (
    <section className="clarifications" aria-label="Clarifications">
      {simple ? (
        <AnswerField
          question={questions[0]}
          value={answers[questions[0].id] ?? ""}
          disabled={disabled}
          compact
          change={(value) => change({ ...answers, [questions[0].id]: value })}
        />
      ) : (
        <>
          <div className="clarification-heading">
            <strong>
              {answered ? "Clarifications" : "A few choices before we continue"}
            </strong>
            <small>
              {answered}/{questions.length} answered
            </small>
          </div>
          {!!answered && (
            <dl className="answer-receipt">
              {questions
                .filter((q) => answers[q.id]?.trim())
                .map((q) => (
                  <div key={q.id}>
                    <dt>{q.prompt}</dt>
                    <dd>{answers[q.id]}</dd>
                  </div>
                ))}
            </dl>
          )}
          <button
            ref={trigger}
            type="button"
            disabled={disabled}
            onClick={() => setOpen(true)}
          >
            {answered ? "Edit answers" : "Answer questions"}
          </button>
        </>
      )}
      {open && (
        <ClarificationDialog
          questions={questions}
          answers={answers}
          change={change}
          close={() => {
            setOpen(false);
            requestAnimationFrame(() =>
              trigger.current?.focus({ preventScroll: true }),
            );
          }}
          disabled={disabled}
        />
      )}
    </section>
  );
}

export function Clarifications(props: {
  questions: (ClarificationQuestion | StructuredQuestion)[];
  answers: AnswerValues;
  change: (answers: AnswerValues) => void;
  disabled: boolean;
}) {
  const [open, setOpen] = useState(true);
  if (
    props.questions.length &&
    props.questions.every((q) => "recommendedOptionId" in q)
  ) {
    const questions = props.questions as StructuredQuestion[];
    return (
      <section className="clarifications">
        <button onClick={() => setOpen(true)}>Answer questions</button>
        <QuestionModal
          questions={questions}
          open={open}
          close={() => setOpen(false)}
          disabled={props.disabled}
          save={async (values) => props.change({ ...props.answers, ...values })}
        />
      </section>
    );
  }
  return (
    <LegacyClarifications
      {...props}
      questions={props.questions.map((q) => ({
        ...q,
        options: q.options.map((o) => (typeof o === "string" ? o : o.label)),
      }))}
    />
  );
}

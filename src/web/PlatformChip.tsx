import { useState, useEffect } from "react";
import type { Project } from "../generation/schema";
import {
  platformLabel,
  platformQuestion,
  platformQuestionId,
} from "../generation/platform-policy";
import { QuestionModal } from "./QuestionModal";
import { assetRequest } from "./AssetCard";
import { Icon } from "./Icons";
export function PlatformChip({
  project,
  update,
  disabled,
}: {
  project: Project;
  update: (p: Project) => void;
  disabled: boolean;
}) {
  const q = platformQuestion(project);
  const [open, setOpen] = useState(!!q);
  useEffect(() => {
    if (q) setOpen(true);
  }, [project.id, project.platform?.question]);
  if (!project.platform) return null;
  return (
    <div className="platform-decision">
      <span className="platform-chip">
        <Icon name="desktop" size={14} />
        {platformLabel(project.platform)}
      </span>
      {q && (
        <button disabled={disabled} onClick={() => setOpen(true)}>
          Choose platform
        </button>
      )}
      <QuestionModal
        free
        questions={q ? [q] : []}
        open={open}
        close={() => setOpen(false)}
        disabled={disabled}
        save={async (answers) => {
          update(
            await assetRequest<Project>(project.id, "platform", {
              revision: project.revision,
              answer: answers[platformQuestionId],
            }),
          );
          setOpen(false);
        }}
      />
    </div>
  );
}

import type { Project } from "../generation/schema";
import type { AssetMetadata, MarketplaceKind } from "./types";
import type { AnimationPack } from "./animations";
import type { ModelPreview } from "./preview";

export type AssetSearch = {
  id: string;
  assetNeedId?: string;
  label: string;
  query: string;
  kind: MarketplaceKind;
  preview: "animation" | "model" | "audio" | "image";
};
export type AssetOption = AssetMetadata & {
  previewData?: {
    pack?: AnimationPack;
    model?: ModelPreview;
    notice?: string;
    revisionKey?: string;
  };
  previewError?: string;
  inspectionLimitations?: string[];
};
export type AssetDiscovery = {
  id: string;
  revision: number;
  studioId: string;
  groups: (AssetSearch & {
    options: AssetOption[];
    error?: string;
    nextCursor?: string;
    total?: number;
    relevance?: {
      candidateId: string | null;
      clipKey?: string;
      confidence?: number;
      state: "metadata_only" | "captured_evidence" | "uncertain";
      assessments?: {
        candidateId: string;
        clipKey?: string;
        confidence?: number;
        relevant: boolean;
        choice?: string;
        state?: "relevant" | "irrelevant" | "uncertain";
        error?: string;
      }[];
      at: string;
    };
  })[];
  analysisError?: string;
  /** An automatic recommendation attempt is not retried by polling or remounting. */
  recommendationRevision?: number;
  approved?: boolean;
  choices?: Record<
    string,
    {
      assetId?: string;
      clipKey?: string;
      skip?: boolean;
      acknowledgeInspectionLimitations?: boolean;
    }
  >;
  pinned?: string[];
};

/** Search hints only. The user reviews actual results, never invented asset IDs. */
export function assetSearches(
  p: Pick<Project, "request" | "answers" | "briefChanges"> &
    Partial<Pick<Project, "spec" | "proposal">>,
): AssetSearch[] {
  const needs = p.spec?.assetNeeds ?? p.proposal?.assetNeeds;
  if (needs?.length)
    return needs.map((need) => ({
      id: need.id,
      assetNeedId: need.id,
      label: need.role,
      query: need.query,
      kind: need.kind === "Animation" ? "Model" : need.kind,
      preview:
        need.kind === "Animation"
          ? "animation"
          : need.kind === "Audio"
            ? "audio"
            : need.kind === "Image"
              ? "image"
              : "model",
    }));
  const text = [
    p.request,
    ...(p.briefChanges ?? []).map((c) => c.text),
    ...Object.values(p.answers),
  ].join(" ");
  const combat =
    /\b(combat|fight\w*|fists?|punch\w*|kick\w*|melee|boxing)\b/i.test(text);
  const animation = /\b(animat\w*|movement|locomotion)\b/i.test(text);
  const rig = /\br6\b/i.test(text)
    ? " R6"
    : /\br15\b/i.test(text)
      ? " R15"
      : "";
  const groups: AssetSearch[] = [];
  const add = (
    id: string,
    label: string,
    query: string,
    preview: AssetSearch["preview"],
    kind: MarketplaceKind = "Model",
  ) =>
    groups.push({
      id,
      label,
      query: query + (preview === "animation" ? rig : ""),
      preview,
      kind,
    });
  if (/\b(dummy|dummies|training target)\b/i.test(text))
    add("dummy", "Practice dummy", "training dummy", "model");
  if (combat && animation)
    add(
      "combat",
      "Fighting animation",
      /\b(fists?|punch\w*|boxing)\b/i.test(text)
        ? "punch animation"
        : "combat animation pack",
      "animation",
    );
  if (/\b(sprint\w*|running|run)\b/i.test(text) && animation)
    add("sprint", "Sprint animation", "sprint animation", "animation");
  if (/\b(walk\w*)\b/i.test(text) && animation)
    add("walk", "Walk animation", "walk animation", "animation");
  if (animation && !groups.some((g) => g.preview === "animation"))
    add("animation", "Animation", "character animation pack", "animation");
  if (/\b(sfx|sounds?|audio|sound effects)\b/i.test(text))
    add(
      "sound",
      "Sound effects",
      combat ? "punch impact" : "game sound effect",
      "audio",
      "Audio",
    );
  if (/\b(vfx|visual effects?|particles?|hit effects?)\b/i.test(text))
    add(
      "effects",
      "Visual effects",
      combat ? "hit vfx" : "particle effects",
      "model",
    );
  if (!groups.length) {
    const words = text
      .toLowerCase()
      .replace(/[^\p{L}\p{N}\s]/gu, " ")
      .split(/\s+/)
      .filter(
        (w) =>
          w.length > 2 &&
          ![
            "want",
            "make",
            "game",
            "with",
            "that",
            "have",
            "the",
            "and",
            "for",
            "please",
            "build",
            "create",
            "roblox",
          ].includes(w),
      );
    add(
      "scene",
      "Models for your brief",
      [...new Set(words)].slice(0, 6).join(" ") || "game props",
      "model",
    );
  }
  return groups.slice(0, 8);
}

import { useState } from "react";
import type { SavedAnimationPack } from "../marketplace/animations";
import { AnimationPlayer } from "./AnimationPlayer";
export function AnimationGallery({ pack }: { pack: SavedAnimationPack }) {
  const [selected, setSelected] = useState(pack.entries[0]?.key ?? "");
  const entry = pack.entries.find((e) => e.key === selected) ?? pack.entries[0];
  return (
    <section
      className="animation-gallery"
      aria-label={`Animations in ${pack.name}`}
    >
      <label>
        Animation · {pack.entries.length} in this asset
        <select
          title={entry?.name ?? pack.name}
          aria-label={`Animation from ${pack.name}`}
          value={entry?.key}
          onChange={(e) => setSelected(e.target.value)}
        >
          {pack.entries.map((e, i) => (
            <option key={e.key} value={e.key} title={e.name}>
              {i + 1}. {e.name}
              {e.clip ? ` · ${e.clip.rig}` : " · unavailable"}
            </option>
          ))}
        </select>
      </label>
      {entry?.clip ? (
        <AnimationPlayer
          key={entry.key}
          provenance={`Roblox asset #${entry.animationId ?? pack.assetId}`}
          animation={{
            id: entry.key,
            clip: entry.clip,
            at: pack.at,
            revision: pack.revision,
            source: "user-import",
          }}
        />
      ) : (
        <p role="status">
          {entry?.error ?? "No animation clips were found in this asset."}
        </p>
      )}
      <small
        className="muted"
        title="Uses a block rig with Roblox joint offsets. Custom meshes, curve animations and script-created clips are not previewed. Nonlinear easing may differ from Studio. Studio gameplay and playback have not been verified."
      >
        Browser rig preview · not applied to your game
      </small>
    </section>
  );
}

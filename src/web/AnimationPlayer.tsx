import { useEffect, useMemo, useRef, useState } from "react";
import type { SavedAnimation } from "../generation/animation";
import { createRigScene } from "./preview/scenes";
import { TakkoViewport } from "./preview/TakkoViewport";
export function AnimationPlayer({
  animation,
  provenance,
}: {
  animation: SavedAnimation;
  provenance?: string;
}) {
  const host = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => setVisible(entries[0].isIntersecting),
      { rootMargin: "150px" },
    );
    observer.observe(host.current!);
    return () => observer.disconnect();
  }, []);
  const clipKey = JSON.stringify(animation.clip);
  const factory = useMemo(
    () => () => createRigScene(animation.clip),
    [clipKey],
  );
  return (
    <div className="animation-player" ref={host}>
      <div className="turn-byline">
        <strong className="bounded-name" title={animation.clip.name}>
          {animation.clip.name}
        </strong>
        <div className="rig-badges" aria-label="Compatible rig">
          <span aria-current="true" title="Clip rig">
            {animation.clip.rig}
          </span>
        </div>
      </div>
      {visible ? (
        <TakkoViewport
          title={`${animation.clip.name} on ${animation.clip.rig}`}
          factory={factory}
          duration={animation.clip.duration}
        />
      ) : (
        <div className="viewport-placeholder">
          3D preview loads when visible
        </div>
      )}
      <small className="muted">
        {provenance ??
          `Imported clip · revision ${animation.revision}. Studio playback has not been verified.`}
      </small>
    </div>
  );
}

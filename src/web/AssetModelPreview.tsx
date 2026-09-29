import { useMemo } from "react";
import { createModelScene } from "./preview/model-scene";
import type { ModelPreview } from "../marketplace/preview";
import { TakkoViewport } from "./preview/TakkoViewport";

export function AssetModelPreview({
  model,
  name,
}: {
  model: ModelPreview;
  name: string;
}) {
  const factory = useMemo(() => () => createModelScene(model), [model]);
  return (
    <>
      {model.parts.length > 0 ? (
        <TakkoViewport title={name + " geometry"} factory={factory} />
      ) : (
        <p>
          No visible geometry was captured from this asset. Use its Creator
          Store preview.
        </p>
      )}
      <p className="muted">
        Primitive geometry and approximate bounds. Amber wireframe boxes
        represent custom meshes and unions, not their real surfaces. Organic
        meshes such as trees and characters appear as boxes. Textures are not
        rendered.
        {model.omitted > 0 &&
          ` ${model.omitted} parts beyond the capture limit omitted.`}
        {!!model.transparent &&
          ` ${model.transparent} fully transparent parts excluded.`}
        {model.effects > 0 &&
          ` ${model.effects} effect emitters found. Effects need a Studio preview.`}{" "}
        Scripts do not run here.
      </p>
    </>
  );
}

import type { Bundle, Check, Project, PropertyValue } from "./schema";
import { isDeepStrictEqual } from "node:util";

const vector = (v: PropertyValue | undefined) =>
  v && typeof v === "object" && "value" in v && Array.isArray(v.value)
    ? v.value.slice(0, 3) : undefined;

/** Bounded axis-aligned scene evidence, evaluated inside the builder correction loop. */
export function checkWorldScene(bundle: Bundle, project: Project): Check[] {
  // Model-authored proposal assumptions cannot authorize their own enclosure.
  const intent = [project.request, ...Object.values(project.answers),
    ...(project.briefChanges ?? []).map(c => c.text)].join("\n");
  const permitsFloor = /\b(floor|platform|stage|indoor|room|building|tower|elevated|ceiling)\b/i.test(intent);
  const permitsEnclosure = /\b(indoor|room|building|house|enclosed|ceiling|interior)\b/i.test(intent);
  const checks: Check[] = [];
  const previous = project.implementationBackup?.artifact;
  const unchanged = (n: Bundle["scene"][number]) => previous?.scene.some(old=>isDeepStrictEqual(old,n));
  if(project.spec?.requirements.some(r=>r.category==="ui")) checks.push({id:"world:ui-visibility",status:"pending",detail:"HUD state and source are not visibility evidence. Verify an Enabled ScreenGui in PlayerGui, Visible ancestors, safe insets and on-screen AbsolutePosition/AbsoluteSize. Capture before/after an actual action at small, desktop and ultrawide viewports, including resize and malformed/missing state."});
  const parts = bundle.scene.flatMap(n => {
    const size = vector(n.properties.Size);
    const pos = vector(n.properties.CFrame) ?? vector(n.properties.Position);
    return size && pos && n.path.startsWith("Workspace/") ? [{...n, size, pos}] : [];
  });
  for (const p of parts) {
    if(bundle.scene.some(n=>n.path===p.path && unchanged(n))) continue;
    const [x,y,z] = p.size;
    if (project.world?.kind === "baseplate_template" && !permitsFloor && p.className !== "SpawnLocation" && x >= 10 && z >= 10 && y <= 2 && Math.abs(p.pos[1]+y/2) <= 1)
      checks.push({id:"world:ground:"+p.path,status:"failed",detail:`${p.path} duplicates the host baseplate at y=0. Remove the slab or supply an explicit user-backed spatial requirement.`});
    if (project.world?.kind === "baseplate_template" && !permitsFloor && p.className === "SpawnLocation" && p.pos[1]-y/2 > 5)
      checks.push({id:"world:spawn:"+p.path,status:"failed",detail:`${p.path} places spawn ${p.pos[1]-y/2} studs above the baseplate without requested elevation.`});
  }
  const roofs = parts.filter(p=>p.size[0]>=10 && p.size[2]>=10 && p.size[1]<=2 && p.pos[1]>5);
  for(const roof of roofs) {
    if(bundle.scene.some(n=>n.path===roof.path && unchanged(n))) continue;
    const walls = parts.filter(p=>p!==roof && p.size[1]>=5 && Math.min(p.size[0],p.size[2])<=2 && p.pos[1]<roof.pos[1] && Math.abs(p.pos[0]-roof.pos[0])<=roof.size[0]/2+2 && Math.abs(p.pos[2]-roof.pos[2])<=roof.size[2]/2+2);
    if(!permitsEnclosure && walls.length>=4) checks.push({id:"world:enclosure:"+roof.path,status:"failed",detail:`${roof.path} and ${walls.length} nearby wall-shaped parts enclose the play space without a user request. Remove the invented enclosure.`});
  }
  const lightingIntent=/\b(night|nighttime|dark interior|horror|lamps?|lanterns?|torches|torch|lighting|light sources?)\b/i;
  // Only user-backed intent authorizes a change. A model cannot authorize its own lights.
  const permitsLighting=lightingIntent.test(intent.replace(/\b(?:no|without|do not add|don't add)\s+(?:\w+\s+){0,2}(?:lighting|lights?|lamps?|torches)\b/gi,""));
  if(project.world?.kind==="baseplate_template" && !permitsLighting) {
    for(const n of bundle.scene) if(!unchanged(n) && (n.path==="Lighting" || n.path.startsWith("Lighting/") || /^(PointLight|SpotLight|SurfaceLight|Sky|Atmosphere|BloomEffect|BlurEffect|ColorCorrectionEffect|DepthOfFieldEffect|SunRaysEffect)$/.test(n.className)))
      checks.push({id:"world:lights:"+n.path,status:"failed",detail:`${n.path} changes template lighting without an explicit user-backed lighting requirement. Remove the new light or lighting change and preserve existing lighting.`});
    for(const f of bundle.files) if(!previous?.files.some(old=>isDeepStrictEqual(old,f))) {
      const source=f.source.replace(/--\[\[[\s\S]*?\]\]|--[^\n]*/g,"");
      const lightingAlias=source.match(/(?:local\s+)?(\w+)\s*=\s*game:GetService\(["']Lighting["']\)/)?.[1];
      const assignment="(?:\\.\\w+|\\[[^\\]\\n]+\\])\\s*(?:[+*/%-])?=(?!=)";
      const mutatesLighting=/Instance\.new\(\s*["'](?:PointLight|SpotLight|SurfaceLight|Sky|Atmosphere|\w+Effect)["']/.test(source) || new RegExp("(?:game[.:]Lighting|game:GetService\\([\"']Lighting[\"']\\))"+assignment).test(source) || (lightingAlias && new RegExp("\\b"+lightingAlias+assignment).test(source));
      if(mutatesLighting) checks.push({id:"world:lights:source:"+f.path,status:"failed",detail:`${f.path} creates lights or changes Lighting without an explicit lighting requirement. Keep template lighting unchanged. This static check does not prove absence of dynamic lighting changes.`});
    }
  }
  if(previous) for(const n of bundle.scene) {
    if(previous.scene.some(old=>old.path===n.path)) continue;
    const name=(path:string)=>path.split("/").at(-1)!.replace(/(?:[_ -]?(?:copy|clone))?[_ -]?\d*$/i,"").toLowerCase();
    const ground=(node:Bundle["scene"][number])=>{const size=vector(node.properties.Size);return node.path.startsWith("Workspace/") && size && size[0]>=10 && size[2]>=10 && size[1]<=2;};
    const copy=previous.scene.find(old=>old.className===n.className && (isDeepStrictEqual(old.properties,n.properties) && Object.keys(n.properties).length>0 || n.className==="SpawnLocation" || ground(n) && ground(old) || name(n.path)===name(old.path) && Object.keys(n.properties).length>0));
    const addedIntent=(project.briefChanges??[]).map(c=>c.text).join("\n");
    const allowsDuplicate=/\b(another|second|additional|duplicate|copy|more|two|three)\b/i.test(addedIntent);
    if(copy && !allowsDuplicate) checks.push({id:"world:duplicate:"+n.path,status:"failed",detail:`${n.path} duplicates existing ${copy.path}. Reuse the existing world element unless a user requirement asks for another.`});
  }
  return checks;
}

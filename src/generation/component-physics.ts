import { XMLParser } from "fast-xml-parser";
type PhysicalNode = {path:string;className:string;ref:string;anchored:boolean;refs:Record<string,string>};
const list=(v:any):any[]=>v===undefined?[]:Array.isArray(v)?v:[v];
/** Uses captured properties and object references, never names or asset identity. */
export function componentPhysics(xml:string) {
  const parsed=new XMLParser({ignoreAttributes:false,parseTagValue:false}).parse(xml);
  const nodes:PhysicalNode[]=[];
  const visit=(item:any,parent:string)=>{
    const name=list(item.Properties?.string).find(p=>p["@_name"]==="Name")?.["#text"];
    const node={path:parent?parent+"/"+name:String(name),className:item["@_class"],ref:item["@_referent"],anchored:list(item.Properties?.bool).some(p=>p["@_name"]==="Anchored" && String(p["#text"])==="true"),refs:Object.fromEntries(list(item.Properties?.Ref).map(p=>[p["@_name"],String(p["#text"])]))};
    nodes.push(node);list(item.Item).forEach(child=>visit(child,node.path));
  };
  list(parsed.roblox?.Item).forEach(item=>visit(item,""));
  const parts=nodes.filter(n=>["Part","MeshPart","UnionOperation","WedgePart","CornerWedgePart","TrussPart","Seat","VehicleSeat","SpawnLocation"].includes(n.className));
  const graph=new Map(parts.map(n=>[n.ref,new Set<string>()]));
  for(const n of nodes) {
    const a=n.refs.Part0,b=n.refs.Part1;
    if(graph.has(a)&&graph.has(b)) {graph.get(a)!.add(b);graph.get(b)!.add(a);}
    const attachments=[n.refs.Attachment0,n.refs.Attachment1].map(ref=>nodes.find(x=>x.ref===ref)).map(x=>x && parts.find(p=>x.path.startsWith(p.path+"/")));
    if(attachments[0] && attachments[1]) {graph.get(attachments[0].ref)!.add(attachments[1].ref);graph.get(attachments[1].ref)!.add(attachments[0].ref);}
  }
  const seen=new Set<string>();const assemblies:{parts:string[];anchored:boolean;rig:boolean}[]=[];
  for(const p of parts) {
    if(seen.has(p.ref))continue;
    const refs=[p.ref];seen.add(p.ref);
    for(let i=0;i<refs.length;i++) for(const r of graph.get(refs[i])??[]) if(!seen.has(r)){seen.add(r);refs.push(r);}
    const members=parts.filter(p=>refs.includes(p.ref));
    const rig=refs.length>1 && nodes.some(n=>n.className==="Humanoid" && members.every(p=>p.path.startsWith(n.path.slice(0,n.path.lastIndexOf("/"))+"/")));
    assemblies.push({parts:members.map(p=>p.path),anchored:members.some(p=>p.anchored),rig});
  }
  return {status:"captured_static_evidence" as const,partCount:parts.length,assemblies,unsupportedParts:assemblies.filter(a=>!a.anchored&&!a.rig).flatMap(a=>a.parts),limitation:"Captured joints and anchors only. Runtime-created constraints and deliberate dynamics require an explicit integration decision and native verification."};
}

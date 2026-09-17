import fs from "node:fs";
import path from "node:path";
import { z } from "zod";
import type { Project } from "../core/project";
export class Store {
  constructor(private directory: string) {
    fs.mkdirSync(directory, { recursive: true });
  }
  private file(id: string) {
    return path.join(this.directory, z.uuid().parse(id) + ".json");
  }
  list(): Project[] {
    return fs
      .readdirSync(this.directory)
      .filter((f) => f.endsWith(".json"))
      .map(
        (f) =>
          JSON.parse(
            fs.readFileSync(path.join(this.directory, f), "utf8"),
          ) as Project,
      )
      .sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  }
  get(id: string): Project {
    const f = this.file(id);
    if (!fs.existsSync(f)) throw Error("Project not found");
    return JSON.parse(fs.readFileSync(f, "utf8"));
  }
  save(p: Project) {
    const file = this.file(p.id);
    fs.writeFileSync(file + ".tmp", JSON.stringify(p, null, 2));
    fs.renameSync(file + ".tmp", file);
    return p;
  }
}

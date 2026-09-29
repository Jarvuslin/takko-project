import fs from "node:fs";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { z } from "zod";

export const uiPreferencesSchema = z
  .object({ agentWidth: z.number().int().min(320).max(640).optional() })
  .strict();
export class UiPreferences {
  private file: string;
  constructor(directory: string) {
    this.file = path.join(directory, "ui-preferences.json");
  }
  read(): z.infer<typeof uiPreferencesSchema> {
    try {
      return uiPreferencesSchema.parse(
        JSON.parse(fs.readFileSync(this.file, "utf8")),
      );
    } catch {
      return {};
    }
  }
  write(value: unknown) {
    const preferences = uiPreferencesSchema.parse(value);
    fs.mkdirSync(path.dirname(this.file), { recursive: true });
    const temporary = this.file + "." + randomUUID() + ".tmp";
    fs.writeFileSync(temporary, JSON.stringify(preferences) + "\n");
    fs.renameSync(temporary, this.file);
    return preferences;
  }
}

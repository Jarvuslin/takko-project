import { expect, it } from "vitest";
import { OpenCodeDiagnostics } from "../src/generation/opencode-runtime";

it("retains structured error refs, exit details and bounded redacted log tails", () => {
  const logs = new OpenCodeDiagnostics("secret-token");
  logs.append("stderr", "discarded\n".repeat(20000));
  logs.append("stderr", "DEBUG token=secret-");
  logs.append("stderr", "token\nERROR ProviderModelNotFoundError\n");
  logs.append(
    "stdout",
    JSON.stringify({
      type: "error",
      error: { name: "UnknownError", data: { ref: "err_581b0f09" } },
    }),
  );
  const record = logs.snapshot(1, null);
  expect(record).toMatchObject({
    exitCode: 1,
    signal: null,
    errorRefs: ["err_581b0f09"],
  });
  expect(record.stderr.length).toBeLessThanOrEqual(16384);
  expect(record.stderr).not.toContain("secret-token");
  expect(logs.failure("OpenCode failed", record)).toContain("exit=1");
  expect(logs.failure("OpenCode failed", record)).toContain("err_581b0f09");
  expect(logs.failure("OpenCode failed", record)).toContain(
    "ProviderModelNotFoundError",
  );
  expect(
    logs.failure("OpenCode failed", logs.snapshot(null, "SIGTERM")),
  ).toContain("SIGTERM");
});

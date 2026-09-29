import { expect, it } from "vitest";
import type { Page } from "@playwright/test";
import { workspacePage } from "./workspace-page";

it.each([false, true])(
  "drains a pending status response before fixture disposal, including failed tests (%s)",
  async (failed) => {
    let handler!: (route: unknown) => Promise<void>;
    let pending!: Promise<void>;
    let release!: () => void;
    let drained = false;
    let finished = false;
    let start!: () => void;
    const started = new Promise<void>((resolve) => {
      start = resolve;
    });
    const responseReady = new Promise<void>((resolve) => {
      release = resolve;
    });
    const page = {
      async route(_pattern: string, callback: typeof handler) {
        handler = callback;
      },
      async unrouteAll(options: unknown) {
        expect(options).toEqual({ behavior: "wait" });
        await pending;
        drained = true;
      },
    } as unknown as Page;
    const lifecycle = workspacePage(page, async () => {
      pending = handler({
        fetch: async () => ({
          json: async () => {
            start();
            await responseReady;
            return { studioConnectionGate: true };
          },
        }),
        fulfill: async () => {},
      });
      await started;
      if (failed) throw Error("Original test failure");
    }).then(
      () => {
        finished = true;
      },
      (error) => {
        expect(error.message).toBe("Original test failure");
        finished = true;
      },
    );
    await started;
    await new Promise((resolve) => setTimeout(resolve, 0));
    const disposedBeforeDrain = finished;
    release();
    await lifecycle;
    await pending;
    expect(disposedBeforeDrain).toBe(false);
    expect(drained).toBe(true);
  },
);

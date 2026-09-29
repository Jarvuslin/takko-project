import { expect, it } from "vitest";
import { StudioMarketplace } from "../src/marketplace/studio";
import { StudioMcpError } from "../src/generation/studio-mcp-client";

it.each([
  ["not_installed", "connector was not found"],
  ["process_exit", "connector closed"],
  ["timeout", "did not respond in time"],
])(
  "explains %s with recovery steps and closes the owned client",
  async (code, message) => {
    let closed = false;
    const market = new StudioMarketplace(() => ({
      callTool: async () => {
        throw new StudioMcpError(
          code,
          "private diagnostic content",
          "not_sent",
        );
      },
      close: async () => {
        closed = true;
      },
    }));
    await expect(market.studios()).rejects.toThrow(message);
    expect(closed).toBe(true);
  },
);

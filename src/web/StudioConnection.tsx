import { useEffect, useRef, useState } from "react";
import { Icon } from "./Icons";

export function useStudioConnection(
  projectId: string | undefined,
  enabled: boolean,
) {
  const [connection, setConnection] = useState<{
    projectId?: string;
    state: "checking" | "disconnected" | "connected" | "offline";
    error?: string;
    names?: string[];
  }>({ state: "checking" });
  const sequence = useRef(0);
  async function check(background = false) {
    const current = ++sequence.current;
    if (!background) setConnection({ projectId, state: "checking" });
    try {
      const response = await fetch("/api/marketplace/studios");
      const result = await response.json();
      if (!response.ok)
        throw Error(result.error ?? "Studio connection could not be checked.");
      if (current !== sequence.current) return;
      setConnection({
        projectId,
        state: result.studios.length ? "connected" : "disconnected",
        names: result.studios.map((s: { name: string }) => s.name),
      });
    } catch (error) {
      if (current === sequence.current)
        setConnection({
          projectId,
          state: "disconnected",
          error: (error as Error).message,
        });
    }
  }
  useEffect(() => {
    if (enabled && projectId) void check();
    return () => {
      sequence.current++;
    };
  }, [projectId, enabled]);
  const state =
    connection.projectId === projectId ? connection.state : "checking";
  useEffect(() => {
    if (!enabled || !projectId || state !== "connected") return;
    const timer = setTimeout(() => void check(true), 15000);
    return () => clearTimeout(timer);
  }, [connection, enabled, projectId]);
  return {
    ...connection,
    state,
    check: () => void check(),
    offline: () => {
      sequence.current++;
      setConnection({ projectId, state: "offline" });
    },
    open: () => {
      sequence.current++;
      setConnection({ projectId, state: "disconnected" });
    },
  };
}

export function StudioConnectionScreen({
  name,
  checking,
  error,
  pluginConnected,
  check,
  offline,
}: {
  name: string;
  checking: boolean;
  error?: string;
  pluginConnected: boolean;
  check: () => void;
  offline: () => void;
}) {
  return (
    <section
      className="studio-welcome"
      aria-labelledby="studio-welcome-title"
      aria-busy={checking}
    >
      <div className="studio-welcome-intro">
        <span className="eyebrow bounded-name" title={name}>
          YOUR PROJECT · {name}
        </span>
        <div className="studio-welcome-icon">
          <Icon name="cube" size={32} />
        </div>
        <h1 id="studio-welcome-title">
          {checking ? "Looking for Studio…" : "Connect your creative space"}
        </h1>
        <p>
          Connect Roblox Studio to find Marketplace assets, preview animations
          and build your game.
        </p>
        <div className="studio-connection-state" role="status">
          {checking ? "Checking the Studio connection…" : "Studio disconnected"}
        </div>
        {error && (
          <p className="connection-error" role="alert">
            {error}
          </p>
        )}
        <div className="studio-welcome-actions">
          <button className="primary" onClick={check} disabled={checking}>
            {checking ? "Checking…" : "Connect to Studio"}
          </button>
          <button onClick={offline}>Continue offline</button>
        </div>
        <small>
          Offline mode lets you write and refine your brief. Architecture and
          Studio tools become available when you connect. Model calls still
          require an internet connection.
        </small>
      </div>
      <div className="studio-welcome-guide">
        <span className="eyebrow">SET UP ONCE</span>
        <h2>Open Studio. Connect. Create.</h2>
        <ol>
          <li>
            <strong>Open your place in Roblox Studio</strong>
            <p>
              Sign in, then open an existing place or a new Baseplate. Leave it
              in Edit mode.
            </p>
          </li>
          <li>
            <strong>Enable Studio’s connection</strong>
            <p>
              Open Assistant, then its settings or ⋯ menu. Choose{" "}
              <b>MCP Servers</b> (or <b>Manage MCP Servers</b>) and turn on{" "}
              <b>Enable Studio as MCP server</b>.
            </p>
          </li>
          <li>
            <strong>Return here and connect</strong>
            <p>
              Click <b>Connect to Studio</b>. Takko checks for your open Studio
              sessions. You can select the place to use when browsing assets.
            </p>
          </li>
        </ol>
        <a
          href="https://create.roblox.com/docs/studio/mcp"
          target="_blank"
          rel="noreferrer"
        >
          Roblox’s connection guide ↗
        </a>
        <details className="studio-plugin-guide">
          <summary>Set up the Takko plugin for applying builds</summary>
          <p>
            The Marketplace connection and the build plugin are separate.
            Plugin: {pluginConnected ? "connected" : "not connected"}.
          </p>
          <ol>
            <li>
              <a href="/api/studio/plugin">Download Takko.rbxmx</a>. Insert it
              in Studio and use “Save as Local Plugin” on its script.
            </li>
            <li>
              Open a new Studio session after installing. Open the Takko toolbar
              panel and allow its local HTTP connection when asked.
            </li>
            <li>
              Press <b>Connect to Takko</b> in the plugin. It pairs with this
              app automatically. After restarting Takko, press Reconnect in the
              plugin.
            </li>
          </ol>
        </details>
      </div>
    </section>
  );
}

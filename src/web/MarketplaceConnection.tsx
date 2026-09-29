import { useEffect, useRef, useState, type ReactNode } from "react";
import "./marketplace-connection.css";

export function useMarketplaceConnection(initial = "", offline = false) {
  const [studios, setStudios] = useState<{ id: string; name: string }[]>([]);
  const [studioId, setStudioId] = useState(initial);
  const [state, setState] = useState<
    "checking" | "ready" | "error" | "offline"
  >("checking");
  const [error, setError] = useState("");
  const [checked, setChecked] = useState(0);
  const pending = useRef<AbortController | null>(null);
  async function refresh() {
    if (pending.current) return;
    if (offline) {
      setStudios([]);
      setStudioId("");
      setState("offline");
      return;
    }
    const controller = new AbortController();
    pending.current = controller;
    setState("checking");
    setError("");
    try {
      const response = await fetch("/api/marketplace/studios", {
        signal: AbortSignal.any([
          controller.signal,
          AbortSignal.timeout(20000),
        ]),
      });
      const result = await response.json();
      if (!response.ok) throw Error(result.error ?? "Could not check Studio.");
      if (controller.signal.aborted) return;
      setStudios(result.studios);
      const saved = localStorage.getItem("takko-marketplace-studio");
      setStudioId((id) =>
        result.studios.some((s: { id: string }) => s.id === id)
          ? id
          : result.studios.some((s: { id: string }) => s.id === saved)
            ? saved!
            : result.studios.length === 1
              ? result.studios[0].id
              : "",
      );
      setChecked((n) => n + 1);
      setState("ready");
    } catch (e) {
      if (controller.signal.aborted) return;
      setStudios([]);
      setStudioId("");
      setState("error");
      setError(
        (e as Error).name === "TimeoutError"
          ? "Studio took too long to respond. Check its MCP connection, then refresh."
          : (e as Error).message,
      );
    } finally {
      if (pending.current === controller) pending.current = null;
    }
  }
  useEffect(() => {
    void refresh();
    return () => {
      pending.current?.abort();
      pending.current = null;
    };
  }, [offline]);
  const connected = state === "ready" && studios.some((s) => s.id === studioId);
  return {
    studios,
    studioId,
    state,
    error,
    checked,
    connected,
    refresh,
    choose(id: string) {
      setStudioId(id);
      localStorage.setItem("takko-marketplace-studio", id);
    },
  };
}

export function MarketplaceConnection({
  connection: c,
  label,
  busy = false,
  children,
}: {
  connection: ReturnType<typeof useMarketplaceConnection>;
  label: string;
  busy?: boolean;
  children?: ReactNode;
}) {
  const checking = c.state === "checking";
  return (
    <section
      className="marketplace-connection"
      aria-label="Studio connection"
      aria-busy={checking}
    >
      <p
        className="marketplace-connection-status"
        role="status"
        data-connected={c.connected}
      >
        <span
          aria-hidden="true"
          className={checking ? "spinner" : "connection-dot"}
        />
        <strong>
          {checking
            ? "Checking Studio…"
            : c.connected
              ? "Studio connected"
              : c.state === "offline"
                ? "Offline mode"
                : c.state === "error"
                  ? "Connection check failed"
                  : c.studios.length
                    ? "Select a Studio"
                    : "Studio disconnected"}
        </strong>
      </p>
      <div className="control-row studio-control-row">
        <label>
          Studio
          <select
            aria-label={label}
            value={c.studioId}
            disabled={checking || busy || c.state === "offline"}
            onChange={(e) => c.choose(e.target.value)}
          >
            <option value="">Select Studio</option>
            {c.studios.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </label>
        <button
          type="button"
          disabled={checking || busy || c.state === "offline"}
          onClick={() => c.refresh()}
        >
          {checking ? "Checking…" : "Refresh connection"}
        </button>
        {children}
      </div>
      {c.error && <p role="alert">{c.error}</p>}
      {!checking && !c.connected && (
        <p className="muted">
          {c.state === "offline"
            ? "Connect Studio to search and preview assets, or find assets later."
            : "Open your place in Roblox Studio and enable Studio as an MCP server, then refresh."}
        </p>
      )}
    </section>
  );
}

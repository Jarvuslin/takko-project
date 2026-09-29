import { useEffect, useRef, useState, type MutableRefObject } from "react";
import type { ModelPreset, Profile, Project } from "../generation/schema";
import { DEFAULT_REQUEST_TIMEOUT_MS } from "../generation/schema";
import {
  SettingsDialog,
  settingsApi,
  type PublicSettings,
  type SettingsPage,
} from "./SettingsWorkspace";
import { Icon } from "./Icons";

const providers = {
  openrouter: {
    name: "OpenRouter",
    endpoint: "https://openrouter.ai/api/v1",
    note: "One account, many model families",
    brand: "openrouter",
  },
  openai: {
    name: "OpenAI",
    endpoint: "https://api.openai.com/v1",
    note: "GPT and reasoning models",
    brand: "openai",
  },
  anthropic: {
    name: "Anthropic",
    endpoint: "https://api.anthropic.com/v1",
    note: "Claude models",
    brand: "claude",
  },
  gemini: {
    name: "Google Gemini",
    endpoint: "https://generativelanguage.googleapis.com/v1beta",
    note: "Gemini models",
    brand: "googlegemini",
  },
  compatible: {
    name: "Other / local",
    endpoint: "http://127.0.0.1:1234/v1",
    note: "Your own compatible provider",
    brand: "local",
  },
};
type Provider = Profile["provider"];
type CatalogModel = {
  id: string;
  name: string;
  inputRate: number | null;
  outputRate: number | null;
  contextLength?: number;
};
const roles = [
  ["research", "Research", "Find useful game references"],
  ["planner", "Planner", "Turn your idea into a plan"],
  ["builder", "Builder", "Create the game"],
  ["reviewer", "Reviewer", "Check the result"],
  ["repair", "Repair", "Fix issues found in review"],
] as const;
const presetIcons = {
  taco: "🌮",
  bolt: "⚡",
  spark: "✨",
  leaf: "🌱",
  rocket: "🚀",
  robot: "🤖",
};
const money = (n: number) => "$" + n.toFixed(n < 0.01 && n > 0 ? 4 : 2);
const blankModel = (provider: Provider): Profile => ({
  id: crypto.randomUUID(),
  name: "",
  provider,
  baseUrl: providers[provider].endpoint,
  model: "",
  inputRate: 0,
  outputRate: 0,
  pricingSource: "unknown",
  maxOutputTokens: 8192,
  jsonMode: true,
});
function modelBrand(model: string, provider: Provider) {
  const id = model.toLowerCase();
  if (/claude|anthropic/.test(id)) return "claude";
  if (/gemini|^google\//.test(id)) return "googlegemini";
  if (/gpt|^openai\//.test(id)) return "openai";
  if (/deepseek/.test(id)) return "deepseek";
  if (/qwen/.test(id)) return "qwen";
  if (/llama|^meta\//.test(id)) return "meta";
  if (/mistral|codestral/.test(id)) return "mistralai";
  return providers[provider].brand;
}
function connection(settings: PublicSettings, profile: Profile) {
  return settings.connections?.find(
    (p) =>
      p.provider === profile.provider &&
      p.baseUrl.replace(/\/$/, "") === profile.baseUrl.replace(/\/$/, "") &&
      p.hasKey,
  );
}
function legacyConnection(settings: PublicSettings, profile: Profile) {
  const matches = settings.profiles.filter(
    (p) =>
      p.provider === profile.provider &&
      p.baseUrl === profile.baseUrl &&
      p.hasKey,
  );
  return matches.find((p) => p.id === profile.id) ?? matches[0];
}
function Brand({ brand }: { brand: string }) {
  return (
    <span className={"brand-mark brand-" + brand} aria-hidden="true">
      {brand === "local" ? (
        <Icon name="cube" />
      ) : (
        <img src={"/brands/" + brand + ".svg"} alt="" />
      )}
    </span>
  );
}
function useGuard(
  guard: MutableRefObject<() => boolean>,
  dirty: boolean,
  busy: boolean,
) {
  useEffect(() => {
    guard.current = () =>
      !busy && (!dirty || confirm("Discard unsaved changes?"));
    const unload = (e: BeforeUnloadEvent) => {
      if (dirty || busy) e.preventDefault();
    };
    window.addEventListener("beforeunload", unload);
    return () => {
      guard.current = () => true;
      window.removeEventListener("beforeunload", unload);
    };
  }, [guard, dirty, busy]);
}
function ProviderChoices({
  value,
  change,
}: {
  value: Provider;
  change: (p: Provider) => void;
}) {
  return (
    <div className="provider-choices" role="group" aria-label="Provider">
      {Object.entries(providers).map(([id, p]) => (
        <button
          key={id}
          type="button"
          aria-pressed={id === value}
          onClick={() => change(id as Provider)}
        >
          <Brand brand={p.brand} />
          <span>{p.name}</span>
        </button>
      ))}
    </div>
  );
}
function ProviderConnection({
  profile,
  settings,
  saved,
}: {
  profile: Profile;
  settings: PublicSettings;
  saved: (s: PublicSettings) => void;
}) {
  const source = connection(settings, profile);
  const legacy = legacyConnection(settings, profile);
  const [key, setKey] = useState("");
  const [editing, setEditing] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    setKey("");
    setEditing(false);
    setError("");
  }, [profile.provider, profile.baseUrl]);
  const validate = async () => {
    setBusy(true);
    setError("");
    try {
      const result = await settingsApi<PublicSettings>(
        "/provider-connections",
        "POST",
        {
          profile: {
            ...profile,
            name: profile.name || providers[profile.provider].name,
          },
          ...(key.trim() ? { key: key.trim() } : {}),
        },
      );
      setKey("");
      setEditing(false);
      saved(result);
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <div
      className={
        "provider-connection " + (source ? "is-connected" : "is-locked")
      }
    >
      <div className="connection-copy">
        <span className="connection-icon">
          <Icon name={source ? "check" : "key"} />
        </span>
        <div>
          <strong>
            {error
              ? "Connection needs attention"
              : source
                ? `${providers[profile.provider].name} ${source.validated ? "connected" : "key saved"}`
                : `Connect ${providers[profile.provider].name}`}
          </strong>
          <small>
            {source
              ? "Available to all models from this provider."
              : "Add your provider key once. Validate it to unlock the model catalog."}
          </small>
          <small>
            {settings.credentialStorage === "windows-encrypted"
              ? "Saved encrypted on this PC, protected by your Windows account."
              : "Available for this session. This server does not support encrypted storage."}
          </small>
        </div>
      </div>
      {(!source || editing) && (
        <div className="connection-entry control-row">
          <label>
            API key
            <input
              type="password"
              aria-label="API key"
              autoComplete="off"
              spellCheck={false}
              value={key}
              onChange={(e) => setKey(e.target.value)}
              placeholder="Paste your provider API key"
              disabled={busy}
            />
          </label>
          <button
            type="button"
            className="primary"
            disabled={busy || (!key.trim() && !legacy)}
            onClick={() => void validate()}
          >
            {busy ? "Validating…" : "Validate & connect"}
          </button>
          {source && (
            <button
              type="button"
              disabled={busy}
              onClick={() => {
                setEditing(false);
                setKey("");
              }}
            >
              Cancel
            </button>
          )}
        </div>
      )}
      {!source && legacy && (
        <small className="legacy-key-note">
          A key is already available. Validate it without entering it again.
        </small>
      )}
      {source && !editing && (
        <details className="connection-management">
          <summary>Manage connection</summary>
          <div className="connection-actions">
            <button
              type="button"
              disabled={busy}
              onClick={() => void validate()}
            >
              {busy ? "Checking…" : "Test connection"}
            </button>
            <button type="button" onClick={() => setEditing(true)}>
              Replace key
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={async () => {
                if (
                  !confirm(
                    "Disconnect this provider? Its models stay in your library, but they will need a key again.",
                  )
                )
                  return;
                setBusy(true);
                try {
                  saved(
                    await settingsApi("/provider-connections", "DELETE", {
                      profile: {
                        ...profile,
                        name: profile.name || providers[profile.provider].name,
                      },
                    }),
                  );
                } catch (e) {
                  setError((e as Error).message);
                } finally {
                  setBusy(false);
                }
              }}
            >
              Disconnect
            </button>
          </div>
        </details>
      )}
      {error && <p role="alert">{error}</p>}
    </div>
  );
}
function Catalog({
  profile,
  settings,
  choose,
}: {
  profile: Profile;
  settings: PublicSettings;
  choose: (m: CatalogModel) => void;
}) {
  const [models, setModels] = useState<CatalogModel[]>([]);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("");
  const [busy, setBusy] = useState(false);
  const [retry, setRetry] = useState(0);
  const [visible, setVisible] = useState(40);
  const [priceFilter, setPriceFilter] = useState("all");
  const [sort, setSort] = useState("provider");
  const source = connection(settings, profile);
  useEffect(() => {
    let cancelled = false;
    setModels([]);
    setQuery("");
    setVisible(40);
    setBusy(false);
    if (!source) {
      setStatus(
        "Connect this provider to browse its models. Your key is shared by every model you add from this provider.",
      );
      return;
    }
    setStatus("");
    setBusy(true);
    const timer = setTimeout(() => {
      settingsApi<CatalogModel[]>("/model-catalog", "POST", {
        profile: {
          ...profile,
          name: profile.name || providers[profile.provider].name,
        },
      })
        .then((rows) => {
          if (!cancelled) {
            setModels(rows);
            setStatus(
              rows.length
                ? ""
                : "This provider returned no models. You can enter a model ID manually.",
            );
          }
        })
        .catch(() => {
          if (!cancelled)
            setStatus(
              "Couldn't load models. Check your key and connection, or enter a model ID manually.",
            );
        })
        .finally(() => {
          if (!cancelled) setBusy(false);
        });
    }, 0);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [
    profile.provider,
    profile.baseUrl,
    source?.hasKey,
    source?.validated,
    retry,
  ]);
  const filtered = models.filter(
    (m) =>
      (m.name + " " + m.id).toLowerCase().includes(query.toLowerCase()) &&
      (priceFilter === "all" ||
        (m.inputRate !== null &&
          m.outputRate !== null &&
          (priceFilter === "free"
            ? m.inputRate === 0 && m.outputRate === 0
            : m.inputRate <= 1 && m.outputRate <= 5))),
  );
  if (sort === "name") filtered.sort((a, b) => a.name.localeCompare(b.name));
  if (sort === "price")
    filtered.sort(
      (a, b) => (a.inputRate ?? Infinity) - (b.inputRate ?? Infinity),
    );
  return (
    <section
      className="provider-catalog"
      aria-label={providers[profile.provider].name + " model catalog"}
    >
      <div className="catalog-heading">
        <div>
          <strong>Available from {providers[profile.provider].name}</strong>
          <small>
            {models.length
              ? `${models.length} models · choose one to add`
              : "The catalog loads automatically"}
          </small>
        </div>
        <button
          type="button"
          disabled={busy || !source}
          onClick={() => setRetry((v) => v + 1)}
          aria-label="Refresh model catalog"
        >
          <Icon name="sliders" /> Refresh
        </button>
      </div>
      {busy && (
        <div className="catalog-loading" role="status">
          <p>Loading available models…</p>
          {[0, 1, 2].map((i) => (
            <div className="catalog-skeleton" aria-hidden="true" key={i}>
              <span />
              <span />
            </div>
          ))}
        </div>
      )}
      {status && (
        <p className="catalog-note" role="status">
          {status}
        </p>
      )}
      {!!models.length && (
        <>
          <div className="catalog-filters">
            <label className="catalog-search">
              <span className="sr-only">Search provider models</span>
              <input
                type="search"
                placeholder="Search models…"
                value={query}
                onChange={(e) => {
                  setQuery(e.target.value);
                  setVisible(40);
                }}
              />
            </label>
            <select
              aria-label="Filter catalog by price"
              value={priceFilter}
              onChange={(e) => setPriceFilter(e.target.value)}
            >
              <option value="all">All price ranges</option>
              <option value="free">Free models</option>
              <option value="budget">Up to $1 read / $5 write</option>
            </select>
            <select
              aria-label="Sort catalog"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="provider">Provider order</option>
              <option value="name">Name: A–Z</option>
              <option value="price">Reading price: low first</option>
            </select>
          </div>
          <div className="library-catalog-results">
            {filtered.slice(0, visible).map((m) => (
              <button
                key={m.id}
                type="button"
                className="catalog-model"
                onClick={() => choose(m)}
              >
                <Brand brand={modelBrand(m.id, profile.provider)} />
                <span>
                  <strong>{m.name}</strong>
                  <small>{m.id}</small>
                </span>
                <span className="catalog-context">
                  <small>Context</small>
                  {m.contextLength
                    ? Math.round(m.contextLength / 1000) + "K tokens"
                    : "Not listed"}
                </span>
                <span className="catalog-cost">
                  {m.inputRate === null || m.outputRate === null
                    ? "Price unavailable"
                    : `${money(m.inputRate)} read · ${money(m.outputRate)} write`}
                  <small>per 1M tokens</small>
                </span>
                <span className="catalog-add">
                  <Icon name="plus" /> Add
                </span>
              </button>
            ))}
            {!filtered.length && <p>No matching models.</p>}
          </div>
          {filtered.length > visible && (
            <button type="button" onClick={() => setVisible((n) => n + 40)}>
              Show more models ({filtered.length - visible} remaining)
            </button>
          )}
        </>
      )}
    </section>
  );
}
function picked(profile: Profile, m: CatalogModel): Profile {
  const known = m.inputRate !== null && m.outputRate !== null;
  return {
    ...profile,
    name: m.name,
    model: m.id,
    inputRate: m.inputRate ?? 0,
    outputRate: m.outputRate ?? 0,
    pricingSource: known ? "catalog" : "unknown",
  };
}

function ModelForm({
  initial,
  settings,
  guard,
  close,
  saved,
}: {
  initial: Profile;
  settings: PublicSettings;
  guard: MutableRefObject<() => boolean>;
  close: () => void;
  saved: (s: PublicSettings) => void;
}) {
  const [profile, setProfile] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [remove, setRemove] = useState(false);
  const [manual, setManual] = useState(false);
  const [priceOpen, setPriceOpen] = useState(
    initial.pricingSource === "unknown" && !!initial.model,
  );
  const exists = settings.profiles.some((p) => p.id === initial.id);
  const source = connection(settings, profile);
  const dirty = JSON.stringify(initial) !== JSON.stringify(profile);
  useGuard(guard, dirty, busy);
  const update = (patch: Partial<Profile>) =>
    setProfile((p) => {
      const next = { ...p, ...patch };
      if (
        next.provider !== "openrouter" ||
        !next.model.startsWith("anthropic/")
      )
        next.structuredOutput = undefined;
      return next;
    });
  const save = async () => {
    setError("");
    setBusy(true);
    try {
      const s = await settingsApi<PublicSettings>(
        "/model-profiles/" + profile.id,
        "PUT",
        {
          profile: { ...profile, name: profile.name || profile.model },
        },
      );
      saved(s);
      close();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  };
  return (
    <SettingsDialog
      title={exists ? "Edit model" : "Add model"}
      description="Choose a model for your library. Use it in any preset."
      close={close}
      dirty={dirty}
      busy={busy}
    >
      <form
        onSubmit={(e) => {
          e.preventDefault();
          void save();
        }}
      >
        <div className="dialog-body model-form-body">
          {error && <p role="alert">{error}</p>}
          <h3>Provider</h3>
          <ProviderChoices
            value={profile.provider}
            change={(provider) => {
              setProfile({ ...blankModel(provider), id: initial.id });
              setManual(false);
              setPriceOpen(false);
            }}
          />
          {profile.provider === "compatible" ? (
            <label>
              Provider endpoint
              <input
                type="url"
                required
                value={profile.baseUrl}
                onChange={(e) => update({ baseUrl: e.target.value })}
              />
            </label>
          ) : (
            <p className="muted endpoint-note">
              Official provider address filled in automatically.
            </p>
          )}
          <ProviderConnection
            profile={profile}
            settings={settings}
            saved={saved}
          />
          <h3>Model</h3>
          {!profile.model && (
            <Catalog
              profile={profile}
              settings={settings}
              choose={(m) => {
                setProfile((p) => ({
                  ...picked(p, m),
                  structuredOutput:
                    p.provider === "openrouter" && m.id.startsWith("anthropic/")
                      ? p.structuredOutput
                      : undefined,
                }));
                setPriceOpen(picked(profile, m).pricingSource === "unknown");
                setManual(false);
              }}
            />
          )}
          {profile.model && (
            <div className="selected-model">
              <Brand brand={modelBrand(profile.model, profile.provider)} />
              <span>
                <strong>{profile.name || profile.model}</strong>
                <small>{profile.model}</small>
              </span>
              <span className="status-pill">Selected</span>
              <button type="button" onClick={() => update({ model: "" })}>
                Change model
              </button>
            </div>
          )}
          <button
            type="button"
            className="text-button"
            disabled={!source}
            onClick={() => setManual((v) => !v)}
          >
            {manual
              ? "Hide model details"
              : profile.model
                ? "Edit model details"
                : "Can't find it? Enter a model ID"}
          </button>
          {manual && source && (
            <div className="settings-form-grid">
              <label>
                Library name
                <input
                  value={profile.name}
                  onChange={(e) => update({ name: e.target.value })}
                  placeholder="A name you'll recognize"
                  maxLength={80}
                />
              </label>
              <label>
                Model ID
                <input
                  required
                  value={profile.model}
                  aria-label="Model ID"
                  onChange={(e) => {
                    update({ model: e.target.value, pricingSource: "unknown" });
                    setPriceOpen(true);
                  }}
                />
                <small>Filled in when you choose from the catalog.</small>
              </label>
            </div>
          )}
          {profile.provider === "openrouter" && source && (
            <div>
              <button
                type="button"
                onClick={() => {
                  update({
                    model: "typesafe/jev-1.13",
                    name: "Jev 1.13 · Non-coding decisions",
                    inputRate: 0.042,
                    outputRate: 0,
                    pricingSource: "manual",
                  });
                  setManual(true);
                }}
              >
                Use Jev for non-coding decisions
              </button>
              {profile.model === "typesafe/jev-1.13" && (
                <small>
                  Classifies gameplay needs and assesses asset relevance. Assign
                  it to Non-coding decisions in your preset. It does not write
                  code or verify gameplay.
                </small>
              )}
            </div>
          )}
          <details
            className="price-details"
            open={priceOpen}
            onToggle={(e) => setPriceOpen(e.currentTarget.open)}
          >
            <summary>
              Usage cost{" "}
              {profile.pricingSource === "unknown"
                ? "· price unavailable"
                : "· " +
                  money(profile.inputRate) +
                  " read / " +
                  money(profile.outputRate) +
                  " write"}
            </summary>
            <p className="muted">
              Providers charge for text the model reads and writes. Tokens are
              small pieces of text. The rates below are dollars per one million
              tokens.
            </p>
            <div className="settings-form-grid">
              <label>
                Reading price (USD)
                <input
                  type="number"
                  min="0"
                  max="1000"
                  step="any"
                  required
                  value={profile.inputRate}
                  onChange={(e) =>
                    update({
                      inputRate: Number(e.target.value),
                      pricingSource: "manual",
                    })
                  }
                />
              </label>
              <label>
                Writing price (USD)
                <input
                  type="number"
                  min="0"
                  max="1000"
                  step="any"
                  required
                  value={profile.outputRate}
                  onChange={(e) =>
                    update({
                      outputRate: Number(e.target.value),
                      pricingSource: "manual",
                    })
                  }
                />
              </label>
            </div>
            {profile.pricingSource === "unknown" ? (
              <p className="catalog-note">
                This provider didn't share pricing. Add its rates to make
                spending limits useful. A zero rate cannot enforce a meaningful
                spending limit.
              </p>
            ) : (
              <p className="muted">
                Example: 10,000 tokens read + 2,000 written ≈{" "}
                {money(profile.inputRate * 0.01 + profile.outputRate * 0.002)}.
                This is an example, not the price of a game.
              </p>
            )}
          </details>
          <details>
            <summary>
              Advanced <small>Optional · defaults work for most models</small>
            </summary>
            <label>
              Maximum reply size
              <select
                value={profile.maxOutputTokens}
                onChange={(e) =>
                  update({ maxOutputTokens: Number(e.target.value) })
                }
              >
                {![4096, 8192, 16384, 32768].includes(
                  profile.maxOutputTokens,
                ) && (
                  <option value={profile.maxOutputTokens}>
                    Custom ({profile.maxOutputTokens} tokens)
                  </option>
                )}
                <option value="4096">Short · 4,096 tokens</option>
                <option value="8192">Standard · 8,192 tokens</option>
                <option value="16384">Long · 16,384 tokens</option>
                <option value="32768">Extra long · 32,768 tokens</option>
              </select>
              <small>
                This is the combined allowance for reasoning and answer output
                on supported models. A model that reasons longer leaves less
                room for the answer. Larger allowances can cost more.
              </small>
            </label>
            {profile.provider === "openrouter" && (
              <label>
                Reasoning effort
                <select
                  value={profile.reasoningEffort ?? ""}
                  onChange={(e) =>
                    update({
                      reasoningEffort: (e.target.value ||
                        undefined) as Profile["reasoningEffort"],
                    })
                  }
                >
                  <option value="">Automatic</option>
                  <option value="low">Low · more room for the answer</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
                <small>
                  Automatic leaves the effort unset so the provider chooses its
                  default. Choose an effort only when you want to override it.
                  Support depends on the selected model.
                </small>
              </label>
            )}
            <label>
              Time to wait for a reply (seconds)
              <input
                type="number"
                min="1"
                max="600"
                value={
                  (profile.requestTimeoutMs ?? DEFAULT_REQUEST_TIMEOUT_MS) /
                  1000
                }
                onChange={(e) =>
                  update({ requestTimeoutMs: Number(e.target.value) * 1000 })
                }
              />
            </label>
            <label className="check-label">
              <input
                type="checkbox"
                checked={profile.jsonMode}
                onChange={(e) => update({ jsonMode: e.target.checked })}
              />
              Request JSON replies
            </label>
            <small>
              Helps Takko read the result. Turn off only if your provider
              doesn't support it.
            </small>
            {profile.provider === "openrouter" &&
              profile.model.startsWith("anthropic/") && (
                <>
                  <label className="check-label">
                    <input
                      type="checkbox"
                      checked={profile.structuredOutput === "anthropic"}
                      onChange={(e) =>
                        update({
                          structuredOutput: e.target.checked
                            ? "anthropic"
                            : undefined,
                        })
                      }
                    />
                    Check concept response structure
                  </label>
                  <small>
                    Uses Anthropic’s strict format through OpenRouter when
                    available. Takko checks support first. Choices still need
                    your review.
                  </small>
                </>
              )}
          </details>
          {exists && (
            <div className="remove-model">
              <button type="button" onClick={() => setRemove(true)}>
                Remove model
              </button>
              {remove && (
                <>
                  <p>
                    This removes the model from every preset. Your projects
                    stay.
                  </p>
                  <button
                    type="button"
                    disabled={busy}
                    onClick={async () => {
                      setBusy(true);
                      try {
                        saved(
                          await settingsApi(
                            "/model-profiles/" + profile.id,
                            "DELETE",
                          ),
                        );
                        close();
                      } catch (e) {
                        setError((e as Error).message);
                      } finally {
                        setBusy(false);
                      }
                    }}
                  >
                    Remove from library
                  </button>
                </>
              )}
            </div>
          )}
        </div>
        <footer className="dialog-actions">
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              if (!dirty || confirm("Discard unsaved changes?")) close();
            }}
          >
            Cancel
          </button>
          <button
            className="primary"
            disabled={busy || !profile.model.trim() || !source}
          >
            {busy ? "Saving…" : exists ? "Save model" : "Add to library"}
          </button>
        </footer>
      </form>
    </SettingsDialog>
  );
}

function PresetForm({
  initial,
  settings,
  guard,
  close,
  saved,
}: {
  initial: ModelPreset;
  settings: PublicSettings;
  guard: MutableRefObject<() => boolean>;
  close: () => void;
  saved: (s: PublicSettings) => void;
}) {
  const [preset, setPreset] = useState(initial);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [all, setAll] = useState("");
  const dirty = JSON.stringify(preset) !== JSON.stringify(initial);
  useGuard(guard, dirty, busy);
  const options = (
    <>
      {settings.profiles
        .filter((p) => !/^(?:~)?typesafe\/jev(?:-|$)/.test(p.model))
        .map((p) => (
          <option key={p.id} value={p.id}>
            {p.name}
          </option>
        ))}
    </>
  );
  const updateRoute = (
    role: keyof ModelPreset["routes"],
    index: number,
    value: string,
  ) => {
    const route = [...(preset.routes[role] ?? [])];
    if (value) route[index] = value;
    else route.splice(index);
    setPreset((p) => ({
      ...p,
      routes: { ...p.routes, [role]: route.filter(Boolean) },
    }));
  };
  return (
    <SettingsDialog
      title="Preset options"
      description="Your reusable team of models, with its own spending limits."
      close={close}
      dirty={dirty}
      busy={busy}
    >
      <form
        onSubmit={async (e) => {
          e.preventDefault();
          setBusy(true);
          setError("");
          try {
            saved(
              await settingsApi("/model-presets/" + preset.id, "PUT", preset),
            );
            close();
          } catch (e) {
            setError((e as Error).message);
          } finally {
            setBusy(false);
          }
        }}
      >
        <div className="dialog-body preset-form">
          {error && <p role="alert">{error}</p>}
          <label>
            Preset name
            <input
              required
              maxLength={60}
              value={preset.name}
              onChange={(e) =>
                setPreset((p) => ({ ...p, name: e.target.value }))
              }
              placeholder="Everyday, Fast builds, Deep thinking…"
            />
          </label>
          <div
            className="preset-icon-picker"
            role="group"
            aria-label="Preset icon"
          >
            {Object.entries(presetIcons).map(([id, emoji]) => (
              <button
                key={id}
                type="button"
                aria-label={id + " icon"}
                aria-pressed={preset.icon === id}
                onClick={() =>
                  setPreset((p) => ({ ...p, icon: id as ModelPreset["icon"] }))
                }
              >
                {emoji}
              </button>
            ))}
          </div>
          <h3>Your team</h3>
          <p className="muted">
            Choose a model for each job. One model can do every job.
          </p>
          {!settings.profiles.length && (
            <p className="catalog-note">
              Add models to your library first. You can still save this preset
              and finish the team later.
            </p>
          )}
          <div className="all-models">
            <label>
              Use one model for all
              <select
                value={all}
                onChange={(e) => {
                  const id = e.target.value;
                  setAll(id);
                  if (id)
                    setPreset((p) => ({
                      ...p,
                      routes: {
                        ...p.routes,
                        ...Object.fromEntries(
                          roles.map(([role]) => [
                            role,
                            [
                              id,
                              ...(p.routes[role] ?? [])
                                .filter((x) => x !== id)
                                .slice(0, 2),
                            ],
                          ]),
                        ),
                      },
                    }));
                }}
              >
                <option value="">Choose a library model</option>
                {options}
              </select>
            </label>
          </div>
          <label className="check-label">
            <input
              type="checkbox"
              checked={!!preset.researchEnabled}
              onChange={(e) =>
                setPreset((p) => ({ ...p, researchEnabled: e.target.checked }))
              }
            />
            Research before planning
          </label>
          <div className="preset-roles">
            {roles.map(([role, name, description]) => (
              <div className="preset-role" key={role}>
                <label>
                  <strong>{name}</strong>
                  <small>{description}</small>
                  <select
                    aria-label={role + " primary"}
                    value={preset.routes[role]?.[0] ?? ""}
                    onChange={(e) => {
                      const id = e.target.value;
                      setPreset((p) => ({
                        ...p,
                        routes: {
                          ...p.routes,
                          [role]: id
                            ? [
                                id,
                                ...(p.routes[role] ?? [])
                                  .slice(1)
                                  .filter((x) => x !== id),
                              ]
                            : [],
                        },
                      }));
                    }}
                  >
                    <option value="">
                      {role === "research"
                        ? "Use planner model"
                        : "Choose a model"}
                    </option>
                    {options}
                  </select>
                </label>
                <details>
                  <summary>
                    Backup models <small>Used if the first model fails</small>
                  </summary>
                  {[1, 2].map((index) => (
                    <label key={index}>
                      Backup {index}
                      <select
                        aria-label={role + " fallback " + index}
                        disabled={!preset.routes[role]?.[index - 1]}
                        value={preset.routes[role]?.[index] ?? ""}
                        onChange={(e) =>
                          updateRoute(role, index, e.target.value)
                        }
                      >
                        <option value="">None</option>
                        {settings.profiles.map((p) => (
                          <option
                            key={p.id}
                            value={p.id}
                            disabled={(preset.routes[role] ?? []).some(
                              (id, i) => i !== index && id === p.id,
                            )}
                          >
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </label>
                  ))}
                </details>
              </div>
            ))}
          </div>
          <h3>Budget</h3>
          <p className="muted">
            Set how much this team may spend. Planning, building and repairs
            share the generation limit.
          </p>
          <div className="settings-form-grid">
            <label>
              Per generation (USD)
              <input
                type="number"
                min="0.001"
                max="100"
                step="any"
                required
                value={
                  (preset.generationBudgetMicros ?? preset.budgetMicros) / 1e6
                }
                onChange={(e) =>
                  setPreset((p) => ({
                    ...p,
                    generationBudgetMicros: Math.round(
                      Number(e.target.value) * 1e6,
                    ),
                  }))
                }
              />
            </label>
            <label>
              Per project (USD)
              <input
                type="number"
                min="0.001"
                max="100"
                step="any"
                required
                value={preset.budgetMicros / 1e6}
                onChange={(e) =>
                  setPreset((p) => ({
                    ...p,
                    budgetMicros: Math.round(Number(e.target.value) * 1e6),
                  }))
                }
              />
            </label>
          </div>
          <label>
            Automatic repair attempts
            <select
              value={preset.repairLimit}
              onChange={(e) =>
                setPreset((p) => ({
                  ...p,
                  repairLimit: Number(e.target.value),
                }))
              }
            >
              {[0, 1, 2, 3].map((n) => (
                <option key={n} value={n}>
                  {n === 0 ? "Off" : n + (n === 1 ? " attempt" : " attempts")}
                </option>
              ))}
            </select>
          </label>
          <p className="muted">
            Limits use estimated prices. Actual provider charges can exceed an
            estimate. Changes apply to future work, not a running job. An
            existing generation keeps its current limit until you explicitly
            change it.
          </p>
          <details>
            <summary>Specialist overrides</summary>
            <small>
              Optional. Existing component review and adaptation choices are
              preserved.
            </small>
            <label>
              Non-coding decisions
              <select
                aria-label="Non-coding decisions"
                value={preset.routes.decisions?.[0] ?? ""}
                onChange={(e) => updateRoute("decisions", 0, e.target.value)}
              >
                <option value="">Off · use existing workflow</option>
                {settings.profiles
                  .filter(
                    (p) =>
                      p.provider === "openrouter" &&
                      p.model === "typesafe/jev-1.13",
                  )
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
              </select>
              <small>
                Jev interprets the brief and assesses asset relevance. Coding,
                source review and Studio verification keep their current models
                and checks.
              </small>
            </label>
            {(["componentReviewer", "componentAdapter"] as const).map(
              (role) => (
                <label key={role}>
                  {role === "componentReviewer"
                    ? "Component reviewer"
                    : "Component adapter"}
                  <select
                    value={preset.routes[role]?.[0] ?? ""}
                    onChange={(e) => updateRoute(role, 0, e.target.value)}
                  >
                    <option value="">Use default role</option>
                    {options}
                  </select>
                </label>
              ),
            )}
          </details>
        </div>
        <footer className="dialog-actions">
          <button
            type="button"
            disabled={busy}
            onClick={() => {
              if (!dirty || confirm("Discard unsaved changes?")) close();
            }}
          >
            Cancel
          </button>
          <button className="primary" disabled={busy}>
            {busy ? "Saving…" : "Save preset"}
          </button>
        </footer>
      </form>
    </SettingsDialog>
  );
}

export function SettingsWorkspace({
  page,
  project: _project,
  guard,
  changed,
}: {
  page: SettingsPage;
  project: Project | null;
  navigate: (page: SettingsPage | null) => void;
  guard: MutableRefObject<() => boolean>;
  changed: () => void;
}) {
  const [settings, setSettings] = useState<PublicSettings | null>(null);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const tab = page === "models" ? "models" : "presets";
  const [query, setQuery] = useState("");
  const [provider, setProvider] = useState<Provider>("openrouter");
  const [providerFilter, setProviderFilter] = useState("all");
  const [customEndpoint, setCustomEndpoint] = useState(
    providers.compatible.endpoint,
  );
  const [model, setModel] = useState<Profile | null>(null);
  const [preset, setPreset] = useState<ModelPreset | null>(null);
  const [busy, setBusy] = useState(false);
  const browseProfile = useRef(blankModel("openrouter"));
  useEffect(() => {
    settingsApi<PublicSettings>("/models")
      .then(setSettings)
      .catch((e) => setError(e.message));
  }, []);
  useEffect(() => {
    setQuery("");
    setModel(null);
    setPreset(null);
  }, [page]);
  const saved = (s: PublicSettings) => {
    setSettings(s);
    setMessage("Saved");
    changed();
  };
  if (!settings)
    return (
      <section className="settings-workspace">
        <p role={error ? "alert" : "status"}>
          {error || "Loading your models…"}
        </p>
      </section>
    );
  const active = settings.presets?.find(
    (p) => p.id === settings.activePresetId,
  );
  const newPreset = (): ModelPreset => ({
    id: crypto.randomUUID(),
    name: "",
    icon: "taco",
    routes: { planner: [], builder: [], reviewer: [], repair: [] },
    budgetMicros: settings.budgetMicros,
    generationBudgetMicros:
      settings.generationBudgetMicros ?? settings.budgetMicros,
    repairLimit: 2,
  });
  return (
    <section
      className={
        "settings-workspace model-library " +
        (tab === "models" ? "models-reference" : "")
      }
    >
      <header className="settings-page-head">
        <div>
          <h1>{tab === "models" ? "Models" : "Presets"}</h1>
          <p className="muted">
            {tab === "models"
              ? "Manage your model library and discover new models. Add models from your providers and use them in any preset."
              : "Your teams, roles and budgets."}
          </p>
        </div>
        <button
          className="primary"
          onClick={() =>
            tab === "models"
              ? setModel(blankModel(provider))
              : setPreset(newPreset())
          }
        >
          <Icon name="plus" />{" "}
          {tab === "models" ? "Add model" : "Create preset"}
        </button>
      </header>
      {error && <p role="alert">{error}</p>}
      {message && <p role="status">{message}</p>}
      <section
        className={
          tab === "models" ? "saved-models-panel" : "preset-search-panel"
        }
        aria-label={tab === "models" ? "Saved models" : "Find presets"}
      >
        {tab === "models" && (
          <div className="saved-panel-title">
            <h2>
              Saved models{" "}
              <span className="count-badge">{settings.profiles.length}</span>
            </h2>
            <p>Models you've added to your library. Use them in any preset.</p>
          </div>
        )}
        <div className="library-toolbar">
          <label>
            <span className="sr-only">
              {tab === "models" ? "Search models" : "Search presets"}
            </span>
            <input
              type="search"
              placeholder={
                tab === "models" ? "Search your library…" : "Find a preset…"
              }
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </label>
          {tab === "models" && (
            <select
              aria-label="Filter saved models by provider"
              value={providerFilter}
              onChange={(e) => setProviderFilter(e.target.value)}
            >
              <option value="all">All providers</option>
              {Object.entries(providers).map(([id, p]) => (
                <option key={id} value={id}>
                  {p.name}
                </option>
              ))}
            </select>
          )}
        </div>
        {tab === "models" ? (
          <>
            <div className="model-library-list">
              {settings.profiles
                .filter(
                  (p) =>
                    (providerFilter === "all" ||
                      p.provider === providerFilter) &&
                    (p.name + p.model + providers[p.provider].name)
                      .toLowerCase()
                      .includes(query.toLowerCase()),
                )
                .map((p) => (
                  <article className="model-row" key={p.id}>
                    <Brand brand={modelBrand(p.model, p.provider)} />
                    <div className="model-description">
                      <strong>{p.name}</strong>
                      <small>
                        {providers[p.provider].name} · {p.model}
                      </small>
                      <div className="model-tags">
                        <span>
                          {p.pricingSource === "unknown"
                            ? "Price not set"
                            : `${money(p.inputRate)} read · ${money(p.outputRate)} write / 1M tokens`}
                        </span>
                      </div>
                    </div>
                    <span
                      className={"library-key " + (p.hasKey ? "connected" : "")}
                    >
                      <small>Connection</small>
                      {connection(settings, p)
                        ? connection(settings, p)?.validated
                          ? "● Connected"
                          : "Key saved"
                        : p.hasKey
                          ? "Validate key"
                          : "Needs API key"}
                    </span>
                    <span className="model-reply-limit">
                      <small>Reply limit</small>
                      {p.maxOutputTokens.toLocaleString()} tokens
                    </span>
                    <button
                      aria-label={"Test connection for " + p.name}
                      title="Check provider access without generating tokens"
                      disabled={!p.hasKey || busy}
                      onClick={async () => {
                        const { hasKey: _hasKey, ...profile } = p;
                        setBusy(true);
                        setError("");
                        try {
                          setSettings(
                            await settingsApi("/provider-connections", "POST", {
                              profile,
                            }),
                          );
                          setMessage(
                            "Provider connection checked. No generation was run.",
                          );
                        } catch (e) {
                          setError((e as Error).message);
                        } finally {
                          setBusy(false);
                        }
                      }}
                    >
                      <Icon name="play" size={13} /> Test
                    </button>
                    <button
                      aria-label={"Edit " + p.name}
                      onClick={() => {
                        const { hasKey: _hasKey, ...profile } = p;
                        setModel(profile);
                      }}
                    >
                      Edit
                    </button>
                  </article>
                ))}
              {!settings.profiles.length && (
                <div className="library-empty">
                  <span>✦</span>
                  <h2>Your model library starts here</h2>
                  <p>
                    Add a model from any provider, then build your team in
                    Presets.
                  </p>
                </div>
              )}
              {!!settings.profiles.length &&
                !settings.profiles.some(
                  (p) =>
                    (providerFilter === "all" ||
                      p.provider === providerFilter) &&
                    (p.name + p.model + providers[p.provider].name)
                      .toLowerCase()
                      .includes(query.toLowerCase()),
                ) && (
                  <p className="library-no-results">
                    No saved models match your search.
                  </p>
                )}
            </div>
          </>
        ) : (
          <>
            <p className="muted">
              Save different teams for different jobs. Each preset includes its
              own budget.
            </p>
            <div className="preset-library">
              {(settings.presets ?? [])
                .filter((p) =>
                  p.name.toLowerCase().includes(query.toLowerCase()),
                )
                .map((p) => (
                  <article className="preset-card" key={p.id}>
                    <div className="preset-card-top">
                      <span className="preset-symbol" aria-hidden="true">
                        {presetIcons[p.icon]}
                      </span>

                      <div>
                        <h2>{p.name}</h2>
                        <small>
                          {p.id === active?.id
                            ? "Active for future work"
                            : "Saved preset"}
                        </small>
                      </div>
                      {p.id === active?.id && <Icon name="check" />}
                    </div>
                    <div className="preset-team-preview">
                      {roles
                        .filter(
                          ([role]) => role !== "research" || p.researchEnabled,
                        )
                        .map(([role, name]) => {
                          const m = settings.profiles.find(
                            (m) => m.id === p.routes[role]?.[0],
                          );
                          return (
                            <div key={role}>
                              <span>{name}</span>
                              <span>
                                {m ? (
                                  <>
                                    <Brand
                                      brand={modelBrand(m.model, m.provider)}
                                    />
                                    {m.name}
                                  </>
                                ) : (
                                  "Not chosen"
                                )}
                              </span>
                            </div>
                          );
                        })}
                    </div>
                    <div className="preset-budget-summary">
                      <span>
                        {money(
                          (p.generationBudgetMicros ?? p.budgetMicros) / 1e6,
                        )}{" "}
                        / generation
                      </span>
                      <span>{money(p.budgetMicros / 1e6)} / project</span>
                    </div>
                    <footer>
                      <button
                        aria-label={"Edit " + p.name}
                        onClick={() => setPreset(structuredClone(p))}
                      >
                        Edit preset
                      </button>
                      <button
                        disabled={busy || active?.id === p.id}
                        className={active?.id !== p.id ? "primary" : ""}
                        onClick={async () => {
                          setBusy(true);
                          setError("");
                          try {
                            saved(
                              await settingsApi(
                                "/model-presets/" + p.id + "/activate",
                                "POST",
                                {},
                              ),
                            );
                          } catch (e) {
                            setError((e as Error).message);
                          } finally {
                            setBusy(false);
                          }
                        }}
                      >
                        {active?.id === p.id ? "In use" : "Use preset"}
                      </button>
                      {active?.id !== p.id && (
                        <button
                          aria-label={"Remove " + p.name}
                          disabled={busy}
                          onClick={async () => {
                            if (
                              !confirm(
                                "Remove this preset? Your models will stay in the library.",
                              )
                            )
                              return;
                            setBusy(true);
                            try {
                              saved(
                                await settingsApi(
                                  "/model-presets/" + p.id,
                                  "DELETE",
                                ),
                              );
                            } catch (e) {
                              setError((e as Error).message);
                            } finally {
                              setBusy(false);
                            }
                          }}
                        >
                          <Icon name="close" />
                        </button>
                      )}
                    </footer>
                  </article>
                ))}
            </div>
          </>
        )}
      </section>
      {tab === "models" && (
        <section className="provider-browser" aria-label="Explore providers">
          <h2>Explore providers</h2>
          <p className="section-description">
            One connection, every model. Choose a provider to discover what's
            available.
          </p>
          <ProviderChoices value={provider} change={setProvider} />
          {provider === "compatible" && (
            <label className="custom-provider-endpoint">
              Provider endpoint
              <input
                type="url"
                value={customEndpoint}
                onChange={(e) => setCustomEndpoint(e.target.value)}
              />
            </label>
          )}
          <ProviderConnection
            key={provider + customEndpoint}
            profile={{
              ...browseProfile.current,
              provider,
              baseUrl:
                provider === "compatible"
                  ? customEndpoint
                  : providers[provider].endpoint,
            }}
            settings={settings}
            saved={saved}
          />
          <Catalog
            profile={{
              ...browseProfile.current,
              provider,
              baseUrl:
                provider === "compatible"
                  ? customEndpoint
                  : providers[provider].endpoint,
            }}
            settings={settings}
            choose={(m) =>
              setModel(
                picked(
                  {
                    ...blankModel(provider),
                    baseUrl:
                      provider === "compatible"
                        ? customEndpoint
                        : providers[provider].endpoint,
                  },
                  m,
                ),
              )
            }
          />
        </section>
      )}
      {model && (
        <ModelForm
          initial={model}
          settings={settings}
          guard={guard}
          close={() => setModel(null)}
          saved={saved}
        />
      )}
      {preset && (
        <PresetForm
          initial={preset}
          settings={settings}
          guard={guard}
          close={() => setPreset(null)}
          saved={saved}
        />
      )}
    </section>
  );
}

"use strict";
(self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([
  [2596],
  {
    2596: (e, t, n) => {
      (n.r(t), n.d(t, { default: () => al }));
      var r = n(95155),
        a = n(32450),
        s = n(67040),
        i = n(30268),
        o = n(12115);
      let l = (0, o.createContext)(void 0);
      function d(e, t) {
        switch (t.type) {
          case "ADD_MESSAGE":
            return { ...e, messages: [...e.messages, t.payload] };
          case "CLEAR_MESSAGES":
            return { ...e, messages: [] };
          case "SET_MESSAGES":
            return { ...e, messages: t.payload };
          default:
            return e;
        }
      }
      function c({ children: e }) {
        let [t, n] = (0, o.useReducer)(d, { messages: [] });
        return (0, r.jsx)(l.Provider, {
          value: {
            state: t,
            addMessage: (e) => {
              n({ type: "ADD_MESSAGE", payload: e });
            },
            clearMessages: () => {
              n({ type: "CLEAR_MESSAGES" });
            },
            setMessages: (e) => {
              n({ type: "SET_MESSAGES", payload: e });
            },
          },
          children: e,
        });
      }
      var u = n(47471),
        m = n(35299),
        p = n(61362),
        h = n(67909),
        g = n(20063),
        x = n(42261),
        f = n(47650),
        b = n(99752);
      let y = "model_start_rate_limited";
      var v = n(89160);
      function w(e) {
        return e.trim().toLowerCase().startsWith("start somewhere else")
          ? { composerValue: "", cta: "Write your own prompt" }
          : { composerValue: e, cta: "Add to prompt" };
      }
      var j = n(63151),
        k = n(85468),
        N = n(18720),
        I = n(81674);
      let C = "codex_overloaded",
        S = "chatgpt_reconnect_required",
        A = "chatgpt_plan_exhausted",
        P = "codex_unavailable",
        M = "chatgpt_plan_required",
        _ = "chatgpt_plan_model_unsupported",
        T = [C, S, A, P, M, _];
      function R(e) {
        return !!e && T.includes(e);
      }
      let E = {
        [C]: "OpenAI's servers are congested right now. Your prompt wasn't run and nothing was changed or billed. Try again in a few minutes.",
        [S]: "Your ChatGPT account connection expired. Reconnect it in settings to keep running on your plan.",
        [A]: "Your ChatGPT plan usage limit was reached. Your prompt wasn't run and nothing was billed. Wait for your plan to reset or switch models.",
        [P]: "Your ChatGPT subscription couldn't serve this request. Your prompt wasn't run and nothing was billed. Try again or switch models.",
        [M]: "This model only runs on a connected ChatGPT Codex plan (Pro). Your prompt wasn't run and nothing was billed. Connect your plan from the credits menu or switch models.",
        [_]: "Your connected ChatGPT account is on a plan that doesn't include this model. Your prompt wasn't run and nothing was billed. Connect a ChatGPT account with a paid plan (Plus, Pro, or Business) from the credits menu, or switch models.",
      };
      function $({
        input: e,
        controlsDisabled: t,
        isGenerating: n,
        emptyDraft: r = "",
      }) {
        return F(e, r) && !t && !n;
      }
      function L({
        input: e,
        controlsDisabled: t,
        isGenerating: n,
        hasQueuedPrompts: r,
        queueAtCapacity: a,
        promptQueueEnabled: s,
        hasUnsupportedContext: i = !1,
        emptyDraft: o = "",
      }) {
        return s && F(e, o) && !t && (n || r) && !a && !i;
      }
      function F(e, t = "") {
        let n = e.trim(),
          r = t.trim();
        return n.length > 0 && (0 === r.length || n !== r);
      }
      function U(e, t = "") {
        return !F(e, t);
      }
      function D(e, t) {
        return !t.input.trim() || e.some((e) => e.input === t.input)
          ? e
          : [...e, t];
      }
      function O(e, t) {
        return !!(t && !e.includes(`@${t}`));
      }
      function z(e, t) {
        let n = e.length > 0 && !/\s$/.test(e) ? `${e} ` : e;
        return { prev: n, suffix: t, value: n + t };
      }
      function H(e, t) {
        return ((409 !== e.status || "agent_already_running" !== e.errorCode) &&
          (503 !== e.status ||
            ("machine_not_ready" !== e.errorCode &&
              "prompt_queue_access_check_failed" !== e.errorCode)) &&
          (463 !== e.status || e.errorCode !== y) &&
          !0 !== e.rolledBack) ||
          t >= 2
          ? null
          : Math.min(
              Math.max(
                1e3 * Math.max(0, e.retryAfterSeconds ?? 0),
                1500 * 2 ** t,
              ),
              6e4,
            );
      }
      function q(e, t, n) {
        let r = (function (e) {
            if (!e) return [];
            let t = e
              .filter((e) => "image" === e.type)
              .map((e) => ({ url: e.content, filename: e.name || "image" }));
            return (t.length, t.slice(-1));
          })(n),
          a = e.trim();
        return (t &&
          (a = `${a}

${t}`),
        0 === r.length)
          ? a
          : [
              { type: "text", text: a },
              ...r.map((e) => ({
                type: "image_url",
                image_url: { url: e.url },
              })),
            ];
      }
      class J extends Error {
        constructor(e, t, n) {
          (super(
            `Expected JSON response but got ${t || "unknown content type"}: ${n.substring(0, 100)}`,
          ),
            (this.name = "HtmlResponseError"),
            (this.responseStatus = e.status),
            (this.responseRedirected = e.redirected),
            (this.responseUrl = e.url),
            (this.responseType = e.type),
            (this.contentType = t),
            (this.bodyPreview = n.substring(0, 1e3)));
          let r = {};
          (e.headers.forEach((e, t) => {
            r[t] = e;
          }),
            (this.responseHeaders = JSON.stringify(r).substring(0, 2e3)));
        }
      }
      async function B(e) {
        let t = e.headers.get("content-type");
        if (!t || !t.includes("application/json")) {
          let n = await e.text();
          throw new J(e, t || "unknown", n);
        }
        return await e.json();
      }
      var G = n(31892);
      let W = (e) => `lemonade:activeChat:${e}`,
        V = (e, t) => {
          try {
            window.localStorage.setItem(W(e), t);
          } catch {}
        };
      function K(e) {
        let t = 0;
        for (let n of e) "user" === n.role && t++;
        return t;
      }
      function Q() {
        let [e, t] = (0, i.J0)(() => window.innerWidth < 1280);
        return (
          (0, i.vJ)(() => {
            let e = () => t(window.innerWidth < 1280);
            return (
              e(),
              window.addEventListener("resize", e),
              () => window.removeEventListener("resize", e)
            );
          }, []),
          e
        );
      }
      var Y = n(32866),
        Z = n(68579);
      async function X(e, t, n, r) {
        let a = await fetch("/api/ui-builder/studio-action", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              projectId: e,
              action: "studioAction",
              toolName: t,
              params: n,
            }),
            signal: r,
          }),
          s = await a.json();
        if (!s.success)
          throw Error(
            `Studio action ${t} failed: ${s.result?.error || s.error || "Unknown error"}`,
          );
        return s;
      }
      var ee = n(92615),
        et = n(47507),
        en = n(82180),
        er = n(7220),
        ea = n(86648),
        es = n(25016),
        ei = n(35523),
        eo = n(15239),
        el = n(86382);
      function ed({ projectId: e, variant: t = "labeled" }) {
        let n = (0, s.IT)(
            a.FH.uiThemes.getPickerState,
            e ? { projectId: e } : "skip",
          ),
          i = (0, s.n_)(a.FH.uiThemes.setProjectTheme),
          [o, l] = (0, el.J0)(null);
        if (!n?.available) return null;
        let d =
            "none" === n.selected
              ? "No theme"
              : (n.themes.find((e) => e.theme === n.selected)?.name ??
                n.selected),
          c = (t) => {
            i({ projectId: e, theme: t }).catch((e) =>
              console.error("[UiThemePicker] setProjectTheme failed:", e),
            );
          },
          u = n.themes.find((e) => e.theme === (o ?? n.selected));
        if ("menu" === t) {
          var m;
          return (0, r.jsxs)(er.lv, {
            children: [
              (0, r.jsxs)(er.nV, {
                className:
                  "min-h-10 cursor-pointer rounded-lg px-2.5 text-muted-foreground [&>svg:last-child]:ml-1.5",
                children: [
                  (0, r.jsx)(ei.A, { "aria-hidden": "true" }),
                  (0, r.jsx)("span", { children: "UI theme" }),
                  (0, r.jsx)("span", {
                    className:
                      "ml-auto max-w-24 truncate text-caption text-muted-foreground",
                    children: d,
                  }),
                ],
              }),
              (0, r.jsxs)(er.M5, {
                sideOffset: 6,
                className: "w-48 rounded-xl p-1.5",
                children: [
                  (0, r.jsx)("div", {
                    className:
                      "mb-1.5 aspect-8/5 overflow-hidden rounded-lg bg-muted ring-1 ring-inset ring-border/60",
                    children: u
                      ? (0, r.jsx)(
                          eo.default,
                          {
                            src: ((m = u.theme), `/ui-themes/${m}.png`),
                            alt: `${u.name} theme example`,
                            width: 640,
                            height: 400,
                            className: "h-full w-full object-cover",
                          },
                          u.theme,
                        )
                      : (0, r.jsx)("div", {
                          className:
                            "flex h-full items-center justify-center text-caption text-muted-foreground",
                          children: "No theme",
                        }),
                  }),
                  (0, r.jsxs)(er.Hr, {
                    value: n.selected,
                    onValueChange: c,
                    children: [
                      n.themes.map((e) =>
                        (0, r.jsx)(
                          er.Ht,
                          {
                            value: e.theme,
                            className:
                              "min-h-10 cursor-pointer rounded-lg text-muted-foreground hover:text-foreground focus:text-foreground data-[highlighted]:text-foreground",
                            "data-theme-preview": e.theme,
                            onFocus: () => l(e.theme),
                            onPointerEnter: () => l(e.theme),
                            children: e.name,
                          },
                          e.theme,
                        ),
                      ),
                      (0, r.jsx)(er.Ht, {
                        value: "none",
                        className:
                          "min-h-10 cursor-pointer rounded-lg text-muted-foreground hover:text-foreground focus:text-foreground data-[highlighted]:text-foreground",
                        onFocus: () => l("none"),
                        onPointerEnter: () => l("none"),
                        children: "No theme",
                      }),
                    ],
                  }),
                ],
              }),
            ],
          });
        }
        return "labeled" === t
          ? (0, r.jsxs)(et.l6, {
              value: n.selected,
              onValueChange: c,
              children: [
                (0, r.jsxs)(et.bq, {
                  className:
                    "h-9 w-auto gap-1.5 rounded-lg border-black/10 bg-transparent px-2.5 text-caption text-black/60 transition-[background-color,border-color,color,box-shadow] duration-300 hover:shadow-md focus:ring-0 focus:ring-offset-0 motion-reduce:transition-none dark:border-white/10 dark:text-white/60",
                  children: [
                    (0, r.jsx)(ei.A, {
                      className:
                        "h-3.5 w-3.5 shrink-0 text-black/40 dark:text-white/40",
                    }),
                    (0, r.jsx)("span", {
                      className: "text-black/40 dark:text-white/40",
                      children: "UI theme",
                    }),
                    (0, r.jsx)(et.yv, { placeholder: "Studded" }),
                  ],
                }),
                (0, r.jsxs)(et.gC, {
                  children: [
                    n.themes.map((e) =>
                      (0, r.jsx)(
                        et.eb,
                        {
                          value: e.theme,
                          className: "text-caption",
                          children: e.name,
                        },
                        e.theme,
                      ),
                    ),
                    (0, r.jsx)(et.eb, {
                      value: "none",
                      className: "text-caption",
                      children: "No theme",
                    }),
                  ],
                }),
              ],
            })
          : (0, r.jsx)(en.TooltipProvider, {
              delayDuration: 250,
              children: (0, r.jsxs)(et.l6, {
                value: n.selected,
                onValueChange: c,
                children: [
                  (0, r.jsxs)(en.m_, {
                    children: [
                      (0, r.jsx)(en.k$, {
                        asChild: !0,
                        children: (0, r.jsx)(et.bq, {
                          "aria-label": `UI theme: ${d}`,
                          className: (0, es.cn)(
                            ea.Ni,
                            "size-10 min-h-10 w-10 justify-center border-0 bg-transparent p-0 ring-0 shadow-none hover:bg-black/[0.06] dark:bg-transparent dark:ring-0 dark:hover:bg-white/[0.09] [&>svg:last-child]:hidden",
                          ),
                          children: (0, r.jsx)(ei.A, {
                            "aria-hidden": "true",
                            className: "size-[18px]",
                          }),
                        }),
                      }),
                      (0, r.jsxs)(en.ZI, {
                        sideOffset: 8,
                        children: ["UI theme \xb7 ", d],
                      }),
                    ],
                  }),
                  (0, r.jsxs)(et.gC, {
                    className:
                      "rounded-xl border-border/70 p-1 shadow-[0_2px_8px_rgba(30,31,33,0.12),0_20px_56px_-24px_rgba(0,0,0,0.5)]",
                    children: [
                      n.themes.map((e) =>
                        (0, r.jsx)(
                          et.eb,
                          {
                            value: e.theme,
                            className: "rounded-lg text-caption",
                            children: e.name,
                          },
                          e.theme,
                        ),
                      ),
                      (0, r.jsx)(et.eb, {
                        value: "none",
                        className: "rounded-lg",
                        children: "No theme",
                      }),
                    ],
                  }),
                ],
              }),
            });
      }
      var ec = n(87663),
        eu = n(80598),
        em = n(99708);
      function ep(e, t) {
        return "high" === e && t < ec.QJ;
      }
      function eh({
        strength: e,
        creditsRemaining: t,
        variant: n = "labeled",
      }) {
        let i = (0, s.n_)(a.FH.users.setUiModelStrength),
          o = e ?? "standard",
          l = I.IA.find((e) => e.value === o);
        if (!l) throw Error(`Unknown UI strength: ${o}`);
        let d = (e) => {
          if (!I.IA.some((t) => t.value === e))
            throw Error(`Unknown UI strength: ${e}`);
          ep(e, t) ||
            i({ strength: e }).catch((e) =>
              console.error("[UiStrengthPicker] setUiModelStrength failed:", e),
            );
        };
        return "menu" === n
          ? (0, r.jsxs)(er.lv, {
              children: [
                (0, r.jsxs)(er.nV, {
                  className:
                    "min-h-10 cursor-pointer rounded-lg px-2.5 text-muted-foreground [&>svg:last-child]:ml-1.5",
                  children: [
                    (0, r.jsx)(eu.A, { "aria-hidden": "true" }),
                    (0, r.jsx)("span", { children: "UI quality" }),
                    (0, r.jsx)("span", {
                      className:
                        "ml-auto max-w-24 truncate text-caption text-muted-foreground",
                      children: l.label,
                    }),
                  ],
                }),
                (0, r.jsx)(er.M5, {
                  sideOffset: 6,
                  className: "w-56 rounded-xl p-1.5",
                  children: (0, r.jsx)(er.Hr, {
                    value: o,
                    onValueChange: d,
                    children: I.IA.map((e) =>
                      (0, r.jsx)(
                        er.Ht,
                        {
                          value: e.value,
                          disabled: ep(e.value, t),
                          className:
                            "min-h-10 cursor-pointer items-start rounded-lg py-1.5 text-muted-foreground hover:text-foreground focus:text-foreground data-[highlighted]:text-foreground",
                          children: (0, r.jsx)(eg, {
                            option: e,
                            locked: ep(e.value, t),
                          }),
                        },
                        e.value,
                      ),
                    ),
                  }),
                }),
              ],
            })
          : (0, r.jsxs)(et.l6, {
              value: o,
              onValueChange: d,
              children: [
                (0, r.jsxs)(et.bq, {
                  "aria-label": `UI quality: ${l.label}`,
                  className:
                    "h-9 w-auto gap-1.5 rounded-lg border-black/10 bg-transparent px-2.5 text-caption text-black/60 transition-[background-color,border-color,color,box-shadow] duration-300 hover:shadow-md focus:ring-0 focus:ring-offset-0 motion-reduce:transition-none dark:border-white/10 dark:text-white/60",
                  children: [
                    (0, r.jsx)(eu.A, {
                      className:
                        "h-3.5 w-3.5 shrink-0 text-black/40 dark:text-white/40",
                    }),
                    (0, r.jsx)("span", {
                      className: "text-black/40 dark:text-white/40",
                      children: "UI quality",
                    }),
                    (0, r.jsx)(et.yv, { children: l.label }),
                  ],
                }),
                (0, r.jsx)(et.gC, {
                  className: "w-56",
                  children: I.IA.map((e) =>
                    (0, r.jsx)(
                      et.eb,
                      {
                        value: e.value,
                        disabled: ep(e.value, t),
                        className: "items-start py-1.5 text-caption",
                        children: (0, r.jsx)(eg, {
                          option: e,
                          locked: ep(e.value, t),
                        }),
                      },
                      e.value,
                    ),
                  ),
                }),
              ],
            });
      }
      function eg({ option: e, locked: t }) {
        return (0, r.jsxs)("span", {
          className: "flex min-w-0 flex-col gap-0.5",
          children: [
            (0, r.jsxs)("span", {
              className: "flex items-center gap-1.5",
              children: [
                (0, r.jsx)("span", {
                  className: "text-foreground",
                  children: e.label,
                }),
                (0, r.jsx)("span", {
                  className: (0, es.cn)(
                    "rounded-full px-1.5 py-px text-overline ring-1 ring-inset",
                    "high" === e.value
                      ? "bg-brand/10 text-brand ring-brand/20"
                      : "bg-black/5 text-black/50 ring-black/10 dark:bg-white/5 dark:text-white/50 dark:ring-white/10",
                  ),
                  children: e.modelName,
                }),
              ],
            }),
            (0, r.jsx)("span", {
              className: "text-caption text-muted-foreground",
              children: e.detail,
            }),
            "high" === e.value &&
              (0, r.jsxs)("span", {
                className: (0, es.cn)(
                  "flex items-center gap-1 text-caption",
                  t ? "text-warning" : "text-muted-foreground",
                ),
                children: [
                  (0, r.jsx)(em.A, { className: "size-3 shrink-0" }),
                  t
                    ? `Minimum ${ec.QJ} credits needed`
                    : `Requires ${ec.QJ}+ credits`,
                ],
              }),
          ],
        });
      }
      var ex = n(34714),
        ef = n(97003),
        eb = n(67001),
        ey = n(53350),
        ev = n(14438),
        ew = n(71408),
        ej = n(77397);
      let ek = (e, t = new WeakSet()) => {
        if ("string" == typeof e) return e;
        if (null === e) return "null";
        if (void 0 === e) return "undefined";
        if (
          "number" == typeof e ||
          "boolean" == typeof e ||
          "function" == typeof e ||
          "symbol" == typeof e
        )
          return e.toString();
        if ("bigint" == typeof e) return e.toString() + "n";
        if (o.isValidElement(e))
          return o.Children.toArray(e.props.children)
            .map((e) => ek(e, t))
            .join("");
        if (Array.isArray(e))
          return "[" + e.map((e) => ek(e, t)).join(", ") + "]";
        if ("object" == typeof e) {
          if (t.has(e)) return "[Circular]";
          t.add(e);
          try {
            let n = Object.entries(e).map(([e, n]) => `${e}: ${ek(n, t)}`);
            return "{" + n.join(", ") + "}";
          } catch {
            return Object.prototype.toString.call(e);
          }
        }
        return String(e);
      };
      function eN(e) {
        let t;
        if (!e) return e;
        let n = [],
          r = /```[\s\S]*?```/g,
          a = 0;
        for (; null !== (t = r.exec(e));)
          (t.index > a && n.push(e.slice(a, t.index)),
            n.push(t[0]),
            (a = t.index + t[0].length));
        return (
          a < e.length && n.push(e.slice(a)),
          n
            .map((e) => {
              if (e.startsWith("```")) return e;
              let t = e.replace(/(?<!\n)\n(?!\n)/g, "  \n");
              return (t = t.replace(/\\$/gm, "\\\\")).replace(
                /`([^`]+)`/g,
                (e, t) =>
                  "`" +
                  t
                    .replace(/\r\n|\r|\n/g, "\\\\n")
                    .replace(/\t/g, "\\\\t")
                    .replace(/\\(n|t|r)/g, "\\\\\\\\$1")
                    .replace(/\\(?=`)/g, "\\\\\\\\") +
                  "`",
              );
            })
            .join("")
        );
      }
      var eI = n(95704),
        eC = n(17980),
        eS = n(48314),
        eA = n(65229),
        eP = n(6191),
        eM = n(18756),
        e_ = n(42196),
        eT = n(26617),
        eR = n(91410),
        eE = n(35890),
        e$ = n(95740),
        eL = n(52987),
        eF = n(3005),
        eU = n(24033),
        eD = n(5917);
      function eO({
        projectId: e,
        selectedUI: t,
        onSelectUI: n,
        disabled: i,
        onOpenChange: o,
      }) {
        let [l, d] = (0, k.J0)(!1),
          c = (0, k.hb)(
            (e) => {
              (d(e), o?.(e));
            },
            [o],
          ),
          u = (0, k.li)(null),
          m = (0, s.IT)(
            a.FH.uiBuilderScripts.listByProject,
            e ? { projectId: e } : "skip",
          );
        ((0, k.vJ)(() => {
          if (!l) return;
          let e = (e) => {
            u.current && !u.current.contains(e.target) && c(!1);
          };
          return (
            document.addEventListener("mousedown", e),
            () => document.removeEventListener("mousedown", e)
          );
        }, [l, c]),
          (0, k.vJ)(() => {
            if (!l) return;
            let e = (e) => {
              "Escape" === e.key && c(!1);
            };
            return (
              document.addEventListener("keydown", e),
              () => document.removeEventListener("keydown", e)
            );
          }, [l, c]));
        let p = m && m.length > 0;
        return (0, r.jsxs)("div", {
          ref: u,
          className: "relative",
          children: [
            (0, r.jsxs)("button", {
              type: "button",
              onClick: () => {
                i || c(!l);
              },
              disabled: i,
              className: (0, es.cn)(
                "flex items-center gap-1.5 h-10 md:h-9 px-2 rounded-md transition-colors touch-manipulation font-medium",
                i
                  ? "cursor-not-allowed text-muted-foreground"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground active:bg-muted",
              ),
              "aria-label": "UI Editor",
              children: [
                (0, r.jsx)("span", {
                  className:
                    "text-caption md:text-compact-body font-medium truncate max-w-[80px]",
                  children: t ? t.templateName : "UI Editor",
                }),
                (0, r.jsx)(eU.A, { className: "h-3 w-3 opacity-50 shrink-0" }),
              ],
            }),
            l &&
              (0, r.jsxs)("div", {
                className: (0, es.cn)(
                  "absolute bottom-full mb-2 left-0 z-200 min-w-[200px]",
                  "rounded-xl p-1.5",
                  "bg-card backdrop-blur-xl",
                  "border border-border/80 shadow-xl",
                  "animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-2",
                ),
                children: [
                  (0, r.jsx)("div", {
                    className:
                      "px-2.5 py-1.5 text-caption font-medium text-muted-foreground",
                    children: "Existing UIs:",
                  }),
                  p
                    ? (0, r.jsx)("div", {
                        className: "space-y-0.5",
                        children: m.map((e) => {
                          let a = t?.scriptUniqueId === e.scriptUniqueId;
                          return (0, r.jsxs)(
                            "button",
                            {
                              type: "button",
                              className: (0, es.cn)(
                                "w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-body text-left",
                                "transition-colors cursor-pointer",
                                a
                                  ? "bg-muted/60 text-foreground"
                                  : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                              ),
                              onClick: () => {
                                (n({
                                  templateName: e.templateName,
                                  scriptName: e.scriptName,
                                  scriptUniqueId: e.scriptUniqueId,
                                  templateUniqueId: e.templateUniqueId,
                                }),
                                  c(!1));
                              },
                              children: [
                                a
                                  ? (0, r.jsx)(eD.A, {
                                      className:
                                        "h-3.5 w-3.5 shrink-0 text-foreground",
                                    })
                                  : (0, r.jsx)("div", {
                                      className: "h-3.5 w-3.5 shrink-0",
                                    }),
                                (0, r.jsx)("span", {
                                  className: "truncate",
                                  children: e.templateName,
                                }),
                              ],
                            },
                            e._id,
                          );
                        }),
                      })
                    : (0, r.jsx)("div", {
                        className:
                          "mx-1.5 my-1 px-3 py-2.5 rounded-lg border border-black/10 dark:border-white/10 bg-black/5 dark:bg-white/10",
                        children: (0, r.jsx)("p", {
                          className:
                            "text-body text-black/60 dark:text-white/60 text-center leading-relaxed",
                          children:
                            "You have no generated UIs in your game. Prompt to make a UI.",
                        }),
                      }),
                  t &&
                    (0, r.jsxs)("button", {
                      type: "button",
                      className: (0, es.cn)(
                        "w-full flex items-center gap-2 px-2.5 py-2 rounded-lg text-body text-left",
                        "transition-colors cursor-pointer",
                        "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                      ),
                      onClick: () => {
                        (n(null), c(!1));
                      },
                      children: [
                        (0, r.jsx)(eA.A, { className: "h-3.5 w-3.5 shrink-0" }),
                        (0, r.jsx)("span", { children: "None" }),
                      ],
                    }),
                ],
              }),
          ],
        });
      }
      let ez = [
        "text/plain",
        "text/markdown",
        "text/javascript",
        "text/html",
        "text/css",
        "application/json",
        "text/x-python",
        "text/x-java-source",
        "text/x-csrc",
        "text/x-c++src",
        "image/jpeg",
        "image/jpg",
        "image/png",
        "image/gif",
        "image/webp",
        "image/svg+xml",
      ];
      var eH = n(54679),
        eq = n(1473),
        eJ = n(18514);
      function eB({
        open: e,
        onOpenChange: t,
        memoryContent: n,
        isLoading: a,
        onUpdate: s,
        isUpdating: o,
        onSaveEdit: l,
        isSaving: d,
      }) {
        let [c, u] = (0, i.J0)(!1),
          [p, h] = (0, i.J0)("");
        (0, i.vJ)(() => {
          (e && n && h(n), e || u(!1));
        }, [e, n]);
        let g = async () => {
            (await l(p)).success && u(!1);
          },
          x = (e) => {
            (!e && c && (u(!1), h(n || "")), t(e));
          };
        return (0, r.jsxs)(r.Fragment, {
          children: [
            (0, r.jsx)("style", {
              children: `
        .memory-scroll::-webkit-scrollbar {
          width: 8px;
        }
        .memory-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .memory-scroll::-webkit-scrollbar-thumb {
          background: var(--border);
          border-radius: 4px;
        }
        .memory-scroll::-webkit-scrollbar-thumb:hover {
          background: color-mix(in oklab, var(--muted-foreground) 30%, transparent);
        }
      `,
            }),
            (0, r.jsx)(eH.lG, {
              open: e,
              onOpenChange: x,
              children: (0, r.jsxs)(eH.Cf, {
                className: "max-w-3xl max-h-[80vh] flex flex-col",
                children: [
                  (0, r.jsxs)(eH.c7, {
                    children: [
                      (0, r.jsxs)(eH.L3, {
                        className: "flex items-center gap-2",
                        children: [
                          (0, r.jsx)(eq.A, { className: "w-5 h-5" }),
                          "Custom Instructions",
                          n &&
                            !a &&
                            !c &&
                            (0, r.jsx)("button", {
                              type: "button",
                              onClick: () => {
                                (h(n || ""), u(!0));
                              },
                              disabled: o || d,
                              className:
                                "ml-2 p-1 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground disabled:opacity-50 disabled:cursor-not-allowed",
                              title: "Edit custom instructions",
                              children: (0, r.jsx)(eJ.A, {
                                className: "w-4 h-4",
                              }),
                            }),
                          c &&
                            (0, r.jsx)("span", {
                              className:
                                "ml-2 text-caption font-normal text-muted-foreground",
                              children: "(editing)",
                            }),
                        ],
                      }),
                      (0, r.jsx)(eH.rr, {
                        children: c
                          ? "Edit your custom instructions. Changes will be saved directly."
                          : "These instructions are automatically added to every prompt you send, helping Lemonade understand your project context.",
                      }),
                    ],
                  }),
                  (0, r.jsx)("div", {
                    className:
                      "memory-scroll flex-1 overflow-y-auto border rounded-md bg-muted/50 min-h-[300px]",
                    style: {
                      scrollbarWidth: "thin",
                      scrollbarColor: "var(--border) transparent",
                    },
                    children: a
                      ? (0, r.jsx)("div", {
                          className:
                            "flex items-center justify-center h-full p-4",
                          children: (0, r.jsx)(m.A, {
                            className:
                              "w-6 h-6 animate-spin text-muted-foreground",
                          }),
                        })
                      : c
                        ? (0, r.jsx)("textarea", {
                            value: p,
                            onChange: (e) => h(e.target.value),
                            className:
                              "w-full h-full min-h-[300px] p-4 bg-transparent text-body font-mono resize-none focus:outline-hidden",
                            disabled: d,
                            autoFocus: !0,
                          })
                        : n
                          ? (0, r.jsx)("pre", {
                              className:
                                "whitespace-pre-wrap text-body font-mono p-4",
                              children: n,
                            })
                          : (0, r.jsx)("div", {
                              className:
                                "flex items-center justify-center h-full text-muted-foreground p-4",
                              children: "No custom instructions yet",
                            }),
                  }),
                  (0, r.jsxs)(eH.Es, {
                    className: "flex-row justify-between sm:justify-between",
                    children: [
                      (0, r.jsx)("div", {
                        children:
                          c &&
                          (0, r.jsxs)("div", {
                            className: "flex gap-2",
                            children: [
                              (0, r.jsxs)(ef.$n, {
                                variant: "outline",
                                size: "sm",
                                onClick: () => {
                                  (h(n || ""), u(!1));
                                },
                                disabled: d,
                                children: [
                                  (0, r.jsx)(eA.A, {
                                    className: "w-4 h-4 mr-1",
                                  }),
                                  "Cancel",
                                ],
                              }),
                              (0, r.jsx)(ef.$n, {
                                size: "sm",
                                onClick: g,
                                disabled: d || p === n,
                                children: d
                                  ? (0, r.jsxs)(r.Fragment, {
                                      children: [
                                        (0, r.jsx)(m.A, {
                                          className:
                                            "w-4 h-4 mr-1 animate-spin",
                                        }),
                                        "Saving...",
                                      ],
                                    })
                                  : (0, r.jsxs)(r.Fragment, {
                                      children: [
                                        (0, r.jsx)(eD.A, {
                                          className: "w-4 h-4 mr-1",
                                        }),
                                        "Save",
                                      ],
                                    }),
                              }),
                            ],
                          }),
                      }),
                      (0, r.jsxs)("div", {
                        className: "flex gap-2",
                        children: [
                          (0, r.jsx)(ef.$n, {
                            variant: "outline",
                            onClick: () => x(!1),
                            disabled: o || d,
                            children: "Close",
                          }),
                          !c &&
                            (0, r.jsx)(ef.$n, {
                              onClick: () => {
                                (s(), t(!1));
                              },
                              disabled: o || a || d,
                              children: o
                                ? (0, r.jsxs)(r.Fragment, {
                                    children: [
                                      (0, r.jsx)(m.A, {
                                        className: "w-4 h-4 mr-2 animate-spin",
                                      }),
                                      "Regenerating...",
                                    ],
                                  })
                                : "Regenerate",
                            }),
                        ],
                      }),
                    ],
                  }),
                ],
              }),
            }),
          ],
        });
      }
      var eG = n(105);
      let eW = [
        "audio/webm;codecs=opus",
        "audio/mp4;codecs=mp4a.40.2",
        "audio/mp4",
        "audio/ogg;codecs=opus",
        "audio/webm",
      ];
      function eV(e) {
        return e.split(";", 1)[0]?.trim().toLowerCase() ?? "";
      }
      function eK(e) {
        let t = Math.max(0, Math.floor(e / 1e3)),
          n = Math.floor(t / 60);
        return `${n}:${(t % 60).toString().padStart(2, "0")}`;
      }
      var eQ = n(39142),
        eY = n(59e3),
        eZ = n(97470),
        eX = n(27937),
        e0 = n(95702);
      let e1 = {
        transcribe: {
          label: "Keep spoken language",
          compactLabel: "As spoken",
          description: "Turn speech into text without translating it.",
        },
        translate: {
          label: "Translate to English",
          compactLabel: "English",
          description:
            "Speak naturally in another language and get English text.",
        },
      };
      function e5({
        disabled: e,
        input: t,
        presentation: n = "toolbar",
        setInput: a,
        textareaRef: s,
      }) {
        let [i, o] = (0, e0.J0)("transcribe"),
          l = "menu" === n,
          d = (0, e0.hb)(
            (e, n) => {
              let r = s.current,
                o = r?.value ?? t,
                l = r?.selectionStart ?? o.length,
                d = r?.selectionEnd ?? l,
                c = (function (e, t, n = e.length, r = n) {
                  let a = t.trim();
                  if (!a) return { value: e, caret: n };
                  let s = Math.max(0, Math.min(n, e.length)),
                    i = Math.max(s, Math.min(r, e.length)),
                    o = e.slice(0, s),
                    l = e.slice(i),
                    d = o.length > 0 && !/\s$/.test(o) ? " " : "",
                    c = l.length > 0 && !/^\s/.test(l) ? " " : "",
                    u = `${d}${a}${c}`;
                  return {
                    value: `${o}${u}${l}`,
                    caret: o.length + d.length + a.length,
                  };
                })(o, e, l, d);
              (a(c.value),
                requestAnimationFrame(() => {
                  (s.current?.focus(),
                    s.current?.setSelectionRange(c.caret, c.caret),
                    s.current?.dispatchEvent(
                      new Event("input", { bubbles: !0 }),
                    ));
                }),
                (0, b.sx)("Audio Input: Transcription Succeeded", {
                  mode: i,
                  duration_ms: n.durationMs,
                  file_size_bytes: n.fileSizeBytes,
                  latency_ms: n.latencyMs,
                  character_count: e.trim().length,
                }));
            },
            [t, i, a, s],
          ),
          c = (0, e0.hb)(
            (e) => {
              (N.oR.error(e.message),
                (0, b.sx)("Audio Input: Failed", {
                  mode: i,
                  error_code: e.code,
                }));
            },
            [i],
          ),
          {
            status: u,
            elapsedMs: p,
            error: h,
            startRecording: g,
            stopRecording: x,
            resetError: f,
          } = (function ({ mode: e, onTranscribed: t, onError: n }) {
            let [r, a] = (0, k.J0)("idle"),
              [s, i] = (0, k.J0)(0),
              [o, l] = (0, k.J0)(null),
              d = (0, k.li)(null),
              c = (0, k.li)(null),
              u = (0, k.li)([]),
              m = (0, k.li)(0),
              p = (0, k.li)(null),
              h = (0, k.li)(null),
              g = (0, k.li)(!0),
              x = (0, k.li)(!1),
              f = (0, k.li)(e),
              b = (0, k.li)(t),
              y = (0, k.li)(n);
            ((0, k.vJ)(() => {
              f.current = e;
            }, [e]),
              (0, k.vJ)(() => {
                b.current = t;
              }, [t]),
              (0, k.vJ)(() => {
                y.current = n;
              }, [n]));
            let v = (0, k.hb)(() => {
                (p.current && clearTimeout(p.current),
                  h.current && clearInterval(h.current),
                  (p.current = null),
                  (h.current = null));
              }, []),
              w = (0, k.hb)(() => {
                for (let e of c.current?.getTracks() ?? []) e.stop();
                c.current = null;
              }, []),
              j = (0, k.hb)((e) => {
                g.current && ((x.current = !1), l(e), a("error"), y.current(e));
              }, []),
              N = (0, k.hb)(
                async (e, t, n) => {
                  if (0 === e.size)
                    return void j({
                      code: "empty_recording",
                      message:
                        "No audio was captured. Check your microphone and try again.",
                    });
                  let r = Date.now(),
                    s = new FormData(),
                    o = (function (e) {
                      switch (eV(e)) {
                        case "audio/mp4":
                        case "audio/m4a":
                        case "audio/x-m4a":
                          return "m4a";
                        case "audio/mpeg":
                        case "audio/mp3":
                        case "audio/mpga":
                          return "mp3";
                        case "audio/ogg":
                          return "ogg";
                        case "audio/wav":
                        case "audio/x-wav":
                          return "wav";
                        case "audio/flac":
                          return "flac";
                        default:
                          return "webm";
                      }
                    })(n);
                  (s.set(
                    "audio",
                    new File([e], `lemonade-recording.${o}`, { type: eV(n) }),
                  ),
                    s.set("mode", f.current),
                    s.set("durationMs", String(t)));
                  try {
                    let n = await fetch("/api/audio/transcribe", {
                        method: "POST",
                        body: s,
                        credentials: "same-origin",
                      }),
                      o = await n.json().catch(() => ({}));
                    if (!n.ok)
                      return void j({
                        code:
                          429 === n.status ? "rate_limited" : "request_failed",
                        message:
                          "string" == typeof o.error
                            ? o.error
                            : "Lemonade could not transcribe that recording.",
                      });
                    if ("string" != typeof o.text || "" === o.text.trim())
                      return void j({
                        code: "empty_recording",
                        message:
                          "No speech was detected. Try speaking a little closer to the microphone.",
                      });
                    if (!g.current) return;
                    (l(null),
                      a("idle"),
                      i(0),
                      (x.current = !1),
                      b.current(o.text, {
                        durationMs: t,
                        fileSizeBytes: e.size,
                        latencyMs: Date.now() - r,
                      }));
                  } catch {
                    j({
                      code: "request_failed",
                      message:
                        "The recording could not be sent. Check your connection and try again.",
                    });
                  }
                },
                [j],
              ),
              I = (0, k.hb)(() => {
                let e = d.current;
                e && "inactive" !== e.state && (v(), e.stop());
              }, [v]),
              C = (0, k.hb)(async () => {
                if (!x.current) {
                  var e;
                  if (
                    "undefined" == typeof MediaRecorder ||
                    !navigator.mediaDevices?.getUserMedia
                  )
                    return void j({
                      code: "unsupported",
                      message: "Voice input is not supported in this browser.",
                    });
                  (l(null), a("requesting"), i(0), (x.current = !0));
                  try {
                    let t = await navigator.mediaDevices.getUserMedia({
                      audio: {
                        autoGainControl: !0,
                        echoCancellation: !0,
                        noiseSuppression: !0,
                        channelCount: 1,
                      },
                    });
                    if (!g.current) {
                      for (let e of t.getTracks()) e.stop();
                      return;
                    }
                    c.current = t;
                    let n =
                        ((e = (e) => MediaRecorder.isTypeSupported(e)),
                        eW.find(e)),
                      r = new MediaRecorder(t, {
                        ...(n ? { mimeType: n } : {}),
                        audioBitsPerSecond: 64e3,
                      });
                    ((d.current = r),
                      (u.current = []),
                      (r.ondataavailable = (e) => {
                        e.data.size > 0 && u.current.push(e.data);
                      }),
                      (r.onerror = () => {
                        (v(),
                          (r.ondataavailable = null),
                          (r.onstop = null),
                          "inactive" !== r.state && r.stop(),
                          (d.current = null),
                          (u.current = []),
                          w(),
                          j({
                            code: "request_failed",
                            message:
                              "The microphone stopped unexpectedly. Try recording again.",
                          }));
                      }),
                      (r.onstop = () => {
                        (v(), w(), (d.current = null));
                        let e = Math.min(
                            6e4,
                            Math.max(1, Date.now() - m.current),
                          ),
                          t = r.mimeType || n || "audio/webm",
                          s = new Blob(u.current, { type: t });
                        ((u.current = []),
                          g.current && a("processing"),
                          N(s, e, t));
                      }),
                      (m.current = Date.now()),
                      r.start(250),
                      a("recording"),
                      (h.current = setInterval(() => {
                        g.current && i(Math.min(6e4, Date.now() - m.current));
                      }, 250)),
                      (p.current = setTimeout(I, 6e4)));
                  } catch (e) {
                    (v(),
                      w(),
                      j(
                        e instanceof DOMException &&
                          "NotAllowedError" === e.name
                          ? {
                              code: "permission_denied",
                              message:
                                "Microphone access is blocked. Allow it in your browser settings and try again.",
                            }
                          : e instanceof DOMException &&
                              ("NotFoundError" === e.name ||
                                "NotReadableError" === e.name)
                            ? {
                                code: "microphone_unavailable",
                                message: "No available microphone was found.",
                              }
                            : {
                                code: "request_failed",
                                message:
                                  "Lemonade could not start the microphone.",
                              },
                      ));
                  }
                }
              }, [v, j, I, w, N]),
              S = (0, k.hb)(() => {
                (l(null), a("idle"), i(0));
              }, []);
            return (
              (0, k.vJ)(
                () => (
                  (g.current = !0),
                  () => {
                    ((g.current = !1), v());
                    let e = d.current;
                    (e &&
                      "inactive" !== e.state &&
                      ((e.ondataavailable = null),
                      (e.onerror = null),
                      (e.onstop = null),
                      e.stop()),
                      w());
                  }
                ),
                [v, w],
              ),
              {
                status: r,
                elapsedMs: s,
                error: o,
                startRecording: C,
                stopRecording: I,
                resetError: S,
              }
            );
          })({ mode: i, onTranscribed: d, onError: c }),
          y = "recording" === u,
          v = "requesting" === u || "processing" === u,
          w = y || v,
          j =
            "requesting" === u
              ? "Waiting for microphone permission"
              : "recording" === u
                ? "Stop recording"
                : "processing" === u
                  ? "translate" === i
                    ? "Translating recording"
                    : "Transcribing recording"
                  : "error" === u
                    ? "Try voice input again"
                    : "translate" === i
                      ? "Record and translate to English"
                      : "Record voice input",
          I = l && "idle" === u ? "Record voice" : j;
        return (0, r.jsxs)("div", {
          className: (0, es.cn)("flex items-center", l && "w-full gap-1"),
          "data-audio-input": !0,
          children: [
            (0, r.jsxs)(en.m_, {
              open: !y && void 0,
              delayDuration: l ? 1e3 : void 0,
              children: [
                (0, r.jsx)(en.k$, {
                  asChild: !0,
                  children: (0, r.jsxs)(ef.$n, {
                    type: "button",
                    variant: "ghost",
                    size: l ? "compact" : "icon",
                    "aria-label": j,
                    "aria-pressed": y,
                    "aria-busy": v,
                    disabled: (e && !y) || v,
                    onClick: () => {
                      if (y) {
                        ((0, b.sx)("Audio Input: Recording Stopped", {
                          mode: i,
                          duration_ms: p,
                        }),
                          x());
                        return;
                      }
                      ("error" === u && f(),
                        (0, b.sx)("Audio Input: Recording Started", {
                          mode: i,
                        }),
                        g());
                    },
                    className: (0, es.cn)(
                      "relative min-w-10 px-2 touch-manipulation data-[enabled]:active:scale-[0.96] motion-reduce:data-[enabled]:active:scale-100",
                      l
                        ? "min-w-0 flex-1 justify-start gap-2 rounded-lg px-2.5 text-muted-foreground shadow-none"
                        : "gap-1.5 rounded-md",
                      y
                        ? (0, es.cn)(
                            "bg-destructive/10 text-destructive shadow-control data-[enabled]:hover:bg-destructive/15 data-[enabled]:hover:text-destructive",
                            !l && "w-[74px]",
                          )
                        : !l && "w-10 text-muted-foreground",
                      ((e && !y) || v) && "cursor-not-allowed opacity-60",
                      "error" === u && "text-destructive",
                    ),
                    children: [
                      (0, r.jsxs)("span", {
                        className: (0, es.cn)(
                          "relative shrink-0",
                          l ? "size-4" : "size-5",
                        ),
                        "aria-hidden": "true",
                        children: [
                          (0, r.jsx)(eQ.A, {
                            className: (0, es.cn)(
                              "absolute inset-0 transition-[opacity,filter,scale] duration-300 ease-out",
                              l ? "size-4" : "size-5",
                              y || v
                                ? "scale-[0.25] opacity-0 blur-[4px]"
                                : "scale-100 opacity-100 blur-0",
                            ),
                          }),
                          (0, r.jsx)(eY.A, {
                            className: (0, es.cn)(
                              "absolute inset-0 fill-current transition-[opacity,filter,scale] duration-300 ease-out",
                              l ? "size-4" : "size-5",
                              y
                                ? "scale-100 opacity-100 blur-0"
                                : "scale-[0.25] opacity-0 blur-[4px]",
                            ),
                          }),
                          (0, r.jsx)(m.A, {
                            className: (0, es.cn)(
                              "absolute inset-0 animate-spin transition-[opacity,filter,scale] duration-300",
                              l ? "size-4" : "size-5",
                              v
                                ? "scale-100 opacity-100 blur-0"
                                : "scale-[0.25] opacity-0 blur-[4px]",
                            ),
                          }),
                        ],
                      }),
                      y &&
                        (0, r.jsx)("span", {
                          className: "text-caption font-medium tabular-nums",
                          children: eK(p),
                        }),
                      l &&
                        !y &&
                        (0, r.jsx)("span", {
                          className: "truncate text-compact-body",
                          children: I,
                        }),
                    ],
                  }),
                }),
                (0, r.jsx)(en.ZI, {
                  children: (0, r.jsxs)("div", {
                    className: "max-w-xs",
                    children: [
                      (0, r.jsx)("p", {
                        className: "mb-1 font-semibold",
                        children: j,
                      }),
                      (0, r.jsx)("p", {
                        className: "text-caption text-muted-foreground",
                        children: h?.message ?? e1[i].description,
                      }),
                    ],
                  }),
                }),
              ],
            }),
            (0, r.jsxs)(er.rI, {
              children: [
                (0, r.jsx)(er.ty, {
                  asChild: !0,
                  children: (0, r.jsxs)(ef.$n, {
                    type: "button",
                    variant: "ghost",
                    size: l ? "compact" : "icon",
                    "aria-label": `Voice input mode: ${e1[i].compactLabel}`,
                    disabled: e || w,
                    className: (0, es.cn)(
                      "min-w-10 gap-1 rounded-md px-2 text-muted-foreground touch-manipulation data-[enabled]:active:scale-[0.96] motion-reduce:data-[enabled]:active:scale-100",
                      l ? "w-auto px-2.5 shadow-none" : "xl:w-auto",
                      "translate" === i && "bg-accent text-accent-foreground",
                      (e || w) && "cursor-not-allowed opacity-60",
                    ),
                    children: [
                      !l &&
                        (0, r.jsx)(eZ.A, {
                          className: "size-5",
                          "aria-hidden": "true",
                        }),
                      (0, r.jsx)("span", {
                        className: (0, es.cn)(
                          "text-caption",
                          !l && "hidden font-medium xl:inline",
                        ),
                        children: e1[i].compactLabel,
                      }),
                      l &&
                        (0, r.jsx)(eX.A, {
                          className: "size-4",
                          "aria-hidden": "true",
                        }),
                      (0, r.jsx)("span", {
                        className: "sr-only",
                        children: "Choose voice input mode",
                      }),
                    ],
                  }),
                }),
                (0, r.jsxs)(er.SQ, {
                  side: l ? "right" : "top",
                  align: "start",
                  sideOffset: 6,
                  className: "w-64",
                  children: [
                    (0, r.jsx)(er.lp, { children: "Voice input" }),
                    (0, r.jsx)(er.Hr, {
                      value: i,
                      onValueChange: (e) => {
                        ("transcribe" === e || "translate" === e) &&
                          (o(e),
                          (0, b.sx)("Audio Input: Mode Changed", { mode: e }));
                      },
                      children: Object.keys(e1).map((e) =>
                        (0, r.jsx)(
                          er.Ht,
                          {
                            value: e,
                            className:
                              "cursor-pointer items-start py-2 text-muted-foreground",
                            children: (0, r.jsxs)("span", {
                              className: "min-w-0",
                              children: [
                                (0, r.jsx)("span", {
                                  className:
                                    "block text-compact-body font-medium",
                                  children: e1[e].label,
                                }),
                                (0, r.jsx)("span", {
                                  className:
                                    "mt-0.5 block text-caption text-muted-foreground text-pretty",
                                  children: e1[e].description,
                                }),
                              ],
                            }),
                          },
                          e,
                        ),
                      ),
                    }),
                    (0, r.jsx)(er.mB, {}),
                    (0, r.jsx)("p", {
                      className:
                        "px-2 py-1.5 text-caption text-muted-foreground text-pretty",
                      children:
                        "Audio is sent securely to our transcription provider and isn't stored by Lemonade.",
                    }),
                  ],
                }),
              ],
            }),
            (0, r.jsx)("span", {
              className: "sr-only",
              role: "status",
              "aria-live": "polite",
              children: "recording" === u ? `Recording ${eK(p)}` : j,
            }),
          ],
        });
      }
      let e2 = ({
        input: e,
        setInput: t,
        isGenerating: n,
        canStopGeneration: i = !1,
        newAgentSessionId: l,
        promptQueueEnabled: d = !1,
        hasQueuedPrompts: c = !1,
        queueAtCapacity: m = !1,
        hasUnsupportedQueueContext: p = !1,
        onQueuePrompt: h,
        retryablePrompt: g,
        retryablePromptCount: x = 0,
        onRestoreRetryablePrompt: f,
        onDismissRetryablePrompt: y,
        controlsDisabled: v,
        handleSend: w,
        handleStopGeneration: j,
        onImageUpload: k,
        onTriggerMention: C,
        addContextTab: S,
        textareaRef: A,
        chatId: P,
        projectId: M,
        onMemoryGeneratingChange: _,
        onOpenStorePurchases: T,
        onOpenRateLimitModal: R,
        selectedModel: E,
        onModelChange: U,
        creditsRemaining: D,
        availabilityOverrides: O,
        discountBadgeHiddenOverrides: z,
        onOpenUIBuilder: H,
        selectedUI: q,
        onSelectUI: J,
        modelRequiresImageSupport: B = !1,
        modelImageSupportRequirement: G = "image",
        onImageUnsupportedModelSelect: W,
        minimumCreditExemptModelIds: V,
        canAccessRestrictedModels: K,
        codexOnlyModelAccess: Q,
        unifiedComposer: Y = !1,
        themePickerSlot: Z,
        audioInputEnabled: X = !1,
        workspaceLayout: ee = !1,
        showCreditControl: et = !0,
        composerPopover: ei,
        onComposerPopoverChange: eo,
        onOpenCardsInventory: ed,
      }) => {
        let ec = (0, s.n_)(a.FH.fileOperations.generateImageUploadUrl),
          eu = (0, s.n_)(a.FH.fileOperations.saveImageStorageId),
          { userId: em } = (0, u.d)(),
          ep = (0, o.useMemo)(() => `memory_${P}_${Date.now()}`, [P]),
          {
            hasMemory: eh,
            canAccessMemoryBank: eg,
            isGenerating: ex,
            isSaving: eb,
            generateMemory: ey,
            getMemoryContent: ev,
            updateMemoryContent: ew,
          } = (function (e, t, n, r) {
            let [i, o] = (0, el.J0)(!1),
              [l, d] = (0, el.J0)(!1),
              [c, u] = (0, el.J0)(!1),
              m = (0, s.IT)(a.FH.projects.getProjectById, { projectId: e }),
              p = (0, s.IT)(
                a.FH.memoryBank.canAccessMemoryBank,
                r ? { clerkUserId: r } : "skip",
              ),
              h = p?.canAccess ?? !1,
              g = (0, s.y3)(a.FH.memoryBank.generateMemory),
              x = (0, s.y3)(a.FH.memoryBank.getMemoryContent),
              f = (0, s.y3)(a.FH.memoryBank.updateMemoryContent),
              b = m?.hasMemoryBank ?? !1,
              y = async () => {
                if (!b) return null;
                d(!0);
                try {
                  let t = await x({ projectId: e });
                  if (t.success && t.exists) return t.content || null;
                  return null;
                } catch (e) {
                  return (
                    console.error(
                      "[useMemoryBank] Failed to get memory content:",
                      e,
                    ),
                    null
                  );
                } finally {
                  d(!1);
                }
              },
              v = async (t) => {
                if (!b) return { success: !1, error: "No memory bank exists" };
                u(!0);
                try {
                  return await f({ projectId: e, content: t });
                } catch (t) {
                  let e = t instanceof Error ? t.message : String(t);
                  return (
                    console.error(
                      "[useMemoryBank] Failed to update memory content:",
                      t,
                    ),
                    { success: !1, error: e }
                  );
                } finally {
                  u(!1);
                }
              };
            return {
              hasMemory: b,
              canAccessMemoryBank: h,
              isGenerating: i,
              isLoadingContent: l,
              isSaving: c,
              generateMemory: async () => {
                o(!0);
                try {
                  let a = await g({
                    projectId: e,
                    chatId: t,
                    executionSessionId: n,
                    clerkUserId: r,
                  });
                  if (a.proOnly)
                    return (
                      console.log(`[useMemoryBank] PRO only: ${a.error}`),
                      {
                        success: !1,
                        error: a.error || "Memory Bank is a PRO feature",
                        proOnly: !0,
                      }
                    );
                  return a;
                } catch (e) {
                  return {
                    success: !1,
                    error: e instanceof Error ? e.message : String(e),
                  };
                } finally {
                  o(!1);
                }
              },
              getMemoryContent: y,
              updateMemoryContent: v,
            };
          })(M, P, ep, em || ""),
          [ej, ek] = (0, o.useState)(!1),
          [eN, eI] = (0, o.useState)(null),
          eC = ei ?? eN,
          eU = eo ?? eI,
          eD = (0, s.IT)(
            a.FH.uiBuilderScripts.listByProject,
            M ? { projectId: M } : "skip",
          ),
          eH = (!!eD && eD.length > 0) || !!q,
          eq = q ? `@${q.templateName} ` : "",
          eJ = L({
            input: e,
            controlsDisabled: v,
            emptyDraft: eq,
            isGenerating: n,
            hasQueuedPrompts: c,
            queueAtCapacity: m,
            promptQueueEnabled: d,
            hasUnsupportedContext: p,
          }),
          eW = d && (n || c) && p && F(e, eq),
          eV = g
            ? (function (e, t) {
                return t > 1
                  ? `${t} prompts saved for retry`
                  : "stopped" === e.reason
                    ? "Stopped prompt saved"
                    : "swapped" === e.reason
                      ? "Draft saved for later"
                      : "Prompt wasn’t sent";
              })(g, x)
            : "",
          eK =
            (!d || !c) &&
            $({
              input: e,
              controlsDisabled: v,
              isGenerating: n,
              emptyDraft: eq,
            }),
          eQ = d
            ? (function ({
                isGenerating: e,
                controlsDisabled: t,
                requestReadyToStop: n,
              }) {
                return e && !t && n;
              })({
                isGenerating: n,
                controlsDisabled: v,
                requestReadyToStop: i,
              })
            : n && !!(j && l),
          eY = o.useId(),
          eZ = d
            ? eW
              ? "The queue supports plain text only \xb7 remove attached context or suggestions"
              : m
                ? "Queue full \xb7 remove a prompt to add another"
                : null
            : null,
          [eX, e0] = (0, o.useState)(null),
          [e1, e2] = (0, o.useState)(!1),
          [e4, e3] = (0, o.useState)(!1),
          [e6, e8] = (0, o.useState)(null),
          [e7, e9] = (0, o.useState)(!1);
        (0, o.useEffect)(() => {
          _ && _(ex);
        }, [ex, _]);
        let te = async () => {
            let e = await ey();
            return (
              e.success ||
                (e.proOnly
                  ? N.oR.error(
                      "Custom Instructions is a PRO feature. Upgrade to access.",
                    )
                  : N.oR.error(
                      e.error || "Failed to generate custom instructions",
                    )),
              e
            );
          },
          tt = async (e) => {
            let t = await ew(e);
            return (
              t.success
                ? (e8(e),
                  N.oR.success("Custom instructions saved successfully"),
                  (0, b.sx)("Custom Instructions: Edited", {
                    project_id: M,
                    user_id: em,
                    content_length: e.length,
                    timestamp: Date.now(),
                  }))
                : N.oR.error(t.error || "Failed to save custom instructions"),
              t
            );
          },
          tn = async (e) => {
            try {
              if (e.size > 0xa00000)
                throw Error(
                  `File size (${(e.size / 1024 / 1024).toFixed(1)}MB) exceeds 10MB limit`,
                );
              let t = await ec(),
                n = document.createElement("canvas"),
                r = n.getContext("2d"),
                a = new Image();
              return new Promise((s, i) => {
                ((a.onload = async () => {
                  let o = e.size > 2097152 ? 1024 : 512,
                    { width: l, height: d } = a;
                  (l > d
                    ? l > o && ((d = (d * o) / l), (l = o))
                    : d > o && ((l = (l * o) / d), (d = o)),
                    (n.width = l),
                    (n.height = d),
                    r.drawImage(a, 0, 0, l, d));
                  let c = e.size > 5242880 ? 0.5 : e.size > 2097152 ? 0.6 : 0.7;
                  n.toBlob(
                    async (n) => {
                      if (!n) {
                        (console.error(
                          "[uploadImageToConvex] Failed to create blob",
                        ),
                          i(Error("Failed to compress image")));
                        return;
                      }
                      try {
                        let r = await fetch(t, {
                          method: "POST",
                          headers: { "Content-Type": n.type },
                          body: n,
                        });
                        if (!r.ok)
                          throw Error(`Upload failed with status: ${r.status}`);
                        let { storageId: a } = await r.json(),
                          i = await eu({
                            storageId: a,
                            filename: e.name,
                            chatId: P,
                          });
                        s(i);
                      } catch (e) {
                        (console.error(
                          "[uploadImageToConvex] Error in upload process:",
                          e,
                        ),
                          i(e));
                      }
                    },
                    "image/jpeg",
                    c,
                  );
                }),
                  (a.onerror = () => {
                    (console.error(
                      "[uploadImageToConvex] Failed to load image",
                    ),
                      i(Error("Failed to load image")));
                  }),
                  (a.src = URL.createObjectURL(e)));
              });
            } catch (e) {
              throw (console.error("Error uploading image to Convex:", e), e);
            }
          },
          tr = () => {
            if (v || n) return;
            let e = A.current;
            if (!e) return;
            let t = e.value,
              r = e.selectionStart ?? t.length,
              a = e.selectionEnd ?? t.length,
              s = r > 0 ? t[r - 1] : "\n",
              i = " " === s || "\n" === s ? "@" : " @";
            e.value = t.slice(0, r) + i + t.slice(a);
            let o = r + i.length;
            (e.setSelectionRange(o, o),
              e.focus(),
              e.dispatchEvent(new Event("input", { bubbles: !0 })),
              e.dispatchEvent(new Event("change", { bubbles: !0 })),
              C?.());
          },
          ta = () => {
            if (v || n) return;
            if (E && !(0, I.Ge)(E)) return void N.oR.error((0, I.$G)(E));
            let e = document.createElement("input");
            ((e.type = "file"),
              (e.accept = "image/*"),
              (e.onchange = async (e) => {
                let t = e.target.files?.[0];
                if (t) {
                  if (t.size > 0xa00000)
                    return void alert(
                      `Image size (${(t.size / 1024 / 1024).toFixed(1)}MB) exceeds 10MB limit`,
                    );
                  if (!ez.includes(t.type)) {
                    (console.error(
                      `[ChatInputActions] Invalid file type: ${t.type}`,
                    ),
                      alert(
                        "Please select a valid image file (PNG, JPG, WebP, etc.)",
                      ));
                    return;
                  }
                  try {
                    let e = await tn(t);
                    (S("image", t.name, e, void 0, t.name, !0),
                      k?.(t),
                      A.current?.focus());
                  } catch (e) {
                    (console.error("Failed to upload image:", e),
                      alert(
                        `Failed to upload image: ${e instanceof Error ? e.message : "Unknown error"}`,
                      ));
                  }
                }
              }),
              e.click());
          };
        return (0, r.jsx)(en.TooltipProvider, {
          delayDuration: 100,
          children: (0, r.jsxs)("div", {
            className: (0, es.cn)(
              "w-full",
              Y
                ? ee
                  ? "px-4 pb-3 pt-1"
                  : "px-3 pb-3 pt-1"
                : "px-4 py-1.5 pb-3 md:px-4",
            ),
            children: [
              (0, r.jsx)("span", {
                className: "sr-only",
                role: "status",
                "aria-live": "polite",
                "aria-atomic": "true",
                children: d ? eV : "",
              }),
              d &&
                g &&
                (0, r.jsxs)("div", {
                  className:
                    "mb-1 flex min-w-0 items-center gap-1.5 text-micro leading-4 text-muted-foreground",
                  children: [
                    (0, r.jsx)(eS.A, {
                      className: "size-3 shrink-0",
                      "aria-hidden": "true",
                    }),
                    (0, r.jsx)("span", {
                      className: "min-w-0 flex-1 truncate",
                      children: eV,
                    }),
                    f &&
                      (0, r.jsx)(ef.$n, {
                        type: "button",
                        variant: "ghost",
                        size: "xs",
                        className:
                          "h-auto min-h-0 shrink-0 bg-transparent p-0 text-micro font-medium text-foreground shadow-none transition-[color,opacity,transform] duration-150 hover:bg-transparent hover:opacity-70 active:scale-[0.96] motion-reduce:transform-none",
                        title:
                          "Restore this prompt; your current draft will stay saved",
                        onClick: f,
                        children: "Restore",
                      }),
                    y &&
                      (0, r.jsx)(ef.K0, {
                        type: "button",
                        variant: "ghost",
                        size: "icon-xs",
                        className:
                          "-m-1 size-6 shrink-0 rounded bg-transparent p-1 text-muted-foreground shadow-none transition-[color,opacity,transform] duration-150 hover:bg-transparent hover:text-foreground active:scale-[0.96] motion-reduce:transform-none",
                        label: "Dismiss saved prompt",
                        onClick: y,
                        children: (0, r.jsx)(eA.A, {
                          className: "size-3",
                          "aria-hidden": "true",
                        }),
                      }),
                  ],
                }),
              eZ
                ? (0, r.jsx)("p", {
                    id: eY,
                    className: (0, es.cn)(
                      "mb-1 text-micro leading-4 text-muted-foreground",
                      c && "sr-only",
                    ),
                    children: eZ,
                  })
                : null,
              (0, r.jsxs)("div", {
                className: (0, es.cn)(
                  "flex min-w-0 flex-wrap items-center justify-between gap-y-2",
                  Y && "gap-x-3",
                  ee && "flex-nowrap items-center gap-2",
                ),
                children: [
                  (0, r.jsxs)("div", {
                    className: (0, es.cn)(
                      "relative flex items-center",
                      Y
                        ? "h-10 gap-0.5"
                        : "gap-0 rounded-lg bg-white/5 ring-1 ring-white/10 md:gap-1 dark:ring-white/10",
                      ee && "h-10 w-fit shrink-0 bg-transparent ring-0",
                    ),
                    children: [
                      Y
                        ? (0, r.jsxs)(er.rI, {
                            open: "utilities" === eC,
                            onOpenChange: (e) => eU(e ? "utilities" : null),
                            children: [
                              (0, r.jsx)(er.ty, {
                                asChild: !0,
                                children: (0, r.jsx)(ef.$n, {
                                  type: "button",
                                  variant: "ghost",
                                  size: "icon",
                                  "aria-label": "Add to prompt",
                                  title: "Add to prompt",
                                  disabled: v,
                                  className: (0, es.cn)(
                                    ea.Ni,
                                    ea.oI,
                                    "w-10 p-0",
                                  ),
                                  children: (0, r.jsx)(eP.A, {
                                    "aria-hidden": "true",
                                    className: "size-[18px]",
                                  }),
                                }),
                              }),
                              (0, r.jsxs)(er.SQ, {
                                side: "top",
                                align: "start",
                                sideOffset: 8,
                                className: "w-64 rounded-xl p-1.5",
                                onCloseAutoFocus: (e) => e.preventDefault(),
                                children: [
                                  (0, r.jsx)(er.lp, {
                                    className: "px-2.5 text-muted-foreground",
                                    children: "Add to prompt",
                                  }),
                                  (0, r.jsxs)(er._2, {
                                    disabled: v || n,
                                    onSelect: tr,
                                    className:
                                      "min-h-10 cursor-pointer rounded-lg px-2.5 text-muted-foreground",
                                    children: [
                                      (0, r.jsx)(eM.A, {
                                        "aria-hidden": "true",
                                      }),
                                      (0, r.jsx)("span", {
                                        children: "Mention files",
                                      }),
                                      (0, r.jsx)("span", {
                                        className:
                                          "ml-auto text-caption text-muted-foreground",
                                        children: "@",
                                      }),
                                    ],
                                  }),
                                  (0, r.jsxs)(er._2, {
                                    disabled: v || n,
                                    onSelect: ta,
                                    className:
                                      "min-h-10 cursor-pointer rounded-lg px-2.5 text-muted-foreground",
                                    children: [
                                      (0, r.jsx)(e_.A, {
                                        "aria-hidden": "true",
                                      }),
                                      (0, r.jsx)("span", {
                                        children: "Upload image",
                                      }),
                                    ],
                                  }),
                                  ed &&
                                    (0, r.jsxs)(er._2, {
                                      onSelect: ed,
                                      className:
                                        "min-h-10 cursor-pointer rounded-lg px-2.5 text-muted-foreground",
                                      children: [
                                        (0, r.jsx)(eT.A, {
                                          "aria-hidden": "true",
                                        }),
                                        (0, r.jsx)("span", {
                                          children: "Cards inventory",
                                        }),
                                      ],
                                    }),
                                  X &&
                                    (0, r.jsx)("div", {
                                      className:
                                        "min-h-control-compact rounded-lg",
                                      children: (0, r.jsx)(e5, {
                                        presentation: "menu",
                                        input: e,
                                        setInput: t,
                                        textareaRef: A,
                                        disabled: v || (n && !d),
                                      }),
                                    }),
                                  Z,
                                ],
                              }),
                            ],
                          })
                        : (0, r.jsxs)(r.Fragment, {
                            children: [
                              (0, r.jsxs)(en.m_, {
                                children: [
                                  (0, r.jsx)(en.k$, {
                                    asChild: !0,
                                    children: (0, r.jsx)("button", {
                                      type: "button",
                                      onClick: tr,
                                      disabled: v || n,
                                      className:
                                        "flex h-10 w-10 touch-manipulation items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:bg-muted md:h-9 md:w-9",
                                      "aria-label": "Tag a file",
                                      children: (0, r.jsx)(eM.A, {
                                        className:
                                          "h-5 w-5 md:h-[18px] md:w-[18px]",
                                      }),
                                    }),
                                  }),
                                  (0, r.jsx)(en.ZI, {
                                    children: "Mention files",
                                  }),
                                ],
                              }),
                              (0, r.jsxs)(en.m_, {
                                children: [
                                  (0, r.jsx)(en.k$, {
                                    asChild: !0,
                                    children: (0, r.jsx)("button", {
                                      type: "button",
                                      onClick: ta,
                                      disabled: v || n,
                                      className:
                                        "flex h-10 w-10 touch-manipulation items-center justify-center rounded-md text-muted-foreground transition-colors hover:bg-muted hover:text-foreground active:bg-muted md:h-9 md:w-9",
                                      "aria-label": "Upload image",
                                      children: (0, r.jsx)(e_.A, {
                                        className:
                                          "h-5 w-5 md:h-[18px] md:w-[18px]",
                                      }),
                                    }),
                                  }),
                                  (0, r.jsx)(en.ZI, {
                                    children: "Upload image",
                                  }),
                                ],
                              }),
                              X &&
                                (0, r.jsx)(e5, {
                                  input: e,
                                  setInput: t,
                                  textareaRef: A,
                                  disabled: v || (n && !d),
                                }),
                            ],
                          }),
                      H &&
                        J &&
                        eH &&
                        (0, r.jsxs)(en.m_, {
                          open: !ej && void 0,
                          children: [
                            (0, r.jsx)(en.k$, {
                              asChild: !0,
                              children: (0, r.jsx)("div", {
                                children: (0, r.jsx)(eO, {
                                  projectId: M,
                                  selectedUI: q ?? null,
                                  onSelectUI: J,
                                  disabled: v || n,
                                  onOpenChange: ek,
                                }),
                              }),
                            }),
                            (0, r.jsx)(en.ZI, {
                              children: (0, r.jsxs)("div", {
                                className: "max-w-xs",
                                children: [
                                  (0, r.jsx)("p", {
                                    className: "font-semibold mb-1",
                                    children: "UI Editor",
                                  }),
                                  (0, r.jsx)("p", {
                                    className:
                                      "text-caption text-muted-foreground",
                                    children:
                                      "Select existing UIs to edit with prompts.",
                                  }),
                                ],
                              }),
                            }),
                          ],
                        }),
                      !1,
                    ],
                  }),
                  (0, r.jsxs)("div", {
                    className: (0, es.cn)(
                      "ml-auto flex min-w-0 max-w-full items-center justify-end",
                      Y ? "gap-2" : "gap-1.5 md:gap-2",
                      ee && "flex-1",
                    ),
                    children: [
                      (0, r.jsxs)("div", {
                        className: (0, es.cn)(
                          "flex min-w-0 items-center",
                          Y
                            ? (0, es.cn)(
                                ea.M$,
                                "gap-2 overflow-visible! bg-transparent! ring-0!",
                              )
                            : "gap-1.5 md:gap-2",
                          ee && "min-w-0 flex-1 bg-transparent! ring-0!",
                        ),
                        children: [
                          E &&
                            U &&
                            (0, r.jsx)(eF.Bd, {
                              value: E,
                              onChange: U,
                              appearance: Y ? "composer" : "default",
                              disabled: v || n,
                              creditsRemaining: D,
                              onBuyCredits: T,
                              availabilityOverrides: O,
                              discountBadgeHiddenOverrides: z,
                              requireImageSupport: B,
                              imageSupportRequirement: G,
                              onImageUnsupportedModelSelect: W,
                              minimumCreditExemptModelIds: V,
                              canAccessRestrictedModels: K,
                              codexOnlyModelAccess: Q,
                              open: "model" === eC,
                              onOpenChange: (e) => eU(e ? "model" : null),
                              className: (0, es.cn)(
                                Y &&
                                  (0, es.cn)(
                                    ea.Ni,
                                    "h-10! rounded-xl! text-foreground!",
                                  ),
                              ),
                            }),
                          et &&
                            (0, r.jsx)(eG.A, {
                              className: ee ? "ml-auto" : void 0,
                              onOpenStorePurchases: T,
                              unifiedComposer: Y,
                              groupedComposerControl: !1,
                              open: "credits" === eC,
                              onOpenChange: (e) => eU(e ? "credits" : null),
                            }),
                        ],
                      }),
                      eQ &&
                        j &&
                        (0, r.jsx)("button", {
                          type: "button",
                          className: (0, es.cn)(
                            Y
                              ? (0, es.cn)(ea.Ni, ea.oI, "w-10 p-0")
                              : "rounded-lg p-2.5 md:p-2 h-10 w-10 md:h-8 md:w-8 hover:bg-black/10 dark:hover:bg-white/10 active:bg-black/10 dark:active:bg-white/10 text-black/40 dark:text-white/40 hover:text-black dark:hover:text-white touch-manipulation",
                          ),
                          "aria-label": "Stop generation",
                          disabled: !d && v,
                          onClick: j,
                          children: (0, r.jsx)(eR.A, {
                            className: "w-5 h-5 md:w-4 md:h-4",
                          }),
                        }),
                      d && (n || c)
                        ? (0, r.jsxs)(ef.$n, {
                            type: "button",
                            variant: "ghost",
                            size: "xs",
                            className: (0, es.cn)(
                              Y
                                ? (0, es.cn)(
                                    ea.Ni,
                                    ea.oI,
                                    ee
                                      ? "w-10 p-0"
                                      : "gap-1.5 px-3.5 text-body font-semibold",
                                  )
                                : "h-[30px] gap-1.5 rounded-lg bg-black/5 px-2.5 text-caption font-medium shadow-none touch-manipulation dark:bg-white/10",
                              "transition-[background-color,opacity,transform] duration-150 active:scale-[0.96] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring motion-reduce:transform-none",
                              !Y && "hover:bg-black/10 dark:hover:bg-white/15",
                              !eJ && "cursor-not-allowed opacity-50",
                            ),
                            "aria-label": "Add to queue",
                            title: ee ? "Add to queue" : void 0,
                            "aria-describedby": eZ ? eY : void 0,
                            disabled: !eJ,
                            onClick: () => {
                              eJ && h?.();
                            },
                            children: [
                              (0, r.jsx)(eE.A, {
                                className: "size-[17px]",
                                "aria-hidden": "true",
                              }),
                              (0, r.jsx)("span", {
                                className: ee ? "sr-only" : void 0,
                                children: "Add to queue",
                              }),
                            ],
                          })
                        : eQ
                          ? null
                          : (0, r.jsx)("button", {
                              type: "button",
                              className: (0, es.cn)(
                                Y
                                  ? (0, es.cn)(
                                      ea.Ni,
                                      ea.oI,
                                      "gap-2 bg-brand-black text-white ring-0 hover:bg-black hover:text-white dark:bg-brand-yellow dark:text-brand-black dark:hover:bg-yellow-200 dark:hover:text-brand-black",
                                      ee
                                        ? "w-10 p-0"
                                        : "px-3.5 sm:min-w-[112px]",
                                    )
                                  : "flex items-center justify-center rounded-lg w-[26px] h-[26px] md:w-[30px] md:h-[30px] bg-black/5 dark:bg-white/10 touch-manipulation hover:bg-black/10 dark:hover:bg-white/10 active:bg-black/15 dark:active:bg-white/15 focus-visible:ring-1 focus-visible:ring-offset-0 focus-visible:ring-ring",
                                !eK && "opacity-50 cursor-not-allowed",
                              ),
                              "aria-label": "Send message",
                              "data-send-button": !0,
                              disabled: !eK,
                              onClick: () => {
                                eK && w(!1);
                              },
                              children:
                                !d && n
                                  ? (0, r.jsx)("div", {
                                      className:
                                        "h-5 w-5 animate-spin md:h-[17px] md:w-[17px]",
                                      children: (0, r.jsx)("div", {
                                        className:
                                          "h-full w-full rounded-full border-2 border-current border-t-transparent opacity-60",
                                      }),
                                    })
                                  : Y
                                    ? (0, r.jsxs)(r.Fragment, {
                                        children: [
                                          (0, r.jsx)(e$.A, {
                                            "aria-hidden": "true",
                                            className: "size-[17px]",
                                          }),
                                          (0, r.jsx)("span", {
                                            className: (0, es.cn)(
                                              "text-body font-semibold",
                                              ee
                                                ? "sr-only"
                                                : "hidden sm:inline",
                                            ),
                                            children: "Generate",
                                          }),
                                        ],
                                      })
                                    : (0, r.jsx)(eL.A, {
                                        className: (0, es.cn)(
                                          "w-5 h-5 md:w-[17px] md:h-[17px] dark:text-white transition-opacity duration-200",
                                          eK ? "opacity-100" : "opacity-60",
                                        ),
                                      }),
                            }),
                    ],
                  }),
                ],
              }),
              (0, r.jsx)(eB, {
                open: e4,
                onOpenChange: e3,
                memoryContent: e6,
                isLoading: e7,
                onUpdate: te,
                isUpdating: ex,
                onSaveEdit: tt,
                isSaving: eb,
              }),
            ],
          }),
        });
      };
      var e4 = n(63960),
        e3 = n(82254),
        e6 = n(85921),
        e8 = n(71360);
      let e7 = { queuesByContext: {}, activeDispatch: null };
      function e9(e, t, n) {
        return { ...e, queuesByContext: { ...e.queuesByContext, [t]: n } };
      }
      function te(e, t) {
        let n = e.queuesByContext[t.contextKey] ?? [];
        switch (t.type) {
          case "load_context":
            return e9(e, t.contextKey, t.prompts);
          case "enqueue":
            return e9(e, t.contextKey, [...n, t.prompt]);
          case "pause_visible": {
            let r = n.findIndex((e) => e.id === t.promptId);
            if (-1 === r) return e;
            let a = n[r];
            if ("paused" === a.status && a.pauseReason === t.reason) return e;
            let s = [...n];
            return ((s[r] = ta(a, t.reason)), e9(e, t.contextKey, s));
          }
          case "begin_dispatch": {
            let r = n[0];
            if (e.activeDispatch || r?.id !== t.promptId) return e;
            return {
              queuesByContext: {
                ...e.queuesByContext,
                [t.contextKey]: n.slice(1),
              },
              activeDispatch: {
                ...r,
                status: "dispatching",
                pauseReason: void 0,
              },
            };
          }
          case "settle_dispatch":
            if (e.activeDispatch?.id !== t.promptId) return e;
            return {
              queuesByContext: {
                ...e.queuesByContext,
                [t.contextKey]: t.pausedPrompt ? [t.pausedPrompt, ...n] : n,
              },
              activeDispatch: null,
            };
          case "remove_visible": {
            let r = n.filter((e) => e.id !== t.promptId);
            if (r.length === n.length) return e;
            return e9(e, t.contextKey, r);
          }
          default:
            return e;
        }
      }
      function tt(e, t, n) {
        return e.projectId === t && e.chatId === n;
      }
      function tn(e) {
        return !!(e && "needsContinue" in e && e.needsContinue);
      }
      function tr(e) {
        return !!(e && "completed" in e && e.completed);
      }
      function ta(e, t) {
        return { ...e, status: "paused", pauseReason: t };
      }
      function ts(e) {
        if ("dispatching" === e.status) return "Starting queued prompt";
        if ("queued" === e.status) return "Queued";
        switch (e.pauseReason) {
          case "current_build_incomplete":
            return "Queue paused \xb7 current build needs attention";
          case "completion_unverified":
            return "Queue paused \xb7 send when ready";
          case "credits_unavailable":
            return "Queue paused \xb7 credits required";
          case "internal_limit":
            return "Queue paused \xb7 prompting is temporarily unavailable";
          case "plugin_unavailable":
            return "Queue paused \xb7 reconnect Studio";
          case "session_unavailable":
            return "Queue paused \xb7 sign in again";
          case "model_unavailable":
            return "Queue paused \xb7 choose an available model";
          case "human_review_required":
            return "Queue paused \xb7 finish the current review";
          case "stopped":
            return "Queue paused \xb7 stopped before completion";
          case "network_error":
            return "Queue paused \xb7 connection interrupted";
          case "restored":
            return "Queue restored \xb7 review before sending";
          default:
            return "Queue paused \xb7 review and send when ready";
        }
      }
      let ti =
        "h-8 min-w-8 gap-1.5 rounded-lg px-2 text-caption font-medium text-neutral-600 transition-[background-color,color,transform] motion-control data-[enabled]:hover:bg-black/[0.06] data-[enabled]:hover:text-neutral-900 data-[enabled]:active:scale-[0.96] motion-reduce:transform-none dark:text-neutral-300 dark:data-[enabled]:hover:bg-white/[0.08] dark:data-[enabled]:hover:text-white";
      function to({
        prompts: e,
        isGenerating: t,
        controlsDisabled: n,
        composerRef: a,
        onEdit: s,
        onRemove: i,
        onSendNow: o,
      }) {
        let l = (0, e4.li)(new Map()),
          d = (0, e4.li)(null);
        return ((0, e4.vJ)(
          () => () => {
            null !== d.current && cancelAnimationFrame(d.current);
          },
          [],
        ),
        0 === e.length)
          ? null
          : (0, r.jsx)("section", {
              className: (0, es.cn)(
                "@container relative mx-1.5 -mb-3 overflow-hidden rounded-t-surface",
                "bg-neutral-50 pb-3 shadow-control ring-1 ring-black/[0.06]",
                "dark:bg-neutral-700 dark:ring-white/[0.08]",
              ),
              "aria-label": "Prompt queue",
              children: (0, r.jsx)("ol", {
                className:
                  "max-h-[156px] divide-y divide-black/[0.06] overflow-y-auto py-0.5 dark:divide-white/[0.07]",
                "aria-label": `${e.length} queued ${1 === e.length ? "prompt" : "prompts"}`,
                children: (0, r.jsx)(ew.N, {
                  initial: !1,
                  children: e.map((c, u) => {
                    let p =
                        (function ({
                          prompt: e,
                          index: t,
                          isGenerating: n,
                          controlsDisabled: r,
                        }) {
                          return (
                            0 === t &&
                            "dispatching" !== e.status &&
                            "restored" !== e.pauseReason &&
                            !n &&
                            !r
                          );
                        })({
                          prompt: c,
                          index: u,
                          isGenerating: t,
                          controlsDisabled: n,
                        }) && !!o,
                      h = ts(c),
                      g =
                        "paused" === c.status &&
                        "completion_unverified" !== c.pauseReason,
                      x = u + 1;
                    return (0, r.jsxs)(
                      ev.P.li,
                      {
                        initial: { opacity: 0 },
                        animate: { opacity: 1 },
                        exit: { opacity: 0 },
                        transition: { duration: 0.14, ease: "easeOut" },
                        className:
                          "grid min-h-12 grid-cols-[18px_minmax(0,1fr)_auto] items-center gap-x-2 px-2.5 py-1.5 @min-[420px]:px-3",
                        children: [
                          (0, r.jsx)("div", {
                            className:
                              "flex size-[18px] items-center justify-center text-neutral-600 dark:text-neutral-300",
                            children:
                              "dispatching" === c.status
                                ? (0, r.jsx)(m.A, {
                                    className:
                                      "size-4 animate-spin motion-reduce:animate-none",
                                    "aria-hidden": "true",
                                  })
                                : (0, r.jsx)(e3.A, {
                                    className: "size-4",
                                    "aria-hidden": "true",
                                  }),
                          }),
                          (0, r.jsxs)("div", {
                            className: "min-w-0 py-1",
                            children: [
                              (0, r.jsx)("p", {
                                className:
                                  "line-clamp-2 text-body font-medium leading-5 text-foreground @min-[420px]:truncate",
                                title: c.input,
                                children: c.input,
                              }),
                              g &&
                                (0, r.jsx)("p", {
                                  className:
                                    "truncate text-micro leading-4 text-muted-foreground",
                                  children: h,
                                }),
                              !g &&
                                (0, r.jsx)("span", {
                                  className: "sr-only",
                                  children: h,
                                }),
                            ],
                          }),
                          "dispatching" !== c.status &&
                            (0, r.jsxs)("div", {
                              className: (0, es.cn)(
                                "flex shrink-0 items-center gap-px rounded-segmented bg-neutral-100/90 p-0.5 shadow-control dark:bg-neutral-800/90",
                                p &&
                                  "col-start-2 col-end-4 row-start-2 justify-self-start @min-[420px]:col-start-3 @min-[420px]:col-end-4 @min-[420px]:row-start-1 @min-[420px]:justify-self-auto",
                              ),
                              children: [
                                p &&
                                  (0, r.jsxs)(ef.$n, {
                                    type: "button",
                                    presentation: "inherit",
                                    className: ti,
                                    onClick: () => o?.(c.id),
                                    "aria-label": `Send queued prompt ${x} now`,
                                    children: [
                                      (0, r.jsx)(e6.A, {
                                        className: "mr-1 size-3.5",
                                        "aria-hidden": "true",
                                      }),
                                      "Send now",
                                    ],
                                  }),
                                (0, r.jsxs)(ef.$n, {
                                  type: "button",
                                  presentation: "inherit",
                                  className: ti,
                                  onClick: () => s(c.id),
                                  "aria-label": `Edit queued prompt ${x}`,
                                  children: [
                                    (0, r.jsx)(eJ.A, {
                                      className: "size-3",
                                      "aria-hidden": "true",
                                    }),
                                    (0, r.jsx)("span", { children: "Edit" }),
                                  ],
                                }),
                                (0, r.jsx)(ef.$n, {
                                  type: "button",
                                  presentation: "inherit",
                                  className: (0, es.cn)(
                                    ti,
                                    "border-s border-black/[0.06] px-0 data-[enabled]:hover:bg-destructive/10 data-[enabled]:hover:text-destructive dark:border-white/[0.08] dark:data-[enabled]:hover:bg-destructive/15",
                                  ),
                                  ref: (e) => {
                                    e
                                      ? l.current.set(c.id, e)
                                      : l.current.delete(c.id);
                                  },
                                  onClick: () =>
                                    ((t, n) => {
                                      let r =
                                        e[n + 1]?.id ?? e[n - 1]?.id ?? null;
                                      (i(t),
                                        null !== d.current &&
                                          cancelAnimationFrame(d.current),
                                        (d.current = requestAnimationFrame(
                                          () => {
                                            if (((d.current = null), r)) {
                                              let e = l.current.get(r);
                                              if (e) return void e.focus();
                                            }
                                            a.current?.focus();
                                          },
                                        )));
                                    })(c.id, u),
                                  "aria-label": `Remove queued prompt ${x}`,
                                  children: (0, r.jsx)(e8.A, {
                                    className: "size-3.5",
                                    "aria-hidden": "true",
                                  }),
                                }),
                              ],
                            }),
                        ],
                      },
                      c.id,
                    );
                  }),
                }),
              }),
            });
      }
      function tl(e, t) {
        return `${e}-option-${encodeURIComponent(t)}`;
      }
      let td = ({
        files: e,
        selectedIndex: t,
        onSelect: n,
        onClose: a,
        position: s,
        isLoading: i = !1,
        listboxId: l,
      }) => {
        let d = (0, o.useRef)(null),
          c = (0, o.useRef)(null);
        ((0, o.useEffect)(() => {
          c.current &&
            d.current &&
            c.current.scrollIntoView({
              block: "nearest",
              behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
                .matches
                ? "auto"
                : "smooth",
            });
        }, [t]),
          (0, o.useEffect)(() => {
            let e = (e) => {
              d.current && !d.current.contains(e.target) && a();
            };
            return (
              document.addEventListener("mousedown", e),
              () => document.removeEventListener("mousedown", e)
            );
          }, [a]));
        let u = e.slice(0, 12);
        return (0, r.jsxs)("div", {
          ref: d,
          className:
            "absolute z-50 overflow-hidden rounded-lg border border-border bg-background shadow-lg animate-in fade-in zoom-in-95 slide-in-from-bottom-2 duration-200 motion-reduce:animate-none",
          style: {
            ...(void 0 !== s.bottom ? { bottom: `${s.bottom}px` } : {}),
            ...(void 0 !== s.top ? { top: `${s.top}px` } : {}),
            left: `${s.left}px`,
            width: "320px",
            maxHeight: "280px",
          },
          children: [
            (0, r.jsx)("div", {
              id: l,
              className: "max-h-[240px] overflow-y-auto",
              role: "listbox",
              "aria-label": "Mention a file",
              "aria-busy": i,
              children: i
                ? (0, r.jsx)("div", {
                    className:
                      "p-3 text-center text-body text-muted-foreground",
                    role: "status",
                    children: "Loading files...",
                  })
                : 0 === u.length
                  ? (0, r.jsx)("div", {
                      className:
                        "p-3 text-center text-body text-muted-foreground",
                      role: "status",
                      children: "No files found",
                    })
                  : u.map((e, a) =>
                      (0, r.jsxs)(
                        ef.$n,
                        {
                          type: "button",
                          variant: "ghost",
                          id: tl(l, e.uniqueId),
                          ref: a === t ? c : null,
                          className: (0, es.cn)(
                            "h-auto w-full justify-start gap-2 rounded-none px-3 py-2 text-left transition-colors focus-visible:ring-inset motion-reduce:transition-none",
                            a === t
                              ? "bg-accent text-accent-foreground"
                              : "hover:bg-accent/50",
                          ),
                          role: "option",
                          "aria-selected": a === t,
                          tabIndex: -1,
                          onMouseDown: (e) => e.preventDefault(),
                          onClick: () => n(e),
                          children: [
                            ((e) => {
                              let t =
                                  "script" === e.type
                                    ? "/project-icons/roblox.svg"
                                    : "/project-icons/instances.png",
                                n = "script" === e.type ? "Script" : "Instance";
                              return (0, r.jsx)(eo.default, {
                                src: t,
                                alt: n,
                                width: 16,
                                height: 16,
                                className: "w-4 h-4 object-contain shrink-0",
                              });
                            })(e),
                            (0, r.jsxs)("div", {
                              className:
                                "flex-1 min-w-0 flex items-center gap-2",
                              children: [
                                (0, r.jsx)("div", {
                                  className:
                                    "text-body font-medium whitespace-nowrap shrink-0",
                                  children: e.name,
                                }),
                                (0, r.jsx)("div", {
                                  className:
                                    "text-caption text-muted-foreground truncate min-w-0 flex-1",
                                  children: ((e, t = 12) =>
                                    e
                                      ? e.length <= t
                                        ? e
                                        : `...${e.slice(-t)}`
                                      : "")(e.path, 40),
                                }),
                              ],
                            }),
                          ],
                        },
                        e.uniqueId,
                      ),
                    ),
            }),
            (0, r.jsx)("div", {
              className: "border-t border-border px-3 py-2 bg-muted/30",
              children: (0, r.jsx)("p", {
                className: "text-caption text-muted-foreground",
                children: "Re-connect plugin if you can't find a file",
              }),
            }),
          ],
        });
      };
      function tc(e) {
        return (e || "")
          .replaceAll("&", "&amp;")
          .replaceAll("<", "&lt;")
          .replaceAll(">", "&gt;");
      }
      let tu = ({ input: e, mentionedFiles: t, textareaRef: n }) => {
          let a = (0, o.useRef)(null);
          ((0, o.useEffect)(() => {
            let e = n.current,
              t = a.current;
            if (!e || !t) return;
            let r = window.getComputedStyle(e);
            ((t.style.fontFamily = r.fontFamily),
              (t.style.fontSize = r.fontSize),
              (t.style.fontWeight = r.fontWeight),
              (t.style.fontStyle = r.fontStyle),
              (t.style.lineHeight = r.lineHeight),
              (t.style.letterSpacing = r.letterSpacing),
              (t.style.wordSpacing = r.wordSpacing),
              (t.style.textTransform = r.textTransform),
              (t.style.textRendering = r.textRendering),
              (t.scrollTop = e.scrollTop),
              (t.scrollLeft = e.scrollLeft));
          }, [n, e]),
            (0, o.useEffect)(() => {
              let e = n.current,
                t = a.current;
              if (!e || !t) return;
              let r = null,
                s = () => {
                  (null !== r && cancelAnimationFrame(r),
                    (r = requestAnimationFrame(() => {
                      ((t.scrollTop = e.scrollTop),
                        (t.scrollLeft = e.scrollLeft));
                    })));
                };
              return (
                s(),
                e.addEventListener("scroll", s),
                () => {
                  (null !== r && cancelAnimationFrame(r),
                    e.removeEventListener("scroll", s));
                }
              );
            }, [n]));
          let s = (function (e, t) {
            let n = tc(e || "");
            if (!t || 0 === t.length) return n;
            for (let e of t) {
              let t = e.mentionText;
              if (!t) continue;
              let r = RegExp(
                (t || "").replace(/[.*+?^${}()|[\]\\]/g, "\\$&"),
                "g",
              );
              n = n.replace(
                r,
                `<span class="mention-wrapper"><span class="inline-block align-baseline rounded bg-info/10 text-info">${tc(t)}</span></span>`,
              );
            }
            return n;
          })(e, t);
          return (0, r.jsx)("div", {
            ref: a,
            className:
              "absolute inset-0 pointer-events-none whitespace-pre-wrap break-normal text-transparent px-0 py-1 text-body-lg overflow-hidden",
            "aria-hidden": !0,
            style: {
              fontFamily: "inherit",
              wordWrap: "normal",
              overflowWrap: "normal",
            },
            dangerouslySetInnerHTML: { __html: s + "​" },
          });
        },
        tm = ({
          input: e,
          tokens: t,
          textareaRef: n,
          revealDelaysById: a,
          className: s,
        }) => {
          let i = (0, o.useRef)(null);
          ((0, o.useEffect)(() => {
            let e = n.current,
              t = i.current;
            if (!e || !t) return;
            let r = window.getComputedStyle(e);
            ((t.style.fontFamily = r.fontFamily),
              (t.style.fontSize = r.fontSize),
              (t.style.fontWeight = r.fontWeight),
              (t.style.fontStyle = r.fontStyle),
              (t.style.lineHeight = r.lineHeight),
              (t.style.letterSpacing = r.letterSpacing),
              (t.style.wordSpacing = r.wordSpacing),
              (t.style.textTransform = r.textTransform),
              (t.style.textRendering = r.textRendering),
              (t.scrollTop = e.scrollTop),
              (t.scrollLeft = e.scrollLeft));
          }, [n, e]),
            (0, o.useEffect)(() => {
              let e = n.current,
                t = i.current;
              if (!e || !t) return;
              let r = null,
                a = () => {
                  (null !== r && cancelAnimationFrame(r),
                    (r = requestAnimationFrame(() => {
                      ((t.scrollTop = e.scrollTop),
                        (t.scrollLeft = e.scrollLeft));
                    })));
                };
              return (
                a(),
                e.addEventListener("scroll", a),
                () => {
                  (null !== r && cancelAnimationFrame(r),
                    e.removeEventListener("scroll", a));
                }
              );
            }, [n]));
          let l = (function (e, t, n) {
            if (!t.length) return tc(e);
            let r = [...t].sort((e, t) => e.start - t.start),
              a = "",
              s = 0;
            for (let t of r) {
              let r = Math.max(t.start, s),
                i = Math.min(t.end, e.length);
              if (r >= i) continue;
              r > s && (a += tc(e.slice(s, r)));
              let o = e.slice(r, i),
                l = n?.[t.id],
                d = void 0 !== l ? " composable-wrapper--drop-reveal" : "",
                c =
                  void 0 !== l
                    ? ` style="--composable-reveal-delay:${l}ms"`
                    : "";
              ((a +=
                `<span class="composable-wrapper${d}"${c}>` +
                tc(o) +
                "</span>"),
                (s = i));
            }
            return (s < e.length && (a += tc(e.slice(s))), a);
          })(e, t, a);
          return (0, r.jsx)("div", {
            ref: i,
            className: (0, es.cn)(
              "absolute inset-0 pointer-events-none whitespace-pre-wrap break-normal text-transparent px-0 py-1 text-body-lg overflow-hidden",
              s,
            ),
            "aria-hidden": !0,
            style: {
              fontFamily: "inherit",
              wordWrap: "normal",
              overflowWrap: "normal",
            },
            dangerouslySetInnerHTML: { __html: l + "​" },
          });
        };
      var tp = n(41407),
        th = n(33930),
        tg = n(79158),
        tx = n(39068),
        tf = n(86651),
        tb = n(83457);
      function ty({
        className: e,
        direction: t = "bottom",
        blurPx: n = 8,
        layers: a = 5,
      }) {
        let s = o.useMemo(
          () =>
            Array.from({ length: a }, (e, r) => {
              let s = (r + 1) / a,
                i = "bottom" === t ? 1 - s : 0,
                o = "bottom" === t ? 1 : s,
                l = "bottom" === t ? "transparent" : "black",
                d = "bottom" === t ? "black" : "transparent";
              return {
                blur: (n * (r + 1)) / a,
                mask: `linear-gradient(to ${t}, ${l} ${Math.round(100 * i)}%, ${d} ${Math.round(100 * o)}%)`,
              };
            }),
          [n, t, a],
        );
        return (0, r.jsx)("div", {
          "aria-hidden": !0,
          className: (0, es.cn)("pointer-events-none absolute inset-0", e),
          children: s.map((e, t) =>
            (0, r.jsx)(
              "div",
              {
                className: "absolute inset-0",
                style: {
                  backdropFilter: `blur(${e.blur}px)`,
                  WebkitBackdropFilter: `blur(${e.blur}px)`,
                  WebkitMaskImage: e.mask,
                  maskImage: e.mask,
                },
              },
              t,
            ),
          ),
        });
      }
      var tv = n(33789),
        tw = n(68122);
      function tj({
        patternSize: e = 100,
        patternScaleX: t = 1,
        patternScaleY: n = 1,
        patternRefreshInterval: a = 2,
        patternAlpha: s = 20,
        intensity: i = 1,
        className: o,
      }) {
        let l = (0, e4.li)(null),
          d = (0, e4.li)({ width: 0, height: 0 });
        return (
          (0, e4.vJ)(() => {
            let r = l.current;
            if (!r) return;
            let o = r.getContext("2d");
            if (!o) return;
            let c = document.createElement("canvas");
            ((c.width = e), (c.height = e));
            let u = c.getContext("2d");
            if (!u) return;
            let m = u.createImageData(e, e),
              p = e * e * 4,
              h = () => {
                let e = window.devicePixelRatio || 1,
                  t = r.parentElement,
                  n = t?.getBoundingClientRect(),
                  a = n?.width ?? window.innerWidth,
                  s = n?.height ?? window.innerHeight;
                ((d.current = { width: a, height: s }),
                  (r.width = Math.max(1, Math.floor(a * e))),
                  (r.height = Math.max(1, Math.floor(s * e))),
                  o.setTransform(e, 0, 0, e, 0, 0));
              },
              g = () => {
                for (let e = 0; e < p; e += 4) {
                  let t = 255 * Math.random() * i;
                  ((m.data[e] = t),
                    (m.data[e + 1] = t),
                    (m.data[e + 2] = t),
                    (m.data[e + 3] = s));
                }
                u.putImageData(m, 0, 0);
              },
              x = () => {
                let { width: e, height: r } = d.current;
                if (0 === e || 0 === r) return;
                (o.clearRect(0, 0, e, r), o.save());
                let a = Math.max(0.001, t),
                  s = Math.max(0.001, n);
                o.scale(a, s);
                let i = o.createPattern(c, "repeat");
                (i && ((o.fillStyle = i), o.fillRect(0, 0, e / a, r / s)),
                  o.restore());
              },
              f = 0,
              b = 0,
              y = () => {
                (d.current.width > 0 &&
                  d.current.height > 0 &&
                  b % Math.max(1, a) == 0 &&
                  (g(), x()),
                  b++,
                  (f = window.requestAnimationFrame(y)));
              };
            return (
              h(),
              window.addEventListener("resize", h),
              a > 0 ? y() : (g(), x()),
              () => {
                (window.removeEventListener("resize", h),
                  f && window.cancelAnimationFrame(f));
              }
            );
          }, [e, t, n, a, s, i]),
          (0, r.jsx)("canvas", {
            ref: l,
            "aria-hidden": !0,
            className: (0, es.cn)(
              "pointer-events-none absolute inset-0 h-full w-full",
              o,
            ),
          })
        );
      }
      function tk({
        gradientType: e = "radial-gradient",
        gradientSize: t = "125% 125%",
        gradientOrigin: n = "bottom-middle",
        colors: a = [
          { color: "rgba(245,87,2,1)", stop: "10.5%" },
          { color: "rgba(245,120,2,1)", stop: "16%" },
          { color: "rgba(245,140,2,1)", stop: "17.5%" },
          { color: "rgba(245,170,100,1)", stop: "25%" },
          { color: "rgba(238,174,202,1)", stop: "40%" },
          { color: "rgba(202,179,214,1)", stop: "65%" },
          { color: "rgba(148,201,233,1)", stop: "100%" },
        ],
        enableNoise: s = !0,
        noisePatternSize: i = 100,
        noisePatternScaleX: o = 1,
        noisePatternScaleY: l = 1,
        noisePatternRefreshInterval: d = 2,
        noisePatternAlpha: c = 20,
        noiseIntensity: u = 1,
        className: m,
        style: p,
        customGradient: h,
        children: g,
      }) {
        let x = {
            "bottom-middle": "50% 101%",
            "bottom-left": "0% 101%",
            "bottom-right": "100% 101%",
            "top-middle": "50% -1%",
            "top-left": "0% -1%",
            "top-right": "100% -1%",
            "left-middle": "-1% 50%",
            "right-middle": "101% 50%",
            center: "50% 50%",
          },
          f = {
            "bottom-middle": "0deg",
            "bottom-left": "45deg",
            "bottom-right": "315deg",
            "top-middle": "180deg",
            "top-left": "135deg",
            "top-right": "225deg",
            "left-middle": "90deg",
            "right-middle": "270deg",
            center: "0deg",
          };
        return (0, r.jsxs)("div", {
          className: (0, es.cn)("absolute inset-0 h-full w-full", m),
          style: {
            background: (() => {
              if (h) return h;
              let r = x[n] ?? x["bottom-middle"],
                s = a.map((e) => `${e.color} ${e.stop}`).join(",");
              if ("radial-gradient" === e)
                return `radial-gradient(${t} at ${r},${s})`;
              if ("linear-gradient" === e) {
                let e = f[n] ?? "0deg";
                return `linear-gradient(${e},${s})`;
              }
              return "conic-gradient" === e
                ? `conic-gradient(from 0deg at ${r},${s})`
                : `${e}(${s})`;
            })(),
            ...p,
          },
          children: [
            s &&
              (0, r.jsx)(tj, {
                patternSize: i,
                patternScaleX: o,
                patternScaleY: l,
                patternRefreshInterval: d,
                patternAlpha: c,
                intensity: u,
              }),
            g,
          ],
        });
      }
      let tN = o.memo(function ({
          card: e,
          variant: t,
          isSelected: n = !1,
          isFlipped: a,
          isHeld: s = !1,
          isHandHighlighted: i = !1,
          isHovered: l = !1,
          mysteryAsButton: d = !1,
          disabled: c = !1,
          onClick: u,
          onPointerDown: m,
          onPointerUp: p,
          onPointerLeave: h,
          className: g,
        }) {
          let x = (a ?? n) && "hand" === t,
            f = "var(--color-neutral-700)",
            b = "4px solid rgba(1, 1, 1, 0.1)",
            y = "inventory" === t && !!e.mystery && !d,
            v = "hand" === t && !e.mystery && !x,
            w = o.useRef(null),
            [j, k] = o.useState(!1);
          o.useEffect(() => {
            k(!1);
            let e = w.current;
            e && e.complete && e.naturalWidth > 0 && k(!0);
          }, [e.imageUrl]);
          let N = (0, r.jsx)(ev.P.button, {
            type: "button",
            onClick: u,
            disabled: c,
            className: (0, es.cn)(
              "relative select-none rounded-xl",
              "focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-white/30",
              "hand" === t &&
                i &&
                !e.mystery &&
                "ring-2 ring-white/30 shadow-[0_0_18px_rgba(255,255,255,0.13)]",
              s && "cursor-grabbing",
              c && "cursor-not-allowed",
              e.mystery && !d && "cursor-not-allowed",
              "hand" === t ? "w-[108px] h-[151px]" : "w-full aspect-5/7",
              "perspective-[1000px]",
              g,
            ),
            onPointerDown: m,
            onPointerUp: p,
            onPointerLeave: h,
            whileHover: "inventory" !== t || c ? void 0 : { scale: 1.04 },
            transition: { type: "spring", stiffness: 260, damping: 22 },
            "aria-pressed": n,
            "aria-label": e.title,
            title: e.mystery && !y ? "Coming soon!" : void 0,
            children: (0, r.jsxs)("div", {
              className: (0, es.cn)(
                "relative h-full w-full rounded-xl shadow-xl",
                "transition-transform duration-700 ease-[cubic-bezier(0.2,0.9,0.2,1.1)]",
                "transform-3d",
                x && "transform-[rotateY(180deg)]",
              ),
              children: [
                (0, r.jsx)("div", {
                  className:
                    "absolute inset-0 overflow-hidden rounded-xl backface-hidden [-webkit-backface-visibility:hidden]",
                  style: { backgroundColor: f, border: b },
                  children: e.mystery
                    ? (0, r.jsxs)(r.Fragment, {
                        children: [
                          (0, r.jsx)(tk, {
                            gradientOrigin: "center",
                            gradientSize: "140% 140%",
                            colors: [
                              { color: "rgba(96,96,96,0.8)", stop: "0%" },
                              { color: "rgba(72,72,76,0.8)", stop: "60%" },
                              { color: "rgba(56,56,60,0.8)", stop: "100%" },
                            ],
                            noisePatternSize: 90,
                            noisePatternAlpha: 14,
                            noiseIntensity: 0.7,
                            noisePatternRefreshInterval: 3,
                          }),
                          (0, r.jsx)("div", {
                            className:
                              "absolute inset-0 flex items-center justify-center",
                            children: (0, r.jsx)("span", {
                              className:
                                "text-status-symbol text-white/70 drop-shadow-sm font-semibold select-none",
                              children: "+",
                            }),
                          }),
                        ],
                      })
                    : (0, r.jsxs)(r.Fragment, {
                        children: [
                          !j &&
                            (0, r.jsx)(tw.E, {
                              className:
                                "absolute inset-0 h-full w-full rounded-none bg-white/10",
                            }),
                          (0, r.jsx)("img", {
                            ref: w,
                            src: e.imageUrl,
                            alt: "",
                            "aria-hidden": !0,
                            decoding: "async",
                            onLoad: () => k(!0),
                            onError: () => k(!0),
                            className: (0, es.cn)(
                              "absolute inset-0 h-full w-full object-cover transition-[filter,opacity] duration-150",
                              !j && "opacity-0",
                            ),
                            draggable: !1,
                            style:
                              "hand" !== t || x
                                ? void 0
                                : l
                                  ? { filter: "blur(1.5px) saturate(50%)" }
                                  : n
                                    ? void 0
                                    : { filter: "saturate(85%)" },
                          }),
                          v &&
                            j &&
                            (0, r.jsxs)(r.Fragment, {
                              children: [
                                (0, r.jsx)("div", {
                                  className: (0, es.cn)(
                                    "pointer-events-none absolute -bottom-10 -left-10 h-28 w-28 rounded-full",
                                    "bg-linear-to-tr from-white/30 to-transparent blur-3xl",
                                    "transition-[opacity,transform] duration-700 motion-reduce:transition-none",
                                    l ? "opacity-60 scale-110" : "opacity-25",
                                  ),
                                }),
                                (0, r.jsx)("div", {
                                  className:
                                    "pointer-events-none absolute inset-0 overflow-hidden rounded-xl",
                                  children: (0, r.jsx)(ev.P.div, {
                                    className:
                                      "absolute inset-y-0 -left-1/2 w-1/2 bg-linear-to-r from-transparent via-white/30 to-transparent",
                                    style: { skewX: -12 },
                                    animate: { x: ["0%", "400%"] },
                                    transition: {
                                      duration: 1.5,
                                      ease: "easeInOut",
                                      repeat: 1 / 0,
                                      repeatDelay: 60,
                                    },
                                  }),
                                }),
                              ],
                            }),
                          j &&
                            (0, r.jsxs)(r.Fragment, {
                              children: [
                                (0, r.jsx)(ty, {
                                  className:
                                    "absolute bottom-0 left-0 right-0 top-[55%]",
                                  direction: "bottom",
                                  blurPx: 6,
                                  layers: 4,
                                }),
                                (0, r.jsx)("div", {
                                  className:
                                    "absolute bottom-0 left-0 right-0 px-2.5 py-2",
                                  style: {
                                    filter:
                                      "drop-shadow(0 0 3px rgba(0,0,0,1)) drop-shadow(0 0 8px rgba(0,0,0,1))",
                                  },
                                  children: (0, r.jsx)("p", {
                                    className:
                                      "text-micro font-semibold leading-tight text-white",
                                    children: e.title,
                                  }),
                                }),
                              ],
                            }),
                          e.animated &&
                            j &&
                            (0, r.jsx)("div", {
                              className: (0, es.cn)(
                                "pointer-events-none absolute top-1.5 right-1.5 z-10",
                                "rounded-md bg-black/40 backdrop-blur-xs",
                                "px-1.5 py-[2px] text-overline",
                                "text-white/95 ring-1 ring-white/15",
                              ),
                              children: "Animated",
                            }),
                          v &&
                            (0, r.jsxs)(r.Fragment, {
                              children: [
                                (0, r.jsx)("div", {
                                  className: (0, es.cn)(
                                    "pointer-events-none absolute top-0 left-0 h-12 w-12",
                                    "bg-linear-to-br from-white/25 to-transparent rounded-br-2xl",
                                    "transition-opacity duration-500",
                                    l ? "opacity-100" : "opacity-0",
                                  ),
                                }),
                                (0, r.jsx)("div", {
                                  className: (0, es.cn)(
                                    "pointer-events-none absolute bottom-0 right-0 h-12 w-12",
                                    "bg-linear-to-tl from-white/25 to-transparent rounded-tl-2xl",
                                    "transition-opacity duration-500",
                                    l ? "opacity-100" : "opacity-0",
                                  ),
                                }),
                              ],
                            }),
                          (0, r.jsx)(ew.N, {
                            children:
                              "hand" === t &&
                              l &&
                              !x &&
                              (0, r.jsxs)(
                                ev.P.div,
                                {
                                  className:
                                    "absolute inset-0 flex flex-col items-center justify-center gap-1 mb-6 text-white pointer-events-none",
                                  style: {
                                    filter:
                                      "drop-shadow(0 0 3px rgba(0,0,0,1)) drop-shadow(0 0 8px rgba(0,0,0,1))",
                                  },
                                  initial: { opacity: 0, scale: 0.9 },
                                  animate: { opacity: 1, scale: 1 },
                                  exit: { opacity: 0, scale: 0.9 },
                                  transition: {
                                    duration: 0.15,
                                    ease: "easeOut",
                                  },
                                  children: [
                                    (0, r.jsx)(tg.A, { className: "h-7 w-7" }),
                                    (0, r.jsx)("span", {
                                      className:
                                        "text-body font-bold leading-none",
                                      children: "Drag",
                                    }),
                                    (0, r.jsx)("span", {
                                      className:
                                        "text-caption font-bold leading-none opacity-90",
                                      children: "to preview",
                                    }),
                                  ],
                                },
                                "hover-hint",
                              ),
                          }),
                        ],
                      }),
                }),
                "hand" === t &&
                  (0, r.jsxs)("div", {
                    className: (0, es.cn)(
                      "absolute inset-0 rounded-xl p-3 flex flex-col justify-between overflow-hidden",
                      "backface-hidden [-webkit-backface-visibility:hidden]",
                      "transform-[rotateY(180deg)]",
                    ),
                    style: { backgroundColor: f, border: b },
                    children: [
                      (0, r.jsx)("div", {
                        className: "shrink-0",
                        children: (0, r.jsx)("p", {
                          className: "text-body font-bold text-white",
                          children: e.title,
                        }),
                      }),
                      (0, r.jsx)("p", {
                        className:
                          "text-caption leading-snug text-white/90 line-clamp-5 min-h-0",
                        children: (function (e) {
                          let t = e.indexOf("—");
                          return -1 === t ? e : e.slice(t + 1).trim();
                        })(e.oneLiner),
                      }),
                    ],
                  }),
              ],
            }),
          });
          return y
            ? (0, r.jsxs)(en.m_, {
                children: [
                  (0, r.jsx)(en.k$, { asChild: !0, children: N }),
                  (0, r.jsx)(en.ZI, { side: "top", children: "Coming soon!" }),
                ],
              })
            : N;
        }),
        tI = [
          {
            id: "mystery",
            title: "Mystery",
            oneLiner: "Surprise me — pick a random mechanic for me.",
            category: "your-cards",
            imageUrl: "",
            mystery: !0,
          },
          {
            id: "round-system",
            title: "Round System",
            oneLiner: "Add a round system.",
            category: "your-cards",
            imageUrl: "/images/round-system.webp",
          },
          {
            id: "gun-system",
            title: "Gun System",
            oneLiner: "Add a SMG gun system.",
            category: "your-cards",
            imageUrl: "/images/gun-system.webp",
          },
          {
            id: "enemy-system",
            title: "Enemy System",
            oneLiner: "Add an enemy system.",
            category: "your-cards",
            imageUrl: "/images/enemy-system.webp",
          },
          {
            id: "clicker-system",
            title: "Clicker System",
            oneLiner:
              "Click a button UI to earn +1 point, show the score on screen.",
            category: "your-cards",
            imageUrl: "/images/clicker-system.webp",
            composables: [
              { word: "Click", label: "action" },
              { word: "button", label: "object" },
              { word: "score", label: "stat" },
            ],
          },
          {
            id: "punching-mechanic",
            title: "Punching Mechanic",
            oneLiner: "Click to perform a punch hit.",
            category: "your-cards",
            imageUrl: "/images/punching-mechanic.webp",
            animated: !0,
            composables: [
              { word: "Click", label: "action" },
              { word: "punch", label: "action" },
            ],
          },
          {
            id: "rng-system",
            title: "RNG System",
            oneLiner:
              "Click a UI button to roll a random rarity and show the result in the screen.",
            category: "your-cards",
            imageUrl: "/images/rng-system.webp",
            composables: [
              { word: "Click", label: "action" },
              { word: "button", label: "object" },
              { word: "rarity", label: "stat" },
            ],
          },
          {
            id: "monster-ai",
            title: "Monster AI",
            oneLiner: "Add a creature that follows the player.",
            category: "your-cards",
            imageUrl: "/images/monster-ai.webp",
            composables: [{ word: "creature", label: "object" }],
          },
          {
            id: "npc-spawning-logic",
            title: "Item Spawning",
            oneLiner: "Items appear randomly on the map.",
            category: "your-cards",
            imageUrl: "/images/spawning-logic.webp",
            composables: [{ word: "Items", label: "object" }],
          },
          {
            id: "first-person-camera",
            title: "1st Person Camera",
            oneLiner: "Lock the view to the player's head.",
            category: "your-cards",
            imageUrl: "/images/first-person-camera.webp",
          },
          {
            id: "sprinting-system",
            title: "Sprinting System",
            oneLiner: "Make shift to run.",
            category: "your-cards",
            imageUrl: "/images/sprinting-system.webp",
            composables: [
              { word: "shift", label: "key" },
              { word: "run", label: "action" },
            ],
          },
          {
            id: "double-jump",
            title: "Double Jump",
            oneLiner: "Add double jump with particles.",
            category: "your-cards",
            imageUrl: "/images/double-jump.webp",
            animated: !0,
            composables: [{ word: "double jump", label: "action" }],
          },
          {
            id: "ball-physics",
            title: "Ball Physics",
            oneLiner:
              "Add a ball and create a mechanic that players can kick the ball by walking into it.",
            category: "your-cards",
            imageUrl: "/images/ball-physics.webp",
            composables: [
              { word: "ball", label: "object" },
              { word: "kick", label: "action" },
            ],
          },
          {
            id: "camera-effects",
            title: "Camera Effects",
            oneLiner:
              "Set up a slightly dark atmosphere lighting with fog with scripts.",
            category: "your-cards",
            imageUrl: "/images/camera-effects.webp",
            composables: [
              { word: "dark", label: "vibe" },
              { word: "fog", label: "vibe" },
            ],
          },
          {
            id: "kill-brick",
            title: "Kill Brick",
            oneLiner: "Create a part that kill the player on touch.",
            category: "your-cards",
            imageUrl: "/images/kill-brick.webp",
            composables: [
              { word: "part", label: "object" },
              { word: "kill", label: "action" },
              { word: "touch", label: "action" },
            ],
          },
          {
            id: "team-selection",
            title: "Team Selection",
            oneLiner: "Create a UI to choose prisoner or guard.",
            category: "your-cards",
            imageUrl: "/images/team-selection.webp",
            composables: [
              { word: "prisoner", label: "object" },
              { word: "guard", label: "object" },
            ],
          },
          {
            id: "day-night-cycle",
            title: "Day Night Cycle",
            oneLiner: "Create a day and night cycle with a UI toggle.",
            category: "your-cards",
            imageUrl: "/images/day-night.webp",
            composables: [
              { word: "day", label: "vibe" },
              { word: "night", label: "vibe" },
            ],
          },
          {
            id: "lava-rising",
            title: "Lava Rising",
            oneLiner:
              "Create a lava part that starts at the bottom of the map and slowly rises upwards. if a player touches the lava, they should die.",
            category: "your-cards",
            imageUrl: "/images/lava-rising.webp",
            composables: [{ word: "lava", label: "vibe" }],
          },
          {
            id: "admin-panel",
            title: "Admin Panel",
            oneLiner:
              "Make an admin panel UI with Low Gravity, Disco Color, and other events.",
            category: "your-cards",
            imageUrl: "/images/admin-panel.webp",
            composables: [
              { word: "Low Gravity", label: "action" },
              { word: "Disco Color", label: "action" },
            ],
          },
          {
            id: "side-scrolling-camera",
            title: "Side Scrolling Camera",
            oneLiner:
              "Create a 2D side-scrolling camera that follows the player from a fixed side perspective, locking the camera view to a side view.",
            category: "your-cards",
            imageUrl: "/images/sidescrolling.webp",
          },
          {
            id: "security-camera-system",
            title: "Security Camera System",
            oneLiner:
              "Create a security camera system. The player should be able to press the 'C' key to cycle through camera views. Add the cameras as parts named 'CamPart1' and 'CamPart2' in the workspace.",
            category: "your-cards",
            imageUrl: "/images/security-camera.webp",
            composables: [{ word: "'C'", label: "key" }],
          },
          {
            id: "stand-summoning",
            title: "Stand Summoning",
            oneLiner:
              "Create a stand summoning system. Add a model named 'StandModel'. When the player presses 'Q', the stand should be summoned behind them. The stand should be invisible, when not summoned and visible when summoned.",
            category: "your-cards",
            imageUrl: "/images/stand-summon.webp",
            composables: [
              { word: "'Q'", label: "key" },
              { word: "stand", label: "object" },
            ],
          },
          {
            id: "carry-system",
            title: "Carry System",
            oneLiner: "Click an object to pick it up.",
            category: "your-cards",
            imageUrl: "/images/carry-system.webp",
            animated: !0,
            composables: [
              { word: "Click", label: "action" },
              { word: "object", label: "object" },
            ],
          },
          {
            id: "checkpoint-system",
            title: "Checkpoint System",
            oneLiner:
              "Make 3 checkpoints spread across the map that save your spawn point when you touch them.",
            category: "your-cards",
            imageUrl: "/images/checkpoint.webp",
            composables: [
              { word: "3", label: "amount" },
              { word: "checkpoints", label: "object" },
              { word: "touch", label: "action" },
            ],
          },
          {
            id: "sword-mechanic",
            title: "Sword Mechanic",
            oneLiner: "Make a sword system.",
            category: "your-cards",
            imageUrl: "/images/sword-mechanic.webp",
            animated: !0,
            composables: [{ word: "sword", label: "object" }],
          },
          {
            id: "fishing-mechanic",
            title: "Fishing Mechanic",
            oneLiner:
              "Make a fishing mechanic, we can cast a fishing rod tool into the water and then triggering a UI minigame to keep a tracking bar within a shifting target zone by using the mouse position. Create the water and make the minigame easy.",
            category: "your-cards",
            imageUrl: "/images/fishing-mechanic.webp",
            animated: !0,
            composables: [
              { word: "fishing rod", label: "object" },
              { word: "water", label: "object" },
            ],
          },
          {
            id: "plot-system",
            title: "Plot System",
            oneLiner:
              "Create a plot system that works for each player, a player can only build blocks on own plot. Name the plot to the player that joined.",
            category: "your-cards",
            imageUrl: "/images/plot-system.webp",
            composables: [
              { word: "plot", label: "object" },
              { word: "blocks", label: "object" },
            ],
          },
          {
            id: "planting-mechanic",
            title: "Planting Mechanic",
            oneLiner: "Click a dirt patch to plant a seed.",
            category: "your-cards",
            imageUrl: "/images/planting-mechanic.webp",
            composables: [
              { word: "Click", label: "action" },
              { word: "seed", label: "object" },
            ],
          },
          {
            id: "money-system",
            title: "Money System",
            oneLiner:
              "Make a money system with a remoteevent so everytime you click an UI, 5 coins are earned.",
            category: "your-cards",
            imageUrl: "/images/money-system.webp",
            composables: [
              { word: "5", label: "amount" },
              { word: "coins", label: "stat" },
            ],
          },
          {
            id: "leveling-system",
            title: "Leveling System",
            oneLiner: "Create a level and XP system with a UI bar.",
            category: "your-cards",
            imageUrl: "/images/leveling-system.webp",
            composables: [
              { word: "level", label: "stat" },
              { word: "XP", label: "stat" },
            ],
          },
          {
            id: "resource-gathering",
            title: "Resource Gathering",
            oneLiner: "Click a tree to get wood.",
            category: "your-cards",
            imageUrl: "/images/resource-ghatering.webp",
            composables: [
              { word: "Click", label: "action" },
              { word: "tree", label: "object" },
              { word: "wood", label: "object" },
            ],
          },
          {
            id: "dropper-system",
            title: "Dropper System",
            oneLiner: "Create a dropper that spawns parts.",
            category: "your-cards",
            imageUrl: "/images/dropper-system.webp",
            composables: [
              { word: "dropper", label: "object" },
              { word: "parts", label: "object" },
            ],
          },
          {
            id: "grid-placement",
            title: "Grid Placement",
            oneLiner: "Click to place a simple house.",
            category: "your-cards",
            imageUrl: "/images/Grid-Placement.webp",
            composables: [
              { word: "Click", label: "action" },
              { word: "house", label: "object" },
            ],
          },
          {
            id: "tower-placement",
            title: "Tower Placement",
            oneLiner: "Click to place a tower on the map.",
            category: "your-cards",
            imageUrl: "/images/tower-placement.webp",
            composables: [
              { word: "Click", label: "action" },
              { word: "tower", label: "object" },
            ],
          },
          {
            id: "health-system",
            title: "Health System",
            oneLiner: "Add a health bar that reacts to damage.",
            category: "your-cards",
            imageUrl: "/images/health-system.webp",
            composables: [
              { word: "health", label: "stat" },
              { word: "damage", label: "stat" },
            ],
          },
          {
            id: "pet-system",
            title: "Pet System",
            oneLiner: "Add a basic pet that follows the player.",
            category: "your-cards",
            imageUrl: "/images/pet-system.webp",
            composables: [{ word: "pet", label: "object" }],
          },
          {
            id: "egg-hatching",
            title: "Egg Hatching",
            oneLiner: "Click a button to hatch a random pet.",
            category: "your-cards",
            imageUrl: "/images/egg-hatching.webp",
            composables: [
              { word: "Click", label: "action" },
              { word: "pet", label: "object" },
            ],
          },
          {
            id: "admin-commands",
            title: "Admin Commands",
            oneLiner: "Add admin UI with commands.",
            category: "your-cards",
            imageUrl: "/images/admin-commands.webp",
          },
          {
            id: "stealing-mechanic",
            title: "Stealing Mechanic",
            oneLiner:
              "Create a mechanic where players can steal a 'Brainrot' model holding the 'E' key (add 'BrainrotDummy' in workspace).",
            category: "your-cards",
            imageUrl: "/images/stealing-mechanic.webp",
            composables: [
              { word: "steal", label: "action" },
              { word: "'E'", label: "key" },
            ],
          },
          {
            id: "dash-system",
            title: "Dash System",
            oneLiner: "Make a dash system.",
            category: "your-cards",
            imageUrl: "/images/dash-system.webp",
            composables: [{ word: "dash", label: "action" }],
          },
          {
            id: "stamina-system",
            title: "Stamina System",
            oneLiner: "Make the player shift to run with a stamina bar UI.",
            category: "your-cards",
            imageUrl: "/images/stamina-system.webp",
            animated: !0,
            composables: [
              { word: "shift", label: "key" },
              { word: "run", label: "action" },
              { word: "stamina", label: "stat" },
            ],
          },
          {
            id: "sliding-mechanic",
            title: "Sliding Mechanic",
            oneLiner: "Implement sprinting and sliding mechanics.",
            category: "your-cards",
            imageUrl: "/images/sliding-mechanic.webp",
            animated: !0,
            composables: [
              { word: "sprinting", label: "action" },
              { word: "sliding", label: "action" },
            ],
          },
          {
            id: "pathfinding-system",
            title: "Pathfinding System",
            oneLiner: "Make a unit follow a path.",
            category: "your-cards",
            imageUrl: "/images/pathfinding-system.webp",
            composables: [{ word: "unit", label: "object" }],
          },
          {
            id: "disaster-system",
            title: "Disaster System",
            oneLiner: "Make a tornado.",
            category: "your-cards",
            imageUrl: "/images/disaster-system.webp",
            composables: [{ word: "tornado", label: "object" }],
          },
          {
            id: "teleporter-mechanic",
            title: "Teleporter Mechanic",
            oneLiner:
              "Make a block that teleports me from one place to another works one way.",
            category: "your-cards",
            imageUrl: "/images/teleporter-mechanic.webp",
            composables: [
              { word: "block", label: "object" },
              { word: "teleports", label: "action" },
            ],
          },
          {
            id: "ragdoll-system",
            title: "Ragdoll On Death",
            oneLiner: "Make ragdoll spawn on death.",
            category: "your-cards",
            imageUrl: "/images/ragdoll-system.webp",
            composables: [
              { word: "ragdoll", label: "action" },
              { word: "death", label: "stat" },
            ],
          },
          {
            id: "aura-positioning",
            title: "Aura Positioning",
            oneLiner: "Make a thunder aura be on the players center.",
            category: "your-cards",
            imageUrl: "/images/aura-positioning.webp",
            composables: [
              { word: "thunder", label: "vibe" },
              { word: "aura", label: "object" },
            ],
          },
          {
            id: "interaction-system",
            title: "Prison Escape System",
            oneLiner:
              "Create a prison escape system where the player can interact with a gate to escape. when the player is near the gate, show an interaction prompt, and pressing the interaction key should open the gate and teleport the player to the 'EscapeZone' area.",
            category: "your-cards",
            imageUrl: "/images/interaction-system.webp",
            composables: [
              { word: "gate", label: "object" },
              { word: "escape", label: "action" },
            ],
          },
          {
            id: "inventory-system",
            title: "Inventory System",
            oneLiner: "Create a server-side inventory system.",
            category: "your-cards",
            imageUrl: "/images/inventory-system.webp",
            composables: [{ word: "inventory", label: "object" }],
          },
          {
            id: "house-purchase-system",
            title: "House Purchase System",
            oneLiner: "Hold 'E' near a plot to spawn a basic house.",
            category: "your-cards",
            imageUrl: "/images/house-purchase-system.webp",
            composables: [
              { word: "'E'", label: "key" },
              { word: "house", label: "object" },
            ],
          },
          {
            id: "suit-switching",
            title: "Suit Switching",
            oneLiner: "Press 'F' to swap between red and black suits.",
            category: "your-cards",
            imageUrl: "/images/suit-switching.webp",
            composables: [
              { word: "'F'", label: "key" },
              { word: "red", label: "vibe" },
              { word: "black", label: "vibe" },
            ],
          },
          {
            id: "flight-system",
            title: "Flight System",
            oneLiner: "Press 'f' to toggle flying and move in the air.",
            category: "your-cards",
            imageUrl: "/images/flight-system.webp",
            animated: !0,
            composables: [
              { word: "'f'", label: "key" },
              { word: "flying", label: "action" },
            ],
          },
          {
            id: "growth-mechanic",
            title: "Eat To Grow",
            oneLiner: "Click to eat and grow larger.",
            category: "your-cards",
            imageUrl: "/images/growth-mechanic.webp",
            composables: [
              { word: "Click", label: "action" },
              { word: "eat", label: "action" },
              { word: "grow", label: "action" },
            ],
          },
          {
            id: "conveyor-system",
            title: "Conveyor System",
            oneLiner: "Create a moving belt that carries parts.",
            category: "your-cards",
            imageUrl: "/images/conveyor-system.webp",
            composables: [
              { word: "belt", label: "object" },
              { word: "parts", label: "object" },
            ],
          },
          {
            id: "vehicle-spawner",
            title: "Vehicle Spawner",
            oneLiner: "Press 'E' to spawn a car.",
            category: "your-cards",
            imageUrl: "/images/vehicle-spawner.webp",
            composables: [
              { word: "'E'", label: "key" },
              { word: "car", label: "object" },
            ],
          },
          {
            id: "survival-stats",
            title: "Survival Stats",
            oneLiner: "Health and hunger bars that deplete over time.",
            category: "your-cards",
            imageUrl: "/images/survival-stats.webp",
            composables: [
              { word: "Health", label: "stat" },
              { word: "hunger", label: "stat" },
            ],
          },
          {
            id: "booth-claiming",
            title: "Booth Claiming",
            oneLiner: "Click a sign to claim a booth.",
            category: "your-cards",
            imageUrl: "/images/booth-claiming.webp",
            composables: [
              { word: "Click", label: "action" },
              { word: "sign", label: "object" },
              { word: "booth", label: "object" },
            ],
          },
          {
            id: "digging-mechanic",
            title: "Digging Mechanic",
            oneLiner: "Click a block/part to destroy it.",
            category: "your-cards",
            imageUrl: "/images/digging-mechanic.webp",
            animated: !0,
            composables: [
              { word: "Click", label: "action" },
              { word: "destroy", label: "action" },
            ],
          },
          {
            id: "case-spinner",
            title: "Case Spinner",
            oneLiner: "Create the scrolling ui animation for opening a case.",
            category: "your-cards",
            imageUrl: "/images/case-spinner.webp",
            composables: [{ word: "case", label: "object" }],
          },
          {
            id: "advanced-movement",
            title: "Advanced Movement",
            oneLiner: "WASD with bunny hopping and air-strafing.",
            category: "your-cards",
            imageUrl: "/images/advanced-movement.webp",
            composables: [
              { word: "bunny hopping", label: "action" },
              { word: "air-strafing", label: "action" },
            ],
          },
          {
            id: "data-saving-system",
            title: "Data Saving System",
            oneLiner: "Save and load player stats.",
            category: "your-cards",
            imageUrl: "/images/data-saving-system.webp",
            composables: [{ word: "stats", label: "stat" }],
          },
          {
            id: "spray-can",
            title: "Spray Can",
            oneLiner: "Tool Spray can system using pre-selected icons.",
            category: "your-cards",
            imageUrl: "/images/spray-can.webp",
            animated: !0,
            composables: [{ word: "icons", label: "object" }],
          },
          {
            id: "seating-system",
            title: "Seating System",
            oneLiner: "Click a chair to sit down.",
            category: "your-cards",
            imageUrl: "/images/seating-system.webp",
            animated: !0,
            composables: [
              { word: "Click", label: "action" },
              { word: "chair", label: "object" },
            ],
          },
          {
            id: "flappy-movement",
            title: "Flappy Movement",
            oneLiner: "Press space to flap jump and fall.",
            category: "your-cards",
            imageUrl: "/images/flappy-movement.webp",
            animated: !0,
            composables: [
              { word: "space", label: "key" },
              { word: "flap", label: "action" },
            ],
          },
          {
            id: "interactive-environment",
            title: "Interactive Environment",
            oneLiner: "Click buttons to toggle doors and lights.",
            category: "your-cards",
            imageUrl: "/images/interactive-environment.webp",
            composables: [
              { word: "Click", label: "action" },
              { word: "doors", label: "object" },
              { word: "lights", label: "object" },
            ],
          },
          {
            id: "swimming-particles",
            title: "Swimming Particles",
            oneLiner: "Add particles when swimming.",
            category: "your-cards",
            imageUrl: "/images/swimming-particles.webp",
            animated: !0,
            composables: [
              { word: "particles", label: "vibe" },
              { word: "swimming", label: "action" },
            ],
          },
        ],
        tC = ["round-system", "punching-mechanic", "lava-rising"];
      function tS(e, t, n) {
        if (!e) return !1;
        let r = e.getBoundingClientRect();
        return t >= r.left && t <= r.right && n >= r.top && n <= r.bottom;
      }
      let tA = [
        { value: "your-cards", label: "Main cards" },
        {
          value: "community",
          label: "Community",
          icon: (0, r.jsx)(tx.A, { className: "h-4 w-4" }),
        },
      ];
      function tP({
        open: e,
        handCardIds: t,
        cardsDisabled: n = !1,
        onClose: i,
        onSelectCard: l,
        selectionMode: d = "hand",
        dropTargetRef: c,
        onPlayOneLiner: u,
        onCardDropped: m,
        onHoldingChange: p,
        onDropTargetHoverChange: h,
        onOpenExplore: g,
      }) {
        let [x, f] = o.useState("your-cards"),
          [b, y] = o.useState(""),
          v = o.useRef(null),
          w = o.useRef(null),
          [j, k] = o.useState(!1),
          N = o.useCallback(
            (e) => {
              if (e.mystery && g) {
                (g(), i());
                return;
              }
              l(e);
            },
            [l, g, i],
          );
        o.useEffect(() => {
          e || (y(""), k(!1));
        }, [e]);
        let I = o.useCallback(() => {
            e && (k(!0), w.current?.focus());
          }, [e]),
          C = o.useMemo(() => {
            if ("your-cards" !== x) return [];
            let e = "hand" === d ? new Set(t) : null,
              n = b.trim().toLowerCase();
            return tI.filter(
              (t) =>
                !(t.category !== x || e?.has(t.id)) &&
                (!n ||
                  t.title.toLowerCase().includes(n) ||
                  t.oneLiner.toLowerCase().includes(n)),
            );
          }, [x, b, t, d]),
          S = (0, s.IT)(
            a.FH.likedPlaytestGifs.listForUser,
            e && "community" === x ? { limit: 60 } : "skip",
          ),
          A = o.useMemo(() => {
            if (!S) return S;
            let e = b.trim().toLowerCase();
            return S.filter((e) => null !== e.url).filter((t) => {
              if (!e) return !0;
              let n = (t.prompt ?? "").toLowerCase(),
                r = (t.usernamePromptOwner ?? "").toLowerCase();
              return n.includes(e) || r.includes(e);
            });
          }, [S, b]),
          P = (0, s.n_)(a.FH.likedPlaytestGifs.toggleLike),
          M = o.useRef(new Set()),
          _ = o.useCallback(
            (e) => {
              M.current.has(e) ||
                (M.current.add(e),
                P({ playtestGifId: e })
                  .catch((e) => {
                    console.warn("[CardInventory] unlike failed", e);
                  })
                  .finally(() => {
                    M.current.delete(e);
                  }));
            },
            [P],
          );
        return (0, r.jsx)(ew.N, {
          children:
            e &&
            (0, r.jsx)(ev.P.div, {
              initial: { opacity: 0, y: 8, scale: 0.98 },
              animate: { opacity: 1, y: 0, scale: 1 },
              exit: { opacity: 0, y: 8, scale: 0.98 },
              transition: { type: "spring", stiffness: 320, damping: 28 },
              onAnimationComplete: I,
              className: (0, es.cn)(
                "absolute left-0 bottom-[calc(100%+0.75rem)] z-50",
                "w-[clamp(280px,30vw,560px)] flex flex-col",
                "rounded-2xl border border-border/80 bg-background text-foreground shadow-floating dark:bg-neutral-900",
              ),
              children: (0, r.jsxs)("div", {
                className: "p-4 flex flex-col min-h-0 flex-1",
                children: [
                  (0, r.jsxs)("div", {
                    className: "flex items-center justify-between mb-4",
                    children: [
                      (0, r.jsx)("span", {
                        className: "font-medium text-body-lg text-foreground",
                        children: "Inventory",
                      }),
                      (0, r.jsx)("button", {
                        type: "button",
                        onClick: i,
                        className:
                          "text-muted-foreground hover:text-foreground",
                        "aria-label": "Close inventory",
                        children: (0, r.jsx)(eA.A, { className: "w-4 h-4" }),
                      }),
                    ],
                  }),
                  (0, r.jsxs)("div", {
                    className:
                      "flex flex-col gap-2 sm:flex-row sm:items-center",
                    children: [
                      (0, r.jsxs)("div", {
                        className: "relative flex-1",
                        children: [
                          (0, r.jsx)(tf.A, {
                            className:
                              "absolute left-2 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-black/40 dark:text-white/40",
                          }),
                          (0, r.jsx)(tv.p, {
                            ref: w,
                            value: b,
                            onChange: (e) => y(e.target.value),
                            placeholder: "Search cards...",
                            className:
                              "h-8 pl-7 text-caption bg-black/5 dark:bg-white/10 border-white/10",
                          }),
                        ],
                      }),
                      (0, r.jsx)("div", {
                        className: "flex gap-2 shrink-0",
                        children: tA.map((e) =>
                          (0, r.jsx)(
                            "button",
                            {
                              type: "button",
                              onClick: () => f(e.value),
                              "aria-label": e.label,
                              title: e.label,
                              className: (0, es.cn)(
                                "rounded-xl border text-body-lg font-medium transition-opacity whitespace-nowrap",
                                e.icon
                                  ? "flex h-9 w-9 items-center justify-center"
                                  : "px-4 py-1",
                                x === e.value
                                  ? "border-white/20 bg-white/10 text-foreground"
                                  : "border-white/10 text-muted-foreground hover:text-foreground hover:bg-white/5",
                              ),
                              children: e.icon ?? e.label,
                            },
                            e.value,
                          ),
                        ),
                      }),
                    ],
                  }),
                  (0, r.jsx)("div", {
                    ref: v,
                    className:
                      "mt-4 flex-1 min-h-0 max-h-[460px] overflow-y-auto custom-scrollbar -mx-1 px-1",
                    children:
                      "community" === x
                        ? void 0 === A
                          ? (0, r.jsx)("div", {
                              className:
                                "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4",
                              children: Array.from({ length: 8 }).map((e, t) =>
                                (0, r.jsx)(
                                  tw.E,
                                  {
                                    className:
                                      "aspect-5/7 w-full rounded-xl bg-white/5",
                                  },
                                  t,
                                ),
                              ),
                            })
                          : 0 === A.length
                            ? (0, r.jsx)("p", {
                                className:
                                  "py-8 text-center text-body text-muted-foreground",
                                children: b.trim()
                                  ? "No liked GIFs match."
                                  : "No liked GIFs yet. Tap the heart on a community card to save it here.",
                              })
                            : (0, r.jsx)("div", {
                                className:
                                  "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4",
                                children: A.map((e) => {
                                  let t = e.prompt?.trim() ?? "",
                                    a =
                                      t.length > 0
                                        ? {
                                            id: `community-gif:${e.playtestGifId}`,
                                            title:
                                              e.title?.trim() ||
                                              "Community GIF",
                                            oneLiner: t,
                                            category: "community",
                                            imageUrl: e.url,
                                          }
                                        : null;
                                  return (0, r.jsx)(
                                    tT,
                                    {
                                      playtestGifId: e.playtestGifId,
                                      url: e.url,
                                      title: e.title,
                                      prompt: e.prompt,
                                      usernamePromptOwner:
                                        e.usernamePromptOwner,
                                      onUnlike: _,
                                      card: a,
                                      cardsDisabled: n,
                                      onSelectCard: N,
                                      dragReady: j,
                                      dropTargetRef: c,
                                      onPlayOneLiner: u,
                                      onCardDropped: m,
                                      onHoldingChange: p,
                                      onDropTargetHoverChange: h,
                                      onCloseInventory: i,
                                    },
                                    e._id,
                                  );
                                }),
                              })
                        : 0 === C.length
                          ? (0, r.jsx)("p", {
                              className:
                                "py-8 text-center text-body text-muted-foreground",
                              children: "No cards match.",
                            })
                          : (0, r.jsx)("div", {
                              className:
                                "grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4",
                              children: C.map((e) =>
                                (0, r.jsx)(
                                  tM,
                                  {
                                    card: e,
                                    cardsDisabled: n,
                                    scrollRoot: v,
                                    dragReady: j,
                                    onSelect: N,
                                    dropTargetRef: c,
                                    onPlayOneLiner: u,
                                    onCardDropped: m,
                                    onHoldingChange: p,
                                    onDropTargetHoverChange: h,
                                    onCloseInventory: i,
                                    mysteryAsButton: !!g,
                                  },
                                  e.id,
                                ),
                              ),
                            }),
                  }),
                  (0, r.jsx)("p", {
                    className:
                      "mt-3 text-body text-muted-foreground text-center",
                    children:
                      "community" === x
                        ? "Hover a GIF and tap the heart to remove it."
                        : "prompt" === d
                          ? "Click a card to add its prompt."
                          : "Click a card to add it to your hand.",
                  }),
                ],
              }),
            }),
        });
      }
      let tM = o.memo(function ({
        card: e,
        cardsDisabled: t,
        scrollRoot: n,
        dragReady: a,
        onSelect: s,
        dropTargetRef: i,
        onPlayOneLiner: l,
        onCardDropped: d,
        onHoldingChange: c,
        onDropTargetHoverChange: u,
        onCloseInventory: m,
        mysteryAsButton: p = !1,
      }) {
        let h = o.useRef(null),
          [g, x] = o.useState(!1),
          [b, y] = o.useState(!1),
          [v, w] = o.useState(null),
          j = o.useRef({ x: 0, y: 0 }),
          k = (0, ey.d)(0),
          N = (0, ey.d)(0),
          I = o.useRef(!1);
        o.useEffect(() => {
          let e = h.current;
          if (!e) return;
          let t = new IntersectionObserver(([e]) => x(e.isIntersecting), {
            root: n.current ?? null,
            rootMargin: "400px 0px",
          });
          return (t.observe(e), () => t.disconnect());
        }, [n]);
        let C = o.useCallback(() => {
            s(e);
          }, [s, e]),
          S = a && !t && !!i,
          A = o.useCallback(
            (e, t) => {
              let n = h.current?.getBoundingClientRect();
              n &&
                ((j.current = { x: t.point.x - n.left, y: t.point.y - n.top }),
                w({ w: n.width, h: n.height }),
                k.set(n.left),
                N.set(n.top),
                y(!0),
                c?.(!0));
            },
            [k, N, c],
          ),
          P = o.useCallback(
            (e, t) => {
              (k.set(t.point.x - j.current.x), N.set(t.point.y - j.current.y));
              let n = tS(i?.current ?? null, t.point.x, t.point.y);
              I.current !== n && ((I.current = n), u?.(n));
            },
            [i, k, N, u],
          ),
          M = o.useCallback(
            (t, n) => {
              let r = tS(i?.current ?? null, n.point.x, n.point.y);
              ((I.current = !1),
                y(!1),
                w(null),
                c?.(!1),
                u?.(!1),
                r && (l?.(e.oneLiner, e), e.mystery || d?.(e), m?.()));
            },
            [e, i, d, m, u, c, l],
          ),
          _ =
            b && v && "undefined" != typeof document
              ? (0, f.createPortal)(
                  (0, r.jsx)(ev.P.div, {
                    className: "pointer-events-none fixed left-0 top-0 z-1000",
                    style: { x: k, y: N, width: v.w, height: v.h },
                    initial: { scale: 1, opacity: 0.95 },
                    animate: { scale: 1.04, opacity: 1 },
                    transition: { type: "spring", stiffness: 320, damping: 28 },
                    children: (0, r.jsx)(tN, { card: e, variant: "inventory" }),
                  }),
                  document.body,
                )
              : null;
        return (0, r.jsx)("div", {
          ref: h,
          className: "aspect-5/7 w-full",
          children: g
            ? S
              ? (0, r.jsxs)(r.Fragment, {
                  children: [
                    (0, r.jsx)(ev.P.div, {
                      className: "h-full w-full",
                      onPanStart: A,
                      onPan: P,
                      onPanEnd: M,
                      style: { cursor: b ? "grabbing" : "grab" },
                      children: (0, r.jsx)(tN, {
                        card: e,
                        variant: "inventory",
                        disabled: t,
                        mysteryAsButton: p,
                        onClick: C,
                      }),
                    }),
                    _,
                  ],
                })
              : (0, r.jsx)(tN, {
                  card: e,
                  variant: "inventory",
                  disabled: t,
                  mysteryAsButton: p,
                  onClick: C,
                })
            : (0, r.jsx)(tw.E, {
                className: "h-full w-full rounded-xl bg-white/10",
              }),
        });
      });
      function t_({
        url: e,
        alt: t,
        cleanTitle: n,
        showHeart: a,
        onHeartClick: s,
      }) {
        return (0, r.jsxs)("div", {
          className: "group relative h-full w-full overflow-hidden rounded-xl",
          style: {
            backgroundColor: "var(--color-neutral-700)",
            border: "4px solid rgba(1, 1, 1, 0.1)",
          },
          children: [
            (0, r.jsx)("img", {
              src: e,
              alt: t,
              loading: "lazy",
              decoding: "async",
              draggable: !1,
              className: "absolute inset-0 h-full w-full object-cover",
            }),
            n
              ? (0, r.jsxs)(r.Fragment, {
                  children: [
                    (0, r.jsx)(ty, {
                      className:
                        "pointer-events-none absolute bottom-0 left-0 right-0 top-[55%]",
                      direction: "bottom",
                      blurPx: 6,
                      layers: 4,
                    }),
                    (0, r.jsx)("div", {
                      className:
                        "pointer-events-none absolute bottom-0 left-0 right-0 px-2.5 py-2",
                      style: {
                        filter:
                          "drop-shadow(0 0 3px rgba(0,0,0,1)) drop-shadow(0 0 8px rgba(0,0,0,1))",
                      },
                      children: (0, r.jsx)("p", {
                        className:
                          "text-micro font-semibold leading-tight text-white",
                        children: n,
                      }),
                    }),
                  ],
                })
              : null,
            a
              ? (0, r.jsxs)("div", {
                  "aria-hidden": !1,
                  className:
                    "absolute inset-x-0 bottom-0 h-[35%] opacity-0 group-hover:opacity-100 transition-opacity duration-150",
                  children: [
                    (0, r.jsx)("div", {
                      className:
                        "absolute inset-0 bg-linear-to-t from-black/75 via-black/40 to-transparent",
                    }),
                    (0, r.jsx)("div", {
                      className:
                        "relative h-full flex items-end justify-end px-2 pb-2",
                      children: (0, r.jsx)("button", {
                        type: "button",
                        "aria-label": "Unlike",
                        onClick: s,
                        onPointerDown: (e) => e.stopPropagation(),
                        className: (0, es.cn)(
                          "flex items-center justify-center p-1.5 rounded-lg border",
                          "transition-[background-color,border-color,color,box-shadow] duration-150 motion-reduce:transition-none",
                          "border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/20",
                        ),
                        children: (0, r.jsx)(tb.A, {
                          className: "w-3.5 h-3.5",
                          fill: "currentColor",
                        }),
                      }),
                    }),
                  ],
                })
              : null,
          ],
        });
      }
      let tT = o.memo(function ({
          playtestGifId: e,
          url: t,
          title: n,
          prompt: a,
          usernamePromptOwner: s,
          onUnlike: i,
          card: l,
          onSelectCard: d,
          onCardDropped: c,
          cardsDisabled: u = !1,
          dragReady: m = !1,
          dropTargetRef: p,
          onPlayOneLiner: h,
          onHoldingChange: g,
          onDropTargetHoverChange: x,
          onCloseInventory: b,
        }) {
          let y = o.useRef(null),
            [v, w] = o.useState(!1),
            [j, k] = o.useState(null),
            N = o.useRef({ x: 0, y: 0 }),
            I = (0, ey.d)(0),
            C = (0, ey.d)(0),
            S = o.useRef(!1),
            A = o.useCallback(
              (t) => {
                (t.stopPropagation(), i(e));
              },
              [i, e],
            ),
            P = a ?? s ?? "Liked community GIF",
            M = n?.trim() ? n.trim() : null,
            _ = !u && null !== l,
            T = _ && m && !!p && !!h,
            R = o.useCallback(() => {
              l && (h?.(l.oneLiner, l), c?.(l), b?.());
            }, [l, h, c, b]),
            E = o.useCallback(() => {
              _ && l && d?.(l);
            }, [_, l, d]),
            $ = o.useCallback(
              (e, t) => {
                let n = y.current?.getBoundingClientRect();
                n &&
                  ((N.current = {
                    x: t.point.x - n.left,
                    y: t.point.y - n.top,
                  }),
                  k({ w: n.width, h: n.height }),
                  I.set(n.left),
                  C.set(n.top),
                  w(!0),
                  g?.(!0));
              },
              [I, C, g],
            ),
            L = o.useCallback(
              (e, t) => {
                (I.set(t.point.x - N.current.x),
                  C.set(t.point.y - N.current.y));
                let n = tS(p?.current ?? null, t.point.x, t.point.y);
                S.current !== n && ((S.current = n), x?.(n));
              },
              [p, I, C, x],
            ),
            F = o.useCallback(
              (e, t) => {
                let n = tS(p?.current ?? null, t.point.x, t.point.y);
                ((S.current = !1), w(!1), k(null), g?.(!1), x?.(!1), n && R());
              },
              [p, x, g, R],
            ),
            U =
              v && j && "undefined" != typeof document
                ? (0, f.createPortal)(
                    (0, r.jsx)(ev.P.div, {
                      className:
                        "pointer-events-none fixed left-0 top-0 z-1000",
                      style: { x: I, y: C, width: j.w, height: j.h },
                      initial: { scale: 1, opacity: 0.95 },
                      animate: { scale: 1.04, opacity: 1 },
                      transition: {
                        type: "spring",
                        stiffness: 320,
                        damping: 28,
                      },
                      children: (0, r.jsx)(t_, {
                        url: t,
                        alt: P,
                        cleanTitle: M,
                        showHeart: !1,
                      }),
                    }),
                    document.body,
                  )
                : null;
          return (0, r.jsx)("div", {
            ref: y,
            className: "aspect-5/7 w-full",
            children: T
              ? (0, r.jsxs)(r.Fragment, {
                  children: [
                    (0, r.jsx)(ev.P.div, {
                      className: "h-full w-full",
                      onPanStart: $,
                      onPan: L,
                      onPanEnd: F,
                      onTap: E,
                      style: { cursor: v ? "grabbing" : "grab" },
                      children: (0, r.jsx)(t_, {
                        url: t,
                        alt: P,
                        cleanTitle: M,
                        showHeart: !0,
                        onHeartClick: A,
                      }),
                    }),
                    U,
                  ],
                })
              : (0, r.jsx)("div", {
                  role: "button",
                  tabIndex: 0,
                  onClick: E,
                  className: "h-full w-full cursor-pointer",
                  children: (0, r.jsx)(t_, {
                    url: t,
                    alt: P,
                    cleanTitle: M,
                    showHeart: !0,
                    onHeartClick: A,
                  }),
                }),
          });
        }),
        tR = [
          { x: -23, y: 7, rotate: -12, zIndex: 1, scale: 0.94 },
          { x: 0, y: 0, rotate: 0, zIndex: 3, scale: 1 },
          { x: 23, y: 7, rotate: 12, zIndex: 1, scale: 0.94 },
        ],
        tE = [
          { x: -46, y: 8, rotate: -6, zIndex: 1, scale: 0.96 },
          { x: 0, y: -3, rotate: 0, zIndex: 4, scale: 1.04 },
          { x: 46, y: 8, rotate: 6, zIndex: 2, scale: 0.96 },
        ],
        t$ = { type: "spring", stiffness: 320, damping: 28, mass: 0.8 };
      function tL(e, t, n) {
        if (!e) return !1;
        let r = e.getBoundingClientRect();
        return t >= r.left && t <= r.right && n >= r.top && n <= r.bottom;
      }
      function tF({
        visuallyDimmed: e = !1,
        cardsDisabled: t = !1,
        inventoryButtonDisabled: n = !1,
        onPlayOneLiner: a,
        onCardFlipped: s,
        onCardDropped: i,
        dropTargetRef: l,
        onDropTargetHoverChange: d,
        onHoldingChange: c,
        handHighlighted: u = !1,
        collectiveHoverPreview: m = !1,
        cardsAreaRef: p,
        onOpenExplore: h,
        promotedCommunityCard: g = null,
        inventoryOnly: x = !1,
        openInventorySignal: f = 0,
        className: b,
      }) {
        let y = (0, tp.I)(),
          [v, w] = o.useState(tC),
          [j, k] = o.useState({}),
          N = o.useCallback((e) => j[e] ?? tI.find((t) => t.id === e), [j]),
          I = o.useRef(null),
          C = o.useRef(null),
          [S, A] = o.useState(null),
          [P, M] = o.useState(null),
          [_, T] = o.useState(!1),
          [R, E] = o.useState(null),
          [$, L] = o.useState(null),
          F = o.useRef(!1),
          U = o.useRef(null),
          [D, O] = o.useState(null),
          [z, H] = o.useState(null),
          q = o.useRef(null),
          J = o.useCallback(() => {
            null !== q.current &&
              (window.clearTimeout(q.current), (q.current = null));
          }, []);
        o.useEffect(() => {
          f > 0 && T(!0);
        }, [f]);
        let B = o.useCallback(
            (e) => {
              t ||
                (J(),
                (q.current = window.setTimeout(() => {
                  H(e);
                }, 1e3)));
            },
            [t, J],
          ),
          G = o.useCallback(() => {
            (J(), H(null));
          }, [J]);
        (o.useEffect(() => () => J(), [J]),
          o.useEffect(() => {
            if (g) {
              (w((e) =>
                e[1] === g.id
                  ? e
                  : (null === C.current && (I.current = e[1]),
                    [e[0], g.id, e[2]]),
              ),
                k((e) => (e[g.id] === g ? e : { ...e, [g.id]: g })),
                (C.current = g.id));
              return;
            }
            let e = C.current;
            e &&
              (w((t) => {
                if (t[1] !== e) return t;
                let n = I.current ?? tC[1];
                return [t[0], n, t[2]];
              }),
              A((t) => (t === e ? null : t)),
              M((t) => (t === e ? null : t)),
              (C.current = null),
              (I.current = null));
          }, [g]));
        let W = (0, ey.d)(0);
        o.useEffect(() => {
          n && T(!1);
        }, [n]);
        let V = o.useCallback(() => T(!1), []);
        (o.useEffect(() => {
          t &&
            (A(null),
            M(null),
            E(null),
            L(null),
            H(null),
            (F.current = !1),
            d?.(!1));
        }, [t, d]),
          o.useEffect(() => {
            if (!_ && !S) return;
            let e = (e) => {
              let t = U.current;
              t &&
                !t.contains(e.target) &&
                (_ && T(!1), S && (A(null), M(null)));
            };
            return (
              document.addEventListener("mousedown", e),
              () => document.removeEventListener("mousedown", e)
            );
          }, [_, S]),
          o.useEffect(() => {
            if (!S || $ || y) return void W.set(0);
            let e = 0,
              t = performance.now(),
              n = (r) => {
                let a = ((r - t) / 1e3 / 2.4) * Math.PI * 2;
                (W.set(-5 * (0.5 - 0.5 * Math.cos(a))),
                  (e = requestAnimationFrame(n)));
              };
            return (
              (e = requestAnimationFrame(n)),
              () => cancelAnimationFrame(e)
            );
          }, [S, $, y, W]));
        let K = o.useMemo(() => {
            if (!S) return null;
            let e = v.findIndex((e) => e === S);
            return e >= 0 ? e : null;
          }, [S, v]),
          Q = o.useCallback(
            (e, n) => {
              if (t || $) return;
              let r = S === e,
                a = P === e;
              r ? (a ? (A(null), M(null)) : M(e)) : (A(e), M(e));
              let i = N(e);
              if ((!r || !a) && i && (i.mystery || s?.(i), n && l?.current)) {
                let e = n.getBoundingClientRect(),
                  t = l.current.getBoundingClientRect();
                O({
                  x1: e.left + e.width / 2,
                  y1: e.top + e.height / 2,
                  x2: t.left + t.width / 2,
                  y2: t.top + 14,
                  imageUrl: i.imageUrl,
                  key: Date.now(),
                });
              }
            },
            [t, $, S, P, l, s, N],
          );
        o.useEffect(() => {
          if (!D) return;
          let e = window.setTimeout(() => O(null), 2300);
          return () => window.clearTimeout(e);
        }, [D]);
        let Y = o.useCallback(
            (e) => {
              if (!t && !e.mystery) {
                if (x) {
                  (a(e.oneLiner, e), s?.(e), T(!1));
                  return;
                }
                if ("community" === e.category) {
                  (k((t) => ({ ...t, [e.id]: e })),
                    w((t) => (t[1] === e.id ? t : [t[0], e.id, t[2]])),
                    A(e.id),
                    M(null),
                    T(!1));
                  return;
                }
                (w((t) => {
                  if (t.includes(e.id)) return t;
                  let n = [...t];
                  return ((n[null !== K ? K : 1] = e.id), n);
                }),
                  A(e.id),
                  M(null),
                  T(!1));
              }
            },
            [t, x, s, a, K],
          ),
          Z = o.useCallback(
            (e, t) => {
              let n = tL(l?.current ?? null, t.point.x, t.point.y);
              F.current !== n && ((F.current = n), d?.(n));
            },
            [l, d],
          ),
          X = o.useCallback(
            (e) => (t, n) => {
              let r = tL(l?.current ?? null, n.point.x, n.point.y);
              if (((F.current = !1), L(null), d?.(!1), A(null), M(null), !r))
                return;
              let s = N(e);
              s && (a(s.oneLiner, s), s.mystery || i?.(s));
            },
            [l, a, d, i, N],
          ),
          ee = 1 === K,
          et = !t && ((null !== R && 1 === v.indexOf(R)) || m);
        return (0, r.jsxs)("div", {
          ref: U,
          className: (0, es.cn)(
            "relative z-40 flex flex-col items-center justify-end",
            x ? "absolute bottom-0 left-0 h-0 w-0" : "w-[151px] shrink-0",
            e && "opacity-70",
            b,
          ),
          children: [
            !x &&
              (0, r.jsx)(ev.P.div, {
                style: { marginBottom: 6 },
                animate: { y: ee ? -12 : et && !S ? -10 : 0 },
                transition: t$,
                children: (0, r.jsx)(ev.P.div, {
                  className: "flex items-center gap-1",
                  style: ee ? { y: W } : void 0,
                  children: (0, r.jsxs)("button", {
                    type: "button",
                    onClick: () => T((e) => !e),
                    disabled: n,
                    className: (0, es.cn)(
                      "flex items-center gap-1.5 rounded-lg border border-border bg-secondary px-2.5 py-1 md:py-1.5",
                      "text-caption font-medium text-secondary-foreground md:text-compact-body",
                      "transition-colors hover:bg-secondary-hover",
                      "focus:outline-hidden focus:ring-3 focus:ring-ring/20",
                      "disabled:cursor-not-allowed disabled:opacity-70",
                    ),
                    "aria-label": "Open inventory",
                    "aria-expanded": _,
                    children: [
                      (0, r.jsx)(eT.A, { className: "h-3.5 w-3.5 shrink-0" }),
                      (0, r.jsx)("span", {
                        className: "truncate",
                        children: "Inventory",
                      }),
                    ],
                  }),
                }),
              }),
            (0, r.jsx)(tP, {
              open: _,
              handCardIds: v,
              cardsDisabled: t,
              onClose: V,
              onSelectCard: Y,
              selectionMode: x ? "prompt" : "hand",
              dropTargetRef: l,
              onPlayOneLiner: a,
              onCardDropped: i,
              onHoldingChange: c,
              onDropTargetHoverChange: d,
              onOpenExplore: h,
            }),
            !x &&
              (0, r.jsx)(ew.N, {
                children: D && (0, r.jsx)(tO, { arc: D }, D.key),
              }),
            !x &&
              (0, r.jsx)("div", {
                ref: p,
                "data-deck-hand-target": "",
                className: "relative h-[162px] w-[151px]",
                children: v.map((e, n) => {
                  let a = N(e);
                  if (!a) return null;
                  let s = S === e,
                    i = R === e && !s && !t,
                    o = $ === e,
                    l = m && 1 === n && !s && !o && !t,
                    d = i || l,
                    p = !l && P === e,
                    h = s && !o ? tE[n] : tR[n],
                    g = 0 === h.rotate ? 0 : Math.sign(h.rotate),
                    x = d ? 108 * g * 0.3 : 0,
                    f = h.x + x,
                    b = h.y + (d ? -4 : 0),
                    y = s ? 0 : h.rotate,
                    v = !u || s || d || o ? h.scale : 1.03 * h.scale,
                    w = s ? 1.08 * h.scale : d ? 1.05 * h.scale : v;
                  return (0, r.jsx)(
                    tD,
                    {
                      slotIndex: n,
                      card: a,
                      slot: h,
                      targetX: f,
                      targetY: b,
                      targetRot: y,
                      targetScale: w,
                      isSelected: s,
                      isFlipped: p,
                      isHovered: d,
                      isDragging: o,
                      isHeld: z === e,
                      isHandHighlighted: u && !s && !o,
                      disabled: t,
                      floatY: W,
                      onHoverStart: () => E(e),
                      onHoverEnd: () => E((t) => (t === e ? null : t)),
                      onClick: (t) => Q(e, t.currentTarget),
                      onPointerDown: () => B(e),
                      onPointerRelease: G,
                      onClose: () => {
                        (A(null), M(null));
                      },
                      onDragStart: () => {
                        (A(e), M(e), L(e), J(), H(e), c?.(!0));
                      },
                      onDrag: Z,
                      onDragEnd: (t, n) => {
                        (X(e)(t, n), H(null), c?.(!1));
                      },
                    },
                    e,
                  );
                }),
              }),
          ],
        });
      }
      let tU = [3.6, 4.2, 3.9];
      function tD({
        slotIndex: e,
        card: t,
        slot: n,
        targetX: a,
        targetY: s,
        targetRot: i,
        targetScale: o,
        isSelected: l,
        isFlipped: d,
        isHovered: c,
        isDragging: u,
        isHeld: m,
        isHandHighlighted: p,
        disabled: h,
        floatY: g,
        onHoverStart: x,
        onHoverEnd: f,
        onClick: b,
        onPointerDown: y,
        onPointerRelease: v,
        onClose: w,
        onDragStart: j,
        onDrag: k,
        onDragEnd: N,
      }) {
        let I = (0, th.G)(g, (e) => (l ? e : 0));
        return (0, r.jsx)(ev.P.div, {
          className: "absolute left-1/2 top-1/2",
          style: {
            marginLeft: -54,
            marginTop: -76,
            zIndex: u ? 100 : l ? 20 : c ? 10 : n.zIndex,
          },
          initial: { x: n.x, y: n.y },
          animate: { x: a, y: s },
          transition: t$,
          onHoverStart: x,
          onHoverEnd: f,
          children: (0, r.jsx)(ev.P.div, {
            drag: !h,
            dragMomentum: !1,
            dragElastic: 0.12,
            dragSnapToOrigin: !0,
            whileDrag: { scale: 1.05 * o },
            onDragStart: j,
            onDrag: k,
            onDragEnd: N,
            initial: { rotate: n.rotate, scale: n.scale },
            animate: { rotate: i, scale: o },
            transition: t$,
            children: (0, r.jsx)(ev.P.div, {
              animate: l || u ? { y: 0 } : { y: [0, -0] },
              transition:
                l || u
                  ? { duration: 0.3, ease: "easeOut" }
                  : {
                      duration: tU[e],
                      repeat: 1 / 0,
                      repeatType: "reverse",
                      ease: "easeInOut",
                    },
              children: (0, r.jsxs)(ev.P.div, {
                style: { y: I },
                className: "relative",
                children: [
                  (0, r.jsx)(tN, {
                    card: t,
                    variant: "hand",
                    isSelected: l,
                    isFlipped: d,
                    isHovered: c,
                    isHeld: m,
                    isHandHighlighted: p,
                    disabled: h,
                    onClick: b,
                    onPointerDown: y,
                    onPointerUp: v,
                    onPointerLeave: v,
                  }),
                  (0, r.jsx)(ew.N, {
                    children:
                      d &&
                      !u &&
                      (0, r.jsx)(
                        ev.P.button,
                        {
                          type: "button",
                          initial: { opacity: 0, scale: 0.6 },
                          animate: {
                            opacity: 1,
                            scale: 1,
                            transition: {
                              delay: 0.7,
                              type: "spring",
                              stiffness: 340,
                              damping: 24,
                            },
                          },
                          exit: {
                            opacity: 0,
                            scale: 0.6,
                            transition: { duration: 0.15 },
                          },
                          onPointerDown: (e) => e.stopPropagation(),
                          onClick: (e) => {
                            (e.stopPropagation(), w());
                          },
                          className: (0, es.cn)(
                            "absolute z-10 flex h-6 w-6 items-center justify-center rounded-full",
                            "-top-2 -right-2",
                            "ring-1 ring-white/10 bg-white/5",
                            "text-muted-foreground hover:bg-white/10 hover:text-foreground",
                            "transition-colors shadow-md",
                          ),
                          "aria-label": "Deselect card",
                          children: (0, r.jsx)(eA.A, { className: "h-3 w-3" }),
                        },
                        "card-close",
                      ),
                  }),
                ],
              }),
            }),
          }),
        });
      }
      function tO({ arc: e }) {
        let { x1: t, y1: n, x2: a, y2: s, imageUrl: i } = e,
          l = (t + a) / 2,
          d = Math.min(n, s) - 190,
          c = o.useMemo(
            () =>
              Array.from({ length: 7 }, (e, r) => {
                let i = (r + 2) / 8;
                return {
                  t: i,
                  ...((e) => {
                    let r = 1 - e;
                    return {
                      x: r * r * t + 2 * r * e * l + e * e * a,
                      y: r * r * n + 2 * r * e * d + e * e * s,
                    };
                  })(i),
                };
              }),
            [t, n, a, s, l, d],
          );
        return (0, r.jsxs)(ev.P.div, {
          "aria-hidden": !0,
          className: "pointer-events-none fixed inset-0 z-200",
          initial: { opacity: 0 },
          animate: { opacity: 1 },
          exit: { opacity: 0 },
          transition: { duration: 0.15 },
          children: [
            c.map((e, t) => {
              let n = 1 - 0.6 * e.t;
              return (0, r.jsx)(
                ev.P.div,
                {
                  className: "absolute",
                  style: {
                    left: e.x,
                    top: e.y,
                    transform: "translate(-50%, -50%)",
                    width: 108 * n,
                    height: 151 * n,
                  },
                  initial: { opacity: 0 },
                  animate: { opacity: [0, 0.7, 0.7, 0] },
                  transition: {
                    duration: 1.68,
                    times: [0, 0.25, 0.75, 1],
                    delay: 0.066 * t,
                    ease: "easeOut",
                  },
                  children: (0, r.jsx)("img", {
                    src: i,
                    alt: "",
                    "aria-hidden": !0,
                    draggable: !1,
                    className:
                      "h-full w-full object-cover rounded-xl shadow-lg",
                    style: {
                      border: "2px solid rgba(255,255,255,0.2)",
                      filter: "grayscale(100%)",
                    },
                  }),
                },
                t,
              );
            }),
            [0, 2, 4, 6].map((e, t) => {
              let n = c[e];
              if (!n) return null;
              let a = 1 - 0.6 * n.t,
                s = 151 * a,
                i = n.y - 0.5 * s - 0.25 * s,
                o = n.x - 108 * a * 0.2;
              return (0, r.jsx)(
                ev.P.div,
                {
                  className:
                    "absolute flex items-center justify-center text-white drop-shadow-sm",
                  style: {
                    left: o,
                    top: i,
                    width: 24,
                    height: 24,
                    transform: "translate(calc(-50% - 3px), -50%)",
                  },
                  initial: { opacity: 0, scale: 0.5 },
                  animate: {
                    opacity: [0, 0.7, 0.7, 0],
                    scale: [0.5, 1, 1, 0.7],
                  },
                  transition: {
                    duration: 1.4,
                    times: [0, 0.25, 0.75, 1],
                    delay: 0.066 * e + 0.08 + 0.03 * t,
                    ease: "easeOut",
                  },
                  children: (0, r.jsx)(tg.A, { className: "h-5 w-5" }),
                },
                `hand-${e}`,
              );
            }),
          ],
        });
      }
      function tz({
        children: e,
        duration: t = 0.5,
        stagger: n = 0.08,
        blurAmount: a = 6,
        yOffset: s = 8,
        className: i,
        style: l,
        onAnimationComplete: d,
      }) {
        let c = (0, tp.I)(),
          u = e.split(/(\s+)/).filter(Boolean),
          m = u.filter((e) => !/^\s+$/.test(e)).length,
          p = 0;
        return (0, r.jsx)("span", {
          className: i,
          style: l,
          children: u.map((e, i) => {
            if (/^\s+$/.test(e))
              return (0, r.jsx)(o.Fragment, { children: e }, `space-${i}`);
            let l = p++;
            return (0, r.jsx)(
              ev.P.span,
              {
                animate: { opacity: 1, y: 0, filter: "blur(0px)" },
                className: "inline-block",
                initial: !c && { opacity: 0, y: s, filter: `blur(${a}px)` },
                onAnimationComplete: l === m - 1 ? d : void 0,
                transition: {
                  delay: c ? 0 : l * n,
                  duration: c ? 0 : t,
                  ease: [0.16, 1, 0.3, 1],
                },
                children: e,
              },
              `${e}-${i}`,
            );
          }),
        });
      }
      var tH = n(7364);
      let tq = [
          "image/jpeg",
          "image/jpg",
          "image/png",
          "image/gif",
          "image/webp",
        ],
        tJ = o.memo(
          ({
            input: e,
            setInput: t,
            isGenerating: n,
            canStopGeneration: i = !1,
            newAgentSessionId: l,
            promptQueueEnabled: d = !1,
            queuedPrompts: c = [],
            queueSlotOccupied: m = c.length > 0,
            queueAtCapacity: p = !1,
            queueContextBlockedByParent: h = !1,
            onQueuePrompt: g,
            onEditQueuedPrompt: x,
            onCancelQueuedPrompt: b,
            onSendQueuedPromptNow: y,
            retryablePrompt: v,
            retryablePromptCount: w = 0,
            onRestoreRetryablePrompt: C,
            onDismissRetryablePrompt: S,
            generatingLabel: A,
            handleSend: P,
            textareaRef: M,
            controlsDisabled: _,
            adjustHeight: T,
            activeFileName: R,
            contextTabs: E,
            onRemoveTab: F,
            isContextExpanded: U,
            onToggleExpand: D,
            addContextTab: H,
            handleStopGeneration: q,
            onImageUpload: J,
            editorRef: B,
            lastCopiedRangeRef: G,
            chatId: W,
            isRestoring: V,
            canContinue: K,
            onContinue: Q,
            continueBillsUiModel: Y = !1,
            isPro: X = !1,
            highlighted: ee,
            pluginConnected: et = !0,
            pluginDisconnected: en = !1,
            pluginConnectionLoading: er = !1,
            onOpenPluginConnectionModal: ei,
            disabledPlaceholder: eo,
            internalLimitReached: el = !1,
            showPluginConnectionPrompt: ed = !1,
            projectId: ec,
            onOpenRateLimitModal: eu,
            onOpenStorePurchases: em,
            selectedModel: ep,
            onModelChange: eh,
            creditsRemaining: eg,
            availabilityOverrides: ex,
            discountBadgeHiddenOverrides: ek,
            onOpenUIBuilder: eN,
            selectedUI: eS,
            onSelectUI: eA,
            showDeckHand: eP = !1,
            showCardsInventory: eM = !1,
            compact: e_ = !1,
            promptIndexInProject: eT,
            onOpenExplore: eR,
            promotedCommunityCard: eE,
            aboveInputSlot: e$,
            minimumCreditExemptModelIds: eL,
            canAccessRestrictedModels: eF,
            codexOnlyModelAccess: eU,
            audioInputEnabled: eD = !1,
            taggedMechanics: eO = [],
            onRemoveTaggedMechanic: ez,
            unifiedComposer: eH = !1,
            themePickerSlot: eq,
            showCreditControl: eJ = !0,
            composerPopover: eB,
            onComposerPopoverChange: eG,
          }) => {
            let [eW, eV] = (0, o.useState)(0),
              eK = o.useId(),
              eQ = d ? c[0] : void 0,
              [eY, eZ] = (0, o.useState)(!1),
              [eX, e0] = (0, o.useState)(!1),
              [e1, e5] = (0, o.useState)(!1),
              e4 = (0, ey.d)(0),
              e3 = (0, ey.d)(0),
              [e6, e8] = (0, o.useState)(!1),
              e7 = (0, o.useRef)(0),
              { getToken: e9 } = (0, u.d)(),
              te = (0, I.Ge)(ep),
              tt = E.some((e) => "image" === e.type),
              tn = eS ? "ui-task" : tt ? "image" : void 0,
              tr = o.useCallback(() => {
                N.oR.error((0, I.$G)(ep));
              }, [ep]),
              ta = o.useCallback(() => {
                if (n)
                  return void N.oR.info(
                    "Add images after the current build finishes.",
                  );
                tr();
              }, [n, tr]),
              ti = async (e) => {
                if (e.size > 0xa00000)
                  throw Error("File size exceeds 10MB limit");
                let t = document.createElement("canvas"),
                  n = t.getContext("2d"),
                  r = new Image();
                return new Promise((a, s) => {
                  ((r.onload = () => {
                    let s = e.size > 2097152 ? 1024 : 512,
                      { width: i, height: o } = r;
                    (i > o
                      ? i > s && ((o = (o * s) / i), (i = s))
                      : o > s && ((i = (i * s) / o), (o = s)),
                      (t.width = i),
                      (t.height = o),
                      n.drawImage(r, 0, 0, i, o));
                    let l =
                        e.size > 5242880 ? 0.5 : e.size > 2097152 ? 0.6 : 0.7,
                      d = t.toDataURL("image/jpeg", l);
                    (URL.revokeObjectURL(r.src), a(d));
                  }),
                    (r.onerror = () => {
                      (URL.revokeObjectURL(r.src),
                        s(Error("Failed to load image")));
                    }),
                    (r.src = URL.createObjectURL(e)));
                });
              },
              tc = async (e) => {
                if (!te) return void tr();
                if (!tq.includes(e.type))
                  return void console.error(
                    `[ChatInput] Invalid file type: ${e.type}`,
                  );
                if (e.size > 0xa00000)
                  return void console.error(
                    `[ChatInput] File too large: ${e.size}`,
                  );
                let t = await ti(e);
                (H(
                  "image",
                  `Image ${new Date().toLocaleTimeString("en-US", { hour12: !0, hour: "2-digit", minute: "2-digit" }).replace(/(\d{2}):(\d{2})/, "$1:$2")}`,
                  t,
                  void 0,
                  e.name,
                  !0,
                ),
                  J && J(e),
                  M.current?.focus());
              },
              tp = async (e) => {
                if (
                  (e.preventDefault(),
                  e.stopPropagation(),
                  (e7.current = 0),
                  e0(!1),
                  !_ && !n && et)
                )
                  for (let t of Array.from(e.dataTransfer.files).filter((e) =>
                    tq.includes(e.type),
                  ))
                    await tc(t);
              },
              {
                mentionState: th,
                popupPosition: tg,
                mentionedFiles: tx,
                handleTextChange: tf,
                handleKeyDown: tb,
                selectFile: ty,
                removeMentionedFile: tv,
                closeMentionPopup: tw,
              } = (function ({
                projectId: e,
                textareaRef: t,
                applyText: n,
                getConvexToken: r,
              }) {
                let [s, i] = (0, k.J0)({
                    isActive: !1,
                    query: "",
                    startIndex: -1,
                    files: [],
                    selectedIndex: 0,
                    isLoading: !1,
                  }),
                  [o, l] = (0, k.J0)(null),
                  [d, c] = (0, k.J0)([]),
                  u = (0, k.li)(null),
                  m = "true" === eI.env.NEXT_PUBLIC_LOCAL_DEV_MODE,
                  p = eI.env.LOCAL_AGENT_URL || "http://localhost:8080",
                  h = (0, k.li)(async (t) => {
                    i((e) => ({ ...e, isLoading: !0 }));
                    try {
                      if (m) {
                        let e = `${p}/v1/files/search?query=${encodeURIComponent(t)}&limit=12&includeContent=false`,
                          n = await fetch(e);
                        if (!n.ok)
                          throw Error(`Local VM search failed: ${n.status}`);
                        let r = await n.json();
                        i((e) => ({
                          ...e,
                          files: r.files,
                          isLoading: !1,
                          selectedIndex: 0,
                        }));
                        return;
                      }
                      let n = await r();
                      if (!n) {
                        (console.warn(
                          "[useFileMention] No auth token available",
                        ),
                          i((e) => ({ ...e, files: [], isLoading: !1 })));
                        return;
                      }
                      let s = new j.ConvexHttpClient(
                        "https://beaming-hawk-976.convex.cloud",
                      );
                      s.setAuth(n);
                      let o = await s.action(a.FH.filesSearch.search, {
                        projectId: e,
                        query: t,
                        limit: 12,
                        includeContent: !1,
                      });
                      i((e) => ({
                        ...e,
                        files: o.files,
                        isLoading: !1,
                        selectedIndex: 0,
                      }));
                    } catch (e) {
                      (console.error("[useFileMention] Search failed:", e),
                        i((e) => ({ ...e, files: [], isLoading: !1 })));
                    }
                  });
                (0, k.vJ)(() => {
                  h.current = async (t) => {
                    i((e) => ({ ...e, isLoading: !0 }));
                    try {
                      if (m) {
                        let e = `${p}/v1/files/search?query=${encodeURIComponent(t)}&limit=12&includeContent=false`,
                          n = await fetch(e);
                        if (!n.ok)
                          throw Error(`Local VM search failed: ${n.status}`);
                        let r = await n.json();
                        i((e) => ({
                          ...e,
                          files: r.files,
                          isLoading: !1,
                          selectedIndex: 0,
                        }));
                        return;
                      }
                      let n = await r();
                      if (!n) {
                        (console.warn(
                          "[useFileMention] No auth token available",
                        ),
                          i((e) => ({ ...e, files: [], isLoading: !1 })));
                        return;
                      }
                      let s = new j.ConvexHttpClient(
                        "https://beaming-hawk-976.convex.cloud",
                      );
                      s.setAuth(n);
                      let o = await s.action(a.FH.filesSearch.search, {
                        projectId: e,
                        query: t,
                        limit: 12,
                        includeContent: !1,
                      });
                      i((e) => ({
                        ...e,
                        files: o.files,
                        isLoading: !1,
                        selectedIndex: 0,
                      }));
                    } catch (e) {
                      (console.error("[useFileMention] Search failed:", e),
                        i((e) => ({ ...e, files: [], isLoading: !1 })));
                    }
                  };
                }, [e, r, m, p]);
                let g = (0, k.hb)(() => {
                    let e = t.current;
                    if (!e) return null;
                    let n = e.parentElement;
                    for (; n && !n.hasAttribute("data-chat-input-container");)
                      n = n.parentElement;
                    if (!n) return null;
                    let r = n.getBoundingClientRect(),
                      a = n.parentElement;
                    for (; a && !a.hasAttribute("data-mention-popup-anchor");)
                      a = a.parentElement;
                    if (!a) return null;
                    let s = a.getBoundingClientRect();
                    return {
                      bottom: s.bottom - r.top + 8,
                      left: r.left - s.left,
                    };
                  }, [t]),
                  x = (0, k.hb)(
                    (e) => {
                      let n = t.current;
                      if (!n) return;
                      let r = n.selectionStart,
                        a = e.substring(0, r),
                        s = a.lastIndexOf("@");
                      if (-1 === s) {
                        (i((e) => ({ ...e, isActive: !1 })), l(null));
                        return;
                      }
                      let o = a.substring(s + 1);
                      if (o.includes(" ")) {
                        (i((e) => ({ ...e, isActive: !1 })), l(null));
                        return;
                      }
                      let d = s > 0 ? e[s - 1] : " ";
                      if (" " !== d && "\n" !== d && 0 !== s) {
                        (i((e) => ({ ...e, isActive: !1 })), l(null));
                        return;
                      }
                      let c = g();
                      (i((e) => {
                        let t = !e.isActive;
                        return {
                          ...e,
                          isActive: !0,
                          query: o,
                          startIndex: s,
                          files: t ? [] : e.files,
                          isLoading: !!t || e.isLoading,
                          selectedIndex: t ? 0 : e.selectedIndex,
                        };
                      }),
                        l(c),
                        u.current && clearTimeout(u.current),
                        (u.current = setTimeout(
                          () => {
                            h.current(o);
                          },
                          0 === o.trim().length ? 800 : 500,
                        )));
                    },
                    [t, g],
                  ),
                  f = (0, k.hb)(
                    (e) => {
                      let r = t.current;
                      if (!r)
                        return void console.warn(
                          "[useFileMention] selectFile: textarea ref is null",
                        );
                      let a = r.value,
                        { startIndex: o } = s,
                        d = r.selectionStart,
                        u = a.substring(0, o),
                        m = a.substring(d),
                        p = `@${e.name}`,
                        h = `${u}${p} ${m}`;
                      ((r.value = h), n(h));
                      let g = o + p.length + 1;
                      r.setSelectionRange(g, g);
                      let x = new Event("input", { bubbles: !0 }),
                        f = new Event("change", { bubbles: !0 });
                      (r.dispatchEvent(x),
                        r.dispatchEvent(f),
                        c((t) =>
                          t.some((e) => e.mentionText === p)
                            ? t
                            : [...t, { file: e, mentionText: p }],
                        ),
                        i((e) => ({ ...e, isActive: !1 })),
                        l(null),
                        r.focus());
                    },
                    [t, s, n],
                  ),
                  b = (0, k.hb)(
                    (e) => {
                      if (!s.isActive || 0 === s.files.length) return !1;
                      if ("ArrowDown" === e.key)
                        return (
                          e.preventDefault(),
                          i((e) => ({
                            ...e,
                            selectedIndex: Math.min(
                              e.selectedIndex + 1,
                              e.files.length - 1,
                            ),
                          })),
                          !0
                        );
                      if ("ArrowUp" === e.key)
                        return (
                          e.preventDefault(),
                          i((e) => ({
                            ...e,
                            selectedIndex: Math.max(e.selectedIndex - 1, 0),
                          })),
                          !0
                        );
                      if ("Enter" === e.key && !e.shiftKey) {
                        e.preventDefault();
                        let t = s.files[s.selectedIndex];
                        return (t && f(t), !0);
                      }
                      return (
                        "Escape" === e.key &&
                        (e.preventDefault(),
                        i((e) => ({ ...e, isActive: !1 })),
                        l(null),
                        !0)
                      );
                    },
                    [s, f],
                  ),
                  y = (0, k.hb)((e) => {
                    c((t) => t.filter((t) => t.mentionText !== e));
                  }, []),
                  v = (0, k.hb)(() => {
                    (i((e) => ({ ...e, isActive: !1 })), l(null));
                  }, []);
                return (
                  (0, k.vJ)(
                    () => () => {
                      u.current && clearTimeout(u.current);
                    },
                    [],
                  ),
                  {
                    mentionState: s,
                    popupPosition: o,
                    mentionedFiles: d,
                    handleTextChange: x,
                    handleKeyDown: b,
                    selectFile: f,
                    removeMentionedFile: y,
                    closeMentionPopup: v,
                  }
                );
              })({
                projectId: ec,
                textareaRef: M,
                applyText: (e) => t(e),
                getConvexToken: async () => {
                  try {
                    return await e9({ template: "convex" });
                  } catch (e) {
                    return (
                      console.error(
                        "[ChatInput] Failed to get Convex token:",
                        e,
                      ),
                      null
                    );
                  }
                },
              }),
              tj = th.isActive && null !== tg,
              tk = th.files[th.selectedIndex],
              tN = tj && !th.isLoading && tk ? tl(eK, tk.uniqueId) : void 0,
              tI = (e) => {
                P(e, tx);
              },
              tC = !!(
                h ||
                eS ||
                E.length > 0 ||
                tx.length > 0 ||
                eO.some((t) => e.includes(t.mentionText))
              ),
              tS = () => {
                d && g?.(tC);
              },
              { handleKeyDown: tA, handlePaste: tP } = (({
                input: e,
                isGenerating: t,
                hasQueuedPrompts: n = !1,
                queueAtCapacity: r = !1,
                promptQueueEnabled: a = !1,
                hasUnsupportedQueueContext: s = !1,
                controlsDisabled: i,
                emptyDraft: o = "",
                handleSend: l,
                handleQueuePrompt: d,
                contextTabs: c,
                onRemoveTab: u,
                addContextTab: m,
                editorRef: p,
                lastCopiedRangeRef: h,
                activeFileName: g,
                canAttachImages: x = !0,
                onImageAttachRejected: f,
              }) => {
                let b = async (e) => {
                  if (e.size > 0xa00000)
                    throw Error("File size exceeds 10MB limit");
                  let t = document.createElement("canvas"),
                    n = t.getContext("2d"),
                    r = new Image();
                  return new Promise((a, s) => {
                    ((r.onload = async () => {
                      let s = e.size > 2097152 ? 1024 : 512,
                        { width: i, height: o } = r;
                      (i > o
                        ? i > s && ((o = (o * s) / i), (i = s))
                        : o > s && ((i = (i * s) / o), (o = s)),
                        (t.width = i),
                        (t.height = o),
                        n.drawImage(r, 0, 0, i, o));
                      let l =
                        e.size > 5242880 ? 0.5 : e.size > 2097152 ? 0.6 : 0.7;
                      a(t.toDataURL("image/jpeg", l));
                    }),
                      (r.onerror = () => s(Error("Failed to load image"))),
                      (r.src = URL.createObjectURL(e)));
                  });
                };
                return {
                  handleKeyDown: (m) => {
                    if ("Enter" === m.key) {
                      if (
                        !m.shiftKey &&
                        d &&
                        L({
                          input: e,
                          controlsDisabled: i,
                          isGenerating: t,
                          hasQueuedPrompts: n,
                          queueAtCapacity: r,
                          promptQueueEnabled: a,
                          hasUnsupportedContext: s,
                          emptyDraft: o,
                        })
                      ) {
                        (m.preventDefault(), d());
                        return;
                      }
                      m.ctrlKey
                        ? !n &&
                          $({
                            input: e,
                            controlsDisabled: i,
                            isGenerating: t,
                            emptyDraft: o,
                          }) &&
                          (m.preventDefault(), l(!0))
                        : !m.shiftKey &&
                          !n &&
                          $({
                            input: e,
                            controlsDisabled: i,
                            isGenerating: t,
                            emptyDraft: o,
                          }) &&
                          (m.preventDefault(), l(!1));
                    } else
                      "Backspace" === m.key &&
                        "" === e &&
                        c.length > 0 &&
                        !i &&
                        !t &&
                        u &&
                        (m.preventDefault(), u(c[c.length - 1].id));
                  },
                  handlePaste: async (e) => {
                    var n;
                    if (
                      ((n = Array.from(e.clipboardData.items, (e) => e.type)),
                      t && n.some((e) => e.startsWith("image/")))
                    )
                      return void f?.();
                    for (let t of Array.from(e.clipboardData.items))
                      if (t.type.startsWith("image/")) {
                        if ((e.preventDefault(), !x)) return void f?.();
                        let n = t.getAsFile();
                        if (!n) continue;
                        try {
                          let e = await b(n);
                          m(
                            "image",
                            `Image ${new Date().toLocaleTimeString("en-US", { hour12: !0, hour: "2-digit", minute: "2-digit" }).replace(/(\\d{2}):(\\d{2})/, "$1:$2")}`,
                            e,
                            void 0,
                            n.name,
                            !0,
                          );
                        } catch (e) {
                          console.error("Error compressing pasted image:", e);
                        }
                        return;
                      }
                    let r = e.clipboardData.getData("text");
                    if (
                      !r ||
                      !r.includes("\\n") ||
                      ![
                        /^import\s+/m,
                        /^function\s+/m,
                        /^class\s+/m,
                        /^const\s+/m,
                        /^let\s+/m,
                        /^var\s+/m,
                        /[{}\[\]();]/,
                        /^\s*\/\//m,
                        /^\s*\/\*/m,
                        /=>/,
                        /^export\s+/m,
                      ].some((e) => e.test(r))
                    )
                      return;
                    e.preventDefault();
                    let a = p?.current,
                      s = a?.getSelection?.();
                    if (g && s && !s.isEmpty())
                      return void m(
                        "code",
                        `${g} (${s.startLineNumber}-${s.endLineNumber})`,
                        r,
                        { start: s.startLineNumber, end: s.endLineNumber },
                      );
                    if (g && h?.current) {
                      let e = h.current;
                      m("code", `${g} (${e.startLine}-${e.endLine})`, r, {
                        start: e.startLine,
                        end: e.endLine,
                      });
                      return;
                    }
                    let i = r.split("\\n");
                    m("code", `Pasted Code (1-${i.length})`, r, {
                      start: 1,
                      end: i.length,
                    });
                  },
                };
              })({
                input: e,
                isGenerating: n,
                hasQueuedPrompts: d && m,
                queueAtCapacity: d && p,
                promptQueueEnabled: d,
                hasUnsupportedQueueContext: tC,
                controlsDisabled: _,
                emptyDraft: eS ? `@${eS.templateName} ` : "",
                handleSend: tI,
                handleQueuePrompt: d ? tS : void 0,
                contextTabs: E,
                onRemoveTab: F,
                addContextTab: H,
                editorRef: B,
                lastCopiedRangeRef: G,
                activeFileName: R,
                canAttachImages: te,
                onImageAttachRejected: ta,
              });
            (0, o.useEffect)(() => {
              if (0 === tx.length) return;
              let t = e || "",
                n = tx.filter((e) => !t.includes(e.mentionText));
              n.length > 0 && n.forEach((e) => tv(e.mentionText));
            }, [e, tx, tv]);
            let tM = (0, o.useRef)(e);
            (0, o.useEffect)(() => {
              let t = tM.current;
              t !== e &&
                (tQ((n) =>
                  (function (e, t, n) {
                    if (t === n || 0 === e.length) return e;
                    let r = Math.min(t.length, n.length),
                      a = 0;
                    for (
                      ;
                      a < r && t[t.length - 1 - a] === n[n.length - 1 - a];
                    )
                      a++;
                    let s = 0,
                      i = r - a;
                    for (; s < i && t[s] === n[s];) s++;
                    let o = s,
                      l = t.length - a,
                      d = n.length - t.length,
                      c = !1,
                      u = [];
                    for (let t of e) {
                      let e = t.start,
                        n = t.end;
                      (e >= l ? (e += d) : e > o && (e = o),
                        n >= l ? (n += d) : n > o && (n = o),
                        (e !== t.start || n !== t.end) && (c = !0),
                        n > e ? u.push({ ...t, start: e, end: n }) : (c = !0));
                    }
                    return c ? u : e;
                  })(n, t, e),
                ),
                (tM.current = e));
            }, [e]);
            let t_ = (0, o.useRef)(null);
            (0, o.useEffect)(() => {
              let n = t_.current,
                r = eS?.templateName ?? null;
              if (n !== r) {
                if (n) {
                  let r = `@${n} `;
                  e.startsWith(r) && t(e.slice(r.length));
                }
                if (r) {
                  let n = `@${r} `;
                  e.startsWith(n) ||
                    (t(n + e),
                    setTimeout(() => {
                      let e = M.current;
                      e && (e.setSelectionRange(n.length, n.length), e.focus());
                    }, 0));
                }
                t_.current = r;
              }
            }, [eS, e, t, M]);
            let tT = o.useMemo(
                () =>
                  eO.map((e) => ({
                    file: {
                      name: e.title,
                      uniqueId: e.id,
                      robloxClass: "GameMechanic",
                      type: "instance",
                      path: "",
                    },
                    mentionText: e.mentionText,
                  })),
                [eO],
              ),
              tR = o.useMemo(() => [...tx, ...tT], [tx, tT]),
              tE = o.useMemo(() => {
                let e = [...tR];
                return (
                  eS &&
                    e.push({
                      file: {
                        name: eS.templateName,
                        uniqueId: eS.templateUniqueId || "",
                        robloxClass: "UITemplate",
                        type: "instance",
                        path: "",
                      },
                      mentionText: `@${eS.templateName}`,
                    }),
                  e
                );
              }, [tR, eS]),
              t$ = (function ({
                controlsDisabled: e,
                isGenerating: t,
                isGeneratingMemory: n,
                pluginConnected: r,
                internalLimitReached: a,
                promptQueueEnabled: s,
              }) {
                let i = e || n || !r || a,
                  o = i || (!s && t);
                return {
                  hardDisabled: i,
                  editorDisabled: o,
                  deckCardsDisabled: o,
                  sendDisabled: i || t,
                };
              })({
                controlsDisabled: _,
                isGenerating: n,
                isGeneratingMemory: eY,
                pluginConnected: et,
                internalLimitReached: el,
                promptQueueEnabled: d,
              }),
              tL = t$.hardDisabled,
              tU = t$.editorDisabled,
              tD = !et,
              tO = t$.deckCardsDisabled,
              tJ = !et,
              tB = (0, s.n_)(a.FH.cardsDeck.logInteraction),
              tG = (0, s.IT)(a.FH.cardsDeck.getUserDragCount, eP ? {} : "skip"),
              tW = o.useCallback(
                (e, t) => {
                  eP &&
                    tB({
                      projectId: ec,
                      chatId: W && W.trim().length > 0 ? W : void 0,
                      cardId: e.id,
                      cardTitle: e.title,
                      mode: t,
                      promptIndexInProject: eT,
                    }).catch((e) => {
                      console.warn("[ChatInput] deck log failed", e);
                    });
                },
                [eP, tB, ec, W, eT],
              ),
              tV = o.useCallback((e) => tW(e, "click"), [tW]),
              [tK, tQ] = o.useState([]),
              tY = o.useRef(1),
              [tZ, tX] = o.useState("idle"),
              [t0, t1] = o.useState(null),
              [t5, t2] = o.useState(null),
              t4 = (0, o.useRef)(null),
              [t3, t6] = o.useState(null),
              [t8, t7] = o.useState(!1),
              t9 = (0, o.useRef)(null),
              ne = (0, o.useRef)(0),
              nt = (0, o.useRef)(!1),
              nn = o.useCallback(
                (e) => {
                  tW(e, "drag");
                },
                [tW, tG, M],
              );
            o.useEffect(() => {
              if ("textarea" === tZ) {
                let e = window.setTimeout(() => {
                  tX("gap");
                }, 3250);
                return () => window.clearTimeout(e);
              }
              if ("gap" === tZ) {
                let e = window.setTimeout(() => {
                  let e =
                    "undefined" != typeof document
                      ? document.querySelector("[data-send-button]")
                      : null;
                  if (e) {
                    let t = e.getBoundingClientRect();
                    (t2({ x: t.left, y: t.top, w: t.width, h: t.height }),
                      tX("send"));
                  } else tX("idle");
                }, 1e3);
                return () => window.clearTimeout(e);
              }
              if ("send" === tZ) {
                let e = window.setTimeout(() => {
                  tX("idle");
                }, 3060);
                return () => window.clearTimeout(e);
              }
            }, [tZ]);
            let nr = (0, o.useRef)(null),
              [na, ns] = (0, o.useState)(!1),
              [ni, no] = (0, o.useState)(!1),
              [nl, nd] = (0, o.useState)(null),
              nc = (0, o.useRef)(null),
              nu = (0, o.useRef)(1),
              nm = (0, o.useRef)(e);
            nm.current = e;
            let np = o.useCallback(
                (e, n) => {
                  let r = nc.current,
                    a = r ? r.value : (M.current?.value ?? nm.current),
                    s = z(a, e),
                    i = n?.composables?.length
                      ? (function (e, t, n, r) {
                          let a = t.toLowerCase(),
                            s = [];
                          for (let t of e) {
                            let e = (t.word || "").trim();
                            if (!e) continue;
                            let n = a.indexOf(e.toLowerCase());
                            n < 0 ||
                              s.push({
                                word: e,
                                label: t.label,
                                start: n,
                                end: n + e.length,
                              });
                          }
                          s.sort((e, t) => e.start - t.start);
                          let i = [],
                            o = r,
                            l = 0,
                            d = "";
                          for (let e of s) {
                            if (e.start < l) continue;
                            let r = n + (d += t.slice(l, e.start)).length,
                              a =
                                n +
                                (d += " " + t.slice(e.start, e.end) + " ")
                                  .length;
                            (i.push({
                              id: o++,
                              label: e.label,
                              start: r,
                              end: a,
                            }),
                              (l = e.end));
                          }
                          return { tokens: i, suffix: (d += t.slice(l)) };
                        })(n.composables, e, s.prev.length, tY.current)
                      : null,
                    o = i?.tokens ?? [],
                    l = i?.suffix ?? e;
                  o.length > 0 && (tY.current += o.length);
                  let d =
                      (l.split(/\s+/).filter(Boolean).length - 1) * 80 + 500,
                    c = {};
                  for (let e of o) {
                    let t = e.start - s.prev.length;
                    c[e.id] = Math.max(
                      0,
                      Math.round((t / Math.max(l.length, 1)) * d),
                    );
                  }
                  tw();
                  let u = z(a, l),
                    m = { id: nu.current++, ...u, revealDelaysById: c };
                  ((nm.current = u.value),
                    (tM.current = u.value),
                    (nc.current = m),
                    t(u.value),
                    o.length > 0 && tQ((e) => [...e, ...o]),
                    nd(m));
                },
                [tw, t, M],
              ),
              nh = o.useCallback(
                (e) => {
                  nc.current?.id === e &&
                    ((nc.current = null),
                    nd((t) => (t?.id === e ? null : t)),
                    requestAnimationFrame(() => {
                      (T(),
                        requestAnimationFrame(() => {
                          let e = M.current;
                          if (!e) return;
                          e.focus();
                          let t = e.value.length;
                          e.setSelectionRange(t, t);
                        }));
                    }));
                },
                [T, M],
              );
            o.useEffect(() => {
              nm.current = e;
              let t = nc.current;
              t &&
                e !== t.value &&
                ((nc.current = null), nd((e) => (e?.id === t.id ? null : e)));
            }, [e]);
            let ng =
                eP &&
                0 === e.length &&
                !V &&
                !n &&
                !el &&
                et &&
                !_ &&
                !eQ &&
                !eS &&
                null === nl &&
                !na,
              nx = !1;
            (o.useEffect(() => {
              let e = nt.current;
              if (((nt.current = nx), e || !nx || !et)) return;
              let t = Date.now();
              if (t - ne.current < 6e3) return;
              let n = t4.current;
              if (!n) return;
              let r = n.getBoundingClientRect();
              (t6({ x: r.left, y: r.top, w: r.width, h: r.height }),
                t7(!0),
                (ne.current = t),
                t9.current && clearTimeout(t9.current),
                (t9.current = setTimeout(() => {
                  (t7(!1), (t9.current = null));
                }, 2e3)));
            }, [nx, et]),
              o.useEffect(() => {
                (t9.current && (clearTimeout(t9.current), (t9.current = null)),
                  t7(!1));
              }, [!1, et]),
              o.useEffect(
                () => () => {
                  t9.current && (clearTimeout(t9.current), (t9.current = null));
                },
                [],
              ));
            let nf = nl ? nl.value : e,
              nb = eP && tK.length > 0;
            return (0, r.jsxs)("div", {
              "data-mention-popup-anchor": !0,
              className: (0, es.cn)(
                "relative z-10 mb-0 pt-0",
                e_ ? "pb-0 pr-0" : "pb-4 pr-4 md:pr-[72px]",
              ),
              children: [
                (() => {
                  let e = "textarea" === tZ ? t0 : "send" === tZ ? t5 : null;
                  if (
                    "idle" === tZ ||
                    "gap" === tZ ||
                    !e ||
                    "undefined" == typeof document
                  )
                    return null;
                  let t = "send" === tZ ? 8 : 12,
                    n = "send" === tZ ? 12 : 14,
                    a = e.x - t,
                    s = e.y - t,
                    i = e.w + 2 * t,
                    o = "textarea" === tZ ? -10 : t,
                    l = e.h + t + o,
                    d = window.innerWidth,
                    c = window.innerHeight,
                    u = a + i,
                    m = s + l,
                    p = `M${a + n},${s} H${u - n} A${n},${n} 0 0 1 ${u},${s + n} V${m - n} A${n},${n} 0 0 1 ${u - n},${m} H${a + n} A${n},${n} 0 0 1 ${a},${m - n} V${s + n} A${n},${n} 0 0 1 ${a + n},${s} Z`,
                    h = `<svg xmlns='http://www.w3.org/2000/svg' width='${d}' height='${c}'><path d='M0,0 H${d} V${c} H0 Z ${p}' fill='white' fill-rule='evenodd'/></svg>`,
                    g = `url("data:image/svg+xml;utf8,${encodeURIComponent(h)}")`;
                  return (0, f.createPortal)(
                    (0, r.jsx)(
                      ev.P.div,
                      {
                        className: "pointer-events-none fixed inset-0 z-300",
                        initial: { opacity: 0 },
                        animate: { opacity: 1 },
                        exit: { opacity: 0 },
                        transition: { duration: 0.35, ease: "easeOut" },
                        style: {
                          backdropFilter: "blur(8px) saturate(70%)",
                          WebkitBackdropFilter: "blur(8px) saturate(70%)",
                          backgroundColor: "rgba(0,0,0,0.35)",
                          WebkitMaskImage: g,
                          maskImage: g,
                          WebkitMaskRepeat: "no-repeat",
                          maskRepeat: "no-repeat",
                        },
                      },
                      `onboarding-spotlight-${tZ}`,
                    ),
                    document.body,
                  );
                })(),
                (() => {
                  if (!t3 || "undefined" == typeof document) return null;
                  let e = 0.1 * t3.w,
                    t = t3.x - 16 - e,
                    n = t3.y - 16,
                    a = t3.w + 32 + 2 * e,
                    s = t3.h + 32,
                    i = window.innerWidth,
                    o = window.innerHeight,
                    l = t + a,
                    d = n + s,
                    c = `M${t + 16},${n} H${l - 16} A16,16 0 0 1 ${l},${n + 16} V${d - 16} A16,16 0 0 1 ${l - 16},${d} H${t + 16} A16,16 0 0 1 ${t},${d - 16} V${n + 16} A16,16 0 0 1 ${t + 16},${n} Z`,
                    u = `<svg xmlns='http://www.w3.org/2000/svg' width='${i}' height='${o}'><path d='M0,0 H${i} V${o} H0 Z ${c}' fill='white' fill-rule='evenodd'/></svg>`,
                    m = `url("data:image/svg+xml;utf8,${encodeURIComponent(u)}")`;
                  return (0, f.createPortal)(
                    (0, r.jsx)(ew.N, {
                      children:
                        t8 &&
                        (0, r.jsx)(
                          ev.P.div,
                          {
                            className:
                              "pointer-events-none fixed inset-0 z-450",
                            initial: { opacity: 0 },
                            animate: { opacity: 1 },
                            exit: { opacity: 0 },
                            transition: { duration: 0.3, ease: "easeOut" },
                            style: {
                              backdropFilter: "blur(8px) saturate(70%)",
                              WebkitBackdropFilter: "blur(8px) saturate(70%)",
                              backgroundColor: "rgba(0,0,0,0.35)",
                              WebkitMaskImage: m,
                              maskImage: m,
                              WebkitMaskRepeat: "no-repeat",
                              maskRepeat: "no-repeat",
                            },
                          },
                          "deck-cards-spotlight",
                        ),
                    }),
                    document.body,
                  );
                })(),
                (0, r.jsx)(ew.N, {
                  children:
                    th.isActive &&
                    tg &&
                    (0, r.jsx)(td, {
                      files: th.files,
                      selectedIndex: th.selectedIndex,
                      onSelect: ty,
                      onClose: tw,
                      position: tg,
                      isLoading: th.isLoading,
                      listboxId: eK,
                    }),
                }),
                !1,
                (0, r.jsxs)("div", {
                  className: (0, es.cn)(
                    eP
                      ? e_
                        ? "flex flex-col items-stretch gap-2.5 sm:flex-row sm:items-end sm:gap-3"
                        : "flex flex-col items-stretch gap-3 sm:flex-row sm:items-end sm:gap-4 md:gap-6 lg:gap-10"
                      : "",
                  ),
                  children: [
                    eP &&
                      (0, r.jsx)(tF, {
                        openInventorySignal: eW,
                        visuallyDimmed: tD,
                        cardsDisabled: tO,
                        inventoryButtonDisabled: tJ,
                        onPlayOneLiner: np,
                        onCardFlipped: tV,
                        onCardDropped: nn,
                        dropTargetRef: nr,
                        onDropTargetHoverChange: ns,
                        onHoldingChange: no,
                        handHighlighted: !1,
                        collectiveHoverPreview: nx,
                        cardsAreaRef: t4,
                        onOpenExplore: eR,
                        promotedCommunityCard: eE,
                        className: (0, es.cn)(
                          "mb-1 self-center sm:mb-3 sm:self-auto",
                          e_ && "sm:w-[208px]",
                        ),
                      }),
                    (0, r.jsxs)("div", {
                      className: "relative flex-1 min-w-0 flex flex-col",
                      children: [
                        eM &&
                          (0, r.jsx)(tF, {
                            inventoryOnly: !0,
                            openInventorySignal: eW,
                            visuallyDimmed: tD,
                            cardsDisabled: tO,
                            inventoryButtonDisabled: tJ,
                            onPlayOneLiner: np,
                            onCardFlipped: tV,
                            onCardDropped: nn,
                            dropTargetRef: nr,
                            onDropTargetHoverChange: ns,
                            onHoldingChange: no,
                            onOpenExplore: eR,
                            promotedCommunityCard: eE,
                          }),
                        e$,
                        K &&
                          (0, r.jsx)("div", {
                            className: (0, es.cn)(
                              "mb-2",
                              "flex justify-center",
                              "pointer-events-none",
                            ),
                            children: (0, r.jsxs)("div", {
                              className:
                                "flex flex-col items-center gap-1 w-[95%] pointer-events-auto",
                              children: [
                                !X &&
                                  (0, r.jsx)("button", {
                                    type: "button",
                                    onClick: em,
                                    disabled: !em,
                                    className: (0, es.cn)(
                                      "text-caption font-medium px-2 py-0.5 rounded-md",
                                      "text-warning hover:text-warning",
                                      "bg-warning/10 hover:bg-warning/15",
                                      "ring-1 ring-warning/25 hover:ring-warning/40",
                                      "transition-colors disabled:cursor-not-allowed disabled:opacity-50",
                                    ),
                                    children:
                                      "Upgrade to Pro to get higher task limits",
                                  }),
                                (0, r.jsx)("button", {
                                  type: "button",
                                  onClick: Q,
                                  disabled: !et || el,
                                  className: (0, es.cn)(
                                    "w-[90%] rounded-md py-1.5 text-body",
                                    et && !el
                                      ? "bg-warning text-warning-foreground hover:bg-warning-hover"
                                      : "cursor-not-allowed bg-muted text-muted-foreground opacity-70",
                                  ),
                                  children: Y
                                    ? "Continue (bills the paid UI model)"
                                    : ep && (0, I.uO)(ep)
                                      ? "Continue"
                                      : "Continue (this costs credits)",
                                }),
                              ],
                            }),
                          }),
                        d &&
                          (0, r.jsxs)(r.Fragment, {
                            children: [
                              (0, r.jsx)(to, {
                                prompts: c,
                                isGenerating: n,
                                controlsDisabled: tL,
                                composerRef: M,
                                onEdit: (e) => x?.(e),
                                onRemove: (e) => b?.(e),
                                onSendNow: y ? (e) => y(e) : void 0,
                              }),
                              (0, r.jsx)("span", {
                                className: "sr-only",
                                role: "status",
                                "aria-live": "polite",
                                "aria-atomic": "true",
                                children:
                                  c.length > 0
                                    ? `${c.length} ${1 === c.length ? "prompt" : "prompts"} in the queue. ${ts(c[0])}.`
                                    : "",
                              }),
                            ],
                          }),
                        (0, r.jsx)(ea.cZ, {
                          asChild: !0,
                          context: "project",
                          className: (0, es.cn)(
                            !eH &&
                              "min-h-[108px] rounded-2xl bg-neutral-100 p-1.5 text-foreground shadow-none backdrop-blur-none focus-within:shadow-none dark:bg-neutral-800 dark:text-foreground dark:shadow-none dark:focus-within:shadow-none",
                            eH && "p-2",
                            e_ && "border border-border/75 bg-map-chat",
                          ),
                          children: (0, r.jsxs)("div", {
                            ref: nr,
                            "data-chat-input-container": !0,
                            className: (0, es.cn)(
                              "relative mt-0 flex min-h-[108px] flex-col transition-shadow duration-150",
                              tU && "cursor-not-allowed",
                              !1,
                              ee &&
                                "ring-4 ring-white/40 animate-pulse ring-offset-0",
                              ed &&
                                "plugin-attention-pulse border-2 border-brand-sky/80 ring-2 ring-brand-sky/50 ring-offset-0 shadow-surface transition-[border-color,box-shadow] duration-300 motion-reduce:transition-none",
                              eX &&
                                "ring-4 ring-warning/60 ring-offset-0 transition-[box-shadow] duration-150 motion-reduce:transition-none",
                              eP &&
                                ni &&
                                !na &&
                                "ring-2 ring-white/50 ring-offset-0",
                              eP && na && "ring-4 ring-white/50 ring-offset-0",
                            ),
                            onMouseEnter: (e) => {},
                            onMouseLeave: () => {
                              e8(!1);
                            },
                            onMouseMove: (e) => {},
                            onDragEnter: (e) => {
                              (e.preventDefault(),
                                e.stopPropagation(),
                                e7.current++,
                                e.dataTransfer.types.includes("Files") &&
                                  e0(!0));
                            },
                            onDragLeave: (e) => {
                              (e.preventDefault(),
                                e.stopPropagation(),
                                e7.current--,
                                0 === e7.current && e0(!1));
                            },
                            onDragOver: (e) => {
                              (e.preventDefault(), e.stopPropagation());
                            },
                            onDrop: tp,
                            children: [
                              (0, r.jsxs)("div", {
                                className: (0, es.cn)(
                                  "grow overflow-y-auto px-4 pt-2 flex flex-col",
                                  eH
                                    ? "rounded-[1.25rem] bg-transparent px-5 pt-2"
                                    : "rounded-xl rounded-b-none bg-neutral-200 dark:bg-white/5",
                                  e_ && "bg-transparent",
                                ),
                                style: { maxHeight: "none" },
                                children: [
                                  (0, r.jsx)(eC.A, {
                                    activeFileName: R ?? "",
                                    contextTabs: E,
                                    onRemoveTab: F,
                                    isExpanded: U,
                                    onToggleExpand: D,
                                    onAddFile: (e) =>
                                      H("file", e.name, e.content),
                                    className: "mb-0 shrink-0",
                                    mentionedFiles: tR,
                                    onRemoveMentionedFile: (e) => {
                                      let n = M.current;
                                      if (n) {
                                        let r = n.value
                                          .replace(e + " ", "")
                                          .replace(e, "");
                                        ((n.value = r), t(r));
                                        let a = new Event("input", {
                                          bubbles: !0,
                                        });
                                        n.dispatchEvent(a);
                                      }
                                      eO.some((t) => t.mentionText === e)
                                        ? ez?.(e)
                                        : tv(e);
                                    },
                                    selectedUI: eS,
                                    onRemoveSelectedUI: () => eA?.(null),
                                  }),
                                  (0, r.jsxs)("div", {
                                    className: "relative isolate",
                                    children: [
                                      (0, r.jsx)(tu, {
                                        input: e,
                                        mentionedFiles: tE,
                                        textareaRef: M,
                                      }),
                                      nb &&
                                        (0, r.jsx)(tm, {
                                          input: nf,
                                          tokens: tK,
                                          textareaRef: M,
                                          revealDelaysById:
                                            nl?.revealDelaysById,
                                          className:
                                            null !== nl ? "z-71" : "-z-10",
                                        }),
                                      ng &&
                                        (0, r.jsxs)("div", {
                                          className: (0, es.cn)(
                                            "pointer-events-none absolute inset-0 z-60 pt-1 text-body-lg text-black/70 dark:text-white/40",
                                            eH &&
                                              "text-brand-black/55 dark:text-white/55",
                                          ),
                                          children: [
                                            e1
                                              ? (0, r.jsxs)(r.Fragment, {
                                                  children: [
                                                    (0, r.jsx)(tH.N, {
                                                      delay: 0,
                                                      duration: 1,
                                                      children: "Drag a card",
                                                    }),
                                                    (0, r.jsx)(ev.P.span, {
                                                      className:
                                                        "inline-block mx-1 align-[-0.15em]",
                                                      initial: { opacity: 0.5 },
                                                      animate: {
                                                        opacity: [0.5, 1, 0.5],
                                                      },
                                                      transition: {
                                                        duration: 1,
                                                        delay: 0,
                                                        repeat: 1 / 0,
                                                        repeatDelay: 1.5,
                                                        ease: "linear",
                                                      },
                                                      children: (0, r.jsx)(
                                                        ej.A,
                                                        {
                                                          className:
                                                            "h-4 w-4 text-black/70 dark:text-white/40",
                                                          fill: "currentColor",
                                                          strokeWidth: 2,
                                                          "aria-hidden": !0,
                                                        },
                                                      ),
                                                    }),
                                                  ],
                                                })
                                              : (0, r.jsxs)(r.Fragment, {
                                                  children: [
                                                    (0, r.jsx)("span", {
                                                      children: "Drag a card",
                                                    }),
                                                    (0, r.jsx)(ej.A, {
                                                      className:
                                                        "inline-block h-4 w-4 mx-1 align-[-0.15em] text-black/70 dark:text-white/20",
                                                      fill: "currentColor",
                                                      strokeWidth: 2,
                                                      "aria-hidden": !0,
                                                    }),
                                                  ],
                                                }),
                                            (0, r.jsx)("span", {
                                              children:
                                                "or describe a mechanic...",
                                            }),
                                          ],
                                        }),
                                      (0, r.jsx)(ew.N, {
                                        children:
                                          eP &&
                                          null !== nl &&
                                          (0, r.jsxs)(
                                            ev.P.div,
                                            {
                                              className: (0, es.cn)(
                                                "pointer-events-none absolute inset-0 z-70 pt-1 text-body-lg text-black dark:text-white whitespace-pre-wrap break-normal",
                                                nb && "leading-[26px]",
                                              ),
                                              style: {
                                                wordWrap: "normal",
                                                overflowWrap: "normal",
                                              },
                                              initial: { opacity: 1 },
                                              animate: { opacity: 1 },
                                              exit: { opacity: 0 },
                                              transition: {
                                                duration: 0.15,
                                                ease: "easeOut",
                                              },
                                              children: [
                                                (0, r.jsx)("span", {
                                                  children: nl.prev,
                                                }),
                                                (0, r.jsx)(
                                                  tz,
                                                  {
                                                    duration: 0.5,
                                                    stagger: 0.08,
                                                    onAnimationComplete: () =>
                                                      nh(nl.id),
                                                    children: nl.suffix,
                                                  },
                                                  nl.id,
                                                ),
                                              ],
                                            },
                                            "drop-fill-overlay",
                                          ),
                                      }),
                                      (0, r.jsx)(eb.T, {
                                        value: e,
                                        name: "chat-input",
                                        role: "combobox",
                                        "aria-label": "Message",
                                        "aria-autocomplete": "list",
                                        "aria-haspopup": "listbox",
                                        "aria-expanded": tj,
                                        "aria-controls": tj ? eK : void 0,
                                        "aria-activedescendant": tN,
                                        placeholder: V
                                          ? "Restoring..."
                                          : n
                                            ? d
                                              ? (function (e) {
                                                  let t = e?.trim();
                                                  return t
                                                    ? `Write your next move while Lemonade works on “${t}”...`
                                                    : "Write your next move while Lemonade builds...";
                                                })(A)
                                              : A?.trim() ||
                                                "Sending message..."
                                            : eQ
                                              ? "Add another prompt to the queue..."
                                              : el
                                                ? Z.N$
                                                : er
                                                  ? "Checking Roblox Studio connection..."
                                                  : en
                                                    ? "Plugin disconnected — reconnect Roblox Studio to continue"
                                                    : et
                                                      ? _
                                                        ? eo ||
                                                          "Accept or reject changes first"
                                                        : eS
                                                          ? "Describe a UI change..."
                                                          : ng
                                                            ? ""
                                                            : "Drag a card or describe a mechanic..."
                                                      : "Connect the Lemonade plugin in Roblox Studio first",
                                        className: (0, es.cn)(
                                          "mt-0 w-full resize-none rounded-none border-none bg-transparent px-0 py-1 text-body-lg placeholder:text-body-lg placeholder:text-black/70 focus-visible:outline-hidden focus-visible:ring-0 focus-visible:ring-offset-0 disabled:opacity-70 dark:text-white dark:placeholder:text-white/40",
                                          eH &&
                                            "text-brand-black dark:text-white placeholder:text-brand-black/45 dark:placeholder:text-white/45",
                                          eH ? "min-h-[66px]" : "min-h-[75px]",
                                          eP &&
                                            (null !== nl || na) &&
                                            "placeholder:text-transparent dark:placeholder:text-transparent",
                                          eP &&
                                            null !== nl &&
                                            "text-transparent caret-transparent transition-none",
                                          nb && "leading-[26px]",
                                          !1,
                                        ),
                                        ref: M,
                                        onKeyDown: (e) => {
                                          (th.isActive && tb(e)) || tA(e);
                                        },
                                        onPaste: tP,
                                        onChange: (e) => {
                                          let n = e.target.value;
                                          (nc.current &&
                                            ((nc.current = null), nd(null)),
                                            (nm.current = n),
                                            t(n),
                                            T(),
                                            tf(n),
                                            O(n, eS?.templateName) &&
                                              ((t_.current = null),
                                              eA?.(null)));
                                        },
                                        onFocus: () => e5(!0),
                                        onBlur: () => e5(!1),
                                        disabled: tU,
                                        readOnly: !1,
                                        style: { maxHeight: "227px" },
                                      }),
                                      !et &&
                                        !er &&
                                        ei &&
                                        (0, r.jsx)(ef.$n, {
                                          type: "button",
                                          variant: "ghost",
                                          "aria-label":
                                            "Open Roblox Studio connection setup",
                                          onClick: ei,
                                          className: (0, es.cn)(
                                            "layer-sticky absolute inset-0 h-auto cursor-pointer rounded-control bg-transparent p-0 shadow-none",
                                            "data-[enabled]:hover:bg-transparent data-[enabled]:hover:text-inherit data-[enabled]:hover:shadow-none",
                                          ),
                                          children: (0, r.jsx)("span", {
                                            className: "sr-only",
                                            children:
                                              "Connect the Lemonade plugin to continue",
                                          }),
                                        }),
                                    ],
                                  }),
                                ],
                              }),
                              (0, r.jsx)("div", {
                                className: (0, es.cn)(
                                  "shrink-0",
                                  eH
                                    ? "bg-transparent"
                                    : "rounded-b-xl bg-neutral-200 dark:bg-white/5",
                                  e_ && "bg-transparent",
                                ),
                                children: (0, r.jsx)(e2, {
                                  input: e,
                                  setInput: t,
                                  isGenerating: n,
                                  canStopGeneration: i,
                                  newAgentSessionId: l,
                                  promptQueueEnabled: d,
                                  hasQueuedPrompts: d && c.length > 0,
                                  queueAtCapacity: d && p,
                                  hasUnsupportedQueueContext: tC,
                                  onQueuePrompt: d ? tS : void 0,
                                  retryablePrompt: d ? v : void 0,
                                  retryablePromptCount: d ? w : 0,
                                  onRestoreRetryablePrompt: d ? C : void 0,
                                  onDismissRetryablePrompt: d ? S : void 0,
                                  controlsDisabled: tL,
                                  handleSend: tI,
                                  handleStopGeneration: q,
                                  onImageUpload: J,
                                  onTriggerMention: () => {
                                    let e = M.current;
                                    if (!e) return;
                                    let n = e.value;
                                    (t(n), tf(n));
                                  },
                                  addContextTab: H,
                                  textareaRef: M,
                                  chatId: W,
                                  projectId: ec,
                                  onMemoryGeneratingChange: eZ,
                                  onOpenRateLimitModal: eu,
                                  onOpenStorePurchases: em,
                                  selectedModel: ep,
                                  onModelChange: eh,
                                  creditsRemaining: eg,
                                  availabilityOverrides: ex,
                                  discountBadgeHiddenOverrides: ek,
                                  onOpenUIBuilder: eN,
                                  selectedUI: eS,
                                  onSelectUI: eA,
                                  modelRequiresImageSupport: !!tn,
                                  modelImageSupportRequirement: tn ?? "image",
                                  onImageUnsupportedModelSelect: (e, t) => {
                                    N.oR.error((0, I.Iw)(e, t));
                                  },
                                  minimumCreditExemptModelIds: eL,
                                  canAccessRestrictedModels: eF,
                                  codexOnlyModelAccess: eU,
                                  unifiedComposer: eH,
                                  themePickerSlot: eq,
                                  audioInputEnabled: eD,
                                  workspaceLayout: e_ && eH,
                                  showCreditControl: eJ,
                                  composerPopover: eB,
                                  onComposerPopoverChange: eG,
                                  onOpenCardsInventory:
                                    eP || eM ? () => eV((e) => e + 1) : void 0,
                                }),
                              }),
                            ],
                          }),
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            });
          },
        );
      tJ.displayName = "ChatInputContainer";
      var tB = n(48055),
        tG = n(26667),
        tW = n(50700),
        tV = n(66630),
        tK = n(97450),
        tQ = n(75426),
        tY = n(11012);
      function tZ({
        card: e,
        isLiked: t,
        onToggleLike: n,
        onCopyPrompt: a,
        onClose: s,
      }) {
        var i, o;
        let [l, d] = (0, tY.J0)(!1),
          c = (0, tY.li)(null),
          [u, m] = (0, tY.J0)(null),
          p = Q(),
          [h, g] = (0, tY.J0)(() => window.innerHeight < 1e3);
        ((0, tY.vJ)(() => {
          let e = () => g(window.innerHeight < 1e3);
          return (
            e(),
            window.addEventListener("resize", e),
            () => window.removeEventListener("resize", e)
          );
        }, []),
          (0, tY.vJ)(() => {
            d(!1);
          }, [e?.id]));
        let x = async (t) => {
          if ((t.stopPropagation(), e)) {
            a?.(e);
            try {
              (await navigator.clipboard.writeText(e.prompt),
                d(!0),
                window.setTimeout(() => d(!1), 1500));
            } catch {}
          }
        };
        return (0, r.jsx)(eH.lG, {
          open: !!e,
          onOpenChange: (e) => !e && s(),
          children: (0, r.jsx)(ew.N, {
            children:
              e &&
              (0, r.jsx)(eH.Cf, {
                forceMount: !0,
                asChild: !0,
                layer: "lightbox",
                showCloseButton: !1,
                "aria-describedby": void 0,
                overlayClassName:
                  "bg-black/70 backdrop-blur-md data-[state=closed]:fill-mode-forwards",
                onOpenAutoFocus: () => {
                  let e = document.activeElement;
                  c.current =
                    e instanceof HTMLElement && e !== document.body ? e : null;
                },
                onCloseAutoFocus: (e) => {
                  let t = c.current;
                  ((c.current = null),
                    t?.isConnected && (e.preventDefault(), t.focus()));
                },
                children: (0, r.jsxs)(
                  ev.P.div,
                  {
                    className: (0, es.cn)(
                      "dark fixed inset-0 left-0 top-0 flex h-dvh w-full max-w-none translate-x-0 translate-y-0 cursor-pointer items-center justify-center gap-0 overflow-y-auto rounded-none bg-transparent shadow-none",
                      h ? "px-4 pt-4 pb-[148px]" : "p-4",
                    ),
                    onClick: s,
                    initial: { opacity: 0 },
                    animate: { opacity: 1 },
                    exit: { opacity: 0 },
                    transition: { duration: 0.14 },
                    children: [
                      (0, r.jsxs)(eH.L3, {
                        className: "sr-only",
                        children: ["Community creation by ", e.username],
                      }),
                      (0, r.jsxs)(
                        ev.P.div,
                        {
                          layoutId: `gallery-card-${e.id}`,
                          onClick: (e) => e.stopPropagation(),
                          transition: { duration: 0.18, ease: "easeOut" },
                          className: (0, es.cn)(
                            "relative w-full rounded-2xl overflow-hidden cursor-default",
                            "bg-neutral-900/95 border-2 border-border shadow-2xl",
                            p ? "max-w-md" : "max-w-lg",
                          ),
                          children: [
                            (0, r.jsx)(ev.P.img, {
                              layoutId: `gallery-image-${e.id}`,
                              src: e.imageUrl,
                              alt: e.prompt,
                              draggable: !1,
                              transition: { duration: 0.18, ease: "easeOut" },
                              className: "w-full aspect-video object-cover",
                            }),
                            (0, r.jsx)(eH.HM, {
                              asChild: !0,
                              children: (0, r.jsxs)(ev.P.button, {
                                type: "button",
                                initial: { opacity: 0 },
                                animate: { opacity: 1 },
                                exit: { opacity: 0 },
                                transition: { duration: 0.13, delay: 0.18 },
                                className: (0, es.cn)(
                                  "absolute top-3 left-3 z-10 inline-flex items-center gap-1.5",
                                  "px-2 py-1 rounded-md text-micro font-medium",
                                  "bg-black/45 backdrop-blur-xs border border-white/15 text-white/85",
                                  "hover:bg-black/60 hover:text-white transition-colors",
                                ),
                                children: [
                                  (0, r.jsx)("kbd", {
                                    className:
                                      "px-1.5 py-0.5 rounded bg-white/15 border border-white/20 text-shortcut",
                                    children: "ESC",
                                  }),
                                  "to close",
                                ],
                              }),
                            }),
                            (0, r.jsxs)(ev.P.div, {
                              initial: { opacity: 0, y: 8 },
                              animate: { opacity: 1, y: 0 },
                              exit: { opacity: 0, y: 8 },
                              transition: { duration: 0.13, delay: 0.18 },
                              className:
                                "pt-3.5 px-5 pb-5 space-y-1 bg-background dark:bg-card",
                              children: [
                                (0, r.jsxs)("div", {
                                  className:
                                    "flex items-center justify-between gap-3",
                                  children: [
                                    (0, r.jsxs)("div", {
                                      className: "text-body-lg",
                                      children: [
                                        (0, r.jsx)("span", {
                                          className:
                                            "font-medium text-white/90",
                                          children: e.username,
                                        }),
                                        (0, r.jsx)("span", {
                                          className:
                                            "text-white/40 ml-1.5 text-caption",
                                          children: e.timeAgo,
                                        }),
                                      ],
                                    }),
                                    (0, r.jsxs)("div", {
                                      className:
                                        "flex items-center gap-1.5 shrink-0",
                                      children: [
                                        "number" == typeof e.creditsUsed
                                          ? (0, r.jsxs)(en.m_, {
                                              children: [
                                                (0, r.jsx)(en.k$, {
                                                  asChild: !0,
                                                  children: (0, r.jsxs)(
                                                    "span",
                                                    {
                                                      onClick: (e) =>
                                                        e.stopPropagation(),
                                                      className: (0, es.cn)(
                                                        "flex items-center gap-1.5 px-2.5 py-2 rounded-lg",
                                                        "text-caption font-medium tabular-nums",
                                                        "text-white/80",
                                                        "cursor-default select-none",
                                                      ),
                                                      children: [
                                                        (0, r.jsx)(tB.A, {
                                                          className: "w-4 h-4",
                                                        }),
                                                        (0, r.jsx)("span", {
                                                          children: (0, ec.Ql)(
                                                            e.creditsUsed,
                                                          ),
                                                        }),
                                                      ],
                                                    },
                                                  ),
                                                }),
                                                (0, r.jsx)(en.ZI, {
                                                  side: "top",
                                                  children: (0, r.jsxs)("div", {
                                                    className: "max-w-xs",
                                                    children: [
                                                      (0, r.jsx)("p", {
                                                        className:
                                                          "font-semibold mb-1",
                                                        children:
                                                          "Estimated Credit Cost",
                                                      }),
                                                      (0, r.jsx)("p", {
                                                        className:
                                                          "text-caption text-muted-foreground",
                                                        children: `This prompt was sent on ${((i = e.createdAt), new Intl.DateTimeFormat(void 0, { year: "numeric", month: "short", day: "numeric" }).format(new Date(i)))} using ${(0, I.$L)(e.model ?? void 0)}. Costs tend to decrease over time.`,
                                                      }),
                                                    ],
                                                  }),
                                                }),
                                              ],
                                            })
                                          : null,
                                        (0, r.jsxs)("button", {
                                          type: "button",
                                          "aria-label": t
                                            ? `Unlike — ${e.likes} likes`
                                            : `Like — ${e.likes} likes`,
                                          onClick: (t) => {
                                            (t.stopPropagation(), n(e));
                                          },
                                          className: (0, es.cn)(
                                            "flex items-center gap-1.5 px-2.5 py-2 rounded-lg border",
                                            "transition-[background-color,border-color,color,box-shadow] duration-150 motion-reduce:transition-none",
                                            "text-caption font-medium tabular-nums",
                                            t
                                              ? "border-destructive/40 bg-destructive/10 text-destructive hover:bg-destructive/20"
                                              : "bg-white/10 border-white/20 text-white/80 hover:text-white hover:bg-white/20",
                                          ),
                                          children: [
                                            (0, r.jsx)(tb.A, {
                                              className: "w-4 h-4",
                                              fill: t ? "currentColor" : "none",
                                            }),
                                            (0, r.jsx)("span", {
                                              children:
                                                (o = e.likes) < 1e3
                                                  ? String(o)
                                                  : o < 1e4
                                                    ? `${(o / 1e3).toFixed(1).replace(/\.0$/, "")}k`
                                                    : `${Math.round(o / 1e3)}k`,
                                            }),
                                          ],
                                        }),
                                      ],
                                    }),
                                  ],
                                }),
                                (0, r.jsx)("button", {
                                  type: "button",
                                  onClick: x,
                                  className: "group block w-full text-left",
                                  children: (0, r.jsx)("div", {
                                    onWheel: (e) => e.stopPropagation(),
                                    className: (0, es.cn)(
                                      "max-h-[calc(0.875rem*1.625*3.75)] overflow-y-auto pr-1",
                                      "scrollbar-thin [scrollbar-color:rgba(255,255,255,0.2)_transparent]",
                                    ),
                                    children: (0, r.jsxs)("span", {
                                      onMouseEnter: (e) =>
                                        m({ x: e.clientX, y: e.clientY }),
                                      onMouseMove: (e) =>
                                        m({ x: e.clientX, y: e.clientY }),
                                      onMouseLeave: () => m(null),
                                      className:
                                        "text-body leading-relaxed text-white/55 group-hover:text-white/75 transition-colors",
                                      children: [
                                        e.prompt,
                                        (0, r.jsx)("span", {
                                          "aria-hidden": !0,
                                          className: (0, es.cn)(
                                            "ml-1.5 inline-flex align-middle text-white/60",
                                            "opacity-0 group-hover:opacity-100 transition-opacity duration-150",
                                            l && "opacity-100 text-white",
                                          ),
                                          children: l
                                            ? (0, r.jsx)(eD.A, {
                                                className: "w-3.5 h-3.5",
                                              })
                                            : (0, r.jsx)(tQ.A, {
                                                className: "w-3.5 h-3.5",
                                              }),
                                        }),
                                      ],
                                    }),
                                  }),
                                }),
                              ],
                            }),
                          ],
                        },
                        "lightbox-card",
                      ),
                      u &&
                        (0, r.jsx)("div", {
                          "aria-hidden": !0,
                          style: {
                            position: "fixed",
                            left: u.x + 8,
                            top: u.y - 8,
                            transform: "translateY(-100%)",
                            pointerEvents: "none",
                            zIndex: 110,
                          },
                          className:
                            "px-1.5 py-0.5 rounded bg-neutral-700/95 border border-white/10 text-caption font-medium leading-none text-white select-none shadow-md",
                          children: l ? "Copied" : "Click to copy",
                        }),
                    ],
                  },
                  "lightbox-backdrop",
                ),
              }),
          }),
        });
      }
      let tX = "community-gif:";
      function t0(e) {
        let t = e.prompt?.trim();
        return t
          ? {
              id: `${tX}${e.playtestGifId}`,
              title: e.title?.trim() || "Community GIF",
              oneLiner: t,
              category: "community",
              imageUrl: e.imageUrl,
            }
          : null;
      }
      let t1 = (0, o.memo)(function ({
        card: e,
        isLightboxActive: t,
        isAnyLightboxOpen: n,
        isLiked: a,
        scrollRootRef: s,
        onSelect: i,
        onLike: l,
      }) {
        var d, c;
        let u = (0, o.useRef)(null),
          m = (0, o.useRef)(null),
          [p, h] = (0, o.useState)(!1),
          [g, x] = (0, o.useState)(!1),
          [f, b] = (0, o.useState)(null),
          y = !t && (n || !g),
          v = p || t;
        ((0, o.useEffect)(() => {
          let e = u.current;
          if (!e) return;
          let t = s?.current ?? null,
            n = new IntersectionObserver(([e]) => h(e.isIntersecting), {
              root: t,
              rootMargin: "200px 0px",
            });
          n.observe(e);
          let r = new IntersectionObserver(([e]) => x(e.isIntersecting), {
            root: t,
            rootMargin: "0px 0px",
            threshold: 0,
          });
          return (
            r.observe(e),
            () => {
              (n.disconnect(), r.disconnect());
            }
          );
        }, [s]),
          (0, o.useEffect)(() => {
            if (!y || !v) return void b(null);
            let e = m.current;
            if (!e) return;
            let t = !1,
              n = () => {
                if (!t)
                  try {
                    let n = document.createElement("canvas");
                    ((n.width = e.naturalWidth || e.width || 1),
                      (n.height = e.naturalHeight || e.height || 1));
                    let r = n.getContext("2d");
                    if (!r) return;
                    (r.drawImage(e, 0, 0),
                      t || b(n.toDataURL("image/jpeg", 0.85)));
                  } catch {}
              };
            return e.complete && e.naturalWidth > 0
              ? (n(),
                () => {
                  t = !0;
                })
              : (e.addEventListener("load", n, { once: !0 }),
                () => {
                  ((t = !0), e.removeEventListener("load", n));
                });
          }, [y, v]));
        let w = (0, o.useCallback)(() => i(e), [i, e]),
          j = (0, o.useCallback)(() => {
            l(e, m.current, a);
          }, [l, e, a]);
        return (0, r.jsx)("div", {
          ref: u,
          className: "aspect-video w-full",
          children: v
            ? (0, r.jsxs)(ev.P.div, {
                layoutId: `gallery-card-${e.id}`,
                className: (0, es.cn)(
                  "group relative h-full w-full overflow-hidden rounded-lg border-2 border-border bg-muted",
                  t && "opacity-0",
                ),
                transition: { duration: 0.18, ease: "easeOut" },
                children: [
                  (0, r.jsx)(ef.$n, {
                    type: "button",
                    variant: "ghost",
                    className:
                      "absolute inset-0 z-10 h-full w-full cursor-pointer rounded-[inherit] p-0 data-[enabled]:hover:bg-transparent focus-visible:ring-inset",
                    onClick: w,
                    "aria-label": e.title
                      ? `View prompt: ${e.title}`
                      : `View prompt by ${e.username}`,
                  }),
                  (0, r.jsx)(ev.P.img, {
                    ref: m,
                    layoutId: `gallery-image-${e.id}`,
                    src: f ?? e.previewImageUrl ?? e.imageUrl,
                    alt: "",
                    loading: "lazy",
                    decoding: "async",
                    draggable: !1,
                    crossOrigin: "anonymous",
                    transition: { duration: 0.18, ease: "easeOut" },
                    className:
                      "pointer-events-none absolute inset-0 h-full w-full object-cover transition-[filter] duration-150 group-hover:filter-[blur(1.5px)_saturate(50%)] group-focus-within:filter-[blur(1.5px)_saturate(50%)] motion-reduce:transition-none",
                  }),
                  e.title
                    ? (0, r.jsx)("div", {
                        className:
                          "pointer-events-none absolute left-1/2 top-2 max-w-[92%] -translate-x-1/2 px-2 transition-[filter] duration-150 filter-[drop-shadow(0_0_1.5px_rgba(0,0,0,1))_drop-shadow(0_0_2px_rgba(0,0,0,0.1))] group-hover:filter-[blur(1.5px)_drop-shadow(0_0_1.5px_rgba(0,0,0,1))_drop-shadow(0_0_2px_rgba(0,0,0,0.1))] group-focus-within:filter-[blur(1.5px)_drop-shadow(0_0_1.5px_rgba(0,0,0,1))_drop-shadow(0_0_2px_rgba(0,0,0,0.1))] motion-reduce:transition-none",
                        children: (0, r.jsx)("p", {
                          className:
                            "text-caption md:text-compact-body font-semibold leading-tight text-white text-center truncate",
                          children: e.title,
                        }),
                      })
                    : null,
                  (0, r.jsxs)("div", {
                    className:
                      "pointer-events-none absolute inset-x-0 bottom-0 z-20 h-[35%] opacity-0 transition-opacity duration-150 group-hover:pointer-events-auto group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:opacity-100 motion-reduce:transition-none",
                    children: [
                      (0, r.jsx)("div", {
                        className:
                          "absolute inset-0 bg-linear-to-t from-black/75 via-black/40 to-transparent",
                      }),
                      (0, r.jsxs)("div", {
                        className:
                          "relative h-full flex items-center justify-between gap-2 px-3",
                        children: [
                          (0, r.jsxs)("div", {
                            className: "flex items-center gap-1.5 min-w-0",
                            children: [
                              e.avatarUrl
                                ? (0, r.jsx)("img", {
                                    src: e.avatarUrl,
                                    alt: "",
                                    draggable: !1,
                                    className:
                                      "w-3.5 h-3.5 rounded-full object-cover shrink-0 ring-1 ring-white/20",
                                  })
                                : null,
                              (0, r.jsx)("span", {
                                className:
                                  "text-caption md:text-body font-medium text-white/90 truncate",
                                children: e.username,
                              }),
                            ],
                          }),
                          (0, r.jsxs)("div", {
                            className: "flex items-center gap-1 shrink-0",
                            children: [
                              "number" == typeof e.creditsUsed
                                ? (0, r.jsxs)(en.m_, {
                                    children: [
                                      (0, r.jsx)(en.k$, {
                                        asChild: !0,
                                        children: (0, r.jsxs)("span", {
                                          tabIndex: 0,
                                          "aria-label": `Estimated credit cost: ${(0, ec.Ql)(e.creditsUsed)}`,
                                          className: (0, es.cn)(
                                            "flex items-center gap-1 px-2 py-1.5 rounded-lg",
                                            "text-micro font-medium tabular-nums",
                                            "text-white/80",
                                            "cursor-default select-none outline-hidden focus-visible:ring-2 focus-visible:ring-ring",
                                          ),
                                          children: [
                                            (0, r.jsx)(tB.A, {
                                              className: "w-3.5 h-3.5",
                                              "aria-hidden": "true",
                                            }),
                                            (0, r.jsx)("span", {
                                              children: (0, ec.Ql)(
                                                e.creditsUsed,
                                              ),
                                            }),
                                          ],
                                        }),
                                      }),
                                      (0, r.jsx)(en.ZI, {
                                        side: "top",
                                        children: (0, r.jsxs)("div", {
                                          className: "max-w-xs",
                                          children: [
                                            (0, r.jsx)("p", {
                                              className: "font-semibold mb-1",
                                              children: "Estimated Credit Cost",
                                            }),
                                            (0, r.jsx)("p", {
                                              className:
                                                "text-caption text-muted-foreground",
                                              children: `This prompt was sent on ${((d = e.createdAt), new Intl.DateTimeFormat(void 0, { year: "numeric", month: "short", day: "numeric" }).format(new Date(d)))} using ${(0, I.$L)(e.model ?? void 0)}. Costs tend to decrease over time.`,
                                            }),
                                          ],
                                        }),
                                      }),
                                    ],
                                  })
                                : null,
                              (0, r.jsxs)(ef.$n, {
                                type: "button",
                                variant: "ghost",
                                "aria-label": a
                                  ? `Unlike — ${e.likes} likes`
                                  : `Like — ${e.likes} likes`,
                                onClick: j,
                                className: (0, es.cn)(
                                  "h-auto gap-1 rounded-lg border px-2 py-1.5",
                                  "transition-[background-color,border-color,color,box-shadow] duration-150 motion-reduce:transition-none",
                                  "text-micro font-medium tabular-nums",
                                  a
                                    ? "border-destructive/40 bg-destructive/10 text-destructive data-[enabled]:hover:bg-destructive/20 data-[enabled]:hover:text-destructive"
                                    : "bg-white/10 border-white/20 text-white/80 data-[enabled]:hover:text-white data-[enabled]:hover:bg-white/20",
                                ),
                                children: [
                                  (0, r.jsx)(tb.A, {
                                    className: "w-3.5 h-3.5",
                                    fill: a ? "currentColor" : "none",
                                    "aria-hidden": "true",
                                  }),
                                  (0, r.jsx)("span", {
                                    children:
                                      (c = e.likes) < 1e3
                                        ? String(c)
                                        : c < 1e4
                                          ? `${(c / 1e3).toFixed(1).replace(/\.0$/, "")}k`
                                          : `${Math.round(c / 1e3)}k`,
                                  }),
                                ],
                              }),
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                  (0, r.jsxs)("div", {
                    className:
                      "pointer-events-none absolute inset-0 flex scale-90 flex-col items-center justify-center gap-1 pb-[10%] text-white opacity-0 transition-[opacity,transform] duration-150 ease-out group-hover:scale-100 group-hover:opacity-100 group-focus-within:scale-100 group-focus-within:opacity-100 motion-reduce:scale-100 motion-reduce:transition-none",
                    style: {
                      filter:
                        "drop-shadow(0 0 3px rgba(0,0,0,0.8)) drop-shadow(0 0 8px rgba(0,0,0,0.8))",
                    },
                    children: [
                      (0, r.jsx)(tG.A, {
                        className: "h-[1.4rem] w-[1.4rem]",
                        "aria-hidden": "true",
                      }),
                      (0, r.jsx)("span", {
                        className: "text-body font-bold leading-none",
                        children: "View Prompt",
                      }),
                    ],
                  }),
                ],
              })
            : (0, r.jsx)(tw.E, {
                className: "h-full w-full rounded-lg bg-white/5",
              }),
        });
      });
      function t5({
        compact: e = !1,
        onLightboxOpenChange: t,
        onCommunityCardSaved: n,
        onCommunityCardUnsaved: i,
        scrollRootRef: l,
      } = {}) {
        let d = (0, tp.I)(),
          [c, u] = (0, o.useState)(null),
          [m, p] = (0, o.useState)([]),
          [h, g] = (0, o.useState)(null);
        (0, o.useEffect)(() => {
          g(document.body);
        }, []);
        let [x, y] = (0, o.useState)(""),
          [v, w] = (0, o.useState)(""),
          [j, k] = (0, o.useState)("most-liked"),
          [N, I] = (0, o.useState)(!1);
        (0, o.useEffect)(() => {
          let e = setTimeout(() => w(x), 250);
          return () => clearTimeout(e);
        }, [x]);
        let C = (function (e, t, n) {
            let r = (0, s.BN)(),
              [i, l] = (0, o.useState)([]),
              [d, c] = (0, o.useState)("LoadingFirstPage"),
              u = (0, o.useRef)(null),
              m = (0, o.useRef)(!1),
              p = (0, o.useRef)(0);
            (0, o.useEffect)(() => {
              let n = ++p.current;
              ((u.current = null),
                (m.current = !0),
                l([]),
                c("LoadingFirstPage"),
                r
                  .query(a.FH.playtestGifs.listAccepted, {
                    paginationOpts: { numItems: 24, cursor: null },
                    searchQuery: e,
                    sortMode: t,
                  })
                  .then((e) => {
                    n === p.current &&
                      ((u.current = e.continueCursor),
                      l(e.page),
                      c(e.isDone ? "Exhausted" : "CanLoadMore"));
                  })
                  .catch((e) => {
                    n === p.current &&
                      (console.warn(
                        "[CommunityGallery] listAccepted first page failed",
                        e,
                      ),
                      c("Exhausted"));
                  })
                  .finally(() => {
                    n === p.current && (m.current = !1);
                  }));
            }, [r, e, t, 24]);
            let h = (0, o.useCallback)(
              (n) => {
                if (m.current) return;
                let s = u.current;
                if (null === s) return;
                let i = p.current;
                ((m.current = !0),
                  c("LoadingMore"),
                  r
                    .query(a.FH.playtestGifs.listAccepted, {
                      paginationOpts: { numItems: n, cursor: s },
                      searchQuery: e,
                      sortMode: t,
                    })
                    .then((e) => {
                      i === p.current &&
                        ((u.current = e.continueCursor),
                        l((t) => [...t, ...e.page]),
                        c(e.isDone ? "Exhausted" : "CanLoadMore"));
                    })
                    .catch((e) => {
                      i === p.current &&
                        (console.warn(
                          "[CommunityGallery] listAccepted loadMore failed",
                          e,
                        ),
                        c("CanLoadMore"));
                    })
                    .finally(() => {
                      i === p.current && (m.current = !1);
                    }));
              },
              [r, e, t],
            );
            return { results: i, status: d, loadMore: h };
          })(v, j, 24),
          S = C.results,
          A = (0, s.BN)(),
          [P, M] = (0, o.useState)(void 0);
        (0, o.useEffect)(() => {
          let e = !1;
          return (
            A.query(a.FH.playtestGifs.getAcceptedCount, {})
              .then((t) => {
                e || M(t);
              })
              .catch((e) => {
                console.warn(
                  "[CommunityGallery] getAcceptedCount fetch failed",
                  e,
                );
              }),
            () => {
              e = !0;
            }
          );
        }, [A]);
        let _ = (0, o.useMemo)(
            () =>
              S.filter((e) => null !== e.url).map((e) => ({
                id: e._id,
                username: e.creatorUsername ?? e.creatorName ?? "anonymous",
                avatarUrl: e.creatorAvatarUrl ?? null,
                title: e.title?.trim() ? e.title.trim() : null,
                prompt: e.originalPrompt ?? "Untitled prompt",
                imageUrl: e.url,
                previewImageUrl: e.previewUrl ?? null,
                timeAgo: (function (e) {
                  let t = Math.floor(Math.max(0, Date.now() - e) / 1e3);
                  if (t < 60) return `${t}s`;
                  let n = Math.floor(t / 60);
                  if (n < 60) return `${n}m`;
                  let r = Math.floor(n / 60);
                  if (r < 24) return `${r}h`;
                  let a = Math.floor(r / 24);
                  if (a < 7) return `${a}d`;
                  let s = Math.floor(a / 7);
                  if (s < 5) return `${s}w`;
                  let i = Math.floor(a / 30);
                  return i < 12 ? `${i}mo` : `${Math.floor(a / 365)}y`;
                })(e._creationTime),
                likes: e.likeCount ?? 0,
                createdAt: e._creationTime,
                creditsUsed:
                  "number" == typeof e.creditsUsed ? e.creditsUsed : null,
                model: e.model ?? null,
              })),
            [S],
          ),
          T = (function (e) {
            let t = (0, s.BN)(),
              [n, r] = (0, o.useState)([]),
              i = (0, o.useRef)(0);
            return (
              (0, o.useEffect)(() => {
                if (0 === e.length) return void r([]);
                let n = ++i.current;
                t.query(a.FH.likedPlaytestGifs.getLikedSetForGifs, {
                  playtestGifIds: e,
                })
                  .then((e) => {
                    n === i.current && r(e);
                  })
                  .catch((e) => {
                    n === i.current &&
                      console.warn(
                        "[CommunityGallery] getLikedSetForGifs failed",
                        e,
                      );
                  });
              }, [t, e]),
              (0, o.useMemo)(() => new Set(n), [n])
            );
          })((0, o.useMemo)(() => _.map((e) => e.id), [_])),
          [R, E] = (0, o.useState)(() => new Map()),
          $ = (0, o.useCallback)((e, t) => {
            E((n) => {
              let r = new Map(n);
              return (void 0 === t ? r.delete(e) : r.set(e, t), r);
            });
          }, []),
          L = (0, o.useMemo)(() => {
            if (0 === R.size) return T;
            let e = new Set(T);
            for (let [t, n] of R) n ? e.add(t) : e.delete(t);
            return e;
          }, [T, R]),
          F = (0, o.useRef)(L),
          U = (0, o.useRef)(R);
        ((0, o.useEffect)(() => {
          F.current = L;
        }, [L]),
          (0, o.useEffect)(() => {
            U.current = R;
          }, [R]));
        let D = (0, o.useMemo)(
            () =>
              0 === R.size
                ? _
                : _.map((e) => {
                    let t = R.get(e.id);
                    if (void 0 === t) return e;
                    let n = !!t - !!T.has(e.id);
                    return 0 === n
                      ? e
                      : { ...e, likes: Math.max(0, e.likes + n) };
                  }),
            [_, R, T],
          ),
          O = "LoadingFirstPage" === C.status,
          z = (0, o.useMemo)(
            () => (c ? (D.find((e) => e.id === c) ?? null) : null),
            [c, D],
          );
        (0, o.useEffect)(() => {
          (u(null), E(new Map()));
        }, [v, j]);
        let H = (0, s.n_)(a.FH.likedPlaytestGifs.toggleLike),
          q = (0, o.useRef)(new Set()),
          J = (0, o.useCallback)(
            (e) => {
              if (q.current.has(e)) return;
              q.current.add(e);
              let t = U.current.get(e),
                n = F.current.has(e);
              ($(e, !n),
                H({ playtestGifId: e })
                  .then((t) => {
                    $(e, t.liked);
                  })
                  .catch((n) => {
                    (console.warn("[CommunityGallery] toggleLike failed", n),
                      $(e, t));
                  })
                  .finally(() => {
                    q.current.delete(e);
                  }));
            },
            [H, $],
          );
        (0, o.useEffect)(() => {
          t?.(null !== c);
        }, [c, t]);
        let B = (0, o.useRef)(null),
          { status: G, loadMore: W } = C;
        (0, o.useEffect)(() => {
          if ("CanLoadMore" !== G) return;
          let e = B.current;
          if (!e) return;
          let t = new IntersectionObserver(
            ([e]) => {
              e.isIntersecting && W(24);
            },
            { root: l?.current ?? null, rootMargin: "400px 0px" },
          );
          return (t.observe(e), () => t.disconnect());
        }, [G, W, l]);
        let V = (0, o.useCallback)((e) => {
            (u(e.id),
              (0, b.sz)({
                cardId: e.id,
                cardTitle: e.title,
                prompt: e.prompt,
                creatorUsername: e.username,
                likesCount: e.likes,
              }));
          }, []),
          K = (0, o.useCallback)(
            (e, t, r) => {
              if ((J(e.id), r)) i?.(`${tX}${e.id}`);
              else {
                let t = t0({
                  playtestGifId: e.id,
                  title: e.title,
                  prompt: e.prompt,
                  imageUrl: e.imageUrl,
                });
                (t && n?.(t),
                  (0, b.lM)({
                    cardId: e.id,
                    cardTitle: e.title,
                    prompt: e.prompt,
                    creatorUsername: e.username,
                    likesCount: e.likes,
                    surface: "gallery_tile",
                  }));
              }
              if (r || d || !t) return;
              let a = t.getBoundingClientRect(),
                s = a.height,
                o = (5 * s) / 7,
                l = a.left + (a.width - o) / 2,
                c = a.top,
                u = document.querySelector("[data-deck-hand-target]"),
                m = 0,
                h = 0,
                g = 0.15;
              if (u) {
                let e = u.getBoundingClientRect();
                ((m = e.left + e.width / 2 - (l + o / 2)),
                  (h = e.top + e.height / 2 - (c + s / 2)),
                  (g = 0.6 * Math.min(e.width / o, e.height / s)));
              }
              let x = {
                id: `${e.id}-${Date.now()}`,
                imageUrl: e.previewImageUrl ?? e.imageUrl,
                startTop: c,
                startLeft: l,
                startWidth: o,
                startHeight: s,
                dx: m,
                dy: h,
                endScale: g,
              };
              p((e) => [...e, x]);
            },
            [J, n, i, d],
          ),
          Q = (0, o.useCallback)(
            (e) => {
              let t = L.has(e.id);
              if ((J(e.id), t)) i?.(`${tX}${e.id}`);
              else {
                let t = t0({
                  playtestGifId: e.id,
                  title: e.title,
                  prompt: e.prompt,
                  imageUrl: e.imageUrl,
                });
                (t && n?.(t),
                  (0, b.lM)({
                    cardId: e.id,
                    cardTitle: e.title,
                    prompt: e.prompt,
                    creatorUsername: e.username,
                    likesCount: e.likes,
                    surface: "lightbox",
                  }));
              }
            },
            [J, L, n, i],
          ),
          Y = (0, o.useCallback)(
            (e) => {
              let t = L.has(e.id);
              t || J(e.id);
              let r = t0({
                playtestGifId: e.id,
                title: e.title,
                prompt: e.prompt,
                imageUrl: e.imageUrl,
              });
              (r && n?.(r),
                (0, b.eN)({
                  cardId: e.id,
                  cardTitle: e.title,
                  prompt: e.prompt,
                  creatorUsername: e.username,
                  likesCount: e.likes,
                }),
                t ||
                  (0, b.lM)({
                    cardId: e.id,
                    cardTitle: e.title,
                    prompt: e.prompt,
                    creatorUsername: e.username,
                    likesCount: e.likes,
                    surface: "copy_shortcut",
                  }));
            },
            [J, L, n],
          ),
          Z = (0, o.useCallback)((e) => {
            p((t) => t.filter((t) => t.id !== e));
          }, []),
          X = (0, o.useRef)(null),
          [ee, et] = (0, o.useState)(!1),
          [en, er] = (0, o.useState)(!1);
        return (
          (0, o.useEffect)(() => {
            er(/Mac|iPhone|iPad|iPod/i.test(navigator.platform));
          }, []),
          (0, o.useEffect)(() => {
            let e = (e) => {
              if ((e.metaKey || e.ctrlKey) && "k" === e.key.toLowerCase()) {
                (e.preventDefault(), X.current?.focus(), X.current?.select());
                return;
              }
              "Escape" === e.key &&
                document.activeElement === X.current &&
                X.current?.blur();
            };
            return (
              document.addEventListener("keydown", e),
              () => document.removeEventListener("keydown", e)
            );
          }, []),
          (0, r.jsxs)("div", {
            className: "w-full",
            "aria-busy": O,
            children: [
              (0, r.jsx)("div", {
                className: (0, es.cn)(
                  "sticky top-0 z-10 pb-3 pt-2",
                  e
                    ? "-mx-2 bg-map-panel px-2"
                    : "-mx-4 bg-background px-4 md:-mx-20 md:px-20 dark:bg-card",
                ),
                children: (0, r.jsxs)("div", {
                  className: "relative w-full",
                  children: [
                    (0, r.jsx)(tf.A, {
                      className:
                        "absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground",
                      "aria-hidden": "true",
                    }),
                    (0, r.jsx)(tv.p, {
                      ref: X,
                      type: "text",
                      density: "compact",
                      placeholder:
                        void 0 === P
                          ? "Search prompts..."
                          : `Search ${P.toLocaleString()} prompts...`,
                      value: x,
                      onChange: (e) => y(e.target.value),
                      onFocus: () => et(!0),
                      onBlur: () => et(!1),
                      className:
                        "h-auto w-full rounded-lg border-border bg-neutral-200/5 py-2 pl-10 pr-28 text-foreground placeholder:text-muted-foreground focus-visible:border-white/20 focus-visible:ring-1 focus-visible:ring-white/15",
                    }),
                    (0, r.jsxs)("div", {
                      className:
                        "absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1.5",
                      children: [
                        (0, r.jsx)("kbd", {
                          className: (0, es.cn)(
                            "pointer-events-none",
                            "inline-flex h-6 select-none items-center gap-1 rounded-md",
                            "border border-white/10 px-2",
                            "font-mono text-micro font-medium text-white/35",
                          ),
                          children: ee
                            ? "ESC"
                            : (0, r.jsxs)(r.Fragment, {
                                children: [
                                  en
                                    ? (0, r.jsx)(tW.A, {
                                        className: "h-3.5 w-3.5",
                                      })
                                    : "Ctrl",
                                  "K",
                                ],
                              }),
                        }),
                        (0, r.jsxs)(tK.AM, {
                          open: N,
                          onOpenChange: I,
                          children: [
                            (0, r.jsx)(tK.Wv, {
                              asChild: !0,
                              children: (0, r.jsx)(ef.$n, {
                                type: "button",
                                variant: "ghost",
                                size: "icon-xs",
                                "aria-label": "Sort prompts",
                                className: (0, es.cn)(
                                  "h-6 w-6 rounded-md",
                                  "border border-white/10 text-white/55 hover:text-white/85 hover:bg-white/5",
                                  "transition-colors",
                                ),
                                children: (0, r.jsx)(tV.A, {
                                  className: "h-3.5 w-3.5",
                                }),
                              }),
                            }),
                            (0, r.jsx)(tK.hl, {
                              align: "end",
                              sideOffset: 6,
                              className: (0, es.cn)(
                                "w-40 p-1.5",
                                "rounded-xl bg-card backdrop-blur-xl",
                                "border border-border/80 shadow-xl",
                              ),
                              children: [
                                { id: "most-liked", label: "Most Liked" },
                                { id: "most-recent", label: "Most Recent" },
                              ].map((e) => {
                                let t = j === e.id;
                                return (0, r.jsxs)(
                                  ef.$n,
                                  {
                                    type: "button",
                                    variant: "ghost",
                                    onClick: () => {
                                      (k(e.id), I(!1));
                                    },
                                    className: (0, es.cn)(
                                      "h-auto w-full justify-between gap-2 rounded-lg px-2.5 py-2",
                                      "text-body transition-colors cursor-pointer",
                                      t
                                        ? "text-foreground"
                                        : "text-muted-foreground hover:bg-muted/50 hover:text-foreground",
                                    ),
                                    children: [
                                      (0, r.jsx)("span", {
                                        className: "leading-tight",
                                        children: e.label,
                                      }),
                                      t
                                        ? (0, r.jsx)(eD.A, {
                                            className: "h-3.5 w-3.5 shrink-0",
                                          })
                                        : null,
                                    ],
                                  },
                                  e.id,
                                );
                              }),
                            }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
              }),
              O
                ? (0, r.jsx)("div", {
                    className: (0, es.cn)(
                      "grid grid-cols-2",
                      e ? "gap-2.5" : "gap-3 md:grid-cols-3",
                    ),
                    role: "status",
                    "aria-label": "Loading community prompts",
                    children: Array.from({ length: 9 }).map((e, t) =>
                      (0, r.jsx)(
                        tw.E,
                        {
                          className:
                            "aspect-video w-full rounded-lg bg-white/5",
                        },
                        t,
                      ),
                    ),
                  })
                : 0 === _.length
                  ? v
                    ? (0, r.jsxs)("div", {
                        className:
                          "flex items-center justify-center py-24 text-body text-white/40",
                        children: ["No prompts match “", x, "”."],
                      })
                    : (0, r.jsx)("div", {
                        className:
                          "flex items-center justify-center py-24 text-body text-white/40",
                        children: "No playtest GIFs yet — check back soon.",
                      })
                  : (0, r.jsxs)(r.Fragment, {
                      children: [
                        (0, r.jsx)("div", {
                          className: (0, es.cn)(
                            "grid grid-cols-2",
                            e ? "gap-2.5" : "gap-3 md:grid-cols-3",
                          ),
                          children: D.map((e) =>
                            (0, r.jsx)(
                              t1,
                              {
                                card: e,
                                isLightboxActive: z?.id === e.id,
                                isAnyLightboxOpen: null !== c,
                                isLiked: L.has(e.id),
                                scrollRootRef: l,
                                onSelect: V,
                                onLike: K,
                              },
                              e.id,
                            ),
                          ),
                        }),
                        (0, r.jsx)("div", {
                          ref: B,
                          "aria-hidden": !0,
                          className: "h-px w-full",
                        }),
                        "LoadingMore" === C.status
                          ? (0, r.jsx)("div", {
                              className:
                                "flex items-center justify-center py-6 text-caption text-white/40",
                              children: "Loading more…",
                            })
                          : null,
                      ],
                    }),
              (0, r.jsx)(tZ, {
                card: z,
                isLiked: !!z && L.has(z.id),
                onToggleLike: Q,
                onCopyPrompt: Y,
                onClose: () => u(null),
              }),
              h &&
                (0, f.createPortal)(
                  (0, r.jsx)("div", {
                    className: "pointer-events-none",
                    children: m.map((e) =>
                      (0, r.jsx)(
                        ev.P.div,
                        {
                          style: {
                            position: "fixed",
                            top: e.startTop,
                            left: e.startLeft,
                            width: e.startWidth,
                            height: e.startHeight,
                            perspective: 1e3,
                            zIndex: 200,
                          },
                          initial: { x: 0, y: 0, scale: 1, opacity: 1 },
                          animate: {
                            x: e.dx,
                            y: e.dy,
                            scale: [1, 1.4, 1.4, e.endScale],
                            opacity: 0,
                          },
                          transition: {
                            scale: {
                              duration: 1.8,
                              times: [0, 0.15, 0.6, 1],
                              ease: "easeInOut",
                            },
                            x: { duration: 0.8, delay: 1, ease: "easeIn" },
                            y: { duration: 0.8, delay: 1, ease: "easeIn" },
                            opacity: {
                              duration: 0.45,
                              delay: 1.35,
                              ease: "easeIn",
                            },
                          },
                          onAnimationComplete: () => Z(e.id),
                          children: (0, r.jsxs)(ev.P.div, {
                            className:
                              "relative h-full w-full rounded-xl overflow-hidden shadow-2xl",
                            style: {
                              transformStyle: "preserve-3d",
                              backgroundColor: "var(--color-neutral-700)",
                              border: "4px solid rgba(1, 1, 1, 0.1)",
                            },
                            initial: { rotateY: 0 },
                            animate: { rotateY: 180 },
                            transition: {
                              duration: 1.35,
                              ease: [0.2, 0.9, 0.2, 1.1],
                            },
                            children: [
                              (0, r.jsx)("img", {
                                src: e.imageUrl,
                                alt: "",
                                draggable: !1,
                                className:
                                  "absolute inset-0 h-full w-full object-cover",
                                style: {
                                  backfaceVisibility: "hidden",
                                  WebkitBackfaceVisibility: "hidden",
                                },
                              }),
                              (0, r.jsx)("div", {
                                className:
                                  "absolute inset-0 flex items-center justify-center bg-linear-to-br from-neutral-700 to-neutral-900",
                                style: {
                                  transform: "rotateY(180deg)",
                                  backfaceVisibility: "hidden",
                                  WebkitBackfaceVisibility: "hidden",
                                },
                                children: (0, r.jsx)(tb.A, {
                                  className: "w-8 h-8 text-white",
                                  fill: "currentColor",
                                  "aria-hidden": "true",
                                }),
                              }),
                            ],
                          }),
                        },
                        e.id,
                      ),
                    ),
                  }),
                  h,
                ),
            ],
          })
        );
      }
      var t2 = n(61461),
        t4 = n(66441);
      function t3(e) {
        return e?.hasMachine === !0 && (0, t4.gJ)(e.provisioningStatus);
      }
      var t6 = n(95419),
        t8 = n(61194),
        t7 = n(31403);
      let t9 = (0, o.memo)(function ({
          open: e,
          onOpenChange: t,
          creditsRemaining: n,
          creditLimit: a,
          resetAt: s,
          userTier: i,
          hasJoinedDiscord: l,
          onOpenStorePurchases: d,
        }) {
          let { user: c } = (0, t6.Jd)(),
            [u, p] = (0, o.useState)(!1),
            [h, g] = (0, o.useState)(!1),
            [x, f] = (0, o.useState)(null),
            [b, y] = (0, o.useState)(!1),
            [v, w] = (0, o.useState)(!1),
            j = "PRO" === i || "ENTERPRISE" === i,
            k = c?.externalAccounts.find(
              (e) => "discord" === e.provider || "oauth_discord" === e.provider,
            ),
            N = !!k,
            I = (0, o.useRef)(!1),
            C = (0, o.useMemo)(() => Math.max(n, 0), [n]),
            S = async () => {
              c &&
                (p(!0),
                f(null),
                await c
                  .createExternalAccount({
                    strategy: "oauth_discord",
                    redirectUrl: window.location.href,
                  })
                  .then((e) => {
                    e.verification?.externalVerificationRedirectURL &&
                      (window.location.href =
                        e.verification.externalVerificationRedirectURL.href);
                  })
                  .catch((e) => {
                    if (
                      e?.errors?.[0]?.code === "oauth_account_already_connected"
                    ) {
                      (p(!1), A());
                      return;
                    }
                    (f("Failed to connect Discord. Please try again."), p(!1));
                  }));
            },
            A = async () => {
              (g(!0),
                f(null),
                await fetch("/api/unlock/discord", { method: "POST" })
                  .then(async (e) => {
                    let n = await e.json();
                    if (!e.ok) {
                      if ("Discord not connected" === n.error) {
                        (g(!1), S());
                        return;
                      }
                      (n.discordInvite
                        ? y(!0)
                        : f(n.message || "Failed to verify Discord membership"),
                        g(!1));
                      return;
                    }
                    (t(!1), window.location.reload());
                  })
                  .catch(() => {
                    (f("Failed to verify Discord. Please try again."), g(!1));
                  }));
            };
          return ((0, o.useEffect)(() => {
            if (e && N && !l && !h && !I.current) {
              I.current = !0;
              let e = setTimeout(() => {
                A();
              }, 500);
              return () => clearTimeout(e);
            }
            e || (I.current = !1);
          }, [e, N, l, h]),
          e)
            ? (0, r.jsxs)("div", {
                className:
                  "fixed inset-0 z-110 flex items-center justify-center bg-black/70 backdrop-blur-xs p-4",
                onClick: () => t(!1),
                children: [
                  (0, r.jsx)("div", {
                    "aria-hidden": "true",
                    className: (0, es.cn)(
                      "pointer-events-none absolute top-1/2 left-1/2 h-[120vmin] w-[120vmin] -translate-x-1/2 -translate-y-1/2 rounded-full",
                      "bg-surface-glow-soft",
                      "blur-2xl",
                    ),
                  }),
                  (0, r.jsxs)("div", {
                    className: (0, es.cn)(
                      "bg-card relative w-full max-w-[400px] rounded-xl dark:bg-transparent",
                      "p-1.5 shadow-xl backdrop-blur-xl",
                      "dark:border-border/80 border",
                    ),
                    onClick: (e) => e.stopPropagation(),
                    children: [
                      (0, r.jsxs)("div", {
                        className: (0, es.cn)(
                          "bg-muted/80 dark:bg-muted/50 relative mb-0 rounded-xl border p-6",
                        ),
                        children: [
                          (0, r.jsx)("div", {
                            "aria-hidden": "true",
                            className:
                              "absolute inset-x-0 top-0 h-48 rounded-[inherit] pointer-events-none",
                            style: {
                              background:
                                "linear-gradient(180deg, rgba(255,255,255,0.07) 0%, rgba(255,255,255,0.03) 40%, rgba(0,0,0,0) 100%)",
                            },
                          }),
                          (0, r.jsxs)("div", {
                            className: "relative mb-3 flex items-end gap-2",
                            children: [
                              (j || l) &&
                                s &&
                                (0, r.jsxs)("span", {
                                  className:
                                    "absolute top-0 right-0 rounded-full border border-neutral-500/30 bg-neutral-500/10 px-2 py-0.5 text-caption text-neutral-400",
                                  children: [
                                    "Refills in ",
                                    ((e) => {
                                      let t = e - Date.now(),
                                        n = Math.floor(t / 36e5),
                                        r = Math.floor((t % 36e5) / 6e4);
                                      return n > 0 ? `${n}h ${r}m` : `${r}m`;
                                    })(s),
                                  ],
                                }),
                              (0, r.jsx)("span", {
                                className: "text-metric",
                                children: (0, ec.Ql)(C),
                              }),
                              (0, r.jsx)("span", {
                                className:
                                  "pb-2 text-body-lg text-muted-foreground",
                                children: "credits available",
                              }),
                            ],
                          }),
                          (0, r.jsx)("p", {
                            className:
                              "relative text-body text-muted-foreground",
                            children: "You're running out of credits.",
                          }),
                        ],
                      }),
                      (0, r.jsxs)("div", {
                        className: "p-4 rounded-xl",
                        children: [
                          (0, r.jsxs)("div", {
                            className: "flex items-center gap-3 mb-2",
                            children: [
                              (0, r.jsx)("span", {
                                className: "h-px flex-1 bg-muted-foreground/40",
                              }),
                              (0, r.jsx)("span", {
                                className:
                                  "shrink-0 text-body-lg font-semibold text-foreground",
                                children: "Get more credits",
                              }),
                              (0, r.jsx)("span", {
                                className: "h-px flex-1 bg-muted-foreground/40",
                              }),
                            ],
                          }),
                          (0, r.jsxs)("div", {
                            className: "space-y-2",
                            children: [
                              (0, r.jsxs)(en.m_, {
                                children: [
                                  (0, r.jsx)(en.k$, {
                                    asChild: !0,
                                    children: (0, r.jsxs)("div", {
                                      className: (0, es.cn)(
                                        "flex items-center justify-between gap-4 px-4 py-2 rounded-xl",
                                        "border-2 border-border hover:bg-muted/50 transition-colors cursor-pointer",
                                      ),
                                      children: [
                                        (0, r.jsxs)("div", {
                                          className:
                                            "flex items-center gap-3 flex-1",
                                          children: [
                                            l
                                              ? (0, r.jsx)(t8.A, {
                                                  className:
                                                    "h-5 w-5 shrink-0 text-success",
                                                })
                                              : (0, r.jsx)(eY.A, {
                                                  className:
                                                    "h-5 w-5 text-muted-foreground shrink-0",
                                                }),
                                            (0, r.jsx)("div", {
                                              className: "flex-1",
                                              children: b
                                                ? (0, r.jsxs)(r.Fragment, {
                                                    children: [
                                                      (0, r.jsx)("div", {
                                                        className:
                                                          "text-body font-medium text-foreground",
                                                        children:
                                                          k?.username &&
                                                          (0, r.jsxs)("span", {
                                                            className:
                                                              "text-success",
                                                            children: [
                                                              "@",
                                                              k.username,
                                                            ],
                                                          }),
                                                      }),
                                                      (0, r.jsxs)("p", {
                                                        className:
                                                          "mt-0.5 text-caption text-muted-foreground",
                                                        children: [
                                                          "Join our server to unlock +",
                                                          ec.OK,
                                                          " daily credits",
                                                        ],
                                                      }),
                                                    ],
                                                  })
                                                : (0, r.jsxs)(r.Fragment, {
                                                    children: [
                                                      (0, r.jsxs)("div", {
                                                        className:
                                                          "text-body font-medium text-foreground",
                                                        children: [
                                                          (0, r.jsx)("span", {
                                                            className: (0,
                                                            es.cn)(
                                                              l &&
                                                                "line-through text-muted-foreground",
                                                            ),
                                                            children:
                                                              "Join Discord for",
                                                          }),
                                                          " ",
                                                          (0, r.jsxs)("span", {
                                                            className: (0,
                                                            es.cn)(
                                                              "font-bold text-foreground",
                                                              l &&
                                                                "line-through text-muted-foreground",
                                                            ),
                                                            children: [
                                                              "+",
                                                              ec.OK,
                                                              " daily credits",
                                                            ],
                                                          }),
                                                        ],
                                                      }),
                                                      x &&
                                                        (0, r.jsx)("div", {
                                                          className:
                                                            "mt-1 text-caption text-destructive",
                                                          children: x,
                                                        }),
                                                    ],
                                                  }),
                                            }),
                                          ],
                                        }),
                                        !l &&
                                          (N
                                            ? h
                                              ? (0, r.jsx)("div", {
                                                  className:
                                                    "w-[96px] flex items-center justify-center",
                                                  children: (0, r.jsx)(m.A, {
                                                    className:
                                                      "h-4 w-4 animate-spin text-muted-foreground",
                                                  }),
                                                })
                                              : b
                                                ? (0, r.jsx)(ef.$n, {
                                                    onClick: () => {
                                                      window.open(
                                                        "https://discord.gg/lemonade",
                                                        "_blank",
                                                      );
                                                      let e = () => {
                                                        (window.removeEventListener(
                                                          "focus",
                                                          e,
                                                        ),
                                                          A());
                                                      };
                                                      window.addEventListener(
                                                        "focus",
                                                        e,
                                                      );
                                                    },
                                                    className: (0, es.cn)(
                                                      "rounded-xl flex flex-row items-center justify-center shrink-0",
                                                      "h-auto w-[96px] bg-discord py-2 text-body font-semibold text-white",
                                                      "transition-colors hover:bg-discord-hover",
                                                    ),
                                                    children: "Join",
                                                  })
                                                : null
                                            : (0, r.jsx)(ef.$n, {
                                                onClick: S,
                                                disabled: u,
                                                className: (0, es.cn)(
                                                  "rounded-xl flex flex-row items-center justify-center shrink-0",
                                                  "bg-white dark:bg-white w-[96px] text-body font-semibold text-black",
                                                  "hover:bg-neutral-100 transition-colors py-2 h-auto",
                                                ),
                                                children: u
                                                  ? (0, r.jsxs)(r.Fragment, {
                                                      children: [
                                                        (0, r.jsx)(m.A, {
                                                          className:
                                                            "mr-2 h-4 w-4 animate-spin",
                                                        }),
                                                        "Connect",
                                                      ],
                                                    })
                                                  : "Connect",
                                              })),
                                      ],
                                    }),
                                  }),
                                  (0, r.jsx)(en.ZI, {
                                    className: "z-150",
                                    children: l
                                      ? (0, r.jsx)("p", {
                                          children:
                                            "You already joined the Lemonade Discord.",
                                        })
                                      : N
                                        ? (0, r.jsx)("p", {
                                            children:
                                              "Verify your membership in the Lemonade Discord",
                                          })
                                        : (0, r.jsx)("p", {
                                            children:
                                              "Connect your Discord account to get started",
                                          }),
                                  }),
                                ],
                              }),
                              (0, r.jsxs)("div", {
                                className: "flex gap-2",
                                children: [
                                  (0, r.jsxs)(en.m_, {
                                    children: [
                                      (0, r.jsx)(en.k$, {
                                        asChild: !0,
                                        children: (0, r.jsxs)("button", {
                                          onClick: () => {
                                            w(!0);
                                          },
                                          disabled: j,
                                          className: (0, es.cn)(
                                            "flex-1 flex flex-col items-center justify-center gap-2 px-4 py-3 rounded-xl",
                                            "border-2 border-border transition-colors",
                                            j
                                              ? "opacity-50 cursor-not-allowed"
                                              : "hover:bg-muted/50 cursor-pointer",
                                          ),
                                          children: [
                                            (0, r.jsx)(eo.default, {
                                              src: "https://beaming-hawk-976.convex.cloud/api/storage/6997170c-3fdf-44ea-ac9b-bd76318f7155",
                                              alt: "PRO",
                                              width: 24,
                                              height: 24,
                                              className: "h-6 w-6",
                                            }),
                                            (0, r.jsx)("div", {
                                              className:
                                                "text-body font-bold text-foreground",
                                              children: "Upgrade to Pro",
                                            }),
                                          ],
                                        }),
                                      }),
                                      (0, r.jsx)(en.ZI, {
                                        className: "z-150",
                                        children: (0, r.jsx)("p", {
                                          children: "Get up to 40 credits",
                                        }),
                                      }),
                                    ],
                                  }),
                                  (0, r.jsxs)(en.m_, {
                                    children: [
                                      (0, r.jsx)(en.k$, {
                                        asChild: !0,
                                        children: (0, r.jsxs)("button", {
                                          onClick: () => {
                                            (t(!1), d?.());
                                          },
                                          className: (0, es.cn)(
                                            "flex-1 flex flex-col items-center justify-center gap-2 px-4 py-3 rounded-xl",
                                            "border-2 border-border hover:bg-muted/50 transition-colors cursor-pointer",
                                          ),
                                          children: [
                                            (0, r.jsx)(tB.A, {
                                              className:
                                                "h-6 w-6 text-muted-foreground",
                                            }),
                                            (0, r.jsx)("div", {
                                              className:
                                                "text-body font-bold text-foreground",
                                              children: "Credit Packs",
                                            }),
                                          ],
                                        }),
                                      }),
                                      (0, r.jsx)(en.ZI, {
                                        className: "z-150",
                                        children: (0, r.jsx)("p", {
                                          children: "Top up anytime",
                                        }),
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                            ],
                          }),
                        ],
                      }),
                    ],
                  }),
                  (0, r.jsx)(t7.A, {
                    open: v,
                    onOpenChange: w,
                    onConfirm: () => {
                      let e = [
                        "9c880d0f-8a6f-418a-9653-f1197f15e0cd",
                        "c7e2339b-d798-4439-8561-5b4ccce572af",
                      ].filter(Boolean);
                      if (0 === e.length) return;
                      let t = e.map((e) => `products=${e}`).join("&");
                      window.open(
                        `/api/checkout?${t}`,
                        "_blank",
                        "noopener,noreferrer",
                      );
                    },
                    purchaseType: "Pro Plan ($19.99/month)",
                  }),
                ],
              })
            : null;
        }),
        ne = o.memo(
          ({
            error: e,
            errorCode: t,
            userMessage: n,
            projectId: a,
            requestUrl: s,
            statusCode: i,
            timestamp: o,
            freeModelResetAt: l,
          }) => {
            let d =
                e.toLowerCase().includes("outdated") ||
                e.toLowerCase().includes("refresh the page"),
              c = "agent_timeout" === t,
              u = "network_error" === t,
              m = "no_response" === t,
              p = "context_overflow" === t,
              h = "rate_limit" === t,
              g = "model_not_available" === t,
              x = "free_model_quota_exceeded" === t,
              f = t === I.QP || t === I.yj,
              b =
                d || c || u || "agent_already_running" === t || n
                  ? null
                  : "Please try again in 10 minutes";
            if (c || u)
              return (0, r.jsxs)("div", {
                className:
                  "flex flex-col items-center justify-center rounded-lg border border-warning/40 bg-warning/10 p-4",
                children: [
                  (0, r.jsxs)("div", {
                    className: "mb-2 flex items-center text-warning",
                    children: [
                      (0, r.jsx)("svg", {
                        className: "w-5 h-5 mr-1.5",
                        fill: "none",
                        stroke: "currentColor",
                        viewBox: "0 0 24 24",
                        children: (0, r.jsx)("path", {
                          strokeLinecap: "round",
                          strokeLinejoin: "round",
                          strokeWidth: 2,
                          d: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z",
                        }),
                      }),
                      (0, r.jsx)("span", {
                        className: "font-medium text-body",
                        children: u
                          ? "Connection Lost"
                          : "Request Taking Longer Than Expected",
                      }),
                    ],
                  }),
                  (0, r.jsx)("p", {
                    className:
                      "mb-3 max-w-md text-center text-body text-warning",
                    children: e,
                  }),
                  (a || i || o) &&
                    (0, r.jsxs)("div", {
                      className:
                        "mt-2 flex flex-wrap gap-x-3 font-mono text-caption text-warning",
                      children: [
                        a &&
                          (0, r.jsxs)("span", { children: ["Project: ", a] }),
                        i && (0, r.jsxs)("span", { children: ["Status: ", i] }),
                        o && (0, r.jsxs)("span", { children: ["Time: ", o] }),
                      ],
                    }),
                ],
              });
            if (h)
              return (0, r.jsxs)("div", {
                className:
                  "flex flex-col items-center justify-center rounded-lg border border-warning/40 bg-warning/10 p-4",
                children: [
                  (0, r.jsxs)("div", {
                    className: "mb-2 flex items-center text-warning",
                    children: [
                      (0, r.jsx)("svg", {
                        className: "w-5 h-5 mr-1.5",
                        fill: "none",
                        stroke: "currentColor",
                        viewBox: "0 0 24 24",
                        children: (0, r.jsx)("path", {
                          strokeLinecap: "round",
                          strokeLinejoin: "round",
                          strokeWidth: 2,
                          d: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
                        }),
                      }),
                      (0, r.jsx)("span", {
                        className: "font-medium text-body",
                        children: "Model At Capacity",
                      }),
                    ],
                  }),
                  (0, r.jsx)("p", {
                    className:
                      "mb-2 max-w-md text-center text-body text-warning",
                    children:
                      n ||
                      "This model is at capacity due to high demand. Please try again in 1 hour or switch to a different AI model.",
                  }),
                ],
              });
            if (g)
              return (0, r.jsxs)("div", {
                className:
                  "flex flex-col items-center justify-center rounded-lg border border-warning/40 bg-warning/10 p-4",
                children: [
                  (0, r.jsxs)("div", {
                    className: "mb-2 flex items-center text-warning",
                    children: [
                      (0, r.jsx)("svg", {
                        className: "w-5 h-5 mr-1.5",
                        fill: "none",
                        stroke: "currentColor",
                        viewBox: "0 0 24 24",
                        children: (0, r.jsx)("path", {
                          strokeLinecap: "round",
                          strokeLinejoin: "round",
                          strokeWidth: 2,
                          d: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
                        }),
                      }),
                      (0, r.jsx)("span", {
                        className: "font-medium text-body",
                        children: "Model Not Available",
                      }),
                    ],
                  }),
                  (0, r.jsx)("p", {
                    className:
                      "mb-2 max-w-md text-center text-body text-warning",
                    children: n || e,
                  }),
                  (0, r.jsx)("p", {
                    className:
                      "mb-2 max-w-md text-center text-body text-warning",
                    children:
                      "Please switch to a different model and try again.",
                  }),
                ],
              });
            if (f)
              return (0, r.jsxs)("div", {
                className:
                  "flex flex-col items-center justify-center rounded-lg border border-warning/40 bg-warning/10 p-4",
                children: [
                  (0, r.jsxs)("div", {
                    className: "mb-2 flex items-center text-warning",
                    children: [
                      (0, r.jsx)("svg", {
                        className: "w-5 h-5 mr-1.5",
                        fill: "none",
                        stroke: "currentColor",
                        viewBox: "0 0 24 24",
                        children: (0, r.jsx)("path", {
                          strokeLinecap: "round",
                          strokeLinejoin: "round",
                          strokeWidth: 2,
                          d: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
                        }),
                      }),
                      (0, r.jsx)("span", {
                        className: "font-medium text-body",
                        children: "Choose a multimodal model",
                      }),
                    ],
                  }),
                  (0, r.jsx)("p", {
                    className:
                      "mb-2 max-w-md text-center text-body text-warning",
                    children: n || e,
                  }),
                ],
              });
            if (x) {
              let e = l ?? Date.now() + 864e5,
                t = Math.max(0, e - Date.now()),
                n = Math.floor(t / 36e5),
                a = Math.floor((t % 36e5) / 6e4),
                s = n > 0 ? `${n}h ${a}m` : `${a}m`,
                i = new Date(e).toLocaleTimeString([], {
                  hour: "numeric",
                  minute: "2-digit",
                });
              return (0, r.jsxs)("div", {
                className:
                  "flex flex-col items-center justify-center rounded-lg border border-warning/40 bg-warning/10 p-4",
                children: [
                  (0, r.jsxs)("div", {
                    className: "mb-2 flex items-center text-warning",
                    children: [
                      (0, r.jsx)("svg", {
                        className: "w-5 h-5 mr-1.5",
                        fill: "none",
                        stroke: "currentColor",
                        viewBox: "0 0 24 24",
                        children: (0, r.jsx)("path", {
                          strokeLinecap: "round",
                          strokeLinejoin: "round",
                          strokeWidth: 2,
                          d: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
                        }),
                      }),
                      (0, r.jsx)("span", {
                        className: "font-medium text-body",
                        children: "Daily free-model limit reached",
                      }),
                    ],
                  }),
                  (0, r.jsxs)("p", {
                    className:
                      "mb-2 max-w-md text-center text-body text-warning",
                    children: [
                      "You've used your daily allowance on free models. Resets in",
                      " ",
                      s,
                      " (around ",
                      i,
                      " your time). Switch to a paid model to keep going.",
                    ],
                  }),
                ],
              });
            }
            return p
              ? (0, r.jsxs)("div", {
                  className:
                    "flex flex-col items-center justify-center rounded-lg border border-warning/40 bg-warning/10 p-4",
                  children: [
                    (0, r.jsxs)("div", {
                      className: "mb-2 flex items-center text-warning",
                      children: [
                        (0, r.jsx)("svg", {
                          className: "w-5 h-5 mr-1.5",
                          fill: "none",
                          stroke: "currentColor",
                          viewBox: "0 0 24 24",
                          children: (0, r.jsx)("path", {
                            strokeLinecap: "round",
                            strokeLinejoin: "round",
                            strokeWidth: 2,
                            d: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
                          }),
                        }),
                        (0, r.jsx)("span", {
                          className: "font-medium text-body",
                          children: "This Chat Is Too Long",
                        }),
                      ],
                    }),
                    (0, r.jsx)("p", {
                      className:
                        "mb-2 max-w-md text-center text-body text-warning",
                      children:
                        n ||
                        "This conversation has grown past the model's memory limit, so it can't take new prompts.",
                    }),
                    (0, r.jsx)("p", {
                      className: "max-w-md text-center text-body text-warning",
                      children:
                        "Start a new chat on this project to keep building — your game and files are unaffected.",
                    }),
                  ],
                })
              : m
                ? (0, r.jsxs)("div", {
                    className:
                      "flex flex-col items-center justify-center rounded-lg border border-warning/40 bg-warning/10 p-4",
                    children: [
                      (0, r.jsxs)("div", {
                        className: "mb-2 flex items-center text-warning",
                        children: [
                          (0, r.jsx)("svg", {
                            className: "w-5 h-5 mr-1.5",
                            fill: "none",
                            stroke: "currentColor",
                            viewBox: "0 0 24 24",
                            children: (0, r.jsx)("path", {
                              strokeLinecap: "round",
                              strokeLinejoin: "round",
                              strokeWidth: 2,
                              d: "M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
                            }),
                          }),
                          (0, r.jsx)("span", {
                            className: "font-medium text-body",
                            children:
                              "The Agent Couldn't Complete Your Request",
                          }),
                        ],
                      }),
                      (0, r.jsx)("p", {
                        className:
                          "mb-2 max-w-md text-center text-body text-warning",
                        children:
                          "This can happen when the conversation gets too long or the task is too complex for the current model.",
                      }),
                      (0, r.jsxs)("p", {
                        className:
                          "mb-2 max-w-md text-center text-body text-warning",
                        children: [
                          "We",
                          "'",
                          "re actively improving the agent. In the meantime, you can try:",
                        ],
                      }),
                      (0, r.jsxs)("ul", {
                        className:
                          "max-w-md list-disc space-y-1 pl-5 text-left text-body text-warning",
                        children: [
                          (0, r.jsx)("li", {
                            children:
                              "Be more specific about what you want changed",
                          }),
                          (0, r.jsx)("li", {
                            children:
                              "Start a new chat or new project if the conversation is getting long",
                          }),
                        ],
                      }),
                    ],
                  })
                : (0, r.jsxs)("div", {
                    className:
                      "flex flex-col items-center justify-center rounded-lg border border-destructive/40 bg-destructive/10 p-4",
                    children: [
                      (0, r.jsxs)("div", {
                        className: "mb-2 flex items-center text-destructive",
                        children: [
                          (0, r.jsx)("svg", {
                            className: "w-5 h-5 mr-1.5",
                            fill: "none",
                            stroke: "currentColor",
                            viewBox: "0 0 24 24",
                            children: (0, r.jsx)("path", {
                              strokeLinecap: "round",
                              strokeLinejoin: "round",
                              strokeWidth: 2,
                              d: "M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z",
                            }),
                          }),
                          (0, r.jsx)("span", {
                            className: "font-medium text-body",
                            children: "Request Failed",
                          }),
                        ],
                      }),
                      (0, r.jsx)("p", {
                        className:
                          "mb-3 max-w-md text-center text-body text-destructive",
                        children: n || e,
                      }),
                      d
                        ? (0, r.jsxs)("button", {
                            onClick: () => {
                              window.location.reload();
                            },
                            className:
                              "flex items-center rounded-md bg-primary px-3 py-1.5 text-body font-medium text-primary-foreground transition-colors hover:bg-primary-hover",
                            children: [
                              (0, r.jsx)("svg", {
                                className: "w-4 h-4 mr-1.5",
                                fill: "none",
                                stroke: "currentColor",
                                viewBox: "0 0 24 24",
                                children: (0, r.jsx)("path", {
                                  strokeLinecap: "round",
                                  strokeLinejoin: "round",
                                  strokeWidth: 2,
                                  d: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
                                }),
                              }),
                              "Refresh Page",
                            ],
                          })
                        : b
                          ? (0, r.jsxs)("div", {
                              className:
                                "flex items-center rounded-md bg-destructive/10 px-2.5 py-1.5 text-caption text-destructive",
                              children: [
                                (0, r.jsx)("svg", {
                                  className: "w-3.5 h-3.5 mr-1.5",
                                  fill: "none",
                                  stroke: "currentColor",
                                  viewBox: "0 0 24 24",
                                  children: (0, r.jsx)("path", {
                                    strokeLinecap: "round",
                                    strokeLinejoin: "round",
                                    strokeWidth: 2,
                                    d: "M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15",
                                  }),
                                }),
                                b,
                              ],
                            })
                          : null,
                      (a || s || i || o) &&
                        (0, r.jsxs)("div", {
                          className:
                            "mt-2 flex flex-wrap gap-x-3 font-mono text-caption text-destructive",
                          children: [
                            a &&
                              (0, r.jsxs)("span", {
                                children: ["Project: ", a],
                              }),
                            i &&
                              (0, r.jsxs)("span", {
                                children: ["Status: ", i],
                              }),
                            s &&
                              (0, r.jsxs)("span", { children: ["URL: ", s] }),
                            t &&
                              (0, r.jsxs)("span", {
                                children: [
                                  "Code:",
                                  " ",
                                  t.length > 30 ? t.slice(0, 30) + "…" : t,
                                ],
                              }),
                            o &&
                              (0, r.jsxs)("span", { children: ["Time: ", o] }),
                          ],
                        }),
                    ],
                  });
          },
        );
      ne.displayName = "ErrorDisplay";
      var nt = n(52056),
        nn = n(63427);
      function nr({
        creditsRemaining: e,
        selectedModel: t,
        onModelChange: n,
        onBuyCredits: a,
        availabilityOverrides: s,
        canAccessRestrictedModels: i = !1,
        dismissed: o,
        onDismissedChange: l,
        onVisibilityChange: d,
      }) {
        let c = (0, tp.I)(),
          [u, m] = (0, nn.J0)(!1),
          p = void 0 !== o,
          h = p ? o : u,
          g = (0, nn.hb)(
            (e) => {
              (p || m(e), l?.(e));
            },
            [p, l],
          ),
          x = (0, nn.Kr)(() => (0, I.oo)(s, i), [s, i]),
          f = x?.id === t,
          b = e <= 0 && !h && !f;
        ((0, nn.vJ)(() => {
          e > 0 && g(!1);
        }, [e, g]),
          (0, nn.vJ)(() => {
            d?.(b);
          }, [b, d]));
        let y = (0, nn.hb)(() => {
            n && x && (n(x.id), g(!0));
          }, [n, x, g]),
          v = (0, nn.hb)(() => {
            g(!0);
          }, [g]);
        return b
          ? (0, r.jsx)("div", {
              className: (0, es.cn)(
                "mb-2",
                "flex justify-center",
                "pointer-events-none",
              ),
              children: (0, r.jsxs)(ev.P.div, {
                className: (0, es.cn)(
                  "inline-flex items-center justify-between gap-3 w-[95%]",
                  "px-2.5 py-2 rounded-xl",
                  "bg-white/10 backdrop-blur-md border border-white/10",
                  "pointer-events-auto",
                ),
                initial: !c && { opacity: 0, y: 6 },
                animate: c
                  ? void 0
                  : { opacity: [0, 1, 0.4, 1, 0.4, 1], y: [6, 0, 0, 0, 0, 0] },
                transition: c
                  ? void 0
                  : {
                      duration: 1.8,
                      times: [0, 0.15, 0.35, 0.55, 0.75, 1],
                      ease: "easeInOut",
                    },
                children: [
                  (0, r.jsxs)("div", {
                    className: "flex items-center gap-2 min-w-0",
                    children: [
                      (0, r.jsx)(nt.A, {
                        className: "h-3.5 w-3.5 shrink-0 text-muted-foreground",
                        "aria-hidden": "true",
                      }),
                      (0, r.jsx)("span", {
                        className:
                          "text-caption text-muted-foreground truncate",
                        children: "Out of credits.",
                      }),
                    ],
                  }),
                  (0, r.jsxs)("div", {
                    className: "flex items-center gap-1.5 shrink-0",
                    children: [
                      a &&
                        (0, r.jsxs)(ef.$n, {
                          type: "button",
                          variant: "ghost",
                          onClick: a,
                          className: (0, es.cn)(
                            "h-auto gap-1 rounded-md px-2.5 py-0.5 text-caption font-medium",
                            "bg-white/10 hover:bg-white/15 text-muted-foreground",
                            "transition-colors duration-150 motion-reduce:transition-none",
                          ),
                          children: [
                            (0, r.jsx)(tB.A, {
                              className: "h-3 w-3",
                              "aria-hidden": "true",
                            }),
                            "Buy Credits",
                          ],
                        }),
                      x &&
                        (0, r.jsx)(ef.$n, {
                          type: "button",
                          variant: "ghost",
                          onClick: y,
                          className: (0, es.cn)(
                            "h-auto gap-1 rounded-md px-2.5 py-0.5 text-caption font-medium",
                            "text-muted-foreground transition-colors duration-150 motion-reduce:transition-none",
                            "bg-white/5 hover:bg-white/10 cursor-pointer",
                          ),
                          children: "Use Free Model",
                        }),
                      (0, r.jsx)(ef.$n, {
                        type: "button",
                        variant: "ghost",
                        size: "icon-xs",
                        onClick: v,
                        className:
                          "rounded p-0.5 text-muted-foreground transition-colors hover:bg-white/10 hover:text-muted-foreground motion-reduce:transition-none",
                        "aria-label": "Dismiss",
                        children: (0, r.jsx)(eA.A, {
                          className: "h-3 w-3",
                          "aria-hidden": "true",
                        }),
                      }),
                    ],
                  }),
                ],
              }),
            })
          : null;
      }
      function na({
        errorCode: e,
        userMessage: t,
        retryAfterSeconds: n,
        onVisibilityChange: a,
      }) {
        let s = (0, tp.I)(),
          [o, l] = (0, i.J0)(!1),
          [d, c] = (0, i.J0)(null),
          u = R(e);
        ((0, i.vJ)(() => {
          (l(!1),
            c(e === C && "number" == typeof n && n > 0 ? Math.ceil(n) : null));
        }, [e, n]),
          (0, i.vJ)(() => {
            if (null === d || d <= 0) return;
            let e = setTimeout(() => c(d - 1), 1e3);
            return () => clearTimeout(e);
          }, [d]));
        let m = u && !o;
        if (
          ((0, i.vJ)(() => {
            a?.(m);
          }, [m, a]),
          !m || !u)
        )
          return null;
        let p = t || E[e];
        return (0, r.jsx)("div", {
          className: (0, es.cn)(
            "mb-2",
            "flex justify-center",
            "pointer-events-none",
          ),
          children: (0, r.jsxs)(ev.P.div, {
            className: (0, es.cn)(
              "inline-flex items-center justify-between gap-3 w-[95%]",
              "px-2.5 py-2 rounded-xl",
              "bg-red-500/15 backdrop-blur-md border border-red-500/30",
              "pointer-events-auto",
            ),
            initial: !s && { opacity: 0, y: 6 },
            animate: s ? void 0 : { opacity: 1, y: 0 },
            transition: s ? void 0 : { duration: 0.3, ease: "easeOut" },
            children: [
              (0, r.jsxs)("div", {
                className: "flex items-center gap-2 min-w-0",
                children: [
                  (0, r.jsx)(nt.A, {
                    className: "h-3.5 w-3.5 shrink-0 text-red-400",
                    "aria-hidden": "true",
                  }),
                  (0, r.jsxs)("span", {
                    className: "text-caption text-red-200",
                    children: [
                      p,
                      null !== d &&
                        d > 0 &&
                        (0, r.jsxs)("span", {
                          className: "text-red-300",
                          children: [" Retry in ", d, "s."],
                        }),
                    ],
                  }),
                ],
              }),
              (0, r.jsx)(ef.$n, {
                type: "button",
                variant: "ghost",
                size: "icon-xs",
                onClick: () => l(!0),
                className:
                  "shrink-0 rounded p-0.5 text-red-300 transition-colors hover:bg-red-500/20 hover:text-red-200 motion-reduce:transition-none",
                "aria-label": "Dismiss",
                children: (0, r.jsx)(eA.A, {
                  className: "h-3 w-3",
                  "aria-hidden": "true",
                }),
              }),
            ],
          }),
        });
      }
      var ns = n(8555),
        ni = n(39520);
      let no = null;
      function nl() {
        if (no) return no;
        let e = "https://beaming-hawk-976.convex.cloud";
        if (!e) throw Error("NEXT_PUBLIC_CONVEX_URL is not set");
        return (no = new j.ConvexHttpClient(e));
      }
      var nd = n(89715),
        nc = n(14122),
        nu = n(6504),
        nm = n(22133),
        np = n(57828),
        nh = n(37135),
        ng = n(15870),
        nx = n(95664),
        nf = n(7504);
      function nb({ diff: e, isExpanded: t, onToggle: n, showHeader: a = !0 }) {
        let [s, i] = (0, el.J0)(!1),
          o = "boolean" == typeof t ? t : s;
        if (!e) return null;
        let l = "edit" === e.type,
          d = "create" === e.type;
        return (!l || e.oldString || e.newString) &&
          (!d || e.content) &&
          (a || o)
          ? (0, r.jsxs)(r.Fragment, {
              children: [
                (0, r.jsx)("style", {
                  children: `
        .diff-scroll {
          scrollbar-gutter: stable;
        }
        .diff-scroll::-webkit-scrollbar {
          width: 8px;
          display: block;
        }
        .diff-scroll::-webkit-scrollbar-track {
          background: transparent;
        }
        .diff-scroll::-webkit-scrollbar-thumb {
          background: var(--border);
          border-radius: 4px;
        }
        .diff-scroll::-webkit-scrollbar-thumb:hover {
          background: color-mix(in oklab, var(--muted-foreground) 30%, transparent);
        }
      `,
                }),
                (0, r.jsxs)("div", {
                  className: "mt-2 w-full",
                  children: [
                    a &&
                      (0, r.jsxs)("button", {
                        onClick: () => {
                          let e = !o;
                          (n && n(e), "boolean" != typeof t && i(e));
                        },
                        className:
                          "flex items-center gap-1 text-caption text-muted-foreground hover:text-foreground transition-colors",
                        children: [
                          o
                            ? (0, r.jsx)(eU.A, { className: "w-3 h-3" })
                            : (0, r.jsx)(eX.A, { className: "w-3 h-3" }),
                          l
                            ? (0, r.jsxs)(r.Fragment, {
                                children: [
                                  (0, r.jsx)(nd.A, { className: "w-3 h-3" }),
                                  (0, r.jsx)("span", {
                                    children: "View changes",
                                  }),
                                ],
                              })
                            : (0, r.jsxs)(r.Fragment, {
                                children: [
                                  (0, r.jsx)(nf.A, { className: "w-3 h-3" }),
                                  (0, r.jsxs)("span", {
                                    children: [
                                      "View content",
                                      "number" == typeof e.lineCount &&
                                        (0, r.jsxs)(r.Fragment, {
                                          children: [
                                            " ",
                                            "(",
                                            e.lineCount,
                                            " line",
                                            1 !== e.lineCount ? "s" : "",
                                            ")",
                                          ],
                                        }),
                                      e.isTruncated && " - truncated",
                                    ],
                                  }),
                                ],
                              }),
                        ],
                      }),
                    o &&
                      (0, r.jsxs)("div", {
                        className:
                          "mt-2 max-h-[360px] overflow-y-scroll rounded-md border border-border/60 text-caption font-mono diff-scroll",
                        style: {
                          scrollbarWidth: "thin",
                          scrollbarColor: "var(--border) transparent",
                        },
                        children: [
                          l &&
                            (0, r.jsxs)("div", {
                              className:
                                "divide-y divide-border/40 bg-background",
                              children: [
                                e.oldString &&
                                  (0, r.jsx)("div", {
                                    children: e.oldString
                                      .split("\n")
                                      .map((e, t) =>
                                        (0, r.jsxs)(
                                          "div",
                                          {
                                            className:
                                              "border-l-2 border-destructive/50 bg-destructive/10 px-3 py-0.5 whitespace-pre-wrap break-all",
                                            children: [
                                              (0, r.jsx)("span", {
                                                className:
                                                  "mr-2 select-none text-destructive",
                                                children: "-",
                                              }),
                                              (0, r.jsx)("span", {
                                                className: "text-destructive",
                                                children: e,
                                              }),
                                            ],
                                          },
                                          `old-${t}`,
                                        ),
                                      ),
                                  }),
                                e.newString &&
                                  (0, r.jsx)("div", {
                                    children: e.newString
                                      .split("\n")
                                      .map((e, t) =>
                                        (0, r.jsxs)(
                                          "div",
                                          {
                                            className:
                                              "border-l-2 border-success/50 bg-success/10 px-3 py-0.5 whitespace-pre-wrap break-all",
                                            children: [
                                              (0, r.jsx)("span", {
                                                className:
                                                  "mr-2 select-none text-success",
                                                children: "+",
                                              }),
                                              (0, r.jsx)("span", {
                                                className: "text-success",
                                                children: e,
                                              }),
                                            ],
                                          },
                                          `new-${t}`,
                                        ),
                                      ),
                                  }),
                              ],
                            }),
                          d &&
                            e.content &&
                            (0, r.jsxs)("div", {
                              className: "bg-background",
                              children: [
                                e.content
                                  .split("\n")
                                  .map((e, t) =>
                                    (0, r.jsxs)(
                                      "div",
                                      {
                                        className:
                                          "border-l-2 border-success/50 bg-success/10 px-3 py-0.5 whitespace-pre-wrap break-all",
                                        children: [
                                          (0, r.jsx)("span", {
                                            className:
                                              "mr-2 select-none text-success",
                                            children: "+",
                                          }),
                                          (0, r.jsx)("span", {
                                            className: "text-success",
                                            children: e,
                                          }),
                                        ],
                                      },
                                      `content-${t}`,
                                    ),
                                  ),
                                e.isTruncated &&
                                  (0, r.jsx)("div", {
                                    className:
                                      "px-3 py-1 text-muted-foreground italic border-t border-border/40",
                                    children: "... content truncated",
                                  }),
                              ],
                            }),
                        ],
                      }),
                  ],
                }),
              ],
            })
          : null;
      }
      let ny = (e) =>
        e
          .split(/(\*\*.*?\*\*|`.*?`|<strong>.*?<\/strong>|<code>.*?<\/code>)/g)
          .map((e, t) => {
            if (e.startsWith("**") && e.endsWith("**")) {
              let n = e.slice(2, -2);
              return (0, r.jsx)("strong", { children: n }, t);
            }
            if (e.startsWith("<strong>") && e.endsWith("</strong>")) {
              let n = e.slice(8, -9);
              return (0, r.jsx)("strong", { children: n }, t);
            }
            if (e.startsWith("`") && e.endsWith("`")) {
              let n = e.slice(1, -1);
              return (0, r.jsx)(
                "code",
                {
                  className:
                    "bg-black/15 dark:bg-white/5 px-1.5 py-0.5 rounded text-body font-mono",
                  children: n,
                },
                t,
              );
            }
            {
              if (!(e.startsWith("<code>") && e.endsWith("</code>"))) return e;
              let n = e.slice(6, -7);
              return (0, r.jsx)(
                "code",
                {
                  className:
                    "bg-black/15 dark:bg-white/5 px-1.5 py-0.5 rounded text-body font-mono",
                  children: n,
                },
                t,
              );
            }
          });
      function nv({
        message: e,
        playtestGifHumanMessageId: t,
        playtestGifOrdinal: n = 0,
      }) {
        let [i, l] = (0, o.useState)(e.text),
          [d, c] = (0, o.useState)(!1),
          [u, m] = (0, o.useState)(!1),
          p = (0, o.useId)(),
          h = (0, s.IT)(
            a.FH.playtestGifs.listByHumanMessageId,
            t ? { humanMessageId: t } : "skip",
          ),
          g = h?.[n];
        ((0, o.useEffect)(() => {
          l(e.text);
        }, [e.text]),
          (0, o.useEffect)(() => {
            if (
              "started" === e.activityStatus &&
              "thinking" === e.activityType &&
              e.activityStartedAt
            ) {
              let t = setInterval(() => {
                let t = Math.floor((Date.now() - e.activityStartedAt) / 1e3);
                l(`Thought for ${t}s`);
              }, 1e3);
              return () => clearInterval(t);
            }
          }, [e.activityStatus, e.activityType, e.activityStartedAt]));
        let x =
            e.diff &&
            (("edit" === e.diff.type &&
              (e.diff.oldString || e.diff.newString)) ||
              ("create" === e.diff.type && e.diff.content)),
          f =
            "failed" === e.activityStatus &&
            "reading" === e.activityType &&
            (e.text.includes("test") || e.text.includes("Test")),
          b =
            e.additional_kwargs?.testErrors ||
            (e.additional_kwargs?.additional_kwargs &&
              e.additional_kwargs.additional_kwargs?.testErrors),
          y = f && Array.isArray(b) && b.length > 0,
          v = x || y,
          w = (x && u) || (y && d),
          j = (function (e, t, n) {
            if ("completed" !== n) return { prefix: null, detail: e };
            let r =
              "editing" === t
                ? "Edited"
                : "creating" === t || "writing" === t
                  ? "Created"
                  : null;
            if (!r) return { prefix: null, detail: e };
            let a = e
              .replace(
                /^(?:created|creating|edited|editing|wrote|writing)\b\s*/i,
                "",
              )
              .replace(/^[:—-]\s*/, "")
              .trim();
            return a ? { prefix: r, detail: a } : { prefix: null, detail: e };
          })(i, e.activityType, e.activityStatus),
          k = (0, r.jsxs)(r.Fragment, {
            children: [
              (0, r.jsx)("span", {
                "aria-hidden": "true",
                className: "contents",
                children: ((t, n) => {
                  let a =
                      "reading" === t &&
                      "completed" === n &&
                      e.text.includes("Tests passed:"),
                    s =
                      "reading" === t &&
                      "failed" === n &&
                      (e.text.includes("Test execution failed:") ||
                        (e.text.toLowerCase().includes("test") &&
                          e.text.toLowerCase().includes("failed")));
                  if (a)
                    return (0, r.jsx)(np.A, {
                      className: "h-4 w-4 text-success/70",
                    });
                  if (s)
                    return (0, r.jsx)(np.A, {
                      className: "h-4 w-4 text-destructive/70",
                    });
                  switch (t) {
                    case "thinking":
                    case "planning":
                    case "memory_bank":
                      return (0, r.jsx)(eq.A, { className: "w-4 h-4" });
                    case "reading":
                      return (0, r.jsx)(np.A, { className: "w-4 h-4" });
                    case "searching":
                      return (0, r.jsx)(tf.A, { className: "w-4 h-4" });
                    case "writing":
                    case "creating":
                    case "editing":
                      return (0, r.jsx)(nd.A, { className: "w-4 h-4" });
                    case "deleting":
                      return (0, r.jsx)(nh.A, { className: "w-4 h-4" });
                    case "tool_use":
                    case "executing":
                    default:
                      return (0, r.jsx)(ng.A, { className: "w-4 h-4" });
                    case "rollback":
                      return (0, r.jsx)(eS.A, { className: "w-4 h-4" });
                    case "screenshot":
                      return (0, r.jsx)(nx.A, { className: "w-4 h-4" });
                  }
                })(e.activityType, e.activityStatus),
              }),
              j.prefix
                ? (0, r.jsxs)("span", {
                    className:
                      "flex min-w-0 flex-1 items-center gap-1 overflow-hidden",
                    title: i,
                    children: [
                      (0, r.jsx)("span", {
                        className: "shrink-0",
                        children: j.prefix,
                      }),
                      (0, r.jsx)("span", {
                        dir: "rtl",
                        className:
                          "min-w-0 flex-1 overflow-hidden text-left text-ellipsis whitespace-nowrap",
                        children: (0, r.jsx)("span", {
                          dir: "ltr",
                          children: ny(j.detail),
                        }),
                      }),
                    ],
                  })
                : (0, r.jsx)("span", {
                    className:
                      "min-w-0 flex-1 overflow-hidden text-ellipsis whitespace-nowrap",
                    title: i,
                    children: ny(i),
                  }),
              v &&
                (0, r.jsx)("span", {
                  className: "ml-1",
                  "aria-hidden": "true",
                  children: w
                    ? (0, r.jsx)(eU.A, { className: "h-4 w-4" })
                    : (0, r.jsx)(eX.A, { className: "h-4 w-4" }),
                }),
              (() => {
                switch (e.activityStatus) {
                  case "completed":
                  case "failed":
                  default:
                    return null;
                  case "started":
                    return (0, r.jsxs)("div", {
                      className: "ml-2 flex space-x-1",
                      "aria-hidden": "true",
                      children: [
                        (0, r.jsx)("div", {
                          className:
                            "h-1 w-1 animate-bounce rounded-full bg-current motion-reduce:animate-none",
                          style: { animationDelay: "0ms" },
                        }),
                        (0, r.jsx)("div", {
                          className:
                            "h-1 w-1 animate-bounce rounded-full bg-current motion-reduce:animate-none",
                          style: { animationDelay: "150ms" },
                        }),
                        (0, r.jsx)("div", {
                          className:
                            "h-1 w-1 animate-bounce rounded-full bg-current motion-reduce:animate-none",
                          style: { animationDelay: "300ms" },
                        }),
                      ],
                    });
                }
              })(),
            ],
          });
        return (0, r.jsxs)("div", {
          className: "text-left relative",
          children: [
            (0, r.jsxs)("div", {
              className: `flex flex-col w-fit max-w-full gap-2 px-3 py-1 bg-neutral-200/5 rounded-lg border border-border/40 text-body-lg text-muted-foreground ${"started" === e.activityStatus ? "animate-pulse motion-reduce:animate-none" : ""} ${v ? "cursor-pointer hover:bg-neutral-200/10" : ""}`,
              children: [
                v
                  ? (0, r.jsx)(ef.$n, {
                      type: "button",
                      presentation: "inherit",
                      className: "w-full justify-start rounded-sm text-left",
                      onClick: () => {
                        if (!v) return;
                        let e = !w;
                        (x && m(e), y && c(e));
                      },
                      "aria-expanded": w,
                      "aria-controls": p,
                      children: k,
                    })
                  : (0, r.jsx)("div", {
                      className: "flex w-full items-center gap-2",
                      children: k,
                    }),
                g?.url &&
                  (0, r.jsx)("div", {
                    className:
                      "w-72 max-w-full aspect-video overflow-hidden rounded-md mb-1",
                    children: (0, r.jsx)("img", {
                      src: g.url,
                      alt: "Playtest recording",
                      draggable: !1,
                      className: "h-full w-full object-cover",
                    }),
                  }),
              ],
            }),
            v &&
              (0, r.jsxs)("div", {
                id: p,
                children: [
                  x &&
                    e.diff &&
                    (0, r.jsx)(nb, {
                      diff: e.diff,
                      isExpanded: u,
                      showHeader: !1,
                    }),
                  y &&
                    d &&
                    (0, r.jsx)("div", {
                      className:
                        "mt-2 w-full overflow-hidden rounded-md border border-border/60 text-caption",
                      children: (0, r.jsx)("div", {
                        className: "divide-y divide-border/40 bg-background",
                        children: b.map((e, t) =>
                          (0, r.jsxs)(
                            "div",
                            {
                              className:
                                "border-l-2 border-destructive/50 bg-destructive/10 px-3 py-2",
                              children: [
                                (0, r.jsx)("div", {
                                  className: "mb-1 font-mono text-destructive",
                                  children: e.scriptPath,
                                }),
                                e.lineNumber &&
                                  (0, r.jsxs)("div", {
                                    className:
                                      "mb-1 text-micro text-destructive",
                                    children: ["Line ", e.lineNumber],
                                  }),
                                (0, r.jsx)("div", {
                                  className:
                                    "break-all whitespace-pre-wrap text-destructive",
                                  children: e.message,
                                }),
                              ],
                            },
                            t,
                          ),
                        ),
                      }),
                    }),
                ],
              }),
          ],
        });
      }
      var nw = n(17982),
        nj = n(66672);
      let nk = (0, nj.q6)(null),
        nN = (0, nj.q6)(null);
      function nI({ chatId: e, onSwitchToComposer: t, children: n }) {
        let i = (0, s.IT)(
            a.FH.agentRatings.getRatingsForChat,
            e ? { chatId: e } : "skip",
          ),
          o = (0, nj.Kr)(() => {
            let e = new Map();
            if (i) for (let t of i) e.set(t.messageId, t);
            return e;
          }, [i]);
        return (0, r.jsx)(nk.Provider, {
          value: o,
          children: (0, r.jsx)(nN.Provider, { value: t ?? null, children: n }),
        });
      }
      let nC = function ({ messageId: e, className: t, onExpand: n }) {
          let i = (0, o.useId)(),
            [l, d] = (0, o.useState)(!1),
            [c, u] = (0, o.useState)(!1),
            [m, p] = (0, o.useState)(!1),
            [h, g] = (0, o.useState)(null),
            [x, f] = (0, o.useState)(""),
            [b, y] = (0, o.useState)(!1),
            v = (0, nj.NT)(nN),
            w = (function (e) {
              let t = (0, nj.NT)(nk);
              return t ? (t.get(e) ?? null) : null;
            })(e),
            j = (0, s.n_)(a.FH.agentRatings.submitRating),
            k = (0, o.useCallback)((e) => {
              let t = parseInt(e, 10);
              isNaN(t) || t < 1 || t > 10 || g(t);
            }, []),
            N = (0, o.useCallback)(async () => {
              null !== h &&
                (d(!0),
                await j({
                  messageId: e,
                  rating: h,
                  comment: x.trim() || void 0,
                }),
                u(!0),
                p(!1),
                y(h < 6),
                g(null),
                f(""),
                setTimeout(() => u(!1), 2e3),
                d(!1));
            }, [e, j, h, x]);
          (0, o.useEffect)(() => {
            m &&
              n &&
              setTimeout(() => {
                n();
              }, 50);
          }, [m, n]);
          let I =
            b && v
              ? (0, r.jsxs)("div", {
                  className:
                    "relative mt-2 max-w-[320px] rounded-lg border border-border/60 bg-muted/40 p-2.5 pr-6",
                  children: [
                    (0, r.jsx)("button", {
                      type: "button",
                      "aria-label": "Dismiss",
                      onClick: () => y(!1),
                      className:
                        "absolute right-1.5 top-1.5 text-muted-foreground hover:text-foreground",
                      children: (0, r.jsx)(eA.A, { className: "size-3" }),
                    }),
                    (0, r.jsx)("p", {
                      className:
                        "text-micro leading-snug text-muted-foreground",
                      children:
                        "We are sorry to hear this has not performed as you wanted. We highly recommend using more intelligent models on the same request.",
                    }),
                    (0, r.jsx)(ef.$n, {
                      type: "button",
                      size: "sm",
                      variant: "secondary",
                      onClick: () => {
                        (v(), y(!1));
                      },
                      className: "mt-2 h-6 w-full text-micro",
                      children: "Switch to Composer 2.5",
                    }),
                  ],
                })
              : null;
          return w && !c
            ? (0, r.jsxs)("div", {
                className: (0, es.cn)("space-y-1", t),
                children: [
                  (0, r.jsxs)("div", {
                    className:
                      "flex items-center gap-2 text-caption text-muted-foreground",
                    children: [
                      (0, r.jsx)("span", { children: "Rated:" }),
                      (0, r.jsxs)("span", {
                        className: "font-medium text-foreground",
                        children: [w.rating, "/10"],
                      }),
                      (0, r.jsx)("button", {
                        onClick: () => {
                          (u(!0), p(!0), g(w.rating), f(w.comment ?? ""));
                        },
                        className: "text-primary hover:underline",
                        children: "Change",
                      }),
                    ],
                  }),
                  w.comment &&
                    (0, r.jsxs)("p", {
                      className: "text-caption text-muted-foreground italic",
                      children: ['"', w.comment, '"'],
                    }),
                  I,
                ],
              })
            : c && w && !m
              ? (0, r.jsxs)("div", {
                  className: t,
                  children: [
                    (0, r.jsxs)("div", {
                      className: "flex items-center gap-2 text-caption",
                      children: [
                        (0, r.jsx)("span", {
                          className: "text-success",
                          children: "Thanks for your feedback!",
                        }),
                        (0, r.jsxs)("span", {
                          className: "text-muted-foreground",
                          children: ["(", w.rating, "/10)"],
                        }),
                      ],
                    }),
                    I,
                  ],
                })
              : m
                ? (0, r.jsx)("div", {
                    className: (0, es.cn)(
                      "w-full rounded-xl bg-muted/35 p-3 ring-1 ring-inset ring-border/50",
                      t,
                    ),
                    children: (0, r.jsxs)("fieldset", {
                      className: "space-y-3",
                      disabled: l,
                      children: [
                        (0, r.jsxs)("div", {
                          className: "flex items-center justify-between",
                          children: [
                            (0, r.jsx)("legend", {
                              className: "text-caption text-muted-foreground",
                              children: "Rate this generation:",
                            }),
                            (0, r.jsx)("button", {
                              type: "button",
                              onClick: () => {
                                (p(!1), g(null), f(""));
                              },
                              className:
                                "text-caption text-muted-foreground hover:text-foreground",
                              children: "Cancel",
                            }),
                          ],
                        }),
                        (0, r.jsxs)("div", {
                          className: "space-y-1",
                          children: [
                            (0, r.jsx)(nw.z, {
                              className: "grid grid-cols-10 gap-1",
                              onValueChange: k,
                              value: h?.toString() ?? w?.rating?.toString(),
                              children: [
                                "1",
                                "2",
                                "3",
                                "4",
                                "5",
                                "6",
                                "7",
                                "8",
                                "9",
                                "10",
                              ].map((e) =>
                                (0, r.jsxs)(
                                  "label",
                                  {
                                    className: (0, es.cn)(
                                      "relative grid aspect-square w-full cursor-pointer place-items-center rounded-md border border-input text-center text-caption font-medium leading-none tabular-nums outline-offset-2 transition-colors",
                                      "has-data-[state=checked]:z-10 has-data-disabled:cursor-not-allowed has-data-[state=checked]:border-ring has-data-[state=checked]:bg-accent has-data-disabled:opacity-50 has-focus-visible:outline-solid has-focus-visible:outline-2 has-focus-visible:outline-ring/70",
                                      "hover:bg-accent/50",
                                    ),
                                    children: [
                                      (0, r.jsx)(nw.C, {
                                        id: `${i}-${e}`,
                                        value: e,
                                        className:
                                          "!absolute inset-0 !size-full opacity-0 [&_[data-slot=radio-group-control]]:hidden",
                                      }),
                                      (0, r.jsx)("span", {
                                        className:
                                          "pointer-events-none block -translate-y-px",
                                        children: e,
                                      }),
                                    ],
                                  },
                                  e,
                                ),
                              ),
                            }),
                            (0, r.jsxs)("div", {
                              className:
                                "flex justify-between text-caption text-muted-foreground",
                              children: [
                                (0, r.jsx)("span", { children: "Poor" }),
                                (0, r.jsx)("span", { children: "Excellent" }),
                              ],
                            }),
                          ],
                        }),
                        (0, r.jsxs)("div", {
                          className: "space-y-2",
                          children: [
                            (0, r.jsx)(eb.T, {
                              placeholder:
                                "Why did you give this rating? (optional)",
                              value: x,
                              onChange: (e) => f(e.target.value),
                              className:
                                "min-h-[60px] text-caption resize-none",
                              rows: 2,
                            }),
                            (0, r.jsx)(ef.$n, {
                              type: "button",
                              size: "sm",
                              onClick: N,
                              disabled: null === h || l,
                              className: "w-full",
                              children: l ? "Submitting..." : "Submit Rating",
                            }),
                          ],
                        }),
                      ],
                    }),
                  })
                : (0, r.jsxs)("button", {
                    type: "button",
                    onClick: () => p(!0),
                    className: (0, es.cn)(
                      "-ml-2 inline-flex min-h-7 items-center gap-1 rounded-lg px-2 text-caption text-muted-foreground opacity-55 outline-hidden transition-[background-color,color,opacity] hover:bg-muted/55 hover:text-foreground hover:opacity-100 focus-visible:opacity-100 focus-visible:ring-2 focus-visible:ring-ring/55",
                      t,
                    ),
                    children: [
                      (0, r.jsx)("span", { children: "Rate this generation" }),
                      (0, r.jsx)(eX.A, { className: "size-3" }),
                    ],
                  });
        },
        nS = (0, o.lazy)(() =>
          Promise.all([n.e(9155), n.e(7382)])
            .then(n.bind(n, 39155))
            .then((e) => ({ default: e.Dithering })),
        );
      function nA({ humanMessageId: e, onExploreCards: t }) {
        let n = (0, s.IT)(a.FH.playtestGifs.getByHumanMessageId, {
            humanMessageId: e,
          }),
          [i, l] = (0, o.useState)(!1);
        if (!n || !n.url) return null;
        let d = n.reviewed ?? "unknown";
        if ("denied" === d) return null;
        let c = n.creatorUsername ?? n.creatorName ?? "anonymous",
          u = n.creatorAvatarUrl ?? null,
          m = n.originalPrompt?.trim() || "Untitled prompt",
          p = m.length > 60 ? `${m.slice(0, 60).trimEnd()}…` : m;
        return (0, r.jsxs)(ev.P.div, {
          className: (0, es.cn)(
            "relative overflow-hidden",
            "mt-3 flex w-full items-center justify-between gap-3",
            "rounded-lg border border-border/40 p-2 px-3",
            "bg-neutral-200/5",
            "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.08),0_1px_0_0_rgba(0,0,0,0.04)]",
          ),
          initial: { opacity: 0, y: -10 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.4, ease: "easeOut" },
          onMouseEnter: () => l(!0),
          onMouseLeave: () => l(!1),
          children: [
            (0, r.jsx)(o.Suspense, {
              fallback: null,
              children: (0, r.jsx)("div", {
                className: (0, es.cn)(
                  "pointer-events-none absolute inset-0 z-0",
                  "opacity-5",
                ),
                children: (0, r.jsx)(nS, {
                  colorBack: "#00000000",
                  colorFront: "#e7e5e4",
                  shape: "warp",
                  type: "4x4",
                  speed: i ? 0.3 : 0.1,
                  className: "size-full",
                  minPixelRatio: 1,
                }),
              }),
            }),
            (0, r.jsxs)("div", {
              className: "relative z-10 flex items-center gap-3 min-w-0 flex-1",
              children: [
                (0, r.jsx)("div", {
                  className: (0, es.cn)(
                    "h-14 aspect-5/7 shrink-0 overflow-hidden rounded-md",
                    "border-2 border-black/5",
                  ),
                  style: { backgroundColor: "var(--color-neutral-700)" },
                  children: (0, r.jsx)("img", {
                    src: n.url,
                    alt: p,
                    draggable: !1,
                    className: "h-full w-full object-cover",
                  }),
                }),
                (0, r.jsxs)("div", {
                  className: "flex flex-col min-w-0",
                  children: [
                    (0, r.jsxs)("div", {
                      className: "flex items-center gap-1.5 min-w-0",
                      children: [
                        (0, r.jsx)("h3", {
                          className:
                            "text-body font-semibold text-foreground truncate",
                          children: "Your prompt became a public card!",
                        }),
                        "accepted" === d
                          ? null
                          : (0, r.jsx)("span", {
                              className: (0, es.cn)(
                                "inline-flex shrink-0 items-center px-1.5 py-0.5 rounded-md border",
                                "text-caption font-medium leading-none whitespace-nowrap",
                                "border-warning/30 bg-warning/10 text-warning",
                              ),
                              children: "In review",
                            }),
                      ],
                    }),
                    (0, r.jsx)("p", {
                      className: "text-compact-body text-muted-foreground",
                      title: m,
                      children: p,
                    }),
                  ],
                }),
              ],
            }),
            (0, r.jsxs)("div", {
              className:
                "relative z-10 flex flex-col items-center gap-1 shrink-0",
              children: [
                (0, r.jsxs)("button", {
                  type: "button",
                  onClick: t,
                  className: (0, es.cn)(
                    "inline-flex items-center gap-1.5 px-2.5 rounded-lg border",
                    "h-[26px] md:h-[30px]",
                    "text-caption md:text-compact-body font-medium whitespace-nowrap",
                    "border-primary bg-primary text-primary-foreground",
                    "hover:bg-primary-hover",
                    "transition-colors duration-150",
                  ),
                  children: [
                    "View the Feed",
                    (0, r.jsx)(eL.A, { className: "h-3.5 w-3.5 shrink-0" }),
                  ],
                }),
                (0, r.jsxs)("div", {
                  className:
                    "text-micro text-muted-foreground inline-flex items-center gap-1 leading-none",
                  children: [
                    "by",
                    u
                      ? (0, r.jsx)("img", {
                          src: u,
                          alt: "",
                          draggable: !1,
                          className:
                            "h-3 w-3 rounded-full object-cover ring-1 ring-white/15",
                        })
                      : null,
                    (0, r.jsx)("span", { children: c }),
                  ],
                }),
              ],
            }),
          ],
        });
      }
      var nP = n(87066),
        nM = n(38627),
        n_ = n(74054),
        nT = n(53511),
        nR = n(17188);
      function nE({
        planItems: e,
        completedSteps: t = [],
        currentStep: n,
        isPlaytesting: a = !1,
        onApprove: s,
        onReject: i,
        onEdit: l,
        disabled: d = !1,
        showApprovalButtons: c = !0,
        hidden: u = !1,
        uiPinWarning: p = !1,
      }) {
        let [h, g] = (0, o.useState)(!1),
          [x, f] = (0, o.useState)(""),
          [y, v] = (0, o.useState)(!1),
          w = (0, o.useId)(),
          j = (0, o.useId)();
        if (u) return null;
        let k = e.map((e, r) => {
            let s = t.includes(e),
              i = n === e;
            return {
              id: `todo-${r}`,
              text: e,
              completed: s,
              isPlaytesting: a && i,
              isCurrent: i && !s,
            };
          }),
          N = k.filter((e) => e.completed).length,
          C = () => {
            x.trim() && (l ? l(x.trim()) : i && i(), f(""), v(!1));
          };
        return (0, r.jsx)("div", {
          className: "w-full",
          children: (0, r.jsxs)("div", {
            className:
              "w-full rounded-lg border-2 border-border bg-background p-4 transition-[background-color,border-color] motion-reduce:transition-none dark:bg-neutral-800!",
            children: [
              (0, r.jsxs)(ef.$n, {
                type: "button",
                variant: "ghost",
                className:
                  "mb-4 h-auto w-full justify-between rounded-sm p-0 text-left hover:bg-transparent hover:text-foreground",
                onClick: () => {
                  window.getSelection()?.toString() || g((e) => !e);
                },
                disabled: d,
                "aria-expanded": h,
                "aria-controls": w,
                children: [
                  (0, r.jsxs)("div", {
                    className: "flex items-center gap-2",
                    children: [
                      (0, r.jsx)(nP.A, {
                        className: "h-4 w-4 text-muted-foreground",
                        "aria-hidden": "true",
                      }),
                      (0, r.jsxs)("h2", {
                        className:
                          "text-muted-foreground text-body-lg font-medium",
                        children: ["Steps (", N, "/", k.length, ")"],
                      }),
                    ],
                  }),
                  (0, r.jsx)("span", {
                    className: "p-1 text-muted-foreground",
                    "aria-hidden": "true",
                    children: h
                      ? (0, r.jsx)(nM.A, { className: "h-4 w-4" })
                      : (0, r.jsx)(n_.A, { className: "h-4 w-4" }),
                  }),
                ],
              }),
              (0, r.jsxs)("div", {
                id: w,
                className: "space-y-3",
                children: [
                  k.map((e, t) =>
                    !h && t >= 6
                      ? null
                      : (0, r.jsxs)(
                          "div",
                          {
                            className: "flex items-center gap-3",
                            children: [
                              e.completed
                                ? (0, r.jsx)(eD.A, {
                                    className: "h-4 w-4 shrink-0 text-success",
                                    "aria-hidden": "true",
                                  })
                                : e.isPlaytesting
                                  ? (0, r.jsx)(nT.A, {
                                      className:
                                        "h-4 w-4 shrink-0 animate-pulse fill-warning text-warning motion-reduce:animate-none",
                                      fill: "currentColor",
                                      strokeWidth: 0,
                                      "aria-hidden": "true",
                                    })
                                  : e.isCurrent
                                    ? (0, r.jsx)(m.A, {
                                        className:
                                          "h-4 w-4 shrink-0 animate-spin text-info motion-reduce:animate-none",
                                        "aria-hidden": "true",
                                      })
                                    : (0, r.jsx)(eY.A, {
                                        className:
                                          "h-4 w-4 shrink-0 text-muted-foreground",
                                        "aria-hidden": "true",
                                      }),
                              (0, r.jsx)("span", {
                                className: `text-body-lg flex-1 cursor-pointer ${!h ? "whitespace-nowrap text-muted-foreground overflow-hidden text-ellipsis" : "text-muted-foreground"} ${e.completed ? "text-muted-foreground line-through" : ""} ${e.isPlaytesting ? "text-warning font-medium" : ""} ${e.isCurrent ? "text-info font-medium" : ""}`,
                                title: e.text,
                                children: e.text
                                  .split(
                                    /(\*\*.*?\*\*|`.*?`|<strong>.*?<\/strong>|<code>.*?<\/code>)/g,
                                  )
                                  .map((e, t) => {
                                    if (
                                      e.startsWith("**") &&
                                      e.endsWith("**")
                                    ) {
                                      let n = e.slice(2, -2);
                                      return (0, r.jsx)(
                                        "strong",
                                        { children: n },
                                        t,
                                      );
                                    }
                                    if (
                                      e.startsWith("<strong>") &&
                                      e.endsWith("</strong>")
                                    ) {
                                      let n = e.slice(8, -9);
                                      return (0, r.jsx)(
                                        "strong",
                                        { children: n },
                                        t,
                                      );
                                    }
                                    if (e.startsWith("`") && e.endsWith("`")) {
                                      let n = e.slice(1, -1);
                                      return (0, r.jsx)(
                                        "code",
                                        {
                                          className:
                                            "bg-muted/50 px-1 py-0.5 rounded text-body font-mono",
                                          children: n,
                                        },
                                        t,
                                      );
                                    }
                                    {
                                      if (!(
                                        e.startsWith("<code>") &&
                                        e.endsWith("</code>")
                                      ))
                                        return e;
                                      let n = e.slice(6, -7);
                                      return (0, r.jsx)(
                                        "code",
                                        {
                                          className:
                                            "bg-muted/50 px-1 py-0.5 rounded text-body font-mono",
                                          children: n,
                                        },
                                        t,
                                      );
                                    }
                                  }),
                              }),
                            ],
                          },
                          e.id,
                        ),
                  ),
                  !h &&
                    k.length > 6 &&
                    (0, r.jsxs)("div", {
                      className: "text-muted-foreground text-body-lg",
                      children: ["+", k.length - 6, " more items..."],
                    }),
                ],
              }),
              h &&
                N > 0 &&
                (0, r.jsx)("div", {
                  className: "mt-4 pt-3 border-border",
                  children: (0, r.jsxs)("p", {
                    className: "text-muted-foreground text-body-lg",
                    children: [N, " of ", k.length, " completed"],
                  }),
                }),
              c &&
                (s || i || l) &&
                (0, r.jsxs)(r.Fragment, {
                  children: [
                    (0, r.jsx)("div", {
                      className: "mx-[-16px] mt-4 border-t border-border",
                    }),
                    (0, r.jsxs)("div", {
                      className: "pt-3",
                      children: [
                        (0, r.jsx)("p", {
                          className: "text-muted-foreground text-body-lg mb-3",
                          children: "Do you approve this plan?",
                        }),
                        p &&
                          e.some(I.Up) &&
                          (0, r.jsxs)("p", {
                            className:
                              "mb-3 flex items-center gap-1.5 text-caption text-muted-foreground",
                            children: [
                              (0, r.jsx)(nt.A, {
                                className: "h-3.5 w-3.5 shrink-0",
                                "aria-hidden": "true",
                              }),
                              "This plan includes UI work, which runs on a separate paid model",
                            ],
                          }),
                        (0, r.jsxs)("div", {
                          className: "flex items-center gap-2 flex-wrap",
                          children: [
                            s &&
                              (0, r.jsxs)(ef.$n, {
                                type: "button",
                                onClick: () => {
                                  ((0, b.hG)(), s?.());
                                },
                                disabled: d,
                                size: "sm",
                                className:
                                  "dark:hover:text-white/70 dark:text-white/70 text-black/70 bg-transparent border border-border rounded font-medium hover:bg-black/40",
                                children: [
                                  (0, r.jsx)(eD.A, {
                                    className: "mr-1 h-4 w-4 text-success",
                                    "aria-hidden": "true",
                                  }),
                                  "Yes",
                                ],
                              }),
                            y
                              ? l &&
                                (0, r.jsxs)("div", {
                                  className: "flex items-center gap-2 flex-1",
                                  children: [
                                    (0, r.jsxs)("div", {
                                      className:
                                        "flex items-center flex-1 px-3 py-1 bg-background border border-border rounded",
                                      children: [
                                        (0, r.jsx)("label", {
                                          htmlFor: j,
                                          className:
                                            "mr-2 whitespace-nowrap text-body-lg text-muted-foreground",
                                          children: "Edit:",
                                        }),
                                        (0, r.jsx)(tv.p, {
                                          id: j,
                                          density: "compact",
                                          type: "text",
                                          value: x,
                                          onChange: (e) => f(e.target.value),
                                          placeholder: "Describe changes...",
                                          className:
                                            "h-auto flex-1 border-none bg-transparent px-0 text-body-lg text-foreground shadow-none placeholder:text-muted-foreground focus-visible:ring-0",
                                          disabled: d,
                                          onKeyDown: (e) => {
                                            "Enter" === e.key &&
                                              x.trim() &&
                                              C();
                                          },
                                          autoFocus: !0,
                                        }),
                                      ],
                                    }),
                                    (0, r.jsx)(ef.$n, {
                                      type: "button",
                                      onClick: C,
                                      disabled: d || !x.trim(),
                                      size: "xs",
                                      className: "px-2 py-1!",
                                      "aria-label": "Submit plan changes",
                                      children: (0, r.jsx)(nR.A, {
                                        className: "h-4 w-4",
                                        "aria-hidden": "true",
                                      }),
                                    }),
                                    (0, r.jsx)(ef.$n, {
                                      type: "button",
                                      onClick: () => {
                                        (v(!1), f(""));
                                      },
                                      variant: "ghost",
                                      size: "sm",
                                      className:
                                        "p-1 h-8 w-8 text-muted-foreground hover:text-foreground",
                                      "aria-label": "Cancel plan changes",
                                      children: (0, r.jsx)(eA.A, {
                                        className: "h-4 w-4",
                                        "aria-hidden": "true",
                                      }),
                                    }),
                                  ],
                                })
                              : i &&
                                (0, r.jsxs)(ef.$n, {
                                  type: "button",
                                  onClick: () => v(!0),
                                  variant: "outline",
                                  disabled: d,
                                  size: "sm",
                                  className:
                                    "dark:hover:text-white/70 dark:text-white/70 text-black/70 bg-transparent border border-border rounded font-medium",
                                  children: [
                                    (0, r.jsx)(eA.A, {
                                      className:
                                        "mr-1 h-4 w-4 text-destructive",
                                      "aria-hidden": "true",
                                    }),
                                    "No",
                                  ],
                                }),
                          ],
                        }),
                      ],
                    }),
                  ],
                }),
            ],
          }),
        });
      }
      function n$({
        question: e,
        onContinue: t,
        onRefine: n,
        disabled: a = !1,
        status: s = "idle",
        gameThumbnailUrl: i,
        tasks: l,
      }) {
        let [d, c] = (0, o.useState)(!1),
          [u, p] = (0, o.useState)(""),
          h = (0, r.jsxs)("div", {
            className: "flex flex-col items-start justify-between",
            children: [
              (0, r.jsxs)("div", {
                children: [
                  "reviewed" !== s &&
                    (0, r.jsx)("div", {
                      className: "text-body-lg mb-1 text-info",
                      children: "Reviewing task",
                    }),
                  "reviewed" !== s &&
                    (0, r.jsx)("div", {
                      className: "mt-1 text-body text-muted-foreground",
                      children: e,
                    }),
                ],
              }),
              "reviewed" === s &&
                (0, r.jsxs)("div", {
                  className:
                    "text-body-lg flex items-center gap-1 text-success",
                  children: [
                    (0, r.jsx)(eD.A, {
                      className: "mr-1 h-4 w-4 text-success",
                    }),
                    " Playtest reviewed",
                  ],
                }),
              "refining" === s &&
                (0, r.jsxs)("div", {
                  className: "mt-2 flex items-center text-caption text-info",
                  children: [
                    (0, r.jsx)(m.A, { className: "w-4 h-4 mr-1 animate-spin" }),
                    " Adjusting…",
                  ],
                }),
            ],
          });
        return "reviewed" === s
          ? (0, r.jsx)("div", {
              className:
                "w-full rounded-lg border border-success/30 bg-success/10 px-3 py-1.5 text-success",
              children: h,
            })
          : (0, r.jsxs)("div", {
              className:
                "flex w-full flex-col gap-4 rounded-lg border border-info/30 bg-info/10 p-4 text-foreground",
              children: [
                h,
                i &&
                  l &&
                  l.length > 0 &&
                  (0, r.jsxs)("div", {
                    className: "flex gap-4",
                    children: [
                      (0, r.jsx)(eo.default, {
                        src: i,
                        alt: "Game preview",
                        width: 512,
                        height: 512,
                        quality: 90,
                        className:
                          "shrink-0 max-w-32 max-h-32 rounded-lg border border-border object-cover",
                      }),
                      (0, r.jsxs)("div", {
                        className: "flex-1 min-w-0",
                        children: [
                          (0, r.jsxs)("div", {
                            className: "mb-2 text-body font-semibold text-info",
                            children: [
                              "Tasks (",
                              l.filter((e) => e.completed).length,
                              "/",
                              l.length,
                              ")",
                            ],
                          }),
                          (0, r.jsx)("ul", {
                            className: "space-y-1.5",
                            children: l.map((e) =>
                              (0, r.jsxs)(
                                "li",
                                {
                                  className:
                                    "flex items-center gap-2 text-body text-foreground",
                                  children: [
                                    e.completed
                                      ? (0, r.jsx)(eD.A, {
                                          className:
                                            "h-3.5 w-3.5 shrink-0 text-success",
                                        })
                                      : e.isCurrent
                                        ? (0, r.jsx)(m.A, {
                                            className:
                                              "h-3.5 w-3.5 shrink-0 animate-spin text-info",
                                          })
                                        : (0, r.jsx)(eY.A, {
                                            className:
                                              "h-3.5 w-3.5 shrink-0 text-muted-foreground",
                                          }),
                                    (0, r.jsx)("span", {
                                      className: `truncate ${e.completed ? "text-muted-foreground line-through" : ""}`,
                                      children: e.label,
                                    }),
                                  ],
                                },
                                e.id,
                              ),
                            ),
                          }),
                        ],
                      }),
                    ],
                  }),
                d
                  ? (0, r.jsxs)("div", {
                      className: "space-y-3",
                      children: [
                        (0, r.jsx)("div", {
                          className: "text-body-lg text-info",
                          children: "Describe what to adjust:",
                        }),
                        (0, r.jsxs)("div", {
                          className: "flex items-center gap-2",
                          children: [
                            (0, r.jsx)("input", {
                              value: u,
                              onChange: (e) => p(e.target.value),
                              placeholder:
                                "e.g., Button fade timing feels off; HUD overlaps during countdown",
                              className:
                                "flex-1 rounded-md border border-info/50 bg-background/60 px-3 py-2 text-body text-foreground placeholder:text-muted-foreground focus:border-info focus:outline-hidden focus:ring-3 focus:ring-info/20",
                              autoFocus: !0,
                            }),
                            (0, r.jsx)("button", {
                              type: "button",
                              onClick: () => {
                                u.trim() && n && (n(u.trim()), p(""), c(!1));
                              },
                              disabled: a || !u.trim(),
                              className: (0, es.cn)(
                                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg",
                                "bg-primary text-primary-foreground ring-1 ring-primary/40",
                                "text-body font-medium",
                                "transition-colors hover:bg-primary-hover",
                                "focus:outline-hidden focus:ring-3 focus:ring-ring/20",
                                "disabled:cursor-not-allowed disabled:opacity-50",
                              ),
                              children: "Submit",
                            }),
                            (0, r.jsx)("button", {
                              type: "button",
                              onClick: () => {
                                (p(""), c(!1));
                              },
                              disabled: a,
                              className: (0, es.cn)(
                                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg",
                                "bg-secondary text-secondary-foreground ring-1 ring-secondary-hover",
                                "text-body",
                                "transition-colors hover:bg-secondary-hover",
                                "focus:outline-hidden focus:ring-3 focus:ring-ring/20",
                                "disabled:cursor-not-allowed disabled:opacity-50",
                              ),
                              children: "Cancel",
                            }),
                          ],
                        }),
                      ],
                    })
                  : (0, r.jsxs)("div", {
                      className: "flex items-center gap-2",
                      children: [
                        t &&
                          "idle" === s &&
                          (0, r.jsxs)("button", {
                            type: "button",
                            onClick: t,
                            disabled: a,
                            className: (0, es.cn)(
                              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg",
                              "bg-primary text-primary-foreground ring-1 ring-primary/40",
                              "text-body font-medium",
                              "transition-colors hover:bg-primary-hover",
                              "focus:outline-hidden focus:ring-3 focus:ring-ring/20",
                              "disabled:cursor-not-allowed disabled:opacity-50",
                            ),
                            children: [
                              (0, r.jsx)(eD.A, {
                                className: "h-4 w-4 shrink-0",
                              }),
                              "Continue",
                            ],
                          }),
                        n &&
                          "idle" === s &&
                          (0, r.jsxs)("button", {
                            type: "button",
                            onClick: () => {
                              c(!0);
                            },
                            disabled: a,
                            className: (0, es.cn)(
                              "flex items-center gap-1.5 px-3 py-1.5 rounded-lg",
                              "bg-secondary text-secondary-foreground ring-1 ring-secondary-hover",
                              "text-body",
                              "transition-colors hover:bg-secondary-hover",
                              "focus:outline-hidden focus:ring-3 focus:ring-ring/20",
                              "disabled:cursor-not-allowed disabled:opacity-50",
                            ),
                            children: [
                              (0, r.jsx)(eJ.A, {
                                className: "h-4 w-4 shrink-0",
                              }),
                              "Edit or fix",
                            ],
                          }),
                      ],
                    }),
              ],
            });
      }
      var nL = n(54485);
      function nF({
        open: e,
        onOpenChange: t,
        timestamp: n,
        messagePreview: a,
        onConfirm: s,
      }) {
        let [i, o] = (0, el.J0)(!1),
          l = async () => {
            o(!0);
            try {
              await s();
            } finally {
              (o(!1), t(!1));
            }
          };
        return (0, r.jsx)(eH.lG, {
          open: e,
          onOpenChange: t,
          children: (0, r.jsxs)(eH.Cf, {
            className: "max-w-md",
            children: [
              (0, r.jsxs)(eH.c7, {
                children: [
                  (0, r.jsx)(eH.L3, { children: "Restore checkpoint?" }),
                  (0, r.jsx)(eH.rr, {
                    children:
                      "Your project will return to its state at this point in the conversation.",
                  }),
                ],
              }),
              (0, r.jsxs)("div", {
                className:
                  "space-y-2 rounded-2xl bg-muted/65 p-3.5 ring-1 ring-inset ring-border/55",
                children: [
                  (0, r.jsxs)("div", {
                    className: "flex items-start gap-2",
                    children: [
                      (0, r.jsx)("span", {
                        className:
                          "min-w-[4.5rem] text-caption font-medium text-muted-foreground",
                        children: "Created",
                      }),
                      (0, r.jsx)("span", {
                        className: "text-caption text-foreground",
                        children: new Date(n).toLocaleString(void 0, {
                          weekday: "short",
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                          second: "2-digit",
                        }),
                      }),
                    ],
                  }),
                  a &&
                    (0, r.jsxs)("div", {
                      className: "flex items-start gap-2",
                      children: [
                        (0, r.jsx)("span", {
                          className:
                            "min-w-[4.5rem] text-caption font-medium text-muted-foreground",
                          children: "Message",
                        }),
                        (0, r.jsxs)("span", {
                          className: "text-caption text-foreground italic",
                          children: [
                            '"',
                            a.length <= 100 ? a : a.slice(0, 100) + "...",
                            '"',
                          ],
                        }),
                      ],
                    }),
                ],
              }),
              (0, r.jsx)("div", {
                className:
                  "rounded-2xl bg-warning/10 p-3.5 ring-1 ring-inset ring-warning/20",
                children: (0, r.jsxs)("div", {
                  className: "flex items-start gap-2",
                  children: [
                    (0, r.jsx)(nt.A, {
                      className: "mt-0.5 h-4 w-4 shrink-0 text-warning",
                    }),
                    (0, r.jsxs)("div", {
                      className: "space-y-0.5",
                      children: [
                        (0, r.jsx)("p", {
                          className: "text-caption font-medium text-warning",
                          children: "This action cannot be undone",
                        }),
                        (0, r.jsx)("p", {
                          className:
                            "text-caption leading-relaxed text-warning",
                          children:
                            "Your Roblox Studio will automatically sync to this restored state.",
                        }),
                      ],
                    }),
                  ],
                }),
              }),
              (0, r.jsxs)(eH.Es, {
                children: [
                  (0, r.jsx)(ef.$n, {
                    type: "button",
                    variant: "outline",
                    onClick: () => t(!1),
                    disabled: i,
                    children: "Cancel",
                  }),
                  (0, r.jsxs)(ef.$n, {
                    type: "button",
                    variant: "destructive",
                    onClick: l,
                    disabled: i,
                    children: [
                      i
                        ? (0, r.jsx)(m.A, {
                            "aria-hidden": "true",
                            className:
                              "size-4 animate-spin motion-reduce:animate-none",
                          })
                        : (0, r.jsx)(nL.A, {
                            "aria-hidden": "true",
                            className: "size-4",
                          }),
                      i ? "Restoring…" : "Restore checkpoint",
                    ],
                  }),
                ],
              }),
            ],
          }),
        });
      }
      var nU = n(19246);
      function nD({ src: e }) {
        let [t, n] = (0, o.useState)(!1),
          [a, s] = (0, o.useState)(!1);
        return (
          (0, o.useEffect)(() => {
            (n(!1), s(!1));
            let e = setTimeout(() => s(!0), 150);
            return () => clearTimeout(e);
          }, [e]),
          (0, r.jsxs)("span", {
            className: "relative size-[18px] shrink-0",
            children: [
              !t &&
                a &&
                (0, r.jsx)("span", {
                  className:
                    "absolute inset-0 animate-pulse rounded-full bg-muted-foreground/30 motion-reduce:animate-none",
                }),
              (0, r.jsx)(eo.default, {
                src: e,
                alt: "",
                width: 18,
                height: 18,
                draggable: !1,
                className: (0, es.cn)(t ? "opacity-70" : "opacity-0"),
                onLoad: () => n(!0),
              }),
            ],
          })
        );
      }
      function nO({
        tasks: e,
        icons: t,
        nextMoveMode: n = !1,
        prefix: a,
        disabled: s = !1,
        consumed: i = !1,
        consumedTask: l,
        initialSelectedIndex: d,
        selectedIndex: c,
        itemClassName: u,
        onSelect: m,
      }) {
        let p = (0, o.useId)(),
          [h, g] = (0, o.useState)("number" == typeof d ? d : null);
        (0, o.useEffect)(() => {
          "number" == typeof d && g(d);
        }, [d]);
        let x = void 0 === c ? h : c,
          f = s || i,
          b = (0, o.useMemo)(
            () =>
              e.map((e, n) => {
                let r = t?.[n],
                  a = r
                    ? `/game-memory-icons/${r}.png`
                    : (0, nU.ll)({ id: e, title: e, desc: "" }),
                  s = x === n;
                return {
                  task: e,
                  index: n,
                  isSelected: s,
                  isDimmed: null !== x && !s,
                  icon: a,
                };
              }),
            [e, t, x],
          ),
          y = n && i ? (l ?? ("number" == typeof x ? e[x] : void 0)) : void 0;
        return n && y
          ? (0, r.jsxs)("div", {
              className:
                "flex min-h-10 w-full items-start gap-2 rounded-control bg-muted px-3 py-2 text-body text-muted-foreground shadow-control",
              role: "status",
              "aria-live": "polite",
              children: [
                (0, r.jsx)(eD.A, {
                  className: "mt-0.5 size-4 shrink-0 text-success",
                  "aria-hidden": "true",
                }),
                (0, r.jsxs)("span", {
                  className: "min-w-0 text-pretty",
                  children: [
                    (0, r.jsx)("span", {
                      className: "text-label-compact text-foreground",
                      children: "Sent next:",
                    }),
                    " ",
                    y,
                  ],
                }),
              ],
            })
          : (0, r.jsx)("div", {
              className: "w-full",
              children: n
                ? (0, r.jsxs)("div", {
                    role: "group",
                    "aria-labelledby": p,
                    children: [
                      (0, r.jsxs)("p", {
                        id: p,
                        className:
                          "mb-2 flex items-center gap-1.5 px-1 text-label-lg text-foreground",
                        children: [
                          (0, r.jsx)(e$.A, {
                            className: "size-3.5 text-muted-foreground",
                            "aria-hidden": "true",
                          }),
                          "Smart Suggestions",
                        ],
                      }),
                      (0, r.jsx)("div", {
                        className: "space-y-2",
                        children: b.map((e) => {
                          let { task: t, index: a, isSelected: s, icon: i } = e,
                            o = n && 0 === a,
                            l = w(t),
                            d = s ? "In prompt" : l.cta;
                          return (0, r.jsxs)(
                            ef.$n,
                            {
                              type: "button",
                              variant: "outline",
                              disabled: f,
                              "aria-label": `${d}: ${t}`,
                              "data-selected": s ? "true" : void 0,
                              "data-primary-suggestion": o ? "true" : void 0,
                              className: (0, es.cn)(
                                "group min-h-[2.2rem] h-auto w-full justify-start gap-2 whitespace-normal rounded-control border-input/50 px-3 py-1 text-left transition-[background-color,border-color,box-shadow,color] motion-control data-[enabled]:hover:border-foreground/20 data-[enabled]:hover:bg-accent motion-reduce:transform-none motion-reduce:transition-none",
                                n
                                  ? "bg-transparent shadow-none"
                                  : "bg-card shadow-control data-[enabled]:hover:shadow-control-hover",
                                o &&
                                  "border-brand-sky/55 bg-brand-blue/12 data-[enabled]:hover:border-brand-sky/80 data-[enabled]:hover:bg-brand-blue/20",
                                s &&
                                  (o
                                    ? "border-brand-sky/80 bg-brand-blue/22 shadow-control data-[enabled]:hover:bg-brand-blue/22"
                                    : "border-primary/60 bg-primary/10 shadow-control data-[enabled]:hover:bg-primary/10"),
                              ),
                              onClick: () => {
                                (g(a), m?.({ task: t, index: a }));
                              },
                              children: [
                                (0, r.jsx)(nD, { src: i }),
                                (0, r.jsx)("span", {
                                  className:
                                    "min-w-0 flex-1 text-pretty text-body-lg text-foreground",
                                  children: t,
                                }),
                                s
                                  ? (0, r.jsx)(eD.A, {
                                      className: "size-4 shrink-0 text-primary",
                                      "aria-hidden": "true",
                                    })
                                  : (0, r.jsx)(eL.A, {
                                      className:
                                        "size-4 shrink-0 text-muted-foreground opacity-0 transition-opacity motion-control group-hover:opacity-100 group-focus-visible:opacity-100 motion-reduce:transition-none",
                                      "aria-hidden": "true",
                                    }),
                              ],
                            },
                            a,
                          );
                        }),
                      }),
                    ],
                  })
                : (0, r.jsxs)(r.Fragment, {
                    children: [
                      a &&
                        (0, r.jsx)("div", {
                          className: "mb-2 whitespace-pre-wrap text-body-lg",
                          children: a
                            .split(/(\*\*.*?\*\*)/)
                            .map((e, t) =>
                              e.startsWith("**") && e.endsWith("**")
                                ? (0, r.jsx)(
                                    "strong",
                                    { children: e.slice(2, -2) },
                                    t,
                                  )
                                : e,
                            ),
                        }),
                      (0, r.jsx)("div", {
                        className: "space-y-2",
                        children: b.map(
                          ({
                            task: e,
                            index: t,
                            isSelected: n,
                            isDimmed: a,
                            icon: s,
                          }) =>
                            (0, r.jsx)(
                              "div",
                              {
                                className: (0, es.cn)(
                                  "rounded-lg border-2 px-3 py-1 transition-colors",
                                  n ? "border-primary/60" : "border-border",
                                  f
                                    ? "pointer-events-none cursor-not-allowed opacity-50"
                                    : (0, es.cn)(
                                        "cursor-pointer",
                                        !u && "dark:hover:bg-neutral-700!",
                                      ),
                                  a && !f ? "bg-muted/50" : "",
                                  u,
                                ),
                                onClick: () => {
                                  f || (g(t), m?.({ task: e, index: t }));
                                },
                                children: (0, r.jsxs)("div", {
                                  className: "flex items-center gap-2",
                                  children: [
                                    (0, r.jsx)(nD, { src: s }),
                                    (0, r.jsx)("p", {
                                      className: "text-body-lg text-foreground",
                                      title: e,
                                      children: e,
                                    }),
                                  ],
                                }),
                              },
                              t,
                            ),
                        ),
                      }),
                    ],
                  }),
            });
      }
      var nz = n(82259),
        nH = n(571),
        nq = n(17704),
        nJ = n(40740);
      let nB = ["R6", "R15"];
      function nG({ clipName: e, clipUrl: t, rig: n }) {
        let [a, s] = (0, el.J0)(n);
        return (0, r.jsxs)("div", {
          "data-slot": "animation-preview",
          className: "w-96 max-w-full",
          children: [
            (0, r.jsx)(nJ.U, {
              clipUrl: t,
              rigs: [a],
              className: "h-64 w-full",
            }),
            (0, r.jsxs)("div", {
              className: "mt-1 flex items-center justify-between gap-2",
              children: [
                (0, r.jsxs)("span", {
                  className: "text-caption text-muted-foreground",
                  children: [e, " on ", a],
                }),
                (0, r.jsx)("div", {
                  role: "group",
                  "aria-label": "Preview rig",
                  className: "flex gap-1",
                  children: nB.map((e) =>
                    (0, r.jsx)(
                      ef.$n,
                      {
                        type: "button",
                        size: "sm",
                        variant: a === e ? "secondary" : "ghost",
                        "aria-pressed": a === e,
                        onClick: () => s(e),
                        children: e,
                      },
                      e,
                    ),
                  ),
                }),
              ],
            }),
          ],
        });
      }
      var nW = n(95704);
      let nV = ({ imageUrl: e, templateName: t }) => {
          let [n, a] = (0, o.useState)(!1),
            [s, i] = (0, o.useState)(!1);
          return ((0, o.useEffect)(() => {
            if (!s) return;
            let e = (e) => {
              "Escape" === e.key && i(!1);
            };
            return (
              document.addEventListener("keydown", e),
              () => document.removeEventListener("keydown", e)
            );
          }, [s]),
          n)
            ? (0, r.jsx)("div", {
                className:
                  "my-2 rounded-lg overflow-hidden border border-white/10 max-w-md",
                children: (0, r.jsxs)("div", {
                  className:
                    "w-full h-32 flex items-center justify-center bg-muted/20 text-body text-muted-foreground",
                  children: [t, " screenshot expired"],
                }),
              })
            : (0, r.jsxs)(r.Fragment, {
                children: [
                  (0, r.jsxs)("div", {
                    className:
                      "group relative my-2 max-w-md cursor-pointer overflow-hidden rounded-lg border border-white/10 transition-[border-color,box-shadow] hover:border-white/30 hover:shadow-lg hover:shadow-white/5 motion-reduce:transition-none",
                    onClick: () => i(!0),
                    children: [
                      (0, r.jsx)("img", {
                        src: e,
                        alt: `${t} preview`,
                        className:
                          "w-full transition-transform duration-200 group-hover:scale-[1.02]",
                        onError: () => a(!0),
                      }),
                      (0, r.jsx)("div", {
                        className:
                          "absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors",
                      }),
                    ],
                  }),
                  s &&
                    (0, f.createPortal)(
                      (0, r.jsxs)("div", {
                        className:
                          "fixed inset-0 z-9999 flex items-center justify-center bg-black/80 backdrop-blur-xs",
                        onClick: () => i(!1),
                        children: [
                          (0, r.jsx)("button", {
                            onClick: () => i(!1),
                            className:
                              "absolute top-4 right-4 text-white/70 hover:text-white transition-colors p-2 rounded-full bg-white/10 hover:bg-white/20",
                            "aria-label": "Close",
                            children: (0, r.jsx)(eA.A, {
                              className: "w-5 h-5",
                            }),
                          }),
                          (0, r.jsx)("div", {
                            className: "max-w-[90vw] max-h-[90vh]",
                            onClick: (e) => e.stopPropagation(),
                            children: (0, r.jsx)("img", {
                              src: e,
                              alt: `${t} preview`,
                              className:
                                "max-w-full max-h-[90vh] object-contain rounded-lg",
                            }),
                          }),
                        ],
                      }),
                      document.body,
                    ),
                ],
              });
        },
        nK = ({ content: e, components: t }) =>
          (0, r.jsx)("div", {
            className: "space-y-2",
            children: e.map((e, n) =>
              "text" === e.type
                ? (0, r.jsx)(
                    nu.oz,
                    {
                      remarkPlugins: [nm.A],
                      components: t,
                      children: eN(e.text),
                    },
                    n,
                  )
                : "image" === e.type
                  ? (0, r.jsxs)(
                      "div",
                      {
                        className: "relative inline-block group mr-2 mb-2",
                        children: [
                          (0, r.jsx)(eo.default, {
                            src: e.imageUrl,
                            alt: e.fileName || "Uploaded image",
                            width: 512,
                            height: 512,
                            quality: 90,
                            className:
                              "max-w-32 max-h-32 rounded-lg border border-border object-cover",
                            title: e.fileName,
                          }),
                          e.fileName &&
                            (0, r.jsx)("div", {
                              className:
                                "text-caption text-muted-foreground mt-1 truncate max-w-32",
                              children: e.fileName,
                            }),
                        ],
                      },
                      n,
                    )
                  : "gui-feedback" === e.type
                    ? (0, r.jsx)(
                        nV,
                        { imageUrl: e.imageUrl, templateName: e.templateName },
                        n,
                      )
                    : "animation-preview" === e.type
                      ? (0, r.jsx)(nG, { ...e }, `${n}:${e.clipUrl}:${e.rig}`)
                      : null,
            ),
          }),
        nQ = o.memo(
          ({
            floating: e = !1,
            compactTop: t = !1,
            compactBottom: n = !1,
            message: s,
            completedSteps: i = [],
            taskStatuses: l,
            currentStep: d,
            isPlaytesting: c = !1,
            onPlanApprove: m,
            onPlanReject: p,
            onPlanEdit: h,
            isProcessing: g = !1,
            isRestoring: x = !1,
            onRollback: f,
            isLatestMessage: b = !1,
            hidePlanTodoList: y = !1,
            onPlaytestContinue: v,
            onPlaytestRefine: j,
            currentChatId: k,
            setInput: N,
            onRatingExpand: I,
            onTaskSuggestionSelect: C,
            nextMoveSuggestionsEnabled: S = !1,
            selectedTaskSuggestion: A,
            consumedTaskSuggestionIndexes: P,
            rewardBannerHumanMessageId: M,
            onExploreCards: _,
            playtestGifHumanMessageId: T,
            playtestGifOrdinal: R,
            uiPinWarning: E = !1,
          }) => {
            let $ = (0, ni.F)(),
              { getToken: L } = (0, u.d)(),
              [F, U] = (0, o.useState)(null),
              [D, O] = (0, o.useState)(!1),
              [z, H] = (0, o.useState)(!1),
              q = (() => {
                let e =
                  s.additional_kwargs &&
                  "object" == typeof s.additional_kwargs &&
                  "playtestStatus" in s.additional_kwargs
                    ? s.additional_kwargs.playtestStatus
                    : void 0;
                return "reviewed" === e || "refining" === e ? e : "idle";
              })(),
              [J, B] = (0, o.useState)(q);
            (0, o.useEffect)(() => {
              g || "refining" !== J || B("idle");
            }, [g, J]);
            let G = (0, o.useMemo)(
                () =>
                  "user" === s.role && s.text
                    ? Array.from(
                        s.text.matchAll(/<(?!\/)([A-Za-z0-9_.-]+)>/g),
                      ).map((e) => e[1])
                    : [],
                [s],
              ),
              W = (0, o.useMemo)(
                () =>
                  "user" === s.role && s.text
                    ? s.text
                        .replace(/<([A-Za-z0-9_.-]+)>[\s\S]*?<\/\1>/g, "")
                        .trim()
                    : s.text || "",
                [s],
              ),
              V = (0, o.useCallback)(
                (e) =>
                  (0, r.jsx)(ef.$n, {
                    onClick: () =>
                      ((e, t) => {
                        navigator.clipboard.writeText(e).then(() => {
                          (t(e), setTimeout(() => t(null), 2e3));
                        });
                      })(ek(e), U),
                    size: "sm",
                    variant: "ghost",
                    className: "p-1 h-6",
                    children:
                      F === ek(e)
                        ? (0, r.jsx)(eD.A, {
                            className: "h-4 w-4 text-success",
                          })
                        : (0, r.jsx)(tQ.A, { className: "w-4 h-4" }),
                  }),
                [F],
              ),
              K = (0, o.useCallback)(
                (e) => {
                  let { node: t, children: n } = e,
                    a = ek(n);
                  return (0, r.jsxs)("div", {
                    className: "relative group",
                    children: [
                      (0, r.jsx)("div", {
                        className:
                          "absolute top-0 right-0 flex opacity-0 transition-opacity group-hover:opacity-100 group-focus-within:opacity-100",
                        children: V(a),
                      }),
                      o.createElement(
                        t.tagName,
                        {
                          ...e,
                          className: `${e.className || ""} hover:bg-transparent rounded p-1 pr-12 transition-colors`,
                        },
                        n,
                      ),
                    ],
                  });
                },
                [V],
              ),
              Q = (0, o.useMemo)(
                () =>
                  ((e, t, n) => ({
                    code: ({ className: n, children: a, ...s }) => {
                      let i = /language-(\w+)/.exec(n || "");
                      return i
                        ? (0, r.jsxs)("div", {
                            className:
                              "relative border border-input rounded-md mt-8 my-2 -translate-y-4 overflow-x-auto",
                            children: [
                              (0, r.jsx)("div", {
                                className:
                                  "absolute top-0 left-0 rounded-tl px-2 py-1 text-caption font-semibold text-muted-foreground",
                                children: i[1],
                              }),
                              (0, r.jsx)("div", {
                                className:
                                  "sticky top-0 right-0 flex justify-end z-10",
                                children: (0, r.jsx)("div", {
                                  className:
                                    "flex border border-input shadow-lg bg-background rounded-md",
                                  children: t(a),
                                }),
                              }),
                              (0, r.jsx)(nz.A, {
                                style: "light" === e ? nH.A : nq.A,
                                language: i[1],
                                PreTag: "div",
                                customStyle: {
                                  margin: 0,
                                  padding: "0.5rem",
                                  fontSize: "0.875rem",
                                },
                                children: ek(a),
                              }),
                            ],
                          })
                        : (0, r.jsx)("code", {
                            className: `${n || ""} bg-black/15 dark:bg-white/5 px-1.5 py-0.5 rounded text-body font-mono`,
                            ...s,
                            children: eN(ek(a)),
                          });
                    },
                    p: ({ children: e, ...t }) => n({ children: e, ...t }),
                    h1: ({ children: e, ...t }) => n({ children: e, ...t }),
                    h2: ({ children: e, ...t }) => n({ children: e, ...t }),
                    h3: ({ children: e, ...t }) => n({ children: e, ...t }),
                    h4: ({ children: e, ...t }) => n({ children: e, ...t }),
                    h5: ({ children: e, ...t }) => n({ children: e, ...t }),
                    h6: ({ children: e, ...t }) => n({ children: e, ...t }),
                    ul: (e) =>
                      (0, r.jsx)("ul", {
                        className: "list-disc pl-6 mb-4 space-y-2",
                        children: e.children,
                      }),
                    ol: (e) =>
                      (0, r.jsx)("ol", {
                        className: "list-decimal pl-6 mb-4 space-y-2",
                        children: e.children,
                      }),
                  }))($, V, K),
                [$, V, K],
              ),
              { thinkingContent: Y, mainMessage: Z } = ((e) => {
                if (!e || "string" != typeof e)
                  return { thinkingContent: null, mainMessage: e || "" };
                let t = e.replace(/<analysis>[\s\S]*?<\/analysis>/g, "").trim(),
                  n = t.match(/<thinking>([\s\S]*?)<\/thinking>/);
                return n && n[1]
                  ? {
                      thinkingContent: n[1].trim(),
                      mainMessage: t.replace(n[0], "").trim(),
                    }
                  : { thinkingContent: null, mainMessage: t };
              })(s.text),
              X = null;
            s.additional_kwargs?.plan &&
              (X = {
                plan: s.additional_kwargs.plan,
                planStatus: s.additional_kwargs.planStatus || "pending",
                executionSessionId: s.additional_kwargs.executionSessionId,
                threadId: s.additional_kwargs.threadId,
                runId: s.additional_kwargs.runId,
                graphId: s.additional_kwargs.graphId,
              });
            let ee =
                s.additional_kwargs?.playtestStep === !0
                  ? {
                      playtestStep: !0,
                      executionSessionId:
                        s.additional_kwargs.executionSessionId,
                      threadId: s.additional_kwargs.threadId,
                      runId: s.additional_kwargs.runId,
                      graphId: s.additional_kwargs.graphId,
                    }
                  : null,
              et = s.additional_kwargs?.taskSuggestions ?? null,
              en = s.additional_kwargs?.taskSuggestionsState,
              er = P?.[s.id],
              ea = en?.consumed === !0 || "number" == typeof er,
              ei = "number" == typeof en?.selectedIndex ? en.selectedIndex : er,
              eo =
                void 0 === A
                  ? void 0
                  : A?.messageId === s.id
                    ? A.selectedIndex
                    : ea
                      ? ei
                      : null,
              el = X?.plan || [],
              ed = l ? l.map((e) => e.description) : el,
              ec = l
                ? l
                    .filter((e) => "completed" === e.status)
                    .map((e) => e.description)
                : i,
              eu = !!X,
              em =
                !!X &&
                ("pending" === X.planStatus || "inprogress" === X.planStatus),
              ep = 0 === ed.length,
              eh = em && !ep ? "" : Z;
            return "activity" === s.role
              ? (0, r.jsx)(nv, {
                  message: s,
                  playtestGifHumanMessageId: T,
                  playtestGifOrdinal: R,
                })
              : (0, r.jsxs)("div", {
                  children: [
                    "activity" === s.role &&
                      (0, r.jsx)(nv, {
                        message: s,
                        playtestGifHumanMessageId: T,
                        playtestGifOrdinal: R,
                      }),
                    ("assistant" === s.role || "user" === s.role) &&
                      (0, r.jsx)("div", {
                        className: `text-left relative w-full flex ${"assistant" === s.role ? "justify-start" : "justify-end"}`,
                        children: (0, r.jsxs)("div", {
                          className: (0, es.cn)(
                            "relative w-fit wrap-break-word",
                            "user" === s.role
                              ? "max-w-[840px] rounded-tl-2xl rounded-tr-2xl rounded-bl-2xl rounded-br-none p-2"
                              : "max-w-full text-foreground",
                            e
                              ? "user" === s.role
                                ? "rounded-2xl border border-white/10 bg-map-user p-3 text-white shadow-lg"
                                : (0, es.cn)(
                                    "w-full px-1",
                                    t ? "pt-1" : "pt-3.5",
                                    n ? "pb-1" : "pb-3.5",
                                  )
                              : "user" === s.role
                                ? "border-2 border-white/10 bg-black/5 text-black dark:bg-white/10 dark:text-white"
                                : "bg-background dark:bg-neutral-800!",
                          ),
                          children: [
                            "user" === s.role &&
                              s.context &&
                              (0, r.jsxs)("div", {
                                className: "mb-2 rounded-lg",
                                children: [
                                  (0, r.jsx)("div", {
                                    className: "flex flex-wrap gap-1",
                                    children: ((e) => {
                                      let t,
                                        n = [],
                                        r =
                                          /<([A-Za-z0-9_.-]+)>([\s\S]*?)<\/\1>/g,
                                        a = 0;
                                      for (; null !== (t = r.exec(e));) {
                                        let e = t[1],
                                          r = t[2].trim();
                                        (n.push({
                                          id: `context-file-${a}`,
                                          type: "file",
                                          name: e.split(".").pop() || e,
                                          content: r,
                                        }),
                                          (a += 1));
                                      }
                                      return (
                                        e
                                          .split(
                                            /(?=File |Code from |Image \d{1,2}:)/,
                                          )
                                          .forEach((e, t) => {
                                            let r = e.trim().split("\n"),
                                              a = r[0],
                                              s = r.slice(1).join("\n").trim();
                                            s = s
                                              .replace(/^```[\w-]*\n/, "")
                                              .replace(/\n```$/, "");
                                            let i = a.startsWith("File "),
                                              o = a.startsWith("Image "),
                                              l = a
                                                .replace(
                                                  /^(File |Code from |Image )/,
                                                  "",
                                                )
                                                .replace(":", "")
                                                .trim();
                                            !(
                                              !s ||
                                              s.trim().startsWith('from "')
                                            ) &&
                                              (n.some(
                                                (e) =>
                                                  e.name === l &&
                                                  e.content === s,
                                              ) ||
                                                n.push({
                                                  id: `context-legacy-${t}`,
                                                  type: i
                                                    ? "file"
                                                    : o
                                                      ? "image"
                                                      : "code",
                                                  name: l,
                                                  content: s,
                                                }));
                                          }),
                                        n
                                      );
                                    })(s.context).map((e) =>
                                      (0, r.jsxs)(
                                        "div",
                                        {
                                          className:
                                            "flex items-center gap-1 px-2 py-0.5 border border-neutral-500/20 dark:border-neutral-500/20 rounded text-body-lg text-foreground mb-1 mr-1",
                                          children: [
                                            (0, r.jsx)(nd.A, {
                                              className: "h-4 w-4 mr-1",
                                            }),
                                            (0, r.jsx)("span", {
                                              className:
                                                "truncate max-w-[150px] text-body-lg",
                                              children: e.name,
                                            }),
                                          ],
                                        },
                                        e.id,
                                      ),
                                    ),
                                  }),
                                  !1,
                                ],
                              }),
                            "user" === s.role &&
                              s.text &&
                              (0, r.jsx)("div", {
                                className:
                                  "absolute top-0 right-0 flex p-1 text-muted-foreground",
                                children:
                                  s.hasCheckpoint &&
                                  s.checkpointId &&
                                  s.checkpointCreatedAt &&
                                  f
                                    ? (0, r.jsx)(ef.$n, {
                                        onClick: () => H(!0),
                                        disabled: x || g,
                                        size: "sm",
                                        variant: "ghost",
                                        className: "p-1 h-6",
                                        title:
                                          "Restore project to this checkpoint",
                                        children: (0, r.jsx)(nc.A, {
                                          style: { width: 18, height: 18 },
                                        }),
                                      })
                                    : V(s.text),
                              }),
                            "user" === s.role &&
                              s.checkpointId &&
                              s.checkpointCreatedAt &&
                              f &&
                              (0, r.jsx)(nF, {
                                open: z,
                                onOpenChange: H,
                                checkpointId: s.checkpointId,
                                timestamp: s.checkpointCreatedAt,
                                messagePreview: s.text,
                                onConfirm: () => {
                                  (f(s.checkpointId, s.id, s.text), H(!1));
                                },
                              }),
                            "assistant" === s.role
                              ? (0, r.jsxs)(r.Fragment, {
                                  children: [
                                    Y &&
                                      (0, r.jsxs)("div", {
                                        className:
                                          "mb-2 p-2 border border-border rounded-md bg-muted/30",
                                        children: [
                                          (0, r.jsxs)("button", {
                                            onClick: () => O(!D),
                                            className:
                                              "flex items-center text-caption text-muted-foreground hover:text-foreground w-full",
                                            children: [
                                              D
                                                ? (0, r.jsx)(eU.A, {
                                                    className: "w-3 h-3 mr-1",
                                                  })
                                                : (0, r.jsx)(eX.A, {
                                                    className: "w-3 h-3 mr-1",
                                                  }),
                                              "AI Thoughts",
                                            ],
                                          }),
                                          D &&
                                            (0, r.jsx)("div", {
                                              className:
                                                "mt-1 pt-1 border-t border-border text-caption text-muted-foreground whitespace-pre-wrap",
                                              children: Y,
                                            }),
                                        ],
                                      }),
                                    ee
                                      ? (0, r.jsx)("div", {
                                          className: "w-full",
                                          children: (0, r.jsx)(n$, {
                                            question:
                                              s.text ||
                                              "Time to playtest! Confirm it works as expected, then choose: Continue to the next task, or Adjust this task.",
                                            status: J,
                                            onContinue: b
                                              ? () => {
                                                  (B("reviewed"),
                                                    (async () => {
                                                      try {
                                                        let e = nl(),
                                                          t = await L({
                                                            template: "convex",
                                                          });
                                                        t && e.setAuth(t);
                                                        let n = {
                                                          type: "ai",
                                                          content: s.text || "",
                                                          additional_kwargs: {
                                                            ...(s.additional_kwargs ||
                                                              {}),
                                                            playtestStep: !0,
                                                            playtestStatus:
                                                              "reviewed",
                                                            executionSessionId:
                                                              s.executionSessionId,
                                                          },
                                                        };
                                                        await e.mutation(
                                                          a.FH.agentMemory
                                                            .mutations
                                                            .updateMessage,
                                                          {
                                                            messageId: s.id,
                                                            message:
                                                              JSON.stringify(n),
                                                          },
                                                        );
                                                      } catch {}
                                                    })(),
                                                    v?.(ee));
                                                }
                                              : void 0,
                                            onRefine: b
                                              ? (e) => {
                                                  (B("refining"),
                                                    (async () => {
                                                      try {
                                                        let e = nl(),
                                                          t = await L({
                                                            template: "convex",
                                                          });
                                                        t && e.setAuth(t);
                                                        let n = {
                                                          type: "ai",
                                                          content: s.text || "",
                                                          additional_kwargs: {
                                                            ...(s.additional_kwargs ||
                                                              {}),
                                                            playtestStep: !0,
                                                            playtestStatus:
                                                              "refining",
                                                            executionSessionId:
                                                              s.executionSessionId,
                                                          },
                                                        };
                                                        await e.mutation(
                                                          a.FH.agentMemory
                                                            .mutations
                                                            .updateMessage,
                                                          {
                                                            messageId: s.id,
                                                            message:
                                                              JSON.stringify(n),
                                                          },
                                                        );
                                                      } catch {}
                                                    })(),
                                                    j?.(e, ee));
                                                }
                                              : void 0,
                                            disabled: g,
                                          }),
                                        })
                                      : et
                                        ? (0, r.jsx)("div", {
                                            className: "w-full",
                                            children: (0, r.jsx)(nO, {
                                              tasks: et.tasks,
                                              icons: et.icons,
                                              nextMoveMode: S,
                                              prefix: et.prefix,
                                              disabled: g,
                                              consumed: ea,
                                              consumedTask: en?.consumedTask,
                                              initialSelectedIndex: ei,
                                              selectedIndex: eo,
                                              onSelect: ({
                                                task: e,
                                                index: t,
                                              }) => {
                                                let n = w(e);
                                                (N?.(n.composerValue),
                                                  C?.({
                                                    chatId: k ?? null,
                                                    messageId: s.id,
                                                    selectedIndex: t,
                                                    messageText: s.text,
                                                    taskSuggestions: et,
                                                  }));
                                              },
                                            }),
                                          })
                                        : eu && !ep
                                          ? (0, r.jsxs)("div", {
                                              className: "w-full",
                                              children: [
                                                eh &&
                                                  eh.trim() &&
                                                  (0, r.jsx)(nu.oz, {
                                                    remarkPlugins: [nm.A],
                                                    components: Q,
                                                    className: "mb-4",
                                                    children: eN(eh),
                                                  }),
                                                !y &&
                                                  (0, r.jsx)(nE, {
                                                    planItems: ed,
                                                    completedSteps: ec,
                                                    currentStep: d,
                                                    isPlaytesting: c,
                                                    uiPinWarning: E,
                                                    onApprove:
                                                      X?.planStatus ===
                                                        "pending" &&
                                                      (X?.graphId ===
                                                        "designer" ||
                                                        b)
                                                        ? () => m?.(X)
                                                        : void 0,
                                                    onReject:
                                                      X?.planStatus ===
                                                        "pending" &&
                                                      (X?.graphId ===
                                                        "designer" ||
                                                        b)
                                                        ? () => p?.(X)
                                                        : void 0,
                                                    onEdit:
                                                      X?.planStatus ===
                                                        "pending" &&
                                                      (X?.graphId ===
                                                        "designer" ||
                                                        b)
                                                        ? (e) => h?.(e, X)
                                                        : void 0,
                                                    disabled: g,
                                                    showApprovalButtons:
                                                      X?.planStatus ===
                                                        "pending" &&
                                                      (X?.graphId ===
                                                        "designer" ||
                                                        b),
                                                  }),
                                              ],
                                            })
                                          : s.content && s.content.length > 0
                                            ? (0, r.jsxs)(r.Fragment, {
                                                children: [
                                                  (0, r.jsx)(nK, {
                                                    content: s.content,
                                                    components: Q,
                                                  }),
                                                  !s.content.some(
                                                    (e) =>
                                                      "gui-feedback" === e.type,
                                                  ) &&
                                                    (0, r.jsx)(nC, {
                                                      messageId: s.id,
                                                      className: "-mt-1",
                                                      onExpand: I,
                                                    }),
                                                  M && _
                                                    ? (0, r.jsx)(nA, {
                                                        humanMessageId: M,
                                                        onExploreCards: _,
                                                      })
                                                    : null,
                                                ],
                                              })
                                            : (0, r.jsxs)(r.Fragment, {
                                                children: [
                                                  (0, r.jsx)(nu.oz, {
                                                    remarkPlugins: [nm.A],
                                                    components: Q,
                                                    children: eN(eh),
                                                  }),
                                                  eh &&
                                                    eh.trim() &&
                                                    (0, r.jsx)(nC, {
                                                      messageId: s.id,
                                                      className: "-mt-1",
                                                      onExpand: I,
                                                    }),
                                                  M && _
                                                    ? (0, r.jsx)(nA, {
                                                        humanMessageId: M,
                                                        onExploreCards: _,
                                                      })
                                                    : null,
                                                ],
                                              }),
                                  ],
                                })
                              : (0, r.jsx)("div", {
                                  className: `whitespace-pre-wrap group text-body-lg ${s.text ? "pr-12" : ""}`,
                                  children:
                                    s.content && s.content.length > 0
                                      ? (0, r.jsx)(nK, {
                                          content: s.content,
                                          components: Q,
                                        })
                                      : (0, r.jsxs)(r.Fragment, {
                                          children: [
                                            G.length > 0 &&
                                              (0, r.jsx)("div", {
                                                className:
                                                  "flex flex-wrap gap-1 mb-2",
                                                children: G.map((e) => {
                                                  let t =
                                                    e.split(".").pop() || e;
                                                  return (0, r.jsxs)(
                                                    "div",
                                                    {
                                                      className:
                                                        "flex items-center gap-1 px-2 py-0.5 border border-neutral-500/20 dark:border-neutral-500/20 rounded text-body-lg text-foreground",
                                                      children: [
                                                        (0, r.jsx)(nd.A, {
                                                          className:
                                                            "h-4 w-4 mr-1",
                                                        }),
                                                        (0, r.jsx)("span", {
                                                          className:
                                                            "truncate max-w-[150px] text-body-lg",
                                                          children: t,
                                                        }),
                                                      ],
                                                    },
                                                    e,
                                                  );
                                                }),
                                              }),
                                            W,
                                          ],
                                        }),
                                }),
                          ],
                        }),
                      }),
                    nW.env.NEXT_PUBLIC_SHOW_DEBUG &&
                      "user" === s.role &&
                      (0, r.jsx)("div", {
                        className:
                          "text-caption text-muted-foreground mt-1 text-right",
                        children: s.id,
                      }),
                  ],
                });
          },
        );
      function nY({ activities: e, isExpanded: t, onToggle: n }) {
        let [a, s] = (0, o.useState)(!1),
          i = (0, o.useId)(),
          l = "boolean" == typeof t ? t : a;
        if (!e || 0 === e.length) return null;
        let d = e.some((e) => "started" === e.activityStatus);
        return (0, r.jsxs)("div", {
          className: "text-left relative",
          children: [
            (0, r.jsxs)(ef.$n, {
              type: "button",
              variant: "ghost",
              className: `h-auto w-fit justify-start gap-2 rounded-lg border border-border/40 bg-neutral-200/5 px-3 py-1 text-left text-body-lg text-muted-foreground hover:bg-neutral-200/10 ${d ? "animate-pulse motion-reduce:animate-none" : ""}`,
              onClick: () => {
                let e = !l;
                (n && n(e), "boolean" != typeof t && s(e));
              },
              "aria-expanded": l,
              "aria-controls": i,
              children: [
                (0, r.jsx)(tf.A, {
                  className: "h-4 w-4",
                  "aria-hidden": "true",
                }),
                (0, r.jsxs)("span", {
                  className:
                    "whitespace-nowrap overflow-hidden text-ellipsis flex-1",
                  children: [
                    "Investigating (",
                    e.length,
                    " ",
                    1 === e.length ? "tool" : "tools",
                    ")",
                  ],
                }),
                (0, r.jsx)("span", {
                  className: "ml-1",
                  "aria-hidden": "true",
                  children: l
                    ? (0, r.jsx)(eU.A, { className: "w-4 h-4" })
                    : (0, r.jsx)(eX.A, { className: "w-4 h-4" }),
                }),
                d &&
                  (0, r.jsxs)("span", {
                    className: "ml-2 flex space-x-1",
                    "aria-hidden": "true",
                    children: [
                      (0, r.jsx)("div", {
                        className:
                          "h-1 w-1 animate-bounce rounded-full bg-current motion-reduce:animate-none",
                        style: { animationDelay: "0ms" },
                      }),
                      (0, r.jsx)("div", {
                        className:
                          "h-1 w-1 animate-bounce rounded-full bg-current motion-reduce:animate-none",
                        style: { animationDelay: "150ms" },
                      }),
                      (0, r.jsx)("div", {
                        className:
                          "h-1 w-1 animate-bounce rounded-full bg-current motion-reduce:animate-none",
                        style: { animationDelay: "300ms" },
                      }),
                    ],
                  }),
              ],
            }),
            l &&
              (0, r.jsx)("div", {
                id: i,
                className:
                  "ml-4 mt-2 space-y-2 border-l-2 border-border/30 pl-3",
                children: e.map((e) => (0, r.jsx)(nv, { message: e }, e.id)),
              }),
          ],
        });
      }
      nQ.displayName = "ChatMessage";
      var nZ = n(28944),
        nX = n(90843);
      function n0(e) {
        if (e.additional_kwargs?.cancelled === !0) return !0;
        let t = e.text?.toLowerCase() ?? "";
        return t.includes("cancelled by user") || t.includes("aborted by user");
      }
      let n1 = {
        thinking: "Thinking through the next move",
        planning: "Planning the next build step",
        reading: "Understanding your project",
        searching: "Finding the right game systems",
        memory_bank: "Reviewing your game context",
        writing: "Writing your game systems",
        editing: "Refining your game systems",
        creating: "Creating new game systems",
        executing: "Running the build",
        tool_use: "Working on your game",
        screenshot: "Reviewing the latest build",
      };
      function n5({
        count: e,
        stepsRow: t,
        playtestRows: n,
        allRows: a,
        soundEnabled: s,
        playtestRunning: i,
        burstScale: l,
        onExpand: d,
        immersive: c,
        activityLabel: u,
        startedAt: m,
      }) {
        let [p, h] = (0, o.useState)(!1);
        return (0, r.jsxs)("div", {
          className: "flex flex-col gap-2",
          children: [
            (0, r.jsx)(nX.A, {
              count: e,
              onClick: () => {
                (p || d?.(), h(!p));
              },
              expanded: p,
              soundEnabled: s,
              accelerated: i,
              burstScale: l,
              variant: c ? "immersive" : "classic",
              activityLabel: u,
              startedAt: m,
            }),
            p
              ? (0, r.jsxs)("div", { className: "space-y-2", children: [t, a] })
              : n
                ? (0, r.jsx)("div", { className: "space-y-2", children: n })
                : null,
          ],
        });
      }
      function n2({
        activities: e,
        playtestEntries: t,
        humanMessageId: n,
        renderRows: i,
        onExpand: o,
        immersive: l,
        celebrate: d,
      }) {
        let c = (0, s.IT)(
            a.FH.playtestGifs.listByHumanMessageId,
            n && t.length > 0 ? { humanMessageId: n } : "skip",
          ),
          u = new Set(t.filter((e) => !!c?.[e.ordinal]?.url).map((e) => e.id)),
          m = e.filter((e) => !u.has(e.id)),
          p = e.filter((e) => u.has(e.id));
        return (0, r.jsxs)("div", {
          className: "flex flex-col gap-2",
          children: [
            (0, r.jsx)(nZ.A, {
              onExpand: o,
              immersive: l,
              actionCount: e.length,
              celebrate: d,
              children: i(m),
            }),
            p.length > 0 &&
              (0, r.jsx)("div", { className: "space-y-2", children: i(p) }),
          ],
        });
      }
      function n4({
        floating: e = !1,
        messagesToDisplay: t,
        allExecutionSessions: n,
        setContext: a,
        projectId: s,
        currentChatId: i,
        activeFileName: l,
        activeFileContent: d,
        handlePlanApprove: c,
        handlePlanReject: u,
        handlePlanEdit: m,
        isProcessing: p,
        isApprovingPlan: h,
        restorationPreviewTimestamp: g,
        setRestorationPreviewTimestamp: x,
        input: f,
        setInput: b,
        isRestoring: y,
        setIsRestoring: v,
        handlePlaytestContinue: w,
        handlePlaytestRefine: j,
        handleRollback: k,
        onRatingExpand: N,
        onSwitchToComposer: I,
        onTaskSuggestionSelect: C,
        nextMoveSuggestionsEnabled: S = !1,
        selectedTaskSuggestion: A,
        consumedTaskSuggestionIndexes: P,
        hidePlanTodoList: M = !1,
        onExploreCards: _,
        uiPinWarning: T = !1,
        roadmapSlot: R,
        roadmapBeforeMessageId: E,
        flipSoundEnabled: $ = !0,
        flipBurstScale: L = 1,
        slotMachineEnabled: F = !0,
        unpinAutoFollow: U,
      }) {
        let D = (0, o.useRef)(p),
          O = D.current && !p;
        (0, o.useEffect)(() => {
          D.current = p;
        }, [p]);
        let z = (0, o.useMemo)(
            () => [
              "thinking",
              "reading",
              "searching",
              "writing",
              "deleting",
              "editing",
              "creating",
              "tool_use",
              "planning",
              "executing",
              "memory_bank",
              "screenshot",
            ],
            [],
          ),
          H = (0, o.useCallback)(
            (e) => ("string" == typeof e && z.includes(e) ? e : void 0),
            [z],
          ),
          q = (0, o.useMemo)(() => ["started", "completed", "failed"], []),
          J = (0, o.useCallback)(
            (e) => ("string" == typeof e && q.includes(e) ? e : void 0),
            [q],
          ),
          B = (0, o.useCallback)((e) => {
            if ("activity" !== e.role) return !1;
            let t = `${e.text ?? ""} ${e.activityTitle ?? ""}`.toLowerCase();
            return !(!t.includes("playtest") || t.includes("complet"));
          }, []),
          G = (0, o.useMemo)(() => {
            if (p || h || 0 === t.length) return null;
            for (let e = t.length - 1; e >= 0; e--) {
              let n = t[e];
              if ("assistant" !== n.role) continue;
              let r = n.additional_kwargs;
              if (
                !(
                  (r?.plan &&
                    ("pending" === r.planStatus ||
                      "inprogress" === r.planStatus)) ||
                  r?.taskSuggestions ||
                  r?.playtestStep
                ) &&
                n.text &&
                n.text.trim().length > 0
              ) {
                for (let r = e - 1; r >= 0; r--)
                  if ("user" === t[r].role)
                    return {
                      assistantMessageId: n.id,
                      humanMessageId: t[r].id,
                    };
                break;
              }
            }
            return null;
          }, [t, p, h]),
          W = (0, o.useMemo)(
            () =>
              t.map((e, r) => {
                let o,
                  I = r === t.length - 1,
                  R = e.executionSessionId
                    ? n.find(
                        (t) => t.executionSessionId === e.executionSessionId,
                      )
                    : (I && n[0]) || null,
                  E = R?.pastSteps ? R.pastSteps.map((e) => e[0]) : [],
                  $ = null !== g && void 0 !== e.timestamp && e.timestamp > g,
                  L = 0;
                if (B(e))
                  for (let e = r - 1; e >= 0; e--) {
                    let n = t[e];
                    if ("user" === n.role) {
                      o = n.id;
                      break;
                    }
                    B(n) && L++;
                  }
                let F = !1;
                if (e.additional_kwargs?.plan)
                  for (let e = r + 1; e < t.length; e++) {
                    let n = t[e];
                    if ("user" === n.role) break;
                    if (n0(n)) {
                      F = !0;
                      break;
                    }
                  }
                return {
                  message: {
                    id: e.id,
                    role: e.role,
                    text: e.text ?? "",
                    content: e.content,
                    type: "text",
                    context: e.context ?? void 0,
                    timestamp: e.timestamp ?? Date.now(),
                    error: void 0,
                    changes: void 0,
                    activityId: e.activityId,
                    activityType: H(e.activityType),
                    activityStatus: J(e.activityStatus),
                    activityStartedAt: e.activityStartedAt,
                    activityTitle: e.activityTitle,
                    diff: e.diff,
                    additional_kwargs: e.additional_kwargs,
                    checkpointId: e.checkpointId,
                    checkpointCreatedAt: e.checkpointCreatedAt,
                    hasCheckpoint: e.hasCheckpoint,
                  },
                  setContext: a,
                  projectId: s,
                  currentChatId: i,
                  activeFileName: l,
                  activeFileContent: d,
                  mergeDecorationsCollection: void 0,
                  setMergeDecorationsCollection: () => {},
                  completedSteps: E,
                  taskStatuses: R?.taskStatuses || void 0,
                  currentStep: R?.currentStep || void 0,
                  isPlaytesting:
                    (R &&
                      "boolean" == typeof R.isPlaytesting &&
                      R.isPlaytesting) ||
                    !1,
                  onPlanApprove: c,
                  onPlanReject: u,
                  onPlanEdit: m,
                  isProcessing: p || h,
                  isLatestMessage: I,
                  restorationPreviewTimestamp: g,
                  setRestorationPreviewTimestamp: x,
                  isGreyedOut: $,
                  input: f,
                  setInput: b,
                  isRestoring: y,
                  setIsRestoring: v,
                  onPlaytestContinue: w,
                  onPlaytestRefine: j,
                  onRollback: k,
                  onRatingExpand: N,
                  onTaskSuggestionSelect: C,
                  nextMoveSuggestionsEnabled: S,
                  selectedTaskSuggestion: A,
                  consumedTaskSuggestionIndexes: P,
                  hidePlanTodoList: M || F,
                  setIsContextExpanded: () => {},
                  rewardBannerHumanMessageId:
                    G && G.assistantMessageId === e.id
                      ? G.humanMessageId
                      : void 0,
                  onExploreCards:
                    G && G.assistantMessageId === e.id ? _ : void 0,
                  playtestGifHumanMessageId: o,
                  playtestGifOrdinal: L,
                  uiPinWarning: T,
                };
              }),
            [
              t,
              n,
              a,
              s,
              i,
              l,
              d,
              c,
              u,
              m,
              p,
              h,
              g,
              f,
              b,
              y,
              x,
              v,
              N,
              H,
              J,
              w,
              j,
              k,
              C,
              S,
              A,
              P,
              M,
              G,
              _,
              B,
              T,
            ],
          ),
          V = (0, o.useMemo)(
            () =>
              (function (e) {
                let t = [],
                  n = [];
                for (let r of e)
                  "activity" === r.role
                    ? n.push(r)
                    : (n.length > 0 &&
                        (t.push({ kind: "run", activities: n }), (n = [])),
                      t.push({ kind: "single", message: r }));
                return (
                  n.length > 0 && t.push({ kind: "run", activities: n }),
                  t
                );
              })(t),
            [t],
          ),
          K = (0, o.useMemo)(() => {
            if (!F || !p) return null;
            let e = V[V.length - 1];
            if (!e || "run" !== e.kind) return null;
            let n = t.findIndex((t) => t.id === e.activities[0].id);
            for (let e = n - 1; e >= 0; e--) {
              let n = t[e];
              if ("user" === n.role || n0(n)) break;
              if (
                "assistant" === n.role &&
                n.additional_kwargs?.plan &&
                "inprogress" === n.additional_kwargs.planStatus
              )
                return n.id;
            }
            return null;
          }, [F, p, V, t]),
          Q = (0, o.useCallback)(
            (n) =>
              (function (e) {
                let t = [],
                  n = [];
                for (let r of e)
                  !(function (e) {
                    if ("activity" !== e.role) return !1;
                    let t = e.activityTitle || "";
                    return /^(grep(ped)?|glob(bed)?|ls|listed)\b/i.test(t);
                  })(r)
                    ? (n.length > 0 && (t.push(n), (n = [])), t.push(r))
                    : n.push(r);
                return (n.length > 0 && t.push(n), t);
              })(n).map((n) => {
                if (Array.isArray(n))
                  return (0, r.jsx)(
                    nY,
                    { activities: n },
                    `investigation-${n[0].id}`,
                  );
                let a = W[t.findIndex((e) => e.id === n.id)];
                return a ? (0, r.jsx)(nQ, { ...a, floating: e }, n.id) : null;
              }),
            [e, t, W],
          );
        return (0, r.jsx)(nI, {
          chatId: i,
          onSwitchToComposer: I,
          children: (0, r.jsxs)("div", {
            className: (0, es.cn)(
              "space-y-3",
              e && "flex min-h-full flex-col justify-end",
            ),
            children: [
              V.map((n, a) => {
                let s = "run" === n.kind ? n.activities[0]?.id : n.message.id,
                  i =
                    R && E && s === E
                      ? (0, r.jsx)(
                          o.Fragment,
                          { children: R },
                          "roadmap-inline-slot",
                        )
                      : null;
                if ("run" === n.kind) {
                  let s = n.activities,
                    l = s[0],
                    d = t.findIndex((e) => e.id === l.id),
                    c = d > 0 ? t[d - 1].role : null,
                    u = p && a === V.length - 1,
                    m = s.filter(B),
                    h = (function (e) {
                      for (let t = e.length - 1; t >= 0; t--)
                        if ("started" === e[t].activityStatus) return e[t];
                      return e[e.length - 1];
                    })(s),
                    g = u && K ? t.findIndex((e) => e.id === K) : -1,
                    x =
                      g >= 0 && W[g]
                        ? (0, r.jsx)(nQ, { ...W[g], floating: e })
                        : null;
                  return (0, r.jsxs)(
                    o.Fragment,
                    {
                      children: [
                        i,
                        (0, r.jsxs)("div", {
                          className: "conversation-block",
                          children: [
                            (0 === d ||
                              ("assistant" !== c && "activity" !== c)) &&
                              (0, r.jsxs)("div", {
                                className: "flex items-center gap-1.5 mb-3",
                                children: [
                                  (0, r.jsx)(ee.x, { size: 22 }),
                                  (0, r.jsx)("span", {
                                    className: "text-wordmark",
                                    children: "Lemonade",
                                  }),
                                ],
                              }),
                            F
                              ? u
                                ? (0, r.jsx)(n5, {
                                    count: s.length,
                                    stepsRow: x,
                                    playtestRows: m.length > 0 ? Q(m) : null,
                                    allRows: Q(s),
                                    soundEnabled: $,
                                    playtestRunning: m.some(
                                      (e) => "started" === e.activityStatus,
                                    ),
                                    burstScale: L,
                                    onExpand: U,
                                    immersive: e,
                                    activityLabel: (function (e) {
                                      let t = e?.activityTitle?.trim();
                                      return (
                                        t ||
                                        (e?.activityType
                                          ? (n1[e.activityType] ??
                                            "Working on your game")
                                          : "Working on your game")
                                      );
                                    })(h),
                                    startedAt:
                                      s[0]?.activityStartedAt ??
                                      s[0]?.timestamp,
                                  })
                                : (0, r.jsx)(n2, {
                                    activities: s,
                                    playtestEntries: m.map((e) => {
                                      let n = t.findIndex((t) => t.id === e.id);
                                      return {
                                        id: e.id,
                                        ordinal: W[n]?.playtestGifOrdinal ?? 0,
                                      };
                                    }),
                                    humanMessageId:
                                      m.length > 0
                                        ? W[
                                            t.findIndex((e) => e.id === m[0].id)
                                          ]?.playtestGifHumanMessageId
                                        : void 0,
                                    renderRows: Q,
                                    onExpand: U,
                                    immersive: e,
                                    celebrate: e && O && a === V.length - 1,
                                  })
                              : (0, r.jsx)("div", {
                                  className: "space-y-2",
                                  children: Q(s),
                                }),
                          ],
                        }),
                      ],
                    },
                    `activity-run-${l.id}`,
                  );
                }
                {
                  if (n.message.id === K) return i;
                  let s = t.findIndex((e) => e.id === n.message.id),
                    l = W[s];
                  if (!l) return null;
                  let d = s > 0 ? W[s - 1].message.role : null,
                    c =
                      "assistant" === l.message.role &&
                      (0 === s || ("assistant" !== d && "activity" !== d)),
                    u = a > 0 ? V[a - 1] : void 0,
                    m = V[a + 1],
                    p =
                      u?.kind === "single" &&
                      !!u.message.additional_kwargs?.taskSuggestions,
                    h =
                      !!l.message.additional_kwargs?.taskSuggestions &&
                      m?.kind === "single" &&
                      "assistant" === m.message.role;
                  return (0, r.jsxs)(
                    o.Fragment,
                    {
                      children: [
                        i,
                        (0, r.jsxs)("div", {
                          className: "conversation-block",
                          children: [
                            c &&
                              (0, r.jsxs)("div", {
                                className: "flex items-center gap-1.5 mb-3",
                                children: [
                                  (0, r.jsx)(ee.x, { size: 22 }),
                                  (0, r.jsx)("span", {
                                    className: "text-wordmark",
                                    children: "Lemonade",
                                  }),
                                ],
                              }),
                            (0, r.jsx)(nQ, {
                              ...l,
                              floating: e,
                              compactTop: e && p,
                              compactBottom: e && h,
                            }),
                          ],
                        }),
                      ],
                    },
                    l.message.id,
                  );
                }
              }),
              p &&
                (!F ||
                  (V[V.length - 1]?.kind !== "run" &&
                    (() => {
                      let e = t[t.length - 1];
                      return (
                        !e ||
                        "user" === e.role ||
                        ("assistant" === e.role &&
                          !!e.additional_kwargs?.plan &&
                          "inprogress" === e.additional_kwargs.planStatus)
                      );
                    })())) &&
                !t.some(
                  (e) =>
                    "activity" === e.role &&
                    "started" === e.activityStatus &&
                    e.timestamp &&
                    Date.now() - e.timestamp < 3e4,
                ) &&
                (0, r.jsxs)("div", {
                  className: "conversation-block",
                  children: [
                    0 === W.length ||
                    (W[W.length - 1]?.message.role !== "assistant" &&
                      W[W.length - 1]?.message.role !== "activity")
                      ? (0, r.jsxs)("div", {
                          className: "flex items-center gap-1.5 mb-3",
                          children: [
                            (0, r.jsx)(ee.x, { size: 22 }),
                            (0, r.jsx)("span", {
                              className: "text-wordmark",
                              children: "Lemonade",
                            }),
                          ],
                        })
                      : null,
                    F
                      ? (0, r.jsx)(nX.A, {
                          count: 0,
                          soundEnabled: $,
                          rolling: !1,
                          variant: e ? "immersive" : "classic",
                          activityLabel: "Preparing your build",
                        })
                      : (0, r.jsx)("div", {
                          className:
                            "flex items-center gap-2 p-4 text-foreground",
                          children: (0, r.jsxs)("div", {
                            className: "flex space-x-1 ml-2",
                            children: [
                              (0, r.jsx)("div", {
                                className:
                                  "w-1 h-1 bg-current rounded-full animate-bounce",
                                style: { animationDelay: "0ms" },
                              }),
                              (0, r.jsx)("div", {
                                className:
                                  "w-1 h-1 bg-current rounded-full animate-bounce",
                                style: { animationDelay: "150ms" },
                              }),
                              (0, r.jsx)("div", {
                                className:
                                  "w-1 h-1 bg-current rounded-full animate-bounce",
                                style: { animationDelay: "300ms" },
                              }),
                            ],
                          }),
                        }),
                  ],
                }),
            ],
          }),
        });
      }
      let n3 = o.memo(({ hasMoreMessages: e, onLoadMore: t }) =>
        e
          ? (0, r.jsx)("div", {
              className: "flex justify-center mb-4",
              children: (0, r.jsx)("button", {
                onClick: t,
                className:
                  "px-4 py-2 border hover:bg-secondary/40 text-secondary-foreground/60 rounded-md text-body font-medium transition-colors",
                children: "Show earlier messages",
              }),
            })
          : null,
      );
      n3.displayName = "MessagePagination";
      var n6 = n(39867),
        n8 = n(8597),
        n7 = n(162),
        n9 = n(93499);
      function re() {
        return (0, r.jsxs)("div", {
          "aria-hidden": "true",
          className:
            "flex h-28 flex-col overflow-hidden rounded-control bg-background shadow-surface",
          children: [
            (0, r.jsxs)("div", {
              className:
                "flex h-5 shrink-0 items-center gap-1 border-b border-border/70 bg-muted px-2",
              children: [
                (0, r.jsx)("span", {
                  className: "size-1.5 rounded-pill bg-destructive/70",
                }),
                (0, r.jsx)("span", {
                  className: "size-1.5 rounded-pill bg-warning/70",
                }),
                (0, r.jsx)("span", {
                  className: "size-1.5 rounded-pill bg-success/70",
                }),
                (0, r.jsx)("span", {
                  className: "ml-1 h-2 flex-1 rounded-pill bg-background/80",
                }),
              ],
            }),
            (0, r.jsxs)("div", {
              className: "flex flex-1 items-center justify-between px-3",
              children: [
                (0, r.jsxs)("div", {
                  className: "flex items-center gap-1.5",
                  children: [
                    (0, r.jsx)(eo.default, {
                      src: "/project-icons/roblox.svg",
                      alt: "",
                      width: 22,
                      height: 22,
                      className:
                        "size-5 rounded-sm outline -outline-offset-1 outline-foreground/10",
                    }),
                    (0, r.jsx)("span", {
                      className: "h-2 w-8 rounded-pill bg-muted-foreground/20",
                    }),
                  ],
                }),
                (0, r.jsx)("span", {
                  className:
                    "flex size-7 items-center justify-center rounded-control bg-roblox text-white shadow-control",
                  children: (0, r.jsx)(n6.A, { className: "size-3.5" }),
                }),
              ],
            }),
          ],
        });
      }
      function rt({ connected: e, featured: t = !1 }) {
        return (0, r.jsxs)("div", {
          "aria-hidden": "true",
          className: (0, es.cn)(
            "flex flex-col overflow-hidden rounded-control bg-neutral-200 shadow-surface",
            t ? "h-52 sm:h-60" : "h-28",
          ),
          children: [
            (0, r.jsxs)("div", {
              className:
                "flex h-4 shrink-0 items-center gap-1 border-b border-neutral-300 bg-brand-white px-2",
              children: [
                (0, r.jsx)("span", {
                  className: "size-1.5 rounded-pill bg-neutral-300",
                }),
                (0, r.jsx)("span", {
                  className: "h-1.5 w-7 rounded-pill bg-neutral-200",
                }),
                (0, r.jsx)("span", {
                  className: "ml-auto h-1.5 w-4 rounded-sm bg-info/70",
                }),
              ],
            }),
            (0, r.jsxs)("div", {
              className:
                "flex h-3.5 shrink-0 items-center gap-1 border-b border-neutral-300 bg-neutral-100 px-2",
              children: [
                (0, r.jsx)("span", {
                  className: "h-1.5 w-3 rounded-sm bg-info/70",
                }),
                (0, r.jsx)("span", {
                  className: "h-1.5 w-3 rounded-sm bg-neutral-300",
                }),
                (0, r.jsx)("span", {
                  className: "h-1.5 w-3 rounded-sm bg-destructive/55",
                }),
                (0, r.jsx)("span", {
                  className: "ml-1 h-1 w-8 rounded-pill bg-neutral-300",
                }),
              ],
            }),
            (0, r.jsxs)("div", {
              className: "relative min-h-0 flex-1 overflow-hidden",
              children: [
                (0, r.jsx)("div", {
                  className: "absolute inset-x-0 top-0 h-[46%] bg-info/35",
                }),
                (0, r.jsx)("div", {
                  className:
                    "absolute inset-x-0 bottom-0 h-[56%] bg-slate-500/75",
                }),
                (0, r.jsx)("div", {
                  className:
                    "absolute inset-x-0 top-[44%] h-px bg-brand-white/40",
                }),
                (0, r.jsxs)("div", {
                  className:
                    "absolute left-1/2 top-1/2 w-36 -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-control bg-brand-white shadow-overlay ring-1 ring-brand-black/10",
                  children: [
                    (0, r.jsxs)("div", {
                      className:
                        "relative flex h-3 items-center justify-center bg-neutral-200",
                      children: [
                        (0, r.jsx)("span", {
                          className: "h-0.5 w-7 rounded-pill bg-neutral-400",
                        }),
                        (0, r.jsx)("span", {
                          className:
                            "absolute right-1.5 size-1 rounded-pill bg-neutral-400",
                        }),
                      ],
                    }),
                    (0, r.jsxs)("div", {
                      className: "flex h-7 items-center gap-1.5 px-1.5",
                      children: [
                        (0, r.jsx)(eo.default, {
                          src: "/favicon.ico",
                          alt: "",
                          width: 18,
                          height: 18,
                          className: "size-4.5 shrink-0",
                        }),
                        (0, r.jsx)("span", {
                          className: "h-1.5 w-5 rounded-pill bg-neutral-300",
                        }),
                        (0, r.jsx)("span", {
                          className: (0, es.cn)(
                            "relative ml-auto flex h-4 w-10 items-center justify-center rounded-sm",
                            e ? "bg-success/20" : "bg-success",
                          ),
                          children: e
                            ? (0, r.jsx)(eD.A, {
                                className: "size-2.5 text-success",
                              })
                            : (0, r.jsx)(n8.A, {
                                className:
                                  "absolute -bottom-1 -right-1 size-3.5 fill-brand-white text-brand-black drop-shadow-sm",
                              }),
                        }),
                        (0, r.jsx)("span", {
                          className:
                            "relative h-4 w-8 rounded-sm bg-neutral-700",
                          children: (0, r.jsx)("span", {
                            className: (0, es.cn)(
                              "absolute right-1 top-1/2 size-1.5 -translate-y-1/2 rounded-pill",
                              e ? "bg-success" : "bg-destructive",
                            ),
                          }),
                        }),
                      ],
                    }),
                    (0, r.jsxs)("div", {
                      className:
                        "flex h-4 flex-col items-center gap-1 px-3 pt-0.5",
                      children: [
                        (0, r.jsx)("span", {
                          className: "h-1 w-2/3 rounded-pill bg-neutral-300",
                        }),
                        (0, r.jsx)("span", {
                          className: "h-1 w-1/2 rounded-pill bg-neutral-200",
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            }),
          ],
        });
      }
      function rn({ number: e, label: t, state: n, children: a }) {
        return (0, r.jsxs)("li", {
          "aria-current": "active" === n ? "step" : void 0,
          className: (0, es.cn)(
            "relative rounded-surface p-2 shadow-surface",
            "active" === n && "bg-brand/8",
            "complete" === n && "bg-success/6 ring-1 ring-success/25",
            "pending" === n && "bg-muted/45 ring-1 ring-border/60",
          ),
          children: [
            void 0 !== e &&
              (0, r.jsx)("span", {
                className: (0, es.cn)(
                  "layer-sticky absolute left-3 top-3 flex size-6 items-center justify-center rounded-pill text-caption font-semibold tabular-nums shadow-control",
                  "complete" === n && "bg-success text-success-foreground",
                  "active" === n && "bg-brand text-brand-foreground",
                  "pending" === n && "bg-background text-muted-foreground",
                ),
                children:
                  "complete" === n
                    ? (0, r.jsx)(eD.A, {
                        className: "size-3.5",
                        "aria-hidden": "true",
                      })
                    : e,
              }),
            a,
            (0, r.jsxs)("div", {
              className: "flex items-center justify-between px-1 pb-0.5 pt-2",
              children: [
                (0, r.jsx)("span", {
                  className: "text-compact-body font-medium text-foreground",
                  children: t,
                }),
                "active" === n && void 0 !== e
                  ? (0, r.jsx)("span", {
                      className:
                        "rounded-pill bg-brand px-2 py-0.5 text-caption font-medium text-brand-foreground shadow-control",
                      children: "Current",
                    })
                  : (0, r.jsx)("span", {
                      className: "sr-only",
                      children:
                        "complete" === n
                          ? "Complete"
                          : "active" === n
                            ? "Current step"
                            : "Not started",
                    }),
              ],
            }),
          ],
        });
      }
      function rr({
        open: e,
        onOpenChange: t,
        pluginConnected: n,
        skipInstallStep: a = !1,
        reconnecting: s = !1,
        onInstallPlugin: o,
      }) {
        let [l, d] = (0, i.J0)(!1);
        ((0, i.vJ)(() => {
          e || d(!1);
        }, [e]),
          (0, i.vJ)(() => {
            if (!e || !n) return;
            let r = window.setTimeout(() => t(!1), 900);
            return () => window.clearTimeout(r);
          }, [t, e, n]));
        let { installState: c, connectState: u } = (function ({
            pluginConnected: e,
            pluginPageOpened: t,
            reconnecting: n,
            skipInstallStep: r,
          }) {
            let a = r || n || t || e;
            return {
              installState: a ? "complete" : "active",
              connectState: e ? "complete" : a ? "active" : "pending",
            };
          })({
            pluginConnected: n,
            pluginPageOpened: l,
            reconnecting: s,
            skipInstallStep: a,
          }),
          m = "complete" === c;
        return (0, r.jsx)(eH.lG, {
          open: e,
          onOpenChange: t,
          children: (0, r.jsxs)(eH.Cf, {
            showCloseButton: !1,
            overlayClassName:
              "bg-black/70 after:pointer-events-none after:absolute after:left-1/2 after:top-1/2 after:h-[120vmin] after:w-[120vmin] after:-translate-x-1/2 after:-translate-y-1/2 after:rounded-full after:bg-surface-glow-soft after:blur-2xl",
            onOpenAutoFocus: (e) => e.preventDefault(),
            className:
              "max-h-[calc(100dvh-2rem)] max-w-xl gap-0 overflow-y-auto rounded-overlay bg-card p-0 shadow-overlay outline-hidden",
            children: [
              (0, r.jsxs)("div", {
                className: "px-6 pb-4 pt-6",
                children: [
                  (0, r.jsx)(eH.L3, {
                    className: "text-balance text-title",
                    children: s
                      ? "Reconnect Roblox Studio"
                      : "Connect Roblox Studio",
                  }),
                  (0, r.jsx)(eH.rr, {
                    className: "mt-1.5 text-pretty",
                    children:
                      s || a
                        ? "Open Roblox Studio, then press Connect in the Lemonade plugin."
                        : "Install Lemonade, then open Roblox Studio and press Connect.",
                  }),
                ],
              }),
              (0, r.jsxs)("ol", {
                "aria-label": "Plugin connection steps",
                className: (0, es.cn)(
                  "grid grid-cols-1 gap-3 px-6 pb-5",
                  !a && "sm:grid-cols-2",
                ),
                children: [
                  !a &&
                    (0, r.jsx)(rn, {
                      number: 1,
                      label: "Install plugin",
                      state: c,
                      children: (0, r.jsx)(re, {}),
                    }),
                  (0, r.jsx)(rn, {
                    number: a ? void 0 : 2,
                    label: "Open Studio and press Connect",
                    state: u,
                    children: (0, r.jsx)(rt, { connected: n, featured: a }),
                  }),
                ],
              }),
              (0, r.jsxs)("div", {
                className: "border-t border-border/70 px-6 py-5",
                children: [
                  n
                    ? (0, r.jsxs)("div", {
                        role: "status",
                        "aria-live": "polite",
                        className:
                          "flex min-h-control-comfortable items-center justify-center gap-2 rounded-control bg-success/10 px-4 text-body font-medium text-success",
                        children: [
                          (0, r.jsx)(n7.A, {
                            className: "size-4",
                            "aria-hidden": "true",
                          }),
                          "Plugin connected — you're ready to build",
                        ],
                      })
                    : a
                      ? null
                      : (0, r.jsx)(ef.$n, {
                          asChild: !0,
                          variant: "brand",
                          size: "comfortable",
                          className: "w-full",
                          children: (0, r.jsxs)("a", {
                            href: "https://create.roblox.com/store/asset/85716018250741/Lemonade-AI",
                            target: "_blank",
                            rel: "noopener noreferrer",
                            onClick: () => {
                              (d(!0), o());
                            },
                            children: [
                              s
                                ? "Open plugin page"
                                : "Install Lemonade plugin",
                              (0, r.jsx)(n9.A, { "aria-hidden": "true" }),
                            ],
                          }),
                        }),
                  !n &&
                    (0, r.jsx)("p", {
                      role: "status",
                      "aria-live": "polite",
                      className: (0, es.cn)(
                        "text-center text-muted-foreground",
                        a ? "text-body" : "mt-2 text-caption",
                      ),
                      children: m
                        ? "Waiting for Roblox Studio — open Lemonade and press Connect."
                        : "Already installed? Open Studio and press Connect.",
                    }),
                ],
              }),
            ],
          }),
        });
      }
      var ra = n(27700),
        rs = n(25460);
      function ri({
        messagesToDisplay: e,
        isProcessing: t,
        showFavoriteGamesModal: n,
        setShowFavoriteGamesModal: a,
        dismissedQuickStart: s,
        setDismissedQuickStart: i,
        currentChatId: o,
        clerkUserIdFromAuth: l,
        compact: d = !1,
      }) {
        let [c, u] = (0, el.J0)(!1),
          [m, p] = (0, el.J0)(""),
          h = 0 === e.length && !t && !s;
        return (0, r.jsxs)(r.Fragment, {
          children: [
            h &&
              !d &&
              (0, r.jsx)("div", {
                className:
                  "w-full min-h-[50vh] flex items-center justify-center pt-10",
                children: (0, r.jsxs)("div", {
                  className:
                    "flex flex-col items-center gap-3 select-none opacity-80 drop-shadow-[0_0_6px_rgba(255,255,255,0.15)]",
                  children: [
                    (0, r.jsxs)("div", {
                      className: "flex flex-col items-center gap-0",
                      children: [
                        (0, r.jsx)(eo.default, {
                          src: "/icons/logo-icon.svg",
                          alt: "Lemonade",
                          width: 112,
                          height: 112,
                          className: "in-[.light]:hidden",
                        }),
                        (0, r.jsx)(eo.default, {
                          src: "/icons/logo-icon-dark.png",
                          alt: "Lemonade",
                          width: 112,
                          height: 112,
                          className: "hidden in-[.light]:block",
                        }),
                        (0, r.jsx)("span", {
                          className: "text-brand-splash",
                          children: "Lemonade",
                        }),
                      ],
                    }),
                    (0, r.jsx)("span", {
                      className: "text-title whitespace-nowrap",
                      children: "turn words into Roblox games",
                    }),
                  ],
                }),
              }),
            n &&
              (0, r.jsx)("div", {
                className:
                  "fixed inset-0 z-50 flex items-center justify-center backdrop-blur-md bg-black/40",
                onClick: () => {
                  (a(!1), i(!1));
                },
                children: (0, r.jsx)("div", {
                  className: "bg-card border rounded-xl p-6 shadow-lg",
                  onClick: (e) => e.stopPropagation(),
                  children: c
                    ? o && l
                      ? (0, r.jsx)(ra.C, {
                          onBack: () => u(!1),
                          onClose: () => {
                            (a(!1), i(!1));
                          },
                          onCreate: () => {
                            a(!1);
                          },
                          universeId: m || void 0,
                        })
                      : (0, r.jsx)("div", {
                          className: "p-4 text-center text-muted-foreground",
                          children: "Loading chat session...",
                        })
                    : (0, r.jsxs)(r.Fragment, {
                        children: [
                          (0, r.jsx)(rs.S, {
                            onValueChange: (e) => {
                              p(e);
                            },
                            onSelect: (e) => {
                              p(e);
                            },
                            onClose: () => {
                              (a(!1), i(!1));
                            },
                          }),
                          (0, r.jsx)("div", {
                            className: "mt-4 flex justify-center",
                            children: (0, r.jsx)("button", {
                              type: "button",
                              onClick: () => m && u(!0),
                              disabled: !m,
                              className: `flex flex-row items-center justify-center rounded-xl border px-4 py-1 text-body-lg font-medium transition-colors ${m ? "border-primary bg-primary text-primary-foreground hover:bg-primary-hover" : "cursor-not-allowed border-border bg-muted text-muted-foreground opacity-50"}`,
                              children: "Confirm selection",
                            }),
                          }),
                        ],
                      }),
                }),
              }),
          ],
        });
      }
      var ro = n(92976),
        rl = n(12108);
      function rd({
        gameName: e,
        steps: t,
        laterSteps: n,
        pluginConnected: a,
        gameThumbnailUrl: s,
        onStartCreation: i,
        onContinue: o,
        onRefine: l,
        isAgentRunning: d,
        stepDone: c,
        isCompleted: u,
        startEnabled: p = !0,
        hasStarted: h,
      }) {
        let [g, x] = (0, el.J0)(!1),
          f = t.filter((e) => e.completed).length,
          y = t.slice(0, 5),
          [v, w] = (0, el.J0)(!1),
          [j, k] = (0, el.J0)(""),
          [N, I] = (0, el.J0)(!1),
          C = () => {
            j.trim() && (l?.(j), k(""), w(!1));
          };
        return (0, r.jsxs)("div", {
          className: (0, es.cn)(
            "bg-card relative w-[81.6%] rounded-xl",
            "shadow-xl",
            "border-border/80 border",
          ),
          children: [
            (0, r.jsxs)("div", {
              className: "p-4 border-b border-border",
              children: [
                (0, r.jsx)("div", {
                  className: "relative mb-4",
                  children: (0, r.jsxs)("h2", {
                    className: "text-body-lg font-semibold text-foreground",
                    children: ["Your game: ", e],
                  }),
                }),
                (0, r.jsx)("div", {
                  className: "relative flex gap-6",
                  children: (0, r.jsxs)("div", {
                    className: "flex-1 min-w-0",
                    children: [
                      (0, r.jsxs)("div", {
                        className: "flex items-center justify-between mb-3",
                        children: [
                          (0, r.jsxs)("div", {
                            className:
                              "flex items-center gap-2 text-body text-muted-foreground font-semibold",
                            children: [
                              (0, r.jsx)(nd.A, { className: "w-4 h-4" }),
                              (0, r.jsxs)("span", {
                                children: ["Steps (", f, "/", t.length, ")"],
                              }),
                            ],
                          }),
                          (0, r.jsx)("button", {
                            type: "button",
                            onClick: () => x(!g),
                            className:
                              "text-muted-foreground hover:text-foreground transition-colors",
                            children: (0, r.jsx)(rl.A, {
                              className: (0, es.cn)(
                                "w-4 h-4 transition-transform",
                                !g && "rotate-180",
                              ),
                            }),
                          }),
                        ],
                      }),
                      (0, r.jsx)("ul", {
                        className: "space-y-2",
                        children: y.map((e) =>
                          (0, r.jsxs)(
                            "li",
                            {
                              className: "flex items-start gap-3 text-body",
                              children: [
                                (0, r.jsx)("span", {
                                  className: "mt-0.5 shrink-0",
                                  children: e.completed
                                    ? (0, r.jsx)(eD.A, {
                                        className: "h-4 w-4 text-success",
                                      })
                                    : e.isCurrent
                                      ? (0, r.jsx)(m.A, {
                                          className:
                                            "h-4 w-4 animate-spin text-info",
                                        })
                                      : (0, r.jsx)(eY.A, {
                                          className:
                                            "w-4 h-4 text-muted-foreground",
                                        }),
                                }),
                                (0, r.jsxs)("span", {
                                  className: (0, es.cn)(
                                    "text-muted-foreground flex-1 min-w-0",
                                    e.completed && "line-through",
                                    !g && "truncate",
                                  ),
                                  title: e.info
                                    ? `${e.label}: ${e.info}`
                                    : e.label,
                                  children: [
                                    (0, r.jsx)("span", {
                                      className: "font-medium text-foreground",
                                      children: e.label,
                                    }),
                                    e.info &&
                                      (0, r.jsxs)("span", {
                                        className: "text-muted-foreground",
                                        children: [": ", e.info],
                                      }),
                                  ],
                                }),
                              ],
                            },
                            e.id,
                          ),
                        ),
                      }),
                      n &&
                        n.length > 0 &&
                        (0, r.jsxs)(r.Fragment, {
                          children: [
                            (0, r.jsx)("div", {
                              className:
                                "mt-3 mb-2 text-overline text-muted-foreground",
                              children: "For later",
                            }),
                            (0, r.jsx)("ul", {
                              className: "space-y-2",
                              children: n.map((e, t) =>
                                (0, r.jsxs)(
                                  "li",
                                  {
                                    className:
                                      "flex items-start gap-3 text-body",
                                    children: [
                                      (0, r.jsx)("span", {
                                        className: "mt-0.5 shrink-0",
                                        children: (0, r.jsx)(eY.A, {
                                          className:
                                            "w-4 h-4 text-muted-foreground",
                                        }),
                                      }),
                                      (0, r.jsx)("span", {
                                        className: (0, es.cn)(
                                          "text-muted-foreground flex-1 min-w-0",
                                          !g && "truncate",
                                        ),
                                        title: e,
                                        children: e,
                                      }),
                                    ],
                                  },
                                  `later-${t}`,
                                ),
                              ),
                            }),
                          ],
                        }),
                    ],
                  }),
                }),
              ],
            }),
            (0, r.jsx)("div", {
              className: "p-3",
              children: a
                ? u
                  ? (0, r.jsxs)("div", {
                      className: "flex items-center gap-3",
                      children: [
                        (0, r.jsx)(eD.A, { className: "h-5 w-5 text-success" }),
                        (0, r.jsx)("span", {
                          className: "text-body font-medium text-foreground",
                          children: "All done! Your game is ready.",
                        }),
                      ],
                    })
                  : c
                    ? (0, r.jsx)(r.Fragment, {
                        children: v
                          ? (0, r.jsxs)("div", {
                              className: "flex items-center gap-2",
                              children: [
                                (0, r.jsxs)("div", {
                                  className:
                                    "flex items-center flex-1 px-3 py-1 bg-background border border-border rounded-xl",
                                  children: [
                                    (0, r.jsx)("span", {
                                      className:
                                        "text-muted-foreground text-body whitespace-nowrap mr-2",
                                      children: "Refine:",
                                    }),
                                    (0, r.jsx)("input", {
                                      type: "text",
                                      value: j,
                                      onChange: (e) => k(e.target.value),
                                      placeholder:
                                        "What would you like to change?",
                                      className:
                                        "flex-1 text-body bg-transparent border-none text-foreground placeholder:text-muted-foreground focus:outline-hidden",
                                      onKeyDown: (e) => {
                                        "Enter" === e.key && j.trim() && C();
                                      },
                                      autoFocus: !0,
                                    }),
                                  ],
                                }),
                                (0, r.jsx)("button", {
                                  type: "button",
                                  onClick: C,
                                  disabled: !j.trim(),
                                  className: (0, es.cn)(
                                    "p-2 rounded-lg transition-colors",
                                    j.trim()
                                      ? "text-foreground hover:bg-muted"
                                      : "text-muted-foreground cursor-not-allowed",
                                  ),
                                  children: (0, r.jsx)(nR.A, {
                                    className: "w-4 h-4",
                                  }),
                                }),
                                (0, r.jsx)("button", {
                                  type: "button",
                                  onClick: () => {
                                    (w(!1), k(""));
                                  },
                                  className:
                                    "p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors",
                                  children: (0, r.jsx)(eA.A, {
                                    className: "w-4 h-4",
                                  }),
                                }),
                              ],
                            })
                          : (0, r.jsxs)("div", {
                              className: "flex items-center gap-3",
                              children: [
                                (0, r.jsx)("button", {
                                  type: "button",
                                  onClick: o,
                                  className: (0, es.cn)(
                                    "flex shrink-0 flex-row items-center justify-center rounded-xl border border-brand-hover bg-brand",
                                    "px-4 py-[0.225rem] text-body-lg font-medium text-brand-foreground",
                                    "transition-colors hover:bg-brand-hover",
                                  ),
                                  children: (0, r.jsx)("span", {
                                    children: "Continue",
                                  }),
                                }),
                                (0, r.jsx)("button", {
                                  type: "button",
                                  onClick: () => w(!0),
                                  className: (0, es.cn)(
                                    "rounded-xl border flex flex-row items-center justify-center",
                                    "border-border bg-transparent",
                                    "px-4 py-[0.225rem] text-body-lg font-medium text-muted-foreground",
                                    "hover:text-foreground hover:border-foreground/50 transition-colors",
                                  ),
                                  children: (0, r.jsx)("span", {
                                    children: "Refine",
                                  }),
                                }),
                              ],
                            }),
                      })
                    : d || h
                      ? (0, r.jsxs)("div", {
                          className: "flex items-center gap-3",
                          children: [
                            (0, r.jsx)(m.A, {
                              className: "h-5 w-5 animate-spin text-info",
                            }),
                            (0, r.jsx)("span", {
                              className: "text-body text-muted-foreground",
                              children: "Creating task...",
                            }),
                          ],
                        })
                      : (0, r.jsx)("div", {
                          className: "flex items-center gap-3",
                          children: (0, r.jsx)("button", {
                            type: "button",
                            onClick: i,
                            disabled: !p,
                            className: (0, es.cn)(
                              "rounded-xl border flex flex-row items-center justify-center shrink-0",
                              "px-4 py-[0.225rem] text-body-lg font-medium",
                              "transition-colors",
                              p
                                ? "border-brand-hover bg-brand text-brand-foreground hover:bg-brand-hover"
                                : "border-border bg-muted text-muted-foreground cursor-not-allowed",
                            ),
                            children: (0, r.jsx)("span", {
                              children: "Start Creation",
                            }),
                          }),
                        })
                : (0, r.jsxs)("div", {
                    className: "flex items-center gap-4",
                    children: [
                      (0, r.jsx)("a", {
                        href: "https://create.roblox.com/store/asset/85716018250741/Lemonade-AI",
                        target: "_blank",
                        rel: "noopener noreferrer",
                        onClick: () => (0, b.G7)(),
                        className: (0, es.cn)(
                          "flex shrink-0 flex-row items-center justify-center rounded-xl border border-brand-hover bg-brand",
                          "px-4 py-[0.225rem] text-body-lg font-medium text-brand-foreground",
                          "transition-colors hover:bg-brand-hover",
                        ),
                        children: (0, r.jsx)("span", {
                          children: "Connect plugin",
                        }),
                      }),
                      (0, r.jsx)("p", {
                        className:
                          "flex items-center text-caption text-muted-foreground leading-snug self-stretch",
                        children: (0, r.jsx)(tH.N, {
                          children:
                            "Install and connect the Lemonade plugin on Studio.",
                        }),
                      }),
                    ],
                  }),
            }),
            s &&
              (0, r.jsx)(ro.B, {
                imageUrl: s,
                open: N,
                onClose: () => I(!1),
                alt: `${e} — game preview`,
              }),
          ],
        });
      }
      var rc = n(10210),
        ru = n(49476),
        rm = n(62683),
        rp = n(91841),
        rh = n(74647),
        rg = n(94352),
        rx = n(47731),
        rf = n(60709),
        rb = n(38707),
        ry = n(35626),
        rv = n(7125),
        rw = n(60770),
        rj = n(6132),
        rk = n(8896);
      function rN(e) {
        return Math.min(
          Math.round(0.4 * window.innerWidth),
          Math.max(Math.round(0.2 * window.innerWidth), Math.round(e)),
        );
      }
      let rI = {
          1: [-90],
          2: [180, 0],
          3: [180, -90, 0],
          4: [180, -90, 0, 90],
        },
        rC = Math.round(81.7),
        rS = Math.round(3.0000000000000027),
        rA =
          "linear-gradient(to bottom, rgba(74,222,128,0.7) 0%, rgba(74,222,128,0.7) 50%, rgba(34,197,94,0.7) 50%, rgba(34,197,94,0.7) 100%)";
      function rP({ quests: e }) {
        let t = e.every((e) => !e.locked && e.done >= e.target);
        return (0, r.jsxs)("div", {
          "data-gm-interactive": !0,
          className: "w-full",
          children: [
            (0, r.jsx)("div", {
              className: "mb-1 text-center text-overline text-white/30",
              children: "Quests",
            }),
            (0, r.jsxs)("div", {
              className: "flex items-start gap-2",
              children: [
                e.map((e) => {
                  let t = !e.locked && e.done >= e.target,
                    n = e.locked ? 0 : Math.min(e.done / e.target, 1);
                  return (0, r.jsxs)(
                    "div",
                    {
                      className:
                        "flex min-w-0 flex-1 flex-col items-center gap-1",
                      children: [
                        (0, r.jsxs)("div", {
                          className: (0, es.cn)(
                            "relative h-5 w-full overflow-hidden rounded-lg border bg-white/5",
                            e.locked
                              ? "border-white/10"
                              : "border-neutral-500/60",
                          ),
                          children: [
                            (0, r.jsx)("div", {
                              className:
                                "absolute inset-y-0 left-0 transition-[width] duration-500 ease-out",
                              style: {
                                width: `${Math.round(100 * n)}%`,
                                backgroundImage: rA,
                              },
                            }),
                            (0, r.jsx)("div", {
                              className:
                                "absolute inset-0 flex items-center justify-center drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]",
                              children: e.locked
                                ? (0, r.jsx)(em.A, {
                                    className: "h-3 w-3 text-white/25",
                                    strokeWidth: 2.75,
                                  })
                                : t
                                  ? (0, r.jsx)(eD.A, {
                                      className: "h-3.5 w-3.5 text-white",
                                      strokeWidth: 3.5,
                                    })
                                  : (0, r.jsxs)("span", {
                                      className:
                                        "text-caption font-bold tabular-nums text-white/70",
                                      children: [e.done, "/", e.target],
                                    }),
                            }),
                          ],
                        }),
                        (0, r.jsx)("span", {
                          className: (0, es.cn)(
                            "line-clamp-2 text-center text-micro font-bold leading-tight",
                            (e.locked, "text-muted-foreground"),
                          ),
                          title: e.label,
                          children: e.label,
                        }),
                      ],
                    },
                    e.id,
                  );
                }),
                (0, r.jsxs)("div", {
                  title: "Rewards soon",
                  className: (0, es.cn)(
                    "relative flex h-5 flex-[0.25] items-center justify-center overflow-hidden rounded-lg border bg-white/5",
                    t ? "border-neutral-500/60" : "border-white/10",
                  ),
                  children: [
                    t &&
                      (0, r.jsx)("div", {
                        className: "absolute inset-0",
                        style: { backgroundImage: rA },
                      }),
                    (0, r.jsx)(rf.A, {
                      strokeWidth: 2.75,
                      className: (0, es.cn)(
                        "relative h-3 w-3 drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]",
                        t ? "text-white" : "text-white/25",
                      ),
                    }),
                  ],
                }),
              ],
            }),
          ],
        });
      }
      function rM(e, t) {
        let n = rI[t];
        return n ? (n[e] ?? -90) : -90 + (360 / t) * e;
      }
      let r_ = { type: "spring", stiffness: 260, damping: 20 },
        rT = { duration: 0 };
      function rR(e, t, n, r) {
        let a = e - n,
          s = t - r,
          i = Math.hypot(a, s) || 1;
        if (i >= 240) return null;
        let o = Math.max(0, 124 - i) + (1 - i / 240) * 14;
        return { x: (a / i) * o, y: (s / i) * o };
      }
      let rE = "text-caption font-semibold text-white/70",
        r$ = (0, es.cn)(
          "inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-lg",
          "border border-border bg-secondary text-secondary-foreground",
          "transition-colors hover:bg-secondary-hover",
          "focus:outline-hidden focus:ring-2 focus:ring-ring/50",
        ),
        rL =
          "polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%)";
      function rF({
        size: e,
        shadow: t,
        className: n,
        rimClassName: a,
        bodyClassName: s,
        bodyInset: i = 3,
        children: o,
      }) {
        return (0, r.jsxs)("div", {
          className: (0, es.cn)("relative", n),
          style: { width: e, height: e },
          children: [
            (0, r.jsx)("div", {
              "aria-hidden": "true",
              className:
                "pointer-events-none absolute inset-[12%] rounded-full",
              style: { boxShadow: t },
            }),
            (0, r.jsx)("div", {
              "aria-hidden": "true",
              className:
                "pointer-events-none absolute -inset-2 rounded-full opacity-25",
              style: {
                background:
                  "radial-gradient(circle, rgba(255,255,255,0.2), transparent 68%)",
              },
            }),
            (0, r.jsx)("div", {
              className: (0, es.cn)("absolute inset-0 bg-black/[0.168]", a),
              style: { clipPath: rL },
            }),
            (0, r.jsx)("div", {
              className: (0, es.cn)("absolute bg-neutral-700", s),
              style: { inset: i, clipPath: rL },
            }),
            (0, r.jsx)("div", {
              className: "absolute inset-0 flex items-center justify-center",
              children: o,
            }),
          ],
        });
      }
      let rU = (0, o.memo)(function ({
        expanded: e,
        onExpand: t,
        onCollapse: n,
        projectId: i,
        onTagMechanic: l,
        onAddSuggestion: d,
        pluginConnected: c = !0,
        isAgentBusy: u = !1,
        onSendToAutoTasks: m,
      }) {
        let p = (0, s.IT)(
            a.FH.gameMemories.getByProject,
            e ? { projectId: i } : "skip",
          ),
          h = (0, s.n_)(a.FH.gameMemories.ensureSeeded),
          g = (0, s.n_)(a.FH.gameMemories.savePositions),
          x = (0, s.n_)(a.FH.gameMemories.moveMechanic),
          f = (0, s.n_)(a.FH.gameMemories.setGameName),
          b = (0, s.n_)(a.FH.gameMemories.startImport),
          y = (0, s.n_)(a.FH.gameMemories.dismissSuggestion),
          v = (0, s.y3)(a.FH.gameMemoryIdeas.generate),
          w = (0, o.useMemo)(() => {
            let e = new Map();
            for (let t of p?.mechanicIdeas ?? []) e.set(t.mechanicId, t.items);
            return e;
          }, [p?.mechanicIdeas]),
          [j, k] = (0, o.useState)(null),
          N = (0, o.useCallback)(
            (e) => {
              (k(e),
                v({ projectId: i, mechanicId: e })
                  .catch((e) => {
                    console.error("[GameMemoryPanel] generateIdeas failed:", e);
                  })
                  .finally(() => k(null)));
            },
            [v, i],
          ),
          [I, C] = (0, o.useState)(!1),
          S = p?.importUsed === !0,
          A = !!p?.importStartedAt && Date.now() - p.importStartedAt < 3e5,
          P = (0, o.useCallback)(() => {
            (C(!1),
              b({ projectId: i }).catch((e) => {
                console.error("[GameMemoryPanel] startImport failed:", e);
              }));
          }, [b, i]),
          [M, _] = (0, o.useState)(!1),
          T = (0, o.useRef)(void 0);
        ((0, o.useEffect)(() => {
          if (void 0 === p) {
            T.current = void 0;
            return;
          }
          let e = p?.agentScheduledAt ?? null;
          if (void 0 === T.current) {
            T.current = e;
            return;
          }
          null !== e && e !== T.current && ((T.current = e), _(!0));
        }, [p]),
          (0, o.useEffect)(() => {
            if (!M) return;
            let e = setTimeout(() => _(!1), 15e3);
            return () => clearTimeout(e);
          }, [M]));
        let R = p
            ? `${p.markdown}\u0000${JSON.stringify(p.suggestions ?? null)}`
            : null,
          E = (0, o.useRef)(null);
        (0, o.useEffect)(() => {
          let e = E.current;
          ((E.current = R), null !== e && null !== R && e !== R && _(!1));
        }, [R]);
        let $ = (0, o.useRef)(!1);
        (0, o.useEffect)(() => {
          e &&
            !$.current &&
            (($.current = !0),
            h({ projectId: i }).catch((e) => {
              (console.error("[GameMemoryPanel] seed failed:", e),
                ($.current = !1));
            }));
        }, [e, i, h]);
        let L = (0, o.useMemo)(() => (p ? (0, rh.bt)(p.markdown) : null), [p]),
          F = (L?.mechanics.length ?? 0) > 0,
          { user: U } = (0, t6.Jd)(),
          D = (0, s.IT)(
            a.FH.userCredits.getCreditBalance,
            U?.id ? { clerkUserId: U.id } : "skip",
          ),
          O = !!D && D.creditsRemaining < 0.5,
          z = S || A || void 0 === p || !c || O,
          H = (0, o.useRef)(""),
          [q, J] = (0, o.useState)(null),
          B = (0, o.useMemo)(() => {
            if (!L) return null;
            let e = (0, nU.Es)(L);
            if (0 === e.length && !q) return L;
            let t = new Map(e.map((e) => [e.id, e]));
            return {
              ...L,
              mechanics: L.mechanics.map((e) =>
                q && e.id === q.id
                  ? { ...e, pos: { x: q.x, y: q.y } }
                  : e.pos
                    ? e
                    : { ...e, pos: t.get(e.id) ?? null },
              ),
            };
          }, [L, q]);
        (0, o.useEffect)(() => {
          if (!L) return;
          let e = (0, nU.Es)(L);
          if (0 === e.length) return;
          let t = e.map((e) => e.id).join(",");
          H.current !== t &&
            ((H.current = t),
            g({ projectId: i, positions: e }).catch((e) => {
              (console.error("[GameMemoryPanel] savePositions failed:", e),
                (H.current = ""));
            }));
        }, [L, i, g]);
        let {
            activeIds: G,
            hiddenIds: W,
            recentlyCompletedIds: V,
            enqueue: K,
            reset: Q,
          } = (0, rk.W)({ limit: rk.QJ, activeMs: 3300, settleMs: 1500 }),
          Y = (0, o.useRef)(null);
        (0, o.useLayoutEffect)(() => {
          if (!B) {
            ((Y.current = null), Q());
            return;
          }
          let e = new Map(
              B.mechanics.map((e) => [
                e.id,
                new Set(e.satellites.map((e) => e.id)),
              ]),
            ),
            t = Y.current;
          if (((Y.current = e), !t)) return;
          let n = new Set();
          for (let [r, a] of e) {
            let e = t.get(r);
            if (!e) {
              n.add(r);
              continue;
            }
            for (let t of a)
              if (!e.has(t)) {
                n.add(r);
                break;
              }
          }
          0 !== n.size && K(n);
        }, [K, B, Q]);
        let Z = (0, o.useMemo)(() => p?.suggestions ?? [], [p]),
          X = (0, o.useMemo)(
            () => (B && Z.length > 0 ? (0, nU.K1)(B, Z) : []),
            [B, Z],
          ),
          ee = (0, o.useMemo)(() => {
            if (!B || 0 === Z.length) return [];
            let e = new Map(
              B.mechanics.filter((e) => e.pos).map((e) => [e.id, e.pos]),
            );
            return Z.flatMap((t, n) => {
              let r = X[n];
              if (!r) return [];
              let a = (t.anchorId && e.get(t.anchorId)) || null;
              return [
                {
                  x1: (a?.x ?? 0) * 0.75,
                  y1: (a?.y ?? 0) * 0.75,
                  x2: 0.75 * r.x,
                  y2: 0.75 * r.y,
                  fromCenter: !a,
                  anchorId: a ? (t.anchorId ?? null) : null,
                  sugIndex: n,
                },
              ];
            });
          }, [B, Z, X]),
          {
            viewportRef: et,
            scale: er,
            worldTransform: ea,
            isPanning: ei,
            handlePointerDown: el,
            handlePointerMove: ed,
            handlePointerUp: ec,
            handleWheel: eu,
            zoomBy: em,
          } = (0, rk.KV)({ expanded: e, minZoom: 0.6, maxZoom: 2.5 }),
          ep = (0, rk.FO)(et, e),
          eh = (0, rk.q_)(e),
          eg = (0, o.useMemo)(
            () => B?.mechanics.reduce((e, t) => e + t.connects.length, 0) ?? 0,
            [B],
          ),
          ex = ei || null !== q,
          ef = ep && !ex && !u && !eh && 0 === G.size;
        (0, rk.Oc)({
          enabled: e && null !== B,
          surface: "sidebar",
          nodeCount: B?.mechanics.length ?? 0,
          edgeCount: eg,
          activeAnimationCount: G.size ? G.size : ef ? Math.min(eg, rk.X) : 0,
        });
        let [eb, ey] = (0, o.useState)(!1),
          [ej, ek] = (0, o.useState)(""),
          eN = (0, o.useRef)(null);
        (0, o.useEffect)(() => {
          eb && (eN.current?.focus(), eN.current?.select());
        }, [eb]);
        let eI = (0, o.useCallback)(() => {
            let e = ej.trim();
            (ey(!1),
              e &&
                e !== B?.gameName &&
                f({ projectId: i, name: e }).catch((e) => {
                  console.error("[GameMemoryPanel] setGameName failed:", e);
                }));
          }, [ej, B?.gameName, f, i]),
          eC = c && !u,
          eS = (0, o.useRef)(!1),
          eM = (0, o.useCallback)(
            (e) => {
              if (eS.current) {
                eS.current = !1;
                return;
              }
              B &&
                eC &&
                l?.({ id: e.id, title: e.title, context: (0, rh.eg)(B, e.id) });
            },
            [B, l, eC],
          ),
          e_ = (0, o.useRef)(null),
          eT = (0, o.useRef)(null);
        (0, o.useEffect)(
          () => () => {
            null !== eT.current && cancelAnimationFrame(eT.current);
          },
          [],
        );
        let eR = (0, o.useCallback)(
            (e, t) => {
              0 === e.button &&
                t.pos &&
                eC &&
                ((eS.current = !1),
                (e_.current = {
                  id: t.id,
                  startX: e.clientX,
                  startY: e.clientY,
                  originX: t.pos.x,
                  originY: t.pos.y,
                  x: t.pos.x,
                  y: t.pos.y,
                  moved: !1,
                }),
                e.currentTarget.setPointerCapture(e.pointerId));
            },
            [eC],
          ),
          eE = (0, o.useCallback)(
            (e) => {
              let t = e_.current;
              if (!t) return;
              if ((1 & e.buttons) == 0) {
                e_.current = null;
                return;
              }
              let n = e.clientX - t.startX,
                r = e.clientY - t.startY;
              if (!t.moved && 4 > Math.hypot(n, r)) return;
              (t.moved || eF(null), (t.moved = !0));
              let a = 0.75 * er.get();
              ((t.x = t.originX + n / a),
                (t.y = t.originY + r / a),
                null === eT.current &&
                  (eT.current = requestAnimationFrame(() => {
                    eT.current = null;
                    let e = e_.current;
                    e?.moved && J({ id: e.id, x: e.x, y: e.y });
                  })));
            },
            [er],
          ),
          e$ = (0, o.useCallback)(() => {
            let e = e_.current;
            ((e_.current = null),
              e?.moved &&
                (null !== eT.current &&
                  (cancelAnimationFrame(eT.current), (eT.current = null)),
                J({ id: e.id, x: e.x, y: e.y }),
                (eS.current = !0),
                x({
                  projectId: i,
                  mechanicId: e.id,
                  x: Math.round(e.x),
                  y: Math.round(e.y),
                })
                  .catch((e) => {
                    console.error("[GameMemoryPanel] moveMechanic failed:", e);
                  })
                  .finally(() => J(null))));
          }, [x, i]),
          [eL, eF] = (0, o.useState)(null),
          [eU, eD] = (0, o.useState)(null),
          [eO, ez] = (0, o.useState)(null),
          [eq, eJ] = (0, o.useState)(null);
        (0, o.useEffect)(() => eJ(null), [ei, c]);
        let eB = (0, o.useCallback)((e) => eJ(c ? null : e), [c]),
          eG = (0, o.useMemo)(() => {
            let e = new Map();
            for (let t of B?.mechanics ?? [])
              e.set(t.id, t.satellites.length + (w.get(t.id)?.length ?? 0));
            return e;
          }, [B, w]),
          eW = (0, o.useMemo)(() => {
            let e = B?.mechanics ?? [],
              t = B ? e.filter((e) => !(0, nU.qf)(B, e)).length : 0;
            return [
              {
                id: "connect",
                label: "Prompt and connect 5 mechanics",
                done: t,
                target: 5,
                locked: !1,
              },
              {
                id: "refine",
                label: "Add 4 semi-nodes to 5 mechanics",
                done: e.filter((e) => e.satellites.length >= 4).length,
                target: 5,
                locked: t < 5,
              },
            ];
          }, [B]),
          eV = eL && (eG.get(eL) ?? 0) > 0 ? eL : null,
          eK = null !== eV || null !== eU || M,
          [eQ, eY] = (0, o.useState)(null),
          [eZ, eX] = (0, o.useState)(null),
          [e0, e1] = (0, o.useState)(null),
          e5 = (0, o.useRef)(null);
        ((0, o.useCallback)((e) => {
          (e5.current && clearTimeout(e5.current), eX(e));
        }, []),
          (0, o.useCallback)(() => {
            (e5.current && clearTimeout(e5.current),
              (e5.current = setTimeout(() => {
                (eX(null), e1(null));
              }, 120)));
          }, []),
          (0, o.useEffect)(
            () => () => {
              e5.current && clearTimeout(e5.current);
            },
            [],
          ),
          (0, o.useCallback)(
            (e) => {
              (m?.({ mechanicId: e.id, mechanicTitle: e.title }),
                e1(e.id),
                e5.current && clearTimeout(e5.current),
                (e5.current = setTimeout(() => {
                  (eX(null), e1(null));
                }, 1600)));
            },
            [m],
          ));
        let e2 = (0, o.useRef)(null),
          e4 = (0, o.useCallback)((e) => {
            e_.current?.moved ||
              (e2.current && clearTimeout(e2.current), eF(e));
          }, []),
          e3 = (0, o.useCallback)(() => {
            (e2.current && clearTimeout(e2.current),
              (e2.current = setTimeout(() => eF(null), 100)));
          }, []);
        (0, o.useEffect)(
          () => () => {
            e2.current && clearTimeout(e2.current);
          },
          [],
        );
        let e6 = (0, o.useMemo)(() => {
            if (!B || !eV) return null;
            let e = B.mechanics.find((e) => e.id === eV);
            return e?.pos ? { x: 0.75 * e.pos.x, y: 0.75 * e.pos.y } : null;
          }, [B, eV]),
          e8 = (0, o.useMemo)(() => {
            let e = new Map();
            if (!B || !e6) return e;
            for (let t of B.mechanics) {
              if (t.id === eV || !t.pos) continue;
              let n = rR(0.75 * t.pos.x, 0.75 * t.pos.y, e6.x, e6.y);
              n && e.set(t.id, n);
            }
            return e;
          }, [B, eV, e6]),
          e7 = (0, o.useMemo)(
            () =>
              e6
                ? X.map((e) =>
                    e ? rR(0.75 * e.x, 0.75 * e.y, e6.x, e6.y) : null,
                  )
                : [],
            [X, e6],
          ),
          e9 = (0, o.useCallback)(
            (e, t) => {
              B &&
                eC &&
                l?.({
                  id: t.id,
                  title: t.title,
                  context: (0, rh.dH)(B, e, t.id),
                });
            },
            [B, l, eC],
          );
        return e
          ? (0, r.jsxs)("div", {
              className: "flex flex-col flex-1 overflow-hidden",
              children: [
                (0, r.jsxs)("div", {
                  className: "flex items-center gap-2 pt-3 px-3 pb-3 shrink-0",
                  children: [
                    (0, r.jsx)("button", {
                      type: "button",
                      onClick: n,
                      "aria-label": "Collapse game map",
                      className: (0, es.cn)(
                        "inline-flex items-center justify-center whitespace-nowrap",
                        "text-body font-medium transition-colors",
                        "focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring",
                        "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
                        "border shadow-xs h-9 w-9 text-foreground border-border rounded-xl",
                        "bg-transparent hover:bg-accent hover:text-accent-foreground",
                      ),
                      children: (0, r.jsx)(ry.A, { className: "w-4 h-4" }),
                    }),
                    (0, r.jsxs)("div", {
                      className: (0, es.cn)(
                        "inline-flex items-center justify-center flex-1 min-w-0 gap-2 whitespace-nowrap",
                        "text-body font-medium transition-colors",
                        "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
                        "border shadow-xs h-9 text-foreground border-border rounded-xl bg-white/5",
                      ),
                      children: [
                        (0, r.jsx)(rb.A, { className: "w-4 h-4" }),
                        (0, r.jsx)("span", {
                          className: "truncate",
                          children: "Game Map",
                        }),
                      ],
                    }),
                  ],
                }),
                (0, r.jsxs)("div", {
                  ref: et,
                  className:
                    "relative flex-1 overflow-hidden cursor-grab active:cursor-grabbing select-none",
                  style: {
                    backgroundColor: "#2B2B2B",
                    backgroundImage:
                      "radial-gradient(rgba(255,255,255,0.07) 1.125px, transparent 2.25px)",
                    backgroundSize: "18px 18px",
                    touchAction: "none",
                  },
                  onPointerDown: el,
                  onPointerMove: ed,
                  onPointerUp: ec,
                  onPointerCancel: ec,
                  onWheel: eu,
                  children: [
                    (0, r.jsxs)("div", {
                      className:
                        "absolute right-3 top-3 z-50 flex items-center gap-2",
                      children: [
                        (0, r.jsxs)("div", {
                          "data-gm-interactive": !0,
                          className: "flex items-center gap-2",
                          children: [
                            (0, r.jsx)("button", {
                              type: "button",
                              onClick: () => em(1.1),
                              "aria-label": "Zoom in",
                              className: r$,
                              children: (0, r.jsx)(eP.A, {
                                className: "w-3.5 h-3.5",
                              }),
                            }),
                            (0, r.jsx)("button", {
                              type: "button",
                              onClick: () => em(1 / 1.1),
                              "aria-label": "Zoom out",
                              className: r$,
                              children: (0, r.jsx)(rv.A, {
                                className: "w-3.5 h-3.5",
                              }),
                            }),
                            (0, r.jsx)("span", {
                              className:
                                "min-w-[34px] shrink-0 text-left text-micro font-medium tabular-nums text-muted-foreground",
                              children: (0, r.jsx)(rk.WV, { scale: er }),
                            }),
                          ],
                        }),
                        (0, r.jsxs)("button", {
                          type: "button",
                          "data-gm-interactive": !0,
                          onClick: () => {
                            z || C(!0);
                          },
                          "aria-disabled": z,
                          title: S
                            ? "This project's game has already been imported"
                            : c
                              ? O
                                ? "You need at least 0.5 credits to import"
                                : "Read this project's scripts and rebuild the map from them. Billed at what the read actually costs."
                              : "Connect the Studio plugin to import this game",
                          className: (0, es.cn)(
                            "flex items-center gap-1.5 rounded-lg px-2.5 py-1.5",
                            "bg-size-[400%_100%]",
                            "bg-shimmer-surface-soft",
                            "border border-white/10 text-compact-body font-medium text-white/70",
                            "focus:outline-hidden focus:ring-1 focus:ring-white/20",
                            z
                              ? "cursor-not-allowed opacity-60"
                              : "transition-colors hover:border-white/30 hover:bg-white/15 hover:text-white",
                          ),
                          children: [
                            (0, r.jsx)(rw.A, {
                              className: "h-3.5 w-3.5 shrink-0",
                            }),
                            (0, r.jsx)("span", { children: "Import Game" }),
                            O &&
                              (0, r.jsxs)("span", {
                                className: "text-white/40",
                                children: ["(min. ", 0.5, " credits)"],
                              }),
                          ],
                        }),
                      ],
                    }),
                    (0, r.jsx)(eH.lG, {
                      open: I,
                      onOpenChange: C,
                      children: (0, r.jsxs)(eH.Cf, {
                        showCloseButton: !1,
                        onPointerDown: (e) => {
                          e.stopPropagation();
                        },
                        className: (0, es.cn)(
                          "sm:max-w-[440px] p-0 gap-0",
                          "rounded-lg bg-background border-2 border-border text-foreground shadow-xl",
                        ),
                        children: [
                          (0, r.jsxs)(rx.bL, {
                            children: [
                              (0, r.jsx)(eH.L3, { children: "Import game?" }),
                              (0, r.jsx)(eH.rr, {
                                children:
                                  "Confirm importing this project's existing game into the game map. This costs credits.",
                              }),
                            ],
                          }),
                          (0, r.jsxs)("div", {
                            className: "p-5",
                            children: [
                              (0, r.jsxs)("div", {
                                className:
                                  "mb-3 flex items-center justify-between",
                                children: [
                                  (0, r.jsx)("span", {
                                    className:
                                      "text-body-lg font-semibold text-foreground",
                                    children: "Import Game?",
                                  }),
                                  (0, r.jsxs)("div", {
                                    className: "flex items-center gap-3",
                                    children: [
                                      (0, r.jsxs)("span", {
                                        className:
                                          "flex items-center gap-1.5 text-caption text-muted-foreground",
                                        children: [
                                          (0, r.jsx)(tB.A, {
                                            className: "h-3.5 w-3.5 shrink-0",
                                          }),
                                          "Costs ~0.5–1 credits",
                                        ],
                                      }),
                                      (0, r.jsx)("button", {
                                        type: "button",
                                        onClick: () => C(!1),
                                        "aria-label": "Close",
                                        className:
                                          "text-muted-foreground transition-colors hover:text-foreground",
                                        children: (0, r.jsx)(eA.A, {
                                          className: "h-4 w-4",
                                        }),
                                      }),
                                    ],
                                  }),
                                ],
                              }),
                              (0, r.jsxs)("p", {
                                className:
                                  "text-body leading-relaxed text-muted-foreground",
                                children: [
                                  "Builds the game map from this project's",
                                  " ",
                                  (0, r.jsx)("span", {
                                    className: "font-medium text-foreground",
                                    children: "existing game",
                                  }),
                                  ". Fresh projects have nothing to import.",
                                ],
                              }),
                              F &&
                                (0, r.jsxs)("div", {
                                  className:
                                    "mt-3 flex items-center gap-2 text-body text-destructive",
                                  children: [
                                    (0, r.jsx)(rj.A, {
                                      className: "h-3.5 w-3.5 shrink-0",
                                    }),
                                    (0, r.jsx)("span", {
                                      children:
                                        "Overwrites your current game map",
                                    }),
                                  ],
                                }),
                              (0, r.jsxs)("div", {
                                className:
                                  "mt-2 flex items-center justify-end gap-2",
                                children: [
                                  (0, r.jsx)("button", {
                                    type: "button",
                                    onClick: () => C(!1),
                                    className: (0, es.cn)(
                                      "h-8 rounded-lg border border-transparent bg-neutral-700 px-4",
                                      "text-body font-medium text-white/70 transition-colors",
                                      "hover:bg-neutral-600 hover:text-white/90",
                                    ),
                                    children: "Back",
                                  }),
                                  (0, r.jsx)("button", {
                                    type: "button",
                                    onClick: P,
                                    className: (0, es.cn)(
                                      "flex h-8 items-center gap-1.5 rounded-lg px-4",
                                      "bg-size-[400%_100%]",
                                      "bg-shimmer-surface-soft",
                                      "border border-white/10 text-body font-medium text-white",
                                      "transition-colors hover:border-white/30 hover:bg-white/15",
                                    ),
                                    children: "Confirm",
                                  }),
                                ],
                              }),
                            ],
                          }),
                        ],
                      }),
                    }),
                    (0, r.jsx)(ew.N, {
                      children:
                        A &&
                        (0, r.jsxs)(ev.P.div, {
                          initial: { opacity: 0 },
                          animate: { opacity: 1 },
                          exit: { opacity: 0 },
                          transition: { duration: 0.2 },
                          className:
                            "pointer-events-none absolute inset-0 z-50 flex flex-col items-center justify-center gap-2 bg-black/30",
                          children: [
                            (0, r.jsx)("div", {
                              className:
                                "w-6 h-6 border-2 border-white/20 border-t-white/70 rounded-full animate-spin",
                            }),
                            (0, r.jsx)("span", {
                              className:
                                "text-compact-body font-semibold text-white/40",
                              children: "Reading your game...",
                            }),
                          ],
                        }),
                    }),
                    (0, r.jsx)(ew.N, {
                      children:
                        M &&
                        B &&
                        (0, r.jsxs)(ev.P.div, {
                          initial: { opacity: 0 },
                          animate: { opacity: 1 },
                          exit: { opacity: 0 },
                          transition: { duration: 0.2 },
                          className:
                            "pointer-events-none absolute inset-0 z-50 flex flex-col items-center justify-center gap-2",
                          children: [
                            (0, r.jsx)("div", {
                              className:
                                "w-6 h-6 border-2 border-white/20 border-t-white/70 rounded-full animate-spin",
                            }),
                            (0, r.jsx)("span", {
                              className:
                                "text-compact-body font-semibold text-white/40",
                              children: "Updating...",
                            }),
                          ],
                        }),
                    }),
                    B
                      ? (0, r.jsxs)(ev.P.div, {
                          "data-game-map-world": !0,
                          "data-panning": ei || void 0,
                          className: "absolute left-0 top-0",
                          style: {
                            transform: ea,
                            transformOrigin: "0 0",
                            willChange: "transform",
                            backfaceVisibility: "hidden",
                          },
                          children: [
                            (0, r.jsx)(rO, {
                              graph: B,
                              suggestionSpokes: ee,
                              hiddenIds: W,
                              pushOffsets: e8,
                              suggestionPushOffsets: e7,
                              dragging: null !== q,
                              motionEnabled: ef,
                              dimmed: eK,
                            }),
                            (0, r.jsxs)("div", {
                              "data-gm-interactive": !0,
                              className:
                                "absolute flex flex-col items-center transition-opacity duration-150 motion-reduce:transition-none",
                              style: {
                                left: -70,
                                top: -32.5,
                                width: 140,
                                opacity: eK ? 0.35 : 1,
                              },
                              children: [
                                (0, r.jsxs)("button", {
                                  type: "button",
                                  onClick: () => {
                                    (ek(B.gameName), ey(!0));
                                  },
                                  className: "flex flex-col items-center group",
                                  "aria-label": B.gameName
                                    ? "Rename game"
                                    : "Name your game",
                                  children: [
                                    (0, r.jsx)(rF, {
                                      size: 65,
                                      shadow: "0 2px 10px rgba(0,0,0,0.35)",
                                      className: (0, es.cn)(
                                        !ex &&
                                          "transition-[filter] group-hover:brightness-125 motion-reduce:transition-none",
                                      ),
                                      children: (0, r.jsx)(eo.default, {
                                        src: p?.centerIcon
                                          ? `/game-memory-icons/${p.centerIcon}.png`
                                          : "/game-memory-icons/planet.png",
                                        alt: "",
                                        width: 36,
                                        height: 36,
                                        draggable: !1,
                                      }),
                                    }),
                                    eb || !B.gameName
                                      ? null
                                      : (0, r.jsx)("span", {
                                          className:
                                            "mt-1.5 text-body font-bold leading-tight text-center text-neutral-300",
                                          children: B.gameName,
                                        }),
                                  ],
                                }),
                                (eb || !B.gameName) &&
                                  (0, r.jsx)("input", {
                                    ref: eN,
                                    value: ej,
                                    maxLength: 60,
                                    onChange: (e) => ek(e.target.value),
                                    onBlur: eI,
                                    onKeyDown: (e) => {
                                      "Enter" === e.key
                                        ? (e.preventDefault(), eI())
                                        : "Escape" === e.key &&
                                          (e.preventDefault(), ey(!1));
                                    },
                                    placeholder: "Game name",
                                    className: (0, es.cn)(
                                      "mt-1.5 w-[106px] rounded-lg",
                                      "px-1.5 py-1 text-micro text-center text-neutral-300",
                                      "outline-hidden placeholder:text-neutral-500",
                                    ),
                                    style: {
                                      background:
                                        "linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(0,0,0,0.3) 100%)",
                                      boxShadow:
                                        "inset 0 2px 8px rgba(0,0,0,0.6), inset 0 -1px 2px rgba(255,255,255,0.05), 0 1px 0 rgba(255,255,255,0.05)",
                                      border: "1px solid rgba(0,0,0,0.4)",
                                      borderTop: "1px solid rgba(0,0,0,0.5)",
                                      borderBottom:
                                        "1px solid rgba(255,255,255,0.05)",
                                    },
                                  }),
                              ],
                            }),
                            B.mechanics.map((e) => {
                              if (!e.pos || W.has(e.id)) return null;
                              let t =
                                  B.mechanics.length >= 4 && (0, nU.qf)(B, e),
                                n = w.get(e.id),
                                a = [
                                  ...e.satellites.map((e) => ({
                                    key: e.id,
                                    sat: e,
                                    idea: null,
                                  })),
                                  ...(n ?? []).map((e, t) => ({
                                    key: `idea-${t}`,
                                    sat: null,
                                    idea: e,
                                  })),
                                ],
                                s = eL === e.id,
                                i = a.length > 0 && s,
                                o = (function (e) {
                                  let t = !1,
                                    n = !1;
                                  for (let r = 0; r < e; r++) {
                                    let a = Math.sin(
                                      (rM(r, e) * Math.PI) / 180,
                                    );
                                    a < -0.1 ? (t = !0) : a > 0.1 && (n = !0);
                                  }
                                  return { up: t, down: n };
                                })(a.length),
                                l = j === e.id || n?.length === 0,
                                u = !n && e.satellites.length < 4,
                                m = s && (u || l),
                                p = e8.get(e.id);
                              return (0, r.jsxs)(
                                ev.P.div,
                                {
                                  "data-gm-interactive": !0,
                                  initial: !!V.has(e.id) && {
                                    scale: 0.2,
                                    opacity: 0,
                                  },
                                  animate: {
                                    scale: 1,
                                    opacity:
                                      eK && e.id !== eV && e.id !== eU
                                        ? 0.35
                                        : 1,
                                    x: p?.x ?? 0,
                                    y: p?.y ?? 0,
                                  },
                                  transition: r_,
                                  className: (0, es.cn)(
                                    "absolute flex flex-col items-center",
                                    i && "z-30",
                                    eU === e.id && "z-40",
                                  ),
                                  style: {
                                    left: 0.75 * e.pos.x - 60,
                                    top: 0.75 * e.pos.y - 21.5,
                                    width: 120,
                                  },
                                  onMouseLeave: e3,
                                  children: [
                                    i &&
                                      (o.up || o.down) &&
                                      (0, r.jsx)("div", {
                                        className: "absolute -z-10",
                                        style: {
                                          top: o.up ? -rC : 0,
                                          bottom: o.down ? -rC : 0,
                                          left: rS,
                                          right: rS,
                                        },
                                      }),
                                    (0, r.jsxs)(en.m_, {
                                      delayDuration: 0,
                                      open: !c && eq === e.id,
                                      children: [
                                        (0, r.jsx)(en.k$, {
                                          asChild: !0,
                                          children: (0, r.jsxs)("button", {
                                            type: "button",
                                            onClick: () => eM(e),
                                            onPointerEnter: () => eB(e.id),
                                            onPointerLeave: () => eJ(null),
                                            onPointerDown: (t) => eR(t, e),
                                            onPointerMove: eE,
                                            onPointerUp: e$,
                                            onPointerCancel: e$,
                                            onLostPointerCapture: e$,
                                            style: { touchAction: "none" },
                                            className: (0, es.cn)(
                                              "flex flex-col items-center",
                                              eC
                                                ? "cursor-grab active:cursor-grabbing"
                                                : "cursor-not-allowed",
                                            ),
                                            "aria-label": eC
                                              ? `Tag ${e.title} in chat`
                                              : "Connect the Roblox Studio plugin to interact",
                                            children: [
                                              (0, r.jsxs)("div", {
                                                className:
                                                  "group relative transition-transform hover:scale-125",
                                                onMouseEnter: () => e4(e.id),
                                                children: [
                                                  (0, r.jsx)(rF, {
                                                    size: 43,
                                                    shadow:
                                                      "0 2px 8px rgba(0,0,0,0.3)",
                                                    className:
                                                      "transition-[filter] group-hover:brightness-125 motion-reduce:transition-none",
                                                    children: (0, r.jsx)(
                                                      eo.default,
                                                      {
                                                        src: e.icon
                                                          ? `/game-memory-icons/${e.icon}.png`
                                                          : (0, nU.ll)(e),
                                                        alt: "",
                                                        width: 20,
                                                        height: 20,
                                                        draggable: !1,
                                                      },
                                                    ),
                                                  }),
                                                  (0, r.jsx)(eo.default, {
                                                    src: "/game-memory-icons/verified.png",
                                                    alt: "Added to game",
                                                    width: 18,
                                                    height: 18,
                                                    draggable: !1,
                                                    className:
                                                      "absolute -top-1 -right-1",
                                                  }),
                                                  (m || l || a.length > 0) &&
                                                    (0, r.jsxs)(en.m_, {
                                                      open:
                                                        m && !l && eQ === e.id,
                                                      children: [
                                                        (0, r.jsx)(en.k$, {
                                                          asChild: !0,
                                                          children: (0, r.jsx)(
                                                            "span",
                                                            {
                                                              role: m
                                                                ? "button"
                                                                : void 0,
                                                              onPointerEnter:
                                                                () => eY(e.id),
                                                              onPointerLeave:
                                                                () => eY(null),
                                                              onPointerDown:
                                                                m && !l
                                                                  ? (e) => {
                                                                      e.stopPropagation();
                                                                    }
                                                                  : void 0,
                                                              onClick:
                                                                m && !l
                                                                  ? (t) => {
                                                                      (t.preventDefault(),
                                                                        t.stopPropagation(),
                                                                        N(
                                                                          e.id,
                                                                        ));
                                                                    }
                                                                  : void 0,
                                                              className: (0,
                                                              es.cn)(
                                                                "absolute -top-1 -left-1 min-w-[16px] h-4 px-1 rounded-full text-micro font-bold leading-none flex items-center justify-center transition-colors",
                                                                m && !l
                                                                  ? "cursor-pointer bg-white/25 border border-white/50 hover:bg-white/50 hover:border-white/80"
                                                                  : "pt-px border",
                                                              ),
                                                              style: {
                                                                ...(m && !l
                                                                  ? {}
                                                                  : {
                                                                      backgroundColor:
                                                                        "#444444",
                                                                      borderColor:
                                                                        "rgba(0,0,0,0.168)",
                                                                    }),
                                                                color:
                                                                  m || l
                                                                    ? "#FFFFFF"
                                                                    : "rgba(255,255,255,0.4)",
                                                              },
                                                              children: l
                                                                ? (0, r.jsxs)(
                                                                    "span",
                                                                    {
                                                                      className:
                                                                        "relative",
                                                                      children:
                                                                        [
                                                                          (0,
                                                                          r.jsxs)(
                                                                            "span",
                                                                            {
                                                                              className:
                                                                                "invisible",
                                                                              children:
                                                                                [
                                                                                  "+",
                                                                                  a.length,
                                                                                ],
                                                                            },
                                                                          ),
                                                                          (0,
                                                                          r.jsx)(
                                                                            "span",
                                                                            {
                                                                              className:
                                                                                "absolute inset-0 flex items-center justify-center",
                                                                              children:
                                                                                (0,
                                                                                r.jsx)(
                                                                                  "span",
                                                                                  {
                                                                                    className:
                                                                                      "w-2 h-2 border border-white/30 border-t-white rounded-full animate-spin",
                                                                                  },
                                                                                ),
                                                                            },
                                                                          ),
                                                                        ],
                                                                    },
                                                                  )
                                                                : m
                                                                  ? (0, r.jsxs)(
                                                                      "span",
                                                                      {
                                                                        className:
                                                                          "relative",
                                                                        children:
                                                                          [
                                                                            (0,
                                                                            r.jsxs)(
                                                                              "span",
                                                                              {
                                                                                className:
                                                                                  "invisible",
                                                                                children:
                                                                                  [
                                                                                    "+",
                                                                                    a.length,
                                                                                  ],
                                                                              },
                                                                            ),
                                                                            (0,
                                                                            r.jsx)(
                                                                              "span",
                                                                              {
                                                                                className:
                                                                                  "absolute inset-0 flex items-center justify-center text-caption font-black leading-none mt-[-1.5px]",
                                                                                children:
                                                                                  "+",
                                                                              },
                                                                            ),
                                                                          ],
                                                                      },
                                                                    )
                                                                  : `+${a.length}`,
                                                            },
                                                          ),
                                                        }),
                                                        m &&
                                                          !l &&
                                                          (0, r.jsx)(en.ZI, {
                                                            side: "top",
                                                            className: (0,
                                                            es.cn)(
                                                              "max-w-[220px] text-center",
                                                              rE,
                                                              "text-caption",
                                                            ),
                                                            children:
                                                              "Generate suggestions to improve this core mechanic.",
                                                          }),
                                                      ],
                                                    }),
                                                  t &&
                                                    (0, r.jsxs)(en.m_, {
                                                      delayDuration: 0,
                                                      children: [
                                                        (0, r.jsx)(en.k$, {
                                                          asChild: !0,
                                                          children: (0, r.jsx)(
                                                            rj.A,
                                                            {
                                                              className:
                                                                "absolute -right-0.5 -bottom-0.5 h-4 w-4 fill-destructive text-destructive-foreground [&>circle]:stroke-destructive-hover",
                                                            },
                                                          ),
                                                        }),
                                                        (0, r.jsx)(en.ZI, {
                                                          side: "bottom",
                                                          className: (0, es.cn)(
                                                            "max-w-[230px] text-center",
                                                            rE,
                                                            "text-caption",
                                                            "border-destructive/50 bg-destructive/10 text-destructive",
                                                          ),
                                                          children:
                                                            "This mechanic is too isolated. Connect it to your game systems or remove it. Simplicity wins on Roblox.",
                                                        }),
                                                      ],
                                                    }),
                                                  !1,
                                                ],
                                              }),
                                              (0, r.jsx)("span", {
                                                className:
                                                  "mt-1.5 text-compact-body font-bold leading-tight text-center text-neutral-300",
                                                children: e.title,
                                              }),
                                            ],
                                          }),
                                        }),
                                        !c &&
                                          (0, r.jsx)(en.ZI, {
                                            side: "bottom",
                                            className: (0, es.cn)(
                                              "text-center",
                                              rE,
                                            ),
                                            children:
                                              "Connect the Roblox Studio plugin to interact",
                                          }),
                                      ],
                                    }),
                                    (0, r.jsx)(ew.N, {
                                      children:
                                        i &&
                                        a.map(
                                          ({ key: t, sat: n, idea: s }, i) => {
                                            let o =
                                                (rM(i, a.length) * Math.PI) /
                                                180,
                                              l = 60 + 70 * Math.cos(o),
                                              u = 21.5 + 70 * Math.sin(o);
                                            return (0, r.jsx)(
                                              ev.P.div,
                                              {
                                                initial: {
                                                  opacity: 0,
                                                  scale: 0.4,
                                                },
                                                animate: {
                                                  opacity: 1,
                                                  scale: 1,
                                                },
                                                exit: {
                                                  opacity: 0,
                                                  scale: 0.4,
                                                  transition: {
                                                    duration: 0.2,
                                                    delay: 0,
                                                  },
                                                },
                                                transition: {
                                                  duration: 0.18,
                                                  delay: 0.05 * i,
                                                },
                                                className:
                                                  "group/satnode absolute flex flex-col items-center",
                                                style: {
                                                  left: l - 40,
                                                  top: u - 16,
                                                  width: 80,
                                                },
                                                children: (0, r.jsx)("div", {
                                                  className: (0, es.cn)(
                                                    "flex flex-col items-center",
                                                    s &&
                                                      "opacity-50 transition-opacity group-hover/satnode:opacity-90",
                                                  ),
                                                  children: (0, r.jsxs)(en.m_, {
                                                    delayDuration: 0,
                                                    open:
                                                      !c &&
                                                      eq === `${e.id}/${t}`,
                                                    children: [
                                                      (0, r.jsx)(en.k$, {
                                                        asChild: !0,
                                                        children: (0, r.jsxs)(
                                                          "button",
                                                          {
                                                            type: "button",
                                                            onClick: () => {
                                                              eC &&
                                                                (s
                                                                  ? d?.({
                                                                      text: s.text,
                                                                      title:
                                                                        s.title,
                                                                    })
                                                                  : n &&
                                                                    e9(
                                                                      e.id,
                                                                      n,
                                                                    ));
                                                            },
                                                            onPointerEnter:
                                                              () =>
                                                                eB(
                                                                  `${e.id}/${t}`,
                                                                ),
                                                            onPointerLeave:
                                                              () => eJ(null),
                                                            className: (0,
                                                            es.cn)(
                                                              "flex flex-col items-center group/sat",
                                                              !eC &&
                                                                "cursor-not-allowed",
                                                            ),
                                                            "aria-label": eC
                                                              ? s
                                                                ? `Add suggestion: ${s.title}`
                                                                : `Tag ${n?.title ?? ""} in chat`
                                                              : "Connect the Roblox Studio plugin to interact",
                                                            children: [
                                                              (0, r.jsxs)(rF, {
                                                                size: 32,
                                                                shadow:
                                                                  "0 1px 4px rgba(0,0,0,0.35)",
                                                                className:
                                                                  "transition-[filter,transform] group-hover/sat:scale-125 group-hover/sat:brightness-125 motion-reduce:transition-none motion-reduce:group-hover/sat:scale-100",
                                                                rimClassName:
                                                                  (0, es.cn)(
                                                                    "bg-neutral-900",
                                                                    s &&
                                                                      "transition-colors group-hover/satnode:bg-white/70",
                                                                  ),
                                                                bodyClassName:
                                                                  (0, es.cn)(
                                                                    s &&
                                                                      "transition-colors group-hover/satnode:bg-lime-500",
                                                                  ),
                                                                children: [
                                                                  (0, r.jsx)(
                                                                    eo.default,
                                                                    {
                                                                      src: (0,
                                                                      nU.ll)(
                                                                        n ?? {
                                                                          id: t,
                                                                          title:
                                                                            s?.title ??
                                                                            "",
                                                                          desc:
                                                                            s?.text ??
                                                                            "",
                                                                        },
                                                                      ),
                                                                      alt: "",
                                                                      width: 16,
                                                                      height: 16,
                                                                      draggable:
                                                                        !1,
                                                                      className:
                                                                        (0,
                                                                        es.cn)(
                                                                          s &&
                                                                            "group-hover/satnode:hidden",
                                                                        ),
                                                                    },
                                                                  ),
                                                                  s &&
                                                                    (0, r.jsx)(
                                                                      "span",
                                                                      {
                                                                        className:
                                                                          "hidden text-micro font-black leading-none text-white group-hover/satnode:block",
                                                                        children:
                                                                          "Add",
                                                                      },
                                                                    ),
                                                                ],
                                                              }),
                                                              (0, r.jsx)(
                                                                "span",
                                                                {
                                                                  className: (0,
                                                                  es.cn)(
                                                                    "mt-1 line-clamp-2 text-micro font-semibold leading-tight text-center text-neutral-400",
                                                                    s &&
                                                                      "transition-colors group-hover/satnode:text-white",
                                                                  ),
                                                                  children:
                                                                    n?.title ??
                                                                    s?.title,
                                                                },
                                                              ),
                                                            ],
                                                          },
                                                        ),
                                                      }),
                                                      !c &&
                                                        (0, r.jsx)(en.ZI, {
                                                          side: "bottom",
                                                          className: (0, es.cn)(
                                                            "text-center",
                                                            rE,
                                                          ),
                                                          children:
                                                            "Connect the Roblox Studio plugin to interact",
                                                        }),
                                                    ],
                                                  }),
                                                }),
                                              },
                                              t,
                                            );
                                          },
                                        ),
                                    }),
                                    (0, r.jsx)(ew.N, {
                                      children:
                                        m &&
                                        eQ === e.id &&
                                        (function (e) {
                                          if (e >= 4) return [];
                                          let t = new Set();
                                          for (let n = 0; n < e; n++)
                                            t.add(rM(n, e));
                                          return rI[4].filter((e) => !t.has(e));
                                        })(a.length).map((e) => {
                                          let t = (e * Math.PI) / 180;
                                          return (0, r.jsx)(
                                            ev.P.div,
                                            {
                                              initial: {
                                                opacity: 0,
                                                scale: 0.4,
                                              },
                                              animate: {
                                                opacity: 0.5,
                                                scale: 1,
                                              },
                                              exit: {
                                                opacity: 0,
                                                scale: 0.4,
                                                transition: { duration: 0.15 },
                                              },
                                              transition: { duration: 0.18 },
                                              className:
                                                "pointer-events-none absolute",
                                              style: {
                                                left:
                                                  60 + 70 * Math.cos(t) - 16,
                                                top:
                                                  21.5 + 70 * Math.sin(t) - 16,
                                              },
                                              children: (0, r.jsx)(rF, {
                                                size: 32,
                                                shadow:
                                                  "0 1px 4px rgba(0,0,0,0.35)",
                                                rimClassName: "bg-neutral-900",
                                                bodyClassName: "bg-white/10",
                                                children: null,
                                              }),
                                            },
                                            `slot-${e}`,
                                          );
                                        }),
                                    }),
                                  ],
                                },
                                e.id,
                              );
                            }),
                            (0, r.jsx)(ew.N, {
                              children: B.mechanics
                                .filter((e) => e.pos && G.has(e.id))
                                .map((e) =>
                                  (0, r.jsx)(
                                    ev.P.div,
                                    {
                                      initial: { opacity: 0, scale: 0.6 },
                                      animate: { opacity: 1, scale: 1 },
                                      exit: {
                                        opacity: 0,
                                        transition: { duration: 0.25 },
                                      },
                                      transition: { duration: 0.3 },
                                      className:
                                        "pointer-events-none absolute z-40",
                                      style: {
                                        left: 0.75 * e.pos.x - 65,
                                        top: 0.75 * e.pos.y - 65,
                                      },
                                      children: (0, r.jsx)(rg.H, {
                                        size: 130,
                                        timeOffset: 7,
                                      }),
                                    },
                                    `arrival-${e.id}`,
                                  ),
                                ),
                            }),
                            Z.map((e, t) => {
                              let n = X[t];
                              if (!n) return null;
                              let a = e7[t];
                              return (0, r.jsx)(
                                ev.P.div,
                                {
                                  initial: { opacity: 0, scale: 0.4 },
                                  animate: {
                                    opacity: eK && eO !== t ? 0.35 : 1,
                                    scale: 1,
                                    x: a?.x ?? 0,
                                    y: a?.y ?? 0,
                                  },
                                  transition: {
                                    duration: 0.18,
                                    delay: 0.05 * t,
                                    x: r_,
                                    y: r_,
                                  },
                                  "data-gm-interactive": !0,
                                  className:
                                    "group/sugnode absolute flex flex-col items-center hover:z-30",
                                  style: {
                                    left: 0.75 * n.x - 60,
                                    top: 0.75 * n.y - 21.5,
                                    width: 120,
                                  },
                                  onMouseEnter: () => {
                                    (eD(e.anchorId ?? null), ez(t));
                                  },
                                  onMouseLeave: () => {
                                    (eD(null), ez(null));
                                  },
                                  children: (0, r.jsx)("div", {
                                    className:
                                      "relative flex flex-col items-center opacity-50 transition-opacity group-hover/sugnode:opacity-90",
                                    children: (0, r.jsxs)(en.m_, {
                                      delayDuration: 0,
                                      open: !c && eq === `sug/${t}`,
                                      children: [
                                        (0, r.jsx)(en.k$, {
                                          asChild: !0,
                                          children: (0, r.jsxs)("button", {
                                            type: "button",
                                            onClick: () => {
                                              eC &&
                                                d?.({
                                                  text: e.text,
                                                  title: e.title,
                                                });
                                            },
                                            onPointerEnter: () =>
                                              eB(`sug/${t}`),
                                            onPointerLeave: () => eJ(null),
                                            "aria-label": eC
                                              ? `Add suggestion: ${e.title}`
                                              : "Connect the Roblox Studio plugin to interact",
                                            className: (0, es.cn)(
                                              "flex flex-col items-center group/sug",
                                              !eC && "cursor-not-allowed",
                                            ),
                                            children: [
                                              (0, r.jsxs)("div", {
                                                className:
                                                  "relative transition-transform group-hover/sug:scale-125",
                                                children: [
                                                  (0, r.jsx)(rF, {
                                                    size: 43,
                                                    shadow:
                                                      "0 2px 8px rgba(0,0,0,0.3)",
                                                    className:
                                                      "transition-[filter] group-hover/sug:brightness-125 motion-reduce:transition-none",
                                                    rimClassName:
                                                      "transition-colors group-hover/sugnode:bg-white/70",
                                                    bodyClassName:
                                                      "transition-colors group-hover/sugnode:bg-lime-500",
                                                    bodyInset: 1.5,
                                                    children: (0, r.jsxs)(
                                                      "div",
                                                      {
                                                        className:
                                                          "flex flex-col items-center",
                                                        children: [
                                                          (0, r.jsx)(
                                                            eo.default,
                                                            {
                                                              src: e.icon
                                                                ? `/game-memory-icons/${e.icon}.png`
                                                                : (0, nU.ll)({
                                                                    id: e.title,
                                                                    title:
                                                                      e.title,
                                                                    desc: e.text,
                                                                  }),
                                                              alt: "",
                                                              width: 20,
                                                              height: 20,
                                                              draggable: !1,
                                                            },
                                                          ),
                                                          (0, r.jsx)("span", {
                                                            className:
                                                              "mt-1 hidden text-micro font-black leading-none text-white group-hover/sugnode:block",
                                                            children: "Add",
                                                          }),
                                                        ],
                                                      },
                                                    ),
                                                  }),
                                                  (0, r.jsx)("span", {
                                                    role: "button",
                                                    tabIndex: 0,
                                                    onClick: (t) => {
                                                      (t.preventDefault(),
                                                        t.stopPropagation(),
                                                        y({
                                                          projectId: i,
                                                          text: e.text,
                                                        }).catch((e) => {
                                                          console.error(
                                                            "[GameMemoryPanel] dismissSuggestion failed:",
                                                            e,
                                                          );
                                                        }));
                                                    },
                                                    "aria-label": `Dismiss suggestion: ${e.title}`,
                                                    className:
                                                      "absolute -top-1 -right-1 z-10 hidden h-4 w-4 cursor-pointer items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-[0_1px_4px_rgba(0,0,0,0.5)] transition-colors hover:bg-destructive-hover group-hover/sugnode:flex",
                                                    children: (0, r.jsx)(eA.A, {
                                                      size: 10,
                                                      strokeWidth: 3.5,
                                                    }),
                                                  }),
                                                ],
                                              }),
                                              (0, r.jsx)("span", {
                                                className:
                                                  "mt-1.5 text-compact-body font-bold leading-tight text-center text-neutral-400 transition-colors group-hover/sugnode:text-white/70",
                                                children: e.title,
                                              }),
                                            ],
                                          }),
                                        }),
                                        !c &&
                                          (0, r.jsx)(en.ZI, {
                                            side: "bottom",
                                            className: (0, es.cn)(
                                              "text-center",
                                              rE,
                                            ),
                                            children:
                                              "Connect the Roblox Studio plugin to interact",
                                          }),
                                      ],
                                    }),
                                  }),
                                },
                                `suggestion-${t}-${e.title}`,
                              );
                            }),
                          ],
                        })
                      : (0, r.jsx)("div", {
                          className:
                            "absolute inset-0 flex items-center justify-center",
                          children: (0, r.jsx)("div", {
                            className:
                              "w-5 h-5 border-2 border-white/20 border-t-white/70 rounded-full animate-spin",
                          }),
                        }),
                    B &&
                      (0, r.jsx)("div", {
                        className: "absolute bottom-4 left-0 right-0 px-3",
                        children: (0, r.jsx)(rP, { quests: eW }),
                      }),
                  ],
                }),
              ],
            })
          : (0, r.jsxs)(en.m_, {
              children: [
                (0, r.jsx)(en.k$, {
                  asChild: !0,
                  children: (0, r.jsx)("button", {
                    type: "button",
                    onClick: t,
                    "aria-label": "Open game map",
                    className: (0, es.cn)(
                      "inline-flex items-center justify-center whitespace-nowrap",
                      "text-body font-medium transition-colors",
                      "focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring",
                      "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
                      "border shadow-xs h-9 w-9 border-border rounded-xl",
                      "text-foreground bg-transparent hover:bg-accent hover:text-accent-foreground",
                    ),
                    children: (0, r.jsx)(rb.A, { className: "w-4 h-4" }),
                  }),
                }),
                (0, r.jsxs)(en.ZI, {
                  side: "right",
                  children: [
                    (0, r.jsx)("p", {
                      className: "font-semibold",
                      children: "Game Map",
                    }),
                    (0, r.jsx)("p", {
                      className: "text-muted-foreground",
                      children: "A living map of your game's mechanics",
                    }),
                  ],
                }),
              ],
            });
      });
      function rD(e, t, n, r, a, s) {
        let i = n - e,
          o = r - t,
          l = Math.hypot(i, o) || 1,
          d = i / l,
          c = o / l;
        return {
          sx: e + d * a,
          sy: t + c * a,
          ex: n - d * s,
          ey: r - c * s,
          ux: d,
          uy: c,
          dist: l,
        };
      }
      let rO = (0, o.memo)(function ({
        graph: e,
        suggestionSpokes: t,
        hiddenIds: n,
        pushOffsets: a,
        suggestionPushOffsets: s,
        dragging: i,
        motionEnabled: l,
        dimmed: d,
      }) {
        let c = i ? rT : r_,
          [u, m] = (0, o.useState)(null),
          p = new Map(
            e.mechanics
              .filter((e) => e.pos)
              .map((e) => {
                let t = a.get(e.id);
                return [
                  e.id,
                  {
                    x: 0.75 * e.pos.x + (t?.x ?? 0),
                    y: 0.75 * e.pos.y + (t?.y ?? 0),
                  },
                ];
              }),
          ),
          h = new Map();
        for (let t of e.mechanics)
          if (!n.has(t.id))
            for (let e of t.connects)
              n.has(e) ||
                (h.set(t.id, (h.get(t.id) ?? 0) + 1),
                h.set(e, (h.get(e) ?? 0) + 1));
        let g = e.mechanics.flatMap((e) => {
            let t = p.get(e.id);
            return !t || n.has(e.id)
              ? []
              : e.connects.flatMap((r) => {
                  let a = p.get(r);
                  return !a || n.has(r)
                    ? []
                    : [
                        {
                          key: `edge-${e.id}-${r}`,
                          fromId: e.id,
                          toId: r,
                          seg: rD(t.x, t.y, a.x, a.y, 29, 33),
                        },
                      ];
                });
          }),
          x = new Set(
            [...g]
              .sort((e, t) => {
                let n = (h.get(e.fromId) ?? 0) + (h.get(e.toId) ?? 0);
                return (
                  (h.get(t.fromId) ?? 0) + (h.get(t.toId) ?? 0) - n ||
                  e.key.localeCompare(t.key)
                );
              })
              .slice(0, rk.X)
              .map((e) => e.key),
          ),
          f = new Set(g.flatMap((e) => [e.fromId, e.toId])),
          b = `${Math.min(f.size, 5)}/5 core loop mechanics`;
        return (0, r.jsxs)(r.Fragment, {
          children: [
            (0, r.jsx)(ev.P.div, {
              className: "absolute left-0 top-0 pointer-events-none",
              initial: !1,
              animate: { opacity: d ? 0.35 : 1 },
              transition: { duration: 0.16 },
              children: (0, r.jsxs)("svg", {
                width: 1,
                height: 1,
                style: { overflow: "visible" },
                children: [
                  (0, r.jsx)("defs", {
                    children: (0, r.jsx)("marker", {
                      id: "gm-arrow",
                      viewBox: "0 0 10 10",
                      refX: "7",
                      refY: "5",
                      markerWidth: "5.5",
                      markerHeight: "5.5",
                      orient: "auto-start-reverse",
                      children: (0, r.jsx)("path", {
                        d: "M2 1.5L8 5L2 8.5",
                        fill: "none",
                        stroke: "rgba(255,255,255,0.5)",
                        strokeWidth: "1.6",
                        strokeLinecap: "round",
                        strokeLinejoin: "round",
                      }),
                    }),
                  }),
                  e.mechanics.map((e) => {
                    let t = p.get(e.id);
                    if (!t || n.has(e.id)) return null;
                    let a = rD(0, 0, t.x, t.y, 43, 37);
                    return (0, r.jsx)(
                      ev.P.line,
                      {
                        initial: !1,
                        animate: { x1: a.sx, y1: a.sy, x2: a.ex, y2: a.ey },
                        transition: c,
                        stroke: "#71B76F",
                        strokeWidth: 1.33,
                        strokeDasharray: "5 5",
                        opacity: 0.65,
                      },
                      `spoke-${e.id}`,
                    );
                  }),
                  t.map((e, t) => {
                    let n = e.anchorId ? a.get(e.anchorId) : void 0,
                      i = s[e.sugIndex],
                      o = (function (e, t = 0.16) {
                        let n = (e.sx + e.ex) / 2,
                          r = (e.sy + e.ey) / 2,
                          a = e.dist * t;
                        return `M ${e.sx} ${e.sy} Q ${n - e.uy * a} ${r + e.ux * a} ${e.ex} ${e.ey}`;
                      })(
                        rD(
                          e.x1 + (n?.x ?? 0),
                          e.y1 + (n?.y ?? 0),
                          e.x2 + (i?.x ?? 0),
                          e.y2 + (i?.y ?? 0),
                          e.fromCenter ? 43 : 29,
                          33,
                        ),
                      );
                    return (0, r.jsx)(
                      ev.P.path,
                      {
                        d: o,
                        initial: !1,
                        animate: { d: o },
                        transition: c,
                        fill: "none",
                        stroke: "#8B8B8B",
                        strokeWidth: 1.33,
                        strokeDasharray: "5 5",
                        opacity: 0.5,
                      },
                      `sug-spoke-${t}`,
                    );
                  }),
                  g.map(({ key: e, seg: t }, n) => {
                    let a = `M ${t.sx} ${t.sy} L ${t.ex} ${t.ey}`;
                    return (0, r.jsxs)(
                      "g",
                      {
                        children: [
                          (0, r.jsx)(ev.P.path, {
                            d: a,
                            initial: !1,
                            animate: { d: a },
                            transition: c,
                            fill: "none",
                            stroke: "rgba(255,255,255,0.5)",
                            strokeWidth: 1.6,
                            markerEnd: "url(#gm-arrow)",
                          }),
                          l && x.has(e)
                            ? (0, r.jsx)(rk.ic, {
                                d: a,
                                dist: t.dist,
                                delay: 0.3 * n,
                                active: !0,
                              })
                            : null,
                          (0, r.jsx)("line", {
                            x1: t.sx,
                            y1: t.sy,
                            x2: t.ex,
                            y2: t.ey,
                            stroke: "transparent",
                            strokeWidth: 14,
                            style: { pointerEvents: "stroke" },
                            onMouseEnter: () =>
                              m({ x: (t.sx + t.ex) / 2, y: (t.sy + t.ey) / 2 }),
                            onMouseLeave: () => m(null),
                          }),
                        ],
                      },
                      e,
                    );
                  }),
                ],
              }),
            }),
            u &&
              (0, r.jsx)("div", {
                className: (0, es.cn)(
                  "absolute pointer-events-none whitespace-nowrap",
                  "rounded-lg border border-border bg-background px-3 py-1.5",
                  rE,
                ),
                style: {
                  left: u.x,
                  top: u.y,
                  transform: "translate(-50%, -140%)",
                },
                children: b,
              }),
          ],
        });
      });
      var rz = n(2792);
      function rH({
        projectId: e,
        threads: t,
        activeThreadId: n,
        onSwitchThread: a,
        onCreateNewThread: s,
        onRenameThread: i,
        historyLoading: o,
        onExpandedChange: l,
        expandedPanel: d,
        onExpandedPanelChange: c,
        showCardsLeaderboard: u = !1,
        showGameMemory: m = !1,
        onTagMechanic: p,
        onAddSuggestion: h,
        pluginConnected: g = !0,
        onSendToAutoTasks: x,
        isAgentBusy: f,
        autoPlaytestEnabled: b = !0,
        captureGifEnabled: y = !0,
        publicPromptsEnabled: v = !1,
        playCompletionSoundEnabled: w = !0,
        slotMachineEnabled: j = !0,
        onUpdatePlaytestPrefs: N,
        lowCostUiModeEnabled: I = !1,
        onLowCostUiModeChange: C,
      }) {
        let [S, A] = (0, k.J0)(null),
          P = void 0 !== d,
          M = P ? d : S,
          _ = (e) => {
            (P || A(e), c?.(e));
          };
        (0, k.vJ)(() => {
          l?.(null !== M);
        }, [M, l]);
        let [T, R] = (0, k.J0)(() => rN(0.3 * window.innerWidth)),
          E = (0, k.li)(!1);
        (0, k.vJ)(() => {
          let e = () => {
            R((e) => rN(E.current ? e : 0.3 * window.innerWidth));
          };
          return (
            e(),
            window.addEventListener("resize", e),
            () => window.removeEventListener("resize", e)
          );
        }, []);
        let [$, L] = (0, k.J0)(!1),
          F = (0, k.li)(null);
        (0, k.vJ)(
          () => () => {
            null !== F.current && window.clearTimeout(F.current);
          },
          [],
        );
        let U = (0, k.hb)((e) => {
            ((E.current = !0),
              L(!0),
              null !== F.current && window.clearTimeout(F.current),
              (F.current = window.setTimeout(() => L(!1), 250)),
              R(rN(e)));
          }, []),
          D = (0, k.li)(null),
          O = (0, k.hb)(
            (e) => {
              ((D.current = { startX: e.clientX, startWidth: T }),
                e.currentTarget.setPointerCapture(e.pointerId));
            },
            [T],
          ),
          z = (0, k.hb)(
            (e) => {
              let t = D.current;
              t && U(t.startWidth + (e.clientX - t.startX));
            },
            [U],
          ),
          H = (0, k.hb)(() => {
            D.current = null;
          }, []);
        return (0, r.jsxs)(ev.P.div, {
          className: "relative shrink-0 flex",
          animate: { width: "game-memory" === M ? T : M ? 306 : 56 },
          transition: $
            ? { duration: 0 }
            : { duration: 0.2, ease: "easeInOut" },
          children: [
            (0, r.jsxs)("div", {
              className:
                "flex min-w-0 flex-1 flex-col overflow-hidden rounded-tr-xl border-r border-t border-border bg-background",
              children: [
                null === M &&
                  (0, r.jsxs)("div", {
                    className: "flex flex-col items-center gap-2 p-2 pt-3",
                    children: [
                      (0, r.jsx)(rp.A, {
                        expanded: !1,
                        onExpand: () => _("history"),
                        onCollapse: () => _(null),
                        threads: t,
                        activeThreadId: n,
                        onSwitchThread: a,
                        onCreateNewThread: s,
                        onRenameThread: i,
                        isLoading: o,
                      }),
                      m &&
                        (0, r.jsx)(rU, {
                          expanded: !1,
                          onExpand: () => _("game-memory"),
                          onCollapse: () => _(null),
                          projectId: e,
                          onTagMechanic: p,
                          onAddSuggestion: h,
                          pluginConnected: g,
                        }),
                      u &&
                        (0, r.jsx)(rm.A, {
                          expanded: !1,
                          onExpand: () => _("cards-leaderboard"),
                          onCollapse: () => _(null),
                        }),
                      N &&
                        (0, r.jsx)(rz.A, {
                          expanded: !1,
                          onExpand: () => _("settings"),
                          onCollapse: () => _(null),
                          autoPlaytestEnabled: b,
                          captureGifEnabled: y,
                          publicPromptsEnabled: v,
                          playCompletionSoundEnabled: w,
                          slotMachineEnabled: j,
                          onUpdatePlaytestPrefs: N,
                          lowCostUiModeEnabled: I,
                          onLowCostUiModeChange: C,
                        }),
                    ],
                  }),
                "history" === M &&
                  (0, r.jsx)(rp.A, {
                    expanded: !0,
                    onExpand: () => _("history"),
                    onCollapse: () => _(null),
                    threads: t,
                    activeThreadId: n,
                    onSwitchThread: a,
                    onCreateNewThread: s,
                    onRenameThread: i,
                    isLoading: o,
                  }),
                "settings" === M &&
                  N &&
                  (0, r.jsx)(rz.A, {
                    expanded: !0,
                    onExpand: () => _("settings"),
                    onCollapse: () => _(null),
                    autoPlaytestEnabled: b,
                    captureGifEnabled: y,
                    publicPromptsEnabled: v,
                    playCompletionSoundEnabled: w,
                    slotMachineEnabled: j,
                    onUpdatePlaytestPrefs: N,
                    lowCostUiModeEnabled: I,
                    onLowCostUiModeChange: C,
                  }),
                "cards-leaderboard" === M &&
                  u &&
                  (0, r.jsx)(rm.A, {
                    expanded: !0,
                    onExpand: () => _("cards-leaderboard"),
                    onCollapse: () => _(null),
                  }),
                "game-memory" === M &&
                  m &&
                  (0, r.jsx)(rU, {
                    expanded: !0,
                    onExpand: () => _("game-memory"),
                    onCollapse: () => _(null),
                    projectId: e,
                    onTagMechanic: p,
                    onAddSuggestion: h,
                    pluginConnected: g,
                    isAgentBusy: f,
                    onSendToAutoTasks: x,
                  }),
              ],
            }),
            "game-memory" === M &&
              m &&
              (0, r.jsx)("div", {
                role: "separator",
                "aria-orientation": "vertical",
                "aria-label": "Drag to resize the game map",
                onPointerDown: O,
                onPointerMove: z,
                onPointerUp: H,
                onPointerCancel: H,
                className:
                  "absolute right-0 top-1/2 z-50 flex h-11 w-3.5 -translate-y-1/2 translate-x-1/2 cursor-ew-resize items-center justify-center rounded-md border border-border bg-background text-muted-foreground transition-colors hover:text-foreground",
                style: { touchAction: "none" },
                children: (0, r.jsx)(ru.A, { className: "h-3.5 w-3.5" }),
              }),
          ],
        });
      }
      function rq(e, t) {
        return `lemonade:prompt-queue:v2:${encodeURIComponent(e)}:${encodeURIComponent(t)}`;
      }
      function rJ(e, t, n) {
        let r = rq(t, n),
          a = e.activeDispatch,
          s = [
            ...(a && tt(a, t, n) ? [a] : []),
            ...(e.queuesByContext[r] ?? []),
          ];
        try {
          if (0 === s.length) window.sessionStorage.removeItem(r);
          else
            window.sessionStorage.setItem(
              r,
              JSON.stringify({
                version: 2,
                prompts: s.map((e) => ({
                  id: e.id,
                  input: e.input,
                  projectId: e.projectId,
                  chatId: e.chatId,
                  queuedAt: e.queuedAt,
                })),
              }),
            );
        } catch {}
      }
      let rB = "lemonade:remix-concluded-dismissed";
      function rG() {
        try {
          let e = window.localStorage.getItem(rB);
          if (!e) return new Set();
          let t = JSON.parse(e);
          if (!Array.isArray(t)) return new Set();
          return new Set(t.filter((e) => "string" == typeof e));
        } catch {
          return new Set();
        }
      }
      let rW = "lemonade:onboarding-roadmap-dismissed",
        rV = "lemonade:onboarding-roadmap-anchor";
      function rK() {
        try {
          let e = window.localStorage.getItem(rW);
          if (!e) return new Set();
          let t = JSON.parse(e);
          if (!Array.isArray(t)) return new Set();
          return new Set(t.filter((e) => "string" == typeof e));
        } catch {
          return new Set();
        }
      }
      function rQ() {
        try {
          let e = window.localStorage.getItem(rV);
          if (!e) return {};
          let t = JSON.parse(e);
          if ("object" != typeof t || null === t || Array.isArray(t)) return {};
          let n = {};
          for (let [e, r] of Object.entries(t))
            "string" == typeof r && (n[e] = r);
          return n;
        } catch {
          return {};
        }
      }
      function rY() {
        try {
          let e = new Audio("/sounds/generation-completion.mp3");
          ((e.volume = 0.49), e.play().catch(() => {}));
        } catch {}
      }
      var rZ = n(60214);
      function rX(e, t) {
        return `Build this task for my simple game called ${e}: ${t}`;
      }
      async function r0(e) {
        if (0 === e.tasks.length) return [];
        try {
          let t = await fetch("/api/roblox/expand-tasks", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(e),
          });
          if (!t.ok) throw Error(`HTTP ${t.status}`);
          let n = await t.json(),
            r = n.data?.taskPrompts;
          if (Array.isArray(r))
            return e.tasks.map((t, n) => {
              let a = r[n];
              return a &&
                "string" == typeof a.prompt &&
                a.prompt.trim().length > 0
                ? { title: t, prompt: a.prompt.trim() }
                : { title: t, prompt: rX(e.gameName, t) };
            });
        } catch (e) {
          console.error(
            "[useOnboardingPlanFlow] Failed to expand task prompts:",
            e,
          );
        }
        return e.tasks.map((t) => ({ title: t, prompt: rX(e.gameName, t) }));
      }
      async function r1(e) {
        let t = [0, 1500, 3e3, 4500];
        for (let n = 0; n < t.length; n++) {
          t[n] > 0 && (await new Promise((e) => setTimeout(e, t[n])));
          try {
            let t = await fetch("/api/roblox/onboarding-map", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ projectId: e }),
            });
            if (!t.ok) throw Error(`HTTP ${t.status}`);
            let r = await t.json();
            if ("completed" === r.status) return;
            console.error(
              `[useOnboardingPlanFlow] Map glow-up run-code did not complete (attempt ${n + 1}):`,
              r.status,
              r.error,
              r.output,
            );
          } catch (e) {
            console.error(
              `[useOnboardingPlanFlow] Map glow-up attempt ${n + 1} failed:`,
              e,
            );
          }
        }
      }
      let r5 = {
          modelOverride: "google/gemini-3-flash-preview",
          disablePublicPrompt: !0,
          disablePlaytest: !0,
        },
        r2 = { modelOverride: "composer-2.5", disablePublicPrompt: !0 },
        r4 = { modelOverride: "composer-2.5", forceCapturePlaytestGif: !0 },
        r3 = new Set([1, 2]);
      var r6 = n(88333),
        r8 = n(93693),
        r7 = n(22678);
      let r9 = (0, h.default)(
          () =>
            Promise.all([n.e(8053), n.e(4801), n.e(6656)])
              .then(n.bind(n, 14801))
              .then((e) => e.AnimatePresence),
          { loadableGenerated: { webpack: () => [null] }, ssr: !1 },
        ),
        ae = (0, h.default)(
          () =>
            Promise.all([n.e(8053), n.e(4801), n.e(6656)])
              .then(n.bind(n, 14801))
              .then((e) => e.motion.div),
          { loadableGenerated: { webpack: () => [null] }, ssr: !1 },
        ),
        at = (0, h.default)(
          () => Promise.all([n.e(3556), n.e(4639)]).then(n.bind(n, 3556)),
          { loadableGenerated: { webpack: () => [3556] } },
        ),
        an = () => void 0;
      function ar({ hostId: e, children: t }) {
        let [n, r] = (0, x.J0)(null);
        return (
          (0, x.vJ)(() => {
            r(null);
            let t = () => {
              let t = document.getElementById(e);
              return !!t && (r(t), !0);
            };
            if (t()) return;
            let n = new MutationObserver(() => {
              t() && n.disconnect();
            });
            return (
              n.observe(document.body, { childList: !0, subtree: !0 }),
              () => n.disconnect()
            );
          }, [e]),
          n ? (0, f.createPortal)(t, n) : null
        );
      }
      function aa(e) {
        var t;
        let { projectId: i } = e,
          l = `game-map-mode-control-${i}`,
          d = `game-map-overlay-panel-${i}`,
          { userId: c, getToken: h } = (0, u.d)(),
          { isAuthenticated: f } = (0, s.Z)(),
          C = (0, g.useSearchParams)(),
          S = (0, s.IT)(
            a.FH.users.getUserByClerkId,
            c ? { clerkUserId: c } : "skip",
          ),
          A = (0, v.M9)(S),
          P = (0, v.Wk)("nextMoveSuggestions", S),
          M = (0, v.Wk)("promptQueue", S),
          _ = (0, Z.UX)(S),
          [T, $] = (0, x.J0)(""),
          L = (0, x.li)(null),
          et = (0, s.IT)(
            a.FH.uiBuilderScripts.listByProject,
            i ? { projectId: i } : "skip",
          ),
          en = (0, s.IT)(
            a.FH.uiThemes.getPickerState,
            i ? { projectId: i } : "skip",
          ),
          er = A.uiModelStrength && !!en?.available && "none" !== en.selected,
          ea = en?.available ? en.selected : void 0,
          [ei, eo] = (0, x.J0)(""),
          el = (0, x.li)(ei);
        el.current = ei;
        let [ec, eu] = (0, x.J0)([]),
          em = (0, x.li)(ec);
        em.current = ec;
        let [ep, eg] = (0, x.J0)(null),
          [eb, ey] = (0, x.J0)(!1),
          [ev] = (0, x.J0)(""),
          [ew] = (0, x.J0)(""),
          [ej] = (0, x.J0)(!1),
          [ek, eN] = (0, x.J0)(!1),
          [eI, eC] = (0, x.J0)(!1),
          eS = (0, x.li)(null),
          [eA, eP] = (0, x.J0)(!1),
          [eM, e_] = (0, x.J0)(!1),
          [eT, eR] = (0, x.J0)(i),
          eE = (0, x.li)(i),
          [e$, eL] = (0, x.J0)(null),
          eF = (0, x.li)(null),
          eU = (0, x.li)(!1),
          eD = (0, x.li)(0),
          eO = (0, x.li)(null),
          ez = (0, x.li)(null),
          eH = (0, x.li)(null),
          eq = (0, r6.a0)(S),
          eJ = eq ? r6.dw : I.MH,
          eB = (0, x.Kr)(() => (eq ? [r6.dw] : void 0), [eq]),
          [eW, eV] = (0, x.J0)(I.MH),
          eK = (0, s.n_)(a.FH.agentMemory.mutations.setChatModel),
          eQ = !(
            (t = {
              selectedModelFreeToUser:
                !!eW &&
                (!!((0, I.uO)(eW) || (0, I.$W)(eW)) ||
                  (eW.startsWith("openai/") && S?.chatgptSubEnabled === !0)),
              uiStrength:
                A.uiModelStrength && S?.uiModelStrength === "high"
                  ? "high"
                  : "standard",
              lowCostMode: A.lowCostUiMode && S?.lowCostUiMode === !0,
            }).selectedModelFreeToUser &&
            "high" !== t.uiStrength &&
            !t.lowCostMode
          ),
          eY = !!ea && "none" !== ea && eQ,
          eZ = (0, x.hb)(() => {
            eC(!0);
          }, []);
        ((0, x.vJ)(() => {
          let e = eE.current !== i;
          ((eE.current = i), e && (eP(!1), e_(!1), eR(i)));
        }, [i]),
          (0, x.vJ)(() => {
            let e = new URL(window.location.href);
            "1" === e.searchParams.get(r8.e) &&
              (e.searchParams.delete(r8.e),
              window.history.replaceState({}, "", e.toString()));
          }, [C]),
          (0, x.vJ)(() => {
            let e = C.get("initialPrompt"),
              t = C.get("initialModel");
            if (
              (t && (0, I.rv)(t) && !(0, I.wR)(t) && (eV(t), (eF.current = t)),
              e)
            ) {
              (eo(e), eP(!0), "1" === C.get("autoStart") && eL(e));
              let t = new URL(window.location.href);
              (t.searchParams.delete("initialPrompt"),
                t.searchParams.delete("autoStart"),
                t.searchParams.delete("initialModel"),
                window.history.replaceState({}, "", t.toString()),
                setTimeout(() => {
                  e6.current && (e6.current.focus(), e8());
                }, 100));
            }
          }, [C]),
          (0, x.vJ)(() => {
            if (C.get("view")) {
              let e = new URL(window.location.href);
              (e.searchParams.delete("view"),
                window.history.replaceState({}, "", e.toString()));
            }
          }, []));
        let {
            contextTabs: eX,
            setContextTabs: e1,
            addContextTab: e5,
            removeContextTab: e2,
            getCombinedContext: e4,
            clearAllContextTabs: e3,
          } = (function (e = []) {
            let [t, n] = (0, o.useState)(e),
              r = (0, o.useRef)(t);
            r.current = t;
            let a = (0, o.useCallback)((e, t, r, a, s, i) => {
                let o = {
                  id: s ? `file:${s}` : `${e}:${t}`,
                  type: e,
                  name: t,
                  content: r,
                  lineRange: a,
                  filePath: s,
                  isImage: i,
                };
                n((n) => {
                  let r = n;
                  "image" === e && (r = n.filter((e) => "image" !== e.type));
                  let a = r.findIndex(
                    (n) =>
                      n.type === e && (s ? n.filePath === s : n.name === t),
                  );
                  return -1 !== a
                    ? r.map((e, t) => (t === a ? o : e))
                    : [...r, o];
                });
              }, []),
              s = (0, o.useCallback)((e, t) => {
                n((n) =>
                  n.map((n) =>
                    n.filePath === e && "file" === n.type
                      ? { ...n, content: t, isLoadingContent: !1 }
                      : n,
                  ),
                );
              }, []),
              i = (function (e, t) {
                let n = (0, k.li)();
                return (0, k.hb)(
                  (...t) => {
                    (n.current && clearTimeout(n.current),
                      (n.current = setTimeout(() => {
                        e(...t);
                      }, 300)));
                  },
                  [e, 300],
                );
              })(s, 300),
              l = (0, o.useCallback)((e) => {
                n((t) => t.filter((t) => t.id !== e));
              }, []),
              d = (0, o.useCallback)(
                (e) => e.replace(/^```[\w-]*\n/, "").replace(/\n```$/, ""),
                [],
              ),
              c = (0, o.useCallback)(
                () =>
                  0 === t.length
                    ? ""
                    : t
                        .map((e) => {
                          if (e.isLoadingContent && "file" === e.type)
                            return `File ${e.name}:

[Content loading...]`;
                          if ("file" === e.type) {
                            let t = d(e.content),
                              n = (e.filePath || e.name)
                                .replace(/\//g, ".")
                                .replace(/[^A-Za-z0-9_.-]/g, "_");
                            return `<${n}>
${t}
</${n}>`;
                          }
                          if ("code" === e.type) {
                            let t = d(e.content);
                            return `Code from ${e.name}:

\`\`\`
${t}
\`\`\`
`;
                          }
                          return "image" === e.type
                            ? null
                            : `${e.name}:
${e.content}`;
                        })
                        .filter((e) => null !== e)
                        .join("\n\n"),
                [t, d],
              ),
              u = (0, o.useCallback)(() => {
                n([]);
              }, []);
            return {
              contextTabs: t,
              setContextTabs: n,
              addContextTab: a,
              removeContextTab: l,
              updateContextTabContent: i,
              updateContextTabContentImmediate: s,
              formatCodeContent: d,
              getCombinedContext: c,
              clearAllContextTabs: u,
              contextTabsRef: r,
            };
          })(),
          { textareaRef: e6, adjustHeight: e8 } = (function ({
            minHeight: e,
            maxHeight: t,
          }) {
            let n = (0, o.useRef)(null),
              r = (0, o.useCallback)(
                (r) => {
                  let a = n.current;
                  if (!a) return;
                  if (r) {
                    a.style.height = `${e}px`;
                    return;
                  }
                  a.style.height = `${e}px`;
                  let s = Math.max(e, Math.min(a.scrollHeight, t ?? 1 / 0));
                  ((a.style.height = `${s}px`),
                    t && a.scrollHeight > t
                      ? ((a.style.overflowY = "auto"),
                        (a.scrollTop = a.scrollHeight))
                      : (a.style.overflowY = "hidden"));
                },
                [e, t],
              );
            return (
              (0, o.useEffect)(() => {
                let t = n.current;
                t &&
                  ((t.style.height = `${e}px`), (t.style.overflowY = "hidden"));
              }, [e]),
              (0, o.useEffect)(() => {
                let e = () => r();
                return (
                  window.addEventListener("resize", e),
                  () => window.removeEventListener("resize", e)
                );
              }, [r]),
              { textareaRef: n, adjustHeight: r }
            );
          })({ minHeight: 59, maxHeight: 227 }),
          {
            currentChatId: e9,
            threadTabs: ts,
            handleCreateNewThread: ti,
            handleSwitchThread: to,
            handleRenameThread: tl,
          } = (function ({ projectId: e, getCombinedContext: t }) {
            let { userId: r, getToken: i } = (0, u.d)(),
              { isAuthenticated: o } = (0, s.Z)(),
              [l, d] = (0, G.J0)(null),
              c = (0, s.n_)(a.FH.agentMemory.mutations.renameChat),
              m = (0, s.IT)(
                a.FH.agentMemory.queries.getProjectChats,
                o && r ? { projectId: e, userId: r } : "skip",
              ),
              p =
                m?.map((e) => ({
                  id: e._id,
                  threadId: e._id,
                  title: e.name,
                  lastInteracted: e.lastInteracted,
                  createdAt: e.createdAt,
                })) || [];
            (0, G.vJ)(() => {
              if (m && !l)
                if (m.length > 0) {
                  let t = ((e) => {
                      try {
                        return window.localStorage.getItem(W(e));
                      } catch {
                        return null;
                      }
                    })(e),
                    n = t ? m.find((e) => e._id === t) : void 0;
                  if (n) return void d(n._id);
                  d(
                    m.reduce((e, t) =>
                      t.lastInteracted > e.lastInteracted ? t : e,
                    )._id,
                  );
                } else
                  console.warn(
                    `[useChatManagement] No chats found for project ${e}. This should not happen.`,
                  );
            }, [m, l, e]);
            let h = (0, G.hb)(
                async (t) => {
                  if (r)
                    try {
                      let { ConvexHttpClient: s } =
                          await Promise.resolve().then(n.bind(n, 63151)),
                        o = "https://beaming-hawk-976.convex.cloud";
                      if (!o) return;
                      let l = new s(o),
                        c = await i({ template: "convex" });
                      c && l.setAuth(c);
                      let u = await l.mutation(
                        a.FH.agentMemory.mutations.createChat,
                        { projectId: e, userId: r, name: "New Conversation" },
                      );
                      (t &&
                        (await l.mutation(
                          a.FH.agentMemory.mutations.setChatModel,
                          { chatId: u, openRouterModel: t },
                        )),
                        d(u),
                        V(e, u),
                        console.log(
                          `[useChatManagement] Created new chat: ${u}`,
                        ));
                    } catch (e) {
                      console.error("Failed to create new chat:", e);
                    }
                },
                [r, e, i],
              ),
              g = (0, G.hb)(
                (t) => {
                  (d(t), V(e, t));
                },
                [e],
              );
            return {
              currentChatId: l,
              setCurrentChatId: d,
              threadTabs: p,
              isLoading: !m,
              handleCreateNewThread: h,
              handleSwitchThread: g,
              handleRenameThread: (0, G.hb)(
                async (e, t) => {
                  if (t.trim())
                    try {
                      await c({ chatId: e, name: t });
                    } catch (e) {
                      console.error("Failed to rename chat:", e);
                    }
                },
                [c],
              ),
            };
          })({ projectId: i, getCombinedContext: e4 }),
          {
            visiblePrompts: td,
            displayPrompts: tc,
            queueCount: tu,
            isAtCapacity: tm,
            isSlotOccupied: tp,
            belongsToCurrentContext: th,
            getPromptsForContext: tg,
            getVisiblePrompt: tx,
            hasVisiblePrompt: tf,
            hasActiveDispatch: tb,
            getActiveDispatch: ty,
            isActiveDispatchInput: tv,
            enqueue: tw,
            pause: tj,
            beginDispatch: tk,
            settleDispatch: tN,
            recoverAfterDispatch: tI,
            parkForOwningChat: tC,
            takeVisiblePrompt: tS,
            cancelVisiblePrompt: tA,
          } = (function ({ projectId: e, chatId: t, enabled: n }) {
            let [r, a] = (0, o.useReducer)(te, e7),
              s = (0, o.useRef)(e7),
              i = (0, o.useRef)({ projectId: e, chatId: t, enabled: n });
            (0, o.useLayoutEffect)(() => {
              i.current = { projectId: e, chatId: t, enabled: n };
            }, [t, n, e]);
            let l = (0, o.useCallback)((e) => {
                let t = s.current,
                  n = te(t, e);
                return n === t ? null : ((s.current = n), a(e), n);
              }, []),
              d = (0, o.useCallback)((e) => {
                let t = i.current;
                return !!t.enabled && tt(e, t.projectId, t.chatId);
              }, []),
              c = (0, o.useCallback)((e, t) => {
                if (!i.current.enabled) return [];
                let n = rq(e, t);
                return s.current.queuesByContext[n] ?? [];
              }, []),
              u = (0, o.useCallback)(() => {
                let e = i.current;
                return e.chatId ? c(e.projectId, e.chatId) : [];
              }, [c]),
              m = (0, o.useCallback)(() => u()[0] ?? null, [u]),
              p = (0, o.useCallback)(
                ({ input: e, sourceManualAttemptId: t }) => {
                  let n = i.current;
                  if (!n.enabled || !n.chatId) return null;
                  let r = c(n.projectId, n.chatId),
                    a = s.current.activeDispatch;
                  if (r.length + (a && d(a) ? 1 : 0) >= 10) return null;
                  let o = {
                      id:
                        globalThis.crypto?.randomUUID?.() ??
                        `queue-${Date.now()}-${Math.random().toString(36).slice(2)}`,
                      input: e,
                      projectId: n.projectId,
                      chatId: n.chatId,
                      queuedAt: Date.now(),
                      sourceManualAttemptId: t,
                      status: "queued",
                    },
                    u = l({
                      type: "enqueue",
                      contextKey: rq(n.projectId, n.chatId),
                      prompt: o,
                    });
                  return u ? (rJ(u, o.projectId, o.chatId), o) : null;
                },
                [d, c, l],
              ),
              h = (0, o.useCallback)(
                (e, t) => {
                  if (!i.current.enabled) return !1;
                  let n = rq(e.projectId, e.chatId);
                  if (
                    !(s.current.queuesByContext[n] ?? []).some(
                      (t) => t.id === e.id,
                    )
                  )
                    return !1;
                  let r = l({
                    type: "pause_visible",
                    contextKey: n,
                    promptId: e.id,
                    reason: t,
                  });
                  return !!r && (rJ(r, e.projectId, e.chatId), !0);
                },
                [l],
              ),
              g = (0, o.useCallback)(
                (e) => {
                  if (!i.current.enabled) return !1;
                  let t = rq(e.projectId, e.chatId),
                    n = s.current.queuesByContext[t]?.[0];
                  if (n?.id !== e.id) return !1;
                  let r = l({
                    type: "begin_dispatch",
                    contextKey: t,
                    promptId: e.id,
                  });
                  return !!r && (rJ(r, e.projectId, e.chatId), !0);
                },
                [l],
              ),
              x = (0, o.useCallback)(
                (e, t) => {
                  if (s.current.activeDispatch?.id !== e.id) return !1;
                  let n = rq(e.projectId, e.chatId),
                    r = "paused" === t.outcome ? ta(e, t.reason) : void 0,
                    a = l({
                      type: "settle_dispatch",
                      contextKey: n,
                      promptId: e.id,
                      pausedPrompt: r,
                    });
                  return !!a && (rJ(a, e.projectId, e.chatId), !0);
                },
                [l],
              ),
              f = (0, o.useCallback)(
                (e, t) =>
                  s.current.activeDispatch?.id === e.id
                    ? x(e, { outcome: "paused", reason: t })
                    : h(e, t),
                [h, x],
              ),
              b = (0, o.useCallback)((e, t) => h(e, t), [h]),
              y = (0, o.useCallback)(
                (e) => {
                  let t = i.current;
                  if (!t.enabled || !t.chatId) return null;
                  let n = rq(t.projectId, t.chatId),
                    r = s.current.queuesByContext[n] ?? [],
                    a = e ? r.find((t) => t.id === e) : r[0];
                  if (!a) return null;
                  let o = l({
                    type: "remove_visible",
                    contextKey: n,
                    promptId: a.id,
                  });
                  return o ? (rJ(o, a.projectId, a.chatId), a) : null;
                },
                [l],
              ),
              v = (0, o.useCallback)((e) => y(e), [y]),
              w = (0, o.useCallback)(
                (e) =>
                  !!i.current.enabled && s.current.activeDispatch?.input === e,
                [],
              ),
              j = (0, o.useCallback)(
                () => (i.current.enabled ? s.current.activeDispatch : null),
                [],
              ),
              k = (0, o.useCallback)(() => {
                if (!i.current.enabled) return !1;
                let e = s.current.activeDispatch;
                return !!(e && d(e));
              }, [d]),
              N = (0, o.useCallback)(() => null !== m(), [m]);
            (0, o.useEffect)(() => {
              if (!n || !t) return;
              let r = rq(e, t);
              if (
                Object.prototype.hasOwnProperty.call(
                  s.current.queuesByContext,
                  r,
                )
              )
                return;
              let a = null,
                i = [];
              try {
                ((a = window.sessionStorage.getItem(r)),
                  (i = (function (e, t, n) {
                    if (!e) return [];
                    try {
                      let r = JSON.parse(e);
                      if (
                        2 !== r.version ||
                        !Array.isArray(r.prompts) ||
                        r.prompts.length > 10
                      )
                        return [];
                      let a = [];
                      for (let e of r.prompts) {
                        if (
                          "string" != typeof e.id ||
                          "string" != typeof e.input ||
                          "string" != typeof e.projectId ||
                          "string" != typeof e.chatId ||
                          "number" != typeof e.queuedAt ||
                          !Number.isFinite(e.queuedAt) ||
                          e.projectId !== t ||
                          e.chatId !== n
                        )
                          return [];
                        let r = e.input.trim();
                        if (!r || r.length > 2e4) return [];
                        a.push({
                          id: e.id,
                          input: r,
                          projectId: e.projectId,
                          chatId: e.chatId,
                          queuedAt: e.queuedAt,
                          sourceManualAttemptId: null,
                          status: "paused",
                          pauseReason: "restored",
                        });
                      }
                      return a;
                    } catch {
                      return [];
                    }
                  })(a, e, t)),
                  a && 0 === i.length && window.sessionStorage.removeItem(r));
              } catch {
                i = [];
              }
              let o = s.current.activeDispatch;
              l({
                type: "load_context",
                contextKey: r,
                prompts: o && tt(o, e, t) ? i.filter((e) => e.id !== o.id) : i,
              });
            }, [t, n, e, l]);
            let I = n && t ? rq(e, t) : null,
              C = I ? (r.queuesByContext[I] ?? []) : [],
              S = C[0] ?? null,
              A = n ? r.activeDispatch : null,
              P = !!(A && tt(A, e, t)),
              M = C.length + +!!P,
              _ = (function ({
                visiblePrompts: e,
                activeDispatch: t,
                projectId: n,
                chatId: r,
              }) {
                return t && tt(t, n, r)
                  ? [t, ...e.filter((e) => e.id !== t.id)]
                  : e;
              })({
                visiblePrompts: C,
                activeDispatch: P ? A : null,
                projectId: e,
                chatId: t,
              });
            return {
              visiblePrompts: C,
              displayPrompts: _,
              visiblePrompt: S,
              activeDispatch: A,
              queueCount: M,
              isAtCapacity: M >= 10,
              isSlotOccupied: M > 0,
              belongsToCurrentContext: d,
              getPromptsForContext: c,
              getVisiblePrompts: u,
              getVisiblePrompt: m,
              hasVisiblePrompt: N,
              hasActiveDispatch: k,
              getActiveDispatch: j,
              isActiveDispatchInput: w,
              enqueue: p,
              pause: h,
              beginDispatch: g,
              settleDispatch: x,
              recoverAfterDispatch: f,
              parkForOwningChat: b,
              takeVisiblePrompt: y,
              cancelVisiblePrompt: v,
            };
          })({ projectId: i, chatId: e9, enabled: M }),
          tP = (0, x.hb)(
            (e) => {
              (eV(e), e9 && eK({ chatId: e9, openRouterModel: e }));
            },
            [e9, eK],
          ),
          tM = (0, x.hb)(() => {
            (tP("composer-2.5"), N.oR.success("Switched to Composer 2.5"));
          }, [tP]),
          t_ = (0, x.hb)(() => ti(eW), [ti, eW]),
          tT = (0, x.hb)((e) => tP(e), [tP]),
          tR = (0, Y.T)({ projectId: i }),
          tE = (0, x.hb)(() => {
            (eP(!0), tR.isLoading || e_(!0));
          }, [tR.isLoading]);
        (0, x.vJ)(() => {
          tR.isConnected && eA && eP(!1);
        }, [tR.isConnected, eA]);
        let t$ = (0, s.IT)(
            a.FH.projects.getProjectById,
            i ? { projectId: i } : "skip",
          ),
          tL = (0, x.Kr)(
            () => (0, rZ.EV)(t$?.onboardingFinalPlan),
            [t$?.onboardingFinalPlan],
          ),
          tF = !!tL,
          tU = (0, s.IT)(
            a.FH.remixRoadmaps.getByProjectId,
            _ && i && !tF ? { projectId: i } : "skip",
          ),
          { dismissed: tD, dismiss: tO } = (function (e) {
            let [t, n] = (0, G.J0)(!1);
            return (
              (0, G.vJ)(() => {
                if (!e) return void n(!1);
                n(rG().has(e));
              }, [e]),
              {
                dismissed: t,
                dismiss: (0, G.hb)(() => {
                  if (!e) return;
                  n(!0);
                  let t = rG();
                  if (!t.has(e)) {
                    t.add(e);
                    try {
                      window.localStorage.setItem(rB, JSON.stringify([...t]));
                    } catch {}
                  }
                }, [e]),
              }
            );
          })(tU?._id),
          {
            dismissed: tz,
            anchorAfterMessageId: tH,
            dismiss: tq,
          } = (function (e) {
            let [t, n] = (0, G.J0)(!1),
              [r, a] = (0, G.J0)(null);
            return (
              (0, G.vJ)(() => {
                if (!e) {
                  (n(!1), a(null));
                  return;
                }
                (n(rK().has(e)), a(rQ()[e] ?? null));
              }, [e]),
              {
                dismissed: t,
                anchorAfterMessageId: t ? r : null,
                dismiss: (0, G.hb)(
                  (t) => {
                    if (!e) return;
                    n(!0);
                    let r = rK();
                    if (!r.has(e)) {
                      r.add(e);
                      try {
                        window.localStorage.setItem(rW, JSON.stringify([...r]));
                      } catch {}
                    }
                    if (t) {
                      let n = rQ();
                      if (!n[e]) {
                        n[e] = t;
                        try {
                          window.localStorage.setItem(rV, JSON.stringify(n));
                        } catch {}
                        a(t);
                      }
                    }
                  },
                  [e],
                ),
              }
            );
          })(i),
          tB = (0, s.IT)(a.FH.settings.getPlatformSettings, {}),
          tG = (0, s.IT)(a.FH.modelAvailability.getAll, {}),
          tW = (0, x.Kr)(() => {
            if (!tG) return;
            let e = {};
            for (let t of tG) e[t.modelId] = t.available;
            return e;
          }, [tG]),
          tV = (0, x.Kr)(() => {
            if (!tG) return;
            let e = {};
            for (let t of tG) t.discountBadgeHidden && (e[t.modelId] = !0);
            return e;
          }, [tG]),
          tK = (0, s.IT)(
            a.FH.agentMemory.queries.getChatInfo,
            f && e9 ? { chatId: e9 } : "skip",
          );
        (0, x.vJ)(() => {
          tK &&
            (tK.openRouterModel
              ? (0, I.fj)(tK.openRouterModel, tW)
                ? (((0, I.wR)(tK.openRouterModel) ||
                    ((0, I.DY)(tK.openRouterModel) &&
                      !(S?.isAdmin || S?.isBetaTester))) &&
                    !(tF && "composer-2.5" === tK.openRouterModel)) ||
                  ((0, I.T4)(tK.openRouterModel) &&
                    "available" !== (0, I.XK)(S))
                  ? eV(eJ)
                  : eV(tK.openRouterModel)
                : (N.oR.warning(
                    `${tK.openRouterModel} is no longer available. Switched to default model.`,
                  ),
                  eV(eJ))
              : eV(eJ));
        }, [
          e9,
          tK,
          tW,
          eJ,
          S?.isAdmin,
          S?.isBetaTester,
          S?.tier,
          S?.chatgptSubEnabled,
          tF,
        ]);
        let { executionState: tQ, allExecutionSessions: tY } = (function (
            e,
            t,
          ) {
            let n = (0, s.IT)(
                a.FH.executionState.getExecutionState,
                e ? { chatId: e, executionSessionId: void 0 } : "skip",
              ),
              r = (0, s.IT)(
                a.FH.executionState.getAllExecutionSessions,
                e ? { chatId: e } : "skip",
              );
            return {
              executionState: n || {
                plan: [],
                pastSteps: [],
                planStatus: "pending",
                currentStep: "",
                cancelled: !1,
                executionSessionId: void 0,
              },
              allExecutionSessions: r || [],
              isLoading: void 0 === n,
              getCompletedStepNames: () =>
                n?.pastSteps ? n.pastSteps.map(([e]) => e) : [],
              getCompletedStepNamesForSession: (e) => {
                if (!r) return [];
                let t = r.find((t) => t.executionSessionId === e);
                return t?.pastSteps ? t.pastSteps.map(([e]) => e) : [];
              },
            };
          })(e9),
          {
            results: tZ,
            status: tX,
            loadMore: t0,
          } = (0, s.fz)(
            a.FH.agentMemory.queries.getChatMessagesPage,
            f && e9 ? { chatId: e9 } : "skip",
            { initialNumItems: 60 },
          ),
          t1 = (0, x.Kr)(
            () =>
              [...tZ].sort(
                (e, t) => (e._creationTime ?? 0) - (t._creationTime ?? 0),
              ),
            [tZ],
          ),
          t4 = (0, x.Kr)(
            () =>
              t1
                .map((e) => {
                  let t;
                  try {
                    t = JSON.parse(e.message);
                  } catch {
                    t = { type: "text", content: e.message };
                  }
                  if ("activity" === e.role) {
                    let n = t.additional_kwargs?.activityType,
                      r =
                        n &&
                        [
                          "thinking",
                          "reading",
                          "searching",
                          "writing",
                          "deleting",
                          "editing",
                          "creating",
                          "tool_use",
                          "planning",
                          "executing",
                          "rollback",
                          "memory_bank",
                          "screenshot",
                        ].includes(n)
                          ? n
                          : void 0,
                      a = t.additional_kwargs?.status || "completed",
                      s = ["started", "completed", "failed"].includes(a)
                        ? a
                        : "completed",
                      i = t.additional_kwargs?.activityId,
                      o =
                        "string" == typeof t.content
                          ? t.content
                          : t.content
                            ? JSON.stringify(t.content)
                            : "Activity";
                    return {
                      id: e._id,
                      role: "activity",
                      text: o,
                      timestamp: e.timestamp,
                      type: "activity",
                      activityId: i,
                      activityType: r,
                      activityStatus: s,
                      activityStartedAt: e.timestamp,
                      activityTitle: o,
                      executionSessionId: e.executionSessionId,
                      rollbackCheckpointId:
                        "string" ==
                        typeof t.additional_kwargs?.rollbackCheckpointId
                          ? t.additional_kwargs.rollbackCheckpointId
                          : void 0,
                      rollbackOriginalPrompt:
                        "string" ==
                        typeof t.additional_kwargs?.rollbackOriginalPrompt
                          ? t.additional_kwargs.rollbackOriginalPrompt
                          : void 0,
                      rollbackCheckpointTimestamp:
                        "number" ==
                        typeof t.additional_kwargs?.rollbackCheckpointTimestamp
                          ? t.additional_kwargs.rollbackCheckpointTimestamp
                          : void 0,
                      diff: t.additional_kwargs?.diff,
                      additional_kwargs: t.additional_kwargs,
                    };
                  }
                  let { text: n, messageContent: r } = (function (e) {
                      if ("string" == typeof e) return { text: e };
                      if (Array.isArray(e)) {
                        let t = [],
                          n = [];
                        for (let r of e)
                          "text" === r.type && r.text
                            ? (t.push(r.text),
                              n.push({ type: "text", text: r.text }))
                            : "image_url" === r.type &&
                              r.image_url?.url &&
                              (t.push("[Image]"),
                              n.push({
                                type: "image",
                                imageUrl: r.image_url.url,
                                mimeType: r.image_url.url.startsWith("data:")
                                  ? r.image_url.url.split(";")[0].split(":")[1]
                                  : void 0,
                              }));
                        return {
                          text: t.join(" "),
                          messageContent: n.length > 0 ? n : void 0,
                        };
                      }
                      return {
                        text:
                          "object" == typeof e ? JSON.stringify(e) : String(e),
                      };
                    })(t.data?.content || t.content || ""),
                    a =
                      "human" === e.role
                        ? "user"
                        : "ai" === e.role || "assistant" === e.role
                          ? "assistant"
                          : "system",
                    s = r,
                    i =
                      t.additional_kwargs?.uiFeedback ??
                      t.additional_kwargs?.guiFeedback;
                  i?.templateName &&
                    i?.imageUrl &&
                    (s = [
                      ...(s || []),
                      {
                        type: "gui-feedback",
                        templateName: i.templateName,
                        imageUrl: i.imageUrl,
                        caption: i.caption,
                      },
                    ]);
                  let o = t.additional_kwargs?.animationPreview;
                  return (
                    o?.clipName &&
                      o?.clipUrl &&
                      ("R6" === o.rig || "R15" === o.rig) &&
                      (s = [
                        ...(s || (n ? [{ type: "text", text: n }] : [])),
                        {
                          type: "animation-preview",
                          clipName: o.clipName,
                          clipUrl: o.clipUrl,
                          rig: o.rig,
                        },
                      ]),
                    {
                      id: e._id,
                      role: a,
                      text: n,
                      content: s,
                      timestamp: e.timestamp,
                      type: "text",
                      executionSessionId: e.executionSessionId,
                      checkpointId: e.checkpointId,
                      checkpointCreatedAt: e.checkpointCreatedAt,
                      hasCheckpoint: e.hasCheckpoint,
                      additional_kwargs: t.taskSuggestions
                        ? {
                            ...t.additional_kwargs,
                            taskSuggestions: t.taskSuggestions,
                          }
                        : t.additional_kwargs,
                    }
                  );
                })
                .sort((e, t) => (e.timestamp || 0) - (t.timestamp || 0)),
            [t1],
          ),
          t6 = !e9 || "LoadingFirstPage" === tX,
          [t8, t7] = (0, x.J0)(!1);
        (0, x.vJ)(() => {
          t6 || t7(!0);
        }, [t6]);
        let [nt, nn] = (0, x.J0)(null),
          [ni, no] = (0, x.J0)(!1),
          [nd, nc] = (0, x.J0)(!1),
          [nu, nm] = (0, x.J0)(!1),
          [np, nh] = (0, x.J0)(!1),
          [ng, nx] = (0, x.J0)(null),
          nf = (0, x.hb)(
            (e, t, n) => {
              var r, a;
              if (tv(e)) return;
              if (tf()) {
                let t = D(em.current, { input: e, reason: n });
                ((em.current = t), eu(t));
                return;
              }
              let s =
                ((r = el.current),
                (a = em.current),
                U(r, t)
                  ? { input: e, retryablePrompts: a }
                  : r === e
                    ? { input: r, retryablePrompts: a }
                    : {
                        input: r,
                        retryablePrompts: D(a, { input: e, reason: n }),
                      });
              ((el.current = s.input),
                (em.current = s.retryablePrompts),
                eo(s.input),
                eu(s.retryablePrompts));
            },
            [tf, tv],
          ),
          nb = (0, x.hb)(() => {
            let e = ng ? `@${ng.templateName} ` : "",
              t = (function (e, t, n) {
                let [r, ...a] = n;
                return r
                  ? {
                      input: r.input,
                      retryablePrompts: U(e, t)
                        ? a
                        : D(a, { input: e, reason: "swapped" }),
                    }
                  : { input: e, retryablePrompts: n };
              })(el.current, e, em.current);
            ((el.current = t.input),
              (em.current = t.retryablePrompts),
              eo(t.input),
              eu(t.retryablePrompts),
              O(t.input, ng?.templateName) && nx(null),
              requestAnimationFrame(() => {
                (e8(), e6.current?.focus());
              }));
          }, [e8, ng, e6]),
          ny = (0, x.hb)(() => {
            let e = em.current.slice(1);
            ((em.current = e), eu(e));
          }, []);
        (0, x.vJ)(() => {
          ((em.current = []), eu([]));
        }, [e9, i]);
        let nv = !!S?.isAdmin,
          nw = { isAdmin: nv, isBetaTester: !!S?.isBetaTester, tier: S?.tier },
          nj = nv || !!S?.isBetaTester,
          nk = (0, I.XK)(S),
          nN = A.audioInput,
          nI = (0, Z.M1)(nw),
          nC = (0, Z.Pi)(nw),
          nS = (0, Z.yF)(nw),
          nA = (0, Z.SF)(nw),
          nP = (0, Z.xG)(nw),
          nM = (0, Z.K7)(nw),
          n_ = nI && nM && A.gameMapWorkspace,
          nT = Q(),
          nR = S?.autoPlaytestEnabled ?? !0,
          nL = S?.captureGifEnabled ?? !0,
          nF = S?.publicPromptsEnabled ?? !1,
          nU = S?.playCompletionSound ?? !0,
          nD = S?.slotMachineEnabled ?? !0,
          nz = (0, s.n_)(a.FH.users.updatePlaytestPromptPreferences),
          nH = (0, x.hb)(
            async (e) => {
              try {
                await nz(e);
              } catch (e) {
                console.error(
                  "[AIChat] updatePlaytestPromptPreferences failed",
                  e,
                );
              }
            },
            [nz],
          ),
          nq = (0, s.n_)(a.FH.users.setLowCostUiMode),
          nJ = (0, x.hb)(
            async (e) => {
              try {
                await nq({ enabled: e });
              } catch (e) {
                console.error("[AIChat] setLowCostUiMode failed", e);
              }
            },
            [nq],
          ),
          nB = (0, s.IT)(a.FH.users.hasSentAnyPrompt, {}),
          nG = (0, v.Wk)("promptFirstPlayable", S) && !0 === nB,
          [nW, nV] = (0, x.J0)(() =>
            "agent" === C.get("view") || nM
              ? "agent"
              : !0 === nB && nS
                ? "explore"
                : "agent",
          ),
          [nK, nQ] = (0, x.J0)(() => (!nM || n_ || nT ? null : "game-memory")),
          nY = n_ && "history" === nK,
          nZ = n_ && "explore" === nW && nP && "cards-leaderboard" === nK,
          [nX, n0] = (0, x.J0)([]),
          n1 = (0, x.hb)(
            (e) => {
              if (nX.some((t) => t.id === e.id)) return;
              let t = `@${e.title}`;
              (n0((n) => [...n, { ...e, mentionText: t }]),
                eo(
                  0 === ei.length || ei.endsWith(" ")
                    ? `${ei}${t} `
                    : `${ei} ${t} `,
                ),
                e6.current?.focus());
            },
            [nX, ei, e6],
          ),
          n5 = (0, x.hb)((e) => {
            n0((t) => t.filter((t) => t.mentionText !== e));
          }, []),
          n2 = (0, x.hb)(
            (e) => {
              let t = z(el.current, e.text).value;
              ((el.current = t),
                eo(t),
                requestAnimationFrame(() => {
                  let e = e6.current;
                  e && (e.focus(), e.setSelectionRange(t.length, t.length));
                }));
            },
            [e6],
          );
        (0, x.vJ)(() => {
          n0((e) => {
            if (0 === e.length) return e;
            let t = e.filter((e) => ei.includes(e.mentionText));
            return t.length === e.length ? e : t;
          });
        }, [ei]);
        let [n6, n8] = (0, x.J0)(!1),
          [n7, n9] = (0, x.J0)(!1),
          [re, rt] = (0, x.J0)(!1),
          [rn, ra] = (0, x.J0)(!1),
          [rs, ro] = (0, x.J0)(!1),
          rl = (0, x.li)(null),
          [ru, rh] = (0, x.J0)(null),
          rg = (0, s.IT)(
            a.FH.userPrompts.getProjectPromptCountForViewer,
            nC && i ? { projectId: i } : "skip",
          ),
          rx = nI
            ? () => {
                setTimeout(
                  () => void L.current?.scrollIntoView({ behavior: "smooth" }),
                  250,
                );
              }
            : void 0;
        !(function ({
          projectId: e,
          pluginConnected: t,
          existingTemplates: n,
          isAgentRunning: r,
          onTemplateRemoved: i,
        }) {
          let l = (0, s.n_)(a.FH.uiBuilderScripts.deleteScript),
            d = (0, o.useRef)(!1),
            c = (0, o.useRef)(!1),
            u = (0, o.useRef)(!1),
            m = (0, o.useRef)(!1),
            p = (0, o.useCallback)(async () => {
              if (d.current || !t || !n || 0 === n.length)
                return void console.log(
                  `[useValidateTemplates] Skipping validation (validating: ${d.current}, pluginConnected: ${t}, templates: ${n?.length ?? 0})`,
                );
              (console.log(
                `[useValidateTemplates] Starting validation for ${n.length} template(s)`,
              ),
                (d.current = !0));
              try {
                let t = await X(e, "list", { uniqueId: "rs1", maxDepth: 1 }),
                  r = t.result?.children || [],
                  a =
                    r.find((e) => "UIs" === e.name) ??
                    r.find((e) => "UITemplates" === e.name),
                  s = new Set();
                if (a) {
                  let t = await X(e, "list", {
                      uniqueId: a.uniqueId,
                      maxDepth: 1,
                    }),
                    n = t.result?.children || [];
                  s = new Set(n.map((e) => e.uniqueId));
                }
                let o = await X(e, "list", { uniqueId: "sps", maxDepth: 1 }),
                  d = o.result?.children || [],
                  c = new Set(d.map((e) => e.uniqueId));
                for (let e of n) {
                  let t = !!e.templateUniqueId && s.has(e.templateUniqueId),
                    n = c.has(e.scriptUniqueId);
                  (t && n) ||
                    (console.log(
                      `[useValidateTemplates] Template "${e.templateName}" stale in Studio (template: ${t}, script: ${n}), removing record`,
                    ),
                    await l({ id: e._id }),
                    i?.(e.scriptUniqueId));
                }
              } catch (e) {
                console.error(
                  "[useValidateTemplates] Validation error:",
                  e?.message || e,
                );
              } finally {
                d.current = !1;
              }
            }, [e, t, n, l, i]);
          ((0, o.useEffect)(() => {
            let e = u.current;
            if (((u.current = t), t && !e)) {
              console.log(
                "[useValidateTemplates] Plugin reconnected — scheduling validation",
              );
              let e = setTimeout(() => {
                p();
              }, 2e3);
              return () => clearTimeout(e);
            }
          }, [t, p]),
            (0, o.useEffect)(() => {
              if (!c.current && t && n && n.length > 0) {
                ((c.current = !0),
                  console.log(
                    `[useValidateTemplates] Initial load — scheduling validation (${n.length} template(s))`,
                  ));
                let e = setTimeout(() => {
                  p();
                }, 2e3);
                return () => clearTimeout(e);
              }
            }, [t, n, p]),
            (0, o.useEffect)(() => {
              let e = m.current;
              if (((m.current = r), e && !r)) {
                console.log(
                  "[useValidateTemplates] Agent stopped — scheduling validation",
                );
                let e = setTimeout(() => {
                  p();
                }, 2e3);
                return () => clearTimeout(e);
              }
            }, [r, p]));
        })({
          projectId: i,
          pluginConnected: tR.isConnected,
          existingTemplates: et,
          isAgentRunning: !!t$?.generatingSince,
          onTemplateRemoved: (0, x.hb)(
            (e) => {
              ng?.scriptUniqueId === e && nx(null);
            },
            [ng],
          ),
        });
        let [rf, rb] = (0, x.J0)(null),
          [ry, rv] = (0, x.J0)({}),
          rw = (0, x.li)(e9);
        ((rw.current = e9),
          (0, x.vJ)(() => {
            rb(null);
          }, [e9]));
        let rj = (0, x.hb)(
          (e) => {
            (rb(e),
              setTimeout(() => {
                (e6.current?.focus(), e8());
              }, 0));
          },
          [e6, e8],
        );
        (0, x.vJ)(() => {
          if (!P || !rf) return;
          let e = rf.taskSuggestions.tasks[rf.selectedIndex];
          (e && ei === w(e).composerValue) || rb(null);
        }, [ei, P, rf]);
        let {
            messagesToDisplay: rk,
            hasMoreMessages: rN,
            loadMoreMessages: rI,
            shouldMaintainScrollPosition: rC,
          } = (function ({
            messages: e,
            currentChatId: t,
            isProcessing: n,
            loadMore: r,
            paginationStatus: a,
          }) {
            let [s, i] = (0, x.J0)(!1),
              [o, l] = (0, x.J0)(!1),
              d = (0, x.li)(!1),
              c = (0, x.li)(a),
              u = (0, x.hb)(() => {
                ((d.current = !0), l(!0), i(!0), r(60));
              }, [r]);
            ((0, x.vJ)(() => {
              let e = c.current;
              if (
                ((c.current = a),
                d.current && "LoadingMore" === e && "LoadingMore" !== a)
              ) {
                d.current = !1;
                let e = requestAnimationFrame(() => l(!1));
                return () => cancelAnimationFrame(e);
              }
            }, [a]),
              (0, x.vJ)(() => {
                (i(!1), l(!1), (d.current = !1));
              }, [t]));
            let m = (0, x.Kr)(
                () =>
                  (function (e) {
                    let t = e.findIndex((e) => "user" === e.role);
                    return -1 === t ? e : e.slice(t);
                  })(e),
                [e],
              ),
              p = "CanLoadMore" === a || "LoadingMore" === a,
              h = (0, x.Kr)(() => K(e), [e]),
              g = (0, x.Kr)(() => K(m), [m]),
              f = Math.max(0, h - g);
            return {
              visibleMessageCount: m.length,
              messagesToDisplay: m,
              hasMoreMessages: p,
              totalUserPrompts: h,
              visibleUserPrompts: g,
              remainingUserPrompts: f,
              loadMoreMessages: u,
              hasManuallyExpanded: s,
              shouldMaintainScrollPosition: o,
            };
          })({
            messages: t4,
            currentChatId: e9,
            isProcessing: !1,
            loadMore: t0,
            paginationStatus: tX,
          }),
          rS = (0, x.Kr)(
            () => rk.map((e) => ({ role: e.role, text: e.text })),
            [rk],
          ),
          {
            chatContainerRef: rA,
            scrollToBottom: rP,
            unpinAutoFollow: rM,
          } = (function ({
            messagesToDisplay: e,
            shouldMaintainScrollPosition: t,
          }) {
            let n = (0, o.useRef)(null),
              r = (0, o.useRef)(0),
              a = (0, o.useRef)(!0),
              s = (0, o.useRef)(0),
              i = (0, o.useCallback)(() => {
                let e = n.current;
                return (
                  !e || e.scrollHeight - e.scrollTop - e.clientHeight <= 80
                );
              }, []),
              l = (0, o.useCallback)((e = !0) => {
                let t = n.current;
                t &&
                  ((a.current = !0),
                  e && (s.current = Date.now() + 700),
                  t.scrollTo({
                    top: t.scrollHeight,
                    behavior: e ? "smooth" : "auto",
                  }));
              }, []),
              d = (0, o.useCallback)(() => {
                a.current = !1;
              }, []);
            return (
              (0, o.useEffect)(() => {
                let e = n.current;
                if (!e) return;
                let r = () => {
                  !t && (Date.now() < s.current || (a.current = i()));
                };
                return (
                  e.addEventListener("scroll", r, { passive: !0 }),
                  () => e.removeEventListener("scroll", r)
                );
              }, [i, t]),
              (0, o.useEffect)(() => {
                let e = n.current;
                if (!e) return;
                let r = new MutationObserver(() => {
                  !t && a.current && (e.scrollTop = e.scrollHeight);
                });
                return (
                  r.observe(e, {
                    childList: !0,
                    subtree: !0,
                    characterData: !0,
                  }),
                  () => r.disconnect()
                );
              }, [t]),
              (0, o.useEffect)(() => {
                if (t && n.current) {
                  let e = n.current,
                    t = e.scrollHeight - r.current;
                  e.scrollTop += t;
                }
              }, [e, t]),
              (0, o.useEffect)(() => {
                n.current && (r.current = n.current.scrollHeight);
              }, [e.length]),
              { chatContainerRef: n, scrollToBottom: l, unpinAutoFollow: d }
            );
          })({ messagesToDisplay: rk, shouldMaintainScrollPosition: rC }),
          {
            isProcessing: r_,
            canStopGeneration: rT,
            newAgentSessionId: rR,
            error: rE,
            errorCode: r$,
            userMessage: rL,
            requestUrl: rF,
            statusCode: rU,
            errorTimestamp: rD,
            wasCancelled: rO,
            isWaitingForHuman: rz,
            setError: aa,
            handleSendWithContext: as,
            handleStopGeneration: ai,
            handleHumanReview: ao,
            handleHumanReviewWithIds: al,
            canContinue: ad,
            forceCanContinue: ac,
            clearCanContinue: au,
            handleContinue: am,
            rateLimitInfo: ap,
            setRateLimitInfo: ah,
            freeModelResetAt: ag,
            codexRetryAfterSeconds: ax,
          } = (function ({
            currentChatId: e,
            projectId: t,
            clerkUserIdFromAuth: n,
            scrollToBottom: r,
            selectedModel: i,
            generatingSince: o,
            onCreatedUI: l,
            autoPlaytestEnabled: d,
            captureGifEnabled: c,
          }) {
            var m, p;
            let h = !1 === d,
              { getToken: g } = (0, u.d)(),
              { isAuthenticated: x } = (0, s.Z)(),
              [f, v] = (0, k.J0)(!1),
              w = (0, k.li)(!1),
              C = ((m = o), (p = Date.now()), !!m && p - m < 9e5),
              S = (0, k.li)(o);
            S.current = o;
            let [A, P] = (0, k.J0)(null),
              [M, _] = (0, k.J0)(null),
              [T, $] = (0, k.J0)(null),
              [L, F] = (0, k.J0)(null),
              [U, D] = (0, k.J0)(null),
              [O, z] = (0, k.J0)(null),
              [G, W] = (0, k.J0)(!1),
              [V, K] = (0, k.J0)(!1),
              [Q, Y] = (0, k.J0)(!1),
              Z = (0, k.li)(null),
              X = (0, k.li)(0),
              ee = (0, k.li)(null),
              et = (0, k.li)(null),
              [en, er] = (0, k.J0)(null),
              [ea, es] = (0, k.J0)(null),
              [ei, eo] = (0, k.J0)(null),
              [el, ed] = (0, k.J0)(null),
              ec = (0, k.li)(null),
              eu = (0, k.hb)(() => {
                (P(null),
                  _(null),
                  $(null),
                  F(null),
                  D(null),
                  z(null),
                  ed(null));
              }, []),
              em = (0, k.hb)(async () => {
                let e = await g();
                return e
                  ? {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${e}`,
                    }
                  : null;
              }, [g]),
              ep = async (e, t, n) => {
                var r, a;
                if (504 === e.status)
                  return (
                    P(
                      "The agent didn't complete within 20 minutes, but may still be running. Please wait 10 minutes before sending a new message.",
                    ),
                    z(new Date().toISOString()),
                    _("agent_timeout"),
                    D(e.status),
                    F(n),
                    v(!1),
                    er(null),
                    !0
                  );
                let s = await e.json().catch(() => ({}));
                if (
                  (console.error(`[${t}] Error:`, s),
                  426 === e.status &&
                    ("outdated_image" === s.error ||
                      "outdated_env" === s.error))
                )
                  return (
                    P(
                      s.message ||
                        "Your project needs an update. Please refresh the page.",
                    ),
                    z(new Date().toISOString()),
                    v(!1),
                    er(null),
                    !0
                  );
                if (
                  429 === e.status &&
                  "free_model_quota_exceeded" === s.error
                ) {
                  let t =
                    s.message ?? "You've reached your daily free-model limit.";
                  return (
                    P(t),
                    $(t),
                    _("free_model_quota_exceeded"),
                    D(e.status),
                    z(new Date().toISOString()),
                    F(n),
                    eo(s.resetAt ?? Date.now() + 864e5),
                    v(!1),
                    er(null),
                    !0
                  );
                }
                if (
                  429 === e.status &&
                  "autonomous_daily_limit_reached" === s.error
                ) {
                  let t =
                    s.message ??
                    "You've reached today's Autonomous Agent task limit.";
                  return (
                    P(t),
                    $(t),
                    _("autonomous_daily_limit_reached"),
                    D(e.status),
                    z(new Date().toISOString()),
                    F(n),
                    v(!1),
                    er(null),
                    !0
                  );
                }
                if (429 === e.status)
                  return (
                    es({
                      count: s.count || 0,
                      limit: s.limit || 20,
                      resetAt: s.resetAt || Date.now() + 864e5,
                      message: s.message || "You have run out of prompts.",
                    }),
                    v(!1),
                    er(null),
                    !0
                  );
                if (499 === e.status) return (W(!0), eu(), v(!1), er(null), !0);
                if (401 === e.status)
                  return (
                    P(
                      "Your session has expired. Please refresh the page to sign in again.",
                    ),
                    z(new Date().toISOString()),
                    _("unauthorized"),
                    D(e.status),
                    F(n),
                    v(!1),
                    er(null),
                    !0
                  );
                if (463 === e.status) {
                  let e =
                    s.userMessage ||
                    "This model is at capacity due to high demand. Please try again in 1 hour or switch to a different AI model.";
                  return (
                    P(e),
                    $(e),
                    z(new Date().toISOString()),
                    _("rate_limit"),
                    v(!1),
                    er(null),
                    !0
                  );
                }
                if (462 === e.status)
                  return (
                    P(
                      s.userMessage ||
                        "The agent didn't complete your request.",
                    ),
                    z(new Date().toISOString()),
                    _("no_response"),
                    v(!1),
                    er(null),
                    !0
                  );
                if (465 === e.status && R(s.errorCode)) {
                  let t = s.userMessage || E[s.errorCode];
                  return (
                    P(t),
                    _(s.errorCode),
                    $(t),
                    ed(s.retryAfterSeconds ?? null),
                    D(e.status),
                    z(new Date().toISOString()),
                    F(n),
                    v(!1),
                    er(null),
                    !0
                  );
                }
                return (
                  464 === e.status
                    ? (P(
                        s.userMessage ||
                          "The selected model is no longer available. Please switch to a different model.",
                      ),
                      z(new Date().toISOString()),
                      _("model_not_available"),
                      v(!1))
                    : 561 === e.status
                      ? (console.warn(
                          "[useAIExecution] Agent connection reset mid-run; run continues via Convex",
                        ),
                        (r = S.current),
                        (a = Date.now()),
                        (r && a - r < 9e5) ||
                          (P(
                            "The connection to the agent was lost. Your task may still be processing — check back shortly.",
                          ),
                          _("network_error"),
                          z(new Date().toISOString())),
                        v(!1),
                        K(!1))
                      : (P(
                          s.message ||
                            s.error ||
                            (503 === e.status
                              ? "Project is starting up. Please wait a moment and try again."
                              : 502 === e.status
                                ? "Project is not ready yet. Please wait a moment and try again."
                                : `HTTP error! status: ${e.status}`),
                        ),
                        z(new Date().toISOString()),
                        _(s.errorCode || s.error || null),
                        $(s.userMessage || null),
                        D(e.status),
                        F(n),
                        v(!1)),
                  er(null),
                  !0
                );
              },
              eh = (r, s, i) => {
                if (!(r instanceof Error) || "AbortError" !== r.name) {
                  if (
                    r instanceof TypeError &&
                    "Failed to fetch" === r.message
                  ) {
                    var o,
                      l,
                      d = {
                        projectId: t,
                        userId: n,
                        chatId: e,
                        sessionId: ex,
                        apiEndpoint: i.apiEndpoint,
                        prompt: i.prompt,
                      };
                    try {
                      new j.ConvexHttpClient(
                        "https://beaming-hawk-976.convex.cloud",
                      )
                        .mutation(a.FH.frontendErrors.insertFrontendError, {
                          projectId: d.projectId || void 0,
                          userId: d.userId || void 0,
                          chatId: d.chatId || void 0,
                          sessionId: d.sessionId || void 0,
                          handler: s,
                          errorMessage: r.message,
                          apiEndpoint: d.apiEndpoint || void 0,
                          userAgent:
                            "undefined" != typeof navigator
                              ? navigator.userAgent
                              : void 0,
                          prompt: d.prompt
                            ? d.prompt.substring(0, 500)
                            : void 0,
                        })
                        .catch(() => {});
                    } catch {}
                    (console.warn(
                      `[useAIExecution] Network error (Failed to fetch) during ${s}`,
                    ),
                      (o = S.current),
                      (l = Date.now()),
                      (o && l - o < 9e5) ||
                        (P(
                          "The request took too long to respond. Your task may still be processing — check back shortly.",
                        ),
                        _("network_error"),
                        z(new Date().toISOString())),
                      v(!1),
                      K(!1),
                      er(null));
                    return;
                  }
                  (r instanceof J &&
                    (function (e, t, n) {
                      try {
                        new j.ConvexHttpClient(
                          "https://beaming-hawk-976.convex.cloud",
                        )
                          .mutation(a.FH.frontendErrors.insertFrontendError, {
                            projectId: n.projectId || void 0,
                            userId: n.userId || void 0,
                            chatId: n.chatId || void 0,
                            sessionId: n.sessionId || void 0,
                            handler: t,
                            responseStatus: e.responseStatus,
                            responseRedirected: e.responseRedirected,
                            responseUrl: e.responseUrl,
                            responseType: e.responseType,
                            contentType: e.contentType,
                            bodyPreview: e.bodyPreview,
                            responseHeaders: e.responseHeaders,
                            apiEndpoint: n.apiEndpoint || void 0,
                            userAgent:
                              "undefined" != typeof navigator
                                ? navigator.userAgent
                                : void 0,
                            prompt: n.prompt
                              ? n.prompt.substring(0, 500)
                              : void 0,
                          })
                          .catch(() => {});
                      } catch {}
                    })(r, s, {
                      projectId: t,
                      userId: n,
                      chatId: e,
                      sessionId: ex,
                      apiEndpoint: i.apiEndpoint,
                      prompt: i.prompt,
                    }),
                    console.error(`[useAIExecution] ${s} error:`, r),
                    P(
                      r instanceof Error
                        ? r.message
                        : "An unexpected error occurred",
                    ),
                    z(new Date().toISOString()),
                    i.response && (D(i.response.status), F(i.apiEndpoint)));
                }
              },
              eg = (0, s.IT)(
                a.FH.agentMemory.queries.getNewAgentSessionId,
                x && e ? { chatId: e } : "skip",
              ),
              ex = eg?.newAgentSessionId || null,
              [ef, eb] = (0, k.J0)(!1),
              [ey, ev] = (0, k.J0)(null),
              [ew, ej] = (0, k.J0)(!1),
              [, ek] = (0, k.J0)(null),
              eN = (0, k.li)(null),
              eI = (0, k.li)(null),
              eC = (0, k.li)(null),
              eS = (0, k.li)(null),
              eA = (0, k.li)(!1),
              eP = (0, k.li)(!1),
              eM = (0, k.li)(!1),
              e_ = (0, k.li)(!1),
              eT = (0, k.hb)(() => {
                (console.log(
                  "[useAIExecution] forceCanContinue called — Convex fallback for max turns",
                ),
                  ej(!0),
                  ek("agent"));
              }, []),
              eR = (0, k.hb)(() => {
                (console.log(
                  "[useAIExecution] clearCanContinue called — max-turns message superseded",
                ),
                  ej(!1));
              }, []);
            (0, k.vJ)(() => {
              ej(!1);
            }, [e]);
            let eE = (0, k.hb)(
                async (e) => {
                  try {
                    let t = new j.ConvexHttpClient(
                        "https://beaming-hawk-976.convex.cloud",
                      ),
                      n = await g({ template: "convex" });
                    (n && t.setAuth(n),
                      await t.mutation(a.FH.agentMemory.mutations.hideMessage, {
                        messageId: e,
                      }));
                  } catch (e) {
                    console.error(
                      "[useAIExecution] Failed to hide message:",
                      e,
                    );
                  }
                },
                [g],
              ),
              e$ = (0, k.hb)(
                async (t) => {
                  if (
                    (console.log(
                      "[useAIExecution] Setting new agent session ID:",
                      t,
                    ),
                    e)
                  )
                    try {
                      let n = new j.ConvexHttpClient(
                        "https://beaming-hawk-976.convex.cloud",
                      );
                      await n.mutation(
                        a.FH.agentMemory.mutations.setNewAgentSessionId,
                        { chatId: e, sessionId: t },
                      );
                    } catch (e) {
                      console.error(
                        "[useAIExecution] Failed to persist new agent session ID:",
                        e,
                      );
                    }
                },
                [e],
              ),
              eL = (0, k.hb)(
                (e) => {
                  e$(e).catch((e) => {
                    console.error(
                      "[useAIExecution] Failed to set new agent session ID:",
                      e,
                    );
                  });
                },
                [e$],
              ),
              eF = (0, k.hb)(
                async (r, s, o) => {
                  let l;
                  if (
                    (console.log("[useAIExecution] HITL resume attempt:", {
                      action: r,
                      data: s,
                      graphId: o,
                      newAgentSessionId: ex,
                    }),
                    !ex)
                  )
                    return void console.error(
                      "[useAIExecution] No session ID available for HITL resume",
                    );
                  if (w.current) return;
                  w.current = !0;
                  let d = o || ey?.graphId || "agent",
                    u = "/api/agent",
                    m = new AbortController(),
                    p = { id: ++X.current, requestStartedAt: 0 };
                  ((Z.current = m),
                    (ee.current = p),
                    (et.current = null),
                    Y(!1),
                    K(!1));
                  try {
                    (eu(),
                      W(!1),
                      eb(!1),
                      v(!0),
                      console.log(
                        "[handleHumanReviewWithIds] Routing HITL to:",
                        { targetGraphId: d, apiEndpoint: u, action: r },
                      ));
                    try {
                      (0, b.v8)();
                    } catch {}
                    let o = await em();
                    if (!o) {
                      window.location.href = "/sign-in";
                      return;
                    }
                    p.requestStartedAt = Date.now();
                    let x = fetch(u, {
                      method: "POST",
                      headers: o,
                      body: JSON.stringify({
                        approvalAction: r,
                        message: s,
                        sessionId: ex,
                        chatId: e,
                        projectId: t,
                        userId: n,
                        model: i,
                        requestId: crypto.randomUUID(),
                        ...(eI.current && { humanMessageId: eI.current }),
                        ...(eN.current && { selectedUI: eN.current }),
                        ...(c &&
                          (e_.current || !eP.current) && {
                            capturePlaytestGif: !0,
                          }),
                        ...((h || eM.current) && { disablePlaytest: !0 }),
                        ...(eA.current && { disableSuggestions: !0 }),
                      }),
                      signal: m.signal,
                    });
                    if (
                      (K(!0),
                      (l = await x),
                      Z.current !== m || (!l.ok && (await ep(l, "hitl", u))))
                    )
                      return;
                    let f = await B(l);
                    if (
                      (f.imageOutdated &&
                        N.oR.info(
                          "A new Lemonade update is available. Please refresh the page when convenient to update.",
                        ),
                      f.interruptData)
                    ) {
                      (console.log(
                        "[handleHumanReviewWithIds] Surfacing HITL after resume",
                        {
                          graphId: f.interruptData.graphId,
                          playtestStep: f.interruptData.playtestStep,
                          question: f.interruptData.question,
                        },
                      ),
                        ej(!1),
                        eb(!0),
                        ev(f.interruptData),
                        v(!1));
                      return;
                    }
                    if (
                      (f.success &&
                        f.result &&
                        (ev(null),
                        console.log(
                          "[handleHumanReviewWithIds] Resume success",
                          { graphId: f.graphId },
                        )),
                      f.sessionId && eL(f.sessionId),
                      f.needsContinue)
                    )
                      (ej(!0),
                        ek(f.graphId || "agent"),
                        console.log(
                          "[handleHumanReviewWithIds] needsContinue detected",
                          { graphId: f.graphId || "agent" },
                        ),
                        er(null));
                    else if (
                      (er(null),
                      "string" == typeof f.finalResponse &&
                        f.finalResponse.trim())
                    )
                      try {
                        let t = new j.ConvexHttpClient(
                            "https://beaming-hawk-976.convex.cloud",
                          ),
                          n = await g({ template: "convex" });
                        (n && t.setAuth(n),
                          await t.mutation(
                            a.FH.agentMemory.mutations.addMessage,
                            {
                              chatId: e,
                              message: f.finalResponse,
                              role: "assistant",
                            },
                          ));
                      } catch (e) {
                        console.warn(
                          "[handleHumanReviewWithIds] Failed to save finalResponse:",
                          e,
                        );
                      }
                    eu();
                  } catch (e) {
                    eh(e, "hitl", { apiEndpoint: u, prompt: s, response: l });
                  } finally {
                    Z.current === m &&
                      ((Z.current = null),
                      ee.current?.id === p.id && (ee.current = null),
                      (w.current = !1),
                      v(!1),
                      K(!1));
                  }
                },
                [e, ex, ey, t, eL, n, eu, em, i, c, h],
              ),
              eU = (0, k.hb)(async (e, t) => eF(e, t), [eF]),
              eD = (0, k.hb)(
                async (s = {}) => {
                  let o,
                    l = s.sessionId ?? ex;
                  if (!l || w.current || f || C) return;
                  if (!e) {
                    (console.error("[handleContinue] No chat ID available"),
                      P("No chat available. Please try refreshing the page."),
                      z(new Date().toISOString()));
                    return;
                  }
                  w.current = !0;
                  let d = new AbortController(),
                    u = { id: ++X.current, requestStartedAt: 0 };
                  ((Z.current = d),
                    (ee.current = u),
                    (et.current = null),
                    Y(!1),
                    K(!1));
                  let m = "/api/agent";
                  try {
                    (eu(), W(!1), v(!0), ej(!1));
                    let p = 0,
                      x = 0;
                    for (;;) {
                      p += 1;
                      let f = q("Continue", null, []),
                        b = null;
                      try {
                        let t = new j.ConvexHttpClient(
                            "https://beaming-hawk-976.convex.cloud",
                          ),
                          n = await g({ template: "convex" });
                        (n && t.setAuth(n),
                          (b = await t.mutation(
                            a.FH.agentMemory.mutations.addMessage,
                            {
                              chatId: e,
                              message: JSON.stringify({
                                type: "human",
                                data: { content: f },
                              }),
                              role: "human",
                            },
                          )));
                      } catch (e) {
                        return (
                          console.error(
                            "[handleContinue] Failed to persist Continue message",
                            e,
                          ),
                          ej(!0),
                          P("Failed to save message. Please try again."),
                          z(new Date().toISOString()),
                          s.auto ? { accepted: !0 } : void 0
                        );
                      }
                      ((eI.current = b), r());
                      let y = {
                          message: f,
                          sessionId: l,
                          chatId: e,
                          projectId: t,
                          userId: n,
                          humanMessageId: b,
                          model: i,
                          requestId: crypto.randomUUID(),
                          isContinuation: !0,
                          ...(s.auto && { promptOrigin: "queued_auto" }),
                          ...(eC.current && { mode: eC.current }),
                          ...(eN.current && { selectedUI: eN.current }),
                          ...(eS.current && { themeName: eS.current }),
                          ...(c &&
                            (e_.current || !eP.current) && {
                              capturePlaytestGif: !0,
                            }),
                          ...((h || eM.current) && { disablePlaytest: !0 }),
                        },
                        v = await em();
                      if (!v)
                        return (
                          (window.location.href = "/sign-in"),
                          s.auto ? { accepted: !0 } : void 0
                        );
                      u.requestStartedAt = Date.now();
                      let w = fetch(m, {
                        method: "POST",
                        headers: v,
                        body: JSON.stringify(y),
                        signal: d.signal,
                      });
                      K(!0);
                      let k = await w;
                      if (((o = k), Z.current !== d))
                        return s.auto ? { accepted: !0 } : void 0;
                      if (!k.ok) {
                        let e = await k
                            .clone()
                            .json()
                            .catch(() => ({})),
                          t = s.auto
                            ? H(
                                {
                                  status: k.status,
                                  errorCode: e.errorCode ?? e.error,
                                  rolledBack: e.rolledBack,
                                  retryAfterSeconds: e.retryAfterSeconds,
                                },
                                x,
                              )
                            : null;
                        if (null !== t) {
                          if (
                            (await eE(b),
                            await ep(k, "continue", m),
                            (x += 1),
                            (p -= 1),
                            console.log(
                              `[handleContinue] Queue continuation failed safely — retrying (${x}/2)`,
                            ),
                            await new Promise((e) => setTimeout(e, t)),
                            d.signal.aborted)
                          )
                            return { accepted: !0 };
                          eu();
                          continue;
                        }
                        if (await ep(k, "continue", m))
                          return (
                            s.auto && ej(!0),
                            s.auto ? { accepted: !0 } : void 0
                          );
                      }
                      let I = await B(k);
                      if (
                        ((x = 0),
                        I.imageOutdated &&
                          N.oR.info(
                            "A new Lemonade update is available. Please refresh the page when convenient to update.",
                          ),
                        I.sessionId && ((l = I.sessionId), eL(I.sessionId)),
                        I.interruptData)
                      )
                        return (
                          ej(!1),
                          eb(!0),
                          ev(I.interruptData),
                          { accepted: !0 }
                        );
                      if (I.needsContinue) {
                        if (s.auto && p < 2) {
                          if (
                            (console.log(
                              `[handleContinue] Queue task paused at max turns — auto-continuing (${p + 1}/2)`,
                            ),
                            await new Promise((e) => setTimeout(e, 1500)),
                            d.signal.aborted)
                          )
                            return { accepted: !0 };
                          continue;
                        }
                        return (
                          ej(!0),
                          ek(I.graphId || "agent"),
                          { needsContinue: !0, ...(l && { sessionId: l }) }
                        );
                      }
                      if (I.success)
                        return (
                          ej(!1),
                          ek(null),
                          eu(),
                          er(null),
                          { completed: !0 }
                        );
                      return { accepted: !0 };
                    }
                  } catch (e) {
                    return (
                      eh(e, "continue", { apiEndpoint: m, response: o }),
                      s.auto && ej(!0),
                      s.auto ? { accepted: !0 } : void 0
                    );
                  } finally {
                    Z.current === d &&
                      ((Z.current = null),
                      ee.current?.id === u.id && (ee.current = null),
                      (w.current = !1),
                      v(!1),
                      K(!1));
                  }
                },
                [e, ex, t, eL, n, eu, em, g, eE, f, C, i, c, h, r],
              ),
              eO = (0, k.hb)(
                async (n, r) => {
                  var a, s;
                  let i = ec.current || ex,
                    l = ee.current;
                  if (
                    (l ||
                      (ee.current = l =
                        { id: ++X.current, requestStartedAt: o ?? Date.now() }),
                    null !== et.current)
                  )
                    return;
                  ((et.current = l.id), Y(!0), K(!1));
                  let d =
                    ((a = l.requestStartedAt),
                    (s = Date.now()),
                    i?.startsWith("oai_") ? 0 : Math.max(0, 1e4 - (s - a)));
                  if (
                    (d > 0 &&
                      (console.log(
                        `[useAIExecution] Delaying cancel by ${d}ms`,
                      ),
                      await new Promise((e) => setTimeout(e, d))),
                    ee.current?.id !== l.id)
                  ) {
                    et.current === l.id && ((et.current = null), Y(!1));
                    return;
                  }
                  if ((W(!0), (ec.current = null), i && e))
                    try {
                      console.log(
                        "[useAIExecution] Cancelling agent execution:",
                        i,
                      );
                      let n = await em();
                      if (n) {
                        let r = await fetch("/api/agent/cancel", {
                            method: "POST",
                            headers: n,
                            body: JSON.stringify({
                              sessionId: i,
                              chatId: e,
                              projectId: t,
                            }),
                          }),
                          a = await r.json();
                        a.success
                          ? console.log(
                              "[useAIExecution] Agent execution cancelled successfully",
                            )
                          : console.warn(
                              "[useAIExecution] Agent cancellation failed:",
                              a.message,
                            );
                      } else
                        console.warn(
                          "[useAIExecution] Session expired, skipping cancel API",
                        );
                    } catch (e) {
                      console.error(
                        "[useAIExecution] Error calling cancel API:",
                        e,
                      );
                    }
                  if (ee.current?.id !== l.id) {
                    et.current === l.id && ((et.current = null), Y(!1));
                    return;
                  }
                  ((ee.current = null),
                    (et.current = null),
                    Y(!1),
                    en && (n(en.originalInput), setTimeout(() => r(!1), 10)),
                    (w.current = !1),
                    v(!1),
                    er(null));
                },
                [en, ex, e, t, em, o],
              ),
              ez = (0, k.hb)(
                async (
                  s,
                  o,
                  d,
                  u,
                  m = !1,
                  p,
                  x,
                  k,
                  S,
                  A,
                  M,
                  T,
                  E,
                  L,
                  U,
                  O,
                  J,
                ) => {
                  let G,
                    V = !1,
                    Q = L?.modelOverride ?? i;
                  if (
                    w.current ||
                    f ||
                    C ||
                    (!s.trim() && !o) ||
                    (m && !s.trim())
                  )
                    return;
                  if (void 0 !== i && !(0, I.Ge)(i)) {
                    let e = d.some((e) => "image" === e.type),
                      t = "create-ui" === S || !!k,
                      n = e ? (0, I.$G)(i) : t ? (0, I.ik)(i) : null;
                    if (n)
                      return (
                        P(n),
                        $(n),
                        _(e ? I.QP : I.yj),
                        z(new Date().toISOString()),
                        F(null),
                        D(null),
                        N.oR.error(n),
                        { keepInput: !0 }
                      );
                  }
                  if (((w.current = !0), !e)) {
                    ((w.current = !1),
                      console.error(
                        "No chat ID available - cannot send message",
                      ),
                      P("No chat available. Please try refreshing the page."),
                      z(new Date().toISOString()));
                    return;
                  }
                  let en = !1;
                  (ex || (en = !0), v(!0), K(!1), ej(!1), W(!1), eu(), u(!0));
                  let ea = "";
                  if (p && p.length > 0) {
                    try {
                      (0, b.Ps)();
                    } catch (e) {
                      console.error(
                        "[useAIExecution] Failed to track file tagged event:",
                        e,
                      );
                    }
                    let e = p.map((e) => {
                      let t = e.file,
                        n = `File: ${t.path}
`;
                      return (
                        n +
                        `Type: ${t.robloxClass}
UniqueID: ${t.uniqueId}`
                      );
                    });
                    e.length > 0 &&
                      (ea = `<user_tagged_files>
**The user explicitly tagged these files with @ mentions - they are pointing you to the relevant code.**

Focus your investigation on these files FIRST. The user is telling you exactly where to look.
- Read these files before exploring elsewhere
- These files likely contain the code relevant to the user's request
- Avoid broad codebase searches if the answer is in these files

${e.join("\n\n---\n\n")}
</user_tagged_files>

`);
                  }
                  if (s.trim().length > 2e4) {
                    ((w.current = !1),
                      v(!1),
                      P(
                        "Your message is too long and could use up a lot of credits. Please shorten it and try again.",
                      ),
                      $(
                        "If the error is repeating, just include a few occurrences.",
                      ),
                      z(new Date().toISOString()));
                    return;
                  }
                  let es = q(M?.trim() || s.trim(), o, d),
                    ei = q((x || "") + ea + s.trim(), o, d),
                    eo = "/api/agent",
                    el = null;
                  try {
                    el = await em();
                  } catch (e) {
                    console.error("[useAIExecution] Failed to refresh auth", e);
                  }
                  if (!el)
                    return (
                      (w.current = !1),
                      v(!1),
                      P(
                        "Your session has expired. Please refresh the page to sign in again.",
                      ),
                      _("unauthorized"),
                      z(new Date().toISOString()),
                      D(401),
                      F(eo),
                      { keepInput: !0 }
                    );
                  let ed = null;
                  try {
                    let t = new j.ConvexHttpClient(
                        "https://beaming-hawk-976.convex.cloud",
                      ),
                      n = await g({ template: "convex" });
                    (n && t.setAuth(n),
                      (ed = await t.mutation(
                        a.FH.agentMemory.mutations.addMessage,
                        {
                          chatId: e || "",
                          message: JSON.stringify({
                            type: "human",
                            data: { content: es },
                          }),
                          role: "human",
                        },
                      )));
                  } catch (e) {
                    (console.error(
                      "[useAIExecution] Failed to load existing messages or persist human message",
                      e,
                    ),
                      (w.current = !1),
                      v(!1),
                      P("Failed to save message. Please try again."),
                      z(new Date().toISOString()));
                    return;
                  }
                  (er({ id: `msg_${Date.now()}`, originalInput: s.trim() }),
                    r());
                  let eg = new AbortController(),
                    ef = { id: ++X.current, requestStartedAt: 0 };
                  ((Z.current = eg),
                    (ee.current = ef),
                    (et.current = null),
                    Y(!1));
                  try {
                    if ((eu(), !L?.analyticsPromptOrigin))
                      try {
                        (0, b.v8)();
                      } catch (e) {
                        console.error(
                          "[useAIExecution] markNextPromptMilestone error:",
                          e,
                        );
                      }
                    ((eN.current = k ? { templateName: k.templateName } : null),
                      (eI.current = ed),
                      (eC.current = S ?? null),
                      (eS.current = E ?? null),
                      (eA.current = !!T),
                      (eP.current = !!L?.disablePublicPrompt),
                      (eM.current = !!L?.disablePlaytest),
                      (e_.current = !!L?.forceCapturePlaytestGif),
                      (ef.requestStartedAt = Date.now()));
                    let r = fetch(eo, {
                      method: "POST",
                      headers: el,
                      body: JSON.stringify({
                        message: ei,
                        projectId: t,
                        chatId: e,
                        userId: n,
                        humanMessageId: ed,
                        sessionId: ex,
                        model: Q,
                        requestId: crypto.randomUUID(),
                        ...(L?.persistModel === !1 && { persistModel: !1 }),
                        ...(L?.autonomousRun && { autonomousRun: !0 }),
                        ...(L?.autonomousSourceMessageId && {
                          autonomousSourceMessageId:
                            L.autonomousSourceMessageId,
                        }),
                        ...(L?.analyticsPromptOrigin && {
                          promptOrigin: L.analyticsPromptOrigin,
                        }),
                        ...(L?.taskSuggestionOrigin && {
                          taskSuggestionOrigin: L.taskSuggestionOrigin,
                        }),
                        ...(k && {
                          selectedUI: { templateName: k.templateName },
                        }),
                        ...(S && { mode: S }),
                        ...(E && { themeName: E }),
                        ...(A && { enableRunCode: !0 }),
                        ...(T && { disableSuggestions: !0 }),
                        ...(U && { autoApprove: !0 }),
                        ...(c &&
                          (L?.forceCapturePlaytestGif ||
                            !L?.disablePublicPrompt) && {
                            capturePlaytestGif: !0,
                          }),
                        ...((h || L?.disablePlaytest) && {
                          disablePlaytest: !0,
                        }),
                      }),
                      signal: eg.signal,
                    });
                    if ((O?.(), K(!0), (G = await r), Z.current !== eg)) return;
                    if (!G.ok) {
                      if (409 === G.status) {
                        let e = await G.clone()
                          .json()
                          .catch(() => ({}));
                        if ("agent_already_running" === e.errorCode) {
                          let t = L?.analyticsPromptOrigin
                            ? H({ status: G.status, errorCode: e.errorCode }, 0)
                            : null;
                          return (
                            ed && eE(ed),
                            null === t &&
                              (e.activeSessionId &&
                                (ec.current = e.activeSessionId),
                              (V = !0),
                              v(!0),
                              K(!0)),
                            P(
                              null === t
                                ? "A previous request is still running. Click stop to cancel it, then try again."
                                : "A previous request is still finishing. Retrying this queued task automatically.",
                            ),
                            _("agent_already_running"),
                            z(new Date().toISOString()),
                            {
                              keepInput: !0,
                              ...(null !== t && { retryAfterMs: t }),
                            }
                          );
                        }
                        if ("task_suggestion_unavailable" === e.errorCode)
                          return (
                            ed && (await eE(ed)),
                            await ep(G, "send", eo),
                            { keepInput: !0 }
                          );
                      }
                      let e = await G.clone()
                          .json()
                          .catch(() => ({})),
                        t = e.errorCode === I.QP || e.errorCode === I.yj,
                        n = "task_suggestion_claim_failed" === e.errorCode,
                        r = e.errorCode === y,
                        a = R(e.errorCode),
                        s = L?.analyticsPromptOrigin
                          ? H(
                              {
                                status: G.status,
                                errorCode: e.errorCode ?? e.error,
                                rolledBack: e.rolledBack,
                                retryAfterSeconds: e.retryAfterSeconds,
                              },
                              0,
                            )
                          : null;
                      if (
                        ((t || n || r || a || null !== s) &&
                          ed &&
                          (await eE(ed)),
                        await ep(G, "send", eo))
                      )
                        return t || n || r || a || null !== s
                          ? {
                              keepInput: !0,
                              ...(null !== s && { retryAfterMs: s }),
                            }
                          : void 0;
                    }
                    let a = await B(G);
                    if (
                      ((!0 === a.duplicate || !1 !== a.success) && J?.(),
                      a.imageOutdated &&
                        N.oR.info(
                          "A new Lemonade update is available. Please refresh the page when convenient to update.",
                        ),
                      a.duplicate)
                    )
                      return (
                        console.warn(
                          "[useAIExecution] Duplicate request detected (HTTP/2 replay). Original request still in-flight.",
                        ),
                        { accepted: !0 }
                      );
                    if (
                      (console.log("[useAIExecution] Response received:", {
                        sessionId: a.sessionId,
                        interrupted: a.interrupted,
                        hasInterruptData: !!a.interruptData,
                      }),
                      a.sessionId &&
                        (console.log(
                          "[useAIExecution] Setting sessionId:",
                          a.sessionId,
                        ),
                        eL(a.sessionId),
                        en
                          ? console.log(
                              "[useAIExecution] Setting planSessionId for first message:",
                              a.sessionId,
                            )
                          : console.log(
                              "[useAIExecution] Not setting planSessionId for non-first message:",
                              a.sessionId,
                            )),
                      a.interrupted && a.interruptData)
                    )
                      return (
                        console.log("[useAIExecution] Interrupt received", {
                          graphId: a.interruptData.graphId,
                          playtestStep: a.interruptData.playtestStep,
                          question: a.interruptData.question,
                        }),
                        ej(!1),
                        eb(!0),
                        ev(a.interruptData),
                        v(!1),
                        { accepted: !0 }
                      );
                    if (
                      !0 === a.planningCompleted ||
                      a.interruptData?.planStatus === "pending"
                    )
                      return (
                        console.log(
                          "[useAIExecution] Planning-only response (plan not yet executed)",
                        ),
                        { planningOnly: !0 }
                      );
                    if (a.needsContinue)
                      return (
                        ej(!0),
                        ek(a.graphId || "agent"),
                        v(!1),
                        {
                          needsContinue: !0,
                          ...(a.sessionId && { sessionId: a.sessionId }),
                        }
                      );
                    return (
                      a.success &&
                        a.result &&
                        console.log(
                          "[useAIExecution] Execution completed successfully",
                        ),
                      a.metadata?.createdUI &&
                        l &&
                        (console.log(
                          "[useAIExecution] Auto-selecting created UI:",
                          a.metadata.createdUI.templateName,
                        ),
                        l(a.metadata.createdUI)),
                      eu(),
                      er(null),
                      { completed: !0 }
                    );
                  } catch (e) {
                    eh(e, "send", { apiEndpoint: eo, prompt: s, response: G });
                  } finally {
                    Z.current === eg &&
                      ((Z.current = null),
                      V ||
                        (ee.current?.id === ef.id && (ee.current = null),
                        (w.current = !1),
                        v(!1),
                        K(!1)),
                      er(null));
                  }
                },
                [f, C, e, t, n, ex, r, ey, eL, eu, i, em, l, c, h, eE],
              );
            return {
              isProcessing: f || (C && !G),
              canStopGeneration:
                !Q && !!(ex || ec.current) && (V || (!f && C && !G)),
              error: A,
              errorCode: M,
              userMessage: T,
              requestUrl: L,
              statusCode: U,
              errorTimestamp: O,
              wasCancelled: G,
              setError: P,
              currentProcessingMessage: en,
              newAgentSessionId: ex,
              isWaitingForHuman: ef,
              interruptData: ey,
              canContinue: ew,
              forceCanContinue: eT,
              clearCanContinue: eR,
              handleContinue: eD,
              handleSendWithContext: ez,
              handleStopGeneration: eO,
              handleHumanReview: eU,
              handleHumanReviewWithIds: eF,
              rateLimitInfo: ea,
              setRateLimitInfo: es,
              freeModelResetAt: ei,
              codexRetryAfterSeconds: el,
            };
          })({
            currentChatId: e9,
            projectId: i,
            clerkUserIdFromAuth: c || null,
            scrollToBottom: rP,
            selectedModel: tB?.useOpenRouter ? eW : void 0,
            generatingSince: t$?.generatingSince,
            autoPlaytestEnabled: S?.autoPlaytestEnabled ?? !0,
            captureGifEnabled: S?.captureGifEnabled ?? !0,
            onCreatedUI: (0, x.hb)((e) => {
              nx({
                templateName: e.templateName,
                scriptName: e.scriptName,
                scriptUniqueId: e.scriptUniqueId,
                templateUniqueId: e.templateUniqueId,
              });
            }, []),
          }),
          af = (0, x.li)(!1);
        (0, x.vJ)(() => {
          (af.current && !r_ && requestAnimationFrame(() => rP()),
            (af.current = r_));
        }, [r_, rP]);
        let ab = (0, x.li)(t$?.generatingSince);
        (0, x.vJ)(() => {
          let e = ab.current,
            t = t$?.generatingSince;
          ((ab.current = t),
            e && !t && t$?.creationMode !== "remix" && nU && rY());
        }, [t$?.generatingSince, t$?.creationMode, nU]);
        let ay = (0, x.Kr)(() => {
            if (0 === rk.length) return !1;
            let e = [...rk].reverse().find((e) => "user" !== e.role);
            if (e?.additional_kwargs?.cancelled === !0) return !0;
            if (!e?.text) return !1;
            let t = e.text.toLowerCase();
            return (
              t.includes("aborted by user") || t.includes("cancelled by user")
            );
          }, [rk]),
          av = rO || ay;
        (0, x.vJ)(() => {
          if (r_ || !t1?.length) return;
          let e = [...t1].reverse().find((e) => "assistant" === e.role);
          if (!e) return;
          let t = (e) => e.includes("Task reached max turns limit"),
            n = !1;
          try {
            let r = JSON.parse(e.message),
              a = "string" == typeof r ? r : r?.content || r?.text || "";
            n = "string" == typeof a && t(a);
          } catch {
            n = "string" == typeof e.message && t(e.message);
          }
          if (ad) {
            n ||
              (console.log(
                "[AIChat] Convex fallback: max-turns message superseded, clearing Continue button",
              ),
              au());
            return;
          }
          !(Date.now() - e._creationTime > 12e4) &&
            n &&
            (console.log(
              "[AIChat] Convex fallback: detected max turns message, showing Continue button",
            ),
            ac());
        }, [r_, ad, t1, ac, au]);
        let {
            isApprovingPlan: aw,
            handlePlanApprove: aj,
            handlePlanReject: ak,
            handlePlanEdit: aN,
            handlePlaytestContinue: aI,
            handlePlaytestRefine: aC,
          } = (function ({
            handleHumanReview: e,
            handleHumanReviewWithIds: t,
            clearAllContextTabs: n,
          }) {
            let [r, a] = (0, e0.J0)(!1),
              [s, i] = (0, e0.J0)(!1),
              [o, l] = (0, e0.J0)(""),
              d = (0, e0.hb)(
                async (s) => {
                  if (!r) {
                    a(!0);
                    try {
                      (n(),
                        s?.threadId && s?.runId
                          ? await t(
                              "approve",
                              void 0,
                              s.threadId,
                              s.runId,
                              s.graphId,
                            )
                          : await e("approve"));
                    } finally {
                      a(!1);
                    }
                  }
                },
                [e, t, n, r],
              ),
              c = (0, e0.hb)(
                async (s) => {
                  if (!r) {
                    a(!0);
                    try {
                      (n(),
                        s?.threadId && s?.runId
                          ? await t("reject", void 0, s.threadId, s.runId)
                          : await e("reject"));
                    } finally {
                      a(!1);
                    }
                  }
                },
                [e, t, n, r],
              ),
              u = (0, e0.hb)(
                async (s, i) => {
                  if (!r) {
                    a(!0);
                    try {
                      (n(),
                        i?.threadId && i?.runId
                          ? await t("feedback", s, i.threadId, i.runId)
                          : await e("feedback", s));
                    } finally {
                      a(!1);
                    }
                  }
                },
                [e, t, n, r],
              ),
              m = (0, e0.hb)(async () => {
                let e = o.trim();
                e && (await t("refine", e), l(""), i(!1));
              }, [o, t]),
              p = (0, e0.hb)(() => {
                (i(!1), l(""));
              }, []);
            return {
              isApprovingPlan: r,
              showPlaytestNotes: s,
              playtestNotes: o,
              setShowPlaytestNotes: i,
              setPlaytestNotes: l,
              handlePlanApprove: d,
              handlePlanReject: c,
              handlePlanEdit: u,
              handlePlaytestSubmit: m,
              handlePlaytestCancel: p,
              handlePlaytestContinue: (0, e0.hb)(
                async (e) => {
                  if (
                    (console.log(
                      "\uD83C\uDFAE [useHITL] handlePlaytestContinue called",
                      {
                        playtestData: e,
                        hasThreadId: !!e?.threadId,
                        hasRunId: !!e?.runId,
                        graphId: e?.graphId,
                        timestamp: new Date().toISOString(),
                      },
                    ),
                    !e?.threadId || !e?.runId)
                  )
                    return void console.error(
                      "\uD83C\uDFAE [useHITL] handlePlaytestContinue - Missing threadId or runId",
                      { threadId: e?.threadId, runId: e?.runId },
                    );
                  (console.log(
                    "\uD83C\uDFAE [useHITL] handlePlaytestContinue - Calling handleHumanReviewWithIds",
                  ),
                    await t("continue", "", e.threadId, e.runId, e.graphId),
                    console.log(
                      "\uD83C\uDFAE [useHITL] handlePlaytestContinue - Completed",
                    ));
                },
                [t],
              ),
              handlePlaytestRefine: (0, e0.hb)(
                async (e, n) => {
                  if (
                    (console.log(
                      "\uD83C\uDFAE [useHITL] handlePlaytestRefine called",
                      {
                        feedback: e?.slice(0, 100),
                        playtestData: n,
                        hasThreadId: !!n?.threadId,
                        hasRunId: !!n?.runId,
                        hasFeedback: !!e?.trim(),
                        graphId: n?.graphId,
                        timestamp: new Date().toISOString(),
                      },
                    ),
                    !n?.threadId || !n?.runId || !e.trim())
                  )
                    return void console.error(
                      "\uD83C\uDFAE [useHITL] handlePlaytestRefine - Missing required data",
                      {
                        threadId: n?.threadId,
                        runId: n?.runId,
                        feedbackLength: e?.length,
                        hasFeedbackTrim: !!e?.trim(),
                      },
                    );
                  (console.log(
                    "\uD83C\uDFAE [useHITL] handlePlaytestRefine - Calling handleHumanReviewWithIds",
                  ),
                    await t("refine", e.trim(), n.threadId, n.runId, n.graphId),
                    console.log(
                      "\uD83C\uDFAE [useHITL] handlePlaytestRefine - Completed",
                    ));
                },
                [t],
              ),
            };
          })({
            handleHumanReview: ao,
            handleHumanReviewWithIds: al,
            clearAllContextTabs: e3,
          }),
          aS = r_ || aw,
          aA = tR.isConnected || (aS && "problem" === tR.status),
          aP = "problem" === tR.status && !aS;
        ((0, x.vJ)(() => {
          eT === i &&
            void 0 !== t$ &&
            !tR.isLoading &&
            t3(t$) &&
            (eR(null), aA || (eP(!0), e_(!0)));
        }, [aA, tR.isLoading, eT, t$, i]),
          (0, x.vJ)(() => {
            if (eA && !tR.isLoading && t3(t$)) {
              if (aA) return void eP(!1);
              e_(!0);
            }
          }, [aA, tR.isLoading, t$, eA]));
        let aM = (0, x.hb)(
            (e, t = "explore_toggle") => {
              ("explore" === e && "explore" !== nW && (0, b.ko)({ source: t }),
                nV(
                  (t) => (
                    "agent" === t && "explore" === e
                      ? nQ((e) =>
                          nP && !nT
                            ? "cards-leaderboard"
                            : "history" === e
                              ? null
                              : e,
                        )
                      : "explore" === t &&
                        "agent" === e &&
                        nQ((e) => ("cards-leaderboard" === e ? null : e)),
                    e
                  ),
                ),
                "agent" === e && requestAnimationFrame(() => rP()));
            },
            [rP, nP, nT, nW],
          ),
          a_ = (0, x.hb)(() => aM("explore", "reward_banner"), [aM]),
          aT = (0, x.li)(!1);
        (0, x.vJ)(() => {
          aT.current ||
            ((aT.current = !0),
            "explore" === nW &&
              (nP && !nT && nQ("cards-leaderboard"),
              (0, b.ko)({ source: "initial_load" })));
        }, []);
        let aR = (0, x.hb)((e) => rh(e), []),
          aE = (0, x.hb)((e) => {
            rh((t) => (t?.id === e ? null : t));
          }, []),
          a$ = (0, s.IT)(
            a.FH.userCredits.getCreditBalance,
            c ? { clerkUserId: c } : "skip",
          );
        ((0, x.vJ)(() => {
          if (!a$ || a$.oneTimeCredits > 0) return;
          let e = Math.min(
              3,
              Math.max(1, Math.ceil(Math.max(a$.creditsRemaining, 0))),
            ),
            t = eS.current;
          ((eS.current = e), null !== t && e !== t && (ek || eN(!0)));
        }, [a$, ek]),
          (0, x.vJ)(() => {
            ap && a$ && (eN(!0), ah(null));
          }, [ap, a$, ah]));
        let aL = (0, x.hb)(
            (e, t, n) => {
              e && e5("code", t, e, n);
            },
            [e5],
          ),
          aF = (0, x.hb)(
            () =>
              ng
                ? `[UI Context: ${ng.templateName}]
Template "${ng.templateName}" in ReplicatedStorage.UIs or ReplicatedStorage.UITemplates (uniqueId: ${ng.templateUniqueId || "unknown"})
LocalScript "${ng.scriptName}" in StarterPlayerScripts (uniqueId: ${ng.scriptUniqueId})
[End UI Context]

`
                : "",
            [ng],
          ),
          aU = (0, x.hb)(
            async (e = !1, t, n, r) => {
              var s, i;
              let o;
              (tU?.status === "completed" && tO(),
                tL &&
                  t$?.onboardingPlanStatus === "completed" &&
                  tq(rk[rk.length - 1]?.id));
              let l = !n?.textOnly,
                d = l ? e4() : null,
                c = l
                  ? n?.imageUrl
                    ? [
                        ...eX,
                        {
                          id: `image:${n.imageUrl.name}`,
                          type: "image",
                          name: n.imageUrl.name,
                          content: n.imageUrl.url,
                        },
                      ]
                    : [...eX]
                  : [],
                u = n?.input ?? ei,
                m = l ? rf : null,
                p = (function (e) {
                  for (let t = e.length - 1; t >= 0; t--) {
                    let n = e[t],
                      r = n.additional_kwargs?.taskSuggestions?.tasks;
                    if (Array.isArray(r) && r.length > 0) return n.id;
                  }
                  return null;
                })(rk),
                g = m ? m.taskSuggestions.tasks[m.selectedIndex] : void 0,
                x =
                  P &&
                  m?.chatId &&
                  m.chatId === rw.current &&
                  g &&
                  u === w(g).composerValue &&
                  p === m.messageId
                    ? {
                        messageId: m.messageId,
                        selectedIndex: m.selectedIndex,
                        task: g,
                      }
                    : void 0;
              if (
                !P &&
                m?.chatId &&
                m.chatId === rw.current &&
                g &&
                (rv((e) => ({ ...e, [m.messageId]: m.selectedIndex })),
                rb(null),
                p === m.messageId)
              ) {
                let e = nl();
                h({ template: "convex" })
                  .then(
                    (t) => (
                      t && e.setAuth(t),
                      e.mutation(
                        a.FH.agentMemory.mutations.markTaskSuggestionsConsumed,
                        {
                          chatId: m.chatId,
                          messageId: m.messageId,
                          selectedIndex: m.selectedIndex,
                          expectedTask: g,
                        },
                      )
                    ),
                  )
                  .catch((e) => {
                    console.error(
                      "[AIChat] Failed to mark legacy task suggestions consumed:",
                      e,
                    );
                  });
              }
              let f =
                  ((s = () => {
                    if (
                      m &&
                      x &&
                      (rv((e) => ({ ...e, [m.messageId]: m.selectedIndex })),
                      rb((e) =>
                        e?.messageId === m.messageId &&
                        e.selectedIndex === m.selectedIndex
                          ? null
                          : e,
                      ),
                      m.chatId)
                    ) {
                      let e = nl();
                      h({ template: "convex" })
                        .then(
                          (t) => (
                            t && e.setAuth(t),
                            e.mutation(
                              a.FH.agentMemory.mutations
                                .markTaskSuggestionsConsumed,
                              {
                                chatId: m.chatId,
                                messageId: m.messageId,
                                selectedIndex: m.selectedIndex,
                                expectedTask: x.task,
                              },
                            )
                          ),
                        )
                        .catch((e) => {
                          console.error(
                            "[AIChat] Failed to mark task suggestions consumed:",
                            e,
                          );
                        });
                    }
                  }),
                  (o = !1),
                  {
                    markAccepted: () => {
                      o || ((o = !0), s());
                    },
                    wasAccepted: () => o,
                  }),
                b =
                  (i = ng?.templateName) && u.includes(`@${i}`) && l
                    ? ng
                    : null,
                y = b ? aF() : "",
                v = l ? nX.filter((e) => u.includes(e.mentionText)) : [],
                j =
                  v.length > 0
                    ? `<user_tagged_mechanics>
The user tagged these mechanics from their game's memory map. Each @mention in the prompt refers to the entry below:

` +
                      v.map((e) => e.context).join("\n\n") +
                      `
</user_tagged_mechanics>

`
                    : "";
              l && e3();
              let k = !1;
              return as(
                n?.input ?? ei,
                d,
                c,
                e8,
                e,
                l ? t : void 0,
                j + y || void 0,
                b,
                void 0,
                n?.enableRunCode,
                n?.displayOverride,
                n?.disableSuggestions,
                void 0,
                x
                  ? { ...n?.sendOptions, taskSuggestionOrigin: x }
                  : n?.sendOptions,
                n?.autoApprovePlan,
                () => {
                  ((k = !0), r?.());
                },
                f.markAccepted,
              ).then(
                (e) => {
                  var t;
                  if (!k || (e && "keepInput" in e && e.keepInput))
                    return (
                      l && e1(eX),
                      e && "keepInput" in e ? e : { keepInput: !0 }
                    );
                  let n =
                    ((t = ng?.templateName), M ? null : t ? `@${t} ` : "");
                  return (null !== n && eo(n), e);
                },
                (e) => {
                  throw (l && e1(eX), e);
                },
              );
            },
            [
              ei,
              eX,
              h,
              e4,
              e3,
              e1,
              as,
              e8,
              eo,
              rf,
              rk,
              h,
              aF,
              nX,
              ng,
              tU?.status,
              tO,
              tL,
              t$?.onboardingPlanStatus,
              tq,
              M,
              P,
            ],
          ),
          aD = (0, x.hb)(
            (e = !1, t) => {
              var n;
              if (!M) return ("explore" === nW && aM("agent"), aU(e, t));
              if (null !== eO.current || tb()) return Promise.resolve();
              let r = ++eD.current;
              eO.current = r;
              let a = { attemptId: r, projectId: i, chatId: e9 };
              ((eH.current = a), "explore" === nW && aM("agent"));
              let s = ng ? `@${ng.templateName} ` : "",
                o = !1,
                l = () => {
                  rf &&
                    (function ({
                      task: e,
                      selectionChatId: t,
                      currentChatId: n,
                      composerInput: r,
                    }) {
                      return !!(e && t && t === n && r === w(e).composerValue);
                    })({
                      task: rf.taskSuggestions.tasks[rf.selectedIndex],
                      selectionChatId: rf.chatId,
                      currentChatId: rw.current,
                      composerInput: el.current,
                    }) &&
                    rb((e) => e ?? rf);
                };
              return (
                eo((e) => (e === ei ? s : e)),
                (n = el.current),
                (el.current = n === ei ? s : n),
                aU(e, t, void 0, () => {
                  o = !0;
                }).then(
                  async (e) => {
                    var t, n;
                    let r = e;
                    return (
                      tf() &&
                        tn(r) &&
                        (r = (await am({
                          auto: !0,
                          sessionId: r.sessionId,
                        })) ?? { accepted: !0 }),
                      eg({
                        ...a,
                        outcome:
                          r && "completed" in r && r.completed
                            ? "completed"
                            : "incomplete",
                      }),
                      (t = o),
                      (n = !!(r && "keepInput" in r && r.keepInput)),
                      (!t || n) && (nf(ei, s, "not_sent"), l()),
                      r
                    );
                  },
                  (e) => {
                    throw (
                      eg({ ...a, outcome: "incomplete" }),
                      o || (nf(ei, s, "not_sent"), l()),
                      e
                    );
                  },
                )
              );
            },
            [nW, aM, am, aU, tb, tf, ei, nf, e9, i, M, rf, ng],
          ),
          aO = (0, x.hb)(
            (e) => {
              let t = eB?.includes(eW) ? 0 : (0, I.k2)(eW),
                n = (0, I.uO)(eW) && null !== ag && ag > Date.now(),
                r = !!(
                  a$ &&
                  ((0, I.uO)(eW) ||
                    (a$.creditsRemaining > 0 && a$.creditsRemaining >= t))
                );
              return (function ({
                isAuthenticated: e,
                internalLimitReached: t,
                pluginConnected: n,
                modelAvailable: r,
                hasEnoughCredits: a,
                requiresHumanAction: s,
              }) {
                return s
                  ? "human_review_required"
                  : e
                    ? t
                      ? "internal_limit"
                      : n
                        ? r
                          ? a
                            ? null
                            : "credits_unavailable"
                          : "model_unavailable"
                        : "plugin_unavailable"
                    : "session_unavailable";
              })({
                isAuthenticated: !!(f && c && e9),
                internalLimitReached: Z.fC,
                pluginConnected: aA,
                modelAvailable: tB?.useOpenRouter === !1 || (0, I.fj)(eW, tW),
                hasEnoughCredits: "queued_manual" === e || (!n && r),
                requiresHumanAction:
                  ej || ni || aw || rz || ad || tQ?.planStatus === "pending",
              });
            },
            [
              tW,
              ad,
              c,
              ej,
              a$,
              e9,
              aA,
              tQ?.planStatus,
              ag,
              aw,
              f,
              ni,
              rz,
              eB,
              tB?.useOpenRouter,
              eW,
            ],
          ),
          az = (0, x.hb)(
            (e) =>
              void 0 !== tB &&
              (!tB.useOpenRouter || void 0 !== tG) &&
              ("queued_manual" === e || void 0 !== a$),
            [a$, tG, tB],
          ),
          aH = (0, x.hb)((e, t, n) => {
            (0, b.sx)("Retention: Prompt Queue Paused", {
              project_id: e.projectId,
              chat_id: e.chatId,
              reason: t,
              transition_source: n,
              queue_age_ms: Math.max(0, Date.now() - e.queuedAt),
            });
          }, []),
          aq = (0, x.hb)(
            (e, t, n) => {
              tj(e, t) && aH(e, t, n);
            },
            [tj, aH],
          ),
          aJ = (0, x.hb)(
            (e, t, n) => {
              tC(e, t) && aH(e, t, n);
            },
            [tC, aH],
          ),
          aB = (0, x.hb)(
            (e, t, n) => {
              tI(e, t) && aH(e, t, n);
            },
            [tI, aH],
          ),
          aG = (0, x.li)(null),
          [aW, aV] = (0, x.J0)(null),
          aK = (0, x.hb)((e) => {
            ((aG.current = e), aV(e?.id ?? null));
          }, []),
          aQ = (0, x.li)(new Set());
        (0, x.vJ)(() => {
          for (let e of td)
            "paused" !== e.status ||
              "restored" !== e.pauseReason ||
              aQ.current.has(e.id) ||
              (aQ.current.add(e.id), aH(e, "restored", "session_restore"));
        }, [td, aH]);
        let aY = (0, x.hb)(
            (e = !1) => {
              let t = ng ? `@${ng.templateName} ` : "";
              if (!M || !e9 || (!aS && !tp) || tm || !F(ei, t)) return;
              if (
                e ||
                ng ||
                rf ||
                eX.length > 0 ||
                nX.some((e) => ei.includes(e.mentionText))
              )
                return void N.oR.info(
                  "Queue next supports plain text only. Remove attached context or suggestions.",
                );
              let n = ei.trim();
              if (n.length > 2e4)
                return void N.oR.error(
                  "Shorten this prompt before adding it to the queue.",
                );
              let r = eH.current,
                a = tw({
                  input: n,
                  sourceManualAttemptId:
                    r?.projectId === i && r.chatId === e9 ? r.attemptId : null,
                });
              if (a) {
                ((el.current = t),
                  eo(t),
                  e8(!0),
                  requestAnimationFrame(() => e6.current?.focus()));
                try {
                  (0, b.v8)();
                } catch (e) {
                  console.error(
                    "[AIChat] Failed to mark queued prompt milestone",
                    e,
                  );
                }
                (0, b.sx)("Retention: Prompt Queued", {
                  project_id: i,
                  chat_id: e9,
                  prompt_length: n.length,
                  queue_position: tu + 1,
                  source_run:
                    null === a.sourceManualAttemptId ? "other" : "manual",
                  credit_disclosure_shown: !1,
                });
              }
            },
            [e8, e9, eX, tw, ei, aS, tm, tp, tu, M, i, ng, rf, nX, e6],
          ),
          aZ = (0, x.hb)(
            (e) => {
              aG.current?.id === e && aK(null);
              let t = tS(e);
              if (!t) return;
              let n = ng ? `@${ng.templateName} ` : "";
              if (F(el.current, n)) {
                let e = D(em.current, { input: el.current, reason: "swapped" });
                ((em.current = e), eu(e));
              }
              ((el.current = t.input),
                eo(t.input),
                O(t.input, ng?.templateName) && nx(null),
                requestAnimationFrame(() => {
                  (e8(), e6.current?.focus());
                }),
                (0, b.sx)("Retention: Queued Prompt Edited", {
                  project_id: i,
                  chat_id: t.chatId,
                }));
            },
            [e8, i, ng, aK, tS, e6],
          ),
          aX = (0, x.hb)(
            (e) => {
              aG.current?.id === e && aK(null);
              let t = tA(e);
              t &&
                (0, b.sx)("Retention: Queued Prompt Cancelled", {
                  project_id: i,
                  chat_id: t.chatId,
                  queue_age_ms: Math.max(0, Date.now() - t.queuedAt),
                });
            },
            [tA, i, aK],
          ),
          a0 = (0, x.hb)(
            (e) => {
              switch (e) {
                case "credits_unavailable":
                  (eN(!0),
                    N.oR.info(
                      "Add credits or choose an available model to send this prompt.",
                    ));
                  break;
                case "internal_limit":
                  N.oR.info(
                    "Prompting is temporarily unavailable. Try again later.",
                  );
                  break;
                case "plugin_unavailable":
                  (tE(),
                    N.oR.info(
                      "Reconnect Roblox Studio before sending this prompt.",
                    ));
                  break;
                case "session_unavailable":
                  N.oR.error(
                    "Refresh the page and sign in again before sending.",
                  );
                  break;
                case "model_unavailable":
                  N.oR.info(
                    "Choose an available model before sending this prompt.",
                  );
                  break;
                case "human_review_required":
                  N.oR.info(
                    "Finish the current review before sending this prompt.",
                  );
              }
            },
            [tE],
          ),
          a1 = (0, x.li)(null),
          a5 = (0, x.hb)(
            async (e, t) => {
              var n, r;
              if (!M) return;
              if (!th(e))
                return void aJ(
                  e,
                  "completion_unverified",
                  "dispatch_context_guard",
                );
              if (!tk(e)) return;
              let a = "queued_manual" === t ? ++eD.current : null;
              null !== a &&
                ((eO.current = a),
                (eH.current = {
                  attemptId: a,
                  projectId: e.projectId,
                  chatId: e.chatId,
                }));
              let s = !1;
              try {
                let a,
                  i = 0;
                for (;;) {
                  let n = !1,
                    r =
                      (a = await aU(
                        !1,
                        void 0,
                        {
                          input: e.input,
                          sendOptions: { analyticsPromptOrigin: t },
                          autoApprovePlan: !0,
                          textOnly: !0,
                        },
                        () => {
                          ((n = !0),
                            (s = !0),
                            0 === i &&
                              (0, b.sx)("Retention: Prompt Queue Dispatched", {
                                project_id: e.projectId,
                                chat_id: e.chatId,
                                dispatch_mode:
                                  "queued_auto" === t
                                    ? "automatic"
                                    : "send_now",
                                queue_age_ms: Math.max(
                                  0,
                                  Date.now() - e.queuedAt,
                                ),
                              }));
                        },
                      )) && "keepInput" in a
                        ? a.retryAfterMs
                        : void 0;
                  if (!n || void 0 === r || i >= 2 || a1.current === e.id)
                    break;
                  ((i += 1),
                    (0, b.sx)("Retention: Prompt Queue Retrying", {
                      project_id: e.projectId,
                      chat_id: e.chatId,
                      retry_attempt: i,
                      retry_delay_ms: r,
                    }),
                    await new Promise((e) => setTimeout(e, r * 2 ** (i - 1))));
                }
                if (
                  (s &&
                    tn(a) &&
                    (a = (await am({ auto: !0, sessionId: a.sessionId })) ?? {
                      accepted: !0,
                    }),
                  s &&
                    (n = a) &&
                    !("keepInput" in n) &&
                    (("completed" in n && n.completed) ||
                      ("planningOnly" in n && n.planningOnly) ||
                      ("accepted" in n && n.accepted) ||
                      ("needsContinue" in n && n.needsContinue)))
                ) {
                  if (tN(e, { outcome: "consumed" })) {
                    let t = tg(e.projectId, e.chatId)[0],
                      n = tr(a),
                      s = a1.current === e.id;
                    ((r = a), !s && tr(r) && t?.status === "queued" && th(t))
                      ? aK(t)
                      : t && s
                        ? aq(t, "stopped", "queued_turn_stop_requested")
                        : t && !n
                          ? aq(
                              t,
                              "current_build_incomplete",
                              "queued_turn_requires_human",
                            )
                          : t?.status === "queued" &&
                            aq(
                              t,
                              "completion_unverified",
                              "chained_context_changed",
                            );
                  }
                } else {
                  let n =
                    a1.current === e.id
                      ? "stopped"
                      : (aO(t) ?? "dispatch_rejected");
                  aB(e, n, "dispatch_result");
                }
              } catch (n) {
                let t = a1.current === e.id ? "stopped" : "network_error";
                (aB(e, t, "dispatch_error"),
                  console.error("[AIChat] Queued prompt dispatch failed", n));
              } finally {
                (a1.current === e.id && (a1.current = null),
                  null !== a && eO.current === a && (eO.current = null),
                  null !== a &&
                    eH.current?.attemptId === a &&
                    (eH.current = null));
              }
            },
            [tk, aO, tg, am, aU, aJ, aq, M, th, aB, aK, tN],
          ),
          a2 = (0, x.hb)(
            (e) => {
              let t = tx();
              if (
                !t ||
                t.id !== e ||
                !th(t) ||
                "restored" === t.pauseReason ||
                aS ||
                null !== eO.current
              )
                return;
              if ((aG.current?.id === t.id && aK(null), !az("queued_manual")))
                return void N.oR.info(
                  "Checking your connection. Try again in a moment.",
                );
              let n = aO("queued_manual");
              if (n) {
                (aq(t, n, "send_now_preflight"), a0(n));
                return;
              }
              ((0, b.sx)("Retention: Queued Prompt Send Now", {
                project_id: i,
                chat_id: t.chatId,
                queue_age_ms: Math.max(0, Date.now() - t.queuedAt),
              }),
                a5(t, "queued_manual"));
            },
            [a5, a0, aO, tx, aS, aq, i, az, th, aK],
          );
        ((0, x.vJ)(() => {
          if (!ep) return;
          let e = ep.chatId ? tg(ep.projectId, ep.chatId) : [],
            t = (function (e, t, n, r) {
              var a;
              let s = e[0];
              return s &&
                t.chatId &&
                s.projectId === t.projectId &&
                s.chatId === t.chatId &&
                ((a = t.attemptId),
                "queued" === s.status && s.sourceManualAttemptId === a)
                ? n !== t.projectId || r !== t.chatId
                  ? { action: "park", prompt: s }
                  : {
                      action: "completed" === t.outcome ? "dispatch" : "pause",
                      prompt: s,
                    }
                : { action: "ignore", prompt: null };
            })(e, ep, i, e9),
            n = () => {
              (ez.current === ep.attemptId && (ez.current = null),
                eH.current?.attemptId === ep.attemptId && (eH.current = null),
                eO.current === ep.attemptId && (eO.current = null),
                eg(null));
            };
          if ("ignore" === t.action) {
            if (
              (function ({
                outcome: e,
                ownerQueueCount: t,
                isAgentBusy: n,
                sourceAttempt: r,
              }) {
                return (
                  "completed" === e.outcome &&
                  0 === t &&
                  n &&
                  r?.attemptId === e.attemptId &&
                  r.projectId === e.projectId &&
                  r.chatId === e.chatId
                );
              })({
                outcome: ep,
                ownerQueueCount: e.length,
                isAgentBusy: aS,
                sourceAttempt: eH.current,
              })
            )
              return;
            n();
            return;
          }
          let r = t.prompt;
          if (ez.current === ep.attemptId) {
            (n(), aq(r, "stopped", "source_run_stop_requested"));
            return;
          }
          if ("park" === t.action) {
            (n(), aJ(r, "completion_unverified", "completion_context_guard"));
            return;
          }
          if ("pause" === t.action) {
            (n(),
              aq(
                r,
                aO("queued_auto") ?? "current_build_incomplete",
                "source_run_incomplete",
              ));
            return;
          }
          if (aS || !az("queued_auto")) return;
          n();
          let a = aO("queued_auto");
          if (a) return void aq(r, a, "auto_preflight");
          a5(r, "queued_auto");
        }, [a5, e9, aO, tg, aS, ep, aJ, aq, i, az]),
          (0, x.vJ)(() => {
            if (!aW) return;
            let e = aG.current;
            if (!e || e.id !== aW) return void aK(null);
            if (!th(e)) {
              let t = tg(e.projectId, e.chatId).find((t) => t.id === e.id);
              (aK(null),
                t?.status === "queued" &&
                  aq(t, "completion_unverified", "chained_context_changed"));
              return;
            }
            let t = tx();
            if (!t || t.id !== aW || "queued" !== t.status || !th(t))
              return void aK(null);
            if (aS || !az("queued_auto")) return;
            let n = aO("queued_auto");
            if ((aK(null), n)) return void aq(t, n, "chained_auto_preflight");
            a5(t, "queued_auto");
          }, [e9, a5, aW, aO, tg, tx, aS, aq, i, az, th, aK]));
        let a4 = (0, x.li)(aS);
        ((0, x.vJ)(() => {
          let e = a4.current;
          if (((a4.current = aS), !e || aS || tb())) return;
          let t = tx();
          t?.status === "queued" &&
            null === t.sourceManualAttemptId &&
            aG.current?.id !== t.id &&
            aq(t, "completion_unverified", "unverified_busy_transition");
        }, [tx, tb, aS, aq]),
          (0, x.vJ)(() => {
            var e;
            if (!e$ || eU.current || void 0 === S) return;
            if (!A.promptFirstPlayable) return void eL(null);
            if (!f || !e9 || !aA || aS) return;
            let t = eF.current,
              n = ng ? `@${ng.templateName} ` : "",
              r = ++eD.current,
              a = { attemptId: r, projectId: i, chatId: e9 },
              s = !1;
            ((eU.current = !0),
              (eO.current = r),
              (eH.current = a),
              eL(null),
              (eF.current = null),
              eo((e) => (e === e$ ? n : e)),
              (e = el.current),
              (el.current = e === e$ ? n : e),
              (0, b.sx)("Activation: Initial Prompt Auto-started", {
                project_id: i,
                prompt_length: e$.length,
              }),
              aU(
                !1,
                void 0,
                {
                  input: e$,
                  sendOptions: t
                    ? { modelOverride: t, persistModel: !0 }
                    : void 0,
                },
                () => {
                  s = !0;
                },
              ).then(
                (e) => {
                  var t, r;
                  (eg({
                    ...a,
                    outcome:
                      e && "completed" in e && e.completed
                        ? "completed"
                        : "incomplete",
                  }),
                    (t = s),
                    (r = !!(e && "keepInput" in e && e.keepInput)),
                    (!t || r) && nf(e$, n, "not_sent"));
                },
                (e) => {
                  (eg({ ...a, outcome: "incomplete" }),
                    console.error(
                      "[AIChat] Initial prompt auto-start failed:",
                      e,
                    ),
                    s || nf(e$, n, "not_sent"),
                    (0, b.sx)("Activation: Initial Prompt Auto-start Failed", {
                      project_id: i,
                    }),
                    N.oR.error("Your idea is ready. Press send to try again."));
                },
              ));
          }, [e$, nf, e9, aA, aU, aS, f, i, ng, A.promptFirstPlayable, S]));
        let a3 = (0, x.Kr)(() => {
            for (let e = rk.length - 1; e >= 0; e--) {
              let t = rk[e],
                n = t.additional_kwargs?.taskSuggestions?.tasks;
              if (n && 0 !== n.length)
                return (
                  t.additional_kwargs?.taskSuggestionsState?.consumed !== !0 &&
                  "number" != typeof ry[t.id]
                );
            }
            return !1;
          }, [rk, ry]),
          a6 = (function ({
            pluginConnected: e,
            isAgentBusy: t,
            hasEligibleSuggestions: n,
          }) {
            let r = (0, s.IT)(a.FH.autonomousAgent.getSettings, {}),
              i = (0, s.IT)(a.FH.autonomousAgent.getDailyUsage, {}),
              o = (0, s.n_)(a.FH.autonomousAgent.updateSettings),
              [l, d] = (0, x.J0)(!1),
              [c, u] = (0, x.J0)(5),
              [m, p] = (0, x.J0)(""),
              h = (0, x.li)(!1),
              g = r?.maxDailyLimit ?? 5,
              f = r?.isPaidTier ?? !1,
              b = i?.count ?? 0,
              y = i?.remaining ?? c,
              v = r?.nextAutonomousRunAt ?? null,
              w = (0, x.Kr)(() => r?.queuedTasks ?? [], [r]),
              [j, k] = (0, x.J0)(null);
            ((0, x.vJ)(() => {
              h.current ||
                void 0 === r ||
                ((h.current = !0),
                d(r.enabled),
                u(r.dailyLimit),
                p(r.editInstructions));
            }, [r]),
              (0, x.vJ)(() => {
                if (!l || null == v) return void k(null);
                let e = () => {
                  k(Math.max(0, v - Date.now()));
                };
                e();
                let t = setInterval(e, 1e3);
                return () => clearInterval(t);
              }, [l, v]));
            let [N, I] = (0, x.J0)(() => Date.now());
            (0, x.vJ)(() => {
              let e = setInterval(() => I(Date.now()), 6e4);
              return () => clearInterval(e);
            }, []);
            let C = (0, x.Kr)(() => {
                let e = new Date(N),
                  t = Math.max(
                    0,
                    Math.ceil(
                      (Date.UTC(
                        e.getUTCFullYear(),
                        e.getUTCMonth(),
                        e.getUTCDate() + 1,
                      ) -
                        N) /
                        6e4,
                    ),
                  ),
                  n = Math.floor(t / 60);
                return `${n}h ${t % 60}m`;
              }, [N]),
              S = (0, x.hb)(
                (e) => {
                  (d(e),
                    o({ enabled: e }).catch((e) =>
                      console.error(
                        "[useAutonomousAgent] updateSettings(enabled) failed:",
                        e,
                      ),
                    ));
                },
                [o],
              ),
              A = (0, x.hb)(
                (e) => {
                  (u(e),
                    o({ dailyLimit: e }).catch((e) =>
                      console.error(
                        "[useAutonomousAgent] updateSettings(dailyLimit) failed:",
                        e,
                      ),
                    ));
                },
                [o],
              ),
              P = (0, x.hb)(
                (e) => {
                  (p(e),
                    o({ editInstructions: e }).catch((e) =>
                      console.error(
                        "[useAutonomousAgent] updateSettings(editInstructions) failed:",
                        e,
                      ),
                    ));
                },
                [o],
              ),
              M = (0, x.Kr)(() => {
                if (!l) return "Agent disabled";
                if (!e) return "Connect Studio plugin to continue";
                if (t) return "Building…";
                if (y <= 0) return `Daily limit reached. Resets in ${C}`;
                if (!n && 0 === w.length) return "No suggestions to execute.";
                if (null != j && j > 0) {
                  if (j < 6e4) {
                    let e = Math.ceil(j / 1e3);
                    return `Starting in ${e} second${1 === e ? "" : "s"}...`;
                  }
                  let e = Math.ceil(j / 6e4);
                  return `Starting in ${e} minute${1 === e ? "" : "s"}...`;
                }
                return null != v ? "Starting..." : "Waiting for next tasks…";
              }, [l, e, t, y, n, w, j, v, C]);
            return {
              enabled: l,
              editInstructions: m,
              dailyLimit: c,
              maxDailyLimit: g,
              isPaidTier: f,
              dailyUsed: b,
              dailyRemaining: y,
              isRunning: t,
              statusLabel: M,
              resetsInLabel: C,
              countdownMs: l && !t ? j : null,
              queuedTasks: w,
              setEnabled: S,
              setDailyLimit: A,
              setEditInstructions: P,
            };
          })({
            pluginConnected: tR.isConnected,
            isAgentBusy: aS,
            hasEligibleSuggestions: a3,
          }),
          { setEditInstructions: a8, setEnabled: a7 } = a6,
          a9 = (0, s.y3)(a.FH.autonomousAgent.queueMechanicTasks),
          [se, st] = (0, x.J0)(0),
          [sn, sr] = (0, x.J0)(0),
          sa = (0, x.hb)(
            ({ mechanicId: e, mechanicTitle: t }) => {
              (a8(
                `Visually refine the "${t}" mechanic in a loop: particles, VFX, SFX, camera effects, lighting and shadows — small touches that add taste to how ${t} feels. Never change models, textures or module scripts, and no backend or logic-only work.`,
              ),
                a9({ projectId: i, mechanicId: e }).catch((e) =>
                  console.error("[AIChat] queueMechanicTasks failed:", e),
                ),
                S?.hasJoinedDiscord ? a7(!0) : sr((e) => e + 1),
                st((e) => e + 1));
            },
            [a8, a7, a9, i, S?.hasJoinedDiscord],
          ),
          ss = (0, x.Kr)(() => {
            let e = rk.filter(
                (e) => "user" === e.role && e.text.trim().length > 0,
              ),
              t = e.map((t, n) => ({
                id: t.id,
                text: t.text,
                status: aS && n === e.length - 1 ? "active" : "completed",
              })),
              n = a6.queuedTasks.filter((e) => e.projectId === i);
            if (n.length > 0) {
              for (let e of n)
                t.push({
                  id: `queued-${e.createdAt}`,
                  text: e.text,
                  status: "pending",
                });
              return t;
            }
            let r = "";
            if (a6.enabled && !aS)
              for (let e = rk.length - 1; e >= 0; e--) {
                let t = rk[e],
                  n = t.additional_kwargs?.taskSuggestions?.tasks;
                if (n && 0 !== n.length) {
                  if (
                    t.additional_kwargs?.taskSuggestionsState?.consumed ===
                      !0 ||
                    "number" == typeof ry[t.id]
                  )
                    break;
                  r = n[0] ?? "";
                  break;
                }
              }
            return (
              t.push({ id: "waiting-next", text: r, status: "pending" }),
              t
            );
          }, [rk, aS, a6.enabled, a6.queuedTasks, ry, i]),
          si = (0, x.Kr)(() => {
            let e = ss.find((e) => "active" === e.status);
            return e?.text.trim() ?? "";
          }, [ss]),
          {
            remixStepDone: so,
            handleStartCreation: sl,
            handleRemixContinue: sd,
            handleRemixRefine: sc,
          } = (function ({
            remixRoadmap: e,
            projectId: t,
            pluginConnected: n,
            currentChatId: r,
            handleSendWithContext: i,
            scrollToBottom: o,
            playCompletionSoundEnabled: l,
          }) {
            let d = (0, s.n_)(a.FH.remixRoadmaps.updateStepStatus),
              c = (0, s.n_)(a.FH.remixRoadmaps.advanceStep),
              u = (0, s.y3)(a.FH.remixRoadmaps.generateThumbnail),
              [m, p] = (0, k.J0)(!1),
              h = (0, k.li)(!1),
              g = (0, k.li)(!1);
            (0, k.vJ)(() => {
              e &&
                !e.gameThumbnailUrl &&
                !h.current &&
                Date.now() - e._creationTime > 6e4 &&
                ((h.current = !0),
                u({
                  roadmapId: e._id,
                  gameName: e.gameName,
                  mechanics: e.mechanics.map((e) => e.name),
                }).catch((e) => {
                  (console.error(
                    "[useRemixRoadmapFlow] Thumbnail generation failed:",
                    e,
                  ),
                    (h.current = !1));
                }));
            }, [e, u]);
            let x = (0, k.hb)(
                async (e) => {
                  let t = `Build the "${e.mechanicName}" mechanic for the game.

Details: ${e.mechanicInfo}`;
                  await i(!1, void 0, { input: t, disableSuggestions: !0 });
                },
                [i],
              ),
              f = (0, k.hb)(async () => {
                if (!e) return;
                p(!1);
                let n = e.steps.findIndex((e) => "pending" === e.status);
                if (-1 === n) return;
                let r = e.steps[n];
                (await d({ projectId: t, stepIndex: n, status: "current" }),
                  await x(r),
                  l && rY(),
                  p(!0));
              }, [e, t, d, x, l]);
            return (
              (0, k.vJ)(() => {
                n &&
                  r &&
                  e &&
                  "created" === e.status &&
                  !g.current &&
                  ((g.current = !0),
                  f().catch((e) => {
                    (console.error(
                      "[useRemixRoadmapFlow] Auto-start failed:",
                      e,
                    ),
                      (g.current = !1));
                  }));
              }, [n, r, e, f]),
              {
                remixStepDone: m,
                handleStartCreation: f,
                handleRemixContinue: (0, k.hb)(async () => {
                  if (!e) return;
                  (p(!1), o());
                  let { allDone: n, nextStepIndex: r } = await c({
                    projectId: t,
                  });
                  if (n) return;
                  let a = e.steps[r];
                  (await x(a), l && rY(), p(!0));
                }, [e, t, c, x, o, l]),
                handleRemixRefine: (0, k.hb)(
                  async (e) => {
                    e.trim() &&
                      (p(!1),
                      await i(!1, void 0, { input: e }),
                      l && rY(),
                      p(!0));
                  },
                  [i, l],
                ),
              }
            );
          })({
            remixRoadmap: tU,
            projectId: i,
            pluginConnected: tR.isConnected,
            currentChatId: e9,
            handleSendWithContext: aU,
            scrollToBottom: rP,
            playCompletionSoundEnabled: nU,
          }),
          {
            stepDone: su,
            handleStartCreation: sm,
            handleContinue: sp,
            handleRefine: sh,
            stopSequence: sg,
          } = (function ({
            plan: e,
            projectId: t,
            pluginConnected: n,
            currentChatId: r,
            planStatus: i,
            currentTaskIndex: l,
            awaitingReviewIndex: d,
            isAgentBusy: c,
            chatMessages: u,
            handleSendWithContext: m,
            scrollToBottom: p,
            playCompletionSoundEnabled: h,
            onTaskModelFlip: g,
          }) {
            let x = (0, s.n_)(a.FH.projects.claimStartOnboardingPlan),
              f = (0, s.n_)(a.FH.projects.updateOnboardingData),
              y = (0, s.n_)(a.FH.projects.setOnboardingTaskAwaitingReview),
              v = (0, s.n_)(a.FH.projects.acceptOnboardingTaskOne),
              w = (0, s.n_)(
                a.FH.projects.completeOnboardingCurrentTaskAndAdvance,
              ),
              j = (0, o.useRef)(!1),
              k = (0, o.useRef)(!1),
              N = (0, o.useRef)(!1),
              I = (0, o.useRef)(!1),
              C = (0, o.useRef)(new Set()),
              S = (0, o.useRef)(new Set()),
              A = (0, o.useRef)(!1),
              P =
                e?.favoriteGame.name && e.favoriteGame.name.length > 0
                  ? e.favoriteGame.name
                  : "",
              M = (0, o.useCallback)(
                (t) => {
                  if (!e) return "";
                  let n = (0, rZ.x6)(e, t);
                  return (
                    n ||
                    (0 === t
                      ? (0, rZ.KA)(e.gameName, P)
                      : `Build this task for my simple game called ${e.gameName}: ${e.tasks[t]}`)
                  );
                },
                [e, P],
              ),
              _ = (0, o.useCallback)((t) => (e ? (0, rZ.rK)(e, t) : ""), [e]),
              T = (0, s.IT)(
                a.FH.agentMemory.queries.hasAssistantReplyToLatestPrompt,
                e && r && "in_progress" === i && (l ?? -1) >= 1
                  ? { chatId: r, promptText: (0, rZ.rK)(e, l) }
                  : "skip",
              ),
              R = (0, o.useCallback)(
                (e) => {
                  let t = e.trim();
                  if (!t) return !1;
                  let n = -1;
                  for (let e = u.length - 1; e >= 0; e--) {
                    let r = u[e];
                    if ("user" === r.role && r.text.trim() === t) {
                      n = e;
                      break;
                    }
                  }
                  if (-1 === n) return !1;
                  for (let e = n + 1; e < u.length; e++) {
                    let t = u[e];
                    if ("assistant" === t.role && t.text.trim().length > 0)
                      return !0;
                  }
                  return !1;
                },
                [u],
              ),
              E = (0, o.useCallback)(() => {
                e &&
                  !A.current &&
                  ((A.current = !0),
                  (0, b.nt)({
                    projectId: t,
                    favoriteGameName: e.favoriteGame.name,
                    favoriteGameUniverseId: e.favoriteGame.universeId,
                    createdGameName: e.gameName,
                    taskCount: e.tasks.length,
                  }));
              }, [e, t]),
              $ = (0, o.useCallback)(async () => {
                let n;
                if (!e) return;
                let r = e.tasks.slice(1);
                if (0 === r.length) n = e.taskPrompts ?? [];
                else {
                  let t = await r0({
                      tasks: r,
                      gameName: e.gameName,
                      favoriteGameName: P,
                      genre: e.genre,
                      universeId: e.favoriteGame.universeId,
                    }),
                    a = e.taskPrompts ?? [],
                    s = (n = e.tasks.map((n, r) => {
                      if (0 === r)
                        return (
                          a[0] ?? {
                            title: n,
                            prompt: (0, rZ.KA)(e.gameName, P),
                            kind: "loading_screen",
                          }
                        );
                      let s = t[r - 1];
                      return s && s.prompt.trim().length > 0
                        ? {
                            title: n,
                            prompt: s.prompt.trim(),
                            kind: "mechanic",
                            promptVersion: "roblox_mechanic_scaffold_v1",
                          }
                        : (a[r] ?? {
                            title: n,
                            prompt: rX(e.gameName, n),
                            kind: "mechanic",
                          });
                    }))[rZ.kc];
                  s &&
                    (n[rZ.kc] = {
                      ...s,
                      prompt: `${s.prompt}

${(0, rZ.u_)(e.gameName)}`,
                    });
                }
                let a = { ...e, taskPrompts: n, mechanicsRefined: !0 };
                await f({
                  projectId: t,
                  onboardingFinalPlan: JSON.stringify(a),
                  onboardingFavoriteGame: P,
                });
              }, [e, P, f, t]),
              L = (0, o.useCallback)(async () => {
                if (!e) return;
                (r1(t), g(r5.modelOverride));
                let n = await m(!1, void 0, {
                  input:
                    M(0) + " Build this directly without proposing a plan.",
                  displayOverride: (0, rZ.XF)(e.favoriteGame.universeId)
                    ? (0, rZ.hL)(e.gameName)
                    : (0, rZ.gJ)(e.gameName, P),
                  disableSuggestions: !0,
                  autoApprovePlan: !0,
                  sendOptions: r5,
                });
                n &&
                  "completed" in n &&
                  n.completed &&
                  (h && rY(), await y({ projectId: t, awaiting: !0 }));
              }, [e, m, M, h, y, g, t]),
              F = (0, o.useCallback)(
                async (n) => {
                  if (e && !k.current) {
                    k.current = !0;
                    try {
                      let r = n;
                      for (; r >= 1 && r < e.tasks.length && !I.current;) {
                        (C.current.add(r), p());
                        let n = r3.has(r) ? r4 : r2,
                          a = (0, rZ.XF)(e.favoriteGame.universeId)
                            ? r5.modelOverride
                            : n.modelOverride,
                          s = { ...n, modelOverride: a };
                        g(a);
                        let i = await m(!1, void 0, {
                          input: M(r),
                          displayOverride: _(r),
                          disableSuggestions: !0,
                          autoApprovePlan: !0,
                          sendOptions: s,
                        });
                        if (
                          I.current ||
                          !(i && "completed" in i && i.completed)
                        )
                          break;
                        if ((h && rY(), 1 === r)) {
                          (S.current.add(r),
                            await y({ projectId: t, awaiting: !0 }));
                          break;
                        }
                        let { allDone: o, nextTaskIndex: l } = await w({
                          projectId: t,
                        });
                        if ((o && E(), o || l < 1)) break;
                        r = l;
                      }
                    } finally {
                      k.current = !1;
                    }
                  }
                },
                [e, p, m, M, _, h, y, w, E, g, t],
              ),
              U = (0, o.useCallback)(() => {
                I.current = !0;
              }, []),
              D = (0, o.useCallback)(async () => {
                if (!e) return;
                I.current = !1;
                let { claimed: n } = await x({ projectId: t });
                n && (await L());
              }, [e, x, t, L]);
            ((0, o.useEffect)(() => {
              n &&
                r &&
                e &&
                "in_progress" !== i &&
                "completed" !== i &&
                !j.current &&
                ((j.current = !0),
                D().catch((e) => {
                  (console.error(
                    "[useOnboardingPlanFlow] Auto-start failed:",
                    e,
                  ),
                    (j.current = !1));
                }));
            }, [n, r, e, i, D]),
              (0, o.useEffect)(() => {
                e &&
                  e.version >= 2 &&
                  !1 === e.mechanicsRefined &&
                  "in_progress" === i &&
                  !N.current &&
                  ((N.current = !0),
                  $().catch((e) => {
                    console.error(
                      "[useOnboardingPlanFlow] Refinement failed:",
                      e,
                    );
                  }));
              }, [e, i, $]),
              (0, o.useEffect)(() => {
                if (
                  n &&
                  e &&
                  "in_progress" === i &&
                  (l ?? -1) >= 1 &&
                  0 !== d &&
                  1 !== d &&
                  !c &&
                  !k.current &&
                  !I.current
                ) {
                  if (!S.current.has(l) && (!0 === T || R(_(l))))
                    return (S.current.add(l), 1 === l)
                      ? void y({ projectId: t, awaiting: !0 }).catch((e) => {
                          (S.current.delete(l),
                            console.error(
                              "[useOnboardingPlanFlow] Resume review flag failed:",
                              e,
                            ));
                        })
                      : void w({ projectId: t })
                          .then(({ allDone: e }) => {
                            e && E();
                          })
                          .catch((e) => {
                            (S.current.delete(l),
                              console.error(
                                "[useOnboardingPlanFlow] Resume advance failed:",
                                e,
                              ));
                          });
                  C.current.has(l) ||
                    F(l).catch((e) => {
                      console.error(
                        "[useOnboardingPlanFlow] Resume failed:",
                        e,
                      );
                    });
                }
              }, [n, e, i, l, d, c, F, T, R, _, y, w, E, t]));
            let O = (0, o.useCallback)(async () => {
              if (!e) return;
              if (((I.current = !1), p(), 1 === d)) {
                let { allDone: e, nextTaskIndex: n } = await w({
                  projectId: t,
                });
                if ((e && E(), e || n < 1)) return;
                await F(n);
                return;
              }
              let { allDone: n, nextTaskIndex: r } = await v({ projectId: t });
              (n && E(), n || r < 1 || (await F(r)));
            }, [e, p, d, w, v, t, F, E]);
            return {
              stepDone: 0 === d || 1 === d,
              handleStartCreation: D,
              handleContinue: O,
              handleRefine: (0, o.useCallback)(
                async (n) => {
                  e &&
                    n.trim() &&
                    (await y({ projectId: t, awaiting: !1 }),
                    await m(!1, void 0, {
                      input: n,
                      disableSuggestions: !0,
                      autoApprovePlan: !0,
                      sendOptions: {
                        disablePublicPrompt: !0,
                        disablePlaytest: !0,
                      },
                    }),
                    h && rY(),
                    await y({ projectId: t, awaiting: !0 }));
                },
                [e, y, t, m, h],
              ),
              stopSequence: U,
            };
          })({
            plan: tL,
            projectId: i,
            pluginConnected: tR.isConnected,
            currentChatId: e9,
            planStatus: t$?.onboardingPlanStatus,
            currentTaskIndex: t$?.onboardingCurrentTaskIndex,
            awaitingReviewIndex: t$?.onboardingTaskAwaitingReviewIndex,
            isAgentBusy: aS,
            chatMessages: rS,
            handleSendWithContext: aU,
            scrollToBottom: rP,
            playCompletionSoundEnabled: nU,
            onTaskModelFlip: tT,
          }),
          sx = (0, x.hb)(() => {
            sg();
            let e = ng ? `@${ng.templateName} ` : "",
              t = eO.current,
              n = ty();
            (n ? (a1.current = n.id) : null !== t && (ez.current = t),
              ai((r) => {
                (null !== t && eO.current === t && (eO.current = null),
                  null !== t &&
                    eH.current?.attemptId === t &&
                    (eH.current = null),
                  (n && n.input === r) || nf(r, e, "stopped"));
              }, e8));
          }, [sg, ai, e8, nf, ty, ng]),
          sf = (0, x.hb)(
            async (e, t, n) => {
              try {
                if ((no(!0), !e9)) throw Error("No active chat");
                let e = await h();
                if (!e) {
                  window.location.href = "/sign-in";
                  return;
                }
                let r = await fetch("/api/rollback", {
                    method: "POST",
                    headers: {
                      "Content-Type": "application/json",
                      Authorization: `Bearer ${e}`,
                    },
                    body: JSON.stringify({
                      projectId: i,
                      messageId: t,
                      chatId: e9,
                    }),
                  }),
                  a = await r.text(),
                  s = r.headers
                    .get("content-type")
                    ?.includes("application/json")
                    ? JSON.parse(a)
                    : null;
                if (!r.ok) {
                  if (!s)
                    throw Error(
                      504 === r.status
                        ? "Rollback timed out (504)"
                        : `Rollback failed (${r.status})`,
                    );
                  throw Error(s.error || "Failed to undo changes");
                }
                (console.log("[AIChat] Rollback completed:", s),
                  n &&
                    (eo(n),
                    setTimeout(() => {
                      e6.current && (e6.current.focus(), e8());
                    }, 100)));
              } catch (e) {
                (console.error("[AIChat] Rollback failed:", e),
                  aa(
                    e instanceof Error ? e.message : "Failed to undo changes",
                  ));
              } finally {
                no(!1);
              }
            },
            [i, e9, no, aa, eo, e6, e8, h],
          ),
          sb = (0, x.hb)(() => {
            rA.current &&
              rA.current.scrollTo({
                top: rA.current.scrollHeight,
                behavior: "smooth",
              });
          }, [rA]),
          sy = t$?.onboardingTaskAwaitingReviewIndex,
          sv = (0, x.Kr)(() => {
            for (let e = rk.length - 1; e >= 0; e--)
              if ("user" === rk[e].role) return rk[e].id;
            return null;
          }, [rk]),
          sw = r_ && !su && !so,
          sj = !!tL && tz,
          sk = (0, x.Kr)(() => {
            if (!sj || !tH) return null;
            let e = rk.findIndex((e) => e.id === tH);
            return -1 === e ? null : (rk[e + 1]?.id ?? null);
          }, [sj, tH, rk]),
          sN = (!!tL || !!tU) && sw && !!sv && !sj,
          sI = (!!tL || !!tU) && !sN && !sj,
          sC =
            (!!tL && t$?.onboardingPlanStatus === "completed") ||
            (!!tU && "completed" === tU.status),
          sS = tL
            ? (0, r.jsxs)("div", {
                className: "conversation-block",
                children: [
                  !sC &&
                    (0, r.jsxs)("div", {
                      className: "flex items-center gap-1.5 mb-3",
                      children: [
                        (0, r.jsx)(ee.x, { size: 22 }),
                        (0, r.jsx)("span", {
                          className: "text-wordmark",
                          children: "Lemonade",
                        }),
                      ],
                    }),
                  (() => {
                    let e = (0, rZ.Je)({
                        taskCount: tL.tasks.length,
                        planStatus: t$?.onboardingPlanStatus,
                        currentTaskIndex: t$?.onboardingCurrentTaskIndex,
                        taskStatuses: t$?.onboardingTaskStatuses,
                      }),
                      t =
                        t$?.onboardingPlanStatus === "in_progress" ||
                        t$?.onboardingPlanStatus === "completed";
                    return (0, r.jsx)(rd, {
                      gameName: tL.gameName,
                      steps: tL.tasks.map((t, n) => {
                        let r = su && n === sy;
                        return {
                          id: String(n),
                          label: t,
                          completed: "completed" === e[n] || r,
                          isCurrent: "current" === e[n] && !r,
                        };
                      }),
                      laterSteps: tL.forLaterTasks.map(rZ.lO),
                      pluginConnected: aA,
                      startEnabled: tR.isConnected,
                      hasStarted: t,
                      onStartCreation: sm,
                      onContinue: sp,
                      onRefine: sh,
                      isAgentRunning: r_ && e.some((e) => "current" === e),
                      stepDone: su,
                      isCompleted: t$?.onboardingPlanStatus === "completed",
                    });
                  })(),
                ],
              })
            : tU
              ? (0, r.jsxs)("div", {
                  className: "conversation-block",
                  children: [
                    !sC &&
                      (0, r.jsxs)("div", {
                        className: "flex items-center gap-1.5 mb-3",
                        children: [
                          (0, r.jsx)(ee.x, { size: 22 }),
                          (0, r.jsx)("span", {
                            className: "text-wordmark",
                            children: "Lemonade",
                          }),
                        ],
                      }),
                    (0, r.jsx)(rd, {
                      gameName: tU.gameName,
                      steps: tU.steps.map((e, t) => ({
                        id: String(t),
                        label: e.mechanicName,
                        info: e.mechanicInfo,
                        completed: "completed" === e.status,
                        isCurrent: "current" === e.status,
                      })),
                      pluginConnected: aA,
                      gameThumbnailUrl: tU.gameThumbnailUrl,
                      startEnabled: !!tU.gameThumbnailUrl,
                      onStartCreation: sl,
                      onContinue: sd,
                      onRefine: sc,
                      isAgentRunning:
                        r_ && tU.steps.some((e) => "current" === e.status),
                      stepDone: so,
                      isCompleted: "completed" === tU.status,
                    }),
                  ],
                })
              : null,
          sA =
            n_ &&
            !nY &&
            "agent" === nW &&
            !t6 &&
            0 === rk.length &&
            !aS &&
            !tL &&
            !tU &&
            !rE,
          sP =
            !nS || (!n_ && (n6 || n7 || rn))
              ? null
              : (0, r.jsx)(ex.A, {
                  view: nW,
                  onChange: aM,
                  isGenerating: aS,
                  pluginConnected: aA,
                  pluginDisconnected: aP,
                  discordConnected: !!S?.hasJoinedDiscord,
                  onRemoveMechanic: (e) =>
                    eo(`Remove the recently added task "${e}"`),
                  autonomousController: a6,
                  autonomousTasks: ss,
                  showAutonomous: A.autonomousTasks,
                  openQueueRequest: se,
                  discordNudgeRequest: sn,
                  themePickerSlot:
                    i && !n_
                      ? (0, r.jsxs)(r.Fragment, {
                          children: [
                            (0, r.jsx)(ed, {
                              projectId: i,
                              variant: "labeled",
                            }),
                            er &&
                              (0, r.jsx)(eh, {
                                strength: S?.uiModelStrength,
                                creditsRemaining: a$?.creditsRemaining ?? 0,
                                variant: "labeled",
                              }),
                          ],
                        })
                      : void 0,
                  selectedUiTheme: ea,
                  uiPinApplies: eQ,
                  input: ei,
                  placement: n_ ? "header" : "composer",
                  className: n_ ? "min-w-0" : void 0,
                }),
          [sM, s_] = (0, x.J0)(null);
        return (0, r.jsxs)("div", {
          "data-chat-workspace": n_ || void 0,
          "data-chat-layout": n_ ? "sidebar" : void 0,
          className: (0, es.cn)(
            "h-screen w-full overflow-hidden",
            n_ ? "relative" : "flex",
          ),
          style: n_ ? { "--chat-sidebar-width": r7.BR } : void 0,
          children: [
            n_ &&
              (0, r.jsxs)("div", {
                className: (0, es.cn)(
                  "absolute inset-y-0 left-0 isolate transition-[right] duration-200 ease-out motion-reduce:transition-none",
                  "right-[var(--chat-sidebar-width)]",
                ),
                children: [
                  (0, r.jsx)(at, {
                    expanded: !0,
                    primarySurface: !0,
                    primaryModeControlHostId: l,
                    primaryOverlayPanelHostId: d,
                    onExpand: an,
                    onCollapse: an,
                    projectId: i,
                    projectName: e.projectName,
                    onTagMechanic: n1,
                    onAddSuggestion: n2,
                    pluginConnected: aA,
                    isAgentBusy: aS,
                    onSendToAutoTasks: A.autonomousTasks ? sa : void 0,
                  }),
                  (0, r.jsx)(ar, { hostId: l, children: sP }),
                  (0, r.jsx)(ar, {
                    hostId: d,
                    children: nZ
                      ? (0, r.jsx)("div", {
                          "data-gm-interactive": !0,
                          className:
                            "layer-overlay mt-3 ml-auto flex max-h-[min(26rem,calc(100dvh-8rem))] w-80 max-w-full overflow-hidden rounded-2xl bg-map-panel shadow-floating ring-1 ring-border/70",
                          children: (0, r.jsx)(rm.A, {
                            expanded: !0,
                            presentation: "map-overlay",
                            onExpand: () => nQ("cards-leaderboard"),
                            onCollapse: () => nQ(null),
                          }),
                        })
                      : null,
                  }),
                ],
              }),
            nI &&
              !n_ &&
              (0, r.jsx)(rH, {
                projectId: i,
                threads: ts,
                activeThreadId: e9,
                onSwitchThread: (e) => {
                  to(e);
                },
                onCreateNewThread: t_,
                onRenameThread: tl,
                historyLoading: r_ || aw,
                searchQuery: T,
                onSearchChange: $,
                existingUITemplates: et,
                selectedUI: ng,
                onSelectUI: nx,
                input: ei,
                onInputChange: eo,
                textareaRef: e6,
                isAgentBusy: aS,
                addUISectionRef: L,
                expandedPanel: nK,
                onExpandedPanelChange: nQ,
                showCardsLeaderboard: nP,
                showGameMemory: nM,
                onTagMechanic: n1,
                onAddSuggestion: n2,
                pluginConnected: aA,
                onSendToAutoTasks: A.autonomousTasks ? sa : void 0,
                autoPlaytestEnabled: nR,
                captureGifEnabled: nL,
                publicPromptsEnabled: nF,
                playCompletionSoundEnabled: nU,
                slotMachineEnabled: nD,
                onUpdatePlaytestPrefs: nH,
                lowCostUiModeEnabled: S?.lowCostUiMode === !0,
                onLowCostUiModeChange: A.lowCostUiMode ? nJ : void 0,
              }),
            (0, r.jsxs)("div", {
              role: n_ ? "complementary" : void 0,
              "aria-label": n_ ? "Chat" : void 0,
              className: (0, es.cn)(
                "relative flex flex-1 flex-col overflow-hidden",
                !n_ && "px-4 pt-6 md:px-12",
                !nI && "lg:pl-12 lg:pr-48",
                n_ &&
                  "layer-overlay absolute inset-y-0 right-0 h-full w-[var(--chat-sidebar-width)] border-l border-border/70 bg-map-panel px-4 pb-6 pt-2 shadow-[-18px_0_40px_-32px_rgba(0,0,0,0.55)]",
                n_ && !t8 && "invisible",
              ),
              children: [
                (0, r.jsxs)("div", {
                  className:
                    "flex min-h-0 w-full flex-1 flex-col overflow-visible",
                  children: [
                    n_ &&
                      (0, r.jsxs)("header", {
                        className:
                          "flex h-14 shrink-0 items-center justify-between",
                        children: [
                          (0, r.jsx)("span", {
                            className:
                              "text-body-lg font-semibold text-foreground",
                            children:
                              "explore" === nW ? "Public Prompts" : "Chat",
                          }),
                          (0, r.jsxs)("div", {
                            className: "flex items-center gap-2",
                            children: [
                              (0, r.jsx)(eG.A, {
                                onOpenStorePurchases: eZ,
                                unifiedComposer: !0,
                                open: "credits" === sM,
                                onOpenChange: (e) => s_(e ? "credits" : null),
                              }),
                              "explore" !== nW &&
                                (0, r.jsx)(ef.$n, {
                                  type: "button",
                                  variant: "ghost",
                                  onClick: () =>
                                    nQ((e) =>
                                      "history" === e ? null : "history",
                                    ),
                                  "aria-label": nY
                                    ? "Close chat history"
                                    : "Open chat history",
                                  "aria-pressed": nY,
                                  className: (0, es.cn)(
                                    "h-10 rounded-xl bg-muted/55 px-3 text-compact-body font-medium text-muted-foreground shadow-control ring-1 ring-inset ring-border/55",
                                    "transition-[background-color,color,box-shadow,transform] hover:bg-muted hover:text-foreground active:scale-[0.97] motion-reduce:transition-none motion-reduce:active:scale-100",
                                    nY &&
                                      "bg-foreground text-background ring-foreground/10 hover:bg-foreground/90 hover:text-background",
                                  ),
                                  children: "History",
                                }),
                            ],
                          }),
                        ],
                      }),
                    nY &&
                      (0, r.jsx)("div", {
                        className: (0, es.cn)(
                          "mb-3 flex min-h-0 flex-1 overflow-hidden rounded-2xl border border-border/60",
                          n_
                            ? "mt-3 max-h-none bg-muted/35 shadow-control"
                            : "max-h-[380px] bg-background/75 shadow-xl backdrop-blur-xl",
                        ),
                        children: (0, r.jsx)(rp.A, {
                          embedded: !0,
                          expanded: !0,
                          onExpand: () => nQ("history"),
                          onCollapse: () => nQ(null),
                          threads: ts,
                          activeThreadId: e9,
                          onSwitchThread: (e) => {
                            (to(e), nQ(null));
                          },
                          onCreateNewThread: () => {
                            (t_(), nQ(null));
                          },
                          onRenameThread: tl,
                          isLoading: r_ || aw,
                        }),
                      }),
                    Z.fC &&
                      (0, r.jsx)("div", {
                        className:
                          "mx-4 mt-4 rounded-lg border border-warning/30 bg-warning/10 p-4 md:mx-20",
                        children: (0, r.jsxs)("div", {
                          className: "flex items-start gap-3",
                          children: [
                            (0, r.jsx)("div", {
                              className: "text-heading text-warning",
                              children: "⚠️",
                            }),
                            (0, r.jsxs)("div", {
                              children: [
                                (0, r.jsx)("h3", {
                                  className: "mb-1 font-semibold text-warning",
                                  children: "Service Temporarily Unavailable",
                                }),
                                (0, r.jsx)("p", {
                                  className: "text-body text-muted-foreground",
                                  children: Z.N$,
                                }),
                              ],
                            }),
                          ],
                        }),
                      }),
                    (0, r.jsxs)("div", {
                      ref: rA,
                      className: (0, es.cn)(
                        "flex-1 px-4 md:px-20 pt-4 pb-4 md:pb-6 space-y-3 overflow-y-auto styled-scrollbar",
                        nI && "w-full max-w-[1012px] mx-auto",
                        n_ && "min-h-0 px-4 pb-2 pt-2 md:px-6 md:pb-2",
                        n_ && "px-2 pb-2 pt-3 md:px-2 md:pb-2",
                        n_ && (nY || sA) && "hidden",
                        "explore" === nW && "hidden",
                      ),
                      style: {
                        maskImage: n_
                          ? "linear-gradient(to bottom, transparent 0, black 48px)"
                          : "linear-gradient(to bottom, transparent 0, black 48px, black calc(100% - 48px), transparent 100%)",
                        WebkitMaskImage: n_
                          ? "linear-gradient(to bottom, transparent 0, black 48px)"
                          : "linear-gradient(to bottom, transparent 0, black 48px, black calc(100% - 48px), transparent 100%)",
                      },
                      children: [
                        t6
                          ? (0, r.jsx)("div", {
                              className:
                                "flex items-center justify-center py-20",
                              children: (0, r.jsx)(m.A, {
                                className:
                                  "h-6 w-6 animate-spin text-muted-foreground",
                              }),
                            })
                          : tL || tU
                            ? null
                            : (0, r.jsx)(ri, {
                                messagesToDisplay: rk,
                                isProcessing: r_,
                                showFavoriteGamesModal: np,
                                setShowFavoriteGamesModal: nh,
                                dismissedQuickStart: nd,
                                setDismissedQuickStart: nc,
                                setIsChatInputHighlighted: nm,
                                currentChatId: e9,
                                clerkUserIdFromAuth: c,
                                onOpenUIBuilder: rx,
                                compact: n_,
                              }),
                        (0, r.jsx)(n3, { hasMoreMessages: rN, onLoadMore: rI }),
                        (0, r.jsx)(n4, {
                          floating: n_,
                          messagesToDisplay: rk,
                          allExecutionSessions: tY,
                          setContext: aL,
                          projectId: i,
                          currentChatId: e9,
                          activeFileName: ev,
                          activeFileContent: ew,
                          handlePlanApprove: aj,
                          handlePlanReject: ak,
                          handlePlanEdit: aN,
                          isProcessing: r_,
                          isApprovingPlan: aw,
                          restorationPreviewTimestamp: nt,
                          setRestorationPreviewTimestamp: nn,
                          input: ei,
                          setInput: eo,
                          isRestoring: ni,
                          setIsRestoring: no,
                          handlePlaytestContinue: aI,
                          handlePlaytestRefine: aC,
                          handleRollback: sf,
                          onRatingExpand: sb,
                          onSwitchToComposer:
                            tB?.useOpenRouter && "composer-2.5" !== eW
                              ? tM
                              : void 0,
                          onTaskSuggestionSelect: rj,
                          nextMoveSuggestionsEnabled: P,
                          selectedTaskSuggestion: rf,
                          consumedTaskSuggestionIndexes: ry,
                          hidePlanTodoList: av,
                          onExploreCards: nA ? a_ : void 0,
                          uiPinWarning: eY,
                          roadmapSlot: sN || sk ? sS : null,
                          roadmapBeforeMessageId: sN ? sv : sk,
                          flipSoundEnabled: nU,
                          slotMachineEnabled: nD,
                          flipBurstScale:
                            tB?.useOpenRouter && "tencent/hy3" === eW ? 2 : 1,
                          unpinAutoFollow: rM,
                        }),
                        tQ &&
                          tQ.plan &&
                          tQ.plan.length > 0 &&
                          !tQ.cancelled &&
                          ("pending" === tQ.planStatus ||
                            tQ.pastSteps.length < tQ.plan.length) &&
                          (0, r.jsx)(nE, {
                            planItems: tQ.plan,
                            completedSteps: tQ.pastSteps.map(([e]) => e),
                            currentStep: tQ.currentStep,
                            isPlaytesting:
                              "isPlaytesting" in tQ && tQ.isPlaytesting,
                            hidden: av,
                            uiPinWarning: eY,
                            onApprove: () =>
                              aj({
                                plan: tQ.plan,
                                planStatus: tQ.planStatus,
                                executionSessionId: tQ.executionSessionId,
                              }),
                            onReject: () =>
                              ak({
                                plan: tQ.plan,
                                planStatus: tQ.planStatus,
                                executionSessionId: tQ.executionSessionId,
                              }),
                            onEdit: (e) =>
                              aN(e, {
                                plan: tQ.plan,
                                planStatus: tQ.planStatus,
                                executionSessionId: tQ.executionSessionId,
                              }),
                            disabled: r_ || aw,
                            showApprovalButtons: "pending" === tQ.planStatus,
                          }),
                        sI && sS,
                        sI &&
                          tL &&
                          t$?.onboardingPlanStatus === "completed" &&
                          tL.forLaterTasks.length > 0 &&
                          (0, r.jsx)("div", {
                            className: "conversation-block",
                            children: (0, r.jsx)("div", {
                              className:
                                "bg-card border-border/80 w-[81.6%] rounded-xl border p-4 shadow-xl",
                              children: (0, r.jsx)(nO, {
                                tasks: tL.forLaterTasks.map(rZ.lO),
                                prefix:
                                  "Fire! Your first version is playable. Here are a few mechanics to add next:",
                                disabled: r_,
                                itemClassName:
                                  "border-success/30 bg-success/10 hover:bg-success/20",
                                onSelect: ({ index: e }) => {
                                  let t = tL.forLaterTasks[e];
                                  (eo(
                                    ((0, rZ.XF)(tL.favoriteGame.universeId)
                                      ? rZ.Ez[t]
                                      : void 0) ??
                                      `Build this task for my game ${tL.gameName}: ${t}`,
                                  ),
                                    setTimeout(() => {
                                      (e6.current?.focus(), e8());
                                    }, 0));
                                },
                              }),
                            }),
                          }),
                        e.skippedSyncForGeneration &&
                          (0, r.jsxs)("div", {
                            className:
                              "flex items-center justify-center gap-2 p-3 border border-border bg-muted/50 dark:border-neutral-700 dark:bg-neutral-800/50 rounded-lg mx-4 md:mx-20",
                            children: [
                              (0, r.jsx)(m.A, {
                                className:
                                  "h-4 w-4 animate-spin shrink-0 text-muted-foreground",
                              }),
                              (0, r.jsx)("span", {
                                className: "text-body text-muted-foreground",
                                children:
                                  "Agent is running. Updates will apply automatically when the agent finishes.",
                              }),
                            ],
                          }),
                        rE &&
                          !R(r$) &&
                          (0, r.jsx)(ne, {
                            error: rE,
                            errorCode: r$ ?? void 0,
                            userMessage: rL ?? void 0,
                            projectId: i,
                            requestUrl: rF ?? void 0,
                            statusCode: rU ?? void 0,
                            timestamp: rD ?? void 0,
                            freeModelResetAt: ag,
                          }),
                        tU &&
                          so &&
                          tR.isConnected &&
                          "completed" !== tU.status &&
                          tQ?.planStatus !== "pending" &&
                          (0, r.jsx)("div", {
                            className: "pb-4 flex justify-start",
                            children: (0, r.jsx)("div", {
                              className: "w-fit",
                              children: (0, r.jsx)(n$, {
                                question:
                                  "Time to playtest! Move to the next task or should we fix something here?",
                                onContinue: sd,
                                onRefine: sc,
                                gameThumbnailUrl: tU.gameThumbnailUrl,
                                tasks: tU.steps.map((e, t) => ({
                                  id: String(t),
                                  label: e.mechanicName,
                                  completed: "completed" === e.status,
                                  isCurrent: "current" === e.status,
                                })),
                              }),
                            }),
                          }),
                        tU &&
                          "completed" === tU.status &&
                          !tD &&
                          (0, r.jsx)("div", {
                            className: "pb-4 flex justify-start",
                            children: (0, r.jsxs)("div", {
                              className:
                                "inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-foreground/5 border border-border/40 text-body text-muted-foreground",
                              children: [
                                (0, r.jsx)(p.A, {
                                  className: "w-4 h-4 shrink-0",
                                }),
                                (0, r.jsx)("span", {
                                  children:
                                    "Remixing concluded! You can now prompt to keep improving your game.",
                                }),
                              ],
                            }),
                          }),
                      ],
                    }),
                    "explore" === nW &&
                      (0, r.jsx)("div", {
                        ref: rl,
                        className: (0, es.cn)(
                          "flex-1 min-h-0 px-4 md:px-20 pb-4 md:pb-6 overflow-y-auto styled-scrollbar",
                          nI && "w-full max-w-[1012px] mx-auto",
                          n_ && "px-4 pb-3 md:px-6 md:pb-4",
                          n_ && "px-2 pb-3 md:px-2 md:pb-3",
                          n_ && nY && "hidden",
                        ),
                        style: {
                          maskImage:
                            "linear-gradient(to bottom, black 0, black calc(100% - 48px), transparent 100%)",
                          WebkitMaskImage:
                            "linear-gradient(to bottom, black 0, black calc(100% - 48px), transparent 100%)",
                        },
                        children: (0, r.jsx)(t5, {
                          compact: n_,
                          onLightboxOpenChange: ro,
                          onCommunityCardSaved: aR,
                          onCommunityCardUnsaved: aE,
                          scrollRootRef: rl,
                        }),
                      }),
                    sA &&
                      (0, r.jsxs)("div", {
                        className:
                          "flex min-h-0 flex-1 flex-col justify-center px-2 pb-6",
                        children: [
                          (0, r.jsxs)("div", {
                            className:
                              "flex items-center justify-center gap-2.5",
                            children: [
                              (0, r.jsx)(ee.x, { size: 28 }),
                              (0, r.jsxs)("p", {
                                className:
                                  "text-title-lg text-center leading-none text-foreground",
                                children: [
                                  "Welcome, ",
                                  S?.username ?? S?.name ?? "there",
                                ],
                              }),
                            ],
                          }),
                          A.promptRecommendations &&
                            (0, r.jsx)("div", {
                              className: "mt-6 w-full",
                              children: (0, r.jsx)(t2.S0, {
                                onSelect: (e) => {
                                  (eo(e),
                                    requestAnimationFrame(() => {
                                      (e6.current?.focus(), e8());
                                    }));
                                },
                              }),
                            }),
                        ],
                      }),
                    (0, r.jsx)("div", {
                      className: (0, es.cn)(
                        rs
                          ? "sticky bottom-0 z-200 relative"
                          : "sticky bottom-0 z-10 relative",
                        nI ? "w-full max-w-[1012px] mx-auto" : "inset-x-0",
                        n_ && "max-w-none bg-map-panel pt-2",
                        n_ && "mt-auto px-2",
                      ),
                      children: (0, r.jsx)(tJ, {
                        compact: n_,
                        aboveInputSlot: (0, r.jsxs)(r.Fragment, {
                          children: [
                            !n_ && sP,
                            (0, r.jsx)(ns.A, {
                              input: ei,
                              suppressed: n6,
                              onVisibilityChange: ra,
                            }),
                            (0, r.jsx)(na, {
                              errorCode: r$,
                              userMessage: rL,
                              retryAfterSeconds: ax,
                              onVisibilityChange: n9,
                            }),
                            !n7 &&
                              (0, r.jsx)(nr, {
                                creditsRemaining: a$?.creditsRemaining ?? 0,
                                selectedModel: tB?.useOpenRouter ? eW : void 0,
                                onModelChange: tB?.useOpenRouter ? tP : void 0,
                                onBuyCredits: eZ,
                                availabilityOverrides: tW,
                                canAccessRestrictedModels: nj,
                                dismissed: re,
                                onDismissedChange: rt,
                                onVisibilityChange: n8,
                              }),
                          ],
                        }),
                        input: ei,
                        setInput: eo,
                        isGenerating: aS,
                        canStopGeneration: rT,
                        newAgentSessionId: rR,
                        promptQueueEnabled: M,
                        queuedPrompts: tc,
                        queueSlotOccupied: tp,
                        queueAtCapacity: tm,
                        queueContextBlockedByParent: M && !!rf,
                        onQueuePrompt: M ? aY : void 0,
                        onEditQueuedPrompt: M ? aZ : void 0,
                        onCancelQueuedPrompt: M ? aX : void 0,
                        onSendQueuedPromptNow: M ? a2 : void 0,
                        retryablePrompt: M ? ec[0] : void 0,
                        retryablePromptCount: M ? ec.length : 0,
                        onRestoreRetryablePrompt: M ? nb : void 0,
                        onDismissRetryablePrompt: M ? ny : void 0,
                        generatingLabel: si,
                        handleSend: aD,
                        textareaRef: e6,
                        controlsDisabled: ej || ni || !aA,
                        adjustHeight: e8,
                        activeFileName: ev,
                        contextTabs: eX,
                        onRemoveTab: e2,
                        isContextExpanded: eb,
                        onToggleExpand: () => ey(!eb),
                        addContextTab: e5,
                        handleStopGeneration: sx,
                        chatId: e9 || "",
                        isRestoring: ni,
                        canContinue: ad,
                        onContinue: am,
                        continueBillsUiModel: !!(
                          tK?.lastTurnUiPinned ?? tK?.uiTaskPinned
                        ),
                        isPro: S?.tier === "PRO" || S?.tier === "ENTERPRISE",
                        canAccessRestrictedModels: nj,
                        codexOnlyModelAccess: nk,
                        audioInputEnabled: nN,
                        highlighted: nu,
                        pluginConnected: aA,
                        pluginDisconnected: aP,
                        pluginConnectionLoading: tR.isLoading,
                        onOpenPluginConnectionModal: tE,
                        internalLimitReached: Z.fC,
                        showPluginConnectionPrompt: eA,
                        projectId: i,
                        onOpenRateLimitModal: () => eN(!0),
                        onOpenStorePurchases: eZ,
                        selectedModel: tB?.useOpenRouter ? eW : void 0,
                        onModelChange: tB?.useOpenRouter ? tP : void 0,
                        creditsRemaining: a$?.creditsRemaining ?? 0,
                        availabilityOverrides: tW,
                        discountBadgeHiddenOverrides: tV,
                        onOpenUIBuilder: rx,
                        selectedUI: ng,
                        onSelectUI: nx,
                        showDeckHand: nC && !n_,
                        showCardsInventory: nC && n_,
                        unifiedComposer: A.unifiedComposer,
                        showCreditControl: !n_,
                        composerPopover: n_ ? sM : void 0,
                        onComposerPopoverChange: n_ ? s_ : void 0,
                        themePickerSlot:
                          i && n_
                            ? (0, r.jsxs)(r.Fragment, {
                                children: [
                                  (0, r.jsx)(ed, {
                                    projectId: i,
                                    variant: "menu",
                                  }),
                                  er &&
                                    (0, r.jsx)(eh, {
                                      strength: S?.uiModelStrength,
                                      creditsRemaining:
                                        a$?.creditsRemaining ?? 0,
                                      variant: "menu",
                                    }),
                                ],
                              })
                            : void 0,
                        promotedCommunityCard: ru,
                        promptIndexInProject:
                          "number" == typeof rg ? rg + 1 : void 0,
                        onOpenExplore: () => aM("explore", "inventory_button"),
                        minimumCreditExemptModelIds: eB,
                        taggedMechanics: nX,
                        onRemoveTaggedMechanic: n5,
                      }),
                    }),
                  ],
                }),
                ni &&
                  r9 &&
                  ae &&
                  (0, r.jsx)(r9, {
                    children: (0, r.jsxs)(ae, {
                      initial: { opacity: 0 },
                      animate: { opacity: 1 },
                      exit: { opacity: 0 },
                      transition: { duration: 0.2 },
                      className:
                        "fixed inset-0 z-100 flex items-center justify-center",
                      children: [
                        (0, r.jsx)("div", {
                          className:
                            "absolute inset-0 bg-black/60 backdrop-blur-xs",
                        }),
                        (0, r.jsxs)(ae, {
                          initial: { scale: 0.9, opacity: 0 },
                          animate: { scale: 1, opacity: 1 },
                          exit: { scale: 0.9, opacity: 0 },
                          transition: { duration: 0.2, delay: 0.1 },
                          className:
                            "relative z-10 bg-neutral-950 border border-neutral-900 rounded-xl px-8 py-6 shadow-2xl",
                          children: [
                            (0, r.jsxs)("div", {
                              className: "flex items-center gap-3",
                              children: [
                                (0, r.jsx)(ee.x, { size: 24 }),
                                (0, r.jsx)(m.A, {
                                  className:
                                    "w-5 h-5 animate-spin text-white/70",
                                }),
                                (0, r.jsx)("span", {
                                  className:
                                    "text-white font-medium text-subhead",
                                  children: "Restoring...",
                                }),
                              ],
                            }),
                            (0, r.jsx)("p", {
                              className: "text-white/60 text-body mt-2",
                              children: "Rolling back to checkpoint",
                            }),
                          ],
                        }),
                      ],
                    }),
                  }),
                (0, r.jsx)(rr, {
                  open:
                    eM &&
                    !tR.isLoading &&
                    void 0 !== S &&
                    (!A.promptFirstPlayable || void 0 !== nB),
                  onOpenChange: e_,
                  pluginConnected: aA,
                  skipInstallStep: nG,
                  reconnecting: aP,
                  onInstallPlugin: b.G7,
                }),
                a$ &&
                  (0, r.jsxs)(r.Fragment, {
                    children: [
                      (0, r.jsx)(t9, {
                        open: ek,
                        onOpenChange: eN,
                        creditsRemaining: a$.creditsRemaining,
                        creditLimit: a$.creditLimit,
                        resetAt: a$.resetAt,
                        userTier: S?.tier ?? "FREE",
                        hasJoinedDiscord: a$.hasJoinedDiscord,
                        onOpenStorePurchases: eZ,
                      }),
                      (0, r.jsx)(rc.A, {
                        open: eI,
                        onOpenChange: eC,
                        userTier: S?.tier ?? "FREE",
                      }),
                    ],
                  }),
              ],
            }),
          ],
        });
      }
      var as = n(23536);
      function ai({ open: e, setOpen: t, message: n }) {
        let a = (0, g.useRouter)();
        return (
          (0, as.vJ)(() => {
            if (e) {
              let e = setTimeout(() => {
                a.push("/dashboard");
              }, 5e3);
              return () => clearTimeout(e);
            }
          }, [e, a]),
          (0, r.jsx)(eH.lG, {
            open: e,
            onOpenChange: t,
            children: (0, r.jsxs)(eH.Cf, {
              className: "max-w-md",
              showCloseButton: !1,
              children: [
                (0, r.jsxs)(eH.c7, {
                  children: [
                    (0, r.jsx)(eH.L3, {
                      children: "Live collaboration disabled",
                    }),
                    (0, r.jsx)(eH.rr, { children: n }),
                  ],
                }),
                (0, r.jsxs)("div", {
                  className:
                    "flex items-center gap-2.5 rounded-2xl bg-muted/65 px-3.5 py-3 text-body text-muted-foreground ring-1 ring-inset ring-border/55",
                  children: [
                    (0, r.jsx)(m.A, {
                      "aria-hidden": "true",
                      className:
                        "size-4 animate-spin motion-reduce:animate-none",
                    }),
                    "Returning home…",
                  ],
                }),
              ],
            }),
          })
        );
      }
      var ao = n(58358);
      function al({ sandboxData: e, skippedSyncForGeneration: t }) {
        let n = (0, i.J0)(!0)[1],
          [o] = (0, i.J0)({ isDisabled: !1, message: "" }),
          l = (0, s.n_)(a.FH.users.setCurrentProject);
        return ((0, i.vJ)(() => {
          (async () => {
            try {
              let t = await l({ projectId: e.id, projectName: e.name });
              t.success || console.error("Failed to set current project:", t);
            } catch (e) {
              console.error("Error setting current project:", e);
            }
          })();
        }, [e.id, e.name, l]),
        (0, i.vJ)(() => {
          n(!0);
        }, [n]),
        o.isDisabled)
          ? (0, r.jsxs)(r.Fragment, {
              children: [
                (0, r.jsx)(ai, {
                  message: o.message,
                  open: o.isDisabled,
                  setOpen: () => {},
                }),
                (0, r.jsx)(ao.A, {}),
              ],
            })
          : (0, r.jsx)(c, {
              children: (0, r.jsx)("div", {
                className: "flex max-h-full overflow-hidden dark:bg-card",
                children: (0, r.jsx)("div", {
                  className: "flex-1 relative flex flex-col min-w-0",
                  children: (0, r.jsx)(aa, {
                    projectId: e.id,
                    templateType: e.type,
                    projectName: e.name,
                    onClose: () => {},
                    skippedSyncForGeneration: t,
                  }),
                }),
              }),
            });
      }
    },
    8555: (e, t, n) => {
      n.d(t, { A: () => c });
      var r = n(95155),
        a = n(25016),
        s = n(14438),
        i = n(52056),
        o = n(65229),
        l = n(31892);
      let d = [
        {
          pattern:
            /\b(?:dogs?|cats?|horses?|wol(?:f|ves)|dragons?|spiders?|birds?|fish|snakes?|bears?|lions?|tigers?|deer|cows?|pigs?|sheep|chickens?|rabbits?|bunn(?:y|ies)|fox(?:es)?|frogs?|dinos?|dinosaurs?|animals?|pets?|creatures?|beasts?|quadrupeds?|(?:four|4|six|6|eight|8)[\s-]?legged|non[\s-]?humanoid|rigs?|skinned[\s-]?mesh)\b/i,
          context:
            /\b(?:anim\w*|emotes?|walk\w*|run(?:s|ning)?|idle|gallop\w*|crawl\w*|fl(?:y|ies|ying)|jump\w*|attack\w*|bit(?:e|es|ing)|swim\w*|pose[sd]?|keyframes?|cycles?|mov(?:e|es|ing|ement)|motions?|danc\w*|roar\w*|bark\w*|rigs?|skinned[\s-]?mesh)\b/i,
          message:
            "Animations are built for humanoid (R6/R15) characters. Animals, four-legged creatures and custom rigs are not supported.",
        },
        {
          pattern: /\b(maps?|worlds?|building|houses?|terrain|cit(?:y|ies))\b/i,
          message:
            "Lemonade focus is not map or world building. We work best for scripts, UI and animation tasks.",
        },
      ];
      function c({
        input: e,
        suppressed: t,
        dismissed: n,
        onDismissedChange: c,
        onVisibilityChange: u,
      }) {
        let [m, p] = (0, l.J0)(!1),
          h = void 0 !== n,
          g = h ? n : m,
          x = (0, l.hb)(
            (e) => {
              (h || p(e), c?.(e));
            },
            [h, c],
          ),
          [f, b] = (0, l.J0)(null);
        (0, l.vJ)(() => {
          let t = setTimeout(() => {
            b(
              (function (e) {
                let t = d.find(
                  ({ pattern: t, context: n }) =>
                    t.test(e) && (void 0 === n || n.test(e)),
                );
                return t ? t.message : null;
              })(e),
            );
          }, 400);
          return () => clearTimeout(t);
        }, [e]);
        let y = null !== f && !g && !t;
        (0, l.vJ)(() => {
          u?.(y);
        }, [y, u]);
        let v = (0, l.hb)(() => {
          x(!0);
        }, [x]);
        return y
          ? (0, r.jsx)("div", {
              className: (0, a.cn)(
                "mb-2",
                "flex justify-center",
                "pointer-events-none",
              ),
              children: (0, r.jsxs)(s.P.div, {
                className: (0, a.cn)(
                  "flex w-full items-center justify-between gap-3",
                  "px-2.5 py-2 rounded-xl",
                  "border border-warning/30 bg-warning/10 backdrop-blur-md",
                  "pointer-events-auto",
                ),
                initial: { opacity: 0, y: 6 },
                animate: { opacity: 1, y: 0 },
                transition: { duration: 0.2, ease: "easeOut" },
                children: [
                  (0, r.jsxs)("div", {
                    className: "flex items-start gap-2 min-w-0",
                    children: [
                      (0, r.jsx)(i.A, {
                        className:
                          "h-3.5 w-3.5 text-muted-foreground shrink-0 mt-0.5",
                      }),
                      (0, r.jsx)("span", {
                        className:
                          "text-caption text-muted-foreground leading-snug",
                        children: f,
                      }),
                    ],
                  }),
                  (0, r.jsx)("div", {
                    className: "flex items-center gap-1.5 shrink-0",
                    children: (0, r.jsx)("button", {
                      onClick: v,
                      className:
                        "p-0.5 rounded hover:bg-white/10 text-muted-foreground hover:text-muted-foreground transition-colors",
                      "aria-label": "Dismiss",
                      children: (0, r.jsx)(o.A, { className: "h-3 w-3" }),
                    }),
                  }),
                ],
              }),
            })
          : null;
      }
    },
    17982: (e, t, n) => {
      n.d(t, { C: () => d, z: () => l });
      var r = n(95155),
        a = n(24058),
        s = n(12115),
        i = n(1653),
        o = n(25016);
      let l = s.forwardRef(({ className: e, ...t }, n) =>
        (0, r.jsx)(a.bL, {
          "data-slot": "radio-group",
          className: (0, o.cn)("grid gap-3", e),
          ...t,
          ref: n,
        }),
      );
      l.displayName = a.bL.displayName;
      let d = s.forwardRef(({ className: e, ...t }, n) =>
        (0, r.jsx)(a.q7, {
          ref: n,
          "data-slot": "radio-group-item",
          className: (0, o.cn)(
            "group/radio relative flex aspect-square size-4 items-center justify-center rounded-pill coarse-hit-target",
            i.$o,
            e,
          ),
          ...t,
          children: (0, r.jsx)("span", {
            "data-slot": "radio-group-control",
            className: (0, o.cn)(
              "pointer-events-none absolute left-1/2 top-1/2 flex size-4 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-pill border border-input shadow-control group-data-[state=checked]/radio:border-primary group-data-[state=checked]/radio:bg-primary group-data-[state=checked]/radio:text-primary-foreground",
              i.b4,
            ),
            children: (0, r.jsx)(a.C1, {
              "data-slot": "radio-group-indicator",
              className: "flex items-center justify-center text-current",
              children: (0, r.jsx)("svg", {
                width: "6",
                height: "6",
                viewBox: "0 0 6 6",
                fill: "currentcolor",
                xmlns: "http://www.w3.org/2000/svg",
                "aria-hidden": "true",
                children: (0, r.jsx)("circle", { cx: "3", cy: "3", r: "3" }),
              }),
            }),
          }),
        }),
      );
      d.displayName = a.q7.displayName;
    },
    23536: (e, t, n) => {
      n.d(t, { vJ: () => r.useEffect });
      var r = n(12115);
    },
    39520: (e, t, n) => {
      n.d(t, { F: () => s });
      var r = n(5379),
        a = n(30268);
      function s(e = "dark") {
        let { resolvedTheme: t } = (0, r.D)(),
          [n, i] = (0, a.J0)(!1);
        return ((0, a.vJ)(() => {
          i(!0);
        }, []),
        n && ("light" === t || "dark" === t))
          ? t
          : e;
      }
    },
    40740: (e, t, n) => {
      n.d(t, { U: () => o });
      var r = n(95155),
        a = n(67909),
        s = n(11012);
      let i = (0, a.default)(
        () =>
          Promise.all([n.e(9367), n.e(1831), n.e(5833), n.e(3217)])
            .then(n.bind(n, 23217))
            .then((e) => e.AnimationClipViewer),
        { loadableGenerated: { webpack: () => [23217] }, ssr: !1 },
      );
      function o({ clipUrl: e, className: t, rigs: n }) {
        let a = (0, s.li)(null),
          [o, l] = (0, s.J0)(!1);
        return (
          (0, s.vJ)(() => {
            let e = a.current;
            if (!e) return;
            let t = new IntersectionObserver(([e]) => l(e.isIntersecting), {
              rootMargin: "200px 0px",
            });
            return (t.observe(e), () => t.disconnect());
          }, []),
          (0, r.jsx)("div", {
            ref: a,
            "data-slot": "inline-clip-viewer",
            className: `overflow-hidden rounded border border-input ${t}`,
            children: o ? (0, r.jsx)(i, { clipUrl: e, rigs: n }) : null,
          })
        );
      }
    },
    42261: (e, t, n) => {
      n.d(t, {
        J0: () => r.useState,
        Kr: () => r.useMemo,
        hb: () => r.useCallback,
        li: () => r.useRef,
        vJ: () => r.useEffect,
      });
      var r = n(12115);
    },
    63960: (e, t, n) => {
      n.d(t, { li: () => r.useRef, vJ: () => r.useEffect });
      var r = n(12115);
    },
    66672: (e, t, n) => {
      n.d(t, {
        Kr: () => r.useMemo,
        NT: () => r.useContext,
        q6: () => r.createContext,
      });
      var r = n(12115);
    },
    67001: (e, t, n) => {
      n.d(t, { T: () => d });
      var r = n(95155),
        a = n(12115),
        s = n(83101),
        i = n(1653),
        o = n(25016);
      let l = (0, s.F)(
          (0, o.cn)(
            "flex w-full resize-y rounded-control border border-input bg-transparent px-3 text-form-control placeholder:text-muted-foreground",
            i.$o,
            i.b4,
          ),
          {
            variants: {
              density: {
                compact: "min-h-12 py-1.5",
                default: "min-h-15 py-2",
                comfortable: "min-h-24 py-3",
              },
            },
            defaultVariants: { density: "default" },
          },
        ),
        d = a.forwardRef(({ className: e, density: t, ...n }, a) =>
          (0, r.jsx)("textarea", {
            "data-slot": "textarea",
            "data-density": t ?? "default",
            className: (0, o.cn)(l({ density: t }), e),
            ref: a,
            ...n,
          }),
        );
      d.displayName = "Textarea";
    },
    90446: (e, t, n) => {
      n.d(t, { li: () => r.useRef });
      var r = n(12115);
    },
    92615: (e, t, n) => {
      n.d(t, { r: () => i, x: () => o });
      var r = n(95155),
        a = n(15239),
        s = n(25016);
      function i({ size: e = 36, ...t }) {
        return (0, r.jsx)(a.default, {
          src: "/lemonade-icon.png",
          alt: "Lemonade Logo",
          width: e,
          height: e,
          ...t,
        });
      }
      function o({ size: e = 23, className: t }) {
        return (0, r.jsxs)(r.Fragment, {
          children: [
            (0, r.jsx)(a.default, {
              src: "/icons/logo-icon.svg",
              alt: "Lemonade",
              width: e,
              height: e,
              className: (0, s.cn)("w-auto in-[.light]:hidden", t),
              style: { height: e },
            }),
            (0, r.jsx)(a.default, {
              src: "/icons/logo-icon-dark.png",
              alt: "Lemonade",
              width: e,
              height: e,
              className: (0, s.cn)("hidden w-auto in-[.light]:block", t),
              style: { height: e },
            }),
          ],
        });
      }
    },
    92976: (e, t, n) => {
      n.d(t, { B: () => l });
      var r = n(95155),
        a = n(65229),
        s = n(90446),
        i = n(97003),
        o = n(54679);
      function l({
        imageUrl: e,
        open: t,
        onClose: n,
        alt: l = "Image preview",
      }) {
        let d = (0, s.li)(null);
        return (0, r.jsx)(o.lG, {
          open: t,
          onOpenChange: (e) => !e && n(),
          children: (0, r.jsxs)(o.Cf, {
            layer: "lightbox",
            showCloseButton: !1,
            "aria-describedby": void 0,
            overlayClassName: "bg-black/85 backdrop-blur-xs",
            className:
              "inset-0 left-0 top-0 flex h-dvh w-full max-w-none translate-x-0 translate-y-0 items-center justify-center gap-0 rounded-none bg-transparent p-8 shadow-none",
            onClick: (e) => {
              e.target === e.currentTarget && n();
            },
            onOpenAutoFocus: () => {
              let e = document.activeElement;
              d.current =
                e instanceof HTMLElement && e !== document.body ? e : null;
            },
            onCloseAutoFocus: (e) => {
              let t = d.current;
              ((d.current = null),
                t?.isConnected && (e.preventDefault(), t.focus()));
            },
            children: [
              (0, r.jsx)(o.L3, {
                className: "sr-only",
                children: l || "Image preview",
              }),
              (0, r.jsx)(o.HM, {
                asChild: !0,
                children: (0, r.jsx)(i.K0, {
                  label: "Close image preview",
                  variant: "ghost",
                  className:
                    "absolute right-4 top-4 text-white/80 shadow-none hover:bg-white/10 hover:text-white hover:shadow-none",
                  children: (0, r.jsx)(a.A, {
                    className: "size-6",
                    "aria-hidden": "true",
                  }),
                }),
              }),
              (0, r.jsx)("img", {
                src: e,
                alt: l,
                draggable: !1,
                onClick: (e) => e.stopPropagation(),
                className:
                  "max-h-[90vh] max-w-[90vw] select-none rounded-overlay object-contain shadow-overlay",
              }),
            ],
          }),
        });
      }
    },
    95702: (e, t, n) => {
      n.d(t, { J0: () => r.useState, hb: () => r.useCallback });
      var r = n(12115);
    },
  },
]);

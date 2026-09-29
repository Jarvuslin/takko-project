"use strict";
(self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([
  [3556],
  {
    3556: (e, t, n) => {
      (n.r(t),
        n.d(t, {
          BuildMomentum: () => U,
          EdgeLayer: () => el,
          GAME_MAP_NEXT_MOVE_HEIGHT: () => W,
          GAME_MAP_NEXT_MOVE_WIDTH: () => L,
          GM_PANEL_MAX_VW: () => F,
          GM_PANEL_MIN_VW: () => R,
          HexTile: () => ei,
          NextMoveNode: () => ea,
          clampGmPanelWidth: () => D,
          default: () => es,
          getGameNameControlWidth: () => G,
        }));
      var r = n(95155),
        i = n(32450),
        a = n(74647),
        s = n(19246),
        o = n(82180),
        l = n(97450),
        c = n(94352),
        d = n(25016),
        u = n(95419),
        m = n(67040),
        x = n(54679),
        h = n(97003),
        p = n(41407),
        g = n(71408),
        f = n(14438),
        b = n(60709),
        y = n(24033),
        v = n(99708),
        j = n(5917),
        w = n(14639),
        k = n(7125),
        N = n(6191),
        M = n(65229),
        C = n(38707),
        P = n(35626),
        $ = n(60770),
        I = n(48055),
        z = n(6132),
        _ = n(18514),
        A = n(15239),
        S = n(12115),
        E = n(18720),
        T = n(8896);
      let R = 0.2,
        F = 0.4;
      function D(e) {
        return Math.min(
          Math.round(window.innerWidth * F),
          Math.max(Math.round(window.innerWidth * R), Math.round(e)),
        );
      }
      let L = 176,
        W = 72;
      function G(e) {
        return Math.min(200, Math.max(50, 7 * Math.max(e.length, 1) + 42));
      }
      let O = { 1: [-90], 2: [180, 0], 3: [180, -90, 0], 4: [180, -90, 0, 90] },
        X = Math.round(81.7),
        H = Math.round(3.0000000000000027),
        B =
          "linear-gradient(to bottom, color-mix(in oklab, var(--color-brand-sky) 70%, transparent) 0%, color-mix(in oklab, var(--color-brand-sky) 70%, transparent) 50%, color-mix(in oklab, var(--color-brand-blue) 72%, transparent) 50%, color-mix(in oklab, var(--color-brand-blue) 72%, transparent) 100%)";
      function Y({ quests: e, compact: t = !1 }) {
        let n = e.every((e) => !e.locked && e.done >= e.target),
          i = e.filter((e) => !e.locked && e.done >= e.target).length;
        return t
          ? (0, r.jsxs)(l.AM, {
              children: [
                (0, r.jsx)(l.Wv, {
                  asChild: !0,
                  children: (0, r.jsxs)("button", {
                    type: "button",
                    "data-gm-interactive": !0,
                    "aria-label": `Quests, ${i} of ${e.length} complete`,
                    className:
                      "flex h-10 items-center gap-2 rounded-xl bg-background/82 px-3 text-foreground shadow-surface ring-1 ring-border/65 backdrop-blur-md transition-colors hover:bg-background/95 focus:outline-hidden focus:ring-3 focus:ring-ring/25 @max-[400px]:w-10 @max-[400px]:justify-center @max-[400px]:px-0",
                    children: [
                      (0, r.jsx)(b.A, {
                        "aria-hidden": "true",
                        className: "hidden size-4 shrink-0 @max-[400px]:block",
                      }),
                      (0, r.jsx)("span", {
                        className:
                          "text-body font-semibold @max-[400px]:hidden",
                        children: "Quests",
                      }),
                      (0, r.jsxs)("span", {
                        className:
                          "text-body font-medium tabular-nums text-muted-foreground @max-[520px]:hidden",
                        children: [i, "/", e.length],
                      }),
                      (0, r.jsx)(y.A, {
                        "aria-hidden": "true",
                        className:
                          "size-3.5 text-muted-foreground @max-[520px]:hidden",
                      }),
                    ],
                  }),
                }),
                (0, r.jsxs)(l.hl, {
                  "data-gm-interactive": !0,
                  align: "end",
                  sideOffset: 8,
                  className:
                    "w-72 rounded-2xl bg-popover p-3 shadow-overlay ring-1 ring-border/65",
                  children: [
                    (0, r.jsxs)("div", {
                      className:
                        "mb-2 flex items-baseline justify-between px-1",
                      children: [
                        (0, r.jsx)("span", {
                          className:
                            "text-body font-semibold text-popover-foreground",
                          children: "Quests",
                        }),
                        (0, r.jsxs)("span", {
                          className:
                            "text-caption tabular-nums text-muted-foreground",
                          children: [i, " of ", e.length, " complete"],
                        }),
                      ],
                    }),
                    (0, r.jsx)("div", {
                      className: "space-y-1.5",
                      children: e.map((e) => {
                        let t = !e.locked && e.done >= e.target,
                          n = e.locked ? 0 : Math.min(e.done / e.target, 1);
                        return (0, r.jsxs)(
                          "div",
                          {
                            role: "progressbar",
                            "aria-label": e.label,
                            "aria-valuemin": 0,
                            "aria-valuemax": e.target,
                            "aria-valuenow": e.locked ? 0 : e.done,
                            className:
                              "rounded-xl bg-muted/45 px-3 py-2.5 ring-1 ring-inset ring-border/45",
                            children: [
                              (0, r.jsxs)("div", {
                                className:
                                  "flex items-center justify-between gap-3",
                                children: [
                                  (0, r.jsx)("span", {
                                    className: (0, d.cn)(
                                      "min-w-0 truncate text-compact-body font-medium",
                                      e.locked
                                        ? "text-muted-foreground"
                                        : "text-popover-foreground",
                                    ),
                                    title: e.label,
                                    children: e.compactLabel,
                                  }),
                                  (0, r.jsx)("span", {
                                    className:
                                      "flex shrink-0 items-center text-caption font-semibold tabular-nums text-muted-foreground",
                                    children: e.locked
                                      ? (0, r.jsx)(v.A, {
                                          "aria-label": "Locked",
                                          className: "size-3.5",
                                        })
                                      : t
                                        ? (0, r.jsx)(j.A, {
                                            "aria-label": "Complete",
                                            className:
                                              "size-3.5 text-brand-sky",
                                            strokeWidth: 3,
                                          })
                                        : `${e.done}/${e.target}`,
                                  }),
                                ],
                              }),
                              (0, r.jsx)("div", {
                                className:
                                  "mt-2 h-1 overflow-hidden rounded-full bg-border/60",
                                children: (0, r.jsx)("div", {
                                  className: "h-full rounded-full bg-brand-sky",
                                  style: { width: `${Math.round(100 * n)}%` },
                                }),
                              }),
                            ],
                          },
                          e.id,
                        );
                      }),
                    }),
                  ],
                }),
              ],
            })
          : (0, r.jsxs)("div", {
              "data-gm-interactive": !0,
              className: "w-full",
              children: [
                (0, r.jsx)("div", {
                  className:
                    "mb-1 text-center text-caption font-semibold uppercase  text-white/30",
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
                              className: (0, d.cn)(
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
                                    backgroundImage: B,
                                  },
                                }),
                                (0, r.jsx)("div", {
                                  className:
                                    "absolute inset-0 flex items-center justify-center drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]",
                                  children: e.locked
                                    ? (0, r.jsx)(v.A, {
                                        className: "h-3 w-3 text-white/25",
                                        strokeWidth: 2.75,
                                      })
                                    : t
                                      ? (0, r.jsx)(j.A, {
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
                              className: (0, d.cn)(
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
                      className: (0, d.cn)(
                        "relative flex h-5 flex-[0.25] items-center justify-center overflow-hidden rounded-lg border bg-white/5",
                        n ? "border-neutral-500/60" : "border-white/10",
                      ),
                      children: [
                        n &&
                          (0, r.jsx)("div", {
                            className: "absolute inset-0",
                            style: { backgroundImage: B },
                          }),
                        (0, r.jsx)(b.A, {
                          strokeWidth: 2.75,
                          className: (0, d.cn)(
                            "relative h-3 w-3 drop-shadow-[0_1px_1px_rgba(0,0,0,0.5)]",
                            n ? "text-white" : "text-white/25",
                          ),
                        }),
                      ],
                    }),
                  ],
                }),
              ],
            });
      }
      function Z(e, t) {
        return `${e}->${t}`;
      }
      function U({ graph: e, projectName: t }) {
        let n = e
            ? (function (e) {
                let t = new Set();
                for (let n of e.mechanics)
                  for (let e of n.connects) t.add([n.id, e].sort().join("::"));
                return t.size;
              })(e)
            : 0,
          i = e?.mechanics.length ?? 0,
          a = e?.gameName?.trim() || t || "Untitled",
          s = (0, S.useRef)(n),
          [o, l] = (0, S.useState)(0),
          c = (0, p.I)();
        return (
          (0, S.useEffect)(() => {
            let e = n - s.current;
            if (((s.current = n), e <= 0)) return void l(0);
            l(e);
            let t = window.setTimeout(() => l(0), 1500);
            return () => window.clearTimeout(t);
          }, [n]),
          (0, r.jsxs)("div", {
            "data-gm-interactive": !0,
            "aria-label": `${a}, ${i} mechanics, ${n} connections`,
            className:
              "flex h-10 max-w-full min-w-0 items-center gap-2 rounded-xl bg-background/82 px-3 text-foreground shadow-surface ring-1 ring-border/65 backdrop-blur-md",
            children: [
              (0, r.jsx)("span", {
                className:
                  "max-w-40 truncate whitespace-nowrap text-body font-semibold text-foreground @max-[360px]:max-w-24",
                title: a,
                children: a,
              }),
              (0, r.jsxs)("span", {
                className:
                  "flex min-w-0 items-center gap-2 @max-[620px]:hidden",
                children: [
                  (0, r.jsx)("span", {
                    "aria-hidden": "true",
                    className: "h-4 w-px shrink-0 bg-border/70",
                  }),
                  (0, r.jsx)(w.A, {
                    "aria-hidden": "true",
                    className: "size-3.5 shrink-0 text-brand-sky",
                  }),
                  (0, r.jsxs)("span", {
                    className:
                      "truncate whitespace-nowrap text-body font-medium tabular-nums text-foreground",
                    children: [i, " mechanics \xb7 ", n, " links"],
                  }),
                  (0, r.jsx)(g.N, {
                    initial: !1,
                    children:
                      o > 0
                        ? (0, r.jsxs)(
                            f.P.span,
                            {
                              initial: !c && {
                                opacity: 0,
                                scale: 0.25,
                                filter: "blur(4px)",
                              },
                              animate: {
                                opacity: 1,
                                scale: 1,
                                filter: "blur(0px)",
                              },
                              exit: {
                                opacity: 0,
                                scale: 0.25,
                                filter: "blur(4px)",
                              },
                              transition: {
                                type: "spring",
                                duration: 0.3,
                                bounce: 0,
                              },
                              className:
                                "rounded-full bg-brand-sky px-1.5 py-0.5 text-label-xs font-semibold tabular-nums text-brand-black shadow-control",
                              children: [
                                "+",
                                o,
                                " ",
                                1 === o ? "link" : "links",
                              ],
                            },
                            `${n}-${o}`,
                          )
                        : null,
                  }),
                ],
              }),
            ],
          })
        );
      }
      function q(e, t) {
        let n = O[t];
        return n ? (n[e] ?? -90) : -90 + (360 / t) * e;
      }
      let V = { type: "spring", stiffness: 260, damping: 20 },
        Q = { type: "tween", duration: 0.15, delay: 0, ease: "easeOut" },
        K = { duration: 0 };
      function J(e, t, n, r) {
        let i = e - n,
          a = t - r,
          s = Math.hypot(i, a) || 1;
        if (s >= 240) return null;
        let o = Math.max(0, 124 - s) + (1 - s / 240) * 14;
        return { x: (i / s) * o, y: (a / s) * o };
      }
      let ee = "text-caption font-semibold text-white/70",
        et = (0, d.cn)(
          "relative inline-flex shrink-0 items-center justify-center after:absolute after:left-1/2 after:top-1/2 after:size-10 after:-translate-x-1/2 after:-translate-y-1/2 after:content-['']",
          "border border-border bg-secondary text-secondary-foreground",
          "transition-colors hover:bg-secondary-hover",
          "focus:outline-hidden focus:ring-2 focus:ring-ring/50",
        );
      function en({ scale: e, onZoomIn: t, onZoomOut: n, floating: i = !1 }) {
        return (0, r.jsxs)("div", {
          "data-gm-interactive": !0,
          className: (0, d.cn)(
            "flex items-center gap-2",
            i &&
              "h-10 rounded-xl border border-border/60 bg-background/82 p-1 shadow-xl backdrop-blur-md",
          ),
          children: [
            (0, r.jsx)("button", {
              type: "button",
              onClick: n,
              "aria-label": "Zoom out",
              className: (0, d.cn)(
                et,
                i ? "size-8 rounded-lg" : "size-6 rounded-lg",
              ),
              children: (0, r.jsx)(k.A, {
                className: i ? "size-4" : "size-3.5",
              }),
            }),
            (0, r.jsx)("span", {
              className: (0, d.cn)(
                "shrink-0 text-center font-medium tabular-nums text-muted-foreground",
                i ? "min-w-9 text-caption" : "min-w-[34px] text-micro",
              ),
              children: (0, r.jsx)(T.WV, { scale: e }),
            }),
            (0, r.jsx)("button", {
              type: "button",
              onClick: t,
              "aria-label": "Zoom in",
              className: (0, d.cn)(
                et,
                i ? "size-8 rounded-lg" : "size-6 rounded-lg",
              ),
              children: (0, r.jsx)(N.A, {
                className: i ? "size-4" : "size-3.5",
              }),
            }),
          ],
        });
      }
      let er =
        "polygon(25% 6.7%, 75% 6.7%, 100% 50%, 75% 93.3%, 25% 93.3%, 0% 50%)";
      function ei({
        size: e,
        shadow: t,
        className: n,
        rimClassName: i,
        bodyClassName: a,
        bodyInset: s = 3,
        children: o,
      }) {
        return (0, r.jsxs)("div", {
          className: (0, d.cn)("relative", n),
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
              className: (0, d.cn)("absolute inset-0 bg-black/[0.168]", i),
              style: { clipPath: er },
            }),
            (0, r.jsx)("div", {
              className: (0, d.cn)("absolute bg-neutral-700", a),
              style: { inset: s, clipPath: er },
            }),
            (0, r.jsx)("div", {
              className: "absolute inset-0 flex items-center justify-center",
              children: o,
            }),
          ],
        });
      }
      function ea({
        suggestion: e,
        primary: t,
        interactive: n,
        onAdd: i,
        onDismiss: a,
      }) {
        let o = (0, S.useId)(),
          [l, c] = (0, S.useState)(!1),
          [u, m] = (0, S.useState)(!1);
        return (0, r.jsxs)("div", {
          className: "group/next relative",
          onPointerEnter: () => c(!0),
          onPointerLeave: () => c(!1),
          children: [
            (0, r.jsxs)(h.$n, {
              type: "button",
              presentation: "inherit",
              onClick: i,
              "aria-describedby": o,
              onFocus: (e) => {
                e.currentTarget.matches(":focus-visible") && m(!0);
              },
              onBlur: () => m(!1),
              "aria-label": n
                ? `Add suggested next move: ${e.title}`
                : "Connect the Roblox Studio plugin to interact",
              className: (0, d.cn)(
                "control-focus grid grid-cols-[28px_minmax(0,1fr)] grid-rows-[28px_20px] gap-x-2 rounded-xl border border-dashed border-brand-sky/35 bg-card/45 px-2.5 text-left text-card-foreground opacity-70 shadow-control",
                t ? "gap-y-2.5 py-1.5" : "gap-y-1.5 py-2",
                "transition-[transform,box-shadow,background-color,border-color,opacity] duration-200 ease-out hover:-translate-y-0.5 hover:border-brand-sky/70 hover:bg-card/85 hover:opacity-100 hover:shadow-surface focus-visible:opacity-100 active:scale-[0.96] motion-reduce:transition-none motion-reduce:hover:translate-y-0 motion-reduce:active:scale-100",
                t &&
                  "border-brand-sky/55 bg-brand-blue/12 hover:border-brand-sky/85 hover:bg-brand-blue/22",
                !n && "cursor-not-allowed opacity-55",
              ),
              style: { width: L, height: W },
              children: [
                (0, r.jsx)("span", {
                  className: "flex size-7 items-center justify-center",
                  children: (0, r.jsx)(ei, {
                    size: 28,
                    shadow:
                      "0 2px 7px color-mix(in oklab, var(--foreground) 28%, transparent)",
                    rimClassName: t ? "bg-brand-sky/55" : "bg-brand-ice/35",
                    bodyClassName: "bg-neutral-700",
                    bodyInset: 2,
                    children: (0, r.jsx)(A.default, {
                      src: e.icon
                        ? `/game-memory-icons/${e.icon}.png`
                        : (0, s.ll)({
                            id: e.title,
                            title: e.title,
                            desc: e.text,
                          }),
                      alt: "",
                      width: 14,
                      height: 14,
                      draggable: !1,
                    }),
                  }),
                }),
                (0, r.jsxs)("span", {
                  className: (0, d.cn)(
                    "min-w-0",
                    t ? "self-end" : "self-center",
                  ),
                  children: [
                    t &&
                      (0, r.jsx)("span", {
                        className:
                          "block whitespace-nowrap text-micro font-semibold leading-none text-brand-sky",
                        children: "Best next move",
                      }),
                    (0, r.jsx)("span", {
                      className: (0, d.cn)(
                        "block whitespace-nowrap text-caption font-semibold leading-none text-foreground",
                        t && "mt-1",
                      ),
                      children: e.title,
                    }),
                  ],
                }),
                (0, r.jsx)("span", {
                  "aria-hidden": "true",
                  className: (0, d.cn)(
                    "col-start-2 inline-flex h-5 w-fit items-center justify-center rounded-md px-2 text-micro font-semibold",
                    t
                      ? "bg-brand-sky text-brand-black shadow-control"
                      : "bg-foreground/[0.07] text-muted-foreground transition-colors group-hover/next:bg-foreground/[0.11] group-hover/next:text-foreground",
                  ),
                  children: "Add",
                }),
              ],
            }),
            (0, r.jsx)("div", {
              id: o,
              role: "tooltip",
              className: (0, d.cn)(
                "pointer-events-none absolute left-1/2 top-[calc(100%+0.5rem)] layer-dropdown w-max max-w-64 -translate-x-1/2 rounded-lg border border-border/70 bg-popover/98 px-2.5 py-2 text-caption leading-snug text-popover-foreground shadow-overlay transition-[opacity,transform] duration-150 motion-reduce:transition-none",
                l || u
                  ? "translate-y-0 opacity-100"
                  : "translate-y-1 opacity-0",
              ),
              children: e.text,
            }),
            (0, r.jsx)(h.$n, {
              type: "button",
              presentation: "inherit",
              onPointerDown: (e) => e.stopPropagation(),
              onClick: (e) => {
                (e.preventDefault(), e.stopPropagation(), a());
              },
              "aria-label": `Dismiss suggestion: ${e.title}`,
              className:
                "control-focus absolute -right-2 -top-2 flex size-7 items-center justify-center rounded-full bg-card text-muted-foreground opacity-0 shadow-overlay ring-1 ring-border transition-[opacity,color,transform] duration-150 hover:text-destructive focus-visible:opacity-100 group-hover/next:opacity-100 active:scale-[0.96] motion-reduce:transition-none motion-reduce:active:scale-100",
              children: (0, r.jsx)(M.A, {
                "aria-hidden": "true",
                className: "size-3.5",
                strokeWidth: 2.5,
              }),
            }),
          ],
        });
      }
      let es = (0, S.memo)(function ({
        expanded: e,
        onExpand: t,
        onCollapse: n,
        primarySurface: l = !1,
        primaryModeControlHostId: p,
        primaryOverlayPanelHostId: b,
        projectId: y,
        projectName: v,
        onTagMechanic: j,
        onAddSuggestion: w,
        pluginConnected: k = !0,
        isAgentBusy: N = !1,
        onSendToAutoTasks: R,
      }) {
        let F = (0, m.IT)(
            i.FH.gameMemories.getByProject,
            e ? { projectId: y } : "skip",
          ),
          D = (0, m.n_)(i.FH.gameMemories.ensureSeeded),
          B = (0, m.n_)(i.FH.gameMemories.savePositions),
          K = (0, m.n_)(i.FH.gameMemories.moveMechanic),
          et = (0, m.n_)(i.FH.gameMemories.setGameName),
          er = (0, m.n_)(i.FH.gameMemories.renameProjectAndGame),
          es = (0, m.n_)(i.FH.gameMemories.startImport),
          eo = (0, m.n_)(i.FH.gameMemories.dismissSuggestion),
          ec = (0, m.y3)(i.FH.gameMemoryIdeas.generate),
          ed = (0, S.useMemo)(() => {
            let e = new Map();
            for (let t of F?.mechanicIdeas ?? []) e.set(t.mechanicId, t.items);
            return e;
          }, [F?.mechanicIdeas]),
          [eu, em] = (0, S.useState)(null),
          ex = (0, S.useCallback)(
            (e) => {
              (em(e),
                ec({ projectId: y, mechanicId: e })
                  .catch((e) => {
                    console.error("[GameMemoryPanel] generateIdeas failed:", e);
                  })
                  .finally(() => em(null)));
            },
            [ec, y],
          ),
          [eh, ep] = (0, S.useState)(!1),
          eg = F?.importUsed === !0,
          ef = !!F?.importStartedAt && Date.now() - F.importStartedAt < 3e5,
          eb = (0, S.useCallback)(() => {
            (ep(!1),
              es({ projectId: y }).catch((e) => {
                console.error("[GameMemoryPanel] startImport failed:", e);
              }));
          }, [es, y]),
          [ey, ev] = (0, S.useState)(!1),
          ej = (0, S.useRef)(void 0);
        ((0, S.useEffect)(() => {
          if (void 0 === F) {
            ej.current = void 0;
            return;
          }
          let e = F?.agentScheduledAt ?? null;
          if (void 0 === ej.current) {
            ej.current = e;
            return;
          }
          null !== e && e !== ej.current && ((ej.current = e), ev(!0));
        }, [F]),
          (0, S.useEffect)(() => {
            if (!ey) return;
            let e = setTimeout(() => ev(!1), 15e3);
            return () => clearTimeout(e);
          }, [ey]));
        let ew = F
            ? `${F.markdown}\u0000${JSON.stringify(F.suggestions ?? null)}`
            : null,
          ek = (0, S.useRef)(null);
        (0, S.useEffect)(() => {
          let e = ek.current;
          ((ek.current = ew), null !== e && null !== ew && e !== ew && ev(!1));
        }, [ew]);
        let eN = (0, S.useRef)(!1);
        (0, S.useEffect)(() => {
          e &&
            !eN.current &&
            ((eN.current = !0),
            D({ projectId: y }).catch((e) => {
              (console.error("[GameMemoryPanel] seed failed:", e),
                (eN.current = !1));
            }));
        }, [e, y, D]);
        let eM = (0, S.useMemo)(() => (F ? (0, a.bt)(F.markdown) : null), [F]),
          eC = (eM?.mechanics.length ?? 0) > 0,
          { user: eP } = (0, u.Jd)(),
          e$ = (0, m.IT)(
            i.FH.userCredits.getCreditBalance,
            eP?.id ? { clerkUserId: eP.id } : "skip",
          ),
          eI = !!e$ && e$.creditsRemaining < 0.5,
          ez = eg || ef || void 0 === F || !k || eI,
          e_ = (0, S.useRef)(""),
          [eA, eS] = (0, S.useState)(null),
          eE = (0, S.useMemo)(() => {
            if (!eM) return null;
            let e = (0, s.Es)(eM);
            if (0 === e.length && !eA) return eM;
            let t = new Map(e.map((e) => [e.id, e]));
            return {
              ...eM,
              mechanics: eM.mechanics.map((e) =>
                eA && e.id === eA.id
                  ? { ...e, pos: { x: eA.x, y: eA.y } }
                  : e.pos
                    ? e
                    : { ...e, pos: t.get(e.id) ?? null },
              ),
            };
          }, [eM, eA]),
          eT = (0, S.useMemo)(
            () =>
              eE
                ? eE.mechanics
                    .flatMap((e) => e.connects.map((t) => Z(e.id, t)))
                    .sort()
                    .join("|")
                : "",
            [eE],
          ),
          eR = (0, S.useRef)(null),
          { activeIds: eF, enqueue: eD } = (0, T.W)({
            limit: T.F$,
            activeMs: 1500,
          });
        ((0, S.useEffect)(() => {
          if (!eE) {
            eR.current = null;
            return;
          }
          let e = new Set(
              eE.mechanics.flatMap((e) => e.connects.map((t) => Z(e.id, t))),
            ),
            t = eR.current;
          if (((eR.current = e), !t)) return;
          let n = [];
          for (let r of e) t.has(r) || n.push(r);
          eD(n);
        }, [eD, eE, eT]),
          (0, S.useEffect)(() => {
            if (!eM) return;
            let e = (0, s.Es)(eM);
            if (0 === e.length) return;
            let t = e.map((e) => e.id).join(",");
            e_.current !== t &&
              ((e_.current = t),
              B({ projectId: y, positions: e }).catch((e) => {
                (console.error("[GameMemoryPanel] savePositions failed:", e),
                  (e_.current = ""));
              }));
          }, [eM, y, B]));
        let {
            activeIds: eL,
            hiddenIds: eW,
            recentlyCompletedIds: eG,
            enqueue: eO,
            reset: eX,
          } = (0, T.W)({ limit: T.QJ, activeMs: 3300, settleMs: 1500 }),
          eH = (0, S.useRef)(null);
        (0, S.useLayoutEffect)(() => {
          if (!eE) {
            ((eH.current = null), eX());
            return;
          }
          let e = new Map(
              eE.mechanics.map((e) => [
                e.id,
                new Set(e.satellites.map((e) => e.id)),
              ]),
            ),
            t = eH.current;
          if (((eH.current = e), !t)) return;
          let n = new Set();
          for (let [r, i] of e) {
            let e = t.get(r);
            if (!e) {
              n.add(r);
              continue;
            }
            for (let t of i)
              if (!e.has(t)) {
                n.add(r);
                break;
              }
          }
          0 !== n.size && eO(n);
        }, [eO, eE, eX]);
        let eB = (0, S.useMemo)(() => F?.suggestions ?? [], [F]),
          eY = (0, S.useMemo)(
            () => (eE && eB.length > 0 ? (0, s.K1)(eE, eB) : []),
            [eE, eB],
          ),
          [eZ, eU] = (0, S.useState)({}),
          eq = (0, S.useMemo)(
            () =>
              eB.map(
                (e) => `${e.title}
${e.text}`,
              ),
            [eB],
          ),
          eV = (0, S.useMemo)(
            () => eY.map((e, t) => eZ[eq[t]] ?? e),
            [eY, eq, eZ],
          );
        (0, S.useEffect)(() => {
          let e = new Set(eq);
          eU((t) => {
            let n = Object.entries(t).filter(([t]) => e.has(t));
            return n.length === Object.keys(t).length
              ? t
              : Object.fromEntries(n);
          });
        }, [eq]);
        let eQ = (0, S.useMemo)(() => {
            if (!eE || 0 === eB.length) return [];
            let e = new Map(
              eE.mechanics.filter((e) => e.pos).map((e) => [e.id, e.pos]),
            );
            return eB.flatMap((t, n) => {
              let r = eV[n];
              if (!r) return [];
              let i = (t.anchorId && e.get(t.anchorId)) || null;
              return [
                {
                  x1: (i?.x ?? 0) * 0.75,
                  y1: (i?.y ?? 0) * 0.75,
                  x2: 0.75 * r.x,
                  y2: 0.75 * r.y,
                  fromCenter: !i,
                  anchorId: i ? (t.anchorId ?? null) : null,
                  sugIndex: n,
                },
              ];
            });
          }, [eE, eB, eV]),
          {
            viewportRef: eK,
            scale: eJ,
            worldTransform: e0,
            isPanning: e1,
            handlePointerDown: e5,
            handlePointerMove: e2,
            handlePointerUp: e3,
            handleWheel: e4,
            zoomBy: e7,
          } = (0, T.KV)({ expanded: e, minZoom: 0.6, maxZoom: 2.5 }),
          e6 = (0, T.FO)(eK, e),
          e8 = (0, T.q_)(e),
          e9 = (0, S.useMemo)(
            () => eE?.mechanics.reduce((e, t) => e + t.connects.length, 0) ?? 0,
            [eE],
          ),
          te = e1 || null !== eA,
          tt = e6 && !te && !N && !e8 && 0 === eL.size,
          tn = eL.size ? eL.size : tt ? eF.size || Math.min(e9, T.X) : 0;
        (0, T.Oc)({
          enabled: e && null !== eE,
          surface: l ? "immersive" : "sidebar",
          nodeCount: eE?.mechanics.length ?? 0,
          edgeCount: e9,
          activeAnimationCount: tn,
        });
        let [tr, ti] = (0, S.useState)(!1),
          [ta, ts] = (0, S.useState)(""),
          to = (0, S.useRef)(null),
          tl = v?.trim() || eE?.gameName.trim() || "Game name",
          tc = G(tr ? ta : tl);
        (0, S.useEffect)(() => {
          tr && (to.current?.focus(), to.current?.select());
        }, [tr]);
        let td = (0, S.useCallback)(() => {
            let e = ta.trim();
            (ti(!1),
              e &&
                e !== tl &&
                (v
                  ? er({ projectId: y, name: e })
                  : et({ projectId: y, name: e })
                ).catch((e) => {
                  (console.error("[GameMemoryPanel] rename failed:", e),
                    E.oR.error("Couldn’t rename the project"));
                }));
          }, [tl, ta, y, v, er, et]),
          tu = k && !N,
          tm = (0, S.useRef)(!1),
          tx = (0, S.useRef)(null),
          th = (0, S.useRef)(null),
          tp = (0, S.useRef)(null);
        (0, S.useEffect)(
          () => () => {
            null !== tp.current && cancelAnimationFrame(tp.current);
          },
          [],
        );
        let tg = (0, S.useCallback)(
            (e) => {
              if (tm.current) {
                tm.current = !1;
                return;
              }
              eE &&
                tu &&
                j?.({ id: e.id, title: e.title, context: (0, a.eg)(eE, e.id) });
            },
            [eE, j, tu],
          ),
          tf = (0, S.useRef)(null),
          tb = (0, S.useRef)(null);
        (0, S.useEffect)(
          () => () => {
            null !== tb.current && cancelAnimationFrame(tb.current);
          },
          [],
        );
        let ty = (0, S.useCallback)(
            (e, t) => {
              0 === e.button &&
                t.pos &&
                tu &&
                ((tm.current = !1),
                (tf.current = {
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
            [tu],
          ),
          tv = (0, S.useCallback)(
            (e) => {
              let t = tf.current;
              if (!t) return;
              if ((1 & e.buttons) == 0) {
                tf.current = null;
                return;
              }
              let n = e.clientX - t.startX,
                r = e.clientY - t.startY;
              if (!t.moved && 4 > Math.hypot(n, r)) return;
              (t.moved || tC(null), (t.moved = !0));
              let i = 0.75 * eJ.get();
              ((t.x = t.originX + n / i),
                (t.y = t.originY + r / i),
                null === tb.current &&
                  (tb.current = requestAnimationFrame(() => {
                    tb.current = null;
                    let e = tf.current;
                    e?.moved && eS({ id: e.id, x: e.x, y: e.y });
                  })));
            },
            [eJ],
          ),
          tj = (0, S.useCallback)(() => {
            let e = tf.current;
            ((tf.current = null),
              e?.moved &&
                (null !== tb.current &&
                  (cancelAnimationFrame(tb.current), (tb.current = null)),
                eS({ id: e.id, x: e.x, y: e.y }),
                (tm.current = !0),
                K({
                  projectId: y,
                  mechanicId: e.id,
                  x: Math.round(e.x),
                  y: Math.round(e.y),
                })
                  .catch((e) => {
                    console.error("[GameMemoryPanel] moveMechanic failed:", e);
                  })
                  .finally(() => eS(null))));
          }, [K, y]),
          tw = (0, S.useCallback)(
            (e, t) => {
              if (0 !== e.button) return;
              let n = eV[t],
                r = eq[t];
              n &&
                r &&
                ((tx.current = null),
                (th.current = {
                  index: t,
                  key: r,
                  startX: e.clientX,
                  startY: e.clientY,
                  originX: n.x,
                  originY: n.y,
                  x: n.x,
                  y: n.y,
                  moved: !1,
                }),
                e.currentTarget.setPointerCapture(e.pointerId));
            },
            [eq, eV],
          ),
          tk = (0, S.useCallback)(
            (e) => {
              let t = th.current;
              if (!t) return;
              if ((1 & e.buttons) == 0) {
                th.current = null;
                return;
              }
              let n = e.clientX - t.startX,
                r = e.clientY - t.startY;
              if (!t.moved && 4 > Math.hypot(n, r)) return;
              t.moved = !0;
              let i = 0.75 * eJ.get();
              ((t.x = t.originX + n / i),
                (t.y = t.originY + r / i),
                null === tp.current &&
                  (tp.current = requestAnimationFrame(() => {
                    tp.current = null;
                    let e = th.current;
                    e?.moved &&
                      eU((t) => ({ ...t, [e.key]: { x: e.x, y: e.y } }));
                  })));
            },
            [eJ],
          ),
          tN = (0, S.useCallback)((e) => {
            let t = th.current;
            if (((th.current = null), t)) {
              if (t.moved) {
                (null !== tp.current &&
                  (cancelAnimationFrame(tp.current), (tp.current = null)),
                  (tx.current = t.index),
                  eU((e) => ({ ...e, [t.key]: { x: t.x, y: t.y } })));
                return;
              }
              e &&
                (e(),
                (tx.current = t.index),
                window.setTimeout(() => {
                  tx.current === t.index && (tx.current = null);
                }, 0));
            }
          }, []),
          [tM, tC] = (0, S.useState)(null),
          [tP, t$] = (0, S.useState)(null),
          [tI, tz] = (0, S.useState)(null),
          [t_, tA] = (0, S.useState)(null);
        (0, S.useEffect)(() => tA(null), [e1, k]);
        let tS = (0, S.useCallback)((e) => tA(k ? null : e), [k]),
          tE = (0, S.useMemo)(() => {
            let e = new Map();
            for (let t of eE?.mechanics ?? [])
              e.set(t.id, t.satellites.length + (ed.get(t.id)?.length ?? 0));
            return e;
          }, [eE, ed]),
          tT = (0, S.useMemo)(() => {
            let e = eE?.mechanics ?? [],
              t = eE ? e.filter((e) => !(0, s.qf)(eE, e)).length : 0;
            return [
              {
                id: "connect",
                label: "Prompt and connect 5 mechanics",
                compactLabel: "Mechanics linked",
                done: t,
                target: 5,
                locked: !1,
              },
              {
                id: "refine",
                label: "Add 4 semi-nodes to 5 mechanics",
                compactLabel: "Refine",
                done: e.filter((e) => e.satellites.length >= 4).length,
                target: 5,
                locked: t < 5,
              },
            ];
          }, [eE]),
          tR = tM && (tE.get(tM) ?? 0) > 0 ? tM : null,
          tF = null !== tR || null !== tP || ey,
          [tD, tL] = (0, S.useState)(null),
          [tW, tG] = (0, S.useState)(null),
          [tO, tX] = (0, S.useState)(null),
          tH = (0, S.useRef)(null);
        ((0, S.useCallback)((e) => {
          (tH.current && clearTimeout(tH.current), tG(e));
        }, []),
          (0, S.useCallback)(() => {
            (tH.current && clearTimeout(tH.current),
              (tH.current = setTimeout(() => {
                (tG(null), tX(null));
              }, 120)));
          }, []),
          (0, S.useEffect)(
            () => () => {
              tH.current && clearTimeout(tH.current);
            },
            [],
          ),
          (0, S.useCallback)(
            (e) => {
              (R?.({ mechanicId: e.id, mechanicTitle: e.title }),
                tX(e.id),
                tH.current && clearTimeout(tH.current),
                (tH.current = setTimeout(() => {
                  (tG(null), tX(null));
                }, 1600)));
            },
            [R],
          ));
        let tB = (0, S.useRef)(null),
          tY = (0, S.useCallback)((e) => {
            tf.current?.moved ||
              (tB.current && clearTimeout(tB.current), tC(e));
          }, []),
          tZ = (0, S.useCallback)(() => {
            (tB.current && clearTimeout(tB.current),
              (tB.current = setTimeout(() => tC(null), 100)));
          }, []);
        (0, S.useEffect)(
          () => () => {
            tB.current && clearTimeout(tB.current);
          },
          [],
        );
        let tU = (0, S.useMemo)(() => {
            if (!eE || !tR) return null;
            let e = eE.mechanics.find((e) => e.id === tR);
            return e?.pos ? { x: 0.75 * e.pos.x, y: 0.75 * e.pos.y } : null;
          }, [eE, tR]),
          tq = (0, S.useMemo)(() => {
            let e = new Map();
            if (!eE || !tU) return e;
            for (let t of eE.mechanics) {
              if (t.id === tR || !t.pos) continue;
              let n = J(0.75 * t.pos.x, 0.75 * t.pos.y, tU.x, tU.y);
              n && e.set(t.id, n);
            }
            return e;
          }, [eE, tR, tU]),
          tV = (0, S.useMemo)(
            () =>
              tU
                ? eV.map((e) =>
                    e ? J(0.75 * e.x, 0.75 * e.y, tU.x, tU.y) : null,
                  )
                : [],
            [eV, tU],
          ),
          tQ = (0, S.useCallback)(
            (e, t) => {
              eE &&
                tu &&
                j?.({
                  id: t.id,
                  title: t.title,
                  context: (0, a.dH)(eE, e, t.id),
                });
            },
            [eE, j, tu],
          );
        return e
          ? (0, r.jsxs)("div", {
              className: (0, d.cn)(
                "game-map-surface relative flex flex-1 flex-col overflow-hidden",
                l && "h-full w-full",
              ),
              children: [
                !l &&
                  (0, r.jsxs)("div", {
                    className:
                      "flex shrink-0 items-center gap-2 px-3 pb-3 pt-3",
                    children: [
                      (0, r.jsx)("button", {
                        type: "button",
                        onClick: n,
                        "aria-label": "Collapse game map",
                        className: (0, d.cn)(
                          "inline-flex items-center justify-center whitespace-nowrap",
                          "text-body font-medium transition-colors",
                          "focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring",
                          "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
                          "border shadow-xs h-9 w-9 text-foreground border-border rounded-xl",
                          "bg-transparent hover:bg-accent hover:text-accent-foreground",
                        ),
                        children: (0, r.jsx)(P.A, { className: "w-4 h-4" }),
                      }),
                      (0, r.jsxs)("div", {
                        className: (0, d.cn)(
                          "inline-flex items-center justify-center flex-1 min-w-0 gap-2 whitespace-nowrap",
                          "text-body font-medium transition-colors",
                          "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
                          "border shadow-xs h-9 text-foreground border-border rounded-xl bg-white/5",
                        ),
                        children: [
                          (0, r.jsx)(C.A, { className: "w-4 h-4" }),
                          (0, r.jsx)("span", {
                            className: "truncate",
                            children: "Game Map",
                          }),
                        ],
                      }),
                    ],
                  }),
                (0, r.jsxs)("div", {
                  ref: eK,
                  className:
                    "relative flex-1 overflow-hidden cursor-grab active:cursor-grabbing select-none",
                  style: { touchAction: "none" },
                  onPointerDown: e5,
                  onPointerMove: e2,
                  onPointerUp: e3,
                  onPointerCancel: e3,
                  onWheel: e4,
                  children: [
                    (0, r.jsxs)("div", {
                      className: "absolute inset-x-3 top-3 z-50 @container",
                      children: [
                        (0, r.jsxs)("div", {
                          className: "flex items-center gap-3",
                          children: [
                            l &&
                              (0, r.jsx)("div", {
                                className: "layer-overlay min-w-0",
                                children: (0, r.jsx)(U, {
                                  graph: eE,
                                  projectName: v,
                                }),
                              }),
                            l &&
                              p &&
                              (0, r.jsx)("div", {
                                id: p,
                                "data-gm-interactive": !0,
                                className: "layer-overlay min-w-0 shrink-0",
                              }),
                            (0, r.jsxs)("div", {
                              className:
                                "ml-auto flex shrink-0 items-center gap-2",
                              children: [
                                eE &&
                                  l &&
                                  (0, r.jsx)(Y, { quests: tT, compact: !0 }),
                                !l &&
                                  (0, r.jsx)(en, {
                                    scale: eJ,
                                    onZoomIn: () => e7(1.1),
                                    onZoomOut: () => e7(1 / 1.1),
                                  }),
                                (0, r.jsxs)("button", {
                                  type: "button",
                                  "data-gm-interactive": !0,
                                  onClick: () => {
                                    ez || ep(!0);
                                  },
                                  "aria-label": "Import game",
                                  "aria-disabled": ez,
                                  title: eg
                                    ? "This project's game has already been imported"
                                    : k
                                      ? eI
                                        ? "You need at least 0.5 credits to import"
                                        : "Read this project's scripts and rebuild the map from them. Billed at what the read actually costs."
                                      : "Connect the Studio plugin to import this game",
                                  className: (0, d.cn)(
                                    "flex items-center gap-1.5",
                                    l
                                      ? "h-10 rounded-xl px-3 @max-[440px]:w-10 @max-[440px]:justify-center @max-[440px]:px-0"
                                      : "rounded-lg px-2.5 py-1.5",
                                    "font-medium",
                                    l ? "text-body" : "text-compact-body",
                                    "focus:outline-hidden focus:ring-3 focus:ring-ring/25",
                                    l
                                      ? "bg-foreground text-background shadow-control ring-1 ring-foreground/10"
                                      : "border border-white/10 bg-shimmer-surface-soft bg-size-[400%_100%] text-white/70",
                                    ez
                                      ? "cursor-not-allowed opacity-60"
                                      : l
                                        ? "transition-[transform,background-color] hover:bg-foreground/90 active:scale-[0.97] motion-reduce:transform-none"
                                        : "transition-colors hover:border-white/30 hover:bg-white/15 hover:text-white",
                                  ),
                                  children: [
                                    (0, r.jsx)($.A, {
                                      className: (0, d.cn)(
                                        "shrink-0",
                                        l ? "size-4" : "size-3.5",
                                      ),
                                    }),
                                    (0, r.jsx)("span", {
                                      className: (0, d.cn)(
                                        l && "@max-[440px]:hidden",
                                      ),
                                      children: "Import Game",
                                    }),
                                    eI &&
                                      (0, r.jsxs)("span", {
                                        className: (0, d.cn)(
                                          l && "@max-[700px]:hidden",
                                          l
                                            ? "text-background/60"
                                            : "text-white/40",
                                        ),
                                        children: ["(min. ", 0.5, " credits)"],
                                      }),
                                  ],
                                }),
                              ],
                            }),
                          ],
                        }),
                        l && b && (0, r.jsx)("div", { id: b }),
                      ],
                    }),
                    l &&
                      (0, r.jsx)("div", {
                        className: "absolute bottom-3 left-3 z-50",
                        children: (0, r.jsx)(en, {
                          floating: !0,
                          scale: eJ,
                          onZoomIn: () => e7(1.1),
                          onZoomOut: () => e7(1 / 1.1),
                        }),
                      }),
                    (0, r.jsx)(x.lG, {
                      open: eh,
                      onOpenChange: ep,
                      children: (0, r.jsxs)(x.Cf, {
                        showCloseButton: !1,
                        onPointerDown: (e) => {
                          e.stopPropagation();
                        },
                        className: "max-w-md",
                        children: [
                          (0, r.jsxs)(x.c7, {
                            children: [
                              (0, r.jsx)(x.L3, { children: "Import game?" }),
                              (0, r.jsx)(x.rr, {
                                children:
                                  "Build the map from this project's existing Roblox scripts. Fresh projects have nothing to import.",
                              }),
                            ],
                          }),
                          (0, r.jsxs)("div", {
                            className:
                              "flex items-center gap-2 rounded-2xl bg-muted/65 px-3.5 py-3 text-body text-muted-foreground ring-1 ring-inset ring-border/55",
                            children: [
                              (0, r.jsx)(I.A, {
                                "aria-hidden": "true",
                                className: "size-4 shrink-0",
                              }),
                              (0, r.jsx)("span", {
                                children: "Usually costs 0.5–1 credits",
                              }),
                            ],
                          }),
                          eC &&
                            (0, r.jsxs)("div", {
                              className:
                                "flex items-center gap-2 rounded-2xl bg-destructive/[0.06] px-3.5 py-3 text-body text-destructive ring-1 ring-inset ring-destructive/15",
                              children: [
                                (0, r.jsx)(z.A, {
                                  "aria-hidden": "true",
                                  className: "size-4 shrink-0",
                                }),
                                (0, r.jsx)("span", {
                                  children:
                                    "This replaces your current game map.",
                                }),
                              ],
                            }),
                          (0, r.jsxs)(x.Es, {
                            children: [
                              (0, r.jsx)(h.$n, {
                                type: "button",
                                variant: "secondary",
                                onClick: () => ep(!1),
                                children: "Cancel",
                              }),
                              (0, r.jsxs)(h.$n, {
                                type: "button",
                                onClick: eb,
                                children: [
                                  (0, r.jsx)($.A, {
                                    "aria-hidden": "true",
                                    className: "size-4",
                                  }),
                                  "Import game",
                                ],
                              }),
                            ],
                          }),
                        ],
                      }),
                    }),
                    (0, r.jsx)(g.N, {
                      children:
                        ef &&
                        (0, r.jsxs)(f.P.div, {
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
                    (0, r.jsx)(g.N, {
                      children:
                        ey &&
                        eE &&
                        (0, r.jsxs)(f.P.div, {
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
                    eE
                      ? (0, r.jsxs)(f.P.div, {
                          "data-game-map-world": !0,
                          "data-panning": e1 || void 0,
                          className: "absolute left-0 top-0",
                          style: {
                            transform: e0,
                            transformOrigin: "0 0",
                            willChange: "transform",
                            backfaceVisibility: "hidden",
                          },
                          children: [
                            (0, r.jsx)(el, {
                              graph: eE,
                              suggestionSpokes: eQ,
                              hiddenIds: eW,
                              celebratingIds: eG,
                              celebratingEdgeKeys: eF,
                              pushOffsets: tq,
                              suggestionPushOffsets: tV,
                              dragging: null !== eA,
                              motionEnabled: tt,
                              dimmed: tF,
                              immersive: l,
                              hoveredSuggestionIndex: tI,
                            }),
                            (0, r.jsxs)("div", {
                              "data-gm-interactive": !0,
                              className:
                                "absolute flex flex-col items-center transition-[left,width,opacity] duration-150 motion-reduce:transition-none",
                              style: {
                                left: -tc / 2,
                                top: -32.5,
                                width: tc,
                                opacity: tF ? 0.35 : 1,
                              },
                              children: [
                                (0, r.jsx)("div", {
                                  className: "group flex flex-col items-center",
                                  children: (0, r.jsx)(ei, {
                                    size: 65,
                                    shadow: "0 2px 10px rgba(0,0,0,0.35)",
                                    className: (0, d.cn)(
                                      !te &&
                                        "transition-[filter] group-hover:brightness-125 motion-reduce:transition-none",
                                    ),
                                    children: (0, r.jsx)(A.default, {
                                      src: F?.centerIcon
                                        ? `/game-memory-icons/${F.centerIcon}.png`
                                        : "/game-memory-icons/planet.png",
                                      alt: "",
                                      width: 36,
                                      height: 36,
                                      draggable: !1,
                                    }),
                                  }),
                                }),
                                tr
                                  ? (0, r.jsx)("input", {
                                      ref: to,
                                      value: ta,
                                      maxLength: 32,
                                      onChange: (e) => ts(e.target.value),
                                      onBlur: td,
                                      onKeyDown: (e) => {
                                        "Enter" === e.key
                                          ? (e.preventDefault(), td())
                                          : "Escape" === e.key &&
                                            (e.preventDefault(), ti(!1));
                                      },
                                      placeholder: "Game name",
                                      className: (0, d.cn)(
                                        "mt-2 h-8 w-full rounded-xl border border-border/60 bg-background/92 px-2.5 py-0 shadow-overlay",
                                        "text-caption font-medium text-neutral-200",
                                        "outline-hidden placeholder:text-neutral-500",
                                        "focus-visible:ring-2 focus-visible:ring-brand-sky/60",
                                      ),
                                    })
                                  : (0, r.jsxs)("div", {
                                      className:
                                        "mt-2 flex h-8 w-full items-center gap-1 rounded-xl border border-border/60 bg-background/92 pl-2.5 pr-1 shadow-overlay",
                                      children: [
                                        (0, r.jsx)("span", {
                                          className:
                                            "min-w-0 truncate text-caption font-medium text-neutral-200",
                                          children: tl,
                                        }),
                                        (0, r.jsx)(h.$n, {
                                          type: "button",
                                          presentation: "inherit",
                                          onClick: () => {
                                            (ts(tl), ti(!0));
                                          },
                                          "aria-label": `Rename ${tl}`,
                                          title: "Rename project",
                                          className:
                                            "size-6 shrink-0 rounded-lg text-neutral-400 outline-hidden transition-[background-color,color,transform] duration-150 hover:bg-white/10 hover:text-white focus-visible:ring-2 focus-visible:ring-brand-sky/60 active:scale-[0.96] motion-reduce:transition-none motion-reduce:active:scale-100",
                                          children: (0, r.jsx)(_.A, {
                                            "aria-hidden": "true",
                                            className: "size-3",
                                          }),
                                        }),
                                      ],
                                    }),
                              ],
                            }),
                            eE.mechanics.map((e) => {
                              if (!e.pos || eW.has(e.id)) return null;
                              let t =
                                  eE.mechanics.length >= 4 && (0, s.qf)(eE, e),
                                n = ed.get(e.id),
                                i = [
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
                                a = tM === e.id,
                                c = i.length > 0 && a,
                                u = (function (e) {
                                  let t = !1,
                                    n = !1;
                                  for (let r = 0; r < e; r++) {
                                    let i = Math.sin((q(r, e) * Math.PI) / 180);
                                    i < -0.1 ? (t = !0) : i > 0.1 && (n = !0);
                                  }
                                  return { up: t, down: n };
                                })(i.length),
                                m = eu === e.id || n?.length === 0,
                                x = !n && e.satellites.length < 4,
                                h = a && (x || m),
                                p = tq.get(e.id);
                              return (0, r.jsxs)(
                                f.P.div,
                                {
                                  "data-gm-interactive": !0,
                                  initial: !!eG.has(e.id) && {
                                    scale: l ? 0.86 : 0.2,
                                    opacity: 0,
                                  },
                                  animate: {
                                    scale: 1,
                                    opacity:
                                      tF && e.id !== tR && e.id !== tP
                                        ? 0.35
                                        : 1,
                                    x: p?.x ?? 0,
                                    y: p?.y ?? 0,
                                  },
                                  transition: { ...V, opacity: Q },
                                  className: (0, d.cn)(
                                    "absolute flex flex-col items-center",
                                    c && "z-30",
                                    tP === e.id && "z-40",
                                  ),
                                  style: {
                                    left: 0.75 * e.pos.x - 60,
                                    top: 0.75 * e.pos.y - 21.5,
                                    width: 120,
                                  },
                                  onMouseLeave: tZ,
                                  children: [
                                    c &&
                                      (u.up || u.down) &&
                                      (0, r.jsx)("div", {
                                        className: "absolute -z-10",
                                        style: {
                                          top: u.up ? -X : 0,
                                          bottom: u.down ? -X : 0,
                                          left: H,
                                          right: H,
                                        },
                                      }),
                                    (0, r.jsx)(o.TooltipProvider, {
                                      delayDuration: 0,
                                      children: (0, r.jsxs)(o.m_, {
                                        delayDuration: 0,
                                        open: !k && t_ === e.id,
                                        children: [
                                          (0, r.jsx)(o.k$, {
                                            asChild: !0,
                                            children: (0, r.jsxs)("button", {
                                              type: "button",
                                              onClick: () => tg(e),
                                              onPointerEnter: () => tS(e.id),
                                              onPointerLeave: () => tA(null),
                                              onPointerDown: (t) => ty(t, e),
                                              onPointerMove: tv,
                                              onPointerUp: tj,
                                              onPointerCancel: tj,
                                              onLostPointerCapture: tj,
                                              style: { touchAction: "none" },
                                              className: (0, d.cn)(
                                                "flex flex-col items-center",
                                                tu
                                                  ? "cursor-grab active:cursor-grabbing"
                                                  : "cursor-not-allowed",
                                              ),
                                              "aria-label": tu
                                                ? `Tag ${e.title} in chat`
                                                : "Connect the Roblox Studio plugin to interact",
                                              children: [
                                                (0, r.jsxs)("div", {
                                                  className:
                                                    "group relative transition-transform hover:scale-125",
                                                  onMouseEnter: () => tY(e.id),
                                                  children: [
                                                    l &&
                                                      eG.has(e.id) &&
                                                      (0, r.jsx)(f.P.span, {
                                                        "aria-hidden": "true",
                                                        initial: {
                                                          opacity: 0.8,
                                                          transform:
                                                            "scale(0.86)",
                                                        },
                                                        animate: {
                                                          opacity: 0,
                                                          transform:
                                                            "scale(1.75)",
                                                        },
                                                        transition: {
                                                          duration: 0.8,
                                                          ease: [
                                                            0.23, 1, 0.32, 1,
                                                          ],
                                                        },
                                                        className:
                                                          "pointer-events-none absolute inset-0 rounded-full ring-2 ring-brand-sky/70",
                                                      }),
                                                    (0, r.jsx)(ei, {
                                                      size: 43,
                                                      shadow:
                                                        "0 2px 8px rgba(0,0,0,0.3)",
                                                      className:
                                                        "transition-[filter] group-hover:brightness-125 motion-reduce:transition-none",
                                                      children: (0, r.jsx)(
                                                        A.default,
                                                        {
                                                          src: e.icon
                                                            ? `/game-memory-icons/${e.icon}.png`
                                                            : (0, s.ll)(e),
                                                          alt: "",
                                                          width: 20,
                                                          height: 20,
                                                          draggable: !1,
                                                        },
                                                      ),
                                                    }),
                                                    (0, r.jsx)(A.default, {
                                                      src: "/game-memory-icons/verified.png",
                                                      alt: "Added to game",
                                                      width: 18,
                                                      height: 18,
                                                      draggable: !1,
                                                      className:
                                                        "absolute -top-1 -right-1",
                                                    }),
                                                    (h || m || i.length > 0) &&
                                                      (0, r.jsx)(
                                                        o.TooltipProvider,
                                                        {
                                                          delayDuration: 0,
                                                          children: (0, r.jsxs)(
                                                            o.m_,
                                                            {
                                                              open:
                                                                h &&
                                                                !m &&
                                                                tD === e.id,
                                                              children: [
                                                                (0, r.jsx)(
                                                                  o.k$,
                                                                  {
                                                                    asChild: !0,
                                                                    children:
                                                                      (0,
                                                                      r.jsx)(
                                                                        "span",
                                                                        {
                                                                          role: h
                                                                            ? "button"
                                                                            : void 0,
                                                                          onPointerEnter:
                                                                            () =>
                                                                              tL(
                                                                                e.id,
                                                                              ),
                                                                          onPointerLeave:
                                                                            () =>
                                                                              tL(
                                                                                null,
                                                                              ),
                                                                          onPointerDown:
                                                                            h &&
                                                                            !m
                                                                              ? (
                                                                                  e,
                                                                                ) => {
                                                                                  e.stopPropagation();
                                                                                }
                                                                              : void 0,
                                                                          onClick:
                                                                            h &&
                                                                            !m
                                                                              ? (
                                                                                  t,
                                                                                ) => {
                                                                                  (t.preventDefault(),
                                                                                    t.stopPropagation(),
                                                                                    ex(
                                                                                      e.id,
                                                                                    ));
                                                                                }
                                                                              : void 0,
                                                                          className:
                                                                            (0,
                                                                            d.cn)(
                                                                              "absolute -top-1 -left-1 min-w-[16px] h-4 px-1 rounded-full text-micro font-bold leading-none flex items-center justify-center transition-colors",
                                                                              h &&
                                                                                !m
                                                                                ? "cursor-pointer bg-white/25 border border-white/50 hover:bg-white/50 hover:border-white/80"
                                                                                : "pt-px border",
                                                                            ),
                                                                          style:
                                                                            {
                                                                              ...(h &&
                                                                              !m
                                                                                ? {}
                                                                                : {
                                                                                    backgroundColor:
                                                                                      "var(--color-map-node)",
                                                                                    borderColor:
                                                                                      "rgba(0,0,0,0.168)",
                                                                                  }),
                                                                              color:
                                                                                h ||
                                                                                m
                                                                                  ? "#FFFFFF"
                                                                                  : "rgba(255,255,255,0.4)",
                                                                            },
                                                                          children:
                                                                            m
                                                                              ? (0,
                                                                                r.jsxs)(
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
                                                                                                i.length,
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
                                                                              : h
                                                                                ? (0,
                                                                                  r.jsxs)(
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
                                                                                                  i.length,
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
                                                                                : `+${i.length}`,
                                                                        },
                                                                      ),
                                                                  },
                                                                ),
                                                                h &&
                                                                  !m &&
                                                                  (0, r.jsx)(
                                                                    o.ZI,
                                                                    {
                                                                      side: "top",
                                                                      className:
                                                                        (0,
                                                                        d.cn)(
                                                                          "max-w-[220px] text-center",
                                                                          ee,
                                                                          "text-caption",
                                                                        ),
                                                                      children:
                                                                        "Generate suggestions to improve this core mechanic.",
                                                                    },
                                                                  ),
                                                              ],
                                                            },
                                                          ),
                                                        },
                                                      ),
                                                    t &&
                                                      (0, r.jsx)(
                                                        o.TooltipProvider,
                                                        {
                                                          delayDuration: 0,
                                                          children: (0, r.jsxs)(
                                                            o.m_,
                                                            {
                                                              delayDuration: 0,
                                                              children: [
                                                                (0, r.jsx)(
                                                                  o.k$,
                                                                  {
                                                                    asChild: !0,
                                                                    children:
                                                                      (0,
                                                                      r.jsx)(
                                                                        z.A,
                                                                        {
                                                                          className:
                                                                            "absolute -right-0.5 -bottom-0.5 h-4 w-4 fill-destructive text-destructive-foreground [&>circle]:stroke-destructive-hover",
                                                                        },
                                                                      ),
                                                                  },
                                                                ),
                                                                (0, r.jsx)(
                                                                  o.ZI,
                                                                  {
                                                                    side: "bottom",
                                                                    className:
                                                                      (0, d.cn)(
                                                                        "max-w-[230px] text-center",
                                                                        ee,
                                                                        "text-caption",
                                                                        "border-destructive/50 bg-destructive/10 text-destructive",
                                                                      ),
                                                                    children:
                                                                      "This mechanic is too isolated. Connect it to your game systems or remove it. Simplicity wins on Roblox.",
                                                                  },
                                                                ),
                                                              ],
                                                            },
                                                          ),
                                                        },
                                                      ),
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
                                          !k &&
                                            (0, r.jsx)(o.ZI, {
                                              side: "bottom",
                                              className: (0, d.cn)(
                                                "text-center",
                                                ee,
                                              ),
                                              children:
                                                "Connect the Roblox Studio plugin to interact",
                                            }),
                                        ],
                                      }),
                                    }),
                                    (0, r.jsx)(g.N, {
                                      children:
                                        c &&
                                        i.map(
                                          ({ key: t, sat: n, idea: a }, l) => {
                                            let c =
                                                (q(l, i.length) * Math.PI) /
                                                180,
                                              u = 60 + 70 * Math.cos(c),
                                              m = 21.5 + 70 * Math.sin(c);
                                            return (0, r.jsx)(
                                              f.P.div,
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
                                                  delay: 0.05 * l,
                                                },
                                                className:
                                                  "group/satnode absolute flex flex-col items-center",
                                                style: {
                                                  left: u - 40,
                                                  top: m - 16,
                                                  width: 80,
                                                },
                                                children: (0, r.jsx)("div", {
                                                  className: (0, d.cn)(
                                                    "flex flex-col items-center",
                                                    a &&
                                                      "opacity-50 transition-opacity group-hover/satnode:opacity-90",
                                                  ),
                                                  children: (0, r.jsx)(
                                                    o.TooltipProvider,
                                                    {
                                                      delayDuration: 0,
                                                      children: (0, r.jsxs)(
                                                        o.m_,
                                                        {
                                                          delayDuration: 0,
                                                          open:
                                                            !k &&
                                                            t_ ===
                                                              `${e.id}/${t}`,
                                                          children: [
                                                            (0, r.jsx)(o.k$, {
                                                              asChild: !0,
                                                              children: (0,
                                                              r.jsxs)(
                                                                "button",
                                                                {
                                                                  type: "button",
                                                                  onClick:
                                                                    () => {
                                                                      tu &&
                                                                        (a
                                                                          ? w?.(
                                                                              {
                                                                                text: a.text,
                                                                                title:
                                                                                  a.title,
                                                                              },
                                                                            )
                                                                          : n &&
                                                                            tQ(
                                                                              e.id,
                                                                              n,
                                                                            ));
                                                                    },
                                                                  onPointerEnter:
                                                                    () =>
                                                                      tS(
                                                                        `${e.id}/${t}`,
                                                                      ),
                                                                  onPointerLeave:
                                                                    () =>
                                                                      tA(null),
                                                                  className: (0,
                                                                  d.cn)(
                                                                    "flex flex-col items-center group/sat",
                                                                    !tu &&
                                                                      "cursor-not-allowed",
                                                                  ),
                                                                  "aria-label":
                                                                    tu
                                                                      ? a
                                                                        ? `Add suggestion: ${a.title}`
                                                                        : `Tag ${n?.title ?? ""} in chat`
                                                                      : "Connect the Roblox Studio plugin to interact",
                                                                  children: [
                                                                    (0, r.jsxs)(
                                                                      ei,
                                                                      {
                                                                        size: 32,
                                                                        shadow:
                                                                          "0 1px 4px rgba(0,0,0,0.35)",
                                                                        className:
                                                                          "transition-[filter,transform] group-hover/sat:scale-125 group-hover/sat:brightness-125 motion-reduce:transition-none motion-reduce:group-hover/sat:scale-100",
                                                                        rimClassName:
                                                                          (0,
                                                                          d.cn)(
                                                                            "bg-neutral-900",
                                                                            a &&
                                                                              "transition-colors group-hover/satnode:bg-white/70",
                                                                          ),
                                                                        bodyClassName:
                                                                          (0,
                                                                          d.cn)(
                                                                            a &&
                                                                              "transition-colors group-hover/satnode:bg-brand-sky",
                                                                          ),
                                                                        children:
                                                                          [
                                                                            (0,
                                                                            r.jsx)(
                                                                              A.default,
                                                                              {
                                                                                src: (0,
                                                                                s.ll)(
                                                                                  n ?? {
                                                                                    id: t,
                                                                                    title:
                                                                                      a?.title ??
                                                                                      "",
                                                                                    desc:
                                                                                      a?.text ??
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
                                                                                  d.cn)(
                                                                                    a &&
                                                                                      "group-hover/satnode:hidden",
                                                                                  ),
                                                                              },
                                                                            ),
                                                                            a &&
                                                                              (0,
                                                                              r.jsx)(
                                                                                "span",
                                                                                {
                                                                                  className:
                                                                                    "hidden text-micro font-black leading-none text-white group-hover/satnode:block",
                                                                                  children:
                                                                                    "Add",
                                                                                },
                                                                              ),
                                                                          ],
                                                                      },
                                                                    ),
                                                                    (0, r.jsx)(
                                                                      "span",
                                                                      {
                                                                        className:
                                                                          (0,
                                                                          d.cn)(
                                                                            "mt-1 line-clamp-2 text-micro font-semibold leading-tight text-center text-neutral-400",
                                                                            a &&
                                                                              "transition-colors group-hover/satnode:text-white",
                                                                          ),
                                                                        children:
                                                                          n?.title ??
                                                                          a?.title,
                                                                      },
                                                                    ),
                                                                  ],
                                                                },
                                                              ),
                                                            }),
                                                            !k &&
                                                              (0, r.jsx)(o.ZI, {
                                                                side: "bottom",
                                                                className: (0,
                                                                d.cn)(
                                                                  "text-center",
                                                                  ee,
                                                                ),
                                                                children:
                                                                  "Connect the Roblox Studio plugin to interact",
                                                              }),
                                                          ],
                                                        },
                                                      ),
                                                    },
                                                  ),
                                                }),
                                              },
                                              t,
                                            );
                                          },
                                        ),
                                    }),
                                    (0, r.jsx)(g.N, {
                                      children:
                                        h &&
                                        tD === e.id &&
                                        (function (e) {
                                          if (e >= 4) return [];
                                          let t = new Set();
                                          for (let n = 0; n < e; n++)
                                            t.add(q(n, e));
                                          return O[4].filter((e) => !t.has(e));
                                        })(i.length).map((e) => {
                                          let t = (e * Math.PI) / 180;
                                          return (0, r.jsx)(
                                            f.P.div,
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
                                              children: (0, r.jsx)(ei, {
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
                            (0, r.jsx)(g.N, {
                              children: eE.mechanics
                                .filter((e) => e.pos && eL.has(e.id))
                                .map((e) =>
                                  (0, r.jsx)(
                                    f.P.div,
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
                                      children: (0, r.jsx)(c.H, {
                                        size: 130,
                                        timeOffset: 7,
                                      }),
                                    },
                                    `arrival-${e.id}`,
                                  ),
                                ),
                            }),
                            eB.map((e, t) => {
                              let n = eV[t];
                              if (!n) return null;
                              let i = tV[t],
                                a = () => {
                                  if (tx.current === t) {
                                    tx.current = null;
                                    return;
                                  }
                                  tu && w?.({ text: e.text, title: e.title });
                                },
                                c = () => {
                                  eo({ projectId: y, text: e.text }).catch(
                                    (e) => {
                                      console.error(
                                        "[GameMemoryPanel] dismissSuggestion failed:",
                                        e,
                                      );
                                    },
                                  );
                                };
                              return l
                                ? (0, r.jsx)(
                                    f.P.div,
                                    {
                                      initial: { opacity: 0, scale: 0.94 },
                                      animate: {
                                        opacity: tF && tI !== t ? 0.35 : 1,
                                        scale: 1,
                                        x: i?.x ?? 0,
                                        y: i?.y ?? 0,
                                      },
                                      transition: {
                                        duration: 0.22,
                                        delay: 0.05 * t,
                                        ease: [0.23, 1, 0.32, 1],
                                        opacity: Q,
                                        x: V,
                                        y: V,
                                      },
                                      "data-gm-interactive": !0,
                                      className:
                                        "absolute cursor-grab hover:layer-overlay active:cursor-grabbing",
                                      style: {
                                        left: 0.75 * n.x - L / 2,
                                        top: 0.75 * n.y - W / 2,
                                      },
                                      onMouseEnter: () => {
                                        (t$(e.anchorId ?? null), tz(t));
                                      },
                                      onMouseLeave: () => {
                                        (t$(null), tz(null));
                                      },
                                      onPointerDown: (e) => tw(e, t),
                                      onPointerMove: tk,
                                      onPointerUp: () => tN(a),
                                      onPointerCancel: () => tN(),
                                      onLostPointerCapture: () => tN(),
                                      children: (0, r.jsx)(ea, {
                                        suggestion: e,
                                        primary: 0 === t,
                                        interactive: tu,
                                        onAdd: a,
                                        onDismiss: c,
                                      }),
                                    },
                                    `suggestion-${t}-${e.title}`,
                                  )
                                : (0, r.jsx)(
                                    f.P.div,
                                    {
                                      initial: { opacity: 0, scale: 0.4 },
                                      animate: {
                                        opacity: tF && tI !== t ? 0.35 : 1,
                                        scale: 1,
                                        x: i?.x ?? 0,
                                        y: i?.y ?? 0,
                                      },
                                      transition: {
                                        duration: 0.18,
                                        delay: 0.05 * t,
                                        opacity: Q,
                                        x: V,
                                        y: V,
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
                                        (t$(e.anchorId ?? null), tz(t));
                                      },
                                      onMouseLeave: () => {
                                        (t$(null), tz(null));
                                      },
                                      children: (0, r.jsx)("div", {
                                        className:
                                          "relative flex flex-col items-center opacity-50 transition-opacity group-hover/sugnode:opacity-90",
                                        children: (0, r.jsx)(
                                          o.TooltipProvider,
                                          {
                                            delayDuration: 0,
                                            children: (0, r.jsxs)(o.m_, {
                                              delayDuration: 0,
                                              open: !k && t_ === `sug/${t}`,
                                              children: [
                                                (0, r.jsx)(o.k$, {
                                                  asChild: !0,
                                                  children: (0, r.jsxs)(
                                                    "button",
                                                    {
                                                      type: "button",
                                                      onClick: a,
                                                      onPointerEnter: () =>
                                                        tS(`sug/${t}`),
                                                      onPointerLeave: () =>
                                                        tA(null),
                                                      "aria-label": tu
                                                        ? `Add suggestion: ${e.title}`
                                                        : "Connect the Roblox Studio plugin to interact",
                                                      className: (0, d.cn)(
                                                        "flex flex-col items-center group/sug",
                                                        !tu &&
                                                          "cursor-not-allowed",
                                                      ),
                                                      children: [
                                                        (0, r.jsxs)("div", {
                                                          className:
                                                            "relative transition-transform group-hover/sug:scale-125",
                                                          children: [
                                                            (0, r.jsx)(ei, {
                                                              size: 43,
                                                              shadow:
                                                                "0 2px 8px rgba(0,0,0,0.3)",
                                                              className:
                                                                "transition-[filter] group-hover/sug:brightness-125 motion-reduce:transition-none",
                                                              rimClassName:
                                                                "transition-colors group-hover/sugnode:bg-white/70",
                                                              bodyClassName:
                                                                "transition-colors group-hover/sugnode:bg-brand-sky",
                                                              bodyInset: 1.5,
                                                              children: (0,
                                                              r.jsxs)("div", {
                                                                className:
                                                                  "flex flex-col items-center",
                                                                children: [
                                                                  (0, r.jsx)(
                                                                    A.default,
                                                                    {
                                                                      src: e.icon
                                                                        ? `/game-memory-icons/${e.icon}.png`
                                                                        : (0,
                                                                          s.ll)(
                                                                            {
                                                                              id: e.title,
                                                                              title:
                                                                                e.title,
                                                                              desc: e.text,
                                                                            },
                                                                          ),
                                                                      alt: "",
                                                                      width: 20,
                                                                      height: 20,
                                                                      draggable:
                                                                        !1,
                                                                    },
                                                                  ),
                                                                  (0, r.jsx)(
                                                                    "span",
                                                                    {
                                                                      className:
                                                                        "mt-1 hidden text-micro font-black leading-none text-white group-hover/sugnode:block",
                                                                      children:
                                                                        "Add",
                                                                    },
                                                                  ),
                                                                ],
                                                              }),
                                                            }),
                                                            (0, r.jsx)("span", {
                                                              role: "button",
                                                              tabIndex: 0,
                                                              onClick: (e) => {
                                                                (e.preventDefault(),
                                                                  e.stopPropagation(),
                                                                  c());
                                                              },
                                                              "aria-label": `Dismiss suggestion: ${e.title}`,
                                                              className:
                                                                "absolute -top-1 -right-1 z-10 hidden h-4 w-4 cursor-pointer items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow-[0_1px_4px_rgba(0,0,0,0.5)] transition-colors hover:bg-destructive-hover group-hover/sugnode:flex",
                                                              children: (0,
                                                              r.jsx)(M.A, {
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
                                                    },
                                                  ),
                                                }),
                                                !k &&
                                                  (0, r.jsx)(o.ZI, {
                                                    side: "bottom",
                                                    className: (0, d.cn)(
                                                      "text-center",
                                                      ee,
                                                    ),
                                                    children:
                                                      "Connect the Roblox Studio plugin to interact",
                                                  }),
                                              ],
                                            }),
                                          },
                                        ),
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
                    eE &&
                      !l &&
                      (0, r.jsx)("div", {
                        className: "absolute bottom-4 left-0 right-0 px-3",
                        children: (0, r.jsx)(Y, { quests: tT }),
                      }),
                  ],
                }),
              ],
            })
          : (0, r.jsx)(o.TooltipProvider, {
              delayDuration: 0,
              children: (0, r.jsxs)(o.m_, {
                children: [
                  (0, r.jsx)(o.k$, {
                    asChild: !0,
                    children: (0, r.jsx)("button", {
                      type: "button",
                      onClick: t,
                      "aria-label": "Open game map",
                      className: (0, d.cn)(
                        "inline-flex items-center justify-center whitespace-nowrap",
                        "text-body font-medium transition-colors",
                        "focus-visible:outline-hidden focus-visible:ring-1 focus-visible:ring-ring",
                        "[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
                        "border shadow-xs h-9 w-9 border-border rounded-xl",
                        "text-foreground bg-transparent hover:bg-accent hover:text-accent-foreground",
                      ),
                      children: (0, r.jsx)(C.A, { className: "w-4 h-4" }),
                    }),
                  }),
                  (0, r.jsxs)(o.ZI, {
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
              }),
            });
      });
      function eo(e, t, n, r, i, a) {
        let s = n - e,
          o = r - t,
          l = Math.hypot(s, o) || 1,
          c = s / l,
          d = o / l;
        return {
          sx: e + c * i,
          sy: t + d * i,
          ex: n - c * a,
          ey: r - d * a,
          ux: c,
          uy: d,
          dist: l,
        };
      }
      let el = (0, S.memo)(function ({
        graph: e,
        suggestionSpokes: t,
        hiddenIds: n,
        celebratingIds: i,
        celebratingEdgeKeys: a,
        pushOffsets: s,
        suggestionPushOffsets: o,
        dragging: l,
        motionEnabled: c,
        dimmed: u,
        immersive: m,
        hoveredSuggestionIndex: x,
      }) {
        let h = (0, p.I)(),
          g = l ? K : V,
          [b, y] = (0, S.useState)(null),
          v = new Map(
            e.mechanics
              .filter((e) => e.pos)
              .map((e) => {
                let t = s.get(e.id);
                return [
                  e.id,
                  {
                    x: 0.75 * e.pos.x + (t?.x ?? 0),
                    y: 0.75 * e.pos.y + (t?.y ?? 0),
                  },
                ];
              }),
          ),
          j = new Map();
        for (let t of e.mechanics)
          if (!n.has(t.id))
            for (let e of t.connects)
              n.has(e) ||
                (j.set(t.id, (j.get(t.id) ?? 0) + 1),
                j.set(e, (j.get(e) ?? 0) + 1));
        let w = e.mechanics.flatMap((e) => {
            let t = v.get(e.id);
            return !t || n.has(e.id)
              ? []
              : e.connects.flatMap((r) => {
                  let s = v.get(r);
                  if (!s || n.has(r)) return [];
                  let o = Z(e.id, r);
                  return [
                    {
                      key: `edge-${e.id}-${r}`,
                      fromId: e.id,
                      toId: r,
                      from: t,
                      to: s,
                      celebrating: m && (a.has(o) || i.has(e.id) || i.has(r)),
                      seg: eo(t.x, t.y, s.x, s.y, 29, 33),
                    },
                  ];
                });
          }),
          k = new Set(
            [...w]
              .sort((e, t) => {
                let n = (j.get(e.fromId) ?? 0) + (j.get(e.toId) ?? 0);
                return (
                  (j.get(t.fromId) ?? 0) + (j.get(t.toId) ?? 0) - n ||
                  e.key.localeCompare(t.key)
                );
              })
              .slice(0, T.X)
              .map((e) => e.key),
          ),
          N = new Set(
            w
              .filter((e) => e.celebrating)
              .slice(0, T.F$)
              .map((e) => e.key),
          ),
          M = new Set(w.flatMap((e) => [e.fromId, e.toId])),
          C = `${Math.min(M.size, 5)}/5 core loop mechanics`,
          P = new Map(e.mechanics.map((e) => [e.id, e.title]));
        return (0, r.jsxs)(r.Fragment, {
          children: [
            (0, r.jsx)(f.P.div, {
              className: "absolute left-0 top-0 pointer-events-none",
              initial: !1,
              animate: { opacity: u ? 0.35 : 1 },
              transition: { duration: 0.16 },
              children: (0, r.jsxs)("svg", {
                width: 1,
                height: 1,
                style: { overflow: "visible" },
                children: [
                  (0, r.jsxs)("defs", {
                    children: [
                      (0, r.jsxs)("linearGradient", {
                        id: "gm-flow-gradient",
                        gradientUnits: "userSpaceOnUse",
                        x1: "-1600",
                        y1: "-800",
                        x2: "1600",
                        y2: "800",
                        children: [
                          (0, r.jsx)("stop", {
                            offset: "0",
                            stopColor: "var(--color-brand-sky)",
                          }),
                          (0, r.jsx)("stop", {
                            offset: "0.52",
                            stopColor: "var(--color-brand-ice)",
                          }),
                          (0, r.jsx)("stop", {
                            offset: "1",
                            stopColor: "var(--color-brand-cyan)",
                          }),
                        ],
                      }),
                      (0, r.jsxs)("linearGradient", {
                        id: "gm-suggestion-gradient",
                        gradientUnits: "userSpaceOnUse",
                        x1: "-1200",
                        y1: "0",
                        x2: "1200",
                        y2: "0",
                        children: [
                          (0, r.jsx)("stop", {
                            offset: "0",
                            stopColor: "var(--color-brand-ice)",
                          }),
                          (0, r.jsx)("stop", {
                            offset: "1",
                            stopColor: "var(--color-brand-sky)",
                          }),
                        ],
                      }),
                      (0, r.jsx)("marker", {
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
                    ],
                  }),
                  e.mechanics.map((e) => {
                    let t = v.get(e.id);
                    if (!t || n.has(e.id)) return null;
                    let i = eo(0, 0, t.x, t.y, 43, 37),
                      a = M.has(e.id);
                    return (0, r.jsx)(
                      f.P.line,
                      {
                        initial: !1,
                        animate: { x1: i.sx, y1: i.sy, x2: i.ex, y2: i.ey },
                        transition: g,
                        stroke: m
                          ? a
                            ? "var(--color-brand-ice)"
                            : "var(--color-brand-sky)"
                          : "#71B76F",
                        strokeWidth: m ? 1.15 : 1.33,
                        strokeDasharray: m ? "3 7" : "5 5",
                        opacity: m ? (a ? 0.34 : 0.46) : 0.65,
                      },
                      `spoke-${e.id}`,
                    );
                  }),
                  t.map((e, t) => {
                    let n = e.anchorId ? s.get(e.anchorId) : void 0,
                      i = o[e.sugIndex],
                      a = e.x1 + (n?.x ?? 0),
                      l = e.y1 + (n?.y ?? 0),
                      c = e.x2 + (i?.x ?? 0),
                      d = e.y2 + (i?.y ?? 0),
                      u = eo(
                        a,
                        l,
                        c,
                        d,
                        e.fromCenter ? 43 : 29,
                        m
                          ? (function (e, t, n, r) {
                              let i = Math.hypot(e, t) || 1,
                                a = Math.abs(e / i),
                                s = Math.abs(t / i);
                              return Math.min(
                                a > 0.001 ? n / a : 1 / 0,
                                s > 0.001 ? r / s : 1 / 0,
                              );
                            })(c - a, d - l, L / 2, W / 2) + 4
                          : 33,
                      ),
                      h = (function (e, t = 0.16) {
                        let n = (e.sx + e.ex) / 2,
                          r = (e.sy + e.ey) / 2,
                          i = e.dist * t;
                        return `M ${e.sx} ${e.sy} Q ${n - e.uy * i} ${r + e.ux * i} ${e.ex} ${e.ey}`;
                      })(u),
                      p = x === e.sugIndex;
                    return (0, r.jsxs)(
                      "g",
                      {
                        children: [
                          (0, r.jsx)(f.P.path, {
                            d: h,
                            initial: !1,
                            animate: { d: h },
                            transition: g,
                            fill: "none",
                            stroke: m
                              ? "url(#gm-suggestion-gradient)"
                              : "#8B8B8B",
                            strokeWidth: p ? 2.4 : m ? 1.65 : 1.33,
                            strokeDasharray: m ? "4 6" : "5 5",
                            opacity: p ? 1 : m ? 0.62 : 0.5,
                          }),
                          m &&
                            (0, r.jsx)(f.P.circle, {
                              initial: !1,
                              animate: { cx: u.ex, cy: u.ey },
                              transition: g,
                              r: p ? 3.2 : 2.4,
                              fill: "var(--color-brand-sky)",
                              opacity: p ? 1 : 0.72,
                            }),
                        ],
                      },
                      `sug-spoke-${t}`,
                    );
                  }),
                  w.map(
                    (
                      { key: e, seg: t, fromId: n, toId: i, from: a, to: s },
                      o,
                    ) => {
                      let l = `M ${t.sx} ${t.sy} L ${t.ex} ${t.ey}`,
                        d = N.has(e),
                        u = c && (N.size > 0 ? d : k.has(e)),
                        x = m && !d ? 0.5 : 1;
                      return (0, r.jsxs)(
                        "g",
                        {
                          children: [
                            (0, r.jsx)(f.P.path, {
                              d: l,
                              initial: !!d && { opacity: 0, pathLength: 0 },
                              animate: { d: l, opacity: x, pathLength: 1 },
                              transition: d
                                ? {
                                    d: g,
                                    opacity: { duration: 0.18 },
                                    pathLength: {
                                      duration: 0.62,
                                      ease: [0.23, 1, 0.32, 1],
                                    },
                                  }
                                : g,
                              fill: "none",
                              stroke: m
                                ? d
                                  ? "url(#gm-flow-gradient)"
                                  : "var(--color-brand-ice)"
                                : "rgba(255,255,255,0.5)",
                              strokeWidth: d ? 2.6 : m ? 1.8 : 1.6,
                              markerEnd: "url(#gm-arrow)",
                            }),
                            u
                              ? (0, r.jsx)(T.ic, {
                                  d: l,
                                  dist: t.dist,
                                  delay: (o % 16) * 0.38,
                                  immersive: m,
                                  celebrating: d,
                                  active: !0,
                                })
                              : null,
                            d && !h
                              ? (0, r.jsxs)(r.Fragment, {
                                  children: [
                                    (0, r.jsx)(f.P.circle, {
                                      cx: a.x,
                                      cy: a.y,
                                      fill: "none",
                                      stroke: "var(--color-brand-sky)",
                                      strokeWidth: 1.8,
                                      initial: { opacity: 0.78, r: 15 },
                                      animate: { opacity: 0, r: 31 },
                                      transition: {
                                        duration: 0.72,
                                        ease: [0.23, 1, 0.32, 1],
                                      },
                                    }),
                                    (0, r.jsx)(f.P.circle, {
                                      cx: s.x,
                                      cy: s.y,
                                      fill: "none",
                                      stroke: "var(--color-brand-cyan)",
                                      strokeWidth: 2,
                                      initial: { opacity: 0.9, r: 14 },
                                      animate: { opacity: 0, r: 34 },
                                      transition: {
                                        delay: 0.22,
                                        duration: 0.82,
                                        ease: [0.23, 1, 0.32, 1],
                                      },
                                    }),
                                  ],
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
                                y({
                                  x: (t.sx + t.ex) / 2,
                                  y: (t.sy + t.ey) / 2,
                                  fromId: n,
                                  toId: i,
                                }),
                              onMouseLeave: () => y(null),
                            }),
                          ],
                        },
                        e,
                      );
                    },
                  ),
                ],
              }),
            }),
            b &&
              (0, r.jsx)("div", {
                className: (0, d.cn)(
                  "absolute pointer-events-none whitespace-nowrap",
                  m
                    ? "rounded-xl bg-background/92 px-3 py-2 text-foreground shadow-overlay ring-1 ring-border/65 backdrop-blur-md"
                    : "rounded-lg border border-border bg-background px-3 py-1.5",
                  !m && ee,
                ),
                style: {
                  left: b.x,
                  top: b.y,
                  transform: "translate(-50%, -140%)",
                },
                children: m
                  ? (0, r.jsxs)(r.Fragment, {
                      children: [
                        (0, r.jsx)("span", {
                          className: "block text-label-xs text-brand-sky",
                          children: "Connection",
                        }),
                        (0, r.jsxs)("span", {
                          className:
                            "mt-0.5 block max-w-56 truncate text-caption font-semibold",
                          children: [P.get(b.fromId), " →", " ", P.get(b.toId)],
                        }),
                        (0, r.jsx)("span", {
                          className:
                            "mt-0.5 block text-micro text-muted-foreground",
                          children: C,
                        }),
                      ],
                    })
                  : C,
              }),
          ],
        });
      });
    },
  },
]);

"use strict";
(self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([
  [4150],
  {
    8896: (e, t, r) => {
      r.d(t, {
        ic: () => y,
        X: () => h,
        QJ: () => p,
        F$: () => m,
        WV: () => v,
        W: () => b,
        FO: () => R,
        Oc: () => A,
        KV: () => w,
        q_: () => E,
      });
      var n = r(95155),
        o = r(99752),
        a = r(90806),
        i = r(53350),
        l = r(60619),
        c = r(41407),
        s = r(33930),
        u = r(36669),
        f = r(14438),
        d = r(12115);
      let h = 2,
        m = 3,
        p = 2;
      function g(e, t) {
        let r = Number.isFinite(t) && t > 0 ? t : 1;
        return Math.round(e * r) / r;
      }
      function b({ limit: e, activeMs: t, settleMs: r = 0 }) {
        let [n, o] = (0, d.useState)(() => new Set()),
          [a, i] = (0, d.useState)([]),
          [l, c] = (0, d.useState)(() => new Set()),
          s = (0, d.useRef)(n),
          u = (0, d.useRef)(a),
          f = (0, d.useRef)(null),
          h = (0, d.useRef)(new Map());
        ((s.current = n), (u.current = a));
        let m = (0, d.useCallback)((e) => {
            let t = [...e];
            if (0 === t.length) return;
            let r = u.current,
              n = new Set([...s.current, ...r]),
              o = [...r];
            for (let e of t) n.has(e) || (n.add(e), o.push(e));
            o.length !== r.length && ((u.current = o), i(o));
          }, []),
          p = (0, d.useCallback)(() => {
            for (let e of (null !== f.current &&
              (window.clearTimeout(f.current), (f.current = null)),
            h.current.values()))
              window.clearTimeout(e);
            h.current.clear();
            let e = new Set();
            ((s.current = e), (u.current = []), o(e), i([]), c(new Set()));
          }, []);
        ((0, d.useEffect)(() => {
          let t = u.current;
          if (s.current.size > 0 || 0 === t.length) return;
          let r = t.slice(0, e),
            n = t.slice(r.length),
            a = new Set(r);
          ((u.current = n), (s.current = a), i(n), o(a));
        }, [n, e, a]),
          (0, d.useEffect)(() => {
            if (0 === n.size) return;
            let e = [...n],
              a = window.setTimeout(() => {
                if (((f.current = null), r > 0))
                  for (let t of (c((t) => new Set([...t, ...e])), e)) {
                    let e = h.current.get(t);
                    void 0 !== e && window.clearTimeout(e);
                    let n = window.setTimeout(() => {
                      (h.current.delete(t),
                        c((e) => {
                          if (!e.has(t)) return e;
                          let r = new Set(e);
                          return (r.delete(t), r);
                        }));
                    }, r);
                    h.current.set(t, n);
                  }
                let t = new Set();
                ((s.current = t), o(t));
              }, t);
            return (
              (f.current = a),
              () => {
                (window.clearTimeout(a), f.current === a && (f.current = null));
              }
            );
          }, [n, t, r]),
          (0, d.useEffect)(
            () => () => {
              for (let e of (null !== f.current &&
                window.clearTimeout(f.current),
              h.current.values()))
                window.clearTimeout(e);
              h.current.clear();
            },
            [],
          ));
        let g = (0, d.useMemo)(() => new Set([...n, ...a]), [n, a]);
        return {
          activeIds: n,
          hiddenIds: g,
          recentlyCompletedIds: l,
          enqueue: m,
          reset: p,
        };
      }
      function v({ scale: e }) {
        let t = (0, d.useRef)(null),
          r = (0, d.useCallback)((e) => {
            let r = t.current;
            if (!r) return;
            let n = `Zoom ${Math.round(100 * e)}%`;
            ((r.textContent = `${Math.round(100 * e)}%`),
              r.setAttribute("aria-label", n));
          }, []);
        return (
          (0, d.useLayoutEffect)(() => r(e.get()), [e, r]),
          (0, a.L)(e, "change", r),
          (0, n.jsx)("span", { ref: t, children: "100%" })
        );
      }
      function w({ expanded: e, minZoom: t, maxZoom: r }) {
        let n = (0, d.useRef)(null),
          o = (0, i.d)(0),
          a = (0, i.d)(0),
          c = (0, i.d)(1),
          s = (0, l.E)`translate3d(${o}px, ${a}px, 0) scale(${c})`,
          u = (0, d.useRef)(null),
          f = (0, d.useRef)(null),
          h = (0, d.useRef)(null),
          m = (0, d.useRef)(1),
          p = (0, d.useRef)(!1),
          [b, v] = (0, d.useState)(!1);
        ((0, d.useLayoutEffect)(() => {
          if (((m.current = window.devicePixelRatio || 1), !e)) return;
          p.current = !1;
          let t = n.current;
          if (!t) return;
          let r = () => {
            if (p.current) return;
            let e = t.getBoundingClientRect();
            if (e.width < 40 || e.height < 40) return;
            let r = m.current;
            (o.set(g(e.width / 2, r)), a.set(g(0.4 * e.height, r)), c.set(1.2));
          };
          r();
          let i = new ResizeObserver(r);
          return (i.observe(t), () => i.disconnect());
        }, [e, c, o, a]),
          (0, d.useEffect)(
            () => () => {
              null !== h.current && window.cancelAnimationFrame(h.current);
            },
            [],
          ));
        let w = (0, d.useCallback)(
            (e, t) => {
              let r = u.current;
              if (!r) return;
              let n = m.current;
              (o.set(g(r.x + e - r.startX, n)),
                a.set(g(r.y + t - r.startY, n)));
            },
            [o, a],
          ),
          R = (0, d.useCallback)(() => {
            let e = f.current;
            ((f.current = null), e && w(e.clientX, e.clientY));
          }, [w]),
          E = (0, d.useCallback)(
            (e) => {
              let t = e.currentTarget;
              t.contains(e.target) &&
                (e.target.closest("[data-gm-interactive]") ||
                  (null !== h.current &&
                    (window.cancelAnimationFrame(h.current),
                    (h.current = null)),
                  (f.current = null),
                  (p.current = !0),
                  (u.current = {
                    startX: e.clientX,
                    startY: e.clientY,
                    x: o.get(),
                    y: a.get(),
                  }),
                  v(!0),
                  t.setPointerCapture(e.pointerId)));
            },
            [o, a],
          ),
          y = (0, d.useCallback)(
            (e) => {
              if (!u.current) return;
              let t = e.nativeEvent.getCoalescedEvents?.(),
                r = t?.at(-1) ?? e.nativeEvent;
              ((f.current = { clientX: r.clientX, clientY: r.clientY }),
                null === h.current &&
                  (h.current = window.requestAnimationFrame(() => {
                    ((h.current = null), R());
                  })));
            },
            [R],
          ),
          A = (0, d.useCallback)(
            (e) => {
              (null !== h.current &&
                (window.cancelAnimationFrame(h.current), (h.current = null)),
                "pointercancel" !== e.type &&
                  (f.current = { clientX: e.clientX, clientY: e.clientY }),
                R(),
                (u.current = null),
                v(!1));
            },
            [R],
          ),
          S = (0, d.useCallback)(
            (e, n, i) => {
              let l = c.get(),
                s = Math.min(r, Math.max(t, l * e));
              if (s === l) return;
              let u = s / l,
                f = o.get(),
                d = a.get(),
                h = m.current;
              (o.set(g(n - (n - f) * u, h)),
                a.set(g(i - (i - d) * u, h)),
                c.set(s));
            },
            [r, t, c, o, a],
          ),
          _ = (0, d.useCallback)(
            (e) => {
              let t = n.current;
              if (!t) return;
              p.current = !0;
              let r = t.getBoundingClientRect();
              S(
                Math.exp(-(0.0012 * e.deltaY)),
                e.clientX - r.left,
                e.clientY - r.top,
              );
            },
            [S],
          ),
          T = (0, d.useCallback)(
            (e) => {
              let t = n.current;
              if (!t) return;
              p.current = !0;
              let r = t.getBoundingClientRect();
              S(e, r.width / 2, r.height / 2);
            },
            [S],
          );
        return {
          viewportRef: n,
          x: o,
          y: a,
          scale: c,
          worldTransform: s,
          isPanning: b,
          handlePointerDown: E,
          handlePointerMove: y,
          handlePointerUp: A,
          handleWheel: _,
          zoomBy: T,
        };
      }
      function R(e, t) {
        let [r, n] = (0, d.useState)(!1),
          [o, a] = (0, d.useState)(!1);
        return (
          (0, d.useEffect)(() => {
            if (!t) return void n(!1);
            let e = () => n("visible" === document.visibilityState);
            return (
              e(),
              document.addEventListener("visibilitychange", e),
              () => document.removeEventListener("visibilitychange", e)
            );
          }, [t]),
          (0, d.useEffect)(() => {
            let r = e.current;
            if (!t || !r) return void a(!1);
            let n = new IntersectionObserver(
              ([e]) => a(e?.isIntersecting === !0),
              { rootMargin: "100px" },
            );
            return (n.observe(r), () => n.disconnect());
          }, [t, e]),
          t && r && o
        );
      }
      function E(e, t = 650) {
        let [r, n] = (0, d.useState)(!1),
          o = (0, d.useRef)(null);
        return (
          (0, d.useEffect)(() => {
            if (!e) return void n(!1);
            let r = (e) => {
              let r = e.target;
              r instanceof HTMLElement &&
                (r.matches("input, textarea, [contenteditable='true']") ||
                  r.closest("[contenteditable='true']")) &&
                (n(!0),
                null !== o.current && window.clearTimeout(o.current),
                (o.current = window.setTimeout(() => n(!1), t)));
            };
            return (
              document.addEventListener("input", r, !0),
              document.addEventListener("keydown", r, !0),
              () => {
                (document.removeEventListener("input", r, !0),
                  document.removeEventListener("keydown", r, !0),
                  null !== o.current && window.clearTimeout(o.current));
              }
            );
          }, [e, t]),
          r
        );
      }
      function y({
        d: e,
        dist: t,
        delay: r,
        active: o,
        celebrating: a = !1,
        immersive: l = !1,
      }) {
        let h = (0, c.I)(),
          m = (0, i.d)(0),
          p = (0, d.useRef)(t);
        p.current = t;
        let g = (0, s.G)(m, (e) => p.current * (0.12 - 1.12 * e));
        return (
          (0, d.useEffect)(() => {
            if ((m.set(0), !o || h)) return;
            let e = (0, u.i)(m, 1, {
              duration: a ? 0.9 : l ? 4.8 : 6,
              repeat: a ? 0 : 1 / 0,
              repeatDelay: l ? 2.6 : 4,
              ease: "linear",
              delay: a ? 0.24 : r,
            });
            return () => e.stop();
          }, [o, a, r, l, h, m]),
          (0, n.jsx)(f.P.path, {
            d: e,
            fill: "none",
            stroke: l ? "url(#gm-flow-gradient)" : "var(--color-white)",
            strokeWidth: a ? 3.75 : l ? 2.25 : 3.5,
            strokeLinecap: "round",
            opacity: o ? (a ? 0.95 : l ? 0.52 : 1) : 0,
            className: "motion-reduce:opacity-0",
            strokeDasharray: `${0.12 * t} ${1.88 * t}`,
            strokeDashoffset: g,
          })
        );
      }
      function A({
        enabled: e,
        surface: t,
        nodeCount: r,
        edgeCount: n,
        activeAnimationCount: a,
      }) {
        let i = (0, d.useRef)({
          nodeCount: r,
          edgeCount: n,
          activeAnimationCount: a,
        });
        ((i.current = { nodeCount: r, edgeCount: n, activeAnimationCount: a }),
          (0, d.useEffect)(() => {
            if (!e || "undefined" == typeof PerformanceObserver) return;
            let r = `game-map-performance-sampled:${t}`;
            try {
              if (sessionStorage.getItem(r) || Math.random() >= 0.1) return;
              sessionStorage.setItem(r, "1");
            } catch {
              if (Math.random() >= 0.1) return;
            }
            let n = performance.now(),
              a = 0,
              l = 0,
              c = 0,
              s = new PerformanceObserver((e) => {
                for (let t of e.getEntries())
                  ((a += 1), (l += t.duration), (c = Math.max(c, t.duration)));
              });
            try {
              s.observe({ type: "longtask", buffered: !0 });
            } catch {
              return;
            }
            let u = !1,
              f = () => {
                if (u) return;
                ((u = !0), s.disconnect());
                let e = navigator;
                (0, o.sx)("Game Map Performance Sample", {
                  surface: t,
                  sample_duration_ms: Math.round(performance.now() - n),
                  long_task_count: a,
                  long_task_total_ms: Math.round(l),
                  longest_task_ms: Math.round(c),
                  node_count: i.current.nodeCount,
                  edge_count: i.current.edgeCount,
                  active_animation_count: i.current.activeAnimationCount,
                  hardware_concurrency: navigator.hardwareConcurrency,
                  device_memory_gb: e.deviceMemory,
                  viewport_width: window.innerWidth,
                  viewport_height: window.innerHeight,
                });
              },
              d = window.setTimeout(f, 15e3);
            return () => {
              (window.clearTimeout(d), f());
            };
          }, [e, t]));
      }
    },
    19246: (e, t, r) => {
      function n(e) {
        let t = [{ x: 0, y: 0 }],
          r = new Map();
        for (let n of e.mechanics) n.pos && (r.set(n.id, n.pos), t.push(n.pos));
        let n = e.mechanics.filter((e) => !e.pos);
        if (1 === t.length && n.length >= 3) {
          var o = n.map((e) => e.id);
          let e =
            1.3 * Math.max(202.8, 184.6 / (2 * Math.sin(Math.PI / o.length)));
          return o.map((t, r) => {
            let n = -Math.PI / 2 + (r / o.length) * Math.PI * 2;
            return {
              id: t,
              x: Math.round(Math.cos(n) * e),
              y: Math.round(Math.sin(n) * e),
            };
          });
        }
        let l = [];
        for (let n of e.mechanics) {
          let o;
          if (n.pos) continue;
          let c = new Set(n.connects);
          for (let t of e.mechanics) t.connects.includes(n.id) && c.add(t.id);
          let s = [...c].map((e) => r.get(e)).filter((e) => !!e);
          if (s.length > 0) {
            let e = s.reduce((e, t) => e + t.x, 0) / s.length;
            o = (function (e, t) {
              for (let r = 0; r <= 12; r++)
                for (let n of 0 === r || 12 === r ? [1] : [1, -1]) {
                  let o = e + n * r * (Math.PI / 12),
                    a = { x: 360 * Math.cos(o), y: 360 * Math.sin(o) };
                  if (t.every((e) => Math.hypot(e.x - a.x, e.y - a.y) >= 142))
                    return a;
                }
              return a(t);
            })(Math.atan2(s.reduce((e, t) => e + t.y, 0) / s.length, e), t);
          } else o = a(t);
          let u = { x: Math.round((o = i(o, t)).x), y: Math.round(o.y) };
          (r.set(n.id, u), t.push(u), l.push({ id: n.id, ...u }));
        }
        return l;
      }
      function o(e, t) {
        let r = [{ x: 0, y: 0 }],
          n = new Map();
        for (let t of e.mechanics) t.pos && (n.set(t.id, t.pos), r.push(t.pos));
        return t.map((e) => {
          let t = n.get(e.anchorId),
            o = t
              ? (function (e, t) {
                  let r = Math.atan2(e.y, e.x);
                  for (let n = 0; n < 3; n++) {
                    let o = (156 + 60 * n) * 1.3;
                    for (let n = 0; n <= 6; n++)
                      for (let a of 0 === n || 6 === n ? [1] : [1, -1]) {
                        let i = r + a * n * (Math.PI / 6),
                          l = {
                            x: e.x + Math.cos(i) * o,
                            y: e.y + Math.sin(i) * o,
                          };
                        if (
                          t.every(
                            (e) => Math.hypot(e.x - l.x, e.y - l.y) >= 184.6,
                          )
                        )
                          return l;
                      }
                  }
                  return i(
                    {
                      x: e.x + 156 * Math.cos(r) * 1.3,
                      y: e.y + 156 * Math.sin(r) * 1.3,
                    },
                    t,
                    184.6,
                  );
                })(t, r)
              : i(a(r), r, 184.6),
            l = { x: Math.round(o.x), y: Math.round(o.y) };
          return (r.push(l), l);
        });
      }
      function a(e) {
        let t = { x: 360, y: 0 },
          r = -1;
        for (let n = 0; n < 24; n++) {
          let o = (n / 24) * Math.PI * 2,
            a = { x: 360 * Math.cos(o), y: 360 * Math.sin(o) },
            i = Math.min(...e.map((e) => Math.hypot(e.x - a.x, e.y - a.y)));
          i > r && ((r = i), (t = a));
        }
        return t;
      }
      function i(e, t, r = 142) {
        let n = e;
        for (
          let e = 0;
          e < 40 && t.some((e) => Math.hypot(e.x - n.x, e.y - n.y) < r);
          e++
        ) {
          let e = Math.hypot(n.x, n.y) || 1;
          n = { x: n.x + (n.x / e) * 45, y: n.y + (n.y / e) * 45 };
        }
        return n;
      }
      r.d(t, { Es: () => n, K1: () => o, ll: () => s, qf: () => u });
      let l = [
          [/zombie|enemy|monster|horde|boss|undead/i, "skull"],
          [/pet|companion|dog|cat|animal/i, "paw"],
          [/player|character|survivor|avatar|npc/i, "player"],
          [/gem|diamond|crystal/i, "diamond"],
          [/coin|gold/i, "coin"],
          [/money|cash|currency|dollar|econom/i, "cash"],
          [/shop|store|market|buy|purchase/i, "shopping-cart"],
          [/weapon|gun|sword|shoot|combat|attack|battle|fight/i, "sword"],
          [/leaderboard|rank|stat/i, "stats"],
          [/spawn|egg|hatch/i, "egg"],
          [/score|kill|point|win|victor/i, "trophy"],
          [/wave|round|storm|weather/i, "thunderstorm"],
          [/health|heal|life|revive|\bhp\b/i, "heart"],
          [/quest|mission|task|objective|story/i, "scroll"],
          [/craft|forge|construct|\bbuild/i, "hammer"],
          [/level|\bxp\b|progress|upgrade|skill/i, "upgrade"],
          [/map|world|zone|island|area|biome|explor/i, "location-pin"],
          [/\bui\b|menu|hud|setting/i, "settings"],
          [/\bcar\b|vehicle|drive|race|speed|hoverboard/i, "hoverboard"],
          [/magic|spell|wizard|potion|brew|alchemy/i, "potion"],
          [/inventory|backpack|\bbag\b|equip|item/i, "backpack"],
          [/trade|trading|exchange|barter/i, "trade"],
          [/bomb|explos|grenade/i, "bomb"],
          [/chest|loot|treasure/i, "chest"],
          [/gift|reward|prize|daily|bonus/i, "gift"],
          [/\bkey\b|unlock|door/i, "key"],
          [/jump|bounce|spring|dash/i, "coil"],
          [/teleport|portal|warp/i, "teleporter"],
          [/rebirth|prestige|ascend|reset/i, "rebirth"],
          [/vip|gamepass|premium|robux/i, "vip"],
          [/crown|king|royal|throne/i, "crown"],
          [/house|home|base|plot|tycoon/i, "house"],
          [/\btime\b|clock|cooldown|timer/i, "clock"],
          [/spin|wheel|roulette/i, "wheel"],
          [/rocket|launch|\bfly\b|spaceship/i, "rocket"],
          [/\baim\b|target|accuracy|sniper/i, "target"],
          [/shield|defen|armor|protect|guard/i, "shield"],
          [/fire|flame|burn|lava/i, "fire"],
          [/fish|bait|catch/i, "bait"],
          [/music|sound|audio|song/i, "music"],
          [/lock|secure|vault/i, "lock"],
          [/luck|chance|random|gacha|gambl/i, "lucky-block"],
          [/dice|\broll\b/i, "dice"],
          [/planet|space|galaxy|orbit/i, "planet"],
          [/medal|achievement|badge/i, "medal"],
          [/\bstar\b|fame|rating/i, "star"],
          [/\bbox\b|crate|package/i, "box"],
        ],
        c = ["star", "dice", "lucky-block", "target", "box", "medal", "fire"];
      function s(e) {
        let t = `${e.title} ${e.desc}`;
        for (let [e, r] of l)
          if (e.test(t)) return `/game-memory-icons/${r}.png`;
        let r = 0;
        for (let t = 0; t < e.id.length; t++)
          r = (31 * r + e.id.charCodeAt(t)) | 0;
        let n = c[Math.abs(r) % c.length];
        return `/game-memory-icons/${n}.png`;
      }
      function u(e, t) {
        return (
          !(t.connects.length > 0) &&
          !e.mechanics.some((e) => e.connects.includes(t.id))
        );
      }
    },
    69821: (e, t, r) => {
      r.d(t, {
        Bi: () => n.useId,
        Kr: () => n.useMemo,
        hb: () => n.useCallback,
      });
      var n = r(12115);
    },
    74647: (e, t, r) => {
      r.d(t, { bt: () => o, dH: () => l, eg: () => i });
      let n = "(unnamed)";
      function o(e) {
        let t = { gameName: "", direction: "", mechanics: [] },
          r = e.split("\n"),
          o = !1,
          a = null,
          i = !1,
          l = !1;
        for (let e of r) {
          let r = e.replace(/\s+$/, "").trim();
          if (0 === r.length) continue;
          if (r.startsWith("# ") && !r.startsWith("## ")) {
            let e = r.slice(2).trim();
            ((t.gameName = e === n ? "" : e), (l = !0));
            continue;
          }
          if (/^##\s+mechanics\s*$/i.test(r)) {
            ((o = !0), (a = null), (i = !1));
            continue;
          }
          if (r.startsWith("### ")) {
            if (!o) continue;
            ((a = {
              id: "",
              title: r.slice(4).trim(),
              desc: "",
              connects: [],
              pos: null,
              satellites: [],
            }),
              t.mechanics.push(a),
              (i = !1));
            continue;
          }
          if (!o) {
            !l || t.direction || r.startsWith("#") || (t.direction = r);
            continue;
          }
          if (!a) continue;
          let c = e.match(/^\s{2,}-\s+([^:]+):\s*(.+)$/);
          if (i && c) {
            let [e, ...t] = c[2].split("|");
            a.satellites.push({
              id: c[1].trim(),
              title: e.trim(),
              desc: t.join("|").trim(),
            });
            continue;
          }
          let s = r.match(/^-\s+([a-z]+):\s*(.*)$/);
          if (!s) continue;
          let [, u, f] = s;
          switch (((i = !1), u)) {
            case "id":
              a.id = f.trim();
              break;
            case "desc":
              a.desc = f.trim();
              break;
            case "icon":
              f.trim() && (a.icon = f.trim());
              break;
            case "connects":
              a.connects = f
                .split(",")
                .map((e) => e.replace(/->/g, "").trim())
                .filter(Boolean);
              break;
            case "pos": {
              let [e, t] = f.split(",").map((e) => Number(e.trim()));
              Number.isFinite(e) &&
                Number.isFinite(t) &&
                (a.pos = { x: Math.round(e), y: Math.round(t) });
              break;
            }
            case "satellites":
              i = !0;
          }
        }
        for (let e of t.mechanics)
          e.id ||
            (e.id =
              e.title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, "-")
                .replace(/^-+|-+$/g, "")
                .slice(0, 48) || "mechanic");
        return t;
      }
      function a(e) {
        let t = [];
        for (let r of (t.push(`# ${e.gameName.trim() || n}`),
        e.direction.trim() && t.push(e.direction.trim()),
        t.push(""),
        t.push("## mechanics"),
        e.mechanics))
          if (
            (t.push(""),
            t.push(`### ${r.title}`),
            t.push(`- id: ${r.id}`),
            t.push(`- desc: ${r.desc}`),
            r.icon && t.push(`- icon: ${r.icon}`),
            r.connects.length > 0 &&
              t.push(
                `- connects: ${r.connects.map((e) => `-> ${e}`).join(", ")}`,
              ),
            r.pos && t.push(`- pos: ${r.pos.x},${r.pos.y}`),
            r.satellites.length > 0)
          )
            for (let e of (t.push("- satellites:"), r.satellites))
              t.push(`  - ${e.id}: ${e.title} | ${e.desc}`);
        return t.join("\n") + "\n";
      }
      function i(e, t) {
        let r = e.mechanics.find((e) => e.id === t);
        if (!r) return "";
        let n = new Map(e.mechanics.map((e) => [e.id, e.title])),
          o = r.connects.map((e) => n.get(e) ?? e).join(", "),
          a = e.mechanics
            .filter((e) => e.connects.includes(r.id))
            .map((e) => e.title)
            .join(", "),
          i = [`Mechanic: ${r.title} (id: ${r.id})`, `Description: ${r.desc}`];
        return (
          o && i.push(`Feeds into: ${o}`),
          a && i.push(`Fed by: ${a}`),
          r.satellites.length > 0 &&
            i.push(
              `Sub-mechanics: ${r.satellites.map((e) => `${e.title} (${e.desc})`).join("; ")}`,
            ),
          i.join("\n")
        );
      }
      function l(e, t, r) {
        let n = e.mechanics.find((e) => e.id === t),
          o = n?.satellites.find((e) => e.id === r);
        return n && o
          ? `Sub-mechanic: ${o.title} (id: ${o.id})
Description: ${o.desc}
Part of mechanic: ${n.title} (id: ${n.id}) — ${n.desc}`
          : "";
      }
      (a({ gameName: "", direction: "", mechanics: [] }),
        a({
          gameName: "Zombie Survival",
          direction: "Survive the horde, earn coins, gear up, dive back in.",
          mechanics: [
            {
              id: "your-player",
              title: "Your player",
              desc: "Health, movement and combat controls for the survivor",
              icon: "player",
              connects: ["zombies"],
              pos: null,
              satellites: [],
            },
            {
              id: "zombies",
              title: "Zombies",
              desc: "Waves of zombies spawn and hunt the player",
              icon: "skull",
              connects: ["coins"],
              pos: null,
              satellites: [
                {
                  id: "zombie-waves",
                  title: "Wave spawner",
                  desc: "Rounds grow bigger and faster each wave",
                },
                {
                  id: "boss-zombies",
                  title: "Boss zombies",
                  desc: "A tougher boss zombie leads every fifth wave",
                },
              ],
            },
            {
              id: "coins",
              title: "Coins",
              desc: "Zombies drop coins on death",
              icon: "coin",
              connects: ["shop"],
              pos: null,
              satellites: [],
            },
            {
              id: "shop",
              title: "Shop",
              desc: "Spend coins between waves on gear",
              icon: "shopping-cart",
              connects: ["weapons"],
              pos: null,
              satellites: [],
            },
            {
              id: "weapons",
              title: "Weapons",
              desc: "Bought weapons equip onto the player",
              icon: "sword",
              connects: ["your-player"],
              pos: null,
              satellites: [],
            },
          ],
        }));
    },
    93529: (e, t, r) => {
      r.d(t, {
        J0: () => n.useState,
        Kr: () => n.useMemo,
        NT: () => n.useContext,
        li: () => n.useRef,
      });
      var n = r(12115);
    },
    94352: (e, t, r) => {
      r.d(t, { H: () => l });
      var n = r(95155),
        o = r(12115),
        a = r(25016);
      let i = `precision highp float;
uniform vec2 iResolution; uniform float iTime;
const float TAU = 6.28318530718;
const int   N   = 6;
const float SMOOTH_K = 0.08;
const float INTENSITY  = 0.0025;
const float FALLOFF_P  = 1.35;
const float FADE_START = 0.02;
const float FADE_END   = 0.56;
const float ABERR = 0.005;
const vec3  SPECTRAL = vec3(0.0, 0.5, 1.0) * ABERR;
const float HUE_SPEED = 0.06;
const float COLOR_K   = 0.5;
const float SAT       = 0.01;
const float HUE_SPAN  = 0.667;
const float MERGE_PERIOD = 6.0;
const float T_MOVE   = 1.25;
const float STAGGER  = 0.33;
const float HOLD     = 0.0;
const float W = 4.6;
const float L = 3.2;
const float PIERCE  = 0.12;
const float RECOIL  = 0.035;
const float REC_LAG = 0.11;
const float GATHER_PERIOD = 12.0;
const float GATHER_START  = 9.2;
const float GATHER_HOLD   = 0.8;
const float GATHER_R      = 0.008;
const float GATHER_DIM    = 0.85;
const float GATHER_IN     = 1.8;
const float GATHER_IN_L   = 7.5;
const float BURST_W = 6.5;
const float BURST_L = 4.0;
const float CHARGE_T     = 0.30;
const float CHARGE_SHRK  = 0.18;
const float CHARGE_GLOW  = 0.35;
const float FLASH_GAIN   = 1.2;
const float FLASH_DECAY  = 7.0;

float hash11(float n){ return fract(sin(n*127.1 + 311.7)*43758.5453); }
float settleWL(float tau, float w, float l){
    if(tau <= 0.0) return 0.0;
    return 1.0 - exp(-l*tau)*cos(w*tau);
}
float settle(float tau){ return settleWL(tau, W, L); }
float settleCrit(float tau, float l){
    if(tau <= 0.0) return 0.0;
    return 1.0 - exp(-l*tau)*(1.0 + l*tau);
}
float smin(float a, float b, float k){
    float h = max(k - abs(a - b), 0.0) / k;
    return min(a, b) - h*h*k*0.25;
}
vec3 hue2rgb(float h){
    h = fract(h);
    float r = clamp(abs(h*6.0 - 3.0) - 1.0, 0.0, 1.0);
    float g = clamp(2.0 - abs(h*6.0 - 2.0), 0.0, 1.0);
    float b = clamp(2.0 - abs(h*6.0 - 4.0), 0.0, 1.0);
    return vec3(r, g, b);
}
float dotR(float fi, float seed, float t){
    return 0.036 + 0.010*sin(t*1.3 + seed*TAU) + 0.005*sin(t*2.4 + fi*1.3);
}
float dotSD(vec2 p, vec2 pos, float r, float t, float fi, float shapeDamp){
    vec2 d = p - pos;
    float sq = 0.075 * (0.5 + 0.5*sin(t*0.9 + fi*2.0)) * shapeDamp;
    float ca = cos(t*0.35 + fi), sa = sin(t*0.35 + fi);
    d = mat2(ca,-sa,sa,ca) * d;
    d *= vec2(1.0+sq, 1.0-sq);
    return length(d) - r;
}
vec3 scene(vec2 p, float t){
    float k  = floor(t/MERGE_PERIOD);
    float u  = fract(t/MERGE_PERIOD);
    float te = u * MERGE_PERIOD;
    float tg = mod(t, GATHER_PERIOD);
    float g  = settleCrit((tg - GATHER_START) * GATHER_IN, GATHER_IN_L)
             - settleWL(tg - GATHER_START - GATHER_HOLD, BURST_W, BURST_L);
    float gC = clamp(g, 0.0, 1.0);
    float tb     = tg - (GATHER_START + GATHER_HOLD);
    float charge = smoothstep(-CHARGE_T, 0.0, min(tb, 0.0)) * gC;
    float flash  = tb > 0.0 ? exp(-tb * FLASH_DECAY) : 0.0;
    float gBright = mix(1.0, GATHER_DIM, gC) * (1.0 + CHARGE_GLOW*charge + FLASH_GAIN*flash);
    vec3  total3 = vec3(1e5);
    vec3  cAcc   = vec3(0.0);
    float wAcc   = 1e-6;
    for(int i=0; i<N; i++){
        float fi   = float(i);
        float seed = hash11(fi);
        float ang = fi/float(N)*TAU + t*0.35;
        vec2 dir  = vec2(cos(ang), sin(ang));
        float R = 0.17 + 0.010*sin(t*1.0) + 0.007*sin(t*1.3 + seed*TAU);
        float pairId   = mod(fi, 3.0);
        float moverLow = mod(k + pairId, 2.0);
        float isMover  = (fi < 2.5) ? step(moverLow, 0.5) : step(0.5, moverLow);
        float goStart  = pairId * STAGGER;
        float retStart = 3.0*STAGGER + HOLD + pairId * STAGGER;
        float m   = (settle(te - goStart)           - settle(te - retStart))           * isMover;
        float rec = (settle(te - goStart - REC_LAG) - settle(te - retStart - REC_LAG)) * (1.0 - isMover);
        float rSelf = dotR(fi, seed, t);
        rSelf = mix(rSelf, 0.036, gC);
        rSelf *= 1.0 - CHARGE_SHRK * charge;
        float fj    = mod(fi + 3.0, 6.0);
        float rPart = dotR(fj, hash11(fj), t);
        float deep   = -(R + RECOIL) - PIERCE * rPart;
        float radial = mix(R, deep, m) + RECOIL * rec;
        radial = mix(radial, GATHER_R, g);
        vec2  pos    = radial * dir;
        float sdR = dotSD(p - SPECTRAL.r*dir, pos, rSelf, t, fi, 1.0 - gC);
        float sdG = dotSD(p - SPECTRAL.g*dir, pos, rSelf, t, fi, 1.0 - gC);
        float sdB = dotSD(p - SPECTRAL.b*dir, pos, rSelf, t, fi, 1.0 - gC);
        total3 = vec3( smin(total3.r, sdR, SMOOTH_K),
                       smin(total3.g, sdG, SMOOTH_K),
                       smin(total3.b, sdB, SMOOTH_K) );
        float hue = fract(fi/float(N) + t*HUE_SPEED) * HUE_SPAN;
        vec3 dotCol = mix(vec3(1.0), hue2rgb(hue), SAT);
        float w = exp(-sdG * COLOR_K);
        cAcc += w * dotCol;
        wAcc += w;
    }
    vec3 sd3    = max(total3, vec3(0.0)) + 1e-4;
    vec3 core3  = clamp(INTENSITY / pow(sd3, vec3(FALLOFF_P)), 0.0, 1.0);
    vec3 edge3  = 1.0 - smoothstep(vec3(FADE_START), vec3(FADE_END), sd3);
    vec3 bright = core3 * edge3 * gBright;
    return bright * (cAcc / wAcc);
}
void mainImage(out vec4 fragColor, in vec2 fragCoord){
    vec2 res = iResolution.xy;
    vec2 p = (2.0*fragCoord - res) / min(res.x, res.y);
    float t = iTime;
    p /= 1.0 + 0.03*sin(t*1.0);
    vec3 col = scene(p, t);
    col *= 1.0 + 0.05*sin(t*1.0 + 1.0);
    col = pow(col, vec3(1.0/1.2));
    col = min(col, 1.0);
    // Premultiplied-alpha output: black stays fully transparent.
    float a = max(col.r, max(col.g, col.b));
    fragColor = vec4(col, a);
}
void main(){ mainImage(gl_FragColor, gl_FragCoord.xy); }`;
      function l({
        size: e = 420,
        renderScale: t = 0.75,
        timeOffset: r = 0,
        className: l,
        style: c,
        ...s
      }) {
        let u = o.useRef(null);
        return (
          o.useEffect(() => {
            let n = u.current;
            if (!n) return;
            let o = n.getContext("webgl", {
              alpha: !0,
              premultipliedAlpha: !0,
            });
            if (!o) return;
            let a = (e, t) => {
                let r = o.createShader(e);
                if (
                  (o.shaderSource(r, t),
                  o.compileShader(r),
                  !o.getShaderParameter(r, o.COMPILE_STATUS))
                ) {
                  let e = o.getShaderInfoLog(r);
                  throw (o.deleteShader(r), Error(e ?? "shader compile error"));
                }
                return r;
              },
              l = o.createProgram(),
              c = a(
                o.VERTEX_SHADER,
                "attribute vec2 aPos; void main(){ gl_Position=vec4(aPos,0.0,1.0); }",
              ),
              s = a(o.FRAGMENT_SHADER, i);
            (o.attachShader(l, c),
              o.attachShader(l, s),
              o.linkProgram(l),
              o.useProgram(l));
            let f = o.createBuffer();
            (o.bindBuffer(o.ARRAY_BUFFER, f),
              o.bufferData(
                o.ARRAY_BUFFER,
                new Float32Array([-1, -1, 3, -1, -1, 3]),
                o.STATIC_DRAW,
              ));
            let d = o.getAttribLocation(l, "aPos");
            (o.enableVertexAttribArray(d),
              o.vertexAttribPointer(d, 2, o.FLOAT, !1, 0, 0));
            let h = o.getUniformLocation(l, "iResolution"),
              m = o.getUniformLocation(l, "iTime"),
              p = Math.round(e * t);
            ((n.width = p), (n.height = p), o.viewport(0, 0, p, p));
            let g =
                "undefined" != typeof performance
                  ? performance.now()
                  : Date.now(),
              b = 0,
              v = () => {
                let e =
                  "undefined" != typeof performance
                    ? performance.now()
                    : Date.now();
                (o.uniform2f(h, p, p),
                  o.uniform1f(m, (e - g) / 1e3 + r),
                  o.drawArrays(o.TRIANGLES, 0, 3),
                  (b = requestAnimationFrame(v)));
              };
            return (
              v(),
              () => {
                (cancelAnimationFrame(b),
                  o.deleteProgram(l),
                  o.deleteShader(c),
                  o.deleteShader(s),
                  o.deleteBuffer(f));
              }
            );
          }, [e, t, r]),
          (0, n.jsx)("canvas", {
            ref: u,
            className: (0, a.cn)("block", l),
            style: { width: e, height: e, ...c },
            ...s,
          })
        );
      }
    },
    95165: (e, t, r) => {
      r.d(t, {
        Bi: () => n.useId,
        I5: () => n.useInsertionEffect,
        NT: () => n.useContext,
        li: () => n.useRef,
      });
      var n = r(12115);
    },
  },
]);

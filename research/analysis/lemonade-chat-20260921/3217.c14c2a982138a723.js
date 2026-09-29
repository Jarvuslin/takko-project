"use strict";
(self.webpackChunk_N_E = self.webpackChunk_N_E || []).push([
  [3217],
  {
    23217: (e, t, r) => {
      (r.r(t), r.d(t, { AnimationClipViewer: () => X }));
      var o = r(95155),
        a = r(11012),
        n = r(7720),
        i = r(87548),
        s = r(35833);
      let l = Math.PI / 180,
        p = {
          hips: [-1, 1, -1],
          spine: [-1, 1, -1],
          neck: [-1, 1, -1],
          shoulderR: [1, 1, 1],
          elbowR: [1, 1, 1],
          wristR: [1, 1, 1],
          shoulderL: [1, -1, -1],
          elbowL: [1, -1, -1],
          wristL: [1, -1, -1],
          hipR: [1, 1, 1],
          kneeR: [-1, 1, 1],
          ankleR: [1, 1, 1],
          hipL: [1, -1, -1],
          kneeL: [-1, -1, -1],
          ankleL: [1, -1, -1],
        },
        f = Object.keys(p),
        c = {
          linear: (e) => e,
          inOut: (e) => e * e * (3 - 2 * e),
          in: (e) => e * e,
          out: (e) => 1 - (1 - e) * (1 - e),
        };
      function h(e, t) {
        let r = e[t];
        return "hips" === t && r && !Array.isArray(r)
          ? { pos: r.pos ?? [0, 0, 0], rot: r.rot ?? [0, 0, 0] }
          : "hips" === t
            ? { pos: [0, 0, 0], rot: r ?? [0, 0, 0] }
            : r;
      }
      function u(e, t, r) {
        return e.map((e, o) => e + (t[o] - e) * r);
      }
      function m(e) {
        return e.keys[e.keys.length - 1].t;
      }
      let d = Object.freeze([0, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1]);
      function g(e, t) {
        let [r, o, a, n, i, s, l, p, f, c, h, u] = e,
          [m, d, g, L, R, w, M, b, A, k, P, z] = t;
        return [
          r + n * m + i * d + s * g,
          o + l * m + p * d + f * g,
          a + c * m + h * d + u * g,
          n * L + i * M + s * k,
          n * R + i * b + s * P,
          n * w + i * A + s * z,
          l * L + p * M + f * k,
          l * R + p * b + f * P,
          l * w + p * A + f * z,
          c * L + h * M + u * k,
          c * R + h * b + u * P,
          c * w + h * A + u * z,
        ];
      }
      function L(e) {
        let [t, r, o, a, n, i, s, l, p, f, c, h] = e;
        return [
          -(a * t + s * r + f * o),
          -(n * t + l * r + c * o),
          -(i * t + p * r + h * o),
          a,
          s,
          f,
          n,
          l,
          c,
          i,
          p,
          h,
        ];
      }
      function R(e) {
        return [0, 0, 0, ...e.slice(3)];
      }
      function w(e, t, r) {
        return [e, t, r, 1, 0, 0, 0, 1, 0, 0, 0, 1];
      }
      function M(e) {
        return [e[0], e[1], e[2]];
      }
      function b(e, t) {
        let [r, o, a] = e,
          [n, i, s] = t,
          l = o * s - a * i,
          p = a * n - r * s,
          f = r * i - o * n,
          c = r * n + o * i + a * s;
        if (c < -1 + 1e-9)
          throw Error("rotationBetween: opposite vectors are ambiguous");
        let h = 1 / (1 + c);
        return [
          0,
          0,
          0,
          1 - (p * p + f * f) * h,
          l * p * h - f,
          l * f * h + p,
          l * p * h + f,
          1 - (l * l + f * f) * h,
          p * f * h - l,
          l * f * h - p,
          p * f * h + l,
          1 - (l * l + p * p) * h,
        ];
      }
      function A(e, t) {
        let [, , , r, o, a, n, i, s, l, p, f] = e;
        return [
          r * t[0] + o * t[1] + a * t[2],
          n * t[0] + i * t[1] + s * t[2],
          l * t[0] + p * t[1] + f * t[2],
        ];
      }
      function k(e, t, r = 1e-6) {
        if (e.length !== t.length) return !1;
        for (let o = 0; o < e.length; o++)
          if (Math.abs(e[o] - t[o]) > r) return !1;
        return !0;
      }
      function P(e, t) {
        return (
          e[1] -
          (Math.abs(e[6]) * t[0] +
            Math.abs(e[7]) * t[1] +
            Math.abs(e[8]) * t[2]) /
            2
        );
      }
      let z = {
          R15: {
            hips: "Root",
            spine: "Waist",
            neck: "Neck",
            shoulderR: "RightShoulder",
            elbowR: "RightElbow",
            wristR: "RightWrist",
            shoulderL: "LeftShoulder",
            elbowL: "LeftElbow",
            wristL: "LeftWrist",
            hipR: "RightHip",
            kneeR: "RightKnee",
            ankleR: "RightAnkle",
            hipL: "LeftHip",
            kneeL: "LeftKnee",
            ankleL: "LeftAnkle",
          },
          R6: {
            hips: "RootJoint",
            neck: "Neck",
            shoulderR: "Right Shoulder",
            shoulderL: "Left Shoulder",
            hipR: "Right Hip",
            hipL: "Left Hip",
          },
        },
        j = {
          shoulderR: {
            parent: "UpperTorso",
            pivot: "RightShoulder",
            end: "RightWrist",
          },
          shoulderL: {
            parent: "UpperTorso",
            pivot: "LeftShoulder",
            end: "LeftWrist",
          },
          hipR: {
            parent: "LowerTorso",
            pivot: "RightHip",
            end: "RightAnkle",
            mid: "RightKnee",
            bend: "kneeR",
          },
          hipL: {
            parent: "LowerTorso",
            pivot: "LeftHip",
            end: "LeftAnkle",
            mid: "LeftKnee",
            bend: "kneeL",
          },
        },
        x = (Math.PI / 180) * 20,
        H = (Math.PI / 180) * 70,
        v = {};
      function y(e, t) {
        return (v[t] || (v[t] = T({}, e, j[t])), v[t]);
      }
      function E(e) {
        let t = Math.hypot(...e);
        return e.map((e) => e / t);
      }
      function T(e, t, { parent: r, pivot: o, end: a }) {
        let n = C("R15", t, $(e, "R15", t, { declip: !1 })),
          i = Object.fromEntries(t.R15.joints.map((e) => [e.name, e])),
          s = (e) => M(g(g(L(n[r]), n[e.part1]), e.c1)),
          l = s(i[o]);
        return E(s(i[a]).map((e, t) => e - l[t]));
      }
      let U = [0, -1, 0],
        S = ["Right Hip", "Left Hip"],
        N = {
          R15: { RightShoulder: 1, LeftShoulder: -1 },
          R6: { "Right Shoulder": 1, "Left Shoulder": -1 },
        };
      function O(e) {
        let [t, r, o] = e.map((e) => e / 2),
          a = [];
        for (let e of [-t, 0, t])
          for (let t of [-r, 0, r]) for (let r of [-o, 0, o]) a.push([e, t, r]);
        return a;
      }
      let F = {};
      function $(e, t, r, { declip: o = !0 } = {}) {
        let a = z[t];
        if (!a) throw Error(`unknown rig ${t}`);
        let n = r[t],
          i = Object.fromEntries(n.joints.map((e) => [e.name, e])),
          { joints: s, hipsPos: c } = (function (e) {
            let t = {},
              r = [0, 0, 0];
            for (let [o, a] of Object.entries(e)) {
              let e = p[o];
              if (!e)
                throw Error(`unknown joint "${o}" (valid: ${f.join(", ")})`);
              let n = a;
              if (
                ("hips" !== o ||
                  Array.isArray(a) ||
                  (a.pos && (r = [a.pos[0], a.pos[1], -a.pos[2]]),
                  (n = a.rot ?? [0, 0, 0])),
                !Array.isArray(n) || 3 !== n.length)
              )
                throw Error(`joint "${o}" needs [pitch, yaw, roll]`);
              t[o] = n.map((t, r) => t * e[r] * l);
            }
            return { joints: t, hipsPos: r };
          })(e),
          h = {};
        for (let e of f) {
          let t = s[e];
          h[e] = t
            ? (function (e, t, r) {
                let o = Math.cos(e),
                  a = Math.sin(e),
                  n = Math.cos(t),
                  i = Math.sin(t),
                  s = Math.cos(r),
                  l = Math.sin(r);
                return g(
                  [0, 0, 0, n, 0, i, 0, 1, 0, -i, 0, n],
                  g(
                    [0, 0, 0, 1, 0, 0, 0, o, -a, 0, a, o],
                    [0, 0, 0, s, -l, 0, l, s, 0, 0, 0, 1],
                  ),
                );
              })(t[0], t[1], t[2])
            : d;
        }
        if ("R6" === t)
          for (let [t, o] of Object.entries(j)) {
            let l = T(e, r, o);
            if (o.mid) {
              let t = Math.min(
                1,
                Math.max(0, (Math.abs(s[o.bend]?.[0] ?? 0) - x) / H),
              );
              if (t > 0) {
                let a = T(e, r, {
                  parent: o.parent,
                  pivot: o.pivot,
                  end: o.mid,
                });
                l = E(l.map((e, r) => e + (a[r] - e) * t));
              }
            }
            if (o.mid && c[1] < 0) {
              let e = i[a[t]];
              h[t] = (function (e, t, r, o, a, n) {
                let i = Math.hypot(e[0], e[2]),
                  s = i > 0.001 ? [e[0] / i, e[2] / i] : [0, -1],
                  l = A(r, o),
                  p = g(R(a.c0), L(a.c1)),
                  f = w(...M(a.c0)),
                  c = P(g(a.c0, L(a.c1)), n),
                  h = 0,
                  u = Math.PI / 2;
                for (let e = 0; e < 28; e++) {
                  let e = (h + u) / 2,
                    o = g(
                      b(l, [
                        Math.sin(e) * s[0],
                        -Math.cos(e),
                        Math.sin(e) * s[1],
                      ]),
                      r,
                    );
                  P(g(f, g(o, p)), n) - t < c ? (h = e) : (u = e);
                }
                let m = Math.acos(Math.max(0, (n[1] - t) / n[1])),
                  d = m + ((h + u) / 2 - m) * Math.min(1, t / 0.2);
                return g(
                  b(l, [Math.sin(d) * s[0], -Math.cos(d), Math.sin(d) * s[1]]),
                  r,
                );
              })(l, -c[1], h[t], y(r, t), e, n.parts[e.part1].size);
              continue;
            }
            let p = A(h[t], y(r, t));
            k(p, l, 1e-9) || (h[t] = g(b(p, l), h[t]));
          }
        let u = {};
        for (let [e, t] of Object.entries(a)) {
          let r = h[e];
          ("hips" === e && (r = g(w(...c), r)), (u[t] = r));
        }
        let m = {};
        if ("R6" === t && s.spine) {
          let e = g(w(...U), g(h.spine, w(-U[0], -U[1], -U[2])));
          u.RootJoint = g(u.RootJoint, e);
          let t = L(e);
          for (let r of S) {
            let o = M(i[r].c0),
              a = g(w(-o[0], -o[1], -o[2]), g(t, w(...o)));
            ((u[r] = g(a, u[r])), (m[r] = e));
          }
        }
        let v = (e, t) => {
            let r = R(i[e].c0),
              o = g(L(r), g(t, r));
            return k(o, d, 1e-9) ? [...d] : o;
          },
          J = {};
        for (let e of Object.keys(u)) {
          if (!i[e]) throw Error(`${t} dump has no Motor6D ${e}`);
          J[e] = v(e, u[e]);
        }
        if (!o) return J;
        let W = C(t, r, J);
        for (let [e, o] of Object.entries(N[t])) {
          let a = (function (e, t, r, o, a, n) {
            let i = t[e],
              s = g(L(r[o.part0]), r[o.part1]);
            n && (s = g(n, s));
            let l = i.parts[o.part0].size.map((e) => e / 2),
              p =
                (function (e, t, r) {
                  let o = `${e}/${r.name}`;
                  if (!(o in F)) {
                    let a = C(e, t, $({}, e, t, { declip: !1 }));
                    F[o] = (function (e, t, r, o, a) {
                      let n = t[e],
                        i = g(L(r[a]), r[o]),
                        s = n.parts[a].size.map((e) => e / 2),
                        l = 0;
                      for (let e of O(n.parts[o].size)) {
                        let t = M(g(i, w(...e))),
                          r = Math.min(
                            s[0] - Math.abs(t[0]),
                            s[1] - Math.abs(t[1]),
                            s[2] - Math.abs(t[2]),
                          );
                        r > l && (l = r);
                      }
                      return l;
                    })(e, t, a, r.part1, r.part0);
                  }
                  return F[o];
                })(e, t, o) + 0.03,
              f = 0;
            for (let e of O(i.parts[o.part1].size)) {
              let t = M(g(s, w(...e)));
              Math.min(
                l[0] - Math.abs(t[0]),
                l[1] - Math.abs(t[1]),
                l[2] - Math.abs(t[2]),
              ) <= p || (f = Math.max(f, l[0] + 0.02 - a * t[0] - p));
            }
            return f <= 0 ? null : [a * Math.min(f, 0.6), 0, 0];
          })(t, r, W, i[e], o, m[e]);
          a && (J[e] = v(e, g(w(...a), u[e])));
        }
        return J;
      }
      function C(e, t, r) {
        let o = t[e],
          a = Object.fromEntries(o.joints.map((e) => [e.part1, e])),
          n = { [o.root]: [...d] },
          i = (t) => {
            if (n[t]) return n[t];
            let o = a[t];
            if (!o) throw Error(`${e}: part ${t} has no Motor6D`);
            let s = i(o.part0),
              l = r[o.name] ?? d;
            return ((n[t] = g(s, g(o.c0, g(l, L(o.c1))))), n[t]);
          };
        for (let e of Object.keys(o.parts)) i(e);
        return n;
      }
      function J(e, t) {
        let r = C(e, t, {});
        return Math.min(
          ...("R6" === e
            ? ["Left Leg", "Right Leg"]
            : ["LeftFoot", "RightFoot"]
          ).map((o) => P(r[o], t[e].parts[o].size)),
        );
      }
      let W = {
          sword: { pose: "pointForward", grabAlpha: 0.1, length: 3.6 },
          gun: { pose: "pointForward", grabAlpha: 0.35, length: 1.6 },
          rod: { pose: "pointForward", grabAlpha: 0.05, length: 4.5 },
          pickaxe: { pose: "shaftUp", grabAlpha: 0.3, length: 2.6, head: 1 },
          axe: { pose: "shaftUp", grabAlpha: 0.3, length: 2.6, head: 0.9 },
        },
        K = {
          R15: { part: "RightHand", offset: [0, -0.16, 0] },
          R6: { part: "Right Arm", offset: [0, -1, 0] },
        };
      function Y(e, t, r) {
        return M(g(e, w(t[0] + r[0], t[1] + r[1], t[2] + r[2])));
      }
      let _ = JSON.parse(
          '{"R15":{"root":"HumanoidRootPart","joints":[{"part1":"LeftHand","name":"LeftWrist","part0":"LeftLowerArm","c0":[0.00047913583694025874,-0.5321747660636902,0,1,0,0,0,1,0,0,0,1],"c1":[0.0004714469250757247,0.13157276809215546,0,1,0,0,0,1,0,0,0,1]},{"part1":"RightHand","name":"RightWrist","part0":"RightLowerArm","c0":[0,-0.5321747660636902,0,1,0,0,0,1,0,0,0,1],"c1":[0,0.13157276809215546,0,1,0,0,0,1,0,0,0,1]},{"part1":"LeftLowerArm","name":"LeftElbow","part0":"LeftUpperArm","c0":[0.0004797325236722827,-0.3548935651779175,0,1,0,0,0,1,0,0,0,1],"c1":[0.00047913583694025874,0.27482420206069946,0,1,0,0,0,1,0,0,0,1]},{"part1":"RightLowerArm","name":"RightElbow","part0":"RightUpperArm","c0":[0,-0.3550090789794922,0,1,0,0,0,1,0,0,0,1],"c1":[0,0.27470871806144714,0,1,0,0,0,1,0,0,0,1]},{"part1":"LeftUpperArm","name":"LeftShoulder","part0":"UpperTorso","c0":[-0.9716038703918457,0.5975129008293152,0,1,0,0,0,1,0,0,0,1],"c1":[0.5005336999893188,0.4189233183860779,0,1,0,0,0,1,0,0,0,1]},{"part1":"RightUpperArm","name":"RightShoulder","part0":"UpperTorso","c0":[0.9716038107872009,0.5975129008293152,0,1,0,0,0,1,0,0,0,1],"c1":[-0.5005340576171875,0.4189233183860779,0,1,0,0,0,1,0,0,0,1]},{"part1":"LeftFoot","name":"LeftAnkle","part0":"LeftLowerLeg","c0":[0,-0.5964863896369934,-0.000002153794639525586,1,0,0,0,1,0,0,0,1],"c1":[0,0.10601543635129929,-0.0000017241147816093871,1,0,0,0,1,0,0,0,1]},{"part1":"LeftLowerLeg","name":"LeftKnee","part0":"LeftUpperLeg","c0":[0,-0.4493465721607208,0,1,0,0,0,1,0,0,0,1],"c1":[0,0.41318902373313904,0,1,0,0,0,1,0,0,0,1]},{"part1":"UpperTorso","name":"Waist","part0":"LowerTorso","c0":[0,0.20030122995376587,0,1,0,0,0,1,0,0,0,1],"c1":[0,-0.8490004539489746,0,1,0,0,0,1,0,0,0,1]},{"part1":"LeftUpperLeg","name":"LeftHip","part0":"LowerTorso","c0":[-0.49785315990448,-0.20024849474430084,0,1,0,0,0,1,0,0,0,1],"c1":[0,0.4713934361934662,0,1,0,0,0,1,0,0,0,1]},{"part1":"RightFoot","name":"RightAnkle","part0":"RightLowerLeg","c0":[0,-0.5964863896369934,0.00007419446774292737,1,0,0,0,1,0,0,0,1],"c1":[0,0.10601531714200974,0.00007652934436919168,1,0,0,0,1,0,0,0,1]},{"part1":"RightLowerLeg","name":"RightKnee","part0":"RightUpperLeg","c0":[0,-0.4491719603538513,-0.000021281741283019073,1,0,0,0,1,0,0,0,1],"c1":[0,0.4133589267730713,0.000024858549295458943,1,0,0,0,1,0,0,0,1]},{"part1":"LowerTorso","name":"Root","part0":"HumanoidRootPart","c0":[0,-1,0,1,0,0,0,1,0,0,0,1],"c1":[0,-0.20024849474430084,0,1,0,0,0,1,0,0,0,1]},{"part1":"RightUpperLeg","name":"RightHip","part0":"LowerTorso","c0":[0.4978529214859009,-0.20024849474430084,-0.000019197339497623034,1,0,0,0,1,0,0,0,1],"c1":[0,0.47139355540275574,-0.00006491500971606001,1,0,0,0,1,0,0,0,1]},{"part1":"Head","name":"Neck","part0":"UpperTorso","c0":[0,0.849033772945404,0,1,0,0,0,1,0,0,0,1],"c1":[0,-0.5758036375045776,0,1,0,0,0,1,0,0,0,1]}],"name":"R15Rig","parts":{"RightUpperLeg":{"cframe":[0.49785327911376953,-1.47137451171875,0.00004571766476146877,1,0,0,0,1,0,0,0,1],"class":"MeshPart","size":[0.992843508720398,1.3629319667816162,0.9727016687393188]},"LeftLowerArm":{"cframe":[-1.4721369743347168,-0.2015380859375,0,1,0,0,0,1,0,0,0,1],"class":"MeshPart","size":[1.0010666847229004,1.1175124645233154,1.0018666982650757]},"RightUpperArm":{"cframe":[1.4721379280090332,0.42816162109375,0,1,0,0,0,1,0,0,0,1],"class":"MeshPart","size":[1.0010666847229004,1.24159836769104,1.0018666982650757]},"Head":{"cframe":[0,1.6744384765625,0,1,0,0,0,1,0,0,0,1],"class":"MeshPart","size":[1.1589776277542114,1.1820125579833984,1.1606383323669434]},"LowerTorso":{"cframe":[0,-0.79974365234375,0,1,0,0,0,1,0,0,0,1],"class":"MeshPart","size":[1.9914121627807617,0.4006533920764923,1.003999948501587]},"RightHand":{"cframe":[1.4721364974975586,-0.86529541015625,0,1,0,0,0,1,0,0,0,1],"class":"MeshPart","size":[0.9842666387557983,0.3157655596733093,1.0282666683197021]},"HumanoidRootPart":{"cframe":[0,0,0,1,0,0,0,1,0,0,0,1],"class":"Part","size":[2,2,1]},"UpperTorso":{"cframe":[0,0.24957275390625,0,1,0,0,0,1,0,0,0,1],"class":"MeshPart","size":[1.9432077407836914,1.6980316638946533,1.003999948501587]},"LeftUpperArm":{"cframe":[-1.472137451171875,0.42816162109375,0,1,0,0,0,1,0,0,0,1],"class":"MeshPart","size":[1.0010666847229004,1.24159836769104,1.0018666982650757]},"RightLowerArm":{"cframe":[1.4721369743347168,-0.2015380859375,0,1,0,0,0,1,0,0,0,1],"class":"MeshPart","size":[1.0010666847229004,1.1175124645233154,1.0018666982650757]},"LeftHand":{"cframe":[-1.4721293449401855,-0.86529541015625,0,1,0,0,0,1,0,0,0,1],"class":"MeshPart","size":[0.9842666387557983,0.3157655596733093,1.0282666683197021]},"RightFoot":{"cframe":[0.49785327911376953,-3.03643798828125,0,1,0,0,0,1,0,0,0,1],"class":"MeshPart","size":[1.0088740587234497,0.3119938373565674,1.0010666847229004]},"LeftFoot":{"cframe":[-0.49785280227661133,-3.03643798828125,0,1,0,0,0,1,0,0,0,1],"class":"MeshPart","size":[1.0088740587234497,0.3119938373565674,1.0010666847229004]},"RightLowerLeg":{"cframe":[0.49785327911376953,-2.33392333984375,0,1,0,0,0,1,0,0,0,1],"class":"MeshPart","size":[0.992843508720398,1.3006644248962402,0.9728000164031982]},"LeftUpperLeg":{"cframe":[-0.49785280227661133,-1.47137451171875,0,1,0,0,0,1,0,0,0,1],"class":"MeshPart","size":[0.992843508720398,1.3629319667816162,0.9727016687393188]},"LeftLowerLeg":{"cframe":[-0.49785280227661133,-2.33392333984375,0,1,0,0,0,1,0,0,0,1],"class":"MeshPart","size":[0.992843508720398,1.3006644248962402,0.9728000164031982]}}},"R6":{"root":"HumanoidRootPart","joints":[{"part1":"Right Arm","name":"Right Shoulder","part0":"Torso","c0":[1,0.5,0,0,0,1,0,1,0,-1,0,0],"c1":[-0.5,0.5,0,0,0,1,0,1,0,-1,0,0]},{"part1":"Left Arm","name":"Left Shoulder","part0":"Torso","c0":[-1,0.5,0,0,0,-1,0,1,0,1,0,0],"c1":[0.5,0.5,0,0,0,-1,0,1,0,1,0,0]},{"part1":"Right Leg","name":"Right Hip","part0":"Torso","c0":[1,-1,0,0,0,1,0,1,0,-1,0,0],"c1":[0.5,1,0,0,0,1,0,1,0,-1,0,0]},{"part1":"Left Leg","name":"Left Hip","part0":"Torso","c0":[-1,-1,0,0,0,-1,0,1,0,1,0,0],"c1":[-0.5,1,0,0,0,-1,0,1,0,1,0,0]},{"part1":"Head","name":"Neck","part0":"Torso","c0":[0,1,0,-1,0,0,0,0,1,0,1,0],"c1":[0,-0.5,0,-1,0,0,0,0,1,0,1,0]},{"part1":"Torso","name":"RootJoint","part0":"HumanoidRootPart","c0":[0,0,0,-1,0,0,0,0,1,0,1,0],"c1":[0,0,0,-1,0,0,0,0,1,0,1,0]}],"name":"R6Rig","parts":{"Left Leg":{"cframe":[-0.5,-2,0,1,0,0,0,1,0,0,0,1],"class":"Part","size":[1,2,1]},"Right Arm":{"cframe":[1.5,0,0,1,0,0,0,1,0,0,0,1],"class":"Part","size":[1,2,1]},"Head":{"cframe":[0,1.5,0,1,0,0,0,1,0,0,0,1],"class":"Part","size":[2,1,1]},"Right Leg":{"cframe":[0.5,-2,0,1,0,0,0,1,0,0,0,1],"class":"Part","size":[1,2,1]},"Torso":{"cframe":[0,0,0,1,0,0,0,1,0,0,0,1],"class":"Part","size":[2,2,1]},"HumanoidRootPart":{"cframe":[0,0,0,1,0,0,0,1,0,0,0,1],"class":"Part","size":[2,2,1]},"Left Arm":{"cframe":[-1.5,0,0,1,0,0,0,1,0,0,0,1],"class":"Part","size":[1,2,1]}}}}',
        ),
        D = J("R6", _),
        I = ["R6", "R15"];
      function X({ clipUrl: e, rigs: t = I }) {
        let r = (0, a.li)(null),
          [l, p] = (0, a.J0)(null),
          [f, d] = (0, a.J0)(null);
        (0, a.vJ)(() => {
          let t = !1;
          return (
            fetch(e)
              .then((e) => {
                if (!e.ok) throw Error(`clip fetch failed: HTTP ${e.status}`);
                return e.json();
              })
              .then((e) => {
                t || p(e);
              })
              .catch((e) => {
                t || d(e instanceof Error ? e.message : String(e));
              }),
            () => {
              t = !0;
            }
          );
        }, [e]);
        let g = t.join(",");
        return ((0, a.vJ)(() => {
          let e = r.current;
          if (!e || !l) return;
          let t = e.clientWidth,
            o = e.clientHeight,
            a = new n.Z58();
          a.background = new n.Q1f(1974310);
          let p = new n.ubm(45, t / o, 0.1, 200);
          p.position.set(6, 3, -11);
          let f = new i.JeP({ antialias: !0 });
          (f.setSize(t, o),
            f.setPixelRatio(Math.min(window.devicePixelRatio, 2)),
            e.appendChild(f.domElement));
          let d = new s.N(p, f.domElement);
          (d.target.set(0, 0, 0),
            (d.enableDamping = !0),
            a.add(new n.dth(0xffffff, 3356220, 1.1)));
          let L = new n.ZyN(0xffffff, 1.2);
          (L.position.set(-4, 8, -5), a.add(L));
          let R = new n.fTw(24, 24, 4869720, 3356220);
          ((R.position.y = D), a.add(R));
          let w = g.split(","),
            M = 1 === w.length ? [0] : w.map((e, t) => (0 === t ? -1 : 1) * 3),
            b = w.map((e, t) =>
              (function (e, t, r) {
                let o = new Map();
                for (let [r, a] of Object.entries(_[t].parts)) {
                  if ("HumanoidRootPart" === r) continue;
                  let t = new n.iNn(...a.size),
                    i = new n._4j({
                      color:
                        r.includes("Torso") || "HumanoidRootPart" === r
                          ? 879020
                          : r.includes("Leg") || r.includes("Foot")
                            ? 4953931
                            : 0xf5cd30,
                      roughness: 0.85,
                    }),
                    s = new n.eaF(t, i);
                  ((s.matrixAutoUpdate = !1), e.add(s), o.set(r, s));
                }
                let a = new n.DXC(
                  new n.LoY(),
                  new n.mrM({ color: 5941990, linewidth: 2 }),
                );
                return (
                  (a.frustumCulled = !1),
                  e.add(a),
                  {
                    rigName: t,
                    offsetX: r,
                    offsetY: D - J(t, _),
                    meshes: o,
                    toolLine: a,
                  }
                );
              })(a, e, M[t]),
            ),
            A = (function (e) {
              let t = document.createElement("span");
              ((t.className = "text-muted-foreground"), e.appendChild(t));
              let r = getComputedStyle(t).color;
              return (e.removeChild(t), r);
            })(e);
          w.forEach((e, t) =>
            (function (e, t, r, o) {
              let a = document.createElement("canvas");
              ((a.width = 128), (a.height = 48));
              let i = a.getContext("2d");
              if (!i) return;
              ((i.font = "600 30px system-ui, sans-serif"),
                (i.textAlign = "center"),
                (i.textBaseline = "middle"),
                (i.fillStyle = o),
                i.fillText(t, 64, 24));
              let s = new n.kxk(
                new n.RoJ({ map: new n.GOR(a), transparent: !0 }),
              );
              (s.position.set(r, 3.4, 0), s.scale.set(1.6, 0.6, 1), e.add(s));
            })(a, e, M[t], A),
          );
          let k = m(l),
            P = l.loop ? k : k + 0.7,
            z = performance.now(),
            j = 0,
            x = () => {
              j = requestAnimationFrame(x);
              let e = Math.min(
                ((performance.now() - z) / 1e3) % Math.max(P, 0.01),
                k,
              );
              for (let t of b)
                !(function (e, t, r) {
                  let o = (function (e, t) {
                      let r = m(e);
                      e.loop && r > 0 && (t = ((t % r) + r) % r);
                      let o = new Set();
                      for (let t of e.keys)
                        for (let e of Object.keys(t.pose)) o.add(e);
                      let a = {};
                      for (let s of o) {
                        var n, i;
                        let o = e.keys.filter((e) => s in e.pose),
                          l = null,
                          p = null;
                        for (let e of o)
                          (e.t <= t && (l = e), e.t > t && !p && (p = e));
                        if (!l) {
                          a[s] = h(p.pose, s);
                          continue;
                        }
                        if (!p)
                          if (e.loop && l.t < r)
                            p = { t: r, pose: o[0].pose, ease: o[0].ease };
                          else {
                            a[s] = h(l.pose, s);
                            continue;
                          }
                        let f = c[p.ease ?? "inOut"]((t - l.t) / (p.t - l.t));
                        a[s] =
                          ((n = h(l.pose, s)),
                          (i = h(p.pose, s)),
                          Array.isArray(n)
                            ? u(n, i, f)
                            : {
                                pos: u(n.pos, i.pos, f),
                                rot: u(n.rot, i.rot, f),
                              });
                      }
                      return a;
                    })(t, r),
                    a = C(e.rigName, _, $(o, e.rigName, _));
                  for (let [t, r] of e.meshes) {
                    var i, s;
                    let o = a[t];
                    o &&
                      ((i = e.offsetX),
                      (s = e.offsetY),
                      r.matrix.set(
                        o[3],
                        o[4],
                        o[5],
                        o[0] + i,
                        o[6],
                        o[7],
                        o[8],
                        o[1] + s,
                        o[9],
                        o[10],
                        o[11],
                        o[2],
                        0,
                        0,
                        0,
                        1,
                      ));
                  }
                  if (t.tool) {
                    let r = K[e.rigName],
                      o = (function (e, t, r) {
                        let o = W[e];
                        if (!o)
                          throw Error(
                            `unknown tool category "${e}" (valid: ${Object.keys(W).join(", ")})`,
                          );
                        let a = (e) => [0, -e, 0],
                          n = (e) => [0, 0, -e];
                        if ("pointForward" === o.pose) {
                          let e = -o.grabAlpha * o.length,
                            n = (1 - o.grabAlpha) * o.length;
                          return [[Y(t, r, a(e)), Y(t, r, a(n))]];
                        }
                        let i = -o.grabAlpha * o.length,
                          s = (1 - o.grabAlpha) * o.length,
                          l = Y(t, r, n(s)),
                          p = Y(t, r, [0, -o.head, -s]);
                        return [
                          [Y(t, r, n(i)), l],
                          [l, p],
                        ];
                      })(t.tool, a[r.part], r.offset),
                      i = [];
                    for (let [t, r] of o)
                      i.push(
                        t[0] + e.offsetX,
                        t[1] + e.offsetY,
                        t[2],
                        r[0] + e.offsetX,
                        r[1] + e.offsetY,
                        r[2],
                      );
                    (e.toolLine.geometry.setAttribute(
                      "position",
                      new n.qtW(i, 3),
                    ),
                      (e.toolLine.visible = !0));
                  } else e.toolLine.visible = !1;
                })(t, l, e);
              (d.update(), f.render(a, p));
            };
          x();
          let H = () => {
            let t = e.clientWidth,
              r = e.clientHeight;
            ((p.aspect = t / r), p.updateProjectionMatrix(), f.setSize(t, r));
          };
          return (
            window.addEventListener("resize", H),
            () => {
              (cancelAnimationFrame(j),
                window.removeEventListener("resize", H),
                d.dispose(),
                f.dispose(),
                f.forceContextLoss(),
                a.traverse((e) => {
                  if (e instanceof n.eaF) {
                    e.geometry.dispose();
                    let t = e.material;
                    Array.isArray(t)
                      ? t.forEach((e) => e.dispose())
                      : t.dispose();
                  }
                }),
                e.removeChild(f.domElement));
            }
          );
        }, [l, g]),
        f)
          ? (0, o.jsx)("div", {
              className:
                "flex h-full items-center justify-center text-caption text-destructive",
              children: f,
            })
          : (0, o.jsxs)("div", {
              className: "relative h-full w-full",
              children: [
                (0, o.jsx)("div", { ref: r, className: "h-full w-full" }),
                (0, o.jsxs)("div", {
                  className:
                    "pointer-events-none absolute bottom-2 left-3 text-caption text-muted-foreground",
                  children: [
                    "drag to orbit \xb7 scroll to zoom",
                    l ? ` \xb7 ${l.name}` : "",
                  ],
                }),
              ],
            });
      }
    },
  },
]);

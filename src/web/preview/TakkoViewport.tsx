import { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { disposeScene, type PreviewSceneFactory } from "./scenes";

export function TakkoViewport({
  title,
  factory,
  duration = 0,
}: {
  title: string;
  factory: PreviewSceneFactory;
  duration?: number;
}) {
  const container = useRef<HTMLDivElement>(null),
    host = useRef<HTMLDivElement>(null);
  const [playing, setPlaying] = useState(
    duration > 0 && !matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  const [time, setTime] = useState(0),
    [error, setError] = useState(""),
    [retry, setRetry] = useState(0);
  const playback = useRef({ playing, time: 0 });
  playback.current.playing = playing;
  const cameraActions = useRef<{
    frame: () => void;
    orbit: (a: number) => void;
    zoom: (a: number) => void;
  } | null>(null);
  useEffect(() => {
    const element = host.current!;
    let renderer: THREE.WebGLRenderer;
    try {
      renderer = new THREE.WebGLRenderer({
        antialias: true,
        preserveDrawingBuffer: true,
      });
    } catch {
      setError(
        "3D preview is unavailable. Enable browser graphics acceleration and retry. Your clip is still saved.",
      );
      return;
    }
    let content: ReturnType<PreviewSceneFactory>;
    try {
      content = factory();
    } catch {
      renderer.dispose();
      renderer.forceContextLoss();
      setError("This preview could not be loaded. Your game has not changed.");
      return;
    }
    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x141414);
    scene.add(content.root);
    // Imported parts set matrices directly. Bounds must see those world transforms
    // before the first renderer update, otherwise the camera frames the origin.
    content.root.updateMatrixWorld(true);
    const bounds =
      content.bounds ?? new THREE.Box3().setFromObject(content.root);
    const center = bounds.getCenter(new THREE.Vector3()),
      radius = Math.max(bounds.getSize(new THREE.Vector3()).length() / 2, 1);
    const grid = new THREE.GridHelper(
      Math.ceil(radius * 5),
      24,
      0x444444,
      0x282828,
    );
    grid.position.set(center.x, bounds.min.y - 0.06, center.z);
    scene.add(grid);
    scene.add(new THREE.HemisphereLight(0xffffff, 0x444444, 2.2));
    const light = new THREE.DirectionalLight(0xffffff, 3);
    light.position.set(4, 8, 6);
    scene.add(light);
    const camera = new THREE.PerspectiveCamera(
        40,
        1,
        Math.max(0.01, radius / 10000),
        Math.max(1000, radius * 32),
      ),
      canvas = renderer.domElement;
    canvas.setAttribute("role", "img");
    canvas.setAttribute("aria-label", title);
    canvas.tabIndex = 0;
    canvas.title =
      "Drag to orbit, scroll to zoom. Keyboard: left/right to orbit, +/- to zoom, Home to reset.";
    const keydown = (event: KeyboardEvent) => {
      if (!["ArrowLeft", "ArrowRight", "+", "-", "Home"].includes(event.key))
        return;
      event.preventDefault();
      if (event.key === "Home") cameraActions.current?.frame();
      else if (event.key === "+" || event.key === "-")
        cameraActions.current?.zoom(event.key === "+" ? 0.85 : 1.15);
      else cameraActions.current?.orbit(event.key === "ArrowLeft" ? -0.3 : 0.3);
    };
    canvas.addEventListener("keydown", keydown);
    canvas.dataset.renderer = "webgl";
    renderer.setPixelRatio(Math.min(devicePixelRatio, 1.5));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    element.appendChild(canvas);
    const controls = new OrbitControls(camera, canvas);
    controls.enableDamping = true;
    controls.dampingFactor = 0.12;
    controls.minDistance = radius * 0.5;
    controls.maxDistance = radius * 12;
    const frame = () => {
      const fov = THREE.MathUtils.degToRad(camera.fov);
      const distance =
        (radius /
          Math.sin(Math.atan(Math.tan(fov / 2) * Math.min(camera.aspect, 1)))) *
        1.08;
      controls.target.copy(center);
      camera.position
        .copy(center)
        .add(
          new THREE.Vector3(0.65, 0.32, 1).normalize().multiplyScalar(distance),
        );
      controls.update();
    };
    cameraActions.current = {
      frame,
      orbit: (angle) => {
        const v = camera.position
          .clone()
          .sub(controls.target)
          .applyAxisAngle(new THREE.Vector3(0, 1, 0), angle);
        camera.position.copy(controls.target).add(v);
        controls.update();
      },
      zoom: (scale) => {
        camera.position
          .sub(controls.target)
          .multiplyScalar(scale)
          .add(controls.target);
        controls.update();
      },
    };
    let firstSize = true;
    const resize = () => {
      const { width, height } = element.getBoundingClientRect();
      if (!width || !height) return;
      renderer.setSize(width, height, false);
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
      if (firstSize) {
        frame();
        firstSize = false;
      }
    };
    const observer = new ResizeObserver(resize);
    observer.observe(element);
    resize();
    let visible = true,
      lost = false,
      raf = 0,
      previous = performance.now(),
      lastLabel = 0;
    const intersection = new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
    });
    intersection.observe(element);
    const contextLost = (event: Event) => {
      event.preventDefault();
      lost = true;
      setError(
        "The 3D view lost its graphics context. Retry to restore the saved preview.",
      );
    };
    canvas.addEventListener("webglcontextlost", contextLost);
    const draw = (now: number) => {
      const delta = Math.min((now - previous) / 1000, 0.1);
      previous = now;
      if (visible && !document.hidden && !lost) {
        if (playback.current.playing && duration)
          playback.current.time = (playback.current.time + delta) % duration;
        content.update?.(playback.current.time);
        controls.update();
        renderer.render(scene, camera);
        if (now - lastLabel > 100) {
          canvas.dataset.time = playback.current.time.toFixed(3);
          canvas.dataset.camera = camera.position
            .toArray()
            .map((v) => v.toFixed(3))
            .join(",");
          canvas.dataset.triangles = String(renderer.info.render.triangles);
          setTime(playback.current.time);
          lastLabel = now;
        }
      }
      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => {
      cancelAnimationFrame(raf);
      observer.disconnect();
      intersection.disconnect();
      controls.dispose();
      canvas.removeEventListener("keydown", keydown);
      canvas.removeEventListener("webglcontextlost", contextLost);
      disposeScene(scene);
      renderer.dispose();
      renderer.forceContextLoss();
      canvas.remove();
      cameraActions.current = null;
    };
  }, [factory, duration, retry, title]);
  return (
    <div className="takko-viewport" ref={container}>
      <div className="viewport-surface" ref={host}>
        <span className="viewport-badge">
          3D · {playing ? "Live loop" : "Paused"}
        </span>
      </div>
      {error && (
        <div role="alert" className="viewport-error">
          {error}{" "}
          <button
            onClick={() => {
              setError("");
              setRetry((n) => n + 1);
            }}
          >
            Retry preview
          </button>
        </div>
      )}
      <div className="viewport-controls">
        {duration > 0 && (
          <>
            <button
              aria-label={playing ? "Pause animation" : "Play animation"}
              onClick={() => setPlaying((v) => !v)}
            >
              {playing ? "Pause" : "Play"}
            </button>
            <input
              type="range"
              aria-label={`Position in ${title}`}
              min="0"
              max={duration}
              step=".01"
              value={time}
              onChange={(e) => {
                playback.current.time = Number(e.target.value);
                setTime(Number(e.target.value));
                setPlaying(false);
              }}
            />
          </>
        )}
        <button
          aria-label="Fullscreen preview"
          onClick={() => {
            const task = document.fullscreenElement
              ? document.exitFullscreen()
              : container.current?.requestFullscreen();
            task?.catch(() =>
              setError("Fullscreen is unavailable in this browser."),
            );
          }}
        >
          ⛶
        </button>
      </div>
      <div className="viewport-help">
        <span>Drag to orbit · scroll to zoom · right-drag to pan</span>
      </div>
    </div>
  );
}

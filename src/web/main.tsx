import "./tokens.css";
import "./styles.css";
// Tokens first: every other sheet reads from this one.
import React, { lazy, Suspense } from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { installFocusModality } from './focus-modality';
installFocusModality();
const DesignLab = lazy(() => import("./design-lab/DesignLab"));
const isDesignLab =
  window.location.pathname.replace(/\/$/, "") === "/design-lab";
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    {isDesignLab ? (
      <Suspense fallback={<p role="status">Opening Takko design lab…</p>}>
        <DesignLab />
      </Suspense>
    ) : (
      <App />
    )}
  </React.StrictMode>,
);

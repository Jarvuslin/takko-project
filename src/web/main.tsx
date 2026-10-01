import "./tokens.css";
import "./styles.css";
// Tokens first: every other sheet reads from this one.
import React from "react";
import { createRoot } from "react-dom/client";
import { App } from "./App";
import { installFocusModality } from './focus-modality';
installFocusModality();
createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

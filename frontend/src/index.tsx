import React from "react";
import { Deck, WebMercatorViewport } from '@deck.gl/core';
import ReactDOM from "react-dom/client";
import App from "./App";
import "./App.css";

import reportWebVitals from "./reportWebVitals";

// --- Production Log Optimization ---
if (process.env.NODE_ENV === "production") {
  console.log = () => {};
  console.debug = () => {};
  console.info = () => {};
}

// --- DECK.GL CRASH FIX ---
// Prevents "Cannot read properties of undefined (reading 'project')" during fast unmounts/mounts.
if (Deck && Deck.prototype.getViewports) {
  const origGetViewports = Deck.prototype.getViewports;
  Deck.prototype.getViewports = function() {
    const viewports = origGetViewports.call(this);
    if (!viewports || viewports.length === 0 || !viewports[0]) {
      // Return a valid WebMercatorViewport to swallow the mouse event safely without breaking picking
      return [new WebMercatorViewport({ width: 1, height: 1, longitude: 0, latitude: 0, zoom: 1 })];
    }
    return viewports;
  };
}
// -------------------------

const root = ReactDOM.createRoot(
  document.getElementById("root") as HTMLElement,
);
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();


import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter, Route, Routes } from "react-router-dom";
import App from "./App";
import Home from "./routes/explore";
import About from "./routes/my-assets";
import "./assets/index.css";
import ViewAsset from "./routes/view-asset";
import Settings from "./routes/settings";

declare global {
  interface String {
    toTitleCase(): string;
  }
}

String.prototype.toTitleCase = function () {
  return this.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HashRouter>
      <Routes>
        <Route path="/" element={<App />}>
          <Route index element={<Home />} />
          <Route path="my-assets" element={<About />} />
          <Route path="settings" element={<Settings />} />
          <Route path="asset/:source/:slug" element={<ViewAsset />} />
        </Route>
      </Routes>
    </HashRouter>
  </StrictMode>
);

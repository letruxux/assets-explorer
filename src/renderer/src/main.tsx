import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { HashRouter, Route, Routes } from "react-router-dom";
import App from "./App";
import Home from "./routes/explore";
import About from "./routes/my-assets";
import "./assets/index.css";
import ViewAsset from "./routes/view-asset";
import Settings from "./routes/settings";
import ErrorFallback from "./components/error-page";
import { ErrorBoundary } from "react-error-boundary";
import { useInstalledFiles } from "./store/use-installed-files";
import { useSettings } from "./store/use-settings";

declare global {
  interface String {
    toTitleCase(): string;
  }
}

String.prototype.toTitleCase = function () {
  return this.toLowerCase()
    .replace(/(^|[-_;\s])(\w)/g, (_, _sep, char) => " " + char.toUpperCase())
    .trim();
};

useInstalledFiles.getState().init();
useSettings.getState().init();

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <HashRouter>
      <ErrorBoundary FallbackComponent={ErrorFallback}>
        <Routes>
          <Route path="/" element={<App />}>
            <Route index element={<Home />} />
            <Route path="my-assets" element={<About />} />
            <Route path="settings" element={<Settings />} />
            <Route path="asset/:id" element={<ViewAsset />} />
          </Route>
        </Routes>
      </ErrorBoundary>
    </HashRouter>
  </StrictMode>
);

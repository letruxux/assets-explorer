import { app, ipcMain, shell } from "electron";
import { settings } from "@modules/settings";
import { getAssetsManifest } from "@modules/assets-manifest";
import { getAsset, getFeatured, search } from "@lib/search";
import { actions } from "./actions";
import type { ApiType } from "@shared/api";
import type { InstalledFile } from "@shared/types";
import { verifySketchfabApiKey } from "./lib/websites-raw-api/sketchfab-api";

const api: ApiType = {
  changeAssetsPath() {
    return actions.changeAssetsPath();
  },

  deleteFile(installedFile) {
    return actions.deleteAsset(installedFile);
  },

  downloadFile(asset, file) {
    return actions.downloadFile(asset, file);
  },

  async getInstalledFiles() {
    return actions.getInstalledFiles();
  },

  async openFileFolder(file) {
    return actions.openFileFolder(file);
  },

  async readAssetsManifest() {
    return getAssetsManifest()?.data ?? null;
  },

  async readSettings() {
    return settings.getAll();
  },

  async getVersion() {
    return { version: app.getVersion(), name: app.getName() };
  },

  async setSetting(key, value) {
    if (key === "sketchfabApiKey" && value !== "") {
      const valid = await verifySketchfabApiKey(value as string);
      if (!valid) throw new Error("Invalid Sketchfab API key");
    }

    settings.set(key, value);
  },

  getFeatured() {
    return getFeatured();
  },

  searchAssets(query, source) {
    return search(query, source);
  },

  testItchIo() {
    return actions.testItchIo();
  },

  fetchAssetDetail(id) {
    return getAsset(id);
  },

  checkForDeletedFiles() {
    return actions.checkForDeletedFiles();
  },

  deleteStaleDatabaseEntries(files: InstalledFile[]) {
    return actions.deleteStaleDbEntries(files);
  },

  async open(path) {
    shell.openPath(path);
  }
} satisfies ApiType;

export const API_CHANNELS = Object.keys(api) as Array<keyof typeof api>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function registerApi<T extends Record<string, (...args: any[]) => any>>(api: T): void {
  for (const key of Object.keys(api) as Array<keyof T>) {
    const handler = api[key];

    ipcMain.handle(key as string, (_event, ...args) => {
      return handler(...args);
    });
  }
}

export default function setupRoutes(): void {
  ipcMain.on("ping", (event) => {
    event.reply("pong");
  });

  registerApi(api);
}

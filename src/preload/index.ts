import { contextBridge, ipcRenderer } from "electron";
import { electronAPI } from "@electron-toolkit/preload";
import { Asset, AssetsManifestType, SettingsType } from "@shared/types";

const api = {
  searchAssets(query: string): Promise<Asset[]> {
    return ipcRenderer.invoke("search", query);
  },
  fetchAssetDetail(source: string, slug: string): Promise<Asset> {
    return ipcRenderer.invoke("asset-detail", source, slug);
  },
  getInstalledAssetsIds(): Promise<string[]> {
    return ipcRenderer.invoke("get-installed-assets-ids");
  },
  downloadAsset(source: string, slug: string) {
    return ipcRenderer.invoke("asset-download", source, slug);
  },
  readSettings(): Promise<SettingsType> {
    return ipcRenderer.invoke("settings-read");
  },
  changeAssetsPath() {
    return ipcRenderer.invoke("change-assets-path");
  },
  readAssetsManifest(): Promise<AssetsManifestType | null> {
    return ipcRenderer.invoke("assetsmanifest-read");
  }
};

export type ApiType = typeof api;

if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld("electron", electronAPI);
    contextBridge.exposeInMainWorld("api", api);
  } catch (error) {
    console.error(error);
  }
} else {
  // @ts-ignore - define these in your renderer type declarations
  window.electron = electronAPI;

  // @ts-ignore - define this in your renderer type declarations
  window.api = api;
}

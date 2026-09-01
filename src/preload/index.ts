import { contextBridge, ipcRenderer } from "electron";
import { electronAPI } from "@electron-toolkit/preload";
import {
  Asset,
  AssetPreview,
  AssetsManifestType,
  AssetSource,
  InstalledFile,
  SettingsType
} from "@shared/types";

const api = {
  searchAssets(query: string, source: AssetSource): Promise<AssetPreview[]> {
    return ipcRenderer.invoke("search", query, source);
  },
  fetchAssetDetail(id: string): Promise<Asset> {
    return ipcRenderer.invoke("asset-detail", id);
  },
  getInstalledFiles(): Promise<AssetsManifestType["installedFiles"]> {
    return ipcRenderer.invoke("get-installed-files");
  },
  downloadFile(asset: Asset, file: Asset["files"][number]) {
    return ipcRenderer.invoke("download-file", asset, file);
  },
  readSettings(): Promise<SettingsType> {
    return ipcRenderer.invoke("settings-read");
  },
  changeAssetsPath() {
    return ipcRenderer.invoke("change-assets-path");
  },
  readAssetsManifest(): Promise<AssetsManifestType | null> {
    return ipcRenderer.invoke("assetsmanifest-read");
  },
  openFileFolder(file: InstalledFile): Promise<void> {
    return ipcRenderer.invoke("open-file-folder", file);
  },
  deleteFile(installedFile: InstalledFile): Promise<void> {
    return ipcRenderer.invoke("delete-file", installedFile);
  },
  testItchIo(): Promise<string> {
    return ipcRenderer.invoke("test-itch-io");
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

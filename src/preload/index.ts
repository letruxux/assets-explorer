import { contextBridge, ipcRenderer } from "electron";
import { electronAPI } from "@electron-toolkit/preload";
import { Asset, AssetPreview, AssetsManifestType, AssetSource, SettingsType } from "@shared/types";

const api = {
  searchAssets(query: string, sources: AssetSource): Promise<Asset[]> {
    return ipcRenderer.invoke("search", query, sources);
  },
  fetchAssetDetail(source: string, slug: string): Promise<Asset> {
    return ipcRenderer.invoke("asset-detail", source, slug);
  },
  getInstalledAssetsIds(): Promise<string[]> {
    return ipcRenderer.invoke("get-installed-assets-ids");
  },
  downloadAsset(asset: Asset | AssetPreview) {
    return ipcRenderer.invoke("asset-download", asset);
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
  openAssetFolder(assetId: string) {
    return ipcRenderer.invoke("open-asset-folder", assetId);
  },
  deleteAsset(assetId: string) {
    return ipcRenderer.invoke("delete-asset", assetId);
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

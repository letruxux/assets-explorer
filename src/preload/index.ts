import { contextBridge, ipcRenderer } from "electron";
import { electronAPI } from "@electron-toolkit/preload";
import type { ApiType } from "@shared/api";

const api: ApiType = {
  searchAssets(query, source) {
    return ipcRenderer.invoke("search", query, source);
  },
  fetchAssetDetail(id) {
    return ipcRenderer.invoke("asset-detail", id);
  },
  getInstalledFiles() {
    return ipcRenderer.invoke("get-installed-files");
  },
  downloadFile(asset, file) {
    return ipcRenderer.invoke("download-file", asset, file);
  },
  readSettings() {
    return ipcRenderer.invoke("settings-read");
  },
  changeAssetsPath() {
    return ipcRenderer.invoke("change-assets-path");
  },
  readAssetsManifest() {
    return ipcRenderer.invoke("assetsmanifest-read");
  },
  openFileFolder(file) {
    return ipcRenderer.invoke("open-file-folder", file);
  },
  deleteFile(installedFile) {
    return ipcRenderer.invoke("delete-file", installedFile);
  },
  testItchIo() {
    return ipcRenderer.invoke("test-itch-io");
  }
};

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

import { contextBridge, ipcRenderer } from "electron";
import { electronAPI } from "@electron-toolkit/preload";
import type { ApiType } from "@shared/api";

const api: ApiType = {
  searchAssets(query, source) {
    return ipcRenderer.invoke("searchAssets", query, source);
  },
  fetchAssetDetail(id) {
    return ipcRenderer.invoke("fetchAssetDetail", id);
  },
  getInstalledFiles() {
    return ipcRenderer.invoke("getInstalledFiles");
  },
  downloadFile(asset, file) {
    return ipcRenderer.invoke("downloadFile", asset, file);
  },
  readSettings() {
    return ipcRenderer.invoke("readSettings");
  },
  changeAssetsPath() {
    return ipcRenderer.invoke("changeAssetsPath");
  },
  readAssetsManifest() {
    return ipcRenderer.invoke("readAssetsManifest");
  },
  openFileFolder(file) {
    return ipcRenderer.invoke("openFileFolder", file);
  },
  deleteFile(installedFile) {
    return ipcRenderer.invoke("deleteFile", installedFile);
  },
  testItchIo() {
    return ipcRenderer.invoke("testItchIo");
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

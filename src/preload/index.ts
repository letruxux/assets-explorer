import { contextBridge, ipcRenderer } from "electron";
import { electronAPI } from "@electron-toolkit/preload";

const api = {
  searchAssets(query: string) {
    return ipcRenderer.invoke("search", query);
  },
  fetchAssetDetail(source: string, slug: string) {
    return ipcRenderer.invoke("asset-detail", source, slug);
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

import { contextBridge, ipcRenderer } from "electron";
import { electronAPI } from "@electron-toolkit/preload";
import { type ApiType, API_CHANNELS } from "@shared/api";

const api: ApiType = Object.fromEntries(
  API_CHANNELS.map((channel) => [
    channel,
    (...args: unknown[]) => ipcRenderer.invoke(channel, ...args)
  ])
) as ApiType;

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

import { SettingsType } from "@shared/types";
import { create } from "zustand";

interface SettingsState {
  settings: SettingsType | null;
  loading: boolean;
  update(): void;
  init(): void;
}

export const useSettings = create<SettingsState>()((set, get) => ({
  settings: null,
  loading: false,
  update() {
    console.log("Updating settings...");
    set({ loading: true });
    window.api
      .readSettings()
      .then((settings) => set({ settings: settings }))
      .finally(() => set({ loading: false }));
  },
  init() {
    get().update();
    window.electron.ipcRenderer.on("settings-updated", get().update);
  }
}));

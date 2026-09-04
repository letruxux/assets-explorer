import { DEFAULT_SETTINGS, SettingsType } from "@shared/types";
import { create } from "zustand";

interface SettingsState {
  settings: SettingsType;
  loading: boolean;
  update(): void;
  init(): void;
}

function fillMissingSettings(settings: SettingsType): SettingsType {
  return {
    ...DEFAULT_SETTINGS,
    ...settings
  };
}

export const useSettings = create<SettingsState>()((set, get) => ({
  settings: DEFAULT_SETTINGS,
  loading: false,
  update() {
    console.log("Updating settings...");
    set({ loading: true });
    window.api
      .readSettings()
      .then((settings) => set({ settings: fillMissingSettings(settings) }))
      .finally(() => set({ loading: false }));
  },
  init() {
    get().update();
    window.electron.ipcRenderer.on("settings-updated", get().update);
  }
}));

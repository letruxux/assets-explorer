import { InstalledFile } from "@shared/types";
import { create } from "zustand";

interface InstalledFilesState {
  installedFiles: InstalledFile[];
  init(): void;
}

export const useInstalledFiles = create<InstalledFilesState>()((set) => ({
  installedFiles: [],
  init() {
    function updateInstalledFiles(): void {
      console.log("Updating installed files...");
      window.api.getInstalledFiles().then((files) => set({ installedFiles: files }));
    }

    window.electron.ipcRenderer.on("installed-files-updated", updateInstalledFiles);

    updateInstalledFiles();
  }
}));

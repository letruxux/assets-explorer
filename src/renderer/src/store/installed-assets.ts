import { create } from "zustand";

interface InstalledAssetsState {
  installedAssetIds: string[];
  loading: boolean;
  error: Error | null;
  initialized: boolean;
  loadInstalledAssetIds: () => Promise<void>;
  addInstalledAssetId: (id: string) => void;
  removeInstalledAssetId: (id: string) => void;
}

export const useInstalledAssetsStore = create<InstalledAssetsState>((set, get) => ({
  installedAssetIds: [],
  loading: false,
  error: null,
  initialized: false,

  removeInstalledAssetId: (id: string) => {
    set((state) => ({
      installedAssetIds: state.installedAssetIds.filter((e) => e !== id)
    }));
  },

  addInstalledAssetId: (id: string) => {
    set((state) => ({
      installedAssetIds: [...state.installedAssetIds, id]
    }));
  },

  loadInstalledAssetIds: async () => {
    if (get().loading) return;
    console.log("Updating installed asset IDs list");

    set({ loading: true, error: null, initialized: false });

    try {
      const installedAssetIds = await window.api.getInstalledAssetsIds();
      console.log("Installed asset IDs", installedAssetIds);
      set({ installedAssetIds, initialized: true });
    } catch (error) {
      set({ error: error instanceof Error ? error : new Error(String(error)) });
    } finally {
      set({ loading: false });
    }
  }
}));

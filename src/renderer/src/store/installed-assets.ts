import { create } from "zustand";

interface InstalledAssetsState {
  installedAssetIds: string[];
  loading: boolean;
  error: Error | null;
  initialized: boolean;
  loadInstalledAssetIds: () => Promise<void>;
}

export const useInstalledAssetsStore = create<InstalledAssetsState>((set, get) => ({
  installedAssetIds: [],
  loading: false,
  error: null,
  initialized: false,

  loadInstalledAssetIds: async () => {
    if (get().initialized || get().loading) return;

    set({ loading: true, error: null });

    try {
      const installedAssetIds = await window.api.getInstalledAssetsIds();
      set({ installedAssetIds, initialized: true });
    } catch (error) {
      set({ error: error instanceof Error ? error : new Error(String(error)) });
    } finally {
      set({ loading: false });
    }
  }
}));

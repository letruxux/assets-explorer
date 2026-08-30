import { useEffect } from "react";
import { useInstalledAssetsStore } from "@renderer/store/installed-assets";

// eslint-disable-next-line @typescript-eslint/explicit-function-return-type
export function useInstalledAssetIds() {
  const installedAssetIds = useInstalledAssetsStore((s) => s.installedAssetIds);
  const loading = useInstalledAssetsStore((s) => s.loading);
  const error = useInstalledAssetsStore((s) => s.error);
  const loadInstalledAssetIds = useInstalledAssetsStore((s) => s.loadInstalledAssetIds);

  useEffect(() => {
    loadInstalledAssetIds();

    window.electron.ipcRenderer.on("installed-assets-updated", () => {
      loadInstalledAssetIds();
    });

    return () => {
      window.electron.ipcRenderer.removeAllListeners("installed-assets-updated");
    };
  }, [loadInstalledAssetIds]);

  return {
    installedAssetIds,
    loading,
    error,
    refetch: loadInstalledAssetIds
  };
}

import { ipcMain } from "electron";
import { settings } from "@modules/settings";
import { getAssetsManifest } from "@modules/assets-manifest";
import { AssetPreview, AssetSource } from "@shared/types";
import { getAsset, search } from "@lib/search";
import { actions } from "./actions";

export default function setupRoutes(): void {
  ipcMain.on("ping", (event) => event.reply("pong"));
  ipcMain.handle(
    "search",
    async (_event, query: string, source: AssetSource): Promise<AssetPreview[]> => {
      return await search(query, source);
    }
  );

  ipcMain.handle("open-asset-folder", (_event, assetId: string) => {
    return actions.openAssetFolder(assetId);
  });

  ipcMain.handle("delete-asset", async (_event, assetId: string) => {
    return await actions.deleteAsset(assetId);
  });

  ipcMain.handle("asset-detail", async (_event, id: string) => {
    return await getAsset(id);
  });

  ipcMain.handle(
    "download-file",
    async (_event, url: string, assetName: string, assetId: string) => {
      return await actions.downloadFile(url, assetName, assetId);
    }
  );

  ipcMain.handle("get-installed-assets-ids", () => {
    return actions.getInstalledAssetsIds();
  });

  ipcMain.handle("settings-read", async () => {
    return settings.get();
  });

  ipcMain.handle("assetsmanifest-read", async () => {
    return getAssetsManifest()?.data;
  });

  ipcMain.handle("change-assets-path", async () => {
    return await actions.changeAssetsPath();
  });
}

import { ipcMain } from "electron";
import { settings } from "@modules/settings";
import { getAssetsManifest } from "@modules/assets-manifest";
import { Asset, AssetPreview, AssetsManifestType, AssetSource } from "@shared/types";
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

  ipcMain.handle(
    "open-file-folder",
    (_event, file: AssetsManifestType["installedFiles"][number]) => {
      return actions.openFileFolder(file);
    }
  );

  ipcMain.handle(
    "delete-file",
    async (_event, installedFile: AssetsManifestType["installedFiles"][number]) => {
      return await actions.deleteAsset(installedFile);
    }
  );

  ipcMain.handle("asset-detail", async (_event, id: string) => {
    return await getAsset(id);
  });

  ipcMain.handle("download-file", async (_event, asset: Asset, file: Asset["files"][number]) => {
    return await actions.downloadFile(asset, file);
  });

  ipcMain.handle("get-installed-files", () => {
    return actions.getInstalledFiles();
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

  ipcMain.handle("test-itch-io", async () => {
    return await actions.testItchIo();
  });
}

import { app, shell, BrowserWindow, ipcMain, dialog } from "electron";
import { dirname, join, resolve, sep } from "path";
import { electronApp, optimizer, is } from "@electron-toolkit/utils";
import icon from "../../resources/icon.png?asset";
import { getOnItchIo, getOnKenneyNl, searchOnItchIo, searchOnKenneyNl } from "./lib/search";
import * as fs from "fs";
import { settings } from "./lib/settings";
import { getAssetsManifest } from "./lib/assets-manifest";
import JSZip from "jszip";
import { Asset, AssetPreview, AssetSource } from "@shared/types";
import { fetchAllKenneyAssets } from "./lib/kenney-api";

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === "linux" ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: false
    }
  });

  mainWindow.on("ready-to-show", () => {
    mainWindow.show();
  });

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url);
    return { action: "deny" };
  });

  if (is.dev && process.env["ELECTRON_RENDERER_URL"]) {
    console.log("We're in dev babyyy");
    mainWindow.loadURL(process.env["ELECTRON_RENDERER_URL"]);
  } else {
    mainWindow.loadFile(join(__dirname, "../renderer/index.html"));
  }
}

app.whenReady().then(() => {
  electronApp.setAppUserModelId("com.electron");

  app.on("browser-window-created", (_, window) => {
    optimizer.watchWindowShortcuts(window);
  });

  ipcMain.on("ping", (event) => event.reply("pong"));
  ipcMain.handle(
    "search",
    async (_event, query: string, source: AssetSource = "kenney.nl"): Promise<AssetPreview[]> => {
      switch (source) {
        case "kenney.nl":
          if (!query)
            return await fetchAllKenneyAssets().then((e) =>
              e.map((e) => ({
                ...e,
                __score: 0,
                _asset_source: "kenney.nl",
                id: e.slug + "|kenney.nl"
              }))
            );
          return await searchOnKenneyNl(query);
        case "itch.io":
          if (!query) return [];
          return await searchOnItchIo(query);
        default:
          throw new Error("Unknown asset source");
      }
    }
  );

  ipcMain.handle("open-asset-folder", async (_event, assetId: string) => {
    const assetsManifest = getAssetsManifest();
    if (!assetsManifest) throw new Error("No assets manifest");

    const asset = assetsManifest.data.installedAssets.find((e) => e.cachedAsset.id === assetId);
    if (!asset) throw new Error("Asset not found");

    shell.openPath(asset.installPath);
  });

  ipcMain.handle("delete-asset", async (_event, assetId: string) => {
    const assetsManifest = getAssetsManifest();
    if (!assetsManifest) throw new Error("No assets manifest");

    const asset = assetsManifest.data.installedAssets.find((e) => e.cachedAsset.id === assetId);
    if (!asset) throw new Error("Asset not found");

    await fs.promises.unlink(asset.installPath);
    assetsManifest.data.installedAssets = assetsManifest.data.installedAssets.filter(
      (e) => e.cachedAsset.id !== assetId
    );
    assetsManifest.save();
  });

  ipcMain.handle("asset-detail", async (_event, source: string, slug: string) => {
    switch (source) {
      case "kenney.nl":
        return await getOnKenneyNl(slug);

      case "itch.io":
        return await getOnItchIo(slug);

      default:
        throw new Error("Unknown asset source");
    }
  });

  function getDownloadUrl(source: string, slug: string): Promise<string> {
    switch (source) {
      case "kenney.nl":
        return getOnKenneyNl(slug).then((e) => e.download_url);

      default:
        throw new Error("Unknown asset source");
    }
  }

  ipcMain.handle("asset-download", async (_event, asset: Asset | AssetPreview) => {
    const { _asset_source: source, slug } = asset;

    const assetsPath = settings.get("assetsPath");

    if (!assetsPath) {
      throw new Error("No assets path set");
    }

    const url = await getDownloadUrl(source, slug);
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to download asset: ${response.status} ${response.statusText}`);
    }

    const buf = Buffer.from(await response.arrayBuffer());

    const filePath = join(assetsPath, `${slug}.zip`);
    const targetFolder = join(assetsPath, slug);

    await fs.promises.writeFile(filePath, buf);

    try {
      const zip = await new JSZip().loadAsync(buf);

      await fs.promises.mkdir(targetFolder, { recursive: true });

      const root = resolve(targetFolder);

      for (const [relativePath, zipEntry] of Object.entries(zip.files)) {
        const targetPath = resolve(targetFolder, relativePath);

        if (targetPath !== root && !targetPath.startsWith(root + sep)) {
          throw new Error(`Unsafe zip path: ${relativePath}`);
        }

        if (zipEntry.dir) {
          await fs.promises.mkdir(targetPath, { recursive: true });
          continue;
        }

        await fs.promises.mkdir(dirname(targetPath), { recursive: true });

        await new Promise<void>((resolve, reject) => {
          const output = fs.createWriteStream(targetPath);

          output.on("finish", resolve);
          output.on("error", reject);

          zipEntry.nodeStream().on("error", reject).pipe(output);
        });
      }

      const manifest = getAssetsManifest();

      if (!manifest) {
        throw new Error("No assets manifest");
      }

      const fullAsset = await (async () => {
        switch (source) {
          case "kenney.nl":
            return await getOnKenneyNl(slug);
          case "itch.io":
            throw new Error("Unknown asset source");

          default:
            throw new Error("Unknown asset source");
        }
      })();

      manifest.data.installedAssets.push({
        cachedAsset: fullAsset,
        installDate: new Date().toISOString(),
        installPath: targetFolder
      });
      manifest.save();
    } finally {
      await fs.promises.unlink(filePath).catch(() => {});
    }
  });

  ipcMain.handle("get-installed-assets-ids", async () => {
    const manifest = getAssetsManifest();
    if (!manifest) return [];

    return manifest.data.installedAssets.map((e) => e.cachedAsset.id);
  });

  ipcMain.handle("settings-read", async () => {
    return settings.get();
  });

  ipcMain.handle("assetsmanifest-read", async () => {
    return getAssetsManifest()?.data;
  });

  ipcMain.handle("change-assets-path", async () => {
    const res = await dialog.showOpenDialog({
      buttonLabel: "Select",
      properties: ["openDirectory"]
    });
    settings.set("assetsPath", res.filePaths[0]!);
    const manifest = getAssetsManifest();
    if (manifest) manifest.save();
  });

  createWindow();

  app.on("activate", function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

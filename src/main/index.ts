import { app, shell, BrowserWindow, ipcMain, dialog } from "electron";
import { dirname, join, resolve, sep } from "path";
import { electronApp, optimizer, is } from "@electron-toolkit/utils";
import icon from "../../resources/icon.png?asset";
import * as fs from "fs";
import { settings } from "./lib/settings";
import { getAssetsManifest } from "./lib/assets-manifest";
import JSZip from "jszip";
import { AssetPreview, AssetSource, parseId } from "@shared/types";
import { createExtractorFromFile } from "node-unrar-js";
import { extname } from "node:path";
import { getAsset, search } from "./lib/search";

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
    async (_event, query: string, source: AssetSource): Promise<AssetPreview[]> => {
      return await search(query, source);
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

  ipcMain.handle("asset-detail", async (_event, id: string) => {
    return await getAsset(id);
  });

  function guessFilename(
    url: string,
    assetName: string,
    assetId: string,
    headers: Headers
  ): string {
    const { source } = parseId(assetId);

    const hasExtension = (filename: string): boolean => {
      return extname(filename) !== "";
    };

    const getFilenameFromContentDisposition = (): string | null => {
      const disposition = headers.get("content-disposition");
      if (!disposition) return null;

      const match = disposition.match(/filename\*?=(?:UTF-8'')?["']?([^"';]+)["']?/i);

      if (!match) return null;

      try {
        return decodeURIComponent(match[1]);
      } catch {
        return match[1];
      }
    };

    const getFilenameFromUrl = (): string | null => {
      try {
        const pathname = new URL(url).pathname;
        const filename = decodeURIComponent(pathname.split("/").pop() ?? "");
        return filename || null;
      } catch {
        return null;
      }
    };

    switch (source) {
      case "kenney.nl": {
        const filename = getFilenameFromUrl();

        if (filename) return filename;

        throw new Error("Could not determine Kenney asset filename");
      }

      case "itch.io": {
        const contentDispositionFilename = getFilenameFromContentDisposition();

        if (contentDispositionFilename && hasExtension(contentDispositionFilename)) {
          return contentDispositionFilename;
        }

        if (assetName && hasExtension(assetName)) {
          return assetName;
        }

        const urlFilename = getFilenameFromUrl();

        if (urlFilename && hasExtension(urlFilename)) {
          return urlFilename;
        }

        throw new Error("Could not determine Itch.io asset filename");
      }

      default:
        throw new Error(`Unknown asset source: ${source}`);
    }
  }

  ipcMain.handle(
    "download-file",
    async (_event, url: string, assetName: string, assetId: string) => {
      const { slug } = parseId(assetId);

      const assetsPath = settings.get("assetsPath");

      if (!assetsPath) {
        throw new Error("No assets path set");
      }

      const response = await fetch(url);
      const filename = guessFilename(url, assetName, assetId, response.headers);

      if (!response.ok) {
        throw new Error(`Failed to download asset: ${response.status} ${response.statusText}`);
      }

      const buf = Buffer.from(await response.arrayBuffer());

      const targetFolder = join(assetsPath, slug);
      await fs.promises.mkdir(targetFolder, { recursive: true });
      const filePath = join(targetFolder, filename);

      await fs.promises.writeFile(filePath, buf);

      if (filename.endsWith(".zip")) {
        try {
          const zip = await new JSZip().loadAsync(buf);

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

          const fullAsset = await getAsset(assetId);

          manifest.add({
            cachedAsset: fullAsset,
            installDate: new Date().toISOString(),
            installPath: targetFolder
          });
        } finally {
          await fs.promises.unlink(filePath).catch(() => {});
        }
      } else if (filename.endsWith(".rar")) {
        try {
          const root = resolve(targetFolder);

          const extractor = await createExtractorFromFile({
            filepath: filePath,
            targetPath: targetFolder,
            filenameTransform: (relativePath) => {
              const targetPath = resolve(targetFolder, relativePath);

              if (targetPath !== root && !targetPath.startsWith(root + sep)) {
                throw new Error(`Unsafe rar path: ${relativePath}`);
              }

              return relativePath;
            }
          });

          // Force the archive to actually be processed.
          // node-unrar-js uses lazy iterators.
          const files = extractor.extract();
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          for (const _file of files.files) {
            // Iterating is enough to perform extraction.
          }
        } finally {
          await fs.promises.unlink(filePath).catch(() => {});
        }
      }

      const manifest = getAssetsManifest();

      if (!manifest) {
        throw new Error("No assets manifest");
      }

      const fullAsset = await getAsset(assetId);

      manifest.add({
        cachedAsset: fullAsset,
        installDate: new Date().toISOString(),
        installPath: targetFolder
      });
    }
  );

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

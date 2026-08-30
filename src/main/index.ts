import { app, shell, BrowserWindow, ipcMain, dialog } from "electron";
import { join } from "path";
import { electronApp, optimizer, is } from "@electron-toolkit/utils";
import icon from "../../resources/icon.png?asset";
import { getOnKenneyNl, searchOnKenneyNl } from "./lib/search";
import * as fs from "fs";
import { settings } from "./lib/settings";
import { getAssetsManifest } from "./lib/assets-manifest";

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
  ipcMain.handle("search", async (_event, query: string) => {
    const results = await searchOnKenneyNl(query);
    return results;
  });

  ipcMain.handle("asset-detail", async (_event, source: string, slug: string) => {
    switch (source) {
      case "kenney.nl":
        return await getOnKenneyNl(slug);

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

  ipcMain.handle("asset-download", async (_event, source: string, slug: string) => {
    if (!settings.get("assetsPath")) throw new Error("No assets path set");
    const url = await getDownloadUrl(source, slug);
    const buf = await fetch(url)
      .then((e) => e.arrayBuffer())
      .then(Buffer.from);
    const filePath = join(settings.get("assetsPath"), `${slug}.zip`);
    fs.writeFileSync(filePath, buf);
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

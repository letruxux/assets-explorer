import { AssetsManifestType } from "@shared/types";
import fs from "fs";
import { join } from "path";
import { settings } from "./settings";
import { ipcMain } from "electron";

class AssetsManifestFile {
  public data: AssetsManifestType;

  constructor(public path: string) {
    if (!path.replaceAll("\\", "/").endsWith(".assets.json"))
      throw new Error("Invalid assets manifest file");
    this.data = this.load();
  }

  private load(): AssetsManifestType {
    const exists = fs.existsSync(this.path);
    if (!exists) return { installedAssets: [] };
    return JSON.parse(fs.readFileSync(this.path, "utf8")) as AssetsManifestType;
  }

  public save(): void {
    setTimeout(() => {
      ipcMain.emit("installed-assets-updated");
    }, 100);
    fs.writeFileSync(this.path, JSON.stringify(this.data, null, 2));
  }
}

let assetsManifestFile: AssetsManifestFile | null = null;

export function getAssetsManifest(): AssetsManifestFile | null {
  if (!assetsManifestFile) {
    try {
      assetsManifestFile = new AssetsManifestFile(join(settings.get("assetsPath"), ".assets.json"));
    } catch (err) {
      console.error(err);
      return null;
    }

    return assetsManifestFile;
  }
  return assetsManifestFile;
}

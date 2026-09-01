import { Asset, AssetsManifestType, InstalledFile } from "@shared/types";
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
    if (!exists) return { cachedAssets: [], installedFiles: [] };
    return JSON.parse(fs.readFileSync(this.path, "utf8")) as AssetsManifestType;
  }

  public save(): void {
    setTimeout(() => {
      ipcMain.emit("installed-assets-updated");
    }, 100);
    fs.writeFileSync(this.path, JSON.stringify(this.data, null, 2));
  }

  public removeInstalledFile(file: InstalledFile): void {
    this.data.installedFiles = this.data.installedFiles.filter((e) => !Object.equals(e, file));
    this.save();
  }

  public getInstalledFile(file: InstalledFile): InstalledFile | undefined {
    return this.data.installedFiles.find((e) => Object.equals(e, file));
  }

  public add(asset: Asset, file: Asset["files"][number], installPath: string): void {
    const alreadyCachedAsset = this.data.cachedAssets.find((e) => e.id === asset.id);
    if (alreadyCachedAsset) {
      this.data.cachedAssets = [...this.data.cachedAssets.filter((e) => e.id !== asset.id), asset];
    } else {
      this.data.cachedAssets.push(asset);
    }

    if (this.data.installedFiles.find((e) => Object.equals(e.file, file))) {
      throw new Error("Asset already installed");
    }

    this.data.installedFiles.push({
      assetId: asset.id,
      file,
      installDate: new Date().toISOString(),
      installPath
    });
    this.save();
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

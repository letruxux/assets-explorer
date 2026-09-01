import { shell } from "electron";
import { getAssetsManifest } from "../lib/modules/assets-manifest";
import { InstalledFile } from "@shared/types";

export default function openFileFolder(file: InstalledFile): void {
  const assetsManifest = getAssetsManifest();
  if (!assetsManifest) throw new Error("No assets manifest");

  if (!assetsManifest.getInstalledFile(file)) throw new Error("Asset not found");

  shell.openPath(file.installPath);
}

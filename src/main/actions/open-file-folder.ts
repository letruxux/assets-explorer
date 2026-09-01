import { shell } from "electron";
import { getAssetsManifest } from "../lib/modules/assets-manifest";
import { AssetsManifestType } from "@shared/types";

export default function openFileFolder(file: AssetsManifestType["installedFiles"][number]): void {
  const assetsManifest = getAssetsManifest();
  if (!assetsManifest) throw new Error("No assets manifest");

  if (!assetsManifest.getInstalledFile(file)) throw new Error("Asset not found");

  shell.openPath(file.installPath);
}

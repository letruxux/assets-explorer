import { getAssetsManifest } from "../lib/modules/assets-manifest";
import { existsSync } from "fs";
import { InstalledFile } from "@shared/types";

export default async function checkForDeletedFiles(): Promise<{
  found: number;
  deletedFiles: InstalledFile[];
}> {
  const assetsManifest = getAssetsManifest();
  if (!assetsManifest) throw new Error("No assets manifest");

  const installedFiles = assetsManifest.data.installedFiles;
  const deleted: InstalledFile[] = [];

  for (const file of installedFiles) {
    const path = file.installPath;
    if (!path) continue;
    const exists = existsSync(path);
    if (!exists) deleted.push(file);
  }

  return { found: deleted.length, deletedFiles: deleted };
}

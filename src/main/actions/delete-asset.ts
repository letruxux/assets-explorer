import { InstalledFile } from "@shared/types";
import { getAssetsManifest } from "../lib/modules/assets-manifest";
import * as fs from "fs";

export default async function deleteAsset(file: InstalledFile): Promise<void> {
  const assetsManifest = getAssetsManifest();
  if (!assetsManifest) throw new Error("No assets manifest");

  const foundFile = assetsManifest.getInstalledFile(file);
  if (!foundFile) throw new Error("File not found");

  await fs.promises.rm(foundFile.installPath, { recursive: true });
  assetsManifest.removeInstalledFile(foundFile);
}

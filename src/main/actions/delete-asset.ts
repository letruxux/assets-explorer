import { getAssetsManifest } from "../lib/modules/assets-manifest";
import * as fs from "fs";

export default async function deleteAsset(assetId: string): Promise<void> {
  const assetsManifest = getAssetsManifest();
  if (!assetsManifest) throw new Error("No assets manifest");

  const asset = assetsManifest.data.installedAssets.find((e) => e.cachedAsset.id === assetId);
  if (!asset) throw new Error("Asset not found");

  await fs.promises.rm(asset.installPath, { recursive: true });
  assetsManifest.data.installedAssets = assetsManifest.data.installedAssets.filter(
    (e) => e.cachedAsset.id !== assetId
  );
  assetsManifest.save();
}

import { getAssetsManifest } from "../lib/assets-manifest";
import * as fs from "fs";

export default async function deleteAsset(assetId: string): Promise<void> {
  const assetsManifest = getAssetsManifest();
  if (!assetsManifest) throw new Error("No assets manifest");

  const asset = assetsManifest.data.installedAssets.find((e) => e.cachedAsset.id === assetId);
  if (!asset) throw new Error("Asset not found");

  await fs.promises.unlink(asset.installPath);
  assetsManifest.data.installedAssets = assetsManifest.data.installedAssets.filter(
    (e) => e.cachedAsset.id !== assetId
  );
  assetsManifest.save();
}

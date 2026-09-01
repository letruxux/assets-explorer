import { shell } from "electron";
import { getAssetsManifest } from "../lib/modules/assets-manifest";

export default function openAssetFolder(assetId: string): void {
  const assetsManifest = getAssetsManifest();
  if (!assetsManifest) throw new Error("No assets manifest");

  const asset = assetsManifest.data.installedAssets.find((e) => e.cachedAsset.id === assetId);
  if (!asset) throw new Error("Asset not found");

  shell.openPath(asset.installPath);
}

import { getAssetsManifest } from "../lib/modules/assets-manifest";

export default function getInstalledAssetsIds(): string[] {
  const manifest = getAssetsManifest();
  if (!manifest) return [];

  return manifest.data.installedAssets.map((e) => e.cachedAsset.id);
}

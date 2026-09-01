import { AssetsManifestType } from "@shared/types";
import { getAssetsManifest } from "../lib/modules/assets-manifest";

export default function getInstalledFiles(): AssetsManifestType["installedFiles"] {
  const manifest = getAssetsManifest();
  if (!manifest) return [];

  return manifest.data.installedFiles;
}

import { getAssetsManifest } from "@main/lib/modules/assets-manifest";
import { InstalledFile } from "@shared/types";

export default async function deleteStaleDbEntries(files: InstalledFile[]): Promise<number> {
  const manifest = getAssetsManifest();
  if (!manifest) throw new Error("No assets manifest");

  let count = 0;

  for (const file of files) {
    try {
      count++;
      manifest.removeInstalledFile(file);
    } catch (err) {
      console.error(err);
    }
  }

  return count;
}

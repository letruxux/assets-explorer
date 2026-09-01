import { getAssetsManifest } from "@modules/assets-manifest";
import { Asset, parseId } from "@shared/types";
import JSZip from "jszip";
import { createExtractorFromFile } from "node-unrar-js";
import { join, sep, dirname, resolve } from "path";
import { settings } from "@lib/modules/settings";
import { guessAssetFilename } from "@lib/utils";
import * as fs from "fs";

export default async function downloadFile(
  asset: Asset,
  file: Asset["files"][number]
): Promise<void> {
  const { slug } = parseId(asset.id);
  const { direct_url: url, name: assetName } = file;

  const assetsPath = settings.get("assetsPath");

  if (!assetsPath) {
    throw new Error("No assets path set");
  }

  const response = await fetch(url);
  const filename = guessAssetFilename(url, assetName, asset.id, response.headers);

  if (!response.ok) {
    throw new Error(`Failed to download asset: ${response.status} ${response.statusText}`);
  }

  const buf = Buffer.from(await response.arrayBuffer());

  const targetFolder = join(assetsPath, slug);
  await fs.promises.mkdir(targetFolder, { recursive: true });
  const filePath = join(targetFolder, filename);

  await fs.promises.writeFile(filePath, buf);

  if (filename.endsWith(".zip")) {
    try {
      const zip = await new JSZip().loadAsync(buf);

      const root = resolve(targetFolder);

      for (const [relativePath, zipEntry] of Object.entries(zip.files)) {
        const targetPath = resolve(targetFolder, relativePath);

        if (targetPath !== root && !targetPath.startsWith(root + sep)) {
          throw new Error(`Unsafe zip path: ${relativePath}`);
        }

        if (zipEntry.dir) {
          await fs.promises.mkdir(targetPath, { recursive: true });
          continue;
        }

        await fs.promises.mkdir(dirname(targetPath), { recursive: true });

        await new Promise<void>((resolve, reject) => {
          const output = fs.createWriteStream(targetPath);

          output.on("finish", resolve);
          output.on("error", reject);

          zipEntry.nodeStream().on("error", reject).pipe(output);
        });
      }
    } finally {
      await fs.promises.unlink(filePath).catch(() => {});
    }
  } else if (filename.endsWith(".rar")) {
    try {
      const root = resolve(targetFolder);

      const extractor = await createExtractorFromFile({
        filepath: filePath,
        targetPath: targetFolder,
        filenameTransform: (relativePath) => {
          const targetPath = resolve(targetFolder, relativePath);

          if (targetPath !== root && !targetPath.startsWith(root + sep)) {
            throw new Error(`Unsafe rar path: ${relativePath}`);
          }

          return relativePath;
        }
      });

      // Force the archive to actually be processed.
      // node-unrar-js uses lazy iterators.
      const files = extractor.extract();
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      for (const _file of files.files) {
        // Iterating is enough to perform extraction.
      }
    } finally {
      await fs.promises.unlink(filePath).catch(() => {});
    }
  }

  const manifest = getAssetsManifest();

  if (!manifest) {
    throw new Error("No assets manifest");
  }

  manifest.add(asset, file, targetFolder);
}

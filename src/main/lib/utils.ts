import { parseId } from "@shared/types";
import { writeFile } from "fs/promises";
import { tmpdir } from "os";
import { extname, join } from "path";

export function formatBytes(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB", "TB", "PB", "EB", "ZB", "YB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
}

export function makeMs({
  days,
  hours,
  minutes,
  seconds
}: {
  days?: number;
  hours?: number;
  minutes?: number;
  seconds?: number;
}): number {
  return (
    (days ?? 0) * 1000 * 60 * 60 * 24 +
    (hours ?? 0) * 1000 * 60 * 60 +
    (minutes ?? 0) * 1000 * 60 +
    (seconds ?? 0) * 1000
  );
}

export const USER_AGENT =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36";

export function guessAssetFilename(
  url: string,
  assetName: string,
  assetId: string,
  headers: Headers
): string {
  const { source } = parseId(assetId);

  const hasExtension = (filename: string): boolean => {
    return extname(filename) !== "";
  };

  const getFilenameFromContentDisposition = (): string | null => {
    const disposition = headers.get("content-disposition");
    if (!disposition) return null;

    const match = disposition.match(/filename\*?=(?:UTF-8'')?["']?([^"';]+)["']?/i);

    if (!match) return null;

    try {
      return decodeURIComponent(match[1]);
    } catch {
      return match[1];
    }
  };

  const getFilenameFromUrl = (): string | null => {
    try {
      const pathname = new URL(url).pathname;
      const filename = decodeURIComponent(pathname.split("/").pop() ?? "");
      return filename || null;
    } catch {
      return null;
    }
  };

  switch (source) {
    case "kenney.nl": {
      const filename = getFilenameFromUrl();

      if (filename) return filename;

      throw new Error("Could not determine Kenney asset filename");
    }

    default:
    case "itch.io": {
      const contentDispositionFilename = getFilenameFromContentDisposition();

      if (contentDispositionFilename && hasExtension(contentDispositionFilename)) {
        return contentDispositionFilename;
      }

      if (assetName && hasExtension(assetName)) {
        return assetName;
      }

      const urlFilename = getFilenameFromUrl();

      if (urlFilename && hasExtension(urlFilename)) {
        return urlFilename;
      }

      throw new Error("Could not determine Itch.io asset filename");
    }
  }
}

export async function buildResponseNotOkError(r: Response): Promise<Error> {
  const text = await r.text();
  const randomlyGeneratedFilename = `${Math.floor(Math.random() * 1000_000_000_000)}.html`;
  const path = join(tmpdir(), randomlyGeneratedFilename);

  await writeFile(path, text);

  return new Error(
    `
Request failed ${r.status}
  URL: ${r.url}
  Status: ${r.statusText}
  Text: ${path}
`.trim()
  );
}

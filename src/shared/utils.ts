import { Asset, AssetPreview } from "./types";

export function deepEquals(a: unknown, b: unknown): boolean {
  if (a === b) return true;

  if (typeof a !== "object" || a === null || typeof b !== "object" || b === null) {
    return false;
  }

  if (Array.isArray(a) !== Array.isArray(b)) return false;

  const keysA = Object.keys(a);
  const keysB = Object.keys(b);

  if (keysA.length !== keysB.length) return false;

  for (const key of keysA) {
    if (!Object.prototype.hasOwnProperty.call(b, key)) return false;
    if (!deepEquals((a as Record<string, unknown>)[key], (b as Record<string, unknown>)[key])) {
      return false;
    }
  }

  return true;
}

export function assetToAssetPreview(asset: Asset): AssetPreview {
  return {
    _asset_source: asset._asset_source,
    author: asset.author,
    id: asset.id,
    images: asset.images,
    page_url: asset.page_url,
    tags: asset.metadata.tags ?? [],
    title: asset.title
  } satisfies AssetPreview;
}

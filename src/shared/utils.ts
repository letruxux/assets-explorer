import { Asset, AssetPreview } from "./types";

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

import { AssetPreview, Asset, parseId } from "@shared/types";
import { BaseWebsite, WebsiteCallConfig } from "./base";
import { TTLCache } from "@isaacs/ttlcache";
import { formatBytes, makeMs } from "@lib/utils";
import * as sketchfabApi from "@lib/websites-raw-api/sketchfab-api";

const ONE_DAY = makeMs({ days: 1 });

class SketchfabWebsite extends BaseWebsite {
  assetCache = new TTLCache<string, Asset>({ max: 50, ttl: ONE_DAY });
  searchCache = new TTLCache<string, AssetPreview[]>({
    max: 50,
    ttl: ONE_DAY
  });

  private _normalizeAsset(asset: sketchfabApi.SketchfabAsset): Asset {
    return {
      _asset_source: asset._asset_source,
      author: asset.user!.username!,
      createdAt: asset.createdAt!,
      changelog: [],
      id: asset.id,
      images: (asset.thumbnails?.images ?? []).map((e) => e.url!) ?? [],
      files: Object.entries(asset.downloads).map(([format, e]) => ({
        name: `${format.toUpperCase()} format`,
        direct_url: e.url,
        date: asset.updatedAt,
        download_count: asset.downloadCount,
        file_size: e.size ? formatBytes(e.size) : undefined
      })),
      metadata: {
        tags: asset.tags?.map((e) => e.name) ?? [],
        categories: asset.categories?.map((e) => e.name!) ?? []
      },
      page_url: asset.viewerUrl!,
      title: asset.name!,
      updatedAt: asset.updatedAt!
    } satisfies Asset;
  }

  private _normalizeAssetPreview(asset: sketchfabApi.SketchfabAssetPreview): AssetPreview {
    return {
      _asset_source: "sketchfab",
      id: asset.id,
      images: (asset.thumbnails?.images ?? []).map((e) => e.url!) ?? [],
      page_url: asset.viewerUrl!,
      tags: (asset.tags ?? []).map((e) => e.name),
      title: asset.name!,
      author: asset.user?.username
    } satisfies AssetPreview;
  }

  async search(
    query: string,
    { avoidCache = false }: WebsiteCallConfig = {}
  ): Promise<AssetPreview[]> {
    if (avoidCache)
      return await sketchfabApi.search(query).then((e) => e.map(this._normalizeAssetPreview));

    if (this.searchCache.has(query)) return this.searchCache.get(query)!;
    const results = await sketchfabApi
      .search(query)
      .then((e) => e.map(this._normalizeAssetPreview));
    this.searchCache.set(query, results);
    return results;
  }

  async fetchAsset(id: string, { avoidCache = false }: WebsiteCallConfig = {}): Promise<Asset> {
    const uid = parseId(id).assetId;
    if (!uid) throw new Error("Invalid asset id");

    if (avoidCache) return await sketchfabApi.fetchAsset(uid).then(this._normalizeAsset);

    if (this.assetCache.has(uid)) return this.assetCache.get(uid)!;
    const asset = await sketchfabApi.fetchAsset(uid).then(this._normalizeAsset);
    this.assetCache.set(uid, asset);
    return asset;
  }
}

export const sketchfabWebsite = new SketchfabWebsite();

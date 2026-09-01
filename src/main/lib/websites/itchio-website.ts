import { AssetPreview, Asset, parseId } from "@shared/types";
import { BaseWebsite } from "./base-website";
import { TTLCache } from "@isaacs/ttlcache";
import { makeMs } from "@lib/utils";
import * as itchIoApi from "@lib/websites-raw-api/itch-io-api";

const ONE_DAY = makeMs({ days: 1 });

class ItchIoWebsite extends BaseWebsite {
  itchIoAssetCache = new TTLCache<string, Asset>({ max: 50, ttl: ONE_DAY });
  itchIoSearchCache = new TTLCache<string, AssetPreview[]>({
    max: 50,
    ttl: ONE_DAY
  });

  private _normalizeAsset(asset: itchIoApi.ItchIoAsset): Asset {
    return {
      _asset_source: asset._asset_source,
      author: asset.author,
      createdAt: asset._extracted.createdAt,
      id: asset.id,
      images: asset.images,
      metadata: asset.meta,
      page_url: asset.url,
      title: asset.title,
      updatedAt: asset._extracted.updatedAt,
      changelog: asset.updates,
      files: asset.downloads.map((e) => ({
        name: e.name,
        direct_url: e.url,
        date: e.date
      }))
    } satisfies Asset;
  }

  private _normalizeAssetPreview(asset: itchIoApi.ItchIoAssetPreview): AssetPreview {
    return {
      _asset_source: asset._asset_source,
      author: asset.author,
      id: asset.id,
      images: asset.images,
      page_url: asset.url,

      tags: [],
      title: asset.title,
      price: asset.price ?? undefined
    } satisfies AssetPreview;
  }

  async search(
    query: string,
    { avoidCache = false }: { avoidCache: boolean }
  ): Promise<AssetPreview[]> {
    if (avoidCache)
      return await itchIoApi.searchOnItchIo(query).then((e) => e.map(this._normalizeAssetPreview));

    if (this.itchIoSearchCache.has(query)) return this.itchIoSearchCache.get(query)!;
    const results = await itchIoApi
      .searchOnItchIo(query)
      .then((e) => e.map(this._normalizeAssetPreview));
    this.itchIoSearchCache.set(query, results);
    return results;
  }

  async fetchAsset(id: string, { avoidCache = false }: { avoidCache: boolean }): Promise<Asset> {
    const url = parseId(id).pageUrl;
    if (avoidCache) return await itchIoApi.fetchItchIoAsset(url).then(this._normalizeAsset);

    if (this.itchIoAssetCache.has(url)) return this.itchIoAssetCache.get(url)!;
    const asset = await itchIoApi.fetchItchIoAsset(url).then(this._normalizeAsset);
    this.itchIoAssetCache.set(url, asset);
    return asset;
  }
}

export const itchIoWebsite = new ItchIoWebsite();

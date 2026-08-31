import { AssetPreview, Asset, ItchIoAsset, ItchIoAssetPreview, parseId } from "@shared/types";
import { BaseWebsite } from "./base-website";
import { TTLCache } from "@isaacs/ttlcache";
import { makeMs } from "../utils";
import * as itchIoApi from "../itch-io-api";

const ONE_DAY = makeMs({ days: 1 });

class ItchIoWebsite extends BaseWebsite {
  itchIoAssetCache = new TTLCache<string, ItchIoAsset>({ max: 50, ttl: ONE_DAY });
  itchIoSearchCache = new TTLCache<string, ItchIoAssetPreview[]>({
    max: 50,
    ttl: ONE_DAY
  });

  async search(query: string): Promise<AssetPreview[]> {
    if (this.itchIoSearchCache.has(query)) return this.itchIoSearchCache.get(query)!;
    const results = await itchIoApi.searchOnItchIo(query);
    this.itchIoSearchCache.set(query, results);
    return results;
  }

  async fetchAsset(id: string): Promise<Asset> {
    const url = parseId(id).pageUrl;
    if (this.itchIoAssetCache.has(url)) return this.itchIoAssetCache.get(url)!;
    const asset = await itchIoApi.fetchItchIoAsset(url);
    this.itchIoAssetCache.set(url, asset);
    return asset;
  }
}

export const itchIoWebsite = new ItchIoWebsite();

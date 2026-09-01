import { AssetPreview, Asset, parseId } from "@shared/types";
import { BaseWebsite } from "./base-website";
import { TTLCache } from "@isaacs/ttlcache";
import { makeMs } from "@lib/utils";
import * as kenneyApi from "@lib/websites-raw-api/kenney-api";
import Fuse from "fuse.js";

const ONE_DAY = makeMs({ days: 1 });

class ItchIoWebsite extends BaseWebsite {
  kenneyAllAssetsCache = new TTLCache<"all", Asset[]>({
    max: 1,
    ttl: ONE_DAY
  });
  kenneyAssetsCache = new TTLCache<string, Asset>({ max: 50, ttl: ONE_DAY });

  private _normalizeAsset(asset: kenneyApi.KenneyAsset): Asset {
    return {
      _asset_source: asset._asset_source,
      author: "Kenney",
      createdAt: asset._extracted.createdAt,
      id: asset.id,
      images: asset.images,
      metadata: {
        tags: asset.meta.Tags,
        category: asset.meta.Category,
        series: asset.meta.Series,
        tile_size: asset.meta["Tile size"],
        files: asset.meta.Files,
        license: asset.meta.License,
        features: asset.meta.Features
      },
      page_url: parseId(asset.id).pageUrl,
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

  private _normalizeAssetPreview(asset: Asset): AssetPreview {
    return {
      _asset_source: asset._asset_source,
      author: "Kenney",
      id: asset.id,
      images: asset.images,
      page_url: parseId(asset.id).pageUrl,
      tags: asset.metadata.tags ?? [],
      title: asset.title
    } satisfies AssetPreview;
  }

  async search(query: string): Promise<AssetPreview[]> {
    let all: Asset[];
    if (this.kenneyAllAssetsCache.has("all")) {
      all = this.kenneyAllAssetsCache.get("all")!;
    } else {
      all = (await kenneyApi.fetchAllKenneyAssets()).map(this._normalizeAsset);
      this.kenneyAllAssetsCache.set("all", all);
    }

    const fuse = new Fuse(all, {
      keys: [
        { name: "title", weight: 2.0 },
        { name: "meta.tags", weight: 1 },
        { name: "meta.category", weight: 0.5 },
        { name: "meta.series", weight: 0.5 }
      ],
      includeScore: true
    });
    const result = fuse.search(query);
    return result
      .map((i) => ({
        ...i.item,
        __score: i.score ? 1 - i.score : 0
      }))
      .filter((i) => i.__score > 0.2)
      .map((asset) => {
        return this._normalizeAssetPreview(asset);
      });
  }

  async fetchAsset(id: string): Promise<Asset> {
    const url = parseId(id).slug;
    if (this.kenneyAssetsCache.has(url)) return this.kenneyAssetsCache.get(url)!;
    const asset = await kenneyApi.fetchKenneyAsset(url).then(this._normalizeAsset);
    this.kenneyAssetsCache.set(url, asset);
    return asset;
  }
}

export const kenneyWebsite = new ItchIoWebsite();

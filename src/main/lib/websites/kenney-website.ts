import { AssetPreview, Asset, parseId } from "@shared/types";
import { BaseWebsite, WebsiteCallConfig } from "./base-website";
import { TTLCache } from "@isaacs/ttlcache";
import { makeMs } from "@lib/utils";
import * as kenneyApi from "@lib/websites-raw-api/kenney-api";
import Fuse from "fuse.js";

const ONE_DAY = makeMs({ days: 1 });

class KenneyWebsite extends BaseWebsite {
  kenneyAllAssetsCache = new TTLCache<"all", Asset[]>({
    max: 1,
    ttl: ONE_DAY
  });

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
      tags: [
        ...(asset.metadata.tags ?? []),
        ...(asset.metadata.category ? [asset.metadata.category] : []),
        ...(asset.metadata.series ? [asset.metadata.series] : [])
      ],
      title: asset.title
    } satisfies AssetPreview;
  }

  private async getAllKenneyAssets({ avoidCache = false }: WebsiteCallConfig = {}): Promise<
    Asset[]
  > {
    if (!avoidCache && this.kenneyAllAssetsCache.has("all")) {
      return this.kenneyAllAssetsCache.get("all")!;
    }
    const assets = await kenneyApi
      .fetchAllKenneyAssets()
      .then((assets) => assets.map(this._normalizeAsset));
    this.kenneyAllAssetsCache.set("all", assets);
    return assets;
  }

  async search(
    query: string,
    { avoidCache = false }: WebsiteCallConfig = {}
  ): Promise<AssetPreview[]> {
    const all = await this.getAllKenneyAssets({ avoidCache });

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

  async fetchAsset(id: string, { avoidCache = false }: WebsiteCallConfig = {}): Promise<Asset> {
    const slug = parseId(id).slug;

    if (avoidCache) return await kenneyApi.fetchKenneyAsset(slug).then(this._normalizeAsset);

    const assets = await this.getAllKenneyAssets();
    return assets.find((asset) => parseId(asset.id).slug === slug)!;
  }
}

export const kenneyWebsite = new KenneyWebsite();

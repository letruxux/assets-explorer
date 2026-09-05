import { Asset, AssetFile, AssetPreview, buildId, parseId } from "@shared/types";
import { BaseWebsite, WebsiteCallConfig } from "./base";
import { TTLCache } from "@isaacs/ttlcache";
import { makeFilenameSafe, makeMs } from "@lib/utils";
import * as polypizzaApi from "@lib/websites-raw-api/poly-pizza-api";

const ONE_DAY = makeMs({ days: 1 });

class PolyPizzaWebsite extends BaseWebsite {
  assetCache = new TTLCache<string, Asset>({ max: 50, ttl: ONE_DAY });
  searchCache = new TTLCache<string, AssetPreview[]>({
    max: 50,
    ttl: ONE_DAY
  });

  private _normalizeAsset(asset: polypizzaApi.PolyPizzaAsset): Asset {
    const id = buildId("poly.pizza", asset.ID);
    const dlExtension = asset.Download.split(".").pop()!;
    return {
      _asset_source: "poly.pizza",
      author: asset.Creator.Username,
      createdAt: asset.Uploaded,
      changelog: [],
      id,
      images: [asset.Thumbnail],
      files: [
        {
          name: makeFilenameSafe(asset.Title) + "." + dlExtension,
          direct_url: asset.Download,
          date: asset.Uploaded
        }
      ],
      metadata: {
        TriCount: asset.TriCount,
        License: asset.Licence,
        Animated: asset.Animated,
        Category: asset.Category,
        Attribution: asset.Attribution,
        description: asset.Description
      },
      page_url: "https://poly.pizza/m/" + asset.ID,
      title: asset.Title,
      updatedAt: asset.Uploaded
    } satisfies Asset;
  }

  private _normalizeAssetPreview(asset: polypizzaApi.PolyPizzaAssetPreview): AssetPreview {
    const id = buildId("poly.pizza", asset.ID);
    return {
      _asset_source: "poly.pizza",
      id,
      images: [asset.Thumbnail],
      page_url: "https://poly.pizza/m/" + asset.ID,
      title: asset.Title,
      author: asset.Creator.Username,
      tags: asset.Tags
    } satisfies AssetPreview;
  }

  async search(
    query: string,
    { avoidCache = false }: WebsiteCallConfig = {}
  ): Promise<AssetPreview[]> {
    if (avoidCache)
      return await polypizzaApi
        .searchPolyPizza(query)
        .then((e) => e.map(this._normalizeAssetPreview));

    if (this.searchCache.has(query)) return this.searchCache.get(query)!;
    const results = await polypizzaApi
      .searchPolyPizza(query)
      .then((e) => e.map(this._normalizeAssetPreview));
    this.searchCache.set(query, results);
    return results;
  }

  async fetchAsset(id: string, { avoidCache = false }: WebsiteCallConfig = {}): Promise<Asset> {
    const uid = parseId(id).assetId;
    if (!uid) throw new Error("Invalid asset id");

    if (avoidCache) return await polypizzaApi.fetchPolyPizzaModel(uid).then(this._normalizeAsset);

    if (this.assetCache.has(uid)) return this.assetCache.get(uid)!;
    const asset = await polypizzaApi.fetchPolyPizzaModel(uid).then(this._normalizeAsset);
    this.assetCache.set(uid, asset);
    return asset;
  }

  async fetchFeatured(): Promise<AssetPreview[]> {
    const results = await polypizzaApi
      .getFeatured()
      .then((e) => e.map(this._normalizeAssetPreview))
      .then((e) => e.slice(0, 5));
    return results;
  }

  async fetchDownloads(id: string): Promise<AssetFile[]> {
    const asset = await this.fetchAsset(id);
    return asset.files;
  }
}

export const polyPizzaWebsite = new PolyPizzaWebsite();

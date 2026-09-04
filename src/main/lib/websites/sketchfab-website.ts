import { AssetPreview, Asset, parseId } from "@shared/types";
import { BaseWebsite, WebsiteCallConfig } from "./base";
import { TTLCache } from "@isaacs/ttlcache";
import { formatBytes, makeMs } from "@lib/utils";
import * as sketchfabApi from "@lib/websites-raw-api/sketchfab-api";
import { extname } from "path";

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
      files: Object.entries(asset.downloads).map(([format, e]) => {
        const filename = new URL(e.url).pathname.split("/").pop()!;
        const ext = extname(filename);
        const name = filename.slice(0, -ext.length);

        return {
          name: `${name}-${format}${ext}`,
          direct_url: e.url,
          date: asset.updatedAt,
          download_count: asset.downloadCount,
          file_size: e.size ? formatBytes(e.size) : undefined
        };
      }),
      metadata: {
        tags: asset.tags?.map((e) => e.name) ?? [],
        categories: asset.categories?.map((e) => e.name!) ?? [],
        animationCount: asset.animationCount,
        faceCount: asset.faceCount,
        vertexCount: asset.vertexCount,
        viewCount: asset.viewCount,
        description: asset.description ?? undefined,
        downloadCount: asset.downloadCount,
        price: asset.price ?? undefined,
        pbrType: asset.pbrType ?? undefined,
        textureCount: asset.textureCount,
        materialCount: asset.materialCount,
        attribution: `"${asset.name}" (${asset.shortUrl}) by ${asset.user!.username} is licensed under ${asset.license?.fullName} (${asset.license?.url}).`,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        license: (asset.license as any)?.fullName,
        likeCount: asset.likeCount,
        soundCount: asset.soundCount
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
      author: asset.user?.username,
      _lastUpdated: asset.publishedAt
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

  async fetchFeatured(): Promise<AssetPreview[]> {
    const results = await sketchfabApi
      .getFeatured()
      .then((e) => e.map(this._normalizeAssetPreview))
      .then((e) => e.slice(0, 5));
    return results;
  }
}

export const sketchfabWebsite = new SketchfabWebsite();

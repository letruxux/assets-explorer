import { AssetPreview, Asset, parseId, KenneyAsset } from "@shared/types";
import { BaseWebsite } from "./base-website";
import { TTLCache } from "@isaacs/ttlcache";
import { makeMs } from "../utils";
import * as kenneyApi from "../kenney-api";
import Fuse from "fuse.js";

const ONE_DAY = makeMs({ days: 1 });

class ItchIoWebsite extends BaseWebsite {
  kenneyAllAssetsCache = new TTLCache<"all", KenneyAsset[]>({
    max: 1,
    ttl: ONE_DAY
  });
  kenneyAssetsCache = new TTLCache<string, KenneyAsset>({ max: 50, ttl: ONE_DAY });

  async search(query: string): Promise<AssetPreview[]> {
    let all: KenneyAsset[];
    if (this.kenneyAllAssetsCache.has("all")) {
      all = this.kenneyAllAssetsCache.get("all")!;
    } else {
      all = await kenneyApi.fetchAllKenneyAssets();
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
      .filter((i) => i.__score > 0.2);
  }

  async fetchAsset(id: string): Promise<Asset> {
    const url = parseId(id).slug;
    if (this.kenneyAssetsCache.has(url)) return this.kenneyAssetsCache.get(url)!;
    const asset = await kenneyApi.fetchKenneyAsset(url);
    this.kenneyAssetsCache.set(url, asset);
    return asset;
  }
}

export const kenneyWebsite = new ItchIoWebsite();

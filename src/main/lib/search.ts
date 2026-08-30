import Fuse from "fuse.js";
import { TTLCache } from "@isaacs/ttlcache";
import * as kenneyApi from "./kenney-api";
import * as itchIoApi from "./itch-io-api";
import { ItchIoAsset, ItchIoAssetPreview, KenneyAsset, Scored } from "@shared/types";
import { makeMs } from "./utils";

const ONE_DAY = makeMs({ days: 1 });

const kenneyAllAssetsCache = new TTLCache<"all", KenneyAsset[]>({
  max: 1,
  ttl: ONE_DAY
});
const kenneyAssetsCache = new TTLCache<string, KenneyAsset>({ max: 50, ttl: ONE_DAY });
const itchIoAssetCache = new TTLCache<string, ItchIoAsset>({ max: 50, ttl: ONE_DAY });
const itchIoSearchCache = new TTLCache<string, ItchIoAssetPreview[]>({
  max: 50,
  ttl: ONE_DAY
});

export async function searchOnKenneyNl(query: string): Promise<Scored<KenneyAsset>[]> {
  let all: KenneyAsset[];
  if (kenneyAllAssetsCache.has("all")) {
    all = kenneyAllAssetsCache.get("all")!;
  } else {
    all = await kenneyApi.fetchAllKenneyAssets();
    kenneyAllAssetsCache.set("all", all);
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
    .filter((i) => i.__score > 0.2) as Scored<KenneyAsset>[];
}

export async function getOnKenneyNl(slug: string): Promise<KenneyAsset> {
  if (kenneyAssetsCache.has(slug)) return kenneyAssetsCache.get(slug)!;
  const asset = await kenneyApi.fetchKenneyAsset(slug);
  kenneyAssetsCache.set(slug, asset);
  return asset;
}

export async function getOnItchIo(url: string): Promise<ItchIoAsset> {
  if (itchIoAssetCache.has(url)) return itchIoAssetCache.get(url)!;
  const asset = await itchIoApi.fetchItchIoAsset(url);
  itchIoAssetCache.set(url, asset);
  return asset;
}

export async function searchOnItchIo(query: string): Promise<ItchIoAssetPreview[]> {
  if (itchIoSearchCache.has(query)) return itchIoSearchCache.get(query)!;
  const results = await itchIoApi.searchOnItchIo(query);
  itchIoSearchCache.set(query, results);
  return results;
}

import Fuse from "fuse.js";
import { fetchAllKenneyAssets, fetchKenneyAsset } from "./kenney-api";
import { fetchItchIoAsset, searchOnItchIo } from "./itch-io-api";
import { ItchIoAsset, KenneyAsset, Scored } from "@shared/types";

export async function searchOnKenneyNl(query: string): Promise<Scored<KenneyAsset>[]> {
  const all = await fetchAllKenneyAssets();
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
      __score: i.score ? 1 - i.score : 0,
      _asset_source: "kenney.nl",
      id: i.item.slug + "|kenney.nl"
    }))
    .filter((i) => i.__score > 0.2) as Scored<KenneyAsset>[];
}

export async function getOnKenneyNl(slug: string): Promise<KenneyAsset> {
  return {
    ...(await fetchKenneyAsset(slug)),
    _asset_source: "kenney.nl",
    id: slug + "|kenney.nl"
  };
}

export async function getOnItchIo(slug: string): Promise<ItchIoAsset> {
  return await fetchItchIoAsset(slug);
}

export { searchOnItchIo };

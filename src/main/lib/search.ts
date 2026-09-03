import { Asset, AssetPreview, AssetSource, parseId } from "@shared/types";
import { kenneyWebsite } from "./websites/kenney-website";
import { itchIoWebsite } from "./websites/itchio-website";
import { sketchfabWebsite } from "./websites/sketchfab-website";
import { polyPizzaWebsite } from "./websites/polypizza-website";

export async function search(query: string, source: AssetSource): Promise<AssetPreview[]> {
  switch (source) {
    case "kenney.nl":
      return await kenneyWebsite.search(query);
    case "itch.io":
      return await itchIoWebsite.search(query);
    case "sketchfab":
      return await sketchfabWebsite.search(query);
    case "poly.pizza":
      return await polyPizzaWebsite.search(query);
    default:
      throw new Error("Unknown asset source");
  }
}

export async function getAsset(id: string): Promise<Asset> {
  const { source } = parseId(id);
  switch (source) {
    case "kenney.nl":
      return await kenneyWebsite.fetchAsset(id);
    case "itch.io":
      return await itchIoWebsite.fetchAsset(id);
    case "sketchfab":
      return await sketchfabWebsite.fetchAsset(id);
    default:
      throw new Error("Unknown asset source");
  }
}

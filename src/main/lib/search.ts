import { Asset, AssetPreview, AssetSource, parseId } from "@shared/types";
import { kenneyWebsite } from "./websites/kenney-website";
import { itchIoWebsite } from "./websites/itchio-website";
import { sketchfabWebsite } from "./websites/sketchfab-website";
import { polyPizzaWebsite } from "./websites/polypizza-website";

const ALL_WEBSITES = {
  "itch.io": itchIoWebsite,
  "kenney.nl": kenneyWebsite,
  sketchfab: sketchfabWebsite,
  "poly.pizza": polyPizzaWebsite
} as const;

export async function search(query: string, source: AssetSource): Promise<AssetPreview[]> {
  const website = ALL_WEBSITES[source];
  if (!website) throw new Error("Unknown asset source: " + source);
  return website.search(query);
}

export async function getAsset(id: string): Promise<Asset> {
  const { source } = parseId(id);
  const website = ALL_WEBSITES[source];
  if (!website) throw new Error("Unknown asset source: " + source);
  return website.fetchAsset(id);
}

export async function getFeatured(): Promise<AssetPreview[]> {
  const websites = Object.values(ALL_WEBSITES);
  const results = await Promise.all(
    websites.filter((website) => website.fetchFeatured).map((website) => website.fetchFeatured())
  );
  return results.flat();
}

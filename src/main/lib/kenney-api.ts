import { buildId, KenneyAsset } from "@shared/types";

export async function fetchAllKenneyAssets(): Promise<KenneyAsset[]> {
  const url =
    "https://github.com/letruxux/kenney-assets-registry/raw/refs/heads/main/data/all.json";
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch assets");
  const base = (await response.json()) as unknown as KenneyAsset[];
  return base.map((e) => ({
    ...e,
    id: buildId("kenney.nl", e.slug),
    _asset_source: "kenney.nl" as const
  }));
}

export async function fetchKenneyAsset(slug: string): Promise<KenneyAsset> {
  const url = `https://github.com/letruxux/kenney-assets-registry/raw/refs/heads/main/data/full/${slug}.json`;
  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch assets");
  const base = (await response.json()) as unknown as KenneyAsset;
  return {
    ...base,
    id: buildId("kenney.nl", base.slug),
    _asset_source: "kenney.nl" as const
  };
}
